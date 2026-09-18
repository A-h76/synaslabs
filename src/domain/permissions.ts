import { isTeamRole, type UserRole } from "./roles";
import type { DocumentVisibility, ProposalStatus } from "./lifecycle";
import { isClientVisibleProposal } from "./lifecycle";

export const RESOURCES = [
  "settings",
  "user",
  "lead",
  "contact",
  "company",
  "opportunity",
  "signal",
  "activity",
  "task",
  "discovery",
  "system_brief",
  "workflow",
  "proposal",
  "project",
  "document",
  "milestone",
  "message",
  "notification",
  "calendar",
  "content",
  "resource",
] as const;

export type Resource = (typeof RESOURCES)[number];
export type Action = "read" | "create" | "update" | "delete";

export type AccessContext = {
  role: UserRole;
  companyId: string | null;
  resourceCompanyId?: string | null;
  resourceProjectCompanyId?: string | null;
  sharedWithClient?: boolean;
  proposalStatus?: ProposalStatus;
  documentVisibility?: DocumentVisibility;
  clientVisible?: boolean;
};

const TEAM_CRM: Resource[] = [
  "lead",
  "contact",
  "company",
  "opportunity",
  "signal",
  "activity",
  "task",
  "discovery",
  "system_brief",
  "workflow",
  "proposal",
  "project",
  "document",
  "milestone",
  "message",
  "notification",
  "calendar",
  "content",
  "resource",
];

export function can(ctx: AccessContext, resource: Resource, action: Action): boolean {
  if (ctx.role === "ADMIN") {
    if (resource === "document" && action === "read") return true;
    return true;
  }

  if (ctx.role === "TEAM_MEMBER") {
    if (resource === "settings" || resource === "user") return false;
    return TEAM_CRM.includes(resource);
  }

  if (ctx.role !== "CLIENT") return false;
  if (!ctx.companyId) return false;
  if (action === "delete") return false;

  const scopedTo =
    ctx.resourceProjectCompanyId ?? ctx.resourceCompanyId ?? null;
  if (scopedTo && scopedTo !== ctx.companyId) return false;
  if (!scopedTo && resource !== "notification" && resource !== "user") {
    return false;
  }

  switch (resource) {
    case "company":
      return action === "read";
    case "proposal":
      return (
        action === "read" &&
        Boolean(ctx.sharedWithClient) &&
        (ctx.proposalStatus
          ? isClientVisibleProposal(ctx.proposalStatus, true)
          : true)
      );
    case "document":
      return action === "read" && ctx.documentVisibility === "client";
    case "task":
      if (ctx.clientVisible === false) return false;
      return action === "read" || action === "update";
    case "project":
    case "milestone":
      return action === "read";
    case "message":
      return action === "read" || action === "create";
    case "activity":
      return action === "read" && ctx.clientVisible !== false;
    case "notification":
      return action === "read" || action === "update";
    case "calendar":
      return action === "read";
    case "user":
      return action === "read" || action === "update";
    default:
      return false;
  }
}

export function assertTeamSurface(role: UserRole): boolean {
  return isTeamRole(role);
}
