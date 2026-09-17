# Phase C — Migration Operating Context

**Document type:** Temporary, phase-scoped operating-context document. Not a research snapshot in the usual tier-6 sense (it does not report a point-in-time finding about repository state); not a spec; not an implementation plan; not an ADR. It exists solely to give AI agents executing Phase C the exact boundaries and principles established for that phase, so they don't re-derive or reinvent them component-by-component.
**Repository:** `ultimate`
**Compiled:** 2026-09-17, on `main` at commit `a6b2f4d` (post-merge of Phase B Knowledge Reconciliation).
**Scope:** Phase C (Actual Migration) execution guidance only. Documentation-only artifact — this document itself does not migrate anything, does not build a dependency map, does not select a first migration batch, and does not create an implementation plan.

**Migration framing:** this document sits at the start of **Phase C — Actual Migration**, the third of three phases — **Phase A (Migration Inventory) → Phase B (Knowledge Reconciliation) → Phase C (Actual Migration, this document's scope)**.

---

## 0. Authority and anti-loop rules (read first)

- **This document does not create a new authority tier.** The existing 8-tier source-of-truth hierarchy in `AGENTS.md` §2 is unchanged in ordering and membership. This document does not sit above, beside, or in competition with any of those 8 tiers — it is operating guidance *about how to use* that existing hierarchy during Phase C, not a new source of truth itself.
- **Existing ADRs (`docs/architecture/DECISIONS.md`), `docs/architecture/BLUEPRINT.md`, approved specs/plans, and current-state tracking documents (`BLUEPRINT_GAPS.md`, `ROADMAP.md`, `COMPONENT_INVENTORY.md`) remain authoritative exactly as `AGENTS.md` §2 already states.** A future agent must inspect and use those real sources, not treat this document as a substitute for reading them.
- **Do not repeatedly reopen a settled decision merely because a new component happens to use it.** If an incoming component's architecture question matches an already-established pattern (a base-class tier, an overlay mechanism, a styling approach, a CVA/form-integration pattern, etc.), apply that pattern. Re-deriving or re-justifying an already-settled pattern for every new component is exactly the failure mode Phase B (Knowledge Reconciliation) exists to prevent from recurring.
- **When an issue is genuinely new and architectural, stop and escalate it** to the human, per `AGENTS.md` §3's existing gate sequence (Research → Verification → Architecture Discussion → Decision → Specification → ...). Do not invent a solution unilaterally, and do not start an unbounded, open-ended research loop in place of a bounded escalation.
- **Protected/do-not-reopen decisions remain protected.** `BLUEPRINT_GAPS.md` §5's DECISION-B/C/D/E markers (external-dependency approval process; Table/Data architecture's narrow remainder; the Tree-family "do not reopen" marker; package-naming finalization) are unaffected by this document and are not reopened by anything in it.

---

## 1. Relationship to Phase A and Phase B

This document does not duplicate, restate in full, or supersede either of the two prior-phase artifacts. It assumes both have been read:

- **Phase A — Migration Inventory:** `docs/architecture/research/2026-09-16-phase-a-prime-migration-inventory.md`. Source-verified inventory of Prime components (PrimeNG 21.1.9 / PrimeReact 10.9.9 / PrimeVue 4.5.5) against Ultimate's current implementation state across Angular, React, and Vue — what exists, what's built, what's remaining, and known cross-framework dependency/ordering findings.
- **Phase B — Knowledge Reconciliation:** `docs/architecture/research/2026-09-16-phase-b-knowledge-reconciliation.md`. Audit of the repository's documentation/knowledge-authority surface, resulting in the reconciliation now merged to `main` (`AGENTS.md` §2 clarifications, `BLUEPRINT_GAPS.md` additions, spec/README corrections, and the 6-document research-cluster reconciliation).
- **Angular's current per-component inventory:** `docs/architecture/COMPONENT_INVENTORY.md` (tier 5, current-state tracking — already complete and mechanically verified for all 117 PrimeNG source directories).

This document does **not** create a new inventory, does **not** build a dependency map beyond what Phase A already recorded at a high level, and does **not** perform the Phase A/B report closeout reassessment (`docs/superpowers/plans/2026-09-16-phase-b-knowledge-reconciliation-implementation.md` Task 9 — that remains its own separately-gated, deferred requirement, untouched by this document).

---

## 2. Phase C goal

Phase C's goal is to **systematically reproduce the Prime component ecosystem in Ultimate**, across all three target frameworks — Angular, React, and Vue — treating Prime (PrimeNG/PrimeReact/PrimeVue) as the baseline ecosystem and reference, per Blueprint §2.2/§2.8.

This is **not** a selective migration of only the components Ultimate happens to need right now. The default assumption is that every Prime component named in the Phase A inventory is a migration target, unless there is a **documented reason** to:

