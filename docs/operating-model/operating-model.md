# App-Dev Core Operating Model

| Field | Value |
|---|---|
| **Document** | App-Dev Core Operating Model |
| **Version** | 1.5.0 |
| **Status** | **Approved** |
| **Date** | 2026-07-13 |
| **Owner** | Operator (sole) |
| **Supersedes** | 1.4.0 → 1.3.0-rc1 → 1.2.0-rc1 → 1.1.0-rc1 → 1.0.0-rc1 → draft 0.2.0 |
| **Scope** | `app-dev-core` and every product repository that adopts an App-Dev Core baseline |
| **Reference** | `app-dev` is a frozen quarry (§16, full detail in ADR-001). It holds no authority. |
| **Change history** | `docs/decisions/ADR-000-operating-model-adoption.md`, in full — including this version's. Per §3.7 and R20, this document does not narrate its own changes; the last revision kept a version blockquote here in spite of saying exactly that, which was the defect. |

---

## 1. How to Read This

### 1.1 Applicability

| Marker | Meaning |
|---|---|
| **[C]** | The `app-dev-core` repository |
| **[P]** | A product repository |
| **[B]** | Both, independently, inside each repository |

"Repository" in a **[B]** rule means *each* repository separately. It never implies a shared workspace, history, CI job, or inherited authority.

### 1.2 Normative language

`MUST` / `MUST NOT` — mandatory, and listed in §15. `SHOULD` — expected; deviation requires a §13 record. `MAY` — optional.

There is no "MUST normally." A rule is mandatory with a **closed** exception list, or it is a SHOULD.

### 1.3 Enforcement classes

| Class | Meaning |
|---|---|
| **CI** | A machine check fails the build if violated |
| **GATE** | A platform setting or tool refuses the action |
| **REVIEW** | Detected only by inspection at PR time. Accepted as weak, and counted. |

**A `MUST` not listed in §15 does not exist.** §15 is the authoritative rule list; this prose is its explanation.

### 1.4 Delegation

This document owns invariants: boundaries, grammar, ownership, lifecycle, minimum controls. Tool versions, thresholds, fixtures, and platform procedures belong in `standards/development.md` — the single delegated standard. A delegated standard MUST NOT contradict or silently expand this document.

### 1.5 The operator is one person

There is one human. "Core owner," "product owner," and "approver" are the same person wearing hats. Therefore:

- self-approval is **not** a control and MUST NOT be used as one;
- no review step may have the author as its only reviewer;
- every load-bearing control lives in CI, a GATE, or a test.

Where a deliberate pause appears (production deploy, destructive migration), its purpose is a stop-and-think, not independent oversight. It is labelled as such.

---

## 2. Principles

### 2.0 The Principle Conformance Test [B] — *the operative rule of this document*

**Every change — a line of code, a file, a script, a rule, a standard, a directory, an archetype, a section of this Operating Model — MUST pass three questions before acceptance.** *(REVIEW — §15-R00, mandatory PR field)*

| | Question | Fails when |
|---|---|---|
| **LEAN** | Is this the smallest thing that satisfies the accepted requirement? | A simpler form exists · it anticipates a need that has not arrived · it duplicates a fact that already has an owner (§5) · it has no legal slot (§4) |
| **EFFICIENT** | Does its value exceed its lifetime cost — maintenance, drift, learning, debugging, execution, context, deletion? | It adds a taxonomy, artifact type, or entry point without deleting one · it burns Codex context on every task for occasional value · nothing in the system would break if it were deleted |
| **EFFECTIVE** | Does it actually *do* the thing? Would it catch the defect it exists to catch? | It is prose where a machine check was possible · it has never been run against failing input (§15-R23) · it duplicates an existing green check · the thing it claims to enforce is unenforceable |

**Recording.** The PR body carries one line: `Conformance: Lean ✓ | Efficient ✓ | Effective ✓ — <one clause of justification, or the trade made>`. That single line is the entire governance overhead of a routine change. It is not a receipt; it is the decision.

**Escalation.** A change that fails LEAN is cut down or rejected. A change that fails EFFICIENT must delete something to pay for itself (§2.9). A change that fails EFFECTIVE is either promoted to a real enforcement mechanism or **deleted — it is decoration**.

**Self-application.** This test applies to this Operating Model, to `app-dev-core`, and to every governance mechanism proposed here, exactly as it applies to product code. No exemption exists.

---

### Tier A — Shape invariants
*Decided once. Retrofit-hostile. Change = major OM version.*

| # | Principle | Lesson encoded |
|---|---|---|
| **A1** | **One product, one repository.** The repository is the atomic unit of ownership, CI, permission, version, and release. | Root-relative scripts; nested workflows invisible to GitHub Actions; coupled release history |
| **A2** | **Placement law.** An artifact type with no defined slot in the Directory Grammar (§4) MUST NOT be created. New type → amend §4 first, in its own PR. | *The anti-entropy rule.* The direct cause of "start lean, then things get out of order" is artifacts inventing their own homes |
| **A3** | **Fact-ownership register.** Every governed fact has exactly one owner, and the fact→owner map is itself a committed artifact (§5). | Drift is archaeology without a map. README vs `.codex/config.toml` permission contradiction |
| **A4** | **Slot before fill.** The product shape contains a slot for every app type and capability from day one. Slots are **empty**, never **absent**. | Adding iOS, Android, or a backend must never restructure the repository |
| **A5** | **Platform is a capability, not a product type.** Dependency arrows point inward. `platform/*` is reachable only through a port declared in `data/` or `features/`. | The only mechanism that keeps web + iOS + Android cheap over time |
| **A6** | **One tooling language: Node/TypeScript.** Dev, CI, generators, validators, platform wrappers. | Seven confirmed PowerShell defects: `[bool]` vs `[switch]` silent failure, `cmd.exe`, backslash paths, `powershell` binary name on `ubuntu-latest` |
| **A7** | **Executable truth.** Scripts, config, tests and CI *are* the system. Prose *describes* it. Two entry points, forever: `verify`, `release:check`. | Fragmented validation made "is this mergeable?" unanswerable |
| **A8** | **Provenance recorded, authority not inherited.** A product records the baseline it came from. It inherits nothing live. | Template-parity coupling; transitive `AGENTS.md` authority across siblings |

### Tier B — Growth governors
*How detail is permitted to enter.*

