import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import {
  ACTIVITY_TYPES,
  CALENDAR_EVENT_KINDS,
  DOCUMENT_TYPES,
  DOCUMENT_VISIBILITIES,
  LEAD_STATUSES,
  NOTIFICATION_KINDS,
  OPPORTUNITY_STAGES,
  PROJECT_STATUSES,
  PROPOSAL_STATUSES,
  SIGNAL_STATUSES,
  SYSTEM_BRIEF_SOURCES,
  TASK_KINDS,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from "@/domain/lifecycle";
import { USER_ROLES } from "@/domain/roles";

export const userRoleEnum = pgEnum("user_role", USER_ROLES);
export const leadStatusEnum = pgEnum("lead_status", LEAD_STATUSES);
export const opportunityStageEnum = pgEnum(
  "opportunity_stage",
  OPPORTUNITY_STAGES,
);
export const projectStatusEnum = pgEnum("project_status", PROJECT_STATUSES);
export const proposalStatusEnum = pgEnum("proposal_status", PROPOSAL_STATUSES);
export const activityTypeEnum = pgEnum("activity_type", ACTIVITY_TYPES);
export const systemBriefSourceEnum = pgEnum(
  "system_brief_source",
  SYSTEM_BRIEF_SOURCES,
);
export const taskStatusEnum = pgEnum("task_status", TASK_STATUSES);
export const taskPriorityEnum = pgEnum("task_priority", TASK_PRIORITIES);
export const taskKindEnum = pgEnum("task_kind", TASK_KINDS);
export const documentTypeEnum = pgEnum("document_type", DOCUMENT_TYPES);
export const documentVisibilityEnum = pgEnum(
  "document_visibility",
  DOCUMENT_VISIBILITIES,
);
export const notificationKindEnum = pgEnum(
  "notification_kind",
  NOTIFICATION_KINDS,
);
export const calendarEventKindEnum = pgEnum(
  "calendar_event_kind",
  CALENDAR_EVENT_KINDS,
);
export const signalStatusEnum = pgEnum("signal_status", SIGNAL_STATUSES);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
};

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    role: userRoleEnum("role").notNull(),
    companyId: uuid("company_id"),
    passwordHash: text("password_hash"),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [uniqueIndex("users_email_idx").on(table.email)],
);

export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  website: text("website"),
  websiteHost: text("website_host"),
  city: text("city"),
  linkedinUrl: text("linkedin_url"),
  notes: text("notes"),
  ...timestamps,
});

export const contacts = pgTable(
  "contacts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id").references(() => companies.id),
    name: text("name").notNull(),
    roleTitle: text("role_title"),
    email: text("email"),
    emailNormalized: text("email_normalized"),
    phone: text("phone"),
    linkedinUrl: text("linkedin_url"),
    ...timestamps,
  },
  (table) => [
    index("contacts_company_idx").on(table.companyId),
    index("contacts_email_idx").on(table.emailNormalized),
  ],
);

export const workflows = pgTable("workflows", {
  id: uuid("id").defaultRandom().primaryKey(),
  schemaVersion: integer("schema_version").notNull().default(1),
  document: jsonb("document").notNull(),
  ...timestamps,
});

export const systemBriefs = pgTable(
  "system_briefs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    source: systemBriefSourceEnum("source").notNull(),
    workflowId: uuid("workflow_id").references(() => workflows.id),
    leadId: uuid("lead_id"),
    opportunityId: uuid("opportunity_id"),
    discoveryId: uuid("discovery_id"),
    companyId: uuid("company_id").references(() => companies.id),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    version: integer("version").notNull().default(1),
    document: jsonb("document").notNull(),
    ...timestamps,
  },
  (table) => [
    index("system_briefs_lead_idx").on(table.leadId),
    index("system_briefs_opportunity_idx").on(table.opportunityId),
    index("system_briefs_company_idx").on(table.companyId),
  ],
);

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id").references(() => companies.id),
    contactId: uuid("contact_id").references(() => contacts.id),
    opportunityId: uuid("opportunity_id"),
    systemBriefId: uuid("system_brief_id").references(() => systemBriefs.id),
    source: text("source").notNull(),
    status: leadStatusEnum("status").notNull().default("new"),
    summary: text("summary"),
    ...timestamps,
  },
  (table) => [
    index("leads_company_idx").on(table.companyId),
    index("leads_status_idx").on(table.status),
    index("leads_contact_idx").on(table.contactId),
  ],
);

