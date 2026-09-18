import { OsHeader } from "@/components/os/ui";
import { respondToProposalAction } from "@/server/actions/os";
import { requireClientActor } from "@/server/dal/access";
import { getProposal } from "@/server/dal/commercial";

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

export default async function PortalProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await requireClientActor();
  const { id } = await params;
  const proposal = await getProposal(actor, id);
  const canRespond = proposal.status === "sent" || proposal.status === "viewed";
  return (
    <article>
      <OsHeader kicker="Proposal" title={proposal.title}>
        Version {proposal.version}. Internal notes are not included.
      </OsHeader>
      <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-synas-ink/55">
        {proposal.status}
      </p>
      <div className="mt-10 grid max-w-2xl gap-8">
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
      </div>
      {canRespond ? (
        <div className="mt-12 flex flex-wrap gap-4">
          <form action={respondToProposalAction}>
            <input type="hidden" name="id" value={proposal.id} />
            <input type="hidden" name="status" value="accepted" />
            <button type="submit" className="site-action">
              Accept →
            </button>
          </form>
          <form action={respondToProposalAction}>
            <input type="hidden" name="id" value={proposal.id} />
            <input type="hidden" name="status" value="rejected" />
            <button type="submit" className="site-action site-action-quiet">
              Decline
            </button>
          </form>
        </div>
      ) : null}
    </article>
  );
}
