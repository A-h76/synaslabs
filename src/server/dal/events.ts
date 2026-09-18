import "server-only";

import { and, desc, eq } from "drizzle-orm";
import type { Actor } from "@/domain/entities";
import type { ActivityType, NotificationKind } from "@/domain/lifecycle";
import { isTeamRole } from "@/domain/roles";
import { getDb } from "@/server/db/client";
import {
  activities,
  notifications,
  users,
} from "@/server/db/schema";
import { IntegrationNotConfiguredError } from "@/server/errors";
import { getIntegrations } from "@/server/integrations";

export async function writeActivity(input: {
  type: ActivityType;
  body: string;
  companyId?: string | null;
  leadId?: string | null;
  opportunityId?: string | null;
  projectId?: string | null;
  actorUserId?: string | null;
  playbook?: string | null;
  clientVisible?: boolean;
  startsAt?: Date | null;
  endsAt?: Date | null;
  calendarEventId?: string | null;
}): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db.insert(activities).values({
    type: input.type,
    body: input.body,
    companyId: input.companyId ?? null,
    leadId: input.leadId ?? null,
    opportunityId: input.opportunityId ?? null,
    projectId: input.projectId ?? null,
    actorUserId: input.actorUserId ?? null,
    playbook: input.playbook ?? null,
    clientVisible: input.clientVisible ?? false,
    startsAt: input.startsAt ?? null,
    endsAt: input.endsAt ?? null,
    calendarEventId: input.calendarEventId ?? null,
  });
}

export type NotifyInput = {
  userId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href?: string | null;
  entityType?: string | null;
  entityId?: string | null;
};

/** In-app is the source of truth. Email is attempted and ignored if unconfigured. */
export async function notify(input: NotifyInput): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db.insert(notifications).values({
    userId: input.userId,
    kind: input.kind,
    title: input.title,
    body: input.body,
    href: input.href ?? null,
    entityType: input.entityType ?? null,
    entityId: input.entityId ?? null,
  });

  try {
    await getIntegrations().notifications.notify({
      userId: input.userId,
      body: `${input.title}\n${input.body}`,
    });
  } catch (error) {
    if (!(error instanceof IntegrationNotConfiguredError)) throw error;
  }

  try {
    const user = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, input.userId))
      .limit(1);
    const email = user[0]?.email;
    if (email) {
      await getIntegrations().email.send({
        to: email,
        subject: input.title,
        text: input.body,
      });
    }
  } catch (error) {
    if (!(error instanceof IntegrationNotConfiguredError)) throw error;
  }
}

export async function notifyTeam(input: Omit<NotifyInput, "userId">): Promise<void> {
  const db = getDb();
  if (!db) return;
  const team = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, "ADMIN"));
  const members = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, "TEAM_MEMBER"));
  const ids = [...new Set([...team, ...members].map((row) => row.id))];
  for (const userId of ids) {
    await notify({ ...input, userId });
  }
}

export async function notifyCompanyClients(
  companyId: string,
  input: Omit<NotifyInput, "userId">,
): Promise<void> {
  const db = getDb();
  if (!db) return;
  const clients = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.role, "CLIENT"), eq(users.companyId, companyId)));
  for (const row of clients) {
    await notify({ ...input, userId: row.id });
  }
}

export async function listNotifications(actor: Actor) {
  const db = getDb();
  if (!db) return [];
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, actor.id))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
}

export async function markNotificationRead(actor: Actor, id: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db
    .update(notifications)
    .set({ readAt: new Date(), updatedAt: new Date() })
    .where(and(eq(notifications.id, id), eq(notifications.userId, actor.id)));
}

export function canSeeActivity(actor: Actor, clientVisible: boolean, companyId: string | null): boolean {
  if (isTeamRole(actor.role)) return true;
  return Boolean(actor.companyId && actor.companyId === companyId && clientVisible);
}
