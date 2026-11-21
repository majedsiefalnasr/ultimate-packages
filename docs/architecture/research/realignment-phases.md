# Realignment Phases

**Status:** temporary working record. Not part of the repository's source-of-truth hierarchy (`AGENTS.md` section 2). Delete it with the other Realignment records once the gaps are closed.

**Purpose:** Realignment is a temporary correction path, not the project goal. The goal remains the Blueprint (`docs/architecture/BLUEPRINT.md`). These phases exist to reposition the project against it. They are distinct from the Blueprint's "Roadmap Phase N" (section 35).

**Recorded:** 2026-10-19, at `main` `61f90979`. **Updated:** 2026-10-21 at `develop` `910e1f53`, then 2026-11-21 at `develop` `33da9394` (renamed, Phase 4 status added). Earlier text called these "Completion Phases"; that name is retired.

## Dependency order

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
```

Each phase starts only after the previous one is complete and reviewed. Every phase still follows the repository's gated workflow (`AGENTS.md` §3). Approval for one phase does not authorize the next.

## Phase 1 — Gitflow Setup

**Purpose:** establish the branching model the remaining phases work in.

Establish, review, approve and implement Gitflow, with `main` for releases and `develop` for ongoing integration, before the Prime study starts.

### Phase 1 status (verified 2026-10-21)

**Complete.** Gitflow landed via PR #43 (merge `03aeb1a6`); closeout in `docs/architecture/research/2026-10-19-gitflow-setup-closeout.md`; ADR-068. `develop` is the default and integration branch.

### Follow-up task — Affected-Only CI (completed; was "future study, not started")

**Done.** Researched, specified, planned and implemented after Gitflow: PR #46 (merge `49a5242c` into `develop`), ADR-069, closeout `docs/architecture/research/2026-10-19-affected-only-ci-closeout.md`. A later CI/CD optimization (ADR-070, ADR-071; Stage 1–3 closeouts dated 2026-10-20) amended it: browser-input scoping, full validation for `main`, Browser track-a sharding. The classifier is `scripts/provenance/classify-changes.mjs` (42/42 tests pass, re-run 2026-10-21).

Known remaining limits (from the closeouts, not new scope): package-level scoping (AO-3) deferred; the two known `ci-extended` failures (bundle-size `component-metadata` +26.5%, provenance 645 manifest problems / GAP-094) are not repaired. Deferred work S1–S7 untouched.

## Phase 2 — Complete Prime Study

**Purpose:** build a complete reference picture of the Prime ecosystem.

Restart the study of PrimeNG, PrimeVue and PrimeReact from scratch. Cover:

- installation
- configuration
- architecture
- packages
- helpers
- every component and its documentation
- usage guidance
- component relationships
- dependencies

**Baseline:** the exact pinned versions in ADR-048 (`docs/architecture/DECISIONS.md`) are authoritative for this study.

### Phase 2 status (verified 2026-10-24)

**Complete.** Prime reference study landed via PR #69 (reviewed against `develop`); closeout in `docs/prime-reference/REVIEW.md` (two-axis review: Standards + Spec). Artifacts:

- 100 component records in `docs/prime-reference/components/` (12 sections each, verified by `scripts/prime-reference/check-records.mjs` → 0 problems)
- Foundation notes: `foundations/primeng.md`, `foundations/primevue.md`, `foundations/primeuix.md`, `foundations/primereact/{index,architecture,hooks,api-and-utils,icons-and-guides,notes-for-component-records}.md`
- Generated catalog: `catalog/{primeng,primevue,primereact}.json` from pinned archives in `.vendor-cache/`
- Coverage map: `coverage-map.json` mapping every showcase menu item to a record, foundation note, or documented exclusion
- Pinned versions: PrimeNG 21.1.9, PrimeVue 4.5.5, PrimeReact 10.9.9, @primeuix/* per ADR-048

## Phase 3 — Ultimate Inventory

**Purpose:** record what Ultimate actually implements.

Inspect Ultimate's actual Base, Core, Helpers, Packages, components and configuration. Use source code, tests and metadata, not status documents alone.

### Phase 3 status (verified 2026-11-17)

**Complete.** The Ultimate inventory and final delegated review landed on `develop` via PR #158 (merge `91a84725`); spec #98 and closeout issue #157 are closed. See `docs/inventory/global/closeout-review.md` for the review, validation evidence and retained limitations.

The inventory reconciles 51 canonical batches, 403 records, 381 coverage identities and 1,868 references with zero global problems. Product findings remain documented; completing the inventory does not claim a defect-free product.

## Phase 4 — Gap Analysis

**Purpose:** compare the Prime reference with Ultimate's actual state.

For each framework, compare the Prime reference against Ultimate and document what is:

- complete
- partial
- missing
- intentionally architecturally different
- not applicable

### Phase 4 status (verified 2026-11-21)

**Complete as an evidence-only analysis.** Closeout landed via PR #159 and PR #160; records are in `docs/architecture/research/phase4-gap-analysis.md` and `docs/architecture/research/phase4/`. Two rows stay `U` (unresolved): Timeline Angular row 8 and MeterGroup Angular row 5. The Phase 4 records are temporary and are deleted after the gaps are closed.

## Phase 5 — Completion Planning

**Purpose:** decide how the remaining work is organized.

Agree on implementation phases and work groups only after reviewing the study, inventory and comparison results. The breakdown and priorities are not predefined.

**Open question (2026-11-21):** whether closing the gaps found in Phases 2 to 4 belongs here or in a separate phase, and when documentation cleanup happens relative to it. See `docs/architecture/research/docs-audit.md`. Not decided.
