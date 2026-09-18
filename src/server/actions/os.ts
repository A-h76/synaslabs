"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  DOCUMENT_TYPES,
  DOCUMENT_VISIBILITIES,
  LEAD_STATUSES,
  OPPORTUNITY_STAGES,
  PROJECT_STATUSES,
  PROPOSAL_STATUSES,
  TASK_PRIORITIES,
  CALENDAR_EVENT_KINDS,
  type DocumentType,
  type DocumentVisibility,
  type LeadStatus,
  type OpportunityStage,
  type ProjectStatus,
  type ProposalStatus,
  type TaskPriority,
  type CalendarEventKind,
} from "@/domain/lifecycle";
import { requireTeamActor, requireClientActor } from "@/server/dal/access";
import {
  completeTask,
  createBrief,
  createDiscovery,
  createDocument,
  createMilestone,
  createProject,
  createProposal,
  createTask,
  markMessagesRead,
  respondToProposal,
  saveProposalVersion,
  sendMessage,
  transitionProposal,
  updateDiscovery,
  updateProjectStatus,
  addProjectUpdate,
} from "@/server/dal/commercial";
import {
  createCompany,
  createContact,
  createSignal,
  promoteSignal,
  updateLeadStatus as setLeadStatus,
  updateOpportunityStage,
} from "@/server/dal/crm";
import { addNote, createUser } from "@/server/dal/activity";
import { scheduleEvent } from "@/server/dal/calendar";
import { markNotificationRead } from "@/server/dal/events";
import { getCurrentActor } from "@/server/dal/actor";
import { isClientRole, isTeamRole, USER_ROLES, type UserRole } from "@/domain/roles";
import { notFound } from "next/navigation";
import { BRIEF_FIELD_LABELS } from "@/domain/brief-document";

function text(form: FormData, name: string): string {
  return String(form.get(name) ?? "").trim();
}

function optional(form: FormData, name: string): string | undefined {
  const value = text(form, name);
  return value || undefined;
}

export async function createCompanyAction(formData: FormData) {
  const actor = await requireTeamActor();
  const name = text(formData, "name");
  if (!name) return;
  const company = await createCompany(actor, {
    name,
    website: optional(formData, "website"),
    city: optional(formData, "city"),
    linkedinUrl: optional(formData, "linkedinUrl"),
    notes: optional(formData, "notes"),
  });
  revalidatePath("/admin/companies");
  redirect(`/admin/companies/${company.id}`);
}

export async function createContactAction(formData: FormData) {
  const actor = await requireTeamActor();
  const contact = await createContact(actor, {
    name: text(formData, "name"),
    companyId: optional(formData, "companyId"),
    email: optional(formData, "email"),
    phone: optional(formData, "phone"),
    roleTitle: optional(formData, "roleTitle"),
    linkedinUrl: optional(formData, "linkedinUrl"),
  });
  revalidatePath("/admin/contacts");
  redirect(`/admin/contacts/${contact.id}`);
}

export async function updateLeadStatusAction(formData: FormData) {
  const actor = await requireTeamActor();
  const id = text(formData, "id");
  const status = text(formData, "status");
  if (!LEAD_STATUSES.includes(status as LeadStatus)) return;
  await setLeadStatus(actor, id, status as LeadStatus);
  revalidatePath(`/admin/leads/${id}`);
}

export async function updateOpportunityStageAction(formData: FormData) {
  const actor = await requireTeamActor();
  const id = text(formData, "id");
  const stage = text(formData, "stage");
  if (!OPPORTUNITY_STAGES.includes(stage as OpportunityStage)) return;
  await updateOpportunityStage(actor, id, stage as OpportunityStage);
  revalidatePath(`/admin/opportunities/${id}`);
}

export async function createDiscoveryAction(formData: FormData) {
  const actor = await requireTeamActor();
  const discovery = await createDiscovery(actor, {
    opportunityId: text(formData, "opportunityId"),
    systemBriefId: optional(formData, "systemBriefId"),
  });
  revalidatePath("/admin/discovery");
  redirect(`/admin/discovery/${discovery.id}`);
}

export async function updateDiscoveryAction(formData: FormData) {
  const actor = await requireTeamActor();
  const id = text(formData, "id");
  await updateDiscovery(actor, id, {
    businessContext: optional(formData, "businessContext"),
    currentWorkflow: optional(formData, "currentWorkflow"),
    currentTools: optional(formData, "currentTools"),
    manualWork: optional(formData, "manualWork"),
    customerExperience: optional(formData, "customerExperience"),
    dataNotes: optional(formData, "dataNotes"),
    usersNotes: optional(formData, "usersNotes"),
    integrations: optional(formData, "integrations"),
    goals: optional(formData, "goals"),
    timeline: optional(formData, "timeline"),
    budget: optional(formData, "budget"),
    automationOpportunities: optional(formData, "automationOpportunities"),
    risks: optional(formData, "risks"),
    openQuestions: optional(formData, "openQuestions"),
    notes: optional(formData, "notes"),
    systemBriefId: optional(formData, "systemBriefId"),
  });
  revalidatePath(`/admin/discovery/${id}`);
}

