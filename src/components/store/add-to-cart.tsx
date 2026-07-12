"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import type { Product } from "@/types";
import { mapProductToCartItem } from "@/lib/commerce/pricing";

export function AddToCart({ product }: { product: Product }) {
  const addItem = useCart((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const soldOut = product.stock <= 0;

  function handleAdd() {
    const result = addItem(mapProductToCartItem(product, qty));
    setMessage(result.message);
    setTimeout(() => setMessage(null), 2500);
  }

  if (soldOut) {
    return (
      <div className="space-y-3">
        <Button disabled size="lg" className="w-full grayscale">
          Sold out
        </Button>
        <p className="text-center text-[15px] text-ink/50">
          This piece has found a home. Check back for restocks.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center rounded-full border border-ink/15 bg-white">
          <button
            type="button"
            className="h-11 w-11 text-lg"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-8 text-center text-[15px] font-medium">{qty}</span>
          <button
            type="button"
            className="h-11 w-11 text-lg"
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <Button size="lg" className="flex-1" onClick={handleAdd}>
          Add to bag
        </Button>
      </div>
      <p className="text-sm text-ink/50">
        {product.stock <= product.low_stock_threshold
          ? `Only ${product.stock} left`
          : `${product.stock} in stock`}
      </p>
      {message && (
        <p className="text-[15px] text-emerald-700 animate-in fade-in">{message}</p>
      )}
    </div>
  );
}
