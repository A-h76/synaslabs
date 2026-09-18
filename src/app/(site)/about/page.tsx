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

const TEAM = [
  {
    name: "Ahmad Hasan",
    role: "CEO & Founder",
    linkedin: "https://www.linkedin.com/in/ahmadhasan76/",
  },
  {
    name: "Muhammad Haris",
    role: "CTO & Co-Founder",
    linkedin: "https://www.linkedin.com/in/muhammadharis76/",
  },
];

const PRINCIPLES = [
  {
    id: "01",
    label: "What Synas is",
    text: "A new systems company. There is no invented history here — the public site is the front door, and the operating system behind it is how work actually gets delivered.",
  },
  {
    id: "02",
    label: "What we build",
    text: "Software, automation, CRM, and the integrations between them — built as one connected system around a specific business, not sold as separate products.",
  },
  {
    id: "03",
    label: "How we think about systems",
    text: "A system is not more tools. It is the path work takes from request to done, plus every decision, handoff, and exception along the way — a path that can run without someone carrying the state in their head.",
  },
];

export default function AboutPage() {
  return (
    <SiteContainer>
      <PageIntro kicker="About" title="A systems company.">
        We study how work actually moves through a business. Then we design the
        software, automation, and connections around it.
      </PageIntro>
      <Rule />
      <ol>
        {PRINCIPLES.map((item) => (
          <li
            key={item.id}
            className="grid gap-3 border-b border-synas-ink/12 py-10 md:grid-cols-[5rem_14rem_minmax(0,32rem)] md:gap-12 md:py-14"
          >
            <p className="font-mono text-sm text-synas-ink/55">{item.id}</p>
            <h2 className="font-sans text-xl font-semibold tracking-tight md:text-[1.35rem]">
              {item.label}
            </h2>
            <p className="text-[1.02rem] leading-relaxed text-synas-ink/75">
              {item.text}
            </p>
          </li>
        ))}
      </ol>
      <Rule />
      <div className="py-14">
        <h2 className="font-mono text-[12px] uppercase tracking-[0.1em] text-synas-ink/55">
          Team
        </h2>
        <ul className="mt-6 flex flex-col gap-6 sm:flex-row sm:gap-16">
          {TEAM.map((person) => (
            <li key={person.name}>
              <p className="font-sans text-lg font-semibold tracking-tight">
                {person.name}
              </p>
              <p className="text-[0.95rem] text-synas-ink/65">{person.role}</p>
              <ExternalLink
                href={person.linkedin}
                className="mt-1 inline-flex min-h-11 items-center font-mono text-[12px] uppercase tracking-[0.1em]"
              >
                LinkedIn
              </ExternalLink>
            </li>
          ))}
        </ul>
      </div>
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
