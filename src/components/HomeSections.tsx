"use client";

import FadeIn from "./FadeIn";

const reasons = [
  {
    title: "One team, full stack",
    body: "Build, SEO, links, and monetization in one place — strategy never gets lost between freelancers.",
  },
  {
    title: "Google-first craft",
    body: "We track policy updates and search changes so rankings stay honest and durable.",
  },
  {
    title: "National & international",
    body: "Delivery for clients across Pakistan and beyond borders.",
  },
  {
    title: "Knowledge that sticks",
    body: "We transfer what we know so your team can grow independent, not dependent.",
  },
];

const services = [
  {
    n: "01",
    title: "Keyword research & ranking",
    body: "High-intent keywords with real traffic potential, then content and technical SEO to climb.",
  },
  {
    n: "02",
    title: "Websites from scratch",
    body: "Fast, clear sites engineered for search — from first commit to page-one rankings.",
  },
  {
    n: "03",
    title: "SEO blogging & content",
    body: "Topical clusters written to match intent and keep visitors reading.",
  },
  {
    n: "04",
    title: "Ad monetization",
    body: "AdSense and Adsterra layouts that protect revenue from organic traffic.",
  },
  {
    n: "05",
    title: "Keyword packages",
    body: "Validated opportunities scoped for your niche, region, and model.",
  },
  {
    n: "06",
    title: "Backlinking",
    body: "Authority work that strengthens the domain without spammy shortcuts.",
  },
];

const steps = [
  {
    title: "Find the keyword",
    body: "Demand, competition, and monetization fit — terms worth ranking for.",
  },
  {
    title: "Build the site",
    body: "Clean architecture, fast pages, on-page SEO from day one.",
  },
  {
    title: "Rank on Google",
    body: "Content, technical fixes, and authority aligned with current guidance.",
  },
  {
    title: "Earn from traffic",
    body: "Ad placements structured for sustainable yield.",
  },
];

export default function HomeSections() {
  return (
    <>
      <section id="services" className="border-t border-white/10 bg-[#0d1117] py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <FadeIn>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
              Services
            </p>
            <h2 className="font-display mt-3 max-w-2xl text-3xl font-bold tracking-tight text-snow sm:text-5xl">
              Everything between a blank domain and a ranking business.
            </h2>
          </FadeIn>

          <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <FadeIn key={s.n} delay={i * 0.06}>
                <li className="border-t border-white/10 pt-5">
                  <span className="font-display text-xs text-ink-muted">{s.n}</span>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight text-snow">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {s.body}
                  </p>
                </li>
              </FadeIn>
            ))}
          </ul>

          <FadeIn className="mt-16 border-t border-white/10 pt-12" delay={0.1}>
            <div id="why-us">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
                Why choose us
              </p>
              <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {reasons.map((reason) => (
                  <li key={reason.title}>
                    <h3 className="text-base font-semibold tracking-tight text-snow">
                      {reason.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                      {reason.body}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>
      </section>

      <section id="process" className="border-t border-white/10 bg-[#161b22] py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <FadeIn>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
              Process
            </p>
            <h2 className="font-display mt-3 max-w-xl text-3xl font-bold tracking-tight text-snow sm:text-5xl">
              A straight path from research to revenue.
            </h2>
          </FadeIn>
          <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <FadeIn key={step.title} delay={i * 0.08}>
                <li>
                  <div className="mb-4 h-px w-12 bg-accent" aria-hidden="true" />
                  <p className="font-display text-4xl font-bold tabular-nums text-accent/30">
                    {i + 1}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-snow">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {step.body}
                  </p>
                </li>
              </FadeIn>
            ))}
          </ol>
        </div>
      </section>

      <section id="about" className="border-t border-white/10 bg-[#0d1117] py-24 md:py-32">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-[1.1fr_0.9fr] md:gap-16 md:px-8">
          <FadeIn>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
              About
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-snow sm:text-5xl">
              Built in Pakistan. Aimed beyond borders.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-ink-muted">
              SkillStack is led by{" "}
              <span className="font-semibold text-snow">Mansoor Khan</span>, CEO —
              growing from focused freelance craft into a company that serves
              clients nationwide and worldwide.
            </p>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              Independence through knowledge is core. The team researches and stays
              current with Google&apos;s policies — because our work sits on search.
            </p>
          </FadeIn>
          <FadeIn delay={0.12}>
            <aside className="flex h-full flex-col justify-end md:border-l md:border-white/10 md:pl-10">
              <blockquote className="font-display text-2xl font-medium leading-snug tracking-tight text-snow sm:text-3xl">
                “Rank honestly. Share what you learn. Build people who can stand on
                their own.”
              </blockquote>
              <p className="mt-6 text-sm text-ink-muted">
                — Mansoor Khan, CEO · SkillStack Private Limited
              </p>
            </aside>
          </FadeIn>
        </div>
      </section>

      <section id="contact" className="border-t border-white/10 bg-[#010409] py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <FadeIn>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
              Contact
            </p>
            <h2 className="font-display mt-3 max-w-2xl text-3xl font-bold tracking-tight text-snow sm:text-5xl">
              Ready to rank a keyword or ship a site?
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-muted">
              Tell us your niche, market, and whether you need a build, SEO, links,
              or a full stack from domain to AdSense.
            </p>
            <div className="mt-12 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-3">
                <a
                  href="mailto:hello@skillstack.com.pk"
                  className="block font-display text-2xl font-semibold text-snow transition-opacity hover:opacity-80 sm:text-3xl"
                >
                  hello@skillstack.com.pk
                </a>
                <p className="text-sm text-ink-muted">
                  Pakistan · Serving national & international clients
                </p>
              </div>
              <a
                href="mailto:hello@skillstack.com.pk?subject=Project%20inquiry%20—%20SkillStack"
                className="inline-flex w-fit rounded-md bg-accent px-6 py-3 text-sm font-semibold text-[#010409] transition-colors hover:bg-accent-deep"
              >
                Email SkillStack
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
