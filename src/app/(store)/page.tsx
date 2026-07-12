import Link from "next/link";
import Image from "next/image";
import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import { getCategories, getProducts } from "@/lib/catalog";
import { getSiteConfig } from "@/lib/settings";

export default async function HomePage() {
  const [config, featured, categories] = await Promise.all([
    getSiteConfig(),
    getProducts({ featuredOnly: true }),
    getCategories(),
  ]);

  const showcase =
    featured.length > 0 ? featured.slice(0, 8) : (await getProducts()).slice(0, 8);

  return (
    <div>
      {/* Hero */}
      <section className="grain relative overflow-hidden border-b border-ink/8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(201,162,39,0.18),_transparent_55%),radial-gradient(ellipse_at_bottom_left,_rgba(26,26,26,0.06),_transparent_50%)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-gold-dark sm:text-[13px]">
              From the house of {config.brand.parent_brand}
            </p>
            <h1 className="font-display text-4xl leading-[1.1] text-ink sm:text-5xl lg:text-6xl">
              Modern jewellery,
              <span className="block italic text-ink/80">quietly luxurious.</span>
            </h1>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-ink/65">
              {config.brand.about_short}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop">
                <Button size="lg">Shop the collection</Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="secondary">
                  Our story
                </Button>
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-xs uppercase tracking-[0.14em] text-ink/50 sm:text-[13px]">
              <span>India-wide shipping</span>
              <span>Free above ₹{config.commerce.free_shipping_threshold}</span>
              <span>Cash on Delivery</span>
            </div>
          </div>

          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] border border-ink/10 bg-gradient-to-br from-ivory-dark via-white to-gold/20 shadow-xl">
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
              <Image
                src="/brand/mark.svg"
                alt=""
                width={96}
                height={96}
                className="mb-6"
              />
              <p className="font-display text-3xl text-ink sm:text-4xl">The Jewel Nest</p>
              <p className="mt-3 max-w-xs text-[15px] text-ink/55">
                Pieces that finish the look - after the polish, after the reel, for real life.
              </p>
              <div className="mt-8 h-px w-16 bg-gold" />
              <p className="mt-6 text-xs uppercase tracking-[0.2em] text-ink/40">
                Est. for everyday glam
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Parent brand bridge */}
      <section className="border-b border-ink/8 bg-ink text-ivory">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 sm:flex-row sm:items-center sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              Sister to the salon
            </p>
            <p className="mt-1 max-w-2xl text-[15px] leading-relaxed text-ivory/75">
              {config.brand.parent_brand_note} Follow the jewellery drop on Instagram{" "}
              <a
                className="text-gold underline-offset-2 hover:underline"
                href={`https://instagram.com/${config.contact.instagram}`}
                target="_blank"
                rel="noreferrer"
              >
                @{config.contact.instagram}
              </a>
              .
            </p>
          </div>
          <Link href="/about" className="shrink-0 text-sm uppercase tracking-[0.14em] text-gold">
            Read the story →
          </Link>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark sm:text-[13px]">
                Collections
              </p>
              <h2 className="font-display text-3xl text-ink sm:text-4xl">Shop by category</h2>
            </div>
            <Link href="/shop" className="text-sm uppercase tracking-[0.14em] text-ink/60 hover:text-ink">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group rounded-2xl border border-ink/10 bg-white/70 p-5 transition hover:border-gold/50 hover:shadow-sm"
              >
                <p className="font-display text-xl text-ink group-hover:text-ink sm:text-2xl">{cat.name}</p>
                <p className="mt-1 line-clamp-2 text-sm text-ink/50">{cat.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark sm:text-[13px]">
            Selected for you
          </p>
          <h2 className="font-display text-3xl text-ink sm:text-4xl">Featured pieces</h2>
        </div>
        {showcase.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink/15 bg-white/40 px-6 py-16 text-center">
            <p className="font-display text-2xl text-ink">The nest is being styled</p>
            <p className="mx-auto mt-2 max-w-md text-[15px] text-ink/55">
              Products will appear here once you add them from the admin panel and connect Supabase.
            </p>
            <Link href="/admin/login" className="mt-6 inline-block">
              <Button variant="secondary">Open admin</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-5">
            {showcase.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
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
              body: "Guest checkout with Cash on Delivery. No account needed. Your order ID is your receipt.",
            },
            {
              title: "Easy returns",
              body: `${config.returns.return_window_days}-day return window (customisable). Hygiene-sensitive items are exchange-only.`,
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-ink/8 bg-white/50 p-6">
              <h3 className="font-display text-xl text-ink sm:text-2xl">{item.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink/60">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
