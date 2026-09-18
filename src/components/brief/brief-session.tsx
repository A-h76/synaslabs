"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { STARTERS } from "@/domain/workflow/starters";
import {
  buildPublicBrief,
  eventKind,
  understandingFor,
} from "@/domain/workflow/public-brief";
import type { WorkflowV1 } from "@/domain/workflow/schema";
import type { ClarifyQuestion } from "@/domain/workflow/questions";
import type { SimulationResult } from "@/domain/workflow/simulator";
import {
  interpretPublicProcess,
  simulatePublicWorkflow,
} from "@/server/actions/brief";
import { writeStoredBrief } from "@/lib/brief-storage";
import { CtaLink, MetaLabel, Rule } from "@/components/site/primitives";
import type { WorkflowActor } from "@/domain/lifecycle";

type Phase =
  | "describe"
  | "questions"
  | "confirm"
  | "case"
  | "run"
  | "brief"
  | "out_of_scope";

const PHASES: { id: Phase; n: string; label: string }[] = [
  { id: "describe", n: "01", label: "Describe" },
  { id: "questions", n: "02", label: "Clarify" },
  { id: "confirm", n: "03", label: "Confirm" },
  { id: "case", n: "04", label: "Sample" },
  { id: "run", n: "05", label: "Run" },
  { id: "brief", n: "06", label: "Brief" },
];

const KIND_LABEL: Record<string, string> = {
  input: "INPUT",
  process: "PROCESS",
  decision: "DECISION",
  human: "HUMAN",
  automated: "AUTOMATED",
  output: "OUTPUT",
  exception: "EXCEPTION",
  scope: "OUT OF SCOPE",
};

export const SAMPLE_DATA_WARNING =
  "Use sample or fictional data. Do not enter passwords, payment credentials, private customer information, or confidential business data.";

function actorLabel(actor: WorkflowActor): string {
  if (actor === "system") return "Automated";
  if (actor === "human") return "Human";
  return "Mixed";
}

