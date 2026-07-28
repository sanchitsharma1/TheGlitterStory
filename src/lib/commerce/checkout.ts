"use server";

import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { getSiteConfig } from "@/lib/settings";
import { applyCoupon, calculateShipping, cartSubtotal } from "@/lib/commerce/pricing";
import { generateOrderNumber } from "@/lib/utils";
import type { CartItem, Coupon, Order, PaymentMethod } from "@/types";
import {
  createRazorpayClient,
  getRazorpayKeys,
  rupeesToPaise,
} from "@/lib/razorpay";

const checkoutSchema = z.object({
  customer_name: z.string().min(2).max(100),
  customer_email: z.string().email(),
  customer_phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  address_line1: z.string().min(5).max(200),
  address_line2: z.string().max(200).optional(),
  city: z.string().min(2).max(80),
  state: z.string().min(2).max(80),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  // COD removed from storefront - online only
  payment_method: z.literal("razorpay").default("razorpay"),
  coupon_code: z.string().max(40).optional(),
  customer_note: z.string().max(500).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(20),
      })
    )
    .min(1),
});

export type CheckoutPayload = z.infer<typeof checkoutSchema>;

export type CheckoutResult =
  | {
      ok: true;
      order: Order;
      razorpay: {
        orderId: string;
        amount: number;
        currency: string;
        key: string;
      };
    }
  | { ok: false; error: string };

async function restoreStock(
  supabase: ReturnType<typeof createServiceClient>,
  cartItems: CartItem[]
) {
  for (const item of cartItems) {
    await supabase
      .from("products")
      .update({ stock: item.stock })
      .eq("id", item.productId);
  }
}

/**
 * Creates a store order + Razorpay order (Standard Checkout).
 * Stock is reserved; payment confirmation + emails happen on verify.
 */
