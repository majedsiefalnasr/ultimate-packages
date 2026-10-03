# F1 Tabs / Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Angular and Vue Tabs show their overflow navigators correctly on first render, on resize and after content changes (GAP-071, GAP-072), and Angular Breadcrumb links keep their `url`/`#` href (GAP-073).

**Architecture:** Port the baseline Prime lifecycle triggers. PrimeNG 21.1.9 `tablist.ts` uses view-init plus a browser-only `ResizeObserver`. PrimeVue 4.5.5 `TabList.vue` uses `updated()`, a `ResizeObserver` and a `showNavigators` watcher. Breadcrumb adopts the structural `@if`/`@else` anchor split already shipped in Steps (GAP-053).

**Tech Stack:** Angular 21 (standalone, signals, OnPush), Vue 3 Options API, Vitest (jsdom), `@vue/test-utils`, Angular `TestBed`.

**Spec:** `docs/superpowers/specs/2026-10-02-prime-parity-followup-tabs-navigation-design.md`

## Global Constraints

- Parity baseline: PrimeNG 21.1.9 and PrimeVue 4.5.5 only (ADR-048); never port from newer Prime releases.
- No new public API (no new inputs, props or events) in `UTabList` (both frameworks) or `UBreadcrumb`.
- Angular `UTabs` gets no `scrollable` input; Vue's unused `scrollable` prop is not touched.
- Browser-only APIs (`ResizeObserver`) are created only under `isPlatformBrowser(this.platformId)` in Angular.
- GAP-072: an existing observer is always disconnected before a new one is bound (Spec §12).
- jsdom has no `ResizeObserver`; tests stub it with `vi.stubGlobal` and undo it with `vi.unstubAllGlobals()`.
- Run only per-package tests: `pnpm --filter @ultimate/ng test`, `pnpm --filter @ultimate/vue test`. Use Node 20 (`export PATH="$HOME/.nvm/versions/node/v20.19.2/bin:$PATH"`).
- Stage explicit files only; never `git add -A`.

## Review Focus

1. Tabs whose labels fit (no overflow) must show no navigator after the new init/resize checks. Covered by Task 1 and Task 2 "no overflow" tests.
2. `showNavigators=false` must never create an observer. Covered by Task 1 and Task 2 tests.
3. Toggling Vue `showNavigators` repeatedly must leave at most one live observer. Covered by the Task 2 toggle test.
4. A disabled Breadcrumb item that has a `routerLink` must not navigate when clicked. Covered by a Task 3 test.
5. An Angular server render must not construct `ResizeObserver` and must not throw on destroy. Covered by a Task 1 server test.

---

### Task 1: GAP-071 — Angular `UTabList` initial and resize overflow detection

**Files:**

- Modify: `packages/ng/src/tabs/tab-list.ts` (imports line 1, class comment lines 6-13, class body)
- Test: `packages/ng/src/tabs/tabs.spec.ts`

**Interfaces:**

- Consumes: `UBaseComponent`'s `protected readonly el: ElementRef` and `protected readonly platformId: object` (`packages/ng-core/src/basecomponent/base-component.ts:21-24`); existing `private updateButtonState()` (`tab-list.ts:70-76`).
- Produces: `UTabList implements AfterViewInit, OnDestroy`; private `bindResizeObserver()` / `unbindResizeObserver()`.

- [ ] **Step 1: Write the failing tests**

Append to `packages/ng/src/tabs/tabs.spec.ts` (add `PLATFORM_ID` to the `@angular/core` import and `afterEach, beforeEach, vi` to the `vitest` import):

