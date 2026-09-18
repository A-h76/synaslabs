import Link from "next/link";
import { OsField, OsHeader, OsSelect } from "@/components/os/ui";
import {
  addProjectUpdateAction,
  createMilestoneAction,
  createTaskAction,
  sendMessageAction,
  updateProjectStatusAction,
} from "@/server/actions/os";
import { canTransitionProject, PROJECT_STATUSES, TASK_PRIORITIES } from "@/domain/lifecycle";
import { requireTeamActor } from "@/server/dal/access";
import {
  getProject,
  listDocuments,
  listMessages,
  listMilestones,
  listProjectUpdates,
  listTasks,
} from "@/server/dal/commercial";
import { listActivity } from "@/server/dal/activity";
import { formatWhen } from "@/lib/format";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await requireTeamActor();
  const { id } = await params;
  const project = await getProject(actor, id);
  const [milestones, tasks, documents, updates, activity, messages] = await Promise.all([
    listMilestones(actor, project.id),
    listTasks(actor),
    listDocuments(actor),
    listProjectUpdates(actor, project.id),
    listActivity(actor),
    listMessages(actor, project.id),
  ]);
  const projectTasks = tasks.filter((row) => row.projectId === project.id);
  const projectDocs = documents.filter((row) => row.projectId === project.id);
  const projectActivity = activity.filter((row) => row.projectId === project.id);
  const next = PROJECT_STATUSES.filter((status) =>
    canTransitionProject(project.status, status),
  );

  return (
    <article>
      <OsHeader kicker="Project" title={project.name}>
        {project.overview || "No overview yet."}
      </OsHeader>
      <p className="text-sm">
        <Link href={`/admin/companies/${project.companyId}`}>Company</Link>
        {project.proposalId ? (
          <>
            {" · "}
            <Link href={`/admin/proposals/${project.proposalId}`}>Proposal</Link>
          </>
        ) : null}
        {" · "}
        {project.status}
      </p>
      {next.length > 0 ? (
        <form action={updateProjectStatusAction} className="mt-8 flex flex-wrap items-end gap-4">
          <input type="hidden" name="id" value={project.id} />
          <label>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-synas-ink/55">
              Status
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
            Update →
          </button>
        </form>
      ) : null}

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Milestones</h2>
        <ul className="mt-4">
          {milestones.length === 0 ? (
            <li className="text-sm text-synas-ink/55">None yet.</li>
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
        <form action={createMilestoneAction} className="mt-6 grid max-w-xl gap-4">
          <input type="hidden" name="projectId" value={project.id} />
          <OsField name="title" label="Milestone" required />
          <OsField name="dueAt" label="Due" type="date" />
          <button type="submit" className="site-action self-start">
            Add milestone →
          </button>
        </form>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Tasks</h2>
        <ul className="mt-4">
          {projectTasks.length === 0 ? (
            <li className="text-sm text-synas-ink/55">None yet.</li>
          ) : null}
          {projectTasks.map((row) => (
            <li key={row.id} className="border-t border-synas-ink/10 py-3 text-sm">
              <Link href={`/admin/tasks/${row.id}`}>{row.title}</Link>
              <span className="ml-3 font-mono text-[11px] text-synas-ink/55">
                {row.status} · {row.priority}
              </span>
            </li>
          ))}
        </ul>
        <form action={createTaskAction} className="mt-6 grid max-w-xl gap-4">
          <input type="hidden" name="projectId" value={project.id} />
          <input type="hidden" name="companyId" value={project.companyId} />
          <OsField name="title" label="Task" required />
          <OsField name="description" label="Description" textarea />
          <OsSelect
            name="milestoneId"
            label="Milestone"
            options={[
              { value: "", label: "None" },
              ...milestones.map((row) => ({ value: row.id, label: row.title })),
            ]}
          />
          <OsSelect
            name="priority"
            label="Priority"
            options={TASK_PRIORITIES.map((item) => ({ value: item, label: item }))}
            defaultValue="normal"
          />
          <OsField name="dueAt" label="Due" type="datetime-local" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="clientVisible" />
            Visible to the client
          </label>
          <button type="submit" className="site-action self-start">
            Add task →
          </button>
        </form>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Documents</h2>
        <ul className="mt-4">
          {projectDocs.length === 0 ? (
            <li className="text-sm text-synas-ink/55">None yet.</li>
          ) : null}
          {projectDocs.map((row) => (
            <li key={row.id} className="border-t border-synas-ink/10 py-3 text-sm">
              <Link href={`/admin/documents/${row.id}`}>{row.title}</Link>
              <span className="ml-3 font-mono text-[11px] text-synas-ink/55">
                {row.type} · {row.visibility}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Updates</h2>
        <ul className="mt-4">
          {updates.length === 0 ? (
            <li className="text-sm text-synas-ink/55">None yet.</li>
          ) : null}
          {updates.map((row) => (
            <li key={row.id} className="border-t border-synas-ink/10 py-3 text-sm">
              <p className="whitespace-pre-wrap">{row.body}</p>
              <p className="mt-1 font-mono text-[11px] text-synas-ink/55">
                {formatWhen(row.createdAt)} · {row.clientVisible ? "client" : "internal"}
              </p>
            </li>
          ))}
        </ul>
        <form action={addProjectUpdateAction} className="mt-6 grid max-w-xl gap-4">
          <input type="hidden" name="projectId" value={project.id} />
          <OsField name="body" label="Update" textarea required />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="clientVisible" defaultChecked />
            Visible to the client
          </label>
          <button type="submit" className="site-action self-start">
            Post update →
          </button>
        </form>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Messages</h2>
        <ul className="mt-4">
          {messages.length === 0 ? (
            <li className="text-sm text-synas-ink/55">No thread yet.</li>
          ) : null}
          {messages.map((row) => (
            <li key={row.id} className="border-t border-synas-ink/10 py-3 text-sm">
              <p className="whitespace-pre-wrap">{row.body}</p>
              <p className="mt-1 font-mono text-[11px] text-synas-ink/55">
                {formatWhen(row.createdAt)}
              </p>
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

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Activity</h2>
        <ul className="mt-4">
          {projectActivity.length === 0 ? (
            <li className="text-sm text-synas-ink/55">None yet.</li>
          ) : null}
          {projectActivity.map((row) => (
            <li key={row.id} className="border-t border-synas-ink/10 py-3 text-sm">
              <span className="font-mono text-[11px] text-synas-ink/55">{row.type}</span>
              <p className="mt-1">{row.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
