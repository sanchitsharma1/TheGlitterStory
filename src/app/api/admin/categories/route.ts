import { NextResponse } from "next/server";
import { getStaffProfile, canAccess } from "@/lib/auth/staff";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const staff = await getStaffProfile().catch(() => null);
  if (!staff || !canAccess(staff, "categories")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ categories: data });
}

export async function POST(request: Request) {
  const staff = await getStaffProfile().catch(() => null);
  if (!staff || !canAccess(staff, "categories")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("categories").insert(body).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ category: data });
}
