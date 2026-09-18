import { OsEmpty, OsField, OsHeader, OsTable } from "@/components/os/ui";
import { createContactAction } from "@/server/actions/os";
import { requireTeamActor } from "@/server/dal/access";
import { listCompanies, listContacts } from "@/server/dal/crm";
import { isDatabaseConfigured } from "@/lib/env";

export default async function ContactsPage() {
  const actor = await requireTeamActor();
  const [records, companies] = await Promise.all([
    listContacts(actor),
    listCompanies(actor),
  ]);
  const names = new Map(companies.map((row) => [row.id, row.name]));
  return (
    <section>
      <OsHeader kicker="Contacts" title="People." />
      {!isDatabaseConfigured() ? (
        <OsEmpty>No data store is connected.</OsEmpty>
      ) : (
        <OsTable
          columns={["Name", "Company", "Email"]}
          empty="No contacts yet."
          rows={records.map((row) => ({
            href: `/admin/contacts/${row.id}`,
            cells: [
              row.name,
              row.companyId ? names.get(row.companyId) || "—" : "—",
              row.email || "—",
            ],
          }))}
        />
      )}
      <form action={createContactAction} className="mt-14 grid max-w-xl gap-6">
        <h2 className="font-serif text-2xl">Add a contact</h2>
        <OsField name="name" label="Name" required />
        <label>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-synas-ink/55">
            Company
          </span>
          <select name="companyId" className="site-field mt-2">
            <option value="">None</option>
            {companies.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name}
              </option>
            ))}
          </select>
        </label>
        <OsField name="email" label="Email" type="email" />
        <OsField name="roleTitle" label="Role" />
        <OsField name="phone" label="Phone" />
        <button type="submit" className="site-action self-start">
          Save contact →
        </button>
      </form>
    </section>
  );
}
