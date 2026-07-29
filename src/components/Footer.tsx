import Link from "next/link";
import Logo from "@/components/Logo";
import { LINKEDIN_URL, X_URL } from "@/lib/seo";

const nav = [
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/process", label: "Process" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const legal = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#010409] px-6 py-10 text-ink-muted md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
          <div className="flex min-w-0 flex-col items-center gap-2 sm:items-start">
            <div className="flex items-center gap-2.5">
              <Logo size="sm" />
              <span className="text-xs text-ink-muted">smc-private limited</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-ink-muted">
              Web development &amp; SEO — built to rank and earn.
            </p>
            <div className="mt-1 flex items-center gap-3">
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer me"
                className="text-xs font-medium transition-colors hover:text-accent"
              >
                LinkedIn
              </a>
              <a
                href={X_URL}
                target="_blank"
                rel="noopener noreferrer me"
                className="text-xs font-medium transition-colors hover:text-accent"
              >
                X
              </a>
            </div>
          </div>

          <nav aria-label="Footer" className="flex flex-col items-center gap-6 sm:items-end">
            <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 sm:justify-end">
              {nav.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-muted transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 sm:justify-end">
              {legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-white/40 transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="border-t border-white/10 pt-6 text-center text-sm sm:text-left">
          © {new Date().getFullYear()} SkillStack.com.pk
        </p>
      </div>
    </footer>
  );
}
