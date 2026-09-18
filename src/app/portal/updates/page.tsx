import { OsEmpty, OsHeader } from "@/components/os/ui";
import { requireClientActor } from "@/server/dal/access";
import { listProjectUpdates, listProjects } from "@/server/dal/commercial";
import { isDatabaseConfigured } from "@/lib/env";
import { formatWhen } from "@/lib/format";

export default async function PortalUpdatesPage() {
  const actor = await requireClientActor();
  const [projects, updates] = await Promise.all([
    listProjects(actor),
    listProjectUpdates(actor),
  ]);
  const names = new Map(projects.map((row) => [row.id, row.name]));
  return (
    <section>
      <OsHeader kicker="Updates" title="What changed on delivery." />
      {!isDatabaseConfigured() ? (
        <OsEmpty>The workspace is not connected yet.</OsEmpty>
      ) : updates.length === 0 ? (
        <OsEmpty>No client updates have been posted yet.</OsEmpty>
      ) : (
        <ul>
          {updates.map((row) => (
            <li key={row.id} className="border-t border-synas-ink/10 py-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-synas-ink/55">
                {names.get(row.projectId) || "Project"} · {formatWhen(row.createdAt)}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm">{row.body}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
