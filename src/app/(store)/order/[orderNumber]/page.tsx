import Link from "next/link";
import { getOrderByNumber } from "@/lib/commerce/checkout";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(decodeURIComponent(orderNumber));

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Order not found</h1>
        <p className="mt-2 text-sm text-ink/55">
          Check your order ID or contact us with your phone number.
        </p>
        <Link href="/shop" className="mt-6 inline-block">
          <Button>Back to shop</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark sm:text-[13px]">
        Thank you
      </p>
      <h1 className="mt-2 font-display text-4xl text-ink">Order confirmed</h1>
      <p className="mt-3 text-[15px] text-ink/60">
        Save your order ID. We will email updates to{" "}
        <strong className="text-ink">{order.customer_email}</strong>
        {" "}(order confirmation, shipped, delivered - check spam if nothing arrives).
        For help, write to support@thejewelnest.co.in with your Order ID.
      </p>

      <div className="mt-8 rounded-2xl border border-ink/10 bg-white/80 p-6">
        <p className="text-sm uppercase tracking-[0.14em] text-ink/45">Order ID</p>
        <p className="mt-1 font-mono text-xl font-semibold tracking-wide text-ink">
          {order.order_number}
        </p>

        <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-ink/45">Status</p>
            <p className="font-medium capitalize">{order.status.replaceAll("_", " ")}</p>
          </div>
          <div>
            <p className="text-ink/45">Payment</p>
            <p className="font-medium capitalize">
              {order.payment_method} / {order.payment_status}
            </p>
          </div>
          <div>
            <p className="text-ink/45">Ship to</p>
            <p className="font-medium">
              {order.customer_name}
              <br />
              {order.address_line1}
              {order.address_line2 ? `, ${order.address_line2}` : ""}
              <br />
              {order.city}, {order.state} {order.pincode}
            </p>
          </div>
          <div>
            <p className="text-ink/45">Contact</p>
            <p className="font-medium">
              {order.customer_phone}
              <br />
              {order.customer_email}
            </p>
          </div>
        </div>

        {order.items && order.items.length > 0 && (
          <ul className="mt-6 space-y-2 border-t border-ink/10 pt-4 text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3">
                <span>
                  {item.product_title} × {item.quantity}
                </span>
                <span>{formatINR(Number(item.line_total))}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 space-y-1 border-t border-ink/10 pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-ink/55">Subtotal</span>
            <span>{formatINR(Number(order.subtotal))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink/55">Discount</span>
            <span>−{formatINR(Number(order.discount_amount))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink/55">Shipping</span>
            <span>
              {Number(order.shipping_fee) === 0
                ? "Free"
                : formatINR(Number(order.shipping_fee))}
            </span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatINR(Number(order.total))}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/shop">
          <Button>Continue shopping</Button>
        </Link>
        <Link href="/contact">
          <Button variant="secondary">Need help?</Button>
        </Link>
      </div>
    </div>
  );
}
