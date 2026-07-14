---
name: work-protocol
description: >
  Use at the start of any code change, branch, commit, or pull request in this
  repository. It sequences the app-dev-core workflow: branch and PR boundary
  checks, change classification, when to use a spec or ADR, test-first
  implementation, hosted verify confirmation, drift checks, and the final
  self-check before work is called done.
---

# Work Protocol

Sequence the repository contract. Point to the owner files instead of restating them.

Use `token-wize` alongside this skill on every task.
For larger approved planned or gated work, or when implementing a material spec, use the available Superpowers skills for planning and execution support, but keep durable plan artifacts out of this repository and use the PR plus `.work/` for transient planning notes instead.

## 1. Read the live owners first

- `AGENTS.md`
- `VERIFY-BEFORE-USE.md`
- `docs/operating-model/operating-model.md`
- `governance/rules.ts`
- `standards/development.md`

Use the live repository state as truth if an older note disagrees.

## 2. Check the branch and PR boundary before editing

1. Check the current branch.
2. If the branch is `main`, create a feature branch first.
3. If the branch already has an open PR, check whether it has already been reviewed.
4. If the work is a separate concept, a follow-up after review, or would change the PR's acceptance story, stop and create a new PR instead of silently extending the existing one.

## 3. Keep scratch and records in the right place

- Keep transient notes and agent scratch in `.work/`.
- Keep the change record in the PR body.
- Do not add task ledgers, receipt files, or permanent worker logs.

## 4. Classify the change before building it

Use OM §10.1 and record the class in the PR: `direct`, `planned`, or `gated`.

Use a durable spec only when OM §10.5 requires it.

Use an ADR only when the decision changes Tier A or Tier B principles, changes the major OM version, or promotes a product-proven pattern into a shared core surface under §14.2.

## 5. Build test-first

For feature or bug-fix work, follow OM §9.5:

1. Reproduce the behavior or defect.
2. Add the smallest failing test.
3. Confirm the failure is for the intended reason.
4. Implement the minimum change.
5. Get the test green.
6. Run `npm run verify`.

## 6. Recompile generated governance artifacts when needed

If `governance/rules.ts` or `governance/grammar.ts` changes:

1. Run `npm run governance:compile`.
2. Run `npm run governance:check`.
3. Re-read generated outputs for accidental drift.

## 7. Verify with hosted evidence, not only local evidence

Local green is the preflight. Completion still needs the hosted verdict described in OM §8.1 and §11.4:

1. Push the branch.
2. Open or update the PR against `main`.
3. Confirm hosted `verify` ran on the exact commit you are claiming.
4. Treat zero dispatched checks as failed verification.

## 8. Check drift, stale references, and completion quality before stopping

- Confirm the owner file changed when the change touched a governed fact from OM §5.
- Re-read touched docs for stale rule IDs, paths, commands, and claims about generated artifacts.
- Self-check that the accepted scope, plan, and task work are fully completed to the expected quality rather than only locally green.
- Confirm `VERIFY-BEFORE-USE.md` still matches what is actually proven if first-use or release posture changed.

## 9. Use the stop gate as the finish line

Run OM §11.4 as the final completion test.

The short version is:

- outcome achieved
- acceptance satisfied
- plan or spec work fully completed at the expected quality
- conformance line present
- TDD or regression evidence green
- hosted CI green on this commit
- checks dispatched
- rollback proportionate
- boundary intact
- nothing else required for safe use
