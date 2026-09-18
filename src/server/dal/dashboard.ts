import "server-only";

import { and, desc, eq, gte, lt, or } from "drizzle-orm";
import type { Actor } from "@/domain/entities";
import { authorize } from "@/server/dal/access";
import { getDb } from "@/server/db/client";
import {
  calendarEvents,
  leads,
  opportunities,
  projects,
  proposals,
  tasks,
} from "@/server/db/schema";

export type AttentionItem = {
  id: string;
  href: string;
  label: string;
  meta: string;
};

export type Dashboard = {
  store: "connected" | "disconnected";
  overdueFollowUps: AttentionItem[];
  newLeads: AttentionItem[];
  openOpportunities: AttentionItem[];
  upcomingMeetings: AttentionItem[];
  proposalActivity: AttentionItem[];
  activeProjects: AttentionItem[];
  overdueTasks: AttentionItem[];
};

export async function getDashboard(actor: Actor): Promise<Dashboard> {
  authorize(actor, "lead", "read");
  const empty: Dashboard = {
    store: "disconnected",
    overdueFollowUps: [],
    newLeads: [],
    openOpportunities: [],
    upcomingMeetings: [],
    proposalActivity: [],
    activeProjects: [],
    overdueTasks: [],
  };
  const db = getDb();
  if (!db) return empty;

  const now = new Date();
  const soon = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const [
    followRows,
    leadRows,
    oppRows,
    meetingRows,
    proposalRows,
    projectRows,
    taskRows,
  ] = await Promise.all([
    db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.kind, "follow_up"),
          or(eq(tasks.status, "open"), eq(tasks.status, "in_progress")),
          lt(tasks.dueAt, now),
        ),
      )
      .orderBy(tasks.dueAt)
      .limit(20),
    db.select().from(leads).where(eq(leads.status, "new")).orderBy(desc(leads.createdAt)).limit(20),
    db
      .select()
      .from(opportunities)
      .where(
        or(
          eq(opportunities.stage, "identified"),
          eq(opportunities.stage, "discovery"),
          eq(opportunities.stage, "proposal"),
          eq(opportunities.stage, "negotiation"),
        ),
      )
      .orderBy(desc(opportunities.updatedAt))
      .limit(20),
    db
      .select()
      .from(calendarEvents)
      .where(and(gte(calendarEvents.startsAt, now), lt(calendarEvents.startsAt, soon)))
      .orderBy(calendarEvents.startsAt)
      .limit(20),
    db
      .select()
      .from(proposals)
      .where(or(eq(proposals.status, "sent"), eq(proposals.status, "viewed")))
      .orderBy(desc(proposals.updatedAt))
      .limit(20),
    db
      .select()
      .from(projects)
      .where(or(eq(projects.status, "onboarding"), eq(projects.status, "active")))
      .orderBy(desc(projects.updatedAt))
      .limit(20),
    db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.kind, "work"),
          or(eq(tasks.status, "open"), eq(tasks.status, "in_progress")),
          lt(tasks.dueAt, now),
        ),
      )
      .orderBy(tasks.dueAt)
      .limit(20),
  ]);

  return {
    store: "connected",
    overdueFollowUps: followRows.map((row) => ({
      id: row.id,
      href: `/admin/tasks/${row.id}`,
      label: row.title,
      meta: "Overdue follow-up",
    })),
    newLeads: leadRows.map((row) => ({
      id: row.id,
      href: `/admin/leads/${row.id}`,
      label: row.summary || row.source,
      meta: row.source,
    })),
    openOpportunities: oppRows.map((row) => ({
      id: row.id,
      href: `/admin/opportunities/${row.id}`,
      label: row.name,
      meta: row.stage,
    })),
    upcomingMeetings: meetingRows.map((row) => ({
      id: row.id,
      href: `/admin/settings`,
      label: row.title,
      meta: row.kind,
    })),
    proposalActivity: proposalRows.map((row) => ({
      id: row.id,
      href: `/admin/proposals/${row.id}`,
      label: row.title,
      meta: row.status,
    })),
    activeProjects: projectRows.map((row) => ({
      id: row.id,
      href: `/admin/projects/${row.id}`,
      label: row.name,
      meta: row.status,
    })),
    overdueTasks: taskRows.map((row) => ({
      id: row.id,
      href: `/admin/tasks/${row.id}`,
      label: row.title,
      meta: "Overdue task",
    })),
  };
}
