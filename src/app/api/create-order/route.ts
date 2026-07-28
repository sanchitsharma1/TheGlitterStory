import { NextResponse } from "next/server";
import { placeOrder, type CheckoutPayload } from "@/lib/commerce/checkout";

/**
 * POST /api/create-order
 * Creates a store order + Razorpay order for Standard Checkout.
 * Body: checkout fields + cart items (same as /api/checkout).
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutPayload;
    const result = await placeOrder({
      ...body,
      payment_method: "razorpay",
    });

    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      order: result.order,
      // Razorpay Standard Checkout fields
      order_id: result.razorpay.orderId,
      amount: result.razorpay.amount,
      currency: result.razorpay.currency,
      key: result.razorpay.key,
      razorpay: result.razorpay,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Create order failed";
    console.error("create-order", message);
    return NextResponse.json(
      {
        ok: false,
        error:
          message.includes("SUPABASE") || message.includes("Missing")
            ? "Store backend is not configured."
            : "Could not create payment order. Please try again.",
      },
      { status: 500 }
    );
  }
}
