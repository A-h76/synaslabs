import type { WorkflowActor } from "../lifecycle";
import { parseWorkflowV1, type NamedActor, type NamedSystem, type WorkflowV1 } from "./schema";
import { toStateCode } from "./codes";
import { sanitizeWorkflow } from "./sanitize";
import { type Channel } from "./starters";

export { CHANNELS, type Channel } from "./starters";

export type InterpretInput = {
  narrative: string;
  channel?: Channel | "";
  doneLooksLike?: string;
  humanCheck?: string;
  breakage?: string;
  answers?: Record<string, string>;
};

const HUMAN_RE =
  /\b(approv|review|call back|call the|check with|decid|confirm with|manually|someone|coordinator|owner|staff|ask for|listen|who )\b/i;
const SYSTEM_RE =
  /\b(automat|captur|log|creat|send|notif|schedul|generat|parse|record|sync|transcrib|offer the next)\b/i;

function stableId(prefix: string, text: string): string {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return `${prefix}_${hash.toString(16)}`;
}

function clean(value: string): string {
  return value
    .replace(/^(\d+[\.)]\s*|[-*•]\s*)/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function titleFrom(text: string): string {
  const clipped = clean(text).replace(/[.:]+$/, "");
  if (clipped.length <= 72) return clipped || "Step";
  return `${clipped.slice(0, 69).trim()}…`;
}

function inferActor(text: string): WorkflowActor {
  const human = HUMAN_RE.test(text);
  const system = SYSTEM_RE.test(text);
  if (human && system) return "mixed";
  if (human) return "human";
  if (system) return "system";
  return "mixed";
}

function inferSystemName(text: string, channel: Channel | ""): string | undefined {
  const value = text.toLowerCase();
  if (value.includes("whatsapp") || channel === "whatsapp") return "Inbox";
  if (value.includes("email") || channel === "email") return "Inbox";
  if (value.includes("call") || value.includes("phone") || channel === "phone") {
    return "Voice";
  }
  if (value.includes("payment") || value.includes("paid")) return "Payments";
  if (value.includes("notebook") || value.includes("paper")) return "Paper";
  if (value.includes("address") || value.includes("crm")) return "CRM";
  if (value.includes("ship") || value.includes("dispatch")) return "Logistics";
  if (value.includes("calendar") || value.includes("slot") || value.includes("book")) {
    return "Calendar";
  }
  if (value.includes("spreadsheet") || value.includes("sheet") || value.includes("excel")) {
    return "Spreadsheet";
  }
  if (value.includes("form") || channel === "form") return "Forms";
  return undefined;
}

function inferCode(text: string, index: number, total: number): string {
  const value = text.toLowerCase();
  if (index === 0) {
    if (value.includes("order")) return "ORDER_RECEIVED";
    if (value.includes("call") || value.includes("voicemail")) return "CALL_RECEIVED";
    if (value.includes("enquir") || value.includes("form") || value.includes("lead")) {
      return "ENQUIRY_RECEIVED";
    }
    return "REQUEST_RECEIVED";
  }
  if (value.includes("payment") || value.includes("paid") || value.includes("screenshot")) {
    return "PAYMENT_CHECK";
  }
  if (value.includes("address")) return "ADDRESS_REQUIRED";
  if (value.includes("spreadsheet") || value.includes("typed") || value.includes("record")) {
    return "RECORD_CREATED";
  }
  if (value.includes("ship") || value.includes("dispatch")) return "SHIPPING_HANDOFF";
  if (value.includes("book") || value.includes("slot") || value.includes("appoint")) {
    return "BOOKING_OFFERED";
  }
  if (value.includes("follow")) return "FOLLOW_UP";
  if (index === total - 1) return "DONE";
  return toStateCode(titleFrom(text), `STEP_${index + 1}`);
}

function inferDomain(narrative: string, channel: Channel | ""): string {
  const text = narrative.toLowerCase();
  if (text.includes("order") || channel === "whatsapp") return "order-to-fulfilment";
  if (text.includes("call") || text.includes("job") || channel === "phone") {
    return "request-to-dispatch";
  }
  if (text.includes("lead") || text.includes("enquir") || channel === "form") {
    return "enquiry-to-follow-up";
  }
  return "UNKNOWN";
}

function inferChannel(narrative: string, explicit?: Channel | ""): Channel | "" {
  if (explicit) return explicit;
  const text = narrative.toLowerCase();
  if (text.includes("whatsapp")) return "whatsapp";
  if (text.includes("email")) return "email";
  if (text.includes("call") || text.includes("phone") || text.includes("voicemail")) {
    return "phone";
  }
  if (text.includes("form") || text.includes("instagram")) return "form";
  if (text.includes("in person") || text.includes("walk-in")) return "in-person";
  return "";
}

function splitNarrative(narrative: string): string[] {
  const rawLines = narrative
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const bulletLines = rawLines.filter((line) =>
    /^(\d+[\.)]\s*|[-*•]\s*)/.test(line),
  );
  if (bulletLines.length >= 2) {
    return bulletLines.map(clean);
  }

  const arrows = narrative
    .split(/\s*(?:→|->|then|, then)\s+/i)
    .map(clean)
    .filter((part) => part.length > 8);
  if (arrows.length >= 2) return arrows.slice(0, 7);

  const sentences = narrative
    .split(/[.?!;]+/)
    .map(clean)
    .filter((part) => part.length > 18);
  if (sentences.length >= 2) return sentences.slice(0, 6);
  if (sentences.length === 1 && narrative.trim().length >= 48) {
    return sentences;
  }

  return [];
}