| # | Principle | Lesson encoded |
|---|---|---|
| **B1** | **Two instances before abstraction.** Nothing is shared until two products have independently proven it. **The core itself is subject to this.** | Two full governance-hardening cycles completed before any app was produced |
| **B2** | **Every mechanism cites its defect.** A new control names the confirmed defect, repeated failure, security risk, or external obligation that justifies it. "Best practice," "another framework has it," and "a future app might need it" are **not** citations. | Governance accreted with no triggering failure |
| **B3** | **Complexity budget with forced trade.** Hard caps (§2.9). Adding past a cap requires deleting something. | A budget asserted but never instrumented never binds |
| **B4** | **Deferral register.** Everything anticipated but unbuilt is **named, located, owned, and given an activation trigger** (§14). Reviewed each minor release; untriggered after a year → deleted, not carried. | The mechanism that lets the full picture be held without being built |
| **B5** | **Deletion is a first-class change.** Retention classes: durable / historical / ephemeral. Ephemera never reaches the default branch. | `.superpowers/` reports, superseded plans, closeout ledgers polluting the search and context surface |
| **B6** | **One stop rule.** §11.4. Not three. | `converge` phase: named in standards, backed by a template, never instantiated across three specs |

### Tier C — Truth rules
*What counts as known, and as done.*

| # | Principle | Lesson encoded |
|---|---|---|
| **C1** | **Enforcement or it is not a rule.** Every MUST maps to CI or GATE. A MUST that maps to neither is demoted to advice or deleted. §15 is authoritative. | Commands layer never invoked; `check-spec-artifacts.ps1` validated label *existence*, not value |
| **C2** | **Every validator needs a failing fixture.** A check only ever run against good input is not a control. | `scan-secrets.ps1` blanket-excluded `projects/`; receipt validator's regex missed "pending"; `get-workflow-obligations.ps1` inert on committed trees. **All three would have been caught by C2 alone.** |
| **C3** | **Hosted CI is the sole referee.** From first push, not first release. `check-runs total_count: 0` is **red**, not absent. | "CI verified" receipts backed only by local Codex runs |
| **C4** | **Missing ≠ passed.** Six canonical result states. No aggregate pass while any required check is `missing`, `blocked`, or `not-run`. | False-green closure |
| **C5** | **Evidence hierarchy.** Code > tests > hosted CI > release checks > spec status > narrative. A document that says "closed" is rank six. | Spec 007 declared closed in commits and audits while its own receipt recorded CI as unobserved |
| **C6** | **Test at the boundary that can detect the defect.** Mocks cannot prove RLS. Web tests cannot prove native. | Supabase migrations contract-tested via mocked client only |
| **C7** | **The record medium is the pull request.** Durable specs only for gated work. No receipts, no tasks files, no checklists. | Receipt burden produced ceremony instead of evidence |

### 2.9 Complexity budget — hard caps

| Asset | Cap | Current |
|---|---:|---:|
| Operating Model | 850 lines | **863 — ⚠ 13 over, see note** |
| Delegated standards | 1 | 1 |
| Enumerated taxonomies | 3 | 3 (change class · risk profile · result state) |
| Repository entry points | 2 + 4 core-only | 2 + 4 |
| Mandatory artifacts per routine change | 0 | 0 |
| REVIEW-class rules in §15 | **10** *(raised once — see note)* | 10 |

Exceeding a cap requires **deleting something else** or amending this table in a major OM release with a named triggering defect. The REVIEW cap exists because REVIEW rules are the weakest and cheapest to add; they must stay scarce or they become wallpaper. Full history of every prior line-budget and REVIEW-cap decision: `docs/decisions/ADR-000-operating-model-adoption.md` — this table states only the live number and the current, open question.

> **Line budget: 13 over, real cuts made, honestly not fully closed.** Cut in this revision, none of it citation content: the version blockquote the OM kept in spite of saying it wouldn't (−6), the historical budget-breach retrospective (−13, now in ADR-000), §16's now-stale five-stage plan replaced with a status note reflecting what's actually happening — Signal extracting directly rather than following the original Fieldnote-first sequence (−17), and one piece of dead per-version commentary (−2). §3.8 itself was also written lean the first time — mechanics delegated to `standards/development.md` §7, not embedded here. The remaining 13 lines are **not** closed by a second cap raise (v1.4.0 already used that once) or by cutting Tier A/B/C's citations (rejected once already, same reasoning). Left open for the next real pass, honestly reported rather than hidden in a rounded-off number.
>
> **REVIEW cap: raised once, 8→10, named.** Two new judgment calls with no CI mechanism yet: port-interface-stability (R38) and cross-repository citation quality (R40). Both graduate to CI when the §14 audit tooling exists. No further REVIEW capacity without an equally named defect.

---

## 3. Repository Law [B]

### 3.1 Layout

```text
<projects-root>/
├── app-dev/         # frozen reference. No authority. No development.
├── signal/          # independent product repository
├── app-dev-core/    # independent core repository (Stage 3 — not before)
└── <product-n>/     # independent product repositories
```

Sibling placement is filesystem convenience. It creates **no** authority, build, runtime, Git, CI, or release relationship.

### 3.2 Roles

**Core [C]** contains only: this Operating Model, `standards/development.md`, core ADRs, archetypes, the generator, schemas, core tests. It MUST NOT contain product source or product migrations. *(CI — R04)*

**Product [P]** MUST contain everything required to install, build, test, verify, run, deploy, release and maintain itself, from a clean clone, with no core checkout present. *(CI — R03)*

### 3.3 Prohibited dependencies — the load-bearing rule

A product MUST NOT: *(CI — R02; GATE — generator refuses to emit)*

- reference `../` or any sibling path in build, test, CI, deploy or release;
- require a core checkout to interpret its own specifications;
- inherit `AGENTS.md`, skills, hooks, rules or permissions from a sibling repository;
- share core Git history;
- rely on core CI to prove product readiness;
- use the core repository as a runtime library;
- assume a newer core version applies to it automatically.

The core MUST NOT silently edit product-owned files, merge product changes, deploy a product, or claim product release readiness from a core audit. *(GATE — audit tooling is read-only by construction)*

### 3.4 No transitive authority

A core `AGENTS.md`, standard, hook or permission profile has **zero** effect in a product repository. A product adopts a core rule only when that rule is generated or vendored locally, or accepted through a reviewed upgrade.

### 3.5 Ownership after generation

After generation, **every file in the product repository is product-owned**, including files the core emitted. Provenance grants no edit authority. Template parity is not permanent equality. Intentional divergence is allowed and recorded.

### 3.6 Authority inside a repository

```text
Operating Model
  ↓  standards/development.md · risk profile
  ↓  AGENTS.md · ADRs
  ↓  .codex config · scripts · tests · CI       ← executable truth
  ↓  active specification
  ↓  implementation
```

A product may **tighten** a core minimum. It MUST NOT weaken one without a §13 deviation.

### 3.7 Evidence authority — conflict resolution *(C5)*

Strongest first:

1. current code and configuration
2. automated test and validation output
3. hosted required CI on the relevant commit
4. release / operational checks
5. current specification status
6. human narrative — receipts, closeout notes, audit ledgers

A document that says "closed" is rank six. It never becomes authority by asserting itself. *(REVIEW — R09)*

