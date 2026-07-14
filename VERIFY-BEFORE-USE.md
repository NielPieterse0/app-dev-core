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
| **Hosted branch protection** | GitHub returned `HTTP 403`: "Upgrade to GitHub Pro or make this repository public to enable this feature." | Make the repository public or upgrade the plan, then protect `main` with required PR review and required check `verify`. |
| **`.codex/rules/default.rules`** | Codex rules are experimental; the syntax here is best-effort and may not parse. | Check the Codex rules docs. Nothing critical depends on it — every rule is also a hook and a CI check. If rules fail to load you lose convenience, not control. |
| **`[permissions.app-dev-core...]` table shape** | Custom profiles are documented; the exact nested key shape should be confirmed against your Codex version. | Codex errors loudly if wrong. Fall back to the built-in `:workspace` profile. |

## First clone evidence — 2026-07-14

| Item | Result |
|---|---|
| `npm install` | Passed; lockfile generated. Initial Vitest/Vite advisory surface was fixed by updating dev dependencies and adding `@types/node`. |
| `npx tsc --noEmit` | Passed. During first-use validation, the temporary `fail: []` experiment failed to compile as intended. |
| `npm audit --json` | Passed with 0 vulnerabilities. |
| `npm run verify` | Passed locally after regenerating governance artifacts. |
| Hosted `verify` | Passed on first push to `main`, run `29303887504`, commit `6588897b77e3df27cca33e762cc78b2dac5aabc5`. |
| Branch protection | Blocked by private-repository GitHub plan limitation; not a file-state failure. |

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
