import { redirect } from "next/navigation";
import { getStaffProfile, canAccess } from "@/lib/auth/staff";
import { createServiceClient, hasServiceRole } from "@/lib/supabase/server";
import { formatINR } from "@/lib/utils";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const staff = await getStaffProfile().catch(() => null);
  if (!staff) redirect("/admin/login");
  if (!canAccess(staff, "dashboard")) redirect("/admin/orders");

  let revenue = 0;
  let orderCount = 0;
  let lowStock = 0;
  let unread = 0;
  let recent: { order_number: string; total: number; status: string; created_at: string }[] = [];

  if (hasServiceRole()) {
    const supabase = createServiceClient();
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const { data: orders } = await supabase
      .from("orders")
      .select("order_number, total, status, payment_status, created_at")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false });

    const paidLike = (orders ?? []).filter(
      (o) =>
        o.status !== "cancelled" &&
        o.status !== "refunded" &&
        o.status !== "pending_payment"
    );
    revenue = paidLike.reduce((s, o) => s + Number(o.total), 0);
    orderCount = paidLike.length;
    recent = (orders ?? []).slice(0, 8).map((o) => ({
      order_number: o.order_number,
      total: Number(o.total),
      status: o.status,
      created_at: o.created_at,
    }));

    const { count: lowCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .gt("stock", 0)
      .lte("stock", 3);

    const { count: outCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("stock", 0);

    lowStock = (lowCount ?? 0) + (outCount ?? 0);

    const { count: unreadCount } = await supabase
      .from("admin_notifications")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false);
    unread = unreadCount ?? 0;
  }

  const cards = [
    { label: "Revenue (30d)", value: formatINR(revenue) },
    { label: "Orders (30d)", value: String(orderCount) },
    { label: "Low / sold stock", value: String(lowStock) },
    { label: "Unread alerts", value: String(unread) },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl">Dashboard</h1>
      <p className="mt-1 text-sm text-ink/55">Welcome back, {staff.full_name}.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm"
          >
            <p className="text-xs uppercase tracking-[0.14em] text-ink/45">{c.label}</p>
            <p className="mt-2 font-display text-3xl text-ink">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm text-ink/60 hover:text-ink">
            View all
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-ivory/80 text-xs uppercase tracking-wider text-ink/50">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-ink/45">
                    No orders yet. Connect Supabase and publish products to go live.
                  </td>
                </tr>
              ) : (
                recent.map((o) => (
                  <tr key={o.order_number} className="border-b border-ink/5">
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/admin/orders/${o.order_number}`} className="hover:underline">
                        {o.order_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 capitalize">{o.status.replaceAll("_", " ")}</td>
                    <td className="px-4 py-3">{formatINR(o.total)}</td>
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
    </div>
  );
}
