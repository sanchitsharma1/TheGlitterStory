/**
 * Product write payloads must only use columns that exist in the DB.
 * material_info / care_notes are optional (added by migration).
 * If those columns are missing, we strip them and retry so create/update never breaks.
 */

const PRODUCT_CORE_FIELDS = [
  "title",
  "slug",
  "description",
  "size_info",
  "price",
  "compare_at_price",
  "sale_starts_at",
  "sale_ends_at",
  "stock",
  "low_stock_threshold",
  "category_id",
  "images",
  "is_active",
  "is_featured",
  "meta_title",
  "meta_description",
] as const;

/** Columns from supabase/migrations_reviews_and_product_fields.sql */
const PRODUCT_EXTENDED_FIELDS = ["material_info", "care_notes"] as const;

export type ProductWritePayload = Record<string, unknown>;

export function pickProductPayload(
  body: Record<string, unknown>,
  options?: { includeExtended?: boolean }
): ProductWritePayload {
  const includeExtended = options?.includeExtended !== false;
  const allowed = new Set<string>([
    ...PRODUCT_CORE_FIELDS,
    ...(includeExtended ? PRODUCT_EXTENDED_FIELDS : []),
  ]);

  const out: ProductWritePayload = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      out[key] = body[key];
    }
  }
  return out;
}

export function isMissingColumnError(message: string | undefined | null): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  return (
    m.includes("schema cache") ||
    m.includes("could not find the") ||
    (m.includes("column") && m.includes("does not exist")) ||
    m.includes("material_info") ||
    m.includes("care_notes")
  );
}

/**
 * Insert product: try with extended fields, fall back to core columns only.
 */
export async function insertProduct(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  body: Record<string, unknown>
) {
  const full = pickProductPayload(body, { includeExtended: true });
  const first = await supabase.from("products").insert(full).select("id").single();

  if (!first.error) {
    return { data: first.data as { id: string }, error: null as string | null, usedExtended: true };
  }

  if (!isMissingColumnError(first.error.message)) {
    return { data: null, error: first.error.message as string, usedExtended: true };
  }

  // Migration not applied — save without material_info / care_notes
  const core = pickProductPayload(body, { includeExtended: false });
  const second = await supabase.from("products").insert(core).select("id").single();

  if (second.error) {
    return { data: null, error: second.error.message as string, usedExtended: false };
  }

  return {
    data: second.data as { id: string },
    error: null as string | null,
    usedExtended: false,
  };
}

/**
 * Update product: try with extended fields, fall back to core columns only.
 */
export async function updateProduct(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  id: string,
  body: Record<string, unknown>
) {
  const full = pickProductPayload(body, { includeExtended: true });
  const first = await supabase.from("products").update(full).eq("id", id);

  if (!first.error) {
    return { error: null as string | null, usedExtended: true };
  }

  if (!isMissingColumnError(first.error.message)) {
    return { error: first.error.message as string, usedExtended: true };
  }

  const core = pickProductPayload(body, { includeExtended: false });
  const second = await supabase.from("products").update(core).eq("id", id);

  if (second.error) {
    return { error: second.error.message as string, usedExtended: false };
  }

  return { error: null as string | null, usedExtended: false };
}
