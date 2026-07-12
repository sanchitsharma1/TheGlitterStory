import { NextResponse } from "next/server";
import { getStaffProfile, isSuperAdmin } from "@/lib/auth/staff";
import { createServiceClient } from "@/lib/supabase/server";
import { DEFAULT_STAFF_PERMISSIONS } from "@/types";

export async function GET() {
  const staff = await getStaffProfile().catch(() => null);
  if (!staff || !isSuperAdmin(staff)) {
    return NextResponse.json({ error: "Super admin only" }, { status: 403 });
  }
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("staff_profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ staff: data });
}

export async function POST(request: Request) {
  const staff = await getStaffProfile().catch(() => null);
  if (!staff || !isSuperAdmin(staff)) {
    return NextResponse.json({ error: "Super admin only" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const full_name = String(body.full_name || "").trim();
    const role = body.role === "super_admin" ? "super_admin" : "staff";
    const permissions = body.permissions ?? DEFAULT_STAFF_PERMISSIONS;

    if (!email || !password || password.length < 8 || !full_name) {
      return NextResponse.json(
        { error: "Name, email, and password (8+ chars) are required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data: created, error: createError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name, role },
      });

    if (createError || !created.user) {
      return NextResponse.json(
        { error: createError?.message || "Could not create auth user" },
        { status: 400 }
      );
    }

    const { error: profileError } = await supabase.from("staff_profiles").insert({
      id: created.user.id,
      email,
      full_name,
      role,
      is_active: true,
      permissions: role === "super_admin" ? DEFAULT_STAFF_PERMISSIONS : permissions,
      created_by: staff.id,
    });

    if (profileError) {
      // Clean up auth user if profile fails
      await supabase.auth.admin.deleteUser(created.user.id);
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, id: created.user.id });
  } catch {
    return NextResponse.json({ error: "Failed to create staff" }, { status: 500 });
  }
}
