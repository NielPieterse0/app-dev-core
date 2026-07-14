# Verify before first use

What is **proven** in this kit and what you **must check**. `missing` is not `passed`,
and that applies to this kit as much as to anything it governs [R07].

## Proven — executed and confirmed here

| Item | Evidence |
|---|---|
| `governance/compile.ts` | Compiled 4 artefacts from 16 rules. |
| **Drift gate** | Hand-edited a generated hook → `governance:check` **exit 1, DRIFT reported**. Recompiled → clean. |
| Compiled `guard-destructive.mjs` | `git push --force` → **blocked (exit 2)**. `npm run verify` → **allowed (exit 0)**. |
| Compiled `guard-grammar.mjs` | `docs/plans/x.md` → **blocked, cites [R18]**. |
| `scripts/verify-core.ts` | Runs the registry against this repo → **verdict: passed, 15 CI rules**. |

## Not proven — check on first clone

| Item | Why | Action |
|---|---|---|
| **`fail: NonEmpty<Fixture>` rejects `fail: []`** | `typescript` could not be installed here (no network), so the compile error was **never executed**. The construct `[T, ...T[]]` rejecting `[]` is standard TS, but I have not run it. | `npm ci && npx tsc --noEmit`, then temporarily add a CI rule with `fixtures: { pass, fail: [] }` and confirm it **fails to compile**. If it compiles, R23 is not structural and the claim in `AGENTS.md` is false — fix the type before trusting it. |
| **`tests/enforcement/registry.test.ts`** | `vitest` could not be installed (no network). The suite is written and **has never executed**. | `npm run test-enforcement`. An untested test is not a control [R23]. |
| **`.codex/rules/default.rules`** | Codex rules are experimental; the syntax here is best-effort and may not parse. | Check the Codex rules docs. Nothing critical depends on it — every rule is also a hook and a CI check. If rules fail to load you lose convenience, not control. |
| **`[permissions.app-dev-core...]` table shape** | Custom profiles are documented; the exact nested key shape should be confirmed against your Codex version. | Codex errors loudly if wrong. Fall back to the built-in `:workspace` profile. |
| **Branch protection** | Workflow YAML does not prove it [R08]. | Set it, then open a trivial PR and confirm `check-runs total_count > 0` [R05]. That is the exact step Signal skipped. |

## First run

```bash
git init && git add -A && git commit -m "chore: bootstrap app-dev-core"
npm ci
npx tsc --noEmit             # then try the fail: [] experiment above
npm run verify               # drift gate + registry + fixtures
gh repo create app-dev-core --private --source=. --push
# branch protection + required check `verify`
# open a trivial PR; confirm check-runs dispatched > 0
```