export function BriefSession() {
  const [phase, setPhase] = useState<Phase>("describe");
  const [narrative, setNarrative] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questions, setQuestions] = useState<ClarifyQuestion[]>([]);
  const [workflow, setWorkflow] = useState<WorkflowV1 | null>(null);
  const [happy, setHappy] = useState<SimulationResult | null>(null);
  const [exception, setException] = useState<SimulationResult | null>(null);
  const [activeLog, setActiveLog] = useState<"happy" | "exception">("happy");
  const [revealed, setRevealed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const revealTimer = useRef<number>(0);

  useEffect(() => {
    return () => window.clearInterval(revealTimer.current);
  }, []);

  const log = activeLog === "exception" ? exception : happy;

  const publicBrief = useMemo(() => {
    if (!workflow || !exception) return null;
    return buildPublicBrief(workflow, exception, narrative, happy);
  }, [workflow, exception, happy, narrative]);

  function applyStarter(id: string) {
    const starter = STARTERS.find((item) => item.id === id);
    if (!starter) return;
    setNarrative(starter.narrative);
    setError(null);
  }

  function play(result: SimulationResult) {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.clearInterval(revealTimer.current);
    setRevealed(reduced ? result.events.length : 1);
    if (reduced || result.events.length <= 1) return;
    let count = 1;
    revealTimer.current = window.setInterval(() => {
      count += 1;
      setRevealed(count);
      if (count >= result.events.length) {
        window.clearInterval(revealTimer.current);
      }
    }, 380);
  }

  async function structure(nextAnswers: Record<string, string>) {
    setPending(true);
    setError(null);
    const result = await interpretPublicProcess({
      narrative,
      answers: nextAnswers,
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setWorkflow(result.workflow);
    setQuestions(result.questions);
    if (!result.workflow.inScope) {
      setPhase("out_of_scope");
      return;
    }
    const unanswered = result.questions.filter((question) => !nextAnswers[question.id]?.trim());
    if (unanswered.length > 0 && Object.keys(nextAnswers).length === 0) {
      setPhase("questions");
      return;
    }
    setPhase("confirm");
  }

  function goQuestions(event?: FormEvent) {
    event?.preventDefault();
    if (narrative.trim().length < 12) {
      setError("Write the process in your own words — even roughly.");
      return;
    }
    void structure({});
  }

  function goConfirm(event?: FormEvent) {
    event?.preventDefault();
    void structure(answers);
  }

  function goCase(event?: FormEvent) {
    event?.preventDefault();
    if (!workflow) return;
    setPhase("case");
  }

  async function goRun(event?: FormEvent) {
    event?.preventDefault();
    if (!workflow) return;
    setPending(true);
    setError(null);
    const result = await simulatePublicWorkflow({ workflow, path: "happy" });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setHappy(result.result);
    setException(null);
    setActiveLog("happy");
    setPhase("run");
    play(result.result);
  }

  async function triggerException() {
    if (!workflow) return;
    setPending(true);
    setError(null);
    const result = await simulatePublicWorkflow({ workflow, path: "exception" });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setException(result.result);
    setActiveLog("exception");
    play(result.result);
  }

  function goBrief() {
    if (!workflow || !exception) return;
    const brief = buildPublicBrief(workflow, exception, narrative, happy);
    writeStoredBrief(brief);
    setPhase("brief");
  }

  function updateStep(id: string, patch: Partial<WorkflowV1["steps"][number]>) {
    setWorkflow((current) => {
      if (!current) return current;
      return {
        ...current,
        steps: current.steps.map((step) =>
          step.id === id ? { ...step, ...patch } : step,
        ),
      };
    });
  }

  function updateFact(key: string, value: string) {
    setWorkflow((current) => {
      if (!current) return current;
      return {
        ...current,
        sampleCase: {
          ...current.sampleCase,
          fictional: true,
          facts: { ...current.sampleCase.facts, [key]: value },
        },
      };
    });
  }

  return (
    <section className="border-t border-synas-ink/12 pb-20">
      <ol className="flex flex-wrap gap-x-5 gap-y-2 py-6" aria-label="Session steps">
        {PHASES.map((item) => {
          const current =
            phase === item.id || (phase === "out_of_scope" && item.id === "confirm");
          return (
            <li
              key={item.id}
              className={`font-mono text-[10px] uppercase tracking-[0.14em] ${
                current ? "text-synas-ink" : "text-synas-ink/55"
              }`}
              aria-current={current ? "step" : undefined}
            >
              {item.n} {item.label}
            </li>
          );
        })}
      </ol>
      <Rule />

      {phase === "describe" ? (
        <form
          className="grid gap-12 py-12 lg:grid-cols-[minmax(0,38rem)_14rem] lg:gap-20"
          onSubmit={goQuestions}
        >
          <div>
            <h2 className="font-serif text-2xl font-normal tracking-tight md:text-3xl">
              Describe how the work moves.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-synas-ink/70">
              What arrives, who touches it, where it sits, what “done” looks like.
              Plain language. Lists and arrows are fine. You do not need to design
              a workflow.
            </p>
            <label className="mt-8 block">
              <span className="sr-only">Process description</span>
              <textarea
                className="site-field"
                value={narrative}
                onChange={(event) => setNarrative(event.target.value)}
                placeholder="Customers send orders on WhatsApp. Then someone…"
                minLength={12}
                required
              />
            </label>
            <p className="mt-4 text-xs leading-relaxed text-synas-ink/60">
              {SAMPLE_DATA_WARNING}
            </p>
            {error ? (
              <p className="mt-3 text-sm text-[#8a1f1f]" role="alert">
                {error}
              </p>
            ) : null}
            <div className="mt-6">
              <button type="submit" className="site-action" disabled={pending}>
                {pending ? "Reading this…" : "Continue →"}
              </button>
            </div>
          </div>
          <div>
            <MetaLabel>Optional starters</MetaLabel>
            <ul className="mt-4 flex flex-col gap-1">
              {STARTERS.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="min-h-11 text-left font-mono text-[11px] uppercase tracking-[0.1em] text-synas-ink/65 hover:text-synas-ink"
                    onClick={() => applyStarter(item.id)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs leading-relaxed text-synas-ink/60">
              Starters fill the description. They are not case studies.
            </p>
          </div>
        </form>
      ) : null}

      {phase === "questions" ? (
        <form className="max-w-xl py-12" onSubmit={goConfirm}>
          <h2 className="font-serif text-2xl font-normal tracking-tight md:text-3xl">
            A few things the path still hides.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-synas-ink/70">
            Answer only what you know. “Not sure” is a valid answer. These are
            not qualifying questions.
          </p>
          <div className="mt-10 flex flex-col gap-8">
            {questions.map((question) => (
              <label key={question.id}>
                <span className="text-[0.98rem] leading-relaxed">{question.prompt}</span>
                <input
                  className="site-field mt-3"
                  value={answers[question.id] ?? ""}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      [question.id]: event.target.value,
                    }))
                  }
                  placeholder="Not sure"
                />
              </label>
            ))}
          </div>
          {error ? (
            <p className="mt-4 text-sm text-[#8a1f1f]" role="alert">
              {error}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap items-center gap-8">
            <button
              type="button"
              className="site-action site-action-quiet"
              onClick={() => setPhase("describe")}
            >
              Back
            </button>
            <button type="submit" className="site-action" disabled={pending}>
              {pending ? "Reading this…" : "Read it back →"}
            </button>
          </div>
        </form>
      ) : null}

      {phase === "confirm" && workflow ? (
        <form className="py-12" onSubmit={goCase}>
          <h2 className="font-serif text-2xl font-normal tracking-tight md:text-3xl">
            Confirm the path.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-synas-ink/70">
            This is a structured reading of what you wrote — not a generated app,
            not a live integration. Correct the steps if we missed the work.
          </p>
          <ol className="mt-10 max-w-3xl">
            {workflow.steps.map((step, index) => (
              <li
                key={step.id}
                className="grid gap-3 border-t border-synas-ink/12 py-5 md:grid-cols-[3rem_1fr_9rem]"
              >
                <span className="font-mono text-[11px] text-synas-ink/55">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <label>
                    <span className="sr-only">Step title</span>
                    <input
                      className="site-field py-1"
                      value={step.title}
                      onChange={(event) =>
                        updateStep(step.id, { title: event.target.value })
                      }
                    />
                  </label>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-synas-ink/50">
                    {step.code ?? "STEP"}
                    {step.systemName ? ` · ${step.systemName}` : ""}
                    {step.systemStatus && step.systemStatus !== "known"
                      ? ` · ${step.systemStatus}`
                      : ""}
                  </p>
                </div>
                <label>
                  <span className="sr-only">Actor</span>
                  <select
                    className="site-field py-1"
                    value={step.actor}
                    onChange={(event) =>
                      updateStep(step.id, {
                        actor: event.target.value as WorkflowActor,
                      })
                    }
                  >
                    <option value="system">Automated</option>
                    <option value="human">Human</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </label>
              </li>
            ))}
          </ol>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-synas-ink/65">
            Exception: {workflow.exception.title}. {workflow.exception.humanOwner}{" "}
            handles it.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-8">
            <button
              type="button"
              className="site-action site-action-quiet"
              onClick={() => setPhase(questions.length ? "questions" : "describe")}
            >
              Back
            </button>
            <button type="submit" className="site-action">
              Use a sample case →
            </button>
          </div>
        </form>
      ) : null}

      {phase === "case" && workflow ? (
        <form className="max-w-xl py-12" onSubmit={goRun}>
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="font-serif text-2xl font-normal tracking-tight md:text-3xl">
              One fictional record.
            </h2>
            <MetaLabel>Fictional</MetaLabel>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-synas-ink/70">
            The structure is yours. The people and details are invented so we can
            run a case without using anyone’s real data.
          </p>
          <p className="mt-4 text-xs leading-relaxed text-synas-ink/60">
            {SAMPLE_DATA_WARNING}
          </p>
          <label className="mt-8 block">
            <MetaLabel>Case title</MetaLabel>
            <input
              className="site-field mt-2"
              value={workflow.sampleCase.title}
              onChange={(event) =>
                setWorkflow({
                  ...workflow,
                  sampleCase: {
                    ...workflow.sampleCase,
                    fictional: true,
                    title: event.target.value,
                  },
                })
              }
            />
          </label>
          <div className="mt-8 flex flex-col gap-6">
            {Object.entries(workflow.sampleCase.facts).map(([key, value]) => (
              <label key={key}>
                <MetaLabel>{key}</MetaLabel>
                <input
                  className="site-field mt-2"
                  value={value}
                  onChange={(event) => updateFact(key, event.target.value)}
                  autoComplete="off"
                />
              </label>
            ))}
          </div>
          {error ? (
            <p className="mt-4 text-sm text-[#8a1f1f]" role="alert">
              {error}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap items-center gap-8">
            <button
              type="button"
              className="site-action site-action-quiet"
              onClick={() => setPhase("confirm")}
            >
              Back
            </button>
            <button type="submit" className="site-action" disabled={pending}>
              {pending ? "Running…" : "Run this case →"}
            </button>
          </div>
        </form>
      ) : null}

      {phase === "run" && log ? (
        <div className="py-12">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-serif text-2xl font-normal tracking-tight md:text-3xl">
              {activeLog === "exception" ? "When it breaks." : "The case, in order."}
            </h2>
            <MetaLabel>Simulation · no live system</MetaLabel>
          </div>
          <ol className="mt-10 max-w-3xl" aria-live="polite" aria-atomic="false">
            {log.events.slice(0, revealed).map((event) => (
              <li
                key={`${log.path}-${event.seq}`}
                className="grid grid-cols-[7.25rem_minmax(0,1fr)] items-baseline gap-3 border-t border-synas-ink/12 py-3 sm:grid-cols-[9.5rem_1fr] sm:gap-4"
              >
                <span className="font-mono text-[10px] tracking-[0.12em] text-synas-ink/60">
                  {event.code || KIND_LABEL[eventKind(event)]}
                </span>
                <span className="text-sm leading-relaxed sm:text-[0.95rem]">
                  {event.message}
                  <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-synas-ink/50">
                    {event.performer}
                    {" · "}
                    {event.automated ? "Automated" : "Human"}
                    {" · "}
                    {event.why}
                  </span>
                </span>
              </li>
            ))}
          </ol>
          {revealed < log.events.length ? (
            <button
              type="button"
              className="site-action site-action-quiet mt-6"
              onClick={() => {
                window.clearInterval(revealTimer.current);
                setRevealed(log.events.length);
              }}
            >
              Show all
            </button>
          ) : null}

          {revealed >= log.events.length && activeLog === "happy" && !exception ? (
            <div className="mt-10 max-w-xl">
              <p className="text-sm leading-relaxed text-synas-ink/70">
                That was the clean path. The useful part is the break:{" "}
                {workflow?.exception.title}.
              </p>
              <button
                type="button"
                className="site-action mt-6"
                onClick={() => void triggerException()}
                disabled={pending}
              >
                {pending ? "Running…" : "Trigger the exception →"}
              </button>
            </div>
          ) : null}

          {revealed >= log.events.length && exception && activeLog === "exception" && workflow ? (
            <div className="mt-10 max-w-xl">
              <h3 className="font-serif text-xl font-normal tracking-tight">
                What this is showing.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-synas-ink/75">
                {understandingFor(workflow)}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-synas-ink/70">
                Automated:{" "}
                {workflow.steps
                  .filter((step) => step.actor === "system")
                  .map((step) => step.title)
                  .join(" · ") || "none named"}
                . Human:{" "}
                {workflow.steps
                  .filter((step) => step.actor !== "system")
                  .map((step) => `${step.title} (${actorLabel(step.actor)})`)
                  .join(" · ") || "none named"}
                .
              </p>
              <button type="button" className="site-action mt-8" onClick={goBrief}>
                Write the system brief →
              </button>
            </div>
          ) : null}
          {error ? (
            <p className="mt-4 text-sm text-[#8a1f1f]" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}

      {phase === "brief" && publicBrief ? (
        <article className="py-12">
          <MetaLabel>System brief</MetaLabel>
          <h2 className="mt-4 max-w-[18ch] font-serif text-3xl font-normal tracking-tight md:text-4xl">
            {publicBrief.draft.title}
          </h2>
          <dl className="mt-12 max-w-2xl">
            <BriefBlock label="Process" value={publicBrief.processName} />
            <BriefBlock label="Business context" value={publicBrief.businessContext} />
            <BriefBlock
              label="Inputs"
              value={
                publicBrief.inputs.length
                  ? publicBrief.inputs.join(" · ")
                  : "Described in the process above."
              }
            />
            <BriefBlock label="Workflow" value={publicBrief.workflowText} />
            <BriefBlock
              label="Automated steps"
              value={publicBrief.automatedSteps.join(" · ") || "None named yet."}
            />
            <BriefBlock
              label="Human steps"
              value={publicBrief.humanSteps.join(" · ") || "None named yet."}
            />
            <BriefBlock label="Exceptions" value={publicBrief.exceptions} />
            <BriefBlock
              label="Required connections"
              value={
                publicBrief.requiredConnections.join(" · ") ||
                "To be named in the conversation."
              }
            />
            <BriefBlock
              label="Open questions"
              value={publicBrief.openQuestions.join(" ") || "Ready to discuss."}
            />
            <BriefBlock label="Simulation summary" value={publicBrief.simulationSummary} />
          </dl>
          <div className="mt-14 max-w-xl">
            <h3 className="font-serif text-2xl font-normal tracking-tight">
              Want to build the real system?
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-synas-ink/70">
              This brief comes with you. You will not have to describe the path
              again.
            </p>
            <div className="mt-6">
              <CtaLink href="/start">Start a project</CtaLink>
            </div>
          </div>
        </article>
      ) : null}

      {phase === "out_of_scope" ? (
        <div className="max-w-xl py-12">
          <h2 className="font-serif text-2xl font-normal tracking-tight md:text-3xl">
            This should not be simulated.
          </h2>
          <p className="mt-4 text-[1.02rem] leading-relaxed text-synas-ink/75">
            {workflow?.outOfScopeReason} We will not invent a run. If there is a
            real process here, describe it in a little more order — or start a
            project and we will do that together.
          </p>
          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:gap-8">
            <button
              type="button"
              className="site-action"
              onClick={() => setPhase("describe")}
            >
              Describe it again
            </button>
            <Link href="/start" className="inline-flex min-h-11 items-center text-synas-ink/70">
              Start a project →
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function BriefBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2 border-t border-synas-ink/12 py-5 md:grid-cols-[11rem_1fr]">
      <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-synas-ink/60">
        {label}
      </dt>
      <dd className="text-[0.98rem] leading-relaxed">{value}</dd>
    </div>
  );
}
