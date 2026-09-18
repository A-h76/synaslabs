import { OsEmpty, OsField, OsHeader } from "@/components/os/ui";
import { addNoteAction } from "@/server/actions/os";
import { requireTeamActor } from "@/server/dal/access";
import { listActivity } from "@/server/dal/activity";
import { listUpcomingEvents } from "@/server/dal/calendar";
import { isDatabaseConfigured } from "@/lib/env";
import { formatWhenTime } from "@/lib/format";

export default async function ActivityPage() {
  const actor = await requireTeamActor();
  const [records, events] = await Promise.all([
    listActivity(actor),
    listUpcomingEvents(actor),
  ]);
  return (
    <section>
      <OsHeader kicker="Activity" title="The operating stream.">
        Leads, briefs, proposals, projects, tasks, documents, and messages write here.
      </OsHeader>
      {!isDatabaseConfigured() ? (
        <OsEmpty>No data store is connected.</OsEmpty>
      ) : (
        <>
          <h2 className="font-serif text-2xl">Upcoming</h2>
          <ul className="mt-4">
            {events.length === 0 ? (
              <li className="text-sm text-synas-ink/55">No upcoming meetings or deadlines.</li>
            ) : null}
            {events.map((row) => (
              <li key={row.id} className="border-t border-synas-ink/10 py-3 text-sm">
                {row.title}
                <span className="ml-3 font-mono text-[11px] text-synas-ink/55">
                  {row.kind} · {formatWhenTime(row.startsAt)}
                </span>
              </li>
            ))}
          </ul>
          <h2 className="mt-12 font-serif text-2xl">Stream</h2>
          <ul className="mt-4">
            {records.length === 0 ? (
              <li className="text-sm text-synas-ink/55">Nothing recorded yet.</li>
            ) : null}
            {records.map((row) => (
              <li key={row.id} className="border-t border-synas-ink/10 py-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-synas-ink/55">
                  {row.type} · {formatWhenTime(row.createdAt)}
                </p>
                <p className="mt-1 text-sm">{row.body}</p>
              </li>
            ))}
          </ul>
        </>
      )}
      <form action={addNoteAction} className="mt-14 grid max-w-xl gap-4">
        <h2 className="font-serif text-2xl">Add a note</h2>
        <OsField name="body" label="Note" textarea required />
        <button type="submit" className="site-action self-start">
          Save note →
        </button>
      </form>
    </section>
  );
}
