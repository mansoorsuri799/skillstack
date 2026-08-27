import type { SecurityHeadersResult } from "@/lib/audit/types";

const SECURITY_HEADERS = [
  { key: "strict-transport-security", name: "Strict-Transport-Security" },
  { key: "content-security-policy", name: "Content-Security-Policy" },
  { key: "x-frame-options", name: "X-Frame-Options" },
  { key: "x-content-type-options", name: "X-Content-Type-Options" },
  { key: "referrer-policy", name: "Referrer-Policy" },
  { key: "permissions-policy", name: "Permissions-Policy" },
] as const;

function gradeFromMissingCount(missing: number): string {
  if (missing === 0) return "A";
  if (missing === 1) return "B";
  if (missing === 2) return "C";
  if (missing <= 4) return "D";
  return "F";
}

export async function scanSecurityHeaders(
  url: string,
): Promise<SecurityHeadersResult> {
  const response = await fetch(url, {
    method: "GET",
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; SkillStack-Audit/1.0; +https://skillstack.com.pk)",
    },
  });

  const headers = response.headers;
  const checks = SECURITY_HEADERS.map(({ key, name }) => {
    const value = headers.get(key);
    return {
      name,
      present: Boolean(value),
      value: value ?? undefined,
    };
  });

  const missing = checks.filter((h) => !h.present).map((h) => h.name);
  const present = checks.filter((h) => h.present).map((h) => h.name);

  return {
    grade: gradeFromMissingCount(missing.length),
    scannedAt: new Date().toISOString(),
    scannedUrl: url,
    headers: checks,
    missing,
    present,
  };
}

export function securityHeaderFixes(): string[] {
  return [
    "Add Strict-Transport-Security with a long max-age, for example max-age=63072000; includeSubDomains; preload.",
    "Add a Content-Security-Policy that whitelists only the domains the site loads scripts, styles, and fonts from.",
    "Add X-Frame-Options: SAMEORIGIN, or frame-ancestors inside CSP, to block clickjacking.",
    "Add X-Content-Type-Options: nosniff so browsers respect the declared file type.",
    "Add Referrer-Policy: strict-origin-when-cross-origin to limit URL data leaked to third parties.",
    "Add a Permissions-Policy that disables browser features the site does not use (camera, microphone, geolocation).",
  ];
}
