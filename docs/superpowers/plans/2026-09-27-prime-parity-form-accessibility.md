# Prime Parity: Form/Accessibility Implementation Plan (GAP-059–GAP-061)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Execution approach:** Subagent-driven development, one implementer/reviewer cycle per task.

**Goal:** Add roving-tabindex to Angular/React SelectButton (GAP-059); compose `UProgressBar` in FileUpload instead of a bare div, all 3 frameworks (GAP-060); add disclosure-pattern ARIA to Vue Password (GAP-061).

**Spec:** `docs/superpowers/specs/2026-09-26-prime-parity-form-accessibility-design.md`.

**GAP → Task mapping:**

| GAP | Task(s) |
|---|---|
| GAP-059 | Task 1 (Angular), Task 2 (React) |
| GAP-060 | Task 3 (Angular), Task 4 (React), Task 5 (Vue) |
| GAP-061 | Task 6 (Vue only) |

## Global Constraints

- **Vue SelectButton is not touched by Task 1/2.** Confirmed matching its own real upstream (no roving-tabindex) — GAP-059 is Angular+React only.
- **Angular/React Password are not touched by Task 6.** Confirmed their own real upstream lacks this disclosure-pattern ARIA richness — GAP-061 is Vue only.
- **`UProgressBar`'s own existing ARIA (`role="progressbar"`, `aria-valuemin`/`aria-valuemax`/`aria-valuenow`) is not modified.** Tasks 3-5 compose it as-is; the fix is purely "use the existing correct component instead of a bare div."

## Review Focus

- **SelectButton with all options disabled** — a reasonable person expects no crash and no infinite loop when roving-tabindex tries to find "the next enabled option" and finds none; Task 1/2 must handle the all-disabled case by leaving focus where it is (or not moving), not looping forever.
- **FileUpload's `progress` value exceeding 100 or going negative from a malformed XHR event** — `UProgressBar`'s own existing `value` input has no documented clamping; Task 3-5 should pass the raw `progress` state through unchanged (matching current behavior) rather than adding new clamping logic not requested by any GAP.

---

### Task 1: Angular — GAP-059 SelectButton roving-tabindex

**Files:** `packages/ng/src/select-button/select-button.ts`, `select-button.spec.ts`.

- [ ] **Step 1: Write the failing tests**

```typescript
describe("roving-tabindex (Spec §5.1, GAP-059)", () => {
  it("only one option is tabbable at a time", () => {
    const fixture = TestBed.createComponent(USelectButton);
    fixture.componentRef.setInput("options", [{ label: "A", value: "a" }, { label: "B", value: "b" }]);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll("[role=button], button");
    const tabbable = Array.from(buttons).filter((b: any) => b.getAttribute("tabindex") === "0");
    expect(tabbable.length).toBe(1);
  });

  it("ArrowRight moves the roving tabindex to the next option", () => {
    const fixture = TestBed.createComponent(USelectButton);
    fixture.componentRef.setInput("options", [{ label: "A", value: "a" }, { label: "B", value: "b" }]);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll("[role=button], button");
    buttons[0].focus();
    buttons[0].dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowRight", bubbles: true }));
    fixture.detectChanges();
    expect(buttons[1].getAttribute("tabindex")).toBe("0");
    expect(buttons[0].getAttribute("tabindex")).toBe("-1");
  });

  it("ArrowRight does nothing and does not throw when all options are disabled", () => {
    const fixture = TestBed.createComponent(USelectButton);
    fixture.componentRef.setInput("options", [{ label: "A", value: "a", disabled: true }, { label: "B", value: "b", disabled: true }]);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll("[role=button], button");
    expect(() => {
      buttons[0].dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowRight", bubbles: true }));
    }).not.toThrow();
  });
});
```

- [ ] **Step 2: Implement**

Add a focused-index signal (matching `UMenu`'s own `firstFocusableIndex`/roving pattern for the initial index computation, and `UPanelMenu`'s `[attr.tabindex]="item.disabled ? -1 : 0"` shape for per-item binding). Bind each option's `tabindex` to `roving-index === i ? 0 : -1`. Add a keydown handler: `ArrowRight`/`ArrowLeft` move the roving index to the next/previous non-disabled option, wrapping or clamping at the ends (match real PrimeNG's own exact wrap-vs-clamp behavior — confirm from pinned source before choosing; do not assume). When every option is disabled, the handler must detect this (e.g. no candidate index found) and return without mutating state or throwing.

- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