```ts
describe("UTabList overflow navigators (GAP-071)", () => {
  let observers: { cb: ResizeObserverCallback; observed: Element[]; disconnected: boolean }[];

  beforeEach(() => {
    observers = [];
    vi.stubGlobal(
      "ResizeObserver",
      class {
        private readonly rec: {
          cb: ResizeObserverCallback;
          observed: Element[];
          disconnected: boolean;
        };
        constructor(cb: ResizeObserverCallback) {
          this.rec = { cb, observed: [], disconnected: false };
          observers.push(this.rec);
        }
        observe(target: Element) {
          this.rec.observed.push(target);
        }
        disconnect() {
          this.rec.disconnected = true;
        }
      }
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function mockWidths(scrollWidth: number, clientWidth: number) {
    vi.spyOn(Element.prototype, "scrollWidth", "get").mockReturnValue(scrollWidth);
    vi.spyOn(Element.prototype, "clientWidth", "get").mockReturnValue(clientWidth);
  }

  function nextButton(fixture: { nativeElement: HTMLElement }) {
    return fixture.nativeElement.querySelector('button[aria-label="Next"]');
  }

  it("shows the next navigator on first render when the tabs overflow", () => {
    mockWidths(500, 100);
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    fixture.detectChanges();
    expect(nextButton(fixture)).not.toBeNull();
  });

  it("shows no navigator on first render when the tabs fit", () => {
    mockWidths(100, 100);
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    fixture.detectChanges();
    expect(nextButton(fixture)).toBeNull();
    expect(fixture.nativeElement.querySelector('button[aria-label="Previous"]')).toBeNull();
  });

  it("re-computes navigator visibility when the tab list resizes", () => {
    mockWidths(100, 100);
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    expect(observers).toHaveLength(1);
    expect(observers[0].observed[0]).toBe(fixture.nativeElement.querySelector("u-tab-list"));

    vi.restoreAllMocks();
    mockWidths(500, 100);
    observers[0].cb([], {} as ResizeObserver);
    fixture.detectChanges();
    expect(nextButton(fixture)).not.toBeNull();
  });

  it("disconnects the observer on destroy", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    fixture.destroy();
    expect(observers[0].disconnected).toBe(true);
  });

  it("creates no observer when showNavigators is false", () => {
    TestBed.overrideTemplate(
      TestHostComponent,
      `<u-tabs [value]="value" [showNavigators]="false"><u-tab-list><u-tab [value]="0">A</u-tab></u-tab-list></u-tabs>`
    );
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    expect(observers).toHaveLength(0);
  });

  it("creates no ResizeObserver on the server platform and destroys cleanly", () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: "server" }] });
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    expect(() => fixture.destroy()).not.toThrow();
    expect(observers).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter @ultimate/ng test`
Expected: the first and third GAP-071 tests FAIL (no next button / `observers` length 0); the others may pass.

- [ ] **Step 3: Implement**

In `packages/ng/src/tabs/tab-list.ts`:

1. Change the import line to:

```ts
import { isPlatformBrowser } from "@angular/common";
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
  computed,
  inject,
  signal,
} from "@angular/core";
```

2. In the class comment (lines 6-13), replace these two lines:

```ts
 * prev/next scroll navigators for overflow. Reads `scrollable`/
 * `tabindex`/`showNavigators` from its nearest ancestor `UTabs` via
```

with:

```ts
 * prev/next scroll navigators for overflow. Reads `tabindex`/
 * `showNavigators` from its nearest ancestor `UTabs` via
```

so the comment no longer claims the component reads `scrollable` (Spec §5.1.4).

3. Change the class declaration and add the lifecycle members right after the existing `isNextButtonEnabled` signal:

```ts
export class UTabList extends UBaseComponent implements AfterViewInit, OnDestroy {
```

```ts
  private resizeObserver?: ResizeObserver;

  // Matches PrimeNG 21.1.9 tablist.ts:148-152 — compute navigator state once
  // the view exists, and keep it current on resize, in the browser only.
  ngAfterViewInit(): void {
    if (this.showNavigators() && isPlatformBrowser(this.platformId)) {
      this.updateButtonState();
      this.bindResizeObserver();
    }
  }

  ngOnDestroy(): void {
    this.unbindResizeObserver();
  }

  private bindResizeObserver(): void {
    this.unbindResizeObserver();
    this.resizeObserver = new ResizeObserver(() => this.updateButtonState());
    this.resizeObserver.observe(this.el.nativeElement);
  }

  private unbindResizeObserver(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
  }
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm --filter @ultimate/ng test`
Expected: all GAP-071 tests PASS; all pre-existing Tabs tests PASS. If any pre-existing Tabs test now throws `ResizeObserver is not defined`, move the `beforeEach`/`afterEach` stub from the GAP-071 `describe` to file level so every test in `tabs.spec.ts` has it.

- [ ] **Step 5: Typecheck and commit**

Run: `pnpm --filter @ultimate/ng run typecheck` — Expected: no errors.

