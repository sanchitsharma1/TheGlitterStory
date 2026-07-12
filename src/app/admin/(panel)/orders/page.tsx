import Link from "next/link";
import { redirect } from "next/navigation";
import { getStaffProfile, canAccess } from "@/lib/auth/staff";
import { createServiceClient } from "@/lib/supabase/server";
import { formatINR } from "@/lib/utils";

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

  return (
    <div>
      <h1 className="font-display text-3xl">Orders</h1>
      <p className="text-sm text-ink/55">Customer details, products & fulfilment status</p>

      <div className="mt-8 overflow-hidden rounded-2xl border border-ink/10 bg-white">
        <table className="w-full text-left text-sm">
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
            {(orders ?? []).length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-ink/45">
                  No orders yet.
                </td>
              </tr>
            ) : (
              (orders ?? []).map((o) => (
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
