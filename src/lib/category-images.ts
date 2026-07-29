/**
 * Curated category hero images for the storefront tiles.
 * Same Unsplash style as the sample catalog — verified subjects.
 * Prefer these over DB image_url for known slugs (seed data can be wrong/stale).
 */
export const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  necklaces:
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80",
  earrings:
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&q=80",
  bracelets:
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&q=80",
  // Real anklet on foot (B&W silver charm) — not a necklace shot
  anklets:
    "https://images.unsplash.com/photo-1635770607507-beb7d7972491?w=900&q=80",
  anklet:
    "https://images.unsplash.com/photo-1635770607507-beb7d7972491?w=900&q=80",
  // Minimal gold bands
  rings:
    "https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?w=900&q=80",
  ring:
    "https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?w=900&q=80",
};

/** Neutral jewellery fallback when slug is unknown */
export const CATEGORY_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=80";

export function resolveCategoryImage(
  slug: string,
  imageUrl?: string | null
): string {
  const key = slug.trim().toLowerCase();
  // Known categories always use curated tiles (avoids wrong seed image_url)
  if (DEFAULT_CATEGORY_IMAGES[key]) {
    return DEFAULT_CATEGORY_IMAGES[key];
  }
  if (imageUrl?.trim()) return imageUrl.trim();
  return CATEGORY_IMAGE_FALLBACK;
}
