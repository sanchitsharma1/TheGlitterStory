import { NextResponse } from "next/server";
import { validateCouponCode } from "@/lib/commerce/checkout";
import type { CartItem } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const code = String(body.code || "");
    const items = (body.items || []) as CartItem[];
    if (!code.trim()) {
      return NextResponse.json({ ok: false, discount: 0, message: "Enter a coupon code" });
    }
    const result = await validateCouponCode(code, items);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { ok: false, discount: 0, message: "Could not validate coupon. Check database connection." },
      { status: 500 }
    );
  }
}
