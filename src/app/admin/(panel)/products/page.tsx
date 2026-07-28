import Link from "next/link";
import { redirect } from "next/navigation";
import { getStaffProfile, canAccess } from "@/lib/auth/staff";
import { createServiceClient } from "@/lib/supabase/server";
import { formatINR, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductRowActions } from "./product-actions";

type StockFilter = "all" | "in_stock" | "sold";
type StockSort = "newest" | "stock-asc" | "stock-desc";

function productsHref(opts: {
  category?: string;
  stock?: string;
  sort?: string;
}) {
  const params = new URLSearchParams();
  if (opts.category) params.set("category", opts.category);
  if (opts.stock && opts.stock !== "all") params.set("stock", opts.stock);
  if (opts.sort && opts.sort !== "newest") params.set("sort", opts.sort);
  const q = params.toString();
  return q ? `/admin/products?${q}` : "/admin/products";
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    stock?: string;
    sort?: string;
  }>;
}) {
  const staff = await getStaffProfile().catch(() => null);
  if (!staff) redirect("/admin/login");
  if (!canAccess(staff, "products")) redirect("/admin");

  const params = await searchParams;
  const categoryId = params.category || "";
  const stockFilter = (params.stock || "all") as StockFilter;
  const sort = (params.sort || "newest") as StockSort;

  const supabase = createServiceClient();
  const [{ data: categories }, { data: rawProducts }] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase
      .from("products")
      .select("*, category:categories(name)")
      .order("created_at", { ascending: false }),
  ]);

  let products = rawProducts ?? [];

  if (categoryId) {
    products = products.filter((p) => p.category_id === categoryId);
  }

  if (stockFilter === "sold") {
    products = products.filter((p) => Number(p.stock) <= 0);
  } else if (stockFilter === "in_stock") {
    products = products.filter((p) => Number(p.stock) > 0);
  }

  if (sort === "stock-asc") {
    products = [...products].sort(
      (a, b) => Number(a.stock) - Number(b.stock)
    );
  } else if (sort === "stock-desc") {
    products = [...products].sort(
      (a, b) => Number(b.stock) - Number(a.stock)
    );
  }

  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.12em] transition",
      active
        ? "border-ink bg-ink text-ivory"
        : "border-ink/15 text-ink/65 hover:border-ink/40"
    );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Products</h1>
          <p className="text-sm text-ink/55">
            Manage catalogue, pricing, stock and sales · {products.length} shown
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button>Add product</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mt-6 space-y-4 rounded-2xl border border-ink/10 bg-white p-4 sm:p-5">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.14em] text-ink/45">
            Category
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={productsHref({ stock: stockFilter, sort })}
              className={chip(!categoryId)}
            >
              All
            </Link>
            {(categories ?? []).map((c) => (
              <Link
                key={c.id}
                href={productsHref({
                  category: c.id,
                  stock: stockFilter,
                  sort,
                })}
                className={chip(categoryId === c.id)}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.14em] text-ink/45">
              Stock
            </p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["all", "All"],
                  ["in_stock", "In stock"],
                  ["sold", "Sold"],
                ] as const
              ).map(([value, label]) => (
                <Link
                  key={value}
                  href={productsHref({
                    category: categoryId || undefined,
                    stock: value,
                    sort,
                  })}
                  className={chip(stockFilter === value)}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.14em] text-ink/45">
              Sort by stock
            </p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["newest", "Newest"],
                  ["stock-asc", "Stock: Low → high"],
                  ["stock-desc", "Stock: High → low"],
                ] as const
              ).map(([value, label]) => (
                <Link
                  key={value}
                  href={productsHref({
                    category: categoryId || undefined,
                    stock: stockFilter,
                    sort: value,
                  })}
                  className={chip(sort === value)}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-ink/10 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-ink/10 bg-ivory/80 text-xs uppercase tracking-wider text-ink/50">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-ink/45">
                  No products match these filters.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-b border-ink/5">
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3 text-ink/60">
                    {(p.category as { name?: string } | null)?.name ?? "-"}
                  </td>
                  <td className="px-4 py-3">{formatINR(Number(p.price))}</td>
                  <td className="px-4 py-3">
                    {Number(p.stock) <= 0 ? (
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
                  <td className="px-4 py-3">
                    <ProductRowActions productId={p.id} title={p.title} />
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
