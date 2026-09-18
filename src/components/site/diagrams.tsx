import { MetaLabel } from "@/components/site/primitives";
import { LEAD_STATUSES, OPPORTUNITY_STAGES } from "@/domain/lifecycle";

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
  {
    id: "01",
    name: "AI automation",
    role: "Moves work that should not wait on memory.",
    flow: ["Input", "Understand", "Decide", "Act", "Escalate"],
  },
  {
    id: "02",
    name: "CRM systems",
    role: "Holds people, state, and next actions.",
    flow: ["Capture", "Qualify", "Pipeline", "Follow-up", "Convert"],
  },
  {
    id: "03",
    name: "Business software",
    role: "Fits the job, not a generic template.",
    flow: ["Data", "Rules", "Operations", "Interface", "Decision"],
  },
  {
    id: "04",
    name: "Integrations",
    role: "Connects the tools you already have.",
    flow: ["System A", "Connector", "Transform", "System B"],
  },
  {
    id: "05",
    name: "Workflow systems",
    role: "Makes the path from request to done explicit.",
    flow: ["Input", "Process", "Decision", "Human", "Output"],
  },
];

export function CapabilitySpine() {
  return (
    <ol className="mt-4">
      {CAPABILITIES.map((item) => (
        <li
          key={item.id}
          className="grid gap-y-4 border-t border-synas-ink/12 py-6 md:grid-cols-[3rem_16rem_minmax(0,1fr)] md:gap-x-10"
        >
          <span className="font-mono text-[11px] text-synas-ink/55">{item.id}</span>
          <p className="font-sans text-xl font-semibold tracking-tight md:text-[1.35rem]">
            {item.name}
          </p>
          <div className="md:col-start-3">
            <p className="text-sm leading-relaxed text-synas-ink/70 md:text-[0.98rem]">
              {item.role}
            </p>
            <ol className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1.5">
              {item.flow.map((step, index) => (
                <li key={step} className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-synas-ink/55">
                    {step}
                  </span>
                  {index < item.flow.length - 1 ? (
                    <span className="text-synas-ink/30" aria-hidden="true">
                      →
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
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

export function StatusIndicator({
  tone = "active",
  children,
}: {
  tone?: "active" | "human" | "neutral";
  children: React.ReactNode;
}) {
  const dot =
    tone === "active" ? "bg-synas-teal" : tone === "human" ? "bg-current" : "bg-current opacity-30";
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] opacity-70">
      <span className={`h-1.5 w-1.5 ${dot}`} aria-hidden="true" />
      {children}
    </span>
  );
}

export function SystemPanel({
  title,
  status,
  tone = "light",
  children,
}: {
  title: string;
  status?: React.ReactNode;
  tone?: "light" | "dark";
  children: React.ReactNode;
}) {
  const dark = tone === "dark";
  return (
    <div
      className={`border ${dark ? "border-synas-paper/15 bg-synas-ink text-synas-paper" : "border-synas-ink/15 bg-synas-paper text-synas-ink"}`}
    >
      <div
        className={`flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-6 ${dark ? "border-synas-paper/15" : "border-synas-ink/12"}`}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] opacity-70">{title}</p>
        {status}
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}

const HERO_STAGES = [
  { code: "01", label: "Customer inquiry", kind: "Input" },
  { code: "02", label: "AI classification", kind: "Automated" },
  { code: "03", label: "CRM record", kind: "Automated" },
  { code: "04", label: "Follow-up", kind: "Human" },
  { code: "05", label: "Operation", kind: "Outcome" },
];

export function HeroSystem() {
  return (
    <div className="w-full lg:ml-auto lg:max-w-[19rem]">
      <div className="flex items-baseline justify-between gap-3">
        <MetaLabel>Conceptual system</MetaLabel>
        <StatusIndicator tone="active">Active path</StatusIndicator>
      </div>
      <div className="relative mt-6 pl-6">
        <span className="absolute top-0 bottom-0 left-0 w-px bg-synas-ink/15" aria-hidden="true" />
        <span
          className="absolute left-0 h-1.5 w-1.5 -translate-x-1/2 bg-synas-teal motion-safe:animate-[synas-flow-y_4.5s_ease-in-out_infinite]"
          aria-hidden="true"
        />
        <ol>
          {HERO_STAGES.map((stage, index) => {
            const last = index === HERO_STAGES.length - 1;
            return (
              <li key={stage.code} className="relative pb-6 last:pb-0">
                <span
                  className={`absolute top-1 -left-[1.65rem] h-2 w-2 ${
                    last ? "bg-synas-teal" : "bg-synas-ink"
                  }`}
                  aria-hidden="true"
                />
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-synas-ink/50">
                  {stage.code} · {stage.kind}
                </p>
                <p className="mt-1 text-[0.98rem] font-medium text-synas-ink">{stage.label}</p>
              </li>
            );
          })}
        </ol>
      </div>
      <p className="mt-1 max-w-[18rem] text-xs leading-relaxed text-synas-ink/55">
        Illustrative composition. Not a live integration.
      </p>
    </div>
  );
}

function StageTrack({
  label,
  values,
  activeValue,
}: {
  label: string;
  values: readonly string[];
  activeValue: string;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[7rem_minmax(0,1fr)] sm:items-baseline sm:gap-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-synas-ink/55">
        {label}
      </p>
      <ol className="flex flex-wrap gap-x-2 gap-y-2">
        {values.map((value) => {
          const active = value === activeValue;
          return (
            <li
              key={value}
              className={`border px-2.5 py-1 font-mono text-[10px] tracking-[0.06em] uppercase ${
                active
                  ? "border-synas-teal bg-synas-teal text-synas-ink"
                  : "border-synas-ink/15 text-synas-ink/50"
              }`}
            >
              {value.replace(/_/g, " ")}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function LeadRadarPreview() {
  return (
    <SystemPanel
      title="Lead Radar · pipeline structure"
      status={<StatusIndicator tone="active">Internal product</StatusIndicator>}
    >
      <div className="flex flex-col gap-5">
        <StageTrack label="Signal" values={["new", "promoted"]} activeValue="promoted" />
        <StageTrack label="Lead" values={LEAD_STATUSES} activeValue="qualified" />
        <StageTrack label="Opportunity" values={OPPORTUNITY_STAGES} activeValue="discovery" />
      </div>
      <p className="mt-6 max-w-lg text-xs leading-relaxed text-synas-ink/55">
        Actual status values from the Lead Radar data model. No client records
        are shown.
      </p>
    </SystemPanel>
  );
}

const BRIEF_STAGES = [
  { code: "01", label: "User description", tone: "light" as const },
  { code: "02", label: "Structured workflow", tone: "light" as const },
  { code: "03", label: "Simulation", tone: "dark" as const },
  { code: "04", label: "System brief", tone: "light" as const },
];

export function BriefFlow() {
  return (
    <figure className="mt-10 max-w-sm">
      <MetaLabel>How the session works</MetaLabel>
      <ol className="relative mt-5 border-l border-synas-ink/15 pl-6">
        {BRIEF_STAGES.map((stage) => (
          <li key={stage.code} className="relative pb-5 last:pb-0">
            <span
              className={`absolute top-3 -left-[1.65rem] h-2 w-2 ${
                stage.tone === "dark" ? "bg-synas-ink" : "bg-synas-teal"
              }`}
              aria-hidden="true"
            />
            <div
              className={`border px-4 py-3 ${
                stage.tone === "dark"
                  ? "border-synas-ink bg-synas-ink text-synas-paper"
                  : "border-synas-ink/15"
              }`}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] opacity-60">
                {stage.code}
              </p>
              <p className="mt-1 text-[0.95rem] font-medium">{stage.label}</p>
            </div>
          </li>
        ))}
      </ol>
    </figure>
  );
}

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
