export async function saveKeywordRecentSearches(keywords: string[]) {
  try {
    await fetch("/api/dashboard/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keywordRecentSearches: keywords }),
    });
  } catch {
    /* best-effort sync */
  }
}

export async function loadUserPreferences(): Promise<{
  keywordRecentSearches: string[];
  onboardingCompetitorDone: boolean;
} | null> {
  try {
    const res = await fetch("/api/dashboard/preferences");
    if (!res.ok) return null;
    const data = await res.json();
    return {
      keywordRecentSearches: data.keywordRecentSearches ?? [],
      onboardingCompetitorDone: Boolean(data.onboardingCompetitorDone),
    };
  } catch {
    return null;
  }
}
