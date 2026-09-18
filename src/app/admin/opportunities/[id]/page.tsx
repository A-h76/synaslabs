import Link from "next/link";
import { OsField, OsHeader } from "@/components/os/ui";
import {
  createDiscoveryAction,
  createProposalAction,
  updateOpportunityStageAction,
} from "@/server/actions/os";
import { OPPORTUNITY_STAGES } from "@/domain/lifecycle";
import { requireTeamActor } from "@/server/dal/access";
import { getOpportunity, listCompanies, listLeads } from "@/server/dal/crm";
import {
  listBriefs,
  listDiscoveries,
  listProposals,
  listProjects,
} from "@/server/dal/commercial";

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await requireTeamActor();
  const { id } = await params;
  const opportunity = await getOpportunity(actor, id);
  const [companies, leads, briefs, discoveries, proposals, projects] = await Promise.all([
    listCompanies(actor),
    listLeads(actor),
    listBriefs(actor),
    listDiscoveries(actor),
    listProposals(actor),
    listProjects(actor),
  ]);
  const company = companies.find((row) => row.id === opportunity.companyId);
  const lead = leads.find((row) => row.id === opportunity.leadId);
  const relatedBriefs = briefs.filter((row) => row.opportunityId === opportunity.id);
  const relatedDiscoveries = discoveries.filter((row) => row.opportunityId === opportunity.id);
  const relatedProposals = proposals.filter((row) => row.opportunityId === opportunity.id);
  const relatedProposalIds = new Set(relatedProposals.map((row) => row.id));
  const relatedProjects = projects.filter(
    (row) => row.proposalId && relatedProposalIds.has(row.proposalId),
  );

  return (
    <article>
      <OsHeader kicker="Opportunity" title={opportunity.name} />
      <p className="mt-4 text-sm">
        {company ? (
          <Link href={`/admin/companies/${company.id}`}>{company.name}</Link>
        ) : null}
        {lead ? (
          <>
            {" · "}
            <Link href={`/admin/leads/${lead.id}`}>Lead</Link>
          </>
        ) : null}
      </p>
      <form action={updateOpportunityStageAction} className="mt-8 max-w-xs">
        <input type="hidden" name="id" value={opportunity.id} />
        <label>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-synas-ink/55">
            Stage
          </span>
          <select name="stage" defaultValue={opportunity.stage} className="site-field mt-2">
            {OPPORTUNITY_STAGES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="site-action mt-4">
          Save stage →
        </button>
      </form>
      <Related title="System briefs" hrefBase="/admin/system-briefs" rows={relatedBriefs} />
      <Related title="Discovery" hrefBase="/admin/discovery" rows={relatedDiscoveries} />
      <Related title="Proposals" hrefBase="/admin/proposals" rows={relatedProposals} />
      <Related title="Projects" hrefBase="/admin/projects" rows={relatedProjects} />
      <form action={createDiscoveryAction} className="mt-12 grid max-w-xl gap-4">
        <h2 className="font-serif text-2xl">Start discovery</h2>
        <input type="hidden" name="opportunityId" value={opportunity.id} />
        <input type="hidden" name="companyId" value={opportunity.companyId} />
        <input type="hidden" name="leadId" value={opportunity.leadId ?? ""} />
        <label>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-synas-ink/55">
            Prefill from system brief (optional)
          </span>
          <select name="systemBriefId" className="site-field mt-2">
            <option value="">None — start blank</option>
            {relatedBriefs.map((row) => (
              <option key={row.id} value={row.id}>
                {row.title}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="site-action self-start">
          Create discovery →
        </button>
      </form>
      <form action={createProposalAction} className="mt-12 grid max-w-xl gap-4">
        <h2 className="font-serif text-2xl">Draft a proposal</h2>
        <input type="hidden" name="opportunityId" value={opportunity.id} />
        <input type="hidden" name="companyId" value={opportunity.companyId} />
        <label>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-synas-ink/55">
            Attach system brief (optional)
          </span>
          <select name="systemBriefId" className="site-field mt-2">
            <option value="">None</option>
            {relatedBriefs.map((row) => (
              <option key={row.id} value={row.id}>
                {row.title}
              </option>
            ))}
          </select>
        </label>
        <OsField name="title" label="Title" required defaultValue={`${opportunity.name} proposal`} />
        <button type="submit" className="site-action self-start">
          Create draft →
        </button>
      </form>
    </article>
  );
}

function Related({
  title,
  hrefBase,
  rows,
}: {
  title: string;
  hrefBase: string;
  rows: Array<{ id: string; title?: string; name?: string }>;
}) {
  return (
    <section className="mt-12">
      <h2 className="font-serif text-2xl">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-synas-ink/55">None yet.</p>
      ) : (
        <ul className="mt-3">
          {rows.map((row) => (
            <li key={row.id} className="border-t border-synas-ink/10 py-2 text-sm">
              <Link href={`${hrefBase}/${row.id}`}>{row.title || row.name || row.id}</Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

