export const LEAD_STATUSES = [
  "new",
  "needs_review",
  "qualified",
  "discovery",
  "proposal",
  "negotiation",
  "won",
  "lost",
  "passed",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const OPEN_LEAD_STATUSES: readonly LeadStatus[] = [
  "new",
  "needs_review",
  "qualified",
  "discovery",
  "proposal",
  "negotiation",
];

export const OPPORTUNITY_STAGES = [
  "identified",
  "discovery",
  "proposal",
  "negotiation",
  "won",
  "lost",
] as const;
export type OpportunityStage = (typeof OPPORTUNITY_STAGES)[number];

export const PROJECT_STATUSES = [
  "onboarding",
  "active",
  "on_hold",
  "completed",
  "cancelled",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROPOSAL_STATUSES = [
  "draft",
  "internal_review",
  "sent",
  "viewed",
  "accepted",
  "rejected",
  "expired",
] as const;
export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

export const CLIENT_PROPOSAL_STATUSES: readonly ProposalStatus[] = [
  "sent",
  "viewed",
  "accepted",
  "rejected",
  "expired",
];

export const TASK_STATUSES = ["open", "in_progress", "completed", "cancelled"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["low", "normal", "high", "urgent"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_KINDS = ["follow_up", "work"] as const;
export type TaskKind = (typeof TASK_KINDS)[number];

export const DOCUMENT_TYPES = [
  "nda",
  "proposal",
  "sow",
  "requirements",
  "technical_documentation",
  "invoice",
  "handover",
  "other",
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const DOCUMENT_VISIBILITIES = ["internal", "client"] as const;
export type DocumentVisibility = (typeof DOCUMENT_VISIBILITIES)[number];

export const ACTIVITY_TYPES = [
  "note",
  "call",
  "email",
  "meeting",
  "system",
  "agent_run",
  "lead_created",
  "lead_qualified",
  "discovery_created",
  "system_brief_created",
  "proposal_created",
  "proposal_sent",
  "proposal_viewed",
  "proposal_accepted",
  "project_created",
  "task_created",
  "task_completed",
  "document_uploaded",
  "project_update",
  "message_sent",
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const SYSTEM_BRIEF_SOURCES = [
  "public_capture",
  "discovery",
  "internal",
] as const;
export type SystemBriefSource = (typeof SYSTEM_BRIEF_SOURCES)[number];

export const WORKFLOW_ACTORS = ["system", "human", "mixed"] as const;
export type WorkflowActor = (typeof WORKFLOW_ACTORS)[number];

export const LEAD_RADAR_PLAYBOOKS = [
  "market_researcher",
  "opportunity_analyst",
  "sales_strategist",
  "crm_follow_up",
  "growth_niche_strategist",
] as const;
export type LeadRadarPlaybook = (typeof LEAD_RADAR_PLAYBOOKS)[number];

export const SIGNAL_STATUSES = [
  "new",
  "researching",
  "scored",
  "promoted",
  "discarded",
] as const;
export type SignalStatus = (typeof SIGNAL_STATUSES)[number];

export const CALENDAR_EVENT_KINDS = [
  "discovery",
  "follow_up",
  "sales",
  "project",
  "deadline",
] as const;
export type CalendarEventKind = (typeof CALENDAR_EVENT_KINDS)[number];

export const NOTIFICATION_KINDS = [
  "follow_up",
  "proposal",
  "task",
  "project_update",
  "client_message",
  "document",
  "meeting",
  "system",
] as const;
export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

const leadTransitions: Record<LeadStatus, readonly LeadStatus[]> = {
  new: ["needs_review", "qualified", "passed", "lost"],
  needs_review: ["qualified", "passed", "lost", "new"],
  qualified: ["discovery", "passed", "lost"],
  discovery: ["proposal", "lost", "passed"],
  proposal: ["negotiation", "lost"],
  negotiation: ["won", "lost"],
  won: [],
  lost: ["new"],
  passed: ["new"],
};

const opportunityTransitions: Record<
  OpportunityStage,
  readonly OpportunityStage[]
> = {
  identified: ["discovery", "lost"],
  discovery: ["proposal", "lost"],
  proposal: ["negotiation", "lost"],
  negotiation: ["won", "lost"],
  won: [],
  lost: ["identified"],
};

const proposalTransitions: Record<ProposalStatus, readonly ProposalStatus[]> = {
  draft: ["internal_review", "sent"],
  internal_review: ["draft", "sent"],
  sent: ["viewed", "accepted", "rejected", "expired"],
  viewed: ["accepted", "rejected", "expired"],
  accepted: [],
  rejected: ["draft"],
  expired: ["draft"],
};

const projectTransitions: Record<ProjectStatus, readonly ProjectStatus[]> = {
  onboarding: ["active", "on_hold", "cancelled"],
  active: ["on_hold", "completed", "cancelled"],
  on_hold: ["active", "cancelled"],
  completed: [],
  cancelled: ["onboarding"],
};

export function canTransitionLead(from: LeadStatus, to: LeadStatus): boolean {
  return leadTransitions[from].includes(to);
}

export function canTransitionOpportunity(
  from: OpportunityStage,
  to: OpportunityStage,
): boolean {
  return opportunityTransitions[from].includes(to);
}

export function canTransitionProposal(
  from: ProposalStatus,
  to: ProposalStatus,
): boolean {
  return proposalTransitions[from].includes(to);
}

export function canTransitionProject(
  from: ProjectStatus,
  to: ProjectStatus,
): boolean {
  return projectTransitions[from].includes(to);
}

export function opportunityStageFromLead(
  status: LeadStatus,
): OpportunityStage | null {
  switch (status) {
    case "qualified":
      return "identified";
    case "discovery":
      return "discovery";
    case "proposal":
      return "proposal";
    case "negotiation":
      return "negotiation";
    case "won":
      return "won";
    case "lost":
      return "lost";
    default:
      return null;
  }
}

export function isClientVisibleProposal(status: ProposalStatus, shared: boolean): boolean {
  return shared && CLIENT_PROPOSAL_STATUSES.includes(status);
}

export function isOpenLead(status: LeadStatus): boolean {
  return OPEN_LEAD_STATUSES.includes(status);
}
