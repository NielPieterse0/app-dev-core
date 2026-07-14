# archetypes/react-vite-capacitor

**Empty. Deliberately.** [OM §10.5]

An archetype is *extracted from a shipped product*, never authored from imagination.
The previous repository completed two governance-hardening cycles before producing an
app. Writing an archetype here, now, would be that mistake with better handwriting.

## What fills this

**Stage 1** [ADR-001]: the Tier-1 harvest from Signal — `lib/env.ts` (which refuses
`sb_secret_*` and `service_role` in browser env: a security control, not boilerplate),
the Supabase client (fixed to PKCE + the `KeyValueStore` port), the app shell, the test
harness, and the public-launch-readiness gate (rewritten in Node).

Laid out in the OM §6 grammar, with `platform/{native,ios,android,desktop}` created
empty and the R33 isolation rule on from commit one.

## Status

`experimental` until a product generated from it has **shipped** (Fieldnote, Stage 2).
Supported because something shipped from it — not because it exists.
