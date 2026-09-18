import { OsField, OsHeader } from "@/components/os/ui";
import { sendMessageAction } from "@/server/actions/os";
import { requireClientActor } from "@/server/dal/access";
import {
  getProject,
  listDocuments,
  listMessages,
  listMilestones,
  listProjectUpdates,
  listTasks,
} from "@/server/dal/commercial";
import { formatWhen } from "@/lib/format";

export default async function PortalProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await requireClientActor();
  const { id } = await params;
  const project = await getProject(actor, id);
  const [milestones, tasks, documents, updates, messages] = await Promise.all([
    listMilestones(actor, project.id),
    listTasks(actor),
    listDocuments(actor),
    listProjectUpdates(actor, project.id),
    listMessages(actor, project.id),
  ]);
  const visibleTasks = tasks.filter((row) => row.projectId === project.id);
  const visibleDocs = documents.filter((row) => row.projectId === project.id);

  return (
    <article>
      <OsHeader kicker="Project" title={project.name}>
        {project.overview || "Your Synas team will add an overview as delivery starts."}
      </OsHeader>
      <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-synas-ink/55">
        {project.status}
      </p>
      <section className="mt-10">
        <h2 className="font-serif text-2xl">Milestones</h2>
        <ul className="mt-4">
          {milestones.length === 0 ? (
            <li className="text-sm text-synas-ink/55">None shared yet.</li>
          ) : null}
          {milestones.map((row) => (
            <li key={row.id} className="border-t border-synas-ink/10 py-3 text-sm">
              {row.title}
              <span className="ml-3 font-mono text-[11px] text-synas-ink/55">
                {formatWhen(row.dueAt)}
              </span>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-10">
        <h2 className="font-serif text-2xl">Tasks</h2>
        <ul className="mt-4">
          {visibleTasks.length === 0 ? (
            <li className="text-sm text-synas-ink/55">No client-visible tasks.</li>
          ) : null}
          {visibleTasks.map((row) => (
            <li key={row.id} className="border-t border-synas-ink/10 py-3 text-sm">
              {row.title}
              <span className="ml-3 font-mono text-[11px] text-synas-ink/55">{row.status}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-10">
        <h2 className="font-serif text-2xl">Documents</h2>
        <ul className="mt-4">
          {visibleDocs.length === 0 ? (
            <li className="text-sm text-synas-ink/55">No files shared on this project.</li>
          ) : null}
          {visibleDocs.map((row) => (
            <li key={row.id} className="border-t border-synas-ink/10 py-3 text-sm">
              <a href={`/portal/documents/${row.id}`}>{row.title}</a>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-10">
        <h2 className="font-serif text-2xl">Updates</h2>
        <ul className="mt-4">
          {updates.length === 0 ? (
            <li className="text-sm text-synas-ink/55">No updates yet.</li>
          ) : null}
          {updates.map((row) => (
            <li key={row.id} className="border-t border-synas-ink/10 py-3 text-sm whitespace-pre-wrap">
              {row.body}
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-10">
        <h2 className="font-serif text-2xl">Messages</h2>
        <ul className="mt-4">
          {messages.length === 0 ? (
            <li className="text-sm text-synas-ink/55">Start the thread when you have a question.</li>
          ) : null}
          {messages.map((row) => (
            <li key={row.id} className="border-t border-synas-ink/10 py-3 text-sm whitespace-pre-wrap">
              {row.body}
            </li>
          ))}
        </ul>
        <form action={sendMessageAction} className="mt-6 grid max-w-xl gap-4">
          <input type="hidden" name="projectId" value={project.id} />
          <OsField name="body" label="Message" textarea required />
          <button type="submit" className="site-action self-start">
            Send →
          </button>
        </form>
      </section>
    </article>
  );
}
