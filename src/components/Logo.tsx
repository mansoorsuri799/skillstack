import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  href?: string;
  className?: string;
  /** Icon + wordmark (default) or icon only */
  variant?: "full" | "mark";
  /** Slightly smaller footer / header treatment */
  size?: "sm" | "md";
};

const MARK_SRC = "/brand/skill-stack.webp";

export default function Logo({
  href = "/",
  className = "",
  variant = "full",
  size = "md",
}: LogoProps) {
  const px = size === "sm" ? 28 : 32;
  const textSize = size === "sm" ? "text-sm" : "text-lg";

  const mark = (
    <Image
      src={MARK_SRC}
      alt=""
      width={px}
      height={px}
      className="shrink-0 invert"
      priority
    />
  );

  const inner =
    variant === "mark" ? (
      mark
    ) : (
      <span className="inline-flex items-center gap-2.5">
        {mark}
        <span
          className={`font-display font-bold tracking-tight text-white ${textSize}`}
        >
          SkillStack
          <span
            className="ml-0.5 inline-block align-super text-[0.45em] text-accent"
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
