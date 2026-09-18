import "server-only";

import { desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import type {
  Actor,
  DiscoveryRecord,
  DocumentRecord,
  Message,
  Milestone,
  Project,
  Proposal,
  SystemBriefRecord,
  Task,
} from "@/domain/entities";
import { discoveryPrefillFromBrief } from "@/domain/brief-document";
import { stripProposalForClient } from "@/domain/entities";
import { planFollowUp } from "@/domain/follow-up";
import { isTeamRole } from "@/domain/roles";
import { IntegrationNotConfiguredError } from "@/server/errors";
import { getIntegrations } from "@/server/integrations";
import type { SystemBriefSource } from "@/domain/lifecycle";
import type { SystemBriefDocument } from "@/domain/brief-document";
import {
  canTransitionProject,
  canTransitionProposal,
  isClientVisibleProposal,
  type DocumentType,
  type DocumentVisibility,
  type ProjectStatus,
  type ProposalStatus,
  type TaskKind,
  type TaskPriority,
  type TaskStatus,
} from "@/domain/lifecycle";
import { requiredIso } from "@/lib/format";
import { authorize } from "@/server/dal/access";
import {
  notify,
  notifyCompanyClients,
  notifyTeam,
  writeActivity,
} from "@/server/dal/events";
import { getDb } from "@/server/db/client";
import {
  discoveries,
  documents,
  leads,
  messageReads,
  messages,
  milestones,
  opportunities,
  projectUpdates,
  projects,
  proposalVersions,
  proposals,
  systemBriefs,
  tasks,
} from "@/server/db/schema";

function mapBrief(row: typeof systemBriefs.$inferSelect): SystemBriefRecord {
  return {
    id: row.id,
    source: row.source,
    leadId: row.leadId,
    opportunityId: row.opportunityId,
    discoveryId: row.discoveryId,
    workflowId: row.workflowId,
    companyId: row.companyId,
    title: row.title,
    summary: row.summary,
    version: row.version,
    document: row.document,
    createdAt: requiredIso(row.createdAt),
    updatedAt: requiredIso(row.updatedAt),
  };
}

function mapDiscovery(row: typeof discoveries.$inferSelect): DiscoveryRecord {
  return {
    id: row.id,
    opportunityId: row.opportunityId,
    companyId: row.companyId,
    systemBriefId: row.systemBriefId,
    businessContext: row.businessContext,
    currentWorkflow: row.currentWorkflow,
    currentTools: row.currentTools,
    manualWork: row.manualWork,
    customerExperience: row.customerExperience,
    dataNotes: row.dataNotes,
    usersNotes: row.usersNotes,
    integrations: row.integrations,
    goals: row.goals,
    timeline: row.timeline,
    budget: row.budget,
    automationOpportunities: row.automationOpportunities,
    risks: row.risks,
    openQuestions: row.openQuestions,
    notes: row.notes,
    createdAt: requiredIso(row.createdAt),
    updatedAt: requiredIso(row.updatedAt),
  };
}

function mapProposal(row: typeof proposals.$inferSelect): Proposal {
  return {
    id: row.id,
    opportunityId: row.opportunityId,
    companyId: row.companyId,
    systemBriefId: row.systemBriefId,
    discoveryId: row.discoveryId,
    status: row.status,
    version: row.version,
    title: row.title,
    summary: row.summary,
    understanding: row.understanding,
    solution: row.solution,
    scope: row.scope,
    outOfScope: row.outOfScope,
    deliverables: row.deliverables,
    timeline: row.timeline,
    technology: row.technology,
    investment: row.investment,
    assumptions: row.assumptions,
    responsibilities: row.responsibilities,
    support: row.support,
    terms: row.terms,
    nextSteps: row.nextSteps,
    internalNotes: row.internalNotes,
    sharedWithClient: row.sharedWithClient,
    sentAt: row.sentAt ? requiredIso(row.sentAt) : null,
    viewedAt: row.viewedAt ? requiredIso(row.viewedAt) : null,
    createdAt: requiredIso(row.createdAt),
    updatedAt: requiredIso(row.updatedAt),
  };
}

function mapProject(row: typeof projects.$inferSelect): Project {
  return {
    id: row.id,
    companyId: row.companyId,
    proposalId: row.proposalId,
    name: row.name,
    overview: row.overview,
    status: row.status,
    createdAt: requiredIso(row.createdAt),
    updatedAt: requiredIso(row.updatedAt),
  };
}

function mapTask(row: typeof tasks.$inferSelect): Task {
  return {
    id: row.id,
    companyId: row.companyId,
    leadId: row.leadId,
    opportunityId: row.opportunityId,
    projectId: row.projectId,
    milestoneId: row.milestoneId,
    title: row.title,
    description: row.description,
    assigneeUserId: row.assigneeUserId,
    status: row.status,
    priority: row.priority,
    kind: row.kind,
    dueAt: row.dueAt ? requiredIso(row.dueAt) : null,
    clientVisible: row.clientVisible,
    completedAt: row.completedAt ? requiredIso(row.completedAt) : null,
    createdAt: requiredIso(row.createdAt),
  };
}

function mapDocument(row: typeof documents.$inferSelect): DocumentRecord {
  return {
    id: row.id,
    projectId: row.projectId,
    companyId: row.companyId,
    messageId: row.messageId,
    title: row.title,
    type: row.type,
    visibility: row.visibility,
    createdAt: requiredIso(row.createdAt),
  };
}

export async function listBriefs(actor: Actor): Promise<SystemBriefRecord[]> {
  authorize(actor, "system_brief", "read");
  const db = getDb();
  if (!db) return [];
  const rows = await db.select().from(systemBriefs).orderBy(desc(systemBriefs.updatedAt));
  return rows.map(mapBrief);
}

export async function getBrief(actor: Actor, id: string): Promise<SystemBriefRecord> {
  const db = getDb();
  if (!db) notFound();
  const [row] = await db.select().from(systemBriefs).where(eq(systemBriefs.id, id)).limit(1);
  if (!row) notFound();
  authorize(actor, "system_brief", "read", { companyId: row.companyId });
  return mapBrief(row);
}

export async function listDiscoveries(actor: Actor): Promise<DiscoveryRecord[]> {
  authorize(actor, "discovery", "read");
  const db = getDb();
  if (!db) return [];
  const rows = await db.select().from(discoveries).orderBy(desc(discoveries.updatedAt));
  return rows.map(mapDiscovery);
}

export async function getDiscovery(actor: Actor, id: string): Promise<DiscoveryRecord> {
  const db = getDb();
  if (!db) notFound();
  const [row] = await db.select().from(discoveries).where(eq(discoveries.id, id)).limit(1);
  if (!row) notFound();
  authorize(actor, "discovery", "read", { companyId: row.companyId });
  return mapDiscovery(row);
}

export async function createBrief(
  actor: Actor,
  input: {
    title: string;
    summary: string;
    source?: SystemBriefSource;
    opportunityId?: string;
    companyId?: string;
    leadId?: string;
    document: SystemBriefDocument;
  },
) {
  authorize(actor, "system_brief", "create", { companyId: input.companyId ?? null });
  const db = getDb();
  if (!db) notFound();
  let companyId = input.companyId ?? null;
  if (input.opportunityId) {
    const [opportunity] = await db
      .select()
      .from(opportunities)
      .where(eq(opportunities.id, input.opportunityId))
      .limit(1);
    if (!opportunity) notFound();
    authorize(actor, "opportunity", "read", { companyId: opportunity.companyId });
    companyId = opportunity.companyId;
  }
  const [row] = await db
    .insert(systemBriefs)
    .values({
      source: input.source ?? "internal",
      opportunityId: input.opportunityId || null,
      companyId,
      leadId: input.leadId || null,
      title: input.title.trim(),
      summary: input.summary.trim(),
      version: 1,
      document: input.document,
    })
    .returning();
  if (!row) notFound();
  await writeActivity({
    type: "system_brief_created",
    body: `System brief “${row.title}” created.`,
    companyId,
    leadId: input.leadId || null,
    opportunityId: input.opportunityId || null,
    actorUserId: actor.id,
  });
  return mapBrief(row);
}

export async function createDiscovery(
  actor: Actor,
  input: {
    opportunityId: string;
    systemBriefId?: string;
  },
) {
  authorize(actor, "discovery", "create");
  const db = getDb();
  if (!db) notFound();
  const [opportunity] = await db
    .select()
    .from(opportunities)
    .where(eq(opportunities.id, input.opportunityId))
    .limit(1);
  if (!opportunity) notFound();
  authorize(actor, "opportunity", "read", { companyId: opportunity.companyId });

  let prefill: ReturnType<typeof discoveryPrefillFromBrief> | Record<string, never> = {};
  if (input.systemBriefId) {
    const brief = await getBrief(actor, input.systemBriefId);
    prefill = discoveryPrefillFromBrief(brief);
  }

  const [row] = await db
    .insert(discoveries)
    .values({
      opportunityId: opportunity.id,
      companyId: opportunity.companyId,
      ...prefill,
    })
    .returning();
  if (!row) notFound();
  await writeActivity({
    type: "discovery_created",
    body: "Discovery opened.",
    companyId: opportunity.companyId,
    opportunityId: opportunity.id,
    actorUserId: actor.id,
  });
  return mapDiscovery(row);
}

export async function updateDiscovery(
  actor: Actor,
  id: string,
  patch: Partial<Omit<DiscoveryRecord, "id" | "createdAt" | "updatedAt" | "opportunityId">>,
) {
  const current = await getDiscovery(actor, id);
  authorize(actor, "discovery", "update", { companyId: current.companyId });
  const db = getDb();
  if (!db) notFound();
  await db
    .update(discoveries)
    .set({
      systemBriefId: patch.systemBriefId ?? current.systemBriefId,
      businessContext: patch.businessContext ?? current.businessContext,
      currentWorkflow: patch.currentWorkflow ?? current.currentWorkflow,
      currentTools: patch.currentTools ?? current.currentTools,
      manualWork: patch.manualWork ?? current.manualWork,
      customerExperience: patch.customerExperience ?? current.customerExperience,
      dataNotes: patch.dataNotes ?? current.dataNotes,
      usersNotes: patch.usersNotes ?? current.usersNotes,
      integrations: patch.integrations ?? current.integrations,
      goals: patch.goals ?? current.goals,
      timeline: patch.timeline ?? current.timeline,
      budget: patch.budget ?? current.budget,
      automationOpportunities:
        patch.automationOpportunities ?? current.automationOpportunities,
      risks: patch.risks ?? current.risks,
      openQuestions: patch.openQuestions ?? current.openQuestions,
      notes: patch.notes ?? current.notes,
      updatedAt: new Date(),
    })
    .where(eq(discoveries.id, id));
}

export async function listProposals(actor: Actor): Promise<Proposal[]> {
  const db = getDb();
  if (!db) return [];
  if (actor.role === "CLIENT") {
    const rows = await db
      .select()
      .from(proposals)
      .where(eq(proposals.companyId, actor.companyId ?? ""))
      .orderBy(desc(proposals.updatedAt));
    return rows
      .filter((row) => isClientVisibleProposal(row.status, row.sharedWithClient))
      .map((row) => stripProposalForClient(mapProposal(row)) as Proposal);
  }
  authorize(actor, "proposal", "read");
  const rows = await db.select().from(proposals).orderBy(desc(proposals.updatedAt));
  return rows.map(mapProposal);
}

export async function getProposal(actor: Actor, id: string): Promise<Proposal> {
  const db = getDb();
  if (!db) notFound();
  const [row] = await db.select().from(proposals).where(eq(proposals.id, id)).limit(1);
  if (!row) notFound();
  authorize(actor, "proposal", "read", {
    companyId: row.companyId,
    sharedWithClient: row.sharedWithClient,
    proposalStatus: row.status,
  });
  const mapped = mapProposal(row);
  if (actor.role === "CLIENT") {
    if (row.status === "sent") {
      await db
        .update(proposals)
        .set({ status: "viewed", viewedAt: new Date(), updatedAt: new Date() })
        .where(eq(proposals.id, id));
      await writeActivity({
        type: "proposal_viewed",
        body: "Proposal viewed in the portal.",
        companyId: row.companyId,
        opportunityId: row.opportunityId,
        clientVisible: true,
      });
      const plan = planFollowUp("proposal_viewed");
      await db.insert(tasks).values({
        companyId: row.companyId,
        opportunityId: row.opportunityId,
        title: plan.title,
        kind: "follow_up",
        status: "open",
        priority: plan.priority,
        dueAt: plan.dueAt,
      });
      mapped.status = "viewed";
      mapped.viewedAt = new Date().toISOString();
      await notifyTeam({
        kind: "proposal",
        title: "Proposal viewed",
        body: row.title,
        href: `/admin/proposals/${row.id}`,
        entityType: "proposal",
        entityId: row.id,
      });
    }
    return stripProposalForClient(mapped) as Proposal;
  }
  return mapped;
}

export async function createProposal(
  actor: Actor,
  input: { opportunityId: string; title: string; systemBriefId?: string; discoveryId?: string },
) {
  authorize(actor, "proposal", "create");
  const db = getDb();
  if (!db) notFound();
  const [opportunity] = await db
    .select()
    .from(opportunities)
    .where(eq(opportunities.id, input.opportunityId))
    .limit(1);
  if (!opportunity) notFound();
  const [row] = await db
    .insert(proposals)
    .values({
      opportunityId: opportunity.id,
      companyId: opportunity.companyId,
      title: input.title.trim(),
      systemBriefId: input.systemBriefId || null,
      discoveryId: input.discoveryId || null,
      status: "draft",
      version: 1,
    })
    .returning();
  if (!row) notFound();
  await db.insert(proposalVersions).values({
    proposalId: row.id,
    version: 1,
    status: "draft",
    document: { title: row.title },
    createdByUserId: actor.id,
  });
  await writeActivity({
    type: "proposal_created",
    body: `Proposal “${row.title}” drafted.`,
    companyId: opportunity.companyId,
    opportunityId: opportunity.id,
    actorUserId: actor.id,
  });
  return mapProposal(row);
}

export async function saveProposalVersion(actor: Actor, id: string, patch: Partial<Proposal>) {
  const current = await getProposal(actor, id);
  authorize(actor, "proposal", "update", { companyId: current.companyId });
  if (current.status !== "draft" && current.status !== "internal_review") notFound();
  const db = getDb();
  if (!db) notFound();
  const version = current.version + 1;
  await db
    .update(proposals)
    .set({
      title: patch.title ?? current.title,
      summary: patch.summary ?? current.summary,
      understanding: patch.understanding ?? current.understanding,
      solution: patch.solution ?? current.solution,
      scope: patch.scope ?? current.scope,
      outOfScope: patch.outOfScope ?? current.outOfScope,
      deliverables: patch.deliverables ?? current.deliverables,
      timeline: patch.timeline ?? current.timeline,
      technology: patch.technology ?? current.technology,
      investment: patch.investment ?? current.investment,
      assumptions: patch.assumptions ?? current.assumptions,
      responsibilities: patch.responsibilities ?? current.responsibilities,
      support: patch.support ?? current.support,
      terms: patch.terms ?? current.terms,
      nextSteps: patch.nextSteps ?? current.nextSteps,
      internalNotes: patch.internalNotes ?? current.internalNotes,
      systemBriefId: patch.systemBriefId ?? current.systemBriefId,
      version,
      updatedAt: new Date(),
    })
    .where(eq(proposals.id, id));
  await db.insert(proposalVersions).values({
    proposalId: id,
    version,
    status: current.status,
    document: { ...current, ...patch, internalNotes: patch.internalNotes ?? current.internalNotes },
    createdByUserId: actor.id,
  });
}

export async function transitionProposal(actor: Actor, id: string, status: ProposalStatus) {
  const current = await getProposal(actor, id);
  authorize(actor, "proposal", "update", { companyId: current.companyId });
  if (!canTransitionProposal(current.status, status)) notFound();
  const db = getDb();
  if (!db) notFound();
  const now = new Date();
  await db
    .update(proposals)
    .set({
      status,
      sharedWithClient:
        status === "sent" || status === "viewed" || status === "accepted"
          ? true
          : current.sharedWithClient,
      sentAt: status === "sent" ? now : current.sentAt ? new Date(current.sentAt) : null,
      viewedAt: status === "viewed" ? now : current.viewedAt ? new Date(current.viewedAt) : null,
      decidedAt: status === "accepted" || status === "rejected" ? now : null,
      updatedAt: now,
    })
    .where(eq(proposals.id, id));

  if (status === "sent") {
    await writeActivity({
      type: "proposal_sent",
      body: `Proposal “${current.title}” sent.`,
      companyId: current.companyId,
      opportunityId: current.opportunityId,
      actorUserId: actor.id,
      clientVisible: true,
    });
    const plan = planFollowUp("proposal_sent");
    await db.insert(tasks).values({
      companyId: current.companyId,
      opportunityId: current.opportunityId,
      title: plan.title,
      kind: "follow_up",
      status: "open",
      priority: plan.priority,
      dueAt: plan.dueAt,
    });
    await notifyCompanyClients(current.companyId, {
      kind: "proposal",
      title: "A proposal is ready",
      body: current.title,
      href: `/portal/proposals/${current.id}`,
      entityType: "proposal",
      entityId: current.id,
    });
  }

  if (status === "viewed") {
    await writeActivity({
      type: "proposal_viewed",
      body: `Proposal “${current.title}” marked viewed.`,
      companyId: current.companyId,
      opportunityId: current.opportunityId,
      actorUserId: actor.id,
      clientVisible: true,
    });
  }

  if (status === "accepted") {
    await writeActivity({
      type: "proposal_accepted",
      body: `Proposal “${current.title}” accepted.`,
      companyId: current.companyId,
      opportunityId: current.opportunityId,
      actorUserId: actor.id,
      clientVisible: true,
    });
    await db
      .update(leads)
      .set({ status: "won", updatedAt: now })
      .where(eq(leads.opportunityId, current.opportunityId));
    await db
      .update(opportunities)
      .set({ stage: "won", updatedAt: now })
      .where(eq(opportunities.id, current.opportunityId));
  }
}

export async function listProjects(actor: Actor): Promise<Project[]> {
  const db = getDb();
  if (!db) return [];
  if (actor.role === "CLIENT") {
    const rows = await db
      .select()
      .from(projects)
      .where(eq(projects.companyId, actor.companyId ?? ""))
      .orderBy(desc(projects.updatedAt));
    return rows.map(mapProject);
  }
  authorize(actor, "project", "read");
  const rows = await db.select().from(projects).orderBy(desc(projects.updatedAt));
  return rows.map(mapProject);
}

export async function getProject(actor: Actor, id: string): Promise<Project> {
  const db = getDb();
  if (!db) notFound();
  const [row] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!row) notFound();
  authorize(actor, "project", "read", { companyId: row.companyId });
  return mapProject(row);
}

