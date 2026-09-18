import { OsEmpty, OsHeader, OsTable } from "@/components/os/ui";
import { completePortalTaskAction } from "@/server/actions/os";
import { requireClientActor } from "@/server/dal/access";
import { listTasks } from "@/server/dal/commercial";
import { isDatabaseConfigured } from "@/lib/env";
import { formatWhen } from "@/lib/format";

export default async function PortalTasksPage() {
  const actor = await requireClientActor();
  const records = await listTasks(actor);
  return (
    <section>
      <OsHeader kicker="Tasks" title="Work visible to you." />
      {!isDatabaseConfigured() ? (
        <OsEmpty>The workspace is not connected yet.</OsEmpty>
      ) : records.length === 0 ? (
        <OsEmpty>No client-visible tasks yet. Internal follow-ups stay with the Synas team.</OsEmpty>
      ) : (
        <>
          <OsTable
            columns={["Task", "Status", "Due"]}
            empty="No client-visible tasks yet."
            rows={records.map((row) => ({
              cells: [row.title, row.status, formatWhen(row.dueAt)],
            }))}
          />
          <ul className="mt-10">
            {records
              .filter((row) => row.status !== "completed")
              .map((row) => (
                <li key={row.id} className="border-t border-synas-ink/10 py-3">
                  <form action={completePortalTaskAction} className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-sm">{row.title}</span>
                    <input type="hidden" name="id" value={row.id} />
                    <button type="submit" className="site-action">
                      Complete →
                    </button>
                  </form>
                </li>
              ))}
          </ul>
        </>
      )}
    </section>
  );
}
