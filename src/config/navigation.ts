import type { Resource } from "@/domain/permissions";

export const ADMIN_NAV = [
  { href: "/admin", slug: "dashboard", title: "Attention", resource: "lead" as Resource },
  { href: "/admin/leads", slug: "leads", title: "Leads", resource: "lead" as Resource },
  { href: "/admin/contacts", slug: "contacts", title: "Contacts", resource: "contact" as Resource },
  { href: "/admin/companies", slug: "companies", title: "Companies", resource: "company" as Resource },
  { href: "/admin/opportunities", slug: "opportunities", title: "Opportunities", resource: "opportunity" as Resource },
  { href: "/admin/discovery", slug: "discovery", title: "Discovery", resource: "discovery" as Resource },
  { href: "/admin/system-briefs", slug: "system-briefs", title: "System briefs", resource: "system_brief" as Resource },
  { href: "/admin/proposals", slug: "proposals", title: "Proposals", resource: "proposal" as Resource },
  { href: "/admin/projects", slug: "projects", title: "Projects", resource: "project" as Resource },
  { href: "/admin/documents", slug: "documents", title: "Documents", resource: "document" as Resource },
  { href: "/admin/tasks", slug: "tasks", title: "Tasks", resource: "task" as Resource },
  { href: "/admin/activity", slug: "activity", title: "Activity", resource: "activity" as Resource },
  { href: "/admin/settings", slug: "settings", title: "Settings", resource: "settings" as Resource },
] as const;

export const ADMIN_MODULES = ADMIN_NAV.filter((item) => item.slug !== "dashboard");

export type AdminModuleSlug = (typeof ADMIN_MODULES)[number]["slug"];

export const PORTAL_SECTIONS = [
  { slug: "projects", title: "Projects", resource: "project" as Resource },
  { slug: "proposals", title: "Proposals", resource: "proposal" as Resource },
  { slug: "documents", title: "Documents", resource: "document" as Resource },
  { slug: "tasks", title: "Tasks", resource: "task" as Resource },
  { slug: "updates", title: "Updates", resource: "activity" as Resource },
  { slug: "messages", title: "Messages", resource: "message" as Resource },
  { slug: "support", title: "Support", resource: "message" as Resource },
  { slug: "account", title: "Account", resource: "user" as Resource },
] as const;

export type PortalSectionSlug = (typeof PORTAL_SECTIONS)[number]["slug"];

export function getAdminModule(slug: string) {
  return ADMIN_MODULES.find((module) => module.slug === slug);
}

export function getPortalSection(slug: string) {
  return PORTAL_SECTIONS.find((section) => section.slug === slug);
}

export function resourceForAdminModule(slug: string): Resource | null {
  return getAdminModule(slug)?.resource ?? null;
}
