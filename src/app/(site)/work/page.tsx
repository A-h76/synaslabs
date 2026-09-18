import type { Metadata } from "next";
import {
  CtaLink,
  MetaLabel,
  PageIntro,
  Rule,
  SiteContainer,
} from "@/components/site/primitives";
import { publicMetadata } from "@/lib/seo";

export const metadata: Metadata = publicMetadata({
  title: "Work",
  description:
    "Lead Radar is an internal Synas Labs system for opportunity intelligence, CRM, qualification, and follow-up. Client work will be published here when it exists.",
  path: "/work",
});

const DEMO = [
  "Opportunity discovery",
  "Qualification and scoring",
  "CRM and lifecycle",
  "Follow-up automation",
  "Sales assistance",
  "System design for how a pipeline actually runs",
];

export default function WorkPage() {
  return (
    <SiteContainer>
      <PageIntro kicker="Work" title="Proof, without invention.">
        There are no client case studies to publish yet. That is the true state
        of the company, and this page is built around it.
      </PageIntro>

      <article className="border-t border-synas-ink/12 py-14 md:py-20">
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <MetaLabel>Internal product</MetaLabel>
          <MetaLabel>Synas Labs</MetaLabel>
        </div>
        <h2 className="mt-6 max-w-[12ch] font-serif text-[clamp(2.2rem,6vw,3.6rem)] leading-[1.02] font-normal tracking-tight">
          Lead Radar
        </h2>
        <p className="mt-6 max-w-xl text-[1.02rem] leading-relaxed text-synas-ink/75">
          An internal build: opportunity intelligence, CRM, qualification,
          scoring, sales assistance, follow-up, and automation — designed as one
          system rather than a pile of tools. It is how Synas runs its own
          pipeline. It is not a client project.
        </p>
        <ol className="mt-12 max-w-xl">
          {DEMO.map((item, index) => (
            <li
              key={item}
              className="flex items-baseline justify-between gap-6 border-t border-synas-ink/12 py-3"
            >
              <span className="font-mono text-[11px] text-synas-ink/55">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 text-[0.98rem]">{item}</span>
            </li>
          ))}
        </ol>
        <p className="mt-10 max-w-xl text-sm leading-relaxed text-synas-ink/65">
          Lead Radar will not be presented as someone else’s outcome. This is
          not a client case study.
        </p>
      </article>

      <Rule />
      <section className="py-16 md:py-20">
        <MetaLabel>Client systems</MetaLabel>
        <div className="mt-8 min-h-44 border border-synas-ink/15 px-6 py-10 md:px-10">
          <p className="font-mono text-[11px] text-synas-ink/55">00</p>
          <p className="mt-6 max-w-lg font-serif text-3xl font-normal tracking-tight">
            Nothing to list yet.
          </p>
          <p className="mt-4 max-w-lg text-[1.02rem] leading-relaxed text-synas-ink/70">
            When a system is built for a client and can be described honestly, it
            will sit here. Until then this space stays empty on purpose.
          </p>
        </div>
        <div className="mt-10">
          <CtaLink href="/start">Start a project</CtaLink>
        </div>
      </section>
    </SiteContainer>
  );
}
