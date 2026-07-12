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

export async function getSiteConfig(): Promise<SiteConfig> {
  if (!hasServiceRole() && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return FALLBACK_CONFIG;
  }

  try {
    // Prefer service role so checkout always sees full settings even if RLS changes.
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = hasServiceRole()
      ? createServiceClient()
      : await createClient();

    const { data, error } = await supabase.from("site_settings").select("key, value");
    if (error || !data?.length) return FALLBACK_CONFIG;

    const map = Object.fromEntries(data.map((row) => [row.key, row.value]));

    return {
      commerce: { ...DEFAULT_COMMERCE, ...(map.commerce as object) },
      returns: { ...DEFAULT_RETURNS, ...(map.returns as object) },
      contact: { ...DEFAULT_CONTACT, ...(map.contact as object) },
      brand: { ...DEFAULT_BRAND, ...(map.brand as object) },
      policies: { ...DEFAULT_POLICIES, ...(map.policies as object) },
    };
  } catch {
    return FALLBACK_CONFIG;
  }
}
