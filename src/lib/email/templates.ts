import { formatINR } from "@/lib/utils";
import type { Order, OrderItem } from "@/types";

function money(n: number) {
  return formatINR(Number(n));
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function layout(title: string, body: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f7f3ea;color:#1a1a1a;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f3ea;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border:1px solid #e8e0d0;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:#1a1a1a;padding:22px 28px;text-align:center;">
              <div style="font-size:20px;letter-spacing:0.12em;color:#f7f3ea;">THE JEWEL NEST</div>
              <div style="margin-top:6px;font-size:11px;letter-spacing:0.18em;color:#c9a227;font-family:Arial,sans-serif;">MODERN JEWELLERY</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px 28px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#777;border-top:1px solid #efe8da;">
              Questions? Reply to this email or write to support@thejewelnest.co.in<br/>
              Instagram: @thejewel_nest<br/>
              thejewelnest.co.in
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function orderConfirmationEmail(
  order: Order,
  items: OrderItem[],
  siteUrl: string
) {
  const lines = items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #f0ebe0;">${escapeHtml(i.product_title)} × ${i.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0ebe0;text-align:right;">${money(i.line_total)}</td>
        </tr>`
    )
    .join("");

  const paymentLabel =
    order.payment_method === "cod"
      ? "Cash on Delivery"
      : `Online (${order.payment_status})`;

  const body = `
    <p style="margin:0 0 12px;font-size:18px;">Thank you, ${escapeHtml(order.customer_name)}.</p>
    <p style="margin:0 0 18px;color:#555;">Your order is confirmed. Save your Order ID for tracking and support.</p>
    <div style="background:#f7f3ea;border-radius:12px;padding:14px 16px;margin-bottom:20px;">
      <div style="font-size:11px;letter-spacing:0.12em;color:#888;text-transform:uppercase;">Order ID</div>
      <div style="font-size:20px;font-weight:700;letter-spacing:0.04em;margin-top:4px;">${escapeHtml(order.order_number)}</div>
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:16px;">
      ${lines}
    </table>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:18px;font-size:14px;">
      <tr><td style="padding:4px 0;color:#666;">Subtotal</td><td style="text-align:right;">${money(order.subtotal)}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">Discount${order.coupon_code ? ` (${escapeHtml(order.coupon_code)})` : ""}</td><td style="text-align:right;">-${money(order.discount_amount)}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">Shipping</td><td style="text-align:right;">${Number(order.shipping_fee) === 0 ? "Free" : money(order.shipping_fee)}</td></tr>
      <tr><td style="padding:10px 0 0;font-weight:700;">Total</td><td style="padding:10px 0 0;text-align:right;font-weight:700;">${money(order.total)}</td></tr>
    </table>
    <p style="margin:0 0 8px;"><strong>Payment:</strong> ${escapeHtml(paymentLabel)}</p>
    <p style="margin:0 0 8px;"><strong>Ship to:</strong><br/>
      ${escapeHtml(order.address_line1)}${order.address_line2 ? `, ${escapeHtml(order.address_line2)}` : ""}<br/>
      ${escapeHtml(order.city)}, ${escapeHtml(order.state)} ${escapeHtml(order.pincode)}<br/>
      ${escapeHtml(order.country)}
    </p>
    <p style="margin:18px 0 0;">
      <a href="${escapeHtml(`${siteUrl}/order/${encodeURIComponent(order.order_number)}`)}"
         style="display:inline-block;background:#1a1a1a;color:#f7f3ea;text-decoration:none;padding:12px 18px;border-radius:999px;font-size:13px;letter-spacing:0.06em;">
        View order
      </a>
    </p>
  `;

  return {
    subject: `Order confirmed - ${order.order_number} | The Jewel Nest`,
    html: layout(`Order ${order.order_number}`, body),
  };
}

export function adminNewOrderEmail(order: Order, items: OrderItem[]) {
  const lines = items
    .map((i) => `• ${i.product_title} × ${i.quantity} = ${money(i.line_total)}`)
    .join("<br/>");

  const body = `
    <p style="margin:0 0 12px;">New order received.</p>
    <p style="margin:0 0 8px;"><strong>Order ID:</strong> ${escapeHtml(order.order_number)}</p>
    <p style="margin:0 0 8px;"><strong>Customer:</strong> ${escapeHtml(order.customer_name)}</p>
    <p style="margin:0 0 8px;"><strong>Phone:</strong> ${escapeHtml(order.customer_phone)}</p>
    <p style="margin:0 0 8px;"><strong>Email:</strong> ${escapeHtml(order.customer_email)}</p>
    <p style="margin:0 0 8px;"><strong>Payment:</strong> ${escapeHtml(order.payment_method)} / ${escapeHtml(order.payment_status)}</p>
    <p style="margin:0 0 8px;"><strong>Total:</strong> ${money(order.total)}</p>
    <p style="margin:12px 0 0;">${lines}</p>
    <p style="margin:16px 0 0;color:#666;">Open Admin → Orders to update status.</p>
  `;

  return {
    subject: `New order ${order.order_number} - ${money(order.total)}`,
    html: layout(`New order ${order.order_number}`, body),
  };
}

export function orderStatusEmail(order: Order, statusLabel: string) {
  const body = `
    <p style="margin:0 0 12px;">Hi ${escapeHtml(order.customer_name)},</p>
    <p style="margin:0 0 12px;">An update on your order <strong>${escapeHtml(order.order_number)}</strong>:</p>
    <div style="background:#f7f3ea;border-radius:12px;padding:14px 16px;margin-bottom:16px;">
      <div style="font-size:11px;letter-spacing:0.12em;color:#888;text-transform:uppercase;">Status</div>
      <div style="font-size:18px;font-weight:700;margin-top:4px;text-transform:capitalize;">${escapeHtml(statusLabel)}</div>
    </div>
    <p style="margin:0;color:#555;">If you have questions, reply to this email with your Order ID.</p>
  `;

  return {
    subject: `Order update - ${order.order_number} is ${statusLabel} | The Jewel Nest`,
    html: layout(`Order update ${order.order_number}`, body),
  };
}
