import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/types";
import { resolveCategoryImage } from "@/lib/category-images";

/**
 * Compact category tiles — image + fixed caption bar.
 *
 * UX choices:
 * - Shorter aspect (not poster-tall) so the rail stays secondary to products
 * - Solid caption strip under the photo → always identical height, perfect contrast
 * - Name only on the tile (descriptions clutter small cards; shop page has filters)
 * - Dense grid, restrained hover
 */
export function CategoryTiles({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5">
      {categories.map((cat) => {
        const src = resolveCategoryImage(cat.slug, cat.image_url);

        return (
          <Link
            key={cat.id}
            href={`/shop?category=${cat.slug}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-ink/10 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-gold/45 hover:shadow-md"
          >
            {/* Compact image — ~landscape, not tall posters */}
            <div className="relative aspect-[4/3] overflow-hidden bg-ivory-dark">
              <Image
                src={src}
                alt={cat.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
              />
              {/* Soft wash so bright photos feel calm, not blown-out */}
              <div
                className="absolute inset-0 bg-ink/[0.06] transition group-hover:bg-ink/[0.02]"
                aria-hidden
              />
            </div>

            {/* Fixed-height caption — uniform across every tile */}
            <div className="flex h-[3.75rem] shrink-0 items-center justify-between gap-2 border-t border-ink/6 bg-ivory/80 px-3 sm:h-16 sm:px-3.5">
              <p className="min-w-0 truncate font-display text-base leading-none text-ink sm:text-lg">
                {cat.name}
              </p>
              <span
                className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/40 transition group-hover:text-gold-dark sm:text-xs"
                aria-hidden
              >
                Shop
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
