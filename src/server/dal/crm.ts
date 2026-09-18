import "server-only";

import { desc, eq } from "drizzle-orm";
import type { Actor, Company, Contact, Lead, Opportunity, Signal } from "@/domain/entities";
import {
  canTransitionLead,
  canTransitionOpportunity,
  opportunityStageFromLead,
  type LeadStatus,
  type OpportunityStage,
  type SignalStatus,
} from "@/domain/lifecycle";
import { planFollowUp } from "@/domain/follow-up";
import { normalizeEmail, normalizeWebsite } from "@/domain/matching";
import { requiredIso } from "@/lib/format";
import { authorize } from "@/server/dal/access";
import { notifyTeam, writeActivity } from "@/server/dal/events";
import { getDb } from "@/server/db/client";
import {
  companies,
  contacts,
  leads,
  opportunities,
  scoreSnapshots,
  signals,
  tasks,
} from "@/server/db/schema";
import { notFound } from "next/navigation";

function mapCompany(row: typeof companies.$inferSelect): Company {
  return {
    id: row.id,
    name: row.name,
    website: row.website,
    city: row.city,
    linkedinUrl: row.linkedinUrl,
    notes: row.notes,
    createdAt: requiredIso(row.createdAt),
    updatedAt: requiredIso(row.updatedAt),
  };
}

function mapContact(row: typeof contacts.$inferSelect): Contact {
  return {
    id: row.id,
    companyId: row.companyId,
    name: row.name,
    roleTitle: row.roleTitle,
    email: row.email,
    phone: row.phone,
    linkedinUrl: row.linkedinUrl,
    createdAt: requiredIso(row.createdAt),
  };
}

function mapLead(row: typeof leads.$inferSelect): Lead {
  return {
    id: row.id,
    companyId: row.companyId,
    contactId: row.contactId,
    opportunityId: row.opportunityId,
    systemBriefId: row.systemBriefId,
    source: row.source,
    status: row.status,
    summary: row.summary,
    createdAt: requiredIso(row.createdAt),
    updatedAt: requiredIso(row.updatedAt),
  };
}

function mapOpportunity(row: typeof opportunities.$inferSelect): Opportunity {
  return {
    id: row.id,
    leadId: row.leadId,
    companyId: row.companyId,
    contactId: row.contactId,
    name: row.name,
    stage: row.stage,
    nextAction: row.nextAction,
    createdAt: requiredIso(row.createdAt),
    updatedAt: requiredIso(row.updatedAt),
  };
}

function mapSignal(row: typeof signals.$inferSelect): Signal {
  return {
    id: row.id,
    companyId: row.companyId,
    contactId: row.contactId,
    source: row.source,
    pain: row.pain,
    evidence: row.evidence,
    status: row.status,
    createdAt: requiredIso(row.createdAt),
  };
}

export async function listCompanies(actor: Actor): Promise<Company[]> {
  const db = getDb();
  if (!db) return [];
  if (actor.role === "CLIENT") {
    authorize(actor, "company", "read", { companyId: actor.companyId });
    if (!actor.companyId) return [];
    const rows = await db.select().from(companies).where(eq(companies.id, actor.companyId));
    return rows.map(mapCompany);
  }
  authorize(actor, "company", "read");
  const rows = await db.select().from(companies).orderBy(desc(companies.updatedAt));
  return rows.map(mapCompany);
}

export async function getCompany(actor: Actor, id: string): Promise<Company> {
  const db = getDb();
  if (!db) notFound();
  const [row] = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
  if (!row) notFound();
  authorize(actor, "company", "read", { companyId: row.id });
  return mapCompany(row);
}

export async function createCompany(
  actor: Actor,
  input: { name: string; website?: string; city?: string; linkedinUrl?: string; notes?: string },
) {
  authorize(actor, "company", "create");
  const db = getDb();
  if (!db) notFound();
  const [row] = await db
    .insert(companies)
    .values({
      name: input.name.trim(),
      website: input.website || null,
      websiteHost: normalizeWebsite(input.website),
      city: input.city || null,
      linkedinUrl: input.linkedinUrl || null,
      notes: input.notes || null,
    })
    .returning();
  if (!row) notFound();
  return mapCompany(row);
}

