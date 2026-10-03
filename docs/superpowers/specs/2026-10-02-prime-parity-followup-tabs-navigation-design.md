# Specification — F1 Tabs / Navigation: Tabs Overflow Detection and Breadcrumb Links (GAP-071–GAP-073)

**Status:** Implemented on `feature/prime-parity-followup` (closeout 2026-10-03); GAP-071–GAP-073 RESOLVED. Spec Review 2026-10-02 notes in §12.
**Date:** 2026-10-02
**Branch:** `feature/prime-parity-followup`
**Origin:** post-closeout scope lock (`docs/architecture/research/2026-10-01-prime-parity-scope-lock.md` §6–§7), GAP-071, GAP-072, GAP-073. Parity baseline: ADR-048 (PrimeNG 21.1.9, PrimeVue 4.5.5).

**Required sequence:** Scope Lock → **Specification (this document)** → Spec Review → Implementation Plan → Plan Review → Implementation → Verification → Final Review/Closeout.

**This specification does not implement anything.**

---

## 1. Purpose and Scope

**Purpose:** Establish the acceptance contract for three registered navigation follow-ups found during the Navigation Plan.

**In scope:**

- GAP-071: Angular Tabs navigator visibility on first render and on resize (`packages/ng/src/tabs/tab-list.ts`), plus the folded-in correction of its own doc comment (`tab-list.ts:10-11`).
- GAP-072: Vue Tabs navigator re-evaluation after mount (`packages/vue/src/tabs/TabList.vue`).
- GAP-073: Angular Breadcrumb `href`/`RouterLink` co-location (`packages/ng/src/breadcrumb/breadcrumb.ts`).

**Out of scope:** adding a `scrollable` input to Angular `UTabs`; wiring or removing Vue's unused `scrollable` prop (a cleanup note under GAP-072, user decision 2026-10-02); the ink-bar observer PrimeVue also binds; React Tabs (GAP-057 delivered `scrollable` there); Breadcrumb behavior other than the link/href co-location (including `aria-current` matching).

---

## 2. Human Decisions This Specification Implements

1. F1 contains exactly GAP-071, GAP-072 and GAP-073 (scope lock §7.8).
2. The `tab-list.ts:10-11` comment correction is folded into GAP-071; Vue's dead `scrollable` prop stays a cleanup note under GAP-072; no new GAPs (scope lock §7.7).
3. Pinned PrimeNG 21.1.9 and PrimeVue 4.5.5 are the normative reference (ADR-048).

---

## 3. Framework Applicability

| Gap                                    | Angular  | React | Vue      |
| -------------------------------------- | -------- | ----- | -------- |
| GAP-071 Tabs initial/resize overflow   | In scope | N/A   | N/A      |
| GAP-072 Tabs re-evaluation after mount | N/A      | N/A   | In scope |
| GAP-073 Breadcrumb href/RouterLink     | In scope | N/A   | N/A      |

---

## 4. Existing Behavior

- **GAP-071:** `UTabList.updateButtonState()` runs only from the content element's `scroll` handler (`tab-list.ts:51-52`). There is no view-init call and no `ResizeObserver`, and both enabled-state signals start `false` (`:48-49`). An overflowing strip therefore shows no navigator until the user scrolls by other means. The class comment (`:10-11`) says the component "Reads `scrollable`", but `UTabs` has no such input.
- **GAP-072:** `TabList.vue` calls `updateButtonState()` from `mounted()` (only when `showNavigators`) and from its `scroll` handler. There is no `updated()` hook, no `ResizeObserver`, and no reaction when `showNavigators` changes after mount.
- **GAP-073:** both the home anchor (`breadcrumb.ts:48-49`) and each model anchor (`:73-74`) bind `[attr.href]` and `[routerLink]` on the same `<a>`. Angular's `RouterLink` is present even when bound to `null`, and its host `href` binding overwrites the template's, so items without an active `routerLink` lose their `url`/`#` href. `breadcrumb.spec.ts` asserts no `href`.

**Baseline Prime:**

- PrimeNG 21.1.9 `tabs/tablist.ts`: `onAfterViewInit` (`:148-152`) calls `updateButtonState()` and `bindResizeObserver()` when navigators are shown and `isPlatformBrowser`. `bindResizeObserver` observes the host element (`:232-235`), and `onDestroy` unbinds it (`:172-173`).
- PrimeVue 4.5.5 `tablist/TabList.vue`: `mounted()` updates and binds a `ResizeObserver` when navigators are shown (`:79-82`); `updated()` re-checks (`:84-86`); a `showNavigators` watcher binds or unbinds (`:62-64`); `beforeUnmount` unbinds (`:87-88`).
- PrimeNG 21.1.9 `breadcrumb/breadcrumb.ts` renders separate anchors: one with `[href]` when there is no `routerLink`, one with `[routerLink]` when there is (`:31,53` home; `:103,128` items).

