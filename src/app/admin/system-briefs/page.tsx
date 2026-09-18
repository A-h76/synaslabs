import { OsEmpty, OsField, OsHeader, OsSelect, OsTable } from "@/components/os/ui";
import { createBriefAction } from "@/server/actions/os";
import { BRIEF_FIELD_LABELS } from "@/domain/brief-document";
import { requireTeamActor } from "@/server/dal/access";
import { listBriefs } from "@/server/dal/commercial";
import { listOpportunities } from "@/server/dal/crm";
import { isDatabaseConfigured } from "@/lib/env";
import { formatWhen } from "@/lib/format";

export default async function SystemBriefsPage() {
  const actor = await requireTeamActor();
  const [records, opportunities] = await Promise.all([
    listBriefs(actor),
    listOpportunities(actor),
  ]);
  return (
    <section>
      <OsHeader kicker="System briefs" title="The operating object for a process.">
        Created from /brief, from discovery, or internally. Attached to opportunities and
        proposals. Never a second CRM record.
      </OsHeader>
      {!isDatabaseConfigured() ? (
        <OsEmpty>No data store is connected.</OsEmpty>
      ) : (
        <OsTable
          columns={["Title", "Source", "Version", "Updated"]}
          empty="No system briefs yet. Public /brief capture writes here."
          rows={records.map((row) => ({
            href: `/admin/system-briefs/${row.id}`,
            cells: [row.title, row.source, String(row.version), formatWhen(row.updatedAt)],
          }))}
        />
      )}
      <form action={createBriefAction} className="mt-14 grid max-w-xl gap-4">
        <h2 className="font-serif text-2xl">Internal brief</h2>
        <OsField name="title" label="Title" required />
        <OsField name="summary" label="Summary" required textarea />
        <OsSelect
          name="opportunityId"
          label="Opportunity"
          options={[
            { value: "", label: "Unattached" },
            ...opportunities.map((row) => ({ value: row.id, label: row.name })),
          ]}
        />
        {BRIEF_FIELD_LABELS.map((field) => (
          <OsField key={field.key} name={field.key} label={field.label} textarea />
        ))}
        <button type="submit" className="site-action self-start">
          Save brief →
        </button>
      </form>
    </section>
  );
}
