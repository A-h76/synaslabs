import "server-only";

import { and, eq, gte } from "drizzle-orm";
import type { Actor } from "@/domain/entities";
import type { CalendarEventKind } from "@/domain/lifecycle";
import { authorize } from "@/server/dal/access";
import { writeActivity } from "@/server/dal/events";
import { getDb } from "@/server/db/client";
import { calendarEvents } from "@/server/db/schema";
import { IntegrationNotConfiguredError } from "@/server/errors";
import { getIntegrations } from "@/server/integrations";

export type CalendarDraft = {
  kind: CalendarEventKind;
  title: string;
  startsAt: Date;
  endsAt: Date;
  companyId?: string | null;
  opportunityId?: string | null;
  projectId?: string | null;
  taskId?: string | null;
  location?: string | null;
  attendeeEmails?: string[];
};

/**
 * Local calendar is always written. Provider sync is a port and may be unconfigured.
 */
export async function scheduleEvent(actor: Actor, draft: CalendarDraft) {
  authorize(actor, "calendar", "create", { companyId: draft.companyId ?? actor.companyId });
  const db = getDb();
  if (!db) return null;

  let providerEventId: string | null = null;
  try {
    const remote = await getIntegrations().calendar.upsertEvent({
      title: draft.title,
      startsAt: draft.startsAt.toISOString(),
      endsAt: draft.endsAt.toISOString(),
      attendees: draft.attendeeEmails,
    });
    providerEventId = remote.calendarEventId;
  } catch (error) {
    if (!(error instanceof IntegrationNotConfiguredError)) throw error;
  }

  const [row] = await db
    .insert(calendarEvents)
    .values({
      kind: draft.kind,
      title: draft.title,
      startsAt: draft.startsAt,
      endsAt: draft.endsAt,
      companyId: draft.companyId ?? null,
      opportunityId: draft.opportunityId ?? null,
      projectId: draft.projectId ?? null,
      taskId: draft.taskId ?? null,
      createdByUserId: actor.id,
      location: draft.location ?? null,
      attendeeEmails: draft.attendeeEmails ?? [],
      providerEventId,
    })
    .returning();

  await writeActivity({
    type: "meeting",
    body: draft.title,
    companyId: draft.companyId ?? null,
    opportunityId: draft.opportunityId ?? null,
    projectId: draft.projectId ?? null,
    actorUserId: actor.id,
    startsAt: draft.startsAt,
    endsAt: draft.endsAt,
    calendarEventId: row?.id ?? providerEventId,
    clientVisible: draft.kind === "discovery" || draft.kind === "project",
  });

  return row ?? null;
}

export async function listUpcomingEvents(actor: Actor, from = new Date()) {
  authorize(actor, "calendar", "read", { companyId: actor.companyId });
  const db = getDb();
  if (!db) return [];
  const rows = await db
    .select()
    .from(calendarEvents)
    .where(gte(calendarEvents.startsAt, from))
    .orderBy(calendarEvents.startsAt)
    .limit(40);
  if (actor.role === "CLIENT") {
    return rows.filter((row) => row.companyId === actor.companyId);
  }
  return rows;
}

export async function getCalendarEvent(actor: Actor, id: string) {
  const db = getDb();
  if (!db) return null;
  const [row] = await db
    .select()
    .from(calendarEvents)
    .where(eq(calendarEvents.id, id))
    .limit(1);
  if (!row) return null;
  authorize(actor, "calendar", "read", { companyId: row.companyId });
  if (actor.role === "CLIENT" && row.companyId !== actor.companyId) return null;
  return row;
}

export async function listEventsForCompany(actor: Actor, companyId: string) {
  authorize(actor, "calendar", "read", { companyId });
  const db = getDb();
  if (!db) return [];
  return db
    .select()
    .from(calendarEvents)
    .where(and(eq(calendarEvents.companyId, companyId)))
    .orderBy(calendarEvents.startsAt);
}
