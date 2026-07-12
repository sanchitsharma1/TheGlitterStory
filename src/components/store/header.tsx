"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/store/cart";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "Our Story" },
  { href: "/shipping", label: "Shipping" },
  { href: "/returns", label: "Returns" },
  { href: "/contact", label: "Contact" },
];

export function StoreHeader() {
  const [open, setOpen] = useState(false);
  const count = useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));

  return (
    <header className="sticky top-0 z-50 border-b border-ink/8 bg-ivory/90 backdrop-blur-md">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6">
        <button
          type="button"
          className="inline-flex rounded-full p-2 text-ink lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/brand/logo.svg"
            alt="The Jewel Nest"
            width={220}
            height={54}
            priority
            className="h-11 w-auto sm:h-12"
          />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs font-medium uppercase tracking-[0.16em] text-ink/75 transition hover:text-ink sm:text-[13px]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <a
            href="https://instagram.com/thejewel_nest"
            target="_blank"
            rel="noreferrer"
            className="rounded-full p-2 text-ink/70 transition hover:bg-ink/5 hover:text-ink"
            aria-label="Instagram"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
            </svg>
          </a>
          <Link
            href="/cart"
            className="relative rounded-full p-2 text-ink transition hover:bg-ink/5"
            aria-label="Shopping bag"
          >
            <ShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[11px] font-bold text-ink">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div
        className={cn(
          "border-t border-ink/8 bg-ivory lg:hidden",
          open ? "block" : "hidden"
        )}
      >
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-[15px] font-medium tracking-wide text-ink/80 hover:bg-ink/5"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
