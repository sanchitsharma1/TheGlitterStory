"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ReviewRow = {
  id: string;
  customer_name: string;
  rating: number;
  body: string;
  is_approved: boolean;
  product_id: string | null;
  created_at: string;
};

type ProductOpt = { id: string; title: string };

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [products, setProducts] = useState<ProductOpt[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customer_name: "",
    rating: "5",
    body: "",
    product_id: "",
    is_approved: true,
  });

  async function load() {
    const res = await fetch("/api/admin/reviews");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not load reviews (run SQL migration if table is missing)");
      return;
    }
    setReviews(data.reviews ?? []);
    setProducts(data.products ?? []);
    setError(null);
  }

  useEffect(() => {
    load().catch(() => setError("Could not load reviews"));
  }, []);

  async function createReview(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setError(null);
    const res = await fetch("/api/admin/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_name: form.customer_name.trim(),
        rating: Number(form.rating),
        body: form.body.trim(),
        product_id: form.product_id || null,
        is_approved: form.is_approved,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed to create");
      return;
    }
    setMsg("Review saved");
    setForm({
      customer_name: "",
      rating: "5",
      body: "",
      product_id: "",
      is_approved: true,
    });
    await load();
  }

  async function toggleApprove(r: ReviewRow) {
    await fetch(`/api/admin/reviews/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_approved: !r.is_approved }),
    });
    await load();
  }

  async function remove(r: ReviewRow) {
    if (!confirm("Delete this review?")) return;
    await fetch(`/api/admin/reviews/${r.id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl">Reviews</h1>
      <p className="text-sm text-ink/55">
        Manual reviews shown on the storefront when approved. Leave product empty for
        homepage-only quotes.
      </p>

      <form
        onSubmit={createReview}
        className="mt-8 max-w-2xl space-y-3 rounded-2xl border border-ink/10 bg-white p-5"
      >
        <h2 className="font-display text-xl">Add review</h2>
        <Input
          required
          placeholder="Customer name"
          value={form.customer_name}
          onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
        />
        <select
          className="h-11 w-full rounded-xl border border-ink/15 px-3 text-sm"
          value={form.rating}
          onChange={(e) => setForm({ ...form, rating: e.target.value })}
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} stars
            </option>
          ))}
        </select>
        <Textarea
          required
          placeholder="Review text"
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          rows={3}
        />
        <select
          className="h-11 w-full rounded-xl border border-ink/15 px-3 text-sm"
          value={form.product_id}
          onChange={(e) => setForm({ ...form, product_id: e.target.value })}
        >
          <option value="">Homepage / general (no product)</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_approved}
            onChange={(e) => setForm({ ...form, is_approved: e.target.checked })}
          />
          Approved (visible on site)
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {msg && <p className="text-sm text-emerald-700">{msg}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save review"}
        </Button>
      </form>

      <div className="mt-8 overflow-hidden rounded-2xl border border-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-ivory/80 text-xs uppercase tracking-wider text-ink/50">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Body</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink/45">
                  No reviews yet.
                </td>
              </tr>
            ) : (
              reviews.map((r) => (
                <tr key={r.id} className="border-b border-ink/5">
                  <td className="px-4 py-3 font-medium">{r.customer_name}</td>
                  <td className="px-4 py-3">{r.rating}★</td>
                  <td className="max-w-xs px-4 py-3 text-ink/70">
                    <span className="line-clamp-2">{r.body}</span>
                  </td>
                  <td className="px-4 py-3">
                    {r.is_approved ? "Live" : "Hidden"}
                  </td>
                  <td className="space-x-3 px-4 py-3 text-right text-xs uppercase tracking-wider">
                    <button
                      type="button"
                      className="text-ink/60 hover:text-ink"
                      onClick={() => toggleApprove(r)}
                    >
                      {r.is_approved ? "Hide" : "Approve"}
                    </button>
                    <button
                      type="button"
                      className="text-red-600/80 hover:text-red-700"
                      onClick={() => remove(r)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