- **defer** it (a real dependency or prerequisite genuinely isn't ready yet),
- **exclude** it (a documented architectural or product decision says it's out of scope — e.g. the protected Tree-family exclusion, or a component superseded by a newer Prime-side alias per Phase A's own findings), or
- **redesign** it (Ultimate's own architecture requires a materially different shape than Prime's for a specific, documented reason).

Silently dropping a component from scope, or treating "nobody's asked for it yet" as an implicit exclusion, is not a valid Phase C outcome.

---

## 3. Prime is the baseline, not an implementation to copy literally

Prime source (the pinned, MIT-licensed PrimeNG/PrimeReact/PrimeVue tarballs already vendored in `.vendor-cache/`, per `docs/architecture/PROVENANCE.md`) should be studied to understand:

- public API surface,
- behavior,
- dependencies (internal and external),
- framework-specific behavior and idioms,
- accessibility contract,
- styling/theming hooks,
- existing test coverage and what it actually verifies,
- relevant integrations with other Prime components.

The Ultimate implementation must remain **native to its target framework** and follow Ultimate's own established architecture (Option B: "reference, not verbatim" — per ADR-018/024/032 and every framework-specific ADR that follows the same posture). This is not a new principle; it is the same posture the existing 18/8/9-component proof sets across the three frameworks already demonstrate.

**Do not require source-level or internal-implementation parity with Prime when behavioral/public-contract parity is the actual requirement.** A component is correctly migrated when its public API, behavior, and accessibility contract match what Prime's real source demonstrates (per Phase A's own verified/unverified distinctions) and it uses Ultimate's own established internal architecture — not when its internal implementation happens to mirror Prime's file-by-file.

---

## 4. Existing Ultimate architecture is the default path

Every architectural decision already established across Ultimate's existing built components (per `docs/architecture/COMPONENT_INVENTORY.md` for Angular and the Phase A inventory for React/Vue), the shared `uix-*` packages, and the approved ADRs in `docs/architecture/DECISIONS.md` remains the starting point for any new component. This includes, without limitation:

- each framework's base-class/foundation tier (`UBaseComponent`/`UModelHolder`/`UBaseEditableHolder`/`UBaseInput` for Angular; `useComponentBase` for React; `createBaseComponent`/`createBaseEditableHolder`/`createBaseInput` for Vue),
- each framework's form-integration mechanism (CVA for Angular; fully-controlled props for React; `v-model`/`writeValue()` for Vue),
- the shared `uix-utils`/`uix-styled`/`uix-styles`/`uix-motion`/`uix-data` packages and what they do and do not cover,
- each framework's overlay/focus-trap/directive patterns,
- the Option B ("reference, not verbatim") posture itself.

**Do not reopen a settled architectural decision merely because a new component happens to use the pattern it established.** If GAP-018/GAP-038's Angular resolution already proved the `UModelHolder`/`UBaseInput` pattern works for `UInputText`/`UInputNumber`, the next native-input component does not need its own from-scratch feasibility study to confirm the same pattern still works — it needs to apply it.

---

## 5. Proof-by-exception, not proof-by-default

This is the central Phase C operating principle. **Do not perform a new feasibility study for every Prime component.**

The default path for a component migration is:

1. Understand the Prime component (§3 above).
2. Map it to the existing Ultimate architecture (§4 above) — which foundation tier, which shared package, which existing sibling component's pattern it follows.
3. Implement it using established patterns.
4. Verify the required behavior and integration (public API, accessibility, styling, framework-native tests).
5. Close the migration with an explicit outcome (§8 below).

**Only stop for architectural investigation when a genuinely new architectural question appears.** Genuine exceptions include, without limitation:

