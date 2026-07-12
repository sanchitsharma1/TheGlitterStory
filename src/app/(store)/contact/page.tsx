import { getSiteConfig } from "@/lib/settings";

export const metadata = { title: "Contact" };

export default async function ContactPage() {
  const { contact } = await getSiteConfig();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl text-ink">Contact</h1>
      <p className="mt-3 text-[15px] text-ink/60">
        We&apos;re setting up public contact channels. For now, the fastest way to reach us is Instagram.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-ink/10 bg-white/70 p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-ink/45 sm:text-[13px]">Instagram</p>
          <a
            className="mt-2 block font-display text-2xl text-ink hover:underline sm:text-3xl"
            href={`https://instagram.com/${contact.instagram}`}
            target="_blank"
            rel="noreferrer"
          >
            @{contact.instagram}
          </a>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-white/70 p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-ink/45 sm:text-[13px]">Email</p>
          {contact.email ? (
            <a
              className="mt-2 block font-display text-2xl text-ink hover:underline sm:text-3xl"
              href={`mailto:${contact.email}`}
            >
              {contact.email}
            </a>
          ) : (
            <p className="mt-2 font-display text-2xl text-ink/40 sm:text-3xl">
              Coming soon
            </p>
          )}
        </div>
        <div className="rounded-2xl border border-ink/10 bg-white/70 p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-ink/45 sm:text-[13px]">Phone / WhatsApp</p>
          <p className="mt-2 font-display text-2xl text-ink/40 sm:text-3xl">
            {contact.phone || contact.whatsapp || "Coming soon"}
          </p>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-white/70 p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-ink/45 sm:text-[13px]">Orders</p>
          <p className="mt-2 text-[15px] text-ink/65">
            Always share your <strong className="text-ink">order ID</strong> when you write in
            about a purchase.
          </p>
        </div>
      </div>
    </div>
  );
}
