import type { NamedSystem, WorkflowV1 } from "./schema";
import { parseWorkflowV1 } from "./schema";

const GENERIC_SYSTEMS = new Set([
  "inbox",
  "voice",
  "payments",
  "crm",
  "spreadsheet",
  "calendar",
  "forms",
  "logistics",
  "paper",
  "phone",
  "email",
  "whatsapp",
  "unknown",
  "out_of_scope",
]);

const BLOCKED_INVENTIONS = [
  /\bn8n\b/i,
  /\bzapier\b/i,
  /\bmake\.com\b/i,
  /\bopenai\b/i,
  /\bhubspot\b/i,
  /\bsalesforce\b/i,
  /\bstripe api\b/i,
  /\bwebhook\b/i,
  /\bgraphql\b/i,
  /\brest api\b/i,
  /\bkubernetes\b/i,
];

function mentionedIn(source: string, name: string): boolean {
  const haystack = source.toLowerCase();
  const needle = name.trim().toLowerCase();
  if (needle.length < 2) return false;
  return haystack.includes(needle);
}

export function allowedSystemName(name: string, sourceText: string): boolean {
  const trimmed = name.trim();
  if (!trimmed) return false;
  if (GENERIC_SYSTEMS.has(trimmed.toLowerCase())) return true;
  if (mentionedIn(sourceText, trimmed)) return true;
  if (BLOCKED_INVENTIONS.some((pattern) => pattern.test(trimmed))) {
    return mentionedIn(sourceText, trimmed);
  }
  return false;
}

export function sanitizeSystemName(
  name: string | undefined,
  sourceText: string,
): { name?: string; status: NamedSystem["status"] } {
  if (!name?.trim()) {
    return { status: "UNKNOWN" };
  }
  if (/^unknown$/i.test(name) || name === "UNKNOWN") {
    return { name: "UNKNOWN", status: "UNKNOWN" };
  }
  if (/out of scope|out_of_scope/i.test(name)) {
    return { name: "OUT_OF_SCOPE", status: "OUT_OF_SCOPE" };
  }
  if (allowedSystemName(name, sourceText)) {
    return { name: name.trim(), status: "known" };
  }
  return { name: "UNKNOWN", status: "UNKNOWN" };
}

function clip(value: string, max: number): string {
  const trimmed = value.trim();
  return trimmed.length <= max ? trimmed : `${trimmed.slice(0, max - 1).trim()}…`;
}

function stripSecrets(value: string): string {
  return value
    .replace(/(sk-|pk_|Bearer\s+)[A-Za-z0-9._-]{8,}/gi, "[redacted]")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, (email) =>
      email.toLowerCase().includes("fictional") ? email : "person@example.invalid",
    );
}

/**
 * Force a candidate workflow through the public contract.
 * Unknown tools become UNKNOWN. Invented integrations do not survive.
 */
export function sanitizeWorkflow(workflow: WorkflowV1, sourceText: string): WorkflowV1 {
  const source = sourceText.slice(0, 8000);
  const steps = workflow.steps.slice(0, 12).map((step) => {
    const system = sanitizeSystemName(step.systemName, source);
    return {
      ...step,
      title: clip(step.title, 80),
      action: clip(stripSecrets(step.action), 280),
      input: step.input ? clip(stripSecrets(step.input), 160) : undefined,
      output: step.output ? clip(stripSecrets(step.output), 160) : undefined,
      systemName: system.name,
      systemStatus: system.status,
    };
  });

  const systemsFromSteps: NamedSystem[] = [];
  for (const step of steps) {
    if (!step.systemName) {
      systemsFromSteps.push({ name: "UNKNOWN", status: "UNKNOWN" });
      continue;
    }
    systemsFromSteps.push({
      name: step.systemName,
      status: step.systemStatus ?? "known",
    });
  }

  const named = new Map<string, NamedSystem>();
  for (const system of [...(workflow.systems ?? []), ...systemsFromSteps]) {
    const sanitized = sanitizeSystemName(system.name, source);
    const name = sanitized.name ?? "UNKNOWN";
    named.set(name, { name, status: sanitized.status });
  }

  const facts: Record<string, string> = {};
  for (const [key, value] of Object.entries(workflow.sampleCase.facts)) {
    facts[clip(key, 40)] = clip(stripSecrets(value), 160);
  }

  return parseWorkflowV1({
    ...workflow,
    name: clip(workflow.name, 80),
    currentPain: clip(stripSecrets(workflow.currentPain), 2000),
    outOfScopeReason: workflow.outOfScopeReason
      ? clip(workflow.outOfScopeReason, 400)
      : undefined,
    steps,
    systems: [...named.values()].slice(0, 8),
    sampleCase: {
      ...workflow.sampleCase,
      fictional: true,
      title: clip(workflow.sampleCase.title, 80),
      summary: clip(stripSecrets(workflow.sampleCase.summary), 400),
      facts,
    },
    exception: {
      ...workflow.exception,
      title: clip(workflow.exception.title, 80),
      description: clip(stripSecrets(workflow.exception.description), 400),
      humanOwner: clip(workflow.exception.humanOwner, 80),
      recovery: workflow.exception.recovery
        ? clip(workflow.exception.recovery, 200)
        : undefined,
    },
    openQuestions: (workflow.openQuestions ?? []).map((item) => clip(item, 180)).slice(0, 6),
    inputs: (workflow.inputs ?? []).map((item) => clip(item, 80)).slice(0, 8),
    outputs: (workflow.outputs ?? []).map((item) => clip(item, 80)).slice(0, 8),
  });
}
