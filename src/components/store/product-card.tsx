"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import { formatINR, isOnSale, salePercent } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const soldOut = product.stock <= 0;
  const onSale = isOnSale(product);
  const image = product.images?.[0];

  return (
    <Link
      href={`/product/${product.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-ink/8 bg-white/60 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
        soldOut && "opacity-80"
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
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
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        {product.category?.name && (
          <p className="text-xs uppercase tracking-[0.16em] text-ink/45">
            {product.category.name}
          </p>
        )}
        <h3 className="font-display text-lg text-ink sm:text-xl">{product.title}</h3>
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="text-[15px] font-semibold text-ink">
            {formatINR(product.price)}
          </span>
          {onSale && product.compare_at_price && (
            <span className="text-sm text-ink/40 line-through">
              {formatINR(product.compare_at_price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
