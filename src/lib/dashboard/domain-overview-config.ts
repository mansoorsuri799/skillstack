export type DomainScope = "exact_url" | "subfolder" | "domain" | "subdomains";

export type DomainKeywordSort = "rank" | "traffic" | "volume" | "score" | "cpc";

export const DOMAIN_OVERVIEW_SCOPES = [
  {
    value: "exact_url" as const,
    label: "Exact URL",
    description: "One page only",
    example: "example.com/path",
  },
  {
    value: "subfolder" as const,
    label: "Subfolder",
    description: "The path and everything under it",
    example: "example.com/path/*",
  },
  {
    value: "domain" as const,
    label: "Domain",
    description: "The hostname, without subdomains",
    example: "example.com/*",
  },
  {
    value: "subdomains" as const,
    label: "Subdomains",
    description: "The domain plus all its subdomains",
    example: "*.example.com/*",
  },
];

export const DOMAIN_KEYWORD_SORTS = [
  { value: "rank" as const, label: "By Rank" },
  { value: "traffic" as const, label: "By Traffic" },
  { value: "volume" as const, label: "By Volume" },
  { value: "score" as const, label: "By Score" },
  { value: "cpc" as const, label: "By CPC" },
];

/** Common markets for searchable country picker */
export const DOMAIN_OVERVIEW_LOCATIONS = [
  { code: 2840, label: "United States" },
  { code: 2826, label: "United Kingdom" },
  { code: 2124, label: "Canada" },
  { code: 2036, label: "Australia" },
  { code: 2080, label: "Germany" },
  { code: 2250, label: "France" },
  { code: 2380, label: "Italy" },
  { code: 2724, label: "Spain" },
  { code: 2356, label: "India" },
  { code: 2586, label: "Pakistan" },
  { code: 2784, label: "United Arab Emirates" },
  { code: 2392, label: "Japan" },
  { code: 2410, label: "South Korea" },
  { code: 2076, label: "Brazil" },
  { code: 2484, label: "Mexico" },
  { code: 2710, label: "South Africa" },
  { code: 2344, label: "Hong Kong" },
  { code: 2702, label: "Singapore" },
  { code: 2608, label: "Philippines" },
  { code: 2764, label: "Thailand" },
  { code: 2792, label: "Turkey" },
  { code: 2528, label: "Netherlands" },
  { code: 2756, label: "Switzerland" },
  { code: 2616, label: "Poland" },
  { code: 2008, label: "Albania" },
  { code: 2012, label: "Algeria" },
  { code: 2024, label: "Angola" },
  { code: 2032, label: "Argentina" },
] as const;

export function resolveDomainTarget(rawInput: string, scope: DomainScope) {
  const trimmed = rawInput.trim();
  const withoutProtocol = trimmed
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "");
  const host = (withoutProtocol.split("/")[0] ?? withoutProtocol).toLowerCase();

  if (scope === "exact_url") {
    const path = withoutProtocol.includes("/") ? withoutProtocol : host;
    return {
      target: path.includes("/") ? path : host,
      hostDomain: host,
      includeSubdomains: false,
      scopeLabel: path,
    };
  }

  if (scope === "subfolder") {
    const path = withoutProtocol.includes("/") ? withoutProtocol : `${host}/`;
    return {
      target: path,
      hostDomain: host,
      includeSubdomains: true,
      scopeLabel: `${path}/*`,
    };
  }

  if (scope === "domain") {
    return {
      target: host,
      hostDomain: host,
      includeSubdomains: false,
      scopeLabel: `${host}/*`,
    };
  }

  return {
    target: host,
    hostDomain: host,
    includeSubdomains: true,
    scopeLabel: `*.${host}/*`,
  };
}

export type DomainKeywordRow = {
  keyword: string;
  searchVolume: number | null;
  cpc: number | null;
  rank: number | null;
  url: string | null;
  etv?: number | null;
  difficulty?: number | null;
};

export function sortDomainKeywords(
  keywords: DomainKeywordRow[],
  sortBy: DomainKeywordSort,
) {
  const rows = [...keywords];
  switch (sortBy) {
    case "rank":
      return rows.sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
    case "traffic":
      return rows.sort((a, b) => (b.etv ?? 0) - (a.etv ?? 0));
    case "volume":
      return rows.sort((a, b) => (b.searchVolume ?? 0) - (a.searchVolume ?? 0));
    case "score":
      return rows.sort(
        (a, b) => (b.difficulty ?? -1) - (a.difficulty ?? -1),
      );
    case "cpc":
      return rows.sort((a, b) => (b.cpc ?? 0) - (a.cpc ?? 0));
    default:
      return rows;
  }
}

export function scopeLabelFor(value: DomainScope) {
  return DOMAIN_OVERVIEW_SCOPES.find((s) => s.value === value)?.label ?? value;
}

export function sortLabelFor(value: DomainKeywordSort) {
  return DOMAIN_KEYWORD_SORTS.find((s) => s.value === value)?.label ?? value;
}

export function locationLabelFor(code: number) {
  return (
    DOMAIN_OVERVIEW_LOCATIONS.find((l) => l.code === code)?.label ??
    `Location ${code}`
  );
}
