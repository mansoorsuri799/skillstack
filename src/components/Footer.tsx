import Logo from "@/components/Logo";
import { LINKEDIN_URL, X_URL } from "@/lib/seo";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#010409] px-6 py-6 text-ink-muted md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:text-left">
        <div className="flex min-w-0 max-w-full flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex min-w-0 items-center justify-center gap-2.5 sm:justify-start sm:gap-3">
            <Logo size="sm" />
            <span className="truncate text-xs text-ink-muted">
              smc-private limited
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer me"
              className="text-xs font-medium text-ink-muted transition-colors hover:text-accent"
            >
              LinkedIn
            </a>
            <a
              href={X_URL}
              target="_blank"
              rel="noopener noreferrer me"
              className="text-xs font-medium text-ink-muted transition-colors hover:text-accent"
            >
              X
            </a>
          </div>
        </div>
        <p className="shrink-0 text-sm">
          © {new Date().getFullYear()} SkillStack.com.pk
        </p>
      </div>
    </footer>
  );
}
