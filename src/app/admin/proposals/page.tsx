import { OsEmpty, OsHeader, OsTable } from "@/components/os/ui";
import { requireTeamActor } from "@/server/dal/access";
import { listProposals } from "@/server/dal/commercial";
import { listCompanies } from "@/server/dal/crm";
import { isDatabaseConfigured } from "@/lib/env";
import { formatWhen } from "@/lib/format";

export default async function ProposalsPage() {
  const actor = await requireTeamActor();
  const [records, companies] = await Promise.all([
    listProposals(actor),
    listCompanies(actor),
  ]);
  const names = new Map(companies.map((row) => [row.id, row.name]));
  return (
    <section>
      <OsHeader kicker="Proposals" title="Commercial documents, versioned.">
        Draft from an opportunity. Internal notes never leave this surface.
      </OsHeader>
      {!isDatabaseConfigured() ? (
        <OsEmpty>No data store is connected.</OsEmpty>
      ) : (
        <OsTable
          columns={["Title", "Status", "Version", "Company", "Updated"]}
          empty="No proposals yet. Open an opportunity and draft one."
          rows={records.map((row) => ({
            href: `/admin/proposals/${row.id}`,
            cells: [
              row.title,
              row.status,
              String(row.version),
              names.get(row.companyId) || "—",
              formatWhen(row.updatedAt),
            ],
          }))}
        />
      )}
    </section>
  );
}
