import type { Metadata } from "next";
import {
  CtaLink,
  PageIntro,
  Rule,
  SiteContainer,
} from "@/components/site/primitives";
import { publicMetadata } from "@/lib/seo";

export const metadata: Metadata = publicMetadata({
  title: "Approach",
  description:
    "Discover, structure, design, build, connect, improve. Synas Labs turns a messy business process into a connected system.",
  path: "/approach",
});

const STEPS = [
  {
    id: "01",
    name: "Discover",
    text: "Watch how work actually moves. Not the org chart — the messages, the spreadsheet, the person who still remembers.",
  },
  {
    id: "02",
    name: "Structure",
    text: "Name the steps, the owners, the systems, and the exceptions. If it cannot be structured, it cannot be built honestly.",
  },
  {
    id: "03",
    name: "Design",
    text: "Decide what a connected system should do, and what must remain human. The brief is the design, not a slide.",
  },
  {
    id: "04",
    name: "Build",
    text: "Software, automation, CRM, or a mix — whatever the path requires. No generated toy apps.",
  },
  {
    id: "05",
    name: "Connect",
    text: "Wire the tools the business already uses. Calendar, inbox, payments, records. The system is the connections.",
  },
  {
    id: "06",
    name: "Improve",
    text: "Once the path is running, tighten the slow steps. The first build is a system, not a finished company.",
  },
];

export default function ApproachPage() {
  return (
    <SiteContainer>
      <PageIntro kicker="Approach" title="From messy process to connected system.">
        A short sequence. If a stage does not change the work, we skip it.
      </PageIntro>
      <Rule />
      <ol>
        {STEPS.map((step) => (
          <li
            key={step.id}
            className="grid gap-3 border-b border-synas-ink/12 py-10 md:grid-cols-[5rem_11rem_minmax(0,32rem)] md:gap-12 md:py-14"
          >
            <p className="font-mono text-sm text-synas-ink/55">{step.id}</p>
            <h2 className="font-sans text-2xl font-semibold tracking-tight md:text-[1.65rem]">
              {step.name}
            </h2>
            <p className="text-[1.02rem] leading-relaxed text-synas-ink/75">
              {step.text}
            </p>
          </li>
        ))}
      </ol>
      <div className="flex flex-col gap-3 py-14 sm:flex-row sm:gap-10">
        <CtaLink href="/brief">Try it on your workflow</CtaLink>
        <CtaLink href="/start" tone="quiet">
          Start a project
        </CtaLink>
      </div>
    </SiteContainer>
  );
}
