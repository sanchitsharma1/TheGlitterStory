import type { Order, OrderItem } from "@/types";
import {
  getFromAddress,
  getResendClient,
  getSupportEmail,
  isEmailConfigured,
} from "@/lib/email/client";
import {
  adminNewOrderEmail,
  orderConfirmationEmail,
  orderStatusEmail,
} from "@/lib/email/templates";

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://thejewelnest.co.in"
  );
}

/**
 * Sends customer confirmation + admin notification.
 * Never throws to the checkout path - logs and returns result.
 */
export async function sendOrderPlacedEmails(
  order: Order,
  items: OrderItem[]
): Promise<{ customer: boolean; admin: boolean; skipped: boolean; error?: string }> {
  if (!isEmailConfigured()) {
    return { customer: false, admin: false, skipped: true };
  }

  const resend = getResendClient();
  if (!resend) {
    return { customer: false, admin: false, skipped: true };
  }

  const from = getFromAddress();
  const support = getSupportEmail();
  let customerOk = false;
  let adminOk = false;
  let lastError: string | undefined;

  try {
    const customer = orderConfirmationEmail(order, items, siteUrl());
    const { error } = await resend.emails.send({
      from,
      to: order.customer_email,
      replyTo: support,
      subject: customer.subject,
      html: customer.html,
    });
    if (error) lastError = error.message;
    else customerOk = true;
  } catch (e) {
    lastError = e instanceof Error ? e.message : "Customer email failed";
  }

  try {
    const admin = adminNewOrderEmail(order, items);
    const { error } = await resend.emails.send({
      from,
      to: support,
      replyTo: order.customer_email,
      subject: admin.subject,
      html: admin.html,
    });
    if (error) lastError = error.message;
    else adminOk = true;
  } catch (e) {
    lastError = e instanceof Error ? e.message : "Admin email failed";
  }

  return {
    customer: customerOk,
    admin: adminOk,
    skipped: false,
    error: lastError,
  };
}

export async function sendOrderStatusEmail(
  order: Order,
  status: string
): Promise<{ ok: boolean; skipped: boolean; error?: string }> {
  if (!isEmailConfigured()) {
    return { ok: false, skipped: true };
  }

  const resend = getResendClient();
  if (!resend) return { ok: false, skipped: true };

  // Only email meaningful customer-facing status changes
  const notifyStatuses = new Set([
    "confirmed",
    "packed",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ]);
  if (!notifyStatuses.has(status)) {
    return { ok: false, skipped: true };
  }

  const label = status.replaceAll("_", " ");
  const mail = orderStatusEmail(order, label);

  try {
    const { error } = await resend.emails.send({
      from: getFromAddress(),
      to: order.customer_email,
      replyTo: getSupportEmail(),
      subject: mail.subject,
      html: mail.html,
    });
    if (error) return { ok: false, skipped: false, error: error.message };
    return { ok: true, skipped: false };
  } catch (e) {
    return {
      ok: false,
      skipped: false,
      error: e instanceof Error ? e.message : "Status email failed",
    };
  }
}
