"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/store/cart";
import { formatINR, indianStates } from "@/lib/utils";
import {
  DEFAULT_COMMERCE,
  type CommerceSettings,
  type PaymentMethod,
} from "@/types";
import { calculateShipping, cartSubtotal } from "@/lib/commerce/pricing";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, couponCode, clear } = useCart();
  const [settings, setSettings] = useState<CommerceSettings>(DEFAULT_COMMERCE);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");

  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "Maharashtra",
    pincode: "",
    customer_note: "",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.commerce) setSettings(data.commerce);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!couponCode || items.length === 0) {
      setDiscount(0);
      return;
    }
    fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode, items }),
    })
      .then((r) => r.json())
      .then((data) => setDiscount(data.ok ? data.discount : 0))
      .catch(() => setDiscount(0));
  }, [couponCode, items]);

  const subtotal = useMemo(() => cartSubtotal(items), [items]);
  const afterDiscount = Math.max(0, subtotal - discount);
  const shipping = calculateShipping(afterDiscount, settings);
  const total = afterDiscount + shipping;

  function loadRazorpay(): Promise<boolean> {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          payment_method: paymentMethod,
          coupon_code: couponCode || undefined,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "Checkout failed");
        setLoading(false);
        return;
      }

      if (paymentMethod === "razorpay" && data.razorpay) {
        const ready = await loadRazorpay();
        if (!ready || !window.Razorpay) {
          setError("Could not load Razorpay. Try COD or refresh.");
          setLoading(false);
          return;
        }

        const rzp = new window.Razorpay({
          key: data.razorpay.key,
          amount: data.razorpay.amount,
          currency: data.razorpay.currency,
          name: "The Jewel Nest",
          description: `Order ${data.order.order_number}`,
          order_id: data.razorpay.orderId,
          prefill: {
            name: form.customer_name,
            email: form.customer_email,
            contact: form.customer_phone,
          },
          theme: { color: "#1a1a1a" },
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: data.order.id,
                ...response,
              }),
            });
            clear();
            router.push(`/order/${data.order.order_number}`);
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
              setError(
                "Payment was not completed. Your order is held as pending payment - contact us with your order ID if amount was deducted."
              );
            },
          },
        });
        rzp.open();
        return;
      }

      clear();
      router.push(`/order/${data.order.order_number}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Nothing to checkout</h1>
        <Link href="/shop" className="mt-6 inline-block">
          <Button>Shop now</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl text-ink">Checkout</h1>
      <p className="mt-2 text-[15px] text-ink/55">
        Guest checkout - no account needed. Ships within India only.
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-ink/10 bg-white/70 p-6">
            <h2 className="font-display text-xl">Contact</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm uppercase tracking-wider text-ink/50">
                  Full name *
                </label>
                <Input
                  required
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm uppercase tracking-wider text-ink/50">
                  Email *
                </label>
                <Input
                  required
                  type="email"
                  value={form.customer_email}
                  onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm uppercase tracking-wider text-ink/50">
                  Mobile *
                </label>
                <Input
                  required
                  inputMode="numeric"
                  pattern="[6-9][0-9]{9}"
                  placeholder="10-digit mobile"
                  value={form.customer_phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      customer_phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                    })
                  }
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-ink/10 bg-white/70 p-6">
            <h2 className="font-display text-xl">Delivery address (India)</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm uppercase tracking-wider text-ink/50">
                  Address line 1 *
                </label>
                <Input
                  required
                  value={form.address_line1}
                  onChange={(e) => setForm({ ...form, address_line1: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm uppercase tracking-wider text-ink/50">
                  Address line 2
                </label>
                <Input
                  value={form.address_line2}
                  onChange={(e) => setForm({ ...form, address_line2: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm uppercase tracking-wider text-ink/50">
                  City *
                </label>
                <Input
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm uppercase tracking-wider text-ink/50">
                  State *
                </label>
                <select
                  required
                  className="flex h-11 w-full rounded-xl border border-ink/15 bg-white/80 px-3.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/25"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                >
                  {indianStates().map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm uppercase tracking-wider text-ink/50">
                  Pincode *
                </label>
                <Input
                  required
                  inputMode="numeric"
                  pattern="\d{6}"
                  value={form.pincode}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                    })
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm uppercase tracking-wider text-ink/50">
                  Order note
                </label>
                <Textarea
                  value={form.customer_note}
                  onChange={(e) => setForm({ ...form, customer_note: e.target.value })}
                  placeholder="Gift message, landmark, preferred delivery time..."
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-ink/10 bg-white/70 p-6">
            <h2 className="font-display text-xl">Payment</h2>
            <div className="mt-4 space-y-3">
              {settings.allow_cod && (
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink/10 p-4 has-[:checked]:border-gold has-[:checked]:bg-gold/5">
                  <input
                    type="radio"
                    name="pay"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-sm text-ink/50">
                      Min order ₹{settings.cod_min_order}. Pay when your parcel arrives.
                    </p>
                  </div>
                </label>
              )}
              {settings.allow_razorpay && (
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink/10 p-4 has-[:checked]:border-gold has-[:checked]:bg-gold/5">
                  <input
                    type="radio"
                    name="pay"
                    checked={paymentMethod === "razorpay"}
                    onChange={() => setPaymentMethod("razorpay")}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium">Pay online (UPI / Card / Netbanking)</p>
                    <p className="text-sm text-ink/50">
                      Secure payment via Razorpay.
                    </p>
                  </div>
                </label>
              )}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-ink/10 bg-white/80 p-6 shadow-sm">
          <h2 className="font-display text-2xl">Order summary</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-3">
                <span className="text-ink/70">
                  {i.title} × {i.quantity}
                </span>
                <span>{formatINR(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-t border-ink/10 pt-4 text-sm">
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
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatINR(total)}</span>
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="mt-6 w-full" disabled={loading}>
            {loading
              ? "Placing order..."
              : paymentMethod === "cod"
                ? "Place COD order"
                : "Pay & place order"}
          </Button>
        </aside>
      </form>
    </div>
  );
}
