import Link from "next/link";

export function SiteContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[92rem] px-5 sm:px-10 lg:px-16 ${className}`}>
      {children}
    </div>
  );
}

export function Rule({ className = "" }: { className?: string }) {
  return <hr className={`border-0 border-t border-synas-ink/12 ${className}`} />;
}

export function MetaLabel({
  as: Tag = "p",
  children,
}: {
  as?: "p" | "span" | "h2";
  children: React.ReactNode;
}) {
  return (
    <Tag className="font-mono text-[10px] uppercase tracking-[0.18em] text-synas-ink/60">
      {children}
    </Tag>
  );
}

export function CtaLink({
  href,
  children,
  tone = "primary",
}: {
  href: string;
  children: React.ReactNode;
  tone?: "primary" | "quiet";
}) {
  const color =
    tone === "primary"
      ? "border-synas-ink text-synas-ink"
      : "border-synas-ink/30 text-synas-ink/80 hover:text-synas-ink hover:border-synas-ink";
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-baseline gap-3 border-b pb-1 text-[0.95rem] transition-colors ${color}`}
    >
      <span>{children}</span>
      <span aria-hidden="true">→</span>
    </Link>
  );
}

export function ExternalLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={className}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </a>
  );
}

export function PageIntro({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="pt-12 pb-10 md:pt-24 md:pb-20">
      <MetaLabel>{kicker}</MetaLabel>
      <h1 className="mt-5 max-w-[16ch] font-serif text-[clamp(2.4rem,7vw,5rem)] leading-[0.96] font-normal tracking-tight text-synas-ink">
        {title}
      </h1>
      {children ? (
        <div className="mt-8 max-w-xl text-[1.02rem] leading-relaxed text-synas-ink/75">
          {children}
        </div>
      ) : null}
    </header>
  );
}

export function StoryRow({
  index,
  children,
}: {
  index: string;
  children: React.ReactNode;
}) {
  return (
    <article className="grid gap-3 border-t border-synas-ink/12 py-10 md:grid-cols-[5.5rem_minmax(0,40rem)] md:gap-12 md:py-16 lg:grid-cols-[6.5rem_minmax(0,40rem)_1fr]">
      <p className="font-mono text-sm tracking-[0.08em] text-synas-ink/55">
        {index}
      </p>
      <div className="max-w-xl text-[1.05rem] leading-relaxed text-synas-ink md:text-[1.12rem]">
        {children}
      </div>
    </article>
  );
}
