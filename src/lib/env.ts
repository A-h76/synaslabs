import "server-only";

function readOptional(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export function databaseUrl(): string | undefined {
  return readOptional("DATABASE_URL");
}

export function authSecret(): string | undefined {
  return readOptional("AUTH_SECRET");
}

export function isDatabaseConfigured(): boolean {
  return Boolean(databaseUrl());
}

/** Identity + store must both exist before private surfaces are advertised. */
export function isAuthConfigured(): boolean {
  return Boolean(authSecret() && databaseUrl());
}

export function openaiApiKey(): string | undefined {
  return readOptional("OPENAI_API_KEY");
}

export function openaiModel(): string {
  return readOptional("OPENAI_MODEL") || "gpt-4o-mini";
}

export function airtableApiKey(): string | undefined {
  return readOptional("AIRTABLE_API_KEY");
}

export function airtableBaseId(): string | undefined {
  return readOptional("AIRTABLE_BASE_ID");
}

export function n8nWebhookUrl(): string | undefined {
  return readOptional("N8N_WEBHOOK_URL");
}

export function apifyToken(): string | undefined {
  return readOptional("APIFY_TOKEN");
}

export function resendApiKey(): string | undefined {
  return readOptional("RESEND_API_KEY");
}

export function calendarProvider(): "google" | "microsoft" | undefined {
  const value = readOptional("CALENDAR_PROVIDER");
  if (value === "google" || value === "microsoft") return value;
  return undefined;
}

export function bootstrapAdminEmail(): string | undefined {
  return readOptional("BOOTSTRAP_ADMIN_EMAIL")?.toLowerCase();
}

export function bootstrapAdminPassword(): string | undefined {
  return readOptional("BOOTSTRAP_ADMIN_PASSWORD");
}
