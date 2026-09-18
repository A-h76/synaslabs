import type { Metadata } from "next";
import {
  CapabilityPath,
  CapabilitySpine,
  ConnectedWork,
} from "@/components/site/diagrams";
import {
  CtaLink,
  PageIntro,
  Rule,
  SiteContainer,
} from "@/components/site/primitives";
import { publicMetadata } from "@/lib/seo";

export const metadata: Metadata = publicMetadata({
  title: "Solutions",
  description:
    "Synas Labs designs AI automation, CRM systems, business software, integrations, and workflow systems as one connected system — not a stack of disconnected tools.",
  path: "/solutions",
});

export default function SolutionsPage() {
  return (
    <SiteContainer>
      <PageIntro kicker="Solutions" title="What Synas builds.">
        Not a catalogue of products to log into. Components of a connected
        system, designed around the way work already moves.
      </PageIntro>

      <ConnectedWork />

      <div className="mt-16 md:mt-24">
        <Rule />
        <div className="py-10 md:py-14">
          <CapabilityPath />
        </div>
        <Rule />
        <CapabilitySpine />
        <Rule />
      </div>

      <section className="grid gap-12 py-16 md:grid-cols-2 md:gap-20 md:py-24">
        <div>
          <h2 className="font-serif text-3xl font-normal tracking-tight">
            Around the work, not around a template.
          </h2>
          <p className="mt-5 max-w-md text-[1.02rem] leading-relaxed text-synas-ink/75">
            We start from the path: where a request enters, who touches it, what
            has to be true before it can move, and what “done” looks like. The
            software is the consequence of that, not the other way around.
          </p>
        </div>
        <div>
          <h2 className="font-serif text-3xl font-normal tracking-tight">
            Humans stay where judgment is required.
          </h2>
          <p className="mt-5 max-w-md text-[1.02rem] leading-relaxed text-synas-ink/75">
            Automation is for work that should not depend on someone remembering.
            Review, exception, and relationship stay with people — recorded, not
            lost in a chat thread.
          </p>
        </div>
      </section>
      <Rule />
      <div className="flex flex-col gap-3 py-14 sm:flex-row sm:gap-10">
        <CtaLink href="/brief">See a workflow as a system</CtaLink>
        <CtaLink href="/start" tone="quiet">
          Start a project
        </CtaLink>
      </div>
    </SiteContainer>
  );
}
