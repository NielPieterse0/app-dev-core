---
name: product-workflow
description: >
  How to take this archetype from bootstrap to a real product: change
  classification, when a spec is required, the test-first loop, where durable
  docs live, and how to add a second adapter or a platform slot.
---

# Product Workflow

This file explains how to act on the product contract already seeded in this
archetype. The OM owns the rules; this skill shows the working path through
them inside a generated repository.

## 1. First pass

1. Fill in `docs/product.md`.
2. Set the `riskProfile` in `app-dev.manifest.json` from that product definition.
3. Replace the placeholders in `specs/000-product-foundation/spec.md` before real
   feature work begins.
4. Decide whether to keep the example `Item` flow as the first real domain slice
   or delete it and start from the same shape with different names.
5. Run `npm run verify` and keep it green before expanding the product.

## 2. Classify the change before starting it

| Class | Trigger |
|---|---|
| `direct` | Small change with trivial rollback and no new capability, permission, boundary, or public contract change |
| `planned` | New feature, cross-module change, new integration, material dependency, or architecture revision |
| `gated` | Auth, secrets, personal or regulated data, public writes, RLS, destructive ops, live migrations, or populating `src/platform/{ios,android,desktop}` |

Record the class in the PR. If a change grows out of its class, stop and
reclassify it instead of pretending it stayed small.

## 3. When a spec is required

Use a durable spec for:

- product creation
- gated changes
- material features that define a new contract

Location: `specs/NNN-short-name/spec.md`, zero-padded and sequential.

The spec should answer behavior, actors, scope, exclusions, acceptance
criteria, constraints, and data or permission impact. Keep implementation
detail in code and tests, not in the spec.

## 4. Work test-first

Use this loop:

1. reproduce the behavior or defect
2. write the smallest failing test
3. confirm the failure is for the intended reason
4. implement the minimum fix
5. get the test green
6. run `npm run verify`

Closed exceptions: documentation-only changes, pure visual styling where
rendered evidence is the right boundary, generated output tested through the
generator, and time-boxed spikes that never merge untested.

## 5. Expand the architecture by shape

For a new domain slice:

1. add a pure type or rule under `src/domain/`
2. add a port under `src/data/ports/`
3. add an adapter under `src/data/adapters/`
4. extend the matching contract suite under `tests/contract/`
5. compose the use case under `src/features/`
6. render it from `src/ui/`
7. wire the concrete adapter only through `src/platform/composition.ts`

If you add a second adapter for an existing port, add it to the same contract
suite instead of writing a second bespoke adapter test file.

## 6. Durable docs

Use:

- `docs/product.md` for the product definition
- `docs/decisions/ADR-NNN-*.md` for expensive-to-reverse decisions
- `docs/runbook.md` for operating and rollback instructions
- `docs/deviations.md` for deviations that outlive a single PR

Do not add task ledgers, closeout notes, or permanent worker receipts to the
default branch. The PR is the change record.
