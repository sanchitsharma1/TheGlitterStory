import { NextResponse } from "next/server";
import { getStaffProfile } from "@/lib/auth/staff";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST() {
  const staff = await getStaffProfile().catch(() => null);
  if (!staff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("admin_notifications")
    .update({ is_read: true })
    .eq("is_read", false);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
