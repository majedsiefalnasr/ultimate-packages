# Specification — Navigation: Steps, Menubar/TieredMenu/MegaMenu/PanelMenu, Dock, SpeedDial Keyboard Navigation; Angular `routerLink`; React Tabs `scrollable`/`closable` (GAP-052–GAP-058, GAP-069)

**Status:** Implemented on `feature/prime-parity-audit-gaps` (2026-09-30); corrections in §12; GAP-052–GAP-058 and GAP-069 marked RESOLVED at the branch closeout (2026-10-01).
**Date:** 2026-09-26 (updated 2026-09-26 — GAP-069 integrated following its registration during the Scope Reconciliation stage)
**Branch:** `feature/prime-parity-audit-gaps`
**Origin:** the exhaustive Prime-vs-Ultimate parity audit (Batch 3 — Navigation family), its Findings Triage, the Consolidated Pass 1 Report, the Findings Decision/Scope Triage, the Final Consolidated Decision Ledger, the Final Scope Ledger, GAP-052 through GAP-058, and GAP-069 (registered following this Spec's own §12 disclosure and the subsequent Scope Reconciliation Report).

**Required sequence:** Research → Architecture Discussion → Decision (INCLUDE) → GAP registration → **Specification (this document)** → Spec Review → Implementation Plan → Plan Review → Implementation → Verification → Final Review/Closeout.

**This specification does not implement anything.**

---

## 1. Purpose and Scope

**Purpose:** Establish the acceptance contract for eight confirmed Navigation-family gaps, all INCLUDE by human decision, spanning keyboard-navigation additions, two Angular-specific router-integration gaps, and two React-specific Tabs gaps.

**In scope:** GAP-052 (Steps keyboard nav), GAP-053 (Angular Steps `routerLink`), GAP-054 (Menubar/TieredMenu/MegaMenu/PanelMenu keyboard nav — one systemic finding, four components), GAP-055 (Dock keyboard nav), GAP-056 (SpeedDial keyboard nav), GAP-057 (React Tabs `scrollable`), GAP-058 (React Tabs `closable`), GAP-069 (Angular Dock `routerLink`).

**Out of scope:** PanelMenu's own multiple-expansion behavioral difference (KEEP CURRENT BEHAVIOR, not touched — see §2.4); MegaMenu's own disabled-group hover behavioral difference (KEEP CURRENT BEHAVIOR, not touched — see §2.4); any Menu (`UMenu`) capability (tracked separately by GAP-067, not this Spec).

---

## 2. Human Decisions This Specification Implements

1. **GAP-052 (Steps keyboard nav) is INCLUDE, all three frameworks.**
2. **GAP-053 (Angular Steps `routerLink`) is INCLUDE, Angular only.**
3. **GAP-069 (Angular Dock `routerLink`) is INCLUDE, Angular only.** This item was originally disclosed by an earlier version of this Spec as an unregistered finding (the Final Scope Ledger names "Angular Dock routerLink" as its own INCLUDE line item, distinct from Dock's own keyboard-navigation gap, with no corresponding GAP at the time this Spec was first authored). The subsequent Scope Reconciliation Report confirmed no prior GAP covered it, and it was registered as GAP-069. **GAP-055 remains strictly Dock keyboard navigation, not broadened by GAP-069's own registration** — the two are tracked as separate GAPs, per §2.6/§7.
4. **GAP-054 is one systemic finding covering four components** (Menubar, TieredMenu, MegaMenu, PanelMenu keyboard navigation) — preserved as one Spec section with per-component acceptance criteria, not split into four GAPs (matching the GAP registry's own single-entry treatment).
5. **PanelMenu's multiple-expansion semantics and MegaMenu's disabled-group hover behavior are KEEP CURRENT BEHAVIOR** — explicitly not implementation scope. This Spec's own GAP-054 section covers _keyboard navigation_ for PanelMenu/MegaMenu only; it must not be read as reopening either of these two accepted behavioral differences.
6. **GAP-055 (Dock keyboard nav) is INCLUDE, all three frameworks.**
7. **GAP-056 (SpeedDial keyboard nav) is INCLUDE, all three frameworks** — explicitly distinct from SpeedDial's own layout-fidelity question (Parity Confirmed, not touched by this Spec).
8. **GAP-057 (React Tabs `scrollable`) and GAP-058 (React Tabs `closable`) are both INCLUDE, React only, confirmed independent of each other** (different Prime-availability shape — GAP-057's parity target is real PrimeReact's own opt-in `scrollable` behavior, React-only; Angular/Vue's own separate Tabs overflow deficiencies are tracked independently by GAP-071/GAP-072, not by GAP-057 (corrected 2026-09-30, see §12); Angular/Vue correctly never had `closable`'s equivalent).
9. **GAP-069 is confirmed independent of GAP-055** — GAP-055 (Dock keyboard navigation) and GAP-069 (Angular Dock `routerLink`) are two distinct capabilities on the same component, tracked as two separate GAPs; neither broadens the other.

---

## 3. Framework Applicability

| Gap                                   | Angular                                                                                      | React    | Vue                                                                                             |
| ------------------------------------- | -------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| GAP-052 (Steps keyboard nav)          | In scope                                                                                     | In scope | In scope                                                                                        |
| GAP-053 (Angular Steps routerLink)    | In scope                                                                                     | N/A      | N/A                                                                                             |
| GAP-054 (Menubar-family keyboard nav) | In scope                                                                                     | In scope | In scope                                                                                        |
| GAP-055 (Dock keyboard nav)           | In scope                                                                                     | In scope | In scope                                                                                        |
| GAP-069 (Angular Dock routerLink)     | In scope                                                                                     | N/A      | N/A                                                                                             |
| GAP-056 (SpeedDial keyboard nav)      | In scope                                                                                     | In scope | In scope                                                                                        |
| GAP-057 (React Tabs scrollable)       | N/A — out of GAP-057 scope (Angular's own overflow deficiency tracked separately by GAP-071) | In scope | N/A — out of GAP-057 scope (Vue's own resize-overflow deficiency tracked separately by GAP-072) |
| GAP-058 (React Tabs closable)         | **Explicitly out of scope — confirmed no upstream equivalent ever existed**                  | In scope | **Explicitly out of scope — confirmed no upstream equivalent ever existed**                     |

---

## 4. Existing Behavior

- **GAP-052:** Real Prime has a full ArrowRight/Left/Home/End system for Steps; Ultimate has none in any framework.
- **GAP-053:** Real PrimeNG Steps has router integration; Angular Steps lacks it. Angular's sibling Breadcrumb exposes a `routerLink` binding, but its co-located `[attr.href]`+`[routerLink]` pattern has a known href/`RouterLink` conflict, tracked separately as GAP-073 — it is not the template for GAP-053. **(Corrected 2026-09-30 — see §12 Breadcrumb routerLink note; this line previously said Breadcrumb "already correctly implements the equivalent pattern".)**
- **GAP-054:** Real Prime has extensive keyboard systems for Menubar/TieredMenu/MegaMenu/PanelMenu (confirmed at source-line level for Menubar/MegaMenu); Ultimate has zero keyboard navigation for any of the four, in any framework. `UMenu` itself retains basic Arrow navigation — these four retain none, a materially larger reduction than `UMenu`'s own.
- **GAP-055:** Real Prime Dock has full roving keyboard navigation; Ultimate is mouse-only in all three frameworks.
- **GAP-069:** Real PrimeNG Dock has router integration; Angular's Dock lacks it, internally inconsistent with Angular's own Menu/Breadcrumb/TieredMenu/MegaMenu/Steps, which all already expose a `routerLink` binding (Breadcrumb's has a known href/`RouterLink` conflict, tracked separately as GAP-073, not part of GAP-069). **(Corrected 2026-09-30 — see §12.)**
- **GAP-056:** Real Prime SpeedDial has full roving keyboard navigation between action items; Ultimate implements only Escape-to-close, in all three frameworks. (SpeedDial's layout/positioning math is separately Parity Confirmed, unrelated to this gap.)
- **GAP-057:** Real PrimeReact 10.9.9 TabView has an opt-in `scrollable` prop (default `false`) that, when enabled, renders prev/next navigator buttons only while scrolling in that direction is possible, recomputed on render/update and on the strip's own `scroll` event (no `ResizeObserver`). React's `UTabView` has none of this — no scroll container, no navigators, no `scrollable` prop. **(Corrected 2026-09-30, Implementation-stage re-verification, superseding this Spec's own original text below — see §12.)** The original claim that "Angular's `showNavigators`/Vue's `TabList.vue` already correctly implement the equivalent" was carried forward from an unverified triage claim and is INCORRECT as a description of continuous/automatic overflow detection: Ultimate Angular's own `updateButtonState()` only runs on user scroll, never at load or resize (tracked separately as GAP-071); Ultimate Vue's own runs once at mount plus on scroll, but never on resize (tracked separately as GAP-072). Neither matches real PrimeNG/PrimeVue's own `ResizeObserver`-driven behavior, and GAP-057's own parity target is real PrimeReact (which itself has no `ResizeObserver`), not Angular/Vue's current state.
- **GAP-058:** Real PrimeReact TabView/TabPanel has a genuine per-tab close capability; React's `UTabPanel` omits it. Angular's/Vue's own real upstream Tabs family never had this concept.

---

## 5. Required Behavior

### 5.1 GAP-052 — Steps keyboard navigation

ArrowRight/ArrowLeft move focus to the next/previous enabled step; Home/End move focus to the first/last enabled step — matching real Prime's own key set. Hidden (`visible: false`) and disabled steps are skipped. Every enabled step remains individually Tab-reachable (`tabindex="0"`; disabled — including non-active steps when `readonly` — get `tabindex="-1"`), following the Plan's own cross-component tabindex precedent (`UPanelMenu`'s `item.disabled ? -1 : 0`); arrow-key navigation is provided in addition to, not instead of, Tab reachability. All three frameworks. **(Reconciled 2026-09-30 with shipped behavior — see §12; this requirement previously read "roving focus (only the focused step is tabbable)", which did not match the Plan's own tabindex constraint or the implementation.)**

### 5.2 GAP-053 — Angular Steps `routerLink`

Steps must accept a `routerLink`-equivalent per-item navigation binding, with the `RouterLink` directive present only on clickable items (not `readonly`, not disabled), never co-located with an `[attr.href]` binding on the same anchor. Angular only. **(Corrected 2026-09-30 — see §12 Breadcrumb routerLink note; this requirement previously cited Breadcrumb's "already-working" pattern, which has a known href/`RouterLink` conflict tracked separately as GAP-073.)**

### 5.3 GAP-054 — Menubar/TieredMenu/MegaMenu/PanelMenu keyboard navigation

For each of the four components, independently, in all three frameworks: roving-focus keyboard navigation among top-level items (Arrow keys move focus; Enter/Space activates; Escape closes an open submenu where applicable), matching real Prime's own key set for that specific component. **This requirement does not extend to changing PanelMenu's multiple-expansion exclusivity scope or MegaMenu's disabled-group hover-open behavior** — both remain exactly as currently implemented (§2.5).

### 5.4 GAP-055 — Dock keyboard navigation

Roving-focus keyboard navigation between Dock action items, matching real Prime's own key set. All three frameworks. **Angular Dock `routerLink` is a separate requirement, tracked by GAP-069 (§5.5), not part of GAP-055's own scope.**

### 5.5 GAP-069 — Angular Dock `routerLink`

Dock must accept a `routerLink`-equivalent per-item navigation binding, following Steps' shipped structural-branch `routerLink` pattern (GAP-053), with the `RouterLink` directive present only on enabled items. Angular only. **(Corrected 2026-09-30 — see §12 Breadcrumb routerLink note; this requirement previously cited an "already-working Breadcrumb/Menu/Steps pattern"; Breadcrumb's pattern has a known href/`RouterLink` conflict tracked separately as GAP-073.)**

### 5.6 GAP-056 — SpeedDial keyboard navigation

Roving-focus keyboard navigation between SpeedDial action items once open, matching real Prime's own key set. All three frameworks. **Explicitly excludes any change to SpeedDial's layout/positioning math** (trig-based calculation, radius/direction handling) — that capability is Parity Confirmed and unrelated to this requirement.

### 5.7 GAP-057 — React Tabs `scrollable`

React `UTabView` must gain an opt-in `scrollable` prop (default `false`, matching real PrimeReact 10.9.9's own default) that, when `true`, wraps the tab-header strip in a horizontally-scrollable container and renders prev/next navigator buttons only while scrolling in that direction is possible — recomputed on render/update and on the strip's own `scroll` event, matching real PrimeReact's own recalculation behavior exactly (no `ResizeObserver`). React only. **(Corrected 2026-09-30 — see §12; this requirement previously read "matching Angular's `showNavigators`/Vue's `TabList.vue` own already-working behavior," which does not accurately describe either framework's real current implementation and has been replaced with the actual, source-verified real-PrimeReact parity target.)**

### 5.8 GAP-058 — React Tabs `closable`

React `UTabPanel` must support a per-tab close affordance (close button/icon) that removes the tab when activated, matching real PrimeReact's own close capability. React only. **Angular and Vue must not gain this capability** — their own real upstream Tabs family never had it, and adding it would be a false-parity divergence, not a fix.

---

## 6. API Requirements

- **GAP-053/GAP-069 (routerLink):** Steps (GAP-053) and Dock (GAP-069) each gain a `routerLink`-equivalent input, following the exact same binding pattern Angular's Breadcrumb/Menu already use — no new binding shape is introduced for either.
- **GAP-057 (corrected 2026-09-30 — see §12):** a `scrollable` boolean prop, opt-in, default `false`, matching real PrimeReact 10.9.9's own API shape exactly (not Ultimate's own always-on `showNavigators` convention) — navigator visibility recomputed on render/update and on the strip's own `scroll` event, no `ResizeObserver`.
- **GAP-058:** a `closable`-equivalent prop (component-level or per-tab-item-level, matching real PrimeReact's own API shape) plus a close-event callback.
- All keyboard-navigation requirements (GAP-052/054/055/056) require no new public API — they are internal keydown-handler additions with no externally observable prop/event surface change beyond the keyboard behavior itself.

---

## 7. Dependency Relationships

None among GAP-052 through GAP-058, or GAP-069. GAP-057 and GAP-058 are confirmed independent of each other (§2.8). GAP-054 and GAP-055's keyboard-navigation halves are independent of each other (different components, same omission pattern only, no shared mechanism). **GAP-055 and GAP-069 are confirmed independent** (§2.9) — two distinct capabilities on the same component (Dock), tracked as two separate GAPs.

---

## 8. Intentional Divergences That Must Remain Unchanged

- **PanelMenu's per-level sibling-exclusivity multiple-expansion behavior** — KEEP CURRENT BEHAVIOR, not touched by GAP-054's keyboard-navigation requirement.
- **MegaMenu's disabled-group hover-open behavior** (stricter than real Prime, blocking hover-open entirely for disabled groups) — KEEP CURRENT BEHAVIOR, not touched by GAP-054's keyboard-navigation requirement.
- **Angular's/Vue's Tabs correctly lacking `closable`** — must remain unchanged; GAP-058 is React-only.
- **SpeedDial's layout/positioning math** — Parity Confirmed, unrelated to and unchanged by GAP-056.

---

## 9. Acceptance Criteria

| Criterion                                                                                                                                                                                                                                                                                                             | Traces to                |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Arrow/Home/End roving-focus keyboard nav on Steps — all 3 frameworks                                                                                                                                                                                                                                                  | GAP-052                  |
| Steps accepts `routerLink`-equivalent binding — Angular only                                                                                                                                                                                                                                                          | GAP-053                  |
| Roving-focus keyboard nav on Menubar, TieredMenu, MegaMenu, PanelMenu independently — all 3 frameworks each                                                                                                                                                                                                           | GAP-054                  |
| PanelMenu's multiple-expansion exclusivity scope is unchanged                                                                                                                                                                                                                                                         | GAP-054 (non-regression) |
| MegaMenu's disabled-group hover-open behavior is unchanged                                                                                                                                                                                                                                                            | GAP-054 (non-regression) |
| Roving-focus keyboard nav on Dock action items — all 3 frameworks                                                                                                                                                                                                                                                     | GAP-055                  |
| Dock accepts `routerLink`-equivalent binding — Angular only                                                                                                                                                                                                                                                           | GAP-069                  |
| Roving-focus keyboard nav on SpeedDial action items once open — all 3 frameworks                                                                                                                                                                                                                                      | GAP-056                  |
| SpeedDial's layout/positioning math is unchanged                                                                                                                                                                                                                                                                      | GAP-056 (non-regression) |
| React Tabs gains opt-in `scrollable` prop (default `false`); when `false`, no navigators render; when `true`, prev/next navigators render only while scrolling in that direction is possible, recalculated on render/update and on the strip's `scroll` event (no `ResizeObserver`) — matching real PrimeReact 10.9.9 | GAP-057                  |
| React Tabs supports per-tab close affordance with close event                                                                                                                                                                                                                                                         | GAP-058                  |
| Angular/Vue Tabs do not gain a close affordance                                                                                                                                                                                                                                                                       | GAP-058 (non-regression) |

---

## 10. Evidence/Source References

`docs/architecture/BLUEPRINT_GAPS.md` GAP-052 through GAP-058, GAP-069; Navigation Findings Triage (`navigation-findings-triage.md`); Consolidated Pass 1 Report §3/§6; Final Consolidated Decision Ledger; Final Scope Ledger; Scope Reconciliation Report (this session, confirming GAP-069's registration).

---

## 11. Explicit Out-of-Scope Items

PanelMenu multiple-expansion behavior; MegaMenu disabled-group hover behavior; `UMenu` popup mechanism (tracked separately, GAP-067); SpeedDial layout/positioning math; Angular/Vue Tabs `closable`.

---

## 12. Resolution History (Informational)

This Spec originally disclosed "Angular Dock `routerLink`" as an unregistered finding with no corresponding GAP entry, discovered while authoring this document. A subsequent Scope Reconciliation Report confirmed no prior GAP covered it and recommended registration; GAP-069 was then created, and this Spec was updated (§1, §2.3/§2.9, §3, §4, §5.5, §6, §7, §9, §10) to incorporate it as a normal, fully-traced requirement. GAP-055 was not modified or broadened by this process — it remains exactly as originally committed ("Dock lacks keyboard navigation in all three frameworks"), and GAP-069 is tracked as its own, separate entry. **Section-numbering correction (2026-09-26):** §5's subsections were originally numbered out of sequence (§5.6 for GAP-069 physically appearing before §5.5 for GAP-056); renumbered here to be sequential (§5.5 GAP-069, §5.6 GAP-056) per the Spec Review's own finding — no content, scope, or acceptance criteria changed by this correction.

**GAP-057 factual correction (2026-09-30, during Implementation):** this Spec's original §4/§5.7/§6 text for GAP-057 claimed Angular's `showNavigators`/Vue's `TabList.vue` "already correctly implement" automatic-overflow-detection behavior for React to port. That claim traced back to an unverified Batch 3 triage carry-forward (never re-derived against real source) and was further embellished during Spec drafting into "automatic-overflow-detection" language the underlying triage note never actually used. Direct Implementation-stage source inspection (real PrimeReact 10.9.9, real PrimeNG 21.1.9, real PrimeVue 4.5.5, and Ultimate's own current Angular/React/Vue Tabs source) found: neither Ultimate Angular nor Ultimate Vue performs continuous/automatic overflow detection (Angular never measures at load or resize; Vue measures once at mount but never on resize); real PrimeReact's own `scrollable` behavior is an opt-in prop with render/scroll-based recalculation, not a `ResizeObserver` pattern — a materially different, and now confirmed-correct, parity target for React than the original Spec text described. §4, §5.7, and §6 are corrected above to reflect real-PrimeReact parity as GAP-057's own actual target, per explicit user authorization (2026-09-30). Two newly-discovered, genuinely separate defects surfaced during this same re-verification — Ultimate Angular's own missing initial/resize overflow detection, and Ultimate Vue's own missing resize-only overflow detection — are explicitly NOT folded into GAP-057; they are registered as their own new GAPs (GAP-071, GAP-072) in `docs/architecture/BLUEPRINT_GAPS.md`, out of scope for this Spec and for GAP-057's own Implementation Plan task. A third, unrelated pre-existing documentation defect (Angular's own `tab-list.ts` doc comment falsely claiming a `scrollable` input exists on `UTabs`) was also discovered and is explicitly left unregistered pending a separate scope-reconciliation step, per the same user authorization — it is not assumed to belong to either GAP-071 or GAP-072 without that reconciliation.

**GAP-058 API decisions (2026-09-30, during Implementation):** Plan Task 25's required source check found real PrimeReact 10.9.9's closable contract differs from the Plan's original guess (a per-panel `onClose`); §6's own requirement to match "real PrimeReact's own API shape" governs. User rulings, recorded in Plan Task 25 and `docs/architecture/BLUEPRINT_GAPS.md` GAP-058: (1) `closable` (default `false`) and `closeIcon` on `UTabPanel`; (2) `onTabClose` and cancellable `onBeforeTabClose` (returning `false` cancels) on `UTabView`, payload `{ originalEvent, index }`; (3) the close control is a native `<button type="button" aria-label="Close">` placed beside the header button inside the tab `<li>` (a disclosed deviation from PrimeReact's focusable SVG); (4) PrimeReact-compatible active-tab re-pick after every close, and closed-tab identity by the child's React key, falling back to its original index. §5.8/§9's requirement of "a per-tab close affordance … with close event" is satisfied by this API. Known limitations, outside the GAP-058 contract: a controlled parent removing children inside `onTabClose` is an unsupported mutation-timing edge case, and the close button's placement inside `role="tab"` is an accessibility follow-up pending real screen-reader verification.

**§5.1 reconciliation (2026-09-30, post-final-review):** §5.1 originally said "roving focus (only the focused step is tabbable)". The Plan's own Global Constraints set the tabindex precedent as `UPanelMenu`'s `item.disabled ? -1 : 0`, and that shipped in all three frameworks: every enabled step is Tab-reachable, with arrow-key navigation in addition. By user decision, §5.1 now documents the shipped behavior; the implementation was not changed to fit the old wording. The same review found, and a fix-loop corrected, two defects: Steps keyboard navigation now skips hidden items in all three frameworks (GAP-052), and Angular Steps' `routerLink` no longer navigates when `readonly` (GAP-053, matching PrimeNG's `isClickableRouterLink`).

**Breadcrumb routerLink note (2026-09-30):** GAP-053/GAP-069 were originally framed around Breadcrumb's "already-working" `routerLink` pattern. Implementation found that pattern — `[attr.href]` and `[routerLink]` on one anchor — lets Angular's `RouterLink` host binding overwrite the `url`/`#` href fallback. Steps and Dock use a structural `@if`/`@else` branch instead. Breadcrumb's own copy of the defect is registered separately as GAP-073, outside this Spec's scope.
