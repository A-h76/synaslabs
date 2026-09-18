import type { WorkflowActor } from "../lifecycle";
import { toStateCode } from "./codes";
import type { WorkflowV1 } from "./schema";

export const SIMULATION_EVENT_TYPES = [
  "out_of_scope",
  "case.started",
  "step.started",
  "step.completed",
  "exception.raised",
  "exception.handed_to_human",
  "exception.resolved",
  "case.completed",
] as const;

export type SimulationEventType = (typeof SIMULATION_EVENT_TYPES)[number];
export type SimulationPath = "happy" | "exception";

export type SimulationEvent = {
  seq: number;
  t: number;
  type: SimulationEventType;
  stepId?: string;
  actor?: WorkflowActor;
  automated: boolean;
  code: string;
  message: string;
  why: string;
  performer: string;
};

export type SimulationResult = {
  workflowId: string;
  caseId: string;
  inScope: boolean;
  path: SimulationPath;
  events: SimulationEvent[];
};

function automatedFor(actor: WorkflowActor): boolean {
  return actor === "system";
}

function performerFor(actor: WorkflowActor, fallback: string): string {
  if (actor === "system") return "System";
  if (actor === "human") return fallback;
  return `${fallback} with system support`;
}

function stepCode(step: WorkflowV1["steps"][number], index: number): string {
  return step.code ?? toStateCode(step.title, `STEP_${index + 1}`);
}

function exceptionCode(workflow: WorkflowV1): string {
  return workflow.exception.code ?? toStateCode(workflow.exception.title, "EXCEPTION");
}

/**
 * Pure, deterministic playback. Same schema + path always yields the same event log.
 * No clocks, no I/O, no model calls.
 */
export function runSimulation(
  workflow: WorkflowV1,
  options: { path?: SimulationPath } = {},
): SimulationResult {
  const path: SimulationPath = options.path ?? "exception";
  const events: SimulationEvent[] = [];
  let seq = 0;
  let t = 0;

  const push = (
    event: Omit<SimulationEvent, "seq" | "t"> & { t?: number },
  ): void => {
    events.push({
      seq: seq++,
      t: event.t ?? t,
      type: event.type,
      stepId: event.stepId,
      actor: event.actor,
      automated: event.automated,
      code: event.code,
      message: event.message,
      why: event.why,
      performer: event.performer,
    });
  };

  if (!workflow.inScope) {
    push({
      type: "out_of_scope",
      automated: false,
      code: "OUT_OF_SCOPE",
      message:
        workflow.outOfScopeReason ??
        "This process is outside what Synas can honestly simulate.",
      why: "A run would require inventing structure that is not in the description.",
      performer: "Synas",
    });
    return {
      workflowId: workflow.id,
      caseId: workflow.sampleCase.id,
      inScope: false,
      path,
      events,
    };
  }

  push({
    type: "case.started",
    automated: false,
    code: "CASE_RECEIVED",
    message: `Fictional case “${workflow.sampleCase.title}” enters the path.`,
    why: "The structure is the visitor’s. The facts are invented so nothing live is touched.",
    performer: "Sample",
  });
  t += 1;

  for (const [index, step] of workflow.steps.entries()) {
    const code = stepCode(step, index);
    const performer = performerFor(
      step.actor,
      step.actor === "system" ? "System" : "A person on this step",
    );

    push({
      type: "step.started",
      stepId: step.id,
      actor: step.actor,
      automated: automatedFor(step.actor),
      code,
      message: `${step.title}: ${step.action}`,
      why:
        step.actor === "system"
          ? "This step does not wait on someone remembering."
          : step.actor === "human"
            ? "This step needs judgment, not a rule."
            : "The system can draft; a person still confirms.",
      performer,
    });
    t += 1;

    if (path === "exception" && step.id === workflow.exception.atStepId) {
      const raised = exceptionCode(workflow);
      push({
        type: "exception.raised",
        stepId: step.id,
        actor: step.actor,
        automated: workflow.exception.systemCanDetect,
        code: raised,
        message: workflow.exception.description,
        why: "This is the break that usually stalls the real work.",
        performer: workflow.exception.systemCanDetect ? "System" : performer,
      });
      t += 1;

      push({
        type: "exception.handed_to_human",
        stepId: step.id,
        actor: "human",
        automated: false,
        code: "REQUEST_NEW_PROOF",
        message: workflow.exception.recovery
          ? workflow.exception.recovery
          : `${workflow.exception.humanOwner} is asked to resolve “${workflow.exception.title}”.`,
        why: "The system should not pretend it can close a judgment call.",
        performer: workflow.exception.humanOwner,
      });
      t += 1;

      push({
        type: "exception.resolved",
        stepId: step.id,
        actor: "human",
        automated: workflow.exception.systemCanResolve,
        code: "HUMAN_REVIEW",
        message: workflow.exception.systemCanResolve
          ? "A person decides. The system can then close the exception."
          : "A person resolves the exception. The system records the outcome.",
        why: "Work continues only after a human checkpoint.",
        performer: workflow.exception.humanOwner,
      });
      t += 1;

      push({
        type: "step.completed",
        stepId: step.id,
        actor: step.actor,
        automated: automatedFor(step.actor),
        code: "CONTINUE",
        message: "The path continues with the recorded outcome.",
        why: "The exception was operational, not a dead end.",
        performer: performer,
      });
      t += 1;
      continue;
    }

    push({
      type: "step.completed",
      stepId: step.id,
      actor: step.actor,
      automated: automatedFor(step.actor),
      code: `${code}_DONE`,
      message:
        step.output ??
        (step.actor === "system"
          ? "System completes the step."
          : "Human completes the step."),
      why: "The output of this step is now available to the next.",
      performer,
    });
    t += 1;
  }

  push({
    type: "case.completed",
    automated: false,
    code: "CASE_COMPLETE",
    message:
      path === "exception"
        ? "Run complete, including the exception path. Nothing live was called."
        : "Happy path complete. Nothing live was called.",
    why: "This is a reading of the structure, not an execution against real tools.",
    performer: "Simulator",
  });

  return {
    workflowId: workflow.id,
    caseId: workflow.sampleCase.id,
    inScope: true,
    path,
    events,
  };
}
