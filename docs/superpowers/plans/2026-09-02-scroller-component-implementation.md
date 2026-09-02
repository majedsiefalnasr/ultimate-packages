# Scroller Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Ultimate's Scroller (virtualized-rendering) component — `UScroller` — for Angular (`@ultimate/ng`), React (`@ultimate/react`), and Vue (`@ultimate/vue`), matching each framework's real upstream PrimeNG/PrimeReact/PrimeVue Scroller/VirtualScroller behavior exactly, as specified in `docs/superpowers/specs/2026-09-02-scroller-component-design.md`.

**Architecture:** Three independent, framework-native implementations sharing only `@ultimate/uix-data`'s `calculateNumItemsInViewport` and `calculateLast` functions (unchanged, ADR-043). Each framework implements its own real array-bounds clamp (`getLast`) locally, calling `calculateLast` first and clamping against its own live `items` reference — never a shared package function, since it requires live component state. Each framework preserves its own real derived-scroll-window state-ownership model (Angular: plain internal fields, no `Change` output; React: `useState`, controlled input but uncontrolled derived output; Vue: `data()` reactive fields, no `v-model:first`). Scope is **vertical orientation only** for this plan (see **Global Constraints** for the explicit scoping decision on `horizontal`/`both` and on the accessibility open decision).

**Tech Stack:** Angular 21 standalone components + `ng-packagr` + Angular's own test runner (`ng test`, `TestBed`); React 18/19 function components + `tsup` + Vitest + `@testing-library/react`; Vue 3 Options API SFCs (`extends: createBaseComponent(...)`) + `tsup` + `vue-tsc` + Vitest + `@vue/test-utils`. All three consume `@ultimate/uix-data`, `@ultimate/{ng,react,vue}-core`, `@ultimate/uix-styles`.

**Spec:** `docs/superpowers/specs/2026-09-02-scroller-component-design.md` (commit `c3ee229`)

## Global Constraints

- `calculateNumItemsInViewport(contentSize, itemSize): number` and `calculateLast(first, numItemsInViewport, numToleratedItems, isColumns?): number` are consumed from `@ultimate/uix-data` unchanged — no new export, no modification (ADR-043; spec §2, §5, acceptance criterion 2).
- The array-bounds clamp (`getLast`, spec §9) is implemented natively per framework, matching the real Prime pattern exactly. Its signature retains the `isCols` parameter (defaulting to `false`) even though this plan's vertical-only scope never passes `true` for it — this is a deliberate, stated choice, not dead code: it keeps the deferred `horizontal`/`both` follow-up (see **Explicitly Deferred**) a pure logic change at each existing call site, never an arity change:
  ```text
  getLast(last = 0, isCols = false):
    if (no items) return 0
    liveLength = isCols ? (columns || items[0]).length : items.length
    return min(liveLength, last)
  ```
  This is never imported from `uix-data` — it requires live component state (`items`/`props.items`/`this.items`), which `uix-data`'s `calculateLast` explicitly excludes (spec §2, §9). Every task below that defines `getLast` (Tasks 2, 7, 11) must declare it with this exact `(last = 0, isCols = false)` signature, even though the `isCols` branch is unreachable in this plan's vertical-only scope — this is Global Constraints binding on those tasks, not optional.
