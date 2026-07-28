import { NextResponse } from "next/server";
import { placeOrder, type CheckoutPayload } from "@/lib/commerce/checkout";

/** Full checkout (Razorpay only) - same payload as /api/create-order. */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutPayload;
    const result = await placeOrder({
      ...body,
      payment_method: "razorpay",
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    return NextResponse.json(
      {
        ok: false,
        error:
          message.includes("SUPABASE") || message.includes("Missing")
            ? "Store backend is not configured yet."
            : "Checkout failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
