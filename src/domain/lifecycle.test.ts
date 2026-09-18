import assert from "node:assert/strict";
import { test } from "node:test";
import {
  canTransitionLead,
  canTransitionProject,
  canTransitionProposal,
  isClientVisibleProposal,
  opportunityStageFromLead,
} from "./lifecycle";

test("lead pipeline cannot skip discovery into won", () => {
  assert.equal(canTransitionLead("qualified", "won"), false);
  assert.equal(canTransitionLead("qualified", "discovery"), true);
});

test("proposal sent can be viewed then accepted", () => {
  assert.equal(canTransitionProposal("draft", "sent"), true);
  assert.equal(canTransitionProposal("sent", "viewed"), true);
  assert.equal(canTransitionProposal("viewed", "accepted"), true);
  assert.equal(canTransitionProposal("draft", "accepted"), false);
});

test("clients only see shared commercial proposals", () => {
  assert.equal(isClientVisibleProposal("draft", true), false);
  assert.equal(isClientVisibleProposal("sent", false), false);
  assert.equal(isClientVisibleProposal("sent", true), true);
});

test("won leads map onto won opportunities", () => {
  assert.equal(opportunityStageFromLead("won"), "won");
  assert.equal(opportunityStageFromLead("new"), null);
});

test("projects cannot jump from onboarding to completed", () => {
  assert.equal(canTransitionProject("onboarding", "completed"), false);
  assert.equal(canTransitionProject("onboarding", "active"), true);
});
