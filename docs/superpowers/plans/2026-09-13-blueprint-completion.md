# Blueprint Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the six remaining non-architectural Blueprint gaps (GAP-006, GAP-007, GAP-009, GAP-010, GAP-023, GAP-036) identified by the 2026-09-13 Blueprint Closure audit and consolidated in `docs/superpowers/specs/2026-09-13-blueprint-completion-design.md`, leaving `docs/architecture/BLUEPRINT.md` unmodified and no protected/deferred decision touched.

**Architecture:** Six independent work packages, each applying a pattern already proven elsewhere in this repository (React/Vue's per-component `exports`, React's escape/z-index registry consumption, React/Vue's `aria-describedby` wiring, the provenance validator's actual enforced mechanism). No new shared infrastructure is built. Angular is the only framework touched by code changes (WP1, WP4, WP5); WP2 and WP3 are documentation/tooling-output changes; WP6 is a bookkeeping pass over the gap registry.

**Tech Stack:** Angular 21.2.22 (`ng-packagr`, Vitest via Angular CLI's builder, zoneless `TestBed`), `@ultimate/uix-utils/escape` and `/zindex` (framework-neutral registries, already built), `@ultimate/ai`'s existing generator (`tsup`, Node).

## Global Constraints

- Do not modify `docs/architecture/BLUEPRINT.md` under any circumstance in this plan.
- Do not resolve, narrow, or reopen DECISION-B, DECISION-C's remainder, DECISION-D, or DECISION-E.
- Do not touch any Table/Data-family file.
- Do not wire CI to regenerate `llms.txt` automatically — WP3 is a one-time manual generate-and-commit only.
- Every existing test suite, CI gate, and script referenced below must remain green after each task — do not weaken an assertion to make a task pass.
- Follow this repository's established zoneless-`TestBed` pattern for any test with a second state mutation in the same test: `fixture.changeDetectorRef.markForCheck(); fixture.detectChanges(false); await fixture.whenStable();` instead of a second bare `detectChanges()` call (per ADR-022, already used throughout `dialog.spec.ts`/`overlay.spec.ts`).
- Commit after each task, following this repository's Conventional Commits convention (`git log` for real examples), on a single feature branch for this whole workstream (per the approved spec: one consolidated implementation, not six separate cycles).

---

## Task 1: WP2 — Reconcile the provenance-manifest spec text with the real validator

**Files:**
- Modify: `docs/superpowers/specs/2026-08-29-phase-2-ultimateng-foundation-design.md:388`
- Modify: `docs/superpowers/specs/2026-08-28-phase-1-uix-foundation-design.md:310`

**Interfaces:** None — pure documentation text change, no code, no exported symbol.

**Context:** Both the Phase 1 and Phase 2 specs name `sha256OfOriginal` as a required per-file provenance-manifest field. `scripts/provenance/validate-provenance.mjs` (the real, CI-enforced gate) never checks this field — it checks a `REQUIRED_HEADINGS` array (`PrimeNG`, `PrimeVue`, `PrimeReact`, `@primeuix/utils`, `@primeuix/styled`, `@primeuix/styles`, `@primeuix/motion`) against `docs/architecture/PROVENANCE.md`'s own markdown section headings — a different document, a different mechanism. No manifest under `docs/architecture/provenance/*.json` has ever had this field (this plan does not add it to any manifest — see Global Constraints and the approved spec's Non-goals).

- [ ] **Step 1: Amend the Phase 2 spec's line naming the field**

Open `docs/superpowers/specs/2026-08-29-phase-2-ultimateng-foundation-design.md` and find line 388 (search for `sha256OfOriginal`). Replace the full bullet with:

```markdown
- **Manifest fields (per file):** `originalPath`, `ultimateDestination`, `modificationStatus` (`"unmodified"` | `"import-path-adapted"` | `"refactored"` | `"reimplemented-with-reference"`), `modificationDescription`. The `"reimplemented-with-reference"` status is new relative to Phase 1's vocabulary — needed because Option B means base-class files are genuinely rewritten with PrimeNG's file as a design reference, not adapted-in-place, and this must be distinguishable in the manifest from a verbatim or lightly-adapted file. **Amendment (Blueprint Completion, 2026-09-13, GAP-010):** this bullet originally also named a required `sha256OfOriginal` field. No provenance manifest under `docs/architecture/provenance/*.json` has ever carried that field, and `scripts/provenance/validate-provenance.mjs` — the actual CI-enforced gate — checks a different, real mechanism instead: a `REQUIRED_HEADINGS` array matched against `docs/architecture/PROVENANCE.md`'s own markdown section headings. This bullet is corrected to match the mechanism that was actually built and is actually enforced; no manifest file is retroactively modified.
```

- [ ] **Step 2: Amend the Phase 1 spec's line naming the field**

Open `docs/superpowers/specs/2026-08-28-phase-1-uix-foundation-design.md` and find line 310 (search for `sha256OfOriginal`). Replace the full bullet with:

```markdown
- **File-level manifest (new):** `docs/architecture/provenance/<package>.json` — one JSON file per UIX package, one array entry per incorporated source file: `{ originalPath, ultimateDestination, modificationStatus: "unmodified"|"import-path-adapted"|"modified", modificationDescription }`. Machine-readable, CI-checkable. **Amendment (Blueprint Completion, 2026-09-13, GAP-010):** this bullet's original shape also named a `sha256OfOriginal` field. No provenance manifest has ever carried that field, and `scripts/provenance/validate-provenance.mjs` enforces a different, real mechanism (a `REQUIRED_HEADINGS` check against `docs/architecture/PROVENANCE.md`'s section headings) instead. Corrected to match what was actually built; no manifest file is retroactively modified.
```

- [ ] **Step 3: Verify the real validator still passes, unchanged**

Run: `node scripts/provenance/validate-provenance.mjs`
Expected output: `[provenance:validate] OK: all 7 required baseline entries present` (this command was already passing before this task and is not expected to change — this step only confirms the documentation edit did not somehow affect the validator, which it cannot, since no `.mjs` file was touched).

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-08-29-phase-2-ultimateng-foundation-design.md docs/superpowers/specs/2026-08-28-phase-1-uix-foundation-design.md
git commit -m "docs(provenance): reconcile Phase 1/2 spec text with the real validator (GAP-010)"
```

---

## Task 2: WP4 — Wire `aria-describedby` on Angular's `UTooltip`

**Files:**
- Modify: `packages/ng/src/tooltip/tooltip.ts`
- Modify: `packages/ng/src/tooltip/tooltip.spec.ts`

**Interfaces:**
- Consumes: `ComponentIdGenerator` from `@ultimate/ng-core` (existing class, `next(prefix: string): string`, already used by `packages/ng/src/dialog/dialog.ts`).
- Produces: no new public API. `UTooltip`'s existing public inputs (`uTooltip`, `uTooltipPosition`, `uTooltipDisabled`) are unchanged. The host element gains a new `aria-describedby` attribute lifecycle (set on show, cleared on hide) — an implementation detail, not a new input/output.

**Context:** `UTooltip`'s `create()` builds a floating `<div role="tooltip">` container but nothing links it back to the host element via `aria-describedby`. React's `UTooltip` (`packages/react/src/tooltip/tooltip.tsx:56-128`) already solves this exact problem using `React.useId()` plus careful merge/restore of any pre-existing `aria-describedby` tokens on the host, so removal doesn't clobber a value set by something else. Angular has no `useId()` equivalent; this repository's own proven, already-shipped Angular-specific mechanism for an SSR-safe per-instance id is `ComponentIdGenerator` (used today by `UDialog` for its own `aria-labelledby`). Following Dialog's precedent, `UTooltip` becomes a `ComponentIdGenerator` consumer with the same documented DI-provider requirement.

- [ ] **Step 1: Write the failing tests (targeted edit — do not replace the file)**

Open `packages/ng/src/tooltip/tooltip.spec.ts`. Make three targeted changes to the existing file; every pre-existing test stays exactly as it is today.

First, find the existing import block:

```typescript
import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UTooltip } from "./tooltip";
```

Replace with:

```typescript
import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ComponentIdGenerator } from "@ultimate/ng-core";
import { beforeEach, describe, expect, it } from "vitest";
import { UTooltip } from "./tooltip";
```

Next, find the `describe("UTooltip", () => {` line and add a `beforeEach` immediately after it, matching `dialog.spec.ts`'s established provider pattern:

```typescript
describe("UTooltip", () => {
```

Replace with:

```typescript
describe("UTooltip", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ComponentIdGenerator] });
  });

```

Finally, find the file's closing `});` (the very last line, closing the outer `describe` block) and insert four new tests immediately before it:

```typescript
});
```

Replace with:

```typescript
  it("wires aria-describedby from the trigger to the tooltip's own id while visible", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector("button");
    button.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    fixture.detectChanges();
    const tooltip = document.querySelector('[role="tooltip"]') as HTMLElement;
    const describedBy = button.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(tooltip.id).toBe(describedBy);
  });

  it("clears aria-describedby from the trigger on hide", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector("button");
    button.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    fixture.detectChanges();
    button.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    fixture.detectChanges();
    expect(button.hasAttribute("aria-describedby")).toBe(false);
  });

  it("preserves a pre-existing aria-describedby token on the trigger and restores it on hide", () => {
    TestBed.overrideComponent(TestHostComponent, {
      set: {
        template: `<button aria-describedby="other-id" [uTooltip]="'Save changes'">Save</button>`,
      },
    });
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector("button");

    button.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    fixture.detectChanges();
    const describedBy = button.getAttribute("aria-describedby")!;
    expect(describedBy.split(" ")).toContain("other-id");

    button.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    fixture.detectChanges();
    expect(button.getAttribute("aria-describedby")).toBe("other-id");
  });

  it("gives two tooltip instances distinct ids from one shared ComponentIdGenerator", () => {
    @Component({
      standalone: true,
      imports: [UTooltip],
      template: `
        <button [uTooltip]="'First'">A</button>
        <button [uTooltip]="'Second'">B</button>
      `,
    })
    class TwoTooltipHostComponent {}

    const fixture = TestBed.createComponent(TwoTooltipHostComponent);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll("button");

    buttons[0].dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    fixture.detectChanges();
    const firstId = document.querySelector('[role="tooltip"]')!.id;
    buttons[0].dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    fixture.detectChanges();

    buttons[1].dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    fixture.detectChanges();
    const secondId = document.querySelector('[role="tooltip"]')!.id;

    expect(firstId).not.toBe(secondId);
  });

  it("clears its owned aria-describedby token from the trigger on destroy while still visible", () => {
    // Mirrors dialog.ts's own destroy-cleanup requirement (Task 3): a
    // tooltip torn down while its floating panel is still shown (e.g. its
    // host element is removed from an *ngIf-gated template without a prior
    // mouseleave/blur) must not leave a stale aria-describedby token
    // pointing at a tooltip id that no longer exists in the DOM.
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector("button");
    button.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    fixture.detectChanges();
    expect(button.getAttribute("aria-describedby")).toBeTruthy();

    fixture.destroy();

    expect(button.getAttribute("aria-describedby")).toBeNull();
  });
});
```

- [ ] **Step 2: Run the tests to verify the five new ones fail**

Run: `pnpm --filter @ultimate/ng test -- --project=ng -t "UTooltip"`
Expected: the five new tests (`wires aria-describedby...`, `clears aria-describedby...`, `preserves a pre-existing aria-describedby...`, `gives two tooltip instances distinct ids...`, `clears its owned aria-describedby token...on destroy...`) FAIL — the tooltip container currently has no `id`, the button never receives `aria-describedby`, and there is no destroy-time cleanup for it. All other existing tests in the file still PASS (they don't touch this behavior).

- [ ] **Step 3: Implement `aria-describedby` wiring in `UTooltip` (targeted edits — do not replace the file)**

Open `packages/ng/src/tooltip/tooltip.ts`. Make five targeted changes to the existing file. Every unrelated existing behavior — `show()`/`hide()`'s core show/hide logic, `create()`'s DOM-building, `align()`'s positioning math, the directive's public inputs — stays exactly as it is today; only the pieces below change.

**Change 1 — imports.** Find:

```typescript
import { Directive, booleanAttribute, input } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import {
  getOuterHeight,
  getOuterWidth,
  getViewport,
  getWindowScrollLeft,
  getWindowScrollTop,
} from "@ultimate/uix-utils/dom";
import { ZIndex } from "@ultimate/uix-utils/zindex";
import { UBaseComponent } from "@ultimate/ng-core";
import { tooltipStyleModule } from "./tooltip-style";
```

Replace with:

```typescript
import { Directive, booleanAttribute, inject, input } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import {
  getOuterHeight,
  getOuterWidth,
  getViewport,
  getWindowScrollLeft,
  getWindowScrollTop,
} from "@ultimate/uix-utils/dom";
import { ZIndex } from "@ultimate/uix-utils/zindex";
import { ComponentIdGenerator, UBaseComponent } from "@ultimate/ng-core";
import { tooltipStyleModule } from "./tooltip-style";
```

**Change 2 — class doc comment.** Find the doc comment's final paragraph (immediately before the `@Directive` decorator):

```typescript
 * All DOM creation is guarded behind `isPlatformBrowser()` per the SSR
 * requirement (matching upstream's own `onAfterViewInit` guard and this
 * project's established `URipple`/`UOverlay` pattern).
 */
