import "server-only";

import { desc } from "drizzle-orm";
import type { Actor, Activity } from "@/domain/entities";
import { requiredIso } from "@/lib/format";
import { authorize } from "@/server/dal/access";
import { getDb } from "@/server/db/client";
import { activities } from "@/server/db/schema";

export async function listActivity(actor: Actor): Promise<Activity[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db.select().from(activities).orderBy(desc(activities.createdAt)).limit(120);
  const mapped = rows.map((row) => ({
    id: row.id,
    type: row.type,
    body: row.body,
    companyId: row.companyId,
    leadId: row.leadId,
    opportunityId: row.opportunityId,
    projectId: row.projectId,
    actorUserId: row.actorUserId,
    calendarEventId: row.calendarEventId,
    startsAt: row.startsAt ? requiredIso(row.startsAt) : null,
    endsAt: row.endsAt ? requiredIso(row.endsAt) : null,
    playbook: row.playbook,
    clientVisible: row.clientVisible,
    createdAt: requiredIso(row.createdAt),
  }));
  if (actor.role === "CLIENT") {
    return mapped.filter(
      (row) => row.companyId === actor.companyId && row.clientVisible,
    );
  }
  authorize(actor, "activity", "read");
  return mapped;
}

export async function addNote(
  actor: Actor,
  input: { body: string; companyId?: string; leadId?: string; opportunityId?: string; projectId?: string },
) {
  authorize(actor, "activity", "create", { companyId: input.companyId ?? null });
  const db = getDb();
  if (!db) return;
  await db.insert(activities).values({
    type: "note",
    body: input.body.trim(),
    companyId: input.companyId || null,
    leadId: input.leadId || null,
    opportunityId: input.opportunityId || null,
    projectId: input.projectId || null,
    actorUserId: actor.id,
    clientVisible: false,
  });
}

export async function listUsers(actor: Actor) {
  authorize(actor, "settings", "read");
  const db = getDb();
  if (!db) return [];
  const { users } = await import("@/server/db/schema");
  return db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      companyId: users.companyId,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.email);
}

export async function createUser(
  actor: Actor,
  input: {
    email: string;
    name: string;
    role: "ADMIN" | "TEAM_MEMBER" | "CLIENT";
    companyId?: string;
    password: string;
  },
) {
  authorize(actor, "settings", "create");
  if (input.password.length < 8) return null;
  if (input.role === "CLIENT" && !input.companyId) return null;
  const db = getDb();
  if (!db) return null;
  const { users } = await import("@/server/db/schema");
  const { hashPassword } = await import("@/server/auth/password");
  const [row] = await db
    .insert(users)
    .values({
      email: input.email.trim().toLowerCase(),
      name: input.name.trim(),
      role: input.role,
      companyId: input.role === "CLIENT" ? input.companyId || null : null,
      passwordHash: await hashPassword(input.password),
    })
    .returning();
  return row ?? null;
}

export async function listAssignableUsers(actor: Actor) {
  authorize(actor, "task", "read");
  const db = getDb();
  if (!db) return [];
  const { users } = await import("@/server/db/schema");
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
    })
    .from(users)
    .orderBy(users.email);
  return rows.filter((row) => row.role === "ADMIN" || row.role === "TEAM_MEMBER");
}
