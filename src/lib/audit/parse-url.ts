export function parseAuditUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Enter a site URL to audit.");
  }

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(withProtocol);
  } catch {
    throw new Error("Enter a valid URL, e.g. https://example.com");
  }

  if (!parsed.hostname || !parsed.hostname.includes(".")) {
    throw new Error("Enter a valid domain, e.g. example.com");
  }

  return `${parsed.protocol}//${parsed.hostname}`.replace(/\/$/, "");
}

export function formatAuditUrlInput(input: string): string {
  return input
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "");
}