---

## 5. Required Behavior

### 5.1 GAP-071 — Angular Tabs

1. After the view initializes, in the browser only, and when navigators are shown, `UTabList` computes navigator visibility once. An overflowing strip shows its next navigator immediately.
2. While navigators are shown, a `ResizeObserver` re-computes visibility when the tab list's size changes, matching PrimeNG 21.1.9. It is created only in the browser (`isPlatformBrowser`, as GAP-065/GAP-080 require) and disconnected on destroy.
3. The existing scroll-triggered update is unchanged.
4. The class comment no longer claims the component reads `scrollable`.

### 5.2 GAP-072 — Vue Tabs

1. Navigator visibility is re-computed in `updated()` when navigators are shown.
2. While navigators are shown, a `ResizeObserver` on the tab list re-computes visibility. It is bound on mount, bound or unbound when `showNavigators` changes, and unbound before unmount, matching PrimeVue 4.5.5.
3. The existing `mounted()` and scroll updates are unchanged.

### 5.3 GAP-073 — Angular Breadcrumb

1. For the home item and each model item, an anchor carries `RouterLink` only when the item has a `routerLink` and is not disabled.
2. Every other anchor renders `href` = `url` when set, otherwise `#`, and has no `RouterLink` directive. This uses the structural `@if`/`@else` pattern already shipped in Steps (`steps.ts:38-51`, GAP-053) and Dock (GAP-069).
3. All other attributes and the click handling on the anchors (class, `aria-label`, `aria-disabled`, `aria-current`, `tabindex`, `data-u-disabled`, `onClick`) are identical in both branches. Disabled items still prevent default on click (`breadcrumb.ts:125-127`).

---

## 6. API Requirements

No new public API. No new inputs, props or events in any of the three components.

---

## 7. Dependency Relationships

GAP-071, GAP-072 and GAP-073 are independent of each other and of F2–F5.

---

## 8. Intentional Divergences That Must Remain Unchanged

- Angular `UTabs` keeps having no `scrollable` input (out of scope, §1).
- Vue's unused `scrollable` prop is not changed by this Spec (cleanup note only).
- Breadcrumb keeps Ultimate's `#` fallback for items without `url` (PrimeNG renders no `href`); this Spec only fixes the overwrite.

---

## 9. Acceptance Criteria

| Criterion                                                                                                                                                                            | Traces to                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------ |
| An Angular `UTabs` whose labels overflow on first render shows its next navigator without any scroll                                                                                 | GAP-071                  |
| Resizing an Angular tab list re-computes navigator visibility; no `ResizeObserver` is created under a server `PLATFORM_ID` (spy-based test); the observer is disconnected on destroy | GAP-071                  |
| `tab-list.ts`'s class comment no longer mentions `scrollable`                                                                                                                        | GAP-071 (folded cleanup) |
| A Vue Tabs instance that becomes overflowing after mount (added tab or resize) re-shows its navigator without a scroll                                                               | GAP-072                  |
| The Vue observer is bound/unbound with `showNavigators` and before unmount                                                                                                           | GAP-072                  |
| Angular Breadcrumb items with `url` (no `routerLink`) render that `href`; items with neither render `#`; disabled items render `href` and no `RouterLink`                            | GAP-073                  |
| Items with a `routerLink` still navigate through the router; `breadcrumb.spec.ts` gains `href`-asserting tests                                                                       | GAP-073                  |
| Existing Tabs and Breadcrumb tests pass unchanged                                                                                                                                    | Non-regression           |

---

## 10. Evidence/Source References

`docs/architecture/BLUEPRINT_GAPS.md` GAP-071, GAP-072, GAP-073; `docs/architecture/research/2026-10-01-prime-parity-scope-lock.md`; PrimeNG 21.1.9 `packages/primeng/src/tabs/tablist.ts`, `packages/primeng/src/breadcrumb/breadcrumb.ts`; PrimeVue 4.5.5 `packages/primevue/src/tablist/TabList.vue` (all in `.vendor-cache/`).

---

## 11. Explicit Out-of-Scope Items

Angular `scrollable` input; Vue `scrollable` prop; PrimeVue's ink-bar observer; React Tabs; Breadcrumb `aria-current` and any other Breadcrumb behavior; newer commercial Prime releases (ADR-048).

---

## 12. Spec Review Notes (2026-10-02)

Approved as written, no scope change. Plan requirement: GAP-072's observer must never be bound twice: when `showNavigators` changes (or on any rebind), an existing observer is disconnected before a new one is created.