export async function createProposalAction(formData: FormData) {
  const actor = await requireTeamActor();
  const title = text(formData, "title");
  const opportunityId = text(formData, "opportunityId");
  if (!title || !opportunityId) return;
  const proposal = await createProposal(actor, {
    opportunityId,
    title,
    systemBriefId: optional(formData, "systemBriefId"),
    discoveryId: optional(formData, "discoveryId"),
  });
  revalidatePath("/admin/proposals");
  redirect(`/admin/proposals/${proposal.id}`);
}

export async function saveProposalAction(formData: FormData) {
  const actor = await requireTeamActor();
  const id = text(formData, "id");
  await saveProposalVersion(actor, id, {
    title: optional(formData, "title"),
    summary: optional(formData, "summary"),
    understanding: optional(formData, "understanding"),
    solution: optional(formData, "solution"),
    scope: optional(formData, "scope"),
    outOfScope: optional(formData, "outOfScope"),
    deliverables: optional(formData, "deliverables"),
    timeline: optional(formData, "timeline"),
    technology: optional(formData, "technology"),
    investment: optional(formData, "investment"),
    assumptions: optional(formData, "assumptions"),
    responsibilities: optional(formData, "responsibilities"),
    support: optional(formData, "support"),
    terms: optional(formData, "terms"),
    nextSteps: optional(formData, "nextSteps"),
    internalNotes: optional(formData, "internalNotes"),
    systemBriefId: optional(formData, "systemBriefId"),
  });
  revalidatePath(`/admin/proposals/${id}`);
}

export async function transitionProposalAction(formData: FormData) {
  const actor = await requireTeamActor();
  const id = text(formData, "id");
  const status = text(formData, "status");
  if (!PROPOSAL_STATUSES.includes(status as ProposalStatus)) return;
  await transitionProposal(actor, id, status as ProposalStatus);
  revalidatePath(`/admin/proposals/${id}`);
}

export async function createProjectAction(formData: FormData) {
  const actor = await requireTeamActor();
  const project = await createProject(actor, {
    name: text(formData, "name"),
    companyId: text(formData, "companyId"),
    proposalId: optional(formData, "proposalId"),
    overview: optional(formData, "overview"),
  });
  revalidatePath("/admin/projects");
  redirect(`/admin/projects/${project.id}`);
}

export async function updateProjectStatusAction(formData: FormData) {
  const actor = await requireTeamActor();
  const id = text(formData, "id");
  const status = text(formData, "status");
  if (!PROJECT_STATUSES.includes(status as ProjectStatus)) return;
  await updateProjectStatus(actor, id, status as ProjectStatus);
  revalidatePath(`/admin/projects/${id}`);
}

export async function createMilestoneAction(formData: FormData) {
  const actor = await requireTeamActor();
  const projectId = text(formData, "projectId");
  await createMilestone(actor, {
    projectId,
    title: text(formData, "title"),
    dueAt: optional(formData, "dueAt"),
  });
  revalidatePath(`/admin/projects/${projectId}`);
}

export async function addProjectUpdateAction(formData: FormData) {
  const actor = await requireTeamActor();
  await addProjectUpdate(actor, {
    projectId: text(formData, "projectId"),
    body: text(formData, "body"),
    clientVisible: formData.get("clientVisible") === "on",
  });
  revalidatePath("/admin/projects");
}

export async function createTaskAction(formData: FormData) {
  const actor = await requireTeamActor();
  const priority = optional(formData, "priority") as TaskPriority | undefined;
  const task = await createTask(actor, {
    title: text(formData, "title"),
    description: optional(formData, "description"),
    companyId: optional(formData, "companyId"),
    leadId: optional(formData, "leadId"),
    opportunityId: optional(formData, "opportunityId"),
    projectId: optional(formData, "projectId"),
    milestoneId: optional(formData, "milestoneId"),
    assigneeUserId: optional(formData, "assigneeUserId"),
    priority: priority && TASK_PRIORITIES.includes(priority) ? priority : "normal",
    kind: formData.get("kind") === "follow_up" ? "follow_up" : "work",
    dueAt: optional(formData, "dueAt"),
    clientVisible: formData.get("clientVisible") === "on",
  });
  revalidatePath("/admin/tasks");
  redirect(`/admin/tasks/${task.id}`);
}

export async function completeTaskAction(formData: FormData) {
  const actor = await requireTeamActor();
  const id = text(formData, "id");
  await completeTask(actor, id);
  revalidatePath("/admin/tasks");
  revalidatePath("/admin/projects");
}

export async function completePortalTaskAction(formData: FormData) {
  const actor = await requireClientActor();
  const id = text(formData, "id");
  await completeTask(actor, id);
  revalidatePath("/portal/tasks");
}

