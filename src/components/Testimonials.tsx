import FadeIn from "./FadeIn";
import { siteReviews } from "@/lib/seo";

function StarRating({ value }: { value: number }) {
  return (
    <div role="img" className="flex gap-0.5" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 16 16"
          fill={i < value ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.2"
          className="h-4 w-4 text-accent"
          aria-hidden="true"
        >
          <path d="M8 1.5l1.76 3.57 3.94.57-2.85 2.78.67 3.92L8 10.27l-3.52 1.07.67-3.92L2.3 5.64l3.94-.57L8 1.5z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const avg = (
    siteReviews.reduce((s, r) => s + r.ratingValue, 0) / siteReviews.length
  ).toFixed(1);

  return (
    <section className="border-t border-white/10 bg-[#161b22] py-16 sm:py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
        <FadeIn>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent sm:text-sm">
            Reviews
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-snow sm:text-4xl md:text-5xl">
              What clients say.
            </h2>
            <p className="mb-1 text-sm text-ink-muted">
              <span className="font-semibold text-snow">{avg} / 5</span> from{" "}
              {siteReviews.length} reviews
            </p>
          </div>
        </FadeIn>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {siteReviews.map((review, i) => (
            <FadeIn key={review.author} delay={i * 0.07}>
              <article
                itemScope
                itemType="https://schema.org/Review"
                className="flex h-full flex-col rounded-xl border border-white/8 bg-[#0d1117] p-6"
              >
                <StarRating value={review.ratingValue} />
                <blockquote
                  itemProp="reviewBody"
                  className="mt-4 flex-1 text-sm leading-relaxed text-ink-muted"
                >
                  &ldquo;{review.reviewBody}&rdquo;
                </blockquote>
                <footer className="mt-5 border-t border-white/8 pt-4">
                  <p
                    itemProp="author"
                    itemScope
                    itemType="https://schema.org/Person"
                    className="text-sm font-semibold text-snow"
                  >
                    <span itemProp="name">{review.author}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {review.location}
                  </p>
                </footer>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
