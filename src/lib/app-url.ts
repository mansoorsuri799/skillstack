/**
 * Canonical public origin for OAuth redirects and absolute links.
 * Prefer the incoming request origin so local vs production always matches
 * the URL in the browser (avoids AUTH_URL=localhost while on production).
 * Set AUTH_URL in production when you need a fixed canonical URL for emails, etc.
 */
export function getRequestOrigin(request: Request): string | null {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host =
    forwardedHost?.split(",")[0]?.trim() ??
    request.headers.get("host")?.split(",")[0]?.trim();
  if (!host) return null;

  const forwardedProto = request.headers.get("x-forwarded-proto");
  const proto =
    forwardedProto?.split(",")[0]?.trim() ??
    (host.includes("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");

  return `${proto}://${host}`;
}

export function getAppBaseUrl(request?: Request): string {
  if (request) {
    const origin = getRequestOrigin(request);
    if (origin) return origin.replace(/\/$/, "");
  }

  const explicit =
    process.env.AUTH_URL?.trim() || process.env.NEXTAUTH_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return "http://localhost:3000";
}

export function getGscRedirectUri(request?: Request): string {
  return `${getAppBaseUrl(request)}/api/dashboard/gsc/callback`;
}

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(
    process.env.AUTH_GOOGLE_ID?.trim() && process.env.AUTH_GOOGLE_SECRET?.trim(),
  );
}
