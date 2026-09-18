import { OsEmpty, OsField, OsHeader } from "@/components/os/ui";
import { sendMessageAction } from "@/server/actions/os";
import { requireClientActor } from "@/server/dal/access";
import { listMessages, listProjects, markMessagesRead } from "@/server/dal/commercial";
import { isDatabaseConfigured } from "@/lib/env";
import { formatWhenTime } from "@/lib/format";

export default async function PortalMessagesPage() {
  const actor = await requireClientActor();
  const projects = await listProjects(actor);
  const threads = await Promise.all(
    projects.map(async (project) => {
      const messages = await listMessages(actor, project.id);
      await markMessagesRead(actor, project.id);
      return { project, messages };
    }),
  );
  return (
    <section>
      <OsHeader kicker="Messages" title="Project conversation.">
        Threads stay on the project. Attachments, when used, go through the document
        register — not public URLs.
      </OsHeader>
      {!isDatabaseConfigured() ? (
        <OsEmpty>The workspace is not connected yet.</OsEmpty>
      ) : projects.length === 0 ? (
        <OsEmpty>Messages appear once a project is open for your company.</OsEmpty>
      ) : (
        <div className="grid gap-12">
          {threads.map(({ project, messages }) => (
            <article key={project.id}>
              <h2 className="font-serif text-2xl">{project.name}</h2>
              <ul className="mt-4">
                {messages.length === 0 ? (
                  <li className="text-sm text-synas-ink/55">No messages yet.</li>
                ) : null}
                {messages.map((row) => (
                  <li key={row.id} className="border-t border-synas-ink/10 py-3 text-sm">
                    <p className="whitespace-pre-wrap">{row.body}</p>
                    <p className="mt-1 font-mono text-[11px] text-synas-ink/55">
                      {formatWhenTime(row.createdAt)}
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
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
