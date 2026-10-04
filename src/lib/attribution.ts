export const ATTRIBUTION_COOKIE = "ss_attribution";
export const ATTRIBUTION_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days

export type Attribution = {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  landingPath: string;
  capturedAt: string;
};

function clean(value: string | null | undefined) {
  if (!value) return "";
  return value.trim().slice(0, 120).toLowerCase();
}

export function attributionFromSearchParams(
  params: URLSearchParams,
  landingPath = "/",
): Attribution | null {
  const utmSource = clean(params.get("utm_source"));
  if (!utmSource) return null;

  return {
    utmSource,
    utmMedium: clean(params.get("utm_medium")),
    utmCampaign: clean(params.get("utm_campaign")),
    utmContent: clean(params.get("utm_content")),
    utmTerm: clean(params.get("utm_term")),
    landingPath: landingPath.slice(0, 200) || "/",
    capturedAt: new Date().toISOString(),
  };
}

/** Friendly tag stored on the user — e.g. instagram from utm_source=instagram */
export function signupSourceFromAttribution(attr: Attribution | null): string | null {
  if (!attr?.utmSource) return null;
  return attr.utmSource;
}

export function serializeAttribution(attr: Attribution): string {
  return encodeURIComponent(JSON.stringify(attr));
}

export function parseAttribution(raw: string | undefined | null): Attribution | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    const data = JSON.parse(decoded) as Partial<Attribution>;
    const utmSource = clean(data.utmSource);
    if (!utmSource) return null;
    return {
      utmSource,
      utmMedium: clean(data.utmMedium),
      utmCampaign: clean(data.utmCampaign),
      utmContent: clean(data.utmContent),
      utmTerm: clean(data.utmTerm),
      landingPath: typeof data.landingPath === "string" ? data.landingPath.slice(0, 200) : "/",
      capturedAt:
        typeof data.capturedAt === "string" ? data.capturedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function attributionCookieOptions(secure: boolean) {
  return {
    path: "/",
    maxAge: ATTRIBUTION_MAX_AGE_SEC,
    sameSite: "lax" as const,
    secure,
    httpOnly: false, // readable by client capture + register body fallback
  };
}

export function userAttributionFields(attr: Attribution | null) {
  const signupSource = signupSourceFromAttribution(attr);
  if (!attr || !signupSource) return null;
  return {
    signupSource,
    utmSource: attr.utmSource,
    utmMedium: attr.utmMedium || undefined,
    utmCampaign: attr.utmCampaign || undefined,
    utmContent: attr.utmContent || undefined,
    utmTerm: attr.utmTerm || undefined,
    landingPath: attr.landingPath || undefined,
    attributionCapturedAt: attr.capturedAt
      ? new Date(attr.capturedAt)
      : new Date(),
  };
}