export async function createProject(
  actor: Actor,
  input: { name: string; companyId: string; proposalId?: string; overview?: string },
) {
  authorize(actor, "project", "create", { companyId: input.companyId });
  const db = getDb();
  if (!db) notFound();
  const [row] = await db
    .insert(projects)
    .values({
      name: input.name.trim(),
      companyId: input.companyId,
      proposalId: input.proposalId || null,
      overview: input.overview || null,
      status: "onboarding",
    })
    .returning();
  if (!row) notFound();
  await writeActivity({
    type: "project_created",
    body: `Project “${row.name}” opened.`,
    companyId: row.companyId,
    projectId: row.id,
    actorUserId: actor.id,
    clientVisible: true,
  });
  await notifyCompanyClients(row.companyId, {
    kind: "project_update",
    title: "Project opened",
    body: row.name,
    href: `/portal/projects/${row.id}`,
    entityType: "project",
    entityId: row.id,
  });
  return mapProject(row);
}

export async function updateProjectStatus(actor: Actor, id: string, status: ProjectStatus) {
  const project = await getProject(actor, id);
  authorize(actor, "project", "update", { companyId: project.companyId });
  if (!canTransitionProject(project.status, status)) notFound();
  const db = getDb();
  if (!db) notFound();
  await db.update(projects).set({ status, updatedAt: new Date() }).where(eq(projects.id, id));
}