```bash
git add packages/ng/src/tabs/tab-list.ts packages/ng/src/tabs/tabs.spec.ts
git commit -m "fix(ng): detect Tabs overflow on view init and resize (GAP-071)"
```

---

### Task 2: GAP-072 — Vue `UTabList` re-evaluation after mount

**Files:**

- Modify: `packages/vue/src/tabs/TabList.vue` (script section)
- Test: `packages/vue/src/tabs/tabs.spec.ts`

**Interfaces:**

- Consumes: existing `updateButtonState()` method and `showNavigators` computed in `TabList.vue`; the `tabListEl` ref (`role="tablist"` element).
- Produces: methods `bindResizeObserver()` / `unbindResizeObserver()`; a `showNavigators` watcher; `updated()` and `beforeUnmount()` hooks.

- [ ] **Step 1: Write the failing tests**

Append to `packages/vue/src/tabs/tabs.spec.ts`:

```ts
describe("UTabList overflow re-evaluation (GAP-072)", () => {
  let observers: { cb: ResizeObserverCallback; observed: Element[]; disconnected: boolean }[];

  beforeEach(() => {
    observers = [];
    vi.stubGlobal(
      "ResizeObserver",
      class {
        private readonly rec: {
          cb: ResizeObserverCallback;
          observed: Element[];
          disconnected: boolean;
        };
        constructor(cb: ResizeObserverCallback) {
          this.rec = { cb, observed: [], disconnected: false };
          observers.push(this.rec);
        }
        observe(target: Element) {
          this.rec.observed.push(target);
        }
        disconnect() {
          this.rec.disconnected = true;
        }
      }
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function mockWidths(scrollWidth: number, clientWidth: number) {
    vi.restoreAllMocks();
    vi.spyOn(Element.prototype, "scrollWidth", "get").mockReturnValue(scrollWidth);
    vi.spyOn(Element.prototype, "clientWidth", "get").mockReturnValue(clientWidth);
  }

  function mountDynamic(showNavigators = true) {
    return mount(
      {
        components: { UTabs, UTabList, UTab },
        data() {
          return { count: 2, showNavigators };
        },
        template: `
          <UTabs :value="0" :showNavigators="showNavigators">
            <UTabList>
              <UTab v-for="n in count" :key="n" :value="n - 1">Header {{ n }}</UTab>
            </UTabList>
          </UTabs>
        `,
      },
      { attachTo: document.body }
    );
  }

  const live = () => observers.filter((o) => !o.disconnected).length;

  it("re-shows the next navigator when tabs are added after mount", async () => {
    mockWidths(100, 100);
    const wrapper = mountDynamic();
    expect(wrapper.find('button[aria-label="Next"]').exists()).toBe(false);

    mockWidths(500, 100);
    await wrapper.setData({ count: 8 });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('button[aria-label="Next"]').exists()).toBe(true);
  });

  it("re-computes navigator visibility when the tab list resizes", async () => {
    mockWidths(100, 100);
    const wrapper = mountDynamic();
    expect(observers).toHaveLength(1);
    expect(observers[0].observed[0]).toBe(wrapper.find('[role="tablist"]').element);

    mockWidths(500, 100);
    observers[0].cb([], {} as ResizeObserver);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('button[aria-label="Next"]').exists()).toBe(true);
  });

  it("keeps at most one live observer when showNavigators toggles", async () => {
    const wrapper = mountDynamic(true);
    expect(live()).toBe(1);
    await wrapper.setData({ showNavigators: false });
    expect(live()).toBe(0);
    await wrapper.setData({ showNavigators: true });
    expect(live()).toBe(1);
    await wrapper.setData({ showNavigators: true });
    expect(live()).toBe(1);
  });

  it("binds no observer when showNavigators starts false", () => {
    mountDynamic(false);
    expect(observers).toHaveLength(0);
  });

  it("disconnects the observer before unmount", () => {
    const wrapper = mountDynamic();
    wrapper.unmount();
    expect(live()).toBe(0);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter @ultimate/vue test`
Expected: the "added after mount", "resizes" and "toggles" tests FAIL (no `updated()`, no observer).

- [ ] **Step 3: Implement**

In `packages/vue/src/tabs/TabList.vue` `<script>`:

1. Add a `watch` entry next to the existing `"$pcTabs.d_value"` watcher:

