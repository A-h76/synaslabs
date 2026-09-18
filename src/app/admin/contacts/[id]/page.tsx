import Link from "next/link";
import { OsHeader, OsMeta } from "@/components/os/ui";
import { requireTeamActor } from "@/server/dal/access";
import { getContact, listCompanies } from "@/server/dal/crm";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await requireTeamActor();
  const { id } = await params;
  const contact = await getContact(actor, id);
  const companies = await listCompanies(actor);
  const company = companies.find((row) => row.id === contact.companyId);
  return (
    <article>
      <OsHeader kicker="Contact" title={contact.name} />
      <dl className="max-w-xl text-sm">
        <div className="grid grid-cols-[8rem_1fr] gap-3 border-t border-synas-ink/12 py-3">
          <dt><OsMeta>Email</OsMeta></dt>
          <dd>{contact.email || "—"}</dd>
        </div>
        <div className="grid grid-cols-[8rem_1fr] gap-3 border-t border-synas-ink/12 py-3">
          <dt><OsMeta>Role</OsMeta></dt>
          <dd>{contact.roleTitle || "—"}</dd>
        </div>
        <div className="grid grid-cols-[8rem_1fr] gap-3 border-t border-synas-ink/12 py-3">
          <dt><OsMeta>Company</OsMeta></dt>
          <dd>
            {company ? (
              <Link href={`/admin/companies/${company.id}`}>{company.name}</Link>
            ) : (
              "—"
            )}
          </dd>
        </div>
      </dl>
    </article>
  );
}
