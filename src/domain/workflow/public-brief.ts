import { z } from "zod";
import { deriveSystemBrief, type SystemBriefDraft } from "./brief";
import { workflowV1Schema, type WorkflowV1 } from "./schema";
import type { SimulationEvent, SimulationResult } from "./simulator";

export type EventKind =
  | "input"
  | "process"
  | "decision"
  | "human"
  | "automated"
  | "output"
  | "exception"
  | "scope";

export function eventKind(event: SimulationEvent): EventKind {
  switch (event.type) {
    case "out_of_scope":
      return "scope";
    case "case.started":
      return "input";
    case "exception.raised":
    case "exception.handed_to_human":
    case "exception.resolved":
      return "exception";
    case "case.completed":
      return "output";
    case "step.completed":
      if (event.code === "CONTINUE") return "process";
      return "output";
    case "step.started":
      if (event.actor === "human") return "human";
      if (event.actor === "mixed") return "decision";
      if (event.automated) return "automated";
      return "process";
    default:
      return "process";
  }
}

export function openQuestionsFor(workflow: WorkflowV1): string[] {
  if (!workflow.inScope) {
    return ["What actually happens, in order, from the first request to done?"];
  }
  const questions = [...(workflow.openQuestions ?? [])];
  for (const step of workflow.steps) {
    if (step.actor === "mixed") {
      questions.push(`Which parts of “${step.title}” should stay human?`);
    }
    if (step.systemStatus === "UNKNOWN" || step.systemName === "UNKNOWN") {
      questions.push(`What should be the system of record for “${step.title}”?`);
    }
  }
  if (workflow.exception && !workflow.exception.systemCanResolve) {
    questions.push(`Who owns “${workflow.exception.title}” when it happens?`);
  }
  const knownSystems = (workflow.systems ?? []).filter((item) => item.status === "known");
  if (knownSystems.length < 2) {
    questions.push("Which tools should this connect to first?");
  }
  return [...new Set(questions)].slice(0, 6);
}

export function simulationSummaryFor(
  workflow: WorkflowV1,
  happy: SimulationResult | null,
  exception: SimulationResult | null,
): string {
  const happyCodes = happy?.events.map((event) => event.code).join(" → ");
  const exceptionEvent = exception?.events.find((event) => event.type === "exception.raised");
  const parts = [
    happyCodes ? `Happy path: ${happyCodes}.` : null,
    exceptionEvent
      ? `Exception: ${exceptionEvent.code} — ${workflow.exception.title}. ${workflow.exception.humanOwner} reviews, then the path continues.`
      : null,
    "Nothing here executed against a live tool.",
  ];
  return parts.filter(Boolean).join(" ");
}

export function understandingFor(workflow: WorkflowV1): string {
  if (!workflow.inScope) {
    return "This should not be simulated. The next step is a conversation about how the work actually moves.";
  }
  const automated = workflow.steps.filter((step) => step.actor === "system").length;
  const human = workflow.steps.filter((step) => step.actor !== "system").length;
  return [
    `This path has ${automated} automated step${automated === 1 ? "" : "s"} and ${human} human checkpoint${human === 1 ? "" : "s"}.`,
    `When “${workflow.exception.title}” happens, ${workflow.exception.humanOwner} decides.`,
    workflow.exception.systemCanDetect
      ? "The system can notice the break. It should not close it alone."
      : "A person still has to notice the break.",
  ].join(" ");
}

export type PublicBrief = {
  narrative: string;
  workflow: WorkflowV1;
  draft: SystemBriefDraft;
  businessContext: string;
  processName: string;
  inputs: string[];
  workflowText: string;
  automatedSteps: string[];
  humanSteps: string[];
  exceptions: string;
  requiredConnections: string[];
  openQuestions: string[];
  simulationSummary: string;
  understanding: string;
  events: Array<{
    code: string;
    type: string;
    message: string;
    performer: string;
    automated: boolean;
    why: string;
  }>;
};

export const publicBriefSchema = z.object({
  narrative: z.string().max(8000),
  workflow: workflowV1Schema,
  draft: z.object({
    title: z.string(),
    processName: z.string(),
    inScope: z.boolean(),
    currentPain: z.string(),
    automatedSteps: z.array(z.string()),
    humanSteps: z.array(z.string()),
    mixedSteps: z.array(z.string()),
    systems: z.array(z.string()),
    exception: z
      .object({
        title: z.string(),
        humanOwner: z.string(),
        systemCanDetect: z.boolean(),
        systemCanResolve: z.boolean(),
      })
      .nullable(),
    sampleCaseTitle: z.string(),
    recommendedConversation: z.string(),
    eventCount: z.number(),
  }),
  businessContext: z.string().max(4000),
  processName: z.string().max(120),
  inputs: z.array(z.string()).max(12),
  workflowText: z.string().max(2000),
  automatedSteps: z.array(z.string()).max(12),
  humanSteps: z.array(z.string()).max(12),
  exceptions: z.string().max(800),
  requiredConnections: z.array(z.string()).max(12),
  openQuestions: z.array(z.string()).max(8),
  simulationSummary: z.string().max(2000),
  understanding: z.string().max(2000),
  events: z
    .array(
      z.object({
        code: z.string(),
        type: z.string(),
        message: z.string(),
        performer: z.string(),
        automated: z.boolean(),
        why: z.string(),
      }),
    )
    .max(80),
});

function compactEvents(result: SimulationResult | null) {
  return (result?.events ?? []).map((event) => ({
    code: event.code,
    type: event.type,
    message: event.message,
    performer: event.performer,
    automated: event.automated,
    why: event.why,
  }));
}

export function buildPublicBrief(
  workflow: WorkflowV1,
  exceptionResult: SimulationResult,
  narrative: string,
  happyResult?: SimulationResult | null,
): PublicBrief {
  const draft = deriveSystemBrief(workflow, exceptionResult);
  const inputs = [
    ...new Set(
      [
        ...(workflow.inputs ?? []),
        ...workflow.steps
          .map((step) => step.input)
          .filter((value): value is string => Boolean(value)),
      ].filter(Boolean),
    ),
  ];
  const connections = (workflow.systems ?? []).map((system) =>
    system.status === "known" ? system.name : `${system.name} (${system.status})`,
  );
  const contextParts = [workflow.domain, workflow.currentPain].filter(
    (part): part is string => Boolean(part?.trim() && part !== "UNKNOWN"),
  );
  const workflowText = workflow.steps
    .map((step) => step.code ?? step.title)
    .join(" → ");

  return {
    narrative: narrative.trim(),
    workflow,
    draft,
    businessContext: contextParts.join(" — ") || narrative.trim(),
    processName: workflow.name,
    inputs,
    workflowText,
    automatedSteps: draft.automatedSteps,
    humanSteps: [...draft.humanSteps, ...draft.mixedSteps],
    exceptions: workflow.inScope
      ? `${workflow.exception.title} — ${workflow.exception.description}`
      : "None. This process was not simulated.",
    requiredConnections: connections,
    openQuestions: openQuestionsFor(workflow),
    simulationSummary: simulationSummaryFor(
      workflow,
      happyResult ?? null,
      exceptionResult,
    ),
    understanding: understandingFor(workflow),
    events: compactEvents(exceptionResult),
  };
}

export function parsePublicBrief(input: unknown): PublicBrief | null {
  const parsed = publicBriefSchema.safeParse(input);
  return parsed.success ? parsed.data : null;
}
