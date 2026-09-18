import { OsEmpty, OsHeader, OsTable } from "@/components/os/ui";
import { requireClientActor } from "@/server/dal/access";
import { listDocuments } from "@/server/dal/commercial";
import { isDatabaseConfigured } from "@/lib/env";
import { formatWhen } from "@/lib/format";

export default async function PortalDocumentsPage() {
  const actor = await requireClientActor();
  const records = await listDocuments(actor);
  return (
    <section>
      <OsHeader kicker="Documents" title="Files shared with you.">
        Internal documents are not listed and cannot be opened by guessing an address.
      </OsHeader>
      {!isDatabaseConfigured() ? (
        <OsEmpty>The workspace is not connected yet.</OsEmpty>
      ) : (
        <OsTable
          columns={["Title", "Type", "Date"]}
          empty="No documents have been shared with your company yet."
          rows={records.map((row) => ({
            href: `/portal/documents/${row.id}`,
            cells: [row.title, row.type, formatWhen(row.createdAt)],
          }))}
        />
      )}
    </section>
  );
}
