import type { RecordList } from "@/server/dal/lists";
import { MetaLabel, Rule } from "@/components/ui/meta";

export function RecordIndex({ list }: { list: RecordList }) {
  return (
    <section>
      <MetaLabel>{list.store === "connected" ? "Store connected" : "Store disconnected"}</MetaLabel>
      <h1 className="mt-4 font-sans text-3xl font-medium tracking-tight text-synas-ink sm:text-4xl">
        {list.title}
      </h1>
      <div className="mt-8">
        <Rule />
      </div>
      {list.records.length === 0 ? (
        <p className="mt-8 max-w-xl text-sm leading-relaxed text-synas-ink/70">
          {list.store === "disconnected"
            ? "No data store is connected. This surface is authorized; it will not invent records."
            : "No records yet."}
        </p>
      ) : (
        <ol className="mt-8 divide-y divide-synas-ink/12">
          {list.records.map((record) => (
            <li key={record.id} className="flex flex-wrap items-baseline justify-between gap-4 py-4">
              <span className="text-base text-synas-ink">{record.label}</span>
              <span className="font-mono text-[11px] text-synas-ink/55">
                {record.meta}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
