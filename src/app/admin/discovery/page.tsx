import { OsEmpty, OsHeader, OsSelect, OsTable } from "@/components/os/ui";
import { createDiscoveryAction } from "@/server/actions/os";
import { requireTeamActor } from "@/server/dal/access";
import { listBriefs, listDiscoveries } from "@/server/dal/commercial";
import { listOpportunities } from "@/server/dal/crm";
import { isDatabaseConfigured } from "@/lib/env";
import { formatWhen } from "@/lib/format";

export default async function DiscoveryListPage() {
  const actor = await requireTeamActor();
  const [records, opportunities, briefs] = await Promise.all([
    listDiscoveries(actor),
    listOpportunities(actor),
    listBriefs(actor),
  ]);
  const names = new Map(opportunities.map((row) => [row.id, row.name]));
  return (
    <section>
      <OsHeader kicker="Discovery" title="What is actually happening.">
        Independent of a System Brief. A brief can prefill fields when one exists.
      </OsHeader>
      {!isDatabaseConfigured() ? (
        <OsEmpty>No data store is connected.</OsEmpty>
      ) : (
        <OsTable
          columns={["Opened", "Opportunity", "Brief"]}
          empty="No discovery records yet."
          rows={records.map((row) => ({
            href: `/admin/discovery/${row.id}`,
            cells: [
              formatWhen(row.createdAt),
              names.get(row.opportunityId) || row.opportunityId,
              row.systemBriefId ? "Prefill attached" : "Blank",
            ],
          }))}
        />
      )}
      <form action={createDiscoveryAction} className="mt-14 grid max-w-xl gap-4">
        <h2 className="font-serif text-2xl">Open discovery</h2>
        <OsSelect
          name="opportunityId"
          label="Opportunity"
          required
          options={[
            { value: "", label: "Select" },
            ...opportunities.map((row) => ({ value: row.id, label: row.name })),
          ]}
        />
        <OsSelect
          name="systemBriefId"
          label="Prefill from system brief (optional)"
          options={[
            { value: "", label: "None — start blank" },
            ...briefs.map((row) => ({ value: row.id, label: row.title })),
          ]}
        />
        <button type="submit" className="site-action self-start">
          Create discovery →
        </button>
      </form>
    </section>
  );
}
