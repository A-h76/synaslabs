import assert from "node:assert/strict";
import { test } from "node:test";
import { isFollowUpOverdue, planFollowUp } from "./follow-up";

test("new leads and radar signals share one follow-up rule", () => {
  const now = new Date("2026-09-16T12:00:00Z");
  const fromLead = planFollowUp("lead_created", now);
  const fromSignal = planFollowUp("signal_captured", now);
  assert.equal(fromLead.title, fromSignal.title);
  assert.equal(fromLead.dueAt.toISOString(), fromSignal.dueAt.toISOString());
  assert.equal(fromLead.kind, "follow_up");
});

test("weekends are skipped for due dates", () => {
  const friday = new Date("2026-09-18T12:00:00Z");
  const plan = planFollowUp("lead_created", friday);
  assert.equal(plan.dueAt.getUTCDay() !== 0 && plan.dueAt.getUTCDay() !== 6, true);
});

test("completed follow-ups are not overdue", () => {
  assert.equal(isFollowUpOverdue("2020-01-01T00:00:00Z", "completed"), false);
  assert.equal(isFollowUpOverdue("2020-01-01T00:00:00Z", "open", new Date("2026-01-01")), true);
});
