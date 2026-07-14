# Verify Before Use

This archetype is a harvested Stage 1 seed, not a fully proven generated product.

## Already in place

- OM-aligned source layout.
- Node-only verification and release-check entry points.
- The six capability ports and web adapters.
- Browser Supabase env and PKCE client guards harvested from Signal.
- Product-side workflow guidance, initial spec seed, and local OM reference.
- Core-side generation restores product-owned workflow and migration paths.
- Core clean-room verification already proved `npm ci` and `npm run verify` on a generated repo.

## Still to prove in a generated product

- Hosted CI dispatch and green status on the generated repo.
- `npm run release:check` against a real GitHub repository.
- Any product-specific runtime, data, or deployment behavior added after generation.
