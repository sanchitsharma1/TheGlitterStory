import { NextResponse } from "next/server";
import { getStaffProfile, canAccess } from "@/lib/auth/staff";
import { createServiceClient } from "@/lib/supabase/server";
import { insertProduct } from "@/lib/admin/product-payload";

export async function POST(request: Request) {
  const staff = await getStaffProfile().catch(() => null);
  if (!staff || !canAccess(staff, "products")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const supabase = createServiceClient();
    const result = await insertProduct(supabase, body);

    if (result.error || !result.data) {
      return NextResponse.json(
        { error: result.error || "Failed to create product" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      id: result.data.id,
      // Hint for admin if extended fields were dropped
      partial:
        !result.usedExtended &&
        (body.material_info || body.care_notes)
          ? "Product saved. material_info/care_notes were skipped (run DB migration to enable)."
          : undefined,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
