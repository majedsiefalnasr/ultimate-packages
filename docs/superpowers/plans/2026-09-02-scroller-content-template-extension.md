# Scroller Content-Template Extension Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend Ultimate's already-shipped, merged `UScroller` (`8f8f97b`) with a **content-level template/render-prop/scoped-slot mechanism** — one optional composition point per framework — that lets a consumer (specifically, the still-unimplemented `UTable`) supply its own root markup around Scroller's windowed items, instead of Scroller always rendering its own fixed `<div>{{value}}</div>` per item. This is the direct architectural prerequisite the Table Implementation Plan's blocked Tasks 9 (Angular), 15b (React), 21b (Vue) are waiting on (`docs/superpowers/plans/2026-09-02-table-component-implementation.md`, not modified by this plan).

**Why this exists / evidence basis:** A dedicated architecture research pass (real pinned upstream source: PrimeNG 21.1.9, PrimeReact 10.9.9, PrimeVue 4.5.5) found that real Table never uses Scroller's per-item template — it uses a coarser **content-level** composition point instead, which is a real, generic, already-public part of upstream Scroller/VirtualScroller's own API, not Table-specific glue:

| Framework | Real upstream mechanism | Citation |
|---|---|---|
| Angular | `@ContentChild('content') contentTemplate: TemplateRef<{$implicit: unknown[]; options: ScrollerContentOptions}>`, rendered via `*ngTemplateOutlet`, falling back to the built-in per-item rendering when absent; per-item metadata via `getOptions(index) → {index, count, first, last, even, odd}` | PrimeNG `scroller.ts:450` (ContentChild), `scroller.ts:54-56` (ngTemplateOutlet dispatch), `scroller.ts:1191-1210` (`getContentOptions()`), `scroller.ts:1213-1224` (`getOptions()`); Table supplies it at `table.ts:207-217`; disabled-mode separate dispatch at `scroller.ts:89-94` |
| React | `contentTemplate?: (options) => ReactNode` prop, called instead of the default per-item rendering when supplied; per-item metadata via `getOptions(index)`, same shape | PrimeReact `VirtualScroller.js:716-753` (`createContent`/`defaultOptions`); Table supplies it at `DataTable.js:1942-1967` |
| Vue | `content` scoped slot, wrapping the default per-item `item`-slot rendering as fallback; per-item metadata via `getOptions(index)`, same shape | PrimeVue `VirtualScroller.vue:4-20`; Table supplies it at `DataTable.vue:91-92,127,184-186` |

This plan mirrors that exact mechanism, per framework, as an **additive-only** extension: `UScroller`'s current built-in item rendering (`<div>{{value}}</div>`/`<div>{String(value)}</div>`) stays as the default/fallback path, used by any consumer (including all of `UScroller`'s current tests) that does not supply a content template. No existing `UScroller` public API (`items`/`itemSize`/`numToleratedItems`/`loading`/`disabled`/`lazy`/`onLazyLoad`/`scrollTo`/`scrollToIndex`) changes shape or behavior.

**Architecture:** Three independent, framework-native extensions to the already-shipped `UScroller`, matching each framework's own real upstream mechanism exactly (not a shared/normalized abstraction — Angular gets a `TemplateRef` content-projection point, React gets a render-prop, Vue gets a scoped slot). No new `@ultimate/uix-data` primitive; the context/options object handed to the content template carries only what real upstream's own equivalent carries, re-verified against actual source (not inferred): the windowed items slice, a `getItemOptions(index)` function returning real positional metadata (`{index, count, first, last, even, odd}` — confirmed, not a style/positioning object), `itemSize`, and `loading` — no new shared type is introduced, this stays entirely inside each framework's own component file.

**Tech Stack:** Same as the original Scroller plan — Angular 21 standalone components + `ng-packagr` + `ng test`/`TestBed`; React 18/19 + `tsup` + Vitest + `@testing-library/react`; Vue 3 Options API SFCs + `tsup` + `vue-tsc` + Vitest + `@vue/test-utils`.

**Prior plan (structural precedent, not modified):** `docs/superpowers/plans/2026-09-02-scroller-component-implementation.md` (15-task original Scroller plan, fully executed, merged `8f8f97b`) — this plan follows its `ResizeObserver` test-mock convention and general task/commit structure, extending the same files rather than recreating them.

## Global Constraints

