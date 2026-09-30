# Prime Parity: Navigation Implementation Plan (GAP-052–GAP-058, GAP-069)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Execution approach:** Subagent-driven development, one implementer/reviewer cycle per task. GAP-054 (4 components) is broken into 4 independent per-component sub-tasks per framework rather than one giant task, so a reviewer can verify each component's roving-focus behavior in isolation.

**Goal:** Add keyboard navigation to Steps (GAP-052), Menubar/TieredMenu/MegaMenu/PanelMenu (GAP-054), Dock (GAP-055), SpeedDial (GAP-056); add `routerLink` to Angular Steps (GAP-053) and Angular Dock (GAP-069); add `scrollable`/`closable` to React Tabs (GAP-057/058).

**Spec:** `docs/superpowers/specs/2026-09-26-prime-parity-navigation-design.md`.

**GAP → Task mapping:**

| GAP | Task(s) |
|---|---|
| GAP-052 | Task 1 (Angular), Task 2 (React), Task 3 (Vue) |
| GAP-053 | Task 4 (Angular only) |
| GAP-054 | Task 5-8 (Angular: Menubar, TieredMenu, MegaMenu, PanelMenu), Task 9-12 (React, same order), Task 13-16 (Vue, same order) |
| GAP-055 | Task 17 (Angular), Task 18 (React), Task 19 (Vue) |
| GAP-069 | Task 20 (Angular only) |
| GAP-056 | Task 21 (Angular), Task 22 (React), Task 23 (Vue) |
| GAP-057 | Task 24 (React only) |
| GAP-058 | Task 25 (React only) |

## Global Constraints

- **PanelMenu's multiple-expansion exclusivity scope is not touched by Task 8/12/16.** Only keyboard navigation is added; the per-level sibling-exclusivity behavior (KEEP CURRENT BEHAVIOR) is unchanged.
- **MegaMenu's disabled-group hover-open behavior is not touched by Task 7/11/15.** Only keyboard navigation is added.
- **SpeedDial's already-existing Escape mechanism (`closeOnEscape`, confirmed present at `speed-dial.ts:247-252` as of the GAP-056 implementation; originally cited as lines 184-186 before Task 21 inserted code above it) is not modified.** Task 21-23 add only between-item Arrow-key navigation.
- **Angular/Vue Tabs are not touched by Task 25.** `closable` is React-only, per Spec §5.8's own explicit exclusion.
- **`routerLink` binding pattern is fixed by precedent, not re-designed.** Task 4/20 use the exact pattern already established and shipped in Task 4's own real implementation (`packages/ng/src/steps/steps.ts`), with `RouterModule` imported: an `@if (<clickable condition>)`/`@else` structural branch — Steps: `item.routerLink && !readonly() && !item.disabled` (the `!readonly()` term added by the post-final-review GAP-053 fix, commit `a169b00`); Dock: `item.routerLink && !item.disabled` (Dock has no `readonly`) — the `@if` branch's `<a>` binds `[routerLink]` with no `[attr.href]` at all; the `@else` branch's `<a>` binds `[attr.href]="item.url ?? '#'"` with no `RouterLink` directive present. Shared inner markup factored via `<ng-template>` + `NgTemplateOutlet` from both branches. (Doc correction, post-Task-20-review: this line originally described Breadcrumb's own literal dual-attribute conditional — `[attr.href]="item.routerLink ? null : (item.url ?? '#')"` + `[routerLink]="item.disabled ? null : (item.routerLink ?? null)"` on one anchor — but Task 4's real, already-approved GAP-053 implementation correctly diverged from that pattern after discovering it has a latent bug: Angular's `RouterLink` directive's own host binding unconditionally overwrites a co-existing `[attr.href]` binding on the same anchor, even when `routerLink` is bound to `null`. The `@if`/`@else` structural branch avoids ever co-locating both bindings. Task 20 correctly followed Task 4's real shipped code over this stale prose; this text is now corrected to match. Breadcrumb itself still has the original latent bug, out of scope for GAP-053/GAP-069 and tracked separately as GAP-073.)
- **No task modifies `packages/ng/src/menu/menu.ts` or any Menu-family shared mechanism.** `UMenu`'s own popup capability is tracked separately by GAP-067 (Existing Commitments Plan).
- **Roving-tabindex, where added, follows `UPanelMenu`'s own already-established pattern** (`[attr.tabindex]="item.disabled ? -1 : 0"`, confirmed present at `panel-menu-list.ts:58`) as the cross-component precedent for "only one item at a time is tabbable."

