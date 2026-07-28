import { getSiteConfig } from "@/lib/settings";

export const metadata = { title: "Shipping" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ShippingPage() {
  const { commerce, policies } = await getSiteConfig();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl text-ink">Shipping</h1>
      <div className="prose-nest mt-6">
        <p>{policies.shipping_summary}</p>
        <h2>Rates</h2>
        <ul className="list-disc space-y-2 pl-5 text-ink/70">
          <li>
            Orders{" "}
            <strong className="text-ink">
              ₹{commerce.free_shipping_threshold} and above
            </strong>
            : free shipping
          </li>
          <li>
            Orders below ₹{commerce.free_shipping_threshold}: flat{" "}
            <strong className="text-ink">₹{commerce.shipping_fee}</strong>
          </li>
          <li>
            Serviceable region:{" "}
            <strong className="text-ink">{commerce.service_region} only</strong>{" "}
            (not international yet)
          </li>
        </ul>
        <h2>Payment</h2>
        <p>
          {commerce.allow_razorpay
            ? "We accept secure online payments via Razorpay (UPI, cards, netbanking and wallets)."
            : "Online payment options will be confirmed at checkout."}
          {commerce.allow_cod
            ? ` Cash on Delivery is available for orders of at least ₹${commerce.cod_min_order}.`
            : " Cash on Delivery is not available at this time."}
        </p>
        <h2>Timelines</h2>
        <p>
          Most orders dispatch within 1-3 business days. Delivery usually takes
          4-10 business days depending on your pincode and courier partners. You
          will receive updates on the contact details shared at checkout.
        </p>
      </div>
    </div>
  );
}
