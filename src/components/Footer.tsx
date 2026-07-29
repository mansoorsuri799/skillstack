export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#010409] px-6 py-8 text-ink-muted md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-sm font-semibold text-snow/80">
            SkillStack
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            SkillStack Private Limited
          </p>
        </div>
        <p className="text-sm">
          © {new Date().getFullYear()} SkillStack.com.pk · Web development, SEO
          & digital growth
        </p>
      </div>
    </footer>
  );
}
