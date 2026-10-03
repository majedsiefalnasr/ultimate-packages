# Specification — F2 Form / Accessibility: React ToggleButton Space Activation, Vue Password `ariaLabelledby` (GAP-075–GAP-076)

**Status:** Implemented on `feature/prime-parity-followup` (closeout 2026-10-03); GAP-075/GAP-076 RESOLVED. Spec Review 2026-10-02 notes in §12.
**Date:** 2026-10-02
**Branch:** `feature/prime-parity-followup`
**Origin:** post-closeout scope lock (`docs/architecture/research/2026-10-01-prime-parity-scope-lock.md` §6–§7), GAP-075, GAP-076. Parity baseline: ADR-048 (PrimeReact 10.9.9, PrimeVue 4.5.5).

**Required sequence:** Scope Lock → **Specification (this document)** → Spec Review → Implementation Plan → Plan Review → Implementation → Verification → Final Review/Closeout.

**This specification does not implement anything.**

---

## 1. Purpose and Scope

**Purpose:** Establish the acceptance contract for two registered form/accessibility follow-ups found in the Form/Accessibility Plan's reviews.

**In scope:**

- GAP-075: React `UToggleButton` toggles twice on Space in real browsers (`packages/react/src/toggle-button/toggle-button.tsx`).
- GAP-076: Vue `UPassword` has no `ariaLabelledby` prop (`packages/vue/src/password/BasePassword.ts`, `Password.vue`).

**Out of scope:** Angular and Vue ToggleButton (Angular already prevents default, `toggle-button.ts:91`); Angular and React Password (user decision 2026-10-02: GAP-076 stays Vue only); Enter-key behavior of `UToggleButton` (§8); any other SelectButton or Password behavior.

---

## 2. Human Decisions This Specification Implements

1. F2 contains exactly GAP-075 and GAP-076 (scope lock §7.8).
2. GAP-076 is Vue only; no Angular Password GAP is created (scope lock §7.6).
3. Pinned PrimeReact 10.9.9 and PrimeVue 4.5.5 are the normative reference (ADR-048). PrimeReact 11 is a headless rewrite and is not a reference.

---

## 3. Framework Applicability

| Gap                               | Angular                        | React        | Vue          |
| --------------------------------- | ------------------------------ | ------------ | ------------ |
| GAP-075 ToggleButton Space        | Out of scope (already correct) | In scope     | Out of scope |
| GAP-076 Password `ariaLabelledby` | Out of scope (user decision)   | Out of scope | In scope     |

---

## 4. Existing Behavior

- **GAP-075:** `onKeyDown` (`toggle-button.tsx:71-75`) calls `toggle()` on Space or Enter without `preventDefault()`. The element is a native `<input type="checkbox">` whose `onChange={toggle}` also fires when the browser activates it on Space keyup. Space therefore toggles twice and ends where it started. In `USelectButton` single mode with `allowEmpty`, it selects and immediately deselects. jsdom does not simulate the keyup activation, so unit tests (including GAP-059's "Space selects exactly once") cannot catch this. Present since `13d92bb`.
- **GAP-076:** `BasePassword.ts` declares `inputId` and `ariaLabel` (`:38-39`) but no `ariaLabelledby`; `Password.vue` binds only `:aria-label` on the input (`:11`).

**Baseline Prime:**

- PrimeReact 10.9.9 `togglebutton/ToggleButton.js:47-51`: on Space (`keyCode 32`) it calls `toggle(event)` and then `event.preventDefault()`, which suppresses the native activation.
- PrimeVue 4.5.5 `password/BasePassword.vue:125-128` declares `ariaLabelledby` (`String`, default `null`); `Password.vue:11` binds `:aria-labelledby="ariaLabelledby"` on the input; `Password.d.ts:332` types it as `string | undefined`.

---

## 5. Required Behavior

### 5.1 GAP-075 — React ToggleButton

1. Pressing Space on a focused, enabled `UToggleButton` toggles it exactly once in a real browser, matching PrimeReact 10.9.9: the keydown handler toggles and calls `preventDefault()` so the native activation does not also toggle.
2. Mouse clicks and label clicks still toggle exactly once through the native change path.
3. Disabled and read-only buttons still do not toggle.
4. `USelectButton` (which composes `UToggleButton`) selects exactly once on Space in a real browser, in single, `allowEmpty` and multiple modes.

### 5.2 GAP-076 — Vue Password

`UPassword` accepts an `ariaLabelledby` prop (`String`, default `null`) and binds it to the input's `aria-labelledby`, matching PrimeVue 4.5.5. When it is `null` the attribute is absent. `ariaLabel` is unchanged and both can be set together, as in PrimeVue.

---

## 6. API Requirements

- **GAP-075:** no API change.
- **GAP-076:** one new optional Vue prop, `ariaLabelledby?: string`.

---

## 7. Dependency Relationships

GAP-075 and GAP-076 are independent of each other and of F1, F3, F4 and F5.

---

## 8. Intentional Divergences That Must Remain Unchanged

- `UToggleButton` also toggles on Enter, which PrimeReact 10.9.9 does not. This pre-existing behavior is not changed by this Spec. A native checkbox does not activate on Enter, so it does not cause the double-toggle.
- Angular and React Password stay without `ariaLabelledby` (GAP-076 is Vue only by decision).

---

## 9. Acceptance Criteria

| Criterion                                                                                                                      | Traces to      |
| ------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| A real-browser test (React Playwright projects, Storybook story) shows Space toggles a standalone `UToggleButton` exactly once | GAP-075        |
| A real-browser test shows Space selects a `USelectButton` option exactly once in single mode with `allowEmpty`                 | GAP-075        |
| Unit tests assert the Space keydown is default-prevented; click and disabled/read-only behavior unchanged                      | GAP-075        |
| The new browser test asserts no screenshot (no new visual baseline)                                                            | Scope control  |
| Vue `UPassword` with `ariaLabelledby="x"` renders `aria-labelledby="x"` on the input; without it the attribute is absent       | GAP-076        |
| Existing ToggleButton, SelectButton and Password tests pass unchanged                                                          | Non-regression |

---

## 10. Evidence/Source References

`docs/architecture/BLUEPRINT_GAPS.md` GAP-075, GAP-076; PrimeReact 10.9.9 `components/lib/togglebutton/ToggleButton.js`; PrimeVue 4.5.5 `packages/primevue/src/password/{BasePassword.vue,Password.vue,Password.d.ts}` (in `.vendor-cache/`); existing React e2e pattern `packages/react/e2e/checkbox.spec.tsx`.

---

## 11. Explicit Out-of-Scope Items

Angular/Vue ToggleButton; Angular/React Password; Enter-key behavior; other SelectButton/Password features; newer commercial Prime releases (ADR-048).

---

## 12. Spec Review Notes (2026-10-02)

Approved as written, no scope change. Plan requirement: GAP-075's browser coverage must verify that the observable state (checked state / selected option) changes exactly once per Space press, not only that `preventDefault()` was called.
