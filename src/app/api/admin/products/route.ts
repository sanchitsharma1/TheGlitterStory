import { NextResponse } from "next/server";
import { getStaffProfile, canAccess } from "@/lib/auth/staff";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const staff = await getStaffProfile().catch(() => null);
  if (!staff || !canAccess(staff, "products")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("products")
      .insert(body)
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true, id: data.id });
  } catch {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
