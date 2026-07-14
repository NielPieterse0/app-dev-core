# Operating Model Reference

This is a local reading copy for generated products, not the owner of any rule.
If it drifts from the real OM adopted by the product baseline, refresh it.

## What this archetype already implements

| Surface | Where it lives | Current mechanism |
|---|---|---|
| Product grammar | repository layout | `scripts/verify-structure.ts` plus `.codex/hooks/guard-grammar.mjs` |
| Node-only tooling | `scripts/`, hooks, workflow surface | `scripts/verify-structure.ts` |
| Two public entry points | `package.json` | `scripts/verify-structure.ts` |
| Capability-port boundary | `src/data/ports/capability/` + `src/platform/` | type surface plus `tests/contract/capability-ports.contract.ts` |
| Example domain-port contract | `src/data/ports/ItemRepository.ts` | `tests/contract/item-repository.contract.ts` |
| Platform isolation | `src/platform/**` only | `eslint.config.js` and `scripts/verify-structure.ts` |
| Browser Supabase guard | `src/platform/web/adapters/` | env parsing tests plus seeded PKCE client wiring |
| Canonical product verification | `scripts/verify.ts` | structure, typecheck, lint, tests, build |
| Hosted verify workflow | `.github/workflows/verify.yml` | root-level GitHub Actions workflow |
| PR evidence contract | `.github/pull_request_template.md` | required PR shape for generated repos |

## What stays intentionally unproven in the seed

- Real hosted GitHub evidence from a generated standalone repo
- `release:check` against a pushed product repository
- Backend-specific release gates once a product adds public writes or auth
- Native adapters for `src/platform/native`, `ios`, or `android`

Those are product-stage proofs, not something this archetype can honestly claim
before generation and use.
