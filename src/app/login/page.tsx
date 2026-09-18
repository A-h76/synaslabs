import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LoginForm } from "@/components/os/login-form";
import { isAuthConfigured } from "@/lib/env";
import { SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: `Sign in — ${SITE_NAME}` },
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (!isAuthConfigured()) notFound();
  const params = await searchParams;
  const next = params.next?.startsWith("/") ? params.next : "/admin";

  return (
    <main className="os-root flex min-h-dvh flex-col justify-center px-6 py-16 sm:px-10">
      <div className="mx-auto w-full max-w-lg">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-synas-ink/55">
          Team / client access
        </p>
        <h1 className="mt-4 font-serif text-4xl font-normal tracking-tight text-synas-ink">
          Sign in to Synas.
        </h1>
        <p className="mt-6 text-sm leading-relaxed text-synas-ink/70">
          Sessions are signed on the server. There is no public self-registration.
        </p>
        <LoginForm next={next} />
      </div>
    </main>
  );
}