### 3.8 The Upgrade Contract, Publishing, and Feedback [B]

§3.5 is final: content is product-owned the instant it's generated. But a product
that inherits *nothing* stable can never be diffed, proposed to, or audited again.
This section names what survives content divergence — replacing the file-for-file
template-parity model D10 already rejected — and how updates flow in both
directions. Mechanics (ledger schema, script behaviour, PR field syntax) are
delegated to `standards/development.md` §7 per §1.4; this section states
principle and enforcement only.

**What a product inherits — five surfaces, never their content:**

| # | Surface | Enforcement |
|---|---|---|
| 1 | Provenance manifest `baseline` stays honest — never deleted, never silently stale | CI — R37 |
| 2 | Directory grammar isn't restructured, post-generation as much as at creation | CI — R24 |
| 3 | Port interfaces are the vendored unit — an interface change needs a §13 deviation; `riskProfile` stays current | REVIEW — R38 |
| 4 | Platform-isolation boundary stays enforced, whatever the mechanism | CI — R33 |
| 5 | `verify`/`release:check` remain the only two entry points | CI — R21 |

Never inherited: dependency versions, implementation, file contents (§3.5) ·
any obligation to adopt a capability · automatic application of an upgrade —
every mechanism here produces a patch or a PR, never an overwrite.

**Publishing (core → product): pull, never push.** §3.3 already forbids the core
writing to a product; publishing can only mean making something discoverable, via
an append-only `core/releases.json` and, once a product actually consumes upgrades,
a read-only `scripts/check-updates.ts` (product-side). The one thing that can't be optional is the decision: a
`security`-category entry with no adoption and no §13 deviation fails
`release:check`; `recommended`/`optional` entries are visible and never block.
*(CI — R39. Cheap enough to build now — no B1 threshold, no second product
required. Smaller than the §14 drift-audit machinery, which stays deferred.)*