export async function listMilestones(actor: Actor, projectId: string): Promise<Milestone[]> {
  const project = await getProject(actor, projectId);
  authorize(actor, "milestone", "read", { companyId: project.companyId });
  const db = getDb();
  if (!db) return [];
  const rows = await db
    .select()
    .from(milestones)
    .where(eq(milestones.projectId, projectId))
    .orderBy(milestones.dueAt);
  return rows.map((row) => ({
    id: row.id,
    projectId: row.projectId,
    title: row.title,
    dueAt: row.dueAt ? requiredIso(row.dueAt) : null,
    createdAt: requiredIso(row.createdAt),
  }));
}

export async function createMilestone(
  actor: Actor,
  input: { projectId: string; title: string; dueAt?: string },
) {
  const project = await getProject(actor, input.projectId);
  authorize(actor, "milestone", "create", { companyId: project.companyId });
  const db = getDb();
  if (!db) notFound();
  const [row] = await db
    .insert(milestones)
    .values({
      projectId: input.projectId,
      title: input.title.trim(),
      dueAt: input.dueAt ? new Date(input.dueAt) : null,
    })
    .returning();
  if (!row) notFound();
  return row;
}

export async function addProjectUpdate(
  actor: Actor,
  input: { projectId: string; body: string; clientVisible?: boolean },
) {
  const project = await getProject(actor, input.projectId);
  authorize(actor, "activity", "create", { companyId: project.companyId });
  const db = getDb();
  if (!db) notFound();
  const clientVisible = input.clientVisible ?? true;
  await db.insert(projectUpdates).values({
    projectId: project.id,
    authorUserId: actor.id,
    body: input.body.trim(),
    clientVisible,
  });
  await writeActivity({
    type: "project_update",
    body: input.body.trim(),
    companyId: project.companyId,
    projectId: project.id,
    actorUserId: actor.id,
    clientVisible,
  });
  if (clientVisible) {
    await notifyCompanyClients(project.companyId, {
      kind: "project_update",
      title: `Update on ${project.name}`,
      body: input.body.trim().slice(0, 200),
      href: `/portal/updates`,
      entityType: "project",
      entityId: project.id,
    });
  }
}

