import { OsEmpty, OsField, OsHeader, OsSelect, OsTable } from "@/components/os/ui";
import { createDocumentAction } from "@/server/actions/os";
import { DOCUMENT_TYPES, DOCUMENT_VISIBILITIES } from "@/domain/lifecycle";
import { requireTeamActor } from "@/server/dal/access";
import { listDocuments, listProjects } from "@/server/dal/commercial";
import { listCompanies } from "@/server/dal/crm";
import { isDatabaseConfigured } from "@/lib/env";
import { formatWhen } from "@/lib/format";

export default async function DocumentsPage() {
  const actor = await requireTeamActor();
  const [records, companies, projects] = await Promise.all([
    listDocuments(actor),
    listCompanies(actor),
    listProjects(actor),
  ]);
  return (
    <section>
      <OsHeader kicker="Documents" title="NDAs, proposals, SOWs, and the rest.">
        Visibility is enforced on the server. Clients never receive storage keys or
        guessed file URLs.
      </OsHeader>
      {!isDatabaseConfigured() ? (
        <OsEmpty>No data store is connected.</OsEmpty>
      ) : (
        <OsTable
          columns={["Title", "Type", "Visibility", "Created"]}
          empty="No documents recorded."
          rows={records.map((row) => ({
            href: `/admin/documents/${row.id}`,
            cells: [row.title, row.type, row.visibility, formatWhen(row.createdAt)],
          }))}
        />
      )}
      <form action={createDocumentAction} className="mt-14 grid max-w-xl gap-4">
        <h2 className="font-serif text-2xl">Record a document</h2>
        <OsField name="title" label="Title" required />
        <OsSelect
          name="type"
          label="Type"
          required
          options={DOCUMENT_TYPES.map((item) => ({ value: item, label: item }))}
        />
        <OsSelect
          name="visibility"
          label="Visibility"
          required
          options={DOCUMENT_VISIBILITIES.map((item) => ({ value: item, label: item }))}
        />
        <OsSelect
          name="companyId"
          label="Company"
          options={[
            { value: "", label: "None" },
            ...companies.map((row) => ({ value: row.id, label: row.name })),
          ]}
        />
        <OsSelect
          name="projectId"
          label="Project"
          options={[
            { value: "", label: "None" },
            ...projects.map((row) => ({ value: row.id, label: row.name })),
          ]}
        />
        <OsField
          name="uri"
          label="Storage key (internal; never shown to clients)"
          required
        />
        <button type="submit" className="site-action self-start">
          Save document →
        </button>
      </form>
    </section>
  );
}