export const opportunities = pgTable(
  "opportunities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    leadId: uuid("lead_id").references(() => leads.id),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id),
    contactId: uuid("contact_id").references(() => contacts.id),
    name: text("name").notNull(),
    stage: opportunityStageEnum("stage").notNull().default("identified"),
    nextAction: text("next_action"),
    ...timestamps,
  },
  (table) => [
    index("opportunities_company_idx").on(table.companyId),
    index("opportunities_stage_idx").on(table.stage),
    index("opportunities_lead_idx").on(table.leadId),
  ],
);

export const signals = pgTable(
  "signals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id").references(() => companies.id),
    contactId: uuid("contact_id").references(() => contacts.id),
    opportunityId: uuid("opportunity_id").references(() => opportunities.id),
    source: text("source").notNull(),
    pain: text("pain"),
    evidence: text("evidence"),
    status: signalStatusEnum("status").notNull().default("new"),
    playbook: text("playbook"),
    ...timestamps,
  },
  (table) => [index("signals_company_idx").on(table.companyId)],
);

export const scoreSnapshots = pgTable(
  "score_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    opportunityId: uuid("opportunity_id")
      .notNull()
      .references(() => opportunities.id),
    signalId: uuid("signal_id").references(() => signals.id),
    score: integer("score").notNull(),
    rationale: text("rationale").notNull(),
    playbook: text("playbook"),
    ...timestamps,
  },
  (table) => [index("score_snapshots_opportunity_idx").on(table.opportunityId)],
);

export const discoveries = pgTable(
  "discoveries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    opportunityId: uuid("opportunity_id")
      .notNull()
      .references(() => opportunities.id),
    companyId: uuid("company_id").references(() => companies.id),
    systemBriefId: uuid("system_brief_id").references(() => systemBriefs.id),
    businessContext: text("business_context"),
    currentWorkflow: text("current_workflow"),
    currentTools: text("current_tools"),
    manualWork: text("manual_work"),
    customerExperience: text("customer_experience"),
    dataNotes: text("data_notes"),
    usersNotes: text("users_notes"),
    integrations: text("integrations"),
    goals: text("goals"),
    timeline: text("timeline"),
    budget: text("budget"),
    automationOpportunities: text("automation_opportunities"),
    risks: text("risks"),
    openQuestions: text("open_questions"),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => [index("discoveries_opportunity_idx").on(table.opportunityId)],
);

export const simulationRuns = pgTable("simulation_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  workflowId: uuid("workflow_id")
    .notNull()
    .references(() => workflows.id),
  systemBriefId: uuid("system_brief_id").references(() => systemBriefs.id),
  caseDocument: jsonb("case_document").notNull(),
  events: jsonb("events").notNull(),
  ...timestamps,
});

export const proposals = pgTable(
  "proposals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    opportunityId: uuid("opportunity_id")
      .notNull()
      .references(() => opportunities.id),
    systemBriefId: uuid("system_brief_id").references(() => systemBriefs.id),
    discoveryId: uuid("discovery_id").references(() => discoveries.id),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id),
    status: proposalStatusEnum("status").notNull().default("draft"),
    version: integer("version").notNull().default(1),
    title: text("title").notNull(),
    summary: text("summary"),
    understanding: text("understanding"),
    solution: text("solution"),
    scope: text("scope"),
    outOfScope: text("out_of_scope"),
    deliverables: text("deliverables"),
    timeline: text("timeline"),
    technology: text("technology"),
    investment: text("investment"),
    assumptions: text("assumptions"),
    responsibilities: text("responsibilities"),
    support: text("support"),
    terms: text("terms"),
    nextSteps: text("next_steps"),
    internalNotes: text("internal_notes"),
    sharedWithClient: boolean("shared_with_client").notNull().default(false),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    viewedAt: timestamp("viewed_at", { withTimezone: true }),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    index("proposals_company_idx").on(table.companyId),
    index("proposals_status_idx").on(table.status),
  ],
);

export const proposalVersions = pgTable(
  "proposal_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    proposalId: uuid("proposal_id")
      .notNull()
      .references(() => proposals.id),
    version: integer("version").notNull(),
    status: proposalStatusEnum("status").notNull(),
    document: jsonb("document").notNull(),
    createdByUserId: uuid("created_by_user_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("proposal_versions_proposal_idx").on(table.proposalId)],
);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id),
    proposalId: uuid("proposal_id").references(() => proposals.id),
    name: text("name").notNull(),
    overview: text("overview"),
    status: projectStatusEnum("status").notNull().default("onboarding"),
    ...timestamps,
  },
  (table) => [index("projects_company_idx").on(table.companyId)],
);

export const projectMembers = pgTable(
  "project_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("project_members_unique_idx").on(table.projectId, table.userId),
  ],
);

