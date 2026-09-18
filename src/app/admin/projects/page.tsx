import { OsEmpty, OsField, OsHeader, OsSelect, OsTable } from "@/components/os/ui";
import { createProjectAction } from "@/server/actions/os";
import { requireTeamActor } from "@/server/dal/access";
import { listProjects, listProposals } from "@/server/dal/commercial";
import { listCompanies } from "@/server/dal/crm";
import { isDatabaseConfigured } from "@/lib/env";

export default async function ProjectsPage() {
  const actor = await requireTeamActor();
  const [records, companies, proposals] = await Promise.all([
    listProjects(actor),
    listCompanies(actor),
    listProposals(actor),
  ]);
  const names = new Map(companies.map((row) => [row.id, row.name]));
  return (
    <section>
      <OsHeader kicker="Projects" title="Delivery after the commercial decision." />
      {!isDatabaseConfigured() ? (
        <OsEmpty>No data store is connected.</OsEmpty>
      ) : (
        <OsTable
          columns={["Name", "Status", "Company"]}
          empty="No projects yet. Open one after a proposal is accepted — or earlier if delivery must start."
          rows={records.map((row) => ({
            href: `/admin/projects/${row.id}`,
            cells: [row.name, row.status, names.get(row.companyId) || "—"],
          }))}
        />
      )}
      <form action={createProjectAction} className="mt-14 grid max-w-xl gap-4">
        <h2 className="font-serif text-2xl">Open a project</h2>
        <OsField name="name" label="Name" required />
        <OsSelect
          name="companyId"
          label="Company"
          required
          options={[
            { value: "", label: "Select" },
            ...companies.map((row) => ({ value: row.id, label: row.name })),
          ]}
        />
        <OsSelect
          name="proposalId"
          label="Proposal"
          options={[
            { value: "", label: "None" },
            ...proposals.map((row) => ({ value: row.id, label: row.title })),
          ]}
        />
        <OsField name="overview" label="Overview" textarea />
        <button type="submit" className="site-action self-start">
          Create project →
        </button>
      </form>
    </section>
  );
}
