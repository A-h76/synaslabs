import type { Metadata } from "next";
import { PageIntro, SiteContainer } from "@/components/site/primitives";
import { publicMetadata } from "@/lib/seo";
import { IntakeForm } from "@/components/start/intake-form";

export const metadata: Metadata = publicMetadata({
  title: "Start a project",
  description:
    "Start a project with Synas Labs. Describe the business, the current process, and what should change. Attach a system brief if you have one.",
  path: "/start",
});

export default function StartPage() {
  return (
    <SiteContainer>
      <PageIntro kicker="Start" title="Tell us how the work moves.">
        This is a discovery note, not a qualifying quiz. If you already walked
        through a workflow on this site, we will keep that brief attached.
      </PageIntro>
      <IntakeForm />
    </SiteContainer>
  );
}
