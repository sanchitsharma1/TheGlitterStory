"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/types";
import { formatINR, isOnSale, salePercent } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/store/cart";
import { mapProductToCartItem } from "@/lib/commerce/pricing";
import { ShoppingBag } from "lucide-react";

export function ProductCard({ product }: { product: Product }) {
  const soldOut = product.stock <= 0;
  const onSale = isOnSale(product);
  const primary = product.images?.[0];
  const secondary = product.images?.[1];
  const addItem = useCart((s) => s.addItem);
  const [msg, setMsg] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (soldOut || adding) return;

    setAdding(true);
    const result = addItem(mapProductToCartItem(product, 1));
    setMsg(result.message);
    setTimeout(() => {
      setMsg(null);
      setAdding(false);
    }, 1600);
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
        {primary ? (
          <>
            <Image
              src={primary}
              alt={product.title}
              fill
              className={cn(
                "object-cover transition duration-500",
                secondary ? "group-hover:opacity-0" : "group-hover:scale-105",
                soldOut && "grayscale"
              )}
              sizes="(max-width:768px) 50vw, 25vw"
            />
            {secondary && (
              <Image
                src={secondary}
                alt=""
                fill
                className={cn(
                  "object-cover opacity-0 transition duration-500 group-hover:opacity-100 group-hover:scale-105",
                  soldOut && "grayscale"
                )}
                sizes="(max-width:768px) 50vw, 25vw"
              />
            )}
          </>
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

      <div className="flex flex-1 flex-col gap-1 px-3 pb-3 pt-3 sm:px-4 sm:pt-4">
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
        {msg && (
          <p
            className={cn(
              "pt-1 text-center text-xs sm:text-sm",
              msg.toLowerCase().includes("added")
                ? "text-emerald-700"
                : "text-red-600"
            )}
          >
            {msg}
          </p>
        )}
      </div>

      {/* Full-bleed bottom bar - shares card corners via overflow-hidden */}
      {soldOut ? (
        <button
          type="button"
          disabled
          className="mt-auto flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 border-t border-ink/10 bg-ink/10 text-sm font-medium tracking-wide text-ink/45 grayscale sm:h-[3.25rem] sm:text-[15px]"
        >
          Sold out
        </button>
      ) : (
        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={adding}
          className={cn(
            "mt-auto flex h-12 w-full items-center justify-center gap-2 border-t border-ink/15 bg-ink text-sm font-medium tracking-wide text-ivory transition sm:h-[3.25rem] sm:text-[15px]",
            "hover:bg-ink/90 active:bg-ink/85",
            "disabled:pointer-events-none disabled:opacity-70"
          )}
        >
          <ShoppingBag size={16} className="shrink-0 sm:size-[17px]" />
          {adding ? "Added" : "Add to bag"}
        </button>
      )}
    </article>
  );
}
