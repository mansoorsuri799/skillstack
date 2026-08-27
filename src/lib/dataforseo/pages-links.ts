import {
  BacklinksDomainPagesLiveRequestInfo,
  OnPageLinksRequestInfo,
  OnPagePagesRequestInfo,
  OnPageTaskPostRequestInfo,
} from "dataforseo-client";
import { backlinksApi, normalizeDomain, onPageApi } from "@/lib/dataforseo/client";

export type BestByLinksRow = {
  page: string;
  backlinks: number | null;
  referringDomains: number | null;
  rank: number | null;
  internalLinks: number | null;
  externalLinks: number | null;
};

export type InternalLinkRow = {
  from: string;
  to: string;
  anchor: string | null;
  dofollow: boolean;
  broken: boolean;
};

export type MostLinkedPageRow = {
  url: string;
  inboundLinks: number | null;
  internalLinksOut: number | null;
  externalLinksOut: number | null;
};

export type InternalAnchorRow = {
  anchor: string;
  links: number;
  targetPages: number;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function onPageTaskResult<T>(response: unknown): T | null {
  const data = response as { tasks?: Array<{ result?: T[] | null }> | null };
  return data?.tasks?.[0]?.result?.[0] ?? null;
}

async function startOnPageCrawl(domain: string, maxPages = 40): Promise<string> {
  const api = onPageApi();
  const response = await api.taskPost([
    {
      target: normalizeDomain(domain),
      max_crawl_pages: maxPages,
      max_crawl_depth: 4,
    } as OnPageTaskPostRequestInfo,
  ]);

  const taskId = response?.tasks?.[0]?.id;
  if (!taskId) {
    throw new Error("Failed to start site crawl.");
  }
  return taskId;
}

async function waitForCrawl(taskId: string, attempts = 36, delayMs = 2500) {
  const api = onPageApi();
  for (let i = 0; i < attempts; i += 1) {
    const response = await api.summary(taskId);
    const result = onPageTaskResult<{ crawl_progress?: string | null }>(response);
    if (result?.crawl_progress === "finished") return;
    await sleep(delayMs);
  }
}

async function withCrawl<T>(domain: string, fn: (taskId: string) => Promise<T>) {
  const taskId = await startOnPageCrawl(domain);
  await waitForCrawl(taskId);
  return fn(taskId);
}

export async function getPagesBestByLinks(
  domain: string,
  limit = 100,
): Promise<{ domain: string; pages: BestByLinksRow[] }> {
  const api = backlinksApi();
  const response = await api.domainPagesLive([
    {
      target: normalizeDomain(domain),
      limit,
      order_by: ["page_summary.backlinks,desc"],
      include_subdomains: true,
    } as BacklinksDomainPagesLiveRequestInfo,
  ]);

  const items = (response?.tasks?.[0]?.result?.[0] as { items?: unknown[] } | undefined)
    ?.items as Array<{
    page?: string | null;
    meta?: {
      internal_links_count?: number | null;
      external_links_count?: number | null;
    } | null;
    page_summary?: {
      backlinks?: number | null;
      referring_domains?: number | null;
      rank?: number | null;
    } | null;
  }> | undefined;

  const pages = (items ?? [])
    .map((item) => ({
      page: item.page ?? "",
      backlinks: item.page_summary?.backlinks ?? null,
      referringDomains: item.page_summary?.referring_domains ?? null,
      rank: item.page_summary?.rank ?? null,
      internalLinks: item.meta?.internal_links_count ?? null,
      externalLinks: item.meta?.external_links_count ?? null,
    }))
    .filter((row) => row.page);

  return { domain: normalizeDomain(domain), pages };
}

export async function getInternalLinksList(
  domain: string,
  limit = 100,
): Promise<{ domain: string; links: InternalLinkRow[]; total: number | null }> {
  return withCrawl(domain, async (taskId) => {
    const api = onPageApi();
    const response = await api.links([
      {
        id: taskId,
        limit,
        filters: ["direction", "=", "internal"],
      } as OnPageLinksRequestInfo,
    ]);

    const result = onPageTaskResult<{
      total_items_count?: number | null;
      items?: Array<{
        link_from?: string | null;
        link_to?: string | null;
        text?: string | null;
        dofollow?: boolean | null;
        is_broken?: boolean | null;
      }> | null;
    }>(response);

    const links = (result?.items ?? [])
      .map((item) => ({
        from: item.link_from ?? "",
        to: item.link_to ?? "",
        anchor: item.text ?? null,
        dofollow: item.dofollow ?? true,
        broken: item.is_broken ?? false,
      }))
      .filter((row) => row.from && row.to);

    return {
      domain: normalizeDomain(domain),
      links,
      total: result?.total_items_count ?? links.length,
    };
  });
}

export async function getMostLinkedPages(
  domain: string,
  limit = 100,
): Promise<{ domain: string; pages: MostLinkedPageRow[] }> {
  return withCrawl(domain, async (taskId) => {
    const api = onPageApi();
    const response = await api.pages([
      {
        id: taskId,
        limit,
        order_by: ["meta.inbound_links_count,desc"],
        filters: ["resource_type", "=", "html"],
      } as OnPagePagesRequestInfo,
    ]);

    const result = onPageTaskResult<{
      items?: Array<{
        url?: string | null;
        meta?: {
          inbound_links_count?: number | null;
          internal_links_count?: number | null;
          external_links_count?: number | null;
        } | null;
      }> | null;
    }>(response);

    const pages = (result?.items ?? [])
      .map((item) => ({
        url: item.url ?? "",
        inboundLinks: item.meta?.inbound_links_count ?? null,
        internalLinksOut: item.meta?.internal_links_count ?? null,
        externalLinksOut: item.meta?.external_links_count ?? null,
      }))
      .filter((row) => row.url)
      .sort((a, b) => (b.inboundLinks ?? 0) - (a.inboundLinks ?? 0));

    return { domain: normalizeDomain(domain), pages };
  });
}

export async function getInternalAnchors(
  domain: string,
  limit = 500,
): Promise<{ domain: string; anchors: InternalAnchorRow[] }> {
  return withCrawl(domain, async (taskId) => {
    const api = onPageApi();
    const response = await api.links([
      {
        id: taskId,
        limit,
        filters: ["direction", "=", "internal"],
      } as OnPageLinksRequestInfo,
    ]);

    const result = onPageTaskResult<{
      items?: Array<{
        link_to?: string | null;
        text?: string | null;
      }> | null;
    }>(response);

    const anchorMap = new Map<string, { links: number; targets: Set<string> }>();

    for (const item of result?.items ?? []) {
      const anchor = (item.text ?? "").trim() || "(empty anchor)";
      const target = item.link_to ?? "";
      const entry = anchorMap.get(anchor) ?? { links: 0, targets: new Set<string>() };
      entry.links += 1;
      if (target) entry.targets.add(target);
      anchorMap.set(anchor, entry);
    }

    const anchors = [...anchorMap.entries()]
      .map(([anchor, stats]) => ({
        anchor,
        links: stats.links,
        targetPages: stats.targets.size,
      }))
      .sort((a, b) => b.links - a.links)
      .slice(0, limit);

    return { domain: normalizeDomain(domain), anchors };
  });
}

export type InternalLinksReportType = "links" | "most-linked" | "anchors";

export async function getInternalLinksReport(
  type: InternalLinksReportType,
  domain: string,
) {
  switch (type) {
    case "links":
      return getInternalLinksList(domain);
    case "most-linked":
      return getMostLinkedPages(domain);
    case "anchors":
      return getInternalAnchors(domain);
  }
}
