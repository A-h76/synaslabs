import Link from "next/link";
import { OsField, OsHeader } from "@/components/os/ui";
import { updateDiscoveryAction } from "@/server/actions/os";
import { requireTeamActor } from "@/server/dal/access";
import { getDiscovery, listBriefs } from "@/server/dal/commercial";
import { getOpportunity } from "@/server/dal/crm";

const FIELDS = [
  ["businessContext", "Business context"],
  ["currentWorkflow", "Current workflow"],
  ["currentTools", "Current tools"],
  ["manualWork", "Manual work"],
  ["customerExperience", "Customer experience"],
  ["dataNotes", "Data"],
  ["usersNotes", "Users"],
  ["integrations", "Integrations"],
  ["goals", "Goals"],
  ["timeline", "Timeline"],
  ["budget", "Budget"],
  ["automationOpportunities", "Automation opportunities"],
  ["risks", "Risks"],
  ["openQuestions", "Open questions"],
  ["notes", "Notes"],
] as const;

export default async function DiscoveryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await requireTeamActor();
  const { id } = await params;
  const discovery = await getDiscovery(actor, id);
  const [opportunity, briefs] = await Promise.all([
    getOpportunity(actor, discovery.opportunityId),
    listBriefs(actor),
  ]);
  return (
    <article>
      <OsHeader kicker="Discovery" title={opportunity.name}>
        {discovery.systemBriefId ? (
          <>
            Prefill from{" "}
            <Link href={`/admin/system-briefs/${discovery.systemBriefId}`}>system brief</Link>
            . Fields remain editable without it.
          </>
        ) : (
          "Started without a system brief."
        )}
      </OsHeader>
      <p className="mb-8 text-sm">
        <Link href={`/admin/opportunities/${opportunity.id}`}>Opportunity</Link>
      </p>
      <form action={updateDiscoveryAction} className="grid max-w-2xl gap-5">
        <input type="hidden" name="id" value={discovery.id} />
        <label>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-synas-ink/55">
            Attach system brief
          </span>
          <select
            name="systemBriefId"
            className="site-field mt-2"
            defaultValue={discovery.systemBriefId ?? ""}
          >
            <option value="">None</option>
            {briefs
              .filter((row) => row.opportunityId === discovery.opportunityId || row.id === discovery.systemBriefId)
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
            defaultValue={discovery[name] ?? ""}
          />
        ))}
        <button type="submit" className="site-action self-start">
          Save discovery →
        </button>
      </form>
    </article>
  );
}
