import { NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body as {
      orderId: string;
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    };

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ ok: false, error: "Razorpay not configured" }, { status: 500 });
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return NextResponse.json({ ok: false, error: "Invalid payment signature" }, { status: 400 });
    }

    const supabase = createServiceClient();
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

    if (error) {
      return NextResponse.json({ ok: false, error: "Could not update order" }, { status: 500 });
    }

    if (order) {
      const { sendOrderPlacedEmails } = await import("@/lib/email/send");
      const items = (order.items ?? []) as import("@/types").OrderItem[];
      await sendOrderPlacedEmails(order as import("@/types").Order, items);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Verification failed" }, { status: 500 });
  }
}
