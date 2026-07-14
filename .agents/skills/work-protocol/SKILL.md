---
name: work-protocol
description: >
  Use at the start of any code change, branch, commit, or pull request in this
  repository. It sequences the required app-dev-core workflow: branch
  discipline, change classification, when to use a spec or ADR, test-first
  implementation, hosted verify confirmation, drift and stale-reference checks,
  and the stop gate before work is called done.
---

# Work Protocol

Sequence the repository contract. Point to the owning files instead of restating them.

- Use `C:/Users/piete/.codex/.agents/skills/token-wize/SKILL.md` alongside this skill on every task to keep execution lean without skipping required verification.
- For larger approved planned or gated work, or when implementing a material spec, use `C:\Users\piete\.codex\plugins\cache\openai-curated\superpowers`, but keep durable plan artifacts out of this repository and use the PR plus `.write/` for transient planning notes instead.

## 1. Read the live owners first

Read these before changing behavior:

- `AGENTS.md`
- `VERIFY-BEFORE-USE.md`
- `docs/operating-model/operating-model.md`
- `governance/rules.ts`
- `standards/development.md`

Use the current repository state as truth if an older note or summary disagrees.

## 2. Start from the right branch and scratch space

1. Check `git branch --show-current`.
2. If the branch is `main`, create a feature branch before editing.
3. Keep temporary notes, drafts, and agent scratch in `.write/`.
4. Keep the change record in the PR body, not in task ledgers or receipt files.

## 3. Classify the change before building it

Use OM §10.1 and record the result in the PR:

- `direct`
- `planned`
- `gated`

Use a durable spec only when OM §10.5 says one is needed.

Use an ADR only when the decision crosses the OM trigger now stated in OM §5:

- Tier A or Tier B principle change
- major OM version change
- §14.2 product-proven pattern promotion into a shared core surface

Routine direct or planned changes stay in the PR unless they also cross one of those boundaries.

## 4. Build test-first

For feature or bug-fix work, follow OM §9.5:

1. Reproduce the behavior or defect.
2. Add the smallest failing test.
3. Confirm the failure is for the intended reason.
4. Implement the minimum change.
5. Get the test green.
6. Run `npm run verify`.

If the work is docs-only, generated-output-only, or another closed exception from OM §9.5, check that section before treating it as exempt.

## 5. Recompile generated governance artifacts when needed

If `governance/rules.ts` changes:

1. Run `npm run governance:compile`.
2. Run `npm run governance:check`.
3. Re-read the generated outputs you touched for accidental drift.

Do not hand-edit generated files as the source of truth.

## 6. Verify with hosted evidence, not only local evidence

Local green is the preflight. Completion still needs the hosted verdict described in OM §8.1 and §11.4:

1. Push the branch.
2. Open or update the PR against `main`.
3. Confirm the hosted `verify` check ran on the exact commit you are claiming.
4. Treat zero dispatched checks as failed verification, not a harmless omission.

## 7. Check drift and stale references before stopping

Before calling the work done:

- Confirm the owner file changed when the change touched a governed fact from OM §5.
- Self-check that the accepted plan, spec scope, and task list are fully completed to the intended quality rather than only locally green.
- Re-read touched docs for stale rule IDs, file paths, commands, and claims about generated artifacts.
- Confirm `VERIFY-BEFORE-USE.md` still matches what is actually proven if you changed any first-use or release posture.
- Check `docs/deviations.md` if this change depends on an active deviation or expiry.

## 8. Use the stop gate as the finish line

Run OM §11.4 as the final checklist for completion.

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

If one of those is still open, the task is not done yet.
