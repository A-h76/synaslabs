import type { Metadata } from "next";
import { ExampleOrderFlow, FragmentedWork, ConnectedWork } from "@/components/site/diagrams";
import {
  CtaLink,
  SiteContainer,
  StoryRow,
} from "@/components/site/primitives";
import { homeMetadata } from "@/lib/seo";

export const metadata: Metadata = homeMetadata;

export default function HomePage() {
  return (
    <>
      <SiteContainer>
        <section className="grid gap-10 border-b border-synas-ink/12 py-14 lg:grid-cols-[minmax(0,1fr)_11rem] lg:gap-16 lg:py-24">
          <div>
            <p className="mb-8 font-mono text-[10px] uppercase tracking-[0.2em] text-synas-ink/60 lg:hidden">
              Systems / Automation / Software
            </p>
            <h1 className="max-w-[10ch] font-sans text-[clamp(3.1rem,12vw,7.2rem)] leading-[0.88] font-semibold tracking-tight text-synas-ink">
              Systems{" "}
              <span className="block">that move</span>
              <span className="block">businesses.</span>
            </h1>
            <p className="mt-10 max-w-xl text-[1.05rem] leading-relaxed text-synas-ink/75 md:text-[1.12rem]">
              We study how work actually moves — then design the software,
              automation, and connections around that path. Including the steps
              that should stay human.
            </p>
            <div className="mt-10 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-10">
              <CtaLink href="/brief">See your process as a system</CtaLink>
              <CtaLink href="/start" tone="quiet">
                Start a project
              </CtaLink>
            </div>
          </div>
          <p className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-synas-ink/60 lg:flex lg:flex-col lg:justify-end lg:gap-3 lg:text-right">
            <span>Systems</span>
            <span>Automation</span>
            <span>Software</span>
          </p>
        </section>
      </SiteContainer>

      <SiteContainer>
        <StoryRow index="01">
          <h2 className="font-sans text-[1.55rem] font-semibold tracking-tight md:text-[1.75rem]">
            Businesses run on workflows.
          </h2>
          <p className="mt-4 text-synas-ink/75">
            An order. A missed call. A lead. A job that has to be booked before
            the day starts. Work already has a path, even when nobody has drawn
            it.
          </p>
        </StoryRow>

        <StoryRow index="02" visual={<FragmentedWork />}>
          <h2 className="font-sans text-[1.55rem] font-semibold tracking-tight md:text-[1.75rem]">
            Those paths usually live in pieces.
          </h2>
          <p className="mt-4 text-synas-ink/75">
            Across people, WhatsApp, spreadsheets, email, CRMs, and whatever
            someone still remembers to do.
          </p>
        </StoryRow>

        <StoryRow index="03">
          <h2 className="font-sans text-[1.55rem] font-semibold tracking-tight md:text-[1.75rem]">
            The problem is not always lack of software.
          </h2>
          <p className="mt-4 text-synas-ink/75">
            The problem is lack of a connected system. Tools exist. The work
            still waits on a person to carry it from one of them to the next.
          </p>
        </StoryRow>

        <StoryRow index="04" visual={<ConnectedWork />}>
          <h2 className="font-sans text-[1.55rem] font-semibold tracking-tight md:text-[1.75rem]">
            Synas designs the system around how the business actually works.
          </h2>
          <p className="mt-4 text-synas-ink/75">
            We study the path from first request to done. Then we design the
            software, automation, and connections around it — including the
            steps that should stay human.
          </p>
        </StoryRow>

        <StoryRow index="05" visual={<ExampleOrderFlow />}>
          <h2 className="font-sans text-[1.55rem] font-semibold tracking-tight md:text-[1.75rem]">
            Here is a small example of that shift.
          </h2>
          <p className="mt-4 text-synas-ink/75">
            A typical order flow, written as a system. Not a client. Not a live
            integration. Just the work, made visible.
          </p>
          <div className="mt-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-synas-ink/60">
              Optional
            </p>
            <p className="mt-3 max-w-md font-serif text-[1.4rem] leading-snug tracking-tight italic">
              What would your workflow look like as a system?
            </p>
            <div className="mt-5">
              <CtaLink href="/brief">See your process as a system</CtaLink>
            </div>
          </div>
        </StoryRow>
      </SiteContainer>

      <section className="border-t border-synas-ink/12 bg-synas-ink text-synas-paper">
        <SiteContainer>
          <div className="grid gap-6 py-16 md:grid-cols-[6.5rem_minmax(0,40rem)] md:gap-12 md:py-20">
            <p className="font-mono text-sm tracking-[0.08em] text-synas-paper/55">06</p>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-synas-teal">
                System status · ready
              </p>
              <h2 className="mt-4 font-sans text-[1.75rem] font-semibold tracking-tight md:text-[2rem]">
                Synas can build the real system.
              </h2>
              <p className="mt-4 max-w-xl text-synas-paper/75">
                The public walkthrough is a working session, not a product you
                log into. If the picture is right, we design and build it
                properly.
              </p>
              <div className="mt-8">
                <CtaLink href="/start" tone="invert">
                  Start a project
                </CtaLink>
              </div>
            </div>
          </div>
        </SiteContainer>
      </section>
    </>
  );
}