```js
    showNavigators(newValue) {
      newValue ? this.bindResizeObserver() : this.unbindResizeObserver();
    },
```

2. Replace the `mounted()` body's navigator block and add `updated()` and `beforeUnmount()`:

```js
  mounted() {
    if (this.showNavigators) {
      this.updateButtonState();
      this.bindResizeObserver();
    }
    this.$nextTick(() => this.updateInkBar());
  },
  // PrimeVue 4.5.5 TabList.vue:84-86 — re-check after any re-render (e.g. tabs added).
  updated() {
    if (this.showNavigators) this.updateButtonState();
  },
  beforeUnmount() {
    this.unbindResizeObserver();
  },
```

3. Add to `methods`:

```js
    // PrimeVue 4.5.5 TabList.vue:120-127. Always disconnects an existing
    // observer first, so rebinding never leaves two live observers.
    bindResizeObserver() {
      this.unbindResizeObserver();
      const el = this.$refs.tabListEl;
      if (!el) return;
      this.resizeObserver = new ResizeObserver(() => this.updateButtonState());
      this.resizeObserver.observe(el);
    },
    unbindResizeObserver() {
      this.resizeObserver?.disconnect();
      this.resizeObserver = undefined;
    },
```

`this.resizeObserver` is a plain instance property (not in `data()`), so it is not reactive, matching PrimeVue.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm --filter @ultimate/vue test`
Expected: all GAP-072 tests PASS; all pre-existing Tabs tests PASS. If a pre-existing Tabs test now throws `ResizeObserver is not defined`, move the stub `beforeEach`/`afterEach` to file level.

- [ ] **Step 5: Typecheck and commit**

Run: `pnpm --filter @ultimate/vue run typecheck` — Expected: no errors.

```bash
git add packages/vue/src/tabs/TabList.vue packages/vue/src/tabs/tabs.spec.ts
git commit -m "fix(vue): re-evaluate Tabs overflow on update and resize (GAP-072)"
```

---

### Task 3: GAP-073 — Angular Breadcrumb href/RouterLink split

**Files:**

- Modify: `packages/ng/src/breadcrumb/breadcrumb.ts` (imports lines 1-10, `imports:` and `template:` in `@Component`)
- Test: `packages/ng/src/breadcrumb/breadcrumb.spec.ts`

**Interfaces:**

- Consumes: existing `onClick(event, item)`, `isCurrent(item)`, `itemClassesParams(item)`, `cx(...)`, inputs `model`, `home`, `homeAriaLabel`.
- Produces: no new members; template-only change plus the `NgTemplateOutlet` import.

- [ ] **Step 1: Write the failing tests**

Append inside `describe("UBreadcrumb", ...)` in `packages/ng/src/breadcrumb/breadcrumb.spec.ts` (add `Router` to the `@angular/router` import):

```ts
describe("href vs RouterLink (GAP-073)", () => {
  it("renders the url href for an item with url and no routerLink", () => {
    const fixture = setup([{ label: "Docs", url: "/docs" }], {});
    expect(fixture.nativeElement.querySelector("a").getAttribute("href")).toBe("/docs");
  });

  it("renders # for an item with neither url nor routerLink", () => {
    const fixture = setup([{ label: "Plain" }], {});
    expect(fixture.nativeElement.querySelector("a").getAttribute("href")).toBe("#");
  });

  it("renders the home url href", () => {
    const fixture = setup([], { home: { icon: "pi pi-home", url: "/" } });
    expect(fixture.nativeElement.querySelector("a").getAttribute("href")).toBe("/");
  });

  it("keeps RouterLink for an enabled routerLink item", () => {
    const fixture = setup([{ label: "Category", routerLink: "/category" }], {});
    expect(fixture.nativeElement.querySelector("a").getAttribute("href")).toBe("/category");
  });

  it("renders a disabled routerLink item as a plain href that does not navigate", () => {
    const fixture = setup([{ label: "Locked", routerLink: "/locked", disabled: true }], {});
    const navigateByUrl = vi.spyOn(TestBed.inject(Router), "navigateByUrl");
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector("a");
    expect(link.getAttribute("href")).toBe("#");
    link.click();
    expect(navigateByUrl).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter @ultimate/ng test`
Expected: "url href", "#" and "home url href" FAIL (`href` is `null`, overwritten by `RouterLink`).

- [ ] **Step 3: Implement**

In `packages/ng/src/breadcrumb/breadcrumb.ts`, add `import { NgTemplateOutlet } from "@angular/common";`, change `imports: [RouterModule]` to `imports: [RouterModule, NgTemplateOutlet]`, and replace the whole `template:` string with:

```ts
  template: `
    <nav [class]="cx('root')">
      <ol [class]="cx('list')">
        @if (home(); as homeItem) {
          @if (homeItem.visible !== false) {
            <li [class]="cx('homeItem')">
              @if (homeItem.routerLink && !homeItem.disabled) {
                <a
                  [routerLink]="homeItem.routerLink"
                  [class]="cx('itemLink')"
                  [attr.aria-label]="homeAriaLabel()"
                  [attr.aria-disabled]="homeItem.disabled || null"
                  [attr.tabindex]="homeItem.disabled ? -1 : 0"
                  (click)="onClick($event, homeItem)"
                >
                  <ng-container [ngTemplateOutlet]="linkContent" [ngTemplateOutletContext]="{ $implicit: homeItem }" />
                </a>
              } @else {
                <a
                  [attr.href]="homeItem.url ?? '#'"
                  [class]="cx('itemLink')"
                  [attr.aria-label]="homeAriaLabel()"
                  [attr.aria-disabled]="homeItem.disabled || null"
                  [attr.tabindex]="homeItem.disabled ? -1 : 0"
                  (click)="onClick($event, homeItem)"
                >
                  <ng-container [ngTemplateOutlet]="linkContent" [ngTemplateOutletContext]="{ $implicit: homeItem }" />
                </a>
              }
            </li>
          }
          @if (model().length > 0) {
            <li [class]="cx('separator')" role="separator">›</li>
          }
        }
        @for (item of model(); track $index; let last = $last) {
          @if (item.visible !== false) {
            <li [class]="cx('item', itemClassesParams(item))">
              @if (item.routerLink && !item.disabled) {
                <a
                  [routerLink]="item.routerLink"
                  [class]="cx('itemLink')"
                  [attr.aria-disabled]="item.disabled || null"
                  [attr.aria-current]="last && isCurrent(item) ? 'page' : null"
                  [attr.tabindex]="item.disabled ? -1 : 0"
                  [attr.data-u-disabled]="!!item.disabled"
                  (click)="onClick($event, item)"
                >
                  <ng-container [ngTemplateOutlet]="linkContent" [ngTemplateOutletContext]="{ $implicit: item }" />
                </a>
              } @else {
                <a
                  [attr.href]="item.url ?? '#'"
                  [class]="cx('itemLink')"
                  [attr.aria-disabled]="item.disabled || null"
                  [attr.aria-current]="last && isCurrent(item) ? 'page' : null"
                  [attr.tabindex]="item.disabled ? -1 : 0"
                  [attr.data-u-disabled]="!!item.disabled"
                  (click)="onClick($event, item)"
                >
                  <ng-container [ngTemplateOutlet]="linkContent" [ngTemplateOutletContext]="{ $implicit: item }" />
                </a>
              }
            </li>
            @if (!last) {
              <li [class]="cx('separator')" role="separator">›</li>
            }
          }
        }
      </ol>
    </nav>
    <ng-template #linkContent let-item>
      @if (item.icon) {
        <span [class]="item.icon + ' ' + cx('itemIcon')"></span>
      }
      @if (item.label) {
        <span [class]="cx('itemLabel')">{{ item.label }}</span>
      }
    </ng-template>
  `,
```

Before replacing, diff the old template's per-anchor attributes against this one. Every attribute and binding other than `href`/`routerLink` must be carried over unchanged (Spec §5.3.3). If the current template has any attribute not listed above, add it to both branches.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm --filter @ultimate/ng test`
Expected: all GAP-073 tests PASS; all pre-existing Breadcrumb tests (including `aria-current`, disabled-click and GAP-065 SSR tests) PASS.

- [ ] **Step 5: Typecheck and commit**

Run: `pnpm --filter @ultimate/ng run typecheck` — Expected: no errors.

```bash
git add packages/ng/src/breadcrumb/breadcrumb.ts packages/ng/src/breadcrumb/breadcrumb.spec.ts
git commit -m "fix(ng): keep Breadcrumb url/# href by splitting RouterLink anchors (GAP-073)"
```