export async function listContacts(actor: Actor): Promise<Contact[]> {
  authorize(actor, "contact", "read");
  const db = getDb();
  if (!db) return [];
  const rows = await db.select().from(contacts).orderBy(desc(contacts.updatedAt));
  return rows.map(mapContact);
}

export async function getContact(actor: Actor, id: string): Promise<Contact> {
  const db = getDb();
  if (!db) notFound();
  const [row] = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1);
  if (!row) notFound();
  authorize(actor, "contact", "read", { companyId: row.companyId });
  return mapContact(row);
}

export async function createContact(
  actor: Actor,
  input: {
    name: string;
    companyId?: string;
    email?: string;
    phone?: string;
    roleTitle?: string;
    linkedinUrl?: string;
  },
) {
  authorize(actor, "contact", "create", { companyId: input.companyId ?? null });
  const db = getDb();
  if (!db) notFound();
  const [row] = await db
    .insert(contacts)
    .values({
      name: input.name.trim(),
      companyId: input.companyId || null,
      email: input.email || null,
      emailNormalized: normalizeEmail(input.email),
      phone: input.phone || null,
      roleTitle: input.roleTitle || null,
      linkedinUrl: input.linkedinUrl || null,
    })
    .returning();
  if (!row) notFound();
  return mapContact(row);
}

export async function listLeads(actor: Actor): Promise<Lead[]> {
  authorize(actor, "lead", "read");
  const db = getDb();
  if (!db) return [];
  const rows = await db.select().from(leads).orderBy(desc(leads.updatedAt));
  return rows.map(mapLead);
}

export async function getLead(actor: Actor, id: string): Promise<Lead> {
  const db = getDb();
  if (!db) notFound();
  const [row] = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  if (!row) notFound();
  authorize(actor, "lead", "read", { companyId: row.companyId });
  return mapLead(row);
}

export async function updateLeadStatus(actor: Actor, id: string, status: LeadStatus) {
  const lead = await getLead(actor, id);
  authorize(actor, "lead", "update", { companyId: lead.companyId });
  if (!canTransitionLead(lead.status, status)) notFound();
  const db = getDb();
  if (!db) notFound();
  await db
    .update(leads)
    .set({ status, updatedAt: new Date() })
    .where(eq(leads.id, id));

  if (status === "qualified") {
    await writeActivity({
      type: "lead_qualified",
      body: "Lead qualified.",
      companyId: lead.companyId,
      leadId: lead.id,
      opportunityId: lead.opportunityId,
      actorUserId: actor.id,
    });
    const plan = planFollowUp("lead_qualified");
    await db.insert(tasks).values({
      companyId: lead.companyId,
      leadId: lead.id,
      opportunityId: lead.opportunityId,
      title: plan.title,
      kind: "follow_up",
      status: "open",
      priority: plan.priority,
      dueAt: plan.dueAt,
    });
    await notifyTeam({
      kind: "system",
      title: "Lead qualified",
      body: lead.summary || lead.id,
      href: `/admin/leads/${lead.id}`,
      entityType: "lead",
      entityId: lead.id,
    });
  }

  const stage = opportunityStageFromLead(status);
  if (stage && lead.opportunityId) {
    const [opp] = await db
      .select()
      .from(opportunities)
      .where(eq(opportunities.id, lead.opportunityId))
      .limit(1);
    if (opp && canTransitionOpportunity(opp.stage, stage)) {
      await db
        .update(opportunities)
        .set({ stage, updatedAt: new Date() })
        .where(eq(opportunities.id, opp.id));
    } else if (opp && opp.stage !== stage) {
      await db
        .update(opportunities)
        .set({ stage, updatedAt: new Date() })
        .where(eq(opportunities.id, opp.id));
    }
  }
}

export async function listOpportunities(actor: Actor): Promise<Opportunity[]> {
  authorize(actor, "opportunity", "read");
  const db = getDb();
  if (!db) return [];
  const rows = await db.select().from(opportunities).orderBy(desc(opportunities.updatedAt));
  return rows.map(mapOpportunity);
}

export async function getOpportunity(actor: Actor, id: string): Promise<Opportunity> {
  const db = getDb();
  if (!db) notFound();
  const [row] = await db.select().from(opportunities).where(eq(opportunities.id, id)).limit(1);
  if (!row) notFound();
  authorize(actor, "opportunity", "read", { companyId: row.companyId });
  return mapOpportunity(row);
}

