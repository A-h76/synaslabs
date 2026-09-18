import { scheduleEventAction } from "@/server/actions/os";
import { CALENDAR_EVENT_KINDS } from "@/domain/lifecycle";
import { OsField, OsSelect } from "@/components/os/ui";

export function CalendarForm({
  companies,
}: {
  companies: { id: string; name: string }[];
}) {
  return (
    <form action={scheduleEventAction} className="grid max-w-xl gap-4">
      <h2 className="font-serif text-2xl">Schedule</h2>
      <p className="text-sm text-synas-ink/70">
        Written locally first. Provider sync runs only if a calendar integration is
        configured.
      </p>
      <OsSelect
        name="kind"
        label="Kind"
        required
        options={CALENDAR_EVENT_KINDS.map((kind) => ({ value: kind, label: kind }))}
      />
      <OsField name="title" label="Title" required />
      <OsField name="startsAt" label="Starts" type="datetime-local" required />
      <OsField name="endsAt" label="Ends" type="datetime-local" required />
      <OsSelect
        name="companyId"
        label="Company"
        options={[
          { value: "", label: "None" },
          ...companies.map((row) => ({ value: row.id, label: row.name })),
        ]}
      />
      <OsField name="location" label="Location" />
      <button type="submit" className="site-action self-start">
        Save event →
      </button>
    </form>
  );
}
