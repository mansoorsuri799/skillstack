"use client";

import Image from "next/image";

function initialsFromName(name?: string | null) {
  if (!name?.trim()) return "U";
  return name.trim().charAt(0).toUpperCase();
}

export function UserAvatar({
  name,
  image,
  size = "md",
  className = "",
}: {
  name?: string | null;
  image?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "h-7 w-7 text-[11px]",
    md: "h-8 w-8 text-xs",
    lg: "h-16 w-16 text-xl",
  }[size];
  const px = size === "sm" ? 28 : size === "md" ? 32 : 64;

  return (
    <span
      className={`relative inline-flex shrink-0 overflow-hidden rounded-full border border-line bg-accent/15 ${sizes} ${className}`}
    >
      {image ? (
        <Image
          src={image}
          alt={name ? `${name} profile photo` : "Profile photo"}
          width={px}
          height={px}
          className="h-full w-full object-cover"
          unoptimized
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-semibold text-accent">
          {initialsFromName(name)}
        </span>
      )}
    </span>
  );
}