- **Additive-only.** No existing `UScroller` input/output/prop/emit is renamed, removed, or has its default behavior changed. Every existing test in `packages/{ng,react,vue}/src/scroller/scroller.spec.{ts,tsx}` must continue to pass unmodified after this plan — this plan only *adds* tests for the new content-template path, never edits an existing assertion. If any existing test needs to change, that is a signal this plan has drifted from "additive-only" and must stop and report, not silently adjust the existing test.
- **Mirror the cited real upstream mechanism exactly, per framework — do not invent a shape.** Angular: `@ContentChild('content')` + `TemplateRef`, dispatched via `*ngTemplateOutlet`, matching `scroller.ts:450,54-56`. React: an optional `contentTemplate?: (options: ScrollerContentOptions) => React.ReactNode` prop, matching `VirtualScroller.js:729,753`. Vue: a `content` scoped slot, matching `VirtualScroller.vue:4-20`. Do not add an `item`-level template/slot/render-prop in this plan — real Table never uses that finer-grained mechanism (confirmed, both Table research passes), and adding it now would be speculative scope beyond what any known consumer needs.
- **The content-template context/options object shape, re-verified against real source this review pass (the original planning pass under-specified this — corrected here):** real upstream's own `getContentOptions()`/`defaultOptions`/content-slot-props are richer than a bare `{itemSize}`. Confirmed real fields, all three frameworks (PrimeNG `scroller.ts:1191-1210` `getContentOptions()`; PrimeReact `VirtualScroller.js:729-748` `defaultOptions`; PrimeVue `VirtualScroller.vue:5-17` content slot props): `items` (the windowed slice — Angular's `loadedItems`/React's `loadedItems()`/Vue's `loadedItems`), `getItemOptions(index)`/`getOptions(index)` (a **per-item metadata function**, not a static style object — real shape confirmed at PrimeNG `scroller.ts:1213-1224`: `{index, count, first, last, even, odd}`, positional/boundary metadata only, no `top`/style offset field — positioning itself is computed by the consumer's own absolutely-positioned rendering, not handed down pre-computed), `itemSize`, `rows`/`columns` (pass-through of Scroller's own `rows`/`columns` inputs, relevant to Table's multi-column case), `loading`/`d_loading` (current loading-state flag — see the loading-path note below). Angular/React additionally expose `spacerStyle`/`contentStyle` and `contentRef`/`spacerRef` measurement-plumbing callbacks (PrimeNG's own template composes these structurally rather than exposing refs through the options object the same way; PrimeReact `VirtualScroller.js:730-747` exposes `spacerRef`/`contentRef`/`stickyRef` explicitly, and real `DataTable.js:1942-1950` wires `options.spacerRef` through to keep scroll-height spacer sizing correct when a `contentTemplate` is supplied). **This plan's content-template options object must include, at minimum: `items`, `getItemOptions(index)` returning `{index, count, first, last, even, odd}`, `itemSize`, `loading`.** `rows`/`columns` are out of scope for this plan (Ultimate's `UScroller` has no `columns` input — single-array `items` only, per its already-shipped API) and are correctly omitted, not deferred-and-forgotten. `spacerRef`/`contentRef`-equivalent plumbing is deferred as a `NEEDS IMPLEMENTATION-TIME VERIFICATION` item (see Task 1/3/5's own notes) since Ultimate's `UScroller` currently sizes its content wrapper via a plain `height` style on the `data-u-scroller-content` div (not a separate spacer element), so the real upstream's spacer-ref plumbing may not have a direct Ultimate equivalent to wire — do not invent one without re-verifying `UScroller`'s own real sizing mechanism first.
- **`disabled`/`loading` interaction with the content template, verified against real source this review pass:** real PrimeNG has a *separate* template branch (`#disabledContainer`, `scroller.ts:89-94`) that also dispatches `contentTemplate` when `disabled` is true, but with a different, narrower context (`{$implicit: items, options: {rows: _items, columns: loadedColumns}}` — no `getItemOptions`, since disabled mode renders the full unwindowed list, not a virtualized window). Ultimate's `UScroller` already has its own `disabled` input (shipped, unchanged by this plan) whose existing behavior is "render every item, not just the windowed slice" (`visibleItems()`'s existing `if (this.disabled())` branch, `scroller.ts:142-144` — already shipped code, not part of this plan). **This plan's content-template dispatch must still fire when `disabled()` is true**, with `items` reflecting the full list (matching `UScroller`'s already-shipped disabled behavior) rather than the windowed slice — Tasks 1/3/5 must each include an explicit test for `disabled=true` + content-template-supplied, confirming the consumer's template receives the full item list, not an empty/incorrectly-windowed one. Real PrimeReact's `VirtualScroller.js:759`-region special-cases `props.disabled` similarly (calls `contentTemplate` with `{items: props.items, rows: props.items, columns: props.columns}` — the raw, unwindowed props, not the computed windowed state) — confirming this is a genuine cross-framework pattern, not an Angular-only quirk, and must be tested in all three frameworks, not just Angular.
- **Loading state**: `loading()` is an existing shipped `UScroller` input (unchanged). Real `getContentOptions()`/`defaultOptions` expose the current loading flag to the content template (`loading`, per the field list above) so a consumer can render its own loading UI inside its own markup if it chooses — this plan exposes that flag but does not require Tasks 1/3/5 to build any Table-side loading UI (out of scope, Table's own concern later). Verify in Tasks 1/3/5 that supplying a content template does not suppress `UScroller`'s own existing built-in loader (`cx('loader')`/`u-scroller-loading-icon`, already shipped) incorrectly — real upstream's own loader rendering is a structurally separate concern from the content-template dispatch (confirmed: PrimeNG's loader markup sits in the same template region but outside the `contentTemplate`/`buildInContent` conditional, `scroller.ts` template lines ~40-53 precede the content dispatch at line 54), so Ultimate's existing loader block should likewise remain visually independent of which content path renders — each of Tasks 1/3/5 must add one test confirming the existing loader still renders correctly (or correctly does not render, per `loading()`'s existing semantics) when a content template is also supplied, not just when it is absent.
- **`ResizeObserver` test-mock convention, carried forward from the original Scroller plan**: constructing `new ResizeObserver(() => {})` inside a test silently overwrites the shared mock's captured `resizeObserverCallback`, discarding the component's real captured callback. Always re-invoke the already-captured `resizeObserverCallback` (see `packages/ng/src/scroller/scroller.spec.ts:15-38`'s existing mock setup) rather than constructing a second observer inside a test.
- **Angular OnPush/signal convention, carried forward**: any new internal state that can be mutated by a code path outside a template event (e.g., a getter recomputing content-template context on each render is fine since it's read during change detection; but if this plan introduces any new field mutated imperatively, it must be a `signal()`, not a plain field, per the same root cause documented in the original Scroller plan's `_contentSize` and the Paginator plan's `_first`).
- **`fixture.nativeElement` is the Angular host element**, not a template child — content-template tests that need to assert on projected markup must use `querySelector`/`querySelectorAll` (subtree search), matching the convention already established and re-verified across the Paginator and Table planning passes.
- No new `@ultimate/uix-data` primitive, no ADR-043 change, no Blueprint change. This plan does not touch `packages/uix-data/`.
- No change to `UScroller`'s style module's existing class slots (`root`/`content`/`item`/`loader`) is required by this plan — the content-template path reuses the existing `content` class slot for its wrapper if the consumer's own template doesn't override it, or the consumer's own template supplies its own classes entirely (matching real upstream: Table's own `<table>` markup carries Table's own classes, not Scroller's `item` class). If a task discovers a genuine need for a new style slot, flag it as an open question rather than adding one silently.
- Provenance manifest entries go into the existing per-package files (`docs/architecture/provenance/{ng,react,vue}.json`), extending the existing Scroller entries' `originalPath`/`ultimateDestination` schema — no new per-component file.

---

## Task Group A — Angular (`@ultimate/ng`)

### Task 1: Angular — `@ContentChild('content')` + `ngTemplateOutlet` dispatch

**Files:**
- Modify: `packages/ng/src/scroller/scroller.ts`
- Test: `packages/ng/src/scroller/scroller.spec.ts` (extend)

**Interfaces:**
- Consumes: existing `visibleItems()`/windowing state (already shipped)
- Produces: `@ContentChild('content') contentTemplate?: TemplateRef<UScrollerContentContext>` where `UScrollerContentContext = { $implicit: {index: number; value: unknown}[]; options: { getItemOptions: (index: number) => {index: number; count: number; first: boolean; last: boolean; even: boolean; odd: boolean}; itemSize: number; loading: boolean } }` — corrected shape per the Global Constraints re-verification (real `getContentOptions()`, `scroller.ts:1191-1210`/`1213-1224`), not the originally-drafted `{itemSize}`-only shape — when present, dispatched via `*ngTemplateOutlet` instead of the built-in per-item `@for` block; when absent, today's built-in rendering runs unchanged — consumed by Table's (currently blocked) Task 9 once this plan merges

- [ ] **Step 1: Write the failing test**

```typescript
// append to packages/ng/src/scroller/scroller.spec.ts
import { Component, ViewChild } from "@angular/core";

@Component({
  standalone: true,
  imports: [UScroller],
  template: `
    <u-scroller [items]="items" [itemSize]="30" [loading]="loading" [disabled]="disabled">
      <ng-template #content let-visibleItems let-options="options">
        <table data-test-content-template>
          <tbody>
            @for (item of visibleItems; track item.index) {
              <tr [attr.data-index]="item.index" [attr.data-first]="options.getItemOptions(item.index).first">
                <td>{{ item.value }}</td>
              </tr>
            }
          </tbody>
        </table>
      </ng-template>
    </u-scroller>
  `,
})
class ContentTemplateHostComponent {
  items = Array.from({ length: 50 }, (_, i) => `Row ${i}`);
  loading = false;
  disabled = false;
  @ViewChild(UScroller) scroller!: UScroller;
}

describe("UScroller content template (Task 1)", () => {
  it("renders the consumer-supplied content template instead of the built-in item divs when #content is provided", () => {
    const fixture = TestBed.createComponent(ContentTemplateHostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("[data-test-content-template]")).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll("[data-u-scroller-item]").length).toBe(0);
    expect(fixture.nativeElement.querySelectorAll("tr[data-index]").length).toBeGreaterThan(0);
  });

  it("still renders the built-in item divs when no #content template is supplied (existing behavior unchanged)", () => {
    const fixture = TestBed.createComponent(UScroller);
    fixture.componentRef.setInput("items", ["a", "b", "c"]);
    fixture.componentRef.setInput("itemSize", 30);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll("[data-u-scroller-item]").length).toBeGreaterThan(0);
  });

  it("exposes a real options.getItemOptions(index) returning {index, count, first, last, even, odd} — matching real PrimeNG's getOptions() shape", () => {
    const fixture = TestBed.createComponent(ContentTemplateHostComponent);
    fixture.detectChanges();
    const firstRow = fixture.nativeElement.querySelector("tr[data-index='0']");
    expect(firstRow.getAttribute("data-first")).toBe("true");
  });

  it("dispatches the content template with the full unwindowed item list when disabled=true, matching UScroller's existing shipped disabled behavior (spec: no reduced/empty list)", () => {
    const fixture = TestBed.createComponent(ContentTemplateHostComponent);
    fixture.componentInstance.disabled = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll("tr[data-index]").length).toBe(50);
  });

  it("still renders the existing built-in loader when loading=true, independent of whether a content template is supplied", () => {
    const fixture = TestBed.createComponent(ContentTemplateHostComponent);
    fixture.componentInstance.loading = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-scroller-loader")).not.toBeNull();
    // The content template itself still renders alongside the loader — this
    // plan does not suppress one for the other, matching real upstream's
    // structurally-independent loader/content-dispatch regions.
    expect(fixture.nativeElement.querySelector("[data-test-content-template]")).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/ng test -- --include='**/scroller.spec.ts'`
Expected: FAIL — `[data-test-content-template]` not found (no `@ContentChild('content')` exists yet)

- [ ] **Step 3: Write minimal implementation**

Add `@ContentChild('content') protected contentTemplate?: TemplateRef<UScrollerContentContext>;` to `UScroller` (with the corrected `UScrollerContentContext` type from this task's Interfaces above, exported alongside `UScroller` for consumers). Add a `protected getItemOptions(index: number)` method returning `{index, count: this.items().length, first: index === 0, last: index === this.items().length - 1, even: index % 2 === 0, odd: index % 2 !== 0}`, mirroring real PrimeNG's `getOptions(renderedIndex)` (`scroller.ts:1213-1224`) exactly — note real PrimeNG's `index` accounts for the windowed offset (`this.first + renderedIndex`); Ultimate's `visibleItems()` already returns absolute (not renderedIndex-relative) indices per its existing shipped implementation, so `getItemOptions` takes the already-absolute index directly, no offset arithmetic needed here (verify this against `visibleItems()`'s actual shipped return shape before implementing — it already returns `{index, value}` pairs with `index` as the absolute array index, confirmed by reading `scroller.ts`'s existing `visibleItems()` method this planning pass). In the template, wrap the existing `data-u-scroller-content` `<div>` block: when `contentTemplate` is present, render `<ng-container *ngTemplateOutlet="contentTemplate; context: { $implicit: visibleItems(), options: { getItemOptions: getItemOptions.bind(this), itemSize: itemSize(), loading: loading() ?? false } }"></ng-container>` in place of the built-in `@for (item of visibleItems(); ...)` block; when absent, keep today's built-in rendering exactly as-is (no behavior change to the existing path). The outer `data-u-scroller-content` positioning `<div>` (height/absolute-positioning wrapper) stays either way — only the *inner* per-item rendering is replaced by the outlet, matching real PrimeNG's own structure where the content template replaces the inner rendering, not Scroller's outer scroll-viewport shell. **`disabled` interaction**: `visibleItems()` already branches on `disabled()` in its existing shipped implementation (returns the full `liveItems` list, not the windowed slice, when `disabled()` is true — confirmed, `scroller.ts`'s existing `visibleItems()` method) — since this task's content-template dispatch reuses `visibleItems()` as-is, the disabled-mode full-list behavior is inherited automatically, requiring no separate disabled-specific branch in the content-template dispatch itself (unlike real PrimeNG's separate `#disabledContainer` template region, which exists because PrimeNG's own `disabled` handling is structured differently — Ultimate's simpler single-`visibleItems()`-source-of-truth design already covers both cases through one dispatch path). The loader block (`cx('loader')`, already shipped, unchanged) remains outside/sibling to this conditional, exactly as it is today — no restructuring needed, since it already sits outside the content-rendering `<div>` in the current shipped template.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/ng test -- --include='**/scroller.spec.ts'`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/ng/src/scroller/scroller.ts packages/ng/src/scroller/scroller.spec.ts
git commit -m "feat(ng): add UScroller content-template composition point (ContentChild + ngTemplateOutlet)"
```

