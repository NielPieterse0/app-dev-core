/**
 * The governance type system.
 *
 * This file is where R23 stops being a discipline and becomes a compiler error.
 */
export type State = "passed" | "failed" | "not-applicable" | "missing" | "blocked" | "not-run";
export const PASSING: readonly State[] = ["passed", "not-applicable"];

/** A synthetic repository: path -> content. Used for fixtures. */
export type Repo = Record<string, string>;

export type Finding = { state: State; detail?: string };

/** Non-empty tuple. This is the type that makes R23 structural. */
export type NonEmpty<T> = [T, ...T[]];

export type Fixture = { name: string; repo: Repo };

type Base = {
  id: string;
  /** The ONE canonical wording. Every other representation is compiled from this. */
  statement: string;
  /** B2: name the defect that justifies this rule. No defect, no rule. */
  defect: string;
  scope: "core" | "product" | "both";
  section: string;
};

/**
 * A CI rule carries its own check AND its own fixtures.
 *
 * `fail: NonEmpty<Fixture>` is the load-bearing line in this repository.
 * A CI rule with no failing fixture DOES NOT TYPECHECK.
 *
 * scan-secrets.ps1 excluded projects/. The receipt regex missed "pending".
 * get-workflow-obligations.ps1 was inert on committed trees. All three passed every
 * test they were ever given. None of them could have been written here.
 */
export type CiRule = Base & {
  class: "CI";
  check: (repo: Repo) => Finding;
  fixtures: { pass: Fixture; fail: NonEmpty<Fixture> };
};

/** GATE = a platform setting refuses the action. Not checkable from the tree alone. */
export type GateRule = Base & { class: "GATE"; verifiedBy: string };

/** REVIEW = human inspection. Weak, and deliberately capped in number. */
export type ReviewRule = Base & { class: "REVIEW" };

export type Rule = CiRule | GateRule | ReviewRule;

export const isCi = (r: Rule): r is CiRule => r.class === "CI";

/** R07: missing / blocked / not-run NEVER aggregate to pass. */
export function aggregate(fs: Finding[]): "passed" | "failed" {
  return fs.every((f) => PASSING.includes(f.state)) ? "passed" : "failed";
}

// --- helpers for writing checks against a synthetic repo -----------------------
export const paths = (r: Repo) => Object.keys(r);
export const pass: Finding = { state: "passed" };
export const fail = (detail: string): Finding => ({ state: "failed", detail });
export const missing = (detail: string): Finding => ({ state: "missing", detail });
