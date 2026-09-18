import { CalendarForm } from "@/components/os/calendar-form";
import { OsEmpty, OsField, OsHeader, OsSelect } from "@/components/os/ui";
import { createUserAction } from "@/server/actions/os";
import { USER_ROLES } from "@/domain/roles";
import { requireTeamActor } from "@/server/dal/access";
import { listUsers } from "@/server/dal/activity";
import { listUpcomingEvents } from "@/server/dal/calendar";
import { listCompanies } from "@/server/dal/crm";
import { getIntegrationStatus } from "@/server/integrations";
import { formatWhenTime } from "@/lib/format";
import { can } from "@/domain/permissions";

export default async function SettingsPage() {
  const actor = await requireTeamActor();
  if (!can({ role: actor.role, companyId: actor.companyId }, "settings", "read")) {
    return (
      <section>
        <OsHeader kicker="Settings" title="Restricted." />
        <OsEmpty>Settings are limited to administrators.</OsEmpty>
      </section>
    );
  }
  const [users, companies, events] = await Promise.all([
    listUsers(actor),
    listCompanies(actor),
    listUpcomingEvents(actor),
  ]);
  const integrations = getIntegrationStatus();
  return (
    <section>
      <OsHeader kicker="Settings" title="People, calendar, integrations.">
        In-app notifications are live. Email, SMS, and calendar providers stay behind
        ports until credentials exist.
      </OsHeader>
      <h2 className="font-serif text-2xl">Users</h2>
      <ul className="mt-4">
        {users.map((row) => (
          <li key={row.id} className="border-t border-synas-ink/10 py-3 text-sm">
            {row.name}
            <span className="ml-3 font-mono text-[11px] text-synas-ink/55">
              {row.role} · {row.email}
            </span>
          </li>
        ))}
      </ul>
      <form action={createUserAction} className="mt-8 grid max-w-xl gap-4">
        <h3 className="font-serif text-xl">Add a user</h3>
        <OsField name="name" label="Name" required />
        <OsField name="email" label="Email" type="email" required />
        <OsField name="password" label="Password" type="password" required />
        <OsSelect
          name="role"
          label="Role"
          required
          options={USER_ROLES.map((role) => ({ value: role, label: role }))}
        />
        <OsSelect
          name="companyId"
          label="Company (required for CLIENT)"
          options={[
            { value: "", label: "None" },
            ...companies.map((row) => ({ value: row.id, label: row.name })),
          ]}
        />
        <button type="submit" className="site-action self-start">
          Create user →
        </button>
      </form>
      <div className="mt-16">
        <h2 className="mb-6 font-serif text-2xl">Calendar</h2>
        <ul className="mb-8">
          {events.length === 0 ? (
            <li className="text-sm text-synas-ink/55">No upcoming events.</li>
          ) : null}
          {events.map((row) => (
            <li key={row.id} className="border-t border-synas-ink/10 py-3 text-sm">
              {row.title}
              <span className="ml-3 font-mono text-[11px] text-synas-ink/55">
                {row.kind} · {formatWhenTime(row.startsAt)}
                {row.providerEventId ? " · provider" : " · local"}
              </span>
            </li>
          ))}
        </ul>
        <CalendarForm companies={companies} />
      </div>
      <div className="mt-16">
        <h2 className="font-serif text-2xl">Integration ports</h2>
        <dl className="mt-4 max-w-2xl">
          {Object.entries(integrations).map(([name, status]) => (
            <div
              key={name}
              className="grid grid-cols-[8rem_1fr] gap-3 border-t border-synas-ink/12 py-3 text-sm"
            >
              <dt className="font-mono text-[11px] uppercase tracking-[0.08em] text-synas-ink/55">
                {name}
              </dt>
              <dd>
                {status.credential ? "credential present" : "no credential"} ·{" "}
                {status.adapter ? "adapter live" : "adapter not wired"}
                <p className="mt-1 text-synas-ink/70">{status.note}</p>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
