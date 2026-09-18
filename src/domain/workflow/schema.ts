import { z } from "zod";
import { WORKFLOW_ACTORS } from "../lifecycle";

export const WORKFLOW_SCHEMA_VERSION = 1 as const;

export const workflowActorSchema = z.enum(WORKFLOW_ACTORS);

export const systemStatusSchema = z.enum(["known", "UNKNOWN", "OUT_OF_SCOPE"]);
export type SystemStatus = z.infer<typeof systemStatusSchema>;

export const namedActorSchema = z.object({
  name: z.string().min(1),
  kind: z.enum(["human", "system", "unknown"]),
});

export const namedSystemSchema = z.object({
  name: z.string().min(1),
  status: systemStatusSchema,
});

export const workflowStepSchema = z.object({
  id: z.string().min(1),
  code: z
    .string()
    .regex(/^[A-Z][A-Z0-9_]{0,39}$/)
    .optional(),
  title: z.string().min(1),
  actor: workflowActorSchema,
  systemName: z.string().min(1).optional(),
  systemStatus: systemStatusSchema.optional(),
  action: z.string().min(1),
  input: z.string().min(1).optional(),
  output: z.string().min(1).optional(),
  sla: z.string().min(1).optional(),
});

export const workflowDecisionSchema = z.object({
  id: z.string().min(1),
  atStepId: z.string().min(1),
  question: z.string().min(1),
  owner: z.string().min(1).optional(),
});

export const workflowExceptionSchema = z.object({
  id: z.string().min(1),
  code: z
    .string()
    .regex(/^[A-Z][A-Z0-9_]{0,39}$/)
    .optional(),
  atStepId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  humanOwner: z.string().min(1),
  recovery: z.string().min(1).optional(),
  systemCanDetect: z.boolean(),
  systemCanResolve: z.boolean(),
});

export const simulationCaseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  fictional: z.literal(true),
  facts: z.record(z.string(), z.string()),
});

export const workflowV1Schema = z
  .object({
    version: z.literal(WORKFLOW_SCHEMA_VERSION),
    id: z.string().min(1),
    name: z.string().min(1),
    domain: z.string().min(1).optional(),
    industry: z.string().min(1).optional(),
    inScope: z.boolean(),
    outOfScopeReason: z.string().min(1).optional(),
    currentPain: z.string().min(1),
    inputs: z.array(z.string().min(1)).default([]),
    actors: z.array(namedActorSchema).default([]),
    systems: z.array(namedSystemSchema).default([]),
    steps: z.array(workflowStepSchema).min(1).max(12),
    decisions: z.array(workflowDecisionSchema).default([]),
    exception: workflowExceptionSchema,
    outputs: z.array(z.string().min(1)).default([]),
    openQuestions: z.array(z.string().min(1)).default([]),
    sampleCase: simulationCaseSchema,
  })
  .superRefine((value, ctx) => {
    if (!value.inScope && !value.outOfScopeReason) {
      ctx.addIssue({
        code: "custom",
        message: "Out-of-scope workflows must explain why.",
        path: ["outOfScopeReason"],
      });
    }

    const stepIds = new Set(value.steps.map((step) => step.id));
    if (stepIds.size !== value.steps.length) {
      ctx.addIssue({
        code: "custom",
        message: "Workflow step ids must be unique.",
        path: ["steps"],
      });
    }

    if (value.inScope && !stepIds.has(value.exception.atStepId)) {
      ctx.addIssue({
        code: "custom",
        message: "Exception must point at an existing step.",
        path: ["exception", "atStepId"],
      });
    }

    for (const decision of value.decisions) {
      if (!stepIds.has(decision.atStepId)) {
        ctx.addIssue({
          code: "custom",
          message: "Decision must point at an existing step.",
          path: ["decisions"],
        });
      }
    }
  });

export type NamedActor = z.infer<typeof namedActorSchema>;
export type NamedSystem = z.infer<typeof namedSystemSchema>;
export type WorkflowStep = z.infer<typeof workflowStepSchema>;
export type WorkflowDecision = z.infer<typeof workflowDecisionSchema>;
export type WorkflowException = z.infer<typeof workflowExceptionSchema>;
export type SimulationCase = z.infer<typeof simulationCaseSchema>;
export type WorkflowV1 = z.infer<typeof workflowV1Schema>;

export function parseWorkflowV1(input: unknown): WorkflowV1 {
  return workflowV1Schema.parse(input);
}

export function safeParseWorkflowV1(input: unknown) {
  return workflowV1Schema.safeParse(input);
}
