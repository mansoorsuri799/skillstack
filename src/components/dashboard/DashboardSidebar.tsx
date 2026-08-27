"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  ChevronDown,
  ExternalLink,
  LogOut,
  Menu,
  Settings,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import Logo from "@/components/Logo";
import {
  dashboardNavGroups,
} from "@/lib/dashboard/navigation";

function NavLink({
  href,
  label,
  icon: Icon,
  exact,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`relative flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
        active
          ? "bg-white/10 font-medium text-snow"
          : "text-ink-muted hover:bg-white/5 hover:text-ink"
      }`}
    >
      {active ? (
        <span className="absolute bottom-1 left-0 top-1 w-[3px] rounded-r-full bg-accent" />
      ) : null}
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export default function DashboardSidebar({
  mobileOpen,
  onMobileClose,
}: {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const { data: session } = useSession();
  const [accountOpen, setAccountOpen] = useState(false);

  const sidebar = (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-line bg-bg-soft">
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-4">
        <Logo size="sm" href="/dashboard" />
        {onMobileClose ? (
          <button
            type="button"
            onClick={onMobileClose}
            className="rounded-md p-1 text-ink-muted hover:bg-white/5 md:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {dashboardNavGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-ink-muted/70">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  exact={item.exact}
                  onNavigate={onMobileClose}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-line p-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setAccountOpen((v) => !v)}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-ink hover:bg-white/5"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
              {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
            </span>
            <span className="min-w-0 flex-1 truncate">
              {session?.user?.name ?? "Account"}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-ink-muted" />
          </button>
          {accountOpen ? (
            <div className="absolute bottom-full left-0 right-0 mb-1 rounded-lg border border-line bg-bg-elevated py-1 shadow-xl">
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-white/5"
                onClick={() => setAccountOpen(false)}
              >
                <User className="h-4 w-4" /> Profile
              </Link>
              <Link
                href="/"
                className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-white/5"
                onClick={() => setAccountOpen(false)}
              >
                <ExternalLink className="h-4 w-4" /> Marketing site
              </Link>
              <button
                type="button"
                onClick={() => void signOut({ callbackUrl: "/" })}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-white/5"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden md:flex">{sidebar}</div>
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={onMobileClose}
            aria-label="Close overlay"
          />
          <div className="relative h-full w-60">{sidebar}</div>
        </div>
      ) : null}
    </>
  );
}

export function DashboardMobileToggle({
  onOpen,
}: {
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="rounded-md border border-line p-2 text-ink md:hidden"
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
