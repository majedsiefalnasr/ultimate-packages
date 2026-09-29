# Prime Parity: Display Implementation Plan (GAP-050–GAP-051)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Execution approach:** Subagent-driven development, one implementer/reviewer cycle per task.

**Goal:** Add keyboard navigation, a local Escape handler, and `role="region"` to Galleria (GAP-050); add conditional `aria-live` to Carousel's autoplay content wrapper (GAP-051).

**Spec:** `docs/superpowers/specs/2026-09-26-prime-parity-display-design.md`.

**GAP → Task mapping:**

| GAP | Task(s) |
|---|---|
| GAP-050 | Task 1 (Angular), Task 2 (React), Task 3 (Vue) |
| GAP-051 | Task 4 (Angular), Task 5 (React), Task 6 (Vue) |

## Global Constraints

- **Galleria's fullscreen-overlay redesign itself is unchanged.** Task 1-3 add a keydown handler and an attribute; they do not alter `fullScreenActive`/`onEnterFullScreen`/`exitFullScreen`'s own existing state machine.
- **Carousel's autoplay mechanism itself is unchanged.** Task 4-6 add one conditional attribute only.
- **`role="region"` is additive** — Galleria's existing `role="dialog"` on the fullscreen mask (confirmed present, `galleria.ts:66`) is a different element (the mask) from the root element the new `role="region"` applies to; the two do not conflict.

## Review Focus

- **Escape pressed while Galleria is not in fullscreen mode** — a reasonable person expects nothing to happen (no error, no unrelated dismissal), since there is nothing to dismiss; the new handler must be scoped to firing only when `fullScreenActive()` is true.
- **ArrowLeft/Right pressed while a text input inside a custom item template has focus** — a reasonable person typing in an unrelated focused input inside Galleria's projected content does not expect the gallery to also navigate; the keydown handler should be attached to the gallery's own navigation-control elements (matching existing prev/next button focus targets), not to `document`/a wrapping container that would capture keystrokes from arbitrary descendant content.
- **Carousel's `aria-live` value when `autoplayInterval` is `0` (autoplay disabled)** — the Spec requires the attribute to match real Prime's own conditional behavior; confirm real PrimeNG's exact condition (autoplay enabled, i.e. `autoplayInterval > 0`) before hardcoding a always-present or always-absent value.

---

### Task 1: Angular — GAP-050 Galleria keyboard nav, Escape, role

**Files:**
- Modify: `packages/ng/src/galleria/galleria.ts`
- Test: `packages/ng/src/galleria/galleria.spec.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
describe("keyboard navigation, Escape, role=region (Spec §5.1, GAP-050)", () => {
  interface Item { src: string }

  it("has role=region on the root element", () => {
    const fixture = TestBed.createComponent(UGalleria<Item>);
    fixture.componentRef.setInput("value", [{ src: "a.png" }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("[role=region]")).toBeTruthy();
  });

  it("ArrowRight advances to the next item", () => {
    const fixture = TestBed.createComponent(UGalleria<Item>);
    fixture.componentRef.setInput("value", [{ src: "a.png" }, { src: "b.png" }]);
    fixture.detectChanges();
    fixture.nativeElement.querySelector("[data-u-galleria-content]").dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowRight" }));
    expect(fixture.componentInstance.activeIndex()).toBe(1);
  });

  it("ArrowLeft goes to the previous item", () => {
    const fixture = TestBed.createComponent(UGalleria<Item>);
    fixture.componentRef.setInput("value", [{ src: "a.png" }, { src: "b.png" }]);
    fixture.componentRef.setInput("activeIndex", 1);
    fixture.detectChanges();
    fixture.nativeElement.querySelector("[data-u-galleria-content]").dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowLeft" }));
    expect(fixture.componentInstance.activeIndex()).toBe(0);
  });

  it("Home jumps to the first item, End jumps to the last", () => {
    const fixture = TestBed.createComponent(UGalleria<Item>);
    fixture.componentRef.setInput("value", [{ src: "a.png" }, { src: "b.png" }, { src: "c.png" }]);
    fixture.componentRef.setInput("activeIndex", 1);
    fixture.detectChanges();
    const content = fixture.nativeElement.querySelector("[data-u-galleria-content]");
    content.dispatchEvent(new KeyboardEvent("keydown", { code: "End" }));
    expect(fixture.componentInstance.activeIndex()).toBe(2);
    content.dispatchEvent(new KeyboardEvent("keydown", { code: "Home" }));
    expect(fixture.componentInstance.activeIndex()).toBe(0);
  });

  it("Escape closes fullscreen mode when active", () => {
    const fixture = TestBed.createComponent(UGalleria<Item>);
    fixture.componentRef.setInput("value", [{ src: "a.png" }]);
    fixture.componentRef.setInput("fullScreen", true);
    fixture.detectChanges();
    fixture.componentInstance.onEnterFullScreen();
    fixture.detectChanges();
    expect(fixture.componentInstance.fullScreenActive()).toBe(true);
    fixture.nativeElement.querySelector("[data-u-galleria-content]").dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
    expect(fixture.componentInstance.fullScreenActive()).toBe(false);
  });

  it("Escape does nothing when fullscreen mode is not active", () => {
    const fixture = TestBed.createComponent(UGalleria<Item>);
    fixture.componentRef.setInput("value", [{ src: "a.png" }]);
    fixture.detectChanges();
    expect(() =>
      fixture.nativeElement.querySelector("[data-u-galleria-content]").dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }))
    ).not.toThrow();
    expect(fixture.componentInstance.fullScreenActive()).toBe(false);
  });
});
```

- [ ] **Step 2: Implement**

