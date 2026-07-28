"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProductDeleteButton({
  productId,
  title,
}: {
  productId: string;
  title: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (
      !confirm(
        `Delete "${title}"?\n\nThis cannot be undone. Orders that already include this product will keep a snapshot of the name.`
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "Could not delete product");
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      alert("Could not delete product");
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={loading}
      className="inline-flex min-h-10 items-center rounded-full border border-red-200 px-4 text-xs uppercase tracking-wider text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {loading ? "…" : "Delete"}
    </button>
  );
}

export function ProductRowActions({
  productId,
  title,
}: {
  productId: string;
  title: string;
}) {
  return (
    <div className="flex items-center justify-end gap-2 sm:gap-3">
      <Link
        href={`/admin/products/${productId}`}
        className="inline-flex min-h-10 items-center rounded-full border border-ink/15 px-4 text-xs uppercase tracking-wider text-ink/70 hover:border-ink/40 hover:text-ink"
      >
        Edit
      </Link>
      <ProductDeleteButton productId={productId} title={title} />
    </div>
  );
}
