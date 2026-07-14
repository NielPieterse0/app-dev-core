# app-dev-core

Development control plane: archetypes, generator, schemas, enforcement.

**Governance is compiled, not documented.** `governance/rules.ts` is the single source
of truth for the rules compiled in this repository. The enforcement register, the PR
template and the Codex hooks are generated from it; CI fails on any drift between the
registry and its outputs.

The reason is simple: every hand-maintained copy of a rule is a copy, and copies diverge.
Documentation cannot prevent drift, because documentation *is* the drift.

| Read | For |
|---|---|
| `governance/rules.ts` | **The compiled core rules** enforced from this repository. |
| `docs/operating-model/operating-model.md` | Principles, grammar, architecture, deferrals |
| `AGENTS.md` | Agent routing. Owns nothing. |
| `VERIFY-BEFORE-USE.md` | Proven vs unverified. Read before trusting a green build. |

```bash
npm ci
npm run verify               # drift gate + registry + fixtures + generator + clean-room archetype
npm run release:check        # hosted GitHub settings + public-repo security/privacy posture
npm run governance:compile   # after editing the registry
```

## Public repository baseline

This repository is meant to be publishable without hidden setup knowledge.

- `SECURITY.md` defines the private vulnerability-reporting path.
- `npm run release:check` verifies hosted branch protection, workflow permissions, check dispatch, Dependabot configuration, secret-scanning posture, private vulnerability reporting, and public commit-email hygiene.
- Personal email addresses are not an accepted public commit identity here; the release gate expects GitHub noreply or other service-safe addresses only.

## Getting started

```bash
npm ci
npm run verify
npm run release:check
```

`verify` proves the repository tree and generated artefacts.
`release:check` proves the hosted GitHub surface that the tree alone cannot see.
