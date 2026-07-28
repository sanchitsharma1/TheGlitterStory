import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getStaffProfile, isSuperAdmin, canAccess } from "@/lib/auth/staff";
import { createServiceClient } from "@/lib/supabase/server";
import { buildShippingSummary, getSiteConfig } from "@/lib/settings";
import type { CommerceSettings, PolicySettings } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const staff = await getStaffProfile().catch(() => null);
  if (!staff || (!isSuperAdmin(staff) && !canAccess(staff, "settings"))) {
    return NextResponse.json(
      { error: "Unauthorized - super admin or settings access required" },
      { status: 401 }
    );
  }
  // Return raw stored values for editing (not the auto-generated shipping summary only)
  const config = await getSiteConfig();
  return NextResponse.json(config, {
    headers: { "Cache-Control": "no-store" },
  });
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

  const commerce: CommerceSettings = {
    currency: "INR",
    currency_symbol: "₹",
    service_region: "India",
    free_shipping_threshold: Number(body.commerce?.free_shipping_threshold ?? 600),
    shipping_fee: Number(body.commerce?.shipping_fee ?? 120),
    cod_min_order: Number(body.commerce?.cod_min_order ?? 299),
    allow_cod: Boolean(body.commerce?.allow_cod),
    allow_razorpay: body.commerce?.allow_razorpay !== false,
  };

  // Keep policy text in sync with live rate numbers
  const policies: PolicySettings = {
    shipping_summary:
      typeof body.policies?.shipping_summary === "string" &&
      body.policies.shipping_summary.trim().length > 0
        ? // Still overwrite rates paragraph so banner/page never disagree
          buildShippingSummary(commerce)
        : buildShippingSummary(commerce),
    privacy_summary: body.policies?.privacy_summary ?? "",
    terms_summary: body.policies?.terms_summary ?? "",
  };

  const rows = [
    { key: "commerce", value: commerce },
    { key: "returns", value: body.returns },
    { key: "contact", value: body.contact },
    { key: "policies", value: policies },
  ];

  for (const row of rows) {
    const { error } = await supabase.from("site_settings").upsert(
      {
        key: row.key,
        value: row.value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  // Bust Next.js cache so every surface picks up new free-ship / fee values
  const paths = [
    "/",
    "/shipping",
    "/returns",
    "/cart",
    "/checkout",
    "/shop",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
  ];
  for (const path of paths) {
    revalidatePath(path, "layout");
    revalidatePath(path, "page");
  }
  revalidatePath("/api/settings");

  return NextResponse.json({
    ok: true,
    commerce,
    policies,
    message: `Live rates: free shipping ≥ ₹${commerce.free_shipping_threshold}, else ₹${commerce.shipping_fee}`,
  });
}
