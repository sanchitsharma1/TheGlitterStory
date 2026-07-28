import {
  DEFAULT_BRAND,
  DEFAULT_COMMERCE,
  DEFAULT_CONTACT,
  DEFAULT_POLICIES,
  DEFAULT_RETURNS,
  type BrandSettings,
  type CommerceSettings,
  type ContactSettings,
  type PolicySettings,
  type ReturnsSettings,
} from "@/types";
import { hasServiceRole, createServiceClient } from "@/lib/supabase/server";

export type SiteConfig = {
  commerce: CommerceSettings;
  returns: ReturnsSettings;
  contact: ContactSettings;
  brand: BrandSettings;
  policies: PolicySettings;
};

export const FALLBACK_CONFIG: SiteConfig = {
  commerce: DEFAULT_COMMERCE,
  returns: DEFAULT_RETURNS,
  contact: DEFAULT_CONTACT,
  brand: DEFAULT_BRAND,
  policies: DEFAULT_POLICIES,
};

/** Keep freeform shipping copy aligned with live rate settings. */
export function buildShippingSummary(commerce: CommerceSettings): string {
  return `We currently ship across ${commerce.service_region} only. Orders above ₹${commerce.free_shipping_threshold} enjoy free shipping. Orders below ₹${commerce.free_shipping_threshold} include a flat shipping fee of ₹${commerce.shipping_fee}. Delivery timelines typically range from 4-10 business days depending on your pincode.`;
}

export async function getSiteConfig(): Promise<SiteConfig> {
  if (!hasServiceRole() && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return FALLBACK_CONFIG;
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = hasServiceRole()
      ? createServiceClient()
      : await createClient();

    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value");
    if (error || !data?.length) return FALLBACK_CONFIG;

    const map = Object.fromEntries(data.map((row) => [row.key, row.value]));

    const commerce: CommerceSettings = {
      ...DEFAULT_COMMERCE,
      ...(map.commerce as object),
    };
    // Coerce numbers (jsonb can come through as strings)
    commerce.free_shipping_threshold = Number(commerce.free_shipping_threshold);
    commerce.shipping_fee = Number(commerce.shipping_fee);
    commerce.cod_min_order = Number(commerce.cod_min_order);

    const returns: ReturnsSettings = {
      ...DEFAULT_RETURNS,
      ...(map.returns as object),
    };
    returns.return_window_days = Number(returns.return_window_days);

    const policies: PolicySettings = {
      ...DEFAULT_POLICIES,
      ...(map.policies as object),
    };

    // Always reflect live rates in the public shipping summary
    policies.shipping_summary = buildShippingSummary(commerce);

    return {
      commerce,
      returns,
      contact: { ...DEFAULT_CONTACT, ...(map.contact as object) },
      brand: { ...DEFAULT_BRAND, ...(map.brand as object) },
      policies,
    };
  } catch {
    return FALLBACK_CONFIG;
  }
}
