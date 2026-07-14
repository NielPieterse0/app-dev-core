# standards/development.md

**Status:** stub. Fill on demand, never in advance (OM §2.8).

The **one** delegated standard. A second standard is created only when this file exceeds
500 lines *and* a clean split exists (OM §2.9). Standard count is capped at 1.

This file owns what the Operating Model deliberately does not: exact tools, versions,
thresholds, fixtures, and procedures.

---

## 1. Toolchain

- Node: pinned in `.nvmrc`. **`.nvmrc` is the owner** (OM §5). This section does not restate it.
- Package manager: `packageManager` in `package.json`.
- Language: TypeScript. **No shell scripts** (OM §7.1, R10).

## 2. Test tooling

| Layer | Tool |
|---|---|
| Unit / contract / enforcement | Vitest |
| Component | Testing Library |
| E2E | Playwright |
| Database / RLS | real local Postgres via Supabase CLI — **never a mocked client** (OM §9.2, R13) |

## 3. Coverage

> **Deliberately empty.** A threshold is added only when a real escape proves the
> current level insufficient (OM §2.8). Coverage is a floor, not proof of test quality.
> Do not add a number here because it feels professional.

## 4. Lint and module boundaries

The R33 platform-isolation rule and the R25 inward-arrow rule live in the archetype's
`eslint.config.js`, because they govern **product** code. This file records only that
they are mandatory. See `archetypes/react-vite-capacitor/eslint.config.js`.

## 5. Database procedure

To be written when the first product needs it — currently Signal's own
independent-extraction work (`NielPieterse0/signal`), not a hypothetical. Not before.

## 6. Slots not yet filled

| Section | Trigger |
|---|---|
| Coverage thresholds | A defect escapes that coverage would have caught |
| Visual regression | Visual meaning becomes material to a product |
| Native test procedure | A `platform/` slot is genuinely populated |
| Performance budgets | A product has users complaining about speed |

An empty slot is honest. A filled slot with no triggering defect is speculation.

## 7. Upgrade Contract mechanics — delegated from OM §3.8

The OM states principle and enforcement; this section states the concrete shape.

### 7.1 `core/releases.json` — publishing ledger

Append-only. One entry per publish, never rewritten:

```json
{
  "version": "1.1.0",
  "date": "2026-08-01",
  "category": "security",
  "affects": { "kind": "archetype", "name": "react-vite-capacitor", "version": "1.1.0" },
  "summary": "KeyValueStore web adapter used an insecure storage default; fixed."
}
```

`category`: `security` (a product must record adoption or a §13 deviation, or
`release:check` fails) · `recommended` (visible, adoption is the product's call) ·
`optional` (visible, never blocks).

### 7.2 `scripts/check-updates.ts` — product-side, read-only

Runs from a product repository (e.g. `npx github:NielPieterse0/app-dev-core#<tag>
scripts/check-updates.ts`). Reads the product's own `app-dev.manifest.json.baseline`,
reads `core/releases.json` from the referenced core tag, and prints every entry
newer than the product's recorded baseline, grouped by category. It writes nothing.
A `security` entry with no corresponding adoption note or `§13` deviation in the
product's own `docs/deviations.md` is the one case `release:check` treats as failed.

### 7.3 Core PR fields — feedback lanes

Added to `app-dev-core`'s PR template, alongside the existing conformance line:

```
Origin: core | product:<name>
Type:   correction | proposal
```

A `proposal` whose diff touches `capabilities/` or promotes archetype content
additionally states the two consuming products it cites. Missing citation on such
a PR is redirected to a new §14 Deferral Register row rather than merged.
