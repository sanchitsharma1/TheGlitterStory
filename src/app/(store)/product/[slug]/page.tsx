import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/store/add-to-cart";
import { ProductCard } from "@/components/store/product-card";
import { ProductGallery } from "@/components/store/product-gallery";
import { Badge } from "@/components/ui/badge";
import { getProductBySlug, getProducts } from "@/lib/catalog";
import { formatINR, isOnSale, salePercent } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.meta_title || product.title,
    description: product.meta_description || product.description.slice(0, 160),
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = (await getProducts({ categorySlug: product.category?.slug }))
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const soldOut = product.stock <= 0;
  const onSale = isOnSale(product);
  const images = product.images?.length ? product.images : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6 text-sm text-ink/45">
        <Link href="/shop" className="hover:text-ink">
          Shop
        </Link>
        {product.category && (
          <>
            {" / "}
            <Link
              href={`/shop?category=${product.category.slug}`}
              className="hover:text-ink"
            >
              {product.category.name}
            </Link>
          </>
        )}
        {" / "}
        <span className="text-ink/70">{product.title}</span>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery
          images={images}
          title={product.title}
          soldOut={soldOut}
        />

        <div>
          {product.category?.name && (
            <p className="text-xs uppercase tracking-[0.16em] text-ink/45 sm:text-[13px]">
              {product.category.name}
            </p>
          )}
          <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">
            {product.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-2xl font-semibold text-ink sm:text-3xl">
              {formatINR(product.price)}
            </span>
            {onSale && product.compare_at_price && (
              <>
                <span className="text-lg text-ink/40 line-through">
                  {formatINR(product.compare_at_price)}
                </span>
                <Badge tone="gold">
                  {salePercent(product.price, product.compare_at_price)}% off
                </Badge>
              </>
            )}
          </div>

          <p className="mt-2 text-sm text-ink/45">
            Price inclusive of all charges. Ships across India.
          </p>

          <div className="prose-nest mt-6 text-[15px]">
            {product.description.split("\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {product.size_info && (
            <div className="mt-4 rounded-xl border border-ink/10 bg-white/60 px-4 py-3 text-[15px] text-ink/70">
              <span className="font-medium text-ink">Size / fit: </span>
              {product.size_info}
            </div>
          )}

          <div className="mt-8">
            <AddToCart product={product} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-display text-2xl text-ink">You may also like</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
