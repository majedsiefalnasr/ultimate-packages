# Specification — Navigation: Steps, Menubar/TieredMenu/MegaMenu/PanelMenu, Dock, SpeedDial Keyboard Navigation; Angular `routerLink`; React Tabs `scrollable`/`closable` (GAP-052–GAP-058)

**Status:** Spec stage — awaiting Spec Review.
**Date:** 2026-09-26
**Branch:** `feature/prime-parity-audit-gaps`
**Origin:** the exhaustive Prime-vs-Ultimate parity audit (Batch 3 — Navigation family), its Findings Triage, the Consolidated Pass 1 Report, the Findings Decision/Scope Triage, the Final Consolidated Decision Ledger, the Final Scope Ledger, and GAP-052 through GAP-058.

**Required sequence:** Research → Architecture Discussion → Decision (INCLUDE) → GAP registration → **Specification (this document)** → Spec Review → Implementation Plan → Plan Review → Implementation → Verification → Final Review/Closeout.

**This specification does not implement anything.**

---

## 1. Purpose and Scope

**Purpose:** Establish the acceptance contract for seven confirmed Navigation-family gaps, all INCLUDE by human decision, spanning keyboard-navigation additions, one Angular-specific router-integration gap, and two React-specific Tabs gaps.

**In scope:** GAP-052 (Steps keyboard nav), GAP-053 (Angular Steps `routerLink`), GAP-054 (Menubar/TieredMenu/MegaMenu/PanelMenu keyboard nav — one systemic finding, four components), GAP-055 (Dock keyboard nav), GAP-056 (SpeedDial keyboard nav), GAP-057 (React Tabs `scrollable`), GAP-058 (React Tabs `closable`).

**Not in scope, and explicitly flagged as an unregistered finding rather than silently included (see §12):** "Angular Dock `routerLink`," which the Final Scope Ledger names as its own distinct INCLUDE line item, has no corresponding GAP entry in the committed registry — GAP-055 as actually committed covers Dock keyboard navigation only, with no `routerLink` content anywhere in its body. This specification does not fold that requirement into GAP-055's own scope, since doing so would broaden GAP-055 beyond its committed text. It is reported to the human for a GAP-stage decision, per this Spec stage's own explicit "record separately, do not silently add" rule.

**Out of scope:** PanelMenu's own multiple-expansion behavioral difference (KEEP CURRENT BEHAVIOR, not touched — see §2.4); MegaMenu's own disabled-group hover behavioral difference (KEEP CURRENT BEHAVIOR, not touched — see §2.4); any Menu (`UMenu`) capability (tracked separately by GAP-067, not this Spec).

---

## 2. Human Decisions This Specification Implements

