import { NextResponse } from "next/server";
import { getStaffProfile, canAccess } from "@/lib/auth/staff";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const staff = await getStaffProfile().catch(() => null);
  if (!staff || !canAccess(staff, "coupons")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = createServiceClient();
  const [{ data: coupons }, { data: categories }, { data: products }] =
    await Promise.all([
      supabase.from("coupons").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name").order("name"),
      supabase.from("products").select("id, title").order("title"),
    ]);
  return NextResponse.json({
    coupons: coupons ?? [],
    categories: categories ?? [],
    products: products ?? [],
  });
}

export async function POST(request: Request) {
  const staff = await getStaffProfile().catch(() => null);
  if (!staff || !canAccess(staff, "coupons")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("coupons").insert(body).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ coupon: data });
}
