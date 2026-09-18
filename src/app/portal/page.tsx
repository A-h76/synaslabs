import Link from "next/link";
import { OsEmpty, OsHeader } from "@/components/os/ui";
import { requireClientActor } from "@/server/dal/access";
import {
  listDocuments,
  listProjects,
  listProposals,
  listTasks,
} from "@/server/dal/commercial";
import { isDatabaseConfigured } from "@/lib/env";

export default async function PortalHomePage() {
  const actor = await requireClientActor();
  const [projects, proposals, documents, tasks] = await Promise.all([
    listProjects(actor),
    listProposals(actor),
    listDocuments(actor),
    listTasks(actor),
  ]);
  const openTasks = tasks.filter((row) => row.status !== "completed");
  return (
    <section>
      <OsHeader kicker="Portal" title={`Hello, ${actor.name}.`}>
        Delivery, proposals, and files for your company only. Nothing here is invented.
      </OsHeader>
      {!isDatabaseConfigured() ? (
        <OsEmpty>The workspace is not connected yet. Your team will open it when delivery starts.</OsEmpty>
      ) : (
        <div className="grid gap-10 lg:grid-cols-2">
          <Block
            title="Projects"
            href="/portal/projects"
            empty="No projects are open yet."
            items={projects.map((row) => ({ href: `/portal/projects/${row.id}`, label: row.name, meta: row.status }))}
          />
          <Block
            title="Proposals"
            href="/portal/proposals"
            empty="No proposals have been shared."
            items={proposals.map((row) => ({ href: `/portal/proposals/${row.id}`, label: row.title, meta: row.status }))}
          />
          <Block
            title="Documents"
            href="/portal/documents"
            empty="No client documents yet."
            items={documents.map((row) => ({ href: `/portal/documents/${row.id}`, label: row.title, meta: row.type }))}
          />
          <Block
            title="Your tasks"
            href="/portal/tasks"
            empty="No visible tasks."
            items={openTasks.map((row) => ({ href: `/portal/tasks`, label: row.title, meta: row.status }))}
          />
        </div>
      )}
    </section>
  );
}

function Block({
  title,
  href,
  empty,
  items,
}: {
  title: string;
  href: string;
  empty: string;
  items: { href: string; label: string; meta: string }[];
}) {
  return (
    <section>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-serif text-2xl">{title}</h2>
        <Link href={href} className="font-mono text-[11px] uppercase tracking-[0.1em] text-synas-ink/55">
          Open
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-synas-ink/55">{empty}</p>
      ) : (
        <ul className="mt-3">
          {items.slice(0, 5).map((item) => (
            <li key={item.href + item.label} className="border-t border-synas-ink/10 py-3">
              <Link href={item.href} className="flex justify-between gap-3 text-sm">
                <span>{item.label}</span>
                <span className="font-mono text-[11px] text-synas-ink/55">{item.meta}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
