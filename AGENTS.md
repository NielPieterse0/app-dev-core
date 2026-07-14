# app-dev-core

Reusable development method: archetypes, generator, schemas, enforcement.
No product source. No product migrations.

## Start here

Activate `token-wize` at task start to keep retrieval and turns lean.
Activate `.agents/skills/work-protocol/SKILL.md` before implementing repo changes.

## Rules live in one place

`governance/rules.ts` is the **single source of truth** for the rules this repository compiles.

Nothing else states a rule. The enforcement register, the PR template and the
generated `.codex/hooks/` are **compiled** from it. Files carrying a `GENERATED — DO NOT EDIT`
header are outputs; hand-editing one fails the drift gate in CI.

**To change a rule, change the registry.** Everything else follows, including its tests.

You do not need to memorise anything. Violations are blocked at write time by the hooks
and in CI by `verify-core`. If a rule had to be restated somewhere for you to follow it,
the rule was not enforced — and that is the defect, not your memory.

## Commands

```bash
npm run verify               # drift gate + typecheck + registry checks + fixtures. Green to merge.
npm run governance:compile   # regenerate artefacts after editing the registry
npm run governance:check     # fail if any generated file drifted
npm run typecheck            # prove the root repository compiles under the pinned TypeScript version
npm run verify-core          # run every CI rule against this repository
npm run test-enforcement     # run every rule against its own pass + fail fixtures
```

## GitHub change flow

`npm run verify` is the local preflight, not the hosted verdict.
The change record lives in the pull request body.
Hosted `verify` dispatches from [`.github/workflows/verify.yml`](./.github/workflows/verify.yml) on every PR and on pushes to `main`.
A plain feature-branch push does not satisfy the stop gate here.
Close work only after the PR commit shows the hosted `verify` check with dispatched green status.

## Every change carries this line in the PR

```
Conformance: Lean ? | Efficient ? | Effective ? — <justification, or the trade made>
```

Empty = blocked merge. The three questions are defined in the OM §2.0.

## Where to look

| Question | Answer |
|---|---|
| What are the rules? | `governance/rules.ts`, and its compiled register |
| Where does this file go? | `governance/grammar.ts`. No slot → do not create it; amend the grammar first |
| Is this rule real? | If it is not in the registry, it does not exist |
| How should I work this change? | `.agents/skills/work-protocol/SKILL.md` |
| Should I build this now? | The OM §14 deferral register. Trigger not fired → no |
| What is proven vs unverified? | `VERIFY-BEFORE-USE.md` |
| Which tools and versions? | `standards/development.md` |

## Adding a rule

1. Add an entry to `governance/rules.ts`: id, statement, the defect it answers, a check, a passing fixture, **and at least one failing fixture**.
2. `npm run governance:compile`
3. `npm run verify`

A CI rule with no failing fixture does not compile. That is deliberate. A check that has
only ever seen good input is not a control.

## If a hook blocks you

Read the message; it cites the rule. Do not work around it — ask the operator.
A hook you route around was never a control.

## Stop

OM §11.4. Short form: hosted CI green on this commit, checks actually dispatched,
acceptance met — then stop. Optional improvements are recorded, not done.
