import type { Metadata } from "next";
import Link from "next/link";
import { teamExperts } from "@/lib/team";

export const metadata: Metadata = {
  title: "SkillStack developers",
  robots: { index: false, follow: false },
};

export default function TeamPage() {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
        SkillStack developers
      </p>
      <h1 className="font-display mt-2 text-2xl font-bold tracking-tight text-snow sm:text-3xl">
        Message the people who ship the work.
      </h1>
      <p className="mt-2 max-w-xl text-sm text-ink-muted">
        Web developers, content writers, SEO experts, and authority specialists — start a chat and we reply in-thread.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {teamExperts.map((e) => (
          <li key={e.id}>
            <div className="flex h-full flex-col rounded-xl border border-white/10 bg-[#0d1117] p-5">
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white ${e.tone}`}
                >
                  {e.initials}
                </span>
                <div className="min-w-0">
                  <p className="font-display font-semibold text-snow">{e.name}</p>
                  <p className="text-xs text-accent">{e.role}</p>
                  <p className="mt-1 text-xs text-ink-muted">{e.specialty}</p>
                </div>
                <span
                  className={`ml-auto mt-1 h-2 w-2 shrink-0 rounded-full ${e.status === "online" ? "bg-accent" : "bg-white/25"}`}
                />
              </div>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-muted">{e.bio}</p>
              <Link
                href={`/dashboard/messages/${e.id}`}
                className="mt-5 inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-[#010409] hover:bg-accent-deep"
              >
                Message {e.name.split(" ")[0]}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