export async function listProjectUpdates(actor: Actor, projectId?: string) {
  const db = getDb();
  if (!db) return [];
  const rows = projectId
    ? await db
        .select()
        .from(projectUpdates)
        .where(eq(projectUpdates.projectId, projectId))
        .orderBy(desc(projectUpdates.createdAt))
    : await db.select().from(projectUpdates).orderBy(desc(projectUpdates.createdAt)).limit(80);
  if (actor.role === "CLIENT") {
    const allowed = await listProjects(actor);
    const ids = new Set(allowed.map((row) => row.id));
    return rows.filter((row) => ids.has(row.projectId) && row.clientVisible);
  }
  return rows;
}

export async function listTasks(actor: Actor): Promise<Task[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db.select().from(tasks).orderBy(desc(tasks.updatedAt));
  if (actor.role === "CLIENT") {
    return rows
      .filter((row) => row.companyId === actor.companyId && row.clientVisible)
      .map(mapTask);
  }
  authorize(actor, "task", "read");
  return rows.map(mapTask);
}

export async function getTask(actor: Actor, id: string): Promise<Task> {
  const db = getDb();
  if (!db) notFound();
  const [row] = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  if (!row) notFound();
  authorize(actor, "task", "read", {
    companyId: row.companyId,
    clientVisible: row.clientVisible,
  });
  return mapTask(row);
}

