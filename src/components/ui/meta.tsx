export function MetaLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-synas-ink/55">
      {children}
    </p>
  );
}

export function Rule() {
  return <hr className="border-0 border-t border-synas-ink/12" />;
}