export async function createDocumentAction(formData: FormData) {
  const actor = await requireTeamActor();
  const type = text(formData, "type") as DocumentType;
  const visibility = text(formData, "visibility") as DocumentVisibility;
  const document = await createDocument(actor, {
    title: text(formData, "title"),
    uri: text(formData, "uri"),
    type: DOCUMENT_TYPES.includes(type) ? type : "other",
    visibility: DOCUMENT_VISIBILITIES.includes(visibility) ? visibility : "internal",
    companyId: optional(formData, "companyId"),
    projectId: optional(formData, "projectId"),
  });
  revalidatePath("/admin/documents");
  redirect(`/admin/documents/${document.id}`);
}

export async function addNoteAction(formData: FormData) {
  const actor = await requireTeamActor();
  await addNote(actor, {
    body: text(formData, "body"),
    companyId: optional(formData, "companyId"),
    leadId: optional(formData, "leadId"),
    opportunityId: optional(formData, "opportunityId"),
    projectId: optional(formData, "projectId"),
  });
  revalidatePath("/admin/activity");
}

export async function sendMessageAction(formData: FormData) {
  const actor = await getCurrentActor();
  if (!actor || (!isTeamRole(actor.role) && !isClientRole(actor.role))) notFound();
  const projectId = text(formData, "projectId");
  const body = text(formData, "body");
  if (!projectId || !body) return;
  await sendMessage(actor, { projectId, body });
  await markMessagesRead(actor, projectId);
  revalidatePath("/admin/projects");
  revalidatePath("/portal/messages");
}

export async function markInboxReadAction(formData: FormData) {
  const actor = await getCurrentActor();
  if (!actor) notFound();
  await markMessagesRead(actor, text(formData, "projectId"));
}

export async function createBriefAction(formData: FormData) {
  const actor = await requireTeamActor();
  const title = text(formData, "title");
  const summary = text(formData, "summary");
  if (!title || !summary) return;
  const document = Object.fromEntries(
    BRIEF_FIELD_LABELS.map(({ key }) => [key, optional(formData, key) ?? ""]),
  ) as Record<(typeof BRIEF_FIELD_LABELS)[number]["key"], string>;
  const brief = await createBrief(actor, {
    title,
    summary,
    opportunityId: optional(formData, "opportunityId"),
    companyId: optional(formData, "companyId"),
    document,
  });
  revalidatePath("/admin/system-briefs");
  redirect(`/admin/system-briefs/${brief.id}`);
}

export async function respondToProposalAction(formData: FormData) {
  const actor = await getCurrentActor();
  if (!actor || !isClientRole(actor.role)) notFound();
  const id = text(formData, "id");
  const status = text(formData, "status");
  if (status !== "accepted" && status !== "rejected") return;
  await respondToProposal(actor, id, status);
  revalidatePath("/portal/proposals");
}

export async function markNotificationReadAction(formData: FormData) {
  const actor = await getCurrentActor();
  if (!actor) notFound();
  await markNotificationRead(actor, text(formData, "id"));
  revalidatePath("/admin");
  revalidatePath("/portal");
}

export async function createSignalAction(formData: FormData) {
  const actor = await requireTeamActor();
  await createSignal(actor, {
    source: text(formData, "source"),
    pain: optional(formData, "pain"),
    evidence: optional(formData, "evidence"),
    companyId: optional(formData, "companyId"),
    playbook: optional(formData, "playbook"),
  });
  revalidatePath("/admin/leads");
}

export async function promoteSignalAction(formData: FormData) {
  const actor = await requireTeamActor();
  const result = await promoteSignal(actor, text(formData, "id"));
  revalidatePath("/admin/opportunities");
  redirect(`/admin/opportunities/${result.opportunityId}`);
}

export async function scheduleEventAction(formData: FormData) {
  const actor = await requireTeamActor();
  const kind = text(formData, "kind") as CalendarEventKind;
  const startsAt = new Date(text(formData, "startsAt"));
  const endsAt = new Date(text(formData, "endsAt"));
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) return;
  if (!CALENDAR_EVENT_KINDS.includes(kind)) return;
  await scheduleEvent(actor, {
    kind: kind || "sales",
    title: text(formData, "title"),
    startsAt,
    endsAt,
    companyId: optional(formData, "companyId"),
    opportunityId: optional(formData, "opportunityId"),
    projectId: optional(formData, "projectId"),
    location: optional(formData, "location"),
  });
  revalidatePath("/admin");
}

export async function createUserAction(formData: FormData) {
  const actor = await requireTeamActor();
  const role = text(formData, "role") as UserRole;
  await createUser(actor, {
    email: text(formData, "email"),
    name: text(formData, "name"),
    role: USER_ROLES.includes(role) ? role : "TEAM_MEMBER",
    companyId: optional(formData, "companyId"),
    password: text(formData, "password"),
  });
  revalidatePath("/admin/settings");
}
