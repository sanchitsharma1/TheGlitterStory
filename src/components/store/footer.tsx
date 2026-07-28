import Link from "next/link";
import Image from "next/image";
import type { SiteConfig } from "@/lib/settings";

export function StoreFooter({ config }: { config: SiteConfig }) {
  const { contact, brand, commerce } = config;

  return (
    <footer className="mt-auto border-t border-ink/10 bg-ink text-ivory">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Image
            src="/brand/logo.svg"
            alt="The Jewel Nest"
            width={240}
            height={58}
            className="mb-4 h-11 w-auto brightness-0 invert opacity-90 sm:h-12"
          />
          <p className="max-w-md text-[15px] leading-relaxed text-ivory/70">
            {brand.about_short}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-gold/90">
            A house of {brand.parent_brand}. {brand.parent_brand_note}
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gold">
            Explore
          </h3>
          <ul className="space-y-2.5 text-[15px] text-ivory/75">
            <li><Link className="hover:text-ivory" href="/shop">Shop all</Link></li>
            <li><Link className="hover:text-ivory" href="/about">Our story</Link></li>
            <li><Link className="hover:text-ivory" href="/shipping">Shipping</Link></li>
            <li><Link className="hover:text-ivory" href="/returns">Returns</Link></li>
            <li><Link className="hover:text-ivory" href="/contact">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gold">
            Details
          </h3>
          <ul className="space-y-2.5 text-[15px] text-ivory/75">
            <li>Ships across {commerce.service_region}</li>
            <li>Free shipping above ₹{commerce.free_shipping_threshold}</li>
            <li>Else flat ₹{commerce.shipping_fee} shipping</li>
            {commerce.allow_cod ? (
              <li>COD from ₹{commerce.cod_min_order}</li>
            ) : (
              <li>Secure online payment</li>
            )}
            {contact.instagram && (
              <li>
                <a
                  className="hover:text-ivory"
                  href={`https://instagram.com/${contact.instagram}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  @{contact.instagram}
                </a>
              </li>
            )}
            <li className="pt-2">
              <Link className="hover:text-ivory" href="/privacy">Privacy</Link>
              {" · "}
              <Link className="hover:text-ivory" href="/terms">Terms</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ivory/10 py-4 text-center text-sm text-ivory/45">
        © {new Date().getFullYear()} The Jewel Nest · thejewelnest.co.in
      </div>
    </footer>
  );
}