export async function createTask(
  actor: Actor,
  input: {
    title: string;
    description?: string;
    companyId?: string;
    leadId?: string;
    opportunityId?: string;
    projectId?: string;
    milestoneId?: string;
    assigneeUserId?: string;
    priority?: TaskPriority;
    kind?: TaskKind;
    dueAt?: string;
    clientVisible?: boolean;
  },
) {
  authorize(actor, "task", "create", { companyId: input.companyId ?? null });
  const db = getDb();
  if (!db) notFound();
  const [row] = await db
    .insert(tasks)
    .values({
      title: input.title.trim(),
      description: input.description || null,
      companyId: input.companyId || null,
      leadId: input.leadId || null,
      opportunityId: input.opportunityId || null,
      projectId: input.projectId || null,
      milestoneId: input.milestoneId || null,
      assigneeUserId: input.assigneeUserId || actor.id,
      priority: input.priority || "normal",
      kind: input.kind || "work",
      dueAt: input.dueAt ? new Date(input.dueAt) : null,
      clientVisible: input.clientVisible ?? false,
      status: "open",
    })
    .returning();
  if (!row) notFound();
  await writeActivity({
    type: "task_created",
    body: `Task “${row.title}” created.`,
    companyId: row.companyId,
    leadId: row.leadId,
    opportunityId: row.opportunityId,
    projectId: row.projectId,
    actorUserId: actor.id,
    clientVisible: row.clientVisible,
  });
  if (row.assigneeUserId) {
    await notify({
      userId: row.assigneeUserId,
      kind: row.kind === "follow_up" ? "follow_up" : "task",
      title: row.title,
      body: row.dueAt ? `Due ${row.dueAt.toISOString()}` : "Assigned to you.",
      href: `/admin/tasks/${row.id}`,
      entityType: "task",
      entityId: row.id,
    });
  }
  return mapTask(row);
}

