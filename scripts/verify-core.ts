/**
 * verify-core — runs the registry against the real repository.
 *
 * There is no rule logic in this file. It loads governance/rules.ts and executes each
 * CI rule's own check. The rule and its enforcement are the same object; they cannot
 * drift apart because there is nothing to drift from.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { RULES } from "../governance/rules.js";
import { isCi, aggregate, PASSING, type Repo, type Finding } from "../governance/types.js";

const ROOT = process.cwd();
const SKIP = new Set([".git", "node_modules", "dist", "coverage", ".write", ".work"]);

function load(dir: string, repo: Repo = {}): Repo {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) load(p, repo);
    else {
      const rel = relative(ROOT, p).replace(/\\/g, "/");
      try { repo[rel] = readFileSync(p, "utf8"); } catch { repo[rel] = ""; }
    }
  }
  return repo;
}

const repo = load(ROOT);
const results = RULES.filter(isCi).map((r) => ({ rule: r.id, ...r.check(repo) }));
const verdict = aggregate(results as Finding[]);

console.log(JSON.stringify({ tool: "verify-core", verdict, results }, null, 2));
for (const r of results) if (!PASSING.includes(r.state)) console.error(`  ✗ ${r.rule} [${r.state}] ${r.detail ?? ""}`);
process.exit(verdict === "passed" ? 0 : 1);
