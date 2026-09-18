import assert from "node:assert/strict";
import { test } from "node:test";
import { interpretProcess } from "./interpret";
import { runSimulation } from "./simulator";
import { buildPublicBrief } from "./public-brief";
import { parseWorkflowV1 } from "./schema";
import { sanitizeWorkflow } from "./sanitize";

test("a described WhatsApp order becomes an in-scope workflow", () => {
  const workflow = interpretProcess({
    narrative:
      "Customers send orders on WhatsApp. Someone checks payment, asks for the address, types the order into a spreadsheet, then arranges shipping.",
    channel: "whatsapp",
    doneLooksLike: "The order is recorded and shipping is arranged.",
    humanCheck: "Payment proof.",
    breakage: "Payment screenshot does not match.",
  });
  assert.equal(workflow.inScope, true);
  assert.equal(workflow.sampleCase.fictional, true);
  assert.equal(workflow.currentPain.includes("WhatsApp"), true);
  const result = runSimulation(workflow);
  assert.equal(result.inScope, true);
  assert.equal(
    result.events.filter((event) => event.type === "exception.raised").length,
    1,
  );
  const brief = buildPublicBrief(workflow, result, workflow.currentPain);
  assert.ok(brief.narrative.includes("WhatsApp"));
  assert.ok(brief.openQuestions.length >= 1);
});

test("interpretation is deterministic", () => {
  const input = {
    narrative:
      "A form arrives. Then someone copies it to a sheet. Then they forget to follow up.",
    channel: "form" as const,
    breakage: "Nobody owns the follow-up.",
  };
  assert.deepEqual(interpretProcess(input), interpretProcess(input));
});

test("thin input is out of scope rather than invented", () => {
  const workflow = interpretProcess({ narrative: "hello" });
  assert.equal(workflow.inScope, false);
});

test("a named tool in the description can be kept; an unmentioned product cannot", () => {
  const workflow = interpretProcess({
    narrative:
      "Customers send orders on WhatsApp. Someone checks payment. Then the order is typed into Shopify and shipping is arranged.",
  });
  const kept = sanitizeWorkflow(
    parseWorkflowV1({
      ...workflow,
      steps: workflow.steps.map((step, index) =>
        index === 0 ? { ...step, systemName: "Shopify" } : step,
      ),
    }),
    workflow.currentPain,
  );
  assert.equal(kept.steps[0]?.systemName, "Shopify");

  const dropped = sanitizeWorkflow(
    parseWorkflowV1({
      ...workflow,
      steps: workflow.steps.map((step, index) =>
        index === 0 ? { ...step, systemName: "HubSpot" } : step,
      ),
    }),
    workflow.currentPain,
  );
  assert.notEqual(dropped.steps[0]?.systemName?.toLowerCase(), "hubspot");
});
