/**
 * Canonical public origin for OAuth redirects and absolute links.
 * Set AUTH_URL in production (e.g. https://skillstack.com.pk).
 */
export function getAppBaseUrl(): string {
  const explicit =
    process.env.AUTH_URL?.trim() || process.env.NEXTAUTH_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return "http://localhost:3000";
}

export function getGscRedirectUri(): string {
  return `${getAppBaseUrl()}/api/dashboard/gsc/callback`;
}

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(
    process.env.AUTH_GOOGLE_ID?.trim() && process.env.AUTH_GOOGLE_SECRET?.trim(),
  );
}