1. **GAP-052 (Steps keyboard nav) is INCLUDE, all three frameworks.**
2. **GAP-053 (Angular Steps `routerLink`) is INCLUDE, Angular only.**
3. **Registry gap discovered, not resolved here:** the Final Scope Ledger names "Angular Dock routerLink" as its own INCLUDE line item, distinct from Dock's own keyboard-navigation gap. Direct re-check of `docs/architecture/BLUEPRINT_GAPS.md`'s actual committed registry (GAP-041–068) confirms **no GAP entry exists for it** — GAP-055 as committed covers Dock keyboard navigation only. This specification excludes Angular Dock `routerLink` from its own in-scope items (§1) rather than folding it into GAP-055 (which would broaden that GAP beyond its committed text) or inventing a new GAP number (not authorized at this stage). **Reported to the human for a GAP-stage decision — see §12.**
4. **GAP-054 is one systemic finding covering four components** (Menubar, TieredMenu, MegaMenu, PanelMenu keyboard navigation) — preserved as one Spec section with per-component acceptance criteria, not split into four GAPs (matching the GAP registry's own single-entry treatment).
5. **PanelMenu's multiple-expansion semantics and MegaMenu's disabled-group hover behavior are KEEP CURRENT BEHAVIOR** — explicitly not implementation scope. This Spec's own GAP-054 section covers *keyboard navigation* for PanelMenu/MegaMenu only; it must not be read as reopening either of these two accepted behavioral differences.
6. **GAP-055 (Dock keyboard nav) is INCLUDE, all three frameworks.**
7. **GAP-056 (SpeedDial keyboard nav) is INCLUDE, all three frameworks** — explicitly distinct from SpeedDial's own layout-fidelity question (Parity Confirmed, not touched by this Spec).
8. **GAP-057 (React Tabs `scrollable`) and GAP-058 (React Tabs `closable`) are both INCLUDE, React only, confirmed independent of each other** (different Prime-availability shape — Angular/Vue already have `scrollable`'s equivalent; Angular/Vue correctly never had `closable`'s equivalent).

---

## 3. Framework Applicability

| Gap | Angular | React | Vue |
|---|---|---|---|
| GAP-052 (Steps keyboard nav) | In scope | In scope | In scope |
| GAP-053 (Angular Steps routerLink) | In scope | N/A | N/A |
| GAP-054 (Menubar-family keyboard nav) | In scope | In scope | In scope |
| GAP-055 (Dock keyboard nav) | In scope | In scope | In scope |
| *(unregistered — Angular Dock routerLink, see §2.3/§12)* | *Named by the Final Scope Ledger, no GAP exists* | N/A | N/A |
| GAP-056 (SpeedDial keyboard nav) | In scope | In scope | In scope |
| GAP-057 (React Tabs scrollable) | N/A (already has equivalent) | In scope | N/A (already has equivalent) |
| GAP-058 (React Tabs closable) | **Explicitly out of scope — confirmed no upstream equivalent ever existed** | In scope | **Explicitly out of scope — confirmed no upstream equivalent ever existed** |

---

## 4. Existing Behavior

- **GAP-052:** Real Prime has a full ArrowRight/Left/Home/End system for Steps; Ultimate has none in any framework.
- **GAP-053:** Real PrimeNG Steps has router integration; Angular's own sibling Breadcrumb already correctly implements the equivalent pattern.
- **GAP-054:** Real Prime has extensive keyboard systems for Menubar/TieredMenu/MegaMenu/PanelMenu (confirmed at source-line level for Menubar/MegaMenu); Ultimate has zero keyboard navigation for any of the four, in any framework. `UMenu` itself retains basic Arrow navigation — these four retain none, a materially larger reduction than `UMenu`'s own.
- **GAP-055:** Real Prime Dock has full roving keyboard navigation; Ultimate is mouse-only in all three frameworks. *(Separately, real PrimeNG Dock also has router integration that Angular's Dock lacks — internally inconsistent with Angular's own Menu/Breadcrumb/TieredMenu/MegaMenu, which all support it. This fact is preserved here as evidence, but is not itself in this Spec's scope — see §2.3/§12.)*
- **GAP-056:** Real Prime SpeedDial has full roving keyboard navigation between action items; Ultimate implements only Escape-to-close, in all three frameworks. (SpeedDial's layout/positioning math is separately Parity Confirmed, unrelated to this gap.)
- **GAP-057:** Real PrimeReact TabView has a scroll-button overflow feature; Angular's `showNavigators`/Vue's `TabList.vue` already correctly implement the equivalent. React's `UTabPanel` lacks it.
- **GAP-058:** Real PrimeReact TabView/TabPanel has a genuine per-tab close capability; React's `UTabPanel` omits it. Angular's/Vue's own real upstream Tabs family never had this concept.

---

## 5. Required Behavior

### 5.1 GAP-052 — Steps keyboard navigation

ArrowRight/ArrowLeft move focus to the next/previous step; Home/End move focus to the first/last step — roving focus (only the focused step is tabbable), matching real Prime's own key set. All three frameworks.

### 5.2 GAP-053 — Angular Steps `routerLink`

Steps must accept a `routerLink`-equivalent per-item navigation binding, consistent with Angular's own Breadcrumb's already-working `[routerLink]` pattern. Angular only.

### 5.3 GAP-054 — Menubar/TieredMenu/MegaMenu/PanelMenu keyboard navigation

For each of the four components, independently, in all three frameworks: roving-focus keyboard navigation among top-level items (Arrow keys move focus; Enter/Space activates; Escape closes an open submenu where applicable), matching real Prime's own key set for that specific component. **This requirement does not extend to changing PanelMenu's multiple-expansion exclusivity scope or MegaMenu's disabled-group hover-open behavior** — both remain exactly as currently implemented (§2.5).

### 5.4 GAP-055 — Dock keyboard navigation

Roving-focus keyboard navigation between Dock action items, matching real Prime's own key set. All three frameworks. **Angular Dock `routerLink` is explicitly not part of this requirement** — see §2.3/§12; that finding has no GAP entry and is reported for human decision rather than being implemented under GAP-055's own scope.

### 5.5 GAP-056 — SpeedDial keyboard navigation

Roving-focus keyboard navigation between SpeedDial action items once open, matching real Prime's own key set. All three frameworks. **Explicitly excludes any change to SpeedDial's layout/positioning math** (trig-based calculation, radius/direction handling) — that capability is Parity Confirmed and unrelated to this requirement.

### 5.7 GAP-057 — React Tabs `scrollable`

React `UTabPanel`/Tabs must support scroll-button overflow when tab labels exceed the available width, matching Angular's `showNavigators`/Vue's `TabList.vue` own already-working behavior. React only.

### 5.8 GAP-058 — React Tabs `closable`

React `UTabPanel` must support a per-tab close affordance (close button/icon) that removes the tab when activated, matching real PrimeReact's own close capability. React only. **Angular and Vue must not gain this capability** — their own real upstream Tabs family never had it, and adding it would be a false-parity divergence, not a fix.

---

## 6. API Requirements

- **GAP-053 (routerLink):** Steps gains a `routerLink`-equivalent input, following the exact same binding pattern Angular's Breadcrumb/Menu already use — no new binding shape is introduced.
- **GAP-057:** a `scrollable`-equivalent behavior, activated automatically on overflow (matching Angular/Vue's own automatic-overflow-detection behavior) — no new boolean prop is mandated unless the Implementation Plan determines real PrimeReact's own API requires one for parity.
- **GAP-058:** a `closable`-equivalent prop (component-level or per-tab-item-level, matching real PrimeReact's own API shape) plus a close-event callback.
- All keyboard-navigation requirements (GAP-052/054/055/056) require no new public API — they are internal keydown-handler additions with no externally observable prop/event surface change beyond the keyboard behavior itself.

---

## 7. Dependency Relationships

None among GAP-052 through GAP-058. GAP-057 and GAP-058 are confirmed independent of each other (§2.8). GAP-054 and GAP-055's keyboard-navigation halves are independent of each other (different components, same omission pattern only, no shared mechanism).

---

## 8. Intentional Divergences That Must Remain Unchanged

- **PanelMenu's per-level sibling-exclusivity multiple-expansion behavior** — KEEP CURRENT BEHAVIOR, not touched by GAP-054's keyboard-navigation requirement.
- **MegaMenu's disabled-group hover-open behavior** (stricter than real Prime, blocking hover-open entirely for disabled groups) — KEEP CURRENT BEHAVIOR, not touched by GAP-054's keyboard-navigation requirement.
- **Angular's/Vue's Tabs correctly lacking `closable`** — must remain unchanged; GAP-058 is React-only.
- **SpeedDial's layout/positioning math** — Parity Confirmed, unrelated to and unchanged by GAP-056.

---

## 9. Acceptance Criteria

| Criterion | Traces to |
|---|---|
| Arrow/Home/End roving-focus keyboard nav on Steps — all 3 frameworks | GAP-052 |
| Steps accepts `routerLink`-equivalent binding — Angular only | GAP-053 |
| Roving-focus keyboard nav on Menubar, TieredMenu, MegaMenu, PanelMenu independently — all 3 frameworks each | GAP-054 |
| PanelMenu's multiple-expansion exclusivity scope is unchanged | GAP-054 (non-regression) |
| MegaMenu's disabled-group hover-open behavior is unchanged | GAP-054 (non-regression) |
| Roving-focus keyboard nav on Dock action items — all 3 frameworks | GAP-055 |
| Roving-focus keyboard nav on SpeedDial action items once open — all 3 frameworks | GAP-056 |
| SpeedDial's layout/positioning math is unchanged | GAP-056 (non-regression) |
| React Tabs shows scroll-button overflow on tab-label overflow | GAP-057 |
| React Tabs supports per-tab close affordance with close event | GAP-058 |
| Angular/Vue Tabs do not gain a close affordance | GAP-058 (non-regression) |

---

## 10. Evidence/Source References

`docs/architecture/BLUEPRINT_GAPS.md` GAP-052 through GAP-058; Navigation Findings Triage (`navigation-findings-triage.md`); Consolidated Pass 1 Report §3/§6; Final Consolidated Decision Ledger; Final Scope Ledger.

---

## 11. Explicit Out-of-Scope Items

PanelMenu multiple-expansion behavior; MegaMenu disabled-group hover behavior; `UMenu` popup mechanism (tracked separately, GAP-067); SpeedDial layout/positioning math; Angular/Vue Tabs `closable`.

---

## 12. Unregistered Finding Discovered During Spec Work (Human Review Required, Not Resolved Here)

**Finding:** "Angular Dock `routerLink`" is named as its own distinct INCLUDE line item in the Final Scope Ledger (both §A's row list and §C's capability-family grouping), separate from "Dock keyboard navigation." Direct re-verification of `docs/architecture/BLUEPRINT_GAPS.md`'s actual committed text (GAP-041 through GAP-068, re-read in full during this Spec's authoring) confirms **no GAP entry covers it** — GAP-055 as committed ("Dock lacks keyboard navigation in all three frameworks") contains no `routerLink` content anywhere in its body, evidence, or expected-state fields.

**Why this happened:** the prior GAP-creation stage evidently registered Dock's keyboard-navigation gap but did not separately register its own `routerLink` gap, despite the Final Scope Ledger listing both as distinct INCLUDE items (the same pattern already correctly followed for Steps, which has two separate GAPs — GAP-052 for keyboard nav, GAP-053 for `routerLink`).

**What this Spec does about it:** nothing — per the explicit Spec-stage rule ("if the Spec process discovers a genuinely new issue outside GAP-041–GAP-068, record it separately for human review; do not silently add it to the current scope"), this finding is named here and excluded from §1's in-scope list, §3's framework table, §5's required-behavior sections, and §9's acceptance criteria. It is not implemented under GAP-055's own scope (that would broaden GAP-055 beyond its committed text) and no new GAP number is created (not authorized at this stage).

**Requires:** a human decision on whether to register a new GAP (e.g., a next-available number) for "Angular Dock `routerLink`," mirroring GAP-053's own existing treatment of Steps.
