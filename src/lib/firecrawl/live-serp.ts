import { firecrawlSearch, isFirecrawlConfigured } from "@/lib/firecrawl/search";
import { firecrawlScrape } from "@/lib/firecrawl/scrape";
import { RESEARCH_LOCATIONS } from "@/lib/dashboard/locations";
import { normalizeProjectDomain } from "@/lib/chat/project-domain";

export const FIRST_PAGE_SIZE = 10;

const SERP_NOISE = new Set([
  "google.com",
  "youtube.com",
  "facebook.com",
  "instagram.com",
  "twitter.com",
  "x.com",
  "linkedin.com",
  "reddit.com",
  "wikipedia.org",
  "quora.com",
  "pinterest.com",
  "tiktok.com",
  "maps.google.com",
  "support.google.com",
]);

const DOMAIN_WORDS = [
  "pakistan",
  "download",
  "official",
  "android",
  "rummy",
  "patti",
  "casino",
  "cricket",
  "betting",
  "dragon",
  "tiger",
  "poker",
  "ludo",
  "teen",
  "card",
  "game",
  "games",
  "gold",
  "star",
  "royal",
  "play",
  "cash",
  "win",
  "apk",
  "app",
];

const JUNK_TITLE_WORDS = new Set([
  "download",
  "official",
  "apk",
  "android",
  "free",
  "latest",
  "version",
  "for",
  "the",
  "and",
  "a",
  "an",
  "v",
]);

const COUNTRY_BY_LOCATION: Record<number, string> = {
  2840: "US",
  2826: "GB",
  2124: "CA",
  2250: "FR",
  2080: "DE",
  2036: "AU",
  2504: "MA",
  2012: "DZ",
  2056: "BE",
  2788: "TN",
  2724: "ES",
  2380: "IT",
  2528: "NL",
  2756: "CH",
  2076: "BR",
  2484: "MX",
  2356: "IN",
  2586: "PK",
  2784: "AE",
  2682: "SA",
};

export type LiveSerpMode = "competitors" | "serp" | "brand";

export type LiveSerpListing = {
  position: number;
  host: string;
  title: string;
  url: string;
  description: string;
  isYours: boolean;
};

export type LiveSerpResult = {
  keyword: string;
  location: string;
  country: string;
  listings: LiveSerpListing[];
  pageTitle?: string;
};

export function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return "";
  }
}

export function isSameSite(hostOrUrl: string, domain: string): boolean {
  const host = hostOrUrl.includes("://")
    ? hostnameOf(hostOrUrl)
    : normalizeProjectDomain(hostOrUrl);
  const target = normalizeProjectDomain(domain);
  if (!host || !target) return false;
  return host === target || host.endsWith(`.${target}`) || target.endsWith(`.${host}`);
}

export function firecrawlLocationFromCode(locationCode?: number): {
  location: string;
  country: string;
} {
  const match = RESEARCH_LOCATIONS.find((row) => row.code === locationCode);
  if (match) {
    return {
      location: match.label,
      country: COUNTRY_BY_LOCATION[match.code] ?? "US",
    };
  }
  return { location: "United States", country: "US" };
}

function matchesList(host: string, list: Set<string>): boolean {
  return [...list].some((item) => host === item || host.endsWith(`.${item}`));
}

function brandFromDomain(domain: string): string {
  const parts = domain.split(".");
  if (parts.length >= 3 && parts[parts.length - 1].length <= 3 && parts[parts.length - 2].length <= 3) {
    return parts[0];
  }
  return parts[0] || domain;
}

function splitConcatenated(label: string): string {
  const dictionary = [...DOMAIN_WORDS].sort((a, b) => b.length - a.length);
  let rest = label.toLowerCase().replace(/[^a-z0-9]/g, "");
  const found: string[] = [];
  while (rest.length >= 3) {
    const hit = dictionary.find((word) => rest.startsWith(word) && word.length >= 3);
    if (!hit) break;
    found.push(hit);
    rest = rest.slice(hit.length);
  }
  if (found.length >= 2) return found.join(" ");
  if (found.length === 1 && rest.length >= 3) return `${found[0]} ${rest}`;
  return label.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[-_]+/g, " ").toLowerCase();
}