In `packages/ng/src/galleria/galleria.ts`:

1. Add `role="region"` to the component's root element (the outer `<div>` wrapping both the non-fullscreen and fullscreen branches — confirmed at the top of the existing template, around line 60).
2. Add a `data-u-galleria-content` attribute to the main content viewport element (whichever element already hosts the prev/next navigation, so the test can target it) if not already uniquely selectable.
3. Add a `(keydown)="onContentKeyDown($event)"` handler on that same element, implementing: `ArrowLeft` → `prev()`; `ArrowRight` → `next()`; `Home` → `goTo(0)`; `End` → `goTo(this.value().length - 1)`; `Enter`/`Space` when focus is on a thumbnail button → activate that thumbnail (reuse the existing thumbnail-click handler); `Escape` → if `fullScreenActive()`, call `exitFullScreen()`, else no-op. Call `event.preventDefault()` for every handled key.

- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

### Task 2: React — GAP-050 Galleria keyboard nav, Escape, role

**Files:** `packages/react/src/galleria/galleria.tsx`, `galleria.spec.tsx`.

- [ ] **Step 1:** Equivalent 6 tests to Task 1, React idioms.
- [ ] **Step 2: Implement** — same `role="region"` + keydown handler as Task 1, ported to React's own existing `next()`/`prev()`/fullscreen-state mechanism.
- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

### Task 3: Vue — GAP-050 Galleria keyboard nav, Escape, role

**Files:** `packages/vue/src/galleria/Galleria.vue`, `galleria.spec.ts`.

- [ ] **Step 1:** Equivalent 6 tests to Task 1, Vue idioms.
- [ ] **Step 2: Implement** — same mechanism, ported to Vue's own existing state.
- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

### Task 4: Angular — GAP-051 Carousel `aria-live`

**Files:** `packages/ng/src/carousel/carousel.ts`, `carousel.spec.ts`.

- [ ] **Step 1: Write the failing tests**

**Plan correction (post-Plan-Review, pre-Task-4-implementation):** the implementer's mandated real-source verification against the pinned `.vendor-cache/primeng-21.1.9.tar.gz` (`packages/primeng/src/carousel/carousel.ts`) found this Task's original text was wrong about the off-state: real PrimeNG's template (`[attr.aria-live]="allowAutoplay ? 'polite' : 'off'"`) **always renders `aria-live`**, using the literal value `"off"` when autoplay is not active — never absent/unset, contrary to this Task's original "absent/unset otherwise" text. Real Prime's condition is also driven by a separate stateful `allowAutoplay` flag (flipping on `startAutoplay`/`stopAutoplay`, including on manual navigation), not the static `autoplayInterval` input directly.

**Ruling (user-authorized):** implement the static `autoplayInterval() > 0` condition as originally planned (do NOT add new autoplay-running state, do NOT modify the autoplay mechanism, preserving this Plan's own Global Constraint) — but correct the off-value to match real Prime's actual rendered markup: **always render `aria-live`, value `"polite"` when `autoplayInterval() > 0`, value `"off"` otherwise. Never omit the attribute.** This is confirmed consistent with the governing Spec's own §5.2 text ("this specification does not mandate an always-on `aria-live`, only that Ultimate's conditional behavior matches real Prime's own conditional behavior") — the Spec was already written not to require absence, only this Plan's own paraphrase was inaccurate. No Spec change needed, no new GAP, no scope broadening.

The Step-1 tests below are corrected accordingly (superseding the original "does not set aria-live" test, which asserted the wrong off-behavior):

```typescript
describe("aria-live on autoplay content wrapper (Spec §5.2, GAP-051)", () => {
  interface Item { id: number }

  it("sets aria-live=polite on the content wrapper when autoplayInterval is greater than 0", () => {
    const fixture = TestBed.createComponent(UCarousel<Item>);
    fixture.componentRef.setInput("value", [{ id: 1 }, { id: 2 }]);
    fixture.componentRef.setInput("autoplayInterval", 3000);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("[data-u-carousel-content]").getAttribute("aria-live")).toBe("polite");
  });

  it("sets aria-live=off (not absent) when autoplayInterval is 0 (autoplay disabled), matching real PrimeNG's own always-rendered attribute", () => {
    const fixture = TestBed.createComponent(UCarousel<Item>);
    fixture.componentRef.setInput("value", [{ id: 1 }, { id: 2 }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("[data-u-carousel-content]").getAttribute("aria-live")).toBe("off");
  });
});
```

- [ ] **Step 2: Implement**

Add `[attr.aria-live]="autoplayInterval() > 0 ? 'polite' : 'off'"` (always present, never `null`) to the existing content-wrapper element (add a `data-u-carousel-content` attribute to it first if not already uniquely selectable).

- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

### Task 5: React — GAP-051 Carousel `aria-live`

**Files:** `packages/react/src/carousel/carousel.tsx`, `carousel.spec.tsx`. Equivalent to Task 4.

---

### Task 6: Vue — GAP-051 Carousel `aria-live`

**Files:** `packages/vue/src/carousel/Carousel.vue`, `carousel.spec.ts`. Equivalent to Task 4.

---

## Completion Criteria

- All 6 tasks pass, all 3 frameworks.
- `pnpm test`, `pnpm run ceiling:validate` pass after each task.
- Galleria's fullscreen-overlay state machine and Carousel's autoplay mechanism are otherwise byte-identical to their pre-plan behavior (verify via `git diff` showing only additive lines).

## Documentation/Ledger Updates

Upon Final Review/Closeout: mark GAP-050/GAP-051 RESOLVED in `docs/architecture/BLUEPRINT_GAPS.md`. Not performed by this plan document.
