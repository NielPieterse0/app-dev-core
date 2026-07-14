/**
 * THE RULE REGISTRY — the single source of truth for the rules compiled here.
 *
 * Nothing else in this repository states these compiled rules. The generated
 * enforcement register, AGENTS-facing references, hook deny-lists and PR template are all
 * COMPILED from this file (`npm run governance:compile`). CI regenerates them and
 * fails on any diff, so a hand-edited copy cannot survive a merge.
 *
 * To add a rule: add an entry. Everything else updates itself, including its tests.
 * To change a rule: change it here. One place. That is the entire point.
 */
import type { Rule, Repo, Finding, Fixture } from "./types.js";
import { pass, fail, missing, paths } from "./types.js";
import { TOP_LEVEL, NO_SLOT_PATTERNS } from "./grammar.js";

const SHELL = /\.(ps1|psm1|psd1|sh|bat|cmd)$/i;
const ABS = /(^|["'\s=(])([A-Za-z]:\\|\/(Users|home|mnt|opt|root|tmp|var)\/)/;
const FLOATING = /["']?node-version["']?\s*:\s*["']?(latest|lts\/\*)/i;
const NORMATIVE = /\b(MUST NOT|MUST|SHALL|PROHIBITED|FORBIDDEN)\b/;

/**
 * Content scans skip the fixture directory — it holds adversarial input by design.
 *
 * ⚠ This is the exemption that must never grow. `scan-secrets.ps1` blanket-excluded
 * `projects/` — the directory the product lived in — and so could never find a secret.
 * Three things keep this one honest: it is one directory whose only purpose is bad
 * input; it applies to CONTENT scans only (path-shape rules still bite there); and it
 * has its own failing fixture.
 */
const EXEMPT = /^(tests\/enforcement|governance)\//;
const scan = (r: Repo, ext: RegExp, re: RegExp) =>
  paths(r).filter((p) => ext.test(p) && !EXEMPT.test(p) && re.test(r[p] ?? ""));

// A legal minimal repository. Every pass-fixture starts from this.
export const GOOD: Repo = {
  "AGENTS.md": "# core\nSee the OM.\n",
  "README.md": "# core\n",
  "VERSION": "0.1.0\n",
  ".nvmrc": "22\n",
  "package.json": '{"name":"c","engines":{"node":">=22"}}',
  ".github/workflows/verify.yml": "name: verify\non: [push]\njobs:\n  v:\n    steps:\n      - with:\n          node-version-file: .nvmrc\n",
  ".codex/config.toml": 'default_permissions = "app-dev-core"\n\n[permissions.app-dev-core.filesystem.":workspace_roots"]\n"." = "write"\n',
  "capabilities/.gitkeep": "",
  "core/releases.json": "[]\n",
  "docs/operating-model/operating-model.md": "Tooling MUST be Node.\n",
  "schemas/app-dev.manifest.schema.json": '{"required":["schemaVersion","product","baseline","riskProfile"],"properties":{"baseline":{"required":["core","operatingModel","archetype"]}}}\n',
  "standards/development.md": "# standard\n",
  "scripts/verify-core.ts": "export {};\n",
};
const withFile = (name: string, p: string, content: string): Fixture =>
  ({ name, repo: { ...GOOD, [p]: content } });
const without = (name: string, ...drop: string[]): Fixture => {
  const repo = { ...GOOD };
  for (const d of drop) for (const k of Object.keys(repo)) if (k.startsWith(d)) delete repo[k];
  return { name, repo };
};

export const RULES: Rule[] = [
  {
    id: "R00", section: "2.0", class: "REVIEW", scope: "both",
    statement: "Every change records Lean / Efficient / Effective in the pull request.",
    defect: "Governance accreted with no test applied to the governance itself.",
  },
  {
    id: "R02", section: "3.3", class: "CI", scope: "product",
    statement: "No sibling-path (`../../`) dependency in build, test, CI, deploy or release.",
    defect: "Signal invoked ../../scripts/verify-app.ps1 and inherited the root AGENTS.md.",
    check: (r) => {
      const hits = scan(r, /\.(ts|tsx|js|mjs|json|ya?ml|toml)$/i, /\.\.[/\\]\.\.[/\\]/);
      return hits.length ? fail(`Sibling-path reference: ${hits.join(", ")}`) : pass;
    },
    fixtures: {
      pass: { name: "no sibling paths", repo: GOOD },
      fail: [withFile("imports ../../scripts", "scripts/x.ts", 'import v from "../../scripts/verify-app";')],
    },
  },
  {
    id: "R04", section: "3.2", class: "CI", scope: "core",
    statement: "The core contains no product source, migrations or feature specs.",
    defect: "app-dev held both the control plane and its first production app in one Git history.",
    check: (r) => {
      const hits = paths(r).filter((p) => /^(src|supabase|db)\//.test(p) || /migrations\//.test(p));
      return hits.length ? fail(`Product source in core: ${hits.join(", ")}`) : pass;
    },
    fixtures: {
      pass: { name: "core only", repo: GOOD },
      fail: [withFile("has src/", "src/App.tsx", "export default () => null;")],
    },
  },
  {
    id: "R05", section: "8.1", class: "GATE", scope: "both",
    statement: "Hosted CI runs on the default branch from the first push. `check-runs total_count: 0` is red, not absent.",
    defect: "Signal's workflow receipts claimed 'CI verified' from local Codex runs; Actions never dispatched a check.",
    verifiedBy: "GitHub branch protection + release:check asserting check_runs > 0",
  },
  {
    id: "R06", section: "8.1", class: "CI", scope: "both",
    statement: "Workflows live at the repository-root `.github/workflows/`. Nested paths are invisible to Actions.",
    defect: "projects/<app>/.github/workflows/ dispatched zero check-runs and nobody noticed.",
    check: (r) => {
      const nested = paths(r).filter((p) => /\.github\/workflows\//.test(p) && !p.startsWith(".github/workflows/"));
      if (nested.length) return fail(`Nested workflow (invisible to Actions): ${nested.join(", ")}`);
      const root = paths(r).some((p) => p.startsWith(".github/workflows/") && /\.ya?ml$/.test(p));
      return root ? pass : missing("No root workflow. `missing` is not `passed`.");
    },
    fixtures: {
      pass: { name: "root workflow", repo: GOOD },
      fail: [
        withFile("nested workflow", "projects/signal/.github/workflows/ci.yml", "name: x"),
        without("no workflow at all", ".github/workflows/"),
      ],
    },
  },
  {
    id: "R10", section: "7.1", class: "CI", scope: "both",
    statement: "Tooling is Node/TypeScript. No .ps1, .sh, .bat or .cmd.",
    defect: "Seven scripts used Windows-only idioms on ubuntu-latest; [bool] vs [switch] failed silently.",
    check: (r) => {
      const hits = paths(r).filter((p) => SHELL.test(p));
      return hits.length ? fail(`Shell scripts: ${hits.join(", ")}`) : pass;
    },
    fixtures: {
      pass: { name: "TypeScript only", repo: GOOD },
      fail: [
        withFile("a .ps1", "scripts/verify.ps1", "param([bool]$Fix)"),
        withFile(".ps1 hiding in the fixture dir", "tests/enforcement/rogue.ps1", "Write-Host 1"),
      ],
    },
  },
  {
    id: "R11", section: "7.2", class: "CI", scope: "both",
    statement: "Toolchain pinned. `latest` and `lts/*` are prohibited.",
    defect: "CI ran node-version: lts/* while docs recommended Node 22.",
    check: (r) => {
      const hits = scan(r, /\.(ya?ml|json)$/i, FLOATING);
      if (hits.length) return fail(`Floating toolchain: ${hits.join(", ")}`);
      return r[".nvmrc"] !== undefined ? pass : missing("No .nvmrc");
    },
    fixtures: {
      pass: { name: "pinned via .nvmrc", repo: GOOD },
      fail: [
        withFile("lts/* in CI", ".github/workflows/verify.yml", 'jobs:\n  v:\n    steps:\n      - with:\n          node-version: "lts/*"\n'),
        without("no .nvmrc", ".nvmrc"),
      ],
    },
  },
  {
    id: "R12", section: "7.4", class: "CI", scope: "both",
    statement: "No machine-local absolute paths in committed artifacts.",
    defect: "The audit closeout ledger contained a hard-coded local path.",
    check: (r) => {
      const hits = scan(r, /\.(ts|tsx|js|mjs|json|toml|ya?ml|md)$/i, ABS);
      return hits.length ? fail(`Absolute paths: ${hits.join(", ")}`) : pass;
    },
    fixtures: {
      pass: { name: "relative only", repo: GOOD },
      fail: [
        withFile("windows abs path", "scripts/x.ts", 'const p = "C:\\\\Projects\\\\app-dev";'),
        withFile("unix abs path", "README.md", "Path: /var/tmp/example\n"),
      ],
    },
  },
  {
    id: "R13", section: "9.2", class: "CI", scope: "product",
    statement: "Authorization is tested against a real local Postgres, including negative cases. A mocked client cannot prove RLS.",
    defect: "Supabase migrations were contract-tested via a mocked client only.",
    check: (r) => {
      const elevated = /"riskProfile"\s*:\s*"(elevated|high)"/.test(r["app-dev.manifest.json"] ?? "");
      if (!elevated) return { state: "not-applicable" };
      const has = paths(r).some((p) => /tests\/integration\/.*(rls|policy|auth)/i.test(p));
      return has ? pass : missing("Elevated risk profile with no RLS integration test.");
    },
    fixtures: {
      pass: { name: "standard profile => n/a", repo: GOOD },
      fail: [{ name: "elevated with no RLS test", repo: { ...GOOD, "app-dev.manifest.json": '{"riskProfile":"elevated"}' } }],
    },
  },
  {
    id: "R18", section: "4.2", class: "CI", scope: "both",
    statement: "No tasks.md, workflow-receipts.md, checklist.md, plans/, audit/ or agent logs. The change record is the pull request.",
    defect: "Mandatory receipts produced ceremony instead of evidence; 'CI verified' receipts were false.",
    check: (r) => {
      const hits = paths(r).filter((p) => NO_SLOT_PATTERNS.some((re) => re.test(p)));
      return hits.length ? fail(`Artifacts with no slot: ${hits.join(", ")}`) : pass;
    },
    fixtures: {
      pass: { name: "no receipts", repo: GOOD },
      fail: [
        withFile("a tasks.md", "specs/001/tasks.md", "# tasks"),
        withFile("a plans/ dir", "docs/plans/2026-01-x.md", "# plan"),
      ],
    },
  },
  {
    id: "R20", section: "5", class: "CI", scope: "both",
    statement: "Normative language appears only in the Operating Model. Elsewhere, cite a rule; never restate it.",
    defect: "The first AGENTS.md of THIS repository restated ten rule IDs and thirteen OM sections. The kit enforcing one-fact-one-owner violated it.",
    check: (r) => {
      const hits = paths(r).filter(
        (p) => /\.md$/i.test(p) && !p.startsWith("docs/operating-model/") && !EXEMPT.test(p) && NORMATIVE.test(r[p] ?? "")
      );
      return hits.length ? fail(`Restating an owned fact: ${hits.join(", ")}. Cite it; don't repeat it.`) : pass;
    },
    fixtures: {
      pass: { name: "OM owns normative language", repo: GOOD },
      fail: [withFile("README restates a rule", "README.md", "Scripts MUST be TypeScript.")],
    },
  },
  {
    id: "R21", section: "10.3", class: "CI", scope: "both",
    statement: "AGENTS.md is at most 80 lines. It routes; it does not restate. It loads on every task.",
    defect: "Root AGENTS.md accumulated the full workflow, duplicated in SKILL.md and the standards.",
    check: (r) => {
      const a = r["AGENTS.md"];
      if (a === undefined) return missing("AGENTS.md absent");
      const n = a.split("\n").length;
      return n > 80 ? fail(`AGENTS.md is ${n} lines (cap 80).`) : pass;
    },
    fixtures: {
      pass: { name: "lean AGENTS.md", repo: GOOD },
      fail: [withFile("bloated", "AGENTS.md", Array(120).fill("line").join("\n"))],
    },
  },
  {
    id: "R22", section: "12.3", class: "CI", scope: "both",
    statement: "The declared Codex permission profile exists. Documentation never restates it.",
    defect: "The README said project permissions were disabled while .codex/config.toml enabled them and granted .git write.",
    check: (r) => {
      const cfg = r[".codex/config.toml"];
      if (cfg === undefined) return missing(".codex/config.toml absent");
      const prof = cfg.match(/^\s*default_permissions\s*=\s*"([^"]+)"/m)?.[1];
      if (!prof) return fail("No default_permissions set");
      if (prof.startsWith(":")) return pass;
      const declared = new RegExp(`\\[permissions\\.${prof.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(cfg);
      return declared ? pass : fail(`Profile "${prof}" has no [permissions.${prof}] table.`);
    },
    fixtures: {
      pass: { name: "profile declared", repo: GOOD },
      fail: [withFile("ghost profile", ".codex/config.toml", 'default_permissions = "ghost"\n')],
    },
  },
  {
    id: "R24", section: "4", class: "CI", scope: "both",
    statement: "No artifact outside the directory grammar. A new artifact type requires a grammar amendment first.",
    defect: "Artifacts arrived with nowhere to go and invented homes; the same fact ended up in AGENTS, standards, commands, skills and registries.",
    check: (r) => {
      const tops = new Set(paths(r).map((p) => p.split("/")[0]!));
      const strays = [...tops].filter((t) => !TOP_LEVEL.has(t));
      return strays.length ? fail(`No slot in the grammar: ${strays.join(", ")}. Amend it first, in its own PR.`) : pass;
    },
    fixtures: {
      pass: { name: "grammar respected", repo: GOOD },
      fail: [withFile("invented a home", "misc/notes.md", "# notes")],
    },
  },
  {
    id: "R23", section: "9.5", class: "CI", scope: "core",
    statement: "Every CI rule has a passing fixture and at least one failing fixture.",
    defect: "scan-secrets excluded projects/; the receipt regex missed 'pending'; the obligations script was inert on committed trees. All three passed every test they were ever given.",
    check: (r) => /fail\s*:\s*\[\s*\]/.test(r["governance/rules.ts"] ?? "")
      ? fail("A CI rule declares an empty failing-fixture list.")
      : pass,
    fixtures: {
      pass: { name: "no empty failing-fixture list", repo: GOOD },
      fail: [withFile("empty failing fixture list", "governance/rules.ts", "fixtures: { pass: GOOD, " + "fail: [" + "] }")],
    },
  },
  {
    id: "R37", section: "3.8", class: "CI", scope: "core",
    statement: "The product manifest schema keeps the baseline contract honest: core, operatingModel and archetype stay required.",
    defect: "The OM added the upgrade contract, but the core registry never checked that the shipped manifest schema still required the baseline surfaces products depend on.",
    check: (r) => {
      const raw = r["schemas/app-dev.manifest.schema.json"];
      if (raw === undefined) return missing("schemas/app-dev.manifest.schema.json absent");
      let schema: unknown;
      try { schema = JSON.parse(raw); } catch { return fail("schemas/app-dev.manifest.schema.json is not valid JSON."); }
      const rootRequired = Array.isArray((schema as { required?: unknown[] }).required)
        ? (schema as { required: unknown[] }).required
        : [];
      const baselineRequired = Array.isArray((schema as { properties?: { baseline?: { required?: unknown[] } } }).properties?.baseline?.required)
        ? (schema as { properties: { baseline: { required: unknown[] } } }).properties.baseline.required
        : [];
      const needsRoot = ["baseline", "riskProfile"];
      const needsBaseline = ["core", "operatingModel", "archetype"];
      const missingRoot = needsRoot.filter((k) => !rootRequired.includes(k));
      const missingBaseline = needsBaseline.filter((k) => !baselineRequired.includes(k));
      return missingRoot.length || missingBaseline.length
        ? fail(
            `Manifest schema lost required baseline fields: ` +
            `${missingRoot.length ? `root missing ${missingRoot.join(", ")}` : ""}` +
            `${missingRoot.length && missingBaseline.length ? "; " : ""}` +
            `${missingBaseline.length ? `baseline missing ${missingBaseline.join(", ")}` : ""}`
          )
        : pass;
    },
    fixtures: {
      pass: { name: "baseline contract retained", repo: GOOD },
      fail: [
        withFile(
          "baseline omits operatingModel",
          "schemas/app-dev.manifest.schema.json",
          '{"required":["schemaVersion","product","baseline","riskProfile"],"properties":{"baseline":{"required":["core","archetype"]}}}'
        ),
      ],
    },
  },
  {
    id: "R38", section: "3.8", class: "REVIEW", scope: "core",
    statement: "Port-interface changes require a §13 deviation; risk profile is reviewed at each gated change instead of freezing at product creation.",
    defect: "The OM added the upgrade contract's port-surface stability rule, but this judgment-call rule was never registered with the rest of the core governance set.",
  },
  {
    id: "R39", section: "3.8", class: "CI", scope: "core",
    statement: "Published core changes live in append-only core/releases.json entries with a valid category and minimum release metadata.",
    defect: "The OM added the publishing ledger surface, but the core registry never checked that core/releases.json existed or preserved the contract products will consume.",
    check: (r) => {
      const raw = r["core/releases.json"];
      if (raw === undefined) return missing("core/releases.json absent");
      let entries: unknown;
      try { entries = JSON.parse(raw); } catch { return fail("core/releases.json is not valid JSON."); }
      if (!Array.isArray(entries)) return fail("core/releases.json must be a JSON array.");
      const allowed = new Set(["security", "recommended", "optional"]);
      for (const [idx, entry] of entries.entries()) {
        if (typeof entry !== "object" || entry === null) return fail(`core/releases.json[${idx}] is not an object.`);
        const e = entry as {
          version?: unknown;
          date?: unknown;
          category?: unknown;
          affects?: { kind?: unknown; name?: unknown; version?: unknown };
          summary?: unknown;
        };
        if (typeof e.version !== "string" || !/^\d+\.\d+\.\d+/.test(e.version)) return fail(`core/releases.json[${idx}] has an invalid version.`);
        if (typeof e.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(e.date)) return fail(`core/releases.json[${idx}] has an invalid date.`);
        if (typeof e.category !== "string" || !allowed.has(e.category)) return fail(`core/releases.json[${idx}] has an invalid category.`);
        if (typeof e.summary !== "string" || e.summary.trim().length === 0) return fail(`core/releases.json[${idx}] is missing summary.`);
        if (typeof e.affects?.kind !== "string" || typeof e.affects?.name !== "string" || typeof e.affects?.version !== "string") {
          return fail(`core/releases.json[${idx}] is missing affects metadata.`);
        }
      }
      return pass;
    },
    fixtures: {
      pass: { name: "empty publishing ledger is valid", repo: GOOD },
      fail: [
        withFile(
          "invalid release category",
          "core/releases.json",
          '[{"version":"1.1.0","date":"2026-08-01","category":"urgent","affects":{"kind":"archetype","name":"react-vite-capacitor","version":"1.1.0"},"summary":"x"}]'
        ),
      ],
    },
  },
  {
    id: "R40", section: "3.8", class: "REVIEW", scope: "core",
    statement: "Every core PR states Origin and Type; a proposal touching capabilities cites two consuming products or is redirected to §14.",
    defect: "The OM added the correction-versus-proposal feedback lane, but the required PR metadata was never registered alongside the rest of the core rules.",
  },
  {
    id: "B1", section: "14", class: "CI", scope: "core",
    statement: "capabilities/ stays empty until two products independently prove a need.",
    defect: "Two governance-hardening cycles completed before any app was produced.",
    check: (r) => {
      const hits = paths(r).filter((p) => p.startsWith("capabilities/") && !p.endsWith(".gitkeep"));
      return hits.length ? fail(`capabilities/ populated with zero shipped products: ${hits.join(", ")}`) : pass;
    },
    fixtures: {
      pass: { name: "empty", repo: GOOD },
      fail: [withFile("premature capability", "capabilities/auth/index.ts", "export {};")],
    },
  },
];