function headingFromMarkdown(markdown: string): string {
  const match = markdown.match(/^#{1,2}\s+(.+)$/m);
  return match ? stripMarkdown(match[1]) : "";
}

function stripMarkdown(value: string): string {
  return value
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[#*_`>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function cleanSnippet(value: string, max = 100): string {
  const text = stripMarkdown(value);
  if (text.length <= max) return text;
  return `${text.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

export function keywordFromPage(title: string, heading: string, domainBrand: string): string {
  const source = `${heading} ${title}`.toLowerCase();
  const cleaned = source
    .replace(/v?\d+(?:\.\d+)*/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = cleaned
    .split(" ")
    .filter((word) => word.length > 1 && !JUNK_TITLE_WORDS.has(word) && !/^\d+$/.test(word));
  const unique: string[] = [];
  for (const word of words) {
    if (!unique.includes(word)) unique.push(word);
    if (unique.length >= 3) break;
  }
  if (unique.length >= 2) return unique.slice(0, 2).join(" ");
  return splitConcatenated(domainBrand);
}

function matchesKeyword(
  hit: { url: string; title: string; description: string },
  keyword: string,
): boolean {
  const hay = `${hit.title} ${hit.url} ${hit.description}`.toLowerCase();
  const compact = hay.replace(/[^a-z0-9]/g, "");
  const phrase = keyword.toLowerCase().trim();
  if (!phrase) return false;
  if (hay.includes(phrase) || compact.includes(phrase.replace(/\s+/g, ""))) return true;
  const terms = phrase.split(/\s+/).filter((term) => term.length > 2);
  return terms.length > 0 && terms.every((term) => hay.includes(term) || compact.includes(term));
}

export async function searchLiveSerp(
  query: string,
  options?: {
    locationCode?: number;
    location?: string;
    country?: string;
    limit?: number;
    excludeDomain?: string;
    mode?: LiveSerpMode;
  },
): Promise<LiveSerpResult> {
  if (!isFirecrawlConfigured()) {
    throw new Error("FIRECRAWL_API_KEY is not configured. Add your Firecrawl key to .env.local.");
  }

  const mapped = firecrawlLocationFromCode(options?.locationCode);
  const location = options?.location || mapped.location;
  const country = options?.country || mapped.country;
  const limit = options?.limit ?? FIRST_PAGE_SIZE;
  const mode = options?.mode ?? "serp";
  const excludeDomain = options?.excludeDomain
    ? normalizeProjectDomain(options.excludeDomain)
    : "";

  const hits = await firecrawlSearch(query, { limit, location, country });
  const seen = new Set<string>();
  const raw: LiveSerpListing[] = [];

  hits.slice(0, limit).forEach((hit, index) => {
    const host = hostnameOf(hit.url);
    if (!host || seen.has(host)) return;
    if (mode === "competitors" && matchesList(host, SERP_NOISE)) return;
    if (mode === "serp" && (host === "google.com" || host.endsWith(".google.com"))) return;
    seen.add(host);
    raw.push({
      position: index + 1,
      host,
      title: cleanSnippet(hit.title || host, 80),
      url: hit.url,
      description: cleanSnippet(hit.description, 90),
      isYours: excludeDomain ? isSameSite(host, excludeDomain) : false,
    });
  });

  let listings = raw;
  if (mode === "competitors") {
    const matched = raw.filter((row) =>
      matchesKeyword({ url: row.url, title: row.title, description: row.description }, query),
    );
    listings = matched.length >= 3 ? matched : raw;
  }

  return { keyword: query, location, country, listings };
}

export async function liveSerpForDomain(
  domainInput: string,
  options?: {
    locationCode?: number;
    location?: string;
    country?: string;
  },
): Promise<LiveSerpResult> {
  const domain = normalizeProjectDomain(domainInput);
  const siteUrl = `https://${domain}`;
  const page = await firecrawlScrape(siteUrl);
  const brand = brandFromDomain(domain);
  const heading = page ? headingFromMarkdown(page.markdown) : "";
  const keyword = keywordFromPage(page?.title || "", heading, brand);
  const result = await searchLiveSerp(keyword, {
    ...options,
    excludeDomain: domain,
    mode: "competitors",
    limit: FIRST_PAGE_SIZE,
  });
  return {
    ...result,
    pageTitle: page?.title ? cleanSnippet(page.title, 70) : undefined,
  };
}
