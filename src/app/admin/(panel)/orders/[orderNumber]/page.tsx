import { redirect, notFound } from "next/navigation";
import { getStaffProfile, canAccess } from "@/lib/auth/staff";
import { createServiceClient } from "@/lib/supabase/server";
import { formatINR } from "@/lib/utils";
import { OrderStatusForm } from "./status-form";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const staff = await getStaffProfile().catch(() => null);
  if (!staff) redirect("/admin/login");
  if (!canAccess(staff, "orders")) redirect("/admin");

  const supabase = createServiceClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("order_number", decodeURIComponent(orderNumber))
    .maybeSingle();

  if (!order) notFound();

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl">{order.order_number}</h1>
      <p className="mt-1 text-sm text-ink/55">
        Placed {new Date(order.created_at).toLocaleString("en-IN")}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-ink/10 bg-white p-5 text-sm">
          <h2 className="font-display text-xl">Customer</h2>
          <p className="mt-3 font-medium">{order.customer_name}</p>
          <p>{order.customer_phone}</p>
          <p>{order.customer_email}</p>
          <p className="mt-3 text-ink/70">
            {order.address_line1}
            {order.address_line2 ? `, ${order.address_line2}` : ""}
            <br />
            {order.city}, {order.state} {order.pincode}
            <br />
            {order.country}
          </p>
          {order.customer_note && (
            <p className="mt-3 rounded-xl bg-ivory px-3 py-2 text-ink/70">
              Note: {order.customer_note}
            </p>
          )}
        </div>
        <div className="rounded-2xl border border-ink/10 bg-white p-5 text-sm">
          <h2 className="font-display text-xl">Payment & status</h2>
          <p className="mt-3 capitalize">
            {order.payment_method} · {order.payment_status}
          </p>
          <OrderStatusForm
            orderId={order.id}
            status={order.status}
            paymentStatus={order.payment_status}
            adminNote={order.admin_note ?? ""}
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-5">
        <h2 className="font-display text-xl">Items</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {(order.items ?? []).map(
            (item: {
              id: string;
              product_title: string;
              quantity: number;
              unit_price: number;
              line_total: number;
            }) => (
              <li key={item.id} className="flex justify-between gap-3 border-b border-ink/5 py-2">
                <span>
                  {item.product_title} × {item.quantity} @ {formatINR(Number(item.unit_price))}
                </span>
                <span>{formatINR(Number(item.line_total))}</span>
              </li>
            )
          )}
        </ul>
        <div className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-ink/55">Subtotal</span>
            <span>{formatINR(Number(order.subtotal))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink/55">Discount {order.coupon_code ? `(${order.coupon_code})` : ""}</span>
            <span>−{formatINR(Number(order.discount_amount))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink/55">Shipping</span>
            <span>{formatINR(Number(order.shipping_fee))}</span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatINR(Number(order.total))}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
