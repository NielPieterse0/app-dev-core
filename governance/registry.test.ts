/**
 * THE GENERIC ENFORCEMENT SUITE.
 *
 * This file does not know about any specific rule and never will. It iterates the
 * registry and runs every CI rule against its own fixtures.
 *
 * Consequence: adding a rule automatically adds its tests. There is no per-rule test
 * to forget to write — which is exactly what breaks down at fifty rules across four
 * repositories.
 *
 * R23 is enforced twice over:
 *   1. Structurally — `fail: NonEmpty<Fixture>` in governance/types.ts means a CI rule
 *      with no failing fixture DOES NOT COMPILE.
 *   2. Behaviourally — every declared failing fixture is executed here and must fail.
 *
 * A check that has only ever seen good input is not a control. scan-secrets.ps1,
 * the receipt validator and the obligations script all passed every test they were
 * given. None of them could have been written against this suite.
 */
import { describe, it, expect } from "vitest";
import { RULES } from "./rules.js";
import { isCi, PASSING } from "./types.js";

const ci = RULES.filter(isCi);

describe("registry integrity", () => {
  it("has rules", () => expect(ci.length).toBeGreaterThan(0));

  it("every rule id is unique", () => {
    const ids = RULES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every rule cites a defect — no defect, no rule", () => {
    for (const r of RULES) expect(r.defect.length, `${r.id} has no cited defect`).toBeGreaterThan(20);
  });

  it("REVIEW rules stay scarce — they are the weakest and the cheapest to add", () => {
    expect(RULES.filter((r) => r.class === "REVIEW").length).toBeLessThanOrEqual(10);
  });
});

describe.each(ci.map((r) => [r.id, r] as const))("%s", (_id, rule) => {
  it(`statement is canonical and non-empty`, () => {
    expect(rule.statement.length).toBeGreaterThan(10);
  });

  it(`PASSES its passing fixture: ${rule.fixtures.pass.name}`, () => {
    const f = rule.check(rule.fixtures.pass.repo);
    expect(PASSING.includes(f.state), `${rule.id} rejected a legal repo: ${f.detail ?? ""}`).toBe(true);
  });

  it.each(rule.fixtures.fail.map((f) => [f.name, f] as const))(
    `FAILS its failing fixture: %s`,
    (_n, fx) => {
      const f = rule.check(fx.repo);
      expect(
        PASSING.includes(f.state),
        `${rule.id} ACCEPTED input it must reject ("${fx.name}"). ` +
          `A check that never fails is not a control — this is the scan-secrets defect.`
      ).toBe(false);
    }
  );
});
