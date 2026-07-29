import Link from "next/link";

const footerLinks = [
  { href: "/services", label: "Services" },
  { href: "/process", label: "Process" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#010409] px-6 py-10 text-ink-muted md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-display text-sm font-semibold text-snow/80">
            SkillStack
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            SkillStack Private Limited
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-ink-muted transition-colors hover:text-snow"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-sm sm:max-w-xs sm:text-right">
          © {new Date().getFullYear()} SkillStack.com.pk · Web development, SEO
          & digital growth
        </p>
      </div>
    </footer>
  );
}