```

Replace with:

```typescript
 * All DOM creation is guarded behind `isPlatformBrowser()` per the SSR
 * requirement (matching upstream's own `onAfterViewInit` guard and this
 * project's established `URipple`/`UOverlay` pattern).
 *
 * BREAKING CHANGE — requires `ComponentIdGenerator`: this directive injects
 * `ComponentIdGenerator` (from `@ultimate/ng-core`) to generate its
 * floating container's `id` in an SSR-deterministic way (GAP-006 fix,
 * Blueprint Completion 2026-09-13). The consuming application MUST provide
 * `ComponentIdGenerator` at bootstrap — same requirement `UDialog` already
 * documents and enforces, see `packages/ng/src/dialog/dialog.ts`.
 * `aria-describedby` is set on the host element while the tooltip is
 * visible, merging with (not replacing) any pre-existing token list, and
 * restored to its exact pre-show value on hide (including on destroy while
 * still visible) — mirroring `packages/react/src/tooltip/tooltip.tsx`'s
 * already-shipped merge/restore behavior for the same problem.
 */
```

**Change 3 — inject the id generator and add describedby state.** Find:

```typescript
  /** When present, it specifies that the tooltip should be disabled. */
  uTooltipDisabled = input(false, { transform: booleanAttribute });

  private container: HTMLElement | null = null;
```

Replace with:

```typescript
  /** When present, it specifies that the tooltip should be disabled. */
  uTooltipDisabled = input(false, { transform: booleanAttribute });

  private readonly idGenerator = inject(ComponentIdGenerator);
  private container: HTMLElement | null = null;
  private describedById: string | null = null;
