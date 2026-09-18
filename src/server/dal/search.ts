import "server-only";

import { ilike, or } from "drizzle-orm";
import type { Actor } from "@/domain/entities";
import { authorize } from "@/server/dal/access";
import { getDb } from "@/server/db/client";
import {
  companies,
  contacts,
  documents,
  leads,
  opportunities,
  projects,
  proposals,
  systemBriefs,
  tasks,
} from "@/server/db/schema";

export type SearchHit = {
  href: string;
  collection: string;
  label: string;
  meta: string;
};

export async function searchOperatingSystem(
  actor: Actor,
  query: string,
): Promise<SearchHit[]> {
  authorize(actor, "company", "read");
  const db = getDb();
  const needle = query.trim();
  if (!db || needle.length < 2) return [];
  const q = `%${needle}%`;

  const [
    companyRows,
    contactRows,
    leadRows,
    oppRows,
    briefRows,
    proposalRows,
    projectRows,
    documentRows,
    taskRows,
  ] = await Promise.all([
    db
      .select()
      .from(companies)
      .where(or(ilike(companies.name, q), ilike(companies.website, q)))
      .limit(8),
    db
      .select()
      .from(contacts)
      .where(or(ilike(contacts.name, q), ilike(contacts.email, q)))
      .limit(8),
    db.select().from(leads).where(ilike(leads.summary, q)).limit(8),
    db.select().from(opportunities).where(ilike(opportunities.name, q)).limit(8),
    db
      .select()
      .from(systemBriefs)
      .where(or(ilike(systemBriefs.title, q), ilike(systemBriefs.summary, q)))
      .limit(8),
    db.select().from(proposals).where(ilike(proposals.title, q)).limit(8),
    db.select().from(projects).where(ilike(projects.name, q)).limit(8),
    db.select().from(documents).where(ilike(documents.title, q)).limit(8),
    db.select().from(tasks).where(ilike(tasks.title, q)).limit(8),
  ]);

  const hits: SearchHit[] = [
    ...companyRows.map((row) => ({
      href: `/admin/companies/${row.id}`,
      collection: "Company",
      label: row.name,
      meta: row.website || "",
    })),
    ...contactRows.map((row) => ({
      href: `/admin/contacts/${row.id}`,
      collection: "Contact",
      label: row.name,
      meta: row.email || "",
    })),
    ...leadRows.map((row) => ({
      href: `/admin/leads/${row.id}`,
      collection: "Lead",
      label: row.summary || row.source,
      meta: row.status,
    })),
    ...oppRows.map((row) => ({
      href: `/admin/opportunities/${row.id}`,
      collection: "Opportunity",
      label: row.name,
      meta: row.stage,
    })),
    ...briefRows.map((row) => ({
      href: `/admin/system-briefs/${row.id}`,
      collection: "System brief",
      label: row.title,
      meta: row.source,
    })),
    ...proposalRows.map((row) => ({
      href: `/admin/proposals/${row.id}`,
      collection: "Proposal",
      label: row.title,
      meta: row.status,
    })),
    ...projectRows.map((row) => ({
      href: `/admin/projects/${row.id}`,
      collection: "Project",
      label: row.name,
      meta: row.status,
    })),
    ...documentRows.map((row) => ({
      href: `/admin/documents/${row.id}`,
      collection: "Document",
      label: row.title,
      meta: row.visibility,
    })),
    ...taskRows.map((row) => ({
      href: `/admin/tasks/${row.id}`,
      collection: "Task",
      label: row.title,
      meta: row.status,
    })),
  ];

  return hits.slice(0, 40);
}
