import Link from "next/link";
import { OsHeader, OsMeta } from "@/components/os/ui";
import { addNoteAction, updateLeadStatusAction } from "@/server/actions/os";
import { LEAD_STATUSES } from "@/domain/lifecycle";
import { requireTeamActor } from "@/server/dal/access";
import { getLead, listCompanies, listContacts } from "@/server/dal/crm";
import { getBrief } from "@/server/dal/commercial";
import { OsField } from "@/components/os/ui";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await requireTeamActor();
  const { id } = await params;
  const lead = await getLead(actor, id);
  const [companies, contacts] = await Promise.all([
    listCompanies(actor),
    listContacts(actor),
  ]);
  const company = companies.find((row) => row.id === lead.companyId);
  const contact = contacts.find((row) => row.id === lead.contactId);
  const brief = lead.systemBriefId ? await getBrief(actor, lead.systemBriefId) : null;

  return (
    <article>
      <OsHeader kicker="Lead" title={lead.summary || "Untitled lead"}>
        Source {lead.source}. One record in the commercial spine — not a radar side-system.
      </OsHeader>
      <dl className="max-w-xl text-sm">
        <div className="grid grid-cols-[8rem_1fr] gap-3 border-t border-synas-ink/12 py-3">
          <dt><OsMeta>Company</OsMeta></dt>
          <dd>
            {company ? (
              <Link href={`/admin/companies/${company.id}`}>{company.name}</Link>
            ) : (
              "—"
            )}
          </dd>
        </div>
        <div className="grid grid-cols-[8rem_1fr] gap-3 border-t border-synas-ink/12 py-3">
          <dt><OsMeta>Contact</OsMeta></dt>
          <dd>
            {contact ? (
              <Link href={`/admin/contacts/${contact.id}`}>{contact.name}</Link>
            ) : (
              "—"
            )}
          </dd>
        </div>
        <div className="grid grid-cols-[8rem_1fr] gap-3 border-t border-synas-ink/12 py-3">
          <dt><OsMeta>Opportunity</OsMeta></dt>
          <dd>
            {lead.opportunityId ? (
              <Link href={`/admin/opportunities/${lead.opportunityId}`}>Open</Link>
            ) : (
              "—"
            )}
          </dd>
        </div>
        <div className="grid grid-cols-[8rem_1fr] gap-3 border-t border-synas-ink/12 py-3">
          <dt><OsMeta>Brief</OsMeta></dt>
          <dd>
            {brief ? (
              <Link href={`/admin/system-briefs/${brief.id}`}>{brief.title}</Link>
            ) : (
              "None attached"
            )}
          </dd>
        </div>
      </dl>
      <form action={updateLeadStatusAction} className="mt-8 max-w-xs">
        <input type="hidden" name="id" value={lead.id} />
        <label>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-synas-ink/55">
            Status
          </span>
          <select name="status" defaultValue={lead.status} className="site-field mt-2">
            {LEAD_STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="site-action mt-4">
          Save status →
        </button>
      </form>
      <form action={addNoteAction} className="mt-12 max-w-xl">
        <input type="hidden" name="leadId" value={lead.id} />
        <input type="hidden" name="companyId" value={lead.companyId ?? ""} />
        <input type="hidden" name="opportunityId" value={lead.opportunityId ?? ""} />
        <OsField name="body" label="Note" textarea required />
        <button type="submit" className="site-action mt-4">
          Add note →
        </button>
      </form>
    </article>
  );
}
