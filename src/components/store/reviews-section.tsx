import type { Review } from "@/types";
import { averageRating } from "@/lib/reviews";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-gold-dark" aria-label={`${rating} out of 5`}>
      {"★".repeat(Math.round(rating))}
      <span className="text-ink/20">{"★".repeat(5 - Math.round(rating))}</span>
    </span>
  );
}

export function ReviewsSection({
  reviews,
  title = "Kind words",
  subtitle = "From customers who wear The Jewel Nest",
}: {
  reviews: Review[];
  title?: string;
  subtitle?: string;
}) {
  if (!reviews.length) return null;
  const avg = averageRating(reviews);

  return (
    <section className="border-t border-ink/8 bg-white/40">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark sm:text-[13px]">
            Reviews
          </p>
          <h2 className="mt-1 font-display text-3xl text-ink sm:text-4xl">{title}</h2>
          <p className="mt-2 text-[15px] text-ink/55">{subtitle}</p>
          {avg !== null && (
            <p className="mt-3 text-sm text-ink/70">
              <Stars rating={avg} />{" "}
              <span className="ml-1 font-medium">{avg.toFixed(1)}</span>
              <span className="text-ink/45"> · {reviews.length} review{reviews.length === 1 ? "" : "s"}</span>
            </p>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <blockquote
              key={r.id}
              className="rounded-2xl border border-ink/10 bg-ivory/80 p-5"
            >
              <Stars rating={r.rating} />
              <p className="mt-3 text-[15px] leading-relaxed text-ink/75">
                &ldquo;{r.body}&rdquo;
              </p>
              <footer className="mt-4 text-xs uppercase tracking-[0.14em] text-ink/45">
                {r.customer_name}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
