import Link from "next/link";
import { FOOTER_NAV } from "@/lib/nav";
import { LINKEDIN_URL, SITE_EMAIL, SITE_NAME } from "@/lib/site";
import {
  ExternalLink,
  MetaLabel,
  Rule,
  SiteContainer,
} from "@/components/site/primitives";
import { Wordmark } from "@/components/site/wordmark";

export function SiteFooter() {
  return (
    <footer className="mt-auto pt-8">
      <SiteContainer>
        <Rule />
        <div className="grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <div>
            <Wordmark />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-synas-ink/70">
              Systems that move businesses.
            </p>
          </div>
          <div>
            <MetaLabel>Site</MetaLabel>
            <ul className="mt-4 flex flex-col">
              {FOOTER_NAV.map((item) => (
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
          <div>
            <MetaLabel>Contact</MetaLabel>
            <ul className="mt-4 flex flex-col gap-1">
              <li>
                <a
                  href={`mailto:${SITE_EMAIL}`}
                  className="inline-flex min-h-10 items-center font-mono text-[11px] lowercase tracking-[0.08em] text-synas-ink/80 hover:text-synas-ink"
                >
                  {SITE_EMAIL}
                </a>
              </li>
              <li>
                <ExternalLink
                  href={LINKEDIN_URL}
                  className="inline-flex min-h-10 items-center font-mono text-[11px] uppercase tracking-[0.08em] text-synas-ink/70 hover:text-synas-ink"
                >
                  LinkedIn
                </ExternalLink>
              </li>
            </ul>
          </div>
        </div>
        <Rule />
        <p className="py-6 font-mono text-[10px] uppercase tracking-[0.14em] text-synas-ink/55">
          {SITE_NAME}
        </p>
      </SiteContainer>
    </footer>
  );
}
