"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/store/cart";
import { formatINR } from "@/lib/utils";
import {
  DEFAULT_COMMERCE,
  type CommerceSettings,
} from "@/types";
import { calculateShipping, cartSubtotal } from "@/lib/commerce/pricing";

export default function CartPage() {
  const { items, setQuantity, removeItem, couponCode, setCouponCode } = useCart();
  const [settings, setSettings] = useState<CommerceSettings>(DEFAULT_COMMERCE);
  const [couponInput, setCouponInput] = useState(couponCode ?? "");
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.commerce) setSettings(data.commerce);
      })
      .catch(() => undefined);
  }, []);

  const subtotal = useMemo(() => cartSubtotal(items), [items]);
  const afterDiscount = Math.max(0, subtotal - discount);
  const shipping = calculateShipping(afterDiscount, settings);
  const total = afterDiscount + shipping;

  async function applyCoupon() {
    if (!couponInput.trim()) {
      setCouponCode(null);
      setDiscount(0);
      setCouponMsg(null);
      return;
    }
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponInput, items }),
    });
    const data = await res.json();
    if (data.ok) {
      setCouponCode(couponInput.trim().toUpperCase());
      setDiscount(data.discount);
      setCouponMsg(data.message);
    } else {
      setCouponCode(null);
      setDiscount(0);
      setCouponMsg(data.message || "Invalid coupon");
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-4xl text-ink">Your bag is empty</h1>
        <p className="mt-3 text-[15px] text-ink/55">
          Discover pieces that feel like a quiet kind of glam.
        </p>
        <Link href="/shop" className="mt-8 inline-block">
          <Button size="lg">Continue shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl text-ink">Your bag</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 rounded-2xl border border-ink/10 bg-white/70 p-4"
            >
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                {item.image ? (
                  <Image src={item.image} alt="" fill className="object-cover" sizes="80px" />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/product/${item.slug}`}
                      className="font-display text-lg text-ink hover:underline"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-1 text-sm font-medium">{formatINR(item.price)}</p>
                  </div>
                  <button
                    type="button"
                    className="text-sm uppercase tracking-wider text-ink/40 hover:text-ink"
                    onClick={() => removeItem(item.productId)}
                  >
                    Remove
                  </button>
                </div>
                <div className="mt-auto flex items-center gap-3 pt-3">
                  <div className="inline-flex items-center rounded-full border border-ink/15">
                    <button
                      type="button"
                      className="h-9 w-9"
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      className="h-9 w-9"
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-ink/50">
                    Line: {formatINR(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-2xl border border-ink/10 bg-white/80 p-6 shadow-sm">
          <h2 className="font-display text-2xl text-ink">Summary</h2>
          <div className="mt-4 space-y-2 text-[15px]">
            <div className="flex justify-between">
              <span className="text-ink/60">Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/60">Discount</span>
              <span>−{formatINR(discount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/60">Shipping</span>
              <span>{shipping === 0 ? "Free" : formatINR(shipping)}</span>
            </div>
            <div className="border-t border-ink/10 pt-3 flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatINR(total)}</span>
            </div>
          </div>

          <p className="mt-3 text-sm text-ink/45">
            Free shipping on orders ₹{settings.free_shipping_threshold}+, else ₹
            {settings.shipping_fee}
          </p>

          <div className="mt-5 space-y-2">
            <label className="text-sm uppercase tracking-[0.12em] text-ink/50">
              Coupon
            </label>
            <div className="flex gap-2">
              <Input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="CODE"
              />
              <Button type="button" variant="secondary" onClick={applyCoupon}>
                Apply
              </Button>
            </div>
            {couponMsg && (
              <p className="text-xs text-ink/60">{couponMsg}</p>
            )}
          </div>

          <Link href="/checkout" className="mt-6 block">
            <Button size="lg" className="w-full">
              Checkout
            </Button>
          </Link>
          <Link
            href="/shop"
            className="mt-3 block text-center text-sm uppercase tracking-[0.12em] text-ink/50 hover:text-ink"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
