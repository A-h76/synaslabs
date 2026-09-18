import Link from "next/link";
import { OsHeader, OsMeta } from "@/components/os/ui";
import { completeTaskAction } from "@/server/actions/os";
import { isFollowUpOverdue } from "@/domain/follow-up";
import { requireTeamActor } from "@/server/dal/access";
import { getTask } from "@/server/dal/commercial";
import { formatWhenTime } from "@/lib/format";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await requireTeamActor();
  const { id } = await params;
  const task = await getTask(actor, id);
  const overdue = isFollowUpOverdue(task.dueAt, task.status);
  return (
    <article>
      <OsHeader kicker="Task" title={task.title}>
        {task.description || "No description."}
      </OsHeader>
      <dl className="max-w-xl text-sm">
        <div className="grid grid-cols-[8rem_1fr] gap-3 border-t border-synas-ink/12 py-3">
          <dt><OsMeta>Kind</OsMeta></dt>
          <dd>{task.kind}</dd>
        </div>
        <div className="grid grid-cols-[8rem_1fr] gap-3 border-t border-synas-ink/12 py-3">
          <dt><OsMeta>Status</OsMeta></dt>
          <dd>{overdue ? `${task.status} · overdue` : task.status}</dd>
        </div>
        <div className="grid grid-cols-[8rem_1fr] gap-3 border-t border-synas-ink/12 py-3">
          <dt><OsMeta>Priority</OsMeta></dt>
          <dd>{task.priority}</dd>
        </div>
        <div className="grid grid-cols-[8rem_1fr] gap-3 border-t border-synas-ink/12 py-3">
          <dt><OsMeta>Due</OsMeta></dt>
          <dd>{formatWhenTime(task.dueAt)}</dd>
        </div>
      </dl>
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        {task.leadId ? <Link href={`/admin/leads/${task.leadId}`}>Lead</Link> : null}
        {task.opportunityId ? (
          <Link href={`/admin/opportunities/${task.opportunityId}`}>Opportunity</Link>
        ) : null}
        {task.projectId ? <Link href={`/admin/projects/${task.projectId}`}>Project</Link> : null}
      </div>
      {task.status !== "completed" && task.status !== "cancelled" ? (
        <form action={completeTaskAction} className="mt-8">
          <input type="hidden" name="id" value={task.id} />
          <button type="submit" className="site-action">
            Mark complete →
          </button>
        </form>
      ) : null}
    </article>
  );
}
