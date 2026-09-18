import type { Metadata } from "next";
import {
  CtaLink,
  ExternalLink,
  PageIntro,
  Rule,
  SiteContainer,
} from "@/components/site/primitives";
import { LINKEDIN_URL, SITE_EMAIL } from "@/lib/site";
import { publicMetadata } from "@/lib/seo";

export const metadata: Metadata = publicMetadata({
  title: "Contact",
  description:
    "Contact Synas Labs at hello@synaslabs.com or on LinkedIn. Start a project when you are ready to describe the work.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <SiteContainer>
      <PageIntro kicker="Contact" title="Write, or start a project.">
        For a general note, email is enough. If you want a system built, use
        Start a project — it is a short discovery, not a marketing form.
      </PageIntro>
      <Rule />
      <dl className="max-w-2xl py-14">
        <div className="grid gap-2 border-b border-synas-ink/12 py-6 md:grid-cols-[8rem_1fr] md:items-baseline">
          <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-synas-ink/60">
            Email
          </dt>
          <dd>
            <a
              href={`mailto:${SITE_EMAIL}`}
              className="font-serif text-2xl tracking-tight lowercase md:text-3xl"
            >
              {SITE_EMAIL}
            </a>
          </dd>
        </div>
        <div className="grid gap-2 border-b border-synas-ink/12 py-6 md:grid-cols-[8rem_1fr] md:items-baseline">
          <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-synas-ink/60">
            LinkedIn
          </dt>
          <dd>
            <ExternalLink
              href={LINKEDIN_URL}
              className="font-serif text-2xl tracking-tight md:text-3xl"
            >
              synas-labs
            </ExternalLink>
          </dd>
        </div>
      </dl>
      <div className="pb-16">
        <CtaLink href="/start">Start a project</CtaLink>
      </div>
    </SiteContainer>
  );
}