export async function completeTask(actor: Actor, id: string) {
  const task = await getTask(actor, id);
  authorize(actor, "task", "update", {
    companyId: task.companyId,
    clientVisible: task.clientVisible,
  });
  const db = getDb();
  if (!db) notFound();
  await db
    .update(tasks)
    .set({ status: "completed", completedAt: new Date(), updatedAt: new Date() })
    .where(eq(tasks.id, id));
  await writeActivity({
    type: "task_completed",
    body: `Task “${task.title}” completed.`,
    companyId: task.companyId,
    leadId: task.leadId,
    opportunityId: task.opportunityId,
    projectId: task.projectId,
    actorUserId: actor.id,
    clientVisible: task.clientVisible,
  });
}

export async function updateTaskStatus(actor: Actor, id: string, status: TaskStatus) {
  const task = await getTask(actor, id);
  authorize(actor, "task", "update", {
    companyId: task.companyId,
    clientVisible: task.clientVisible,
  });
  const db = getDb();
  if (!db) notFound();
  await db
    .update(tasks)
    .set({
      status,
      completedAt: status === "completed" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, id));
}

export async function listDocuments(actor: Actor): Promise<DocumentRecord[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db.select().from(documents).orderBy(desc(documents.createdAt));
  if (actor.role === "CLIENT") {
    return rows
      .filter((row) => row.companyId === actor.companyId && row.visibility === "client")
      .map(mapDocument);
  }
  authorize(actor, "document", "read");
  return rows.map(mapDocument);
}

