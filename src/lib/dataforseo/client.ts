import {
  AiOptimizationApi,
  BacklinksApi,
  DataforseoLabsApi,
  KeywordsDataApi,
  OnPageApi,
  SerpApi,
} from "dataforseo-client";

const API_BASE = "https://api.dataforseo.com";
const TIMEOUT_MS = 60_000;

function getApiKey(): string {
  const key = process.env.DATAFORSEO_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "DATAFORSEO_API_KEY is not configured. Add your base64(login:password) key to .env.local.",
    );
  }
  return key;
}

function authenticatedFetch() {
  return async (url: RequestInfo, init?: RequestInit): Promise<Response> => {
    const headers = new Headers(init?.headers);
    headers.set("Authorization", `Basic ${getApiKey()}`);
    const signal =
      init?.signal ?? AbortSignal.timeout(TIMEOUT_MS);
    const response = await fetch(url, { ...init, headers, signal });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `DataForSEO HTTP ${response.status}: ${body.slice(0, 400)}`,
      );
    }
    return response;
  };
}

const http = { fetch: authenticatedFetch() };

export function isDataForSeoConfigured() {
  return Boolean(process.env.DATAFORSEO_API_KEY?.trim());
}

export const labsApi = () => new DataforseoLabsApi(API_BASE, http);
export const keywordsDataApi = () => new KeywordsDataApi(API_BASE, http);
export const backlinksApi = () => new BacklinksApi(API_BASE, http);
export const serpApi = () => new SerpApi(API_BASE, http);
export const onPageApi = () => new OnPageApi(API_BASE, http);
export const aiOptimizationApi = () => new AiOptimizationApi(API_BASE, http);

export function normalizeDomain(input: string): string {
  return input
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/.*$/, "")
    .toLowerCase();
}

export function taskItems<T>(response: unknown): T[] {
  const data = response as {
    tasks?: Array<{ result?: T[] | null }> | null;
  } | null;
  const task = data?.tasks?.[0];
  if (!task?.result) return [];
  return task.result;
}

export function taskResult<T>(response: unknown): T | null {
  const data = response as {
    tasks?: Array<{
      result?: T[] | null;
      status_code?: number;
      status_message?: string | null;
    }> | null;
  } | null;
  const task = data?.tasks?.[0];
  if (!task) return null;
  if (task.status_code != null && task.status_code >= 40000) {
    throw new Error(task.status_message ?? "DataForSEO request failed.");
  }
  return task.result?.[0] ?? null;
}

/** Labs live endpoints return keyword/page rows under result[0].items */
export function taskResultItems<T>(response: unknown): T[] {
  const result = taskResult<{ items?: T[] | null }>(response);
  return result?.items ?? [];
}

/** Collect items from every task in a multi-task Labs response (e.g. multi-location overview). */
export function allTasksResultItems<T extends { location_code?: number | null }>(
  response: unknown,
): T[] {
  const data = response as {
    tasks?: Array<{
      status_code?: number | null;
      data?: { location_code?: number | null } | null;
      result?: Array<{ items?: T[] | null }> | null;
    }> | null;
  } | null;

  const out: T[] = [];
  for (const task of data?.tasks ?? []) {
    if (task.status_code != null && task.status_code >= 40000) continue;
    const taskLocation = task.data?.location_code ?? null;
    for (const result of task.result ?? []) {
      for (const item of result.items ?? []) {
        if (item.location_code == null && taskLocation != null) {
          out.push({ ...item, location_code: taskLocation });
        } else {
          out.push(item);
        }
      }
    }
  }
  return out;
}
