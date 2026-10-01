# Specification — Table: Templating, Selection, Editing, Expansion, Row-Grouping, Loading States, Keyboard Selection (GAP-041–GAP-047)

**Status:** Implemented on `feature/prime-parity-audit-gaps` (Table Plan, 2026-09-27..2026-09-30); GAP-041–GAP-047 marked RESOLVED at the branch closeout (2026-10-01).
**Date:** 2026-09-26
**Branch:** `feature/prime-parity-audit-gaps`
**Origin:** the exhaustive Prime-vs-Ultimate parity audit (Batch 4 — Data family), its Findings Triage, the Consolidated Pass 1 Report, the Findings Decision/Scope Triage, the Final Consolidated Decision Ledger, the Final Scope Ledger (Scope Freeze reconciliation), and the GAP stage (`docs/architecture/BLUEPRINT_GAPS.md` GAP-041 through GAP-047).

**Required sequence (this document is the Specification step):** Research (audit batches/triages) → Verification (residual-Unverified closures, N/A here — none of these 7 items were residual-Unverified) → Architecture Discussion (Findings Decision/Scope Triage) → Decision (Final Scope Ledger — all 7 INCLUDE) → GAP registration (GAP-041–047) → **Specification (this document)** → Spec Review → Implementation Plan → Plan Review → Implementation → Verification → Final Review/Closeout.

**This specification does not implement anything.** It defines the exact, bounded scope, per-framework requirements, and acceptance criteria that a future, separately-gated Implementation Plan must satisfy. No code is written by this document.

---

## 1. Purpose and Scope

**Purpose:** Establish the acceptance contract for seven confirmed Table capability gaps between real Prime (PrimeNG/PrimeReact/PrimeVue) and Ultimate's own Table ports, all already classified INCLUDE by human decision. This specification does not design implementation structure — it defines what must be true when each gap is closed.

**In scope:** GAP-041 (column templates/rendering), GAP-042 (checkbox/radio selection UI), GAP-043 (row/cell editing lifecycle), GAP-044 (row expansion), GAP-045 (`rowGroupMode: "rowspan"`), GAP-046 (loading/empty states), GAP-047 (keyboard selection/select-all) — `packages/ng/src/table/`, `packages/react/src/table/`, `packages/vue/src/table/`.

**Out of scope, entirely, for this specification and its eventual Implementation Plan:**

- TreeTable, Tree, TreeSelect, Angular OrganizationChart — DECISION-D, protected, not touched or reopened.
- Table's filter-vocabulary work — already resolved by DECISION-C / `2026-09-23-table-filter-vocabulary-design.md`, not reopened here.
- Any Material/Lara/Nora theming question — DEFERRED, unrelated to this Spec's scope, not touched.
- PanelMenu/MegaMenu behavioral-difference questions — KEEP CURRENT BEHAVIOR, unrelated, not touched.
- Designing GAP-041's exact column-template API shape as a final, binding contract — per the GAP stage's own explicit constraint, this specification establishes the *externally observable requirements* the eventual API must satisfy (§5), not the API's own concrete shape (prop names, function signatures, slot names) — that remains open, and the Implementation Plan (or a narrower follow-up Spec, if the Plan reviewer determines one is needed) resolves it with real framework-idiomatic design work.

---

## 2. Human Decisions This Specification Implements (Binding, Not Reopened Here)

