import Link from "next/link";
import { OsHeader, OsMeta } from "@/components/os/ui";
import { requireTeamActor } from "@/server/dal/access";
import { getDocumentRecord } from "@/server/dal/commercial";
import { formatWhen } from "@/lib/format";

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await requireTeamActor();
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
          <dt><OsMeta>Visibility</OsMeta></dt>
          <dd>{document.visibility}</dd>
        </div>
        <div className="grid grid-cols-[8rem_1fr] gap-3 border-t border-synas-ink/12 py-3">
          <dt><OsMeta>Created</OsMeta></dt>
          <dd>{formatWhen(document.createdAt)}</dd>
        </div>
      </dl>
      {document.projectId ? (
        <p className="mt-6 text-sm">
          <Link href={`/admin/projects/${document.projectId}`}>Project</Link>
        </p>
      ) : null}
      <p className="mt-8 text-sm">
        <a href={`/admin/documents/${document.id}/file`} className="site-action inline-block">
          Authorized file route →
        </a>
      </p>
      <p className="mt-4 max-w-xl text-sm text-synas-ink/70">
        Download uses this authenticated route. Storage keys are not exposed in the page.
        If object storage is not connected, the route refuses to proxy an arbitrary URL.
      </p>
    </article>
  );
}
