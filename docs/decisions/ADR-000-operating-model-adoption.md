# ADR-000 — Adopt the App-Dev Core Operating Model

- **Status:** Proposed
- **Date:** 2026-07-12
- **Decision:** Adopt `docs/operating-model/operating-model.md` v1.3.0-rc1 as the authority for `app-dev-core` and every product generated from it.

## Context

`app-dev` accumulated eight commands, five skills, eleven prose standards, eleven JSON
rule registries, hooks, twenty-plus PowerShell scripts, templates, spec templates,
checklists, workflow receipts, plans and audit ledgers — governing **one unshipped app**.

The recorded root cause: **two full governance-hardening cycles were completed before any
app was produced.** Anti-speculative-abstraction is self-applicable, and the workspace
violated its own doctrine.

## Decision

Adopt the OM in full. Its load-bearing mechanisms and the defect each answers are
listed in the OM itself (§2 Tier A/B/C, and the §15 register). They are not repeated
here — repeating them is the drift this ADR exists to end.

The single most important of them, because it would have caught every enforcement
defect in the repository's history: **R23 — every CI rule needs a failing fixture.**
`scan-secrets` excluding `projects/`, the receipt regex missing "pending", and the
obligations script being inert on committed trees *all passed every test they were
ever given*, because none was ever given a test it should fail.

## Consequences

**Accepted cost.** Signal stays on `codex/signal-first-slice` with its known defects. It
is a **quarry, not a reference implementation**, until OM §16 Stage 5. Its defects do not
disappear; they stop blocking.

**Open item.** The OM breaches its own §2.9 line budget (990 vs 700). Resolve by moving
§16 to ADR-001, **not** by raising the cap. Cap inflation is how the previous repository
acquired eleven standards. See the breach note in §2.9.

## Change history

This ADR is where OM change narrative lives. Per OM §3.7, narrative is rank-six evidence
and does not belong in a normative document.

- v0.2.0 → v1.0.0: sequencing inverted; enforcement register added; Node-only; hosted CI from first push
- v1.0.0 → v1.1.0: §2.0 conformance test; §4 grammar; §5 fact ownership; §6 architecture; §14 deferral register
- v1.1.0 → v1.2.0: six capability ports; R33 platform isolation; native-friendly web constraints; PWA promoted ahead of native
- v1.2.0 → v1.3.0: §16 rebuilt as Harvest Register + sequence, grounded in a direct read of the live repository

## v1.5.0 — the Upgrade Contract, Publishing, and Feedback

Added OM §3.8: what a product inherits from the core after independence (§3.5 is
final on content ownership, but five surfaces — manifest honesty, grammar shape,
port-interface stability, platform isolation, the two entry points — have to
survive full content divergence or nothing can ever be diffed against a product
again). Added the publishing mechanism (core → product, pull never push, an
append-only `core/releases.json` plus a read-only `check-updates.ts`) and the
feedback mechanism (product → core, two lanes — `correction` flows back through
an ordinary PR, B1 does not apply; `proposal` for new shared capability is bound
by B1 exactly as designed). New rules R37–R40; REVIEW cap raised 8→10, named,
because two of the four are genuine judgment calls with no CI mechanism until the
§14 audit tooling exists.

**Self-correction, twice, in the same revision:**

1. The v1.4.0 control block kept a per-version narrative blockquote directly
   below a line stating that change narrative belongs in this ADR, not the OM.
   R20 exists to catch exactly this kind of thing when a product does it; it took
   a manual pass to catch it here. Moved. The OM's control block now points here
   in full, with no exception for its own most recent change.
2. §16's "five-stage shape" summary named Fieldnote as the validating second
   product ahead of Signal. In practice, Signal's own independent extraction
   (`NielPieterse0/signal`) is proceeding directly, ahead of that plan. Not a
   violation — a plan meeting reality and changing is the plan working — but it
   was stale prose sitting in a normative document past the point it was true.
   Replaced with a status note; current detail lives in ADR-001.

**Line budget.** v1.4.0 raised the cap to 850 once and said "the next breach
gets a real cut, not a second raise." Held to that: real cuts recovered most of
the new section's cost (moved narrative, delegated mechanics to
`standards/development.md` §7, fixed the Fieldnote/Signal drift), landing at 863
— 13 over. Not closed by a second raise. Reported honestly rather than rounded
off; left as the next real pass's first item.
