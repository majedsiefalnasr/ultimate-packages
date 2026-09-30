# Prime Parity: Form/Accessibility Implementation Plan (GAP-059–GAP-061)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Execution approach:** Subagent-driven development, one implementer/reviewer cycle per task.

**Goal:** Add PrimeReact-matching roving-tabindex to React SelectButton (GAP-059); compose `UProgressBar` in FileUpload instead of a bare div, all 3 frameworks (GAP-060); add PrimeVue-matching disclosure ARIA to Vue Password's input and strength overlay (GAP-061).

**Corrections (2026-09-30, before implementation):** Task 1 is withdrawn — real PrimeNG SelectButton has no roving-tabindex, so Angular is reclassified as matching upstream. Task 2 and Task 6 are rewritten to match real PrimeReact and real PrimeVue respectively. See Spec §12 for the evidence and user decisions.

**Spec:** `docs/superpowers/specs/2026-09-26-prime-parity-form-accessibility-design.md`.

**GAP → Task mapping:**

| GAP | Task(s) |
|---|---|
| GAP-059 | Task 2 (React) — Task 1 (Angular) withdrawn |
| GAP-060 | Task 3 (Angular), Task 4 (React), Task 5 (Vue) |
| GAP-061 | Task 6 (Vue only) |

## Global Constraints

- **Vue and Angular SelectButton are not touched.** Both confirmed matching their own real upstream (no roving-tabindex) — GAP-059 is React only.
- **Angular/React Password are not touched by Task 6.** Confirmed their own real upstream lacks this disclosure-pattern ARIA richness — GAP-061 is Vue only.
- **`UProgressBar`'s own existing ARIA (`role="progressbar"`, `aria-valuemin`/`aria-valuemax`/`aria-valuenow`) is not modified.** Tasks 3-5 compose it as-is; the fix is purely "use the existing correct component instead of a bare div."
- **FileUpload-scoped progress bar height (added 2026-09-30, user decision after Task 3 review).** Composing `UProgressBar` gives it its standalone fixed `height: 1.5rem`; real Prime makes the bar thin inside FileUpload (`@primeuix/styles` 2.0.3 fileupload: `.p-fileupload-content .p-progressbar { width: 100%; height: dt('fileupload.progressbar.height') }`, Aura `0.25rem`). Tasks 3-5 therefore also touch each framework's `file-upload-style.ts`: add a FileUpload-scoped rule giving the composed progress bar `width: 100%; height: 0.25rem`, and delete the now-dead `progressBar`/`progressBarValue` classes and `.u-file-upload-progress-bar(-value)` CSS. `UProgressBar`'s own style file is not modified. The bar's placement and its `uploading` render condition are unchanged (PrimeNG renders it inside the content area when files exist — not adopted).

## Review Focus

- **SelectButton with no focusable option** — Task 2 skips disabled options (user decision 2026-09-30, see Task 2), so the "find the next enabled option" search must terminate when every option is disabled, and arrow keys must be a no-op (no throw, no infinite loop) when the component is `disabled` or all options are disabled.
- **FileUpload's `progress` value exceeding 100 or going negative from a malformed XHR event** — `UProgressBar`'s own existing `value` input has no documented clamping; Task 3-5 should pass the raw `progress` state through unchanged (matching current behavior) rather than adding new clamping logic not requested by any GAP.

---

### Task 1: Angular — GAP-059 SelectButton roving-tabindex — WITHDRAWN (2026-09-30)

Not implemented. Step 1's required source check found real PrimeNG 21.1.9 SelectButton has no roving-tabindex (each option is a `p-togglebutton` with tabindex 0/−1 handling only Enter/Space; `changeTabIndexes` is dead code), and Ultimate's Angular port already matches. User decision: Angular reclassified as matching upstream; no Angular files change. See Spec §12. (This task originally specified an Angular roving-tabindex implementation with ArrowRight/ArrowLeft and disabled-option skipping.)

---

### Task 2: React — GAP-059 SelectButton roving-tabindex

**Files:** `packages/react/src/select-button/select-button.tsx`, `select-button.spec.tsx`, `packages/react/src/toggle-button/toggle-button.tsx` (+ its spec for the new prop).

