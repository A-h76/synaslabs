import { IntegrationNotConfiguredError } from "@/server/errors";
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

function unavailable(name: string): never {
  throw new IntegrationNotConfiguredError(name);
}

export const unconfiguredAi: AiPort = {
  interpretProcess: async () => unavailable("ai"),
};

export const unconfiguredCrmSync: CrmSyncPort = {
  pushCompany: async () => unavailable("crm-sync"),
};

export const unconfiguredWorkflowRunner: WorkflowRunnerPort = {
  trigger: async () => unavailable("workflow-runner"),
};

export const unconfiguredExtraction: ExtractionPort = {
  runSource: async () => unavailable("extraction"),
};

export const unconfiguredEmail: EmailPort = {
  send: async () => unavailable("email"),
};

export const unconfiguredCalendar: CalendarPort = {
  upsertEvent: async () => unavailable("calendar"),
};

export const unconfiguredDocuments: DocumentPort = {
  render: async () => unavailable("documents"),
  getObject: async () => unavailable("documents"),
};

export const unconfiguredNotifications: NotificationPort = {
  notify: async () => unavailable("notifications"),
};
