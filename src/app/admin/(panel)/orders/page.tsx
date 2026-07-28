import Link from "next/link";
import { redirect } from "next/navigation";
import { getStaffProfile, canAccess } from "@/lib/auth/staff";
import { createServiceClient } from "@/lib/supabase/server";
import { formatINR } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default async function AdminOrdersPage() {
  const staff = await getStaffProfile().catch(() => null);
  if (!staff) redirect("/admin/login");
  if (!canAccess(staff, "orders")) redirect("/admin");

  const supabase = createServiceClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const list = orders ?? [];

  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl">Orders</h1>
      <p className="text-sm text-ink/55">
        Customer details, products and fulfilment · {list.length} recent
      </p>

      {/* Mobile cards */}
      <div className="mt-5 space-y-3 md:hidden">
        {list.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink/15 px-4 py-10 text-center text-sm text-ink/50">
            No orders yet.
          </div>
        ) : (
          list.map((o) => (
            <Link
              key={o.id}
              href={`/admin/orders/${o.order_number}`}
              className="block rounded-2xl border border-ink/10 bg-white p-4 shadow-sm active:bg-ivory"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-sm font-semibold text-ink">
                    {o.order_number}
                  </p>
                  <p className="mt-1 truncate text-sm text-ink/70">
                    {o.customer_name}
                  </p>
                  <p className="text-xs text-ink/45">{o.customer_phone}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatINR(Number(o.total))}</p>
                  <p className="mt-1 text-[11px] capitalize text-ink/50">
                    {String(o.status).replaceAll("_", " ")}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-ink/8 pt-3 text-xs text-ink/50">
                <Badge
                  tone={
                    o.payment_status === "paid"
                      ? "success"
                      : o.payment_status === "failed"
                        ? "sold"
                        : "muted"
                  }
                >
                  {o.payment_method} · {o.payment_status}
                </Badge>
                <span>
                  {new Date(o.created_at).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="mt-8 hidden overflow-x-auto rounded-2xl border border-ink/10 bg-white md:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-ink/10 bg-ivory/80 text-xs uppercase tracking-wider text-ink/50">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-ink/45">
                  No orders yet.
                </td>
              </tr>
            ) : (
              list.map((o) => (
                <tr key={o.id} className="border-b border-ink/5">
                  <td className="px-4 py-3 font-medium">
                    <Link
                      href={`/admin/orders/${o.order_number}`}
                      className="hover:underline"
                    >
                      {o.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div>{o.customer_name}</div>
                    <div className="text-xs text-ink/45">{o.customer_phone}</div>
                  </td>
                  <td className="px-4 py-3 capitalize">
                    {o.payment_method} / {o.payment_status}
                  </td>
                  <td className="px-4 py-3 capitalize">
                    {String(o.status).replaceAll("_", " ")}
                  </td>
                  <td className="px-4 py-3">{formatINR(Number(o.total))}</td>
                  <td className="px-4 py-3 text-ink/55">
                    {new Date(o.created_at).toLocaleString("en-IN")}
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