function channelIntake(channel: Channel | ""): string {
  switch (channel) {
    case "whatsapp":
      return "A message arrives on WhatsApp.";
    case "phone":
      return "A call or voicemail arrives.";
    case "email":
      return "An email arrives in a shared inbox.";
    case "form":
      return "A form submission arrives.";
    case "in-person":
      return "A request is taken in person.";
    default:
      return "Work arrives.";
  }
}

function looksLikeProcess(narrative: string, parts: string[]): boolean {
  const text = narrative.trim();
  if (parts.length >= 2) return true;
  if (text.length >= 48 && parts.length >= 1) return true;
  return false;
}

function fictionalCase(narrative: string, channel: Channel | ""): WorkflowV1["sampleCase"] {
  const text = `${narrative} ${channel}`.toLowerCase();
  if (text.includes("order") || text.includes("whatsapp") || text.includes("ship")) {
    return {
      id: "case_fictional_order",
      title: "Evening order (fictional)",
      summary:
        "A customer named R. Bell (fictional) sends a paid order after hours, with a partial address.",
      fictional: true,
      facts: {
        customer: "R. Bell (fictional)",
        channel: channel || "inbox",
        amount: "184.00 (fictional)",
        note: "Address line cuts off. Payment screenshot attached.",
      },
    };
  }
  if (text.includes("call") || text.includes("job") || text.includes("book")) {
    return {
      id: "case_fictional_call",
      title: "Early job (fictional)",
      summary:
        "A property manager named A. Rahman (fictional) leaves a voicemail at 07:12 about water on a corridor floor.",
      fictional: true,
      facts: {
        caller: "A. Rahman (fictional)",
        site: "14 Harbour Row (fictional)",
        promise: "Same-day emergency",
      },
    };
  }
  return {
    id: "case_fictional_enquiry",
    title: "New enquiry (fictional)",
    summary:
      "An enquiry from N. Cole (fictional) arrives while the usual owner is away.",
    fictional: true,
    facts: {
      person: "N. Cole (fictional)",
      source: channel || "inbox",
      note: "Asked for a callback this week.",
    },
  };
}

function nameProcess(narrative: string, channel: Channel | ""): string {
  const first = clean(narrative.split(/[.?\n]/)[0] ?? "").slice(0, 48);
  if (channel === "whatsapp") return "WhatsApp order flow";
  if (channel === "phone") return "Call to booking";
  if (channel === "form") return "Enquiry follow-up";
  if (first.length >= 12) return first;
  return "Incoming work";
}

function mergeAnswers(input: InterpretInput): string {
  const lines = [input.narrative.trim()];
  if (input.doneLooksLike?.trim()) {
    lines.push(`Done looks like: ${input.doneLooksLike.trim()}`);
  }
  if (input.humanCheck?.trim()) {
    lines.push(`A person still decides: ${input.humanCheck.trim()}`);
  }
  if (input.breakage?.trim()) {
    lines.push(`When it breaks: ${input.breakage.trim()}`);
  }
  for (const [key, value] of Object.entries(input.answers ?? {})) {
    if (!value.trim()) continue;
    lines.push(`${key}: ${value.trim()}`);
  }
  return lines.join("\n");
}

function exceptionFrom(input: InterpretInput, source: string, fallbackStepId: string) {
  const answers = input.answers ?? {};
  const breakage =
    answers.payment_fail?.trim() ||
    answers.when_it_breaks?.trim() ||
    input.breakage?.trim() ||
    "Something required for this step is missing or does not match.";
  const title = input.humanCheck?.trim()
    ? titleFrom(input.humanCheck)
    : /\bpayment\b/i.test(source)
      ? "Payment cannot be verified"
      : "Needs a person";
  const owner =
    answers.exception_owner?.trim() ||
    answers.who_decides?.trim() ||
    "The person who owns this step today";
  const recovery = /\bpayment\b/i.test(source)
    ? "Ask for new proof, then a person reviews it before the path continues."
    : "Ask for the missing fact, then a person reviews it before the path continues.";
  const code = /\bpayment\b/i.test(source) ? "PAYMENT_FAILED" : "EXCEPTION";
  return {
    id: "ex_1",
    code,
    atStepId: fallbackStepId,
    title: titleFrom(title),
    description: breakage,
    humanOwner: owner.slice(0, 80),
    recovery,
    systemCanDetect: true,
    systemCanResolve: false,
  };
}

/**
 * Structure a visitor's process into WorkflowV1.
 * Deterministic. Does not call a model. Does not generate UI.
 */