export async function placeOrder(raw: CheckoutPayload): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse({
    ...raw,
    payment_method: "razorpay",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid checkout data" };
  }

  const keys = getRazorpayKeys();
  if (!keys) {
    return {
      ok: false,
      error: "Online payment is not configured. Please try again later.",
    };
  }

  const input = parsed.data;
  const config = await getSiteConfig();

  if (!config.commerce.allow_razorpay) {
    return { ok: false, error: "Online payment is currently unavailable" };
  }

  const supabase = createServiceClient();

  const productIds = input.items.map((i) => i.productId);
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .in("id", productIds)
    .eq("is_active", true);

  if (productsError || !products?.length) {
    return { ok: false, error: "Some products are unavailable" };
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  const cartItems: CartItem[] = [];

  for (const line of input.items) {
    const product = productMap.get(line.productId);
    if (!product) {
      return { ok: false, error: "A product in your cart is no longer available" };
    }
    if (product.stock < line.quantity) {
      if (product.stock <= 0) {
        return { ok: false, error: `${product.title} is SOLD OUT` };
      }
      return {
        ok: false,
        error: `Only ${product.stock} left for ${product.title}`,
      };
    }
    cartItems.push({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      price: Number(product.price),
      compareAtPrice: product.compare_at_price
        ? Number(product.compare_at_price)
        : null,
      image: product.images?.[0] ?? null,
      quantity: line.quantity,
      stock: product.stock,
      categoryId: product.category_id,
    });
  }

  let coupon: Coupon | null = null;
  if (input.coupon_code?.trim()) {
    const code = input.coupon_code.trim().toUpperCase();
    const { data: couponRow } = await supabase
      .from("coupons")
      .select("*")
      .ilike("code", code)
      .maybeSingle();
    coupon = (couponRow as Coupon) ?? null;
  }

  const subtotal = cartSubtotal(cartItems);
  const couponResult = applyCoupon(cartItems, coupon);
  if (input.coupon_code?.trim() && !couponResult.ok) {
    return { ok: false, error: couponResult.message };
  }
  const discount = couponResult.ok ? couponResult.discount : 0;
  const afterDiscount = Math.max(0, subtotal - discount);
  const shipping = calculateShipping(afterDiscount, config.commerce);
  const total = Math.round((afterDiscount + shipping) * 100) / 100;
  const amountPaise = rupeesToPaise(total);

  if (amountPaise < 100) {
    return {
      ok: false,
      error: "Order total is too low for online payment (minimum ₹1).",
    };
  }

  // Reserve stock while payment is in progress
  for (const item of cartItems) {
    const { data: ok, error } = await supabase.rpc("decrement_stock", {
      p_product_id: item.productId,
      p_qty: item.quantity,
    });
    if (error || ok === false) {
      return {
        ok: false,
        error: `Could not reserve stock for ${item.title}. Please refresh and try again.`,
      };
    }
  }

  const orderNumber = generateOrderNumber();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      status: "pending_payment",
      payment_method: "razorpay" as PaymentMethod,
      payment_status: "pending",
      customer_name: input.customer_name.trim(),
      customer_email: input.customer_email.trim().toLowerCase(),
      customer_phone: input.customer_phone.trim(),
      address_line1: input.address_line1.trim(),
      address_line2: input.address_line2?.trim() || null,
      city: input.city.trim(),
      state: input.state.trim(),
      pincode: input.pincode.trim(),
      country: "India",
      subtotal,
      shipping_fee: shipping,
      discount_amount: discount,
      total,
      // Coupon applied on verify after successful payment
      coupon_id: couponResult.ok ? couponResult.coupon.id : null,
      coupon_code: couponResult.ok ? couponResult.coupon.code : null,
      customer_note: input.customer_note?.trim() || null,
    })
    .select("*")
    .single();

  if (orderError || !order) {
    await restoreStock(supabase, cartItems);
    return { ok: false, error: "Could not create order. Please try again." };
  }

  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    product_title: item.title,
    product_slug: item.slug,
    unit_price: item.price,
    quantity: item.quantity,
    line_total: item.price * item.quantity,
    image_url: item.image ?? null,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
  if (itemsError) {
    await restoreStock(supabase, cartItems);
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", order.id);
    return {
      ok: false,
      error: "Could not save order items. Please try again.",
    };
  }

  try {
    const { client } = createRazorpayClient();
    const rzOrder = await client.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: orderNumber.slice(0, 40),
      notes: {
        order_id: order.id,
        order_number: orderNumber,
      },
    });

    await supabase
      .from("orders")
      .update({ razorpay_order_id: rzOrder.id })
      .eq("id", order.id);

    await supabase.from("admin_notifications").insert({
      type: "new_order",
      title: "Payment started",
      message: `Order ${orderNumber} - ₹${total} (awaiting Razorpay payment)`,
      meta: { order_id: order.id, order_number: orderNumber, stage: "pending_payment" },
    });

    return {
      ok: true,
      order: { ...(order as Order), razorpay_order_id: rzOrder.id },
      razorpay: {
        orderId: rzOrder.id,
        amount: amountPaise,
        currency: "INR",
        key: keys.keyId,
      },
    };
  } catch (err) {
    console.error("Razorpay order create failed", err);
    await restoreStock(supabase, cartItems);
    await supabase
      .from("orders")
      .update({ status: "cancelled", payment_status: "failed" })
      .eq("id", order.id);
    return {
      ok: false,
      error: "Could not start online payment. Please try again in a moment.",
    };
  }
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  try {
    const { hasServiceRole } = await import("@/lib/supabase/server");
    if (!hasServiceRole()) return null;
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("order_number", orderNumber)
      .maybeSingle();
    if (error || !data) return null;
    return data as Order;
  } catch {
    return null;
  }
}

export async function validateCouponCode(code: string, items: CartItem[]) {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("coupons")
      .select("*")
      .ilike("code", code.trim())
      .maybeSingle();
    return applyCoupon(items, (data as Coupon) ?? null);
  } catch {
    return { ok: false as const, discount: 0, message: "Could not validate coupon" };
  }
}