---

### Task 2: Angular — verify existing tests unaffected, verify options context shape against real usage

**Files:**
- Test: `packages/ng/src/scroller/scroller.spec.ts` (no new assertions expected — verification task)

**Interfaces:**
- Consumes: Task 1's `contentTemplate`
- Produces: nothing new — confirms the additive-only constraint held

- [ ] **Step 1: Write the failing test**

N/A — this task runs the full existing Scroller spec file (unmodified since before Task 1) to confirm zero regressions, not a new assertion.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/ng test -- --include='**/scroller.spec.ts'`
Expected: this step is a baseline check, not expected to fail — if any pre-existing test now fails, that is a real regression introduced by Task 1 and must be fixed in Task 1's own file before proceeding, per the "additive-only" Global Constraint. Do not adjust the pre-existing test to accommodate a regression.

- [ ] **Step 3: Write minimal implementation**

None expected. If Step 2 reveals a regression, the fix belongs in `packages/ng/src/scroller/scroller.ts` (Task 1's file), re-verified here.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/ng test -- --include='**/scroller.spec.ts'`
Expected: PASS, full file, no regressions.

- [ ] **Step 5: Commit**

No commit if nothing changed. If a Task-1 regression was fixed, commit that fix with a message describing the specific regression resolved (not a new feature commit).

