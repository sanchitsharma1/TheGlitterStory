"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_COMMERCE, type CommerceSettings } from "@/types";

/**
 * Live commerce rates (free shipping threshold + shipping fee).
 * Always fetches with no-store so admin updates appear without a hard deploy.
 */
export function useCommerceSettings() {
  const [commerce, setCommerce] = useState<CommerceSettings>(DEFAULT_COMMERCE);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      const data = await res.json();
      if (data.commerce) {
        setCommerce({
          ...DEFAULT_COMMERCE,
          ...data.commerce,
          free_shipping_threshold: Number(
            data.commerce.free_shipping_threshold
          ),
          shipping_fee: Number(data.commerce.shipping_fee),
          cod_min_order: Number(data.commerce.cod_min_order),
        });
      }
    } catch {
      // keep defaults
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    refresh();
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  return { commerce, loaded, refresh };
}
