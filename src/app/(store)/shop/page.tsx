import { ProductCard } from "@/components/store/product-card";
import { ShopFilters } from "@/components/store/shop-filters";
import { getCategories, getProducts, type ProductSort } from "@/lib/catalog";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Shop",
  description: "Browse modern jewellery from The Jewel Nest.",
};

function parseSort(value?: string): ProductSort {
  if (value === "price-asc" || value === "price-desc" || value === "newest") {
    return value;
  }
  return "newest";
}

function shopHref(opts: { category?: string; sort?: string }) {
  const params = new URLSearchParams();
  if (opts.category) params.set("category", opts.category);
  if (opts.sort && opts.sort !== "newest") params.set("sort", opts.sort);
  const q = params.toString();
  return q ? `/shop?${q}` : "/shop";
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    q?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  const sort = parseSort(params.sort);

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({
      categorySlug: params.category,
      search: params.q,
      sort,
    }),
  ]);

  const categoryName = categories.find((c) => c.slug === params.category)?.name;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark sm:text-[13px]">
              Collection
            </p>
            <h1 className="font-display text-4xl text-ink sm:text-5xl">Shop</h1>
            <p className="mt-2 text-[15px] text-ink/55">
              {products.length} piece{products.length === 1 ? "" : "s"}
              {categoryName ? ` in ${categoryName}` : ""}
            </p>
          </div>

          <ShopFilters category={params.category} sort={sort} />
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link
            href={shopHref({ sort })}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm uppercase tracking-[0.12em] transition",
              !params.category
                ? "border-ink bg-ink text-ivory"
                : "border-ink/15 bg-white/60 text-ink/70 hover:border-ink/40"
            )}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={shopHref({ category: cat.slug, sort })}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm uppercase tracking-[0.12em] transition",
                params.category === cat.slug
                  ? "border-ink bg-ink text-ivory"
                  : "border-ink/15 bg-white/60 text-ink/70 hover:border-ink/40"
              )}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/15 px-6 py-16 text-center text-[15px] text-ink/55">
          No pieces found. Try another category or check back soon.
        </div>
      ) : (
        <div
          key={`grid-${params.category ?? "all"}-${sort}`}
          className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-5"
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
