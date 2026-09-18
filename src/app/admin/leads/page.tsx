import { OsEmpty, OsHeader, OsTable } from "@/components/os/ui";
import { createSignalAction, promoteSignalAction } from "@/server/actions/os";
import { requireTeamActor } from "@/server/dal/access";
import { listCompanies, listLeads, listSignals } from "@/server/dal/crm";
import { isDatabaseConfigured } from "@/lib/env";
import { OsField } from "@/components/os/ui";

export default async function LeadsPage() {
  const actor = await requireTeamActor();
  const [records, signals, companies] = await Promise.all([
    listLeads(actor),
    listSignals(actor),
    listCompanies(actor),
  ]);
  const names = new Map(companies.map((row) => [row.id, row.name]));
  return (
    <section>
      <OsHeader kicker="Leads" title="Inbound and Lead Radar, one spine.">
        Website inquiries, manual capture, and promoted radar signals. Not a second CRM.
      </OsHeader>
      {!isDatabaseConfigured() ? (
        <OsEmpty>No data store is connected.</OsEmpty>
      ) : (
        <>
          <OsTable
            columns={["Summary", "Source", "Status", "Company"]}
            empty="No leads yet. Start a project on the public site, or capture a radar signal below."
            rows={records.map((row) => ({
              href: `/admin/leads/${row.id}`,
              cells: [
                row.summary || "Untitled",
                row.source,
                row.status,
                row.companyId ? names.get(row.companyId) || "—" : "—",
              ],
            }))}
          />
          <h2 className="mt-16 font-serif text-2xl">Lead Radar signals</h2>
          <p className="mt-2 max-w-xl text-sm text-synas-ink/70">
            Observed opportunities. Promoting a signal creates or updates company, lead,
            and opportunity in this same operating system.
          </p>
          <ul className="mt-6">
            {signals.length === 0 ? (
              <li className="text-sm text-synas-ink/55">No signals captured.</li>
            ) : null}
            {signals.map((signal) => (
              <li
                key={signal.id}
                className="flex flex-wrap items-baseline justify-between gap-4 border-t border-synas-ink/10 py-3"
              >
                <div>
                  <p className="text-sm">{signal.pain || signal.source}</p>
                  <p className="font-mono text-[11px] text-synas-ink/55">
                    {signal.status} · {signal.source}
                  </p>
                </div>
                {signal.status !== "promoted" ? (
                  <form action={promoteSignalAction}>
                    <input type="hidden" name="id" value={signal.id} />
                    <button type="submit" className="site-action">
                      Promote →
                    </button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      )}
      <form action={createSignalAction} className="mt-14 grid max-w-xl gap-6">
        <h2 className="font-serif text-2xl">Capture a signal</h2>
        <OsField name="source" label="Source" required />
        <OsField name="pain" label="Pain signal" textarea />
        <OsField name="evidence" label="Evidence" textarea />
        <button type="submit" className="site-action self-start">
          Save signal →
        </button>
      </form>
    </section>
  );
}

