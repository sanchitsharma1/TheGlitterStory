import crypto from "crypto";
import Razorpay from "razorpay";

export function getRazorpayKeys() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!keyId || !keySecret) {
    return null;
  }
  return { keyId, keySecret };
}

export function createRazorpayClient() {
  const keys = getRazorpayKeys();
  if (!keys) {
    throw new Error("Razorpay is not configured");
  }
  return {
    keys,
    client: new Razorpay({
      key_id: keys.keyId,
      key_secret: keys.keySecret,
    }),
  };
}

/** Constant-time signature check (prevents timing attacks). */
export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
  secret: string;
}): boolean {
  const payload = `${params.orderId}|${params.paymentId}`;
  const expected = crypto
    .createHmac("sha256", params.secret)
    .update(payload)
    .digest("hex");

  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(params.signature, "utf8");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function rupeesToPaise(amountInr: number): number {
  return Math.round(Number(amountInr) * 100);
}
