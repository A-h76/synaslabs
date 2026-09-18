import Link from "next/link";
import {
  FOOTER_COMPANY_LINKS,
  FOOTER_SYSTEMS_LINKS,
  FOOTER_WORK_LINKS,
} from "@/lib/nav";
import {
  BRAND_STATEMENT,
  FOOTER_STATEMENT,
  LINKEDIN_URL,
  SITE_EMAIL,
  SITE_NAME,
} from "@/lib/site";
import { StatusIndicator } from "@/components/site/diagrams";
import {
  CtaLink,
  ExternalLink,
  MetaLabel,
  SiteContainer,
} from "@/components/site/primitives";
import { Wordmark } from "@/components/site/wordmark";

type FooterLink = { href: string; label: string };

function FooterColumn({ title, links }: { title: string; links: readonly FooterLink[] }) {
  return (
    <div>
      <MetaLabel>{title}</MetaLabel>
      <ul className="mt-4 flex flex-col gap-1">
        {links.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="inline-flex min-h-10 items-center font-mono text-[11px] uppercase tracking-[0.08em] text-synas-ink/70 hover:text-synas-ink"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-synas-ink/12 bg-synas-mint">
      <SiteContainer>
        <div className="grid gap-14 py-16 lg:grid-cols-[1.3fr_minmax(0,1fr)] lg:gap-16 lg:py-20">
          <div>
            <Wordmark className="h-8 w-auto sm:h-9" />
            <p className="mt-6 max-w-sm text-[0.95rem] leading-relaxed text-synas-ink/75">
              {BRAND_STATEMENT}
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-synas-ink/65">
              {FOOTER_STATEMENT}
            </p>
            <div className="mt-8 flex flex-col items-start gap-2">
              <a
                href={`mailto:${SITE_EMAIL}`}
                className="inline-flex min-h-10 items-center font-mono text-[11px] lowercase tracking-[0.08em] text-synas-ink/80 hover:text-synas-ink"
              >
                {SITE_EMAIL}
              </a>
              <ExternalLink
                href={LINKEDIN_URL}
                className="inline-flex min-h-10 items-center font-mono text-[11px] uppercase tracking-[0.08em] text-synas-ink/70 hover:text-synas-ink"
              >
                LinkedIn ↗
              </ExternalLink>
            </div>
            <div className="mt-8">
              <StatusIndicator tone="active">Systems active</StatusIndicator>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-10">
            <FooterColumn title="Systems" links={FOOTER_SYSTEMS_LINKS} />
            <FooterColumn title="Work" links={FOOTER_WORK_LINKS} />
            <FooterColumn title="Company" links={FOOTER_COMPANY_LINKS} />
            <div>
              <MetaLabel>Start</MetaLabel>
              <div className="mt-4 flex flex-col items-start gap-4">
                <CtaLink href="/brief">System Brief</CtaLink>
                <CtaLink href="/start" tone="quiet">
                  Start a project
                </CtaLink>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-synas-ink/12 py-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-synas-ink/70">
            © {year} {SITE_NAME}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-synas-ink/60">
            {SITE_NAME} / {BRAND_STATEMENT.toUpperCase()}
          </p>
        </div>
      </SiteContainer>
    </footer>
  );
}
