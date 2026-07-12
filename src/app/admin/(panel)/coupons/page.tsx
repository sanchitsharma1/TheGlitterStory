"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Coupon = {
  id: string;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  scope: "all" | "category" | "product";
  category_id: string | null;
  product_id: string | null;
  min_order_value: number;
  max_uses: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
};

type Option = { id: string; name?: string; title?: string };

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);
  const [products, setProducts] = useState<Option[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discount_type: "percent" as "percent" | "fixed",
    discount_value: "10",
    scope: "all" as "all" | "category" | "product",
    category_id: "",
    product_id: "",
    min_order_value: "0",
    max_uses: "",
    starts_at: "",
    expires_at: "",
    is_active: true,
  });

  async function load() {
    const res = await fetch("/api/admin/coupons");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to load");
      return;
    }
    setCoupons(data.coupons ?? []);
    setCategories(data.categories ?? []);
    setProducts(data.products ?? []);
  }

  useEffect(() => {
    load().catch(() => setError("Could not load coupons"));
  }, []);

  async function createCoupon(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const payload = {
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      scope: form.scope,
      category_id: form.scope === "category" ? form.category_id : null,
      product_id: form.scope === "product" ? form.product_id : null,
      min_order_value: Number(form.min_order_value || 0),
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      is_active: form.is_active,
    };
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    setForm({
      ...form,
      code: "",
      discount_value: "10",
      max_uses: "",
    });
    await load();
  }

  async function toggle(coupon: Coupon) {
    await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !coupon.is_active }),
    });
    await load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl">Coupons</h1>
      <p className="text-sm text-ink/55">
        Code, discount, scope (all / category / product), validity & usage limits
      </p>

      <form
        onSubmit={createCoupon}
        className="mt-8 grid max-w-3xl gap-3 rounded-2xl border border-ink/10 bg-white p-5 sm:grid-cols-2"
      >
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">Code *</label>
          <Input
            required
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="WELCOME10"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">Type</label>
          <select
            className="h-11 w-full rounded-xl border border-ink/15 px-3 text-sm"
            value={form.discount_type}
            onChange={(e) =>
              setForm({ ...form, discount_type: e.target.value as "percent" | "fixed" })
            }
          >
            <option value="percent">Percent off</option>
            <option value="fixed">Fixed ₹ off</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">Value *</label>
          <Input
            required
            type="number"
            min="0.01"
            step="0.01"
            value={form.discount_value}
            onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">Applies to</label>
          <select
            className="h-11 w-full rounded-xl border border-ink/15 px-3 text-sm"
            value={form.scope}
            onChange={(e) =>
              setForm({ ...form, scope: e.target.value as "all" | "category" | "product" })
            }
          >
            <option value="all">Entire cart</option>
            <option value="category">Specific category</option>
            <option value="product">Specific product</option>
          </select>
        </div>
        {form.scope === "category" && (
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">Category</label>
            <select
              required
              className="h-11 w-full rounded-xl border border-ink/15 px-3 text-sm"
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            >
              <option value="">Select</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {form.scope === "product" && (
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">Product</label>
            <select
              required
              className="h-11 w-full rounded-xl border border-ink/15 px-3 text-sm"
              value={form.product_id}
              onChange={(e) => setForm({ ...form, product_id: e.target.value })}
            >
              <option value="">Select</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">Min order ₹</label>
          <Input
            type="number"
            min="0"
            value={form.min_order_value}
            onChange={(e) => setForm({ ...form, min_order_value: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">Max uses</label>
          <Input
            type="number"
            min="1"
            value={form.max_uses}
            onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
            placeholder="Unlimited"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">Starts</label>
          <Input
            type="datetime-local"
            value={form.starts_at}
            onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">Expires</label>
          <Input
            type="datetime-local"
            value={form.expires_at}
            onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
          />
        </div>
        {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}
        <div className="sm:col-span-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create coupon"}
          </Button>
        </div>
      </form>

      <div className="mt-8 overflow-hidden rounded-2xl border border-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-ivory/80 text-xs uppercase tracking-wider text-ink/50">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Scope</th>
              <th className="px-4 py-3">Usage</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b border-ink/5">
                <td className="px-4 py-3 font-mono font-medium">{c.code}</td>
                <td className="px-4 py-3">
                  {c.discount_type === "percent"
                    ? `${c.discount_value}%`
                    : `₹${c.discount_value}`}
                </td>
                <td className="px-4 py-3 capitalize">{c.scope}</td>
                <td className="px-4 py-3">
                  {c.used_count}
                  {c.max_uses !== null ? ` / ${c.max_uses}` : ""}
                </td>
                <td className="px-4 py-3">{c.is_active ? "Active" : "Off"}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    className="text-xs uppercase tracking-wider text-ink/60"
                    onClick={() => toggle(c)}
                  >
                    {c.is_active ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
