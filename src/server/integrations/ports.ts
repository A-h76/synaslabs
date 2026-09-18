import type { WorkflowV1 } from "@/domain/workflow/schema";

export type InterpretProcessInput = {
  narrative: string;
  answers?: Record<string, string>;
};

export type CalendarEventInput = {
  title: string;
  startsAt: string;
  endsAt: string;
  attendees?: string[];
};

export interface AiPort {
  interpretProcess(input: InterpretProcessInput): Promise<WorkflowV1>;
}

export interface CrmSyncPort {
  pushCompany(id: string): Promise<void>;
}

export interface WorkflowRunnerPort {
  trigger(name: string, payload: Record<string, unknown>): Promise<void>;
}

export interface ExtractionPort {
  runSource(source: string): Promise<void>;
}

export interface EmailPort {
  send(input: { to: string; subject: string; text: string }): Promise<void>;
}

export interface CalendarPort {
  upsertEvent(input: CalendarEventInput): Promise<{ calendarEventId: string }>;
}

export interface DocumentPort {
  render(input: { title: string; body: string }): Promise<{ uri: string }>;
  getObject(uri: string): Promise<{ body: Uint8Array; mimeType: string }>;
}

export interface NotificationPort {
  notify(input: { userId: string; body: string }): Promise<void>;
}
