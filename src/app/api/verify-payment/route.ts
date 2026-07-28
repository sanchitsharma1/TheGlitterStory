import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getRazorpayKeys, verifyRazorpaySignature } from "@/lib/razorpay";
import { sendOrderPlacedEmails } from "@/lib/email/send";
import type { Order, OrderItem } from "@/types";

/**
 * POST /api/verify-payment
 * Verifies Razorpay payment signature and marks order paid.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body as {
      orderId?: string;
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
    };

    if (
      !orderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return NextResponse.json(
        { ok: false, error: "Missing payment verification fields" },
        { status: 400 }
      );
    }

    const keys = getRazorpayKeys();
    if (!keys) {
      return NextResponse.json(
        { ok: false, error: "Razorpay is not configured" },
        { status: 500 }
      );
    }

    const valid = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      secret: keys.keySecret,
    });

    if (!valid) {
      return NextResponse.json(
        { ok: false, error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { data: existing, error: fetchError } = await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("id", orderId)
      .maybeSingle();

    if (fetchError || !existing) {
      return NextResponse.json(
        { ok: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Must match the Razorpay order we created for this store order
    if (
      existing.razorpay_order_id &&
      existing.razorpay_order_id !== razorpay_order_id
    ) {
      return NextResponse.json(
        { ok: false, error: "Payment does not match this order" },
        { status: 400 }
      );
    }

    // Idempotent: already paid
    if (existing.payment_status === "paid") {
      return NextResponse.json({
        ok: true,
        alreadyPaid: true,
        order_number: existing.order_number,
      });
    }

    const { data: order, error } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        status: "placed",
        razorpay_payment_id,
        razorpay_order_id,
      })
      .eq("id", orderId)
      .select("*, items:order_items(*)")
      .maybeSingle();

    if (error || !order) {
      return NextResponse.json(
        { ok: false, error: "Could not update order" },
        { status: 500 }
      );
    }

    // Increment coupon usage only after successful payment
    if (order.coupon_id) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("id, used_count")
        .eq("id", order.coupon_id)
        .maybeSingle();
      if (coupon) {
        await supabase
          .from("coupons")
          .update({ used_count: Number(coupon.used_count) + 1 })
          .eq("id", coupon.id);
      }
    }

    await supabase.from("admin_notifications").insert({
      type: "new_order",
      title: "Payment received",
      message: `Order ${order.order_number} - ₹${order.total} (PAID via Razorpay)`,
      meta: {
        order_id: order.id,
        order_number: order.order_number,
        stage: "paid",
      },
    });

    const items = (order.items ?? []) as OrderItem[];
    await sendOrderPlacedEmails(order as Order, items);

    return NextResponse.json({
      ok: true,
      order_number: order.order_number,
    });
  } catch (err) {
    console.error("verify-payment", err);
    return NextResponse.json(
      { ok: false, error: "Verification failed" },
      { status: 500 }
    );
  }
}
