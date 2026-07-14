# Verify before first use

What is proven in this kit and what you must still check. `missing` is not `passed`,
and that applies to this kit as much as to anything it governs [R07].

## Proven - executed and confirmed here

| Item | Evidence |
|---|---|
| `governance/compile.ts` | Compiled 4 artefacts from 16 rules. |
| Drift gate | Hand-edited a generated hook -> `governance:check` exited 1 with DRIFT reported. Recompiled -> clean. |
| Compiled `guard-destructive.mjs` | `git push --force` -> blocked (exit 2). `npm run verify` -> allowed (exit 0). |
| Compiled `guard-grammar.mjs` | `docs/plans/x.md` -> blocked, cites [R18]. |
| `scripts/verify-core.ts` | Runs the registry against this repo -> verdict: passed, 15 CI rules. |

## Not proven - check on first clone

| Item | Why | Action |
|---|---|---|
| `.codex/rules/default.rules` | Codex rules are experimental; the syntax here is best-effort and may not parse. | Check the Codex rules docs. Nothing critical depends on it - every rule is also a hook and a CI check. If rules fail to load you lose convenience, not control. |
| `[permissions.app-dev-core...]` table shape | Custom profiles are documented; the exact nested key shape should be confirmed against your Codex version. | Codex errors loudly if wrong. Fall back to the built-in `:workspace` profile. |

## Current baseline evidence - 2026-07-14

| Item | Result |
|---|---|
| `npm install` | Passed; lockfile generated. Initial Vitest/Vite advisory surface was fixed by updating dev dependencies and adding `@types/node`. |
| `npx tsc --noEmit` | Passed. During first-use validation, the temporary `fail: []` experiment failed to compile as intended. |
| `npm audit --json` | Passed with 0 vulnerabilities. |
| `npm run verify` | Passed locally on `chore/refresh-first-use-truth`: `governance:check` clean, `verify-core` verdict `passed`, `vitest` 50/50 tests passed. |
| `npm run release:check` | Script exists but is intentionally not implemented. It exits non-zero with an explicit R07-aligned message rather than returning a false green. |
| Hosted `verify` on current `main` | Passed on run `29345019758`, commit `14ea9c46a54f894601d5feca0440e3611780e57f` (PR `#8` merge commit). |
| GitHub repository state | Public repository confirmed via API: `NielPieterse0/app-dev-core`, default branch `main`. |
| Branch protection on `main` | Enabled. Required status checks are strict and include `verify`; force-pushes and deletions are disabled; linear history is required. |
| Pull-request review requirement | One approving review is currently required (`required_approving_review_count = 1`). A reviewer-free sole-operator merge path is not the live configuration. |
| PR `#8` status | Merged on `2026-07-14T15:22:06Z`; merge commit is the current `main` head. |

## Historical bootstrap commands

```bash
git init && git add -A && git commit -m "chore: bootstrap app-dev-core"
npm ci
npx tsc --noEmit             # then try the fail: [] experiment above
npm run verify               # drift gate + registry + fixtures
gh repo create app-dev-core --public --source=. --push
# branch protection + required check `verify`
# open a trivial PR; confirm check-runs dispatched > 0
```
