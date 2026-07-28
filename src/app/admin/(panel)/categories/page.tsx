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

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not load categories");
      return;
    }
    setCategories(data.categories ?? []);
    setError(null);
  }

  useEffect(() => {
    load().catch(() =>
      setError("Could not load categories. Sign in and check Supabase.")
    );
  }, []);

  async function createCategory(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        slug: slugify(name),
        description: description.trim() || null,
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

  function startEdit(cat: Cat) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditDescription(cat.description ?? "");
    setEditSlug(cat.slug);
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
    setEditSlug("");
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setEditLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/categories/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName.trim(),
        slug: editSlug.trim() || slugify(editName),
        description: editDescription.trim(),
        syncSlug: false,
      }),
    });
    const data = await res.json();
    setEditLoading(false);
    if (!res.ok) {
      setError(data.error || "Update failed");
      return;
    }
    cancelEdit();
    await load();
  }

  async function toggleActive(cat: Cat) {
    setError(null);
    const res = await fetch(`/api/admin/categories/${cat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !cat.is_active }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Could not update status");
      return;
    }
    await load();
  }

  async function deleteCategory(cat: Cat) {
    if (
      !confirm(
        `Delete category "${cat.name}"?\n\nProducts in this category will become uncategorised (not deleted).`
      )
    ) {
      return;
    }
    setError(null);
    const res = await fetch(`/api/admin/categories/${cat.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Could not delete category");
      return;
    }
    if (editingId === cat.id) cancelEdit();
    await load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl">Categories</h1>
      <p className="text-sm text-ink/55">
        Create, edit, hide, or delete product groups for the shop
      </p>

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
        {error && !editingId && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Create category"}
        </Button>
      </form>

      {editingId && (
        <form
          onSubmit={saveEdit}
          className="mt-6 max-w-xl space-y-3 rounded-2xl border border-gold/40 bg-gold/5 p-5"
        >
          <h2 className="font-display text-xl">Edit category</h2>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">
              Name
            </label>
            <Input
              required
              value={editName}
              onChange={(e) => {
                setEditName(e.target.value);
                setEditSlug(slugify(e.target.value));
              }}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">
              Slug (URL)
            </label>
            <Input
              required
              value={editSlug}
              onChange={(e) => setEditSlug(slugify(e.target.value))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-ink/50">
              Description
            </label>
            <Textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
          </div>
          {error && editingId && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={editLoading}>
              {editLoading ? "Saving..." : "Save changes"}
            </Button>
            <Button type="button" variant="secondary" onClick={cancelEdit}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="mt-8 overflow-x-auto rounded-2xl border border-ink/10 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-ink/10 bg-ivory/80 text-xs uppercase tracking-wider text-ink/50">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-ink/45">
                  No categories yet.
                </td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr
                  key={c.id}
                  className={
                    editingId === c.id
                      ? "border-b border-ink/5 bg-gold/5"
                      : "border-b border-ink/5"
                  }
                >
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-ink/55">{c.slug}</td>
                  <td className="px-4 py-3">
                    {c.is_active ? "Active" : "Hidden"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-wrap items-center justify-end gap-3 text-xs uppercase tracking-wider">
                      <button
                        type="button"
                        className="text-ink/60 hover:text-ink"
                        onClick={() => startEdit(c)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-ink/60 hover:text-ink"
                        onClick={() => toggleActive(c)}
                      >
                        {c.is_active ? "Hide" : "Show"}
                      </button>
                      <button
                        type="button"
                        className="text-red-600/80 hover:text-red-700"
                        onClick={() => deleteCategory(c)}
                      >
                        Delete
                      </button>
                    </div>
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