**Composition constraint (found pre-dispatch 2026-09-30; user decision recorded in Spec §12):** `USelectButton` composes `UToggleButton`, which renders a native `<input type="checkbox" disabled>` and exposed no `tabIndex` prop; PrimeReact renders its own focusable item per option. Decision: add one optional `tabIndex?: number` prop to `UToggleButton`, forwarded to its `<input>` (omitted → current behavior unchanged); handle arrow keys on `USelectButton`'s `role="group"` container (keydown bubbles from the focused input); skip disabled options, since a native-disabled input cannot receive focus. No other `UToggleButton` changes.

**Target behavior (real PrimeReact 10.9.9, `SelectButton.js:16,101`, `SelectButtonItem.js:41-94`; Spec §5.1), with the two recorded differences:**
- A `focusedIndex` state, initially the first enabled option (PrimeReact: `0`; differs only when option 0 is disabled, because a disabled input cannot hold the tab stop). Each option's tabindex is `0` when it is the `focusedIndex` option and the component is not `disabled`, otherwise `-1`.
- Keydown, matching on `event.code`: `ArrowRight`/`ArrowDown` → next enabled option, `ArrowLeft`/`ArrowUp` → previous enabled option, wrapping at both ends; `preventDefault()`; set `focusedIndex` and move DOM focus. Arrows move focus only, never selection.
- `Space` selects (keep `UToggleButton`'s existing activation; do not add a second toggle path). Note: `UToggleButton`'s existing Space handling double-toggles in real browsers — a pre-existing defect not visible in jsdom, registered separately as GAP-075 and not fixed here.
- When the component is `disabled` or no option is enabled, arrow keys are a no-op (no throw, bounded search).
- If `focusedIndex` points at an option that becomes disabled or removed, fall back to the first enabled option.

- [ ] **Step 1: Write the failing tests** — `UToggleButton` forwards `tabIndex` to its input and omits it when not given; only the `focusedIndex` option has tabindex `0` (initially the first enabled); ArrowRight/ArrowDown move to the next enabled option; ArrowLeft/ArrowUp to the previous; wrap at both ends; a disabled option is skipped; arrows do not change the selected value; component `disabled` → every option tabindex `-1` and ArrowRight does not throw; all options disabled → no throw, no loop.
- [ ] **Step 2: Implement** per the target behavior above, React idioms. Any further change to `UToggleButton` beyond the optional `tabIndex` prop → stop and report.
- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

### Task 3: Angular — GAP-060 FileUpload progress ARIA

**Files:** `packages/ng/src/file-upload/file-upload.ts`, `file-upload.spec.ts`, `file-upload-style.ts` (style file added 2026-09-30 — see Global Constraints; landed as a follow-up commit after the initial Task 3 commit `e47233c`).

- [ ] **Step 1: Write the failing tests**

```typescript
describe("progress ARIA via UProgressBar composition (Spec §5.2, GAP-060)", () => {
  it("renders a role=progressbar element with the current progress as aria-valuenow while uploading", () => {
    const fixture = TestBed.createComponent(UFileUpload);
    fixture.detectChanges();
    fixture.componentInstance["progress"].set(42); // or however the existing internal progress state is exposed/settable in this file
    fixture.detectChanges();
    const bar = fixture.nativeElement.querySelector("[role=progressbar]");
    expect(bar).toBeTruthy();
    expect(bar.getAttribute("aria-valuenow")).toBe("42");
  });
});
```

(Exact mechanism for driving `progress` to a test value must match this file's own existing internal state shape — read the current `file-upload.ts` implementation before finalizing this test's setup; do not invent a public API that doesn't exist.)

- [ ] **Step 2: Implement**

Import `UProgressBar` and add it to the component's `imports` array. Replace the existing bare progress `<div>` markup with `<u-progress-bar [value]="progress()" [showValue]="false" />` (matching Prime's `showValue` false; or the exact existing progress-state accessor name in this file), inheriting `UProgressBar`'s own already-correct `role="progressbar"`/`aria-valuemin`/`aria-valuemax`/`aria-valuenow` host bindings automatically. Do not add any new clamping to the `progress` value — pass it through exactly as FileUpload's own XHR progress handler already computes it.

- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

### Task 4: React — GAP-060 FileUpload progress ARIA

**Files:** `packages/react/src/file-upload/file-upload.tsx`, `file-upload.spec.tsx`, `file-upload-style.ts` (style file added 2026-09-30 — see Global Constraints).

- [ ] **Step 1:** Equivalent test, driving the existing `progress`/`setProgress` state (confirmed present, `file-upload.tsx:137`).
- [ ] **Step 2: Implement** — import and render `UProgressBar` (React's own equivalent component) with `value={progress}` and `showValue={false}` in place of the existing bare progress-bar `<div>` markup.
- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

### Task 5: Vue — GAP-060 FileUpload progress ARIA

**Files:** `packages/vue/src/file-upload/FileUpload.vue`, `file-upload.spec.ts`, `file-upload-style.ts` (style file added 2026-09-30 — see Global Constraints).

- [ ] **Step 1:** Equivalent test, driving the existing `this.progress` data field (confirmed present, `FileUpload.vue:96/205`).
- [ ] **Step 2: Implement** — import `UProgressBar` and replace the existing `:class="cx('progressBar')"` / `:class="cx('progressBarValue')"` bare-div markup (lines 25-27) with `<UProgressBar v-if="uploading" :value="progress" :showValue="false" />`.
- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

### Task 6: Vue — GAP-061 Password disclosure-pattern ARIA

**Files:** `packages/vue/src/password/Password.vue`, `password.spec.ts`, `password-style.ts` (style file added 2026-09-30 — see hidden-span note below).

**Target behavior (real PrimeVue 4.5.5, `packages/primevue/src/password/Password.vue:13-15,44-45,57-58`; Spec §5.3). Corrected 2026-09-30 — this task originally put the ARIA on the mask-toggle `<svg role="button">` icons with `aria-expanded` tracking the mask state, which does not match real PrimeVue; see Spec §12.**
- On the **input**: `aria-haspopup` bound to `feedback`; `aria-expanded` bound to `overlayVisible`; `aria-controls` = the strength overlay's id while `overlayVisible`, otherwise absent.
- The strength overlay element (inside the existing `UPortal`) gets that id plus `role="dialog"` and `aria-live="polite"`. Generate the id with this codebase's existing Vue unique-id pattern (find and reuse it; do not add a new mechanism). Do not add new public props such as `overlayId`/`panelId`.
- A visually hidden span with `aria-live="polite"` rendering `{{ infoText }}`, always rendered (PrimeVue `:44-45`, class `p-hidden-accessible`). **Updated 2026-09-30 (user decision after Task 6 stop):** the codebase has no CSS for `p-hidden-accessible`/`u-hidden-accessible` (pre-existing defect registered separately as GAP-074, not fixed here). Hide the span with a Password-owned class and a standard visually-hidden rule (1px, clip, absolute, overflow hidden, no margin/padding/border) added to `packages/vue/src/password/password-style.ts`; do not add shared/base styling.
- Overlay id: reuse the `useId()`-in-`setup()` pattern of `Dialog.vue:57,130-136` / `Menu.vue`.
- Mask/unmask toggle icons unchanged.

- [ ] **Step 1: Write the failing tests** — input has `aria-haspopup="true"` with `feedback` (and `"false"` without); `aria-expanded="false"` initially; after focusing the input with `feedback`, `aria-expanded="true"`, `aria-controls` equals the overlay element's id, and the overlay has `role="dialog"` and `aria-live="polite"`; after blur, `aria-expanded="false"` and no `aria-controls`; the hidden `aria-live` span exists and shows the current `infoText` (prompt, then strength label after input); toggle icons carry no `aria-expanded`/`aria-controls`/`aria-haspopup`. The overlay is portaled — query the document, not only the wrapper.
- [ ] **Step 2: Implement** per the target behavior above.
- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

## Completion Criteria

- Tasks 2-6 pass (Task 1 withdrawn).
- The affected package's own suite (`pnpm --filter @ultimate/<pkg> test`), its typecheck, and `pnpm run ceiling:validate` pass after each task. (Corrected 2026-09-30: this line said `pnpm test`; the full-monorepo run has pre-existing unrelated dist-artifact failures, so per-package runs are the standing rule.)
- Vue/Angular SelectButton and Angular/React Password remain unmodified (verify via `git status`).

## Documentation/Ledger Updates

Upon Final Review/Closeout: mark GAP-059 through GAP-061 RESOLVED in `docs/architecture/BLUEPRINT_GAPS.md`. Not performed by this plan document.