export const milestones = pgTable(
  "milestones",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    title: text("title").notNull(),
    dueAt: timestamp("due_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [index("milestones_project_idx").on(table.projectId)],
);

export const projectUpdates = pgTable(
  "project_updates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    authorUserId: uuid("author_user_id").references(() => users.id),
    body: text("body").notNull(),
    clientVisible: boolean("client_visible").notNull().default(true),
    ...timestamps,
  },
  (table) => [index("project_updates_project_idx").on(table.projectId)],
);

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id").references(() => projects.id),
    companyId: uuid("company_id").references(() => companies.id),
    messageId: uuid("message_id"),
    title: text("title").notNull(),
    uri: text("uri").notNull(),
    type: documentTypeEnum("type").notNull().default("other"),
    visibility: documentVisibilityEnum("visibility").notNull().default("internal"),
    mimeType: text("mime_type"),
    ...timestamps,
  },
  (table) => [
    index("documents_project_idx").on(table.projectId),
    index("documents_company_idx").on(table.companyId),
  ],
);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id").references(() => companies.id),
    leadId: uuid("lead_id").references(() => leads.id),
    opportunityId: uuid("opportunity_id").references(() => opportunities.id),
    projectId: uuid("project_id").references(() => projects.id),
    milestoneId: uuid("milestone_id").references(() => milestones.id),
    title: text("title").notNull(),
    description: text("description"),
    assigneeUserId: uuid("assignee_user_id").references(() => users.id),
    status: taskStatusEnum("status").notNull().default("open"),
    priority: taskPriorityEnum("priority").notNull().default("normal"),
    kind: taskKindEnum("kind").notNull().default("work"),
    dueAt: timestamp("due_at", { withTimezone: true }),
    clientVisible: boolean("client_visible").notNull().default(false),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    index("tasks_project_idx").on(table.projectId),
    index("tasks_due_idx").on(table.dueAt),
    index("tasks_assignee_idx").on(table.assigneeUserId),
  ],
);

export const activities = pgTable(
  "activities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: activityTypeEnum("type").notNull(),
    body: text("body").notNull(),
    companyId: uuid("company_id").references(() => companies.id),
    leadId: uuid("lead_id").references(() => leads.id),
    opportunityId: uuid("opportunity_id").references(() => opportunities.id),
    projectId: uuid("project_id").references(() => projects.id),
    actorUserId: uuid("actor_user_id").references(() => users.id),
    calendarEventId: text("calendar_event_id"),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    playbook: text("playbook"),
    clientVisible: boolean("client_visible").notNull().default(false),
    ...timestamps,
  },
  (table) => [
    index("activities_company_idx").on(table.companyId),
    index("activities_opportunity_idx").on(table.opportunityId),
    index("activities_project_idx").on(table.projectId),
    index("activities_created_idx").on(table.createdAt),
  ],
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    authorUserId: uuid("author_user_id").references(() => users.id),
    body: text("body").notNull(),
    ...timestamps,
  },
  (table) => [index("messages_project_idx").on(table.projectId)],
);

export const messageReads = pgTable(
  "message_reads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    messageId: uuid("message_id")
      .notNull()
      .references(() => messages.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    readAt: timestamp("read_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("message_reads_unique_idx").on(table.messageId, table.userId),
  ],
);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    kind: notificationKindEnum("kind").notNull().default("system"),
    title: text("title").notNull(),
    body: text("body").notNull(),
    href: text("href"),
    entityType: text("entity_type"),
    entityId: uuid("entity_id"),
    readAt: timestamp("read_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [index("notifications_user_idx").on(table.userId)],
);

export const calendarEvents = pgTable(
  "calendar_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    kind: calendarEventKindEnum("kind").notNull(),
    title: text("title").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    companyId: uuid("company_id").references(() => companies.id),
    opportunityId: uuid("opportunity_id").references(() => opportunities.id),
    projectId: uuid("project_id").references(() => projects.id),
    taskId: uuid("task_id").references(() => tasks.id),
    createdByUserId: uuid("created_by_user_id").references(() => users.id),
    location: text("location"),
    attendeeEmails: jsonb("attendee_emails").$type<string[]>(),
    providerEventId: text("provider_event_id"),
    ...timestamps,
  },
  (table) => [
    index("calendar_events_starts_idx").on(table.startsAt),
    index("calendar_events_company_idx").on(table.companyId),
  ],
);

export const contentItems = pgTable(
  "content_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [uniqueIndex("content_items_slug_idx").on(table.slug)],
);

export const resources = pgTable("resources", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  uri: text("uri").notNull(),
  ...timestamps,
});
