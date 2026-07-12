import { NextResponse } from "next/server";
import { getStaffProfile, isSuperAdmin, canAccess } from "@/lib/auth/staff";
import { createServiceClient } from "@/lib/supabase/server";
import { getSiteConfig } from "@/lib/settings";

export async function GET() {
  const staff = await getStaffProfile().catch(() => null);
  if (!staff || (!isSuperAdmin(staff) && !canAccess(staff, "settings"))) {
    return NextResponse.json({ error: "Unauthorized - super admin or settings access required" }, { status: 401 });
  }
  const config = await getSiteConfig();
  return NextResponse.json(config);
}

export async function PUT(request: Request) {
  const staff = await getStaffProfile().catch(() => null);
  if (!staff || !isSuperAdmin(staff)) {
    return NextResponse.json(
      { error: "Only super admin can update settings" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const supabase = createServiceClient();

  const rows = [
    { key: "commerce", value: body.commerce },
    { key: "returns", value: body.returns },
    { key: "contact", value: body.contact },
    { key: "policies", value: body.policies },
  ];

  for (const row of rows) {
    const { error } = await supabase.from("site_settings").upsert({
      key: row.key,
      value: row.value,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  return NextResponse.json({ ok: true });
}