- a required architectural pattern does not yet exist anywhere in Ultimate for any framework,
- a new shared foundation would materially change existing cross-cutting architecture (not merely extend an existing one in the way already-proven patterns extend),
- a new external runtime dependency creates an unresolved architectural decision (this is DECISION-B's exact existing scope — Chart.js/Quill and any future case; still open, not resolved by this document),
- an existing Ultimate architectural decision conflicts with behavior the component genuinely requires,
- a new framework/package/build constraint is discovered that is not covered by any established decision (the closest existing precedent is GAP-009's Angular secondary-entry-point defect — a real, novel build-tool constraint that genuinely required its own investigation and decision).

**Component complexity, code size, or an agent's own unfamiliarity with a component alone must NOT be treated as an architectural exception.** A large, intricate component that maps cleanly onto an already-proven pattern is ordinary migration work, not a trigger for a new research pass.

---

## 6. Dependencies

A component may require:

- an existing Ultimate foundation (already built and proven),
- a supporting foundation that follows an already-established pattern but hasn't been built yet for this specific case,
- another component or component family (e.g. a component that composes another),
- shared framework-independent infrastructure (a `uix-*` package).

**A dependency does not automatically trigger a new feasibility study.** Only a dependency that itself introduces a genuinely new architectural question (per §5's exception list) becomes an exception requiring escalation.

**Do not create unnecessary standalone migration workstreams merely because Prime's own source repository separates functionality into different packages or directories.** Prime's package/directory boundaries (e.g. `packages/primeng/src/<component>/` per-directory splits, or PrimeVue's dual-root `packages/primevue/src/` + `packages/core/src/` split) are a fact about Prime's own repository organization, not a mandate for how Ultimate must structure its own migration work. The migration should reproduce the required Ultimate ecosystem structure and behavior, not blindly mirror Prime's source-repository boundaries.

---

## 7. Monorepo model

Ultimate is intentionally organized differently from Prime's repository/package layout, per Blueprint §4 and `docs/architecture/PACKAGE_ARCHITECTURE.md`:

- Ultimate uses a single monorepo.
- Ultimate contains Angular, React, and Vue implementations within that same monorepo, as sibling framework packages.
- Shared infrastructure lives in shared Ultimate packages (`uix-utils`, `uix-styled`, `uix-styles`, `uix-motion`, `uix-data`) where a real, evidence-backed cross-framework need exists — not merely because Prime happens to share something across PrimeNG/PrimeReact/PrimeVue.
- Framework-specific implementations remain framework-native (ADR-006) — divergence between frameworks is expected and often correct where each framework's own real upstream reference diverges too (Phase A's own findings document several confirmed cases: React's `aria-activedescendant` Menu vs. Angular's literal-DOM-focus Menu; React's fully-controlled Checkbox vs. Vue's controlled-or-uncontrolled-plus-array-membership Checkbox).

**Do not introduce new repository or package architecture solely to mirror Prime's repository layout.** Any new shared package, new monorepo boundary, or new cross-package dependency direction is itself a §5 architectural exception requiring its own decision, not an assumed migration prerequisite.

---

## 8. Theme boundary

The Ultimate Theme layer (`packages/themes`, currently the Aura preset, proven for the existing proof-set components per Phase 5) is architecturally independent from component implementations, per Blueprint §2.5/§15.

**Do not make the future, fuller Ultimate Theme work a blocker or prerequisite for ordinary Phase C component migration**, unless an already-established repository decision explicitly requires otherwise for a specific component. Phase C components should work with the current styling architecture (`uix-styles`, each component's own per-component style module, the `dt()` token-resolution pattern already proven across the existing proof set) as it exists today — not wait on a broader theming initiative that is explicitly a separate, later concern.

---

## 9. Migration result

Every component migration must reach one explicit outcome:

- **Migrated** — implemented, following §5's default path, with verified behavior/accessibility/integration.
- **Deferred** — not migrated yet, with a documented reason (typically a real, unresolved dependency per §6, or a real architectural exception per §5 still awaiting a decision).
- **Excluded** — deliberately out of scope, with a documented reason (a protected decision like the Tree-family exclusion; a confirmed-superseded Prime alias per Phase A's own deprecated-alias findings, once independently verified; or an explicit product/architecture decision).
- **Redesigned** — implemented with a materially different shape than Prime's own component, where a documented architectural or product decision requires the redesign (this is a §5 exception outcome, not a default path outcome).

**Deferred and excluded outcomes require a documented reason** — recorded in the appropriate current-state tracking document or gap registry according to the repository's established documentation structure (e.g. `COMPONENT_INVENTORY.md`, `BLUEPRINT_GAPS.md`), not merely implied by the component's absence from a status list. **Do not silently drop a component from the migration scope** — every component named in the Phase A inventory needs a traceable outcome by the time Phase C's own eventual closeout happens.

---

## 10. Temporary-document lifecycle

This document exists to guide Phase C execution. It is explicitly not intended to become a permanent artifact.

**After Phase C is complete:**

1. This document must be reassessed, the same way Phase B's own reconciliation work reassessed the 2026-09-12/13 research-document cluster (`docs/superpowers/plans/2026-09-16-phase-b-knowledge-reconciliation-implementation.md` Task 8's own classification method is the applicable precedent).
2. Phase-C-only operating rules stated here may be retired, marked historical, consolidated into another document, or otherwise handled according to the repository's normal documentation-authority rules (`AGENTS.md` §2) at that time — not according to any special rule this document invents for itself.
3. **Any genuine architectural decision actually discovered or made during Phase C** (per §5's exception path) must be promoted into the repository's established permanent authoritative documentation — a new ADR in `docs/architecture/DECISIONS.md`, an updated `BLUEPRINT_GAPS.md` entry, or an update to `COMPONENT_INVENTORY.md`/its React/Vue equivalents, as appropriate to the decision's own nature. This document is not where such a decision permanently lives.
4. **Do not leave this document as a permanent competing authority source merely because it was useful during Phase C.** Its value is temporal and phase-scoped; once Phase C closes, it becomes ordinary historical record, not a document a future agent should consult as if it were still live operating guidance.

---

## Status

**READY FOR HUMAN REVIEW — NOT APPROVED.**

This document has not been reviewed or approved. It does not authorize the start of Phase C, does not authorize any dependency-mapping work, does not select a first migration batch, and does not authorize any implementation. It is a documentation-only artifact capturing the operating principles already discussed, submitted for human review before Phase C's own gated workflow (per `AGENTS.md` §3) begins.
