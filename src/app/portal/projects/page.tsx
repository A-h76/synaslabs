import { OsEmpty, OsHeader, OsTable } from "@/components/os/ui";
import { requireClientActor } from "@/server/dal/access";
import { listProjects } from "@/server/dal/commercial";
import { isDatabaseConfigured } from "@/lib/env";

export default async function PortalProjectsPage() {
  const actor = await requireClientActor();
  const records = await listProjects(actor);
  return (
    <section>
      <OsHeader kicker="Projects" title="Work in delivery." />
      {!isDatabaseConfigured() ? (
        <OsEmpty>The workspace is not connected yet.</OsEmpty>
      ) : (
        <OsTable
          columns={["Project", "Status"]}
          empty="No projects are open for your company yet. When delivery starts, they appear here."
          rows={records.map((row) => ({
            href: `/portal/projects/${row.id}`,
            cells: [row.name, row.status],
          }))}
        />
      )}
    </section>
  );
}