export function interpretProcess(input: InterpretInput): WorkflowV1 {
  const narrative = input.narrative.trim();
  const source = mergeAnswers(input);
  const channel = inferChannel(source, input.channel || "");
  const parts = splitNarrative(narrative);
  const inScope = looksLikeProcess(narrative, parts);

  if (!inScope) {
    return sanitizeWorkflow(
      parseWorkflowV1({
        version: 1,
        id: stableId("wf", narrative || "empty"),
        name: "Unspecified process",
        domain: "UNKNOWN",
        inScope: false,
        outOfScopeReason:
          "There is not yet a business process here that can be represented honestly as a connected system.",
        currentPain: narrative || "Not described.",
        inputs: [],
        actors: [{ name: "UNKNOWN", kind: "unknown" }],
        systems: [{ name: "UNKNOWN", status: "UNKNOWN" }],
        steps: [
          {
            id: "unknown",
            code: "UNKNOWN",
            title: "Unknown",
            actor: "human",
            action: "Hold. Do not invent a workflow.",
            systemName: "UNKNOWN",
            systemStatus: "UNKNOWN",
          },
        ],
        decisions: [],
        exception: {
          id: "ex_none",
          code: "OUT_OF_SCOPE",
          atStepId: "unknown",
          title: "None",
          description: "No simulation.",
          humanOwner: "Synas",
          systemCanDetect: false,
          systemCanResolve: false,
        },
        outputs: [],
        openQuestions: [
          "What actually happens, in order, from the first request to done?",
        ],
        sampleCase: {
          id: "case_none",
          title: "None",
          summary: "No fictional case is generated for out-of-scope input.",
          fictional: true,
          facts: {},
        },
      }),
      source,
    );
  }

  const afterPayment = input.answers?.after_payment?.trim();
  const recordedWhere = input.answers?.recorded_where?.trim();
  const sourceOfTruth = input.answers?.source_of_truth?.trim();

  const fragments =
    parts.length >= 2
      ? parts
      : [channelIntake(channel), narrative, input.doneLooksLike || "Work is marked done."];

  if (afterPayment && !fragments.some((part) => /after the payment|payment is received/i.test(part))) {
    fragments.splice(Math.min(2, fragments.length), 0, afterPayment);
  }
  if (recordedWhere && !fragments.some((part) => /record|sheet|crm|notebook/i.test(part))) {
    fragments.push(`It is recorded in ${recordedWhere}.`);
  }

  const limited = fragments.slice(0, 7);
  const steps = limited.map((fragment, index) => {
    const actor = inferActor(fragment);
    const systemName =
      inferSystemName(`${fragment} ${sourceOfTruth ?? ""} ${recordedWhere ?? ""}`, channel);
    return {
      id: `step_${index + 1}`,
      code: inferCode(fragment, index, limited.length),
      title: titleFrom(fragment),
      actor,
      systemName,
      action: fragment,
      input: index === 0 ? "The incoming request" : undefined,
      output:
        actor === "system"
          ? "A structured record exists."
          : actor === "human"
            ? "A person has made the call."
            : "System draft, human confirmation.",
    };
  });

  const humanLike =
    steps.find((step) =>
      input.humanCheck
        ? inferActor(`${step.action} ${input.humanCheck}`) !== "system"
        : step.actor !== "system",
    ) ?? steps[Math.max(0, steps.length - 2)] ?? steps[0];

  const actors: NamedActor[] = [
    { name: "System", kind: "system" },
    {
      name:
        input.answers?.who_decides?.trim() ||
        input.answers?.exception_owner?.trim() ||
        "Person on the path",
      kind: "human",
    },
  ];

  const systems: NamedSystem[] = [];
  const seen = new Set<string>();
  for (const step of steps) {
    const name = step.systemName ?? "UNKNOWN";
    if (seen.has(name)) continue;
    seen.add(name);
    systems.push({
      name,
      status: name === "UNKNOWN" ? "UNKNOWN" : "known",
    });
  }

  const decisions = steps
    .filter((step) => step.actor !== "system")
    .slice(0, 3)
    .map((step, index) => ({
      id: `decision_${index + 1}`,
      atStepId: step.id,
      question: `Is “${step.title}” valid enough to continue?`,
      owner: input.answers?.who_decides?.trim(),
    }));

  const inputs = [
    channel ? `${channel} intake` : "Incoming request",
    ...Object.values(fictionalCase(source, channel).facts).slice(0, 2),
  ].filter(Boolean);

  const workflow = parseWorkflowV1({
    version: 1 as const,
    id: stableId("wf", source),
    name: nameProcess(narrative, channel),
    domain: inferDomain(source, channel),
    inScope: true,
    currentPain: narrative,
    inputs,
    actors,
    systems,
    steps,
    decisions,
    exception: exceptionFrom(input, source, humanLike.id),
    outputs: [
      input.doneLooksLike?.trim() ||
        steps.at(-1)?.output ||
        "The work is recorded as done.",
    ],
    openQuestions: [],
    sampleCase: fictionalCase(source, channel),
  });

  return sanitizeWorkflow(workflow, source);
}
