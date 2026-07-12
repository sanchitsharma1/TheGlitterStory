import { getSiteConfig } from "@/lib/settings";

export const metadata = { title: "Privacy Policy" };

export default async function PrivacyPage() {
  const { policies, contact } = await getSiteConfig();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl text-ink">Privacy policy</h1>
      <div className="prose-nest mt-6">
        <p>{policies.privacy_summary}</p>
        <h2>What we collect</h2>
        <p>
          Name, phone number, email, delivery address, order contents, and payment status.
          For online payments, Razorpay processes card/UPI details; we never store full card numbers.
        </p>
        <h2>How we use it</h2>
        <p>
          To fulfil orders, prevent fraud, send order-related communication, and improve the store.
          We do not sell personal data.
        </p>
        <h2>Contact</h2>
        <p>
          For privacy requests, contact us via Instagram @{contact.instagram}
          {contact.email ? ` or ${contact.email}` : ""}
          {contact.phone ? ` or ${contact.phone}` : ""}.
        </p>
      </div>
    </div>
  );
}
