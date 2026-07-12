import { NextResponse } from "next/server";
import { getStaffProfile, isSuperAdmin } from "@/lib/auth/staff";
import { createServiceClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const staff = await getStaffProfile().catch(() => null);
  if (!staff || !isSuperAdmin(staff)) {
    return NextResponse.json({ error: "Super admin only" }, { status: 403 });
  }

  const { id } = await params;
  if (id === staff.id) {
    return NextResponse.json(
      { error: "You cannot disable your own account" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("staff_profiles")
    .update({
      is_active: body.is_active,
      ...(body.permissions ? { permissions: body.permissions } : {}),
      ...(body.role ? { role: body.role } : {}),
      ...(body.full_name ? { full_name: body.full_name } : {}),
    })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
