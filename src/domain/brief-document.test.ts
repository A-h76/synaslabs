import assert from "node:assert/strict";
import { test } from "node:test";
import { asBriefDocument, discoveryPrefillFromBrief } from "./brief-document";

test("public capture briefs prefill discovery without requiring the brief later", () => {
  const document = {
    narrative: "Invoices are typed into a spreadsheet.",
    draft: {
      processName: "Invoice intake",
      humanSteps: ["Read email"],
      automatedSteps: ["Extract totals"],
      systems: ["Gmail", "Sheets"],
    },
    openQuestions: ["Who approves exceptions?"],
    inputs: ["PDF invoice"],
  };
  const prefill = discoveryPrefillFromBrief({
    id: "brief_1",
    summary: "Invoice intake",
    document,
  });
  assert.equal(prefill.systemBriefId, "brief_1");
  assert.match(prefill.businessContext ?? "", /Invoices/);
  assert.match(prefill.manualWork ?? "", /Read email/);
  assert.match(prefill.automationOpportunities ?? "", /Extract/);
});

test("internal brief fields round-trip", () => {
  const document = asBriefDocument({
    businessContext: "A mill.",
    humanActions: "Dispatch",
    automatedActions: "Status ping",
  });
  assert.equal(document.businessContext, "A mill.");
  assert.equal(document.humanActions, "Dispatch");
});
