import { Resend } from "resend";

export function getResendClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export function getFromAddress() {
  // Prefer verified domain sender. Falls back only if you set a Resend test sender.
  return (
    process.env.ORDER_FROM_EMAIL?.trim() ||
    "The Jewel Nest <support@thejewelnest.co.in>"
  );
}

export function getSupportEmail() {
  return (
    process.env.SUPPORT_EMAIL?.trim() ||
    process.env.ORDER_FROM_EMAIL?.trim()?.match(/<([^>]+)>/)?.[1] ||
    "support@thejewelnest.co.in"
  );
}

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}
