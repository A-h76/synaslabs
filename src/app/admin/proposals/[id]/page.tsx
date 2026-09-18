import Link from "next/link";
import { OsField, OsHeader, OsMeta } from "@/components/os/ui";
import { saveProposalAction, transitionProposalAction } from "@/server/actions/os";
import { canTransitionProposal, PROPOSAL_STATUSES } from "@/domain/lifecycle";
import { requireTeamActor } from "@/server/dal/access";
import {
  getProposal,
  listBriefs,
  listProposalVersions,
} from "@/server/dal/commercial";
import { formatWhen } from "@/lib/format";

const FIELDS = [
  ["summary", "Summary"],
  ["understanding", "Understanding"],
  ["solution", "Solution"],
  ["scope", "Scope"],
  ["outOfScope", "Out of scope"],
  ["deliverables", "Deliverables"],
  ["timeline", "Timeline"],
  ["technology", "Technology"],
  ["investment", "Investment"],
  ["assumptions", "Assumptions"],
  ["responsibilities", "Responsibilities"],
  ["support", "Support"],
  ["terms", "Terms"],
  ["nextSteps", "Next steps"],
] as const;

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await requireTeamActor();
  const { id } = await params;
  const proposal = await getProposal(actor, id);
  const [versions, briefs] = await Promise.all([
    listProposalVersions(actor, proposal.id),
    listBriefs(actor),
  ]);
  const next = PROPOSAL_STATUSES.filter((status) =>
    canTransitionProposal(proposal.status, status),
  );
  const editable = proposal.status === "draft" || proposal.status === "internal_review";

  return (
    <article>
      <OsHeader kicker="Proposal" title={proposal.title}>
        Version {proposal.version}. Status {proposal.status}.
      </OsHeader>
      <p className="text-sm">
        <Link href={`/admin/opportunities/${proposal.opportunityId}`}>Opportunity</Link>
        {proposal.systemBriefId ? (
          <>
            {" · "}
            <Link href={`/admin/system-briefs/${proposal.systemBriefId}`}>System brief</Link>
          </>
        ) : null}
      </p>
      <dl className="mt-6 max-w-xl text-sm">
        <div className="grid grid-cols-[8rem_1fr] gap-3 border-t border-synas-ink/12 py-3">
          <dt><OsMeta>Shared</OsMeta></dt>
          <dd>{proposal.sharedWithClient ? "With client" : "Internal only"}</dd>
        </div>
        <div className="grid grid-cols-[8rem_1fr] gap-3 border-t border-synas-ink/12 py-3">
          <dt><OsMeta>Sent</OsMeta></dt>
          <dd>{formatWhen(proposal.sentAt)}</dd>
        </div>
      </dl>
      {next.length > 0 ? (
        <form action={transitionProposalAction} className="mt-8 flex flex-wrap items-end gap-4">
          <input type="hidden" name="id" value={proposal.id} />
          <label>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-synas-ink/55">
              Move to
            </span>
            <select name="status" className="site-field mt-2">
              {next.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="site-action">
            Update status →
          </button>
        </form>
      ) : null}
      {editable ? (
        <form action={saveProposalAction} className="mt-12 grid max-w-2xl gap-5">
          <input type="hidden" name="id" value={proposal.id} />
          <OsField name="title" label="Title" defaultValue={proposal.title} required />
          <label>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-synas-ink/55">
              System brief
            </span>
            <select
              name="systemBriefId"
              className="site-field mt-2"
              defaultValue={proposal.systemBriefId ?? ""}
            >
              <option value="">None</option>
              {briefs
                .filter((row) => row.opportunityId === proposal.opportunityId)
                .map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.title}
                  </option>
                ))}
            </select>
          </label>
          {FIELDS.map(([name, label]) => (
            <OsField
              key={name}
              name={name}
              label={label}
              textarea
              defaultValue={proposal[name] ?? ""}
            />
          ))}
          <OsField
            name="internalNotes"
            label="Internal notes (never shown to the client)"
            textarea
            defaultValue={proposal.internalNotes ?? ""}
          />
          <button type="submit" className="site-action self-start">
            Save version →
          </button>
        </form>
      ) : (
        <div className="mt-12 grid max-w-2xl gap-8">
          {FIELDS.map(([name, label]) =>
            proposal[name] ? (
              <section key={name}>
                <h2 className="font-mono text-[10px] uppercase tracking-[0.16em] text-synas-ink/55">
                  {label}
                </h2>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                  {proposal[name]}
                </p>
              </section>
            ) : null,
          )}
          {proposal.internalNotes ? (
            <section>
              <h2 className="font-mono text-[10px] uppercase tracking-[0.16em] text-synas-ink/55">
                Internal notes
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                {proposal.internalNotes}
              </p>
            </section>
          ) : null}
        </div>
      )}
      <section className="mt-14">
        <h2 className="font-serif text-2xl">Versions</h2>
        {versions.length === 0 ? (
          <p className="mt-3 text-sm text-synas-ink/55">No stored versions.</p>
        ) : (
          <ul className="mt-3">
            {versions.map((row) => (
              <li key={row.id} className="border-t border-synas-ink/10 py-2 font-mono text-[11px]">
                v{row.version} · {row.status}
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}
