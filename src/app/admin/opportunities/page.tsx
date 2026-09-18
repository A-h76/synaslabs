import { OsEmpty, OsHeader, OsTable } from "@/components/os/ui";
import { requireTeamActor } from "@/server/dal/access";
import { listCompanies, listOpportunities } from "@/server/dal/crm";
import { isDatabaseConfigured } from "@/lib/env";

export default async function OpportunitiesPage() {
  const actor = await requireTeamActor();
  const [companies, records] = await Promise.all([
    listCompanies(actor),
    listOpportunities(actor),
  ]);
  const names = new Map(companies.map((row) => [row.id, row.name]));
  return (
    <section>
      <OsHeader kicker="Opportunities" title="Qualified commercial motion." />
      {!isDatabaseConfigured() ? (
        <OsEmpty>No data store is connected.</OsEmpty>
      ) : (
        <OsTable
          columns={["Name", "Stage", "Company"]}
          empty="No opportunities yet. Qualifying a lead or promoting a radar signal creates one."
          rows={records.map((row) => ({
            href: `/admin/opportunities/${row.id}`,
            cells: [row.name, row.stage, names.get(row.companyId) || "—"],
          }))}
        />
      )}
    </section>
  );
}
