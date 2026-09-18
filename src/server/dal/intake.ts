import "server-only";

import { and, desc, eq, inArray, sql } from "drizzle-orm";
import type { Inquiry } from "@/domain/inquiry";
import { isOpenLead, type LeadStatus } from "@/domain/lifecycle";
import {
  matchCompany,
  matchContact,
  normalizeEmail,
  normalizeName,
  normalizeWebsite,
} from "@/domain/matching";
import { planFollowUp } from "@/domain/follow-up";
import { parsePublicBrief } from "@/domain/workflow/public-brief";
import { getDb } from "@/server/db/client";
import {
  companies,
  contacts,
  leads,
  opportunities,
  simulationRuns,
  systemBriefs,
  tasks,
  workflows,
} from "@/server/db/schema";
import { notifyTeam, writeActivity } from "@/server/dal/events";

function parseBrief(raw: string | undefined) {
  if (!raw) return null;
  try {
    return parsePublicBrief(JSON.parse(raw));
  } catch {
    return null;
  }
}

export type IntakeResult = {
  companyId: string;
  contactId: string;
  leadId: string;
  opportunityId: string;
  briefId: string | null;
  duplicated: boolean;
};

export async function ingestPublicInquiry(inquiry: Inquiry): Promise<IntakeResult | null> {
  const db = getDb();
  if (!db) return null;

  const host = normalizeWebsite(inquiry.website || null);
  const email = normalizeEmail(inquiry.email);
  const brief = parseBrief(inquiry.briefJson);

  let matchedCompany = null;
  if (host) {
    const [byHost] = await db
      .select()
      .from(companies)
      .where(eq(companies.websiteHost, host))
      .limit(1);
    matchedCompany = byHost ?? null;
  }
  if (!matchedCompany) {
    const name = normalizeName(inquiry.businessName);
    const byName = await db
      .select()
      .from(companies)
      .where(sql`lower(${companies.name}) = ${name}`)
      .limit(5);
    matchedCompany = matchCompany(byName, {
      name: inquiry.businessName,
      website: inquiry.website,
    });
  }

  let companyId = matchedCompany?.id;
  if (!companyId) {
    const [created] = await db
      .insert(companies)
      .values({
        name: inquiry.businessName.trim(),
        website: inquiry.website || null,
        websiteHost: host,
      })
      .returning({ id: companies.id });
    companyId = created?.id;
  }
  if (!companyId) return null;

  const contactRows = await db
    .select()
    .from(contacts)
    .where(eq(contacts.companyId, companyId));
  const matchedContact = matchContact(contactRows, { email, companyId });

  let contactId = matchedContact?.id;
  if (!contactId) {
    const [created] = await db
      .insert(contacts)
      .values({
        companyId,
        name: inquiry.contactName.trim(),
        email: inquiry.email.trim(),
        emailNormalized: email,
        roleTitle: inquiry.role || null,
      })
      .returning({ id: contacts.id });
    contactId = created?.id;
  } else {
    await db
      .update(contacts)
      .set({
        name: inquiry.contactName.trim(),
        roleTitle: inquiry.role || contactRows.find((row) => row.id === contactId)?.roleTitle || null,
        updatedAt: new Date(),
      })
      .where(eq(contacts.id, contactId));
  }
  if (!contactId) return null;

  const openLeads = await db
    .select()
    .from(leads)
    .where(and(eq(leads.companyId, companyId), eq(leads.contactId, contactId)))
    .orderBy(desc(leads.createdAt));
  const existingLead = openLeads.find((row) => isOpenLead(row.status as LeadStatus));

  let leadId = existingLead?.id;
  let duplicated = Boolean(existingLead);
  let opportunityId = existingLead?.opportunityId ?? null;
  let briefId: string | null = existingLead?.systemBriefId ?? null;

  const summary = [
    inquiry.painPoints,
    inquiry.desiredOutcome ? `Outcome: ${inquiry.desiredOutcome}` : null,
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, 2000);

  if (!leadId) {
    const [created] = await db
      .insert(leads)
      .values({
        companyId,
        contactId,
        source: brief ? "website_brief" : "website_start",
        status: "new",
        summary,
      })
      .returning({ id: leads.id });
    leadId = created?.id ?? null;
    duplicated = false;
  } else {
    await db
      .update(leads)
      .set({
        summary,
        source: brief ? "website_brief" : existingLead?.source || "website_start",
        updatedAt: new Date(),
      })
      .where(eq(leads.id, leadId));
  }
  if (!leadId) return null;

  if (!opportunityId) {
    const [created] = await db
      .insert(opportunities)
      .values({
        leadId,
        companyId,
        contactId,
        name: brief?.draft.processName
          ? `${inquiry.businessName} — ${brief.draft.processName}`
          : `${inquiry.businessName} — inbound`,
        stage: "identified",
        nextAction: "Review inbound inquiry",
      })
      .returning({ id: opportunities.id });
    opportunityId = created?.id ?? null;
    if (opportunityId) {
      await db
        .update(leads)
        .set({ opportunityId, updatedAt: new Date() })
        .where(eq(leads.id, leadId));
    }
  }
  if (!opportunityId) return null;

  if (brief && !briefId) {
    const [workflow] = await db
      .insert(workflows)
      .values({
        schemaVersion: 1,
        document: brief.workflow,
      })
      .returning({ id: workflows.id });
    const [storedBrief] = await db
      .insert(systemBriefs)
      .values({
        source: "public_capture",
        workflowId: workflow?.id,
        leadId,
        opportunityId,
        companyId,
        title: brief.processName || brief.draft.processName || "System brief",
        summary: brief.narrative.slice(0, 500),
        version: 1,
        document: brief,
      })
      .returning({ id: systemBriefs.id });
    briefId = storedBrief?.id ?? null;
    if (workflow?.id && briefId) {
      await db.insert(simulationRuns).values({
        workflowId: workflow.id,
        systemBriefId: briefId,
        caseDocument: brief.workflow.sampleCase,
        events: brief.events ?? [],
      });
    }
    if (briefId) {
      await db
        .update(leads)
        .set({ systemBriefId: briefId, updatedAt: new Date() })
        .where(eq(leads.id, leadId));
      await writeActivity({
        type: "system_brief_created",
        body: `System brief “${brief.draft.processName}” attached from the public site.`,
        companyId,
        leadId,
        opportunityId,
      });
    }
  }

  if (!duplicated) {
    await writeActivity({
      type: "lead_created",
      body: `Inbound inquiry from ${inquiry.contactName} at ${inquiry.businessName}.`,
      companyId,
      leadId,
      opportunityId,
    });
    const plan = planFollowUp("lead_created");
    await db.insert(tasks).values({
      companyId,
      leadId,
      opportunityId,
      title: plan.title,
      kind: "follow_up",
      status: "open",
      priority: plan.priority,
      dueAt: plan.dueAt,
      clientVisible: false,
    });
    await notifyTeam({
      kind: "system",
      title: "New inbound lead",
      body: `${inquiry.businessName} — ${inquiry.contactName}`,
      href: `/admin/leads/${leadId}`,
      entityType: "lead",
      entityId: leadId,
    });
  }

  return {
    companyId,
    contactId,
    leadId,
    opportunityId,
    briefId,
    duplicated,
  };
}

export async function findOpenLeadIds(companyId: string, contactId: string) {
  const db = getDb();
  if (!db) return [];
  const rows = await db
    .select({ id: leads.id, status: leads.status })
    .from(leads)
    .where(and(eq(leads.companyId, companyId), eq(leads.contactId, contactId)));
  return rows.filter((row) => isOpenLead(row.status)).map((row) => row.id);
}

export async function countOpenLeadsForEmail(email: string) {
  const db = getDb();
  if (!db) return 0;
  const normalized = normalizeEmail(email);
  if (!normalized) return 0;
  const people = await db
    .select({ id: contacts.id })
    .from(contacts)
    .where(eq(contacts.emailNormalized, normalized));
  if (people.length === 0) return 0;
  const rows = await db
    .select({ status: leads.status })
    .from(leads)
    .where(inArray(leads.contactId, people.map((row) => row.id)));
  return rows.filter((row) => isOpenLead(row.status)).length;
}
