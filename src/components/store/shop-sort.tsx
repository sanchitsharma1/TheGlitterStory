"use client";

import { useRouter } from "next/navigation";
import type { ProductSort } from "@/lib/catalog";

const OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to high" },
  { value: "price-desc", label: "Price: High to low" },
];

export function ShopSort({
  category,
  sort,
}: {
  category?: string;
  sort: ProductSort;
}) {
  const router = useRouter();

  function onChange(value: string) {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (value && value !== "newest") params.set("sort", value);
    const q = params.toString();
    router.push(q ? `/shop?${q}` : "/shop");
  }

  return (
    <div className="flex flex-col gap-1.5 sm:items-end">
      <label
        htmlFor="shop-sort"
        className="text-xs uppercase tracking-[0.14em] text-ink/45"
      >
        Sort by
      </label>
      <select
        id="shop-sort"
        value={sort}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 min-w-[12rem] rounded-full border border-ink/15 bg-white px-4 text-sm text-ink outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/25"
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
