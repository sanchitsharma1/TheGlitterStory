import Link from "next/link";
import { redirect } from "next/navigation";
import { getStaffProfile, canAccess } from "@/lib/auth/staff";
import { createServiceClient } from "@/lib/supabase/server";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function AdminProductsPage() {
  const staff = await getStaffProfile().catch(() => null);
  if (!staff) redirect("/admin/login");
  if (!canAccess(staff, "products")) redirect("/admin");

  const supabase = createServiceClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, category:categories(name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Products</h1>
          <p className="text-sm text-ink/55">Manage catalogue, pricing, stock & sale prices</p>
        </div>
        <Link href="/admin/products/new">
          <Button>Add product</Button>
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-ivory/80 text-xs uppercase tracking-wider text-ink/50">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(products ?? []).length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-ink/45">
                  No products yet. Create your first piece.
                </td>
              </tr>
            ) : (
              (products ?? []).map((p) => (
                <tr key={p.id} className="border-b border-ink/5">
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3 text-ink/60">
                    {(p.category as { name?: string } | null)?.name ?? "-"}
                  </td>
                  <td className="px-4 py-3">{formatINR(Number(p.price))}</td>
                  <td className="px-4 py-3">
                    {p.stock <= 0 ? (
                      <Badge tone="sold">Sold</Badge>
                    ) : (
                      p.stock
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {p.is_active ? (
                      <Badge tone="success">Live</Badge>
                    ) : (
                      <Badge tone="muted">Draft</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="text-xs uppercase tracking-wider text-ink/60 hover:text-ink"
                    >
                      Edit
                    </Link>
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
