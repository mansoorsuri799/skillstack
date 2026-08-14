import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { teamExperts } from "@/lib/team";
import { Conversation } from "@/models/Conversation";
import { User } from "@/models/User";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const session = await auth();
  const name = session?.user?.name?.split(" ")[0] ?? "there";

  let username: string | null = null;
  let convoCount = 0;
  if (session?.user?.id) {
    try {
      await connectDB();
      const [user, count] = await Promise.all([
        User.findById(session.user.id).select("username").lean(),
        Conversation.countDocuments({ userId: session.user.id }),
      ]);
      username = user?.username ?? null;
      convoCount = count;
    } catch {
      /* dashboard still renders if DB is down */
    }
  }

  const stats = [
    { label: "Open chats", value: String(convoCount), hint: "With SkillStack specialists" },
    { label: "Team online", value: String(teamExperts.filter((e) => e.status === "online").length), hint: `${teamExperts.length} specialists` },
    { label: "Public profile", value: username ? `@${username}` : "Not set", hint: username ? "Visible on /u/" : "Add a username" },
  ];

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">Overview</p>
      <h1 className="font-display mt-2 text-2xl font-bold tracking-tight text-snow sm:text-3xl">
        Welcome back, {name}.
      </h1>
      <p className="mt-2 max-w-xl text-sm text-ink-muted">
        This is your SkillStack workspace — packages, profile, and a direct line to our developers and SEO experts.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-white/10 bg-[#0d1117] px-4 py-4"
          >
            <p className="text-[11px] uppercase tracking-wider text-white/40">{s.label}</p>
            <p className="mt-1 font-display text-lg font-semibold text-snow">{s.value}</p>
            <p className="mt-1 text-xs text-ink-muted">{s.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-xl border border-white/10 bg-[#0d1117] p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-base font-semibold text-snow">Quick actions</h2>
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {[
              { href: "/dashboard/team", title: "Message a specialist", body: "Web, content, SEO, backlinks — start a chat." },
              { href: "/dashboard/messages", title: "Open inbox", body: "Continue existing conversations." },
              { href: "/pricing", title: "View packages", body: "Keyword, Growth, or Full stack." },
              { href: "/profile", title: "Edit profile", body: "Username, skills, and public page." },
            ].map((a) => (
              <li key={a.href}>
                <Link
                  href={a.href}
                  className="block h-full rounded-lg border border-white/10 bg-[#010409] p-4 transition hover:border-accent/40"
                >
                  <p className="text-sm font-semibold text-snow">{a.title}</p>
                  <p className="mt-1 text-xs text-ink-muted">{a.body}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-white/10 bg-[#0d1117] p-5">
          <h2 className="font-display text-base font-semibold text-snow">SkillStack developers</h2>
          <p className="mt-1 text-xs text-ink-muted">Tap anyone to start a private chat.</p>
          <ul className="mt-4 space-y-2">
            {teamExperts.slice(0, 4).map((e) => (
              <li key={e.id}>
                <Link
                  href={`/dashboard/messages/${e.id}`}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5"
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white ${e.tone}`}
                  >
                    {e.initials}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-snow">{e.name}</span>
                    <span className="block truncate text-xs text-ink-muted">{e.role}</span>
                  </span>
                  <span
                    className={`ml-auto h-2 w-2 shrink-0 rounded-full ${e.status === "online" ? "bg-accent" : "bg-white/25"}`}
                    aria-label={e.status}
                  />
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/dashboard/team"
            className="mt-3 inline-block text-sm font-medium text-accent hover:underline"
          >
            See the full team →
          </Link>
        </section>
      </div>
    </div>
  );
}
