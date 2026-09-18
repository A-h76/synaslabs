export type SystemBriefDocument = {
  businessContext: string;
  processDescription: string;
  workflow: string;
  inputs: string;
  steps: string;
  humanActions: string;
  automatedActions: string;
  exceptions: string;
  systemsTools: string;
  integrations: string;
  sampleCase: string;
  simulationEvents: string;
  openQuestions: string;
};

const EMPTY: SystemBriefDocument = {
  businessContext: "",
  processDescription: "",
  workflow: "",
  inputs: "",
  steps: "",
  humanActions: "",
  automatedActions: "",
  exceptions: "",
  systemsTools: "",
  integrations: "",
  sampleCase: "",
  simulationEvents: "",
  openQuestions: "",
};

function asText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item : JSON.stringify(item)))
      .filter(Boolean)
      .join(" · ");
  }
  if (value && typeof value === "object") return JSON.stringify(value);
  return "";
}

function join(parts: Array<string | null | undefined>): string {
  return parts.filter((part): part is string => Boolean(part && part.trim())).join("\n");
}

/** Normalize stored brief JSON (public capture or internal) into the operating fields. */
export function asBriefDocument(raw: unknown): SystemBriefDocument {
  if (!raw || typeof raw !== "object") return { ...EMPTY };
  const record = raw as Record<string, unknown>;
  const draft =
    record.draft && typeof record.draft === "object"
      ? (record.draft as Record<string, unknown>)
      : {};
  const workflow =
    record.workflow && typeof record.workflow === "object"
      ? (record.workflow as Record<string, unknown>)
      : {};
  const steps = Array.isArray(workflow.steps) ? workflow.steps : [];
  const stepTitles = steps
    .map((step) =>
      step && typeof step === "object" && "title" in step
        ? String((step as { title?: string }).title ?? "")
        : "",
    )
    .filter(Boolean);
  const exception =
    workflow.exception && typeof workflow.exception === "object"
      ? (workflow.exception as Record<string, unknown>)
      : record.exceptions;

  return {
    businessContext:
      asText(record.businessContext) || asText(record.narrative) || asText(record.summary),
    processDescription:
      asText(record.processDescription) || asText(draft.processName) || asText(workflow.name),
    workflow: asText(record.workflowText) || asText(record.currentWorkflow) || stepTitles.join(" → "),
    inputs: asText(record.inputs),
    steps: asText(record.steps) || stepTitles.join("\n"),
    humanActions: asText(record.humanActions) || asText(draft.humanSteps),
    automatedActions: asText(record.automatedActions) || asText(draft.automatedSteps),
    exceptions: asText(record.exceptions) || asText(exception),
    systemsTools:
      asText(record.systemsTools) ||
      asText(record.requiredConnections) ||
      asText(draft.systems) ||
      asText(record.systems),
    integrations: asText(record.integrations) || asText(record.requiredConnections),
    sampleCase: asText(record.sampleCase) || asText(draft.sampleCaseTitle) || asText(workflow.sampleCase),
    simulationEvents:
      asText(record.simulationSummary) ||
      asText(record.simulationEvents) ||
      asText(record.events) ||
      asText(draft.eventCount),
    openQuestions: asText(record.openQuestions),
  };
}

export function discoveryPrefillFromBrief(input: {
  id: string;
  summary: string;
  document: unknown;
}) {
  const document = asBriefDocument(input.document);
  return {
    systemBriefId: input.id,
    businessContext: document.businessContext || input.summary,
    currentWorkflow: document.workflow || document.processDescription,
    currentTools: document.systemsTools || null,
    manualWork: document.humanActions || null,
    automationOpportunities: document.automatedActions || null,
    integrations: document.integrations || null,
    openQuestions: document.openQuestions || null,
    notes: join([document.sampleCase, document.exceptions]) || null,
  };
}

export const BRIEF_FIELD_LABELS: Array<{ key: keyof SystemBriefDocument; label: string }> = [
  { key: "businessContext", label: "Business context" },
  { key: "processDescription", label: "Process description" },
  { key: "workflow", label: "Workflow" },
  { key: "inputs", label: "Inputs" },
  { key: "steps", label: "Steps" },
  { key: "humanActions", label: "Human actions" },
  { key: "automatedActions", label: "Automated actions" },
  { key: "exceptions", label: "Exceptions" },
  { key: "systemsTools", label: "Systems / tools" },
  { key: "integrations", label: "Integrations" },
  { key: "sampleCase", label: "Sample case" },
  { key: "simulationEvents", label: "Simulation events" },
  { key: "openQuestions", label: "Open questions" },
];
