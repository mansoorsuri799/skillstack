"use client";

import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import { HEADER_HEIGHT_CLASS } from "@/lib/layout";

const links = [
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/process", label: "Process" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useMotionValueEvent(scrollY, "change", (y) => {
    setSolid(y > 48);
  });

  const showAuth = status === "authenticated" && Boolean(session?.user);
  const showGuest = status === "unauthenticated";
  const isLoading = status === "loading";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,backdrop-filter] duration-200 ${HEADER_HEIGHT_CLASS} ${
        solid || menuOpen
          ? "border-white/10 bg-[#0d1117]/95 backdrop-blur-md"
          : "border-white/10 bg-[#010409]/90 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 md:px-8">
        <Logo size="sm" priority className="relative z-10 shrink-0" />

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-white/55 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="relative z-10 flex shrink-0 items-center gap-2">
          {isLoading ? (
            <div className="hidden h-9 w-36 rounded-md sm:block" />
          ) : null}

          {showAuth ? (
            <>
              <Link
                href="/dashboard"
                className="hidden rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-[#010409] hover:bg-accent-deep sm:inline-flex sm:px-4 sm:py-2 sm:text-sm"
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="hidden rounded-md border border-white/20 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 sm:inline-flex sm:px-4 sm:py-2 sm:text-sm"
              >
                Profile
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="hidden rounded-md border border-white/20 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 sm:inline-flex sm:px-4 sm:py-2 sm:text-sm"
              >
                Sign out
              </button>
            </>
          ) : null}

          {showGuest ? (
            <>
              <Link
                href="/login"
                className="hidden rounded-md border border-white/20 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 sm:inline-flex sm:px-4 sm:py-2 sm:text-sm"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="hidden rounded-md bg-white px-3 py-1.5 text-xs font-medium text-[#010409] hover:bg-white/90 sm:inline-flex sm:px-4 sm:py-2 sm:text-sm"
              >
                Register
              </Link>
            </>
          ) : null}

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-white md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="flex w-4 flex-col gap-1" aria-hidden>
              <span
                className={`h-0.5 w-full rounded-full bg-white transition ${menuOpen ? "translate-y-[6px] rotate-45" : ""}`}
              />
              <span
                className={`h-0.5 w-full rounded-full bg-white transition ${menuOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`h-0.5 w-full rounded-full bg-white transition ${menuOpen ? "-translate-y-[6px] -rotate-45" : ""}`}
              />
            </span>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <motion.nav
          id="mobile-nav"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-x-0 top-full max-h-[calc(100svh-4rem)] overflow-y-auto border-b border-white/10 bg-[#0d1117] px-4 pb-6 pt-2 sm:max-h-[calc(100svh-4.5rem)] md:hidden"
          aria-label="Mobile"
        >
          <ul className="flex flex-col">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block border-b border-white/5 px-1 py-3.5 text-base text-white/85"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-col gap-2">
            {showAuth ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="w-full rounded-md bg-accent px-4 py-3 text-center text-sm font-semibold text-[#010409]"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="w-full rounded-md border border-accent/40 bg-accent/10 px-4 py-3 text-center text-sm font-medium text-accent"
                >
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    void signOut({ callbackUrl: "/" });
                  }}
                  className="w-full rounded-md border border-white/20 px-4 py-3 text-sm font-medium text-white"
                >
                  Sign out
                </button>
              </>
            ) : null}
            {showGuest ? (
              <>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="w-full rounded-md border border-white/20 px-4 py-3 text-center text-sm font-medium text-white"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="w-full rounded-md bg-white px-4 py-3 text-center text-sm font-semibold text-[#010409]"
                >
                  Register
                </Link>
              </>
            ) : null}
          </div>
        </motion.nav>
      ) : null}
    </header>
  );
}
