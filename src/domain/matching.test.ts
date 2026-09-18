import assert from "node:assert/strict";
import { test } from "node:test";
import { matchCompany, matchContact, normalizeEmail, normalizeWebsite } from "./matching";

test("company matching prefers website host over display name", () => {
  const existing = [
    { id: "1", name: "Acme Ltd", website: "https://www.acme.com" },
    { id: "2", name: "Other", website: null },
  ];
  const hit = matchCompany(existing, { name: "ACME Limited", website: "acme.com" });
  assert.equal(hit?.id, "1");
});

test("company matching falls back to normalized name", () => {
  const existing = [{ id: "1", name: "North Mill", website: null }];
  const hit = matchCompany(existing, { name: "  north   mill " });
  assert.equal(hit?.id, "1");
});

test("contact matching uses email within a company", () => {
  const existing = [
    { id: "a", companyId: "co1", email: "Ada@Example.com" },
    { id: "b", companyId: "co2", email: "ada@example.com" },
  ];
  const hit = matchContact(existing, { email: "ada@example.com", companyId: "co2" });
  assert.equal(hit?.id, "b");
});

test("email and website normalization are conservative", () => {
  assert.equal(normalizeEmail("not-an-email"), null);
  assert.equal(normalizeWebsite("https://WWW.SynasLabs.com/path"), "synaslabs.com");
});
