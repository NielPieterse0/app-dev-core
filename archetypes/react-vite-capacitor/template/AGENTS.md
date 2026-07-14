# __app_title__

Rename the product identity before real feature work starts.

## Read first

- `VERIFY-BEFORE-USE.md`
- `docs/product.md`
- `docs/operating-model-reference.md`
- `app-dev.manifest.json`
- `.agents/skills/product-workflow/SKILL.md`

## Working shape

- `src/domain/` holds pure logic.
- `src/data/ports/` holds interfaces.
- `src/data/adapters/` holds concrete adapters behind those ports.
- `src/features/` composes domain logic with ports.
- `src/ui/` holds platform-free components.
- `src/platform/` is the only place for browser, device, storage, or Capacitor concerns.

## Commands

```bash
npm run verify
npm run release:check
```

## Boundaries

- Keep concrete adapter selection in `src/platform/composition.ts`.
- Keep Node/TypeScript as the scripting surface in `scripts/`.
- Keep change records in pull requests rather than adding plan or receipt files.
- Keep docs short and operational; point to owning files instead of restating them.

## Before larger work

- Fill in `docs/product.md`.
- Update `app-dev.manifest.json` if the risk profile or baseline changes.
- Replace the placeholders in `specs/000-product-foundation/spec.md` before real feature work.
- Add tests at the boundary that can actually detect the defect.
