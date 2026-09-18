import assert from "node:assert/strict";
import { test } from "node:test";
import { can } from "./permissions";

test("clients cannot read CRM records from another company", () => {
  assert.equal(
    can(
      {
        role: "CLIENT",
        companyId: "co_a",
        resourceCompanyId: "co_b",
      },
      "project",
      "read",
    ),
    false,
  );
});

test("clients cannot read leads", () => {
  assert.equal(
    can(
      { role: "CLIENT", companyId: "co_a", resourceCompanyId: "co_a" },
      "lead",
      "read",
    ),
    false,
  );
});

test("team members cannot change settings", () => {
  assert.equal(
    can({ role: "TEAM_MEMBER", companyId: null }, "settings", "read"),
    false,
  );
});

test("admins can read settings", () => {
  assert.equal(
    can({ role: "ADMIN", companyId: null }, "settings", "read"),
    true,
  );
});

test("clients cannot read internal documents even with a guessed company id", () => {
  assert.equal(
    can(
      {
        role: "CLIENT",
        companyId: "co_a",
        resourceCompanyId: "co_a",
        documentVisibility: "internal",
      },
      "document",
      "read",
    ),
    false,
  );
});

test("clients can read their own client-visible documents", () => {
  assert.equal(
    can(
      {
        role: "CLIENT",
        companyId: "co_a",
        resourceCompanyId: "co_a",
        documentVisibility: "client",
      },
      "document",
      "read",
    ),
    true,
  );
});

test("clients cannot read another company's proposals", () => {
  assert.equal(
    can(
      {
        role: "CLIENT",
        companyId: "co_a",
        resourceCompanyId: "co_b",
        sharedWithClient: true,
        proposalStatus: "sent",
      },
      "proposal",
      "read",
    ),
    false,
  );
});

test("clients can read their own company only", () => {
  assert.equal(
    can(
      { role: "CLIENT", companyId: "co_a", resourceCompanyId: "co_a" },
      "company",
      "read",
    ),
    true,
  );
  assert.equal(
    can(
      { role: "CLIENT", companyId: "co_a", resourceCompanyId: "co_b" },
      "company",
      "read",
    ),
    false,
  );
});

test("clients cannot update hidden tasks", () => {
  assert.equal(
    can(
      {
        role: "CLIENT",
        companyId: "co_a",
        resourceCompanyId: "co_a",
        clientVisible: false,
      },
      "task",
      "update",
    ),
    false,
  );
});
