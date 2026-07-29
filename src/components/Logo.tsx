import Link from "next/link";

type LogoProps = {
  href?: string;
  className?: string;
  /** Icon + wordmark (default) or icon only */
  variant?: "full" | "mark";
  /** Slightly smaller footer treatment */
  size?: "sm" | "md";
};

function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Bottom brick */}
      <path d="M10 42 L32 53 L54 42 L32 31 Z" fill="#4A5568" />
      <path d="M10 42 L32 53 L32 58 L10 47 Z" fill="#2D3748" />
      <path d="M54 42 L32 53 L32 58 L54 47 Z" fill="#1A202C" />
      {/* Middle brick */}
      <path d="M10 30 L32 41 L54 30 L32 19 Z" fill="#0F766E" />
      <path d="M10 30 L32 41 L32 46 L10 35 Z" fill="#0A5C56" />
      <path d="M54 30 L32 41 L32 46 L54 35 Z" fill="#064E49" />
      {/* Top brick */}
      <path d="M10 18 L32 29 L54 18 L32 7 Z" fill="#2DD4BF" />
      <path d="M10 18 L32 29 L32 34 L10 23 Z" fill="#14B8A6" />
      <path d="M54 18 L32 29 L32 34 L54 23 Z" fill="#0D9488" />
      <circle cx="52" cy="14" r="3.2" fill="#F0F3F6" />
    </svg>
  );
}

export default function Logo({
  href = "/",
  className = "",
  variant = "full",
  size = "md",
}: LogoProps) {
  const markSize = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  const textSize = size === "sm" ? "text-sm" : "text-lg";

  const inner =
    variant === "mark" ? (
      <Mark className={markSize} />
    ) : (
      <span className="inline-flex items-center gap-2.5">
        <Mark className={markSize} />
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
