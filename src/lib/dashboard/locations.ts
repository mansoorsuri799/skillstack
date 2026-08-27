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

export const KEYWORD_LIMITS = [25, 50, 100, 150] as const;

export const KEYWORD_MODES = [
  { value: "auto", label: "Auto" },
  { value: "suggestions", label: "Suggestions" },
  { value: "related", label: "Related" },
  { value: "ideas", label: "Ideas" },
] as const;

export type KeywordMode = (typeof KEYWORD_MODES)[number]["value"];

export const DOMAIN_SCOPES = [
  { value: "domain", label: "Domain" },
  { value: "subdomains", label: "Subdomains" },
] as const;
