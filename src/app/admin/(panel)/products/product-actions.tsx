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
      className="text-xs uppercase tracking-wider text-red-600/80 hover:text-red-700 disabled:opacity-50"
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
    <div className="flex items-center justify-end gap-3">
      <Link
        href={`/admin/products/${productId}`}
        className="text-xs uppercase tracking-wider text-ink/60 hover:text-ink"
      >
        Edit
      </Link>
      <ProductDeleteButton productId={productId} title={title} />
    </div>
  );
}
