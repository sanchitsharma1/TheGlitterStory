"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/store/cart";
import { formatINR, indianStates } from "@/lib/utils";
import { DEFAULT_COMMERCE, type CommerceSettings } from "@/types";
import { calculateShipping, cartSubtotal } from "@/lib/commerce/pricing";
import { Lock, ShieldCheck, CreditCard } from "lucide-react";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, couponCode, clear } = useCart();
  const [settings, setSettings] = useState<CommerceSettings>(DEFAULT_COMMERCE);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      script.async = true;
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
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          payment_method: "razorpay",
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

      if (!data.razorpay?.orderId && !data.order_id) {
        setError("Could not start payment. Please try again.");
        setLoading(false);
        return;
      }

      const ready = await loadRazorpay();
      if (!ready || !window.Razorpay) {
        setError("Could not load payment window. Please refresh and try again.");
        setLoading(false);
        return;
      }

      const razorpayOrderId = data.razorpay?.orderId || data.order_id;
      const amount = data.razorpay?.amount || data.amount;
      const currency = data.razorpay?.currency || data.currency || "INR";
      const key = data.razorpay?.key || data.key;

      const rzp = new window.Razorpay({
        key,
        amount,
        currency,
        name: "The Jewel Nest",
        description: `Order ${data.order.order_number}`,
        image: "/brand/mark.svg",
        order_id: razorpayOrderId,
        prefill: {
          name: form.customer_name,
          email: form.customer_email,
          contact: form.customer_phone,
        },
        notes: {
          order_number: data.order.order_number,
        },
        theme: {
          color: "#1a1a1a",
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: data.order.id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyData.ok) {
              setError(
                verifyData.error ||
                  "Payment received but verification failed. Contact support with your Order ID."
              );
              setLoading(false);
              return;
            }
            clear();
            router.push(`/order/${data.order.order_number}`);
          } catch {
            setError(
              "Payment may have succeeded but confirmation failed. Save your Order ID and contact support."
            );
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError(
              "Payment was cancelled. Your pieces are reserved briefly as pending payment. Complete payment or contact support@thejewelnest.co.in with your Order ID if money was deducted."
            );
          },
          confirm_close: true,
        },
      });

      rzp.on("payment.failed", (response: unknown) => {
        const detail = response as {
          error?: { description?: string; reason?: string };
        };
        setLoading(false);
        setError(
          detail?.error?.description ||
            detail?.error?.reason ||
            "Payment failed. Please try again with another method."
        );
      });

      rzp.open();
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
        Guest checkout - secure online payment. Ships within India only.
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
                  className="flex h-11 w-full rounded-xl border border-ink/15 bg-white/80 px-3.5 text-[15px] outline-none focus:border-gold focus:ring-2 focus:ring-gold/25"
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
            <div className="mt-4 rounded-2xl border border-gold/40 bg-gradient-to-br from-gold/10 via-white to-ivory p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-ivory">
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="font-medium text-ink">Pay securely online</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink/60">
                    UPI, cards, netbanking and wallets via Razorpay. You will complete
                    payment in a secure popup after placing the order.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-ink/55">
                <span className="inline-flex items-center gap-1.5">
                  <Lock size={14} className="text-gold-dark" /> Encrypted checkout
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-gold-dark" /> PCI-compliant
                </span>
              </div>
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-ink/10 bg-white/80 p-6 shadow-sm">
          <h2 className="font-display text-2xl">Order summary</h2>
          <ul className="mt-4 space-y-2 text-[15px]">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-3">
                <span className="text-ink/70">
                  {i.title} × {i.quantity}
                </span>
                <span>{formatINR(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-t border-ink/10 pt-4 text-[15px]">
            <div className="flex justify-between">
              <span className="text-ink/60">Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/60">Discount</span>
              <span>-{formatINR(discount)}</span>
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
            {loading ? "Opening secure payment..." : `Pay ${formatINR(total)} securely`}
          </Button>
          <p className="mt-3 text-center text-xs text-ink/45">
            You will be redirected to Razorpay to complete payment.
          </p>
        </aside>
      </form>
    </div>
  );
}
