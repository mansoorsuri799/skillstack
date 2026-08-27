"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  ChevronDown,
  ExternalLink,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Logo from "@/components/Logo";
import {
  dashboardNavGroups,
  type DashboardNavGroup,
  type DashboardNavItem,
} from "@/lib/dashboard/navigation";

type MobileMenuContextValue = {
  open: boolean;
  openMenu: () => void;
  closeMenu: () => void;
};

const MobileMenuContext = createContext<MobileMenuContextValue | null>(null);

function useMobileMenu() {
  const ctx = useContext(MobileMenuContext);
  if (!ctx) {
    throw new Error("useMobileMenu must be used within DashboardAppShell");
  }
  return ctx;
}

function NavLink({
  href,
  label,
  icon: Icon,
  exact,
  nested,
  onNavigate,
}: {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  nested?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      data-nav-active={active ? "true" : undefined}
      onClick={onNavigate}
      className={`relative flex items-center gap-2.5 rounded-md py-1.5 text-sm transition-colors ${
        nested ? "px-3 pl-6" : "px-3"
      } ${
        active
          ? "bg-white/10 font-medium text-snow"
          : "text-ink-muted hover:bg-white/5 hover:text-ink"
      }`}
    >
      {active ? (
        <span className="absolute bottom-1 left-0 top-1 w-[3px] rounded-r-full bg-accent" />
      ) : null}
      {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
      <span className="truncate">{label}</span>
    </Link>
  );
}

function NavGroupSection({
  group,
  onNavigate,
}: {
  group: DashboardNavGroup;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const groupActive = group.items.some((item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href),
  );
  const [open, setOpen] = useState(group.defaultOpen ?? true);

  useEffect(() => {
    if (groupActive) setOpen(true);
  }, [groupActive]);

  if (group.collapsible) {
    return (
      <div className="mb-5">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="mb-2 flex w-full items-center justify-between px-3 text-[11px] font-semibold uppercase tracking-wider text-ink-muted/70"
        >
          <span>{group.label}</span>
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        {open ? (
          <div className="space-y-0.5">
            {group.items.map((item: DashboardNavItem) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                exact={item.exact}
                nested
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mb-5">
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
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  );
}

function DashboardSidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const activeLink = nav.querySelector<HTMLElement>('[data-nav-active="true"]');
    if (!activeLink) return;

    requestAnimationFrame(() => {
      activeLink.scrollIntoView({ block: "nearest", behavior: "auto" });
    });
  }, [pathname]);

  return (
    <nav ref={navRef} className="flex-1 overflow-y-auto overscroll-contain px-3 py-4">
      {dashboardNavGroups.map((group) => (
        <NavGroupSection key={group.label} group={group} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}

function SidebarPanel({ onNavigate }: { onNavigate?: () => void }) {
  const { data: session } = useSession();
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-line bg-bg-soft">
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-4">
        <Logo size="sm" href="/dashboard" />
        {onNavigate ? (
          <button
            type="button"
            onClick={onNavigate}
            className="rounded-md p-1 text-ink-muted hover:bg-white/5 md:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <DashboardSidebarNav onNavigate={onNavigate} />

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
}

export default function DashboardSidebar() {
  const { open, closeMenu } = useMobileMenu();

  return (
    <>
      <div className="hidden h-full md:flex">
        <SidebarPanel />
      </div>
      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={closeMenu}
            aria-label="Close overlay"
          />
          <div className="relative h-full w-60">
            <SidebarPanel onNavigate={closeMenu} />
          </div>
        </div>
      ) : null}
    </>
  );
}

export function DashboardMobileToggle() {
  const { openMenu } = useMobileMenu();

  return (
    <button
      type="button"
      onClick={openMenu}
      className="rounded-md border border-line p-2 text-ink md:hidden"
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}

export function DashboardMobileMenuProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <MobileMenuContext.Provider
      value={{
        open,
        openMenu: () => setOpen(true),
        closeMenu: () => setOpen(false),
      }}
    >
      {children}
    </MobileMenuContext.Provider>
  );
}