## Review Focus

- **Keyboard navigation reaching a disabled item** — a reasonable person pressing Arrow keys expects disabled items to be skipped over (focus moves to the next enabled item), not to receive focus and then do nothing when activated; every task below must skip disabled items in its roving-focus computation, matching `UPanelMenu`'s own existing disabled-skip precedent if one exists there, or established fresh here consistently across all 4 GAP-054 components.
- **Escape closing an open submenu in Menubar/TieredMenu/MegaMenu (GAP-054) while a parent menu is also open** — a reasonable person expects Escape to close only the innermost open submenu first (returning focus to that submenu's own trigger), not the entire menu tree at once, matching standard nested-menu UX and avoiding an unexpected total-dismissal surprise.
- **`routerLink` combined with `disabled` on the same item (Task 4/20)** — a disabled item must not navigate. The shipped pattern (see the corrected Global Constraints note above) renders the `RouterLink` directive only in an `@if` branch whose condition excludes non-clickable items — Steps: `item.routerLink && !readonly() && !item.disabled` (matching PrimeNG 21.1.9's `isClickableRouterLink`; the `readonly` term was added by the post-final-review GAP-053 fix, commit `a169b00`); Dock: `item.routerLink && !item.disabled` — never a bare `item.routerLink` binding. (Doc correction, 2026-09-30: this bullet originally pointed to Breadcrumb's own dual-attribute conditional as the precedent; that pattern has a latent href-clobbering defect, now tracked separately as GAP-073, and is not the template for Task 4/20.)

---

### Task 1: Angular — GAP-052 Steps keyboard navigation

**Files:** `packages/ng/src/steps/steps.ts`, `packages/ng/src/steps/steps.spec.ts`.

- [ ] **Step 1: Write the failing tests**

```typescript
describe("keyboard navigation (Spec §5.1, GAP-052)", () => {
  it("ArrowRight moves focus to the next enabled step", () => {
    const fixture = TestBed.createComponent(USteps);
    fixture.componentRef.setInput("model", [{ label: "A" }, { label: "B" }, { label: "C" }]);
    fixture.componentRef.setInput("readonly", false);
    fixture.detectChanges();
    const links = fixture.nativeElement.querySelectorAll("a");
    links[0].focus();
    links[0].dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowRight", bubbles: true }));
    expect(document.activeElement).toBe(links[1]);
  });

  it("ArrowLeft moves focus to the previous enabled step", () => {
    const fixture = TestBed.createComponent(USteps);
    fixture.componentRef.setInput("model", [{ label: "A" }, { label: "B" }]);
    fixture.componentRef.setInput("readonly", false);
    fixture.detectChanges();
    const links = fixture.nativeElement.querySelectorAll("a");
    links[1].focus();
    links[1].dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowLeft", bubbles: true }));
    expect(document.activeElement).toBe(links[0]);
  });

  it("Home moves focus to the first enabled step, End to the last", () => {
    const fixture = TestBed.createComponent(USteps);
    fixture.componentRef.setInput("model", [{ label: "A" }, { label: "B" }, { label: "C" }]);
    fixture.componentRef.setInput("readonly", false);
    fixture.detectChanges();
    const links = fixture.nativeElement.querySelectorAll("a");
    links[1].focus();
    links[1].dispatchEvent(new KeyboardEvent("keydown", { code: "End", bubbles: true }));
    expect(document.activeElement).toBe(links[2]);
    links[2].dispatchEvent(new KeyboardEvent("keydown", { code: "Home", bubbles: true }));
    expect(document.activeElement).toBe(links[0]);
  });

  it("ArrowRight skips a disabled step", () => {
    const fixture = TestBed.createComponent(USteps);
    fixture.componentRef.setInput("model", [{ label: "A" }, { label: "B", disabled: true }, { label: "C" }]);
    fixture.componentRef.setInput("readonly", false);
    fixture.detectChanges();
    const links = fixture.nativeElement.querySelectorAll("a");
    links[0].focus();
    links[0].dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowRight", bubbles: true }));
    expect(document.activeElement).toBe(links[2]);
  });
});
```

- [ ] **Step 2: Implement**

Add a `(keydown)` handler on the `<ol>` (event delegation, matching the existing single-listener pattern other components in this codebase use rather than one listener per `<a>`): `ArrowRight`/`ArrowLeft` move focus to the next/previous non-disabled item (per `isItemDisabled`, already defined); `Home`/`End` move to the first/last non-disabled item. Use `querySelectorAll("a")` scoped to the component's own root plus index math, or track focused index via a signal — either is acceptable; call `event.preventDefault()` for each handled key.

- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

### Task 2: React — GAP-052 Steps keyboard navigation

**Files:** `packages/react/src/steps/steps.tsx`, `steps.spec.tsx`. Equivalent 4 tests + implementation, React idioms.

---

### Task 3: Vue — GAP-052 Steps keyboard navigation

**Files:** `packages/vue/src/steps/Steps.vue`, `steps.spec.ts`. Equivalent 4 tests + implementation, Vue idioms.

---

### Task 4: Angular — GAP-053 Steps `routerLink`

**Files:** `packages/ng/src/steps/steps.ts`, `steps.spec.ts`.

- [ ] **Step 1: Write the failing tests**

```typescript
describe("routerLink (Spec §5.2, GAP-053)", () => {
  it("binds routerLink when an item has one, omitting href", () => {
    const fixture = TestBed.createComponent(USteps);
    fixture.componentRef.setInput("model", [{ label: "A", routerLink: "/a" }]);
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector("a");
    expect(link.getAttribute("href")).toBe("/a"); // RouterLink sets href itself when rendered with RouterModule's test harness
  });

  it("does not bind routerLink when the item is disabled", () => {
    const fixture = TestBed.createComponent(USteps);
    fixture.componentRef.setInput("model", [{ label: "A", routerLink: "/a", disabled: true }]);
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector("a");
    expect(link.getAttribute("href")).not.toBe("/a");
  });

  it("falls back to url/# href when no routerLink is set", () => {
    const fixture = TestBed.createComponent(USteps);
    fixture.componentRef.setInput("model", [{ label: "A" }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("a").getAttribute("href")).toBe("#");
  });
});
```

(Test setup requires `RouterTestingModule`/`provideRouter([])` in the `TestBed.configureTestingModule`, matching `breadcrumb.spec.ts`'s own existing setup — copy that file's harness, do not invent a new one.)

- [ ] **Step 2: Implement**

1. Add `import { RouterModule } from "@angular/router";` and `imports: [RouterModule]` to `@Component`.
2. Replace the template's single `[href]="item.url || '#'"` anchor with an `@if`/`@else` structural branch: the `@if` branch (clickable router link — as shipped, `item.routerLink && !readonly() && !item.disabled`) renders the anchor with `[routerLink]` and no `[attr.href]`; the `@else` branch renders the anchor with `[attr.href]="item.url ?? '#'"` and no `RouterLink` directive. Factor shared inner markup via `<ng-template>` + `NgTemplateOutlet`. (Doc correction, 2026-09-30: this step originally said to co-locate `[attr.href]` and `[routerLink]` on one anchor, "matching Breadcrumb's own exact pattern". Implementation found Angular's `RouterLink` host binding overwrites a co-existing `[attr.href]` even when `routerLink` is `null`, so the shipped fix uses the structural branch; the post-final-review fix then added the `readonly` term. Breadcrumb's own copy of the defect is tracked separately as GAP-073.)

- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

### Task 5: Angular — GAP-054 Menubar keyboard navigation

**Files:** `packages/ng/src/menubar/menubar.ts`, `packages/ng/src/menubar/menubar-sub.ts`, `menubar.spec.ts`.

- [ ] **Step 1: Write the failing tests**

```typescript
describe("keyboard navigation (Spec §5.3, GAP-054)", () => {
  it("ArrowRight/ArrowLeft move focus among top-level items", () => {
    const fixture = TestBed.createComponent(UMenubar);
    fixture.componentRef.setInput("model", [{ label: "File" }, { label: "Edit" }, { label: "View" }]);
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll("[role=menuitem]");
    items[0].focus();
    items[0].dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowRight", bubbles: true }));
    expect(document.activeElement).toBe(items[1]);
  });

  it("Enter/Space on a top-level item with children opens its submenu", () => {
    const fixture = TestBed.createComponent(UMenubar);
    fixture.componentRef.setInput("model", [{ label: "File", items: [{ label: "New" }] }]);
    fixture.detectChanges();
    const item = fixture.nativeElement.querySelector("[role=menuitem]");
    item.focus();
    item.dispatchEvent(new KeyboardEvent("keydown", { code: "Enter", bubbles: true }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("[role=menuitem][aria-label=New]") || fixture.nativeElement.textContent).toContain("New");
  });

  it("Escape closes the innermost open submenu, keeping focus on its own trigger", () => {
    const fixture = TestBed.createComponent(UMenubar);
    fixture.componentRef.setInput("model", [{ label: "File", items: [{ label: "New" }] }]);
    fixture.detectChanges();
    const item = fixture.nativeElement.querySelector("[role=menuitem]");
    item.focus();
    item.dispatchEvent(new KeyboardEvent("keydown", { code: "Enter", bubbles: true }));
    fixture.detectChanges();
    item.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape", bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(item);
  });

  it("ArrowRight skips a disabled top-level item", () => {
    const fixture = TestBed.createComponent(UMenubar);
    fixture.componentRef.setInput("model", [{ label: "File" }, { label: "Edit", disabled: true }, { label: "View" }]);
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll("[role=menuitem]");
    items[0].focus();
    items[0].dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowRight", bubbles: true }));
    expect(document.activeElement).toBe(items[2]);
  });
});
```

- [ ] **Step 2: Implement**

In `menubar-sub.ts` (the recursive sub-component actually rendering items — confirmed `menubar.ts` composes it): add a keydown handler on the item list: `ArrowRight`/`ArrowLeft` (top-level, horizontal) or `ArrowDown`/`ArrowUp` (submenu, vertical — matching real PrimeNG's own axis-per-level convention) move focus between non-disabled siblings; `Enter`/`Space` on an item with `items` opens its submenu and moves focus to the submenu's first item; `Escape` closes the innermost open submenu only and returns focus to that submenu's own trigger element (track the trigger via the same open/close signal already gating submenu visibility).

- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

### Task 6: Angular — GAP-054 TieredMenu keyboard navigation

**Files:** `packages/ng/src/tiered-menu/tiered-menu.ts` (+ sub-component file), `tiered-menu.spec.ts`. Same pattern as Task 5, ported to TieredMenu's own recursive structure.

---

### Task 7: Angular — GAP-054 MegaMenu keyboard navigation

**Files:** `packages/ng/src/mega-menu/mega-menu.ts` (+ column sub-component), `mega-menu.spec.ts`. Same pattern as Task 5. **Does not touch the existing `hasColumns(item) && !item.disabled` hover-guard** (KEEP CURRENT BEHAVIOR) — only adds keyboard handling alongside it.

---

### Task 8: Angular — GAP-054 PanelMenu keyboard navigation

**Files:** `packages/ng/src/panel-menu/panel-menu.ts`, `panel-menu-list.ts`, `panel-menu.spec.ts`. Same pattern as Task 5, adapted to PanelMenu's accordion (expand-in-place) shape: `ArrowDown`/`ArrowUp` move focus between visible (expanded-into-view) items; `Enter`/`Space` toggles expand/collapse on a group item. **Does not touch the existing per-level sibling-exclusivity `Set<UMenuItem>` mechanism** (KEEP CURRENT BEHAVIOR) — only adds keyboard handling.

---

### Task 9-12: React — GAP-054 Menubar, TieredMenu, MegaMenu, PanelMenu keyboard navigation

**Files:** `packages/react/src/{menubar,tiered-menu,mega-menu,panel-menu}/*.tsx` + specs. Same 4 patterns as Tasks 5-8, ported to React's own component structure for each.

---

### Task 13-16: Vue — GAP-054 Menubar, TieredMenu, MegaMenu, PanelMenu keyboard navigation

**Files:** `packages/vue/src/{menubar,tiered-menu,mega-menu,panel-menu}/*.vue` + specs. Same 4 patterns, ported to Vue.

---

### Task 17: Angular — GAP-055 Dock keyboard navigation

**Files:** `packages/ng/src/dock/dock.ts`, `dock.spec.ts`.

- [ ] **Step 1: Write the failing tests**

```typescript
describe("keyboard navigation (Spec §5.4, GAP-055)", () => {
  it("ArrowRight/ArrowLeft move focus among dock items", () => {
    const fixture = TestBed.createComponent(UDock);
    fixture.componentRef.setInput("model", [{ label: "Finder" }, { label: "Mail" }]);
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll("[role=menuitem]");
    items[0].focus();
    items[0].dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowRight", bubbles: true }));
    expect(document.activeElement).toBe(items[1]);
  });

  it("Home/End jump to the first/last item", () => {
    const fixture = TestBed.createComponent(UDock);
    fixture.componentRef.setInput("model", [{ label: "A" }, { label: "B" }, { label: "C" }]);
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll("[role=menuitem]");
    items[1].focus();
    items[1].dispatchEvent(new KeyboardEvent("keydown", { code: "End", bubbles: true }));
    expect(document.activeElement).toBe(items[2]);
  });

  it("uses ArrowUp/ArrowDown instead when position is left or right", () => {
    const fixture = TestBed.createComponent(UDock);
    fixture.componentRef.setInput("model", [{ label: "A" }, { label: "B" }]);
    fixture.componentRef.setInput("position", "left");
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll("[role=menuitem]");
    items[0].focus();
    items[0].dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowDown", bubbles: true }));
    expect(document.activeElement).toBe(items[1]);
  });
});
```

- [ ] **Step 2: Implement**

Add a keydown handler on the `<ul role="menu">`. When `position()` is `"top"`/`"bottom"`: `ArrowRight`/`ArrowLeft` move focus. When `position()` is `"left"`/`"right"`: `ArrowDown`/`ArrowUp` move focus (matching real Prime's own axis-follows-orientation convention, consistent with Task 5's own Menubar horizontal/vertical split). `Home`/`End` move to first/last regardless of orientation. Skip disabled items.

- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

### Task 18: React — GAP-055 Dock keyboard navigation

**Files:** `packages/react/src/dock/dock.tsx`, `dock.spec.tsx`. Equivalent tests + implementation.

---

### Task 19: Vue — GAP-055 Dock keyboard navigation

**Files:** `packages/vue/src/dock/Dock.vue`, `dock.spec.ts`. Equivalent tests + implementation.

---

### Task 20: Angular — GAP-069 Dock `routerLink`

**Files:** `packages/ng/src/dock/dock.ts`, `dock.spec.ts`. **Independent of Task 17 (different capability, same component).**

- [ ] **Step 1: Write the failing tests** — same 3-test shape as Task 4, adapted to Dock's own item template.
- [ ] **Step 2: Implement** — add `RouterModule` import + the `@if`/`@else` structural-branch pattern shipped in `packages/ng/src/steps/steps.ts` (see this Plan's own corrected Global Constraints note above), with Dock's own condition `item.routerLink && !item.disabled` (shipped at `packages/ng/src/dock/dock.ts:33`; Dock has no `readonly`, so Steps' `!readonly()` term does not apply), replacing the current plain `[attr.href]="item.url ?? '#'"` binding on Dock's single anchor with the two-branch pattern. (Doc correction, post-Task-20-review: this step originally described Breadcrumb's own dual-attribute conditional, superseded by the corrected Global Constraints text above.)
- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

### Task 21: Angular — GAP-056 SpeedDial keyboard navigation

**Files:** `packages/ng/src/speed-dial/speed-dial.ts`, `speed-dial.spec.ts`. **Does not touch the existing `closeOnEscape`/`onEscape` mechanism (confirmed present; now `speed-dial.ts:247-252` after Task 21, originally cited as lines 184-186).**

- [ ] **Step 1: Write the failing tests**

```typescript
describe("keyboard navigation between action items (Spec §5.5, GAP-056)", () => {
  it("ArrowDown/ArrowUp move focus among action items once open", () => {
    const fixture = TestBed.createComponent(USpeedDial);
    fixture.componentRef.setInput("model", [{ label: "A" }, { label: "B" }]);
    fixture.detectChanges();
    fixture.componentInstance.show();
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll("[role=menuitem]");
    items[0].focus();
    items[0].dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowDown", bubbles: true }));
    expect(document.activeElement).toBe(items[1]);
  });

  it("existing Escape-to-close behavior is unaffected", () => {
    const fixture = TestBed.createComponent(USpeedDial);
    fixture.componentRef.setInput("model", [{ label: "A" }]);
    fixture.detectChanges();
    fixture.componentInstance.show();
    fixture.detectChanges();
    expect(fixture.componentInstance.visible()).toBe(true);
    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
    fixture.detectChanges();
    expect(fixture.componentInstance.visible()).toBe(false);
  });
});
```

- [ ] **Step 2: Implement**

Add a keydown handler on the action-item list (only relevant while `visible()` is true): `ArrowDown`/`ArrowRight` (direction-dependent per the existing `type`/`direction` inputs, matching whichever axis the layout already lays items out along — confirmed real Prime's own convention follows the visual layout direction) moves focus to the next action item; `ArrowUp`/`ArrowLeft` to the previous. Do not add a second Escape handler — the existing `@HostListener("document:keydown.escape")` already covers dismissal.

- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

### Task 22: React — GAP-056 SpeedDial keyboard navigation

**Files:** `packages/react/src/speed-dial/speed-dial.tsx`, `speed-dial.spec.tsx`. Equivalent, does not touch React's own existing Escape mechanism.

---

### Task 23: Vue — GAP-056 SpeedDial keyboard navigation

**Files:** `packages/vue/src/speed-dial/SpeedDial.vue`, `speed-dial.spec.ts`. Equivalent, does not touch Vue's own existing Escape mechanism.

---

### Task 24: React — GAP-057 Tabs `scrollable`

**Files:** `packages/react/src/tabs/tab-view.tsx` (the real TabView-equivalent file — confirmed there is no `tabs.tsx`; React's Tabs family is `tab-view.tsx` + `tab-panel.tsx` + `tab-menu.tsx`), `tabs.spec.tsx`.

**Plan correction (2026-09-30, pre-implementation — see the Spec's own §12 for the full correction record):** this task's original Step 1/Step 2 text instructed porting "Angular's `showNavigators`/Vue's `TabList.vue` own existing overflow-detection implementation," describing it as "already real and working" and suggesting a `ResizeObserver`. Direct re-verification against real source (both Ultimate Angular/Vue and real PrimeReact 10.9.9/PrimeNG 21.1.9/PrimeVue 4.5.5) found this premise false: neither Ultimate Angular nor Ultimate Vue performs continuous/automatic overflow detection (tracked separately as GAP-071/GAP-072, out of this task's own scope), and real PrimeReact's own `scrollable` behavior is a materially different, opt-in, render/scroll-recalculated pattern with no `ResizeObserver` at all. **Do not port Angular's or Vue's own current implementation.** The corrected Step 1/Step 2 below target real PrimeReact 10.9.9 directly.

- [ ] **Step 1: Write the failing tests**

First read real PrimeReact 10.9.9's own `TabView`/`TabViewBase` source in full (`.vendor-cache/primereact-10.9.9.tar.gz`, `components/lib/tabview/{TabView,TabViewBase}.js`) to confirm the exact `scrollable` prop default, the exact prev/next enabled-state computation, and the exact recalculation triggers (a `useEffect` with no dependency array, i.e. after every render, plus the strip's own `scroll` event — no `ResizeObserver`) — do not invent a different mechanism, and do not port Ultimate's own Angular/Vue implementation (see the Plan correction above).

```tsx
describe("scrollable overflow (Spec §5.7, GAP-057)", () => {
  it("does not render navigator buttons when scrollable is false (the default)", () => {
    render(<UTabView>{/* many tab panels, enough to overflow */}</UTabView>);
    expect(screen.queryByRole("button", { name: /scroll left|previous|next/i })).not.toBeInTheDocument();
  });

  it("shows only the next-scroll button when scrollable is true and tab labels overflow, scrolled to the start", () => {
    // Render with scrollable and enough tabs to force overflow. At scrollLeft === 0,
    // only "next" should render (matching real PrimeReact's own backward/forward
    // enabled-state computation confirmed in Step 1) — jsdom has no real layout, so
    // stub scrollWidth/clientWidth/scrollLeft on the scroll container per Step 1's
    // own confirmed values (mirroring whichever stubbing approach, if any, Ultimate's
    // own existing Tabs spec files already use for this same jsdom limitation).
    render(<UTabView scrollable>{/* many tab panels */}</UTabView>);
    expect(screen.queryByRole("button", { name: /scroll left|previous/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /scroll right|next/i })).toBeInTheDocument();
  });

  it("does not render navigator buttons when scrollable is true but tabs fit without overflow", () => {
    render(<UTabView scrollable>{/* one short tab */}</UTabView>);
    expect(screen.queryByRole("button", { name: /scroll left|previous|next/i })).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Implement** — add a `scrollable?: boolean` prop (default `false`) to React's Tabs; when `true`, wrap the tab-header strip in a horizontally-scrollable container and render prev/next navigator buttons only while scrolling in that direction is possible (`scrollLeft !== 0` for prev; not at the scroll end for next — exact PrimeReact-confirmed computation from Step 1), recomputed via a `useEffect` with no dependency array plus the strip's own `scroll` handler. Do not add a `ResizeObserver` (out of this task's own scope — see GAP-071/GAP-072 for the separate, already-registered Angular/Vue resize-reactivity findings, which this task does not need to address or block on).
- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

### Task 25: React — GAP-058 Tabs `closable`

**Files:** `packages/react/src/tabs/tab-panel.tsx` (`closable`/`closeIcon` props), `packages/react/src/tabs/tab-view.tsx` (the real TabView-equivalent file, same as Task 24 — there is no `tabs.tsx`; `onTabClose`/`onBeforeTabClose` props and close behavior), `tabs-style.ts`, `tabs.spec.tsx`. **Independent of Task 24.**

**Plan correction (2026-09-30, pre-implementation):** this task's original Step 1/Step 2 text guessed an `onClose` callback on each `UTabPanel` with an `{ originalEvent }` payload. Step 1's own mandated source check against real PrimeReact 10.9.9 (`components/lib/tabview/{TabView,TabViewBase}.js`) found the real contract differs, and Spec §6 already requires "matching real PrimeReact's own API shape": `closable` (default `false`) and `closeIcon` are `TabPanel` props (`TabViewBase.js:62-63`); the close callbacks are `onTabClose({ originalEvent, index })` and cancellable `onBeforeTabClose({ originalEvent, index })` (returning `false` cancels) on `TabView` (`TabViewBase.js:41,43`; `TabView.js:85-101`); closed tabs are tracked in internal hidden state, so the parent need not remove children (`TabView.js:22,72`); after every close, including of a non-active tab, the active tab is re-picked via `findVisibleActiveTab`, i.e. the first enabled visible tab at/after the closed index, else the nearest before it (`TabView.js:74-82, 317-322`). User rulings (2026-09-30): (1) follow PrimeReact exactly, including `onBeforeTabClose`; (2) render the close control as a real `<button type="button" aria-label="Close">` placed beside the header button inside the `<li role="tab">` (never nested in the header button), a disclosed deviation from PrimeReact's bare focusable SVG for better native semantics; clicking it must not also activate the tab; (3) replicate PrimeReact's active-tab re-pick policy exactly, including after closing a non-active tab, via the normal tab-change path; (4) identify closed tabs by the child's React `key` when present, falling back to its original index. The steps below are corrected accordingly.

- [ ] **Step 1: Write the failing tests**

First re-read real PrimeReact 10.9.9's own `TabView.js`/`TabViewBase.js` close path (`.vendor-cache/primereact-10.9.9.tar.gz`) to confirm the details cited in the correction above before writing assertions.

```tsx
describe("closable tabs (Spec §5.8, GAP-058)", () => {
  it("renders a close button on a tab with closable set", () => {
    render(<UTabView><UTabPanel header="A" closable /></UTabView>);
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
  });

  it("clicking the close button removes the tab and fires onTabClose with the tab index", () => {
    const onTabClose = vi.fn();
    render(
      <UTabView onTabClose={onTabClose}>
        <UTabPanel header="A" closable />
        <UTabPanel header="B" />
      </UTabView>
    );
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onTabClose).toHaveBeenCalledWith(expect.objectContaining({ index: 0 }));
    expect(screen.queryByText("A")).not.toBeInTheDocument();
  });

  it("onBeforeTabClose returning false cancels the close", () => {
    const onTabClose = vi.fn();
    render(
      <UTabView onBeforeTabClose={() => false} onTabClose={onTabClose}>
        <UTabPanel header="A" closable />
      </UTabView>
    );
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onTabClose).not.toHaveBeenCalled();
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("does not render a close button when closable is unset", () => {
    render(<UTabView><UTabPanel header="A" /></UTabView>);
    expect(screen.queryByRole("button", { name: /close/i })).not.toBeInTheDocument();
  });
});
```

Also add tests for: the active-tab re-pick after closing the active tab, and after closing a non-active tab (PrimeReact policy); the close button activating by keyboard (Enter/Space, native button); the close click not also activating the tab; closed-tab tracking by `key` with an index fallback.

- [ ] **Step 2: Implement** — add `closable?: boolean` (default `false`) and `closeIcon?: React.ReactNode` to `UTabPanelProps`; add `onTabClose?` and `onBeforeTabClose?` (payload `{ originalEvent: React.SyntheticEvent; index: number }`; `onBeforeTabClose` returning `false` cancels) to `UTabViewProps`. When `closable`, render a `<button type="button" aria-label="Close">` beside the header button inside the `<li role="tab">`. On activation: call `event.preventDefault()`, then `onBeforeTabClose` (return if it returns `false`), hide the tab in internal state keyed by the child's React `key` (falling back to the original index), fire `onTabClose`, then re-pick the active tab per PrimeReact's `findVisibleActiveTab` policy through the normal tab-change path (`onTabChange` when controlled).
- [ ] **Step 3-4:** Tests, full suite, dependency ceiling.

---

## Completion Criteria

- All 25 tasks pass, all applicable frameworks.
- `pnpm test`, `pnpm run ceiling:validate` pass after each task.
- PanelMenu's multiple-expansion behavior and MegaMenu's disabled-hover behavior are byte-identical to pre-plan (verify via `git diff`).
- Angular's/Vue's Tabs gain no `closable` capability (verify no changes to those files under Task 25's own scope).
- GAP-055 is not broadened — Task 17-19 touch only keyboard navigation; Task 20 (GAP-069) is a separate, independently-committable task.

## Documentation/Ledger Updates

Upon Final Review/Closeout: mark GAP-052 through GAP-058 and GAP-069 RESOLVED in `docs/architecture/BLUEPRINT_GAPS.md`. Not performed by this plan document.
