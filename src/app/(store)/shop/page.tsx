import { ProductCard } from "@/components/store/product-card";
import { getCategories, getProducts } from "@/lib/catalog";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Shop",
  description: "Browse modern jewellery from The Jewel Nest.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({
      categorySlug: params.category,
      search: params.q,
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark sm:text-[13px]">
          Collection
        </p>
        <h1 className="font-display text-4xl text-ink sm:text-5xl">Shop</h1>
        <p className="mt-2 text-[15px] text-ink/55">
          {products.length} piece{products.length === 1 ? "" : "s"}
          {params.category ? ` in ${params.category}` : ""}
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/shop"
          className={cn(
            "rounded-full border px-4 py-2 text-sm uppercase tracking-[0.12em] transition",
            !params.category
              ? "border-ink bg-ink text-ivory"
              : "border-ink/15 text-ink/70 hover:border-ink/40"
          )}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/shop?category=${cat.slug}`}
            className={cn(
              "rounded-full border px-4 py-2 text-sm uppercase tracking-[0.12em] transition",
              params.category === cat.slug
                ? "border-ink bg-ink text-ivory"
                : "border-ink/15 text-ink/70 hover:border-ink/40"
            )}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/15 px-6 py-16 text-center text-[15px] text-ink/55">
          No pieces found. Add products from the admin panel.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
