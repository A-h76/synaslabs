import assert from "node:assert/strict";
import { test } from "node:test";
import { interpretProcess } from "./interpret";
import { clarificationQuestions } from "./questions";
import { parseWorkflowV1 } from "./schema";
import { sanitizeWorkflow } from "./sanitize";

test("clarification questions are operational, not demographic", () => {
  const narrative = "Customers send orders on WhatsApp and then we ship them.";
  const workflow = interpretProcess({ narrative });
  const questions = clarificationQuestions(workflow, narrative, {});
  assert.ok(questions.length >= 1);
  for (const question of questions) {
    assert.equal(/industry|company size|headcount|goals|budget/i.test(question.prompt), false);
  }
  assert.ok(
    questions.some((question) =>
      /after the payment|valid|cannot be verified|recorded today|when this breaks|source of truth|handles it/i.test(
        question.prompt,
      ),
    ),
  );
});

test("already-answered questions are not asked again", () => {
  const narrative =
    "Customers send orders on WhatsApp. Someone checks payment. Then we type the order into a spreadsheet and ship.";
  const workflow = interpretProcess({ narrative });
  const questions = clarificationQuestions(workflow, narrative, {
    after_payment: "We confirm the items.",
    who_decides: "The shop owner.",
    payment_fail: "We ask for a new screenshot.",
    recorded_where: "A Google sheet.",
    exception_owner: "The shop owner.",
    source_of_truth: "The sheet.",
  });
  assert.equal(questions.length, 0);
});

test("sanitize replaces invented products with UNKNOWN", () => {
  const base = interpretProcess({
    narrative:
      "Customers send orders on WhatsApp. Someone checks payment, asks for the address, types the order into a spreadsheet, then arranges shipping.",
  });
  const polluted = parseWorkflowV1({
    ...base,
    steps: base.steps.map((step, index) =>
      index === 0 ? { ...step, systemName: "HubSpot" } : step,
    ),
  });
  const clean = sanitizeWorkflow(polluted, base.currentPain);
  assert.equal(
    clean.steps.some((step) => (step.systemName ?? "").toLowerCase() === "hubspot"),
    false,
  );
  assert.ok(clean.sampleCase.fictional);
});