**Feedback (product → core): two lanes, named at the door.** A **correction** to
code the core already owns flows back through an ordinary PR, classified under
§10.1 — B1 does not apply, the pattern is already shared. A **proposal** for new
shared capability *is* bound by B1: every core PR states `Origin`
(`core`/`product:<name>`) and `Type` (`correction`/`proposal`); a proposal
touching `capabilities/` cites two independently consuming products or is
redirected to §14. *(REVIEW — R40 — the existing B1 check extended from "always
empty" to "empty until two citations exist," not a new taxonomy.)*

---

## 4. Directory Grammar — the Placement Law [B] *(A2, A4)*

> **Rule.** Every artifact type has exactly one legal slot. An artifact type with no slot in this section MUST NOT be created. Amending this grammar is a separate PR and a **major** OM version. *(CI — R24: structure check rejects unknown top-level paths and unknown artifact types)*
>
> This is the section that prevents "lean → disorder." Disorder is not caused by too few rules. It is caused by artifacts arriving with nowhere to go, and inventing a home. Then the same fact lives in five places and drift becomes archaeology.

### 4.1 Product grammar

Every slot exists in every product from day one. **Empty is a valid state. Absent is not.**

```text
<product>/
├── AGENTS.md                  # ≤200 lines. Purpose, boundaries, commands, prohibitions, stop rule.
├── README.md                  # Human onboarding. Points; does not restate.
├── app-dev.manifest.json      # Provenance. Baseline versions. Risk profile.
├── package.json               # verify · release:check · archetype checks
├── .nvmrc · lockfile          # Pinned toolchain
├── .env.example               # Placeholders only. Never real values.
│
├── .codex/                    # config.toml · rules/ · hooks/    → permissions, this repo only
├── .agents/skills/            # Task workflows. Progressive disclosure. Vendored, not linked.
├── .write/                    # Ephemeral agent scratch. Gitignored. Never committed.
├── .github/workflows/         # ROOT-LEVEL ONLY. Nested paths are invisible to Actions.
│
├── src/
│   ├── domain/                # Pure logic. Imports nothing. No DOM, no device, no network.
│   ├── data/
│   │   ├── ports/             # Interfaces. The contract.
│   │   │   ├── <domain ports> # e.g. ConceptRepository, SourceItemRepository
│   │   │   └── capability/    # ★ THE SIX. Required in every product (§6.5).
│   │   │       ├── KeyValueStore.ts
│   │   │       ├── LinkOpener.ts
│   │   │       ├── FileExporter.ts
│   │   │       ├── AppLifecycle.ts
│   │   │       ├── DeepLink.ts
│   │   │       └── NetworkStatus.ts
│   │   └── adapters/          # supabase/ · local/ · http/     → one per domain port
│   ├── features/              # Use cases. Composed from domain + ports. Platform-free.
│   ├── ui/                    # Components. Platform-free.
│   └── platform/              # ★ THE ONLY place platform code may exist
│       ├── composition.ts     # ★ The ONLY file that names concrete adapters
│       ├── web/adapters/      # populated — all six capability ports
│       ├── native/adapters/   # slot — empty until Capacitor lands (shared by ios+android)
│       ├── ios/               # slot — Capacitor shell + signing
│       ├── android/           # slot — Capacitor shell + signing
│       └── desktop/           # slot — PWA/Tauri (§14)
│
├── tests/
│   ├── unit/                  # domain + features
│   ├── contract/              # ★ ONE suite, run against EVERY adapter of a port
│   ├── integration/           # real local Postgres. RLS. Migrations from zero.
│   ├── e2e/                   # rendered. Includes the single canonical acceptance flow.
│   └── native/                # slot — empty until a platform/ios|android is populated
│
├── db/migrations/             # Numbered, forward-only, apply-from-zero in CI
├── scripts/                   # Node/TS only. No .ps1, .sh, .bat, .cmd.
├── specs/                     # GATED CHANGES ONLY. Nothing else earns a durable spec.
└── docs/
    ├── product.md             # What it is, who for, scope, exclusions
    ├── operating-model-reference.md # Product-local reading copy. Never authority.
    ├── decisions/             # ADRs. Durable. Numbered. Never deleted.
    ├── runbook.md             # Operate, deploy, roll back
    └── deviations.md          # Live §13 deviations with expiries
```

### 4.2 Prohibited in a product — *no slot exists, therefore they may not be created* *(CI — R18)*

```text
tasks.md · workflow-receipts.md · checklist.md · convergence.md
plans/ · audit/ · closeout/ · worker-reports/ · .superpowers/
projects/          ← a product does not contain products
../                ← any sibling reference
*.ps1 *.sh *.bat *.cmd
nested .github/workflows/ below the repository root
```

Ephemeral agent output goes to `.write/` — **gitignored**, never committed. Historical value lives in Git history and release tags, not on the default branch.

### 4.3 Core grammar [C]

```text
app-dev-core/
├── AGENTS.md · README.md · VERSION
├── .codex/ · .agents/skills/ · .github/workflows/ · .write/
├── docs/
│   ├── operating-model/       # this document
│   └── decisions/             # core ADRs
├── standards/development.md   # THE single delegated standard
├── archetypes/
│   ├── react-vite-capacitor/  # populated — extracted, not designed
│   ├── next/                  # slot — empty (§14)
│   ├── expo/                  # slot — empty (§14)
│   └── node-service/          # slot — empty (§14)
├── capabilities/              # slot — EMPTY DIRECTORY (§14, B1: two products first)
├── schemas/                   # manifest.schema.json
├── scripts/                   # Node/TS: generate · verify-core · test-archetype · future audit-product
└── tests/
    ├── generator/             # pass AND fail fixtures
    ├── archetype/             # clean-room generation
    └── enforcement/           # ★ every §15 CI rule, with a FAILING fixture (R23)
```

Core MUST NOT contain: product source, product migrations, product feature specs, product audit history. *(CI — R04)*

---

## 5. Fact-Ownership Register [B] *(A3)*

> **Rule.** Every governed fact has exactly one owner. Any other file may **point** to the owner. No other file may **restate** it. Duplication is a review-time defect precisely because this table exists. *(CI — R22 for the machine-checkable rows; REVIEW — R20 for the rest)*

| Fact | Single owner | Validator |
|---|---|---|
| Active Codex permissions | `.codex/config.toml` | R22 — config/doc consistency check |
| Repository shape | §4 of this document | R24 — structure check |
| What a MUST means and how it is enforced | §15 of this document | R23 — failing fixture per rule |
| Product version | `package.json` + release tag | R11 |
| Baseline provenance | `app-dev.manifest.json` | schema validation |
| Toolchain versions | `.nvmrc` · `engines` · `packageManager` · lockfile | R11 — pin check; no `latest` / `lts/*` |
| Required CI checks | GitHub branch-protection API — **not** the workflow YAML | R08 — `release:check` queries the API |
| Verification commands | `package.json` scripts | R21 — entry-point check |
| Product behaviour | current tests + gated specs | CI |
| Database schema | `db/migrations/` + the from-zero CI apply | R14 |
| Authorization policy | Postgres RLS + the negative-case test suite | R13 |
| Module dependency rules | ESLint boundary config | R25 |
| Risk profile | `app-dev.manifest.json` → control matrix §12 | CI |
| Architectural decisions | `docs/decisions/` ADRs | REVIEW — trigger below |

An ADR is required when the decision changes Tier A or Tier B principles, changes the
major OM version, or promotes a product-proven pattern into a shared core surface under
§14.2. Direct and planned changes keep their record in the PR body unless they also
cross one of those boundaries.
| Live deviations | `docs/deviations.md` | R26 — expiry check |
| Published core changes | `core/releases.json` (append-only) | R39 |
| Core PR lane (correction/proposal, origin) | The PR itself | R40 |
| What is deferred, and why | §14 of this document | REVIEW at each minor release |

**The rule that follows from the table:** `AGENTS.md`, `README.md`, standards, skills and templates **point**. They do not **restate**. If a fact appears in two places and neither is generated from the other, one of them is a defect.

---

## 6. Architecture Law [P] *(A5)* — the multi-platform invariant

> This is the single most retrofit-hostile decision in the system. It costs nothing today. It is unrecoverable if skipped.

### 6.1 Dependency direction

```text
platform/{web,ios,android,desktop}
        │  (implements ports; injected at composition root)
        ▼
     features  ──►  domain
        │              ▲
        ▼              │
   data/adapters ──► data/ports
```

**Arrows point inward. There are no outward arrows.** *(CI — R25, ESLint boundary rule)*

| Layer | May import | MUST NOT import |
|---|---|---|
| `domain/` | nothing | everything |
| `data/ports/` | `domain/` | adapters, features, ui, platform |
| `data/adapters/` | `domain/`, `data/ports/` | features, ui, platform |
| `features/` | `domain/`, `data/ports/` | adapters (concrete), ui, platform |
| `ui/` | `domain/`, `features/` | adapters, platform |
| `platform/*` | anything | **any other `platform/*` sibling** |

Adapters and platform implementations are bound **only at the composition root**. Nothing above them names them.

### 6.2 Consequences — this is why the rule earns its cost

- **Adding Android** = populate `platform/android/`, implement the ports it must satisfy, add `tests/native/`. Zero changes to `domain`, `data`, `features`, `ui`. It is a capability addition, not a rewrite.
- **Adding a backend service** = a new adapter behind an existing port, or a new port. Not a new architecture.
- **Swapping Supabase for anything** = a new adapter. The contract suite (§6.3) proves equivalence.
- **The archetype question dissolves.** You do not need three archetypes to serve three app types. You need **one archetype with a platform boundary** plus named empty slots.

### 6.3 Port conformance — the rule that stops silent divergence [P]

**Every port MUST have exactly one contract test suite, and that suite MUST be run against every adapter of that port.** *(CI — R27)*

Testing `LocalConceptRepository` and `SupabaseConceptRepository` with separate, independently written suites is not sufficient when they are meant to be interchangeable. Two suites will diverge; the divergence surfaces in production as "works locally, not in Supabase." One suite, N adapters, all green — or the port is not proven.

### 6.4 Platform boundary [P]

Web-layer tests run on every applicable change. Native emulator/device tests are scoped to behaviour that crosses the native boundary and run on native-affecting changes or at release cadence. A web test MUST NOT be presented as proving native behaviour. *(REVIEW — R28)*

A `platform/` slot MUST NOT be populated with a placeholder `appId` or unresolved token. **Populated means working, or the slot stays empty.** An inert Capacitor install with a placeholder `appId` is a defect, not preparation. *(CI — R19)*

### 6.5 Capability ports — the six [P]

**Every product MUST declare all six capability ports, and MUST route every platform interaction through them.** The web adapter is populated. Native adapters are empty slots. *(CI — R34)*

| Port | Contract | Web adapter (today) | Native adapter (when triggered) |
|---|---|---|---|
| `KeyValueStore` | `get · set · remove · clear` | `localStorage` | `@capacitor/preferences` |
| `LinkOpener` | `openExternal(url)` | `window.open(url,'_blank','noopener')` | `@capacitor/browser` — in-app Safari / Custom Tab |
| `FileExporter` | `export(filename, mime, bytes)` | `Blob` + `<a download>` | `@capacitor/filesystem` + `@capacitor/share` |
| `AppLifecycle` | `onResume · onPause · onBackButton` | `visibilitychange`; back = no-op | `@capacitor/app` — `appStateChange`, `backButton` |
| `DeepLink` | `onLink(handler)` | URL params | `@capacitor/app` — `appUrlOpen` |
| `NetworkStatus` | `isOnline · onChange` | `navigator.onLine` | `@capacitor/network` |

**Why this is Lean, not speculative.** `features/` must not touch `window` **regardless of whether native ever ships** — that is a testability requirement, not a mobile requirement. Each port already has a real web implementation in active use. Zero code exists for a hypothetical future. **Native readiness is a free side-effect of correct architecture.**

**Adding Android later = writing six adapter files.** `domain/`, `data/ports/`, `features/` and `ui/` do not change. That is the entire promise of §6, made concrete and falsifiable.

### 6.6 Platform isolation rule — the rule that keeps the promise [P]

**No module outside `src/platform/**` may reference `window`, `document`, `localStorage`, `sessionStorage`, `navigator`, or `Capacitor`.** *(CI — R33, ESLint `no-restricted-globals` + `no-restricted-imports`)*

`src/platform/composition.ts` is the **only** file in the codebase that knows which platform it is running on:

```ts
const isNative = Capacitor.isNativePlatform();
export const platform = isNative
  ? await import('./native/adapters')   // slot — throws until populated
  : await import('./web/adapters');
```

Without R33, §6 is documentation. With it, §6 is enforced. This is the difference the previous repository failed to make, eleven times.

### 6.7 Native-friendly web constraints and prohibitions [P]

Each constraint is **already justified for mobile web** — near-free now, expensive to retrofit. *(CI — R35 where machine-checkable; REVIEW otherwise)*

| Constraint | Now | Retrofit cost |
|---|---|---|
| `env(safe-area-inset-*)`; `viewport-fit=cover` | 5 lines | Audit every fixed element |
| `100dvh`, never `100vh` | find/replace | Every full-height container |
| Touch targets ≥ 44px; no hover-only affordance | design discipline | Rebuild interactions |
| Scroll containers explicit, never `body` | layout discipline | Fight WKWebView bounce |
| Tables collapse to cards below `md` | needed for mobile web anyway | — |
| Router works on a non-`https` origin | config | Router rewrite |
| Supabase: `storage` via `KeyValueStore` port, `flowType: 'pkce'`, `detectSessionInUrl: false` | client-init config | Rework the entire auth path (R36) |

**Prohibited**, per B1/B2 — none of these are the wrapper's cost, all are speculative abstraction: React Native/Expo *alongside* Capacitor (justified only when the webview is the *measured* constraint, not a preference) · a UI layer "for platform variants" (Capacitor renders the same React; nothing to abstract) · Capacitor plugins installed before the shell exists (R19) · stub adapters that return `undefined` instead of throwing (R34).

---

## 7. Tooling Law [B] *(A6, A7)*

### 7.1 Node/TypeScript only

Core and product tooling — generators, validators, verification scripts, CI helpers — MUST be Node/TypeScript. PowerShell, Bash, `cmd` and `.bat` MUST NOT be used for anything that runs in CI or that a product depends on. *(CI — R10, extension deny-list)*

**Rationale (B2 citation).** The confirmed defect class in `app-dev` — `cmd.exe` invocation, backslash paths, `powershell` vs `pwsh`, `[bool]` vs `[switch]` silent flag failure — exists *only* because a Windows-authored shell language targets a Linux runner. Node is already a hard dependency of every archetype. Choosing it deletes the defect class, the cross-OS test matrix, and the `pwsh` CI install step, at zero marginal cost. **This is a Lean and Effective decision, not a preference.**

### 7.2 Pinning

Node major (`.nvmrc` + `engines`), package manager (`packageManager`), lockfile committed. `latest` and `lts/*` are prohibited. *(CI — R11)*

### 7.3 Entry points — two, forever

```text
npm run verify          # everything that must be green to merge
npm run release:check   # everything that must be green to release
```

Core additionally: `verify-core`, `test-generator`, `test-archetype`; `audit-product`
lands only when its §14 trigger fires. *(CI — R21)*

A third product-level entry point requires deleting one (§2.9).

### 7.4 No absolute paths in committed artifacts. *(CI — R12)*

---

## 8. Evidence and CI [B] *(C3, C4)*

### 8.1 Hosted CI from first push

**Any repository with a remote MUST have hosted CI on its default branch and on every pull request, from its first push.** *(GATE + CI — R05)*

A local run is never evidence. An agent's self-report of a local run is never evidence.

`check-runs total_count: 0` is a **failure**, not an absence. Any tool reading CI status MUST treat zero dispatched checks as red. *(CI — R05)*

Workflows live at repository-root `.github/workflows/`. Nested paths are invisible to GitHub Actions. *(CI — R06)*

### 8.2 Result states *(C4)*

`passed` · `failed` · `not-applicable` · `missing` · `blocked` · `not-run`.

`missing` ≠ `passed`. `not-run` ≠ `passed`. A verification tool MUST emit structured JSON and MUST NOT report an aggregate pass while any required check is `missing`, `blocked` or `not-run`. *(CI — R07)*

### 8.3 Repository settings are not files

Workflow YAML does not prove branch protection, required checks, environment approvals or secret scanning. These MUST be verified through the GitHub API. `release:check` queries them. *(CI — R08)*

Required baseline per repository *(GATE)*: protected default branch · PR required to merge · required check `verify` · force-push disabled · minimal workflow permissions (`contents: read`) · Dependabot · secret scanning where available.

---

## 9. Testing Law [B] *(C6)*

### 9.1 Trust boundaries

Test at the boundary that can detect the defect. Mocks MUST NOT be used to claim protection only a real boundary can prove. *(REVIEW — R29)*

| Boundary | Core example | Product example |
|---|---|---|
| Pure logic | manifest comparison | `domain/` ranking, scoring |
| Contract | schema fixture | **one suite, every adapter** (§6.3) |
| Component | generated example component | `ui/` component |
| Integration | generator + filesystem | **real local Postgres + RLS** |
| E2E | generated-app smoke flow | the canonical acceptance flow |
| Native | generated native capability | device behaviour, on-device |
| Policy | validator pass **and fail** fixtures | release gate |

### 9.2 Database and authorization [P]

A product using Postgres/Supabase authorization MUST test its policies against a **real local Postgres in CI**, including negative authorization cases. A mocked client cannot prove RLS and MUST NOT be presented as doing so. *(CI — R13)*

Migrations MUST apply cleanly from zero in CI, and the resulting schema MUST be asserted against expectation. Drift between migrations is a CI failure. *(CI — R14)*

### 9.3 Rendered verification [P]

E2E MUST detect runtime console errors, page errors, at least one meaningful user interaction, and responsive behaviour at the supported breakpoints. *(CI — R15)*

### 9.4 One canonical acceptance flow [P]

Each product defines exactly **one** end-to-end scenario exercising its full production path — external source → adapter → normalization → persistence → reload → query → render → user action → export — and runs it in CI. *(CI — R15)*

**Module-level green is not product-level green.**

### 9.5 TDD

Behaviour-changing production code is test-first: define behaviour or reproduce the defect → smallest failing test → **confirm red for the intended reason** → minimum implementation → green → refactor while green → run the verification profile. *(REVIEW — R30)*

**Closed exception list:** documentation-only changes; pure visual styling where rendered evidence is the correct boundary; generated output (the *generator* is tested instead); time-boxed spikes. Spike code MUST NOT reach the default branch without tests.

Behaviour-preserving refactoring requires characterization coverage and a continuously green suite. A meaningless red step is not required.

**Core TDD [C]:** every core change tests the mechanism it changes, test-first. A validator change requires a **failing** fixture before a passing one. *(CI — R23)*

**Evidence burden:** the focused test command, the observed red, the final green, the wider run — reported in the PR. **No receipt file.** Gated work preserves red-stage evidence as a test-first commit or CI artifact.

---

## 10. Change Law [B] *(C7)*

### 10.1 Classes — three, with objective triggers

| Class | Trigger | Record |
|---|---|---|
| **Direct** | *All* false: new user capability · data-model change · permission or security change · public-contract change · architecture boundary change · deploy change. Rollback trivial. | PR body: problem · acceptance condition · verification run · **conformance line (§2.0)** |
| **Planned** | Any of: new feature · cross-module change · new integration · state-model change · material dependency · architecture revision · archetype revision | PR body + TDD approach · verification profile · rollback · version impact · **conformance line** |
| **Gated** | Any of: auth/authz · payments · secrets · personal or regulated data · uploads · public writes · RLS · production deploy · live migration · destructive operation · AI external action · breaking baseline change · **populating a `platform/` slot** | PR body **plus** `specs/NNN-name/spec.md`: risk · data and permission analysis · rollback and recovery · migration plan · security tests · release gate · post-release verification · **conformance line** |

### 10.2 The record medium is the pull request

For direct and planned changes, the change record **is the PR body**. Separate `tasks.md`, `workflow-receipts.md`, `checklist.md`, `convergence.md` and permanent agent execution logs MUST NOT be required, and MUST NOT be committed — §4.2 gives them no slot. *(CI — R18)*

Only gated changes get a durable `spec.md`, because only there does the analysis have value beyond the merge.

### 10.3 PR template — mandatory fields *(GATE)*

```text
Conformance:   Lean ✓ | Efficient ✓ | Effective ✓ — <justification or trade>   ← §2.0, ALWAYS
Class:         direct | planned | gated
Risk profile:  standard | elevated | high
Compatibility: patch | minor | major
Evidence:      <red observed> → <green> → <verify output> → <CI run link>
Rollback:      <how>
Deviations:    <none | §13 record>
```

### 10.4 Scope control

A direct change MUST NOT grow into planned or gated work in place. Reclassify and reopen, or split. *(REVIEW — R31)*

### 10.5 Specifications

Mandatory only for new product creation, gated changes, and material features. A spec defines intended behaviour, actors, scope, exclusions, acceptance criteria, constraints, data and permissions, risk. It avoids implementation detail and MUST NOT attempt to specify future features.

Product specs live in the product repository. The core MUST NOT host product feature specifications. *(CI — R04)*

Spec Kit may inform structure. It is **not** a dependency: no vendored `.specify` runtime, no Bash scripts (§7.1). Its optional-test default is **overridden** by §9.5.

---

## 11. Completion and Release [B]

### 11.1 Distinct states

`implementation complete` ≠ `merge complete` ≠ `release complete` ≠ `operationally verified`. Never conflate. *(REVIEW — R32)*

### 11.2 Core completion [C]

Core acceptance passes · affected archetypes pass clean-room generation · compatibility recorded · no product source in core · hosted core CI green.

### 11.3 Product completion [P]

Accepted outcome implemented · TDD evidence present · `verify` green locally **and** in hosted CI on the merged commit · migrations validated from zero · port contract suites green against every adapter · product independent of any core checkout · version updated.

### 11.4 The stop gate — the only one *(B6)*

```text
Outcome achieved?                            Yes
Acceptance criteria satisfied?               Yes
Conformance test passed (§2.0)?              Yes
TDD / regression evidence green?             Yes
Hosted CI green on THIS commit?              Yes    ← not local. not self-reported.
Required checks actually dispatched (> 0)?   Yes
Material security risks controlled?          Yes
Rollback proportionate?                      Yes
Core–product boundary intact?                Yes
Remaining work required for safe use?        No
→ STOP. Optional improvements are recorded, not done.
```

Cross-repository: each repository independently meets its own gate. One repository's green CI never substitutes for another's.

### 11.5 Public distribution gate [P] — *the unroutable blocker*

**A product MUST NOT be publicly distributed while it has anonymous write access or an unproven authorization posture.** Hard gate. Not a recommendation. *(GATE — R17)*

**Why a store binary raises the stakes, not just the reach.** Shipping a mobile app publishes the Supabase anon key **inside a public artifact**. Anyone can unzip the APK and read it. On the web this is already true, but the blast radius is bounded by origin and by obscurity. In a store binary it is an invitation.

If the RLS posture permits anonymous write, then a store release is a public write endpoint with an app icon.

There is no architecture that routes around this. The sequence is forced:

```text
fix RLS + auth  →  PWA  →  Android  →  iOS
```

Auth is a **prerequisite**, not a parallel track. It is also what unblocks the `capabilities/auth/` row in §14.

---

## 12. Risk Profiles and Minimum Controls [P]

*Note on scope: the profile tiers and control matrix below are product-only —
the core has no risk profile. §§12.1–12.3 are marked [B] because secrets,
destructive-command handling, and permissions are baseline hygiene that binds
both repositories regardless of profile; they're placed here for proximity to
the control matrix, not because they scale with it.*

| Profile | Definition |
|---|---|
| **Standard** | Non-sensitive data · no auth · no privileged actions · no external writes |
| **Elevated** | Authentication · persistent user data · uploads · public APIs · external integrations |
| **High** | Payments · regulated or personal data · privileged administration · destructive automation · material external AI actions |

| Control | Standard | Elevated | High | Enforcement |
|---|---|---|---|---|
| Secret scanning — **whole tree, no directory exclusions** | Required | Required | Required | CI — R16 |
| Dependency scanning | Required | Required | Required | CI |
| Real-Postgres RLS + negative-authorization tests | N/A | Required | Required | CI — R13 |
| Port contract suite against every adapter | Required | Required | Required | CI — R27 |
| Migrations apply from zero, schema asserted | Required | Required | Required | CI — R14 |
| Threat model in the spec | Optional | Required | Required | REVIEW |
| Rollback plan | For migrations | Required | Required | REVIEW |
| Data retention decision recorded | Optional | Required | Required | REVIEW |
| Deliberate deploy pause (§1.5) | Optional | Recommended | Required | GATE |
| Post-release verification | Risk-based | Required | Required | REVIEW |

### 12.1 Secrets [B]

MUST NOT commit private keys, privileged tokens, service-role keys, production env files, certificates. The scanner MUST scan the **entire tree**; a scanner that excludes a directory is a defective scanner and its exclusion is a defect, not a configuration. *(CI — R16, with a failing fixture planted in an excluded-looking path)*

### 12.2 Destructive and live operations [B]

Explicit target · expected effect · deliberate pause · rollback path · evidence.

Codex hooks and rules are **supplementary**. Codex rules are experimental and are skipped in untrusted repositories, so every critical control MUST **also** exist in permissions, tests, or CI. *(CI/GATE)*

### 12.3 Permissions [B]

Least privilege. Repository root writable · `.git` writable only with an independently validated destructive-command deny layer (force push, history rewrite, recursive delete) · `.codex/` read-only · network off by default. Documentation MUST match the effective config, and a check asserts they agree. *(CI — R22)*

---

## 13. Deviations [B]

A deviation records: rule · repository · reason · risk · mitigation · expiry or review trigger. It lives in the PR body, or in `docs/deviations.md` if it outlives the PR. Expiries are checked in CI. *(CI — R26)*

```yaml
deviation:
  rule: OM-9.3-RENDERED-E2E
  repository: signal
  reason: Native distribution not yet scheduled
  risk: Platform-specific defect escapes web CI
  mitigation: Emulator smoke test before native beta
  expires: 2026-10-01
```

Temporary deviations expire. A deviation does not amend this document. No product is ever permanently exempt from a security minimum.

---

## 14. Deferral Register *(B4)* — the full picture, unbuilt

> **This section is how the whole system is anticipated without being built.**
> Each row is **named, located, owned, and triggered**. Building a row before its trigger fires is a B2 violation and fails the §2.0 Efficient test.
> Reviewed at every core minor release. **Untriggered after one year → the row is deleted, not carried forward.**

### 14.1 Distribution ladder — ordered. Each rung is independently valuable and independently abandonable.

| Rung | Slot | Gives | Effort | Prerequisite | Trigger |
|---|---|---|---|---|---|
| **0. Responsive web** | `platform/web/` | Every phone browser | *in progress* | — | now |
| **1. PWA** | `platform/desktop/` | Installable · offline shell · home-screen icon · **PC "app" path** | ~½ day (`vite-plugin-pwa`) | **none** | **now** — near-zero cost, and it validates the six ports (§6.5) against offline/storage/install behaviour *before* anything is owed to Apple |
| **2. Capacitor Android** | `platform/android/` + `platform/native/adapters/` + `tests/native/` | Play Store · native APIs | ~2 days: six adapters + shell + signing | **§11.5 auth/RLS resolved** | Store submission committed |
| **3. Capacitor iOS** | `platform/ios/` | App Store | ~2 days + Apple review | **§11.5 auth/RLS resolved** · $99/yr · macOS | After Android proves the shell |

**PWA is promoted ahead of native and this is not a detour.** It forces offline, storage and install-shell behaviour through the ports, which is exactly what the native rungs consume. It yields PC distribution for free. It proves the ports are right before Apple is involved.

**Auth is drawn as a prerequisite edge, not a co-trigger.** Rungs 2 and 3 are *blocked*, not merely *unscheduled*.

### 14.2 Everything else

| Capability | Slot (already exists, empty) | Owner | Activation trigger |
|---|---|---|---|
| **Tauri desktop** | — | — | Deferred **behind** PWA. No slot until PWA proves insufficient |
| **Native plugins beyond the six ports** | `platform/native/adapters/` | Product | A concrete feature needs it. Never pre-installed (R19) |
| **Next.js archetype** | `archetypes/next/` | Core | A concrete product needs SSR/SEO **and** has a passing verification profile |
| **Expo archetype** | `archetypes/expo/` | Core | A product where Capacitor's web shell is the actual constraint — not a preference |
| **Backend-service archetype** | `archetypes/node-service/` | Core | A product needs an API you own, not just adapters to APIs you don't |
| **Capability packs** | `capabilities/` (empty dir) | Core | **Two products** independently need the same non-archetype capability (B1) |
| **Auth capability (core-shared)** | `capabilities/auth/` | Core | **Signal or a second product builds it first** (see ADR-001 for current status) — that is instance 1 and it retires the §11.5 blocker. It becomes **promotable when Signal adopts it** at Stage 5 (instance 2, B1 satisfied). Auth is retired by *building*, not by planning. |
| **Payments** | — | — | A product takes money |
| **Observability** | — | — | A product has users whose failures you cannot see |
| **Drift audit (`audit-product`)** | `scripts/` | Core | ≥2 products at different baselines **and** manual `git diff --no-index` has become painful |
| **Upgrade-proposal tooling** | `scripts/` | Core | A core change must reach ≥2 existing products |
| **Per-file vendoring metadata** | manifest | Core | A drift incident occurs that a manifest would have caught |
| **Staleness / minimum-secure-version policy** | manifest schema | Core | The first security-critical core fix must be propagated |
| **Product→core promotion protocol** | `docs/decisions/` | Core | A pattern is proven in **two** products (B1) |
| **Shared runtime package** | separate repo | — | Two products share actively developed code requiring atomic change |
| **Monorepo** | — | — | The above **plus** coordinated releases. Templates and standards are **never** sufficient justification |
| **Second delegated standard** | `standards/` | Core | `development.md` exceeds 500 lines **and** a clean split exists (§2.9) |
| **Platform-specific tooling exception (e.g. PowerShell)** | — | — | A **concrete** OS-integration need arises that Node's `fs`/`child_process`/native APIs cannot address — not "feels more native on Windows." Granted only as a scoped §13 deviation, never as a standing rule. Absent a cited case, §7.1 remains absolute. |

**Why this beats "we'll figure it out later."** Later, you will not have a coordinate system — you will invent one under pressure, mid-feature, and it will not match the one Codex learned. That is precisely how `app-dev` acquired eight commands, five skills, eleven standards and eleven registries. The slot, the owner and the trigger are decided **now**, while they are free. The *implementation* is decided **then**, when it is justified.

---

## 15. Enforcement Register *(C1, C2)*

> **A `MUST` not listed here does not exist.** This table is the authoritative rule set; the prose above is its explanation.
> **R23 is the meta-rule: every CI rule requires a failing fixture.** A check only ever run against good input is not a control. Without R23, this table is a wish list — exactly what the previous repository's harness turned out to be.

| ID | Rule | § | Class | Mechanism |
|---|---|---|---|---|
| **R00** | **Every change passes the Lean/Efficient/Effective test, recorded in the PR** | **2.0** | **REVIEW** | **PR template required field; empty = no merge** |
| R02 | No sibling-path dependency in a product | 3.3 | CI | Grep + clean-clone job |
| R03 | Product builds and tests from a clean clone, no core present | 3.2 | CI | Clean-clone CI job |
| R04 | Core contains no product source, migrations, or feature specs | 3.2 | CI | `verify-core` structure check |
| R05 | Hosted CI on default branch from first push; `total_count: 0` is red | 8.1 | GATE+CI | Branch protection; release gate asserts checks > 0 |
| R06 | Workflows at repository-root `.github/workflows/` only | 8.1 | CI | Structure check |
| R07 | `missing` / `not-run` never aggregate to pass | 8.2 | CI | Verification-harness contract test |
| R08 | GitHub settings verified via API, not YAML | 8.3 | CI | `release:check` API query |
| R09 | Narrative never overrides machine evidence | 3.7 | REVIEW | PR review |
| R10 | Node/TS only; no `.ps1` `.sh` `.bat` `.cmd` | 7.1 | CI | Extension deny-list |
| R11 | Toolchain pinned; no `latest` / `lts/*` | 7.2 | CI | Pin check |
| R12 | No absolute paths in committed artifacts | 7.4 | CI | Grep check |
| R13 | RLS tested against real local Postgres, incl. negative cases | 9.2 | CI | Required job (Elevated/High) |
| R14 | Migrations apply from zero; schema asserted | 9.2 | CI | Required job |
| R15 | One canonical E2E acceptance flow; console + page errors detected | 9.3–9.4 | CI | Required job |
| R16 | Secret scan, whole tree, **no directory exclusions** | 12.1 | CI | Scanner test with a fixture planted in an excluded-looking path |
| R17 | No public distribution with anonymous write | 11.5 | GATE | `release:check` |
| R18 | No receipt / tasks / checklist / plans files committed | 4.2, 10.2 | CI | Path deny-list |
| R19 | Generator fails on unresolved tokens; no placeholder `appId` in a populated slot | 6.4 | CI | Generator fixture |
| R20 | One fact, one owner — no duplicated rule text | 5 | REVIEW | Core PR checklist |
| R21 | Exactly two product entry points: `verify`, `release:check` | 7.3 | CI | Entry-point check |
| R22 | Codex permissions match documentation | 12.3 | CI | Config/doc consistency check |
| **R23** | **Every CI rule has a passing AND a failing fixture** | **9.5** | **CI** | **`tests/enforcement/` — a rule with no failing fixture is not enforcement and reverts to REVIEW** |
| R24 | No artifact type outside the §4 grammar | 4 | CI | Structure check; unknown top-level path = fail |
| R25 | Module dependency arrows point inward only | 6.1 | CI | ESLint boundary rule |
| R26 | Deviations carry an expiry; expired = red | 13 | CI | Expiry check |
| R27 | One contract suite per port, run against every adapter | 6.3 | CI | Adapter enumeration test |
| R28 | Web tests never presented as proving native | 6.4 | REVIEW | PR review |
| R29 | Mocks never claim protection only a real boundary proves | 9.1 | REVIEW | PR review |
| R30 | Behaviour-changing code is test-first (closed exception list) | 9.5 | REVIEW | PR evidence field |
| R31 | Direct change never grows into planned/gated in place | 10.4 | REVIEW | PR review |
| R32 | Completion states never conflated | 11.1 | REVIEW | PR review |
| **R33** | **Nothing outside `src/platform/**` references `window`, `document`, `localStorage`, `sessionStorage`, `navigator`, or `Capacitor`** | **6.6** | **CI** | **ESLint `no-restricted-globals` + `no-restricted-imports`. Failing fixture: a `features/` module importing `localStorage`** |
| R34 | All six capability ports declared; every adapter either works or **throws** — never silently returns `undefined` | 6.5, 6.8 | CI | Port enumeration test + adapter conformance suite (R27 applies) |
| R35 | Safe-area insets, `viewport-fit=cover`, `100dvh`, ≥44px touch targets | 6.7 | CI | Structure check + E2E responsive assertion |
| R36 | Supabase auth uses `flowType: 'pkce'` and the `KeyValueStore` port, never `localStorage` directly | 6.7 | CI | Client-init assertion test |
| R37 | Provenance manifest baseline never silently drifts from what's actually running | 3.8 | CI | Manifest-vs-lockfile cross-check |
| R38 | Port-interface changes require a §13 deviation; risk profile kept current at every gated change, not fixed at creation | 3.8 | REVIEW | PR review at gated-change time |
| R39 | A `security`-category `core/releases.json` entry with no adoption and no §13 deviation fails `release:check` | 3.8 | CI | `core/releases.json` now; `scripts/check-updates.ts` when the product-side upgrade surface lands |
| R40 | Every core PR states Origin and Type; a `proposal` touching `capabilities/` cites two consuming products or redirects to §14 | 3.8 | REVIEW | PR template required fields |

**REVIEW count: 10.** Raised once from 8, named, in the open — see §2.9. A rule requiring further REVIEW capacity is promoted to CI or the count is not raised again without an equally named defect.

---

## 16. Implementation Sequence — pointer

The harvest register, product-selection rationale, and stage-by-stage sequence are a
**one-time migration plan**, not a durable operating rule (§3.7, §5) — owned in full
by `docs/decisions/ADR-001-core-bootstrap.md`, not restated here.

**Status note, kept honest rather than re-planned in place:** ADR-001's original
sequence treated a small orthogonal second product as the way to validate the
generator before Signal. In practice, Signal's own independent extraction
(`NielPieterse0/signal`) is proceeding directly and ahead of that plan. This is not
a violation — a plan that meets reality and changes is the plan working — but the
current stage and rationale live in ADR-001, updated to match, not here.


## 17. Acceptance Criteria

**Core [C]** — no product source · one archetype, **extracted** and verified · generator targets external paths and fails on unresolved tokens · clean-room test passes · core CI independent and green · **every §15 CI rule has a failing fixture** · permissions and documentation agree · §14 contains no built rows.

**Product [P]** — independent repository · no sibling-path dependency · §4.1 grammar complete, including empty slots · §6 arrows inward, enforced by lint · one contract suite per port across all adapters · hosted CI green with dispatched checks · migrations apply from zero · RLS proven against real Postgres where applicable · no committed secrets · no unresolved placeholders · clean clone builds and tests.

**Relationship [B]** — core changes never alter products automatically · product releases never depend on core CI · product files are product-owned · each repository carries independent completion evidence.

---

## 18. Final Operating Rule

> **Decide the coordinate system once. Build only what two products have proven. Prove everything with machine evidence in hosted CI. Test every change — including this document — against Lean, Efficient, Effective. Then stop.**

**The full picture is held in the registers, not in the code.**
§4 says where everything goes. §5 says who owns each fact. §14 says what is coming and what will trigger it. §15 says what is actually enforced.

Growth adds **rows**, not **layers**. That is the whole design.
