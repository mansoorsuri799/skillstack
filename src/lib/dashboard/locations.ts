/** Aggregate code for multi-market mode */
export const ALL_LOCATIONS_CODE = 0;

/**
 * Default market for dashboard tools.
 * Prefer a single country over All locations to avoid multi-market Labs/Ads spend.
 */
export const DEFAULT_LOCATION_CODE = 2586; // Pakistan

/** Country used when Labs/SERP APIs require a real location_code */
export const DEFAULT_COUNTRY_LOCATION_CODE = 2586; // Pakistan (SkillStack primary market)

/**
 * Markets used for "All locations" aggregation.
 * Keep this small — each entry is one or more paid DataForSEO calls.
 */
export const COST_EFFICIENT_MARKETS = [
  { code: 2586, label: "Pakistan", flag: "🇵🇰", lang: "en" },
  { code: 2840, label: "United States", flag: "🇺🇸", lang: "en" },
  { code: 2826, label: "United Kingdom", flag: "🇬🇧", lang: "en" },
  { code: 2356, label: "India", flag: "🇮🇳", lang: "en" },
] as const;

export const RESEARCH_LOCATIONS = [
  { code: 2586, label: "Pakistan", flag: "🇵🇰", lang: "en" },
  { code: 2840, label: "United States", flag: "🇺🇸", lang: "en" },
  { code: 2826, label: "United Kingdom", flag: "🇬🇧", lang: "en" },
  { code: 2124, label: "Canada", flag: "🇨🇦", lang: "en" },
  { code: 2250, label: "France", flag: "🇫🇷", lang: "fr" },
  { code: 2080, label: "Germany", flag: "🇩🇪", lang: "de" },
  { code: 2036, label: "Australia", flag: "🇦🇺", lang: "en" },
  { code: 2504, label: "Morocco", flag: "🇲🇦", lang: "fr" },
  { code: 2012, label: "Algeria", flag: "🇩🇿", lang: "fr" },
  { code: 2056, label: "Belgium", flag: "🇧🇪", lang: "fr" },
  { code: 2788, label: "Tunisia", flag: "🇹🇳", lang: "fr" },
  { code: 2724, label: "Spain", flag: "🇪🇸", lang: "es" },
  { code: 2380, label: "Italy", flag: "🇮🇹", lang: "it" },
  { code: 2528, label: "Netherlands", flag: "🇳🇱", lang: "nl" },
  { code: 2756, label: "Switzerland", flag: "🇨🇭", lang: "de" },
  { code: 2076, label: "Brazil", flag: "🇧🇷", lang: "pt" },
  { code: 2484, label: "Mexico", flag: "🇲🇽", lang: "es" },
  { code: 2356, label: "India", flag: "🇮🇳", lang: "en" },
  { code: 2784, label: "United Arab Emirates", flag: "🇦🇪", lang: "ar" },
  { code: 2682, label: "Saudi Arabia", flag: "🇸🇦", lang: "ar" },
] as const;

export const KEYWORD_RESEARCH_LOCATIONS = [
  { code: ALL_LOCATIONS_CODE, label: "All locations", flag: "🌍", lang: "en" },
  ...RESEARCH_LOCATIONS,
] as const;

export function isAllLocations(code: number) {
  return code === ALL_LOCATIONS_CODE;
}

/** Labs endpoints need a country — map All locations to the default country. */
export function resolveLabsLocationCode(code: number) {
  return isAllLocations(code) ? DEFAULT_COUNTRY_LOCATION_CODE : code;
}

/** Prefer the market's native Labs language so location+language pairs stay valid. */
export function resolveLanguageForLocation(
  locationCode: number,
  fallback = "en",
) {
  if (isAllLocations(locationCode)) return fallback;
  const match = RESEARCH_LOCATIONS.find((l) => l.code === locationCode);
  return match?.lang ?? fallback;
}

/** Lower default limits — each extra row costs Labs/Ads enrichment. */
export const KEYWORD_LIMITS = [25, 50, 75, 100] as const;

export const LOCATION_FLAGS: Record<number, string> = {
  [ALL_LOCATIONS_CODE]: "🌍",
  2586: "🇵🇰",
  2840: "🇺🇸",
  2826: "🇬🇧",
  2124: "🇨🇦",
  2250: "🇫🇷",
  2080: "🇩🇪",
  2036: "🇦🇺",
  2504: "🇲🇦",
  2012: "🇩🇿",
  2056: "🇧🇪",
  2788: "🇹🇳",
  2724: "🇪🇸",
  2380: "🇮🇹",
  2528: "🇳🇱",
  2756: "🇨🇭",
  2076: "🇧🇷",
  2484: "🇲🇽",
  2356: "🇮🇳",
  2784: "🇦🇪",
  2682: "🇸🇦",
};

export const KEYWORD_LOCATION_OPTIONS = KEYWORD_RESEARCH_LOCATIONS.map((l) => ({
  value: String(l.code),
  label: l.label,
}));

export const KEYWORD_LIMIT_OPTIONS = KEYWORD_LIMITS.map((n) => ({
  value: String(n),
  label: `${n} results`,
}));

export const KEYWORD_MODES = [
  { value: "auto", label: "Auto" },
  { value: "suggestions", label: "Suggestions" },
  { value: "related", label: "Related" },
  { value: "ideas", label: "Ideas" },
] as const;

export const KEYWORD_MODE_OPTIONS = KEYWORD_MODES.map((m) => ({
  value: m.value,
  label: m.label,
}));

export type KeywordMode = (typeof KEYWORD_MODES)[number]["value"];

export const DOMAIN_SCOPES = [
  { value: "domain", label: "Domain" },
  { value: "subdomains", label: "Subdomains" },
] as const;
