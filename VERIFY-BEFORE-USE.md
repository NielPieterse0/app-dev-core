# Verify before first use

What is **proven** in this kit and what you **must check**. `missing` is not `passed`,
and that applies to this kit as much as to anything it governs [R07].

## Proven — executed and confirmed here

| Item | Evidence |
|---|---|
| `governance/compile.ts` | Compiled 4 artefacts from 20 rules. |
| **Drift gate** | Hand-edited a generated hook → `governance:check` **exit 1, DRIFT reported**. Recompiled → clean. |
| Compiled `guard-destructive.mjs` | `git push --force` → **blocked (exit 2)**. `npm run verify` → **allowed (exit 0)**. |
| Compiled `guard-grammar.mjs` | `docs/plans/x.md` → **blocked, cites [R18]**. |
| `scripts/verify-core.ts` | Runs the registry against this repo → **verdict: passed, 16 CI rules**. |
| `scripts/release-check.ts` | Executed against the live public repo → **verdict: passed** for branch protection, workflow permissions, hosted check dispatch, Dependabot security updates, secret scanning, private vulnerability reporting, and public commit-email hygiene. |
| `tests/generate.test.ts` | External generation passes, reserved paths are restored, and unresolved tokens fail the run. |
| `scripts/test-archetype.ts` | Generates a clean-room product repo, runs `npm ci`, then `npm run verify` → **verdict: passed**. |

## Not proven — check on first clone

| Item | Why | Action |
|---|---|---|
| **`.codex/rules/default.rules`** | Codex rules are experimental; the syntax here is best-effort and may not parse. | Check the Codex rules docs. Nothing critical depends on it — every rule is also a hook and a CI check. If rules fail to load you lose convenience, not control. |
| **`[permissions.app-dev-core...]` table shape** | Custom profiles are documented; the exact nested key shape should be confirmed against your Codex version. | Codex errors loudly if wrong. Fall back to the built-in `:workspace` profile. |

## First clone evidence — 2026-07-14

| Item | Result |
|---|---|
| `npm install` | Passed; lockfile generated. Initial Vitest/Vite advisory surface was fixed by updating dev dependencies and adding `@types/node`. |
| `npx tsc --noEmit` | Passed. During first-use validation, the temporary `fail: []` experiment failed to compile as intended. |
| `npm audit --json` | Passed with 0 vulnerabilities. |
| `npm run verify` | Passed locally with governance, registry, fixture, generator, and clean-room archetype checks. |
| `npm run release:check` | Passed locally against the live public repo with hosted branch protection, workflow permissions, secret scanning, private vulnerability reporting, and public commit-email posture all green. |
| Hosted `verify` | Passed on first push to `main`, run `29303887504`, commit `6588897b77e3df27cca33e762cc78b2dac5aabc5`. |
| Branch protection | Confirmed after the repository became public: PR required, strict `verify`, force-push disabled. |

## First run

```bash
git init && git add -A && git commit -m "chore: bootstrap app-dev-core"
npm ci
npx tsc --noEmit             # then try the fail: [] experiment above
npm run verify               # drift gate + registry + fixtures + generator + clean-room archetype
npm run release:check        # hosted GitHub settings + secret scanning + public email/privacy posture
gh repo create app-dev-core --public --source=. --push
# branch protection + required check `verify`
# open a trivial PR; confirm check-runs dispatched > 0
```
