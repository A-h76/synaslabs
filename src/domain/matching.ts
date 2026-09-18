export function normalizeWebsite(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return null;
  try {
    const withProtocol = /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
    const host = new URL(withProtocol).hostname.replace(/^www\./, "");
    return host || null;
  } catch {
    return trimmed.replace(/^www\./, "").replace(/\/.*$/, "") || null;
  }
}

export function normalizeName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function normalizeEmail(value: string | null | undefined): string | null {
  if (!value) return null;
  const email = value.trim().toLowerCase();
  return email.includes("@") ? email : null;
}

export type MatchableCompany = {
  id: string;
  name: string;
  website: string | null;
};

export type MatchableContact = {
  id: string;
  companyId: string | null;
  email: string | null;
};

export function matchCompany(
  existing: readonly MatchableCompany[],
  input: { name: string; website?: string | null },
): MatchableCompany | null {
  const host = normalizeWebsite(input.website);
  if (host) {
    const byHost = existing.find((row) => normalizeWebsite(row.website) === host);
    if (byHost) return byHost;
  }
  const name = normalizeName(input.name);
  if (!name) return null;
  return existing.find((row) => normalizeName(row.name) === name) ?? null;
}

export function matchContact(
  existing: readonly MatchableContact[],
  input: { email?: string | null; companyId?: string | null },
): MatchableContact | null {
  const email = normalizeEmail(input.email);
  if (!email) return null;
  const matches = existing.filter((row) => normalizeEmail(row.email) === email);
  if (input.companyId) {
    return matches.find((row) => row.companyId === input.companyId) ?? matches[0] ?? null;
  }
  return matches[0] ?? null;
}
