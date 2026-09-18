import Link from "next/link";
import { OsHeader, OsMeta } from "@/components/os/ui";
import { asBriefDocument, BRIEF_FIELD_LABELS } from "@/domain/brief-document";
import { requireTeamActor } from "@/server/dal/access";
import { getBrief } from "@/server/dal/commercial";
import { formatWhen } from "@/lib/format";

export default async function SystemBriefDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await requireTeamActor();
  const { id } = await params;
  const brief = await getBrief(actor, id);
  const document = asBriefDocument(brief.document);
  return (
    <article>
      <OsHeader kicker="System brief" title={brief.title}>
        {brief.summary}
      </OsHeader>
      <dl className="max-w-2xl text-sm">
        <div className="grid grid-cols-[9rem_1fr] gap-3 border-t border-synas-ink/12 py-3">
          <dt><OsMeta>Source</OsMeta></dt>
          <dd>{brief.source}</dd>
        </div>
        <div className="grid grid-cols-[9rem_1fr] gap-3 border-t border-synas-ink/12 py-3">
          <dt><OsMeta>Version</OsMeta></dt>
          <dd>{brief.version}</dd>
        </div>
        <div className="grid grid-cols-[9rem_1fr] gap-3 border-t border-synas-ink/12 py-3">
          <dt><OsMeta>Updated</OsMeta></dt>
          <dd>{formatWhen(brief.updatedAt)}</dd>
        </div>
        {brief.opportunityId ? (
          <div className="grid grid-cols-[9rem_1fr] gap-3 border-t border-synas-ink/12 py-3">
            <dt><OsMeta>Opportunity</OsMeta></dt>
            <dd>
              <Link href={`/admin/opportunities/${brief.opportunityId}`}>Open</Link>
            </dd>
          </div>
        ) : null}
      </dl>
      <div className="mt-10 grid max-w-2xl gap-8">
        {BRIEF_FIELD_LABELS.map((field) =>
          document[field.key] ? (
            <section key={field.key}>
              <h2 className="font-mono text-[10px] uppercase tracking-[0.16em] text-synas-ink/55">
                {field.label}
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                {document[field.key]}
              </p>
            </section>
          ) : null,
        )}
      </div>
    </article>
  );
}
