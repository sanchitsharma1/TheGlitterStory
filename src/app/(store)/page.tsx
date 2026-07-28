import Link from "next/link";
import Image from "next/image";
import { ProductCard } from "@/components/store/product-card";
import { ReviewsSection } from "@/components/store/reviews-section";
import { Button } from "@/components/ui/button";
import { getCategories, getProducts } from "@/lib/catalog";
import { getApprovedReviews } from "@/lib/reviews";
import { getSiteConfig } from "@/lib/settings";
import { isOnSale } from "@/lib/utils";

export default async function HomePage() {
  const [config, allProducts, featured, categories, reviews] = await Promise.all([
    getSiteConfig(),
    getProducts({ sort: "newest" }),
    getProducts({ featuredOnly: true }),
    getCategories(),
    getApprovedReviews({ limit: 6 }),
  ]);

  const newest = allProducts.filter((p) => p.stock > 0).slice(0, 8);
  const featuredList =
    featured.length > 0
      ? featured.filter((p) => p.stock > 0).slice(0, 8)
      : newest;
  const onSale = allProducts
    .filter((p) => p.stock > 0 && isOnSale(p))
    .slice(0, 4);

  return (
    <div>
      {/* Compact hero - products lead the page */}
      <section className="border-b border-ink/8 bg-gradient-to-b from-ivory-dark/50 to-ivory">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-10 sm:flex-row sm:items-end sm:px-6 sm:py-12">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-dark sm:text-[13px]">
              The Jewel Nest
            </p>
            <h1 className="mt-2 font-display text-3xl leading-tight text-ink sm:text-4xl lg:text-5xl">
              Modern jewellery, quietly luxurious.
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-ink/60 sm:text-base">
              {config.brand.about_short}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/shop">
              <Button size="lg">Shop all</Button>
            </Link>
            <Link href="/shop?sort=newest">
              <Button size="lg" variant="secondary">
                New arrivals
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured / products first */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark sm:text-[13px]">
              Selected for you
            </p>
            <h2 className="font-display text-3xl text-ink sm:text-4xl">
              Featured pieces
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-sm uppercase tracking-[0.14em] text-ink/60 hover:text-ink"
          >
            View all
          </Link>
        </div>
        {featuredList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink/15 bg-white/40 px-6 py-16 text-center">
            <p className="font-display text-2xl text-ink">The nest is being styled</p>
            <p className="mx-auto mt-2 max-w-md text-[15px] text-ink/55">
              Products will appear here once you add them from the admin panel.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-5">
            {featuredList.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="border-t border-ink/8 bg-white/30">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark sm:text-[13px]">
                  Collections
                </p>
                <h2 className="font-display text-3xl text-ink sm:text-4xl">
                  Shop by category
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className="group rounded-2xl border border-ink/10 bg-ivory p-5 transition hover:border-gold/50 hover:shadow-sm"
                >
                  <p className="font-display text-xl text-ink sm:text-2xl">
                    {cat.name}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-ink/50">
                    {cat.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New arrivals rail */}
      {newest.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark sm:text-[13px]">
                Just in
              </p>
              <h2 className="font-display text-3xl text-ink sm:text-4xl">
                New arrivals
              </h2>
            </div>
            <Link
              href="/shop?sort=newest"
              className="text-sm uppercase tracking-[0.14em] text-ink/60 hover:text-ink"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {newest.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* On sale rail */}
      {onSale.length > 0 && (
        <section className="border-t border-ink/8 bg-gold/5">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark sm:text-[13px]">
                  Limited
                </p>
                <h2 className="font-display text-3xl text-ink sm:text-4xl">
                  On sale
                </h2>
              </div>
              <Link
                href="/shop?sort=price-asc"
                className="text-sm uppercase tracking-[0.14em] text-ink/60 hover:text-ink"
              >
                Shop more
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
              {onSale.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <ReviewsSection reviews={reviews} />

      {/* Story - below products */}
      <section className="border-t border-ink/8 bg-ink text-ivory">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              From the house of {config.brand.parent_brand}
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">
              Two names. One standard of polish.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-ivory/75">
              {config.brand.parent_brand_note}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/about">
                <Button
                  size="lg"
                  className="bg-ivory text-ink hover:bg-ivory/90"
                >
                  Our story
                </Button>
              </Link>
              <a
                href={`https://instagram.com/${config.contact.instagram}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button
                  size="lg"
                  variant="secondary"
                  className="border-ivory/30 text-ivory hover:bg-ivory/10"
                >
                  @{config.contact.instagram}
                </Button>
              </a>
            </div>
          </div>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[2rem] border border-ivory/15 bg-gradient-to-br from-ivory/10 via-transparent to-gold/20">
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
              <Image
                src="/brand/mark.svg"
                alt=""
                width={88}
                height={88}
                className="mb-5 brightness-0 invert opacity-90"
              />
              <p className="font-display text-3xl text-ivory">The Jewel Nest</p>
              <p className="mt-3 max-w-xs text-sm text-ivory/60">
                Pieces that finish the look - after the polish, after the reel,
                for real life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="border-t border-ink/8 bg-ivory-dark/40">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:grid-cols-3 sm:px-6">
          {[
            {
              title: "Thoughtful packaging",
              body: "Gift-ready presentation for every order - because unboxing is part of the ritual.",
            },
            {
              title: "Secure checkout",
              body: "Guest checkout with secure Razorpay payment (UPI, cards, netbanking). Your order ID is your receipt.",
            },
            {
              title: "Easy returns",
              body: `${config.returns.return_window_days}-day return window. Hygiene-sensitive items are exchange-only.`,
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-ink/8 bg-white/50 p-6"
            >
              <h3 className="font-display text-xl text-ink sm:text-2xl">
                {item.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink/60">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
