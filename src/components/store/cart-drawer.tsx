"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { X } from "lucide-react";
import { useCart } from "@/store/cart";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { calculateShipping } from "@/lib/commerce/pricing";
import { useCommerceSettings } from "@/hooks/use-commerce-settings";

export function CartDrawer() {
  const {
    items,
    drawerOpen,
    closeDrawer,
    removeItem,
    setQuantity,
    subtotal,
  } = useCart();
  const { commerce, refresh } = useCommerceSettings();

  useEffect(() => {
    if (drawerOpen) refresh();
  }, [drawerOpen, refresh]);

  const sub = subtotal();
  const shipping = calculateShipping(sub, commerce);
  const total = sub + shipping;

  useEffect(() => {
    if (!drawerOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen, closeDrawer]);

  if (!drawerOpen) return null;

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Shopping bag">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
        aria-label="Close bag"
        onClick={closeDrawer}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-ivory shadow-2xl">
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
          <div>
            <p className="font-display text-2xl text-ink">Your bag</p>
            <p className="text-xs uppercase tracking-[0.14em] text-ink/45">
              {items.reduce((n, i) => n + i.quantity, 0)} item
              {items.reduce((n, i) => n + i.quantity, 0) === 1 ? "" : "s"}
            </p>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            className="rounded-full p-2 text-ink/60 hover:bg-ink/5 hover:text-ink"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-display text-xl text-ink">Your bag is empty</p>
              <Button className="mt-6" variant="secondary" onClick={closeDrawer}>
                Continue shopping
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="flex gap-3 border-b border-ink/8 pb-4"
                >
                  <Link
                    href={`/product/${item.slug}`}
                    onClick={closeDrawer}
                    className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-100"
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : null}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={closeDrawer}
                        className="font-display text-lg leading-snug text-ink hover:underline"
                      >
                        {item.title}
                      </Link>
                      <button
                        type="button"
                        className="text-[11px] uppercase tracking-wider text-ink/40 hover:text-ink"
                        onClick={() => removeItem(item.productId)}
                      >
                        Remove
                      </button>
                    </div>
                    <p className="mt-1 text-sm font-medium">
                      {formatINR(item.price)}
                    </p>
                    <div className="mt-auto flex items-center gap-2 pt-2">
                      <div className="inline-flex items-center rounded-full border border-ink/15 bg-white">
                        <button
                          type="button"
                          className="h-8 w-8 text-sm"
                          onClick={() =>
                            setQuantity(item.productId, item.quantity - 1)
                          }
                          aria-label="Decrease"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="h-8 w-8 text-sm"
                          onClick={() =>
                            setQuantity(item.productId, item.quantity + 1)
                          }
                          aria-label="Increase"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm text-ink/50">
                        {formatINR(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-ink/10 bg-white/80 px-5 py-5">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-ink/55">Subtotal</span>
                <span>{formatINR(sub)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/55">Shipping</span>
                <span>{shipping === 0 ? "Free" : formatINR(shipping)}</span>
              </div>
              <div className="flex justify-between pt-1 text-base font-semibold">
                <span>Total</span>
                <span>{formatINR(total)}</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-ink/45">
              Free shipping above ₹{commerce.free_shipping_threshold} · else ₹
              {commerce.shipping_fee}
            </p>
            <Link href="/checkout" onClick={closeDrawer} className="mt-4 block">
              <Button size="lg" className="w-full">
                Checkout
              </Button>
            </Link>
            <Link
              href="/cart"
              onClick={closeDrawer}
              className="mt-3 block text-center text-xs uppercase tracking-[0.14em] text-ink/50 hover:text-ink"
            >
              View full bag
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