### Task 2: React — GAP-059 SelectButton roving-tabindex

**Files:** `packages/react/src/select-button/select-button.tsx`, `select-button.spec.tsx`. Equivalent 3 tests + implementation, React idioms.

---

### Task 3: Angular — GAP-060 FileUpload progress ARIA

**Files:** `packages/ng/src/file-upload/file-upload.ts`, `file-upload.spec.ts`.

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

Import `UProgressBar` and add it to the component's `imports` array. Replace the existing bare progress `<div>` markup with `<u-progress-bar [value]="progress()"></u-progress-bar>` (or the exact existing progress-state accessor name in this file), inheriting `UProgressBar`'s own already-correct `role="progressbar"`/`aria-valuemin`/`aria-valuemax`/`aria-valuenow` host bindings automatically. Do not add any new clamping to the `progress` value — pass it through exactly as FileUpload's own XHR progress handler already computes it.

- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

### Task 4: React — GAP-060 FileUpload progress ARIA

**Files:** `packages/react/src/file-upload/file-upload.tsx`, `file-upload.spec.tsx`.

- [ ] **Step 1:** Equivalent test, driving the existing `progress`/`setProgress` state (confirmed present, `file-upload.tsx:137`).
- [ ] **Step 2: Implement** — import and render `UProgressBar` (React's own equivalent component) with `value={progress}` in place of the existing bare progress-bar `<div>` markup.
- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

### Task 5: Vue — GAP-060 FileUpload progress ARIA

**Files:** `packages/vue/src/file-upload/FileUpload.vue`, `file-upload.spec.ts`.

- [ ] **Step 1:** Equivalent test, driving the existing `this.progress` data field (confirmed present, `FileUpload.vue:96/205`).
- [ ] **Step 2: Implement** — import `UProgressBar` and replace the existing `:class="cx('progressBar')"` / `:class="cx('progressBarValue')"` bare-div markup (lines 25-27) with `<UProgressBar :value="progress" />`.
- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

### Task 6: Vue — GAP-061 Password disclosure-pattern ARIA

**Files:** `packages/vue/src/password/Password.vue`, `password.spec.ts`.

- [ ] **Step 1: Write the failing tests**

First re-read real PrimeVue's own Password overlay-toggle markup (`.vendor-cache/primevue-4.5.5.tar.gz`) to confirm the exact two `aria-live` regions' own content/purpose before writing assertions — do not assume both are for the same announcement.

```typescript
describe("disclosure-pattern ARIA (Spec §5.3, GAP-061)", () => {
  it("the toggle icon has aria-haspopup, aria-expanded, and aria-controls", () => {
    const wrapper = mount(UPassword, { props: { toggleMask: true } });
    const toggle = wrapper.find('[role=button]');
    expect(toggle.attributes('aria-haspopup')).toBeTruthy();
    expect(toggle.attributes('aria-expanded')).toBe('false');
    expect(toggle.attributes('aria-controls')).toBeTruthy();
  });

  it("aria-expanded reflects the current mask/unmask state", async () => {
    const wrapper = mount(UPassword, { props: { toggleMask: true } });
    await wrapper.find('[role=button]').trigger('click');
    expect(wrapper.find('[role=button]').attributes('aria-expanded')).toBe('true');
  });

  it("renders the two aria-live regions confirmed from real PrimeVue's own source", () => {
    const wrapper = mount(UPassword, { props: { toggleMask: true } });
    expect(wrapper.findAll('[aria-live]').length).toBe(2);
  });
});
```

- [ ] **Step 2: Implement**

Add `aria-haspopup="true"`, `:aria-expanded="unmasked ? 'true' : 'false'"`, and `:aria-controls="inputId"` (matching the existing `inputId`/`ref="input"` binding already present at line 5) to the toggle `<svg role="button">` elements (both the masked and unmasked variants, lines 18-34 and 35+). Add the two `aria-live` regions real PrimeVue's own source uses (exact content/purpose confirmed in Step 1 — e.g. announcing the mask/unmask state change and/or password-strength feedback, whichever real source actually implements; do not invent content not present in real source).

- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

## Completion Criteria

- All 6 tasks pass.
- `pnpm test`, `pnpm run ceiling:validate` pass after each task.
- Vue SelectButton and Angular/React Password remain unmodified (verify via `git status`).

## Documentation/Ledger Updates

Upon Final Review/Closeout: mark GAP-059 through GAP-061 RESOLVED in `docs/architecture/BLUEPRINT_GAPS.md`. Not performed by this plan document.
