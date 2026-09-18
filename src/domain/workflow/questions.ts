import type { WorkflowV1 } from "./schema";

export type ClarifyQuestion = {
  id: string;
  prompt: string;
};

const MAX_QUESTIONS = 4;

function has(text: string, pattern: RegExp): boolean {
  return pattern.test(text);
}

function unanswered(answers: Record<string, string>, id: string): boolean {
  return !answers[id]?.trim();
}

/**
 * Ask only what would change the workflow model.
 * Never industry, company size, or goals.
 */
export function clarificationQuestions(
  workflow: WorkflowV1,
  narrative: string,
  answers: Record<string, string> = {},
): ClarifyQuestion[] {
  if (!workflow.inScope) return [];

  const text = `${narrative} ${workflow.steps.map((step) => step.action).join(" ")}`.toLowerCase();
  const questions: ClarifyQuestion[] = [];

  const mentionsPayment = has(text, /\b(pay|paid|payment|invoice|screenshot)\b/);
  const mentionsOrder = has(text, /\b(order|orders|booking|job|lead|enquir)\b/);
  const mentionsRecord = has(text, /\b(spreadsheet|sheet|crm|notebook|inbox|calendar|record)\b/);
  const mentionsBreak = has(
    text,
    /\b(fail|mismatch|missing|cannot|can't|broken|forgot|no one|nobody)\b/,
  );
  const mentionsOwner = has(
    text,
    /\b(coordinator|owner|manager|someone|staff|who)\b/,
  );

  if (
    mentionsPayment &&
    unanswered(answers, "after_payment") &&
    !has(text, /\bafter (the )?payment\b/)
  ) {
    questions.push({
      id: "after_payment",
      prompt: "What happens immediately after the payment is received?",
    });
  }

  if (mentionsOrder && unanswered(answers, "who_decides") && !has(text, /\bdecid(e|es|ing)\b/)) {
    questions.push({
      id: "who_decides",
      prompt: mentionsPayment
        ? "Who decides whether this order is valid?"
        : "Who decides whether this request should continue?",
    });
  }

  if (mentionsPayment && unanswered(answers, "payment_fail") && !mentionsBreak) {
    questions.push({
      id: "payment_fail",
      prompt: "What happens when the payment cannot be verified?",
    });
  } else if (!mentionsPayment && unanswered(answers, "when_it_breaks") && !mentionsBreak) {
    questions.push({
      id: "when_it_breaks",
      prompt: "What happens when this step cannot be completed as expected?",
    });
  }

  if (unanswered(answers, "recorded_where") && !mentionsRecord) {
    questions.push({
      id: "recorded_where",
      prompt: mentionsOrder
        ? "Where is the order recorded today?"
        : "Where is this recorded today?",
    });
  }

  if (unanswered(answers, "exception_owner") && !mentionsOwner) {
    questions.push({
      id: "exception_owner",
      prompt: "Who handles it when this breaks?",
    });
  }

  const unknownSystems = (workflow.systems ?? []).filter(
    (system) => system.status === "UNKNOWN",
  );
  if (unknownSystems.length > 0 && unanswered(answers, "source_of_truth") && mentionsRecord) {
    questions.push({
      id: "source_of_truth",
      prompt: "What tool is the source of truth once this is recorded?",
    });
  }

  const seen = new Set<string>();
  return questions
    .filter((question) => {
      if (seen.has(question.id)) return false;
      seen.add(question.id);
      return true;
    })
    .slice(0, MAX_QUESTIONS);
}
