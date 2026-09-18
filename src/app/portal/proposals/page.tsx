import { OsEmpty, OsHeader, OsTable } from "@/components/os/ui";
import { requireClientActor } from "@/server/dal/access";
import { listProposals } from "@/server/dal/commercial";
import { isDatabaseConfigured } from "@/lib/env";

export default async function PortalProposalsPage() {
  const actor = await requireClientActor();
  const records = await listProposals(actor);
  return (
    <section>
      <OsHeader kicker="Proposals" title="Shared commercial documents." />
      {!isDatabaseConfigured() ? (
        <OsEmpty>The workspace is not connected yet.</OsEmpty>
      ) : (
        <OsTable
          columns={["Proposal", "Status"]}
          empty="No proposal has been shared with you yet."
          rows={records.map((row) => ({
            href: `/portal/proposals/${row.id}`,
            cells: [row.title, row.status],
          }))}
        />
      )}
    </section>
  );
}
