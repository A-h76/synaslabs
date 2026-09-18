import Link from "next/link";

export function OsHeader({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-synas-ink/55">
        {kicker}
      </p>
      <h1 className="mt-3 font-serif text-3xl font-normal tracking-tight md:text-4xl">
        {title}
      </h1>
      {children ? (
        <div className="mt-3 max-w-2xl text-sm leading-relaxed text-synas-ink/70">
          {children}
        </div>
      ) : null}
    </header>
  );
}

export function OsEmpty({ children }: { children: React.ReactNode }) {
  return (
    <p className="max-w-xl border border-synas-ink/15 px-5 py-8 text-sm leading-relaxed text-synas-ink/70">
      {children}
    </p>
  );
}

export function OsMeta({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-synas-ink/55">
      {children}
    </span>
  );
}

export function OsTable({
  columns,
  rows,
  empty,
}: {
  columns: string[];
  rows: { href?: string; cells: React.ReactNode[] }[];
  empty: React.ReactNode;
}) {
  if (rows.length === 0) {
    return <OsEmpty>{empty}</OsEmpty>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] border-collapse text-left">
        <thead>
          <tr className="border-b border-synas-ink/20">
            {columns.map((column) => (
              <th
                key={column}
                className="py-3 pr-4 font-mono text-[10px] font-normal uppercase tracking-[0.14em] text-synas-ink/55"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-synas-ink/10">
              {row.cells.map((cell, cellIndex) => (
                <td key={cellIndex} className="py-3 pr-4 align-baseline text-sm">
                  {cellIndex === 0 && row.href ? (
                    <Link href={row.href} className="border-b border-synas-ink/20">
                      {cell}
                    </Link>
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function OsField({
  name,
  label,
  defaultValue = "",
  textarea = false,
  type = "text",
  required = false,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  textarea?: boolean;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-synas-ink/55">
        {label}
      </span>
      {textarea ? (
        <textarea
          name={name}
          className="site-field mt-2"
          defaultValue={defaultValue}
          required={required}
        />
      ) : (
        <input
          name={name}
          type={type}
          className="site-field mt-2"
          defaultValue={defaultValue}
          required={required}
        />
      )}
    </label>
  );
}

export function OsSelect({
  name,
  label,
  options,
  defaultValue = "",
  required = false,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-synas-ink/55">
        {label}
      </span>
      <select
        name={name}
        className="site-field mt-2"
        defaultValue={defaultValue}
        required={required}
      >
        {options.map((option) => (
          <option key={`${name}-${option.value || "empty"}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