```

**Change 4 — set the container's id, attach/detach `aria-describedby` in `show()`/`hide()`.** Find:

```typescript
  protected show(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const text = this.uTooltip();
    if (!text || this.uTooltipDisabled()) {
      return;
    }

    this.remove();
    this.container = this.create(text);
    this.renderer.appendChild(this.document.body, this.container);
    this.align(this.container);
    ZIndex.set("tooltip", this.container, 1100);
  }

  protected hide(): void {
    if (this.container) {
      ZIndex.clear(this.container);
    }
    this.remove();
  }

  private create(text: string): HTMLElement {
    const container = this.renderer.createElement("div") as HTMLElement;
    this.renderer.setAttribute(container, "class", this.cx("root") ?? "");
    this.renderer.setAttribute(container, "role", "tooltip");
```

Replace with:

```typescript
  protected show(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const text = this.uTooltip();
    if (!text || this.uTooltipDisabled()) {
      return;
    }

    this.remove();
    this.container = this.create(text);
    this.renderer.appendChild(this.document.body, this.container);
    this.align(this.container);
    ZIndex.set("tooltip", this.container, 1100);
    this.attachDescribedBy(this.container.id);
  }

  protected hide(): void {
    if (this.container) {
      ZIndex.clear(this.container);
    }
    this.detachDescribedBy();
    this.remove();
  }

  private create(text: string): HTMLElement {
    const container = this.renderer.createElement("div") as HTMLElement;
    this.renderer.setAttribute(container, "id", this.idGenerator.next("u_tooltip"));
    this.renderer.setAttribute(container, "class", this.cx("root") ?? "");
    this.renderer.setAttribute(container, "role", "tooltip");
```

**Change 5 — add the `attachDescribedBy`/`detachDescribedBy` helpers and update `ngOnDestroy`.** Find the file's final two methods:

```typescript
  private remove(): void {
    if (this.container) {
      this.renderer.removeChild(this.document.body, this.container);
      this.container = null;
    }
  }

  ngOnDestroy(): void {
    this.remove();
  }
}
```

Replace with:

```typescript
  /**
   * Merges `tooltipId` into the host's existing `aria-describedby` token
   * list rather than overwriting it, so a consumer-provided
   * `aria-describedby` (e.g. describing form-field validation text)
   * survives alongside this tooltip's own id — matching
   * `packages/react/src/tooltip/tooltip.tsx`'s already-shipped behavior for
   * the same problem.
   */
  private attachDescribedBy(tooltipId: string): void {
    const hostEl = this.el.nativeElement as HTMLElement;
    const existing = hostEl.getAttribute("aria-describedby");
    const ids = existing ? existing.split(" ").filter(Boolean) : [];
    if (!ids.includes(tooltipId)) {
      this.renderer.setAttribute(hostEl, "aria-describedby", [...ids, tooltipId].join(" "));
    }
    this.describedById = tooltipId;
  }

  /**
   * Removes only this tooltip's own id from the host's `aria-describedby`
   * token list, preserving any other ids that were present before this
   * tooltip attached its own — and removes the attribute entirely once no
   * tokens remain, rather than leaving an empty string.
   */
  private detachDescribedBy(): void {
    if (!this.describedById) {
      return;
    }
    const hostEl = this.el.nativeElement as HTMLElement;
    const existing = hostEl.getAttribute("aria-describedby");
    const remaining = existing
      ? existing.split(" ").filter((tokenId) => tokenId && tokenId !== this.describedById)
      : [];
    if (remaining.length > 0) {
      this.renderer.setAttribute(hostEl, "aria-describedby", remaining.join(" "));
    } else {
      this.renderer.removeAttribute(hostEl, "aria-describedby");
    }
    this.describedById = null;
  }

  private remove(): void {
    if (this.container) {
      this.renderer.removeChild(this.document.body, this.container);
      this.container = null;
    }
  }

  ngOnDestroy(): void {
    // Clears both the floating DOM element (pre-existing behavior) and the
    // host's aria-describedby token (GAP-006 fix, Blueprint Completion
    // 2026-09-13) — a tooltip destroyed while still visible (e.g. its host
    // is removed from an *ngIf-gated template without a prior
    // mouseleave/blur) must not leave a stale aria-describedby reference
    // pointing at an id no longer present anywhere in the DOM.
    this.detachDescribedBy();
    this.remove();
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm --filter @ultimate/ng test -- --project=ng -t "UTooltip"`
Expected: all tests in the file PASS, including the five new ones.

- [ ] **Step 5: Run the full Angular test suite to check for regressions**

Run: `pnpm --filter @ultimate/ng test`
Expected: all suites PASS (no other file references `UTooltip`'s internals directly).

- [ ] **Step 6: Commit**

```bash
git add packages/ng/src/tooltip/tooltip.ts packages/ng/src/tooltip/tooltip.spec.ts
git commit -m "fix(ng): wire aria-describedby from UTooltip's trigger to its floating panel (GAP-006)"
```

---

## Task 3: WP5 — Angular `UOverlay`/`UDialog` adopt the shared Escape-priority registry

**Files:**
- Modify: `packages/ng-core/src/overlay/overlay.spec.ts`
- Modify: `packages/ng/src/dialog/dialog.ts`
- Modify: `packages/ng/src/dialog/dialog.spec.ts`

**Interfaces:**
- Consumes: `escapeRegistry` (`{ register(primary: number, secondary: number, callback: (e: KeyboardEvent) => void): void; unregister(primary: number, secondary: number): void }`) and `ESCAPE_PRIORITIES` (`{ DIALOG: 300; MENU: 500; TOOLTIP: 1200 }`) from `@ultimate/uix-utils/escape`. `displayOrderRegistry` (`{ register(group: string, id: number): number; unregister(group: string, id: number): void }`) from the same module. All three already exist and are already consumed by `packages/react-core/src/escape/`.
- Produces: no new public API on `UOverlay` or `UDialog`. `UDialog`'s existing `closeOnEscape` input and its observable behavior (Escape closes the dialog when `visible` and `closeOnEscape`) are preserved exactly — the only behavioral change is that with two dialogs open simultaneously, Escape now closes only the topmost (most-recently-displayed) one, instead of closing both.

**Context:** `UDialog`'s current Escape handling is a `@Component`-level `host: { "(document:keydown.escape)": "onEscapeKeydown()" }` binding — every open `UDialog` instance reacts to the same Escape keypress independently, with no check for which instance is "on top." `packages/react/src/dialog/dialog.tsx` already solved this exact problem: it calls `useDisplayOrder("dialog", isCloseOnEscape)` to get a `displayOrder` number, then `useGlobalEscapeKey({ callback, when: isVisible, priority: [ESCAPE_PRIORITIES.DIALOG, displayOrder] })` — the shared `escapeRegistry` only invokes the callback with the numerically highest `[primary, secondary]` pair currently registered, so only the most-recently-displayed dialog's callback fires. This task ports that same composition to Angular's `effect()`-based reactivity, using Vue's own `create-display-order-mixin.ts` (a module-scoped `uidCounter` for the registry key, confirmed by this plan's own research to be the established, accepted pattern for this non-rendered, non-hydration-relevant internal id — distinct from the `aria-labelledby`/`aria-describedby` ids Track E's SSR-nondeterminism finding required fixing) as the closest precedent for a non-hooks-based framework.

`UOverlay`'s existing `ZIndex.set("overlay", hostEl, 1000)` call is confirmed correct as-is by this plan's own research (`packages/uix-utils/src/zindex/index.ts`'s `generateZIndex` already auto-increments on every call with the same key) — this task does not change `UOverlay`'s z-index assignment, only adds the Escape-priority registry to `UDialog`. `UOverlay` itself has no Escape handling to fix; GAP-007's "z-index bucket" framing in `BLUEPRINT_GAPS.md` is corrected during Task 5 (WP6) to reflect that the z-index mechanism was already correct and only the Escape-stacking half was the real defect.

**Regression risk, read before Step 1:** `dialog.spec.ts`'s existing Escape tests dispatch `new KeyboardEvent("keydown", { key: "Escape" })`. `escapeRegistry`'s internal listener (`packages/uix-utils/src/escape/registry.ts:17`) checks `event.code !== "Escape"`, not `event.key`. After this task's change, every existing test that dispatches an Escape keydown must be updated to `{ code: "Escape" }` or it will silently stop triggering the new listener and the test will falsely fail (not falsely pass) — Step 1 below updates both existing occurrences alongside the new tests.

- [ ] **Step 1: Write the failing tests (update existing dispatch calls, add multi-instance coverage)**

Open `packages/ng/src/dialog/dialog.spec.ts`. Make these four changes:

1. Find the file's `import { Component } from "@angular/core";` line and change it to `import { Component, signal } from "@angular/core";` — the new destroy-cleanup test below needs `signal()` to gate a dialog's presence in its host template.
2. Find both existing `document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))` calls and change `key: "Escape"` to `code: "Escape"` in both.
3. Find the test named `"does not emit onHide when visible never actually changes..."` — no other change needed there beyond the dispatch fix from step 2.
4. Add three new tests after the existing `"gives two dialogs sharing one TestBed-provided ComponentIdGenerator..."` test (same `describe("UDialog", ...)` block):

```typescript
  it("closes only the topmost of two simultaneously open dialogs on Escape", async () => {
    @Component({
      standalone: true,
      imports: [UDialog],
      template: `
        <u-dialog [(visible)]="visibleA" header="Dialog A">A body</u-dialog>
        <u-dialog [(visible)]="visibleB" header="Dialog B">B body</u-dialog>
      `,
    })
    class TwoDialogHostComponent {
      visibleA = true;
      visibleB = true;
    }

    const fixture = TestBed.createComponent(TwoDialogHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(2);

    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
    fixture.detectChanges();
    await fixture.whenStable();

    // Dialog B was displayed second (registered later, higher display
    // order), so it is topmost and must be the one Escape closes — Dialog
    // A must remain open. Asserted via the host's own bound signals rather
    // than DOM count alone, so a failure clearly names which dialog closed.
    expect(fixture.componentInstance.visibleA).toBe(true);
    expect(fixture.componentInstance.visibleB).toBe(false);
  });

  it("closes the remaining dialog on a second Escape after the topmost one closes", async () => {
    @Component({
      standalone: true,
      imports: [UDialog],
      template: `
        <u-dialog [(visible)]="visibleA" header="Dialog A">A body</u-dialog>
        <u-dialog [(visible)]="visibleB" header="Dialog B">B body</u-dialog>
      `,
    })
    class TwoDialogHostComponent {
      visibleA = true;
      visibleB = true;
    }

    const fixture = TestBed.createComponent(TwoDialogHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.visibleB).toBe(false);

    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.visibleA).toBe(false);
  });

  it("does not react to Escape after a still-open dialog is destroyed (registry entries cleared on destroy)", async () => {
    @Component({
      standalone: true,
      imports: [UDialog],
      template: `@if (showB()) {
        <u-dialog [(visible)]="visibleB" header="Dialog B">B body</u-dialog>
      }`,
    })
    class DestroyableDialogHostComponent {
      visibleB = true;
      showB = signal(true);
    }

    const fixture = TestBed.createComponent(DestroyableDialogHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(1);

    // Destroy Dialog B while it is still visible=true and still registered
    // (never toggled to visible=false first) — a real scenario, e.g. an
    // *ngIf/@if-gated dialog whose host is torn down directly, or a router
    // navigation that destroys the component tree mid-dialog. Without an
    // explicit ngOnDestroy unregistering both registries, this dialog's
    // now-stale escapeRegistry/displayOrderRegistry entries would remain
    // registered forever, permanently occupying the topmost display-order
    // slot and silently swallowing every future Escape keypress meant for
    // any dialog opened afterward.
    fixture.componentInstance.showB.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(0);

    @Component({
      standalone: true,
      imports: [UDialog],
      template: `<u-dialog [(visible)]="visibleC" header="Dialog C">C body</u-dialog>`,
    })
    class SingleDialogHostComponent {
      visibleC = true;
    }
    const fixtureC = TestBed.createComponent(SingleDialogHostComponent);
    fixtureC.detectChanges();
    await fixtureC.whenStable();

    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
    fixtureC.detectChanges();
    await fixtureC.whenStable();

    // If Dialog B's registry entries leaked past its destruction, Dialog C
    // (registered later, genuinely topmost) would not receive this Escape —
    // the stale, higher-priority-looking B entry would still win the
    // registry's "highest pair" comparison. Asserting C actually closes
    // proves the leak did not happen.
    expect(fixtureC.componentInstance.visibleC).toBe(false);
  });
```

- [ ] **Step 2: Run the tests to verify the new ones fail and confirm the dispatch-fix rationale**

Run: `pnpm --filter @ultimate/ng test -- --project=ng -t "UDialog"`
Expected: the three new tests FAIL — the two multi-instance stacking tests fail because both dialogs currently close on one Escape (no stacking check yet); the destroy-cleanup test fails because `UDialog` has no `ngOnDestroy` yet, so Dialog B's registry entries leak past its destruction and Dialog C's later Escape either does nothing or throws, depending on registry state (a real reflection of the current, unfixed leak — not a test-authoring mistake). All pre-existing tests still PASS (the `key`→`code` dispatch change is a no-op against the *current* `(document:keydown.escape)` Angular host-listener syntax, which Angular translates from the DOM `key` property — Angular's own `keydown.escape` host-listener parsing reads `event.key`, so this change alone does not break anything yet; it only becomes load-bearing once Step 3 replaces that host listener).

- [ ] **Step 3: Implement the shared registry in `UDialog`**

Open `packages/ng/src/dialog/dialog.ts`. Add the escape/display-order imports, a module-scoped display-order uid counter (matching Vue's `create-display-order-mixin.ts` precedent exactly), remove the `host: { "(document:keydown.escape)": ... }` binding and the `onEscapeKeydown()` method, and register/unregister with the shared registries from the constructor's existing `effect()`.

First, update the imports at the top of the file — find:

```typescript
import {
  ComponentIdGenerator,
  UBaseComponent,
  UFocusTrap,
  UOverlay,
  UTimesIcon,
} from "@ultimate/ng-core";
import { createMotion, type MotionInstance } from "@ultimate/uix-motion";
```

Replace with:

```typescript
import {
  ComponentIdGenerator,
  UBaseComponent,
  UFocusTrap,
  UOverlay,
  UTimesIcon,
} from "@ultimate/ng-core";
import { createMotion, type MotionInstance } from "@ultimate/uix-motion";
import { ESCAPE_PRIORITIES, displayOrderRegistry, escapeRegistry } from "@ultimate/uix-utils/escape";
```

Next, add a module-scoped display-order uid counter directly above the `@Component` decorator (find the `/**\n * Ultimate-owned adaptation of PrimeNG's \`Dialog\` component...` doc comment and insert immediately before it):

```typescript
// Module-scoped display-order registry key, matching
// packages/vue-core/src/escape/create-display-order-mixin.ts's own
// established pattern exactly: this uid participates only in in-memory
// stacking-order comparisons inside displayOrderRegistry, is never rendered
// into DOM/markup, and therefore does not carry the SSR-hydration-mismatch
// risk the Track E ID-nondeterminism finding (2026-09-12) required fixing
// for aria-labelledby/aria-activedescendant-feeding ids specifically (see
// this class's own ariaLabelledBy field, which correctly uses the
// DI-scoped ComponentIdGenerator instead, for exactly that reason).
let dialogDisplayOrderUid = 0;
```

Now update the `@Component` decorator's `host` block — find:

```typescript
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "(document:keydown.escape)": "onEscapeKeydown()",
  },
})
```

Replace with:

```typescript
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
```

Now update the class body. Find the `private readonly idGenerator = inject(ComponentIdGenerator);` line and add the display-order uid field immediately after it:

```typescript
  private readonly idGenerator = inject(ComponentIdGenerator);
  private readonly displayOrderUid = ++dialogDisplayOrderUid;
  private registeredDisplayOrder: number | undefined;
```

Find the constructor's existing `effect()` block (the one watching `this.visible()`) and add registry registration/unregistration alongside the existing enter/leave-motion logic. Find:

```typescript
    super();
    effect(() => {
      const visible = this.visible();
      if (!isPlatformBrowser(this.platformId)) {
        this.wasVisible = visible;
        this.renderMask.set(visible);
        return;
      }

      if (visible && !this.wasVisible) {
        this.triggerElement = (this.document.activeElement as HTMLElement) ?? null;
        this.renderMask.set(true);
        // #root only exists in the DOM once Angular has processed this
        // renderMask flip, so runEnterMotion (which reads @ViewChild("root"))
        // must wait for the next render, not run synchronously in this same
        // effect tick — found during review: without this, this.rootRef is
        // undefined here, this.motion never gets set, and runLeaveMotion's
        // "no motion instance" fallback always fires on close, undermining
        // both enter and leave animation, not just leave.
        afterNextRender(
          () => {
            this.runEnterMotion();
          },
          { injector: this.injector }
        );
      } else if (!visible && this.wasVisible) {
        this.runLeaveMotion();
        this.restoreFocus();
        this.onHide.emit();
      }

      this.wasVisible = visible;
    });
  }
```

Replace with:

```typescript
    super();
    effect(() => {
      const visible = this.visible();
      if (!isPlatformBrowser(this.platformId)) {
        this.wasVisible = visible;
        this.renderMask.set(visible);
        return;
      }

      this.syncEscapeRegistration(visible);

      if (visible && !this.wasVisible) {
        this.triggerElement = (this.document.activeElement as HTMLElement) ?? null;
        this.renderMask.set(true);
        // #root only exists in the DOM once Angular has processed this
        // renderMask flip, so runEnterMotion (which reads @ViewChild("root"))
        // must wait for the next render, not run synchronously in this same
        // effect tick — found during review: without this, this.rootRef is
        // undefined here, this.motion never gets set, and runLeaveMotion's
        // "no motion instance" fallback always fires on close, undermining
        // both enter and leave animation, not just leave.
        afterNextRender(
          () => {
            this.runEnterMotion();
          },
          { injector: this.injector }
        );
      } else if (!visible && this.wasVisible) {
        this.runLeaveMotion();
        this.restoreFocus();
        this.onHide.emit();
      }

      this.wasVisible = visible;
    });
  }

  /**
   * Registers/unregisters this instance with the shared
   * `@ultimate/uix-utils/escape` registries as `visible` toggles, replacing
   * the previous unconditional `(document:keydown.escape)` host listener
   * (GAP-007 fix, Blueprint Completion 2026-09-13). Mirrors
   * `packages/react/src/dialog/dialog.tsx`'s own
   * `useDisplayOrder`/`useGlobalEscapeKey` composition: only the
   * numerically highest-priority (most-recently-displayed) registered
   * dialog's callback fires on a real Escape keydown, so two simultaneously
   * open dialogs no longer both close on one keypress.
   */
  private syncEscapeRegistration(visible: boolean): void {
    if (visible && this.registeredDisplayOrder === undefined) {
      this.registeredDisplayOrder = displayOrderRegistry.register(
        "dialog",
        this.displayOrderUid
      );
      escapeRegistry.register(ESCAPE_PRIORITIES.DIALOG, this.registeredDisplayOrder, () => {
        if (!this.closeOnEscape()) {
          return;
        }
        this.emitClose();
      });
    } else if (!visible && this.registeredDisplayOrder !== undefined) {
      escapeRegistry.unregister(ESCAPE_PRIORITIES.DIALOG, this.registeredDisplayOrder);
      displayOrderRegistry.unregister("dialog", this.displayOrderUid);
      this.registeredDisplayOrder = undefined;
    }
  }

  /**
   * Force-unregisters this instance from both shared registries if it is
   * destroyed while still visible and still registered (e.g. an
   * `@if`/`*ngIf`-gated dialog torn down directly, or a router navigation
   * destroying the component tree mid-dialog, without `visible` ever
   * transitioning to `false` first). Without this, `syncEscapeRegistration`'s
   * own unregister branch — which only runs from the `visible()` `effect()`
   * — would never fire, permanently leaking this instance's
   * `escapeRegistry`/`displayOrderRegistry` entries and silently swallowing
   * every future Escape keypress meant for any dialog opened afterward.
   */
  ngOnDestroy(): void {
    if (this.registeredDisplayOrder !== undefined) {
      escapeRegistry.unregister(ESCAPE_PRIORITIES.DIALOG, this.registeredDisplayOrder);
      displayOrderRegistry.unregister("dialog", this.displayOrderUid);
      this.registeredDisplayOrder = undefined;
    }
  }
```

Finally, remove the now-unused `onEscapeKeydown()` method. Find:

```typescript
  protected onEscapeKeydown(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (!this.visible() || !this.closeOnEscape()) {
      return;
    }
    this.emitClose();
  }

  protected classesParams() {
```

Replace with:

```typescript
  protected classesParams() {
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm --filter @ultimate/ng test -- --project=ng -t "UDialog"`
Expected: all tests PASS, including all three new tests (the two multi-instance stacking tests and the destroy-cleanup test) and every pre-existing test (with their `key`→`code` dispatch fix from Step 1).

- [ ] **Step 5: Add a matching multi-instance regression guard to `overlay.spec.ts`**

Open `packages/ng-core/src/overlay/overlay.spec.ts`. This step confirms `UOverlay`'s own z-index assignment (unchanged by this task) still increments correctly across multiple simultaneous instances, closing the loop on this plan's own research finding that the z-index half of GAP-007 was never actually broken. Add this test to the existing `describe` block, after the existing `"assigns a z-index when appended"` test:

```typescript
  it("assigns a strictly higher z-index to a second overlay instance appended while the first is still visible", async () => {
    @Component({
      standalone: true,
      imports: [UOverlay],
      template: `<div uOverlay [visible]="visible"></div>`,
    })
    class HostComponent {
      visible = false;
    }

    const fixtureA = TestBed.createComponent(HostComponent);
    fixtureA.componentInstance.visible = true;
    fixtureA.detectChanges();
    await fixtureA.whenStable();
    const elA = fixtureA.nativeElement.querySelector("div");
    const zA = Number(elA.style.zIndex);

    const fixtureB = TestBed.createComponent(HostComponent);
    fixtureB.componentInstance.visible = true;
    fixtureB.detectChanges();
    await fixtureB.whenStable();
    const elB = fixtureB.nativeElement.querySelector("div");
    const zB = Number(elB.style.zIndex);

    expect(zB).toBeGreaterThan(zA);
  });
```

Check the top of `overlay.spec.ts` for its existing imports (`Component`, `TestBed`, test runner functions) — if `Component` is not already imported from `@angular/core`, add it to the existing import line rather than creating a duplicate import statement.

- [ ] **Step 6: Run the overlay test suite**

Run: `pnpm --filter @ultimate/ng-core test -- --project=ng-core -t "UOverlay"`
Expected: all tests PASS, including the new one.

- [ ] **Step 7: Run the full Angular test suites for both packages to check for regressions**

Run: `pnpm --filter @ultimate/ng-core test && pnpm --filter @ultimate/ng test`
Expected: all suites PASS.

- [ ] **Step 8: Commit**

```bash
git add packages/ng-core/src/overlay/overlay.spec.ts packages/ng/src/dialog/dialog.ts packages/ng/src/dialog/dialog.spec.ts
git commit -m "fix(ng): adopt shared escape/display-order registry for multi-dialog Escape stacking (GAP-007)"
```

---

## Task 4: WP1 — Angular per-component `ng-packagr` secondary entry points

**AMENDMENT (implementation, 2026-09-13):** the original file list below included `button`, `dialog`, `menu`, and `table`. Attempting all 12 surfaced a reproducible `ng-packagr@21.2.7`/`@angular/compiler-cli@21.2.22` crash (`Cannot destructure property 'pos' of 'file.referencedFiles[index]' as it is undefined`, in Angular's internal `ShimReferenceTagger`) whenever one secondary entry point's source imports a file that is itself another secondary entry point's root — confirmed via isolated repro, order-independent, not fixed by changing the import specifier, and with no newer 21.x patch available. `button` imports `../ripple`; `dialog` imports `../button/button`; `menu` imports `../ripple` and `../tooltip`; `table` imports `../paginator/paginator` and `../scroller/scroller`. Per the approved design-spec amendment to WP1 (see `docs/superpowers/specs/2026-09-13-blueprint-completion-design.md`), this task's scope is narrowed to the 8 confirmed-leaf components with zero cross-component source imports. `button`, `dialog`, `menu`, `table` remain reachable only via the primary `@ultimate/ng` entry point — a real, permanent limitation of this dependency version for this repository's composite components, not a placeholder. The steps below are updated to match this narrowed scope.

**Files:**
- Create: `packages/ng/checkbox/ng-package.json`
- Create: `packages/ng/paginator/ng-package.json`
- Create: `packages/ng/scroller/ng-package.json`
- Create: `packages/ng/tooltip/ng-package.json`
- Create: `packages/ng/autofocus/ng-package.json`
- Create: `packages/ng/badge/ng-package.json`
- Create: `packages/ng/fluid/ng-package.json`
- Create: `packages/ng/ripple/ng-package.json`
- Modify: `packages/ng/package.json`

**Interfaces:** None — this task only changes build configuration and the package's `exports` map. No source `.ts` file is modified; every component's existing public API (`UCheckbox`, `UPaginator`, `UScroller`, `UTooltip`, `UAutoFocus`, `UBadge`, `UFluid`, `URipple`) is unchanged. `UButton`, `UDialog`, `UMenu`, `UTable` remain exported only from the primary `@ultimate/ng` entry point, unchanged from before this task.

**Context:** `ng-packagr`'s real, verified (via direct read of the installed `ng-packagr@21.2.7`'s `src/lib/ng-package/discover-packages.js`) secondary-entry-point discovery mechanism: it globs `**/ng-package.json` under the primary package's root directory (excluding `dest` and `node_modules`/`.git`), and treats every match as a secondary entry point whose Angular Package Format output lands at `dist/<path-relative-to-package-root>/`. Each secondary `ng-package.json` needs only a `lib.entryFile` pointing at that component's real `index.ts` (already existing at `packages/ng/src/<component>/index.ts`) — no secondary `package.json` is required (confirmed: `resolveUserPackage`'s `isSecondary` branch skips the `package.json` read entirely). React's and Vue's already-shipped `exports` maps (`packages/react/package.json`, `packages/vue/package.json`) are the exact shape to mirror for `packages/ng/package.json`'s new `exports` field, adapted for `ng-packagr`'s real output layout (`dist/fesm2022/<component>.mjs` + `dist/<component>/index.d.ts`, not `tsup`'s flatter `dist/<component>/index.mjs`).

- [x] **Step 1: Create the 8 secondary entry-point config files**

Each file's content is identical in shape — only the `entryFile` path differs. Create each of the following 8 files with this exact content pattern (the entry file path is relative to the secondary `ng-package.json`'s own directory, i.e. `packages/ng/<component>/`, pointing back into `packages/ng/src/<component>/index.ts`). Skip `button`, `dialog`, `menu`, `table` per the amendment above.

`packages/ng/checkbox/ng-package.json`:
```json
{
  "$schema": "../node_modules/ng-packagr/ng-entrypoint.schema.json",
  "lib": {
    "entryFile": "../src/checkbox/index.ts"
  }
}
```

`packages/ng/paginator/ng-package.json`:
```json
{
  "$schema": "../node_modules/ng-packagr/ng-entrypoint.schema.json",
  "lib": {
    "entryFile": "../src/paginator/index.ts"
  }
}
```

`packages/ng/scroller/ng-package.json`:
```json
{
  "$schema": "../node_modules/ng-packagr/ng-entrypoint.schema.json",
  "lib": {
    "entryFile": "../src/scroller/index.ts"
  }
}
```

`packages/ng/tooltip/ng-package.json`:
```json
{
  "$schema": "../node_modules/ng-packagr/ng-entrypoint.schema.json",
  "lib": {
    "entryFile": "../src/tooltip/index.ts"
  }
}
```

`packages/ng/autofocus/ng-package.json`:
```json
{
  "$schema": "../node_modules/ng-packagr/ng-entrypoint.schema.json",
  "lib": {
    "entryFile": "../src/autofocus/index.ts"
  }
}
```

`packages/ng/badge/ng-package.json`:
```json
{
  "$schema": "../node_modules/ng-packagr/ng-entrypoint.schema.json",
  "lib": {
    "entryFile": "../src/badge/index.ts"
  }
}
```

`packages/ng/fluid/ng-package.json`:
```json
{
  "$schema": "../node_modules/ng-packagr/ng-entrypoint.schema.json",
  "lib": {
    "entryFile": "../src/fluid/index.ts"
  }
}
```

`packages/ng/ripple/ng-package.json`:
```json
{
  "$schema": "../node_modules/ng-packagr/ng-entrypoint.schema.json",
  "lib": {
    "entryFile": "../src/ripple/index.ts"
  }
}
```

- [x] **Step 2: Run a build and treat its real output as the only source of truth for Step 3**

Run: `pnpm --filter @ultimate/ng build`

Then inspect the actual output structure directly — do not proceed to Step 3 until you have this real data in hand:

```bash
find packages/ng/dist -maxdepth 2 -type f \( -name "*.mjs" -o -name "*.d.ts" \) | sort
```

Expected: this lists, among the pre-existing primary-entry-point files, one compiled module file and one `.d.ts` file per secondary entry point created in Step 1 (`checkbox`, `paginator`, `scroller`, `tooltip`, `autofocus`, `badge`, `fluid`, `ripple`) — 16 new files total, 2 per component. (`button`, `dialog`, `menu`, `table` are not built as secondary entry points — see this task's amendment note.)

**This `find` output is the authoritative source for every path written into Step 3's `exports` map below — not the JSON shown in Step 3.** Step 3's JSON block is this plan's best-evidenced *prediction* of `ng-packagr`'s real Angular Package Format naming convention (flat-module naming: `<primary-package-name>-<secondary-path>.mjs` alongside the primary's own `fesm2022/ultimate-ng.mjs`), made without an actual build having been run during this planning pass. It is not confirmed. Before writing anything into `packages/ng/package.json`, compare Step 3's predicted paths against this step's real `find` output one subpath at a time; for every path that differs (a different directory, a different filename pattern, a different extension), use the real path from `find`, not the predicted one. Do not write a path into `package.json` that this `find` command did not actually show you.

- [x] **Step 3: Add the `exports` map to `packages/ng/package.json`, using Step 2's real file listing**

Open `packages/ng/package.json`. Find:

```json
  "main": "./dist/fesm2022/ultimate-ng.mjs",
  "module": "./dist/fesm2022/ultimate-ng.mjs",
  "types": "./dist/types/ultimate-ng.d.ts",
  "files": [
```

Replace with — **but first, for each of the 8 component subpaths below, replace the predicted `"types"`/`"default"` file paths with the real paths from Step 2's `find` output.** The JSON below shows the plan's predicted shape; treat every `./dist/...` value in it as a placeholder to verify, not a value to copy blindly. There is no `./button`, `./dialog`, `./menu`, or `./table` subpath — see this task's amendment note:

```json
  "main": "./dist/fesm2022/ultimate-ng.mjs",
  "module": "./dist/fesm2022/ultimate-ng.mjs",
  "types": "./dist/types/ultimate-ng.d.ts",
  "exports": {
    ".": {
      "types": "./dist/types/ultimate-ng.d.ts",
      "default": "./dist/fesm2022/ultimate-ng.mjs"
    },
    "./checkbox": {
      "types": "./dist/types/ultimate-ng-checkbox.d.ts",
      "default": "./dist/fesm2022/ultimate-ng-checkbox.mjs"
    },
    "./paginator": {
      "types": "./dist/types/ultimate-ng-paginator.d.ts",
      "default": "./dist/fesm2022/ultimate-ng-paginator.mjs"
    },
    "./scroller": {
      "types": "./dist/types/ultimate-ng-scroller.d.ts",
      "default": "./dist/fesm2022/ultimate-ng-scroller.mjs"
    },
    "./tooltip": {
      "types": "./dist/types/ultimate-ng-tooltip.d.ts",
      "default": "./dist/fesm2022/ultimate-ng-tooltip.mjs"
    },
    "./autofocus": {
      "types": "./dist/types/ultimate-ng-autofocus.d.ts",
      "default": "./dist/fesm2022/ultimate-ng-autofocus.mjs"
    },
    "./badge": {
      "types": "./dist/types/ultimate-ng-badge.d.ts",
      "default": "./dist/fesm2022/ultimate-ng-badge.mjs"
    },
    "./fluid": {
      "types": "./dist/types/ultimate-ng-fluid.d.ts",
      "default": "./dist/fesm2022/ultimate-ng-fluid.mjs"
    },
    "./ripple": {
      "types": "./dist/types/ultimate-ng-ripple.d.ts",
      "default": "./dist/fesm2022/ultimate-ng-ripple.mjs"
    }
  },
  "files": [
```

**Note (implementation, confirmed against real build output):** the real Angular Package Format layout for this `ng-packagr` version puts every entry point's `.d.ts` under the shared `dist/types/` directory, flat-named `ultimate-ng-<component>.d.ts` — not `dist/<component>/index.d.ts` as originally predicted. The JSON above already reflects the confirmed-real paths.

- [x] **Step 4: Rebuild and verify each `exports` subpath resolves to a real file**

Run: `pnpm --filter @ultimate/ng build`

Then verify every path named in the new `exports` map actually exists on disk:

```bash
node -e '
const pkg = require("./packages/ng/package.json");
const fs = require("fs");
const path = require("path");
let failed = false;
for (const [subpath, conditions] of Object.entries(pkg.exports)) {
  for (const [condition, filePath] of Object.entries(conditions)) {
    const resolved = path.join("packages/ng", filePath);
    if (!fs.existsSync(resolved)) {
      console.error(`MISSING: exports["${subpath}"]["${condition}"] -> ${resolved}`);
      failed = true;
    }
  }
}
if (failed) process.exit(1);
console.log("All exports paths resolve to real files.");
'
```

Expected: `All exports paths resolve to real files.` If any path is reported missing, correct that specific `exports` entry in `packages/ng/package.json` to match the real build output and re-run this verification — do not proceed until it passes cleanly.

- [x] **Step 5: Re-run the tree-shaking verification script and record its result**

Run: `node scripts/provenance/verify-tree-shaking.mjs`
Expected: this may now PASS for the 8 leaf components (a generic bundler can resolve e.g. `@ultimate/ng/tooltip` without pulling in unrelated code, since they are now genuinely separate output files rather than one shared barrel), or it may still report the same or a different failure (Angular's own `ng-packagr` output may still lack `/* @__PURE__ */` annotations regardless of entry-point splitting — this is a distinct, separately-documented limitation per `PERFORMANCE.md`'s existing Task 17 finding). `button`/`dialog`/`menu`/`table` are excluded from this task's scope (see amendment note above) and remain whatever this script already found for them prior to this task. Whatever the actual result, do not treat a still-failing result as a task failure — record it exactly in Step 6.

- [x] **Step 6: Update `PERFORMANCE.md`'s existing Phase 2 tree-shaking section with the re-run result**

Open `docs/architecture/PERFORMANCE.md`. Find the `### Tree-shaking spot-check (Task 17 re-confirmation)` section (search for `Task 17 re-confirmation`). Add a new paragraph immediately after that section's existing final paragraph (before the next `###`/`##` heading), reporting Step 5's actual result. If the script now passes, use:

```markdown
### Tree-shaking spot-check (Blueprint Completion re-run, secondary entry points added)

Following Blueprint Completion's addition of 8 real `ng-packagr` secondary entry points (GAP-009/GAP-023 — `packages/ng/{checkbox,paginator,scroller,tooltip,autofocus,badge,fluid,ripple}/ng-package.json`, each with its own `lib.entryFile`, plus a matching per-component `exports` map in `packages/ng/package.json`), `node scripts/provenance/verify-tree-shaking.mjs` was re-run against the new build: **[PASS/FAIL — fill in the real console output verbatim here]**. [If PASS:] This resolves the tree-shaking failure Task 17 originally found and documented above for these 8 components — importing only one of them no longer pulls in unrelated component code, since each now has its own real output file rather than sharing one barrel. [If still FAIL:] The secondary-entry-point split did not resolve this specific script's failure mode; `ng-packagr`'s Angular Package Format output for each entry point still lacks `/* @__PURE__ */` purity annotations (this is Task 17's own already-documented, unrelated root cause — only the real Angular linker inside a real application build adds those, which requires GAP-008's still-open real-consumer-app scope, not entry-point splitting). Per-component `exports` subpaths are still added regardless, since they resolve GAP-023's own distinct claim (no per-component subpath exports at all) independently of whether this specific tree-shaking script's assertion passes. `button`, `dialog`, `menu`, and `table` remain excluded from this entry-point split entirely — see this task's amendment note — and so are not addressed by this re-run.
```

Fill in the real console output from Step 5 verbatim in place of the bracketed placeholder before committing — do not leave the placeholder text in the committed file.

- [x] **Step 7: Run the full Angular test suite and CI-relevant gates to check for regressions**

Run: `pnpm --filter @ultimate/ng test && pnpm --filter @ultimate/ng typecheck`
Expected: both PASS.

Run: `node scripts/provenance/validate-boundaries.mjs`
Expected: passes unchanged (no new cross-package dependency was introduced).

- [x] **Step 8: Commit**

```bash
git add packages/ng/checkbox/ng-package.json packages/ng/paginator/ng-package.json packages/ng/scroller/ng-package.json packages/ng/tooltip/ng-package.json packages/ng/autofocus/ng-package.json packages/ng/badge/ng-package.json packages/ng/fluid/ng-package.json packages/ng/ripple/ng-package.json packages/ng/package.json docs/architecture/PERFORMANCE.md
git commit -m "feat(ng): add per-component ng-packagr secondary entry points and exports map (GAP-009, GAP-023)"
```

---

## Task 5: WP3 — Commit generated `llms.txt`/Skill-context output under `packages/ai/context/`

**AMENDMENT (implementation, 2026-09-13):** the original steps below (Steps 1-6) moved generated output out of `dist/` without updating `packages/ai/package.json`'s `"files"` array, which controls what a real `npm`/`pnpm install @ultimate/ai` actually ships. This would have silently broken an existing, pre-Blueprint-Completion test — `packages/ai/test/packaging.test.ts` ("npm packaging contract, spec §7.1a") — which asserts these 5 files are present in a real packed tarball and resolvable after a real install, previously at `dist/context/*.txt`. Per the approved design-spec amendment to WP3, the npm packaging guarantee is kept: `"files"` gains `"context"`, and the packaging test's expected paths move from `dist/context/*.txt` to `context/*.txt`. New Steps 5a and 5b below (after the original Step 5, before the original Step 6/commit) implement this.

**Files:**
- Modify: `packages/ai/package.json`
- Modify: `packages/ai/test/packaging.test.ts`
- Create: `packages/ai/context/llms.txt`
- Create: `packages/ai/context/llms-full.txt`
- Create: `packages/ai/context/llms-ng.txt`
- Create: `packages/ai/context/llms-react.txt`
- Create: `packages/ai/context/llms-vue.txt`

**Interfaces:**
- Consumes: `packages/ai/src/bin-generate.ts`'s existing `main()` (reads `process.argv[2]` for the skills directory, `process.argv[3]` for the context output directory — both already fully parameterizable, no source change needed) and `packages/ai/src/bin-validate.ts`'s existing `main()` (same argument shape).
- Produces: five new committed text files under `packages/ai/context/`. No new exported function or type.

**Context:** `packages/ai/package.json`'s `build` script currently invokes `node dist/bin-generate.mjs ../../skills dist/context` — writing generated output under `dist/`, which `.gitignore`'s bare `dist/` pattern excludes at any depth. This task changes only the invocation's output-directory argument (from `dist/context` to `context`), runs the build once, and commits the real output. No CI wiring is added (per the approved spec's explicit Non-goals). The `"files"` array and packaging test are updated (amendment above) so the npm-install-time guarantee these files ship is preserved from the new location.

- [ ] **Step 1: Update the `build` and `validate` scripts' output directory argument**

Open `packages/ai/package.json`. Find:

```json
  "scripts": {
    "build": "tsup && node scripts/rename-dts.mjs && node dist/bin-generate.mjs ../../skills dist/context",
    "test": "vitest run --typecheck",
    "test:coverage": "vitest run --coverage --typecheck",
    "typecheck": "tsc --noEmit",
    "validate": "node dist/bin-validate.mjs ../../skills dist/context"
  },
```

Replace with:

```json
  "scripts": {
    "build": "tsup && node scripts/rename-dts.mjs && node dist/bin-generate.mjs ../../skills context",
    "test": "vitest run --typecheck",
    "test:coverage": "vitest run --coverage --typecheck",
    "typecheck": "tsc --noEmit",
    "validate": "node dist/bin-validate.mjs ../../skills context"
  },
```

- [ ] **Step 2: Run the build to generate real output at the new committed path**

Run: `pnpm --filter @ultimate/ai build`
Expected: console output includes `[@ultimate/ai] generate: wrote 8 Skill file(s)` and `[@ultimate/ai] generate: wrote 5 LLM-context file(s)`.

Run: `ls packages/ai/context/`
Expected: `llms-full.txt`, `llms-ng.txt`, `llms-react.txt`, `llms-vue.txt`, `llms.txt`.

- [ ] **Step 3: Confirm the new path is not gitignored**

Run: `git check-ignore -v packages/ai/context/llms.txt`
Expected: no output and a non-zero exit code (confirming the file is NOT matched by any `.gitignore` pattern — `dist/`'s bare pattern only matches directories literally named `dist`, and `context` is a different name).

- [ ] **Step 4: Run the existing validate script against the committed output**

Run: `pnpm --filter @ultimate/ai run validate`
Expected: console output shows `OK` for all 5 context-file checks (`llms.txt`, `llms-full.txt`, `llms-ng.txt`, `llms-react.txt`, `llms-vue.txt`) and all 8 Skill-file checks, ending in `5 of 5 LLM-context file(s) reproducible` and `8 of 8 Skill file(s) passed` (or the real current Skill-file count if it differs — confirm against actual `ls skills/*.md | wc -l` if the numbers don't match, since this reflects real repository content, not a fixed constant this plan can guarantee in advance).

- [ ] **Step 5: Run the package's own test suite to confirm no regression**

Run: `pnpm --filter @ultimate/ai test`
Expected: two tests FAIL — `packages/ai/test/packaging.test.ts`'s "a real `npm pack` tarball includes all 5 dist/context/*.txt files" and "installing the packed tarball into a scratch consumer resolves all 5 files at node_modules/@ultimate/ai/dist/context/" — because they still assert the pre-amendment `dist/context/` path. This is expected per this task's amendment note; Steps 5a-5b fix it. All other tests PASS.

- [ ] **Step 5a: Add `context` to `package.json`'s `files` array so a real install still ships these files**

Open `packages/ai/package.json`. Find:

```json
  "files": [
    "dist",
    "README.md"
  ],
```

Replace with:

```json
  "files": [
    "dist",
    "context",
    "README.md"
  ],
```

- [ ] **Step 5b: Update `packaging.test.ts`'s expected paths from `dist/context/` to `context/`**

Open `packages/ai/test/packaging.test.ts`. Find the first test's expected-paths array:

```typescript
      for (const expected of [
        "dist/context/llms.txt",
        "dist/context/llms-full.txt",
        "dist/context/llms-ng.txt",
        "dist/context/llms-react.txt",
        "dist/context/llms-vue.txt",
      ]) {
```

Replace with:

```typescript
      for (const expected of [
        "context/llms.txt",
        "context/llms-full.txt",
        "context/llms-ng.txt",
        "context/llms-react.txt",
        "context/llms-vue.txt",
      ]) {
```

Also update this test's own name from `"a real \`npm pack\` tarball includes all 5 dist/context/*.txt files"` to `"a real \`npm pack\` tarball includes all 5 context/*.txt files"`.

Find the second test's `contextDir` line:

```typescript
      const contextDir = join(consumerDir, "node_modules", "@ultimate", "ai", "dist", "context");
```

Replace with:

```typescript
      const contextDir = join(consumerDir, "node_modules", "@ultimate", "ai", "context");
```

Also update this test's own name from `"installing the packed tarball into a scratch consumer resolves all 5 files at node_modules/@ultimate/ai/dist/context/"` to `"installing the packed tarball into a scratch consumer resolves all 5 files at node_modules/@ultimate/ai/context/"`.

Re-run: `pnpm --filter @ultimate/ai test`
Expected: all tests PASS, including both updated packaging tests (these run a real `npm pack`/`pnpm pack` and scratch install, so allow the full ~90s timeout already set on the second test).

- [ ] **Step 6: Stage and commit, including the generated files despite the repository's default `dist/`-focused `.gitignore` mindset**

```bash
git add packages/ai/package.json packages/ai/test/packaging.test.ts packages/ai/context/llms.txt packages/ai/context/llms-full.txt packages/ai/context/llms-ng.txt packages/ai/context/llms-react.txt packages/ai/context/llms-vue.txt
git status
```

Verify the `git status` output shows all 7 files staged (2 modified, 5 new) before committing — if any `context/*.txt` file is missing from the staged list, re-run `git add` for that specific path; do not use `git add -A`.

```bash
git commit -m "feat(ai): generate and commit llms.txt/llms-full.txt context output (GAP-036)"
```

---

## Task 6: WP6 — Update `BLUEPRINT_GAPS.md` and `ROADMAP.md` to reflect all six resolved gaps

**Files:**
- Modify: `docs/architecture/BLUEPRINT_GAPS.md`
- Modify: `docs/architecture/ROADMAP.md`

**Interfaces:** None — pure documentation update, run only after Tasks 1-5 are complete, committed, and independently verified (per the approved spec's WP6 dependency: "Runs after WP1-5 are all implemented and verified").

**Context:** This task must be the last task executed in this plan — it references real commit hashes from Tasks 1-5, which only exist once those tasks are committed. Before starting this task, run `git log --oneline -6` and record the six commit hashes from Tasks 1-5 (Task 1 produces one commit; Tasks 2-5 each produce one commit — 5 commits total for Tasks 1-5, not 6; adjust the placeholder `<commit-sha>` references below to the real hashes from your own `git log` output before writing them into the document).

- [ ] **Step 1: Update the Phase 2 row in `BLUEPRINT_GAPS.md`'s §2 phase table**

Open `docs/architecture/BLUEPRINT_GAPS.md`. Find the Phase 2 row (search for `GAP-006/GAP-007/GAP-009/GAP-010 remain genuinely open`):

```markdown
| 2 | UltimateNG | Complete, with explicit follow-ups | Confirmed — `ng-core` + `ng` build; proof set expanded from the original 5 components to 8 (Button/Checkbox/Dialog/Menu/Tooltip/Paginator/Scroller/Table). GAP-003 (style-injection no-op) is now **resolved** (commit `680876f`) — was open when this table was first written. GAP-006/GAP-007/GAP-009/GAP-010 remain genuinely open (see their own entries below). |
```

Replace with (fill in the real Task 2/3/4 commit hashes from your own `git log`):

```markdown
| 2 | UltimateNG | Complete | Confirmed — `ng-core` + `ng` build; proof set expanded from the original 5 components to 8 (Button/Checkbox/Dialog/Menu/Tooltip/Paginator/Scroller/Table). GAP-003 (style-injection no-op) resolved (commit `680876f`). GAP-006 (Tooltip `aria-describedby`, commit `<Task-2-commit-sha>`), GAP-007 (Angular Escape-priority stacking, commit `<Task-3-commit-sha>`), GAP-009/GAP-023 (per-component secondary entry points, commit `<Task-4-commit-sha>`), and GAP-010 (provenance spec reconciliation, commit `<Task-1-commit-sha>`) are all now resolved by the Blueprint Completion workstream (2026-09-13) — see their own entries below. |
```

- [ ] **Step 2: Update GAP-006's entry**

Find the `#### GAP-006` heading (search for `UTooltip.*aria-describedby.*wiring`). Replace the entire entry block (from `#### GAP-006` up to, but not including, the next `#### GAP-007` heading) with:

```markdown
#### GAP-006 — `UTooltip` (Angular) has `role="tooltip"` but no `aria-describedby` wiring
- **Status:** RESOLVED
- **Type:** Accessibility, Component, Framework (Angular)
- **Blocking level:** LOW (at the time this was open)
- **Current evidence:** `packages/ng/src/tooltip/tooltip.ts` now injects `ComponentIdGenerator`, assigns each floating tooltip container a real, SSR-safe id, and wires the trigger element's `aria-describedby` to that id on show — merging with, not overwriting, any pre-existing `aria-describedby` tokens, and restoring the original value exactly on hide. Matches `packages/react/src/tooltip/tooltip.tsx`'s already-shipped merge/restore behavior for the same problem.
- **Expected state:** Trigger element has `aria-describedby` pointing at the tooltip's id when visible. **Met.**
- **Why it matters:** Historical — screen readers can now associate the tooltip text with its trigger; previously they could not.
- **What it blocks:** Nothing — resolved.
- **Dependencies:** None.
- **Framework scope:** Angular only (React/Vue already had this wiring — see `packages/react/src/tooltip/tooltip.tsx`, `packages/vue/src/tooltip/tooltip.ts`).
- **Existing reusable infrastructure:** N/A — resolved.
- **Recommended resolution direction:** N/A — resolved.
- **Source/evidence:** `packages/ng/src/tooltip/tooltip.ts`; `packages/ng/src/tooltip/tooltip.spec.ts`; commit `<Task-2-commit-sha>`; `docs/superpowers/plans/2026-09-13-blueprint-completion.md` Task 2.
- **Architectural decision required:** No.

```

- [ ] **Step 3: Update GAP-007's entry**

Find the `#### GAP-007` heading. Replace the entire entry block (up to, but not including, the next `#### GAP-008` heading) with:

```markdown
#### GAP-007 — Angular `UDialog` overlay has a single z-index bucket — no working multi-dialog stacking order
- **Status:** RESOLVED
- **Type:** Accessibility, Overlay/Interaction, Component, Framework (Angular)
- **Blocking level:** MEDIUM (at the time this was open)
- **Current evidence:** Direct re-verification during Blueprint Completion (2026-09-13) found this gap's own original z-index framing was already stale by the time it was resolved: `@ultimate/uix-utils/zindex`'s `ZIndex.set(key, element, baseZIndex)` already auto-increments correctly on every call sharing the same key (confirmed by direct read of `packages/uix-utils/src/zindex/index.ts`'s `generateZIndex`) — `UOverlay`'s `ZIndex.set("overlay", hostEl, 1000)` call was never actually a "single static bucket" in the sense of assigning the same numeric z-index to every instance; each call already produced a strictly higher value than the last, confirmed by a new regression test (`packages/ng-core/src/overlay/overlay.spec.ts`). The real, confirmed defect was Escape-handling stacking specifically: `packages/ng/src/dialog/dialog.ts`'s `UDialog` now registers with `@ultimate/uix-utils/escape`'s shared `escapeRegistry`/`displayOrderRegistry` (the same registries `packages/react-core` already consumes, per ADR-026/ADR-036), replacing the previous unconditional `(document:keydown.escape)` host listener — with two dialogs open simultaneously, Escape now closes only the topmost (most-recently-displayed) one, confirmed by two new multi-instance tests in `dialog.spec.ts`.
- **Expected state:** React's `useGlobalEscapeKey`/`useDisplayOrder` mechanism (ADR-026) is now mirrored by Angular's `UDialog`. **Met.**
- **Why it matters:** Historical — unblocks every future Angular overlay component needing correct nested-overlay Escape-stacking behavior; shared infrastructure was already proven by React's consumption of it.
- **What it blocks:** Nothing — resolved.
- **Dependencies:** None.
- **Framework scope:** Angular only — React and Vue already had working priority-queue Escape handling per ADR-026/ADR-036.
- **Existing reusable infrastructure:** N/A — resolved (was `@ultimate/uix-utils/escape`, `@ultimate/uix-utils/zindex`, now consumed).
- **Recommended resolution direction:** N/A — resolved.
- **Source/evidence:** `packages/ng/src/dialog/dialog.ts`; `packages/ng/src/dialog/dialog.spec.ts`; `packages/ng-core/src/overlay/overlay.spec.ts`; commit `<Task-3-commit-sha>`; `docs/superpowers/plans/2026-09-13-blueprint-completion.md` Task 3.
- **Architectural decision required:** No.

```

- [ ] **Step 4: Update GAP-009's entry**

Find the `#### GAP-009` heading. Replace the entire entry block (up to, but not including, the next `#### GAP-010` heading) with:

```markdown
#### GAP-009 — Angular tree-shaking verified broken; `ng` ships a single barrel instead of the originally-planned 9 secondary entry points
- **Status:** RESOLVED
- **Type:** Packaging, Framework (Angular), Testing
- **Blocking level:** MEDIUM (at the time this was open)
- **Current evidence:** `packages/ng` now ships 8 real `ng-packagr` secondary entry points (`checkbox`, `paginator`, `scroller`, `tooltip`, `autofocus`, `badge`, `fluid`, `ripple` — every component directory confirmed to have zero cross-component source imports), each with its own `ng-package.json`/`lib.entryFile`, matching React's/Vue's per-component `exports` pattern. `button`, `dialog`, `menu`, and `table` are **not** split into secondary entry points: attempting all 12 surfaced a reproducible `ng-packagr@21.2.7`/`@angular/compiler-cli@21.2.22` crash (Angular's internal `ShimReferenceTagger` destructuring `undefined`) whenever one secondary entry point's source imports a file that is itself another secondary entry point's root, which is true for these 4 composites (`button`→`ripple`; `dialog`→`button`; `menu`→`ripple`,`tooltip`; `table`→`paginator`,`scroller`) — confirmed via isolated minimal repro, order-independent, not resolved by changing the import specifier, no newer 21.x patch available. `packages/ng/package.json` now declares a real `exports` map with a subpath per shipped component. `scripts/provenance/verify-tree-shaking.mjs`'s re-run result is documented in `docs/architecture/PERFORMANCE.md`'s tree-shaking section (see that document for the specific PASS/FAIL outcome — this gap is resolved for the 8 shipped components regardless of that script's specific result, since the resolution criterion is the presence of real, working secondary entry points and a real `exports` map, which `verify-tree-shaking.mjs`'s own known, separately-documented `/* @__PURE__ */`-annotation limitation, per Task 17's original finding, may or may not fully validate without a real consumer app — see GAP-008).
- **Expected state:** Either Angular ships secondary entry points matching React/Vue's per-component export pattern, or the spec is formally amended. **Partially met** — 8 of 12 components ship secondary entry points; `button`/`dialog`/`menu`/`table` are permanently excluded due to an upstream `ng-packagr` defect with no available fix, and this exclusion is itself the closure (there is no further action pending — the spec was amended to match reality, per WP1's design-spec amendment).
- **Why it matters:** Historical — Angular is no longer the outlier among the three frameworks on this specific packaging capability, for the components where the underlying tooling permits it.
- **What it blocks:** Nothing — resolved (as amended).
- **Dependencies:** GAP-008 (a real consumer app remains the only way to fully re-measure tree-shaking through the real Angular linker) is unaffected by this resolution and remains separately open, per its own entry.
- **Framework scope:** Angular only.
- **Existing reusable infrastructure:** N/A — resolved.
- **Recommended resolution direction:** N/A — resolved. A future `ng-packagr`/`@angular/compiler-cli` upgrade past this defect could revisit `button`/`dialog`/`menu`/`table`, but no such fix exists as of this resolution.
- **Source/evidence:** `packages/ng/{checkbox,paginator,scroller,tooltip,autofocus,badge,fluid,ripple}/ng-package.json`; `packages/ng/package.json`; `docs/architecture/PERFORMANCE.md`; `docs/superpowers/specs/2026-09-13-blueprint-completion-design.md` WP1 amendment; commit `<Task-4-commit-sha>`; `docs/superpowers/plans/2026-09-13-blueprint-completion.md` Task 4.
- **Architectural decision required:** No.

```

- [ ] **Step 5: Update GAP-010's entry**

Find the `#### GAP-010` heading. Replace the entire entry block (up to, but not including, the next `#### GAP-011` heading) with:

```markdown
#### GAP-010 — Provenance manifest schema names `sha256OfOriginal` as required; neither `ng.json` nor `ng-core.json` has it
- **Status:** RESOLVED
- **Type:** Provenance, CI
- **Blocking level:** LOW (at the time this was open)
- **Current evidence:** Both the Phase 1 spec (`docs/superpowers/specs/2026-08-28-phase-1-uix-foundation-design.md:310`) and the Phase 2 spec (`docs/superpowers/specs/2026-08-29-phase-2-ultimateng-foundation-design.md:388`) — the latter is what this gap originally cited; the former was found during Blueprint Completion to state the identical claim one phase earlier — are now amended to note that `sha256OfOriginal` was never carried into the actual per-manifest schema, and that `scripts/provenance/validate-provenance.mjs` — the real, CI-enforced gate — checks a different, real mechanism instead (`REQUIRED_HEADINGS` matched against `docs/architecture/PROVENANCE.md`'s own section headings). No manifest JSON file was modified; no field was added anywhere.
- **Expected state:** Either the field is added to both manifests, or the spec is amended to stop requiring it. **Met** — the spec was amended.
- **Why it matters:** Historical — the spec text no longer states a requirement the validator doesn't check.
- **What it blocks:** Nothing — resolved.
- **Dependencies:** None.
- **Framework scope:** N/A (documentation-only; affected both the Phase 1 and Phase 2 specs, not just Angular's manifests as originally scoped).
- **Existing reusable infrastructure:** N/A — resolved.
- **Recommended resolution direction:** N/A — resolved.
- **Source/evidence:** `docs/superpowers/specs/2026-08-28-phase-1-uix-foundation-design.md:310`; `docs/superpowers/specs/2026-08-29-phase-2-ultimateng-foundation-design.md:388`; commit `<Task-1-commit-sha>`; `docs/superpowers/plans/2026-09-13-blueprint-completion.md` Task 1.
- **Architectural decision required:** No.

```

- [ ] **Step 6: Update GAP-023's entry**

Find the `#### GAP-023` heading. Replace the entire entry block (up to, but not including, the next `#### GAP-024` heading) with:

```markdown
#### GAP-023 — Angular has no per-component subpath exports (React and Vue do)
- **Status:** RESOLVED
- **Type:** Packaging, Framework
- **Blocking level:** MEDIUM (at the time this was open)
- **Current evidence:** Same resolution as GAP-009 (this was always the same underlying fact viewed from two angles). `packages/ng/package.json` now declares a real `exports` map with per-component subpaths for the 8 components an upstream `ng-packagr` defect does not block (`./checkbox`, `./paginator`, `./scroller`, `./tooltip`, `./autofocus`, `./badge`, `./fluid`, `./ripple`), matching `packages/react/package.json`'s and `packages/vue/package.json`'s existing shape for those subpaths. `./button`, `./dialog`, `./menu`, `./table` are not added — see GAP-009's full explanation of the blocking defect.
- **Expected state:** Angular ships per-component `exports` subpaths matching React/Vue. **Partially met** — 8 of 12; see GAP-009.
- **Why it matters:** Historical — see GAP-009.
- **What it blocks:** Nothing — resolved (as amended). See GAP-009.
- **Dependencies:** Same as GAP-009.
- **Framework scope:** Angular only, relative to React/Vue.
- **Existing reusable infrastructure:** N/A — resolved.
- **Recommended resolution direction:** N/A — resolved.
- **Source/evidence:** `packages/{ng,react,vue}/package.json` `exports` fields; commit `<Task-4-commit-sha>`; `docs/superpowers/plans/2026-09-13-blueprint-completion.md` Task 4.
- **Architectural decision required:** No.

```

- [ ] **Step 7: Update GAP-036's entry**

Find the `#### GAP-036` heading. Replace the entire entry block (up to, but not including, the next `#### GAP-037` heading) with:

```markdown
#### GAP-036 (added during Documentation Reconciliation, resolved during Blueprint Completion) — `llms.txt`/`llms-full.txt` generation tooling exists and is tested, but no generated output artifact has ever been produced or committed
- **Status:** RESOLVED
- **Type:** AI, Documentation
- **Blocking level:** LOW
- **Current evidence:** `packages/ai/context/{llms,llms-full,llms-ng,llms-react,llms-vue}.txt` now exist as real, committed, non-gitignored repository files, generated by running the existing `renderLlmsTxt`/`renderLlmsFullTxt`/`generateContextFiles` functions once against the current 8-component metadata proof set. `packages/ai/package.json`'s `build`/`validate` scripts now target `context/` instead of the previously-gitignored `dist/context/`. This is a one-time snapshot commit, not a CI-enforced regeneration — per explicit scope decision during the Blueprint Completion brainstorming session, CI is not wired to regenerate or diff-check this output going forward.
- **Expected state:** Blueprint §25's named `llms.txt`-style generated output exists as a real repository artifact. **Met.**
- **What it blocks:** Nothing — resolved.
- **Dependencies:** None.
- **Type of work:** Completed — ordinary implementation/operational task (ran the existing generator, committed its output).
- **Source/evidence:** `packages/ai/context/*.txt`; `packages/ai/package.json`; commit `<Task-5-commit-sha>`; `docs/superpowers/plans/2026-09-13-blueprint-completion.md` Task 5.

```

- [ ] **Step 8: Update `ROADMAP.md`'s footnote 5**

Open `docs/architecture/ROADMAP.md`. Find footnote 5 (search for `no \`llms.txt\`/\`llms-full.txt\` file exists anywhere in the repository yet`). Replace:

```markdown
[^5]: `@ultimate/ai` (`packages/ai/src/`) ships real, tested generation/validation tooling — `renderLlmsTxt`, `renderLlmsFullTxt`, `renderFrameworkContext`, `generateContextFiles`, `generateSkillFile`, `validateSkillFile` — plus `skills/` at repo root, which holds real, substantive per-component Skill files for all 8 proof-set components (`button.md` through `tooltip.md`) and `AGENT_CONVENTIONS.md`. One disclosed follow-up: the generator itself has never been run and its output committed — no `llms.txt`/`llms-full.txt` file exists anywhere in the repository yet (tracked as GAP-036 in `BLUEPRINT_GAPS.md`); `tooling/` at repo root remains an empty placeholder. See `docs/architecture/research/2026-09-12-post-phase-10-blueprint-reconciliation-audit.md` §1/§3 for the full reconciliation evidence.
```

With:

```markdown
[^5]: `@ultimate/ai` (`packages/ai/src/`) ships real, tested generation/validation tooling — `renderLlmsTxt`, `renderLlmsFullTxt`, `renderFrameworkContext`, `generateContextFiles`, `generateSkillFile`, `validateSkillFile` — plus `skills/` at repo root, which holds real, substantive per-component Skill files for all 8 proof-set components (`button.md` through `tooltip.md`) and `AGENT_CONVENTIONS.md`. `packages/ai/context/{llms,llms-full,llms-ng,llms-react,llms-vue}.txt` now exist as real, committed generated output (GAP-036, resolved by the Blueprint Completion workstream, 2026-09-13) — a one-time snapshot, not CI-regenerated. `tooling/` at repo root remains an empty placeholder (cosmetic, GAP-001-adjacent, not independently tracked). See `docs/architecture/research/2026-09-12-post-phase-10-blueprint-reconciliation-audit.md` §1/§3 and `docs/superpowers/plans/2026-09-13-blueprint-completion.md` Task 5 for the full evidence trail.
```

- [ ] **Step 9: Read through both updated documents once for internal consistency**

Run: `grep -n "GAP-006\|GAP-007\|GAP-009\|GAP-010\|GAP-023\|GAP-036" docs/architecture/BLUEPRINT_GAPS.md`
Expected: every occurrence of these six IDs across the whole document (the §2 phase table, each gap's own entry, and any cross-reference from another gap's entry, e.g. GAP-017's dependency note) is consistent with `RESOLVED` — no remaining sentence anywhere in the file still describes any of these six as open, missing, or partial. Read each matched line to confirm.

Run: `grep -n "GAP-036\|no \`llms.txt\`" docs/architecture/ROADMAP.md`
Expected: no remaining sentence claims `llms.txt` doesn't exist.

- [ ] **Step 10: Commit**

```bash
git add docs/architecture/BLUEPRINT_GAPS.md docs/architecture/ROADMAP.md
git commit -m "docs(architecture): close GAP-006/007/009/010/023/036 in the gap registry"
```

---

## Task 7: Final verification — full CI-equivalent gate suite

**Files:** None modified — verification only.

**Interfaces:** None.

**Context:** Confirms the Blueprint Freeze Definition of Done's item 8 (`docs/superpowers/specs/2026-09-13-blueprint-completion-design.md` §5): the full existing CI suite is green on the consolidated branch, with no regression in any existing gate.

- [ ] **Step 1: Run format and lint checks**

Run: `pnpm run format:check`
Expected: passes for every file this plan touched (all code edits followed existing file style; if this fails on a file this plan created or modified, run `pnpm run format` scoped to only this plan's changed files — never a blanket `pnpm run format` across the whole repository, since pre-existing, unrelated formatting drift is out of this plan's scope per the prior Blueprint Closure session's own established precedent).

Run: `pnpm run lint`
Expected: passes, no new lint errors introduced by this plan's changes.

- [ ] **Step 2: Run typecheck across all touched packages**

Run: `pnpm --filter @ultimate/ng typecheck && pnpm --filter @ultimate/ng-core typecheck && pnpm --filter @ultimate/ai typecheck`
Expected: all three PASS.

- [ ] **Step 3: Run the full test suite for every touched package**

Run: `pnpm --filter @ultimate/ng test && pnpm --filter @ultimate/ng-core test && pnpm --filter @ultimate/ai test`
Expected: all PASS.

- [ ] **Step 4: Run every provenance/boundary/dependency-ceiling validation script**

Run: `node scripts/provenance/validate-provenance.mjs && node scripts/provenance/validate-boundaries.mjs && node scripts/provenance/validate-dependency-ceiling.mjs`
Expected: all PASS, unchanged from before this plan's work began.

- [ ] **Step 5: Re-run the AGENTS.md pointer validator**

Run: `node scripts/provenance/validate-agents-md-pointers.mjs`
Expected: `[agents-md-pointers:validate] OK: all 7 path(s) referenced in AGENTS.md's pointer table exist` (unchanged — this plan does not touch `AGENTS.md` or any path it references).

- [ ] **Step 6: Confirm `BLUEPRINT.md` is byte-for-byte unmodified**

Run: `git diff --stat main -- docs/architecture/BLUEPRINT.md` (substitute `main` for this branch's actual base if different)
Expected: no output (zero diff).

- [ ] **Step 7: Confirm no protected/deferred decision was touched**

Run: `git diff main -- docs/architecture/BLUEPRINT_GAPS.md | grep -A3 "DECISION-B\|DECISION-C\|DECISION-D\|DECISION-E"`
Expected: no output (this plan's Task 6 only touches gap entries GAP-006/007/009/010/023/036 and the §2 phase table's Phase 2 row — it does not touch the §5 Open Architectural Decisions section at all).

- [ ] **Step 8: Review the full diff for this branch one final time**

Run: `git diff main --stat` (substitute the real base branch/commit if different)
Expected: exactly these files changed, and no others: `docs/superpowers/specs/2026-08-29-phase-2-ultimateng-foundation-design.md`, `docs/superpowers/specs/2026-08-28-phase-1-uix-foundation-design.md`, `packages/ng/src/tooltip/tooltip.ts`, `packages/ng/src/tooltip/tooltip.spec.ts`, `packages/ng-core/src/overlay/overlay.ts` (no change expected here — WP5's research confirmed the z-index mechanism didn't need a code change, only a new test in `overlay.spec.ts`; if `overlay.ts` shows a diff, stop and re-check Task 3 against this plan's own stated scope), `packages/ng-core/src/overlay/overlay.spec.ts`, `packages/ng/src/dialog/dialog.ts`, `packages/ng/src/dialog/dialog.spec.ts`, the 12 new `packages/ng/*/ng-package.json` files, `packages/ng/package.json`, `docs/architecture/PERFORMANCE.md`, `packages/ai/package.json`, the 5 new `packages/ai/context/*.txt` files, `docs/architecture/BLUEPRINT_GAPS.md`, `docs/architecture/ROADMAP.md`.

This step is a manual read, not a scripted assertion — read the actual `git diff main --stat` output and compare it against this exact list before declaring the plan complete.
