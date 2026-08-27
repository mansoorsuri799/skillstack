import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  href?: string;
  className?: string;
  /** Icon + wordmark (default) or icon only */
  variant?: "full" | "mark";
  /** Slightly smaller footer / header treatment */
  size?: "sm" | "md";
  /** Only for above-the-fold LCP (e.g. header). Avoid on footer. */
  priority?: boolean;
};

const MARK_SRC = "/brand/skill-stack.webp";

export default function Logo({
  href = "/",
  className = "",
  variant = "full",
  size = "md",
  priority = false,
}: LogoProps) {
  const px = size === "sm" ? 34 : 40;
  const textSize = size === "sm" ? "text-base" : "text-xl";

  const mark = (
    <Image
      src={MARK_SRC}
      alt=""
      width={px}
      height={px}
      className="shrink-0 invert"
      priority={priority}
    />
  );

  const inner =
    variant === "mark" ? (
      mark
    ) : (
      <span className="inline-flex items-center gap-1.5">
        {mark}
        <span
          className={`font-display font-bold tracking-tight text-white ${textSize}`}
        >
          SkillStack
          <span
            className="ml-[0.15em] inline-block translate-y-[0.12em] align-baseline text-[0.55em] leading-none text-[#2cd4bf]"
            aria-hidden
          >
            ●
          </span>
        </span>
      </span>
    );

  if (!href) {
    return <span className={className}>{inner}</span>;
  }

  return (
    <Link
      href={href}
      className={`items-center transition-opacity hover:opacity-90 ${
        className.includes("hidden") ? "" : "inline-flex"
      } ${className}`}
      aria-label="SkillStack home"
    >
      {inner}
    </Link>
  );
}