export async function getDocument(actor: Actor, id: string) {
  const db = getDb();
  if (!db) notFound();
  const [row] = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
  if (!row) notFound();
  authorize(actor, "document", "read", {
    companyId: row.companyId,
    documentVisibility: row.visibility,
  });
  return row;
}

export async function createDocument(
  actor: Actor,
  input: {
    title: string;
    uri: string;
    type: DocumentType;
    visibility: DocumentVisibility;
    companyId?: string;
    projectId?: string;
    mimeType?: string;
  },
) {
  authorize(actor, "document", "create", { companyId: input.companyId ?? null });
  const db = getDb();
  if (!db) notFound();
  const [row] = await db
    .insert(documents)
    .values({
      title: input.title.trim(),
      uri: input.uri.trim(),
      type: input.type,
      visibility: input.visibility,
      companyId: input.companyId || null,
      projectId: input.projectId || null,
      mimeType: input.mimeType || null,
    })
    .returning();
  if (!row) notFound();
  await writeActivity({
    type: "document_uploaded",
    body: `Document “${row.title}” recorded.`,
    companyId: row.companyId,
    projectId: row.projectId,
    actorUserId: actor.id,
    clientVisible: row.visibility === "client",
  });
  if (row.visibility === "client" && row.companyId) {
    await notifyCompanyClients(row.companyId, {
      kind: "document",
      title: "A document is available",
      body: row.title,
      href: `/portal/documents/${row.id}`,
      entityType: "document",
      entityId: row.id,
    });
  }
  return mapDocument(row);
}

export async function listMessages(actor: Actor, projectId: string): Promise<Message[]> {
  const project = await getProject(actor, projectId);
  authorize(actor, "message", "read", { companyId: project.companyId });
  const db = getDb();
  if (!db) return [];
  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.projectId, projectId))
    .orderBy(messages.createdAt);
  const reads = await db
    .select()
    .from(messageReads)
    .where(eq(messageReads.userId, actor.id));
  const readIds = new Set(reads.map((row) => row.messageId));
  return rows.map((row) => ({
    id: row.id,
    projectId: row.projectId,
    authorUserId: row.authorUserId,
    body: row.body,
    createdAt: requiredIso(row.createdAt),
    read: readIds.has(row.id),
  }));
}

