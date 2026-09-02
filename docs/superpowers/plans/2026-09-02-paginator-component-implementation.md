# Paginator Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Ultimate's Paginator component — `UPaginator` — for Angular (`@ultimate/ng`), React (`@ultimate/react`), and Vue (`@ultimate/vue`), matching each framework's real upstream PrimeNG/PrimeReact/PrimeVue Paginator behavior exactly, as specified in `docs/superpowers/specs/2026-09-02-paginator-component-design.md`.

**Architecture:** Three independent, framework-native implementations sharing only `@ultimate/uix-data`'s `PaginationState` type and `getPageCount` function (unchanged, ADR-043). Each framework preserves its own real state-ownership model (Angular: internal `_first` reconciled via `ngOnChanges`; React: zero internal state, no uncontrolled fallback; Vue: internal `d_first`/`d_rows` plus full `v-model`). Page-link display math is implemented natively per framework from shared pseudocode (not imported from a package). Rows-per-page and jump-to-page dropdown controls are held back as a separate, explicitly gated task block pending Ultimate's own Select/InputNumber-equivalent components (see **Global Constraints**).

**Tech Stack:** Angular 21 standalone components + `ng-packagr` + Angular's own test runner (`ng test`, `TestBed`); React 18/19 function components + `tsup` + Vitest + `@testing-library/react`; Vue 3 Options API SFCs (`extends: createBaseComponent(...)`) + `tsup` + `vue-tsc` + Vitest + `@vue/test-utils`. All three consume `@ultimate/uix-data`, `@ultimate/{ng,react,vue}-core`, `@ultimate/uix-styles`.

**Spec:** `docs/superpowers/specs/2026-09-02-paginator-component-design.md` (commit `acac505`)

## Global Constraints

- `PaginationState { first, rows, totalRecords, rowsPerPageOptions? }` and `getPageCount(totalRecords, rows): number` are consumed from `@ultimate/uix-data` unchanged — no new export, no modification (ADR-043; spec §2, §5, §21 acceptance criterion 2).
- Page-link display algorithm (spec §9) is shared **pseudocode only**, reimplemented natively per framework — never imported from a shared package:
  ```text
  visiblePages = min(pageLinkSize, pageCount)
  start = max(0, ceil(currentPage - visiblePages / 2))
  end = min(pageCount - 1, start + visiblePages - 1)
  delta = pageLinkSize - (end - start + 1)
  start = max(0, start - delta)
  pageLinks = [start+1 .. end+1]   // 1-indexed for display
  ```
- State ownership must match each framework's real divergent model exactly (spec §8) — do not normalize:
  - **Angular**: `first` is a getter/setter-backed input with an internal `_first` field; reconciled from the parent's bound value inside `ngOnChanges` when `changes.first` is present; **no `firstChange` output**.
  - **React**: `first`/`rows` are read directly from props on every render; **zero internal state**; if `onPageChange` is not called or the parent doesn't update its own state, the UI does not advance.
  - **Vue**: internal reactive `d_first`/`d_rows`, initialized from props, watcher-synced when the parent's props change; emits `update:first`/`update:rows` (enabling `v-model:first`/`v-model:rows`) plus a descriptive `page` event.
- No new `@ultimate/uix-data` primitive, no ADR-043 change, no Blueprint change, no `BLUEPRINT_GAPS.md` change — these are out of scope for this plan.
- **Confirmed real-source verification, this planning pass**: `packages/{ng,react,vue}/src/*` contains no Select/InputNumber-equivalent component (only `autofocus`, `badge`, `button`, `checkbox`, `dialog`, `fluid`, `menu`, `ripple`, `tooltip` exist). Per the spec's own §22 framing ("if they don't exist yet, that becomes an ordinary prerequisite task ... not a blocked spec"), this plan proceeds with all controls that do **not** require a dropdown/select (first/prev/next/last buttons, page-links, current-page report) as fully concrete tasks now. Rows-per-page and jump-to-page **dropdown** controls are deferred to **Task Group D** (one task per framework), explicitly gated: each such task's first step is verifying whether an Ultimate Select-equivalent component has landed in `packages/{framework}/src/` by the time that task is picked up — if not, that task is not executable yet and must be raised back to the user rather than implemented with a placeholder or a raw unstyled native `<select>` masquerading as the real component API.
- Match every existing shipped-component convention exactly (verified this planning pass by reading `packages/{ng,react,vue}/src/button/*` in full): Angular components extend `UBaseComponent` (`@ultimate/ng-core`) with a `componentName`/`styleModule` pair and Angular signal `input()`/`output()`; React components use `useComponentBase({ componentName, styleModule })` from `@ultimate/react-core`; Vue components use `createBaseComponent({ componentName, styleModule })` from `@ultimate/vue-core` via `extends:`. Every style module is `{ css, classes }`, with `css` sourced from `@ultimate/uix-styles/<component>` and `classes` a local class-name-slot resolver object (`.p-*` renamed to `.u-*`).
- Provenance style tokens for Paginator already exist, vendored, at `.vendor-extracted/uix-styles-components/src/paginator/index.ts` (102 lines, real `dt('paginator.*')` token references) — this plan ports that file into `packages/uix-styles/src/paginator/index.ts` (Task 1), matching the exact pattern of the existing `packages/uix-styles/src/button/index.ts`. No component *logic* source is vendored yet (`.vendor-extracted/{ng,react,vue}` has no `paginator` directory) — real PrimeNG/PrimeReact/PrimeVue Paginator logic is read from the pinned cached tarballs (`.vendor-cache/{primeng,primereact,primevue}-<version>.tar.gz`, sha256-verified against `docs/architecture/checksums.json`) as each task requires it, per the spec's own citations.

---

## Task Group A — Shared Style Tokens

### Task 1: Port Paginator style tokens into `@ultimate/uix-styles`

**Files:**
- Create: `packages/uix-styles/src/paginator/index.ts`
- Modify: none (new subpath, no existing barrel to update — confirmed `packages/uix-styles/src/button/index.ts` has no parent barrel importing it; each component subpath is imported directly, e.g. `@ultimate/uix-styles/button`)
- Test: `packages/uix-styles/test/paginator.test.ts`

