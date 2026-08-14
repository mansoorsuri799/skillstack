"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import type { ReactNode } from "react";
import Logo from "@/components/Logo";

const nav = [
  { href: "/dashboard", label: "Overview", exact: true },
  { href: "/dashboard/messages", label: "Messages" },
  { href: "/dashboard/team", label: "SkillStack developers" },
  { href: "/profile", label: "Profile" },
  { href: "/pricing", label: "Packages" },
  { href: "/services", label: "Services" },
];

export default function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const name = session?.user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="min-h-[100svh] bg-[#010409] text-ink">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0d1117]/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Logo size="sm" href="/dashboard" />
            <span className="hidden h-5 w-px bg-white/10 sm:block" />
            <span className="hidden text-sm text-white/45 sm:inline">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-[160px] truncate text-sm text-white/55 sm:inline">
              {session?.user?.email}
            </span>
            <Link
              href="/"
              className="rounded-md border border-white/15 px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/5"
            >
              Site
            </Link>
            <button
              type="button"
              onClick={() => void signOut({ callbackUrl: "/" })}
              className="rounded-md border border-white/15 px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/5"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px] gap-0 md:gap-8">
        <aside className="hidden w-56 shrink-0 border-r border-white/10 md:block">
          <nav className="sticky top-14 flex flex-col gap-0.5 p-4" aria-label="Dashboard">
            <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-wider text-white/35">
              Hi, {name}
            </p>
            {nav.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-2 text-sm ${
                    active
                      ? "bg-white/10 font-medium text-snow"
                      : "text-white/55 hover:bg-white/5 hover:text-snow"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <nav
            className="flex gap-1 overflow-x-auto border-b border-white/10 px-4 py-2 md:hidden"
            aria-label="Dashboard mobile"
          >
            {nav.slice(0, 4).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-full border border-white/10 px-3 py-1 text-xs text-white/70"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="px-4 py-8 sm:px-6 md:py-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
