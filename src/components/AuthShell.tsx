import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  children: ReactNode;
  footer: ReactNode;
};

/** GitHub-style centered auth layout */
export default function AuthShell({ title, children, footer }: AuthShellProps) {
  return (
    <main className="flex min-h-[100svh] flex-col items-center bg-[#010409] px-4 py-10 sm:px-6 sm:py-16">
      <div className="flex w-full max-w-[340px] flex-col items-center sm:max-w-[368px]">
        <Link
          href="/"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm transition hover:opacity-90 sm:h-[72px] sm:w-[72px]"
          aria-label="SkillStack home"
        >
          <Image
            src="/brand/skill-stack.webp"
            alt=""
            width={40}
            height={40}
            className="h-9 w-9 sm:h-10 sm:w-10"
            priority
          />
        </Link>

        <h1 className="mt-6 text-center text-[22px] font-light tracking-tight text-snow sm:mt-7 sm:text-2xl">
          {title}
        </h1>

        <div className="mt-6 w-full rounded-md border border-white/15 bg-[#0d1117] p-4 sm:mt-7 sm:p-5">
          {children}
        </div>

        <div className="mt-4 w-full rounded-md border border-white/10 bg-transparent px-4 py-4 text-center text-sm text-ink-muted sm:mt-5">
          {footer}
        </div>

        <p className="mt-8 text-center text-xs text-ink-muted">
          <Link href="/" className="hover:text-accent hover:underline">
            ← Back to SkillStack
          </Link>
        </p>
      </div>
    </main>
  );
}