---

## Task Group B — React (`@ultimate/react`)

### Task 3: React — `contentTemplate` render-prop

**Files:**
- Modify: `packages/react/src/scroller/scroller.tsx`
- Test: `packages/react/src/scroller/scroller.spec.tsx` (extend)

**Interfaces:**
- Consumes: existing `visibleItems`/windowing state (already shipped)
- Produces: `contentTemplate?: (options: UScrollerContentOptions) => React.ReactNode` prop on `UScrollerProps` where `UScrollerContentOptions = { items: {index: number; value: unknown}[]; getItemOptions: (index: number) => {index: number; count: number; first: boolean; last: boolean; even: boolean; odd: boolean}; itemSize: number; loading: boolean }` — corrected shape per the Global Constraints re-verification (real `defaultOptions`, `VirtualScroller.js:729-748`), not the originally-drafted `{items, itemSize}`-only shape — when present, called instead of the built-in per-item `.map()` rendering; when absent, today's built-in rendering runs unchanged — consumed by Table's (currently blocked) Task 15b once this plan merges

- [ ] **Step 1: Write the failing test**

```tsx
// append to packages/react/src/scroller/scroller.spec.tsx
describe("UScroller content template (Task 3)", () => {
  it("renders the consumer-supplied contentTemplate instead of the built-in item divs when provided", () => {
    const items = Array.from({ length: 50 }, (_, i) => `Row ${i}`);
    const { container } = render(
      <UScroller
        items={items}
        itemSize={30}
        contentTemplate={({ items: visible }) => (
          <table data-test-content-template>
            <tbody>
              {visible.map((entry) => (
                <tr key={entry.index} data-index={entry.index}>
                  <td>{String(entry.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      />
    );
    expect(container.querySelector("[data-test-content-template]")).not.toBeNull();
    expect(container.querySelectorAll("[data-u-scroller-item]").length).toBe(0);
    expect(container.querySelectorAll("tr[data-index]").length).toBeGreaterThan(0);
  });

  it("still renders the built-in item divs when no contentTemplate is supplied (existing behavior unchanged)", () => {
    const { container } = render(<UScroller items={["a", "b", "c"]} itemSize={30} />);
    expect(container.querySelectorAll("[data-u-scroller-item]").length).toBeGreaterThan(0);
  });

  it("exposes a real getItemOptions(index) returning {index, count, first, last, even, odd} — matching real PrimeReact's getOptions() shape", () => {
    const items = ["a", "b", "c"];
    const { container } = render(
      <UScroller
        items={items}
        itemSize={30}
        contentTemplate={({ items: visible, getItemOptions }) => (
          <table data-test-content-template>
            <tbody>
              {visible.map((entry) => (
                <tr key={entry.index} data-index={entry.index} data-first={String(getItemOptions(entry.index).first)}>
                  <td>{String(entry.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      />
    );
    expect(container.querySelector("tr[data-index='0']")?.getAttribute("data-first")).toBe("true");
  });

  it("passes the full unwindowed item list when disabled=true, matching UScroller's existing shipped disabled behavior", () => {
    const items = Array.from({ length: 50 }, (_, i) => `Row ${i}`);
    const { container } = render(
      <UScroller
        items={items}
        itemSize={30}
        disabled
        contentTemplate={({ items: visible }) => (
          <table data-test-content-template>
            <tbody>
              {visible.map((entry) => (
                <tr key={entry.index} data-index={entry.index}>
                  <td>{String(entry.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      />
    );
    expect(container.querySelectorAll("tr[data-index]").length).toBe(50);
  });

  it("still renders the existing built-in loader when loading=true, independent of whether contentTemplate is supplied", () => {
    const { container } = render(
      <UScroller
        items={["a", "b"]}
        itemSize={30}
        loading
        contentTemplate={() => <table data-test-content-template />}
      />
    );
    expect(container.querySelector(".u-scroller-loader")).not.toBeNull();
    expect(container.querySelector("[data-test-content-template]")).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/react test -- scroller.spec.tsx`
