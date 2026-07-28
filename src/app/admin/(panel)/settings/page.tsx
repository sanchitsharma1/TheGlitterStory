"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    free_shipping_threshold: "600",
    shipping_fee: "120",
    cod_min_order: "299",
    allow_cod: true,
    allow_razorpay: true,
    return_window_days: "7",
    policy_summary: "",
    email: "",
    phone: "",
    whatsapp: "",
    instagram: "thejewel_nest",
    shipping_summary: "",
    privacy_summary: "",
    terms_summary: "",
  });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        const c = data.commerce ?? {};
        const r = data.returns ?? {};
        const contact = data.contact ?? {};
        const p = data.policies ?? {};
        setForm({
          free_shipping_threshold: String(c.free_shipping_threshold ?? 600),
          shipping_fee: String(c.shipping_fee ?? 120),
          cod_min_order: String(c.cod_min_order ?? 299),
          allow_cod: Boolean(c.allow_cod),
          allow_razorpay: c.allow_razorpay !== false,
          return_window_days: String(r.return_window_days ?? 7),
          policy_summary: r.policy_summary ?? "",
          email: contact.email ?? "",
          phone: contact.phone ?? "",
          whatsapp: contact.whatsapp ?? "",
          instagram: contact.instagram ?? "thejewel_nest",
          shipping_summary: p.shipping_summary ?? "",
          privacy_summary: p.privacy_summary ?? "",
          terms_summary: p.terms_summary ?? "",
        });
      })
      .catch(() => setError("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    setError(null);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        commerce: {
          free_shipping_threshold: Number(form.free_shipping_threshold),
          shipping_fee: Number(form.shipping_fee),
          cod_min_order: Number(form.cod_min_order),
          allow_cod: form.allow_cod,
          allow_razorpay: form.allow_razorpay,
          currency: "INR",
          currency_symbol: "₹",
          service_region: "India",
        },
        returns: {
          return_window_days: Number(form.return_window_days),
          policy_summary: form.policy_summary,
        },
        contact: {
          brand_name: "The Jewel Nest",
          email: form.email,
          phone: form.phone,
          whatsapp: form.whatsapp,
          instagram: form.instagram,
          address_line: "",
          city: "",
          state: "",
          pincode: "",
          country: "India",
        },
        policies: {
          shipping_summary: form.shipping_summary,
          privacy_summary: form.privacy_summary,
          terms_summary: form.terms_summary,
        },
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Save failed (super admin only)");
      return;
    }
    // Keep form in sync with server-generated shipping summary
    if (data.policies?.shipping_summary) {
      setForm((f) => ({
        ...f,
        shipping_summary: data.policies.shipping_summary,
      }));
    }
    const threshold = data.commerce?.free_shipping_threshold ?? form.free_shipping_threshold;
    const fee = data.commerce?.shipping_fee ?? form.shipping_fee;
    setMsg(
      `Settings saved. Live everywhere: free shipping ≥ ₹${threshold}, else ₹${fee} shipping (banner, footer, cart, checkout, product page, shipping page).`
    );
  }

  if (loading) {
    return <p className="text-sm text-ink/50">Loading settings…</p>;
  }

  return (
    <div>
      <h1 className="font-display text-3xl">Settings</h1>
      <p className="text-sm text-ink/55">
        Super admin controls - shipping, payments, return window, contact and
        policies. Rate numbers always update the top banner and shipping page
        automatically.
      </p>

      <form onSubmit={save} className="mt-8 max-w-3xl space-y-8">
        <section className="rounded-2xl border border-ink/10 bg-white p-5">
          <h2 className="font-display text-xl">Commerce</h2>
          <p className="mt-1 text-sm text-ink/50">
            Preview: Free shipping above ₹{form.free_shipping_threshold || "0"} ·
            else ₹{form.shipping_fee || "0"} shipping
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">
                Free shipping above ₹
              </label>
              <Input
                type="number"
                min="0"
                step="1"
                value={form.free_shipping_threshold}
                onChange={(e) =>
                  setForm({ ...form, free_shipping_threshold: e.target.value })
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">
                Shipping fee ₹ (when below free threshold)
              </label>
              <Input
                type="number"
                min="0"
                step="1"
                value={form.shipping_fee}
                onChange={(e) => setForm({ ...form, shipping_fee: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">
                COD minimum ₹
              </label>
              <Input
                type="number"
                value={form.cod_min_order}
                onChange={(e) => setForm({ ...form, cod_min_order: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-6 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.allow_cod}
                onChange={(e) => setForm({ ...form, allow_cod: e.target.checked })}
              />
              Enable COD
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.allow_razorpay}
                onChange={(e) => setForm({ ...form, allow_razorpay: e.target.checked })}
              />
              Enable Razorpay
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-ink/10 bg-white p-5">
          <h2 className="font-display text-xl">Returns (customisable)</h2>
          <div className="mt-4 grid gap-3">
            <div className="max-w-xs">
              <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">
                Return window (days)
              </label>
              <Input
                type="number"
                min="0"
                value={form.return_window_days}
                onChange={(e) =>
                  setForm({ ...form, return_window_days: e.target.value })
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">
                Return policy text
              </label>
              <Textarea
                rows={4}
                value={form.policy_summary}
                onChange={(e) => setForm({ ...form, policy_summary: e.target.value })}
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-ink/10 bg-white p-5">
          <h2 className="font-display text-xl">Contact</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">Email</label>
              <Input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="hello@thejewelnest.co.in"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">Phone</label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">WhatsApp</label>
              <Input
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">Instagram</label>
              <Input
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-ink/10 bg-white p-5">
          <h2 className="font-display text-xl">Legal copy</h2>
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">
                Shipping page summary
              </label>
              <Textarea
                rows={3}
                value={form.shipping_summary}
                onChange={(e) => setForm({ ...form, shipping_summary: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">
                Privacy summary
              </label>
              <Textarea
                rows={3}
                value={form.privacy_summary}
                onChange={(e) => setForm({ ...form, privacy_summary: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">
                Terms summary
              </label>
              <Textarea
                rows={3}
                value={form.terms_summary}
                onChange={(e) => setForm({ ...form, terms_summary: e.target.value })}
              />
            </div>
          </div>
        </section>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {msg && <p className="text-sm text-emerald-700">{msg}</p>}
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save settings"}
        </Button>
      </form>
    </div>
  );
}