**Interfaces:**
- Consumes: nothing new (plain string export, matching `packages/uix-styles/src/button/index.ts`'s `export const style = ...` shape)
- Produces: `export const style: string` — importable as `@ultimate/uix-styles/paginator`, consumed by Task 3/9/15's `paginator-style.ts` files

- [ ] **Step 1: Write the failing test**

```typescript
// packages/uix-styles/test/paginator.test.ts
import { describe, it, expect } from "vitest";
import { style } from "../src/paginator";

describe("uix-styles paginator", () => {
  it("exports a non-empty CSS string with .u-paginator root selector", () => {
    expect(typeof style).toBe("string");
    expect(style).toContain(".u-paginator");
    expect(style).not.toContain(".p-paginator");
  });

  it("uses dt() token references for themeable properties", () => {
    expect(style).toContain("dt('paginator.");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/uix-styles test -- paginator.test.ts`
Expected: FAIL — `Cannot find module '../src/paginator'`

- [ ] **Step 3: Write minimal implementation**

Copy `.vendor-extracted/uix-styles-components/src/paginator/index.ts` (102 lines, already vendored, real `@primeuix/styles` paginator token source) to `packages/uix-styles/src/paginator/index.ts`, then apply a single find-and-replace across the copied file: every `.p-paginator` class selector becomes `.u-paginator` (matching the `.p-button` → `.u-button` rename already applied in `packages/uix-styles/src/button/index.ts` — verify the exact selector list by reading the copied file first, since the source has several compound selectors like `.p-paginator-page`, `.p-paginator-content`, `.p-paginator-page-selected`, etc., all of which need the same prefix swap). Do not alter the `dt('paginator.*')` token calls themselves — only the CSS class selectors.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/uix-styles test -- paginator.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/uix-styles/src/paginator/ packages/uix-styles/test/paginator.test.ts
git commit -m "feat(uix-styles): add paginator style tokens"
```

---

## Task Group B — Angular (`@ultimate/ng`)

### Task 2: Scaffold `UPaginator` — state, `PaginationState` consumption, `getPageCount`

**Files:**
- Create: `packages/ng/src/paginator/paginator.ts`
- Test: `packages/ng/src/paginator/paginator.spec.ts`

(`packages/ng/src/paginator/index.ts` does not exist yet — it is created in Task 5, once `UPaginator` has its full public surface worth exporting. This task's test imports `UPaginator` directly from `./paginator`, matching Task 5/6's own later distinction between the direct-module test target and the package barrel.)

**Interfaces:**
- Consumes: `PaginationState`, `getPageCount` from `@ultimate/uix-data`; `UBaseComponent` from `@ultimate/ng-core`
- Produces: `UPaginator` class with signal inputs `first = input(0)`, `rows = input(0)`, `totalRecords = input(0)`, `pageLinkSize = input(5)`; output `onPageChange = output<{ page: number; first: number; rows: number; pageCount: number }>()`; protected getter `pageCount(): number` (calls `getPageCount`); protected getter `page(): number` (`Math.floor(this._first / this.rows())`) — consumed internally by the template (bound via `data-page-count`) and by Task 3/4's rendering; kept `protected` (template-bindable, not part of the public class API) per this component's real access-control intent — tests assert against rendered DOM output, never `fixture.componentInstance.<protected member>`, matching Angular's own access rules (a `protected` class member is not readable from an external `.spec.ts` file, which is a different module than the component class)

- [ ] **Step 1: Write the failing test**

```typescript
// packages/ng/src/paginator/paginator.spec.ts
import { TestBed } from "@angular/core/testing";
import { beforeAll, describe, expect, it } from "vitest";
import { applyUltimateTheme } from "@ultimate/themes";
import { UPaginator } from "./paginator";

describe("UPaginator", () => {
  beforeAll(() => {
    applyUltimateTheme();
  });

  it("computes pageCount via uix-data's getPageCount, not a re-inlined formula", () => {
    const fixture = TestBed.createComponent(UPaginator);
    fixture.componentRef.setInput("totalRecords", 95);
    fixture.componentRef.setInput("rows", 10);
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute("data-page-count")).toBe("10");
  });

  it("computes pageCount as 0 when rows is 0 (getPageCount's zero-guard)", () => {
    const fixture = TestBed.createComponent(UPaginator);
    fixture.componentRef.setInput("totalRecords", 95);
    fixture.componentRef.setInput("rows", 0);
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute("data-page-count")).toBe("0");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/ng test -- --include='**/paginator.spec.ts'`
Expected: FAIL — `Cannot find module './paginator'`

- [ ] **Step 3: Write minimal implementation**

```typescript
// packages/ng/src/paginator/paginator.ts
import {
  ChangeDetectionStrategy,
  Component,
  SimpleChanges,
  ViewEncapsulation,
  input,
  output,
} from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { getPageCount } from "@ultimate/uix-data";
import { paginatorStyleModule } from "./paginator-style";

export interface PaginatorPageChangeEvent {
  page: number;
  first: number;
  rows: number;
  pageCount: number;
}

@Component({
  standalone: true,
  selector: "u-paginator",
  template: `<nav [class]="cx('root')" [attr.data-page-count]="pageCount"></nav>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UPaginator extends UBaseComponent {
  protected override readonly componentName = "paginator";
  protected override readonly styleModule = paginatorStyleModule;

  first = input(0);
  rows = input(0);
  totalRecords = input(0);
  pageLinkSize = input(5);

  onPageChange = output<PaginatorPageChangeEvent>();

  private _first = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["first"]) {
      this._first = changes["first"].currentValue;
    }
  }

  protected get pageCount(): number {
    return getPageCount(this.totalRecords(), this.rows());
  }

  protected get page(): number {
    return this.rows() > 0 ? Math.floor(this._first / this.rows()) : 0;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/ng test -- --include='**/paginator.spec.ts'`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/ng/src/paginator/paginator.ts packages/ng/src/paginator/paginator.spec.ts
git commit -m "feat(ng): scaffold UPaginator with uix-data state consumption"
```

---

### Task 3: Angular — style module, first/prev/next/last controls, `changePage`

**Files:**
- Modify: `packages/ng/src/paginator/paginator.ts`
- Create: `packages/ng/src/paginator/paginator-style.ts`
- Test: `packages/ng/src/paginator/paginator.spec.ts` (extend)

**Interfaces:**
- Consumes: `style` from `@ultimate/uix-styles/paginator` (Task 1)
- Produces: `changePage(first: number): void` (public, called by template click handlers and by Task 4's tests); `isFirstPage(): boolean`, `isLastPage(): boolean`, `empty(): boolean` getters — consumed by Task 5's disabled-state wiring

- [ ] **Step 1: Write the failing test**

```typescript
// append to packages/ng/src/paginator/paginator.spec.ts
it("advances first/page when changePage is called with a valid offset", () => {
  const fixture = TestBed.createComponent(UPaginator);
  fixture.componentRef.setInput("totalRecords", 95);
  fixture.componentRef.setInput("rows", 10);
  fixture.detectChanges();
  fixture.componentInstance.changePage(20);
  fixture.detectChanges();
  expect(fixture.nativeElement.getAttribute("data-page")).toBe("2");
});

it("emits onPageChange with {page, first, rows, pageCount} on changePage", () => {
  const fixture = TestBed.createComponent(UPaginator);
  fixture.componentRef.setInput("totalRecords", 95);
  fixture.componentRef.setInput("rows", 10);
  fixture.detectChanges();
  let emitted: unknown;
  fixture.componentInstance.onPageChange.subscribe((e: unknown) => (emitted = e));
  fixture.componentInstance.changePage(20);
  expect(emitted).toEqual({ page: 2, first: 20, rows: 10, pageCount: 10 });
});

it("internal first advances even before the parent updates its bound [first] input", () => {
  // Verifies the Angular-specific finding from spec §8: the component's own
  // _first is the source of truth for rendering between parent updates.
  const fixture = TestBed.createComponent(UPaginator);
  fixture.componentRef.setInput("totalRecords", 95);
  fixture.componentRef.setInput("rows", 10);
  fixture.componentRef.setInput("first", 0);
  fixture.detectChanges();
  fixture.componentInstance.changePage(20);
  fixture.detectChanges();
  expect(fixture.nativeElement.getAttribute("data-page")).toBe("2");
  // Parent has NOT re-bound [first] yet — internal state still reflects the click.
});

it("reconciles internal first from a new bound [first] input via ngOnChanges", () => {
  const fixture = TestBed.createComponent(UPaginator);
  fixture.componentRef.setInput("totalRecords", 95);
  fixture.componentRef.setInput("rows", 10);
  fixture.componentRef.setInput("first", 0);
  fixture.detectChanges();
  fixture.componentRef.setInput("first", 30);
  fixture.detectChanges();
  expect(fixture.nativeElement.getAttribute("data-page")).toBe("3");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/ng test -- --include='**/paginator.spec.ts'`
Expected: FAIL — `changePage is not a function`

- [ ] **Step 3: Write minimal implementation**

```typescript
// packages/ng/src/paginator/paginator-style.ts
import { style as paginatorStyle } from "@ultimate/uix-styles/paginator";

const css = /*css*/ `
    ${paginatorStyle}
`;

const classes = {
  root: () => "u-paginator u-component",
  content: () => "u-paginator-content",
  first: (params: { disabled?: boolean } = {}) => [
    "u-paginator-first",
    { "u-paginator-first-disabled": params.disabled },
  ],
  prev: (params: { disabled?: boolean } = {}) => [
    "u-paginator-prev",
    { "u-paginator-prev-disabled": params.disabled },
  ],
  next: (params: { disabled?: boolean } = {}) => [
    "u-paginator-next",
    { "u-paginator-next-disabled": params.disabled },
  ],
  last: (params: { disabled?: boolean } = {}) => [
    "u-paginator-last",
    { "u-paginator-last-disabled": params.disabled },
  ],
  page: (params: { selected?: boolean } = {}) => [
    "u-paginator-page",
    { "u-paginator-page-selected": params.selected },
  ],
};

export const paginatorStyleModule = { css, classes };
```

Extend `paginator.ts`:

```typescript
// add to UPaginator class body
protected get isFirstPage(): boolean {
  return this.page === 0;
}

protected get isLastPage(): boolean {
  return this.page === this.pageCount - 1;
}

protected get empty(): boolean {
  return this.pageCount === 0;
}

changePage(first: number): void {
  const pc = this.pageCount;
  const p = this.rows() > 0 ? Math.floor(first / this.rows()) : 0;
  if (p >= 0 && p < pc) {
    this._first = first;
    this.onPageChange.emit({ page: p, first, rows: this.rows(), pageCount: pc });
  }
}

protected goFirst(): void {
  this.changePage(0);
}

protected goPrev(): void {
  this.changePage(Math.max(0, this._first - this.rows()));
}

protected goNext(): void {
  this.changePage(this._first + this.rows());
}

protected goLast(): void {
  this.changePage((this.pageCount - 1) * this.rows());
}
```

Update `@Component({ template: ... })` to a first/prev/next/last button row (bound to `goFirst()`/`goPrev()`/`goNext()`/`goLast()`, `[disabled]` bound to `isFirstPage`/`isLastPage`) — full template markup is written in Task 5 alongside `aria-label`/`aria-current`/`disabled` wiring; this task's template stays a minimal `<nav [class]="cx('root')" [attr.data-page-count]="pageCount" [attr.data-page]="page">` shell plus the four buttons with `(click)` handlers only, no accessibility attributes yet (added in Task 5 so each task has one clear, independently reviewable concern). `data-page` is added here (alongside Task 2's `data-page-count`) as the observable, DOM-readable proxy for the `protected page` getter, so tests never reach into a protected class member from outside the component (`page` stays `protected` — it is not part of `UPaginator`'s intended public class API, only its template-bindable/DOM-observable surface).

```html
<nav [class]="cx('root')" [attr.data-page-count]="pageCount" [attr.data-page]="page">
  <div [class]="cx('content')">
    <button type="button" [class]="cx('first', {disabled: isFirstPage})" [disabled]="isFirstPage" (click)="goFirst()"></button>
    <button type="button" [class]="cx('prev', {disabled: isFirstPage})" [disabled]="isFirstPage" (click)="goPrev()"></button>
    <button type="button" [class]="cx('next', {disabled: isLastPage})" [disabled]="isLastPage" (click)="goNext()"></button>
    <button type="button" [class]="cx('last', {disabled: isLastPage})" [disabled]="isLastPage" (click)="goLast()"></button>
  </div>
</nav>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/ng test -- --include='**/paginator.spec.ts'`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/ng/src/paginator/paginator.ts packages/ng/src/paginator/paginator-style.ts packages/ng/src/paginator/paginator.spec.ts
git commit -m "feat(ng): add UPaginator first/prev/next/last controls and changePage"
```

---

### Task 4: Angular — page-link display algorithm

**Files:**
- Modify: `packages/ng/src/paginator/paginator.ts`
- Test: `packages/ng/src/paginator/paginator.spec.ts` (extend)

**Interfaces:**
- Consumes: `pageCount` (Task 2), `page` (Task 2), `pageLinkSize` input (Task 2)
- Produces: `pageLinks(): number[]` getter (1-indexed page numbers to render) — consumed by Task 5's template

- [ ] **Step 1: Write the failing test**

```typescript
// append to packages/ng/src/paginator/paginator.spec.ts
describe("pageLinks (Global Constraints page-link algorithm)", () => {
  it("returns all pages when pageCount <= pageLinkSize", () => {
    const fixture = TestBed.createComponent(UPaginator);
    fixture.componentRef.setInput("totalRecords", 30);
    fixture.componentRef.setInput("rows", 10);
    fixture.componentRef.setInput("pageLinkSize", 5);
    fixture.detectChanges();
    expect(fixture.componentInstance.pageLinks).toEqual([1, 2, 3]);
  });

  it("returns a pageLinkSize-wide centered window on a middle page", () => {
    const fixture = TestBed.createComponent(UPaginator);
    fixture.componentRef.setInput("totalRecords", 200);
    fixture.componentRef.setInput("rows", 10);
    fixture.componentRef.setInput("pageLinkSize", 5);
    fixture.componentRef.setInput("first", 90);
    fixture.detectChanges();
    fixture.componentInstance.changePage(90);
    expect(fixture.componentInstance.pageLinks).toEqual([8, 9, 10, 11, 12]);
  });

  it("clamps the window at the last page without shrinking pageLinkSize", () => {
    const fixture = TestBed.createComponent(UPaginator);
    fixture.componentRef.setInput("totalRecords", 200);
    fixture.componentRef.setInput("rows", 10);
    fixture.componentRef.setInput("pageLinkSize", 5);
    fixture.detectChanges();
    fixture.componentInstance.changePage(190);
    expect(fixture.componentInstance.pageLinks).toEqual([16, 17, 18, 19, 20]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/ng test -- --include='**/paginator.spec.ts'`
Expected: FAIL — `pageLinks is not a function` / `undefined`

- [ ] **Step 3: Write minimal implementation**

```typescript
// add to UPaginator class body in paginator.ts
protected get pageLinks(): number[] {
  const pageCount = this.pageCount;
  const pageLinkSize = this.pageLinkSize();
  const currentPage = this.page;

  const visiblePages = Math.min(pageLinkSize, pageCount);
  let start = Math.max(0, Math.ceil(currentPage - visiblePages / 2));
  const end = Math.min(pageCount - 1, start + visiblePages - 1);
  const delta = pageLinkSize - (end - start + 1);
  start = Math.max(0, start - delta);

  const links: number[] = [];
  for (let i = start; i <= end; i++) {
    links.push(i + 1);
  }
  return links;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/ng test -- --include='**/paginator.spec.ts'`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/ng/src/paginator/paginator.ts packages/ng/src/paginator/paginator.spec.ts
git commit -m "feat(ng): add UPaginator page-link display algorithm"
```

---

### Task 5: Angular — page-link buttons, accessibility (`aria-label`, `aria-current`, `<nav>` root), `index.ts` export

**Files:**
- Modify: `packages/ng/src/paginator/paginator.ts`
- Create: `packages/ng/src/paginator/index.ts`
- Test: `packages/ng/src/paginator/paginator.spec.ts` (extend)

**Interfaces:**
- Consumes: `pageLinks` (Task 4), `changePage` (Task 3)
- Produces: `UPaginator` fully exported from `packages/ng/src/paginator/index.ts` — consumed by `packages/ng/src/index.ts` (Task 6)

- [ ] **Step 1: Write the failing test**

```typescript
// append to packages/ng/src/paginator/paginator.spec.ts
it("renders one button per pageLinks entry, marking the current page aria-current=page", () => {
  const fixture = TestBed.createComponent(UPaginator);
  fixture.componentRef.setInput("totalRecords", 95);
  fixture.componentRef.setInput("rows", 10);
  fixture.detectChanges();
  const pageButtons = fixture.nativeElement.querySelectorAll("[data-u-paginator-page]");
  expect(pageButtons.length).toBe(10);
  expect(pageButtons[0].getAttribute("aria-current")).toBe("page");
  expect(pageButtons[1].getAttribute("aria-current")).toBeNull();
});

it("clicking a page-link button navigates to that page", () => {
  const fixture = TestBed.createComponent(UPaginator);
  fixture.componentRef.setInput("totalRecords", 95);
  fixture.componentRef.setInput("rows", 10);
  fixture.detectChanges();
  const pageButtons = fixture.nativeElement.querySelectorAll("[data-u-paginator-page]");
  pageButtons[2].click();
  fixture.detectChanges();
  const updatedPageButtons = fixture.nativeElement.querySelectorAll("[data-u-paginator-page]");
  expect(updatedPageButtons[2].getAttribute("aria-current")).toBe("page");
});

it("root element is a semantic <nav>", () => {
  const fixture = TestBed.createComponent(UPaginator);
  fixture.detectChanges();
  expect(fixture.nativeElement.querySelector("nav")).not.toBeNull();
});

it("first/prev/next/last controls have aria-label attributes", () => {
  const fixture = TestBed.createComponent(UPaginator);
  fixture.componentRef.setInput("totalRecords", 95);
  fixture.componentRef.setInput("rows", 10);
  fixture.detectChanges();
  expect(fixture.nativeElement.querySelector("[data-u-paginator-first]").hasAttribute("aria-label")).toBe(true);
  expect(fixture.nativeElement.querySelector("[data-u-paginator-prev]").hasAttribute("aria-label")).toBe(true);
  expect(fixture.nativeElement.querySelector("[data-u-paginator-next]").hasAttribute("aria-label")).toBe(true);
  expect(fixture.nativeElement.querySelector("[data-u-paginator-last]").hasAttribute("aria-label")).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/ng test -- --include='**/paginator.spec.ts'`
Expected: FAIL — page-link buttons not found (template not yet rendering them)

- [ ] **Step 3: Write minimal implementation**

Extend the `@Component({ template: ... })` in `paginator.ts` to add page-link buttons and `aria-label`s (labels are static English strings in this task — locale/translation lookup is `NEEDS IMPLEMENTATION-TIME VERIFICATION` per spec §20/§12, out of scope here; this task only guarantees every control has *an* `aria-label`, matching the spec's confirmed-vocabulary acceptance criterion):

```html
<nav [class]="cx('root')" [attr.data-page-count]="pageCount" [attr.data-page]="page">
  <div [class]="cx('content')">
    <button type="button" data-u-paginator-first [class]="cx('first', {disabled: isFirstPage})" [disabled]="isFirstPage" aria-label="First Page" (click)="goFirst()"></button>
    <button type="button" data-u-paginator-prev [class]="cx('prev', {disabled: isFirstPage})" [disabled]="isFirstPage" aria-label="Previous Page" (click)="goPrev()"></button>
    @for (link of pageLinks; track link) {
      <button
        type="button"
        data-u-paginator-page
        [class]="cx('page', {selected: link - 1 === page})"
        [attr.aria-current]="link - 1 === page ? 'page' : null"
        [attr.aria-label]="'Page ' + link"
        (click)="changePage((link - 1) * rows())"
      >{{ link }}</button>
    }
    <button type="button" data-u-paginator-next [class]="cx('next', {disabled: isLastPage})" [disabled]="isLastPage" aria-label="Next Page" (click)="goNext()"></button>
    <button type="button" data-u-paginator-last [class]="cx('last', {disabled: isLastPage})" [disabled]="isLastPage" aria-label="Last Page" (click)="goLast()"></button>
  </div>
</nav>
```

```typescript
// packages/ng/src/paginator/index.ts
export { UPaginator } from "./paginator";
export type { PaginatorPageChangeEvent } from "./paginator";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/ng test -- --include='**/paginator.spec.ts'`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/ng/src/paginator/paginator.ts packages/ng/src/paginator/index.ts packages/ng/src/paginator/paginator.spec.ts
git commit -m "feat(ng): add UPaginator page-link buttons and accessibility labels"
```

---

### Task 6: Angular — wire into package barrel and secondary entry point

**Files:**
- Modify: `packages/ng/src/index.ts`
- Modify: `packages/ng/package.json` (`description` field — add "Paginator" to the component list, matching the existing pattern: `"Ultimate Platform Angular components: Button, Checkbox, Dialog, Menu, Tooltip."`)
- Test: `packages/ng/src/paginator/paginator.spec.ts` (extend — package/export smoke test)

**Interfaces:**
- Consumes: `UPaginator` from `./paginator` (Task 5)
- Produces: `UPaginator` importable from `@ultimate/ng`'s root entry

- [ ] **Step 1: Write the failing test**

```typescript
// append to packages/ng/src/paginator/paginator.spec.ts
import { UPaginator as RootExport } from "../index";

it("is exported from the package root barrel", () => {
  expect(RootExport).toBe(UPaginator);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/ng test -- --include='**/paginator.spec.ts'`
Expected: FAIL — `RootExport` is `undefined`

- [ ] **Step 3: Write minimal implementation**

Read `packages/ng/src/index.ts` first to confirm the existing re-export pattern (one `export * from "./button"`-style line per component), then add:

```typescript
// add one line to packages/ng/src/index.ts, matching its existing per-component export style
export * from "./paginator";
```

Update `packages/ng/package.json`'s `"description"` field: `"Ultimate Platform Angular components: Button, Checkbox, Dialog, Menu, Paginator, Tooltip."` (alphabetical, matching the existing list's ordering convention).

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/ng test -- --include='**/paginator.spec.ts'`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/ng/src/index.ts packages/ng/package.json packages/ng/src/paginator/paginator.spec.ts
git commit -m "feat(ng): export UPaginator from package root"
```

---

## Task Group C — React (`@ultimate/react`)

### Task 7: Scaffold `UPaginator` — controlled props, `PaginationState`/`getPageCount` consumption

**Files:**
- Create: `packages/react/src/paginator/paginator.tsx`
- Create: `packages/react/src/paginator/index.ts`
- Test: `packages/react/src/paginator/paginator.spec.tsx`

**Interfaces:**
- Consumes: `getPageCount` from `@ultimate/uix-data`; `useComponentBase` from `@ultimate/react-core`
- Produces: `UPaginatorProps { first: number; rows: number; totalRecords: number; pageLinkSize?: number; onPageChange: (event: PaginatorPageChangeEvent) => void }`; `UPaginator: React.FC<UPaginatorProps>` — root `<nav>` carries a `data-page-count` attribute reflecting the computed `pageCount` (the same cross-framework convention Task 2/Task 10 use for Angular/Vue, so all three frameworks expose the identical DOM-observable proxy for this internal value) — consumed by Task 8

- [ ] **Step 1: Write the failing test**

This task's scope is state computation only (`pageCount`/`page`, derived from `getPageCount`) — no interactive controls render until Task 8. The test therefore asserts against the `data-page-count` attribute the scaffold exposes for exactly that reason, not against page-link buttons that don't exist yet:

```tsx
// packages/react/src/paginator/paginator.spec.tsx
/// <reference types="@testing-library/jest-dom" />
import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { UPaginator } from "./paginator";

describe("UPaginator", () => {
  it("computes pageCount via uix-data's getPageCount (10 pages for 95 records / 10 rows)", () => {
    const { container } = render(
      <UPaginator first={0} rows={10} totalRecords={95} onPageChange={vi.fn()} />
    );
    expect(container.querySelector("nav")?.getAttribute("data-page-count")).toBe("10");
  });

  it("computes pageCount as 0 when rows is 0 (getPageCount's zero-guard)", () => {
    const { container } = render(
      <UPaginator first={0} rows={0} totalRecords={95} onPageChange={vi.fn()} />
    );
    expect(container.querySelector("nav")?.getAttribute("data-page-count")).toBe("0");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/react test -- paginator.spec.tsx`
Expected: FAIL — `Cannot find module './paginator'`

- [ ] **Step 3: Write minimal implementation**

```tsx
// packages/react/src/paginator/paginator.tsx
import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { getPageCount } from "@ultimate/uix-data";
import { paginatorStyleModule } from "./paginator-style";

export interface PaginatorPageChangeEvent {
  page: number;
  first: number;
  rows: number;
  pageCount: number;
}

export interface UPaginatorProps {
  first: number;
  rows: number;
  totalRecords: number;
  pageLinkSize?: number;
  onPageChange: (event: PaginatorPageChangeEvent) => void;
}

export const UPaginator: React.FC<UPaginatorProps> = ({
  first,
  rows,
  totalRecords,
  pageLinkSize = 5,
  onPageChange,
}) => {
  const { cx } = useComponentBase({ componentName: "paginator", styleModule: paginatorStyleModule });

  const pageCount = getPageCount(totalRecords, rows);
  const page = rows > 0 ? Math.floor(first / rows) : 0;

  return <nav className={cx("root")} data-page-count={pageCount} />;
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/react test -- paginator.spec.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/paginator/paginator.tsx packages/react/src/paginator/paginator.spec.tsx
git commit -m "feat(react): scaffold UPaginator with uix-data state consumption"
```

---

### Task 8: React — style module, first/prev/next/last controls, page-links, `changePage`

**Files:**
- Modify: `packages/react/src/paginator/paginator.tsx`
- Create: `packages/react/src/paginator/paginator-style.ts`
- Test: `packages/react/src/paginator/paginator.spec.tsx` (extend)

**Interfaces:**
- Consumes: `style` from `@ultimate/uix-styles/paginator` (Task 1)
- Produces: fully rendered controls; `changePage(newFirst: number): void` internal helper that always calls `props.onPageChange` (no internal state, per spec §8/§13's React model) — consumed by Task 9's tests

- [ ] **Step 1: Write the failing test**

```tsx
// append to packages/react/src/paginator/paginator.spec.tsx
it("renders one button per page-link, matching the shared display algorithm", () => {
  const { container } = render(
    <UPaginator first={0} rows={10} totalRecords={30} pageLinkSize={5} onPageChange={vi.fn()} />
  );
  expect(container.querySelectorAll("[data-u-paginator-page]").length).toBe(3);
});

it("calls onPageChange with {page, first, rows, pageCount} when a page-link is clicked", () => {
  const onPageChange = vi.fn();
  const { container } = render(
    <UPaginator first={0} rows={10} totalRecords={95} onPageChange={onPageChange} />
  );
  const pageButtons = container.querySelectorAll("[data-u-paginator-page]");
  (pageButtons[2] as HTMLButtonElement).click();
  expect(onPageChange).toHaveBeenCalledWith({ page: 2, first: 20, rows: 10, pageCount: 10 });
});

it("does NOT advance the UI when onPageChange doesn't update props (confirms no uncontrolled fallback)", () => {
  const { container, rerender } = render(
    <UPaginator first={0} rows={10} totalRecords={95} onPageChange={() => {}} />
  );
  const nextButton = container.querySelector("[data-u-paginator-next]") as HTMLButtonElement;
  nextButton.click();
  rerender(<UPaginator first={0} rows={10} totalRecords={95} onPageChange={() => {}} />);
  const pageButtons = container.querySelectorAll("[data-u-paginator-page]");
  expect(pageButtons[0].getAttribute("aria-current")).toBe("page");
});

it("disables first/prev on the first page and next/last on the last page", () => {
  const { container } = render(
    <UPaginator first={0} rows={10} totalRecords={95} onPageChange={vi.fn()} />
  );
  expect((container.querySelector("[data-u-paginator-first]") as HTMLButtonElement).disabled).toBe(true);
  expect((container.querySelector("[data-u-paginator-prev]") as HTMLButtonElement).disabled).toBe(true);
  expect((container.querySelector("[data-u-paginator-next]") as HTMLButtonElement).disabled).toBe(false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/react test -- paginator.spec.tsx`
Expected: FAIL — page-link/control buttons not found

- [ ] **Step 3: Write minimal implementation**

```typescript
// packages/react/src/paginator/paginator-style.ts
import { style as paginatorStyle } from "@ultimate/uix-styles/paginator";

const css = /*css*/ `
    ${paginatorStyle}
`;

const classes = {
  root: () => "u-paginator u-component",
  content: () => "u-paginator-content",
  first: (params: { disabled?: boolean } = {}) => [
    "u-paginator-first",
    { "u-paginator-first-disabled": params.disabled },
  ],
  prev: (params: { disabled?: boolean } = {}) => [
    "u-paginator-prev",
    { "u-paginator-prev-disabled": params.disabled },
  ],
  next: (params: { disabled?: boolean } = {}) => [
    "u-paginator-next",
    { "u-paginator-next-disabled": params.disabled },
  ],
  last: (params: { disabled?: boolean } = {}) => [
    "u-paginator-last",
    { "u-paginator-last-disabled": params.disabled },
  ],
  page: (params: { selected?: boolean } = {}) => [
    "u-paginator-page",
    { "u-paginator-page-selected": params.selected },
  ],
};

export const paginatorStyleModule = { css, classes };
```

Rewrite `paginator.tsx`'s body:

```tsx
// replace the UPaginator function body in packages/react/src/paginator/paginator.tsx
export const UPaginator: React.FC<UPaginatorProps> = ({
  first,
  rows,
  totalRecords,
  pageLinkSize = 5,
  onPageChange,
}) => {
  const { cx } = useComponentBase({ componentName: "paginator", styleModule: paginatorStyleModule });

  const pageCount = getPageCount(totalRecords, rows);
  const page = rows > 0 ? Math.floor(first / rows) : 0;
  const isFirstPage = page === 0;
  const isLastPage = page === pageCount - 1;

  const changePage = (newFirst: number) => {
    const p = rows > 0 ? Math.floor(newFirst / rows) : 0;
    if (p >= 0 && p < pageCount) {
      onPageChange({ page: p, first: newFirst, rows, pageCount });
    }
  };

  const visiblePages = Math.min(pageLinkSize, pageCount);
  let start = Math.max(0, Math.ceil(page - visiblePages / 2));
  const end = Math.min(pageCount - 1, start + visiblePages - 1);
  const delta = pageLinkSize - (end - start + 1);
  start = Math.max(0, start - delta);
  const pageLinks: number[] = [];
  for (let i = start; i <= end; i++) pageLinks.push(i + 1);

  return (
    <nav className={cx("root")} data-page-count={pageCount}>
      <div className={cx("content")}>
        <button
          type="button"
          data-u-paginator-first
          className={cx("first", { disabled: isFirstPage }) as string}
          disabled={isFirstPage}
          aria-label="First Page"
          onClick={() => changePage(0)}
        />
        <button
          type="button"
          data-u-paginator-prev
          className={cx("prev", { disabled: isFirstPage }) as string}
          disabled={isFirstPage}
          aria-label="Previous Page"
          onClick={() => changePage(Math.max(0, first - rows))}
        />
        {pageLinks.map((link) => (
          <button
            key={link}
            type="button"
            data-u-paginator-page
            className={cx("page", { selected: link - 1 === page }) as string}
            aria-current={link - 1 === page ? "page" : undefined}
            aria-label={`Page ${link}`}
            onClick={() => changePage((link - 1) * rows)}
          >
            {link}
          </button>
        ))}
        <button
          type="button"
          data-u-paginator-next
          className={cx("next", { disabled: isLastPage }) as string}
          disabled={isLastPage}
          aria-label="Next Page"
          onClick={() => changePage(first + rows)}
        />
        <button
          type="button"
          data-u-paginator-last
          className={cx("last", { disabled: isLastPage }) as string}
          disabled={isLastPage}
          aria-label="Last Page"
          onClick={() => changePage((pageCount - 1) * rows)}
        />
      </div>
    </nav>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/react test -- paginator.spec.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/paginator/paginator.tsx packages/react/src/paginator/paginator-style.ts packages/react/src/paginator/paginator.spec.tsx
git commit -m "feat(react): add UPaginator controls, page-links, and controlled changePage"
```

---

### Task 9: React — package export, `index.ts`, root barrel, `tsup` entry

**Files:**
- Create: `packages/react/src/paginator/index.ts`
- Modify: `packages/react/src/index.ts`
- Modify: `packages/react/tsup.config.ts`
- Modify: `packages/react/package.json` (`exports` map + `description`)
- Test: `packages/react/src/paginator/paginator.spec.tsx` (extend — package/export smoke test)

**Interfaces:**
- Consumes: `UPaginator` from `./paginator` (Task 8)
- Produces: `UPaginator` importable from both `@ultimate/react` and `@ultimate/react/paginator`

- [ ] **Step 1: Write the failing test**

```tsx
// append to packages/react/src/paginator/paginator.spec.tsx
import { UPaginator as SubpathExport } from "./index";

it("is exported from its own subpath index", () => {
  expect(SubpathExport).toBe(UPaginator);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/react test -- paginator.spec.tsx`
Expected: FAIL — `Cannot find module './index'`

- [ ] **Step 3: Write minimal implementation**

```typescript
// packages/react/src/paginator/index.ts
export { UPaginator } from "./paginator";
export type { UPaginatorProps, PaginatorPageChangeEvent } from "./paginator";
```

Read `packages/react/src/index.ts` to confirm its existing re-export pattern, then add:

```typescript
// add one line to packages/react/src/index.ts, matching its existing per-component export style
export * from "./paginator";
```

Add a `"paginator/index": "src/paginator/index.ts"` entry to `packages/react/tsup.config.ts`'s `entry` object, matching the existing `button`/`checkbox`/`dialog`/`menu`/`tooltip` entries exactly.

Add a `"./paginator"` entry to `packages/react/package.json`'s `exports` map, matching the existing `"./button"` entry's exact shape (`types`/`import`/`default` all pointing at `./dist/paginator/index.*`). Update `"description"` to `"Ultimate Platform React components: Button, Checkbox, Dialog, Menu, Paginator, Tooltip."`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/react test -- paginator.spec.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/paginator/index.ts packages/react/src/index.ts packages/react/tsup.config.ts packages/react/package.json packages/react/src/paginator/paginator.spec.tsx
git commit -m "feat(react): export UPaginator from package root and dedicated subpath"
```

---

## Task Group D — Vue (`@ultimate/vue`)

### Task 10: Scaffold `UPaginator` — `createBaseComponent`, internal `d_first`/`d_rows`, `PaginationState`/`getPageCount` consumption

**Files:**
- Create: `packages/vue/src/paginator/base-paginator.ts`
- Create: `packages/vue/src/paginator/Paginator.vue`
- Create: `packages/vue/src/paginator/paginator-style.ts`
- Test: `packages/vue/src/paginator/paginator.spec.ts`

(`packages/vue/src/paginator/index.ts` does not exist yet — package/subpath export wiring is Task 12's concern, matching Angular's Task 2/5 and React's Task 7/9 split. This task tests `Paginator.vue` directly, the same way Task 2 (Angular) and Task 7 (React) test their own component module directly before any barrel/index exists.)

**Interfaces:**
- Consumes: `getPageCount` from `@ultimate/uix-data`; `createBaseComponent` from `@ultimate/vue-core`; `style` from `@ultimate/uix-styles/paginator` (Task 1 — the real port, not a placeholder; this task only needs the `root`/`content` class slots, extended with the remaining first/prev/next/last/page slots in Task 11)
- Produces: `UPaginator` SFC with props `first: Number`, `rows: Number`, `totalRecords: Number`, `pageLinkSize: { default: 5 }`; emits `page`, `update:first`, `update:rows`; data `d_first`, `d_rows` — consumed by Task 11

- [ ] **Step 1: Write the failing test**

```typescript
// packages/vue/src/paginator/paginator.spec.ts
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import UPaginator from "./Paginator.vue";

describe("UPaginator", () => {
  it("computes pageCount via uix-data's getPageCount, exposed as a data-page-count attribute", () => {
    const wrapper = mount(UPaginator, { props: { first: 0, rows: 10, totalRecords: 95 } });
    expect(wrapper.attributes("data-page-count")).toBe("10");
  });

  it("initializes internal d_first/d_rows from props", () => {
    const wrapper = mount(UPaginator, { props: { first: 20, rows: 10, totalRecords: 95 } });
    expect((wrapper.vm as unknown as { d_first: number }).d_first).toBe(20);
    expect((wrapper.vm as unknown as { d_rows: number }).d_rows).toBe(10);
  });

  it("watcher-syncs d_first when the parent updates the first prop", async () => {
    const wrapper = mount(UPaginator, { props: { first: 0, rows: 10, totalRecords: 95 } });
    await wrapper.setProps({ first: 30 });
    expect((wrapper.vm as unknown as { d_first: number }).d_first).toBe(30);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/vue test -- paginator.spec.ts`
Expected: FAIL — `Cannot find module './Paginator.vue'`

- [ ] **Step 3: Write minimal implementation**

```typescript
// packages/vue/src/paginator/paginator-style.ts
import { style as paginatorStyle } from "@ultimate/uix-styles/paginator";

const css = /*css*/ `
    ${paginatorStyle}
`;

// Only the two slots this task's template actually renders (root, content).
// Task 11 extends this same object with first/prev/next/last/page slots when
// it adds those controls — this is the real, final style-source wiring from
// day one, not a value later thrown away; nothing here is a placeholder.
const classes = {
  root: () => "u-paginator u-component",
  content: () => "u-paginator-content",
};

export const paginatorStyleModule = { css, classes };
```

```typescript
// packages/vue/src/paginator/base-paginator.ts
import { createBaseComponent } from "@ultimate/vue-core";
import { paginatorStyleModule } from "./paginator-style";
import type { ComponentOptions } from "vue";

export function createBasePaginator(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "paginator", styleModule: paginatorStyleModule }),
    props: {
      first: { type: Number, default: 0 },
      rows: { type: Number, default: 0 },
      totalRecords: { type: Number, default: 0 },
      pageLinkSize: { type: Number, default: 5 },
    },
    emits: ["page", "update:first", "update:rows"],
    data() {
      return {
        d_first: this.first,
        d_rows: this.rows,
      };
    },
    watch: {
      first(newValue: number) {
        this.d_first = newValue;
      },
      rows(newValue: number) {
        this.d_rows = newValue;
      },
    },
  };
}
```

```vue
<!-- packages/vue/src/paginator/Paginator.vue -->
<template>
  <nav :class="cx('root')" :data-page-count="pageCount"></nav>
</template>

<script>
import { getPageCount } from "@ultimate/uix-data";
import { createBasePaginator } from "./base-paginator";

export default {
  name: "UPaginator",
  extends: createBasePaginator(),
  computed: {
    pageCount() {
      return getPageCount(this.totalRecords, this.d_rows);
    },
    page() {
      return this.d_rows > 0 ? Math.floor(this.d_first / this.d_rows) : 0;
    },
  },
};
</script>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/vue test -- paginator.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/vue/src/paginator/base-paginator.ts packages/vue/src/paginator/Paginator.vue packages/vue/src/paginator/paginator-style.ts packages/vue/src/paginator/paginator.spec.ts
git commit -m "feat(vue): scaffold UPaginator with internal d_first/d_rows state"
```

---

### Task 11: Vue — style module, first/prev/next/last controls, page-links, `changePage`, `v-model`/`page` emit

**Files:**
- Modify: `packages/vue/src/paginator/Paginator.vue`
- Modify: `packages/vue/src/paginator/paginator-style.ts`
- Test: `packages/vue/src/paginator/paginator.spec.ts` (extend)

**Interfaces:**
- Consumes: `style` from `@ultimate/uix-styles/paginator` (Task 1)
- Produces: fully rendered controls; `changePage(newFirst)` method that mutates `d_first`/`d_rows`-derived state and emits `page` + `update:first` + `update:rows` — consumed by Task 12's tests

- [ ] **Step 1: Write the failing test**

```typescript
// append to packages/vue/src/paginator/paginator.spec.ts
it("renders one button per page-link, matching the shared display algorithm", () => {
  const wrapper = mount(UPaginator, { props: { first: 0, rows: 10, totalRecords: 30, pageLinkSize: 5 } });
  expect(wrapper.findAll("[data-u-paginator-page]").length).toBe(3);
});

it("emits page + update:first + update:rows when a page-link is clicked", async () => {
  const wrapper = mount(UPaginator, { props: { first: 0, rows: 10, totalRecords: 95 } });
  const pageButtons = wrapper.findAll("[data-u-paginator-page]");
  await pageButtons[2].trigger("click");
  expect(wrapper.emitted("page")?.[0]).toEqual([{ page: 2, first: 20, rows: 10, pageCount: 10 }]);
  expect(wrapper.emitted("update:first")?.[0]).toEqual([20]);
});

it("advances d_first internally even without a v-model consumer (Vue's own internal-state model)", async () => {
  const wrapper = mount(UPaginator, { props: { first: 0, rows: 10, totalRecords: 95 } });
  const nextButton = wrapper.find("[data-u-paginator-next]");
  await nextButton.trigger("click");
  expect((wrapper.vm as unknown as { d_first: number }).d_first).toBe(10);
});

it("v-model:first round-trips: emitted update:first reflected back as a new first prop advances d_first correctly", async () => {
  const wrapper = mount(UPaginator, { props: { first: 0, rows: 10, totalRecords: 95 } });
  await wrapper.find("[data-u-paginator-next]").trigger("click");
  const emittedFirst = wrapper.emitted("update:first")?.[0]?.[0];
  await wrapper.setProps({ first: emittedFirst as number });
  expect((wrapper.vm as unknown as { d_first: number }).d_first).toBe(10);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/vue test -- paginator.spec.ts`
Expected: FAIL — page-link/control buttons not found

- [ ] **Step 3: Write minimal implementation**

```typescript
// packages/vue/src/paginator/paginator-style.ts (extend Task 10's real module with the four remaining control slots + page slot; root/content and the css/paginatorStyle import already exist from Task 10, not recreated here)
import { style as paginatorStyle } from "@ultimate/uix-styles/paginator";

const css = /*css*/ `
    ${paginatorStyle}
`;

const classes = {
  root: () => "u-paginator u-component",
  content: () => "u-paginator-content",
  first: (params = {}) => ["u-paginator-first", { "u-paginator-first-disabled": params.disabled }],
  prev: (params = {}) => ["u-paginator-prev", { "u-paginator-prev-disabled": params.disabled }],
  next: (params = {}) => ["u-paginator-next", { "u-paginator-next-disabled": params.disabled }],
  last: (params = {}) => ["u-paginator-last", { "u-paginator-last-disabled": params.disabled }],
  page: (params = {}) => ["u-paginator-page", { "u-paginator-page-selected": params.selected }],
};

export const paginatorStyleModule = { css, classes };
```

```vue
<!-- packages/vue/src/paginator/Paginator.vue (replace template + script) -->
<template>
  <nav :class="cx('root')" :data-page-count="pageCount">
    <div :class="cx('content')">
      <button
        type="button"
        data-u-paginator-first
        :class="cx('first', { disabled: isFirstPage })"
        :disabled="isFirstPage"
        aria-label="First Page"
        @click="changePage(0)"
      />
      <button
        type="button"
        data-u-paginator-prev
        :class="cx('prev', { disabled: isFirstPage })"
        :disabled="isFirstPage"
        aria-label="Previous Page"
        @click="changePage(Math.max(0, d_first - d_rows))"
      />
      <button
        v-for="link in pageLinks"
        :key="link"
        type="button"
        data-u-paginator-page
        :class="cx('page', { selected: link - 1 === page })"
        :aria-current="link - 1 === page ? 'page' : null"
        :aria-label="'Page ' + link"
        @click="changePage((link - 1) * d_rows)"
      >{{ link }}</button>
      <button
        type="button"
        data-u-paginator-next
        :class="cx('next', { disabled: isLastPage })"
        :disabled="isLastPage"
        aria-label="Next Page"
        @click="changePage(d_first + d_rows)"
      />
      <button
        type="button"
        data-u-paginator-last
        :class="cx('last', { disabled: isLastPage })"
        :disabled="isLastPage"
        aria-label="Last Page"
        @click="changePage((pageCount - 1) * d_rows)"
      />
    </div>
  </nav>
</template>

<script>
import { getPageCount } from "@ultimate/uix-data";
import { createBasePaginator } from "./base-paginator";

export default {
  name: "UPaginator",
  extends: createBasePaginator(),
  computed: {
    pageCount() {
      return getPageCount(this.totalRecords, this.d_rows);
    },
    page() {
      return this.d_rows > 0 ? Math.floor(this.d_first / this.d_rows) : 0;
    },
    isFirstPage() {
      return this.page === 0;
    },
    isLastPage() {
      return this.page === this.pageCount - 1;
    },
    pageLinks() {
      const pageCount = this.pageCount;
      const pageLinkSize = this.pageLinkSize;
      const currentPage = this.page;
      const visiblePages = Math.min(pageLinkSize, pageCount);
      let start = Math.max(0, Math.ceil(currentPage - visiblePages / 2));
      const end = Math.min(pageCount - 1, start + visiblePages - 1);
      const delta = pageLinkSize - (end - start + 1);
      start = Math.max(0, start - delta);
      const links = [];
      for (let i = start; i <= end; i++) links.push(i + 1);
      return links;
    },
  },
  methods: {
    changePage(newFirst) {
      const pageCount = this.pageCount;
      const p = this.d_rows > 0 ? Math.floor(newFirst / this.d_rows) : 0;
      if (p >= 0 && p < pageCount) {
        this.d_first = newFirst;
        this.$emit("page", { page: p, first: newFirst, rows: this.d_rows, pageCount });
        this.$emit("update:first", newFirst);
        this.$emit("update:rows", this.d_rows);
      }
    },
  },
};
</script>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/vue test -- paginator.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/vue/src/paginator/Paginator.vue packages/vue/src/paginator/paginator-style.ts packages/vue/src/paginator/paginator.spec.ts
git commit -m "feat(vue): add UPaginator controls, page-links, and v-model support"
```

---

### Task 12: Vue — package export, root barrel, `tsup` entry, `aria-live` current-page report

**Files:**
- Modify: `packages/vue/src/paginator/Paginator.vue`
- Create: `packages/vue/src/paginator/index.ts`
- Modify: `packages/vue/src/index.ts`
- Modify: `packages/vue/tsup.config.ts` (if a per-component entry map exists — verify against `packages/react/tsup.config.ts`'s pattern first, since Vue's `tsup.config.ts` was not read in this planning pass in full; if Vue's config auto-discovers `src/*/index.ts` rather than listing entries explicitly, this step is a no-op and must be confirmed, not assumed)
- Modify: `packages/vue/package.json` (`exports` map + `description`)
- Test: `packages/vue/src/paginator/paginator.spec.ts` (extend)

**Interfaces:**
- Consumes: `UPaginator` from `./Paginator.vue` (Task 11)
- Produces: `UPaginator` importable from both `@ultimate/vue` and `@ultimate/vue/paginator`; current-page report element with `aria-live="polite"` (spec §12's confirmed Vue-specific finding)

- [ ] **Step 1: Write the failing test**

```typescript
// append to packages/vue/src/paginator/paginator.spec.ts
it("renders a current-page report region with aria-live=polite", () => {
  const wrapper = mount(UPaginator, { props: { first: 0, rows: 10, totalRecords: 95 } });
  const report = wrapper.find("[data-u-paginator-current-report]");
  expect(report.exists()).toBe(true);
  expect(report.attributes("aria-live")).toBe("polite");
});

it("root export from index.ts matches the direct component export", async () => {
  const DirectImport = (await import("./Paginator.vue")).default;
  const { UPaginator: IndexImport } = await import("./index");
  expect(IndexImport).toBe(DirectImport);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/vue test -- paginator.spec.ts`
Expected: FAIL — no `[data-u-paginator-current-report]` element rendered

- [ ] **Step 3: Write minimal implementation**

Add a current-page report element to `Paginator.vue`'s template, inside `.u-paginator-content`, after the last-page button:

```html
<span data-u-paginator-current-report :class="cx('currentPageReport')" aria-live="polite">{{ page + 1 }} of {{ pageCount }}</span>
```

Add a `currentPageReport` class-name slot to `paginator-style.ts`'s `classes` object: `currentPageReport: () => "u-paginator-current-report"`.

Create `packages/vue/src/paginator/index.ts`, matching `packages/vue/src/button/index.ts`'s exact re-export pattern (verify by reading that file before writing this one):

```typescript
// packages/vue/src/paginator/index.ts
export { default as UPaginator } from "./Paginator.vue";
```

Read `packages/vue/src/index.ts` to confirm its existing re-export pattern, then add:

```typescript
// add one line to packages/vue/src/index.ts, matching its existing per-component export style
export * from "./paginator";
```

Add a `"./paginator"` entry to `packages/vue/package.json`'s `exports` map, matching the existing `"./button"` entry's exact shape. Update `"description"` to `"Ultimate Platform Vue components: Button, Checkbox, Dialog, Menu, Paginator, Tooltip."`. If `packages/vue/tsup.config.ts` lists explicit per-component entries (verify by reading it), add `"paginator/index": "src/paginator/index.ts"` matching the existing pattern.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/vue test -- paginator.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/vue/src/paginator/Paginator.vue packages/vue/src/paginator/paginator-style.ts packages/vue/src/index.ts packages/vue/package.json packages/vue/src/paginator/paginator.spec.ts
git commit -m "feat(vue): export UPaginator and add current-page-report aria-live region"
```

(If `tsup.config.ts` needed a change, include it in this commit's `git add` list too.)

---

## Task Group E — Cross-Framework Verification and Gated Follow-Up

### Task 13: Cross-framework theme-consistency test (matching `UButton`'s established pattern)

**Files:**
- Modify: `packages/themes/test/cross-framework-consistency.test.ts`
- Modify: `packages/ng/src/paginator/paginator.spec.ts` (Angular's half — this convention proves the guarantee in two files, not one, per `UButton`'s own precedent below)
- Test: (this task's changes ARE the tests — no separate test file)

**Interfaces:**
- Consumes: `UPaginator` from `@ultimate/react/paginator` and `@ultimate/vue/paginator` (built `dist/` output — see the build-freshness note below); `dt` from `@ultimate/uix-styled`; `applyUltimateTheme` from `@ultimate/themes` (already imported at the top of `cross-framework-consistency.test.ts`); `TestBed` and `UPaginator` from `./paginator` for the Angular half

**What this test actually verifies** (confirmed by reading the real, already-existing `packages/themes/test/cross-framework-consistency.test.ts` in full, and its Angular counterpart in `packages/ng/src/button/button.spec.ts`, before writing this task): style/design-**token resolution** consistency — that the same `dt('paginator.background')` token call resolves to the identical `var(--u-paginator-background, ...)` CSS text regardless of which framework's `*-core` `StyleSheet` registered it. It is **not** a component-runtime-registration test (it does not assert that a component "renders" or "mounts correctly" in the abstract) — mounting a real `UPaginator` per framework is only the mechanism used to read each framework's own registered `<style>` element's text back out of the DOM; the assertion itself is always a `dt(...)`-resolved-token-text comparison. Do not restructure this into a broader smoke test.

Unlike `UButton`'s existing pair of tests — where React's real `button-style.ts` is confirmed (via that file's own header comment) to be static hand-written CSS with no `dt()` calls at all, forcing the existing test to only assert `not.toContain("dt(")` on React's side rather than asserting the actual token — Paginator's React implementation (Task 8) genuinely imports `style` from `@ultimate/uix-styles/paginator` the same way its Vue counterpart (Task 11) does. So this task's React assertion can assert the real resolved token text directly, the same way the Vue assertion already does for Button — there is no need to carry Button's React caveat forward into Paginator's version.

- [ ] **Step 1: Write the failing tests**

Append to `packages/themes/test/cross-framework-consistency.test.ts`, inside the existing `describe("cross-framework theme consistency", ...)` block, as a new nested `describe` sibling to the existing `"React and Vue's real UButton renders resolve the same token to the same text"` block (do not modify the existing Button tests):

```typescript
// append inside the existing describe("cross-framework theme consistency", () => { ... })
// block in packages/themes/test/cross-framework-consistency.test.ts, as a
// sibling to the existing UButton describe block
describe("React and Vue's real UPaginator renders resolve the same paginator.background token", () => {
  afterEach(() => {
    cleanup();
  });

  it("Vue's real UPaginator registers CSS containing the resolved paginator.background var(...) text, matching dt()'s own resolution", async () => {
    const { UPaginator } = await import("@ultimate/vue/paginator");

    const wrapper = mount(UPaginator, { props: { first: 0, rows: 10, totalRecords: 95 } });

    const styleEl = document.head.querySelector('style[data-u-style="paginator"]');
    expect(styleEl).not.toBeNull();
    const vueCss = styleEl!.textContent ?? "";

    expect(vueCss).toContain("var(--u-paginator-background");
    expect(vueCss).not.toContain("dt("); // no unresolved dt() calls leaked through

    const resolvedToken = dt("paginator.background");
    expect(vueCss).toContain(resolvedToken);

    wrapper.unmount();
  });

  it("React's real UPaginator registers CSS containing the resolved paginator.background var(...) text, matching dt()'s own resolution", async () => {
    const { UPaginator } = await import("@ultimate/react/paginator");

    render(
      React.createElement(UPaginator, {
        first: 0,
        rows: 10,
        totalRecords: 95,
        onPageChange: () => {},
      })
    );

    // react-core's StyleSheet, like ng-core's (see the Angular half of this
    // guarantee in packages/ng/src/paginator/paginator.spec.ts), registers
    // <style> elements with no identifying attribute — Vue's element is
    // excluded by its own data-u-style attribute, and the element is then
    // located by its known, unique .u-paginator selector, matching the
    // lookup approach already established for UButton's React half.
    const vueStyleEl = document.head.querySelector('style[data-u-style="paginator"]');
    const styleEl = Array.from(document.head.querySelectorAll("style:not([data-u-style])")).find(
      (el) => (el.textContent ?? "").includes(".u-paginator {")
    );
    expect(styleEl).not.toBeUndefined();
    expect(styleEl).not.toBe(vueStyleEl);
    const reactCss = styleEl!.textContent ?? "";

    expect(reactCss).toContain("var(--u-paginator-background");
    expect(reactCss).not.toContain("dt(");

    const resolvedToken = dt("paginator.background");
    expect(reactCss).toContain(resolvedToken);
  });
});
```

Append to `packages/ng/src/paginator/paginator.spec.ts` (Angular's third of the same guarantee — mirrors `packages/ng/src/button/button.spec.ts`'s existing final test exactly, substituting Paginator's own selector/token):

```typescript
// append to packages/ng/src/paginator/paginator.spec.ts
it("resolves the same paginator.background token as the React/Vue cross-framework consistency test (packages/themes/test/cross-framework-consistency.test.ts)", () => {
  const fixture = TestBed.createComponent(UPaginator);
  fixture.componentRef.setInput("totalRecords", 95);
  fixture.componentRef.setInput("rows", 10);
  fixture.detectChanges();

  // ngCoreStyleSheet's <style> elements carry no identifying attribute,
  // matching UButton's own Angular test — located by its known, unique
  // .u-paginator selector.
  const styleEl = Array.from(document.head.querySelectorAll("style")).find((el) =>
    (el.textContent ?? "").includes(".u-paginator {")
  );
  expect(styleEl).not.toBeUndefined();
  const ngCss = styleEl!.textContent ?? "";

  expect(ngCss).toContain("var(--u-paginator-background");
});
```

(This second block requires `dt`/`applyUltimateTheme`/`beforeAll` to already exist at the top of `paginator.spec.ts` from Task 2's own setup — verified present, Task 2's `describe` block already calls `applyUltimateTheme()` in a `beforeAll`, matching `button.spec.ts`'s exact precedent.)

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @ultimate/themes test -- cross-framework-consistency.test.ts` and `pnpm --filter @ultimate/ng test -- --include='**/paginator.spec.ts'`
Expected: the `@ultimate/themes` run FAILS with `Cannot find module '@ultimate/vue/paginator'` / `'@ultimate/react/paginator'` unless `packages/vue` and `packages/react` have already been rebuilt after Tasks 9/12 landed (see the build-freshness note in the existing file's header, lines 59-67 — this task inherits that same real, already-documented constraint; rebuild with `pnpm --filter @ultimate/vue --filter @ultimate/react build` first if the module resolves but the assertions fail unexpectedly). The `@ultimate/ng` run FAILS because the new `it(...)` block doesn't exist yet on a fresh file read — trivially, since Step 1 above is what adds it; treat this as satisfied once Step 1's text is in place and the styles genuinely haven't been asserted before.

- [ ] **Step 3: Write minimal implementation**

No production code change expected — this task's "implementation" is the tests themselves proving Tasks 3/8/11's real style modules resolve `paginator.background` consistently across all three frameworks. If either the `@ultimate/themes` or `@ultimate/ng` run fails after rebuilding, that is a real bug in the corresponding framework's `paginator-style.ts` (`packages/react/src/paginator/paginator-style.ts`, `packages/vue/src/paginator/paginator-style.ts`, or `packages/ng/src/paginator/paginator-style.ts`) to fix — never the test.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @ultimate/vue --filter @ultimate/react build && pnpm --filter @ultimate/themes test -- cross-framework-consistency.test.ts && pnpm --filter @ultimate/ng test -- --include='**/paginator.spec.ts'`
Expected: PASS (all three)

- [ ] **Step 5: Commit**

```bash
git add packages/themes/test/cross-framework-consistency.test.ts packages/ng/src/paginator/paginator.spec.ts
git commit -m "test(themes): verify UPaginator cross-framework token consistency"
```

---

### Task 14: Provenance manifest entries

**Files:**
- Create/Modify: `docs/architecture/provenance/paginator.json` (new file, following the existing `originalPath`/`ultimateDestination` schema used by Phase 1/2 components — read an existing component's provenance JSON, e.g. for `button`, before writing this one, to match the exact schema shape)
- Modify: `docs/architecture/PROVENANCE.md` (new package-level entry for Paginator, following the existing template)

**Interfaces:**
- Consumes: none (documentation only)
- Produces: provenance coverage satisfying `provenance:validate` for every new `.ts`/`.tsx`/`.vue` file created in Tasks 1-12

- [ ] **Step 1: Write the failing test**

Run: `pnpm run provenance:validate` (existing script)
Expected: FAIL — reports missing manifest entries for `packages/{ng,react,vue}/src/paginator/*` and `packages/uix-styles/src/paginator/*`

- [ ] **Step 2: N/A (validator-driven, not a hand-written test)**

- [ ] **Step 3: Write the provenance entries**

Read an existing provenance file (e.g. whatever file covers `packages/ng/src/button/`) to copy its exact JSON schema, then write `docs/architecture/provenance/paginator.json` with one entry per file created in Tasks 1-12, citing:
- `originalPath`: the real pinned-source file each Ultimate file adapts (`paginator.ts` for Angular, `Paginator.js` for React, `Paginator.vue` for Vue, `.vendor-extracted/uix-styles-components/src/paginator/index.ts` for the style tokens)
- `ultimateDestination`: the Ultimate file path
- Pinned revision identifiers, matching `docs/architecture/checksums.json`'s existing values (already cited throughout the Paginator spec's own §17)

Add a new package-level entry to `docs/architecture/PROVENANCE.md` for Paginator, following the existing template (see the spec's own §17 for the exact framing: MIT license inherited, `originalPath`/`ultimateDestination` schema, not `uix-data`'s `verifiedAgainst` schema).

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm run provenance:validate`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add docs/architecture/provenance/paginator.json docs/architecture/PROVENANCE.md
git commit -m "docs(provenance): add paginator component manifest entries"
```

---

### Task 15 (GATED — do not start until prerequisite confirmed): Rows-per-page and jump-to-page dropdown controls, all three frameworks

**Status: BLOCKED pending an Ultimate Select-equivalent component.**

**Files:** Not yet determined — depends entirely on whichever Select/Dropdown component API lands first.

**Interfaces:** Not yet determined.

- [ ] **Step 0 (mandatory, before any other step): Verify the prerequisite**

Run: `find packages/ng/src packages/react/src packages/vue/src -maxdepth 1 -type d`

If a Select/Dropdown-equivalent component now exists in all three frameworks' `src/` directories: this task can be planned concretely at that point — write a follow-up plan section (or a new plan document) mirroring Tasks 2-12's structure, wiring the rows-per-page dropdown to `rowsPerPageOptions` (spec §10) and gating `NEEDS IMPLEMENTATION-TIME VERIFICATION` items (React/Vue `showAll` parity, breakpoint-object template parity) with real source verification at that time.

If no such component exists yet: **do not implement this task**. Report back to the user that Paginator's rows-per-page/jump-to-page controls remain blocked on a Select-equivalent component, exactly as flagged in the spec's §17/§22/§Global-Constraints-above. First/prev/next/last navigation, page-links, and the current-page report (Tasks 1-14) are already complete, tested, and usable as a full paging control without rows-per-page/jump-to-page — this gate does not block shipping the rest of Paginator or starting Scroller's or Table's own plans.

---

## Self-Review

**Spec coverage** (`docs/superpowers/specs/2026-09-02-paginator-component-design.md`):
- §4 Public API by Framework → Tasks 2, 7, 10 (props/inputs), Task 3/8/11 (events/methods).
- §5 Shared vs Framework-Native → Global Constraints section; Tasks 2/7/10 consume `getPageCount` per §5's row 2 (closing the "re-inlined formula" finding).
- §8 State Ownership → Task 3 (Angular `ngOnChanges` reconciliation, tested explicitly), Task 8 (React no-fallback, tested explicitly), Task 11 (Vue watcher-sync + `v-model`, tested explicitly).
- §9 Page-Link Algorithm → Task 4 (Angular), Task 8 (React), Task 11 (Vue) — identical pseudocode, three native implementations, each with boundary-case tests.
- §10 Rows-Per-Page → Task 15, correctly gated rather than invented.
- §11 Templates/Slots → not implemented in this plan (spec itself marks the advanced breakpoint/template-object form `NEEDS IMPLEMENTATION-TIME VERIFICATION`; this plan ships the confirmed core navigation surface — a follow-up task can add template/slot customization once needed by a real consumer, not invented speculatively here per YAGNI)
- §12 Accessibility → Task 5 (Angular `<nav>`, `aria-label`, `aria-current`), Task 8 (React, same), Task 11/12 (Vue, same + `aria-live` current-page report, the one framework-specific confirmed finding)
- §14 Styling → Task 1 (shared token port), Task 3/8/11 (per-framework style module wiring)
- §17 Provenance → Task 14
- §18 Testing Matrix → covered across Tasks 2-13 (state consumption, page-link algorithm, state-ownership behavior, rows-per-page reset — deferred with Task 15, accessibility labels, dependency/provenance boundary validators reused as-is, cross-framework theme consistency in Task 13)
- §19 Known Divergences → deliberately preserved, not normalized, in Tasks 3/8/11's distinct state-ownership implementations
- §21 Acceptance Criteria → mapped 1:1: criterion 1 (Tasks 2-12), criterion 2 (Tasks 2/7/10 + Task 13's would-be regression guard), criterion 3 (Tasks 4/8/11), criterion 4 (Tasks 3/8/11), criterion 5 (Tasks 5/8/11-12), criterion 6 (Task 15's explicit gate), criterion 7 (Task 14)

**Placeholder scan**: no "TBD"/"implement later"/"add appropriate error handling" found in any task above. Task 15 is the one intentionally incomplete task — it is not a placeholder but an explicit, verified, evidence-based gate matching the spec's own framing and this plan's Global Constraints section; its Step 0 is itself a concrete, executable verification step, not a deferral without a defined trigger condition.

**Type/signature consistency**: `PaginatorPageChangeEvent { page, first, rows, pageCount }` is identical across Task 2 (Angular), Task 7 (React), and Task 10/11's Vue emit payload — verified by re-reading each task's event-emission code above. `changePage(first: number)` naming is consistent across all three frameworks' internal method name (Task 3, Task 8, Task 11). `cx(key, params)` call signature matches each framework's already-shipped `UBaseComponent`/`useComponentBase`/`createBaseComponent` contract exactly, verified against `packages/{ng,react,vue}-core`'s real source read during planning, not assumed.

**Plan-review-gate corrections applied** (post-initial-draft, before commit): (1) Task 2's `pageCount`/`page` tests rewritten to assert `data-page-count`/`data-page` DOM attributes rather than reaching into `protected` class members from an external `.spec.ts` — the same fix carried through Task 3's four affected tests and Task 5's click-navigation test (now asserts `aria-current`, matching an adjacent test already in the same task). (2) Task 10's placeholder `paginator-style.ts` (empty `css: ""`) removed — Task 10 now creates the real style module directly, sourced from `@ultimate/uix-styles/paginator`, with only the `root`/`content` slots it needs; Task 11 extends rather than replaces it. (3) Task 7's first test rewritten to assert `data-page-count` from the start (a legitimate cross-framework convention this plan uses in all three frameworks, not a page-link-dependent assertion later rewritten mid-task). (4)+(5) Task 13 rewritten with fully concrete assertions for all three frameworks, grounded in the real, already-existing `packages/themes/test/cross-framework-consistency.test.ts` and `packages/ng/src/button/button.spec.ts` conventions (read in full before writing), using the real `paginator.background` token confirmed present in the vendored style source — confirmed this is a token-resolution consistency test, not a component-runtime-registration test, and that Paginator's React module (unlike Button's) genuinely sources `dt()`-bearing CSS, so no React caveat carries over from Button's version. (6) Task 2's Files list no longer claims to create `index.ts` (that's Task 5). (7) Task 10 no longer creates or imports through `index.ts` (deferred entirely to Task 12, which now explicitly creates it) — Task 10's test imports `Paginator.vue` directly, matching Angular/React's own direct-module-first convention. A self-caught bug during this pass: Task 12's export-parity test originally destructured a non-existent named `{ UPaginator }` export from the SFC module (which only has a default export) — fixed to import the default export directly.
