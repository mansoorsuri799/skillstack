import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { getExpertById, teamExperts } from "@/lib/team";
import { Conversation } from "@/models/Conversation";

export const metadata: Metadata = {
  title: "Messages",
  robots: { index: false, follow: false },
};

export default async function MessagesPage() {
  const session = await auth();
  let rows: { expertId: string; lastMessage: string; lastAt: Date }[] = [];

  if (session?.user?.id) {
    try {
      await connectDB();
      rows = await Conversation.find({ userId: session.user.id })
        .sort({ lastAt: -1 })
        .select("expertId lastMessage lastAt")
        .lean();
    } catch {
      rows = [];
    }
  }

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">Inbox</p>
      <h1 className="font-display mt-2 text-2xl font-bold tracking-tight text-snow">Messages</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Direct threads with SkillStack developers and SEO specialists.
      </p>

      {rows.length === 0 ? (
        <div className="mt-8 rounded-xl border border-white/10 bg-[#0d1117] p-8 text-center">
          <p className="text-sm text-ink-muted">No conversations yet.</p>
          <Link
            href="/dashboard/team"
            className="mt-4 inline-flex rounded-md bg-accent px-4 py-2 text-sm font-semibold text-[#010409]"
          >
            Message a specialist
          </Link>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10 bg-[#0d1117]">
          {rows.map((row) => {
            const expert = getExpertById(row.expertId) ?? teamExperts[0];
            return (
              <li key={row.expertId}>
                <Link
                  href={`/dashboard/messages/${row.expertId}`}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/5"
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white ${expert.tone}`}
                  >
                    {expert.initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-snow">{expert.name}</span>
                      <span className="shrink-0 text-[11px] text-white/35">
                        {new Date(row.lastAt).toLocaleDateString()}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-ink-muted">
                      {row.lastMessage}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
