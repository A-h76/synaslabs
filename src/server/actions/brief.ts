"use server";

import { interpretProcess } from "@/domain/workflow/interpret";
import { clarificationQuestions, type ClarifyQuestion } from "@/domain/workflow/questions";
import { parseWorkflowV1, type WorkflowV1 } from "@/domain/workflow/schema";
import { sanitizeWorkflow } from "@/domain/workflow/sanitize";
import {
  runSimulation,
  type SimulationPath,
  type SimulationResult,
} from "@/domain/workflow/simulator";
import { IntegrationNotConfiguredError } from "@/server/errors";
import { interpretRateOk } from "@/server/http/rate-limit";
import { getIntegrations } from "@/server/integrations";

export type InterpretPublicResult =
  | { ok: true; workflow: WorkflowV1; questions: ClarifyQuestion[] }
  | { ok: false; error: string };

export type SimulatePublicResult =
  | { ok: true; result: SimulationResult }
  | { ok: false; error: string };

function clipAnswers(answers: Record<string, string> | undefined): Record<string, string> {
  const next: Record<string, string> = {};
  for (const [key, value] of Object.entries(answers ?? {})) {
    if (!key.trim() || !value.trim()) continue;
    next[key.slice(0, 40)] = value.trim().slice(0, 400);
  }
  return next;
}

async function structuredFrom(narrative: string, answers: Record<string, string>): Promise<WorkflowV1> {
  const deterministic = interpretProcess({ narrative, answers });
  try {
    const ai = await getIntegrations().ai.interpretProcess({ narrative, answers });
    return sanitizeWorkflow(parseWorkflowV1(ai), narrative);
  } catch (error) {
    if (error instanceof IntegrationNotConfiguredError) return deterministic;
    return deterministic;
  }
}

export async function interpretPublicProcess(input: {
  narrative: string;
  answers?: Record<string, string>;
}): Promise<InterpretPublicResult> {
  if (!(await interpretRateOk())) {
    return {
      ok: false,
      error: "This working session is being used too quickly. Wait a few minutes, then continue.",
    };
  }
  const narrative = input.narrative.trim().slice(0, 4000);
  if (narrative.length < 12) {
    return { ok: false, error: "Write the process in your own words — even roughly." };
  }
  const answers = clipAnswers(input.answers);
  try {
    const workflow = await structuredFrom(narrative, answers);
    return {
      ok: true,
      workflow,
      questions: clarificationQuestions(workflow, narrative, answers),
    };
  } catch {
    return {
      ok: false,
      error: "The process could not be structured honestly from that description.",
    };
  }
}

export async function simulatePublicWorkflow(input: {
  workflow: unknown;
  path: SimulationPath;
}): Promise<SimulatePublicResult> {
  if (!(await interpretRateOk())) {
    return {
      ok: false,
      error: "This working session is being used too quickly. Wait a few minutes, then continue.",
    };
  }
  try {
    const workflow = sanitizeWorkflow(
      parseWorkflowV1(input.workflow),
      typeof input.workflow === "object" &&
        input.workflow &&
        "currentPain" in input.workflow &&
        typeof input.workflow.currentPain === "string"
        ? input.workflow.currentPain
        : "",
    );
    if (!workflow.inScope) {
      return { ok: false, error: "This process should not be simulated." };
    }
    if (input.path !== "happy" && input.path !== "exception") {
      return { ok: false, error: "Unknown simulation path." };
    }
    return { ok: true, result: runSimulation(workflow, { path: input.path }) };
  } catch {
    return { ok: false, error: "The structure is not valid enough to run." };
  }
}
