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
      "inline-flex min-h-9 items-center rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.1em] transition",
      active
        ? "border-ink bg-ink text-ivory"
        : "border-ink/15 text-ink/65 hover:border-ink/40"
    );

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl">Products</h1>
          <p className="text-sm text-ink/55">
            Catalogue · {products.length} shown
          </p>
        </div>
        <Link href="/admin/products/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">Add product</Button>
        </Link>
      </div>

      <div className="mt-5 space-y-4 rounded-2xl border border-ink/10 bg-white p-3 sm:p-5">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.14em] text-ink/45">
            Category
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link
              href={productsHref({ stock: stockFilter, sort })}
              className={cn(chip(!categoryId), "shrink-0")}
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
                className={cn(chip(categoryId === c.id), "shrink-0")}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
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
              Sort
            </p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["newest", "Newest"],
                  ["stock-asc", "Stock ↑"],
                  ["stock-desc", "Stock ↓"],
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

      {/* Mobile cards */}
      <div className="mt-5 space-y-3 md:hidden">
        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink/15 px-4 py-10 text-center text-sm text-ink/50">
            No products match these filters.
          </div>
        ) : (
          products.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-ink/10 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium leading-snug text-ink">{p.title}</p>
                  <p className="mt-1 text-xs text-ink/50">
                    {(p.category as { name?: string } | null)?.name ??
                      "Uncategorised"}
                  </p>
                </div>
                {Number(p.stock) <= 0 ? (
                  <Badge tone="sold">Sold</Badge>
                ) : p.is_active ? (
                  <Badge tone="success">Live</Badge>
                ) : (
                  <Badge tone="muted">Draft</Badge>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold">{formatINR(Number(p.price))}</span>
                <span className="text-ink/55">
                  Stock: {Number(p.stock) <= 0 ? "0" : p.stock}
                </span>
              </div>
              <div className="mt-3 border-t border-ink/8 pt-3">
                <ProductRowActions productId={p.id} title={p.title} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="mt-6 hidden overflow-x-auto rounded-2xl border border-ink/10 bg-white md:block">
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