export async function updateOpportunityStage(
  actor: Actor,
  id: string,
  stage: OpportunityStage,
) {
  const opportunity = await getOpportunity(actor, id);
  authorize(actor, "opportunity", "update", { companyId: opportunity.companyId });
  if (!canTransitionOpportunity(opportunity.stage, stage)) notFound();
  const db = getDb();
  if (!db) notFound();
  await db
    .update(opportunities)
    .set({ stage, updatedAt: new Date() })
    .where(eq(opportunities.id, id));
}

export async function listSignals(actor: Actor): Promise<Signal[]> {
  authorize(actor, "signal", "read");
  const db = getDb();
  if (!db) return [];
  const rows = await db.select().from(signals).orderBy(desc(signals.createdAt));
  return rows.map(mapSignal);
}

export async function createSignal(
  actor: Actor,
  input: {
    source: string;
    pain?: string;
    evidence?: string;
    companyId?: string;
    contactId?: string;
    playbook?: string;
  },
) {
  authorize(actor, "signal", "create", { companyId: input.companyId ?? null });
  const db = getDb();
  if (!db) notFound();
  const [row] = await db
    .insert(signals)
    .values({
      source: input.source.trim(),
      pain: input.pain || null,
      evidence: input.evidence || null,
      companyId: input.companyId || null,
      contactId: input.contactId || null,
      playbook: input.playbook || "market_researcher",
      status: "new",
    })
    .returning();
  if (!row) notFound();
  const plan = planFollowUp("signal_captured");
  await db.insert(tasks).values({
    companyId: input.companyId || null,
    title: plan.title,
    description: input.pain || null,
    kind: "follow_up",
    status: "open",
    priority: plan.priority,
    dueAt: plan.dueAt,
  });
  await writeActivity({
    type: "agent_run",
    body: `Lead Radar signal captured from ${input.source}.`,
    companyId: input.companyId || null,
    actorUserId: actor.id,
    playbook: input.playbook || "market_researcher",
  });
  return mapSignal(row);
}

export async function promoteSignal(actor: Actor, signalId: string) {
  authorize(actor, "signal", "update");
  const db = getDb();
  if (!db) notFound();
  const [signal] = await db.select().from(signals).where(eq(signals.id, signalId)).limit(1);
  if (!signal) notFound();
  authorize(actor, "opportunity", "create", { companyId: signal.companyId });

  let companyId = signal.companyId;
  if (!companyId) {
    const [company] = await db
      .insert(companies)
      .values({ name: signal.source.slice(0, 80) || "Signal company" })
      .returning({ id: companies.id });
    companyId = company?.id ?? null;
  }
  if (!companyId) notFound();

  const [lead] = await db
    .insert(leads)
    .values({
      companyId,
      contactId: signal.contactId,
      source: "lead_radar",
      status: "needs_review",
      summary: signal.pain,
    })
    .returning();
  if (!lead) notFound();

  const [opportunity] = await db
    .insert(opportunities)
    .values({
      leadId: lead.id,
      companyId,
      contactId: signal.contactId,
      name: signal.pain ? signal.pain.slice(0, 80) : "Lead Radar opportunity",
      stage: "identified",
      nextAction: "Score and qualify",
    })
    .returning();
  if (!opportunity) notFound();

  await db
    .update(leads)
    .set({ opportunityId: opportunity.id, updatedAt: new Date() })
    .where(eq(leads.id, lead.id));
  await db
    .update(signals)
    .set({
      status: "promoted" satisfies SignalStatus,
      companyId,
      opportunityId: opportunity.id,
      updatedAt: new Date(),
    })
    .where(eq(signals.id, signal.id));
  await db.insert(scoreSnapshots).values({
    opportunityId: opportunity.id,
    signalId: signal.id,
    score: 50,
    rationale: "Promoted from Lead Radar. Score is a snapshot, not a client metric.",
    playbook: signal.playbook || "opportunity_analyst",
  });
  await writeActivity({
    type: "lead_created",
    body: "Lead Radar signal promoted into the commercial spine.",
    companyId,
    leadId: lead.id,
    opportunityId: opportunity.id,
    actorUserId: actor.id,
    playbook: "opportunity_analyst",
  });
  return { leadId: lead.id, opportunityId: opportunity.id, companyId };
}