export async function sendMessage(actor: Actor, input: { projectId: string; body: string }) {
  const project = await getProject(actor, input.projectId);
  authorize(actor, "message", "create", { companyId: project.companyId });
  const db = getDb();
  if (!db) notFound();
  const [row] = await db
    .insert(messages)
    .values({
      projectId: project.id,
      authorUserId: actor.id,
      body: input.body.trim(),
    })
    .returning();
  if (!row) notFound();
  await writeActivity({
    type: "message_sent",
    body: input.body.trim().slice(0, 240),
    companyId: project.companyId,
    projectId: project.id,
    actorUserId: actor.id,
    clientVisible: true,
  });
  if (actor.role === "CLIENT") {
    await notifyTeam({
      kind: "client_message",
      title: `Message on ${project.name}`,
      body: input.body.trim().slice(0, 200),
      href: `/admin/projects/${project.id}`,
      entityType: "message",
      entityId: row.id,
    });
  } else {
    await notifyCompanyClients(project.companyId, {
      kind: "client_message",
      title: `Message on ${project.name}`,
      body: input.body.trim().slice(0, 200),
      href: `/portal/messages`,
      entityType: "message",
      entityId: row.id,
    });
  }
  return row;
}

export async function markMessagesRead(actor: Actor, projectId: string) {
  const items = await listMessages(actor, projectId);
  const db = getDb();
  if (!db) return;
  for (const item of items) {
    if (item.read) continue;
    await db
      .insert(messageReads)
      .values({ messageId: item.id, userId: actor.id })
      .onConflictDoNothing();
  }
}

export async function listProposalVersions(actor: Actor, proposalId: string) {
  await getProposal(actor, proposalId);
  const db = getDb();
  if (!db) return [];
  if (actor.role === "CLIENT") return [];
  return db
    .select()
    .from(proposalVersions)
    .where(eq(proposalVersions.proposalId, proposalId))
    .orderBy(desc(proposalVersions.version));
}

export async function respondToProposal(
  actor: Actor,
  id: string,
  status: "accepted" | "rejected",
) {
  if (isTeamRole(actor.role)) {
    await transitionProposal(actor, id, status);
    return;
  }
  const current = await getProposal(actor, id);
  if (!actor.companyId || actor.companyId !== current.companyId) notFound();
  if (!isClientVisibleProposal(current.status, current.sharedWithClient)) notFound();
  if (current.status !== "sent" && current.status !== "viewed") notFound();
  const db = getDb();
  if (!db) notFound();
  const now = new Date();
  await db
    .update(proposals)
    .set({
      status,
      decidedAt: now,
      updatedAt: now,
    })
    .where(eq(proposals.id, id));
  if (status === "accepted") {
    await writeActivity({
      type: "proposal_accepted",
      body: `Proposal “${current.title}” accepted.`,
      companyId: current.companyId,
      opportunityId: current.opportunityId,
      actorUserId: actor.id,
      clientVisible: true,
    });
    await db
      .update(leads)
      .set({ status: "won", updatedAt: now })
      .where(eq(leads.opportunityId, current.opportunityId));
    await db
      .update(opportunities)
      .set({ stage: "won", updatedAt: now })
      .where(eq(opportunities.id, current.opportunityId));
  }
  await notifyTeam({
    kind: "proposal",
    title: status === "accepted" ? "Proposal accepted" : "Proposal rejected",
    body: current.title,
    href: `/admin/proposals/${id}`,
    entityType: "proposal",
    entityId: id,
  });
}

export async function getDocumentRecord(actor: Actor, id: string): Promise<DocumentRecord> {
  return mapDocument(await getDocument(actor, id));
}

export async function loadDocumentObject(actor: Actor, id: string) {
  const row = await getDocument(actor, id);
  try {
    const object = await getIntegrations().documents.getObject(row.uri);
    return { ok: true as const, title: row.title, ...object };
  } catch (error) {
    if (error instanceof IntegrationNotConfiguredError) {
      return { ok: false as const, title: row.title };
    }
    throw error;
  }
}
