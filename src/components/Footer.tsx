import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#010409] px-6 py-6 text-ink-muted md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:text-left">
        <div className="flex min-w-0 max-w-full items-center justify-center gap-2.5 sm:justify-start sm:gap-3">
          <Logo size="sm" />
          <span className="truncate text-xs text-ink-muted">
            smc-private limited
          </span>
        </div>
        <p className="shrink-0 text-sm">
          © {new Date().getFullYear()} SkillStack.com.pk
        </p>
      </div>
    </footer>
  );
}
