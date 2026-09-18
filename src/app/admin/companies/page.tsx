import { OsEmpty, OsField, OsHeader, OsTable } from "@/components/os/ui";
import { createCompanyAction } from "@/server/actions/os";
import { requireTeamActor } from "@/server/dal/access";
import { listCompanies } from "@/server/dal/crm";
import { isDatabaseConfigured } from "@/lib/env";

export default async function CompaniesPage() {
  const actor = await requireTeamActor();
  const records = await listCompanies(actor);
  return (
    <section>
      <OsHeader kicker="Companies" title="Businesses Synas is in contact with." />
      {!isDatabaseConfigured() ? (
        <OsEmpty>No data store is connected.</OsEmpty>
      ) : (
        <OsTable
          columns={["Name", "Website", "City"]}
          empty="No companies yet. Inbound inquiries and Lead Radar both write here."
          rows={records.map((row) => ({
            href: `/admin/companies/${row.id}`,
            cells: [row.name, row.website || "—", row.city || "—"],
          }))}
        />
      )}
      <form action={createCompanyAction} className="mt-14 grid max-w-xl gap-6">
        <h2 className="font-serif text-2xl">Add a company</h2>
        <OsField name="name" label="Name" required />
        <OsField name="website" label="Website" />
        <OsField name="city" label="City" />
        <OsField name="linkedinUrl" label="LinkedIn" />
        <OsField name="notes" label="Notes" textarea />
        <button type="submit" className="site-action self-start">
          Save company →
        </button>
      </form>
    </section>
  );
}
