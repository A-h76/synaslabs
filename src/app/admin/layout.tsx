import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { OsShell } from "@/components/os-shell";
import { isAuthConfigured } from "@/lib/env";
import { SITE_NAME } from "@/lib/site";
import { getCurrentActor } from "@/server/dal/actor";
import { isTeamRole } from "@/domain/roles";
import { listNotifications } from "@/server/dal/events";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      absolute: isAuthConfigured() ? "Synas OS" : `Page not found — ${SITE_NAME}`,
    },
    robots: { index: false, follow: false },
  };
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isAuthConfigured()) notFound();
  const actor = await getCurrentActor();
  if (!actor) redirect("/login?next=/admin");
  if (!isTeamRole(actor.role)) notFound();
  const notifications = await listNotifications(actor);

  return (
    <OsShell surface="admin" actor={actor} notifications={notifications}>
      {children}
    </OsShell>
  );
}
