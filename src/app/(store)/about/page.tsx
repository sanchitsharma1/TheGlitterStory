import { getSiteConfig } from "@/lib/settings";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Our Story" };

export default async function AboutPage() {
  const config = await getSiteConfig();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark sm:text-[13px]">
        Our story
      </p>
      <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">
        Two names. One standard of polish.
      </h1>

      <div className="prose-nest mt-8">
        <p>
          Before The Jewel Nest had a website, it lived where modern brands often begin -
          in Instagram reels, late-night packaging, and DMs from women who wanted pieces
          that felt special without trying too hard.
        </p>
        <p>
          <strong className="text-ink">The Glitter Story</strong>
          {" "}
          is the larger house: a nail salon built on detail, ritual, and the quiet
          confidence of looking finished. Hands tell a story. So does jewellery.
        </p>
        <p>
          <strong className="text-ink">The Jewel Nest</strong>
          {" "}
          is that story extended - a jewellery label born from the same aesthetic. Not
          loud luxury. Not trend for trend&apos;s sake. Modern pieces you can stack for a
          reel, gift after a salon visit, or wear on an ordinary Tuesday.
        </p>
        <h2>Why &quot;Nest&quot;?</h2>
        <p>
          A nest is where beautiful things are kept safe - gathered, chosen, layered.
          That is how we curate: fewer pieces, better ones, presented with care.
        </p>
        <p className="rounded-2xl border border-gold/30 bg-gold/10 px-5 py-4 text-ink/80">
          {config.brand.parent_brand_note}
        </p>
        <h2>From scroll to doorstep</h2>
        <p>
          You still find us on Instagram{" "}
          <a
            className="text-ink underline underline-offset-2"
            href={`https://instagram.com/${config.contact.instagram}`}
            target="_blank"
            rel="noreferrer"
          >
            @{config.contact.instagram}
          </a>
          . This store simply makes ordering effortless - guest checkout, India-wide
          shipping, and an order ID you can trust.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/shop">
          <Button size="lg">Shop the collection</Button>
        </Link>
        <a
          href={`https://instagram.com/${config.contact.instagram}`}
          target="_blank"
          rel="noreferrer"
        >
          <Button size="lg" variant="secondary">
            Follow on Instagram
          </Button>
        </a>
      </div>
    </div>
  );
}
