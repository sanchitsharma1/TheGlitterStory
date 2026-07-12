import { getSiteConfig } from "@/lib/settings";

export const metadata = { title: "Returns" };

export default async function ReturnsPage() {
  const { returns } = await getSiteConfig();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl text-ink">Returns &amp; exchanges</h1>
      <div className="prose-nest mt-6">
        <p>
          Current return window:{" "}
          <strong className="text-ink">{returns.return_window_days} days</strong> from
          delivery (this can be updated by the store admin).
        </p>
        <p>{returns.policy_summary}</p>
        <h2>How to request a return</h2>
        <p>
          Message us with your <strong className="text-ink">order ID</strong>, photos of the
          product and packaging, and the reason for return. Approved returns must be unused
          and in original condition unless the item arrived damaged.
        </p>
        <h2>Refunds</h2>
        <p>
          For prepaid orders, refunds are initiated to the original payment method after we
          receive and inspect the return. COD refunds are processed via bank transfer or UPI
          once details are shared.
        </p>
      </div>
    </div>
  );
}
