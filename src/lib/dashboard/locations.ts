export const RESEARCH_LOCATIONS = [
  { code: 2840, label: "United States" },
  { code: 2826, label: "United Kingdom" },
  { code: 2124, label: "Canada" },
  { code: 2036, label: "Australia" },
  { code: 2080, label: "Germany" },
  { code: 2356, label: "India" },
  { code: 2586, label: "Pakistan" },
  { code: 2784, label: "United Arab Emirates" },
] as const;

/** Aggregate keyword research across every market in RESEARCH_LOCATIONS */
export const ALL_LOCATIONS_CODE = 0;

export const KEYWORD_RESEARCH_LOCATIONS = [
  { code: ALL_LOCATIONS_CODE, label: "All locations" },
  ...RESEARCH_LOCATIONS,
] as const;

export function isAllLocations(code: number) {
  return code === ALL_LOCATIONS_CODE;
}

export const KEYWORD_LIMITS = [25, 50, 100, 150] as const;

export const LOCATION_FLAGS: Record<number, string> = {
  [ALL_LOCATIONS_CODE]: "🌍",
  2840: "🇺🇸",
  2826: "🇬🇧",
  2124: "🇨🇦",
  2036: "🇦🇺",
  2080: "🇩🇪",
  2356: "🇮🇳",
  2586: "🇵🇰",
  2784: "🇦🇪",
};

export const KEYWORD_LOCATION_OPTIONS = KEYWORD_RESEARCH_LOCATIONS.map((l) => ({
  value: String(l.code),
  label: `${LOCATION_FLAGS[l.code] ?? "🌐"} ${l.label}`,
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
