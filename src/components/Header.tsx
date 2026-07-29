"use client";

import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

const links = [
  { href: "/#services", label: "Services" },
  { href: "/#process", label: "Process" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

export default function Header() {
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  useMotionValueEvent(scrollY, "change", (y) => {
    setSolid(y > 48);
  });

  const showAuth = mounted && status === "authenticated" && session?.user;
  const showGuest = mounted && status !== "loading" && !showAuth;

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50"
      animate={{
        backgroundColor: solid ? "rgba(13, 17, 23, 0.85)" : "rgba(1, 4, 9, 0)",
        borderBottomColor: solid
          ? "rgba(240, 243, 246, 0.1)"
          : "rgba(255, 255, 255, 0)",
        backdropFilter: solid ? "blur(12px)" : "blur(0px)",
      }}
      transition={{ duration: 0.25 }}
      style={{ borderBottomWidth: 1 }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 md:px-8">
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight text-white"
        >
          SkillStack
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-white/55 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex min-h-9 items-center gap-3">
          {showAuth ? (
            <>
              <span className="hidden text-sm text-white/55 sm:inline">
                {session.user.name || session.user.email}
              </span>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-md border border-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Sign out
              </button>
            </>
          ) : null}
          {showGuest ? (
            <>
              <Link
                href="/login"
                className="hidden text-sm text-white/70 transition-colors hover:text-white sm:inline"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-[#010409] transition-colors hover:bg-white/90"
              >
                Register
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </motion.header>
  );
}
