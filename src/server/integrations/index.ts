import "server-only";

import {
  airtableApiKey,
  apifyToken,
  calendarProvider,
  n8nWebhookUrl,
  openaiApiKey,
  resendApiKey,
} from "@/lib/env";
import type {
  AiPort,
  CalendarPort,
  CrmSyncPort,
  DocumentPort,
  EmailPort,
  ExtractionPort,
  NotificationPort,
  WorkflowRunnerPort,
} from "./ports";
import { openaiAi } from "./openai-ai";
import {
  unconfiguredAi,
  unconfiguredCalendar,
  unconfiguredCrmSync,
  unconfiguredDocuments,
  unconfiguredEmail,
  unconfiguredExtraction,
  unconfiguredNotifications,
  unconfiguredWorkflowRunner,
} from "./unconfigured";

export type Integrations = {
  ai: AiPort;
  crmSync: CrmSyncPort;
  workflows: WorkflowRunnerPort;
  extraction: ExtractionPort;
  email: EmailPort;
  calendar: CalendarPort;
  documents: DocumentPort;
  notifications: NotificationPort;
};

/** Ports are real; adapters are not fabricated. Credentials may exist without a live adapter. */
export function getIntegrations(): Integrations {
  return {
    ai: openaiApiKey() ? openaiAi : unconfiguredAi,
    crmSync: unconfiguredCrmSync,
    workflows: unconfiguredWorkflowRunner,
    extraction: unconfiguredExtraction,
    email: unconfiguredEmail,
    calendar: unconfiguredCalendar,
    documents: unconfiguredDocuments,
    notifications: unconfiguredNotifications,
  };
}

export function getIntegrationStatus() {
  const aiLive = Boolean(openaiApiKey());
  return {
    ai: {
      credential: aiLive,
      adapter: aiLive,
      note: "Process interpretation only. No UI generation. Unconfigured sessions use the deterministic reader.",
    },
    crmSync: { credential: Boolean(airtableApiKey()), adapter: false, note: "Postgres is source of truth." },
    workflows: { credential: Boolean(n8nWebhookUrl()), adapter: false, note: "Internal runners only." },
    extraction: { credential: Boolean(apifyToken()), adapter: false, note: "Lead Radar research port." },
    email: { credential: Boolean(resendApiKey()), adapter: false, note: "In-app notifications do not wait on email." },
    calendar: {
      credential: Boolean(calendarProvider()),
      adapter: false,
      note: "Local calendar_events is always written; provider sync is optional.",
    },
    documents: {
      credential: false,
      adapter: false,
      note: "Metadata is stored. Bytes move through DocumentPort, never guessed URLs.",
    },
    notifications: {
      credential: true,
      adapter: true,
      note: "In-app notifications are live. Email/SMS adapters stay unconfigured without credentials.",
    },
  } as const;
}

export type { AiPort, CalendarPort, EmailPort } from "./ports";
