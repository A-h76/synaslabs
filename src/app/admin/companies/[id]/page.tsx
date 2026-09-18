import { notFound } from "next/navigation";
import { OsHeader, OsMeta } from "@/components/os/ui";
import { requireTeamActor } from "@/server/dal/access";
import { getCompany, listContacts, listLeads, listOpportunities } from "@/server/dal/crm";
import { formatWhen } from "@/lib/format";
import Link from "next/link";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await requireTeamActor();
  const { id } = await params;
  const company = await getCompany(actor, id);
  const [contacts, leads, opportunities] = await Promise.all([
    listContacts(actor),
    listLeads(actor),
    listOpportunities(actor),
  ]);
  const people = contacts.filter((row) => row.companyId === company.id);
  const companyLeads = leads.filter((row) => row.companyId === company.id);
  const companyOpps = opportunities.filter((row) => row.companyId === company.id);
  if (!company) notFound();

  return (
    <article>
      <OsHeader kicker="Company" title={company.name}>
        {company.website || "No website recorded."}
      </OsHeader>
      <dl className="max-w-xl">
        <div className="grid grid-cols-[8rem_1fr] gap-3 border-t border-synas-ink/12 py-3 text-sm">
          <dt><OsMeta>City</OsMeta></dt>
          <dd>{company.city || "—"}</dd>
        </div>
        <div className="grid grid-cols-[8rem_1fr] gap-3 border-t border-synas-ink/12 py-3 text-sm">
          <dt><OsMeta>Updated</OsMeta></dt>
          <dd>{formatWhen(company.updatedAt)}</dd>
        </div>
      </dl>
      <h2 className="mt-12 font-serif text-2xl">Contacts</h2>
      <ul className="mt-4">
        {people.length === 0 ? <li className="text-sm text-synas-ink/55">None.</li> : null}
        {people.map((person) => (
          <li key={person.id} className="border-t border-synas-ink/10 py-3 text-sm">
            <Link href={`/admin/contacts/${person.id}`}>{person.name}</Link>
            <span className="ml-3 font-mono text-[11px] text-synas-ink/55">
              {person.email}
            </span>
          </li>
        ))}
      </ul>
      <h2 className="mt-12 font-serif text-2xl">Leads and opportunities</h2>
      <ul className="mt-4">
        {companyLeads.map((lead) => (
          <li key={lead.id} className="border-t border-synas-ink/10 py-3 text-sm">
            <Link href={`/admin/leads/${lead.id}`}>{lead.status}</Link>
            <span className="ml-3 text-synas-ink/60">{lead.summary}</span>
          </li>
        ))}
        {companyOpps.map((row) => (
          <li key={row.id} className="border-t border-synas-ink/10 py-3 text-sm">
            <Link href={`/admin/opportunities/${row.id}`}>{row.name}</Link>
            <span className="ml-3 font-mono text-[11px]">{row.stage}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
