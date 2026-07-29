"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Category, Product } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";

export function ProductForm({
  categories,
  product,
}: {
  categories: Category[];
  product?: Product;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [form, setForm] = useState({
    title: product?.title ?? "",
    slug: product?.slug ?? "",
    description: product?.description ?? "",
    size_info: product?.size_info ?? "",
    material_info: product?.material_info ?? "",
    care_notes: product?.care_notes ?? "",
    price: product?.price?.toString() ?? "",
    compare_at_price: product?.compare_at_price?.toString() ?? "",
    stock: product?.stock?.toString() ?? "0",
    low_stock_threshold: product?.low_stock_threshold?.toString() ?? "3",
    category_id: product?.category_id ?? "",
    is_active: product?.is_active ?? true,
    is_featured: product?.is_featured ?? false,
    sale_starts_at: product?.sale_starts_at?.slice(0, 16) ?? "",
    sale_ends_at: product?.sale_ends_at?.slice(0, 16) ?? "",
  });

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    try {
      const supabase = createClient();
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("products")
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("products").getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
      setImages((prev) => [...prev, ...uploaded]);
    } catch {
      setError("Image upload failed. Ensure storage bucket 'products' exists and you are logged in.");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      title: form.title.trim(),
      slug: (form.slug || slugify(form.title)).trim(),
      description: form.description,
      size_info: form.size_info.trim() || null,
      material_info: form.material_info.trim() || null,
      care_notes: form.care_notes.trim() || null,
      price: Number(form.price),
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      stock: Number(form.stock),
      low_stock_threshold: Number(form.low_stock_threshold),
      category_id: form.category_id || null,
      images,
      is_active: form.is_active,
      is_featured: form.is_featured,
      sale_starts_at: form.sale_starts_at ? new Date(form.sale_starts_at).toISOString() : null,
      sale_ends_at: form.sale_ends_at ? new Date(form.sale_ends_at).toISOString() : null,
    };

    try {
      const res = await fetch(product ? `/api/admin/products/${product.id}` : "/api/admin/products", {
        method: product ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Save failed");
        setLoading(false);
        return;
      }
      // Product saved (material/care may be skipped until DB migration is applied)
      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Save failed");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">Title *</label>
          <Input
            required
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
                slug: product ? form.slug : slugify(e.target.value),
              })
            }
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">Slug</label>
          <Input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">Category</label>
          <select
            className="flex h-11 w-full rounded-xl border border-ink/15 bg-white px-3.5 text-sm"
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
          >
            <option value="">Uncategorised</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">Description</label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={5}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">
            Size / measurement note (optional)
          </label>
          <Input
            value={form.size_info}
            onChange={(e) => setForm({ ...form, size_info: e.target.value })}
            placeholder="e.g. Chain length 16 inches + extender"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">
            Material (optional)
          </label>
          <Input
            value={form.material_info}
            onChange={(e) => setForm({ ...form, material_info: e.target.value })}
            placeholder="e.g. Gold-plated brass, anti-tarnish finish"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">
            Care notes (optional)
          </label>
          <Input
            value={form.care_notes}
            onChange={(e) => setForm({ ...form, care_notes: e.target.value })}
            placeholder="e.g. Avoid perfume and water. Wipe with a soft cloth."
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">
            Selling price (₹) *
          </label>
          <Input
            required
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">
            Compare-at / MRP (₹) - for sale strikethrough
          </label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={form.compare_at_price}
            onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })}
            placeholder="Leave blank if not on sale"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">Sale starts</label>
          <Input
            type="datetime-local"
            value={form.sale_starts_at}
            onChange={(e) => setForm({ ...form, sale_starts_at: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">Sale ends</label>
          <Input
            type="datetime-local"
            value={form.sale_ends_at}
            onChange={(e) => setForm({ ...form, sale_ends_at: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">Stock *</label>
          <Input
            required
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">
            Low stock alert at
          </label>
          <Input
            type="number"
            min="0"
            value={form.low_stock_threshold}
            onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">
          Images (multiple)
        </label>
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => uploadFiles(e.target.files)}
        />
        {images.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {images.map((src) => (
              <div key={src} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-20 w-16 rounded-lg object-cover" />
                <button
                  type="button"
                  className="absolute -right-1 -top-1 rounded-full bg-ink px-1.5 text-[10px] text-white"
                  onClick={() => setImages((prev) => prev.filter((i) => i !== src))}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-6 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />
          Live on storefront
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.is_featured}
            onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
          />
          Featured on home
        </label>
      </div>

      {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : product ? "Update product" : "Create product"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        {product && (
          <Button
            type="button"
            variant="danger"
            disabled={loading}
            onClick={async () => {
              if (
                !confirm(
                  `Delete "${product.title}"?\n\nThis cannot be undone.`
                )
              ) {
                return;
              }
              setLoading(true);
              const res = await fetch(`/api/admin/products/${product.id}`, {
                method: "DELETE",
              });
              if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(data.error || "Delete failed");
                setLoading(false);
                return;
              }
              router.push("/admin/products");
              router.refresh();
            }}
          >
            Delete product
          </Button>
        )}
      </div>
    </form>
  );
}
