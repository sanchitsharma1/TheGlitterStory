"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/types";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { mapProductToCartItem } from "@/lib/commerce/pricing";

/** Mobile sticky add-to-bag bar - appears after scrolling past main ATC */
export function StickyAtc({ product }: { product: Product }) {
  const [visible, setVisible] = useState(false);
  const addItem = useCart((s) => s.addItem);
  const soldOut = product.stock <= 0;

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 420);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible || soldOut) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-ivory/95 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base text-ink">{product.title}</p>
          <p className="text-sm font-semibold">{formatINR(product.price)}</p>
        </div>
        <Button
          size="md"
          className="shrink-0"
          onClick={() => addItem(mapProductToCartItem(product, 1))}
        >
          Add to bag
        </Button>
      </div>
    </div>
  );
}
