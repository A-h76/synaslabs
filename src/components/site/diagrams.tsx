import { MetaLabel } from "@/components/site/primitives";

const FRAGMENTS = ["People", "WhatsApp", "Spreadsheets", "Email", "A CRM", "Memory"];

export function FragmentedWork() {
  return (
    <div className="mt-8">
      <MetaLabel>How work often sits</MetaLabel>
      <ul className="mt-4 grid grid-cols-2 gap-x-8 gap-y-0">
        {FRAGMENTS.map((item) => (
          <li
            key={item}
            className="border-t border-synas-ink/25 py-3 font-mono text-[11px] uppercase tracking-[0.1em] text-synas-ink/70"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

const CONNECTED = [
  { label: "Capture", note: "The request is recorded" },
  { label: "Decide", note: "Rules, then people" },
  { label: "Act", note: "The next step happens" },
  { label: "Remember", note: "State lives in one place" },
];

export function ConnectedWork() {
  return (
    <div className="mt-8">
      <MetaLabel>A connected system</MetaLabel>
      <ol className="relative mt-5 grid gap-8 sm:grid-cols-4 sm:gap-0">
        <span
          className="absolute top-1 bottom-1 left-[0.18rem] w-px bg-synas-teal sm:hidden"
          aria-hidden="true"
        />
        <span
          className="absolute top-[0.85rem] right-0 left-0 hidden h-px bg-synas-teal sm:block"
          aria-hidden="true"
        />
        {CONNECTED.map((item, index) => (
          <li key={item.label} className="relative pl-5 sm:pl-0 sm:pr-6">
            <span
              className="relative z-10 mb-3 block h-1.5 w-1.5 bg-synas-ink"
              aria-hidden="true"
            />
            <p className="font-mono text-[11px] uppercase tracking-[0.12em]">
              {String(index + 1).padStart(2, "0")} {item.label}
            </p>
            <p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-synas-ink/70">
              {item.note}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

const EXAMPLE_STEPS = [
  { kind: "INPUT", text: "WhatsApp order message" },
  { kind: "PROCESS", text: "Read items and amount" },
  { kind: "DECISION", text: "Is payment verified?" },
  { kind: "HUMAN", text: "Collect a missing address" },
  { kind: "AUTOMATED", text: "Create the order record" },
  { kind: "OUTPUT", text: "Hand to shipping" },
];

export function ExampleOrderFlow() {
  return (
    <figure className="mt-8 max-w-xl">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <MetaLabel>Example · not a client</MetaLabel>
        <MetaLabel>Simulation</MetaLabel>
      </div>
      <ol className="mt-4">
        {EXAMPLE_STEPS.map((step) => (
          <li
            key={step.kind}
            className="grid grid-cols-[6.75rem_minmax(0,1fr)] items-baseline gap-3 border-t border-synas-ink/12 py-3 sm:grid-cols-[7.5rem_1fr] sm:gap-4"
          >
            <span className="font-mono text-[10px] tracking-[0.14em] text-synas-ink/60">
              {step.kind}
            </span>
            <span className="text-sm sm:text-[0.95rem]">{step.text}</span>
          </li>
        ))}
        <li className="grid grid-cols-[6.75rem_minmax(0,1fr)] items-baseline gap-3 border-t border-synas-ink py-3 sm:grid-cols-[7.5rem_1fr] sm:gap-4">
          <span className="font-mono text-[10px] tracking-[0.14em] text-synas-ink">
            EXCEPTION
          </span>
          <span className="text-sm sm:text-[0.95rem]">
            Payment does not match → a person reviews, asks for new proof, then
            the flow continues.
          </span>
        </li>
      </ol>
    </figure>
  );
}

const CAPABILITIES = [
  { id: "01", name: "AI automation", role: "Moves work that should not wait on memory." },
  { id: "02", name: "CRM systems", role: "Holds people, state, and next actions." },
  { id: "03", name: "Business software", role: "Fits the job, not a generic template." },
  { id: "04", name: "Integrations", role: "Connects the tools you already have." },
  { id: "05", name: "Workflow systems", role: "Makes the path from request to done explicit." },
];

export function CapabilitySpine() {
  return (
    <ol className="mt-4">
      {CAPABILITIES.map((item) => (
        <li
          key={item.id}
          className="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-4 gap-y-2 border-t border-synas-ink/12 py-6 md:grid-cols-[3rem_16rem_minmax(0,1fr)] md:gap-10"
        >
          <span className="font-mono text-[11px] text-synas-ink/55">{item.id}</span>
          <p className="font-sans text-xl font-semibold tracking-tight md:text-[1.35rem]">
            {item.name}
          </p>
          <p className="col-span-2 text-sm leading-relaxed text-synas-ink/70 md:col-span-1 md:text-[0.98rem]">
            {item.role}
          </p>
        </li>
      ))}
    </ol>
  );
}

const PATH = [
  { stage: "Capture", sits: "Integrations, workflow" },
  { stage: "Record", sits: "CRM, business software" },
  { stage: "Decide", sits: "Workflow, human review" },
  { stage: "Act", sits: "AI automation, software" },
  { stage: "Remember", sits: "CRM, the same workflow" },
];

export function CapabilityPath() {
  return (
    <figure className="mt-4">
      <MetaLabel>Where each part sits on the path</MetaLabel>
      <ol className="mt-5 grid grid-cols-1 border-t border-synas-ink/20 sm:grid-cols-5">
        {PATH.map((item, index) => (
          <li
            key={item.stage}
            className="border-b border-synas-ink/12 py-5 sm:border-b-0 sm:border-r sm:border-synas-ink/12 sm:px-4 sm:py-6 sm:first:pl-0 sm:last:border-r-0 sm:last:pr-0"
          >
            <p className="font-mono text-[11px] text-synas-ink/55">
              {String(index + 1).padStart(2, "0")}
            </p>
            <p className="mt-3 font-sans text-xl font-semibold tracking-tight">{item.stage}</p>
            <p className="mt-2 text-sm leading-relaxed text-synas-ink/70">
              {item.sits}
            </p>
          </li>
        ))}
      </ol>
    </figure>
  );
}
