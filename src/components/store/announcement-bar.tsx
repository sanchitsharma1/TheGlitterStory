import Link from "next/link";
import type { SiteConfig } from "@/lib/settings";

export function AnnouncementBar({ config }: { config: SiteConfig }) {
  const freeShip = config.commerce.free_shipping_threshold;
  const returns = config.returns.return_window_days;

  return (
    <div className="border-b border-ink/10 bg-ink text-ivory">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-2.5 text-center text-[11px] uppercase tracking-[0.14em] sm:text-xs">
        <span>Free shipping above ₹{freeShip}</span>
        <span className="hidden text-gold/80 sm:inline" aria-hidden>
          ·
        </span>
        <span className="hidden sm:inline">Secure Razorpay checkout</span>
        <span className="hidden text-gold/80 md:inline" aria-hidden>
          ·
        </span>
        <span className="hidden md:inline">{returns}-day returns</span>
        <span className="hidden text-gold/80 lg:inline" aria-hidden>
          ·
        </span>
        <Link
          href="/shop"
          className="text-gold underline-offset-2 hover:underline lg:inline"
        >
          Shop the collection
        </Link>
      </div>
    </div>
  );
}
