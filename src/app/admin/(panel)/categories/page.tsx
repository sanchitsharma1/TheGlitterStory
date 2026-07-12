"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/utils";

type Cat = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Cat[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCategories(data.categories ?? []);
  }

  useEffect(() => {
    load().catch(() => setError("Could not load categories. Sign in and check Supabase."));
  }, []);

  async function createCategory(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        slug: slugify(name),
        description,
        is_active: true,
        sort_order: categories.length,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    setName("");
    setDescription("");
    await load();
  }

  async function toggleActive(cat: Cat) {
    await fetch(`/api/admin/categories/${cat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !cat.is_active }),
    });
    await load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl">Categories</h1>
      <p className="text-sm text-ink/55">Group products for the shop filters</p>

      <form
        onSubmit={createCategory}
        className="mt-8 max-w-xl space-y-3 rounded-2xl border border-ink/10 bg-white p-5"
      >
        <h2 className="font-display text-xl">New category</h2>
        <Input
          required
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Create category"}
        </Button>
      </form>

      <div className="mt-8 overflow-hidden rounded-2xl border border-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-ivory/80 text-xs uppercase tracking-wider text-ink/50">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-ink/5">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-ink/55">{c.slug}</td>
                <td className="px-4 py-3">{c.is_active ? "Active" : "Hidden"}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    className="text-xs uppercase tracking-wider text-ink/60 hover:text-ink"
                    onClick={() => toggleActive(c)}
                  >
                    {c.is_active ? "Hide" : "Show"}
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
