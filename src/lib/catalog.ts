import { createClient, createServiceClient, hasServiceRole } from "@/lib/supabase/server";
import type { Category, Product } from "@/types";

async function db() {
  if (hasServiceRole()) return createServiceClient();
  return createClient();
}

export async function getCategories(activeOnly = true): Promise<Category[]> {
  try {
    const supabase = await db();
    let query = supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (activeOnly) query = query.eq("is_active", true);

    const { data, error } = await query;
    if (error) return [];
    return (data ?? []) as Category[];
  } catch {
    return [];
  }
}

export async function getProducts(options?: {
  categorySlug?: string;
  featuredOnly?: boolean;
  includeInactive?: boolean;
  search?: string;
}): Promise<Product[]> {
  try {
    const supabase = await db();
    let query = supabase
      .from("products")
      .select("*, category:categories(*)")
      .order("created_at", { ascending: false });

    if (!options?.includeInactive) {
      query = query.eq("is_active", true);
    }
    if (options?.featuredOnly) {
      query = query.eq("is_featured", true);
    }
    if (options?.search) {
      query = query.ilike("title", `%${options.search}%`);
    }

    const { data, error } = await query;
    if (error) return [];

    let products = (data ?? []) as Product[];

    if (options?.categorySlug) {
      products = products.filter((p) => p.category?.slug === options.categorySlug);
    }

    return products.map(normalizeProduct);
  } catch {
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = await db();
    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) return null;
    return normalizeProduct(data as Product);
  } catch {
    return null;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const supabase = await db();
    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    return normalizeProduct(data as Product);
  } catch {
    return null;
  }
}

function normalizeProduct(p: Product): Product {
  return {
    ...p,
    price: Number(p.price),
    compare_at_price:
      p.compare_at_price === null || p.compare_at_price === undefined
        ? null
        : Number(p.compare_at_price),
    stock: Number(p.stock),
    images: Array.isArray(p.images) ? p.images : [],
  };
}
