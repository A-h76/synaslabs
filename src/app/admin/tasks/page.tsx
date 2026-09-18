import { OsEmpty, OsField, OsHeader, OsSelect, OsTable } from "@/components/os/ui";
import { createTaskAction } from "@/server/actions/os";
import { isFollowUpOverdue } from "@/domain/follow-up";
import { TASK_PRIORITIES } from "@/domain/lifecycle";
import { requireTeamActor } from "@/server/dal/access";
import { listAssignableUsers } from "@/server/dal/activity";
import { listProjects, listTasks } from "@/server/dal/commercial";
import { listCompanies, listLeads, listOpportunities } from "@/server/dal/crm";
import { isDatabaseConfigured } from "@/lib/env";
import { formatWhen } from "@/lib/format";

export default async function TasksPage() {
  const actor = await requireTeamActor();
  const [records, companies, leads, opportunities, projects, assignees] = await Promise.all([
    listTasks(actor),
    listCompanies(actor),
    listLeads(actor),
    listOpportunities(actor),
    listProjects(actor),
    listAssignableUsers(actor),
  ]);
  return (
    <section>
      <OsHeader kicker="Tasks" title="Work and follow-up, one list.">
        Follow-up due dates come from a single rule set shared with Lead Radar.
      </OsHeader>
      {!isDatabaseConfigured() ? (
        <OsEmpty>No data store is connected.</OsEmpty>
      ) : (
        <OsTable
          columns={["Title", "Kind", "Status", "Due"]}
          empty="No tasks yet."
          rows={records.map((row) => ({
            href: `/admin/tasks/${row.id}`,
            cells: [
              row.title,
              row.kind,
              row.status,
              isFollowUpOverdue(row.dueAt, row.status)
                ? `Overdue · ${formatWhen(row.dueAt)}`
                : formatWhen(row.dueAt),
            ],
          }))}
        />
      )}
      <form action={createTaskAction} className="mt-14 grid max-w-xl gap-4">
        <h2 className="font-serif text-2xl">Create a task</h2>
        <OsField name="title" label="Title" required />
        <OsField name="description" label="Description" textarea />
        <OsSelect
          name="kind"
          label="Kind"
          options={[
            { value: "work", label: "work" },
            { value: "follow_up", label: "follow_up" },
          ]}
        />
        <OsSelect
          name="priority"
          label="Priority"
          defaultValue="normal"
          options={TASK_PRIORITIES.map((item) => ({ value: item, label: item }))}
        />
        <OsSelect
          name="assigneeUserId"
          label="Assignee"
          options={[
            { value: "", label: "Me" },
            ...assignees.map((row) => ({ value: row.id, label: row.name })),
          ]}
        />
        <OsSelect
          name="companyId"
          label="Company"
          options={[
            { value: "", label: "None" },
            ...companies.map((row) => ({ value: row.id, label: row.name })),
          ]}
        />
        <OsSelect
          name="leadId"
          label="Lead"
          options={[
            { value: "", label: "None" },
            ...leads.map((row) => ({
              value: row.id,
              label: row.summary || row.source,
            })),
          ]}
        />
        <OsSelect
          name="opportunityId"
          label="Opportunity"
          options={[
            { value: "", label: "None" },
            ...opportunities.map((row) => ({ value: row.id, label: row.name })),
          ]}
        />
        <OsSelect
          name="projectId"
          label="Project"
          options={[
            { value: "", label: "None" },
            ...projects.map((row) => ({ value: row.id, label: row.name })),
          ]}
        />
        <OsField name="dueAt" label="Due" type="datetime-local" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="clientVisible" />
          Visible to the client
        </label>
        <button type="submit" className="site-action self-start">
          Save task →
        </button>
      </form>
    </section>
  );
}
