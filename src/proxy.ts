import NextAuth from "next-auth";
import { NextResponse, type NextRequest } from "next/server";
import authConfig from "@/auth.config";
import {
  ATTRIBUTION_COOKIE,
  attributionCookieOptions,
  attributionFromSearchParams,
  serializeAttribution,
} from "@/lib/attribution";

const { auth } = NextAuth(authConfig);

/**
 * Pages that require an authenticated session.
 * Unauthenticated visitors are redirected to /login?callbackUrl=<current path>.
 */
const PROTECTED_PATHS = ["/profile", "/pricing/success", "/dashboard"];

/** Social / SEO crawlers should bypass Auth.js entirely (no Set-Cookie). */
const CRAWLER_UA =
  /LinkedInBot|Twitterbot|facebookexternalhit|Facebot|Slackbot|Discordbot|WhatsApp|TelegramBot|Googlebot|bingbot|Baiduspider|DuckDuckBot|Applebot|Embedly|Quora Link Preview|Showyoubot|outbrain|pinterest|redditbot|vkShare|W3C_Validator/i;

function withAttributionCookie(req: NextRequest, res: NextResponse) {
  // First-touch only — do not overwrite an existing Instagram/ad cookie.
  if (req.cookies.get(ATTRIBUTION_COOKIE)?.value) return res;

  const attr = attributionFromSearchParams(
    req.nextUrl.searchParams,
    req.nextUrl.pathname,
  );
  if (!attr) return res;

  res.cookies.set(
    ATTRIBUTION_COOKIE,
    serializeAttribution(attr),
    attributionCookieOptions(req.nextUrl.protocol === "https:"),
  );
  return res;
}

const authProxy = auth((req) => {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isProtected && !req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return withAttributionCookie(req, NextResponse.redirect(loginUrl));
  }

  return withAttributionCookie(req, NextResponse.next());
});

export default function proxy(req: NextRequest) {
  const ua = req.headers.get("user-agent") ?? "";
  if (CRAWLER_UA.test(ua)) {
    // Let LinkedIn / social scrapers read public HTML + images without auth cookies.
    return NextResponse.next();
  }
  return authProxy(req, {} as never);
}

export const config = {
  /**
   * Run on all page routes except Next.js internals and static assets.
   * API routes that already call auth() directly handle their own 401s.
   */
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|json|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff2?|ttf|otf)).*)",
  ],
};
