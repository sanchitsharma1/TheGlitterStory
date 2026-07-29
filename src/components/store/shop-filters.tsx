"use client";

import type { ProductSort } from "@/lib/catalog";
import { cn } from "@/lib/utils";

function shopHref(opts: { category?: string; sort?: string }) {
  const params = new URLSearchParams();
  if (opts.category) params.set("category", opts.category);
  if (opts.sort && opts.sort !== "newest") params.set("sort", opts.sort);
  const q = params.toString();
  return q ? `/shop?${q}` : "/shop";
}

const SORT_OPTIONS: { value: ProductSort; label: string; short: string }[] = [
  { value: "newest", label: "Newest", short: "Newest" },
  { value: "price-asc", label: "Price: Low to high", short: "Price ↑" },
  { value: "price-desc", label: "Price: High to low", short: "Price ↓" },
];

/**
 * Sort control — segmented pill group with hard <a> links (mobile-safe).
 */
export function ShopFilters({
  category,
  sort,
}: {
  category?: string;
  sort: ProductSort;
}) {
  return (
    <div className="relative z-10 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink/45">
        Sort
      </p>

      <div
        className="inline-flex w-full max-w-md rounded-full border border-ink/10 bg-white/80 p-1 shadow-sm sm:w-auto"
        role="group"
        aria-label="Sort products"
      >
        {SORT_OPTIONS.map((opt) => {
          const active = sort === opt.value;
          return (
            <a
              key={opt.value}
              href={shopHref({ category, sort: opt.value })}
              title={opt.label}
              className={cn(
                "flex flex-1 touch-manipulation items-center justify-center rounded-full px-3 py-2.5 text-center text-[13px] font-medium transition active:scale-[0.98] sm:flex-none sm:px-4 sm:text-sm",
                active
                  ? "bg-ink text-ivory shadow-sm"
                  : "text-ink/55 hover:text-ink"
              )}
              aria-current={active ? "true" : undefined}
            >
              <span className="sm:hidden">{opt.short}</span>
              <span className="hidden sm:inline">{opt.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
