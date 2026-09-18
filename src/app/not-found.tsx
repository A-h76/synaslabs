import type { Metadata } from "next";
import Link from "next/link";
import { SiteContainer } from "@/components/site/primitives";
import { Wordmark } from "@/components/site/wordmark";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This address does not match a public Synas Labs page.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-synas-paper text-synas-ink">
      <SiteContainer className="py-16">
        <Wordmark />
        <h1 className="mt-20 max-w-[10ch] font-serif text-5xl font-normal tracking-tight">
          This page is not here.
        </h1>
        <p className="mt-6 max-w-md text-synas-ink/70">
          The address does not match a public page.
        </p>
        <p className="mt-10">
          <Link href="/" className="site-action">
            Back to Synas →
          </Link>
        </p>
      </SiteContainer>
    </div>
  );
}