Expected: FAIL — `contentTemplate` prop not recognized/rendered

- [ ] **Step 3: Write minimal implementation**

Add `contentTemplate?: (options: UScrollerContentOptions) => React.ReactNode` to `UScrollerProps` (with the corrected `UScrollerContentOptions` type from this task's Interfaces above, exported alongside `UScroller`). Add a `getItemOptions(index: number)` function in the component body returning `{index, count: items.length, first: index === 0, last: index === items.length - 1, even: index % 2 === 0, odd: index % 2 !== 0}`, mirroring real PrimeReact's `getOptions(index)` shape (matching the same real per-item metadata fields confirmed for Angular's Task 1). In the component body, replace the inner `data-u-scroller-content` `<div>`'s per-item `.map()` rendering with a conditional: `{contentTemplate ? contentTemplate({ items: visibleItems, getItemOptions, itemSize, loading: loading ?? false }) : visibleItems.map(...)}` (today's existing built-in mapping unchanged as the `else` branch). The outer positioning `<div data-u-scroller-content>` wrapper stays either way — only the inner rendering swaps, matching Task 1's Angular equivalent and real PrimeReact's own `contentTemplate`-vs-default-`itemTemplate` split. **`disabled` interaction**: `visibleItems` (the existing shipped `const visibleItems = disabled ? items.map(...) : ...` branch, already in `scroller.tsx`) already returns the full list when `disabled` is true — since this task's `contentTemplate` dispatch consumes the same `visibleItems` value, the disabled-mode full-list behavior is inherited automatically, no separate disabled-specific branch needed, matching Angular's equivalent reasoning in Task 1. The loader block (`cx('loader')`, already shipped, unchanged) remains a structurally separate sibling, unaffected by this change.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/react test -- scroller.spec.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/scroller/scroller.tsx packages/react/src/scroller/scroller.spec.tsx
git commit -m "feat(react): add UScroller contentTemplate render-prop composition point"
```

---

### Task 4: React — verify existing tests unaffected

**Files:**
- Test: `packages/react/src/scroller/scroller.spec.tsx` (no new assertions expected — verification task)

**Interfaces:**
- Consumes: Task 3's `contentTemplate`
- Produces: nothing new — confirms the additive-only constraint held

- [ ] **Step 1: Write the failing test**

N/A — verification task, same structure as Task 2.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/react test -- scroller.spec.tsx`
Expected: baseline check; any regression must be fixed in Task 3's file, not by editing a pre-existing assertion.

- [ ] **Step 3: Write minimal implementation**

None expected.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/react test -- scroller.spec.tsx`
Expected: PASS, full file, no regressions.

- [ ] **Step 5: Commit**

No commit if nothing changed; otherwise commit the specific regression fix.

---

## Task Group C — Vue (`@ultimate/vue`)

### Task 5: Vue — `content` scoped slot

**Files:**
- Modify: `packages/vue/src/scroller/Scroller.vue`
- Test: `packages/vue/src/scroller/scroller.spec.ts` (extend)

**Interfaces:**
- Consumes: existing `visibleItems`/windowing state (already shipped)
- Produces: a `content` scoped slot exposing `{ items: {index, value}[], getItemOptions: (index: number) => {index, count, first, last, even, odd}, itemSize, loading }` — corrected shape per the Global Constraints re-verification (real content-slot props, `VirtualScroller.vue:5-17`), not the originally-drafted `{items, itemSize}`-only shape — when a consumer supplies `#content`, it replaces the built-in per-item `v-for` rendering; when absent, today's built-in rendering runs unchanged — consumed by Table's (currently blocked) Task 21b once this plan merges

- [ ] **Step 1: Write the failing test**

```typescript
// append to packages/vue/src/scroller/scroller.spec.ts
import { h } from "vue";

describe("UScroller content template (Task 5)", () => {
  it("renders the consumer-supplied #content slot instead of the built-in item divs when provided", () => {
    const wrapper = mount(UScroller, {
      props: { items: Array.from({ length: 50 }, (_, i) => `Row ${i}`), itemSize: 30 },
      slots: {
        content: (slotProps: { items: { index: number; value: unknown }[] }) =>
          h(
            "table",
            { "data-test-content-template": true },
            [
              h(
                "tbody",
                {},
                slotProps.items.map((entry) =>
                  h("tr", { key: entry.index, "data-index": entry.index }, [h("td", {}, String(entry.value))])
                )
              ),
            ]
          ),
      },
    });
    expect(wrapper.find("[data-test-content-template]").exists()).toBe(true);
    expect(wrapper.findAll("[data-u-scroller-item]").length).toBe(0);
    expect(wrapper.findAll("tr[data-index]").length).toBeGreaterThan(0);
  });

  it("still renders the built-in item divs when no #content slot is supplied (existing behavior unchanged)", () => {
    const wrapper = mount(UScroller, { props: { items: ["a", "b", "c"], itemSize: 30 } });
    expect(wrapper.findAll("[data-u-scroller-item]").length).toBeGreaterThan(0);
  });

  it("exposes a real getItemOptions(index) returning {index, count, first, last, even, odd} — matching real PrimeVue's getOptions() shape", () => {
    const wrapper = mount(UScroller, {
      props: { items: ["a", "b", "c"], itemSize: 30 },
      slots: {
        content: (slotProps: {
          items: { index: number; value: unknown }[];
          getItemOptions: (index: number) => { first: boolean };
        }) =>
          h(
            "table",
            { "data-test-content-template": true },
            [
              h(
                "tbody",
                {},
                slotProps.items.map((entry) =>
                  h(
                    "tr",
                    { key: entry.index, "data-index": entry.index, "data-first": String(slotProps.getItemOptions(entry.index).first) },
                    [h("td", {}, String(entry.value))]
                  )
                )
              ),
            ]
          ),
      },
    });
    expect(wrapper.find("tr[data-index='0']").attributes("data-first")).toBe("true");
  });

  it("passes the full unwindowed item list when disabled=true, matching UScroller's existing shipped disabled behavior", () => {
    const wrapper = mount(UScroller, {
      props: { items: Array.from({ length: 50 }, (_, i) => `Row ${i}`), itemSize: 30, disabled: true },
      slots: {
        content: (slotProps: { items: { index: number; value: unknown }[] }) =>
          h(
            "table",
            { "data-test-content-template": true },
            [
              h(
                "tbody",
                {},
                slotProps.items.map((entry) => h("tr", { key: entry.index, "data-index": entry.index }, [h("td", {}, String(entry.value))]))
              ),
            ]
          ),
      },
    });
    expect(wrapper.findAll("tr[data-index]").length).toBe(50);
  });

  it("still renders the existing built-in loader when loading=true, independent of whether #content is supplied", () => {
    const wrapper = mount(UScroller, {
      props: { items: ["a", "b"], itemSize: 30, loading: true },
      slots: { content: () => h("table", { "data-test-content-template": true }) },
    });
    expect(wrapper.find(".u-scroller-loader").exists()).toBe(true);
    expect(wrapper.find("[data-test-content-template]").exists()).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/vue test -- scroller.spec.ts`
Expected: FAIL — `content` slot not recognized/rendered

- [ ] **Step 3: Write minimal implementation**

In `Scroller.vue`'s script, add a `getItemOptions(index)` method returning `{index, count: this.items.length, first: index === 0, last: index === this.items.length - 1, even: index % 2 === 0, odd: index % 2 !== 0}`, mirroring real PrimeVue's `getOptions(index)` shape (matching the same real per-item metadata fields confirmed for Angular/React's Tasks 1/3). In the template, wrap the existing `data-u-scroller-content` `<div>`'s inner `v-for` block: `<slot name="content" :items="visibleItems" :get-item-options="getItemOptions" :item-size="itemSize" :loading="loading">` with the current built-in `v-for` rendering as the slot's fallback content (Vue scoped slots render their default/fallback content automatically when the named slot isn't supplied by the consumer — no separate `v-if`/`v-else` branch needed, matching Vue's own idiom and real PrimeVue's `VirtualScroller.vue:4-25`'s identical fallback-content pattern). The outer positioning `<div data-u-scroller-content>` wrapper stays either way. **`disabled` interaction**: `visibleItems` (the existing shipped `if (this.disabled) { return this.items.map(...) }` branch, already in `Scroller.vue`'s computed) already returns the full list when `disabled` is true — since this task's `content` slot consumes the same `visibleItems` computed value, the disabled-mode full-list behavior is inherited automatically, no separate disabled-specific branch needed, matching Angular/React's equivalent reasoning in Tasks 1/3. The loader block (`v-if="loading"`, already shipped, unchanged) remains a structurally separate sibling, unaffected by this change.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/vue test -- scroller.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/vue/src/scroller/Scroller.vue packages/vue/src/scroller/scroller.spec.ts
git commit -m "feat(vue): add UScroller content scoped-slot composition point"
```

---

### Task 6: Vue — verify existing tests unaffected

**Files:**
- Test: `packages/vue/src/scroller/scroller.spec.ts` (no new assertions expected — verification task)

**Interfaces:**
- Consumes: Task 5's `content` slot
- Produces: nothing new — confirms the additive-only constraint held

- [ ] **Step 1: Write the failing test**

N/A — verification task, same structure as Tasks 2/4.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/vue test -- scroller.spec.ts`
Expected: baseline check; any regression must be fixed in Task 5's file, not by editing a pre-existing assertion.

- [ ] **Step 3: Write minimal implementation**

None expected.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/vue test -- scroller.spec.ts`
Expected: PASS, full file, no regressions.

- [ ] **Step 5: Commit**

No commit if nothing changed; otherwise commit the specific regression fix.

---

## Task Group D — Cross-Framework Verification, Provenance

### Task 7: Cross-framework content-template parity test

**Files:**
- Create: a small parity test per framework, or extend each `scroller.spec.{ts,tsx}` with one final labeled block confirming the three mechanisms produce equivalent capability (not identical DOM — the point is capability parity, not shared markup)

**Interfaces:**
- Consumes: Tasks 1/3/5's real implementations
- Produces: one test per framework proving the **exact nested structure** `table → tbody → tr → td` (element parentage, not just presence) renders through the content mechanism with correct row/cell counts, plus confirmation the built-in fallback still works when no content template/prop/slot is supplied — this is the concrete proof the mechanism is generic enough for a future `UTable` to use, not merely passing a synthetic test fixture

- [ ] **Step 1: Write the failing test**

Extend each framework's Task 1/3/5 test block with an assertion per framework that checks the **actual DOM nesting**, not just element presence — Tasks 1/3/5's existing tests query `tr[data-index]`/`td` at the container level, which does not by itself prove `td` is a *child* of `tr`, which is a child of `tbody`, which is a child of `table` (a malformed/flattened DOM could still satisfy "these three selectors all return non-zero results" without proving correct nesting). Add, per framework: `const table = container.querySelector("table[data-test-content-template]"); const tbody = table.querySelector("tbody"); expect(tbody?.parentElement).toBe(table); const rows = tbody.querySelectorAll(":scope > tr"); expect(rows.length).toBe(<expected windowed count>); rows.forEach(row => expect(row.querySelector(":scope > td")).not.toBeNull());` (Angular: `fixture.nativeElement`-rooted equivalent; Vue: `wrapper.element`-rooted equivalent) — this is a genuinely new assertion (direct-child scoping via `:scope >`), not a restatement of Tasks 1/3/5's existing presence checks, and is the actual close of "verify Task 7 proves actual semantic table markup: `table → tbody → tr → td`" from the review criteria.

- [ ] **Step 2: Run test to verify it fails**

Run each framework's scroller test filter. This is a genuine new assertion (direct-child `:scope >` nesting proof), not a restatement of an existing passing test — it may legitimately fail if Tasks 1/3/5's dispatch wraps the consumer's template in an unexpected extra element (e.g., the outer `data-u-scroller-content` positioning `<div>` landing *between* `tbody` and `table` instead of around the whole `<table>`), which would be a genuine composition defect to fix at its source (Task 1/3/5's own file), not a reason to weaken this test.

- [ ] **Step 3: Write minimal implementation**

None expected if Tasks 1/3/5 wrap the outlet/render-prop/slot correctly (dispatch replaces only the *inner* item-rendering, leaving the consumer's own `<table>` root un-wrapped by any Scroller-owned element, per each task's own Step 3 text). If Step 2 fails, the fix belongs in the offending framework's Task 1/3/5 file, not here.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/ng test -- --include='**/scroller.spec.ts'` / `pnpm --filter @ultimate/react test -- scroller.spec.tsx` / `pnpm --filter @ultimate/vue test -- scroller.spec.ts`
Expected: PASS (all three)

- [ ] **Step 5: Commit**

```bash
git add packages/ng/src/scroller/scroller.spec.ts packages/react/src/scroller/scroller.spec.tsx packages/vue/src/scroller/scroller.spec.ts
git commit -m "test: verify UScroller content-template mechanism achieves table-markup parity across frameworks"
```

---

### Task 8: Provenance manifest entries

**Files:**
- Modify: `docs/architecture/provenance/ng.json`
- Modify: `docs/architecture/provenance/react.json`
- Modify: `docs/architecture/provenance/vue.json`

**Interfaces:**
- Consumes: none
- Produces: one entry per modified file (Tasks 1/3/5's `scroller.ts`/`scroller.tsx`/`Scroller.vue` — modification, not new file), using the existing `originalPath`/`ultimateDestination`/`modificationStatus`/`modificationDescription` schema, citing the real upstream `contentTemplate`/`ContentChild`/scoped-slot mechanism this plan mirrors **with the exact pinned commit SHA per framework**, matching every other provenance entry in this repo's convention (verified this review pass — existing Paginator/Scroller entries always pair a file:line citation with the pinned upstream commit hash, never a line citation alone)

- [ ] **Step 1: Write the failing test**

Run `pnpm run provenance:validate -- --base-ref origin/main` against the branch's actual diff once Tasks 1-7 are committed.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm run provenance:validate -- --base-ref origin/main`
Expected: FAIL — modified `scroller.ts`/`scroller.tsx`/`Scroller.vue` have no updated manifest entry reflecting this change

- [ ] **Step 3: Write minimal implementation**

Update or append entries for `packages/ng/src/scroller/scroller.ts`, `packages/react/src/scroller/scroller.tsx`, `packages/vue/src/scroller/Scroller.vue`, each following the existing schema exactly: `originalPath` pointing at the real upstream file, `ultimateDestination` at the Ultimate file, `modificationStatus: "adapted"` (this is a structural adaptation of a real upstream mechanism into `UBaseComponent`'s own contract, not a verbatim copy — matching the same `modificationStatus` value already used by every other Scroller/Paginator entry in these manifests), and a `modificationDescription` that (a) names the exact real upstream mechanism mirrored, (b) cites the exact pinned commit SHA, not just a version number, and (c) states plainly that Ultimate's implementation is *informed by* the cited upstream mechanism, not copied verbatim — the type shapes, dispatch structure, and existing `UBaseComponent`/`useComponentBase`/`createBaseComponent` conventions are Ultimate's own, only the architectural mechanism (content-level composition point, generic per-item metadata via `getItemOptions`) is mirrored. Exact citations to use:
- Angular: `originalPath: "packages/primeng/src/scroller/scroller.ts"` (pinned commit `c493b1c6d9f7cdffbe1c4dc195493dd73d733593`, PrimeNG 21.1.9), `modificationDescription` citing `@ContentChild('content', {descendants: false})` (`scroller.ts:450`), the `ngTemplateOutlet` dispatch (`scroller.ts:54-56`), and `getOptions(renderedIndex)`'s real per-item metadata shape (`scroller.ts:1213-1224`) as the mechanisms this task's `contentTemplate`/`getItemOptions` are informed by.
- React: `originalPath: "packages/primereact/components/lib/virtualscroller/VirtualScroller.js"` (pinned commit `d0f574e39122668292fc7a740f081bae1b93b1e9`, PrimeReact 10.9.9), citing the `contentTemplate` prop and `defaultOptions` object (`VirtualScroller.js:716-753`) and `getOptions`'s real per-item metadata shape as the informing mechanism.
- Vue: `originalPath: "packages/primevue/src/virtualscroller/VirtualScroller.vue"` (pinned commit `66dde6788220fc9e6822342919d1ceb0e3460ece`, PrimeVue 4.5.5), citing the `content` scoped slot and its props (`VirtualScroller.vue:4-20`) and `getOptions`'s real per-item metadata shape as the informing mechanism.

All three commit SHAs and version numbers must match `docs/architecture/checksums.json`'s existing pinned entries exactly (already verified consistent with the Table spec's own citations of the same three commits, §21) — do not introduce a new or different SHA.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm run provenance:validate -- --base-ref origin/main`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add docs/architecture/provenance/ng.json docs/architecture/provenance/react.json docs/architecture/provenance/vue.json
git commit -m "docs(provenance): record UScroller content-template extension manifest entries"
```

---

## Acceptance Criteria

- [ ] `UScroller` gains one optional content-level composition point per framework, mirroring the cited real upstream mechanism exactly (Angular `ContentChild('content')`+`ngTemplateOutlet`; React `contentTemplate` render-prop; Vue `content` scoped slot) — Tasks 1, 3, 5.
- [ ] The content-template context/options object matches real upstream's own field set (`items`, `getItemOptions(index) → {index, count, first, last, even, odd}`, `itemSize`, `loading`), not an under-specified placeholder — Tasks 1, 3, 5 (corrected from an earlier draft that only exposed `itemSize`).
- [ ] `disabled=true` and `loading=true` are each explicitly tested against the content-template path — full unwindowed list on `disabled`, existing built-in loader unaffected/co-rendered on `loading` — Tasks 1, 3, 5.
- [ ] Zero regressions: every pre-existing `UScroller` test in all three frameworks passes unmodified — Tasks 2, 4, 6.
- [ ] The new mechanism is proven capable of rendering real semantic `table → tbody → tr → td` markup with correct parent/child nesting (not just element presence) and correct row/cell counts — Task 7.
- [ ] No new `@ultimate/uix-data` primitive, no existing `UScroller` public API renamed or removed — enforced throughout via the Global Constraints.
- [ ] Provenance manifest entries updated for all three modified files, each citing the exact pinned upstream commit SHA (not just a version number) and using "informed by," not "copied from," attribution language — Task 8.
- [ ] Full verification: `pnpm run build && pnpm run test && pnpm run typecheck && pnpm run provenance:validate -- --base-ref origin/main && pnpm run boundary:validate && pnpm run ceiling:validate` passes clean.

### Verification commands for the complete merged state

```bash
pnpm run build
pnpm run test
pnpm run typecheck
pnpm run provenance:validate -- --base-ref origin/main
pnpm run boundary:validate
pnpm run ceiling:validate
```

## What this plan does NOT do (explicitly out of scope)

- Does not modify `UTable`, the Table spec, or the Table implementation plan — those remain gated on this plan merging first, then resuming at the Table plan's blocked Tasks 9/15b/21b.
- Does not add an `item`-level template/slot/render-prop — real Table never uses one; adding it would be speculative scope beyond any known consumer's need.
- Does not touch `@ultimate/uix-data`.
- Does not change any existing `UScroller` prop/input/output/emit's name, type, or default behavior.

## No architectural fork encountered in this plan

The mechanism this plan implements was already the explicit output of the dedicated architecture research pass and the user's own decision ("Option A — separate UScroller composition work first, then resume Table"). Every task here mirrors a specific, cited real upstream mechanism — no invented API surface.
