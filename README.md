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
npm run verify               # drift gate + registry + fixtures + generator + clean-room archetype
npm run governance:compile   # after editing the registry
```
