import { getSiteConfig } from "@/lib/settings";

export const metadata = { title: "Terms" };

export default async function TermsPage() {
  const { policies, commerce } = await getSiteConfig();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl text-ink">Terms of service</h1>
      <div className="prose-nest mt-6">
        <p>{policies.terms_summary}</p>
        <h2>Orders</h2>
        <p>
          Placing an order constitutes an offer to purchase. We may cancel orders in case of
          pricing errors, stock issues, suspected fraud, or serviceability problems, and will
          notify you using the contact details provided.
        </p>
        <h2>Pricing</h2>
        <p>
          All prices are in {commerce.currency}. Prices shown are inclusive of applicable
          charges. Shipping is calculated at checkout as per current rates.
        </p>
        <h2>Governing law</h2>
        <p>
          These terms are governed by the laws of India. Disputes shall be subject to the
          jurisdiction of competent courts in India.
        </p>
      </div>
    </div>
  );
}
