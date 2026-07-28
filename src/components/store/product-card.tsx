"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/types";
import { formatINR, isOnSale, salePercent } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { mapProductToCartItem } from "@/lib/commerce/pricing";
import { ShoppingBag } from "lucide-react";

export function ProductCard({ product }: { product: Product }) {
  const soldOut = product.stock <= 0;
  const onSale = isOnSale(product);
  const image = product.images?.[0];
  const addItem = useCart((s) => s.addItem);
  const [toast, setToast] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (soldOut || adding) return;

    setAdding(true);
    const result = addItem(mapProductToCartItem(product, 1));
    setToast(result.message);
    setTimeout(() => {
      setToast(null);
      setAdding(false);
    }, 1800);
  }

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-ink/8 bg-white/70 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
        soldOut && "opacity-90"
      )}
    >
      <Link
        href={`/product/${product.slug}`}
        className="relative aspect-[4/5] overflow-hidden bg-stone-100"
      >
        {image ? (
          <Image
            src={image}
            alt={product.title}
            fill
            className={cn(
              "object-cover transition duration-500 group-hover:scale-105",
              soldOut && "grayscale"
            )}
            sizes="(max-width:768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm uppercase tracking-[0.18em] text-ink/30">
            The Jewel Nest
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {soldOut && <Badge tone="sold">Sold</Badge>}
          {!soldOut && onSale && product.compare_at_price && (
            <Badge tone="gold">
              {salePercent(product.price, product.compare_at_price)}% off
            </Badge>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        {product.category?.name && (
          <p className="text-xs uppercase tracking-[0.16em] text-ink/45">
            {product.category.name}
          </p>
        )}
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-display text-lg leading-snug text-ink transition hover:text-ink/70 sm:text-xl">
            {product.title}
          </h3>
        </Link>
        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-[15px] font-semibold text-ink">
            {formatINR(product.price)}
          </span>
          {onSale && product.compare_at_price && (
            <span className="text-sm text-ink/40 line-through">
              {formatINR(product.compare_at_price)}
            </span>
          )}
        </div>

        <div className="mt-auto pt-3">
          {soldOut ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-full cursor-not-allowed grayscale"
              disabled
            >
              Sold out
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="w-full"
              onClick={handleQuickAdd}
              disabled={adding}
            >
              <ShoppingBag size={14} />
              {adding ? "Added" : "Add to bag"}
            </Button>
          )}
          {toast && (
            <p
              className={cn(
                "mt-1.5 text-center text-xs",
                toast.toLowerCase().includes("sold") ||
                  toast.toLowerCase().includes("only")
                  ? "text-red-600"
                  : "text-emerald-700"
              )}
            >
              {toast}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
