"use server";

import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { getSiteConfig } from "@/lib/settings";
import { applyCoupon, calculateShipping, cartSubtotal } from "@/lib/commerce/pricing";
import { generateOrderNumber } from "@/lib/utils";
import type { CartItem, Coupon, Order, OrderItem, PaymentMethod } from "@/types";
import { sendOrderPlacedEmails } from "@/lib/email/send";

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
  payment_method: z.enum(["cod", "razorpay"]),
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
      razorpay?: { orderId: string; amount: number; currency: string; key: string };
    }
  | { ok: false; error: string };

export async function placeOrder(raw: CheckoutPayload): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid checkout data" };
  }

  const input = parsed.data;
  const config = await getSiteConfig();
  const supabase = createServiceClient();

  // Load products and validate stock server-side
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
      compareAtPrice: product.compare_at_price ? Number(product.compare_at_price) : null,
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

  if (input.payment_method === "cod") {
    if (!config.commerce.allow_cod) {
      return { ok: false, error: "Cash on Delivery is currently unavailable" };
    }
    if (total < config.commerce.cod_min_order) {
      return {
        ok: false,
        error: `Minimum order value for COD is ₹${config.commerce.cod_min_order}`,
      };
    }
  }

  if (input.payment_method === "razorpay" && !config.commerce.allow_razorpay) {
    return { ok: false, error: "Online payment is currently unavailable" };
  }

  // Decrement stock atomically per line
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
  const status = input.payment_method === "razorpay" ? "pending_payment" : "placed";
  const paymentStatus = input.payment_method === "cod" ? "pending" : "pending";

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      status,
      payment_method: input.payment_method as PaymentMethod,
      payment_status: paymentStatus,
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
      coupon_id: couponResult.ok ? couponResult.coupon.id : null,
      coupon_code: couponResult.ok ? couponResult.coupon.code : null,
      customer_note: input.customer_note?.trim() || null,
    })
    .select("*")
    .single();

  if (orderError || !order) {
    // Best-effort stock restore
    for (const item of cartItems) {
      await supabase
        .from("products")
        .update({ stock: item.stock })
        .eq("id", item.productId);
    }
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
    return { ok: false, error: "Order created but items failed - contact support with your details." };
  }

  if (couponResult.ok) {
    await supabase
      .from("coupons")
      .update({ used_count: couponResult.coupon.used_count + 1 })
      .eq("id", couponResult.coupon.id);
  }

  await supabase.from("admin_notifications").insert({
    type: "new_order",
    title: "New order received",
    message: `Order ${orderNumber} - ₹${total} (${input.payment_method.toUpperCase()})`,
    meta: { order_id: order.id, order_number: orderNumber },
  });

  const fullOrder = order as Order;
  const fullItems = orderItems as unknown as OrderItem[];

  // COD: send confirmation immediately. Razorpay: send after payment verify.
  if (input.payment_method === "cod") {
    await sendOrderPlacedEmails(fullOrder, fullItems);
  }

  // Razorpay order creation (optional until keys exist)
  if (input.payment_method === "razorpay") {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return {
        ok: true,
        order: order as Order,
        // Client should show message that online pay is not configured
      };
    }

    try {
      const Razorpay = (await import("razorpay")).default;
      const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
      const amountPaise = Math.round(total * 100);
      const rzOrder = await rzp.orders.create({
        amount: amountPaise,
        currency: "INR",
        receipt: orderNumber,
        notes: { order_id: order.id, order_number: orderNumber },
      });

      await supabase
        .from("orders")
        .update({ razorpay_order_id: rzOrder.id })
        .eq("id", order.id);

      return {
        ok: true,
        order: { ...(order as Order), razorpay_order_id: rzOrder.id },
        razorpay: {
          orderId: rzOrder.id,
          amount: amountPaise,
          currency: "INR",
          key: keyId,
        },
      };
    } catch {
      return {
        ok: false,
        error: "Could not start online payment. Try COD or try again later.",
      };
    }
  }

  return { ok: true, order: order as Order };
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
