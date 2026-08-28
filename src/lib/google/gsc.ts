import crypto from "crypto";
import { getAppBaseUrl, getGscRedirectUri } from "@/lib/app-url";
import { normalizeDomain } from "@/lib/dataforseo/client";

const GSC_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
const GSC_API = "https://www.googleapis.com/webmasters/v3";

function authSecret() {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) throw new Error("AUTH_SECRET is not configured.");
  return secret;
}

export function signOAuthState(userId: string, redirectUri: string) {
  const payload = Buffer.from(
    JSON.stringify({ userId, ts: Date.now(), redirectUri }),
  ).toString("base64url");
  const sig = crypto
    .createHmac("sha256", authSecret())
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyOAuthState(state: string): {
  userId: string;
  redirectUri: string;
} | null {
  const [payload, sig] = state.split(".");
  if (!payload || !sig) return null;

  const expected = crypto
    .createHmac("sha256", authSecret())
    .update(payload)
    .digest("base64url");
  if (sig !== expected) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      userId?: string;
      ts?: number;
      redirectUri?: string;
    };
    if (!data.userId || !data.ts) return null;
    if (Date.now() - data.ts > 15 * 60 * 1000) return null;
    return {
      userId: data.userId,
      redirectUri: data.redirectUri ?? getGscRedirectUri(),
    };
  } catch {
    return null;
  }
}

export function getGscConnectUrl(state: string, redirectUri: string) {
  const clientId = process.env.AUTH_GOOGLE_ID?.trim();
  if (!clientId) throw new Error("AUTH_GOOGLE_ID is not configured.");
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GSC_SCOPE,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });

  return `${GOOGLE_AUTH}?${params.toString()}`;
}

async function exchangeToken(body: Record<string, string>) {
  const clientId = process.env.AUTH_GOOGLE_ID?.trim();
  const clientSecret = process.env.AUTH_GOOGLE_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth is not configured.");
  }

  const res = await fetch(GOOGLE_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      ...body,
    }),
  });

  const data = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };

  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description ?? data.error ?? "Token exchange failed");
  }

  return data;
}

export async function exchangeCodeForTokens(code: string, redirectUri: string) {
  return exchangeToken({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });
}

export async function refreshAccessToken(refreshToken: string) {
  return exchangeToken({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
}

export async function listGscSites(accessToken: string) {
  const res = await fetch(`${GSC_API}/sites`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = (await res.json()) as {
    siteEntry?: Array<{ siteUrl?: string; permissionLevel?: string }>;
    error?: { message?: string };
  };

  if (!res.ok) {
    throw new Error(data.error?.message ?? "Could not list Search Console sites");
  }

  return (data.siteEntry ?? [])
    .filter((s) => s.siteUrl && s.permissionLevel !== "siteUnverifiedUser")
    .map((s) => s.siteUrl as string);
}

export function pickGscSiteForDomain(sites: string[], domain: string) {
  const normalized = normalizeDomain(domain);
  const domainProperty = `sc-domain:${normalized}`;

  if (sites.includes(domainProperty)) return domainProperty;

  const matches = sites.filter((site) => siteMatchesDomain(site, normalized));
  return matches[0] ?? null;
}

export function siteMatchesDomain(siteUrl: string, normalizedDomain: string) {
  const lower = siteUrl.toLowerCase();
  if (siteUrl === `sc-domain:${normalizedDomain}`) return true;
  return (
    lower.includes(normalizedDomain) ||
    lower === `https://${normalizedDomain}/` ||
    lower === `http://${normalizedDomain}/` ||
    lower === `https://www.${normalizedDomain}/`
  );
}

export function listMatchingGscSites(sites: string[], domain: string) {
  const normalized = normalizeDomain(domain);
  return sites.filter((site) => siteMatchesDomain(site, normalized));
}

export type GscRow = {
  key: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export async function queryGscAnalytics(
  accessToken: string,
  siteUrl: string,
  dimension: "query" | "page" | "country" | "device",
  days = 28,
  rowLimit = 25,
): Promise<GscRow[]> {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);

  const format = (d: Date) => d.toISOString().slice(0, 10);

  const res = await fetch(
    `${GSC_API}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate: format(start),
        endDate: format(end),
        dimensions: [dimension],
        rowLimit,
      }),
    },
  );

  const data = (await res.json()) as {
    rows?: Array<{
      keys?: string[];
      clicks?: number;
      impressions?: number;
      ctr?: number;
      position?: number;
    }>;
    error?: { message?: string };
  };

  if (!res.ok) {
    throw new Error(data.error?.message ?? "Search Console query failed");
  }

  return (data.rows ?? []).map((row) => ({
    key: row.keys?.[0] ?? "—",
    clicks: row.clicks ?? 0,
    impressions: row.impressions ?? 0,
    ctr: Math.round((row.ctr ?? 0) * 1000) / 10,
    position: Math.round((row.position ?? 0) * 10) / 10,
  }));
}

export async function getValidGscAccessToken(project: {
  gscRefreshToken?: string | null;
  gscAccessToken?: string | null;
  gscTokenExpiry?: Date | null;
}) {
  const refreshToken = project.gscRefreshToken;
  if (!refreshToken) throw new Error("Search Console is not connected.");

  const expiry = project.gscTokenExpiry?.getTime() ?? 0;
  if (project.gscAccessToken && expiry > Date.now() + 60_000) {
    return project.gscAccessToken;
  }

  const tokens = await refreshAccessToken(refreshToken);
  return {
    accessToken: tokens.access_token!,
    refreshToken: tokens.refresh_token ?? refreshToken,
    expiresAt: new Date(Date.now() + (tokens.expires_in ?? 3600) * 1000),
  };
}
