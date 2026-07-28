import { NextResponse } from "next/server";
import { getStaffProfile, canAccess } from "@/lib/auth/staff";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const staff = await getStaffProfile().catch(() => null);
  if (!staff || !canAccess(staff, "dashboard")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const [{ data: reviews, error }, { data: products }] = await Promise.all([
    supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("products").select("id, title").order("title"),
  ]);

  if (error) {
    return NextResponse.json(
      {
        error:
          error.message.includes("reviews") || error.code === "42P01"
            ? "Reviews table missing. Run supabase/migrations_reviews_and_product_fields.sql"
            : error.message,
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    reviews: reviews ?? [],
    products: products ?? [],
  });
}

export async function POST(request: Request) {
  const staff = await getStaffProfile().catch(() => null);
  if (!staff || !canAccess(staff, "dashboard")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const customer_name = String(body.customer_name || "").trim();
  const bodyText = String(body.body || "").trim();
  const rating = Number(body.rating);

  if (!customer_name || !bodyText || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid review data" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      customer_name,
      body: bodyText,
      rating,
      product_id: body.product_id || null,
      is_approved: Boolean(body.is_approved),
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ review: data });
}
