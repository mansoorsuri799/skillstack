import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import FadeIn from "@/components/FadeIn";
import PageShell from "@/components/PageShell";
import { connectDB } from "@/lib/db";
import {
  absoluteUrl,
  pageOpenGraph,
} from "@/lib/seo";
import { User, toPublicProfile } from "@/models/User";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  await connectDB();
  const user = await User.findOne({ username: username.toLowerCase() });
  if (!user) return { title: "Profile not found" };
  const p = toPublicProfile(user);
  const isSubstantive =
    Boolean(p.username) &&
    ((p.bio?.trim().length ?? 0) >= 80 || (p.skills?.length ?? 0) >= 3);
  return {
    title: `${p.name}${p.headline ? ` · ${p.headline}` : ""}`,
    description:
      p.bio?.slice(0, 155) ||
      `${p.name} on SkillStack${p.skills.length ? ` — ${p.skills.slice(0, 6).join(", ")}` : ""}`,
    alternates: { canonical: absoluteUrl(`/u/${p.username}`) },
    robots: isSubstantive
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: pageOpenGraph({
      title: p.name,
      description: p.headline || p.bio?.slice(0, 140) || "SkillStack profile",
      url: absoluteUrl(`/u/${p.username}`),
    }),
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  await connectDB();
  const user = await User.findOne({ username: username.toLowerCase() });
  if (!user) notFound();
  const p = toPublicProfile(user);
  const details = (
    [
      p.company && { label: "Company", value: p.company },
      p.location && { label: "Location", value: p.location },
      p.website && {
        label: "Website",
        value: p.website.replace(/^https?:\/\//i, ""),
        href: p.website,
      },
      p.linkedin && {
        label: "LinkedIn",
        value: "View profile",
        href: p.linkedin,
      },
      p.xProfile && {
        label: "X",
        value: "View profile",
        href: p.xProfile,
      },
    ].filter(Boolean) as { label: string; value: string; href?: string }[]
  );

  return (
    <PageShell>
      <div className="relative overflow-hidden border-b border-white/10 bg-[#0d1117]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_0%,rgba(45,212,191,0.12),transparent_55%)]"
        />
        <div className="relative mx-auto max-w-3xl px-6 py-14 md:px-8 md:py-20">
          <FadeIn>
            <nav aria-label="Breadcrumb" className="mb-6 text-xs text-ink-muted">
              <Link href="/" className="hover:text-accent">
                Home
              </Link>
              <span className="mx-2 text-white/25">/</span>
              <span className="text-snow/80">@{p.username}</span>
            </nav>

            <div className="flex flex-wrap items-start gap-5">
              <div className="relative h-20 w-20 overflow-hidden rounded-full border border-white/15 bg-[#161b22]">
                {p.image ? (
                  <Image
                    src={p.image}
                    alt=""
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center font-display text-2xl text-accent">
                    {p.name.slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-display text-3xl font-bold tracking-tight text-snow sm:text-4xl">
                    {p.name}
                  </h1>
                  {p.availableForWork ? (
                    <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                      Open to work
                    </span>
                  ) : null}
                </div>
                {p.headline ? (
                  <p className="mt-2 text-base text-ink-muted sm:text-lg">
                    {p.headline}
                  </p>
                ) : null}
                <p className="mt-2 text-sm text-white/40">@{p.username}</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-10 px-6 py-12 md:px-8 md:py-16">
        {p.bio ? (
          <FadeIn>
            <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
              About
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-ink-muted">
              {p.bio}
            </p>
          </FadeIn>
        ) : null}

        {p.skills.length ? (
          <FadeIn>
            <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
              Skills
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {p.skills.map((skill) => (
                <li
                  key={skill}
                  className="rounded-md border border-white/10 bg-[#0d1117] px-3 py-1.5 text-sm text-snow"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </FadeIn>
        ) : null}

        {details.length ? (
          <FadeIn>
            <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
              Details
            </h2>
            <dl className="mt-4 divide-y divide-white/10 border-y border-white/10">
              {details.map((r) => (
                <div key={r.label} className="flex justify-between gap-4 py-4">
                  <dt className="text-sm text-ink-muted">{r.label}</dt>
                  <dd className="text-right text-sm text-snow">
                    {r.href ? (
                      <a
                        href={r.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        {r.value}
                      </a>
                    ) : (
                      r.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </FadeIn>
        ) : null}
      </div>
    </PageShell>
  );
}
