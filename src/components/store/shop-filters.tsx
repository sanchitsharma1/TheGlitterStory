"use client";

import { useRouter } from "next/navigation";
import type { ProductSort } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function ShopFilters({
  category,
  sort,
  hideSold,
}: {
  category?: string;
  sort: ProductSort;
  hideSold: boolean;
}) {
  const router = useRouter();

  function push(next: { sort?: string; hideSold?: boolean; category?: string }) {
    const params = new URLSearchParams();
    const cat = next.category !== undefined ? next.category : category;
    const s = next.sort !== undefined ? next.sort : sort;
    const hs = next.hideSold !== undefined ? next.hideSold : hideSold;
    if (cat) params.set("category", cat);
    if (s && s !== "newest") params.set("sort", s);
    if (hs) params.set("hideSold", "1");
    const q = params.toString();
    router.push(q ? `/shop?${q}` : "/shop");
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1.5 sm:items-start">
        <label
          htmlFor="shop-sort"
          className="text-xs uppercase tracking-[0.14em] text-ink/45"
        >
          Sort by
        </label>
        <select
          id="shop-sort"
          value={sort}
          onChange={(e) => push({ sort: e.target.value })}
          className="h-11 min-w-[12rem] rounded-full border border-ink/15 bg-white px-4 text-sm text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/25"
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to high</option>
          <option value="price-desc">Price: High to low</option>
        </select>
      </div>

      <label
        className={cn(
          "inline-flex cursor-pointer items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm transition",
          hideSold
            ? "border-ink bg-ink text-ivory"
            : "border-ink/15 bg-white text-ink/70 hover:border-ink/30"
        )}
      >
        <input
          type="checkbox"
          className="sr-only"
          checked={hideSold}
          onChange={(e) => push({ hideSold: e.target.checked })}
        />
        Hide sold out
      </label>
    </div>
  );
}
