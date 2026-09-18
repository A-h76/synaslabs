import { OsHeader, OsMeta } from "@/components/os/ui";
import { requireClientActor } from "@/server/dal/access";
import { getDocumentRecord } from "@/server/dal/commercial";
import { formatWhen } from "@/lib/format";

export default async function PortalDocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await requireClientActor();
  const { id } = await params;
  const document = await getDocumentRecord(actor, id);
  return (
    <article>
      <OsHeader kicker="Document" title={document.title} />
      <dl className="max-w-xl text-sm">
        <div className="grid grid-cols-[8rem_1fr] gap-3 border-t border-synas-ink/12 py-3">
          <dt><OsMeta>Type</OsMeta></dt>
          <dd>{document.type}</dd>
        </div>
        <div className="grid grid-cols-[8rem_1fr] gap-3 border-t border-synas-ink/12 py-3">
          <dt><OsMeta>Date</OsMeta></dt>
          <dd>{formatWhen(document.createdAt)}</dd>
        </div>
      </dl>
      <p className="mt-8">
        <a href={`/portal/documents/${document.id}/file`} className="site-action inline-block">
          Download →
        </a>
      </p>
    </article>
  );
}
