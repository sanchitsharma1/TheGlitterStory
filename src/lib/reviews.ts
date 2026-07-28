import { createClient, createServiceClient, hasServiceRole } from "@/lib/supabase/server";
import type { Review } from "@/types";

async function db() {
  if (hasServiceRole()) return createServiceClient();
  return createClient();
}

export async function getApprovedReviews(options?: {
  productId?: string;
  limit?: number;
  generalOnly?: boolean;
}): Promise<Review[]> {
  try {
    const supabase = await db();
    let query = supabase
      .from("reviews")
      .select("*")
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(options?.limit ?? 12);

    if (options?.productId) {
      query = query.eq("product_id", options.productId);
    }
    if (options?.generalOnly) {
      query = query.is("product_id", null);
    }

    const { data, error } = await query;
    if (error) return [];
    return (data ?? []) as Review[];
  } catch {
    return [];
  }
}

export function averageRating(reviews: Review[]): number | null {
  if (!reviews.length) return null;
  const sum = reviews.reduce((s, r) => s + Number(r.rating), 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}
