import "server-only";

import { notFound } from "next/navigation";
import type { Actor } from "@/domain/entities";
import {
  can,
  type Action,
  type Resource,
} from "@/domain/permissions";
import { isClientRole, isTeamRole } from "@/domain/roles";
import type { DocumentVisibility, ProposalStatus } from "@/domain/lifecycle";
import { getCurrentActor } from "./actor";

export async function requireActor(): Promise<Actor> {
  const actor = await getCurrentActor();
  if (!actor) notFound();
  return actor;
}

export async function requireTeamActor(): Promise<Actor> {
  const actor = await requireActor();
  if (!isTeamRole(actor.role)) notFound();
  return actor;
}

export async function requireClientActor(): Promise<Actor> {
  const actor = await requireActor();
  if (!isClientRole(actor.role) || !actor.companyId) notFound();
  return actor;
}

export function authorize(
  actor: Actor,
  resource: Resource,
  action: Action,
  scope?: {
    companyId?: string | null;
    sharedWithClient?: boolean;
    proposalStatus?: ProposalStatus;
    documentVisibility?: DocumentVisibility;
    clientVisible?: boolean;
  },
): void {
  const allowed = can(
    {
      role: actor.role,
      companyId: actor.companyId,
      resourceCompanyId: scope?.companyId,
      sharedWithClient: scope?.sharedWithClient,
      proposalStatus: scope?.proposalStatus,
      documentVisibility: scope?.documentVisibility,
      clientVisible: scope?.clientVisible,
    },
    resource,
    action,
  );
  if (!allowed) notFound();
}

export function assertCompanyScope(actor: Actor, companyId: string | null): void {
  if (isTeamRole(actor.role)) return;
  if (!actor.companyId || actor.companyId !== companyId) notFound();
}
