"use client";

import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";

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
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  useMotionValueEvent(scrollY, "change", (y) => {
    setSolid(y > 48);
    if (y > 48) setMenuOpen(false);
  });

  const showAuth = mounted && status === "authenticated" && session?.user;
  const showGuest = mounted && status !== "loading" && !showAuth;

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50"
      animate={{
        backgroundColor: solid
          ? "rgba(13, 17, 23, 0.92)"
          : menuOpen
            ? "rgba(1, 4, 9, 0.96)"
            : "rgba(1, 4, 9, 0)",
        borderBottomColor:
          solid || menuOpen
            ? "rgba(240, 243, 246, 0.1)"
            : "rgba(255, 255, 255, 0)",
        backdropFilter: solid || menuOpen ? "blur(12px)" : "blur(0px)",
      }}
      transition={{ duration: 0.25 }}
      style={{ borderBottomWidth: 1 }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5">
        <Logo size="sm" className="min-w-0 shrink sm:hidden" />
        <Logo className="hidden min-w-0 shrink sm:inline-flex" />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
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

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {showAuth ? (
            <>
              <span className="hidden max-w-[9rem] truncate text-sm text-white/55 lg:inline">
                {session.user.name || session.user.email}
              </span>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-md border border-white/20 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/10 sm:px-4 sm:py-2 sm:text-sm"
              >
                Sign out
              </button>
            </>
          ) : null}

          {showGuest ? (
            <>
              <Link
                href="/login"
                className="rounded-md border border-white/20 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/10 sm:px-4 sm:py-2 sm:text-sm"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-[#010409] transition-colors hover:bg-white/90 sm:px-4 sm:py-2 sm:text-sm"
              >
                Register
              </Link>
            </>
          ) : null}

          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/15 text-white md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="sr-only">{menuOpen ? "Close" : "Menu"}</span>
            <span className="flex w-3.5 flex-col gap-1" aria-hidden>
              <span
                className={`h-px w-full bg-white transition ${menuOpen ? "translate-y-[5px] rotate-45" : ""}`}
              />
              <span
                className={`h-px w-full bg-white transition ${menuOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`h-px w-full bg-white transition ${menuOpen ? "-translate-y-[5px] -rotate-45" : ""}`}
              />
            </span>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="mobile-nav"
          className="border-t border-white/10 px-4 py-3 md:hidden"
          aria-label="Mobile"
        >
          <ul className="flex flex-col gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-md px-3 py-2.5 text-sm text-white/75 transition-colors hover:bg-white/5 hover:text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </motion.header>
  );
}
