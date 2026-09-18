import "server-only";

import { isDatabaseConfigured } from "@/lib/env";
import { authorize, requireTeamActor, requireClientActor } from "./access";
import {
  getAdminModule,
  getPortalSection,
  type AdminModuleSlug,
  type PortalSectionSlug,
} from "@/config/navigation";
import type { Resource } from "@/domain/permissions";

export type StoreState = "disconnected" | "connected";

export type RecordList = {
  title: string;
  store: StoreState;
  records: readonly { id: string; label: string; meta: string }[];
};

export async function listAdminModule(slug: string): Promise<RecordList | null> {
  const adminModule = getAdminModule(slug);
  if (!adminModule) return null;
  const actor = await requireTeamActor();
  authorize(actor, adminModule.resource as Resource, "read");
  return {
    title: adminModule.title,
    store: isDatabaseConfigured() ? "connected" : "disconnected",
    records: [],
  };
}

export async function listPortalSection(slug: string): Promise<RecordList | null> {
  const section = getPortalSection(slug);
  if (!section) return null;
  const actor = await requireClientActor();
  if (section.slug === "account") {
    return {
      title: section.title,
      store: isDatabaseConfigured() ? "connected" : "disconnected",
      records: [
        {
          id: actor.id,
          label: actor.name,
          meta: actor.email,
        },
      ],
    };
  }
  authorize(actor, section.resource as Resource, "read", {
    companyId: actor.companyId,
    sharedWithClient: section.slug === "proposals" ? true : undefined,
  });
  return {
    title: section.title,
    store: isDatabaseConfigured() ? "connected" : "disconnected",
    records: [],
  };
}

export type { AdminModuleSlug, PortalSectionSlug };
