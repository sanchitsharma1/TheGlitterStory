import { NextResponse } from "next/server";
import { getStaffProfile, canAccess } from "@/lib/auth/staff";
import { createServiceClient } from "@/lib/supabase/server";
import { updateProduct } from "@/lib/admin/product-payload";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const staff = await getStaffProfile().catch(() => null);
  if (!staff || !canAccess(staff, "products")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const supabase = createServiceClient();

    if (body.stock === 0) {
      await supabase.from("admin_notifications").insert({
        type: "out_of_stock",
        title: "Product marked sold out",
        message: `A product was updated to 0 stock by ${staff.full_name}.`,
        meta: { product_id: id },
      });
    }

    const result = await updateProduct(supabase, id, body);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      partial:
        !result.usedExtended &&
        (body.material_info || body.care_notes)
          ? "Product saved. material_info/care_notes were skipped (run DB migration to enable)."
          : undefined,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const staff = await getStaffProfile().catch(() => null);
  if (!staff || !canAccess(staff, "products")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createServiceClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