1. **All seven items are INCLUDE** — Final Consolidated Decision Ledger, Final Scope Ledger §A. Not re-derived here.
2. **GC-D3 (GAP-043) supersedes its own earlier Deferred classification** — the Batch 4 Findings Triage originally classified Table row/cell editing lifecycle "Deferred" because the implementation Plan's own task text (Angular Task 10/React Task 16/Vue Task 22) explicitly, symmetrically defers it. The final human decision overrides that classification to INCLUDE. This specification treats GAP-043 as in-scope, full stop — the superseded Deferred classification is historical record only (see GAP-043's own entry in `BLUEPRINT_GAPS.md`), not a live constraint.
3. **GAP-041 → GAP-042 is a hard dependency** — GAP-042 cannot be scoped concretely, and must not be implemented, before GAP-041's own template mechanism exists. Preserved explicitly in §7.
4. **GAP-045 (`rowspan`) is INCLUDE for Angular + React + Vue** — resolving the Final Decision Ledger's own previously-flagged open question about Vue's asymmetry (Vue never declared the `rowspan` type option at all, unlike Angular/React which declared but never implemented it). This specification's scope covers completing Angular/React's declared-but-unimplemented branch *and* adding the option to Vue for the first time.
5. **GAP-047 is confirmed independent of GAP-042** — real PrimeNG's own Ctrl+A condition checks `selectionMode`, not checkbox-column presence, verified via direct source read during Batch 4 triage. This specification does not sequence GAP-047 after GAP-041/042.
6. **The framework-native editing-state model per framework (GAP-043) is already settled by the original Table Spec §11** (`2026-09-02-table-component-design.md`) and is not reopened here — Angular's key-map/DOM-forms-validity, React's controlled/uncontrolled `editingRows`, Vue's array-prop each remain framework-native.

None of these decisions is reopened by this specification.

---

## 3. Framework Applicability

| Gap | Angular | React | Vue |
|---|---|---|---|
| GAP-041 (column templates) | In scope | In scope | In scope |
| GAP-042 (selection UI) | In scope (depends on GAP-041) | In scope (depends on GAP-041) | In scope (depends on GAP-041) |
| GAP-043 (editing lifecycle) | In scope | In scope | In scope |
| GAP-044 (row expansion) | In scope | In scope | In scope |
| GAP-045 (`rowspan`) | In scope (complete declared-but-unimplemented branch) | In scope (complete declared-but-unimplemented branch) | In scope (add the option for the first time) |
| GAP-046 (loading/empty states) | In scope | In scope | In scope |
| GAP-047 (keyboard selection) | In scope | In scope | In scope |

---

## 4. Existing Behavior (Evidence, Traced From the Audit — Not Re-Derived)

- **GAP-041:** Table's own Spec (`2026-09-02-table-component-design.md` §17) flagged the column-template/slot API surface "needs implementation-time verification"; never carried into the implementation Plan. No column-definition object, render-function signature, or header/footer/empty/loading template slot mechanism exists in any of the three frameworks' Table source today.
- **GAP-042:** Real PrimeNG/PrimeReact/PrimeVue's `TableCheckbox`-equivalent is a template-consumed class with no template host in any of Ultimate's three Table ports — no selection-column UI mechanism exists.
- **GAP-043:** The Table implementation Plan's own task text (Angular Task 10/React Task 16/Vue Task 22) explicitly, symmetrically defers save/cancel/cell-editor UI in all three frameworks — confirmed via direct Plan-text read during Batch 4 triage.
- **GAP-044:** Real PrimeNG's `expandedRowKeys`/`onRowExpand` API has no Ultimate equivalent in any framework; never named in-scope or out-of-scope anywhere in Table's Spec or Plan.
- **GAP-045:** Angular/React's implementation Plan declares the accepting type `'subheader' | 'rowspan'` but only implements the `subheader` branch. Vue's own task never declared `rowspan` as an option at all.
- **GAP-046:** Real PrimeNG has `loading`/`loadingIcon`/`showLoader` with a real mask overlay; never named in-scope or out-of-scope anywhere in Table's Spec or Plan.
- **GAP-047:** Real PrimeNG's row keydown handler explicitly handles Space/Enter (select) and Ctrl/Cmd+A (select-all); Ultimate's existing keyboard handler covers Arrow/Home/End only, confirmed via direct source comparison during Batch 4 triage.

---

## 5. Required Behavior

### 5.1 GAP-041 — Column templates/rendering

