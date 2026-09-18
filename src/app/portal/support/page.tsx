import { OsEmpty, OsField, OsHeader } from "@/components/os/ui";
import { sendMessageAction } from "@/server/actions/os";
import { SITE_EMAIL } from "@/lib/site";
import { requireClientActor } from "@/server/dal/access";
import { listProjects } from "@/server/dal/commercial";

export default async function PortalSupportPage() {
  const actor = await requireClientActor();
  const projects = await listProjects(actor);
  const project = projects[0];
  return (
    <section>
      <OsHeader kicker="Support" title="Talk to the delivery team.">
        Use the project thread when a project exists. Otherwise email {SITE_EMAIL}.
      </OsHeader>
      {!project ? (
        <OsEmpty>
          No live project yet. Write to {SITE_EMAIL} and the team will pick it up from
          the same company record used on the public site.
        </OsEmpty>
      ) : (
        <form action={sendMessageAction} className="grid max-w-xl gap-4">
          <input type="hidden" name="projectId" value={project.id} />
          <OsField
            name="body"
            label={`Message on ${project.name}`}
            textarea
            required
          />
          <button type="submit" className="site-action self-start">
            Send →
          </button>
        </form>
      )}
    </section>
  );
}
