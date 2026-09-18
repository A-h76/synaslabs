import { OsEmpty, OsHeader, OsTable } from "@/components/os/ui";
import { requireTeamActor } from "@/server/dal/access";
import { searchOperatingSystem } from "@/server/dal/search";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const actor = await requireTeamActor();
  const { q = "" } = await searchParams;
  const hits = await searchOperatingSystem(actor, q);
  return (
    <section>
      <OsHeader kicker="Search" title={q.trim() ? `Results for “${q.trim()}”` : "Search the operating system."}>
        Companies, contacts, leads, opportunities, briefs, proposals, projects, documents,
        and tasks. Permissions still apply.
      </OsHeader>
      <form action="/admin/search" method="get" className="mb-10 max-w-xl">
        <label>
          <span className="sr-only">Query</span>
          <input
            name="q"
            defaultValue={q}
            className="site-field"
            placeholder="Name, email, title"
          />
        </label>
      </form>
      {q.trim().length < 2 ? (
        <OsEmpty>Type at least two characters.</OsEmpty>
      ) : (
        <OsTable
          columns={["Record", "Collection", "Meta"]}
          empty="No matches."
          rows={hits.map((row) => ({
            href: row.href,
            cells: [row.label, row.collection, row.meta || "—"],
          }))}
        />
      )}
    </section>
  );
}