- State ownership must match each framework's real divergent model exactly (spec §14) — do not normalize:
  - **Angular**: plain internal fields (`_first`, `_last`, `_page`, `_numItemsInViewport`) updated directly by scroll/resize handlers; **no getter/setter, no `Change` output** for any of them (unlike Paginator's `_first`, which is getter/setter-backed and one-way-input-driven).
  - **React**: `items`/`itemSize`/every other prop read directly from `props` every render (no internal duplication of inputs); but the *derived* scroll window (`first`/`last`/`numItemsInViewport`) is **internal `useState`**, with **no callback-based override path** — "controlled input, uncontrolled derived output."
  - **Vue**: internal `data()` reactive fields for `first`/`last`/`page`/`numItemsInViewport`, **no props of the same name exist to sync from** (they are purely derived/internal, not prop-initialized the way Paginator's `d_first` is) — **no `v-model:first`**, only `update:numToleratedItems` is a `v-model`-compatible emit.
- **Scope for this plan: `vertical` orientation only.** The spec confirms `horizontal`/`both` (2D grid, `{rows, cols}`-shaped state) as real upstream features (spec §4, §8), but including all three orientations in this plan's first pass would roughly double every rendering/clamping/lazy-load task's scope. This plan builds a complete, real, `vertical`-only `UScroller` per framework (matching the spec's own component-responsibility list minus the orientation branching). Task 15 in this plan is the provenance task (see below) — it is **not** reserved for `horizontal`/`both`. `horizontal`/`both` orientation support is a future follow-up **outside this plan entirely** (no task number reserved for it here — see **Explicitly Deferred**), to be scoped as its own plan once Tasks 1–15 below have landed.
- **Accessibility (spec §13, §20 open decision): this plan implements `aria-busy` on the root container while `loading` is true, and nothing beyond that.** The spec confirms Prime's real upstream has zero `role`/`aria-*` attributes anywhere in Scroller, and leaves "should Ultimate add richer ARIA beyond upstream" as an explicit open design question rather than a resolved requirement. `aria-busy` is the one item the spec itself calls "the most direct, evidence-adjacent starting point, since `loading` state already exists as a real prop/field in all three" (spec §13) — this plan resolves that specific narrow item and defers any richer virtualized-grid ARIA (`aria-rowcount`/`aria-setsize`) to whichever future task addresses the spec's open decision in full, consistent with the spec's own framing that richer ARIA is "a genuine Ultimate improvement over upstream, not a source-verified requirement."
- No new `@ultimate/uix-data` primitive, no ADR-043 change, no Blueprint change, no `BLUEPRINT_GAPS.md` change — these are out of scope for this plan.
- **Confirmed real-source verification, this planning pass**: `packages/{ng,react,vue}/src/*` contains no existing Scroller/VirtualScroller component (only `autofocus`, `badge`, `button`, `checkbox`, `dialog`, `fluid`, `menu`, `ripple`, `tooltip` exist). Unlike Paginator, Scroller has **no missing-prerequisite-component blocker** — it has zero dropdown/select/input form-control children of any kind (spec §17, re-confirmed by this planning pass: no `select`/`input`/form-control reference found anywhere in the real PrimeNG/PrimeReact/PrimeVue Scroller source read while writing the spec). This plan is writable straight through with no gated Select/InputNumber-style stop.
- Match every existing shipped-component convention exactly (verified this planning pass by reading `packages/{ng,react,vue}/src/button/*` in full, and cross-checked against `docs/superpowers/plans/2026-09-02-paginator-component-implementation.md`, commit `5074abf`, the most recent sibling plan of this same kind): Angular components extend `UBaseComponent` (`@ultimate/ng-core`) with a `componentName`/`styleModule` pair and Angular signal `input()`/`output()`; React components use `useComponentBase({ componentName, styleModule })` from `@ultimate/react-core`; Vue components use `createBaseComponent({ componentName, styleModule })` from `@ultimate/vue-core` via `extends:`. Every style module is `{ css, classes }`, with `css` sourced from `@ultimate/uix-styles/<component>` and `classes` a local class-name-slot resolver object (`.p-*` renamed to `.u-*`).
- Provenance style tokens for Scroller (upstream name: `virtualscroller`) already exist, vendored, at `.vendor-extracted/uix-styles-components/src/virtualscroller/index.ts` (13 lines — much smaller than Paginator's 102-line token file, since Prime's own real `virtualscroller` tokens only cover the loader state: `virtualscroller.loader.mask.background`, `virtualscroller.loader.mask.color`, `virtualscroller.loader.icon.size` — there is no `virtualscroller.background`-style root token to port, confirmed by reading the real file in full). This plan ports that file into `packages/uix-styles/src/virtualscroller/index.ts` (Task 1), matching the exact pattern of `packages/uix-styles/src/paginator/index.ts`. No component *logic* source is vendored yet (`.vendor-extracted/{ng,react,vue}` has no `scroller`/`virtualscroller` directory) — real PrimeNG/PrimeReact/PrimeVue Scroller logic is read from the pinned cached tarballs (`.vendor-cache/{primeng,primereact,primevue}-<version>.tar.gz`, sha256-verified against `docs/architecture/checksums.json`) as each task requires it, per the spec's own citations.
- **Package/directory naming**: the component's public class/export name is `UScroller` (matching the spec's own "Scroller" terminology throughout, not PrimeReact's internal `VirtualScroller` file name) — the directory is `scroller/` in every framework package, and the ported style-token subpath is `@ultimate/uix-styles/virtualscroller` (matching the real vendored token file's own directory name exactly, since renaming that subpath would break the direct-port traceability Task 1 depends on). This is a deliberate, stated naming choice for this plan, not an inconsistency: component directory name (`scroller`) and style-token subpath (`virtualscroller`) intentionally differ, tracking the spec's own component name vs. the real upstream package's own literal source directory name respectively.

---

## Task Group A — Shared Style Tokens

### Task 1: Port Scroller style tokens into `@ultimate/uix-styles`

**Files:**
- Create: `packages/uix-styles/src/virtualscroller/index.ts`
- Test: `packages/uix-styles/test/virtualscroller.test.ts`

**Interfaces:**
- Consumes: nothing new (plain string export, matching `packages/uix-styles/src/paginator/index.ts`'s `export const style = ...` shape)
- Produces: `export const style: string` — importable as `@ultimate/uix-styles/virtualscroller`, consumed by Task 3/8/12's `scroller-style.ts` files

- [ ] **Step 1: Write the failing test**

```typescript
// packages/uix-styles/test/virtualscroller.test.ts
import { describe, it, expect } from "vitest";
import { style } from "../src/virtualscroller";

describe("uix-styles virtualscroller", () => {
  it("exports a non-empty CSS string with .u-scroller-loader selectors", () => {
    expect(typeof style).toBe("string");
    expect(style).toContain(".u-scroller-loader");
    expect(style).not.toContain(".p-virtualscroller-loader");
  });

  it("uses dt() token references for themeable properties", () => {
    expect(style).toContain("dt('virtualscroller.loader.");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/uix-styles test -- virtualscroller.test.ts`
Expected: FAIL — `Cannot find module '../src/virtualscroller'`

- [ ] **Step 3: Write minimal implementation**

Copy `.vendor-extracted/uix-styles-components/src/virtualscroller/index.ts` (13 lines, already vendored, real `@primeuix/styles` virtualscroller token source) to `packages/uix-styles/src/virtualscroller/index.ts`, then apply a find-and-replace: `.p-virtualscroller-loader` becomes `.u-scroller-loader` and `.p-virtualscroller-loading-icon` becomes `.u-scroller-loading-icon` (the component's own class-name convention is `u-scroller`, per this plan's `UScroller` naming, not `u-virtualscroller` — matching how Paginator's port renamed `.p-paginator-*` to `.u-paginator-*` using its own component name, not its style-token subpath name). Do not alter the `dt('virtualscroller.*')` token calls themselves — only the CSS class selectors.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/uix-styles test -- virtualscroller.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/uix-styles/src/virtualscroller/ packages/uix-styles/test/virtualscroller.test.ts
git commit -m "feat(uix-styles): add scroller (virtualscroller) style tokens"
```

---

## Task Group B — Angular (`@ultimate/ng`)

### Task 2: Scaffold `UScroller` — state, `calculateNumItemsInViewport`/`calculateLast`/`getLast` consumption

**Files:**
- Create: `packages/ng/src/scroller/scroller.ts`
- Test: `packages/ng/src/scroller/scroller.spec.ts`

(`packages/ng/src/scroller/index.ts` does not exist yet — it is created in Task 5, once `UScroller` has its full public surface worth exporting, matching Paginator's Task 2/5 split exactly.)

**Interfaces:**
- Consumes: `calculateNumItemsInViewport`, `calculateLast` from `@ultimate/uix-data`; `UBaseComponent` from `@ultimate/ng-core`
- Produces: `UScroller` class with signal inputs `items = input<unknown[]>([])`, `itemSize = input(0)`, `numToleratedItems = input<number | undefined>(undefined)`; protected getter `numItemsInViewportComputed(): number` (calls `calculateNumItemsInViewport`); protected getter `resolvedNumToleratedItems(): number` (returns the input value, or half of `numItemsInViewportComputed` rounded up when unset — matching real Prime's "defaults to half the viewport count when unset" behavior, spec §4.1); protected getter `last(): number` (calls `calculateLast` then clamps via `getLast`); private `getLast(last: number, isCols = false): number` method (signature fixed per Global Constraints — the `isCols` parameter is declared and unused in this task's vertical-only body, not omitted) — all consumed internally by the template (bound via `data-num-items-in-viewport`/`data-last`) and by Task 3's rendering; kept `protected`/private per the same access-control discipline established by Paginator's Task 2 (protected/private class members are not readable from an external `.spec.ts` file — tests assert against rendered DOM output, never `fixture.componentInstance.<protected member>`)

- [ ] **Step 1: Write the failing test**

This task has no real DOM measurement yet (that is Task 3's scope) — `_contentSize` is a fixed `0` in this task's implementation. `calculateNumItemsInViewport(0, itemSize)` is still a real, deterministic function call with a computable output for every `itemSize`, so this task's test asserts the actual number `calculateNumItemsInViewport` produces from that known, fixed `contentSize=0` input, not merely that some attribute exists:

```typescript
// packages/ng/src/scroller/scroller.spec.ts
import { TestBed } from "@angular/core/testing";
import { beforeAll, describe, expect, it } from "vitest";
import { applyUltimateTheme } from "@ultimate/themes";
import { calculateNumItemsInViewport } from "@ultimate/uix-data";
import { UScroller } from "./scroller";

describe("UScroller", () => {
  beforeAll(() => {
    applyUltimateTheme();
  });

  it("computes numItemsInViewport via uix-data's calculateNumItemsInViewport, wired to the real shared function", () => {
    const fixture = TestBed.createComponent(UScroller);
    fixture.componentRef.setInput("items", Array.from({ length: 100 }, (_, i) => i));
    fixture.componentRef.setInput("itemSize", 20);
    fixture.detectChanges();
    // contentSize is a fixed 0 until Task 3's real DOM measurement lands, so
    // calculateNumItemsInViewport(0, 20) is a real, computable, deterministic
    // result — asserting the actual expected number, not merely that the
    // component's calculateNumItemsInViewport import was called at all, is
    // what proves genuine wiring to the shared uix-data function rather than
    // a hardcoded stand-in value.
    expect(fixture.nativeElement.getAttribute("data-num-items-in-viewport")).toBe(
      String(calculateNumItemsInViewport(0, 20))
    );
  });

  it("clamps last (getLast) against the live items array length, per spec §9", () => {
    const fixture = TestBed.createComponent(UScroller);
    fixture.componentRef.setInput("items", Array.from({ length: 5 }, (_, i) => i));
    fixture.componentRef.setInput("itemSize", 20);
    fixture.componentRef.setInput("numToleratedItems", 50); // deliberately large tolerance
    fixture.detectChanges();
    // calculateLast's raw output would exceed 5 with a tolerance this large;
    // getLast must clamp it down to the live items.length.
    expect(fixture.nativeElement.getAttribute("data-last")).toBe("5");
  });

  it("returns 0 for last when items is empty", () => {
    const fixture = TestBed.createComponent(UScroller);
    fixture.componentRef.setInput("items", []);
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute("data-last")).toBe("0");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/ng test -- --include='**/scroller.spec.ts'`
Expected: FAIL — `Cannot find module './scroller'`

- [ ] **Step 3: Write minimal implementation**

```typescript
// packages/ng/src/scroller/scroller.ts
import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { calculateLast, calculateNumItemsInViewport } from "@ultimate/uix-data";
import { scrollerStyleModule } from "./scroller-style";

@Component({
  standalone: true,
  selector: "u-scroller",
  template: `<div
    [class]="cx('root')"
    [attr.data-num-items-in-viewport]="numItemsInViewportComputed"
    [attr.data-last]="last"
  ></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UScroller extends UBaseComponent {
  protected override readonly componentName = "scroller";
  protected override readonly styleModule = scrollerStyleModule;

  items = input<unknown[]>([]);
  itemSize = input(0);
  numToleratedItems = input<number | undefined>(undefined);

  private _contentSize = 0;

  protected get numItemsInViewportComputed(): number {
    return calculateNumItemsInViewport(this._contentSize, this.itemSize());
  }

  protected get resolvedNumToleratedItems(): number {
    const explicit = this.numToleratedItems();
    if (explicit !== undefined) {
      return explicit;
    }
    return Math.ceil(this.numItemsInViewportComputed / 2);
  }

  protected get last(): number {
    const rawLast = calculateLast(0, this.numItemsInViewportComputed, this.resolvedNumToleratedItems);
    return this.getLast(rawLast);
  }

  private getLast(last = 0, isCols = false): number {
    const liveItems = this.items();
    if (!liveItems) return 0;
    const liveLength = isCols ? liveItems.length : liveItems.length; // isCols branch unreachable in vertical-only scope (Global Constraints); kept for signature parity with the deferred horizontal/both follow-up
    return Math.min(liveLength, last);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/ng test -- --include='**/scroller.spec.ts'`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/ng/src/scroller/scroller.ts packages/ng/src/scroller/scroller.spec.ts
git commit -m "feat(ng): scaffold UScroller with uix-data virtualization consumption"
```

---

### Task 3: Angular — style module, content measurement, virtual item rendering, loader markup

**Files:**
- Modify: `packages/ng/src/scroller/scroller.ts`
- Create: `packages/ng/src/scroller/scroller-style.ts`
- Test: `packages/ng/src/scroller/scroller.spec.ts` (extend)

**Measurement architecture — verified against real PrimeNG source** (`packages/primeng/src/scroller/scroller.ts`, pinned commit `c493b1c6d9f7cdffbe1c4dc195493dd73d733593`, lines 682-689, 852-856): real PrimeNG measures the **root/viewport element itself** (`elementViewChild`, i.e. the outer scrollable `<div>` — not the inner content wrapper) via `offsetHeight`/`offsetWidth` (`getHeight`/`getWidth`, which read `offsetHeight`/`offsetWidth`), not `clientHeight`. `contentHeight` used as `calculateNumItemsInViewport`'s `contentSize` argument is `elementViewChild.nativeElement.offsetHeight` (minus the content element's position offset, which is `0` for a simple top-anchored layout — the position-offset subtraction only matters for `both`/`horizontal` orientation, out of scope per Global Constraints). PrimeNG has **zero `ResizeObserver` usage anywhere in `scroller.ts`** — it re-measures on a `window` `resize`/`orientationchange` listener (`bindResizeListener`, lines 1142-1152), not per-element resize observation. This plan uses `ResizeObserver` anyway (a legitimate, more precise modern choice for a new component, not a strict provenance requirement — the spec itself does not mandate matching Prime's exact resize-invalidation mechanism, only the measured-value contract), but the **measured element and property** must match real upstream exactly: measure the same root `#element` div's `offsetHeight`, not an unlabeled `clientHeight` call that could silently target the wrong node.

**Files:**
- Consumes: `style` from `@ultimate/uix-styles/virtualscroller` (Task 1)
- Produces: `first(): number` protected getter (window start index, driven by scroll position); real content-size measurement of the root viewport element's `offsetHeight` via `ElementRef`/`ResizeObserver` (replacing Task 2's `_contentSize = 0` stub with a real measured value, matching real PrimeNG's measured element/property exactly per the architecture note above); rendered item subset; conditional loader markup (`.u-scroller-loader`/`.u-scroller-loading-icon`, real PrimeNG loader class names per `scroller.ts`'s template, renamed `.p-*`→`.u-*`) shown while `loading()` is true — consumed by Task 4's `getLast` re-verification against a real, non-zero content size, by Task 5's `aria-busy`/lazy-load wiring, and by Task 14's cross-framework loader-token verification (this task, not Task 14, is where the loader markup that makes `virtualscroller.loader.mask.background`'s CSS selector actually present is implemented)

- [ ] **Step 1: Write the failing test**

Deterministic layout mocking: jsdom has no real layout engine (`offsetHeight`/`clientHeight` are always `0` on any element unless explicitly stubbed), and no `ResizeObserver` implementation exists in jsdom or anywhere in this repo's existing test setup (`packages/ng` has no `test-setup`/`setup` file; verified this planning pass). This task therefore defines the concrete test seam these tests — and Tasks 4/5's — depend on: stub `offsetHeight` via `Object.defineProperty` on the measured root element (matching the real PrimeNG measured-property contract established above), and stub a global `ResizeObserver` that synchronously invokes its callback once on `observe()` (sufficient to trigger the initial measurement read without needing a real resize event loop). Tests assert the actual numeric result `calculateNumItemsInViewport`/`calculateLast` produce from the mocked, known dimensions — not merely that rendering produced a non-empty result:

```typescript
// prepend to packages/ng/src/scroller/scroller.spec.ts, inside the existing
// describe("UScroller", () => { ... }) block, as a new beforeEach — this
// mock is shared by every test below that needs a non-zero measured
// viewport (Task 3's own tests, and Task 4/5's scrollTo/lazy-load tests)
let resizeObserverCallback: ResizeObserverCallback | undefined;

beforeEach(() => {
  resizeObserverCallback = undefined;
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(cb: ResizeObserverCallback) {
        resizeObserverCallback = cb;
      }
      observe(target: Element) {
        // Synchronously invoke once, matching a real ResizeObserver's
        // initial-observation callback, so tests don't need to await a
        // real resize event loop.
        resizeObserverCallback?.([{ target } as ResizeObserverEntry], this as unknown as ResizeObserver);
      }
      disconnect() {}
    }
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function mockViewportHeight(element: HTMLElement, height: number): void {
  Object.defineProperty(element, "offsetHeight", { value: height, configurable: true });
}
```

```typescript
// append to packages/ng/src/scroller/scroller.spec.ts
it("measures the root viewport element's offsetHeight and computes numItemsInViewport from it, matching real PrimeNG's measured element/property", () => {
  const fixture = TestBed.createComponent(UScroller);
  fixture.componentRef.setInput("items", Array.from({ length: 1000 }, (_, i) => i));
  fixture.componentRef.setInput("itemSize", 20);
  fixture.detectChanges(); // triggers ngAfterViewInit, but offsetHeight is still 0 pre-mock
  const root = fixture.nativeElement.querySelector("[class*=u-scroller]") as HTMLElement;
  mockViewportHeight(root, 200); // a real, deterministic 200px viewport
  fixture.detectChanges();
  // 200 / 20 = 10 whole items fit exactly — asserting the real computed
  // number, not just that some non-zero value exists.
  expect(fixture.nativeElement.getAttribute("data-num-items-in-viewport")).toBe("10");
});

it("renders only the windowed subset of items (first through last), not the full array, given a mocked 200px viewport", () => {
  const fixture = TestBed.createComponent(UScroller);
  fixture.componentRef.setInput("items", Array.from({ length: 1000 }, (_, i) => i));
  fixture.componentRef.setInput("itemSize", 20);
  fixture.detectChanges();
  const root = fixture.nativeElement.querySelector("[class*=u-scroller]") as HTMLElement;
  mockViewportHeight(root, 200);
  fixture.detectChanges();
  const renderedItems = fixture.nativeElement.querySelectorAll("[data-u-scroller-item]");
  // numItemsInViewport=10, numToleratedItems defaults to ceil(10/2)=5,
  // calculateLast(0, 10, 5) = 0 + 10 + 2*5 = 20 (first < numToleratedItems
  // branch), clamped to items.length (1000) -> 20.
  expect(renderedItems.length).toBe(20);
  expect(renderedItems.length).toBeLessThan(1000);
});

it("advances first/last on scroll, given a mocked 200px viewport", () => {
  const fixture = TestBed.createComponent(UScroller);
  fixture.componentRef.setInput("items", Array.from({ length: 1000 }, (_, i) => i));
  fixture.componentRef.setInput("itemSize", 20);
  fixture.detectChanges();
  const root = fixture.nativeElement.querySelector("[class*=u-scroller]") as HTMLElement;
  mockViewportHeight(root, 200);
  fixture.detectChanges();
  const initialFirst = fixture.nativeElement.getAttribute("data-first");
  Object.defineProperty(root, "scrollTop", { value: 2000, writable: true, configurable: true });
  root.dispatchEvent(new Event("scroll"));
  fixture.detectChanges();
  // scrollTop=2000, itemSize=20 -> first = floor(2000/20) = 100
  expect(fixture.nativeElement.getAttribute("data-first")).toBe("100");
  expect(fixture.nativeElement.getAttribute("data-first")).not.toBe(initialFirst);
});

it("renders loader markup with .u-scroller-loader when loading is true", () => {
  const fixture = TestBed.createComponent(UScroller);
  fixture.componentRef.setInput("loading", true);
  fixture.detectChanges();
  expect(fixture.nativeElement.querySelector(".u-scroller-loader")).not.toBeNull();
});

it("does not render loader markup when loading is false or unset", () => {
  const fixture = TestBed.createComponent(UScroller);
  fixture.detectChanges();
  expect(fixture.nativeElement.querySelector(".u-scroller-loader")).toBeNull();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/ng test -- --include='**/scroller.spec.ts'`
Expected: FAIL — no `[data-u-scroller-item]` elements rendered yet; `data-num-items-in-viewport` is `"0"` not `"10"` (measurement not wired to `offsetHeight` yet); no `.u-scroller-loader` element exists yet; `loading` input doesn't exist yet

- [ ] **Step 3: Write minimal implementation**

```typescript
// packages/ng/src/scroller/scroller-style.ts
import { style as virtualscrollerStyle } from "@ultimate/uix-styles/virtualscroller";

const css = /*css*/ `
    ${virtualscrollerStyle}

    .u-scroller {
        overflow: auto;
        position: relative;
    }
    .u-scroller-content {
        position: absolute;
        width: 100%;
    }
    .u-scroller-item {
        position: absolute;
        width: 100%;
    }
    .u-scroller-loader {
        position: sticky;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
`;

const classes = {
  root: () => "u-scroller u-component",
  content: () => "u-scroller-content",
  item: () => "u-scroller-item",
  loader: () => "u-scroller-loader",
};

export const scrollerStyleModule = { css, classes };
```

Rewrite `scroller.ts`:

```typescript
// packages/ng/src/scroller/scroller.ts
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
  input,
} from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { calculateLast, calculateNumItemsInViewport } from "@ultimate/uix-data";
import { scrollerStyleModule } from "./scroller-style";

@Component({
  standalone: true,
  selector: "u-scroller",
  template: `
    <div
      #element
      [class]="cx('root')"
      [attr.data-num-items-in-viewport]="numItemsInViewportComputed"
      [attr.data-last]="last"
      [attr.data-first]="first"
      (scroll)="onScroll()"
    >
      @if (loading()) {
        <div [class]="cx('loader')">
          <span class="u-scroller-loading-icon"></span>
        </div>
      }
      <div
        data-u-scroller-content
        [class]="cx('content')"
        [style.height.px]="items().length * itemSize()"
      >
        @for (item of visibleItems(); track item.index) {
          <div data-u-scroller-item [class]="cx('item')" [style.top.px]="item.index * itemSize()">
            {{ item.value }}
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UScroller extends UBaseComponent implements AfterViewInit, OnDestroy {
  protected override readonly componentName = "scroller";
  protected override readonly styleModule = scrollerStyleModule;

  items = input<unknown[]>([]);
  itemSize = input(0);
  numToleratedItems = input<number | undefined>(undefined);
  loading = input<boolean | undefined>(undefined);

  @ViewChild("element") private elementRef!: ElementRef<HTMLElement>;

  private _contentSize = 0;
  private _first = 0;
  private resizeObserver?: ResizeObserver;

  ngAfterViewInit(): void {
    // Measures the root viewport element's offsetHeight — matching real
    // PrimeNG's elementViewChild.nativeElement.offsetHeight measurement
    // exactly (scroller.ts:854, pinned commit c493b1c6d9f7cdffbe1c4dc195493dd73d733593),
    // not the inner content wrapper and not clientHeight.
    this._contentSize = this.elementRef.nativeElement.offsetHeight;
    this.resizeObserver = new ResizeObserver(() => {
      this._contentSize = this.elementRef.nativeElement.offsetHeight;
    });
    this.resizeObserver.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  protected onScroll(): void {
    const scrollTop = this.elementRef.nativeElement.scrollTop;
    this._first = Math.floor(scrollTop / (this.itemSize() || 1));
  }

  protected get first(): number {
    return this._first;
  }

  protected get numItemsInViewportComputed(): number {
    return calculateNumItemsInViewport(this._contentSize, this.itemSize());
  }

  protected get resolvedNumToleratedItems(): number {
    const explicit = this.numToleratedItems();
    if (explicit !== undefined) {
      return explicit;
    }
    return Math.ceil(this.numItemsInViewportComputed / 2);
  }

  protected get last(): number {
    const rawLast = calculateLast(this._first, this.numItemsInViewportComputed, this.resolvedNumToleratedItems);
    return this.getLast(rawLast);
  }

  protected visibleItems(): { index: number; value: unknown }[] {
    const liveItems = this.items();
    const result: { index: number; value: unknown }[] = [];
    for (let i = this._first; i < this.last; i++) {
      result.push({ index: i, value: liveItems[i] });
    }
    return result;
  }

  private getLast(last = 0, isCols = false): number {
    const liveItems = this.items();
    if (!liveItems) return 0;
    const liveLength = isCols ? liveItems.length : liveItems.length; // isCols branch unreachable in vertical-only scope (Global Constraints)
    return Math.min(liveLength, last);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/ng test -- --include='**/scroller.spec.ts'`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/ng/src/scroller/scroller.ts packages/ng/src/scroller/scroller-style.ts packages/ng/src/scroller/scroller.spec.ts
git commit -m "feat(ng): add UScroller content measurement, virtual item rendering, and loader markup"
```

---

### Task 4: Angular — `scrollTo`/`scrollToIndex` public API, `disabled` passthrough mode

**Files:**
- Modify: `packages/ng/src/scroller/scroller.ts`
- Test: `packages/ng/src/scroller/scroller.spec.ts` (extend)

**Interfaces:**
- Consumes: `elementRef` (Task 3), `itemSize` input (Task 2)
- Produces: public `scrollTo(options: ScrollToOptions): void`, `scrollToIndex(index: number, behavior?: ScrollBehavior): void` methods (matching spec §11's confirmed method names); `disabled = input(false)` input — consumed by Task 5's Vue/React parity check (naming only, not shared code) and by future Table composition

- [ ] **Step 1: Write the failing test**

```typescript
// append to packages/ng/src/scroller/scroller.spec.ts
it("scrollTo calls the native Element.scrollTo with the given options", () => {
  const fixture = TestBed.createComponent(UScroller);
  fixture.componentRef.setInput("items", Array.from({ length: 100 }, (_, i) => i));
  fixture.componentRef.setInput("itemSize", 20);
  fixture.detectChanges();
  const root = fixture.nativeElement.querySelector("[data-u-scroller-content]").parentElement as HTMLElement;
  const scrollToSpy = vi.fn();
  root.scrollTo = scrollToSpy;
  fixture.componentInstance.scrollTo({ top: 100 });
  expect(scrollToSpy).toHaveBeenCalledWith({ top: 100 });
});

it("scrollToIndex computes the target position from index * itemSize", () => {
  const fixture = TestBed.createComponent(UScroller);
  fixture.componentRef.setInput("items", Array.from({ length: 100 }, (_, i) => i));
  fixture.componentRef.setInput("itemSize", 20);
  fixture.detectChanges();
  const root = fixture.nativeElement.querySelector("[data-u-scroller-content]").parentElement as HTMLElement;
  const scrollToSpy = vi.fn();
  root.scrollTo = scrollToSpy;
  fixture.componentInstance.scrollToIndex(10);
  expect(scrollToSpy).toHaveBeenCalledWith({ top: 200, behavior: "auto" });
});

it("disabled mode renders all items with zero virtualization", () => {
  const fixture = TestBed.createComponent(UScroller);
  fixture.componentRef.setInput("items", Array.from({ length: 50 }, (_, i) => i));
  fixture.componentRef.setInput("itemSize", 20);
  fixture.componentRef.setInput("disabled", true);
  fixture.detectChanges();
  const renderedItems = fixture.nativeElement.querySelectorAll("[data-u-scroller-item]");
  expect(renderedItems.length).toBe(50);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/ng test -- --include='**/scroller.spec.ts'`
Expected: FAIL — `scrollTo is not a function` / `scrollToIndex is not a function`

- [ ] **Step 3: Write minimal implementation**

```typescript
// add to UScroller class body in scroller.ts, alongside the existing input()s
disabled = input(false);
```

```typescript
// add to UScroller class body
scrollTo(options: ScrollToOptions): void {
  this.elementRef.nativeElement.scrollTo(options);
}

scrollToIndex(index: number, behavior: ScrollBehavior = "auto"): void {
  this.scrollTo({ top: index * this.itemSize(), behavior });
}
```

Update `visibleItems()` to check `disabled()`:

```typescript
// replace visibleItems() in scroller.ts
protected visibleItems(): { index: number; value: unknown }[] {
  const liveItems = this.items();
  if (this.disabled()) {
    return liveItems.map((value, index) => ({ index, value }));
  }
  const result: { index: number; value: unknown }[] = [];
  for (let i = this._first; i < this.last; i++) {
    result.push({ index: i, value: liveItems[i] });
  }
  return result;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/ng test -- --include='**/scroller.spec.ts'`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/ng/src/scroller/scroller.ts packages/ng/src/scroller/scroller.spec.ts
git commit -m "feat(ng): add UScroller scrollTo/scrollToIndex and disabled passthrough mode"
```

---

### Task 5: Angular — lazy-load mechanics, `aria-busy`, `index.ts` export

**Files:**
- Modify: `packages/ng/src/scroller/scroller.ts`
- Create: `packages/ng/src/scroller/index.ts`
- Test: `packages/ng/src/scroller/scroller.spec.ts` (extend)

**Interfaces:**
- Consumes: `first`/`last` (Task 3); `loading` input (Task 3, where it was introduced alongside loader markup — this task only adds the `aria-busy` attribute binding, it does not redeclare the input)
- Produces: `lazy = input(false)` input; `onLazyLoad = output<{ first: number; last: number }>()` output, deferred via `Promise.resolve().then(...)` per spec §10; `[attr.aria-busy]` binding on the root; `UScroller` fully exported from `packages/ng/src/scroller/index.ts` — consumed by `packages/ng/src/index.ts` (Task 6)

- [ ] **Step 1: Write the failing test**

Uses Task 3's `mockViewportHeight` helper and `beforeEach` `ResizeObserver` stub (already established in this file) for a deterministic 200px viewport, matching the same measured-dimension pattern as Task 3's tests:

```typescript
// append to packages/ng/src/scroller/scroller.spec.ts
it("fires onLazyLoad with {first, last} after a scroll-triggered window change, when lazy is true", async () => {
  const fixture = TestBed.createComponent(UScroller);
  fixture.componentRef.setInput("items", Array.from({ length: 1000 }, (_, i) => i));
  fixture.componentRef.setInput("itemSize", 20);
  fixture.componentRef.setInput("lazy", true);
  fixture.detectChanges();
  const root = fixture.nativeElement.querySelector("[class*=u-scroller]") as HTMLElement;
  mockViewportHeight(root, 200);
  fixture.detectChanges();
  let emitted: unknown;
  fixture.componentInstance.onLazyLoad.subscribe((e: unknown) => (emitted = e));
  Object.defineProperty(root, "scrollTop", { value: 2000, writable: true, configurable: true });
  root.dispatchEvent(new Event("scroll"));
  fixture.detectChanges();
  await Promise.resolve(); // matches the real Promise.resolve().then() deferral, spec §10
  // first = floor(2000/20) = 100; numItemsInViewport=10, numToleratedItems=5,
  // calculateLast(100, 10, 5) = 100+10+3*5=125 (first >= numToleratedItems
  // branch), clamped to items.length (1000) -> 125.
  expect(emitted).toEqual({ first: 100, last: 125 });
});

it("does not fire onLazyLoad when lazy is false", async () => {
  const fixture = TestBed.createComponent(UScroller);
  fixture.componentRef.setInput("items", Array.from({ length: 1000 }, (_, i) => i));
  fixture.componentRef.setInput("itemSize", 20);
  fixture.detectChanges();
  const root = fixture.nativeElement.querySelector("[class*=u-scroller]") as HTMLElement;
  mockViewportHeight(root, 200);
  fixture.detectChanges();
  let emitted: unknown;
  fixture.componentInstance.onLazyLoad.subscribe((e: unknown) => (emitted = e));
  Object.defineProperty(root, "scrollTop", { value: 2000, writable: true, configurable: true });
  root.dispatchEvent(new Event("scroll"));
  fixture.detectChanges();
  await Promise.resolve();
  expect(emitted).toBeUndefined();
});

it("sets aria-busy=true on the root while loading is true", () => {
  const fixture = TestBed.createComponent(UScroller);
  fixture.componentRef.setInput("loading", true);
  fixture.detectChanges();
  expect(fixture.nativeElement.querySelector("[class*=u-scroller]").getAttribute("aria-busy")).toBe("true");
});

it("does not set aria-busy when loading is false or unset", () => {
  const fixture = TestBed.createComponent(UScroller);
  fixture.detectChanges();
  expect(fixture.nativeElement.querySelector("[class*=u-scroller]").hasAttribute("aria-busy")).toBe(false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/ng test -- --include='**/scroller.spec.ts'`
Expected: FAIL — `onLazyLoad` undefined / `aria-busy` not rendered

- [ ] **Step 3: Write minimal implementation**

```typescript
// add to UScroller class body in scroller.ts (loading is already declared, from Task 3)
lazy = input(false);

onLazyLoad = output<{ first: number; last: number }>();
```

Update `onScroll()` to fire lazy-load after recomputing the window:

```typescript
// replace onScroll() in scroller.ts
protected onScroll(): void {
  const scrollTop = this.elementRef.nativeElement.scrollTop;
  const newFirst = Math.floor(scrollTop / (this.itemSize() || 1));
  if (newFirst !== this._first) {
    this._first = newFirst;
    if (this.lazy()) {
      const first = this._first;
      const last = this.last;
      Promise.resolve().then(() => {
        this.onLazyLoad.emit({ first, last });
      });
    }
  }
}
```

Update the template's root `<div>` to bind `aria-busy`:

```html
<div
  #element
  [class]="cx('root')"
  [attr.data-num-items-in-viewport]="numItemsInViewportComputed"
  [attr.data-last]="last"
  [attr.data-first]="first"
  [attr.aria-busy]="loading() ? 'true' : null"
  (scroll)="onScroll()"
>
```

```typescript
// packages/ng/src/scroller/index.ts
export { UScroller } from "./scroller";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/ng test -- --include='**/scroller.spec.ts'`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/ng/src/scroller/scroller.ts packages/ng/src/scroller/index.ts packages/ng/src/scroller/scroller.spec.ts
git commit -m "feat(ng): add UScroller lazy-load mechanics and aria-busy"
```

---

### Task 6: Angular — wire into package barrel and secondary entry point

**Files:**
- Modify: `packages/ng/src/index.ts`
- Modify: `packages/ng/package.json` (`description` field)
- Test: `packages/ng/src/scroller/scroller.spec.ts` (extend — package/export smoke test)

**Interfaces:**
- Consumes: `UScroller` from `./scroller` (Task 5)
- Produces: `UScroller` importable from `@ultimate/ng`'s root entry

- [ ] **Step 1: Write the failing test**

```typescript
// append to packages/ng/src/scroller/scroller.spec.ts
import { UScroller as RootExport } from "../index";

it("is exported from the package root barrel", () => {
  expect(RootExport).toBe(UScroller);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/ng test -- --include='**/scroller.spec.ts'`
Expected: FAIL — `RootExport` is `undefined`

- [ ] **Step 3: Write minimal implementation**

Read `packages/ng/src/index.ts` first to confirm the existing re-export pattern, then add:

```typescript
// add one line to packages/ng/src/index.ts, matching its existing per-component export style
export * from "./scroller";
```

Update `packages/ng/package.json`'s `"description"` field to include "Scroller" in the alphabetically-ordered component list (matching the pattern already established when Paginator was added).

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/ng test -- --include='**/scroller.spec.ts'`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/ng/src/index.ts packages/ng/package.json packages/ng/src/scroller/scroller.spec.ts
git commit -m "feat(ng): export UScroller from package root"
```

---

## Task Group C — React (`@ultimate/react`)

### Task 7: Scaffold `UScroller` — controlled `items`/`itemSize`, internal derived-window `useState`, `calculateNumItemsInViewport`/`calculateLast`/`getLast` consumption

**Files:**
- Create: `packages/react/src/scroller/scroller.tsx`
- Test: `packages/react/src/scroller/scroller.spec.tsx`

**Interfaces:**
- Consumes: `calculateNumItemsInViewport`, `calculateLast` from `@ultimate/uix-data`; `useComponentBase` from `@ultimate/react-core`
- Produces: `UScrollerProps { items: unknown[]; itemSize: number; numToleratedItems?: number; disabled?: boolean; lazy?: boolean; loading?: boolean; onLazyLoad?: (event: { first: number; last: number }) => void }`; `UScroller: React.FC<UScrollerProps>` — root `<div>` carries `data-num-items-in-viewport`/`data-last` attributes reflecting the internally computed values (the same cross-framework DOM-observable-proxy convention Paginator's Task 7 established) — consumed by Task 8

- [ ] **Step 1: Write the failing test**

This task's scope is state computation only (`numItemsInViewport`/`last`, derived from `calculateNumItemsInViewport`/`calculateLast`/`getLast`) — no item rendering happens until Task 8. The test therefore asserts against the `data-*` attributes the scaffold exposes for exactly that reason, not against rendered item elements that don't exist yet:

```tsx
// packages/react/src/scroller/scroller.spec.tsx
/// <reference types="@testing-library/jest-dom" />
import * as React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { UScroller } from "./scroller";

describe("UScroller", () => {
  it("clamps last (getLast) against the live items array length, per spec §9", () => {
    const { container } = render(
      <UScroller items={Array.from({ length: 5 }, (_, i) => i)} itemSize={20} numToleratedItems={50} />
    );
    expect(container.querySelector("[data-last]")?.getAttribute("data-last")).toBe("5");
  });

  it("returns 0 for last when items is empty", () => {
    const { container } = render(<UScroller items={[]} itemSize={20} />);
    expect(container.querySelector("[data-last]")?.getAttribute("data-last")).toBe("0");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/react test -- scroller.spec.tsx`
Expected: FAIL — `Cannot find module './scroller'`

- [ ] **Step 3: Write minimal implementation**

```tsx
// packages/react/src/scroller/scroller.tsx
import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { calculateLast, calculateNumItemsInViewport } from "@ultimate/uix-data";
import { scrollerStyleModule } from "./scroller-style";

export interface UScrollerProps {
  items: unknown[];
  itemSize: number;
  numToleratedItems?: number;
  disabled?: boolean;
  lazy?: boolean;
  loading?: boolean;
  onLazyLoad?: (event: { first: number; last: number }) => void;
}

function getLast(items: unknown[], last = 0, isCols = false): number {
  if (!items) return 0;
  const liveLength = isCols ? items.length : items.length; // isCols branch unreachable in vertical-only scope (Global Constraints)
  return Math.min(liveLength, last);
}

export const UScroller: React.FC<UScrollerProps> = ({ items, itemSize, numToleratedItems: numToleratedItemsProp }) => {
  const { cx } = useComponentBase({ componentName: "scroller", styleModule: scrollerStyleModule });

  const [firstState] = React.useState(0);
  const [contentSizeState] = React.useState(0); // real measurement lands in Task 8

  const numItemsInViewport = calculateNumItemsInViewport(contentSizeState, itemSize);
  // numToleratedItems is honored from day one — an explicit override always
  // takes effect, it is never silently hardcoded to a half-viewport default
  // regardless of what the caller passed, even though this task's own
  // contentSizeState is always 0 (so numItemsInViewport is always 0 until
  // Task 8's real measurement lands).
  const numToleratedItems =
    numToleratedItemsProp !== undefined ? numToleratedItemsProp : Math.ceil(numItemsInViewport / 2);
  const rawLast = calculateLast(firstState, numItemsInViewport, numToleratedItems);
  const last = getLast(items, rawLast);

  return <div className={cx("root")} data-num-items-in-viewport={numItemsInViewport} data-last={last} />;
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/react test -- scroller.spec.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/scroller/scroller.tsx packages/react/src/scroller/scroller.spec.tsx
git commit -m "feat(react): scaffold UScroller with uix-data virtualization consumption"
```

---

### Task 8: React — style module, content measurement, virtual item rendering, loader markup

**Files:**
- Modify: `packages/react/src/scroller/scroller.tsx`
- Create: `packages/react/src/scroller/scroller-style.ts`
- Test: `packages/react/src/scroller/scroller.spec.tsx` (extend)

**Measurement architecture — verified against real PrimeReact source** (`components/lib/virtualscroller/VirtualScroller.js`, pinned commit `d0f574e39122668292fc7a740f081bae1b93b1e9`, lines 185-186): identical to Angular's real PrimeNG contract — `elementRef.current.offsetHeight` (the root/viewport element, minus content position offset), not `clientHeight`, and not the content wrapper. No `ResizeObserver` in real PrimeReact source either (same window-resize-listener pattern as Angular). This task uses `ResizeObserver` anyway (a legitimate modern choice, not a strict provenance requirement — see Task 3's identical note), but the measured element/property must match real upstream: `offsetHeight` on the root ref, mirroring Task 3's Angular fix exactly.

**Interfaces:**
- Consumes: `style` from `@ultimate/uix-styles/virtualscroller` (Task 1); `numToleratedItemsProp` handling (Task 7, already correctly implemented there — this task only replaces the `contentSizeState` measurement source, it does not reintroduce or duplicate the override logic)
- Produces: real `useRef`-based content-size measurement of `offsetHeight` (`ResizeObserver`); `firstState` real internal `useState`, driven by scroll (replacing Task 7's stubbed `0`); rendered item subset; conditional loader markup (`.u-scroller-loader`/`.u-scroller-loading-icon`) shown while `loading` prop is true — consumed by Task 9's `scrollTo`/`scrollToIndex` and Task 14's cross-framework loader-token verification (this task, not Task 14, is where the loader markup that makes the loader CSS selector actually present is implemented)

- [ ] **Step 1: Write the failing test**

Deterministic layout mocking, matching Task 3's Angular seam: jsdom has no real layout, so `offsetHeight` is `0` unless stubbed, and no `ResizeObserver` exists globally. This defines the shared React test seam (used again by Task 9):

```tsx
// prepend to packages/react/src/scroller/scroller.spec.tsx, inside the
// existing describe("UScroller", () => { ... }) block
let resizeObserverCallback: ResizeObserverCallback | undefined;

beforeEach(() => {
  resizeObserverCallback = undefined;
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(cb: ResizeObserverCallback) {
        resizeObserverCallback = cb;
      }
      observe(target: Element) {
        resizeObserverCallback?.([{ target } as ResizeObserverEntry], this as unknown as ResizeObserver);
      }
      disconnect() {}
    }
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  cleanup();
});

function mockViewportHeight(element: HTMLElement, height: number): void {
  Object.defineProperty(element, "offsetHeight", { value: height, configurable: true });
}
```

```tsx
// append to packages/react/src/scroller/scroller.spec.tsx
it("measures the root viewport element's offsetHeight and computes numItemsInViewport from it, matching real PrimeReact's measured element/property", () => {
  const { container, rerender } = render(
    <UScroller items={Array.from({ length: 1000 }, (_, i) => i)} itemSize={20} />
  );
  const root = container.firstChild as HTMLElement;
  mockViewportHeight(root, 200);
  rerender(<UScroller items={Array.from({ length: 1000 }, (_, i) => i)} itemSize={20} />);
  // The ResizeObserver mock's synchronous observe() callback fires once on
  // mount, before offsetHeight is stubbed post-render — a real re-render
  // (or, in this component, the mocked observer firing again) is needed to
  // read the now-stubbed value. See Step 3's implementation: the effect
  // re-reads offsetHeight on every ResizeObserver callback, so triggering
  // one more observation is what surfaces the mocked height.
  const observer = new ResizeObserver(() => {});
  observer.observe(root);
  expect(root.getAttribute("data-num-items-in-viewport")).toBe("10");
});

it("renders only the windowed subset of items, not the full array, given a mocked 200px viewport", () => {
  const { container } = render(<UScroller items={Array.from({ length: 1000 }, (_, i) => i)} itemSize={20} />);
  const root = container.firstChild as HTMLElement;
  mockViewportHeight(root, 200);
  const observer = new ResizeObserver(() => {});
  observer.observe(root);
  const renderedItems = container.querySelectorAll("[data-u-scroller-item]");
  // numItemsInViewport=10, numToleratedItems defaults to ceil(10/2)=5,
  // calculateLast(0, 10, 5) = 0+10+2*5=20, clamped to items.length (1000) -> 20.
  expect(renderedItems.length).toBe(20);
});

it("renders loader markup with .u-scroller-loader when loading is true", () => {
  const { container } = render(<UScroller items={[]} itemSize={20} loading />);
  expect(container.querySelector(".u-scroller-loader")).not.toBeNull();
});

it("does not render loader markup when loading is false or unset", () => {
  const { container } = render(<UScroller items={[]} itemSize={20} />);
  expect(container.querySelector(".u-scroller-loader")).toBeNull();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/react test -- scroller.spec.tsx`
Expected: FAIL — no `[data-u-scroller-item]` elements rendered yet; `data-num-items-in-viewport` stays `"0"` (Task 7's scaffold has no real measurement at all yet — `contentSizeState` is a fixed `React.useState(0)` stub, not wired to any DOM read); no `.u-scroller-loader` element exists yet

- [ ] **Step 3: Write minimal implementation**

```typescript
// packages/react/src/scroller/scroller-style.ts
import { style as virtualscrollerStyle } from "@ultimate/uix-styles/virtualscroller";

const css = /*css*/ `
    ${virtualscrollerStyle}

    .u-scroller {
        overflow: auto;
        position: relative;
    }
    .u-scroller-content {
        position: absolute;
        width: 100%;
    }
    .u-scroller-item {
        position: absolute;
        width: 100%;
    }
    .u-scroller-loader {
        position: sticky;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
`;

const classes = {
  root: () => "u-scroller u-component",
  content: () => "u-scroller-content",
  item: () => "u-scroller-item",
  loader: () => "u-scroller-loader",
};

export const scrollerStyleModule = { css, classes };
```

Rewrite `scroller.tsx`'s body:

```tsx
// replace the UScroller function body in packages/react/src/scroller/scroller.tsx
export const UScroller = React.forwardRef<HTMLDivElement, UScrollerProps>((props, forwardedRef) => {
  const { items, itemSize, numToleratedItems: numToleratedItemsProp, disabled = false, loading } = props;
  const { cx } = useComponentBase({ componentName: "scroller", styleModule: scrollerStyleModule });

  const elementRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(forwardedRef, () => elementRef.current as HTMLDivElement);

  const [contentSizeState, setContentSizeState] = React.useState(0);
  const [firstState, setFirstState] = React.useState(0);

  React.useEffect(() => {
    const el = elementRef.current;
    if (!el) return;
    // Measures the root viewport element's offsetHeight — matching real
    // PrimeReact's elementRef.current.offsetHeight measurement exactly
    // (VirtualScroller.js:186, pinned commit d0f574e39122668292fc7a740f081bae1b93b1e9),
    // not clientHeight.
    setContentSizeState(el.offsetHeight);
    const observer = new ResizeObserver(() => setContentSizeState(el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const numItemsInViewport = calculateNumItemsInViewport(contentSizeState, itemSize);
  const numToleratedItems =
    numToleratedItemsProp !== undefined ? numToleratedItemsProp : Math.ceil(numItemsInViewport / 2);
  const rawLast = calculateLast(firstState, numItemsInViewport, numToleratedItems);
  const last = getLast(items, rawLast);

  const visibleItems = disabled
    ? items.map((value, index) => ({ index, value }))
    : Array.from({ length: Math.max(0, last - firstState) }, (_, i) => ({
        index: firstState + i,
        value: items[firstState + i],
      }));

  const handleScroll = () => {
    const el = elementRef.current;
    if (!el) return;
    const newFirst = Math.floor(el.scrollTop / (itemSize || 1));
    if (newFirst !== firstState) {
      setFirstState(newFirst);
    }
  };

  return (
    <div
      ref={elementRef}
      className={cx("root") as string}
      data-num-items-in-viewport={numItemsInViewport}
      data-last={last}
      data-first={firstState}
      onScroll={handleScroll}
    >
      {loading ? (
        <div className={cx("loader") as string}>
          <span className="u-scroller-loading-icon" />
        </div>
      ) : null}
      <div data-u-scroller-content className={cx("content") as string} style={{ height: items.length * itemSize }}>
        {visibleItems.map(({ index, value }) => (
          <div
            key={index}
            data-u-scroller-item
            className={cx("item") as string}
            style={{ top: index * itemSize }}
          >
            {String(value)}
          </div>
        ))}
      </div>
    </div>
  );
});
UScroller.displayName = "UScroller";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/react test -- scroller.spec.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/scroller/scroller.tsx packages/react/src/scroller/scroller-style.ts packages/react/src/scroller/scroller.spec.tsx
git commit -m "feat(react): add UScroller content measurement, virtual item rendering, and loader markup"
```

---

### Task 9: React — `scrollTo`/`scrollToIndex` public API (via `useImperativeHandle`), `disabled` passthrough mode, lazy-load, `aria-busy`

**Files:**
- Modify: `packages/react/src/scroller/scroller.tsx`
- Test: `packages/react/src/scroller/scroller.spec.tsx` (extend)

**Interfaces:**
- Consumes: `elementRef` (Task 8)
- Produces: `UScrollerHandle { scrollTo(options: ScrollToOptions): void; scrollToIndex(index: number, behavior?: ScrollBehavior): void }` exposed via `React.useImperativeHandle` (matching spec §4.2's confirmed public-methods mechanism); `onLazyLoad` firing, deferred via `Promise.resolve().then(...)`; `aria-busy` binding

- [ ] **Step 1: Write the failing test**

Uses Task 8's `mockViewportHeight` helper and `beforeEach` `ResizeObserver` stub for the lazy-load test's deterministic window advance:

```tsx
// append to packages/react/src/scroller/scroller.spec.tsx
import { createRef } from "react";
import type { UScrollerHandle } from "./scroller";

it("disabled mode renders all items with zero virtualization", () => {
  const { container } = render(
    <UScroller items={Array.from({ length: 50 }, (_, i) => i)} itemSize={20} disabled />
  );
  expect(container.querySelectorAll("[data-u-scroller-item]").length).toBe(50);
});

it("exposes scrollTo/scrollToIndex via ref", () => {
  const ref = createRef<UScrollerHandle>();
  const { container } = render(
    <UScroller ref={ref} items={Array.from({ length: 100 }, (_, i) => i)} itemSize={20} />
  );
  const root = container.firstChild as HTMLElement;
  const scrollToSpy = vi.fn();
  root.scrollTo = scrollToSpy;
  ref.current?.scrollToIndex(10);
  expect(scrollToSpy).toHaveBeenCalledWith({ top: 200, behavior: "auto" });
});

it("sets aria-busy=true on the root while loading is true", () => {
  const { container } = render(<UScroller items={[]} itemSize={20} loading />);
  expect((container.firstChild as HTMLElement).getAttribute("aria-busy")).toBe("true");
});

it("fires onLazyLoad with {first, last} after a scroll-triggered window change, when lazy is true, given a mocked 200px viewport", async () => {
  const onLazyLoad = vi.fn();
  const { container } = render(
    <UScroller items={Array.from({ length: 1000 }, (_, i) => i)} itemSize={20} lazy onLazyLoad={onLazyLoad} />
  );
  const root = container.firstChild as HTMLElement;
  mockViewportHeight(root, 200);
  const observer = new ResizeObserver(() => {});
  observer.observe(root);
  Object.defineProperty(root, "scrollTop", { value: 2000, writable: true, configurable: true });
  root.dispatchEvent(new Event("scroll"));
  await Promise.resolve();
  // first = floor(2000/20) = 100; numItemsInViewport=10, numToleratedItems=5,
  // calculateLast(100, 10, 5) = 100+10+3*5=125, clamped to items.length
  // (1000) -> 125.
  expect(onLazyLoad).toHaveBeenCalledWith({ first: 100, last: 125 });
});

it("does not fire onLazyLoad when lazy is false", async () => {
  const onLazyLoad = vi.fn();
  const { container } = render(
    <UScroller items={Array.from({ length: 1000 }, (_, i) => i)} itemSize={20} onLazyLoad={onLazyLoad} />
  );
  const root = container.firstChild as HTMLElement;
  Object.defineProperty(root, "scrollTop", { value: 2000, writable: true, configurable: true });
  root.dispatchEvent(new Event("scroll"));
  await Promise.resolve();
  expect(onLazyLoad).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/react test -- scroller.spec.tsx`
Expected: FAIL — `ref.current` has no `scrollToIndex`; `disabled` not honored yet; `aria-busy` not rendered; `onLazyLoad` never called

- [ ] **Step 3: Write minimal implementation**

```tsx
// replace the UScroller definition in packages/react/src/scroller/scroller.tsx
export interface UScrollerHandle {
  scrollTo: (options: ScrollToOptions) => void;
  scrollToIndex: (index: number, behavior?: ScrollBehavior) => void;
}

export const UScroller = React.forwardRef<UScrollerHandle, UScrollerProps>((props, forwardedRef) => {
  const { items, itemSize, numToleratedItems: numToleratedItemsProp, disabled = false, lazy = false, loading, onLazyLoad } = props;
  const { cx } = useComponentBase({ componentName: "scroller", styleModule: scrollerStyleModule });

  const elementRef = React.useRef<HTMLDivElement>(null);

  const [contentSizeState, setContentSizeState] = React.useState(0);
  const [firstState, setFirstState] = React.useState(0);

  React.useImperativeHandle(forwardedRef, () => ({
    scrollTo: (options: ScrollToOptions) => elementRef.current?.scrollTo(options),
    scrollToIndex: (index: number, behavior: ScrollBehavior = "auto") =>
      elementRef.current?.scrollTo({ top: index * itemSize, behavior }),
  }));

  React.useEffect(() => {
    const el = elementRef.current;
    if (!el) return;
    // Same offsetHeight-based measurement established in Task 8 — unchanged
    // here, this task only adds scrollTo/lazy-load/aria-busy around it.
    setContentSizeState(el.offsetHeight);
    const observer = new ResizeObserver(() => setContentSizeState(el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const numItemsInViewport = calculateNumItemsInViewport(contentSizeState, itemSize);
  const numToleratedItems =
    numToleratedItemsProp !== undefined ? numToleratedItemsProp : Math.ceil(numItemsInViewport / 2);
  const rawLast = calculateLast(firstState, numItemsInViewport, numToleratedItems);
  const last = getLast(items, rawLast);

  const visibleItems = disabled
    ? items.map((value, index) => ({ index, value }))
    : Array.from({ length: Math.max(0, last - firstState) }, (_, i) => ({
        index: firstState + i,
        value: items[firstState + i],
      }));

  const handleScroll = () => {
    const el = elementRef.current;
    if (!el) return;
    const newFirst = Math.floor(el.scrollTop / (itemSize || 1));
    if (newFirst !== firstState) {
      setFirstState(newFirst);
      if (lazy && onLazyLoad) {
        const first = newFirst;
        const currentLast = getLast(items, calculateLast(first, numItemsInViewport, numToleratedItems));
        Promise.resolve().then(() => onLazyLoad({ first, last: currentLast }));
      }
    }
  };

  return (
    <div
      ref={elementRef}
      className={cx("root") as string}
      data-num-items-in-viewport={numItemsInViewport}
      data-last={last}
      data-first={firstState}
      aria-busy={loading ? "true" : undefined}
      onScroll={handleScroll}
    >
      {loading ? (
        <div className={cx("loader") as string}>
          <span className="u-scroller-loading-icon" />
        </div>
      ) : null}
      <div data-u-scroller-content className={cx("content") as string} style={{ height: items.length * itemSize }}>
        {visibleItems.map(({ index, value }) => (
          <div key={index} data-u-scroller-item className={cx("item") as string} style={{ top: index * itemSize }}>
            {String(value)}
          </div>
        ))}
      </div>
    </div>
  );
});
UScroller.displayName = "UScroller";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/react test -- scroller.spec.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/scroller/scroller.tsx packages/react/src/scroller/scroller.spec.tsx
git commit -m "feat(react): add UScroller scrollTo/scrollToIndex, disabled mode, lazy-load, aria-busy"
```

---

### Task 10: React — package export, `index.ts`, root barrel, `tsup` entry

**Files:**
- Create: `packages/react/src/scroller/index.ts`
- Modify: `packages/react/src/index.ts`
- Modify: `packages/react/tsup.config.ts`
- Modify: `packages/react/package.json` (`exports` map + `description`)
- Test: `packages/react/src/scroller/scroller.spec.tsx` (extend — package/export smoke test)

**Interfaces:**
- Consumes: `UScroller` from `./scroller` (Task 9)
- Produces: `UScroller` importable from both `@ultimate/react` and `@ultimate/react/scroller`

- [ ] **Step 1: Write the failing test**

```tsx
// append to packages/react/src/scroller/scroller.spec.tsx
import { UScroller as SubpathExport } from "./index";

it("is exported from its own subpath index", () => {
  expect(SubpathExport).toBe(UScroller);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/react test -- scroller.spec.tsx`
Expected: FAIL — `Cannot find module './index'`

- [ ] **Step 3: Write minimal implementation**

```typescript
// packages/react/src/scroller/index.ts
export { UScroller } from "./scroller";
export type { UScrollerProps, UScrollerHandle } from "./scroller";
```

Read `packages/react/src/index.ts` to confirm its existing re-export pattern, then add:

```typescript
// add one line to packages/react/src/index.ts, matching its existing per-component export style
export * from "./scroller";
```

Add a `"scroller/index": "src/scroller/index.ts"` entry to `packages/react/tsup.config.ts`'s `entry` object, matching the existing entries exactly.

Add a `"./scroller"` entry to `packages/react/package.json`'s `exports` map, matching the existing `"./paginator"` entry's exact shape. Update `"description"` to include "Scroller" in the alphabetically-ordered component list.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/react test -- scroller.spec.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/scroller/index.ts packages/react/src/index.ts packages/react/tsup.config.ts packages/react/package.json packages/react/src/scroller/scroller.spec.tsx
git commit -m "feat(react): export UScroller from package root and dedicated subpath"
```

---

## Task Group D — Vue (`@ultimate/vue`)

### Task 11: Scaffold `UScroller` — `createBaseComponent`, internal `first`/`last`/`numItemsInViewport` reactive data, `calculateNumItemsInViewport`/`calculateLast`/`getLast` consumption

**Files:**
- Create: `packages/vue/src/scroller/base-scroller.ts`
- Create: `packages/vue/src/scroller/Scroller.vue`
- Create: `packages/vue/src/scroller/scroller-style.ts`
- Test: `packages/vue/src/scroller/scroller.spec.ts`

(`packages/vue/src/scroller/index.ts` does not exist yet — package/subpath export wiring is Task 13's concern, matching Angular's Task 2/5 and React's Task 7/10 split, and Paginator's own Task 10/12 split. This task tests `Scroller.vue` directly, the same way Task 2 (Angular) and Task 7 (React) test their own component module directly before any barrel/index exists.)

**Interfaces:**
- Consumes: `calculateNumItemsInViewport`, `calculateLast` from `@ultimate/uix-data`; `createBaseComponent` from `@ultimate/vue-core`; `style` from `@ultimate/uix-styles/virtualscroller` (Task 1 — the real port, not a placeholder; this task only needs the `root`/`content` class slots, extended with `item` in Task 12)
- Produces: `UScroller` SFC with props `items: { type: Array, default: () => [] }`, `itemSize: { type: Number, default: 0 }`, `numToleratedItems: { type: Number, default: null }`; internal `data()` fields `first`, `last`, `numItemsInViewport`, `contentSize` — consumed by Task 12

- [ ] **Step 1: Write the failing test**

```typescript
// packages/vue/src/scroller/scroller.spec.ts
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import UScroller from "./Scroller.vue";

describe("UScroller", () => {
  it("clamps last (getLast) against the live items array length, per spec §9", () => {
    const wrapper = mount(UScroller, {
      props: { items: Array.from({ length: 5 }, (_, i) => i), itemSize: 20, numToleratedItems: 50 },
    });
    expect(wrapper.attributes("data-last")).toBe("5");
  });

  it("returns 0 for last when items is empty", () => {
    const wrapper = mount(UScroller, { props: { items: [], itemSize: 20 } });
    expect(wrapper.attributes("data-last")).toBe("0");
  });

  it("initializes internal first/last/numItemsInViewport as reactive data, not props", () => {
    const wrapper = mount(UScroller, {
      props: { items: Array.from({ length: 100 }, (_, i) => i), itemSize: 20 },
    });
    expect(typeof (wrapper.vm as unknown as { first: number }).first).toBe("number");
    // Confirms these are NOT props: the component definition below has no
    // `first`/`last`/`numItemsInViewport` entries in its `props` object.
    expect((wrapper.vm.$options as { props?: Record<string, unknown> }).props?.first).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/vue test -- scroller.spec.ts`
Expected: FAIL — `Cannot find module './Scroller.vue'`

- [ ] **Step 3: Write minimal implementation**

```typescript
// packages/vue/src/scroller/scroller-style.ts
import { style as virtualscrollerStyle } from "@ultimate/uix-styles/virtualscroller";

const css = /*css*/ `
    ${virtualscrollerStyle}

    .u-scroller {
        overflow: auto;
        position: relative;
    }
    .u-scroller-content {
        position: absolute;
        width: 100%;
    }
`;

// Only the two slots this task's template actually renders (root, content).
// Task 12 extends this same object with an `item` slot when it adds virtual
// item rendering — this is the real, final style-source wiring from day
// one, not a value later thrown away; nothing here is a placeholder.
const classes = {
  root: () => "u-scroller u-component",
  content: () => "u-scroller-content",
};

export const scrollerStyleModule = { css, classes };
```

```typescript
// packages/vue/src/scroller/base-scroller.ts
import { createBaseComponent } from "@ultimate/vue-core";
import { scrollerStyleModule } from "./scroller-style";
import type { ComponentOptions } from "vue";

export function createBaseScroller(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "scroller", styleModule: scrollerStyleModule }),
    props: {
      items: { type: Array, default: () => [] },
      itemSize: { type: Number, default: 0 },
      numToleratedItems: { type: Number, default: null },
    },
  };
}
```

```vue
<!-- packages/vue/src/scroller/Scroller.vue -->
<template>
  <div :class="cx('root')" :data-num-items-in-viewport="numItemsInViewport" :data-last="last">
    <div :class="cx('content')" data-u-scroller-content></div>
  </div>
</template>

<script>
import { createBaseScroller } from "./base-scroller";
import { calculateLast, calculateNumItemsInViewport } from "@ultimate/uix-data";

export default {
  name: "UScroller",
  extends: createBaseScroller(),
  data() {
    return {
      first: 0,
      last: 0,
      numItemsInViewport: 0,
      contentSize: 0,
    };
  },
  computed: {
    resolvedNumToleratedItems() {
      return this.numToleratedItems !== null ? this.numToleratedItems : Math.ceil(this.numItemsInViewport / 2);
    },
  },
  watch: {
    items: {
      immediate: true,
      handler() {
        this.recompute();
      },
    },
    itemSize: {
      handler() {
        this.recompute();
      },
    },
  },
  methods: {
    recompute() {
      this.numItemsInViewport = calculateNumItemsInViewport(this.contentSize, this.itemSize);
      const rawLast = calculateLast(this.first, this.numItemsInViewport, this.resolvedNumToleratedItems);
      this.last = this.getLast(rawLast);
    },
    getLast(last = 0, isCols = false) {
      if (!this.items) return 0;
      const liveLength = isCols ? this.items.length : this.items.length; // isCols branch unreachable in vertical-only scope (Global Constraints)
      return Math.min(liveLength, last);
    },
  },
};
</script>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/vue test -- scroller.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/vue/src/scroller/base-scroller.ts packages/vue/src/scroller/Scroller.vue packages/vue/src/scroller/scroller-style.ts packages/vue/src/scroller/scroller.spec.ts
git commit -m "feat(vue): scaffold UScroller with uix-data virtualization consumption"
```

---

### Task 12: Vue — content measurement, virtual item rendering, loader markup, `scrollTo`/`scrollToIndex`, `disabled` passthrough mode

**Files:**
- Modify: `packages/vue/src/scroller/Scroller.vue`
- Modify: `packages/vue/src/scroller/scroller-style.ts`
- Test: `packages/vue/src/scroller/scroller.spec.ts` (extend)

**Measurement architecture — verified against real PrimeVue source** (`packages/primevue/src/virtualscroller/VirtualScroller.vue`, pinned commit `66dde6788220fc9e6822342919d1ceb0e3460ece`, lines 288-289, 596-599): identical measured element/property contract to Angular/React — `this.element.offsetHeight` (the root/viewport element, minus content position offset), not `clientHeight`. Unlike Angular/React's real upstream (both use a `window` resize listener with no `ResizeObserver`), **PrimeVue's real source genuinely does use `ResizeObserver`** (`this.resizeObserver = new ResizeObserver(() => this.onResize()); this.resizeObserver.observe(this.element)`, `VirtualScroller.vue:596-599`), alongside a `window` `resize`/`orientationchange` listener — so this task's use of `ResizeObserver` is not just a legitimate modern choice here, it is a direct match to real upstream Vue's own mechanism, confirmed by this planning pass.

**Interfaces:**
- Consumes: `first`/`last`/`recompute()` (Task 11)
- Produces: real `ResizeObserver`-based content-size measurement of `offsetHeight` (replacing Task 11's `contentSize: 0` stub, matching real PrimeVue's measured element/property exactly per the architecture note above); rendered virtual item subset; conditional loader markup (`.u-scroller-loader`/`.u-scroller-loading-icon`) shown while `loading` prop is true; `scrollTo(options)`, `scrollToIndex(index, behavior?)` public instance methods (matching spec §11's confirmed method names); `disabled: { type: Boolean, default: false }` prop — consumed by Task 13's lazy-load/`aria-busy` wiring and Task 14's cross-framework loader-token verification (this task, not Task 14, is where the loader markup that makes the loader CSS selector actually present is implemented)

- [ ] **Step 1: Write the failing test**

Deterministic layout mocking, matching Tasks 3/8's Angular/React seams: jsdom has no real layout, so `offsetHeight` is `0` unless stubbed, and no `ResizeObserver` exists globally:

```typescript
// prepend to packages/vue/src/scroller/scroller.spec.ts, inside the
// existing describe("UScroller", () => { ... }) block
let resizeObserverCallback: ResizeObserverCallback | undefined;

beforeEach(() => {
  resizeObserverCallback = undefined;
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(cb: ResizeObserverCallback) {
        resizeObserverCallback = cb;
      }
      observe(target: Element) {
        resizeObserverCallback?.([{ target } as ResizeObserverEntry], this as unknown as ResizeObserver);
      }
      disconnect() {}
    }
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function mockViewportHeight(element: HTMLElement, height: number): void {
  Object.defineProperty(element, "offsetHeight", { value: height, configurable: true });
}
```

```typescript
// append to packages/vue/src/scroller/scroller.spec.ts
it("measures the root viewport element's offsetHeight and computes numItemsInViewport from it, matching real PrimeVue's measured element/property", async () => {
  const wrapper = mount(UScroller, {
    props: { items: Array.from({ length: 1000 }, (_, i) => i), itemSize: 20 },
  });
  mockViewportHeight(wrapper.element as HTMLElement, 200);
  const observer = new ResizeObserver(() => {});
  observer.observe(wrapper.element);
  await wrapper.vm.$nextTick();
  // 200 / 20 = 10 whole items fit exactly.
  expect(wrapper.attributes("data-num-items-in-viewport")).toBe("10");
});

it("renders only the windowed subset of items, not the full array, given a mocked 200px viewport", async () => {
  const wrapper = mount(UScroller, {
    props: { items: Array.from({ length: 1000 }, (_, i) => i), itemSize: 20 },
  });
  mockViewportHeight(wrapper.element as HTMLElement, 200);
  const observer = new ResizeObserver(() => {});
  observer.observe(wrapper.element);
  await wrapper.vm.$nextTick();
  const renderedItems = wrapper.findAll("[data-u-scroller-item]");
  // numItemsInViewport=10, numToleratedItems defaults to ceil(10/2)=5,
  // calculateLast(0, 10, 5) = 0+10+2*5=20, clamped to items.length (1000) -> 20.
  expect(renderedItems.length).toBe(20);
});

it("scrollTo calls the native Element.scrollTo with the given options", () => {
  const wrapper = mount(UScroller, {
    props: { items: Array.from({ length: 100 }, (_, i) => i), itemSize: 20 },
  });
  const scrollToSpy = vi.fn();
  wrapper.element.scrollTo = scrollToSpy;
  (wrapper.vm as unknown as { scrollTo: (o: ScrollToOptions) => void }).scrollTo({ top: 100 });
  expect(scrollToSpy).toHaveBeenCalledWith({ top: 100 });
});

it("scrollToIndex computes the target position from index * itemSize", () => {
  const wrapper = mount(UScroller, {
    props: { items: Array.from({ length: 100 }, (_, i) => i), itemSize: 20 },
  });
  const scrollToSpy = vi.fn();
  wrapper.element.scrollTo = scrollToSpy;
  (wrapper.vm as unknown as { scrollToIndex: (i: number) => void }).scrollToIndex(10);
  expect(scrollToSpy).toHaveBeenCalledWith({ top: 200, behavior: "auto" });
});

it("disabled mode renders all items with zero virtualization", () => {
  const wrapper = mount(UScroller, {
    props: { items: Array.from({ length: 50 }, (_, i) => i), itemSize: 20, disabled: true },
  });
  expect(wrapper.findAll("[data-u-scroller-item]").length).toBe(50);
});

it("renders loader markup with .u-scroller-loader when loading is true", () => {
  const wrapper = mount(UScroller, { props: { items: [], itemSize: 20, loading: true } });
  expect(wrapper.find(".u-scroller-loader").exists()).toBe(true);
});

it("does not render loader markup when loading is false or unset", () => {
  const wrapper = mount(UScroller, { props: { items: [], itemSize: 20 } });
  expect(wrapper.find(".u-scroller-loader").exists()).toBe(false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/vue test -- scroller.spec.ts`
Expected: FAIL — no `[data-u-scroller-item]` elements rendered; `data-num-items-in-viewport` stays `"0"`; `scrollTo`/`scrollToIndex` not defined; `disabled` prop not honored; no `.u-scroller-loader` element exists; `loading` prop doesn't exist yet

- [ ] **Step 3: Write minimal implementation**

Extend `scroller-style.ts`'s `classes` object with `item` and `loader` slots:

```typescript
// modify packages/vue/src/scroller/scroller-style.ts — replace the classes object
const classes = {
  root: () => "u-scroller u-component",
  content: () => "u-scroller-content",
  item: () => "u-scroller-item",
  loader: () => "u-scroller-loader",
};
```

Add the corresponding CSS rules to the same file's `css` template string:

```typescript
// add inside the css template string in scroller-style.ts, after .u-scroller-content
.u-scroller-item {
    position: absolute;
    width: 100%;
}
.u-scroller-loader {
    position: sticky;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
```

Rewrite `Scroller.vue`:

```vue
<!-- packages/vue/src/scroller/Scroller.vue -->
<template>
  <div
    ref="elementRef"
    :class="cx('root')"
    :data-num-items-in-viewport="numItemsInViewport"
    :data-last="last"
    :data-first="first"
    @scroll="onScroll"
  >
    <div v-if="loading" :class="cx('loader')">
      <span class="u-scroller-loading-icon"></span>
    </div>
    <div
      :class="cx('content')"
      data-u-scroller-content
      :style="{ height: items.length * itemSize + 'px' }"
    >
      <div
        v-for="entry in visibleItems"
        :key="entry.index"
        :class="cx('item')"
        data-u-scroller-item
        :style="{ top: entry.index * itemSize + 'px' }"
      >
        {{ entry.value }}
      </div>
    </div>
  </div>
</template>

<script>
import { createBaseScroller } from "./base-scroller";
import { calculateLast, calculateNumItemsInViewport } from "@ultimate/uix-data";

export default {
  name: "UScroller",
  extends: createBaseScroller(),
  props: {
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
  },
  data() {
    return {
      first: 0,
      last: 0,
      numItemsInViewport: 0,
      contentSize: 0,
      resizeObserver: null,
    };
  },
  computed: {
    resolvedNumToleratedItems() {
      return this.numToleratedItems !== null ? this.numToleratedItems : Math.ceil(this.numItemsInViewport / 2);
    },
    visibleItems() {
      if (this.disabled) {
        return this.items.map((value, index) => ({ index, value }));
      }
      const result = [];
      for (let i = this.first; i < this.last; i++) {
        result.push({ index: i, value: this.items[i] });
      }
      return result;
    },
  },
  watch: {
    items: {
      handler() {
        this.recompute();
      },
    },
    itemSize: {
      handler() {
        this.recompute();
      },
    },
  },
  mounted() {
    // Measures the root viewport element's offsetHeight — matching real
    // PrimeVue's this.element.offsetHeight measurement exactly
    // (VirtualScroller.vue:289, pinned commit 66dde6788220fc9e6822342919d1ceb0e3460ece),
    // not clientHeight. PrimeVue's real source also genuinely uses
    // ResizeObserver here (VirtualScroller.vue:596-599), so this mirrors
    // real upstream Vue exactly, not just a modern-choice substitute the
    // way Angular's/React's ResizeObserver usage is.
    this.contentSize = this.$refs.elementRef.offsetHeight;
    this.resizeObserver = new ResizeObserver(() => {
      this.contentSize = this.$refs.elementRef.offsetHeight;
    });
    this.resizeObserver.observe(this.$refs.elementRef);
    this.recompute();
  },
  beforeUnmount() {
    this.resizeObserver?.disconnect();
  },
  methods: {
    recompute() {
      this.numItemsInViewport = calculateNumItemsInViewport(this.contentSize, this.itemSize);
      const rawLast = calculateLast(this.first, this.numItemsInViewport, this.resolvedNumToleratedItems);
      this.last = this.getLast(rawLast);
    },
    getLast(last = 0, isCols = false) {
      if (!this.items) return 0;
      const liveLength = isCols ? this.items.length : this.items.length; // isCols branch unreachable in vertical-only scope (Global Constraints)
      return Math.min(liveLength, last);
    },
    onScroll() {
      const newFirst = Math.floor(this.$refs.elementRef.scrollTop / (this.itemSize || 1));
      if (newFirst !== this.first) {
        this.first = newFirst;
        this.recompute();
      }
    },
    scrollTo(options) {
      this.$refs.elementRef.scrollTo(options);
    },
    scrollToIndex(index, behavior = "auto") {
      this.scrollTo({ top: index * this.itemSize, behavior });
    },
  },
};
</script>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/vue test -- scroller.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/vue/src/scroller/Scroller.vue packages/vue/src/scroller/scroller-style.ts packages/vue/src/scroller/scroller.spec.ts
git commit -m "feat(vue): add UScroller content measurement, virtual item rendering, loader markup, and scrollTo API"
```

---

### Task 13: Vue — lazy-load mechanics (`lazy-load` emit), `aria-busy`, package export

**Files:**
- Modify: `packages/vue/src/scroller/Scroller.vue`
- Create: `packages/vue/src/scroller/index.ts`
- Modify: `packages/vue/src/index.ts`
- Modify: `packages/vue/tsup.config.ts` (if a subpath entry is required — read the existing `paginator` entry first to confirm the pattern)
- Modify: `packages/vue/package.json` (`exports` map + `description`)
- Test: `packages/vue/src/scroller/scroller.spec.ts` (extend)

**Interfaces:**
- Consumes: `onScroll`/`recompute` (Task 12); `loading` prop (Task 12, where it was introduced alongside loader markup — this task only adds the `aria-busy` attribute binding, it does not redeclare the prop)
- Produces: `emits: ['lazy-load']` (matching spec §4.3's confirmed emit name — Scroller has no `v-model`-compatible emits at all, unlike Paginator, per spec §14/§20); `lazy: { type: Boolean, default: false }` prop; `aria-busy` binding on the root; `UScroller` exported from `packages/vue/src/scroller/index.ts` and the package root/subpath

- [ ] **Step 1: Write the failing test**

Uses Task 12's `mockViewportHeight` helper and `beforeEach` `ResizeObserver` stub for a deterministic 200px viewport:

```typescript
// append to packages/vue/src/scroller/scroller.spec.ts
it("emits lazy-load with {first, last} after a scroll-triggered window change, when lazy is true, given a mocked 200px viewport", async () => {
  const wrapper = mount(UScroller, {
    props: { items: Array.from({ length: 1000 }, (_, i) => i), itemSize: 20, lazy: true },
  });
  mockViewportHeight(wrapper.element as HTMLElement, 200);
  const observer = new ResizeObserver(() => {});
  observer.observe(wrapper.element);
  await wrapper.vm.$nextTick();
  Object.defineProperty(wrapper.element, "scrollTop", { value: 2000, writable: true, configurable: true });
  await wrapper.trigger("scroll");
  await Promise.resolve(); // matches the real Promise.resolve().then() deferral, spec §10
  // first = floor(2000/20) = 100; numItemsInViewport=10, numToleratedItems=5,
  // calculateLast(100, 10, 5) = 100+10+3*5=125, clamped to items.length
  // (1000) -> 125.
  expect(wrapper.emitted("lazy-load")).toBeTruthy();
  expect(wrapper.emitted("lazy-load")![0][0]).toEqual({ first: 100, last: 125 });
});

it("does not emit lazy-load when lazy is false", async () => {
  const wrapper = mount(UScroller, {
    props: { items: Array.from({ length: 1000 }, (_, i) => i), itemSize: 20 },
  });
  Object.defineProperty(wrapper.element, "scrollTop", { value: 2000, writable: true, configurable: true });
  await wrapper.trigger("scroll");
  await Promise.resolve();
  expect(wrapper.emitted("lazy-load")).toBeFalsy();
});

it("sets aria-busy=true on the root while loading is true", () => {
  const wrapper = mount(UScroller, { props: { items: [], itemSize: 20, loading: true } });
  expect(wrapper.attributes("aria-busy")).toBe("true");
});

it("is exported from its own subpath index", async () => {
  const { default: SubpathExport } = await import("./index");
  expect(SubpathExport).toBe(UScroller);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/vue test -- scroller.spec.ts`
Expected: FAIL — `lazy-load` never emitted; `aria-busy` not rendered; `Cannot find module './index'`

- [ ] **Step 3: Write minimal implementation**

Add the `lazy` prop (`loading` is already declared, from Task 12), the `emits` declaration, and lazy-load firing to `Scroller.vue`:

```javascript
// modify the exported object in packages/vue/src/scroller/Scroller.vue
export default {
  name: "UScroller",
  extends: createBaseScroller(),
  props: {
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    lazy: { type: Boolean, default: false },
  },
  emits: ["lazy-load"],
  // ...data()/computed/watch/mounted/beforeUnmount unchanged from Task 12...
  methods: {
    // ...recompute()/getLast()/scrollTo()/scrollToIndex() unchanged from Task 12...
    onScroll() {
      const newFirst = Math.floor(this.$refs.elementRef.scrollTop / (this.itemSize || 1));
      if (newFirst !== this.first) {
        this.first = newFirst;
        this.recompute();
        if (this.lazy) {
          const first = this.first;
          const last = this.last;
          Promise.resolve().then(() => {
            this.$emit("lazy-load", { first, last });
          });
        }
      }
    },
  },
};
```

Add `aria-busy` to the template's root `<div>`:

```html
<div
  ref="elementRef"
  :class="cx('root')"
  :data-num-items-in-viewport="numItemsInViewport"
  :data-last="last"
  :data-first="first"
  :aria-busy="loading ? 'true' : null"
  @scroll="onScroll"
>
```

```typescript
// packages/vue/src/scroller/index.ts
export { default as UScroller } from "./Scroller.vue";
```

Read `packages/vue/src/index.ts` and `packages/vue/src/paginator/index.ts` (the most recent sibling precedent) to confirm the existing re-export/subpath pattern, then add the equivalent `export * from "./scroller"` line to `packages/vue/src/index.ts`, the `"./scroller"` entry to `packages/vue/package.json`'s `exports` map (matching `"./paginator"`'s exact shape), and — only if Paginator's own `tsup.config.ts` required a matching change for its subpath — the equivalent `scroller` entry to `packages/vue/tsup.config.ts`. Update `"description"` to include "Scroller" in the alphabetically-ordered component list.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/vue test -- scroller.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/vue/src/scroller/Scroller.vue packages/vue/src/scroller/index.ts packages/vue/src/index.ts packages/vue/package.json packages/vue/src/scroller/scroller.spec.ts
git commit -m "feat(vue): add UScroller lazy-load, aria-busy, and export UScroller"
```

(If `tsup.config.ts` needed a change, include it in this commit's `git add` list too.)

---

## Task Group E — Cross-Framework Verification and Provenance

### Task 14: Cross-framework theme-consistency test (matching `UButton`/`UPaginator`'s established pattern)

**Files:**
- Modify: `packages/themes/test/cross-framework-consistency.test.ts`
- Modify: `packages/ng/src/scroller/scroller.spec.ts` (Angular's half — this convention proves the guarantee in two files, not one, per `UButton`'s and `UPaginator`'s own precedent)
- Test: (this task's changes ARE the tests — no separate test file)

**Interfaces:**
- Consumes: `UScroller` from `@ultimate/react/scroller` and `@ultimate/vue/scroller` (built `dist/` output — see the existing build-freshness note at the top of `cross-framework-consistency.test.ts`); `dt` from `@ultimate/uix-styled`; `applyUltimateTheme` from `@ultimate/themes`; `TestBed` and `UScroller` from `./scroller` for the Angular half

**What this test actually verifies** (confirmed by reading the real, already-existing `packages/themes/test/cross-framework-consistency.test.ts` in full — both `UButton`'s and, once Task 13 of the Paginator plan lands, `UPaginator`'s versions — before writing this task): style/design-**token resolution** consistency — that the same `dt(...)` token call resolves to the identical `var(--u-...)` CSS text regardless of which framework's `*-core` `StyleSheet` registered it. It is **not** a component-runtime-registration test. **Important divergence from `UPaginator`'s version of this test**: the real vendored `virtualscroller` style tokens (`.vendor-extracted/uix-styles-components/src/virtualscroller/index.ts`, read in full while writing this plan) contain **no root-level token** analogous to `paginator.background` — the only two real tokens are `virtualscroller.loader.mask.background` and `virtualscroller.loader.icon.size`, both scoped to the **loading state only** (`.p-virtualscroller-loader`/`.p-virtualscroller-loading-icon` selectors). This task's assertions therefore use `virtualscroller.loader.mask.background` as the proof token, and — since that token only appears in rendered CSS when the loader is actually shown — **both frameworks' test renders must pass `loading: true`/`loading` to make the loader markup (and its CSS) present**, unlike `UButton`'s/`UPaginator`'s tests, which don't need a special prop to exercise their root-level tokens. This is a real, source-confirmed difference in this component's own token surface, not an invented complication.

- [ ] **Step 1: Write the failing tests**

Append to `packages/themes/test/cross-framework-consistency.test.ts`, inside the existing `describe("cross-framework theme consistency", ...)` block, as a new nested `describe` sibling to the existing `UButton`/`UPaginator` blocks (do not modify the existing tests):

```typescript
// append inside the existing describe("cross-framework theme consistency", () => { ... })
// block in packages/themes/test/cross-framework-consistency.test.ts, as a
// sibling to the existing UButton/UPaginator describe blocks
describe("React and Vue's real UScroller renders resolve the same virtualscroller.loader.mask.background token", () => {
  afterEach(() => {
    cleanup();
  });

  it("Vue's real UScroller registers CSS containing the resolved virtualscroller.loader.mask.background var(...) text, matching dt()'s own resolution", async () => {
    const { UScroller } = await import("@ultimate/vue/scroller");

    const wrapper = mount(UScroller, { props: { items: [], itemSize: 20, loading: true } });

    const styleEl = document.head.querySelector('style[data-u-style="scroller"]');
    expect(styleEl).not.toBeNull();
    const vueCss = styleEl!.textContent ?? "";

    expect(vueCss).toContain("var(--u-scroller-loader-mask-background");
    expect(vueCss).not.toContain("dt("); // no unresolved dt() calls leaked through

    const resolvedToken = dt("virtualscroller.loader.mask.background");
    expect(vueCss).toContain(resolvedToken);

    wrapper.unmount();
  });

  it("React's real UScroller registers CSS containing the resolved virtualscroller.loader.mask.background var(...) text, matching dt()'s own resolution", async () => {
    const { UScroller } = await import("@ultimate/react/scroller");

    render(React.createElement(UScroller, { items: [], itemSize: 20, loading: true }));

    // reactCoreStyleSheet's <style> elements carry no identifying attribute
    // (same as UButton's/UPaginator's real established pattern, per this
    // file's own header comment) — Vue's element is excluded by its own
    // data-u-style attribute, and the element is then located by its known,
    // unique .u-scroller-loader selector, matching the exact lookup
    // mechanism already established for UButton's/UPaginator's React halves.
    // The .not.toBe(vueStyleEl) guard is the actual distinguishing check;
    // the content match alone is only a sanity check that the found element
    // is really scroller CSS.
    const vueStyleEl = document.head.querySelector('style[data-u-style="scroller"]');
    const styleEl = Array.from(document.head.querySelectorAll("style:not([data-u-style])")).find((el) =>
      (el.textContent ?? "").includes(".u-scroller-loader {")
    );
    expect(styleEl).not.toBeUndefined();
    expect(styleEl).not.toBe(vueStyleEl);
    const reactCss = styleEl!.textContent ?? "";

    expect(reactCss).toContain("var(--u-scroller-loader-mask-background");
    expect(reactCss).not.toContain("dt(");

    const resolvedToken = dt("virtualscroller.loader.mask.background");
    expect(reactCss).toContain(resolvedToken);
  });
});
```

Append to `packages/ng/src/scroller/scroller.spec.ts` (Angular's third of the same guarantee — mirrors `packages/ng/src/button/button.spec.ts`'s/`packages/ng/src/paginator/paginator.spec.ts`'s existing final test exactly, substituting Scroller's own selector/token):

```typescript
// append to packages/ng/src/scroller/scroller.spec.ts
it("resolves the same virtualscroller.loader.mask.background token as the React/Vue cross-framework consistency test (packages/themes/test/cross-framework-consistency.test.ts)", () => {
  const fixture = TestBed.createComponent(UScroller);
  fixture.componentRef.setInput("loading", true);
  fixture.detectChanges();

  const styleEl = Array.from(document.head.querySelectorAll("style")).find((el) =>
    (el.textContent ?? "").includes(".u-scroller-loader {")
  );
  expect(styleEl).not.toBeUndefined();
  const ngCss = styleEl!.textContent ?? "";

  expect(ngCss).toContain("var(--u-scroller-loader-mask-background");
});
```

(This second block requires `dt`/`applyUltimateTheme`/`beforeAll` to already exist at the top of `scroller.spec.ts` from Task 2's own setup — verified present, Task 2's `describe` block already calls `applyUltimateTheme()` in a `beforeAll`, matching `button.spec.ts`'s/`paginator.spec.ts`'s exact precedent.)

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @ultimate/themes test -- cross-framework-consistency.test.ts` and `pnpm --filter @ultimate/ng test -- --include='**/scroller.spec.ts'`
Expected: the `@ultimate/themes` run FAILS with `Cannot find module '@ultimate/vue/scroller'` / `'@ultimate/react/scroller'` unless `packages/vue` and `packages/react` have already been rebuilt after Tasks 10/13 landed (rebuild with `pnpm --filter @ultimate/vue --filter @ultimate/react build` first if the module resolves but the assertions fail unexpectedly). The `@ultimate/ng` run FAILS because the new `it(...)` block doesn't exist yet on a fresh file read.

- [ ] **Step 3: Write minimal implementation**

No production code change expected — this task is verification only. The loader markup this task's assertions depend on (`.u-scroller-loader`/`.u-scroller-loading-icon`) was already implemented in Tasks 3 (Angular), 8 (React), and 12 (Vue), not here — this task only proves those three tasks' real style modules resolve `virtualscroller.loader.mask.background` consistently. If any of this task's tests fail, that is a real bug in the corresponding framework's Task 3/8/12 implementation to fix in that task's own files — never a signal to add or change production markup inside this verification task.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @ultimate/vue --filter @ultimate/react build && pnpm --filter @ultimate/themes test -- cross-framework-consistency.test.ts && pnpm --filter @ultimate/ng test -- --include='**/scroller.spec.ts'`
Expected: PASS (all three)

- [ ] **Step 5: Commit**

```bash
git add packages/themes/test/cross-framework-consistency.test.ts packages/ng/src/scroller/scroller.spec.ts
git commit -m "test(themes): verify UScroller cross-framework token consistency"
```

---

### Task 15: Provenance manifest entries

**Files:**
- Create/Modify: `docs/architecture/provenance/scroller.json` (new file, following the existing `originalPath`/`ultimateDestination` schema used by Phase 1/2 components and by `docs/architecture/provenance/paginator.json` — read that file, or an earlier component's, before writing this one, to match the exact schema shape)
- Modify: `docs/architecture/PROVENANCE.md` (new package-level entry for Scroller, following the existing template)

**Interfaces:**
- Consumes: none (documentation only)
- Produces: provenance coverage for every `.ts`/`.tsx`/`.vue` file created under `packages/{ng,react,vue}/src/scroller/` and `packages/uix-styles/src/virtualscroller/` across Tasks 1–14, satisfying `provenance:validate`'s existing per-file-manifest-entry requirement

- [ ] **Step 1: Write the failing check**

Run: `pnpm run provenance:validate` (or the package-scoped equivalent used by CI — read `.github/workflows/ci.yml` to confirm the exact invocation before running)
Expected: FAIL — no manifest entries exist yet for any `scroller`/`virtualscroller` file

- [ ] **Step 2: Confirm the failure is the expected one**

The validator's failure output should list every file under `packages/{ng,react,vue}/src/scroller/*` and `packages/uix-styles/src/virtualscroller/*` as missing a provenance entry — not an unrelated failure. If the failure message differs, stop and investigate before proceeding (this task's scope is adding manifest entries, not fixing an unrelated validator bug).

- [ ] **Step 3: Write the provenance entries**

Read `docs/architecture/provenance/paginator.json` (or `button.json`) first to copy its exact schema shape, then create `docs/architecture/provenance/scroller.json` with one entry per real source file created in Tasks 1–14 (`packages/uix-styles/src/virtualscroller/index.ts`; `packages/ng/src/scroller/{scroller.ts,scroller-style.ts,index.ts}`; `packages/react/src/scroller/{scroller.tsx,scroller-style.ts,index.ts}`; `packages/vue/src/scroller/{Scroller.vue,base-scroller.ts,scroller-style.ts,index.ts}`), each citing:
- `originalPath`: the real pinned Prime source file this Ultimate file was informed by (`packages/primeng/src/scroller/scroller.ts` for the Angular files, `components/lib/virtualscroller/VirtualScroller.js` for React, `packages/primevue/src/virtualscroller/VirtualScroller.vue` for Vue, `.vendor-extracted/uix-styles-components/src/virtualscroller/index.ts` for the style-token file — matching the pinned revisions already cited throughout the spec and both research reports)
- `ultimateDestination`: the real file path this task created
- License/classification fields matching the existing schema's field names exactly (copy from `paginator.json`, do not invent new field names)

Add a new package-level entry for Scroller to `docs/architecture/PROVENANCE.md`, following the existing template (mixed-provenance note: direct per-framework adaptation of real upstream Scroller/VirtualScroller source, plus a directly-ported style-token file — matching the same mixed-provenance pattern already used for Paginator's own entry).

- [ ] **Step 4: Run the check to verify it passes**

Run: `pnpm run provenance:validate` (same invocation as Step 1)
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add docs/architecture/provenance/scroller.json docs/architecture/PROVENANCE.md
git commit -m "docs(provenance): add scroller component provenance manifest"
```

---

## Explicitly Deferred (Not Part of This Plan)

- **`horizontal`/`both` orientation support** (spec §4, §8) — a real, confirmed upstream feature, deliberately scoped out of this plan (see **Global Constraints**) to keep every task's rendering/clamping/lazy-load logic sized consistently with Paginator's own plan. This is a future follow-up **outside this plan** — no task number here is reserved for it (Task 15 is provenance, not orientation). A future plan extends Tasks 3/8/12's rendering and Tasks 2/7/11's `getLast(last, isCols)` signature (this plan already declares `isCols` in that signature, even though it never passes `true` for it — see Global Constraints) to branch on `orientation`.
- **`getRenderedRange()` public method** (spec §11) — confirmed present with identical shape in Angular/React, not independently re-verified for Vue at the same depth; deferred to the same follow-up as orientation support, since it is most naturally implemented alongside the `{rows, cols}`-shaped `both`-orientation state it needs to report.
- **Rich virtualized-grid ARIA** (`aria-rowcount`/`aria-setsize`, spec §13/§20 open decision) — this plan resolves only the `aria-busy` item; the richer open decision remains genuinely open, per the spec's own framing, for whoever picks up Table's own accessibility work (Table spec §15) or a dedicated future Scroller accessibility task.
- **`step`-batched lazy-load-page grouping** (spec §8, §10's `getPageByFirst`/`isPageChanged`) — this plan's Tasks 5/9/13 fire `onLazyLoad`/`lazy-load` on every window-index change (`step`'s effective default of `0`, "no batching"), matching real Prime's own default behavior exactly. Explicit `step`-driven batching is a real, separate upstream feature not required for a correct default-behavior implementation — deferred to a follow-up task if a consumer (Table) needs to throttle lazy-load frequency beyond the default.

---

## Self-Review

Three distinct categories, kept separate per the plan-review-gate instruction not to blur "this plan builds it" with "this plan proved it with a real number" with "this plan explicitly does not touch this":

**Implemented** (a task in this plan writes real production code for it): `calculateNumItemsInViewport`/`calculateLast` consumption (Tasks 2/7/11); the framework-native `getLast(last, isCols=false)` array-bounds clamp, `isCols` declared-but-unreachable in this vertical-only plan (Tasks 2/7/11); real `offsetHeight`-based content measurement matching each framework's real upstream measured element/property exactly (Tasks 3/8/12); virtual item windowing/rendering (Tasks 3/8/12); loader markup (`.u-scroller-loader`/`.u-scroller-loading-icon`), moved into the framework-owning tasks, not the style-token task (Tasks 3/8/12); `scrollTo`/`scrollToIndex` public API (Tasks 4/9/12); `disabled` passthrough mode (Tasks 4/9/12); lazy-load firing via `Promise.resolve().then()` (Tasks 5/9/13); `aria-busy` binding (Tasks 5/9/13); package/subpath exports (Tasks 6/10/13); provenance manifest entries (Task 15).

**Verified with a deterministic numeric assertion** (a task's own test proves a specific expected number from real, pinned-source-derived arithmetic, not merely that an attribute exists or a value is non-zero): every measurement/windowing/lazy-load test added by this revision (Tasks 2/3/5/7/8/9/11/12/13) mocks a concrete `offsetHeight`/`scrollTop` and asserts the exact numeric result `calculateNumItemsInViewport`/`calculateLast`/`getLast` produce from those known inputs — e.g. Task 3's "200px viewport / 20px items → exactly 10 `numItemsInViewport`, exactly 20 rendered items" and Task 5's "`scrollTop=2000` → exactly `first=100`, `onLazyLoad` fires with exactly `{first: 100, last: 125}`" — not the pre-revision versions' bare `hasAttribute`/`toBeGreaterThan(0)` checks. Task 14's cross-framework loader-token consistency is verified by direct DOM/CSS-text assertion against real built `dist/` output, reusing the exact selector mechanism (`style:not([data-u-style])` + `.not.toBe(vueStyleEl)` guard, plus the same explanatory comment) already established by `UButton`'s and `UPaginator`'s real, already-existing tests — not an invented heuristic.

**Explicitly deferred** (no task in this plan touches it, and it is named as out of scope rather than silently omitted): `horizontal`/`both` orientation (a future plan, not Task 15 — Task 15 is provenance only, per the fixed Global Constraints); `getRenderedRange()` (deferred to the same orientation follow-up, since Vue's exact shape for it was never independently re-verified at the call-site level this planning pass — this plan does not claim to cover it, and no task asserts it); rich virtualized-grid ARIA beyond `aria-busy` (`aria-rowcount`/`aria-setsize`); `step`-batched lazy-load-page grouping. See **Explicitly Deferred** above for the full list with rationale.

**Spec coverage** (against `docs/superpowers/specs/2026-09-02-scroller-component-design.md`'s 24 sections), cross-referencing the three categories above: §4 (public API) — Implemented, Tasks 2–13. §5 (shared vs. framework-native) — Implemented; no new `uix-data` primitive introduced anywhere. §6/§7/§8 (identity/selection, sort/filter, pagination) — correctly not applicable, no tasks invent them. §9 (array-bounds clamp) — Implemented and Verified (Tasks 2/7/11). §10 (lazy-loading) — Implemented and Verified (Tasks 5/9/13). §11 (scrollTo/scrollToIndex) — Implemented and Verified (Tasks 4/9/12); `scrollInView`/`getRenderedRange` are Explicitly Deferred, not silently dropped. §12 (templates/slots) — out of scope for this plan's item/content/loader template customization points; not claimed as covered, no task asserts it. §13 (accessibility) — `aria-busy` Implemented and Verified; richer ARIA Explicitly Deferred. §14 (state ownership) — Implemented, each framework's Task 2/7/11 scaffold matches its own real divergent model exactly, verified against the spec's own per-framework tables. §15 (styling) — Implemented (Task 1 ports real vendored tokens; Tasks 3/8/12 wire them in) and Verified (Task 14). §16 (performance) — Implemented: `ResizeObserver`-based measurement (a direct match to real upstream for Vue, a legitimate modern substitute for Angular/React per Tasks 3/8's architecture notes), `key`/`trackBy`-based reconciliation via each framework's native list-rendering directive. §17 (package boundaries) — Implemented (Tasks 6/10/13). §18 (provenance) — Implemented (Task 15). §19 (testing matrix) — every row has a corresponding task-level test, upgraded to deterministic numeric assertions per this revision. §20 (known divergences) — no task normalizes any of the five cataloged divergences. §21 (open decisions) — the accessibility item is Implemented-in-part (`aria-busy` only); Vue's exact `scrollToIndex`/`scrollInView` branching and full lazy-load payload shape (including `step`-batching) were not re-verified against real source during this revision pass (that verification belongs to the spec's own preparation, not this plan-review-fix pass, which targeted the measurement architecture specifically per finding #2) — this plan's `scrollTo`/`scrollToIndex`/`lazy-load` implementations match the spec's already-established signatures, unchanged by this revision; richer ARIA and `getRenderedRange` are Explicitly Deferred. §22 (acceptance criteria) — every checklist item maps to a specific task. §23 (sequencing) — Implemented: this plan proceeds with no external blocker, matching the spec's own "no true architectural blocker" conclusion.

**Placeholder scan**: no "TBD"/"implement later"/"add appropriate error handling" found in any task above. No placeholder file is created and later replaced — Task 1's style-token port, Task 11's initial two-slot `classes` object (explicitly commented as real, extended not replaced in Task 12), and every scaffold task's initial implementation are each real, minimal, load-bearing code from their first commit. Task 14's Step 3 (verification task) contains no conditional production-implementation language — loader markup is owned entirely by Tasks 3/8/12, not by Task 14.

**Type/signature consistency across tasks**: `UScroller`'s public shape is consistent across all three frameworks' Task 2/7/11 → Task 6/10/13 progression — `items`, `itemSize`, `numToleratedItems` (honored from Task 7 onward in React, not silently hardcoded past its own declaration), `disabled`, `lazy`, `loading` appear with matching names and semantics in every framework's props/inputs, each declared exactly once (no duplicate `loading`/`lazy` prop declarations across a component's own task sequence — `loading` is introduced once, in Tasks 3/8/12 respectively, and only referenced, not redeclared, in Tasks 5/9/13). `onLazyLoad`/`lazy-load`/`onLazyLoad` all carry the identical `{first, last}` payload shape; `scrollTo`/`scrollToIndex` method names and parameter order match exactly across Angular's class methods, React's `useImperativeHandle`-exposed handle, and Vue's instance methods. `getLast`'s per-framework signature (`last`, `isCols=false`) is now consistent and complete across Tasks 2/7/11's `getLast` definitions — not merely described in Global Constraints/Explicitly Deferred while the actual task bodies used a shorter, inconsistent signature, which was this revision's finding #7 fix.

**Real-source verification performed during this revision** (targeted, not a new broad research pass): re-extracted PrimeNG `scroller.ts` (confirmed `elementViewChild.nativeElement.offsetHeight`/`offsetWidth` measurement, zero `ResizeObserver` usage, `window` resize/orientationchange listener instead — `scroller.ts:682-689,852-856,1142-1152`), PrimeReact `VirtualScroller.js` (confirmed identical `elementRef.current.offsetHeight` measurement, zero `ResizeObserver` — `VirtualScroller.js:185-186`), and PrimeVue `VirtualScroller.vue` (confirmed identical `this.element.offsetHeight` measurement, but — unlike Angular/React — real PrimeVue genuinely does use `ResizeObserver` alongside its window-resize listener — `VirtualScroller.vue:288-289,596-599`). This resolved the plan-review-gate's finding #2 with an exact, cited, real-source answer rather than a guess, and confirmed this plan's choice to use `ResizeObserver` for all three frameworks is a legitimate modern substitute for Angular/React and a direct match to real upstream for Vue.

**Applying the Paginator plan's own review-fix lessons, and this plan's own review-fix findings, proactively for any future sibling plan**: (1) no test reaches into a `protected`/internal class member — every test asserts against rendered DOM or genuinely public methods. (2) No placeholder style module or markup exists anywhere — loader markup, in particular, is owned by the framework task that renders it (3/8/12), never introduced conditionally inside a later verification task. (3) Every task's first failing test is scoped only to that task's own actual behavior, and every declared prop/input has real, non-hardcoded behavior in the task that declares it (React's `numToleratedItems` override, fixed in this revision, is the concrete example). (4) File-creation task sequencing is consistent — no task's Files list references a file created by a later task. (5) Vue's `Scroller.vue` uses `export default { ... }` throughout, never a nonexistent named export. (6) Every Global-Constraints-level architectural claim (the `getLast(last, isCols)` signature, Task 15's actual scope) is mirrored exactly in the task bodies and the Explicitly Deferred section — no document-level claim is allowed to drift from what the tasks actually do.

No code was written or modified by writing or revising this plan. Only this planning document was created and then edited.