**Externally observable requirement:** a consumer must be able to supply custom rendering for at least: individual column cells, column headers, column footers, an empty-state region, and a loading-state region (this last one shared with GAP-046's own requirement — see §5.6). The mechanism must be framework-idiomatic (Angular: content-projection/template-ref-based; React: render-prop or children-function/component-prop-based; Vue: named-slot-based) — this specification does not mandate identical API shape across frameworks, consistent with this codebase's own established "no forced parity where framework conventions make that harmful" precedent (GAP-024).

**Unresolved, marked explicitly rather than filled by assumption:** the exact prop/slot/template names, the exact render-function signature (what data is passed to a custom cell renderer — the row value alone, or row+column+index), and whether column definitions are declared via a data structure (column array) or via markup (per-column template elements) are all genuinely open. Real Prime's own three frameworks do not use identical mechanisms for this either (PrimeNG uses `PrimeTemplate` type-scanning; PrimeReact uses column `body`/`header` props; PrimeVue uses named slots) — so there is no single "match Prime" answer to defer to. **This must be resolved by the Implementation Plan's own design work, or by a narrower follow-up Spec if the Plan reviewer determines the ambiguity is too large for Plan-stage resolution.**

### 5.2 GAP-042 — Checkbox/radio selection UI

**Externally observable requirement:** a consumer must be able to enable a selection column that renders a checkbox (multi-select) or radio button (single-select) per row, plus a header checkbox for select-all when in checkbox mode, consistent with real Prime's own selection-column behavior.

**Hard precondition:** this requirement cannot be implemented until GAP-041's own column-template mechanism provides a template host for this selection-column UI to render into.

### 5.3 GAP-043 — Row/cell editing lifecycle

**Externally observable requirement:** a consumer must be able to enter edit mode for a row or cell, see an editable input surface, save the change (committing the new value), or cancel (reverting to the prior value), with validation-state feedback available. The specific editing-state model remains framework-native per the original Table Spec §11 (not reopened): Angular's key-map/DOM-forms-validity, React's controlled/uncontrolled `editingRows`, Vue's array-prop.

### 5.4 GAP-044 — Row expansion

**Externally observable requirement:** a consumer must be able to designate rows as expandable, toggle a row's expanded state (revealing nested detail content), and be notified when expansion state changes (an `onRowExpand`-equivalent event), consistent with real PrimeNG's own `expandedRowKeys`/`onRowExpand` capability. The state-tracking mechanism should follow the existing selection key-map's own precedent (an expanded-row key-map), per GAP-044's own recommended resolution direction — this is a structural precedent, not a binding requirement on this Spec's own acceptance criteria.

### 5.5 GAP-045 — `rowGroupMode: "rowspan"`

**Externally observable requirement:** setting `rowGroupMode` to `"rowspan"` must group consecutive rows sharing the same grouping-field value under a single spanned cell (using the HTML `rowspan` attribute or its framework-equivalent), consistent with real Prime's own `rowspan` mode and with Ultimate's own already-working `"subheader"` mode's grouping-detection logic. This must be available in **all three frameworks** — Angular and React complete their own already-declared-but-unimplemented branch; Vue gains the option for the first time.

### 5.6 GAP-046 — Loading/empty states

**Externally observable requirement:** a consumer must be able to set a `loading` boolean that displays a loading indicator/overlay over the table body, and the table must display a distinct empty-state region when `value` is an empty array and `loading` is false. The empty-state region's content must be customizable via GAP-041's own template mechanism (soft dependency — see §7) but a default, non-templated empty-state message must also work independently of GAP-041.

### 5.7 GAP-047 — Keyboard selection/select-all

**Externally observable requirement:** when a Table's existing Arrow/Home/End keyboard-navigation handler has focus on a row, pressing Space or Enter must toggle that row's selection state (when a selection mode is active), and pressing Ctrl/Cmd+A must select all rows (when `selectionMode` is `"multiple"`), consistent with real PrimeNG's own keydown handler. This requirement is independent of whether a selection-column UI (GAP-042) is present — selection state itself, not its visual checkbox representation, is what Ctrl+A/Space/Enter must affect.

---

## 6. API Requirements

No specific API shape is mandated by this specification beyond the observable behaviors in §5. Where §5 marks a requirement's exact shape unresolved (GAP-041), the Implementation Plan must either resolve it directly or escalate to a narrower follow-up Spec — it must not silently invent an API shape without at least disclosing the design choice made and its rationale.

---

## 7. Dependency Relationships

- **GAP-041 → GAP-042 (hard dependency).** GAP-042 must not be planned or implemented before GAP-041's column-template mechanism's externally observable contract (§5.1) is settled by the Implementation Plan (or its own follow-up Spec, if escalated).
- **GAP-041 → GAP-046 (soft dependency, templated-empty-state half only).** GAP-046's boolean `loading` flag and default empty-state message have no dependency on GAP-041 and may be implemented independently. Only the *customizable* empty-state region depends on GAP-041's own template mechanism existing.
- **GAP-047 is confirmed independent of GAP-042.** No sequencing constraint between them.
- **GAP-043, GAP-044, GAP-045 are independent** of every other gap in this Spec and of each other.

---

## 8. Intentional Divergences That Must Remain Unchanged

- Angular's/React's/Vue's own distinct editing-state models (GAP-043, §5.3) — framework-native by original Table Spec §11's own already-settled decision, not to be forced into one shared shape.
- No forced identical API shape across frameworks for GAP-041's column-templating mechanism (§5.1) — matches this codebase's own GAP-024 precedent.
- Table's existing filter-dispatch mechanism (DECISION-C, resolved 2026-09-23) is unaffected by any gap in this Spec and must not be touched by its eventual Plan.

---

## 9. Acceptance Criteria (Traceable to Originating GAP)

| Criterion | Traces to |
|---|---|
| Consumer can render custom cell/header/footer content via a framework-idiomatic mechanism, in all 3 frameworks | GAP-041 |
| Consumer can enable a checkbox/radio selection column with select-all header checkbox, in all 3 frameworks, after GAP-041 lands | GAP-042 |
| Consumer can enter/save/cancel row or cell edits with validation-state feedback, in all 3 frameworks, using each framework's own already-settled editing-state model | GAP-043 |
| Consumer can expand/collapse rows and receive an expansion-change notification, in all 3 frameworks | GAP-044 |
| `rowGroupMode: "rowspan"` groups consecutive same-value rows under a spanned cell, in all 3 frameworks | GAP-045 |
| `loading` boolean displays a loading indicator; empty `value` + non-loading displays a default empty-state message, in all 3 frameworks, independent of GAP-041 | GAP-046 (boolean/default half) |
| Empty-state region content is customizable via GAP-041's template mechanism once it exists | GAP-046 (templated half) |
| Space/Enter toggles row selection, Ctrl/Cmd+A selects all (when `selectionMode="multiple"`), on the existing keyboard-navigation handler, in all 3 frameworks, independent of GAP-042 | GAP-047 |

---

## 10. Evidence/Source References

`docs/architecture/BLUEPRINT_GAPS.md` GAP-041 through GAP-047; `docs/superpowers/specs/2026-09-02-table-component-design.md` §11/§17; `docs/superpowers/plans/2026-09-02-table-component-implementation.md` Angular Task 10/React Task 16/Vue Task 22; Batch 4 Findings Triage (`data-findings-triage.md`); Consolidated Pass 1 Report §3/§6; Final Consolidated Decision Ledger; Final Scope Ledger (Scope Freeze reconciliation).

---

## 11. Explicit Out-of-Scope Items

See §1. Additionally: this specification does not authorize any change to `packages/uix-data`'s existing `FilterMatchMode`/`FilterMetadata`/`SortMeta` shapes — none of GAP-041–047 touches filtering or sorting.
