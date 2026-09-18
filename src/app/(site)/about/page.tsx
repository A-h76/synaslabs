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
  title: "About",
  description:
    "Synas Labs is a systems company. We study how work moves through a business, then design the software, automation, and connections around it.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <SiteContainer>
      <PageIntro kicker="About" title="A systems company.">
        We study how work actually moves through a business. Then we design the
        software, automation, and connections around it.
      </PageIntro>
      <Rule />
      <div className="grid gap-12 py-14 md:grid-cols-2 md:gap-24 md:py-20">
        <p className="text-[1.08rem] leading-relaxed text-synas-ink/80">
          The point is not more tools. The point is a path that can run without
          someone carrying the state in their head.
        </p>
        <p className="text-[1.08rem] leading-relaxed text-synas-ink/80">
          The company is new. There is no invented history here. The public site
          is the front door; the operating system behind it is how work will be
          delivered.
        </p>
      </div>
      <Rule />
      <div className="flex flex-col items-start gap-2 py-14">
        <a
          href={`mailto:${SITE_EMAIL}`}
          className="inline-flex min-h-11 items-center font-mono text-[12px] lowercase tracking-[0.08em]"
        >
          {SITE_EMAIL}
        </a>
        <ExternalLink
          href={LINKEDIN_URL}
          className="inline-flex min-h-11 items-center font-mono text-[12px] uppercase tracking-[0.1em]"
        >
          LinkedIn
        </ExternalLink>
        <div className="mt-4">
          <CtaLink href="/start">Start a project</CtaLink>
        </div>
      </div>
    </SiteContainer>
  );
}
