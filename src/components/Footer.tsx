import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#010409] px-6 py-6 text-ink-muted md:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Logo size="sm" />
          <span className="hidden truncate text-xs text-ink-muted sm:inline">
            SkillStack Private Limited
          </span>
        </div>
        <p className="shrink-0 text-sm">
          © {new Date().getFullYear()} SkillStack.com.pk
        </p>
      </div>
    </footer>
  );
}
