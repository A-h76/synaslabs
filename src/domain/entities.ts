import type {
  ActivityType,
  CalendarEventKind,
  DocumentType,
  DocumentVisibility,
  LeadStatus,
  NotificationKind,
  OpportunityStage,
  ProjectStatus,
  ProposalStatus,
  SystemBriefSource,
  TaskKind,
  TaskPriority,
  TaskStatus,
} from "./lifecycle";
import type { UserRole } from "./roles";

export type Actor = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId: string | null;
};

export type Company = {
  id: string;
  name: string;
  website: string | null;
  city: string | null;
  linkedinUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Contact = {
  id: string;
  companyId: string | null;
  name: string;
  roleTitle: string | null;
  email: string | null;
  phone: string | null;
  linkedinUrl: string | null;
  createdAt: string;
};

export type Lead = {
  id: string;
  companyId: string | null;
  contactId: string | null;
  opportunityId: string | null;
  systemBriefId: string | null;
  source: string;
  status: LeadStatus;
  summary: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Opportunity = {
  id: string;
  leadId: string | null;
  companyId: string;
  contactId: string | null;
  name: string;
  stage: OpportunityStage;
  nextAction: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Signal = {
  id: string;
  companyId: string | null;
  contactId: string | null;
  source: string;
  pain: string | null;
  evidence: string | null;
  status: string;
  createdAt: string;
};

export type Activity = {
  id: string;
  type: ActivityType;
  body: string;
  companyId: string | null;
  leadId: string | null;
  opportunityId: string | null;
  projectId: string | null;
  actorUserId: string | null;
  calendarEventId: string | null;
  startsAt: string | null;
  endsAt: string | null;
  playbook: string | null;
  clientVisible: boolean;
  createdAt: string;
};

export type SystemBriefRecord = {
  id: string;
  source: SystemBriefSource;
  leadId: string | null;
  opportunityId: string | null;
  discoveryId: string | null;
  workflowId: string | null;
  companyId: string | null;
  title: string;
  summary: string;
  version: number;
  document: unknown;
  createdAt: string;
  updatedAt: string;
};

export type DiscoveryRecord = {
  id: string;
  opportunityId: string;
  companyId: string | null;
  systemBriefId: string | null;
  businessContext: string | null;
  currentWorkflow: string | null;
  currentTools: string | null;
  manualWork: string | null;
  customerExperience: string | null;
  dataNotes: string | null;
  usersNotes: string | null;
  integrations: string | null;
  goals: string | null;
  timeline: string | null;
  budget: string | null;
  automationOpportunities: string | null;
  risks: string | null;
  openQuestions: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Proposal = {
  id: string;
  opportunityId: string;
  companyId: string;
  systemBriefId: string | null;
  discoveryId: string | null;
  status: ProposalStatus;
  version: number;
  title: string;
  summary: string | null;
  understanding: string | null;
  solution: string | null;
  scope: string | null;
  outOfScope: string | null;
  deliverables: string | null;
  timeline: string | null;
  technology: string | null;
  investment: string | null;
  assumptions: string | null;
  responsibilities: string | null;
  support: string | null;
  terms: string | null;
  nextSteps: string | null;
  internalNotes: string | null;
  sharedWithClient: boolean;
  sentAt: string | null;
  viewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Project = {
  id: string;
  companyId: string;
  proposalId: string | null;
  name: string;
  overview: string | null;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
};

export type Milestone = {
  id: string;
  projectId: string;
  title: string;
  dueAt: string | null;
  createdAt: string;
};

export type Task = {
  id: string;
  companyId: string | null;
  leadId: string | null;
  opportunityId: string | null;
  projectId: string | null;
  milestoneId: string | null;
  title: string;
  description: string | null;
  assigneeUserId: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  kind: TaskKind;
  dueAt: string | null;
  clientVisible: boolean;
  completedAt: string | null;
  createdAt: string;
};

export type DocumentRecord = {
  id: string;
  projectId: string | null;
  companyId: string | null;
  messageId: string | null;
  title: string;
  type: DocumentType;
  visibility: DocumentVisibility;
  createdAt: string;
};

export type Message = {
  id: string;
  projectId: string;
  authorUserId: string | null;
  body: string;
  createdAt: string;
  read: boolean;
};

export type Notification = {
  id: string;
  userId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

export type CalendarEvent = {
  id: string;
  kind: CalendarEventKind;
  title: string;
  startsAt: string;
  endsAt: string;
  companyId: string | null;
  opportunityId: string | null;
  projectId: string | null;
  location: string | null;
  providerEventId: string | null;
};

export function stripProposalForClient(proposal: Proposal): Omit<Proposal, "internalNotes"> {
  const { internalNotes: _hidden, ...rest } = proposal;
  void _hidden;
  return rest;
}
