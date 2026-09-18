import { OsHeader, OsMeta } from "@/components/os/ui";
import { requireClientActor } from "@/server/dal/access";
import { getCompany } from "@/server/dal/crm";

export default async function PortalAccountPage() {
  const actor = await requireClientActor();
  const company = actor.companyId ? await getCompany(actor, actor.companyId) : null;
  return (
    <section>
      <OsHeader kicker="Account" title={actor.name} />
      <dl className="max-w-xl text-sm">
        <div className="grid grid-cols-[8rem_1fr] gap-3 border-t border-synas-ink/12 py-3">
          <dt><OsMeta>Email</OsMeta></dt>
          <dd>{actor.email}</dd>
        </div>
        <div className="grid grid-cols-[8rem_1fr] gap-3 border-t border-synas-ink/12 py-3">
          <dt><OsMeta>Role</OsMeta></dt>
          <dd>{actor.role}</dd>
        </div>
        <div className="grid grid-cols-[8rem_1fr] gap-3 border-t border-synas-ink/12 py-3">
          <dt><OsMeta>Company</OsMeta></dt>
          <dd>{company?.name || "—"}</dd>
        </div>
      </dl>
    </section>
  );
}
