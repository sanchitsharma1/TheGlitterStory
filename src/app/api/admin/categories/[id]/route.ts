import { NextResponse } from "next/server";
import { getStaffProfile, canAccess } from "@/lib/auth/staff";
import { createServiceClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const staff = await getStaffProfile().catch(() => null);
  if (!staff || !canAccess(staff, "categories")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();
  const supabase = createServiceClient();

  const patch: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim()) {
    patch.name = body.name.trim();
    // Keep slug in sync when name changes unless explicit slug provided
    if (typeof body.slug === "string" && body.slug.trim()) {
      patch.slug = slugify(body.slug);
    } else if (body.syncSlug !== false) {
      patch.slug = slugify(body.name);
    }
  }
  if (typeof body.slug === "string" && body.slug.trim() && !patch.slug) {
    patch.slug = slugify(body.slug);
  }
  if (typeof body.description === "string") {
    patch.description = body.description.trim() || null;
  }
  if (typeof body.is_active === "boolean") {
    patch.is_active = body.is_active;
  }
  if (typeof body.sort_order === "number") {
    patch.sort_order = body.sort_order;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { error } = await supabase.from("categories").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const staff = await getStaffProfile().catch(() => null);
  if (!staff || !canAccess(staff, "categories")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createServiceClient();

  // Unlink products first (category_id is ON DELETE SET NULL in schema)
  // Explicit update keeps behaviour clear if FK differs
  await supabase.from("products").update({ category_id: null }).eq("category_id", id);

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

