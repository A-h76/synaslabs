import assert from "node:assert/strict";
import { test } from "node:test";
import { deriveSystemBrief } from "./brief";
import {
  missedCallDispatchWorkflow,
  outOfScopeWorkflow,
} from "./fixture";
import { parseWorkflowV1 } from "./schema";
import { runSimulation } from "./simulator";

test("missed-call workflow is a valid WorkflowV1", () => {
  const parsed = parseWorkflowV1(missedCallDispatchWorkflow);
  assert.equal(parsed.version, 1);
  assert.equal(parsed.sampleCase.fictional, true);
});

test("simulation is deterministic and raises one exception", () => {
  const first = runSimulation(missedCallDispatchWorkflow);
  const second = runSimulation(missedCallDispatchWorkflow);
  assert.deepEqual(first, second);
  assert.equal(first.inScope, true);
  assert.equal(
    first.events.filter((event) => event.type === "exception.raised").length,
    1,
  );
  assert.ok(first.events.some((event) => event.type === "exception.handed_to_human"));
  assert.equal(first.events.at(-1)?.type, "case.completed");
});

test("system brief distinguishes automated and human work", () => {
  const result = runSimulation(missedCallDispatchWorkflow);
  const brief = deriveSystemBrief(missedCallDispatchWorkflow, result);
  assert.ok(brief.automatedSteps.includes("Capture the call"));
  assert.ok(brief.humanSteps.includes("Confirm with the customer"));
  assert.ok(brief.mixedSteps.includes("Qualify the job"));
  assert.equal(brief.exception?.humanOwner, "Duty coordinator");
  assert.equal(brief.exception?.systemCanResolve, false);
});

test("out-of-scope workflows do not pretend to run", () => {
  const result = runSimulation(outOfScopeWorkflow);
  assert.equal(result.inScope, false);
  assert.equal(result.events[0]?.type, "out_of_scope");
  const brief = deriveSystemBrief(outOfScopeWorkflow, result);
  assert.equal(brief.inScope, false);
  assert.equal(brief.automatedSteps.length, 0);
});

test("happy path has no exception events; exception path has one", () => {
  const happy = runSimulation(missedCallDispatchWorkflow, { path: "happy" });
  const broken = runSimulation(missedCallDispatchWorkflow, { path: "exception" });
  assert.equal(
    happy.events.filter((event) => event.type === "exception.raised").length,
    0,
  );
  assert.equal(
    broken.events.filter((event) => event.type === "exception.raised").length,
    1,
  );
  assert.ok(broken.events.some((event) => event.code === "REQUEST_NEW_PROOF"));
  assert.ok(broken.events.some((event) => event.code === "HUMAN_REVIEW"));
  assert.ok(broken.events.every((event) => event.why && event.performer));
});
