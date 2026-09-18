import Image from "next/image";
import Link from "next/link";
import type { Actor } from "@/domain/entities";
import { can } from "@/domain/permissions";
import { ADMIN_NAV, PORTAL_SECTIONS } from "@/config/navigation";
import { SITE_NAME } from "@/lib/site";
import { logoutAction } from "@/server/auth/login";
import { markNotificationReadAction } from "@/server/actions/os";

type Surface = "admin" | "portal";

type Notice = {
  id: string;
  title: string;
  href: string | null;
  readAt: Date | string | null;
};

export function OsShell({
  surface,
  actor,
  notifications = [],
  children,
}: {
  surface: Surface;
  actor: Actor;
  notifications?: Notice[];
  children: React.ReactNode;
}) {
  const items =
    surface === "admin"
      ? ADMIN_NAV.filter((item) =>
          can(
            { role: actor.role, companyId: actor.companyId },
            item.resource,
            "read",
          ),
        )
      : PORTAL_SECTIONS.map((section) => ({
          href: `/portal/${section.slug}`,
          title: section.title,
        }));

  const home = surface === "admin" ? "/admin" : "/portal";
  const homeLabel = surface === "admin" ? "Operating system" : "Client portal";
  const unread = notifications.filter((item) => !item.readAt).slice(0, 6);

  return (
    <div className="os-root">
      <div className="mx-auto grid min-h-dvh w-full max-w-[92rem] grid-cols-1 lg:grid-cols-[14rem_1fr]">
        <aside className="border-b border-synas-ink/12 px-6 py-6 lg:border-r lg:border-b-0 lg:px-7 lg:py-8">
          <Link href={home} className="inline-block">
            <Image
              src="/synas-wordmark.png"
              alt={SITE_NAME}
              width={475}
              height={136}
              className="h-6 w-auto brightness-0"
              priority
            />
          </Link>
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-synas-ink/55">
            {homeLabel}
          </p>
          <nav className="mt-6 flex flex-row flex-wrap gap-x-4 gap-y-2 lg:flex-col lg:gap-2">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-mono text-[11px] tracking-[0.04em] text-synas-ink/70 hover:text-synas-ink"
              >
                {item.title}
              </Link>
            ))}
          </nav>
          {surface === "admin" ? (
            <form action="/admin/search" method="get" className="mt-8">
              <label className="block">
                <span className="sr-only">Search</span>
                <input
                  name="q"
                  className="site-field py-2 text-sm"
                  placeholder="Search records"
                />
              </label>
            </form>
          ) : null}
          {unread.length > 0 ? (
            <div className="mt-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-synas-ink/55">
                Notifications
              </p>
              <ul className="mt-3">
                {unread.map((item) => (
                  <li key={item.id} className="border-t border-synas-ink/10 py-2">
                    {item.href ? (
                      <Link href={item.href} className="block text-xs leading-snug">
                        {item.title}
                      </Link>
                    ) : (
                      <p className="text-xs leading-snug">{item.title}</p>
                    )}
                    <form action={markNotificationReadAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <button
                        type="submit"
                        className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-synas-ink/55"
                      >
                        Mark read
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <form action={logoutAction} className="mt-8">
            <button type="submit" className="font-mono text-[11px] uppercase tracking-[0.1em] text-synas-ink/55">
              Sign out
            </button>
          </form>
        </aside>
        <div className="px-5 py-8 sm:px-10 lg:px-12 lg:py-10">
          <div className="flex items-baseline justify-between gap-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-synas-ink/55">
              {actor.role}
            </p>
            <p className="font-mono text-[11px] text-synas-ink/55">{actor.email}</p>
          </div>
          <hr className="mt-4 border-0 border-t border-synas-ink/12" />
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
