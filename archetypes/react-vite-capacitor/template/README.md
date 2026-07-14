# __app_title__

Web-first, native-ready product bootstrap generated from the `app-dev-core`
React/Vite/Capacitor archetype.

## Quick start

```bash
npm install
npm run verify
npm run release:check   # after the repo is pushed, gh is authenticated, and hosted verify is green
```

## Read first

- `AGENTS.md`
- `VERIFY-BEFORE-USE.md`
- `docs/product.md`
- `.agents/skills/product-workflow/SKILL.md`

## What this bootstrap includes

- OM-aligned source layout under `src/domain`, `src/data`, `src/features`,
  `src/ui`, and `src/platform`
- Node-only `verify` and `release:check` entry points
- Repo-local Codex permissions owned by `.codex/config.toml`
- `verify` covers structure, secret scan, typecheck, lint, tests, build, and browser E2E
- The six required capability ports plus web adapters
- Browser Supabase env and PKCE client guards for products that later adopt
  Supabase
- A small example item flow proving the archetype wiring end to end

## What to replace early

- Rename the product identity in `package.json`, `app-dev.manifest.json`, and
  the visible UI copy.
- Replace the example `Item` flow with the product's real first domain slice.
- Fill in `docs/product.md` and `specs/000-product-foundation/spec.md` before
  material feature work begins.

## Native slots

`src/platform/native`, `src/platform/ios`, `src/platform/android`, and
`src/platform/desktop` are present on purpose but stay empty until a real
delivery requirement activates them.

Generated root-level `android/` and `ios/` projects stay ignored build output
until native delivery is actually activated.
