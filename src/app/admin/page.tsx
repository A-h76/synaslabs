import Link from "next/link";
import { CalendarForm } from "@/components/os/calendar-form";
import { OsEmpty, OsHeader } from "@/components/os/ui";
import { getDashboard } from "@/server/dal/dashboard";
import { requireTeamActor } from "@/server/dal/access";
import { listCompanies } from "@/server/dal/crm";

function Attention({
  title,
  items,
}: {
  title: string;
  items: { id: string; href: string; label: string; meta: string }[];
}) {
  return (
    <section>
      <h2 className="font-mono text-[10px] uppercase tracking-[0.16em] text-synas-ink/55">
        {title}
      </h2>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-synas-ink/55">None.</p>
      ) : (
        <ol className="mt-3">
          {items.map((item) => (
            <li key={item.id} className="border-t border-synas-ink/10 py-3">
              <Link href={item.href} className="flex flex-wrap items-baseline justify-between gap-3">
                <span className="text-sm">{item.label}</span>
                <span className="font-mono text-[11px] text-synas-ink/55">{item.meta}</span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default async function AdminHomePage() {
  const actor = await requireTeamActor();
  const [dashboard, companies] = await Promise.all([
    getDashboard(actor),
    listCompanies(actor),
  ]);

  return (
    <section>
      <OsHeader kicker="Dashboard" title="What needs attention?">
        Overdue work, new inbound, open commercial motion, meetings, proposals, and
        delivery. Not a chart.
      </OsHeader>
      {dashboard.store === "disconnected" ? (
        <OsEmpty>
          No data store is connected. This surface is authorized; it will not invent
          records. Set DATABASE_URL to operate.
        </OsEmpty>
      ) : (
        <div className="grid gap-12 lg:grid-cols-2">
          <Attention title="Overdue follow-ups" items={dashboard.overdueFollowUps} />
          <Attention title="New leads" items={dashboard.newLeads} />
          <Attention title="Open opportunities" items={dashboard.openOpportunities} />
          <Attention title="Upcoming meetings" items={dashboard.upcomingMeetings} />
          <Attention title="Proposal activity" items={dashboard.proposalActivity} />
          <Attention title="Active projects" items={dashboard.activeProjects} />
          <Attention title="Overdue tasks" items={dashboard.overdueTasks} />
        </div>
      )}
      <div className="mt-16">
        <CalendarForm companies={companies} />
      </div>
    </section>
  );
}
