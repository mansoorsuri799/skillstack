"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Check,
  ChevronDown,
  ExternalLink,
  Globe,
  HelpCircle,
  LayoutGrid,
  LogOut,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  User,
  X,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import Logo from "@/components/Logo";
import { UserAvatar } from "@/components/UserAvatar";
import {
  dashboardNavGroups,
  type DashboardNavGroup,
  type DashboardNavItem,
} from "@/lib/dashboard/navigation";
import {
  useDashboardProject,
  type DashboardProject,
} from "@/components/dashboard/useDashboardProject";
import { NewProjectModal } from "@/components/dashboard/NewProjectModal";
import { RenameProjectModal } from "@/components/dashboard/RenameProjectModal";
import { DeleteProjectModal } from "@/components/dashboard/DeleteProjectModal";

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
  const router = useRouter();
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      prefetch={true}
      onMouseEnter={() => router.prefetch(href)}
      onTouchStart={() => router.prefetch(href)}
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

function ProjectRowItem({
  project,
  isActive,
  onSelect,
  onRename,
  onDelete,
}: {
  project: DashboardProject;
  isActive: boolean;
  onSelect: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!menuOpen || !buttonRef.current) {
      setMenuPos(null);
      return;
    }

    const rect = buttonRef.current.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 4,
      left: Math.max(8, rect.right - 140),
    });

    function handleClickOutside(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    function handleScroll() {
      setMenuOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [menuOpen]);

  return (
    <div
      className={`group relative flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
        isActive
          ? "bg-white/10 font-medium text-snow shadow-sm"
          : "text-ink-muted hover:bg-white/5 hover:text-ink"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-2 pr-1 text-left"
      >
        <Globe
          className={`h-3.5 w-3.5 shrink-0 transition-colors ${
            isActive ? "text-accent" : "text-ink-muted/70 group-hover:text-ink"
          }`}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium leading-tight text-snow">
            {project.name || project.domain}
          </p>
          <p className="truncate text-[10px] text-ink-muted/80 leading-none mt-0.5">
            {project.domain}
          </p>
        </div>
      </button>

      <div className="flex shrink-0 items-center gap-1">
        <button
          ref={buttonRef}
          type="button"
          aria-label="Project options"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
          className={`rounded p-1 text-ink-muted hover:bg-white/10 hover:text-snow transition-opacity ${
            menuOpen ? "opacity-100 bg-white/10 text-snow" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </div>

      {menuOpen && menuPos && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              className="fixed z-50 min-w-[8.5rem] rounded-lg border border-line bg-bg-elevated py-1 shadow-2xl backdrop-blur-md"
              style={{ top: menuPos.top, left: menuPos.left }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onRename();
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-ink hover:bg-white/5"
              >
                <Pencil className="h-3.5 w-3.5 text-ink-muted" />
                Rename
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete();
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

function ProjectsSidebarSection({
  onNavigate,
  onOpenNewModal,
  onOpenRenameModal,
  onOpenDeleteModal,
}: {
  onNavigate?: () => void;
  onOpenNewModal: () => void;
  onOpenRenameModal: (project: DashboardProject) => void;
  onOpenDeleteModal: (project: DashboardProject) => void;
}) {
  const { project: activeProject, projects, selectProject } = useDashboardProject();
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-4">
      <div className="mb-1.5 flex items-center justify-between px-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-muted/70 hover:text-ink"
        >
          <span>Projects</span>
          <span
            suppressHydrationWarning
            className="rounded-full bg-white/5 px-1.5 py-0.2 text-[10px] tabular-nums text-ink-muted"
          >
            {projects.length}
          </span>
          <ChevronDown
            className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        <button
          type="button"
          onClick={onOpenNewModal}
          className="rounded p-1 text-ink-muted hover:bg-white/5 hover:text-accent"
          title="Create new project"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {open ? (
        <div className="max-h-48 space-y-0.5 overflow-y-auto px-1 overscroll-contain">
          {projects.length === 0 ? (
            <p className="px-2.5 py-2 text-xs text-ink-muted/60">No saved projects.</p>
          ) : (
            projects.map((item) => (
              <ProjectRowItem
                key={item.id}
                project={item}
                isActive={activeProject?.id === item.id}
                onSelect={async () => {
                  if (activeProject?.id !== item.id) {
                    await selectProject(item.id);
                  }
                  onNavigate?.();
                }}
                onRename={() => onOpenRenameModal(item)}
                onDelete={() => onOpenDeleteModal(item)}
              />
            ))
          )}
        </div>
      ) : null}
    </div>
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

function formatChatTime(dateInput: string | Date) {
  const d = new Date(dateInput);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "0m";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

type ChatListItem = {
  id: string;
  title: string;
  messageCount: number;
  updatedAt: string;
};

function ChatSidebarList({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeChatId = searchParams.get("id");
  const [chats, setChats] = useState<ChatListItem[]>([]);

  const loadChats = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/chat");
      if (!res.ok) return;
      const data = await res.json();
      setChats(data.chats || []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void loadChats();
    const handler = () => void loadChats();
    window.addEventListener("refresh-chats", handler);
    return () => window.removeEventListener("refresh-chats", handler);
  }, [loadChats]);

  async function deleteChat(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    e.preventDefault();
    try {
      await fetch(`/api/dashboard/chat/${id}`, { method: "DELETE" });
      setChats((prev) => prev.filter((c) => c.id !== id));
      if (activeChatId === id) {
        router.push("/dashboard/chat");
      }
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-3">
      <Link
        href="/dashboard/chat"
        prefetch={true}
        onClick={onNavigate}
        className="flex w-full items-center gap-2 rounded-lg border border-line/70 bg-white/5 px-3 py-2 text-xs font-semibold text-snow transition hover:border-accent/40 hover:bg-white/10 hover:text-white"
      >
        <Plus className="h-3.5 w-3.5 text-accent" />
        New chat
      </Link>

      <div className="space-y-0.5">
        {chats.length === 0 ? (
          <p className="px-2.5 py-2 text-xs text-ink-muted/60">No chat history.</p>
        ) : (
          chats.map((c) => {
            const isActive = activeChatId === c.id;
            return (
              <div
                key={c.id}
                className={`group relative flex items-center justify-between rounded-lg px-2.5 py-2 text-xs transition ${
                  isActive
                    ? "bg-white/10 font-medium text-snow shadow-sm"
                    : "text-ink-muted hover:bg-white/5 hover:text-ink"
                }`}
              >
                <Link
                  href={`/dashboard/chat?id=${c.id}`}
                  prefetch={true}
                  onClick={onNavigate}
                  className="flex-1 truncate pr-2"
                >
                  {c.title || "New chat"}
                </Link>
                <span className="text-[10px] text-ink-muted/70 group-hover:hidden">
                  {formatChatTime(c.updatedAt)}
                </span>
                <button
                  type="button"
                  onClick={(e) => void deleteChat(e, c.id)}
                  className="hidden rounded p-0.5 text-ink-muted hover:text-red-400 group-hover:block"
                  title="Delete chat"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function DashboardSidebarNav({
  onNavigate,
  onOpenNewModal,
  onOpenRenameModal,
  onOpenDeleteModal,
}: {
  onNavigate?: () => void;
  onOpenNewModal: () => void;
  onOpenRenameModal: (project: DashboardProject) => void;
  onOpenDeleteModal: (project: DashboardProject) => void;
}) {
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

  const isChat = pathname.startsWith("/dashboard/chat");

  return (
    <nav ref={navRef} className="flex-1 overflow-y-auto overscroll-contain px-3 py-3">
      <ProjectsSidebarSection
        onNavigate={onNavigate}
        onOpenNewModal={onOpenNewModal}
        onOpenRenameModal={onOpenRenameModal}
        onOpenDeleteModal={onOpenDeleteModal}
      />

      {/* Browse / Chat Mode Switcher Tabs */}
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg border border-line bg-bg p-1 text-xs">
        <Link
          href="/dashboard"
          prefetch={true}
          onClick={onNavigate}
          className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 font-medium transition ${
            !isChat
              ? "bg-white/10 text-snow shadow-sm"
              : "text-ink-muted hover:text-snow"
          }`}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          Browse
        </Link>
        <Link
          href="/dashboard/chat"
          prefetch={true}
          onClick={onNavigate}
          className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 font-medium transition ${
            isChat
              ? "bg-white/10 text-snow shadow-sm"
              : "text-ink-muted hover:text-snow"
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Chat
        </Link>
      </div>

      <div className="my-3 border-t border-line/60" />

      {isChat ? (
        <ChatSidebarList onNavigate={onNavigate} />
      ) : (
        dashboardNavGroups.map((group) => (
          <NavGroupSection key={group.label} group={group} onNavigate={onNavigate} />
        ))
      )}

      <div className="mt-4 pt-3 border-t border-line/60">
        <Link
          href="/contact"
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-md px-3 py-1.5 text-xs text-ink-muted transition hover:bg-white/5 hover:text-snow"
        >
          <HelpCircle className="h-4 w-4 shrink-0 text-ink-muted" />
          <span>Help & Community</span>
        </Link>
      </div>
    </nav>
  );
}

function SidebarPanel({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [accountOpen, setAccountOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<DashboardProject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DashboardProject | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.profile) return;
        setProfileImage(data.profile.image ?? null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  const avatarImage = profileImage ?? session?.user?.image ?? null;
  const displayName = session?.user?.name ?? "Account";

  return (
    <>
      <aside className="flex h-full w-full shrink-0 flex-col border-r border-line bg-bg-soft md:w-60">
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

        <div className="px-3 pt-3 pb-1">
          <button
            type="button"
            onClick={() => setNewProjectOpen(true)}
            className="flex w-full items-center justify-between rounded-lg border border-line/80 bg-white/5 px-3 py-2 text-sm font-medium text-snow shadow-sm transition-all hover:border-accent/40 hover:bg-white/10 hover:text-white"
          >
            <span className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-accent" />
              New project
            </span>
          </button>
        </div>

        <DashboardSidebarNav
          onNavigate={onNavigate}
          onOpenNewModal={() => setNewProjectOpen(true)}
          onOpenRenameModal={(proj) => setRenameTarget(proj)}
          onOpenDeleteModal={(proj) => setDeleteTarget(proj)}
        />

        <div className="border-t border-line p-3">
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => router.prefetch("/profile")}
              onTouchStart={() => router.prefetch("/profile")}
              onClick={() => setAccountOpen((v) => !v)}
              className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-snow hover:bg-white/5"
            >
              <UserAvatar name={displayName} image={avatarImage} size="md" />
              <span className="min-w-0 flex-1 truncate font-medium">{displayName}</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-ink-muted transition-transform ${
                  accountOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {accountOpen ? (
              <div className="absolute bottom-full left-0 right-0 mb-1 rounded-lg border border-line bg-bg-elevated py-1 shadow-xl">
                <Link
                  href="/profile"
                  prefetch={true}
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

      <NewProjectModal
        open={newProjectOpen}
        onClose={() => setNewProjectOpen(false)}
      />

      <RenameProjectModal
        project={renameTarget}
        open={Boolean(renameTarget)}
        onClose={() => setRenameTarget(null)}
      />

      <DeleteProjectModal
        project={deleteTarget}
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
      />
    </>
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
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button
            type="button"
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={closeMenu}
            aria-label="Close overlay"
          />
          <div className="relative z-10 h-full w-72 max-w-[85vw] shadow-2xl transition-transform animate-in slide-in-from-left duration-200">
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
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-bg-elevated text-snow hover:border-accent/40 hover:bg-white/5 active:scale-95 transition md:hidden"
      aria-label="Open navigation menu"
    >
      <Menu className="h-4 w-4" />
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
