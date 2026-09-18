import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { PageIntro, SiteContainer } from "@/components/site/primitives";
import { publicMetadata } from "@/lib/seo";

const BriefSession = dynamic(
  () =>
    import("@/components/brief/brief-session").then((mod) => ({
      default: mod.BriefSession,
    })),
  {
    loading: () => (
      <p className="border-t border-synas-ink/12 py-16 font-mono text-[11px] uppercase tracking-[0.14em] text-synas-ink/55">
        Opening the working session…
      </p>
    ),
  },
);

export const metadata: Metadata = publicMetadata({
  title: "System brief",
  description:
    "Describe how work moves in your business. Synas Labs structures it, runs one fictional case, and writes a system brief. Optional. Not a live product.",
  path: "/brief",
});

export default function BriefPage() {
  return (
    <SiteContainer>
      <PageIntro kicker="System brief" title="What would this look like as a system?">
        Describe how work moves today. We structure it, run one fictional case,
        including the break, and write a short system brief. This is not a live
        integration. You do not need to know how to draw a workflow.
      </PageIntro>
      <BriefSession />
    </SiteContainer>
  );
}
