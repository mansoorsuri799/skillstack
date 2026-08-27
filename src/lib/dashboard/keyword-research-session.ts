import type { KeywordResearchRow } from "@/components/dashboard/keyword-research/KeywordResearchPanel";
import type {
  SeedKeywordInsights,
  SerpResultRow,
} from "@/lib/dataforseo/keyword-research";
import type { KeywordMode } from "@/lib/dashboard/locations";

export type KeywordResearchSession = {
  seed: string;
  locationCode: number;
  limit: number;
  mode: KeywordMode;
  useClickstream: boolean;
  results: KeywordResearchRow[];
  seedInsights: SeedKeywordInsights | null;
  serpResults: SerpResultRow[];
  savedAt: string;
};

const LOCAL_KEY = "ss-keyword-research-session";

export function readLocalKeywordSession(): KeywordResearchSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as KeywordResearchSession;
    if (!parsed?.seed || !Array.isArray(parsed.results)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeLocalKeywordSession(session: KeywordResearchSession | null) {
  if (typeof window === "undefined") return;
  try {
    if (!session) {
      sessionStorage.removeItem(LOCAL_KEY);
      return;
    }
    sessionStorage.setItem(LOCAL_KEY, JSON.stringify(session));
  } catch {
    /* quota or private mode */
  }
}

export async function loadKeywordResearchSession(): Promise<KeywordResearchSession | null> {
  try {
    const res = await fetch("/api/dashboard/keywords/research/session");
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.session?.seed || !Array.isArray(data.session.results)) return null;
    return data.session as KeywordResearchSession;
  } catch {
    return null;
  }
}

export async function saveKeywordResearchSession(
  session: KeywordResearchSession,
): Promise<void> {
  writeLocalKeywordSession(session);
  try {
    await fetch("/api/dashboard/keywords/research/session", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session }),
    });
  } catch {
    /* best-effort sync */
  }
}

export async function clearKeywordResearchSession(): Promise<void> {
  writeLocalKeywordSession(null);
  try {
    await fetch("/api/dashboard/keywords/research/session", { method: "DELETE" });
  } catch {
    /* best-effort */
  }
}
