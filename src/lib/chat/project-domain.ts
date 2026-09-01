export function normalizeProjectDomain(domain?: string | null): string {
  return (domain || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/.*$/, "")
    .toLowerCase();
}

export function hasReadyProjectDomain(domain?: string | null): boolean {
  const value = normalizeProjectDomain(domain);
  return Boolean(value) && value !== "example.com";
}

export function missingProjectDomainReply(): {
  answer: string;
  sources: Array<{ title: string; url: string }>;
} {
  return {
    answer:
      "I need a project domain before I can run a live SERP search.\n\n**Add your domain first:** open **Browse** in the dashboard, save your target site (for example `yourdomain.com`), then ask me again:\n- Who are my top SERP competitors?\n\nI'll search Google for that domain and list the sites ranking alongside you.",
    sources: [
      { title: "Open dashboard to add a domain", url: "/dashboard" },
    ],
  };
}
