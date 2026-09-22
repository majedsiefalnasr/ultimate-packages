# Phase C Batch 3 Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Status:** Awaiting Plan Review as of 2026-09-22; implementation is not yet authorized. The amended specification passed technical Spec Review and is awaiting human approval alongside this reviewed Plan.

**Dispatch rule:** One numbered task per fresh implementer dispatch, followed by review of that task's result before the next dispatch. Preserve Tasks 0–14 exactly. The only capability prerequisite is Task 0 → Tasks 1 and 4; Tasks 2, 3, 5–11 are otherwise independent. Tasks 12–14 retain their batch verification/documentation/closeout order. Review order is an execution gate, not a new implementation dependency between otherwise-independent realizations.

**Branch/base allowlist:** Execute this Plan only on `feature/phase-c-batch-3-migration`, whose approved Batch 3 base is `f8cd78b`. Task 14 verifies both facts explicitly before closeout; changing either requires returning to the applicable review gate rather than silently editing the audit range.

**Current evidence notes:** Angular `UListbox` exposes `optionLabel`, `optionValue`, `(onChange)` with `{ originalEvent, value }`, and the `NG_VALUE_ACCESSOR` CVA contract used through `ngModel`; the approved generic tracking addition is one optional `trackBy` input with exact callback contract `(index: number, option: unknown) => unknown`, whose helper returns the callback result when supplied and the index otherwise. It does not expose DnD/item templates or `dataKey`/`metaKeySelection`, so the component-local adaptations below use only that real contract. `uix-data` exports filter types, not a runtime FilterService; matching is implemented privately inside the five affected component files, without changing Table or adding a shared foundation. Current Paginator events are Angular `(onPageChange)`, React `onPageChange`, and Vue `@page`; its minimal prop surface is extended by DataView-owned rows-per-page/report/placement controls, not unsupported child bindings. All inline code is the implementation contract, not illustrative pseudocode.

**Plan Review corrections applied (2026-09-22):** Angular OrderList and PickList use the real Listbox CVA `ngModel`/`onChange` path with `optionLabel` and `optionValue`; their selection stores stable keys so `dataKey` survives an equivalent-object refresh. Angular responsive styles are owned with `Renderer2`/`ElementRef` in both OrderList and PickList, never an in-template `<style>`. Vue tests import direct SFC files, and Vue OrderList/PickList drive the existing Listbox `<ul role="listbox">` through its rendered DOM for `tabindex`, auto-focus, and hover-focus without a foundation change. Both OrganizationChart togglers stop nested keyboard propagation and are tested. Batch 3 style modules define functional structural layout, state, and hierarchy CSS. Movement stories use controlled framework-valid wrappers; unnecessary DataView/OrganizationChart controlled stories are absent. React OrganizationChart continues to exclude `togglerIcon`. The expressly authorized generic Angular `UListbox.trackBy` exception is planned in Task 4 and covered by focused regression tests.

**Goal:** Implement the 11 capability/framework realizations approved in `docs/superpowers/specs/2026-09-21-phase-c-batch-3-migration-design.md` (Batch 3): `UOrderList`, `UPickList`, `UDataView` for Angular/React/Vue, and `UOrganizationChart` for React/Vue only.

**Architecture:** Each capability is realized independently per framework, following that framework's own already-established Ultimate patterns (bare-tier foundation + real composition of already-Built `UListbox`/`UPaginator` where the real Prime source composes them). No shared cross-framework implementation. No new architecture — this Plan implements the Spec's scope exactly, does not reopen DECISION-C/DECISION-D, and does not introduce any pattern the Spec did not already authorize.

**Tech Stack:** Angular (signals, `@angular/core`, Vitest + `TestBed`), React (hooks, `@ultimate/react-core`, Vitest + React Testing Library), Vue (Options API via `createBaseComponent`, `@ultimate/vue-core`, Vitest + `@vue/test-utils`). New dependency: `@angular/cdk` (drag-drop module only), added to `packages/ng/package.json`.

## Global Constraints

- No Prime runtime dependency — every capability is adapted/reimplemented, never re-exported or wrapped (ADR-004). Enforced by `validate-dependency-ceiling.mjs`.
- No forced cross-framework API-shape parity (ADR-006) — most visibly, Vue PickList's `modelValue: Array` with `[[], []]` default vs. Angular/React's separate `source`/`target` props must NOT be flattened to one shape.
- No passthrough (`pt`/`ptOptions`) surface on any Batch 3 capability.
- Framework-native implementation only — no shared cross-framework component code (Option B: reference, not verbatim; ADR-006/018/024/032).
- `@angular/cdk/drag-drop` is introduced specifically, and only, to support Angular OrderList's/PickList's real opt-in drag/drop (Spec §5 item 1) — must be sequenced before any Angular OrderList/PickList implementation task.
- Vue OrderList/PickList are button-move-only — no drag/drop, no filtering of any kind (Spec §3.1/§3.2, real, verified upstream absence, not a scope cut).
- Vue PickList's real data model is one combined `modelValue: Array` with default `() => [[], []]` (Spec §3.2).
- DataView filtering is Angular-only, real `FilterService`-based — React/Vue implement no filtering at all (Spec §3.3).
- OrganizationChart is React/Vue only. Angular OrganizationChart remains permanently excluded by DECISION-D — no task in this Plan touches it.
- React OrderList/PickList do not compose PrimeReact's own Listbox in real source. `UListbox` (React) is a **preferred foundation to reuse where its real contract genuinely fits — never mandatory**. If `UListbox`'s real prop surface cannot cleanly support OrderList's/PickList's specific rendering needs, implement bespoke rendering instead and report it as a proof-by-exception finding (do not force the composition, do not silently route around the gap).
- No passthrough, no `pt`/`ptOptions` surface — matches every existing Ultimate component.
- Disclosed scope cuts (binding, non-goal, per Spec §3): no per-button ARIA-label overrides (OrderList/PickList, both), no `controlsPosition` (Angular OrderList), no `paginatorTemplate` customization (DataView), no `togglerIcon`/icon-customization surface (OrganizationChart). None of these are implemented in this batch.
- Dependency-ceiling gate (`validate-dependency-ceiling.mjs`) must pass after every task, including documentation tasks, and at whole-batch Verification (Spec §9.5).
- Barrel insertion is a flat `export * from "./{kebab-case-directory}";` appended to each framework's `packages/{ng,react,vue}/src/index.ts` — no alphabetical ordering requirement (confirmed: existing barrels are insertion-order, not sorted).
- File-set convention per component (all frameworks): `{kebab-name}.ts(x)` or `{PascalName}.vue`, `{kebab-name}-style.ts`, `{kebab-name}.spec.ts(x)`, `{kebab-name}.stories.ts(x)`, `index.ts`. Vue additionally has `Base{PascalName}.ts` holding the real prop/emit contract via `createBaseComponent`.

---

## Task 0: `@angular/cdk/drag-drop` dependency disclosure

**Files:**

- Modify: `packages/ng/package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `packages/ng/README.md` (replace its now-stale statement that CDK is absent)

**Interfaces:**

- Consumes: nothing from this Plan.
- Produces: `@angular/cdk` as an available package dependency for `packages/ng`, consumed by Task 1 (Angular OrderList) and Task 4 (Angular PickList) via `import { CdkDragDrop, DragDropModule, moveItemInArray } from "@angular/cdk/drag-drop";`.

This dependency is introduced specifically, and only, to support Angular OrderList's/PickList's real opt-in drag/drop (Spec §5 item 1, §4 item 9). It is ordinary dependency disclosure work, not an architectural decision.

- [ ] **Step 1: Confirm current absence and record the pre-work provenance baseline**

```bash
rg -n '"@angular/cdk"' packages/ng/package.json
node scripts/provenance/validate-provenance.mjs
pnpm test
pnpm typecheck
pnpm build
```

Expected: the grep has no output (package not yet present). The provenance command currently exits 1 only at the pre-existing `packages/ng/src/accordion/accordion-style.ts` missing-manifest record, after printing that all seven baseline headings are present. Record the command, exit code, and meaningful output for all three repository-wide validation commands as the pre-implementation baseline; a failure is baseline evidence, not a pass. Task 12 compares the same command against this recorded result so pre-existing failures remain explicitly distinct from regressions. If provenance's first failure differs, or a repository-wide command cannot be run, stop and reconcile the real baseline before implementation.

- [ ] **Step 2: Add the dependency**

The current Angular peer range is `^21.2.22`. CDK is installed as a production dependency; Angular core/common remain peer dependencies. Resolve the same supported major and inspect CDK's actual peer range rather than assuming identical patch versions.

```bash
pnpm view '@angular/cdk@21' version peerDependencies license --json
pnpm --filter @ultimate/ng add '@angular/cdk@^21.0.0' --save-prod
```

Expected: the resolved CDK major is 21, its peer range accepts the installed Angular version, and the lockfile changes only for this addition. If the peer range does not accept the installed Angular version, choose the compatible CDK 21 release from the displayed metadata; do not upgrade Angular as part of this task. Replace the README's CDK-absence sentence with this exact text:

> `@angular/cdk/drag-drop` is used by OrderList and PickList for their optional drag/drop mode; button controls remain the default interaction.

- [ ] **Step 3: Install**

Run: `pnpm install`
Expected: lockfile updates to include `@angular/cdk`, no errors.

- [ ] **Step 4: Confirm license is MIT**

Run:

```bash
pnpm --filter @ultimate/ng why @angular/cdk
pnpm --filter @ultimate/ng exec node -e 'const p = require("@angular/cdk/package.json"); console.log(JSON.stringify({version:p.version,license:p.license,peerDependencies:p.peerDependencies}, null, 2)); if(p.license !== "MIT") process.exit(1)'
```

Expected: `MIT`, consistent with ADR-005's MIT-only baseline. Record this confirmation in the commit message.

- [ ] **Step 5: Run the dependency-ceiling gate**

```bash
node scripts/provenance/validate-dependency-ceiling.mjs
pnpm test
```

Expected: the ceiling gate prints `OK`, and the complete existing suite passes. The gate's own source only checks `primeng`/`primevue`/`primereact` and `@primeuix/*`; `@angular/cdk` is out of its scope (confirmed by direct source read during Spec Review). Do not assume either result — run both and record the actual output. This full-suite run satisfies Spec §9.2 for the dependency task before its commit.

- [ ] **Step 6: Commit**

```bash
git add packages/ng/package.json packages/ng/README.md pnpm-lock.yaml
git commit -m "$(cat <<'EOF'
chore(ng): add @angular/cdk dependency for OrderList/PickList drag/drop

Required by Angular OrderList's and PickList's real, opt-in drag/drop
mechanism (CdkDragDrop, moveItemInArray). MIT-licensed, matching
Angular core's own license. Confirmed outside validate-dependency-
ceiling.mjs's scope (Prime-only gate).
EOF
)"
```

---

## Task 1: Angular `UOrderList`

**Files:**

- Create: `packages/ng/src/order-list/order-list.ts`
- Create: `packages/ng/src/order-list/order-list-style.ts`
- Create: `packages/ng/src/order-list/order-list.spec.ts`
- Create: `packages/ng/src/order-list/order-list.stories.ts`
- Create: `packages/ng/src/order-list/index.ts`
- Modify: `packages/ng/src/index.ts` (barrel insertion)

- Modify: `docs/architecture/provenance/ng.json` (only this component's new file records)

**Interfaces:**

- Consumes: `UBaseComponent` from `@ultimate/ng-core`; `UListbox` from `../listbox/listbox` (real composition target, using its current `options`, `multiple`, `optionLabel`, `disabled`, and `ariaLabel` inputs plus `(onChange)` output with `{ originalEvent, value }` — confirmed in `packages/ng/src/listbox/listbox.ts`); `@angular/cdk/drag-drop`'s `CdkDragDrop`, `DragDropModule`, `moveItemInArray` (Task 0).
- Produces: `UOrderList` standalone component, selector `u-order-list`, consumed by no later task in this batch (OrderList has no downstream consumer within Batch 3).

**Depends on:** Task 0 (must not start before Task 0's commit).

**Current-API adaptation:** `UListbox` has `(onChange)` with `{ originalEvent, value }`, `optionLabel`, and CVA/ngModel; it has no `dataKey`, `selectionChange`, `metaKeySelection`, or item-drag hook. The baseline path composes it using its real contract. The opt-in drag path is component-local CDK markup with the same selection, filtering, and move semantics. No Listbox foundation change is authorized.

- [ ] **Step 1: Write the failing test for button-move reordering**

```typescript
// packages/ng/src/order-list/order-list.spec.ts
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { CdkDrag, CdkDropList } from "@angular/cdk/drag-drop";
import { describe, expect, it, vi } from "vitest";
import { UOrderList } from "./order-list";

function setup(dragdrop = false) {
  const fixture = TestBed.createComponent(UOrderList);
  fixture.componentRef.setInput("value", ["A", "B", "C", "D"]);

  fixture.componentRef.setInput("dragdrop", dragdrop);
  const change = vi.fn();
  fixture.componentInstance.valueChange.subscribe(change);

  fixture.detectChanges();
  return { fixture, change };
}
describe("UOrderList", () => {
  it.each([
    ["up", ["B", "A", "C", "D"]],
    ["top", ["B", "A", "C", "D"]],
    ["down", ["A", "C", "B", "D"]],
    ["bottom", ["A", "C", "D", "B"]],
  ])("moves selection %s", (direction, expected) => {
    const { fixture, change } = setup();
    const root = fixture.nativeElement;
    root.querySelectorAll('[role="option"]')[1].click();
    fixture.detectChanges();
    root.querySelector('[data-pc-section="move' + direction + 'button"]').click();
    expect(change).toHaveBeenLastCalledWith(expected);
    expect(fixture.componentInstance.value()).toEqual(["A", "B", "C", "D"]);
  });
  it("does not enable CDK or filtering by default", () => {
    const { fixture, change } = setup();
    expect(fixture.debugElement.queryAll(By.directive(CdkDrag))).toHaveLength(0);
    expect(fixture.nativeElement.querySelector('[role="searchbox"]')).toBeNull();
  });
  it("reorders through the bound CDK dropped event", () => {
    const { fixture, change } = setup(true);
    const listElement = fixture.debugElement.queryAll(By.directive(CdkDropList))[0];
    const container = listElement.injector.get(CdkDropList);
    const item = fixture.debugElement.queryAll(By.directive(CdkDrag))[1].injector.get(CdkDrag);
    listElement.triggerEventHandler("cdkDropListDropped", {
      previousIndex: 1,
      currentIndex: 0,
      item,
      container,
      previousContainer: container,
      isPointerOverContainer: true,
      distance: { x: 0, y: -20 },
      dropPoint: { x: 0, y: 0 },
      event: new MouseEvent("mouseup"),
    });
    expect(change).toHaveBeenLastCalledWith(["B", "A", "C", "D"]);
  });
  it("filters by configured fields and mode with accessible selection", () => {
    const { fixture } = setup();
    fixture.componentRef.setInput("value", [
      { name: "Apple", kind: "fruit" },
      { name: "Banana", kind: "fruit" },
    ]);
    fixture.componentRef.setInput("dataKey", "name");
    fixture.componentRef.setInput("filterBy", "name,kind");
    fixture.componentRef.setInput("filterMatchMode", "startsWith");
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('[role="searchbox"]') as HTMLInputElement;
    input.value = "App";
    input.dispatchEvent(new Event("input"));
    fixture.detectChanges();
    const root = fixture.nativeElement;
    expect(root.textContent).toContain("Apple");
    expect(root.textContent).not.toContain("Banana");
    expect(root.querySelector('[role="listbox"]').getAttribute("aria-multiselectable")).toBe(
      "true"
    );
  });
  it("applies breakpoint, scroll, tabindex, stripe, and button customization inputs", () => {
    const { fixture } = setup();
    fixture.componentRef.setInput("breakpoint", "640px");
    fixture.componentRef.setInput("scrollHeight", "9rem");
    fixture.componentRef.setInput("tabindex", 7);
    fixture.componentRef.setInput("stripedRows", true);
    fixture.componentRef.setInput("buttonProps", {
      class: "shared",
      id: "shared-up",
      title: "Shared move",
      name: "order-action",
      value: "shared-value",
      tabindex: 3,
    });
    fixture.componentRef.setInput("moveUpButtonProps", {
      class: "specific",
      id: "specific-up",
      title: "Move this item up",
      value: "up-value",
    });
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector(".u-order-list") as HTMLElement;
    const viewport = fixture.nativeElement.querySelector(
      '[data-pc-section="listcontainer"]'
    ) as HTMLElement;
    const up = fixture.nativeElement.querySelector(
      '[data-pc-section="moveupbutton"]'
    ) as HTMLElement;
    const responsiveCss = fixture.nativeElement.querySelector("style").textContent;
    expect(responsiveCss).toContain("@media (max-width: 640px)");
    expect(responsiveCss).toContain("grid-template-columns: minmax(0, 1fr)");
    expect(viewport.style.maxHeight).toBe("9rem");
    expect(viewport.tabIndex).toBe(7);
    expect(root.classList.contains("u-striped")).toBe(true);
    expect(up.classList.contains("shared")).toBe(true);
    expect(up.classList.contains("specific")).toBe(true);
    expect(up.id).toBe("specific-up");
    expect(up.title).toBe("Move this item up");
    expect(up.getAttribute("name")).toBe("order-action");
    expect(up.getAttribute("value")).toBe("up-value");
    expect(up.tabIndex).toBe(3);
  });
  it("keeps a dataKey selection after an equivalent-object refresh", () => {
    const { fixture } = setup();
    fixture.componentRef.setInput("dataKey", "id");
    fixture.componentRef.setInput("value", [
      { id: "a", label: "Apple" },
      { id: "b", label: "Banana" },
    ]);
    fixture.detectChanges();
    fixture.nativeElement.querySelectorAll('[role="option"]')[1].click();
    fixture.detectChanges();
    fixture.componentRef.setInput("value", [
      { id: "a", label: "Apple refreshed" },
      { id: "b", label: "Banana refreshed" },
    ]);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelectorAll('[role="option"]')[1].getAttribute("aria-selected")
    ).toBe("true");
    fixture.nativeElement.querySelectorAll('[role="option"]')[1].click();
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelectorAll('[role="option"]')[1].getAttribute("aria-selected")
    ).toBe("false");
  });
  it("implements metaKeySelection for plain and Ctrl/Cmd clicks", () => {
    const { fixture } = setup();
    fixture.componentRef.setInput("metaKeySelection", true);
    fixture.detectChanges();
    const options = fixture.nativeElement.querySelectorAll('[role="option"]');
    options[0].click();
    options[1].click();
    fixture.detectChanges();
    expect(options[0].getAttribute("aria-selected")).toBe("false");
    expect(options[1].getAttribute("aria-selected")).toBe("true");
    options[1].click();
    fixture.detectChanges();
    expect(options[1].getAttribute("aria-selected")).toBe("true");
    options[1].dispatchEvent(new MouseEvent("click", { bubbles: true, ctrlKey: true }));
    fixture.detectChanges();
    expect(options[1].getAttribute("aria-selected")).toBe("false");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @ultimate/ng test --watch=false --include='src/order-list/order-list.spec.ts'`
Expected: FAIL — `./order-list` module not found.

- [ ] **Step 3: Write the style module**

```typescript
// packages/ng/src/order-list/order-list-style.ts
export const orderListStyleModule = {
  css: `
    .u-order-list { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: start; gap: .75rem; }
    .u-order-list-controls { display: flex; flex-direction: column; gap: .25rem; }
    .u-order-list-list { min-width: 0; margin: 0; padding: 0; border: 1px solid currentColor; overflow: auto; }
    .u-order-list-list [role="listbox"] { margin: 0; padding: 0; list-style: none; }
    .u-order-list-item, .u-order-list-list [role="option"] { display: block; padding: .5rem .75rem; cursor: pointer; }
    .u-order-list-item-selected, .u-order-list-list [role="option"][aria-selected="true"] { outline: 2px solid currentColor; outline-offset: -2px; }
    .u-order-list.u-striped .u-order-list-item:nth-child(even), .u-order-list.u-striped .u-order-list-list [role="option"]:nth-child(even) { background: rgba(0, 0, 0, .06); }
  `,
  classes: {
    root: () => "u-order-list",
    controls: () => "u-order-list-controls",
    list: () => "u-order-list-list",
    listItem: () => "u-order-list-item",
    itemSelected: () => "u-order-list-item u-order-list-item-selected",
  },
};
```

- [ ] **Step 4: Implement `UOrderList`**

```typescript
// packages/ng/src/order-list/order-list.ts
import { CdkDragDrop, DragDropModule, moveItemInArray } from "@angular/cdk/drag-drop";
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Renderer2,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  input,
  output,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { UBaseComponent } from "@ultimate/ng-core";
import { UListbox, UListboxChangeEvent } from "../listbox/listbox";
import { orderListStyleModule } from "./order-list-style";

let nextOrderListId = 0;

export interface UOrderListButtonProps {
  class?: string;
  id?: string;
  title?: string;
  name?: string;
  value?: string;
  tabindex?: number;
  disabled?: boolean;
}

type MatchMode =
  | "contains"
  | "startsWith"
  | "endsWith"
  | "equals"
  | "notEquals"
  | "in"
  | "lt"
  | "lte"
  | "gt"
  | "gte";
function field(item: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (v, key) =>
        v != null && typeof v === "object" ? (v as Record<string, unknown>)[key] : undefined,
      item
    );
}
function matches(value: unknown, query: unknown, mode: MatchMode, locale?: string): boolean {
  if (query == null || query === "") return true;
  const text = (v: unknown) => String(v ?? "").toLocaleLowerCase(locale || undefined);
  if (mode === "in") return Array.isArray(query) && query.some((v) => text(value) === text(v));
  if (value == null) return mode === "notEquals";
  switch (mode) {
    case "contains":
      return text(value).includes(text(query));
    case "startsWith":
      return text(value).startsWith(text(query));
    case "endsWith":
      return text(value).endsWith(text(query));
    case "equals":
      return text(value) === text(query);
    case "notEquals":
      return text(value) !== text(query);
    case "lt":
      return Number(value) < Number(query);
    case "lte":
      return Number(value) <= Number(query);
    case "gt":
      return Number(value) > Number(query);
    case "gte":
      return Number(value) >= Number(query);
  }
}

@Component({
  selector: "u-order-list",
  standalone: true,
  imports: [UListbox, FormsModule, DragDropModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div [id]="rootId" [class]="cx('root')" [class.u-striped]="stripedRows()">
      <div [class]="cx('controls')">
        @for (direction of directions; track direction) {
          <button
            type="button"
            [attr.data-pc-section]="'move' + direction + 'button'"
            [disabled]="disabled() || selected().length === 0 || buttonPropsFor(direction).disabled"
            (click)="move(direction)"
            [class]="buttonPropsFor(direction).class"
            [attr.id]="buttonPropsFor(direction).id"
            [attr.title]="buttonPropsFor(direction).title"
            [attr.name]="buttonPropsFor(direction).name"
            [attr.value]="buttonPropsFor(direction).value"
            [attr.tabindex]="buttonPropsFor(direction).tabindex"
          >
            Move {{ direction }}
          </button>
        }
      </div>
      <div
        data-pc-section="listcontainer"
        [style.max-height]="scrollHeight()"
        style="overflow:auto"
        [attr.tabindex]="disabled() ? -1 : tabindex()"
      >
        @if (filterBy()) {
          <input
            type="text"
            role="searchbox"
            aria-label="Filter"
            [value]="query()"
            [disabled]="disabled()"
            (input)="query.set($any($event.target).value)"
          />
        }
        @if (dragdrop()) {
          <ul
            cdkDropList
            [class]="cx('list')"
            [cdkDropListData]="visible()"
            [cdkDropListDisabled]="disabled()"
            (cdkDropListDropped)="drop($event)"
            role="listbox"
            aria-multiselectable="true"
            [attr.aria-label]="ariaLabel()"
            [attr.tabindex]="disabled() ? -1 : tabindex()"
          >
            @for (item of visible(); track identity(item)) {
              <li
                cdkDrag
                [class]="isSelected(item) ? cx('itemSelected') : cx('listItem')"
                [cdkDragData]="item"
                [cdkDragDisabled]="disabled()"
                role="option"
                [attr.aria-selected]="isSelected(item)"
                tabindex="0"
                (click)="select(item, $event)"
                (keydown.enter)="select(item, $event)"
                (keydown.space)="$event.preventDefault(); select(item, $event)"
              >
                {{ label(item) }}
              </li>
            }
          </ul>
        } @else {
          <div [class]="cx('list')">
            <u-listbox
              [options]="visible()"
              [multiple]="true"
              [ngModel]="selected()"
              [optionLabel]="label"
              [optionValue]="identity"
              [disabled]="disabled()"
              [ariaLabel]="ariaLabel()"
              (onChange)="fromListbox($event)"
            />
          </div>
        }
      </div>
    </div>
  `,
})
export class UOrderList extends UBaseComponent {
  protected override readonly componentName = "order-list";
  protected override readonly styleModule = orderListStyleModule;
  value = input<unknown[]>([]);
  valueChange = output<unknown[]>();
  dataKey = input("");
  filterBy = input("");
  filterMatchMode = input<MatchMode>("contains");
  filterLocale = input<string>();
  dragdrop = input(false, { transform: booleanAttribute });
  metaKeySelection = input(false, { transform: booleanAttribute });
  breakpoint = input("960px");
  scrollHeight = input("14rem");
  stripedRows = input(false, { transform: booleanAttribute });
  disabled = input(false, { transform: booleanAttribute });
  tabindex = input(0);
  ariaLabel = input("Order list");
  buttonProps = input<UOrderListButtonProps>({});
  moveUpButtonProps = input<UOrderListButtonProps>({});
  moveTopButtonProps = input<UOrderListButtonProps>({});
  moveDownButtonProps = input<UOrderListButtonProps>({});
  moveBottomButtonProps = input<UOrderListButtonProps>({});
  protected readonly rootId = `u-order-list-${++nextOrderListId}`;
  protected readonly responsiveStyle = computed(
    () =>
      `@media (max-width: ${this.breakpoint()}) { #${this.rootId} { grid-template-columns: minmax(0, 1fr); } }`
  );
  protected readonly directions = ["up", "top", "down", "bottom"] as const;
  protected readonly selected = signal<unknown[]>([]);
  protected readonly query = signal("");
  protected readonly visible = computed(() =>
    !this.filterBy()
      ? this.value()
      : this.value().filter((item) =>
          this.filterBy()
            .split(",")
            .some((key) =>
              matches(
                field(item, key.trim()),
                this.query(),
                this.filterMatchMode(),
                this.filterLocale()
              )
            )
        )
  );
  protected readonly identity = (item: unknown): unknown =>
    this.dataKey() ? field(item, this.dataKey()) : item;
  protected readonly label = (item: unknown): string =>
    String(this.dataKey() ? field(item, this.dataKey()) : item);
  protected isSelected(item: unknown): boolean {
    return this.selected().includes(this.identity(item));
  }
  protected select(item: unknown, event: MouseEvent | KeyboardEvent): void {
    if (this.disabled()) return;
    const key = this.identity(item);
    const current = this.selected();
    const toggled = current.includes(key)
      ? current.filter((value) => value !== key)
      : [...current, key];
    this.selected.set(this.normalizeSelection(toggled, current, event));
  }
  protected fromListbox(event: UListboxChangeEvent): void {
    const current = this.selected();
    const next = Array.isArray(event.value) ? event.value : [];
    this.selected.set(this.normalizeSelection(next, current, event.originalEvent));
  }
  private normalizeSelection(next: unknown[], current: unknown[], event: Event): unknown[] {
    const pointer = event as MouseEvent;
    if (!this.metaKeySelection() || pointer.ctrlKey || pointer.metaKey) return next;
    const added = next.find((value) => !current.includes(value));
    if (added !== undefined) return [added];
    const removed = current.find((value) => !next.includes(value));
    return removed !== undefined ? [removed] : current;
  }
  protected buttonPropsFor(direction: "up" | "top" | "down" | "bottom"): UOrderListButtonProps {
    const overrides = {
      up: this.moveUpButtonProps(),
      top: this.moveTopButtonProps(),
      down: this.moveDownButtonProps(),
      bottom: this.moveBottomButtonProps(),
    };
    const shared = this.buttonProps();
    const specific = overrides[direction];
    return {
      ...shared,
      ...specific,
      class: [shared.class, specific.class].filter(Boolean).join(" ") || undefined,
    };
  }
  protected move(direction: "up" | "top" | "down" | "bottom"): void {
    if (this.disabled()) return;
    const next = [...this.value()];
    if (direction === "top" || direction === "bottom") {
      const chosen = next.filter((item) => this.isSelected(item));
      const rest = next.filter((item) => !this.isSelected(item));
      this.valueChange.emit(direction === "top" ? [...chosen, ...rest] : [...rest, ...chosen]);
      return;
    }
    const delta = direction === "up" ? -1 : 1;
    const indexes = next.map((_, index) => index);
    if (delta === 1) indexes.reverse();
    for (const index of indexes) {
      const destination = index + delta;
      if (
        destination >= 0 &&
        destination < next.length &&
        this.isSelected(next[index]) &&
        !this.isSelected(next[destination])
      ) {
        moveItemInArray(next, index, destination);
      }
    }
    this.valueChange.emit(next);
  }
  protected drop(event: CdkDragDrop<unknown[]>): void {
    if (!this.dragdrop() || this.disabled()) return;
    const visible = this.visible();
    const from = this.value().indexOf(visible[event.previousIndex]);
    const to = this.value().indexOf(visible[event.currentIndex]);
    if (from < 0 || to < 0) return;
    const next = [...this.value()];
    moveItemInArray(next, from, to);
    this.valueChange.emit(next);
  }

  private styleEl?: HTMLStyleElement;
  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2
  ) {
    super();
    effect(() => {
      const style = this.responsiveStyle();
      if (!this.styleEl) {
        this.styleEl = this.renderer.createElement("style");
        this.renderer.appendChild(this.elementRef.nativeElement, this.styleEl);
      }
      this.renderer.setProperty(this.styleEl, "textContent", style);
    });
  }
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm --filter @ultimate/ng test --watch=false --include='src/order-list/order-list.spec.ts'`
Expected: PASS, including every behavior case in this task.

- [ ] **Step 6: Write the absence guard for filter-when-not-configured and dragdrop-off-by-default**

Step 1's default-mode test separately asserts zero `CdkDrag` directives and no searchbox. Keep both assertions; the dragdrop default does not by itself prove the filtering gate.

- [ ] **Step 7: Create the barrel file**

```typescript
// packages/ng/src/order-list/index.ts
export * from "./order-list";
```

- [ ] **Step 8: Insert into the package barrel**

Read `packages/ng/src/index.ts` first to find its current export list, then append (do not assume alphabetical position — this barrel is insertion-order, confirmed during Batch 2 Plan Review):

```typescript
export * from "./order-list";
```

- [ ] **Step 9: Write the stories file**

```typescript
// packages/ng/src/order-list/order-list.stories.ts
import { Component } from "@angular/core";
import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { UOrderList } from "./order-list";

@Component({
  selector: "story-controlled-order-list",
  standalone: true,
  imports: [UOrderList],
  template: `<u-order-list [value]="value" (valueChange)="value = $event" />`,
})
class ControlledOrderListStory {
  value = ["Apple", "Banana", "Cherry", "Date"];
}

const meta: Meta<UOrderList> = {
  title: "Data/OrderList",
  component: UOrderList,
};
export default meta;

type Story = StoryObj<UOrderList>;

export const Default: Story = {
  args: { value: ["Apple", "Banana", "Cherry", "Date"] },
};

export const WithDragDrop: Story = {
  args: { value: ["Apple", "Banana", "Cherry", "Date"], dragdrop: true },
};

export const Controlled: Story = {
  decorators: [moduleMetadata({ imports: [ControlledOrderListStory] })],
  render: () => ({ template: "<story-controlled-order-list />" }),
};
```

- [ ] **Step 10: Register provenance and run the full regression/ceiling checks**

Every new source, test, story, base, and barrel needs a manifest record. Preserve every existing record and append only missing records for this task:

```bash
node --input-type=module <<'NODE'
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
const directory = "packages/ng/src/order-list";
const path = "docs/architecture/provenance/ng.json";
const entries = JSON.parse(readFileSync(path, "utf8"));
for (const name of readdirSync(directory).filter(name => /\.(ts|tsx|vue)$/.test(name))) {
  const destination = directory + "/" + name;
  if (entries.some(entry => entry.ultimateDestination === destination)) continue;
  const implementation = name === "order-list.ts";
  entries.push({
    originalPath: implementation ? "packages/primeng/src/orderlist/orderlist.ts" : "n/a",
    ultimateDestination: destination,
    modificationStatus: implementation ? "reimplemented-with-reference" : "authored",
    modificationDescription: implementation ? "Batch 3 framework-native OrderList; behavior referenced from the pinned PrimeNG 21.1.9 source; disclosed cuts remain excluded." : "Ultimate-authored OrderList test, story, barrel, or structural style."
  });
}
writeFileSync(path, JSON.stringify(entries, null, 2) + "\n");
NODE
pnpm test
node scripts/provenance/validate-dependency-ceiling.mjs
```

Expected: the complete existing suite passes and the ceiling script exits 0. Do not infer full-suite success from the focused test alone.

- [ ] **Step 11: Commit**

```bash
git add packages/ng/src/order-list packages/ng/src/index.ts docs/architecture/provenance/ng.json
git commit -m "$(cat <<'EOF'
feat(ng): add UOrderList

Real PrimeNG OrderList behavior: button-move reordering (array-index
splice) as the baseline, real opt-in CDK drag/drop via dragdrop prop
(default false). Composes UListbox, matching real PrimeNG's own
p-listbox composition. No passthrough surface (disclosed scope cut).
EOF
)"
```

---

## Task 2: React `UOrderList`

**Files:**

- Create: `packages/react/src/order-list/order-list.tsx`
- Create: `packages/react/src/order-list/order-list-style.ts`
- Create: `packages/react/src/order-list/order-list.spec.tsx`
- Create: `packages/react/src/order-list/order-list.stories.tsx`
- Create: `packages/react/src/order-list/index.ts`
- Modify: `packages/react/src/index.ts`

- Modify: `docs/architecture/provenance/react.json` (only this component's new file records)

**Interfaces:**

- Consumes: `useComponentBase` from `@ultimate/react-core`. Does **not** consume `UListbox` as a mandatory dependency (Spec §3.1/§7 — preferred, not mandatory; real PrimeReact renders its own bespoke sublist, not PrimeReact's own Listbox). This task attempts `UListbox` reuse first per Step 3 below; if its real contract (`packages/react/src/listbox/listbox.tsx`'s `UListboxProps`) cannot cleanly render OrderList's own list items without distorting behavior, fall back to bespoke rendering and record that as a proof-by-exception finding in the commit message.
- Produces: `UOrderList` component + `UOrderListProps` type, no downstream consumer in this batch.

**Depends on:** none (React has no CDK/dependency prerequisite — native HTML5 drag/drop).

- [ ] **Step 1: Write the failing test**

```tsx
// packages/react/src/order-list/order-list.spec.tsx
import * as React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UOrderList } from "./order-list";

function setup(dragdrop = false) {
  const change = vi.fn();
  const result = render(
    <UOrderList
      value={["A", "B", "C", "D"]}
      onChange={change}
      itemTemplate={(item) => <span>{item}</span>}
      dragdrop={dragdrop}
    />
  );
  return { ...result, change };
}
describe("UOrderList", () => {
  it.each([
    ["up", ["B", "A", "C", "D"]],
    ["top", ["B", "A", "C", "D"]],
    ["down", ["A", "C", "B", "D"]],
    ["bottom", ["A", "C", "D", "B"]],
  ])("moves selection %s", (direction, expected) => {
    const { container, change } = setup();
    const root = within(container.querySelector('[data-pc-section="sourcelist"]') as HTMLElement);
    fireEvent.click(root.getByRole("option", { name: "B" }));
    fireEvent.click(root.getByRole("button", { name: "Move " + direction }));
    expect(change).toHaveBeenLastCalledWith(expected);
  });
  it("does not add native DnD or a filter without opt-in", () => {
    const { container } = setup();
    expect(container.querySelector("[draggable]")).toBeNull();
    expect(screen.queryByRole("searchbox")).toBeNull();
  });
  it("uses actual native dragstart, dragover, and drop events for reorder", () => {
    const { change } = setup(true);
    const dataTransfer = { setData: vi.fn(), effectAllowed: "" };
    fireEvent.dragStart(screen.getByRole("option", { name: "B" }), { dataTransfer });
    expect(fireEvent.dragOver(screen.getByRole("option", { name: "A" }), { dataTransfer })).toBe(
      false
    );
    fireEvent.drop(screen.getByRole("option", { name: "A" }), { dataTransfer });
    expect(change).toHaveBeenLastCalledWith(["B", "A", "C", "D"]);
  });
  it("filters configured fields and supports keyboard selection", () => {
    const change = vi.fn();
    render(
      <UOrderList
        value={[{ name: "Apple" }, { name: "Banana" }]}
        onChange={change}
        itemTemplate={(item) => <span>{item.name}</span>}
        dataKey="name"
        filter
        filterBy="name"
        filterMatchMode="startsWith"
      />
    );
    fireEvent.change(screen.getByRole("searchbox", { name: "Filter source" }), {
      target: { value: "App" },
    });
    expect(screen.queryByRole("option", { name: "Banana" })).toBeNull();
    fireEvent.keyDown(screen.getByRole("option", { name: "Apple" }), { key: "Enter" });
    expect(screen.getByRole("option", { name: "Apple" })).toHaveAttribute("aria-selected", "true");
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm --filter @ultimate/react test order-list.spec.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Attempt `UListbox` composition; implement**

First read `packages/react/src/listbox/listbox.tsx`'s full `UListboxProps` (already extracted above: `value`, `onChange`, `options`, `optionLabel?`, `multiple?`, `filter?`, `emptyMessage?`, `onSelectionChange?`). Attempt to render `UListbox` for OrderList's item display. If `UListbox`'s single-`onChange`-for-full-value contract does not cleanly support per-item move-button targeting alongside optional native drag/drop attributes on each rendered option, implement OrderList's own bespoke item rendering instead (matching real `OrderListSubList.js`'s own approach) and note the specific gap in the commit message as a proof-by-exception finding — do not force `UListbox` into a shape that distorts real PrimeReact OrderList behavior.

```tsx
// packages/react/src/order-list/order-list.tsx
import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { orderListStyleModule } from "./order-list-style";

type MatchMode =
  | "contains"
  | "startsWith"
  | "endsWith"
  | "equals"
  | "notEquals"
  | "in"
  | "lt"
  | "lte"
  | "gt"
  | "gte";
function field(item: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (v, key) =>
        v != null && typeof v === "object" ? (v as Record<string, unknown>)[key] : undefined,
      item
    );
}
function matches(value: unknown, query: unknown, mode: MatchMode, locale?: string): boolean {
  if (query == null || query === "") return true;
  const text = (v: unknown) => String(v ?? "").toLocaleLowerCase(locale || undefined);
  if (mode === "in") return Array.isArray(query) && query.some((v) => text(value) === text(v));
  if (value == null) return mode === "notEquals";
  switch (mode) {
    case "contains":
      return text(value).includes(text(query));
    case "startsWith":
      return text(value).startsWith(text(query));
    case "endsWith":
      return text(value).endsWith(text(query));
    case "equals":
      return text(value) === text(query);
    case "notEquals":
      return text(value) !== text(query);
    case "lt":
      return Number(value) < Number(query);
    case "lte":
      return Number(value) <= Number(query);
    case "gt":
      return Number(value) > Number(query);
    case "gte":
      return Number(value) >= Number(query);
  }
}

export interface UOrderListProps<T = unknown> {
  value: T[];
  onChange: (value: T[]) => void;
  autoOptionFocus?: boolean;
  focusOnHover?: boolean;
  tabIndex?: number;
  listStyle?: React.CSSProperties;
  itemTemplate: (item: T) => React.ReactNode;
  dataKey?: string;
  filter?: boolean;
  filterBy?: string;
  filterMatchMode?: MatchMode;
  filterLocale?: string;
  dragdrop?: boolean;
  breakpoint?: string;
  className?: string;
}
export function UOrderList<T = unknown>({
  value,
  onChange,
  autoOptionFocus = true,
  focusOnHover = false,
  tabIndex = 0,
  listStyle,
  itemTemplate,
  dataKey,
  filter = false,
  filterBy,
  filterMatchMode = "contains",
  filterLocale,
  dragdrop = false,
  breakpoint = "960px",
  className,
}: UOrderListProps<T>): React.ReactElement {
  const { cx } = useComponentBase({
    componentName: "order-list",
    styleModule: orderListStyleModule,
  });
  const id = React.useId().replace(/:/g, "");
  const lists = [value];
  const [selected, setSelected] = React.useState<T[][]>([[]]);
  const [queries, setQueries] = React.useState<string[]>([""]);
  const drag = React.useRef<{ side: number; item: T } | null>(null);
  const identity = (item: T): unknown => (dataKey ? field(item, dataKey) : item);
  const isSelected = (side: number, item: T): boolean =>
    selected[side].some((value) => identity(value) === identity(item));
  const emit = (side: number, items: T[]): void => {
    onChange(items);
  };
  const select = (side: number, item: T): void => {
    setSelected((previous) => {
      const next = previous.map((items) => [...items]);
      const current = next[side];
      next[side] = current.some((value) => identity(value) === identity(item))
        ? current.filter((value) => identity(value) !== identity(item))
        : [...current, item];
      return next;
    });
  };
  const move = (side: number, direction: "up" | "top" | "down" | "bottom"): void => {
    const next = [...lists[side]];
    if (direction === "top" || direction === "bottom") {
      const chosen = next.filter((item) => isSelected(side, item));
      const rest = next.filter((item) => !isSelected(side, item));
      emit(side, direction === "top" ? [...chosen, ...rest] : [...rest, ...chosen]);
      return;
    }
    const delta = direction === "up" ? -1 : 1;
    const indexes = next.map((_, index) => index);
    if (delta === 1) indexes.reverse();
    for (const index of indexes) {
      const to = index + delta;
      if (
        to >= 0 &&
        to < next.length &&
        isSelected(side, next[index]) &&
        !isSelected(side, next[to])
      ) {
        [next[index], next[to]] = [next[to], next[index]];
      }
    }
    emit(side, next);
  };

  const drop = (side: number, before: T | undefined, event: React.DragEvent): void => {
    if (!dragdrop || !drag.current) return;
    event.preventDefault();
    event.stopPropagation();
    const { side: fromSide, item } = drag.current;
    drag.current = null;
    const from = [...lists[fromSide]];
    const index = from.indexOf(item);
    if (index < 0) return;
    if (fromSide === side) {
      const destination = before === undefined ? from.length - 1 : from.indexOf(before);
      if (destination < 0) return;
      from.splice(index, 1);
      from.splice(destination, 0, item);
      emit(side, from);
    } else {
      const to = [...lists[side]];
      const destination = before === undefined ? to.length : to.indexOf(before);
      if (destination < 0) return;
      from.splice(index, 1);
      to.splice(destination, 0, item);
      emit(fromSide, from);
      emit(side, to);
    }
    setSelected([[]]);
  };
  const keyDown = (side: number, item: T, event: React.KeyboardEvent<HTMLLIElement>): void => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      select(side, item);
      return;
    }
    const options = Array.from(
      event.currentTarget.parentElement?.querySelectorAll<HTMLElement>('[role="option"]') ?? []
    );
    const index = options.indexOf(event.currentTarget);
    const destination =
      event.key === "ArrowDown"
        ? index + 1
        : event.key === "ArrowUp"
          ? index - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? options.length - 1
              : -1;
    if (options[destination]) {
      event.preventDefault();
      options[destination].focus();
    }
  };
  return (
    <div id={id} className={[cx("root"), className].filter(Boolean).join(" ")}>
      <style>{`@media (max-width: ${breakpoint}) { #${id} { grid-template-columns: minmax(0, 1fr); } }`}</style>
      {lists.map((items, side) => {
        const showFilter = filter && true;
        const visible =
          !showFilter || !queries[side]
            ? items
            : items.filter((item) =>
                (filterBy
                  ? filterBy.split(",").map((key) => field(item, key.trim()))
                  : [item]
                ).some((value) => matches(value, queries[side], filterMatchMode, filterLocale))
              );
        return (
          <section
            key={side}
            data-pc-section={side === 0 ? "sourcelist" : "targetlist"}
            style={listStyle}
          >
            {true && (
              <div className={cx("controls")}>
                {(["up", "top", "down", "bottom"] as const).map((direction) => (
                  <button
                    key={direction}
                    type="button"
                    data-move={direction}
                    disabled={selected[side].length === 0}
                    onClick={() => move(side, direction)}
                  >
                    Move {direction}
                  </button>
                ))}
              </div>
            )}
            {showFilter && (
              <input
                type="text"
                role="searchbox"
                aria-label={side === 0 ? "Filter source" : "Filter target"}
                value={queries[side]}
                onChange={(event) =>
                  setQueries((previous) =>
                    previous.map((value, index) => (index === side ? event.target.value : value))
                  )
                }
              />
            )}
            <ul
              className={cx("list")}
              role="listbox"
              aria-label={side === 0 ? "Source" : "Target"}
              aria-multiselectable="true"
              tabIndex={tabIndex}
              onFocus={(event) => {
                if (autoOptionFocus && event.target === event.currentTarget)
                  event.currentTarget.querySelector<HTMLElement>('[role="option"]')?.focus();
              }}
              onDragOver={dragdrop ? (event) => event.preventDefault() : undefined}
              onDrop={dragdrop ? (event) => drop(side, undefined, event) : undefined}
            >
              {visible.map((item, index) => (
                <li
                  key={dataKey ? String(identity(item)) : index}
                  className={isSelected(side, item) ? cx("itemSelected") : cx("listItem")}
                  role="option"
                  aria-selected={isSelected(side, item)}
                  tabIndex={0}
                  draggable={dragdrop || undefined}
                  onClick={() => select(side, item)}
                  onKeyDown={(event) => keyDown(side, item, event)}
                  onMouseEnter={(event) => {
                    if (focusOnHover) event.currentTarget.focus();
                  }}
                  onDragStart={
                    dragdrop
                      ? (event) => {
                          drag.current = { side, item };
                          event.dataTransfer.setData("text/plain", String(index));
                          event.dataTransfer.effectAllowed = "move";
                        }
                      : undefined
                  }
                  onDragEnd={
                    dragdrop
                      ? () => {
                          drag.current = null;
                        }
                      : undefined
                  }
                  onDragOver={dragdrop ? (event) => event.preventDefault() : undefined}
                  onDrop={dragdrop ? (event) => drop(side, item, event) : undefined}
                >
                  {itemTemplate(item)}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Write the style module**

```typescript
// packages/react/src/order-list/order-list-style.ts
import type { StyleModule } from "@ultimate/react-core";

export const orderListStyleModule: StyleModule = {
  css: `
    .u-order-list { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: start; gap: .75rem; }
    .u-order-list-controls { display: flex; flex-direction: column; gap: .25rem; }
    .u-order-list-list { min-width: 0; margin: 0; padding: 0; list-style: none; border: 1px solid currentColor; overflow: auto; }
    .u-order-list-item { display: block; padding: .5rem .75rem; cursor: pointer; }
    .u-order-list-item-selected { outline: 2px solid currentColor; outline-offset: -2px; }
  `,
  classes: {
    root: () => "u-order-list",
    controls: () => "u-order-list-controls",
    list: () => "u-order-list-list",
    listItem: () => "u-order-list-item",
    itemSelected: () => "u-order-list-item u-order-list-item-selected",
  },
};
```

- [ ] **Step 5: Run to verify pass**

Run: `pnpm --filter @ultimate/react test order-list.spec.tsx`
Expected: PASS, including every behavior case in this task.

- [ ] **Step 6: Barrel files**

```typescript
// packages/react/src/order-list/index.ts
export * from "./order-list";
```

Append `export * from "./order-list";` to `packages/react/src/index.ts` (read current file first).

- [ ] **Step 7: Stories file**

```tsx
// packages/react/src/order-list/order-list.stories.tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { UOrderList } from "./order-list";

function ControlledOrderListStory(): React.ReactElement {
  const [value, setValue] = useState(["Apple", "Banana", "Cherry", "Date"]);
  return (
    <UOrderList
      value={value}
      onChange={setValue}
      itemTemplate={(item) => <span>{item as string}</span>}
    />
  );
}

const meta: Meta<typeof UOrderList> = {
  title: "Data/OrderList",
  component: UOrderList,
};
export default meta;

type Story = StoryObj<typeof UOrderList>;

export const Default: Story = {
  args: {
    value: ["Apple", "Banana", "Cherry", "Date"],
    itemTemplate: (item) => <span>{item as string}</span>,
  },
};

export const WithDragDrop: Story = {
  args: {
    value: ["Apple", "Banana", "Cherry", "Date"],
    dragdrop: true,
    itemTemplate: (item) => <span>{item as string}</span>,
  },
};

export const Controlled: Story = {
  render: () => <ControlledOrderListStory />,
};
```

- [ ] **Step 8: Register provenance and run the full regression/ceiling checks**

Every new source, test, story, base, and barrel needs a manifest record. Preserve every existing record and append only missing records for this task:

```bash
node --input-type=module <<'NODE'
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
const directory = "packages/react/src/order-list";
const path = "docs/architecture/provenance/react.json";
const entries = JSON.parse(readFileSync(path, "utf8"));
for (const name of readdirSync(directory).filter(name => /\.(ts|tsx|vue)$/.test(name))) {
  const destination = directory + "/" + name;
  if (entries.some(entry => entry.ultimateDestination === destination)) continue;
  const implementation = name === "order-list.tsx";
  entries.push({
    originalPath: implementation ? "components/lib/orderlist/OrderList.js" : "n/a",
    ultimateDestination: destination,
    modificationStatus: implementation ? "reimplemented-with-reference" : "authored",
    modificationDescription: implementation ? "Batch 3 framework-native OrderList; behavior referenced from the pinned PrimeReact 10.9.9 source; disclosed cuts remain excluded." : "Ultimate-authored OrderList test, story, barrel, or structural style."
  });
}
writeFileSync(path, JSON.stringify(entries, null, 2) + "\n");
NODE
pnpm test
node scripts/provenance/validate-dependency-ceiling.mjs
```

Expected: the complete existing suite passes and the ceiling script exits 0. Do not infer full-suite success from the focused test alone.

- [ ] **Step 9: Commit**

```bash
git add packages/react/src/order-list packages/react/src/index.ts docs/architecture/provenance/react.json
git commit -m "$(cat <<'EOF'
feat(react): add UOrderList

Real PrimeReact OrderList behavior: button-move reordering as
baseline, real opt-in native HTML5 drag/drop (dragdrop prop, default
false) — zero dependency cost. Bespoke item rendering, matching real
PrimeReact's own OrderListSubList.js (does not compose PrimeReact's
Listbox in real source, per Spec §3.1/§7's preferred-not-mandatory
UListbox rule).
EOF
)"
```

---

## Task 3: Vue `UOrderList`

**Files:**

- Create: `packages/vue/src/order-list/OrderList.vue`
- Create: `packages/vue/src/order-list/BaseOrderList.ts`
- Create: `packages/vue/src/order-list/order-list-style.ts`
- Create: `packages/vue/src/order-list/order-list.spec.ts`
- Create: `packages/vue/src/order-list/order-list.stories.ts`
- Create: `packages/vue/src/order-list/index.ts`
- Modify: `packages/vue/src/index.ts`

- Modify: `docs/architecture/provenance/vue.json` (only this component's new file records)

**Interfaces:**

- Consumes: `createBaseComponent` from `@ultimate/vue-core`; `Listbox` from `../listbox/Listbox.vue` (real composition — Vue's real OrderList does compose Listbox, per Spec §3.1).
- Produces: `UOrderList` Vue component, no downstream consumer in this batch.
- **Binding constraint:** no `dragdrop` prop, no `filterBy`/filter prop of any kind — real upstream absence, not a cut (Spec §3.1, §7).

**Depends on:** none.

- [ ] **Step 1: Write the failing test**

```typescript
// packages/vue/src/order-list/order-list.spec.ts
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import UOrderList from "./OrderList.vue";

function setup() {
  return mount(UOrderList, { props: { modelValue: ["A", "B", "C", "D"] } });
}
describe("UOrderList", () => {
  it.each([
    ["up", ["B", "A", "C", "D"]],
    ["top", ["B", "A", "C", "D"]],
    ["down", ["A", "C", "B", "D"]],
    ["bottom", ["A", "C", "D", "B"]],
  ])("moves selection %s", async (direction, expected) => {
    const wrapper = setup();
    const root = wrapper.find('[data-pc-section="sourcelist"]');
    await root.findAll('[role="option"]')[1].trigger("click");
    await root.find('[data-pc-section="move' + direction + 'button"]').trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[0]?.[0]).toEqual(expected);
  });
  it("has neither drag/drop nor filtering in its public props or rendered behavior", () => {
    const wrapper = setup();
    for (const prop of ["dragdrop", "filter", "filterBy", "filterMatchMode", "filterLocale"])
      expect(wrapper.props()).not.toHaveProperty(prop);
    expect(wrapper.find("[draggable]").exists()).toBe(false);
    expect(wrapper.find('[role="searchbox"]').exists()).toBe(false);
    expect(wrapper.find('input[type="text"]').exists()).toBe(false);
  });
  it("uses an accessible composed multiple-selection Listbox", async () => {
    const wrapper = setup();
    expect(wrapper.find('[role="listbox"]').attributes("aria-multiselectable")).toBe("true");
    await wrapper.find('[role="option"]').trigger("click");
    expect(wrapper.find('[role="option"]').attributes("aria-selected")).toBe("true");
  });
  it("retains dataKey selection after an equivalent model array refresh", async () => {
    const wrapper = mount(UOrderList, {
      props: {
        modelValue: [
          { id: "a", label: "Apple" },
          { id: "b", label: "Banana" },
        ],
        dataKey: "id",
      },
    });
    await wrapper.findAll('[role="option"]')[1].trigger("click");
    await wrapper.setProps({
      modelValue: [
        { id: "a", label: "Apple refreshed" },
        { id: "b", label: "Banana refreshed" },
      ],
    });
    expect(wrapper.findAll('[role="option"]')[1].attributes("aria-selected")).toBe("true");
    await wrapper.findAll('[role="option"]')[1].trigger("click");
    expect(wrapper.findAll('[role="option"]')[1].attributes("aria-selected")).toBe("false");
  });
  it("implements metaKeySelection for plain and Ctrl/Cmd clicks", async () => {
    const wrapper = mount(UOrderList, {
      props: { modelValue: ["A", "B"], metaKeySelection: true },
    });
    const options = wrapper.findAll('[role="option"]');
    await options[0].trigger("click");
    await options[1].trigger("click");
    expect(options[0].attributes("aria-selected")).toBe("false");
    expect(options[1].attributes("aria-selected")).toBe("true");
    await options[1].trigger("click");
    expect(options[1].attributes("aria-selected")).toBe("true");
    await options[1].trigger("click", { ctrlKey: true });
    expect(options[1].attributes("aria-selected")).toBe("false");
  });
  it("applies tabindex and auto/hover focus to the composed Listbox ul", async () => {
    const wrapper = mount(UOrderList, {
      props: { modelValue: ["A", "B"], tabindex: 6, autoOptionFocus: false, focusOnHover: true },
    });
    await wrapper.vm.$nextTick();
    const listbox = wrapper.find('[role="listbox"]');
    expect(listbox.attributes("tabindex")).toBe("6");
    await wrapper.find('[role="option"]').trigger("mouseover");
    expect(document.activeElement).toBe(listbox.element);
    const auto = mount(UOrderList, { props: { modelValue: ["A", "B"], autoOptionFocus: true } });
    const autoListbox = auto.find('[role="listbox"]');
    await autoListbox.trigger("focus");
    await autoListbox.trigger("keydown", { code: "Enter" });
    expect(auto.findAll('[role="option"]')[0].attributes("aria-selected")).toBe("true");
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm --filter @ultimate/vue test order-list.spec.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `BaseOrderList.ts`**

```typescript
// packages/vue/src/order-list/BaseOrderList.ts
import { createBaseComponent } from "@ultimate/vue-core";
import type { ComponentOptions } from "vue";
import { orderListStyleModule } from "./order-list-style";

export function createBaseOrderList(): ComponentOptions {
  return {
    extends: createBaseComponent({
      componentName: "order-list",
      styleModule: orderListStyleModule,
    }),
    props: {
      modelValue: { type: Array, default: () => [] },
      dataKey: { type: String, default: null },
      metaKeySelection: { type: Boolean, default: false },
      autoOptionFocus: { type: Boolean, default: true },
      focusOnHover: { type: Boolean, default: false },
      responsive: { type: Boolean, default: true },
      breakpoint: { type: String, default: "960px" },
      striped: { type: Boolean, default: false },
      scrollHeight: { type: String, default: "14rem" },
      tabindex: { type: Number, default: 0 },
      disabled: { type: Boolean, default: false },
      ariaLabel: { type: String, default: "Order list" },
      ariaLabelledby: { type: String, default: null },

      buttonProps: { type: Object, default: () => ({}) },
      moveUpButtonProps: { type: Object, default: () => ({}) },
      moveTopButtonProps: { type: Object, default: () => ({}) },
      moveDownButtonProps: { type: Object, default: () => ({}) },
      moveBottomButtonProps: { type: Object, default: () => ({}) },
    },
    emits: ["update:modelValue"],
  };
}
```

- [ ] **Step 4: Write the style module**

```typescript
// packages/vue/src/order-list/order-list-style.ts
import type { StyleModule } from "@ultimate/vue-core";

export const orderListStyleModule: StyleModule = {
  css: `
    .u-order-list { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: start; gap: .75rem; }
    .u-order-list-controls { display: flex; flex-direction: column; gap: .25rem; }
    .u-order-list-list { min-width: 0; margin: 0; padding: 0; list-style: none; border: 1px solid currentColor; overflow: auto; }
    .u-order-list-list [role="listbox"] { margin: 0; padding: 0; list-style: none; }
    .u-order-list-item, .u-order-list-list [role="option"] { display: block; padding: .5rem .75rem; cursor: pointer; }
    .u-order-list-item-selected, .u-order-list-list [role="option"][aria-selected="true"] { outline: 2px solid currentColor; outline-offset: -2px; }
    .u-order-list.u-striped .u-order-list-item:nth-child(even), .u-order-list.u-striped .u-order-list-list [role="option"]:nth-child(even) { background: rgba(0, 0, 0, .06); }
  `,
  classes: {
    root: () => "u-order-list",
    controls: () => "u-order-list-controls",
    list: () => "u-order-list-list",
  },
};
```

- [ ] **Step 5: Write `OrderList.vue`**

```vue
<!-- packages/vue/src/order-list/OrderList.vue -->
<script>
import { createBaseOrderList } from "./BaseOrderList";
import Listbox from "../listbox/Listbox.vue";

export default {
  name: "UOrderList",
  extends: createBaseOrderList(),
  components: { Listbox },
  data() {
    return {
      selected: [[]],
      narrow: false,
      media: null,
      mediaListener: null,
      directions: ["up", "top", "down", "bottom"],
    };
  },
  computed: {
    lists() {
      return [this.modelValue];
    },
  },
  watch: {
    breakpoint() {
      this.bindMedia();
    },
  },
  mounted() {
    this.bindMedia();
    this.syncListboxDom();
  },
  updated() {
    this.syncListboxDom();
  },
  beforeUnmount() {
    this.media?.removeEventListener("change", this.mediaListener);
  },
  methods: {
    bindMedia() {
      this.media?.removeEventListener("change", this.mediaListener);
      if (typeof window === "undefined" || !window.matchMedia) return;
      this.media = window.matchMedia("(max-width: " + this.breakpoint + ")");
      this.mediaListener = (event) => {
        this.narrow = event.matches;
      };
      this.narrow = this.media.matches;
      this.media.addEventListener("change", this.mediaListener);
    },
    identity(item) {
      return this.dataKey && item != null ? item[this.dataKey] : item;
    },
    optionValue(item) {
      return this.identity(item);
    },
    label(item) {
      return String(this.dataKey && item != null ? item[this.dataKey] : item);
    },
    isSelected(side, item) {
      return this.selected[side].includes(this.optionValue(item));
    },
    select(side, event) {
      if (this.disabled) return;
      const nextValue = Array.isArray(event.value) ? event.value : [];
      const next = this.selected.map((items) => [...items]);
      const current = next[side];
      const original = event.originalEvent;
      if (this.metaKeySelection && !original.ctrlKey && !original.metaKey) {
        const added = nextValue.find((value) => !current.includes(value));
        const removed = current.find((value) => !nextValue.includes(value));
        next[side] = added !== undefined ? [added] : removed !== undefined ? [removed] : current;
      } else {
        next[side] = nextValue;
      }
      this.selected = next;
    },
    move(side, direction) {
      if (this.disabled) return;
      const next = [...this.lists[side]];
      let result = next;
      if (direction === "top" || direction === "bottom") {
        const chosen = next.filter((item) => this.isSelected(side, item));
        const rest = next.filter((item) => !this.isSelected(side, item));
        result = direction === "top" ? [...chosen, ...rest] : [...rest, ...chosen];
      } else {
        const delta = direction === "up" ? -1 : 1;
        const indexes = next.map((_, index) => index);
        if (delta === 1) indexes.reverse();
        for (const index of indexes) {
          const to = index + delta;
          if (
            to >= 0 &&
            to < next.length &&
            this.isSelected(side, next[index]) &&
            !this.isSelected(side, next[to])
          ) {
            [next[index], next[to]] = [next[to], next[index]];
          }
        }
      }
      this.$emit("update:modelValue", result);
      this.focusListbox();
    },

    propsFor(direction) {
      const names = {
        up: "moveUpButtonProps",
        top: "moveTopButtonProps",
        down: "moveDownButtonProps",
        bottom: "moveBottomButtonProps",
      };
      return { ...this.buttonProps, ...this[names[direction]] };
    },
    listboxComponent() {
      const refs = Array.isArray(this.$refs.listbox) ? this.$refs.listbox : [this.$refs.listbox];
      return refs[0] ?? null;
    },
    listboxElement() {
      return this.listboxComponent()?.$el?.querySelector('[role="listbox"]') ?? null;
    },
    syncListboxDom() {
      this.$nextTick(() => {
        const listbox = this.listboxElement();
        if (listbox) listbox.tabIndex = this.disabled ? -1 : this.tabindex;
      });
    },
    focusListbox(force = false) {
      if (!force && !this.autoOptionFocus) return;
      this.$nextTick(() => this.listboxElement()?.focus());
    },
    focusOption(event) {
      if (
        this.autoOptionFocus &&
        event.target.getAttribute("role") === "listbox" &&
        this.listboxComponent()?.focusedIndex < 0
      ) {
        event.target.dispatchEvent(
          new KeyboardEvent("keydown", { code: "ArrowDown", bubbles: true })
        );
      }
    },
    hoverOption(event) {
      if (this.focusOnHover && event.target.closest('[role="option"]')) this.focusListbox(true);
    },
  },
};
</script>

<template>
  <div
    :class="[cx('root'), { 'u-striped': striped }]"
    :style="{ gridTemplateColumns: responsive && narrow ? 'minmax(0, 1fr)' : undefined }"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    @focusin="focusOption"
  >
    <section
      v-for="(items, side) in lists"
      :key="side"
      :data-pc-section="side === 0 ? 'sourcelist' : 'targetlist'"
    >
      <div v-if="true" :class="cx('controls')">
        <button
          v-for="direction in directions"
          :key="direction"
          v-bind="propsFor(direction)"
          type="button"
          :data-pc-section="'move' + direction + 'button'"
          :disabled="disabled || !selected[side].length"
          @click="move(side, direction)"
        >
          Move {{ direction }}
        </button>
      </div>
      <div
        :class="cx('list')"
        :style="{ maxHeight: scrollHeight, overflow: 'auto' }"
        @mouseover="hoverOption"
      >
        <Listbox
          ref="listbox"
          :options="items"
          :model-value="selected[side]"
          :multiple="true"
          :option-label="label"
          :option-value="optionValue"
          :disabled="disabled"
          :aria-label="side === 0 ? ariaLabel + ' source' : ariaLabel + ' target'"
          @change="select(side, $event)"
        />
      </div>
    </section>
  </div>
</template>
```

Import `Listbox` from `../listbox/Listbox.vue` and register it in `components:` per the real Vue single-file-component convention already used elsewhere in this package (check `packages/vue/src/data-view/` if it exists from a prior batch, else `packages/vue/src/table/Table.vue`'s own child-component registration pattern, and match it exactly).

- [ ] **Step 6: Run to verify pass**

Run: `pnpm --filter @ultimate/vue test order-list.spec.ts`
Expected: PASS, including every behavior case in this task.

- [ ] **Step 7: Barrel files**

```typescript
// packages/vue/src/order-list/index.ts
export { default as UOrderList } from "./OrderList.vue";
```

Append the corresponding line to `packages/vue/src/index.ts`.

- [ ] **Step 8: Stories file**

```typescript
// packages/vue/src/order-list/order-list.stories.ts
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import UOrderList from "./OrderList.vue";

const meta: Meta<typeof UOrderList> = {
  title: "Data/OrderList",
  component: UOrderList,
};
export default meta;

type Story = StoryObj<typeof UOrderList>;

export const Default: Story = {
  args: { modelValue: ["Apple", "Banana", "Cherry", "Date"] },
};

export const Controlled: Story = {
  render: () => ({
    components: { UOrderList },
    setup() {
      const modelValue = ref(["Apple", "Banana", "Cherry", "Date"]);
      return { modelValue };
    },
    template: '<UOrderList v-model="modelValue" />',
  }),
};
```

- [ ] **Step 9: Register provenance and run the full regression/ceiling checks**

Every new source, test, story, base, and barrel needs a manifest record. Preserve every existing record and append only missing records for this task:

```bash
node --input-type=module <<'NODE'
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
const directory = "packages/vue/src/order-list";
const path = "docs/architecture/provenance/vue.json";
const entries = JSON.parse(readFileSync(path, "utf8"));
for (const name of readdirSync(directory).filter(name => /\.(ts|tsx|vue)$/.test(name))) {
  const destination = directory + "/" + name;
  if (entries.some(entry => entry.ultimateDestination === destination)) continue;
  const implementation = name === "OrderList.vue" || name === "BaseOrderList.ts";
  entries.push({
    originalPath: implementation ? "packages/primevue/src/orderlist/OrderList.vue" : "n/a",
    ultimateDestination: destination,
    modificationStatus: implementation ? "reimplemented-with-reference" : "authored",
    modificationDescription: implementation ? "Batch 3 framework-native OrderList; behavior referenced from the pinned PrimeVue 4.5.5 source; disclosed cuts remain excluded." : "Ultimate-authored OrderList test, story, barrel, or structural style."
  });
}
writeFileSync(path, JSON.stringify(entries, null, 2) + "\n");
NODE
pnpm test
node scripts/provenance/validate-dependency-ceiling.mjs
```

Expected: the complete existing suite passes and the ceiling script exits 0. Do not infer full-suite success from the focused test alone.

- [ ] **Step 10: Commit**

```bash
git add packages/vue/src/order-list packages/vue/src/index.ts docs/architecture/provenance/vue.json
git commit -m "$(cat <<'EOF'
feat(vue): add UOrderList

Real PrimeVue OrderList behavior: button-move-only — confirmed real
upstream has no dragdrop or filter field of any kind. Composes
Listbox directly, matching real PrimeVue's own template composition.
Includes explicit regression guard for the confirmed absence.
EOF
)"
```

---

## Task 4: Angular `UPickList`

**Files:**

- Create: `packages/ng/src/pick-list/pick-list.ts`
- Create: `packages/ng/src/pick-list/pick-list-style.ts`
- Create: `packages/ng/src/pick-list/pick-list.spec.ts`
- Create: `packages/ng/src/pick-list/pick-list.stories.ts`
- Create: `packages/ng/src/pick-list/index.ts`
- Modify: `packages/ng/src/index.ts`
- Modify: `packages/ng/src/listbox/listbox.ts` (add the one generic `trackBy` input)
- Modify: `packages/ng/src/listbox/listbox.spec.ts` (default/custom tracking DOM-reuse regressions)

- Modify: `docs/architecture/provenance/ng.json` (only this component's new file records)

**Interfaces:**

- Consumes: `UBaseComponent` from `@ultimate/ng-core`; two `UListbox` instances (source/target), each using the real `(onChange)` payload `{ originalEvent, value }` and the generic `trackBy` input; `@angular/cdk/drag-drop` (Task 0).
- Produces: `UPickList` component, selector `u-pick-list`, `source`/`target` as two independent inputs (matching real Angular shape — NOT the Vue combined-array shape).

**Depends on:** Task 0.

**Current-API adaptation:** As in Task 1, `UListbox` has no item-drag hook. Task 4 adds the expressly authorized generic `trackBy` input to `UListbox`; its optional callback contract is `(index: number, option: unknown) => unknown`, and its helper returns the callback result when supplied and the index otherwise. Non-drag mode composes the two Listboxes through their real inputs and `(onChange)` event, forwarding `sourceTrackBy` only to the source child and `targetTrackBy` only to the target child; opt-in drag mode renders two component-local, grouped CDK drop lists.

- [ ] **Step 1: Write the failing tests**

First add the generic `UListbox` tracking regressions to the existing test file. The omitted-input case must prove index tracking reuses each option node by position after an equivalent-object refresh; the supplied callback case must prove custom keys reuse nodes by key across a reorder:

```typescript
// packages/ng/src/listbox/listbox.spec.ts
import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UListbox } from "./listbox";

describe("UListbox trackBy", () => {
  it("uses index tracking by default and reuses option DOM by position", () => {
    @Component({
      standalone: true,
      imports: [UListbox],
      template: `<u-listbox [options]="options" [optionLabel]="'label'" />`,
    })
    class HostComponent {
      options = [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ];
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const before = [...fixture.nativeElement.querySelectorAll('[role="option"]')];
    fixture.componentInstance.options = [
      { id: "a", label: "A refreshed" },
      { id: "b", label: "B refreshed" },
    ];
    fixture.detectChanges();
    const after = [...fixture.nativeElement.querySelectorAll('[role="option"]')];
    expect(after[0]).toBe(before[0]);
    expect(after[1]).toBe(before[1]);
  });

  it("uses supplied custom keys and reuses option DOM by key", () => {
    @Component({
      standalone: true,
      imports: [UListbox],
      template: `<u-listbox [options]="options" [optionLabel]="'label'" [trackBy]="trackBy" />`,
    })
    class HostComponent {
      options = [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ];
      trackBy(index: number, option: unknown): unknown {
        return (option as { id: string }).id;
      }
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const before = [...fixture.nativeElement.querySelectorAll('[role="option"]')];
    fixture.componentInstance.options = [
      { id: "b", label: "B refreshed" },
      { id: "a", label: "A refreshed" },
    ];
    fixture.detectChanges();
    const after = [...fixture.nativeElement.querySelectorAll('[role="option"]')];
    expect(after[0]).toBe(before[1]);
    expect(after[1]).toBe(before[0]);
  });
});
```

Keep the complete existing `UPickList` move, transfer, CDK, filter, and control coverage below, and add the forwarding regression to that same test file:

```typescript
// packages/ng/src/pick-list/pick-list.spec.ts
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { CdkDrag, CdkDropList } from "@angular/cdk/drag-drop";
import { describe, expect, it, vi } from "vitest";
import { UListbox } from "../listbox/listbox";
import { UPickList } from "./pick-list";

function setup(dragdrop = false) {
  const fixture = TestBed.createComponent(UPickList);
  fixture.componentRef.setInput("source", ["A", "B", "C", "D"]);
  fixture.componentRef.setInput("target", ["X", "Y", "Z", "W"]);
  fixture.componentRef.setInput("dragdrop", dragdrop);
  const change = vi.fn();
  fixture.componentInstance.sourceChange.subscribe(change);
  const targetChange = vi.fn();
  fixture.componentInstance.targetChange.subscribe(targetChange);
  fixture.detectChanges();
  return { fixture, change, targetChange };
}
describe("UPickList", () => {
  it.each([
    ["up", ["B", "A", "C", "D"]],
    ["top", ["B", "A", "C", "D"]],
    ["down", ["A", "C", "B", "D"]],
    ["bottom", ["A", "C", "D", "B"]],
  ])("moves selection %s", (direction, expected) => {
    const { fixture, change } = setup();
    const root = fixture.nativeElement.querySelector('[data-pc-section="sourcelist"]');
    root.querySelectorAll('[role="option"]')[1].click();
    fixture.detectChanges();
    root.querySelector('[data-move="' + direction + '"]').click();
    expect(change).toHaveBeenLastCalledWith(expected);
    expect(fixture.componentInstance.source()).toEqual(["A", "B", "C", "D"]);
  });
  it("does not enable CDK or filtering by default", () => {
    const { fixture } = setup();
    expect(fixture.debugElement.queryAll(By.directive(CdkDrag))).toHaveLength(0);
    expect(fixture.nativeElement.querySelector('[role="searchbox"]')).toBeNull();
  });
  it("reorders through the bound CDK dropped event", () => {
    const { fixture, change } = setup(true);
    const listElement = fixture.debugElement.queryAll(By.directive(CdkDropList))[0];
    const container = listElement.injector.get(CdkDropList);
    const item = fixture.debugElement.queryAll(By.directive(CdkDrag))[1].injector.get(CdkDrag);
    listElement.triggerEventHandler("cdkDropListDropped", {
      previousIndex: 1,
      currentIndex: 0,
      item,
      container,
      previousContainer: container,
      isPointerOverContainer: true,
      distance: { x: 0, y: -20 },
      dropPoint: { x: 0, y: 0 },
      event: new MouseEvent("mouseup"),
    });
    expect(change).toHaveBeenLastCalledWith(["B", "A", "C", "D"]);
  });
  it("filters by configured fields and mode with accessible selection", () => {
    const { fixture } = setup();
    fixture.componentRef.setInput("source", [
      { name: "Apple", kind: "fruit" },
      { name: "Banana", kind: "fruit" },
    ]);
    fixture.componentRef.setInput("dataKey", "name");
    fixture.componentRef.setInput("filterBy", "name,kind");
    fixture.componentRef.setInput("filterMatchMode", "startsWith");
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('[role="searchbox"]') as HTMLInputElement;
    input.value = "App";
    input.dispatchEvent(new Event("input"));
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector('[data-pc-section="sourcelist"]');
    expect(root.textContent).toContain("Apple");
    expect(root.textContent).not.toContain("Banana");
    expect(root.querySelector('[role="listbox"]').getAttribute("aria-multiselectable")).toBe(
      "true"
    );
  });
  it.each(["up", "top", "down", "bottom"])("also reorders target %s", (direction) => {
    const { fixture, targetChange } = setup();
    const root = fixture.nativeElement.querySelector('[data-pc-section="targetlist"]');
    root.querySelectorAll('[role="option"]')[1].click();
    fixture.detectChanges();
    root.querySelector('[data-move="' + direction + '"]').click();
    const expected: Record<string, string[]> = {
      up: ["Y", "X", "Z", "W"],
      top: ["Y", "X", "Z", "W"],
      down: ["X", "Z", "Y", "W"],
      bottom: ["X", "Z", "W", "Y"],
    };
    expect(targetChange).toHaveBeenLastCalledWith(expected[direction]);
  });
  it.each([0, 1])("transfers selected items from side %s", (side) => {
    const { fixture, change, targetChange } = setup();
    const section = side === 0 ? "sourcelist" : "targetlist";
    fixture.nativeElement
      .querySelector('[data-pc-section="' + section + '"] [role="option"]')
      .click();
    fixture.detectChanges();
    fixture.nativeElement
      .querySelector(
        '[data-pc-section="' + (side === 0 ? "movetotargetbutton" : "movetosourcebutton") + '"]'
      )
      .click();
    expect(change).toHaveBeenLastCalledWith(
      side === 0 ? ["B", "C", "D"] : ["A", "B", "C", "D", "X"]
    );
    expect(targetChange).toHaveBeenLastCalledWith(
      side === 0 ? ["X", "Y", "Z", "W", "A"] : ["Y", "Z", "W"]
    );
  });
  it.each([0, 1])("transfers all items from side %s", (side) => {
    const { fixture, change, targetChange } = setup();
    fixture.nativeElement
      .querySelector(
        '[data-pc-section="' +
          (side === 0 ? "movealltotargetbutton" : "movealltosourcebutton") +
          '"]'
      )
      .click();
    expect(side === 0 ? change : targetChange).toHaveBeenLastCalledWith([]);
    expect(side === 0 ? targetChange : change).toHaveBeenLastCalledWith(
      side === 0
        ? ["X", "Y", "Z", "W", "A", "B", "C", "D"]
        : ["A", "B", "C", "D", "X", "Y", "Z", "W"]
    );
  });
  it.each([0, 1])("transfers by CDK between connected lists from side %s", (side) => {
    const { fixture, change, targetChange } = setup(true);
    const elements = fixture.debugElement.queryAll(By.directive(CdkDropList));
    const previousContainer = elements[side].injector.get(CdkDropList);
    const container = elements[1 - side].injector.get(CdkDropList);
    const item = elements[side].query(By.directive(CdkDrag)).injector.get(CdkDrag);
    elements[1 - side].triggerEventHandler("cdkDropListDropped", {
      previousIndex: 0,
      currentIndex: 0,
      item,
      previousContainer,
      container,
      isPointerOverContainer: true,
      distance: { x: 50, y: 0 },
      dropPoint: { x: 50, y: 0 },
      event: new MouseEvent("mouseup"),
    });
    expect(change).toHaveBeenLastCalledWith(
      side === 0 ? ["B", "C", "D"] : ["X", "A", "B", "C", "D"]
    );
    expect(targetChange).toHaveBeenLastCalledWith(
      side === 0 ? ["A", "X", "Y", "Z", "W"] : ["Y", "Z", "W"]
    );
  });
  it("gates filters and controls independently per side", () => {
    const { fixture } = setup();
    fixture.componentRef.setInput("filterBy", "name");
    fixture.componentRef.setInput("showSourceFilter", false);
    fixture.componentRef.setInput("showTargetControls", false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('[role="searchbox"]')).toHaveLength(1);
    expect(
      fixture.nativeElement.querySelector('[data-pc-section="targetlist"] [data-move]')
    ).toBeNull();
  });
  it("forwards sourceTrackBy and targetTrackBy independently and applies responsive styles", () => {
    const { fixture } = setup();
    const sourceTrackBy = vi.fn((index: number, item: string) => index + item);
    const targetTrackBy = vi.fn((index: number, item: string) => index + item);
    fixture.componentRef.setInput("sourceStyle", { maxHeight: "10rem" });
    fixture.componentRef.setInput("targetStyle", { maxHeight: "12rem" });
    fixture.componentRef.setInput("sourceTrackBy", sourceTrackBy);
    fixture.componentRef.setInput("targetTrackBy", targetTrackBy);
    fixture.componentRef.setInput("breakpoint", "700px");
    fixture.componentRef.setInput("dragdrop", true);
    fixture.detectChanges();
    fixture.componentRef.setInput("dragdrop", false);
    fixture.detectChanges();
    const listboxes = fixture.debugElement.queryAll(By.directive(UListbox));
    expect(listboxes[0].componentInstance.trackBy()).toBe(sourceTrackBy);
    expect(listboxes[1].componentInstance.trackBy()).toBe(targetTrackBy);
    fixture.componentRef.setInput("dragdrop", true);
    fixture.detectChanges();
    const source = fixture.nativeElement.querySelector(
      '[data-pc-section="sourcelist"]'
    ) as HTMLElement;
    const target = fixture.nativeElement.querySelector(
      '[data-pc-section="targetlist"]'
    ) as HTMLElement;
    expect(source.style.maxHeight).toBe("10rem");
    expect(target.style.maxHeight).toBe("12rem");
    expect(sourceTrackBy).toHaveBeenCalled();
    expect(targetTrackBy).toHaveBeenCalled();
    expect(fixture.debugElement.queryAll(By.directive(CdkDrag))).not.toHaveLength(0);
    const responsiveCss = fixture.nativeElement.querySelector("style").textContent;
    expect(responsiveCss).toContain("@media (max-width: 700px)");
    expect(responsiveCss).toContain("grid-template-columns: minmax(0, 1fr)");
  });
  it("keeps dataKey selection and permits subsequent deselection after equivalent arrays refresh", () => {
    const { fixture } = setup();
    fixture.componentRef.setInput("dataKey", "id");
    fixture.componentRef.setInput("source", [
      { id: "a", name: "Apple" },
      { id: "b", name: "Banana" },
    ]);
    fixture.componentRef.setInput("target", [{ id: "x", name: "Xylophone" }]);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('[data-pc-section="sourcelist"] [role="option"]').click();
    fixture.componentRef.setInput("source", [
      { id: "a", name: "Apple refreshed" },
      { id: "b", name: "Banana refreshed" },
    ]);
    fixture.componentRef.setInput("target", [{ id: "x", name: "Xylophone refreshed" }]);
    fixture.detectChanges();
    expect(
      fixture.nativeElement
        .querySelector('[data-pc-section="sourcelist"] [role="option"]')
        .getAttribute("aria-selected")
    ).toBe("true");
    fixture.nativeElement.querySelector('[data-pc-section="sourcelist"] [role="option"]').click();
    fixture.detectChanges();
    expect(
      fixture.nativeElement
        .querySelector('[data-pc-section="sourcelist"] [role="option"]')
        .getAttribute("aria-selected")
    ).toBe("false");
  });
  it("implements metaKeySelection in the composed source list", () => {
    const { fixture } = setup();
    fixture.componentRef.setInput("metaKeySelection", true);
    fixture.detectChanges();
    const options = fixture.nativeElement.querySelectorAll(
      '[data-pc-section="sourcelist"] [role="option"]'
    );
    options[0].click();
    options[1].click();
    fixture.detectChanges();
    expect(options[0].getAttribute("aria-selected")).toBe("false");
    expect(options[1].getAttribute("aria-selected")).toBe("true");
    options[1].click();
    fixture.detectChanges();
    expect(options[1].getAttribute("aria-selected")).toBe("true");
    options[1].dispatchEvent(new MouseEvent("click", { bubbles: true, metaKey: true }));
    fixture.detectChanges();
    expect(options[1].getAttribute("aria-selected")).toBe("false");
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run these focused commands:

```bash
pnpm --filter @ultimate/ng test --watch=false --include='src/listbox/listbox.spec.ts'
pnpm --filter @ultimate/ng test --watch=false --include='src/pick-list/pick-list.spec.ts'
```

Expected: both FAIL — the `trackBy` input/helper and `UPickList` module are not implemented yet.

- [ ] **Step 3: Write the style module**

```typescript
// packages/ng/src/pick-list/pick-list-style.ts
export const pickListStyleModule = {
  css: `
    .u-pick-list { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: start; gap: .75rem; }
    .u-pick-list-source, .u-pick-list-target { min-width: 0; border: 1px solid currentColor; }
    .u-pick-list-controls { display: flex; flex-direction: column; gap: .25rem; }
    .u-pick-list-list { margin: 0; padding: 0; list-style: none; overflow: auto; }
    .u-pick-list-item { display: block; padding: .5rem .75rem; cursor: pointer; }
    .u-pick-list-item-selected { outline: 2px solid currentColor; outline-offset: -2px; }
  `,
  classes: {
    root: () => "u-pick-list",
    sourceList: () => "u-pick-list-source",
    targetList: () => "u-pick-list-target",
    controls: () => "u-pick-list-controls",
    list: () => "u-pick-list-list",
    listItem: () => "u-pick-list-item",
    itemSelected: () => "u-pick-list-item u-pick-list-item-selected",
  },
};
```

- [ ] **Step 4: Implement `UPickList`**

First add the expressly authorized generic tracking support to the existing Angular `UListbox`:

```typescript
// packages/ng/src/listbox/listbox.ts
// Add this input beside the other generic rendering inputs.
trackBy = input<(index: number, option: unknown) => unknown>();

// Add this helper beside the other option-rendering helpers.
protected trackOption(index: number, option: unknown): unknown {
  const callback = this.trackBy();
  return callback ? callback(index, option) : index;
}
```

Replace only the template's hard-coded tracking expression:

```html
@for (option of visibleOptions(); track trackOption($index, option)) {
```

The conditional above is intentional: when the optional callback is absent, the helper returns the index; when supplied, it returns the callback result. Do not use `??` or another fallback after invoking the callback.

```typescript
// packages/ng/src/pick-list/pick-list.ts
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from "@angular/cdk/drag-drop";
import { NgStyle } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Renderer2,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  input,
  output,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { UBaseComponent } from "@ultimate/ng-core";
import { UListbox, UListboxChangeEvent } from "../listbox/listbox";
import { pickListStyleModule } from "./pick-list-style";

let nextPickListId = 0;

type MatchMode =
  | "contains"
  | "startsWith"
  | "endsWith"
  | "equals"
  | "notEquals"
  | "in"
  | "lt"
  | "lte"
  | "gt"
  | "gte";
function field(item: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (v, key) =>
        v != null && typeof v === "object" ? (v as Record<string, unknown>)[key] : undefined,
      item
    );
}
function matches(value: unknown, query: unknown, mode: MatchMode, locale?: string): boolean {
  if (query == null || query === "") return true;
  const text = (v: unknown) => String(v ?? "").toLocaleLowerCase(locale || undefined);
  if (mode === "in") return Array.isArray(query) && query.some((v) => text(value) === text(v));
  if (value == null) return mode === "notEquals";
  switch (mode) {
    case "contains":
      return text(value).includes(text(query));
    case "startsWith":
      return text(value).startsWith(text(query));
    case "endsWith":
      return text(value).endsWith(text(query));
    case "equals":
      return text(value) === text(query);
    case "notEquals":
      return text(value) !== text(query);
    case "lt":
      return Number(value) < Number(query);
    case "lte":
      return Number(value) <= Number(query);
    case "gt":
      return Number(value) > Number(query);
    case "gte":
      return Number(value) >= Number(query);
  }
}

@Component({
  selector: "u-pick-list",
  standalone: true,
  imports: [UListbox, FormsModule, DragDropModule, NgStyle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div [id]="rootId" [class]="cx('root')" cdkDropListGroup>
      @for (side of sides; track side) {
        <section
          [attr.data-pc-section]="side === 0 ? 'sourcelist' : 'targetlist'"
          [class]="side === 0 ? cx('sourceList') : cx('targetList')"
          [ngStyle]="side === 0 ? sourceStyle() : targetStyle()"
        >
          <h3>{{ side === 0 ? sourceHeader() : targetHeader() }}</h3>
          @if (side === 0 ? showSourceControls() : showTargetControls()) {
            <div [class]="cx('controls')">
              @for (direction of directions; track direction) {
                <button
                  type="button"
                  [attr.data-move]="direction"
                  [disabled]="disabled() || selected()[side].length === 0"
                  (click)="move(side, direction)"
                >
                  Move {{ direction }}
                </button>
              }
            </div>
          }
          @if (filterBy() && (side === 0 ? showSourceFilter() : showTargetFilter())) {
            <input
              type="text"
              role="searchbox"
              [attr.aria-label]="side === 0 ? 'Filter source' : 'Filter target'"
              [value]="queries()[side]"
              [disabled]="disabled()"
              (input)="setQuery(side, $any($event.target).value)"
            />
          }
          @if (dragdrop()) {
            <ul
              cdkDropList
              [class]="cx('list')"
              [cdkDropListData]="side"
              [cdkDropListDisabled]="disabled()"
              (cdkDropListDropped)="drop($event)"
              role="listbox"
              aria-multiselectable="true"
              [attr.aria-label]="side === 0 ? sourceHeader() : targetHeader()"
            >
              @for (item of visible(side); track trackItem(side, $index, item)) {
                <li
                  cdkDrag
                  [class]="isSelected(side, item) ? cx('itemSelected') : cx('listItem')"
                  [cdkDragData]="item"
                  [cdkDragDisabled]="disabled() || optionDisabled(side, item)"
                  role="option"
                  [attr.aria-disabled]="optionDisabled(side, item)"
                  [attr.aria-selected]="isSelected(side, item)"
                  tabindex="0"
                  (click)="select(side, item, $event)"
                  (keydown.enter)="select(side, item, $event)"
                  (keydown.space)="$event.preventDefault(); select(side, item, $event)"
                >
                  {{ label(item) }}
                </li>
              }
            </ul>
          } @else {
            <div [class]="cx('list')">
              <u-listbox
                [options]="visible(side)"
                [multiple]="true"
                [ngModel]="selected()[side]"
                [ngModelOptions]="{ standalone: true }"
                [optionLabel]="label"
                [optionValue]="identity"
                [trackBy]="side === 0 ? sourceTrackBy() : targetTrackBy()"
                [disabled]="disabled()"
                [optionDisabled]="side === 0 ? sourceOptionDisabled() : targetOptionDisabled()"
                [ariaLabel]="side === 0 ? sourceHeader() : targetHeader()"
                (onChange)="fromListbox(side, $event)"
              />
            </div>
          }
        </section>
      }
      <div [class]="cx('controls')">
        <button
          type="button"
          data-pc-section="movetotargetbutton"
          (click)="transfer(0, false)"
          [disabled]="disabled() || !selected()[0].length"
        >
          To Target
        </button>
        <button
          type="button"
          data-pc-section="movealltotargetbutton"
          (click)="transfer(0, true)"
          [disabled]="disabled() || !source().length"
        >
          All To Target
        </button>
        <button
          type="button"
          data-pc-section="movetosourcebutton"
          (click)="transfer(1, false)"
          [disabled]="disabled() || !selected()[1].length"
        >
          To Source
        </button>
        <button
          type="button"
          data-pc-section="movealltosourcebutton"
          (click)="transfer(1, true)"
          [disabled]="disabled() || !target().length"
        >
          All To Source
        </button>
      </div>
    </div>
  `,
})
export class UPickList extends UBaseComponent {
  protected override readonly componentName = "pick-list";
  protected override readonly styleModule = pickListStyleModule;
  source = input<unknown[]>([]);
  target = input<unknown[]>([]);
  sourceChange = output<unknown[]>();
  targetChange = output<unknown[]>();
  dataKey = input("");
  dragdrop = input(false, { transform: booleanAttribute });
  disabled = input(false, { transform: booleanAttribute });
  metaKeySelection = input(false, { transform: booleanAttribute });
  filterBy = input("");
  filterMatchMode = input<MatchMode>("contains");
  filterLocale = input<string>();
  showSourceFilter = input(true, { transform: booleanAttribute });
  showTargetFilter = input(true, { transform: booleanAttribute });
  showSourceControls = input(true, { transform: booleanAttribute });
  showTargetControls = input(true, { transform: booleanAttribute });
  sourceHeader = input("Source");
  targetHeader = input("Target");
  sourceOptionDisabled = input<string | ((item: unknown) => boolean)>();
  targetOptionDisabled = input<string | ((item: unknown) => boolean)>();
  sourceStyle = input<Record<string, string | number>>({});
  targetStyle = input<Record<string, string | number>>({});
  sourceTrackBy = input<(index: number, item: unknown) => unknown>((_index, item) =>
    this.identity(item)
  );
  targetTrackBy = input<(index: number, item: unknown) => unknown>((_index, item) =>
    this.identity(item)
  );
  breakpoint = input("960px");
  protected readonly rootId = `u-pick-list-${++nextPickListId}`;
  protected readonly responsiveStyle = computed(
    () =>
      `@media (max-width: ${this.breakpoint()}) { #${this.rootId} { grid-template-columns: minmax(0, 1fr); } }`
  );
  protected readonly sides = [0, 1] as const;
  protected readonly directions = ["up", "top", "down", "bottom"] as const;
  protected readonly selected = signal<[unknown[], unknown[]]>([[], []]);
  protected readonly queries = signal<[string, string]>(["", ""]);
  protected items(side: number): unknown[] {
    return side === 0 ? this.source() : this.target();
  }
  protected readonly identity = (item: unknown): unknown =>
    this.dataKey() ? field(item, this.dataKey()) : item;
  protected readonly label = (item: unknown): string =>
    String(this.dataKey() ? field(item, this.dataKey()) : item);
  protected trackItem(side: number, index: number, item: unknown): unknown {
    return (side === 0 ? this.sourceTrackBy() : this.targetTrackBy())(index, item);
  }
  protected optionDisabled(side: number, item: unknown): boolean {
    const accessor = side === 0 ? this.sourceOptionDisabled() : this.targetOptionDisabled();
    return typeof accessor === "function"
      ? accessor(item)
      : accessor
        ? Boolean(field(item, accessor))
        : false;
  }
  protected visible(side: number): unknown[] {
    const gate = side === 0 ? this.showSourceFilter() : this.showTargetFilter();
    return !this.filterBy() || !gate
      ? this.items(side)
      : this.items(side).filter((item) =>
          this.filterBy()
            .split(",")
            .some((key) =>
              matches(
                field(item, key.trim()),
                this.queries()[side],
                this.filterMatchMode(),
                this.filterLocale()
              )
            )
        );
  }
  protected setQuery(side: number, query: string): void {
    const next: [string, string] = [...this.queries()];
    next[side] = query;
    this.queries.set(next);
  }
  protected isSelected(side: number, item: unknown): boolean {
    return this.selected()[side].includes(this.identity(item));
  }
  protected select(side: number, item: unknown, event: MouseEvent | KeyboardEvent): void {
    if (this.disabled() || this.optionDisabled(side, item)) return;
    const next: [unknown[], unknown[]] = [...this.selected()];
    const current = this.metaKeySelection() && !event.ctrlKey && !event.metaKey ? [] : next[side];
    const value = this.identity(item);
    const toggled = current.includes(value)
      ? current.filter((selectedValue) => selectedValue !== value)
      : [...current, value];
    next[side] = this.normalizeSelection(toggled, next[side], event);
    this.selected.set(next);
  }
  protected setSelected(side: number, value: unknown[]): void {
    const next: [unknown[], unknown[]] = [...this.selected()];
    next[side] = value;
    this.selected.set(next);
  }
  protected fromListbox(side: number, event: UListboxChangeEvent): void {
    const current = this.selected()[side];
    const next = Array.isArray(event.value) ? event.value : [];
    this.setSelected(side, this.normalizeSelection(next, current, event.originalEvent));
  }
  private normalizeSelection(next: unknown[], current: unknown[], event: Event): unknown[] {
    const pointer = event as MouseEvent;
    if (!this.metaKeySelection() || pointer.ctrlKey || pointer.metaKey) return next;
    const added = next.find((value) => !current.includes(value));
    if (added !== undefined) return [added];
    const removed = current.find((value) => !next.includes(value));
    return removed !== undefined ? [removed] : current;
  }
  private emit(side: number, value: unknown[]): void {
    (side === 0 ? this.sourceChange : this.targetChange).emit(value);
  }
  protected move(side: number, direction: "up" | "top" | "down" | "bottom"): void {
    if (this.disabled()) return;
    const next = [...this.items(side)];
    if (direction === "top" || direction === "bottom") {
      const chosen = next.filter((item) => this.isSelected(side, item));
      const rest = next.filter((item) => !this.isSelected(side, item));
      this.emit(side, direction === "top" ? [...chosen, ...rest] : [...rest, ...chosen]);
      return;
    }
    const delta = direction === "up" ? -1 : 1;
    const indexes = next.map((_, index) => index);
    if (delta === 1) indexes.reverse();
    for (const index of indexes) {
      const to = index + delta;
      if (
        to >= 0 &&
        to < next.length &&
        this.isSelected(side, next[index]) &&
        !this.isSelected(side, next[to])
      )
        moveItemInArray(next, index, to);
    }
    this.emit(side, next);
  }
  protected transfer(side: number, all: boolean): void {
    if (this.disabled()) return;
    const chosen = this.items(side).filter(
      (item) => !this.optionDisabled(side, item) && (all || this.isSelected(side, item))
    );
    this.emit(
      side,
      this.items(side).filter((item) => !chosen.includes(item))
    );
    this.emit(1 - side, [...this.items(1 - side), ...chosen]);
    this.selected.set([[], []]);
  }
  protected drop(event: CdkDragDrop<number>): void {
    if (!this.dragdrop() || this.disabled()) return;
    const fromSide = event.previousContainer.data;
    const toSide = event.container.data;
    const item = this.visible(fromSide)[event.previousIndex];
    if (this.optionDisabled(fromSide, item)) return;
    const from = [...this.items(fromSide)];
    const fromIndex = from.indexOf(item);
    const destination = this.visible(toSide)[event.currentIndex];
    if (fromIndex < 0) return;
    if (fromSide === toSide) {
      const toIndex = destination === undefined ? from.length - 1 : from.indexOf(destination);
      moveItemInArray(from, fromIndex, toIndex);
      this.emit(fromSide, from);
    } else {
      const to = [...this.items(toSide)];
      const toIndex = destination === undefined ? to.length : to.indexOf(destination);
      transferArrayItem(from, to, fromIndex, toIndex);
      this.emit(fromSide, from);
      this.emit(toSide, to);
    }
    this.selected.set([[], []]);
  }

  private styleEl?: HTMLStyleElement;
  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2
  ) {
    super();
    effect(() => {
      const style = this.responsiveStyle();
      if (!this.styleEl) {
        this.styleEl = this.renderer.createElement("style");
        this.renderer.appendChild(this.elementRef.nativeElement, this.styleEl);
      }
      this.renderer.setProperty(this.styleEl, "textContent", style);
    });
  }
}
```

- [ ] **Step 5: Run to verify pass**

Run these focused commands:

```bash
pnpm --filter @ultimate/ng test --watch=false --include='src/listbox/listbox.spec.ts'
pnpm --filter @ultimate/ng test --watch=false --include='src/pick-list/pick-list.spec.ts'
```

Expected: both PASS.

- [ ] **Step 6: Barrel + stories**

```typescript
// packages/ng/src/pick-list/index.ts
export * from "./pick-list";
```

Append to `packages/ng/src/index.ts`.

```typescript
// packages/ng/src/pick-list/pick-list.stories.ts
import { Component } from "@angular/core";
import { moduleMetadata, type Meta, type StoryObj } from "@storybook/angular";
import { UPickList } from "./pick-list";

@Component({
  selector: "story-controlled-pick-list",
  standalone: true,
  imports: [UPickList],
  template: `<u-pick-list
    [source]="source"
    [target]="target"
    (sourceChange)="source = $event"
    (targetChange)="target = $event"
  />`,
})
class ControlledPickListStory {
  source = ["Apple", "Banana", "Cherry"];
  target: string[] = [];
}

const meta: Meta<UPickList> = { title: "Data/PickList", component: UPickList };
export default meta;
type Story = StoryObj<UPickList>;
export const Default: Story = { args: { source: ["Apple", "Banana", "Cherry"], target: [] } };
export const Controlled: Story = {
  decorators: [moduleMetadata({ imports: [ControlledPickListStory] })],
  render: () => ({ template: "<story-controlled-pick-list />" }),
};
```

- [ ] **Step 7: Register provenance and run the full regression/ceiling checks**

Every new source, test, story, base, and barrel needs a manifest record. Preserve every existing record and append only missing records for this task:

```bash
node --input-type=module <<'NODE'
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
const directory = "packages/ng/src/pick-list";
const path = "docs/architecture/provenance/ng.json";
const entries = JSON.parse(readFileSync(path, "utf8"));
for (const name of readdirSync(directory).filter(name => /\.(ts|tsx|vue)$/.test(name))) {
  const destination = directory + "/" + name;
  if (entries.some(entry => entry.ultimateDestination === destination)) continue;
  const implementation = name === "pick-list.ts";
  entries.push({
    originalPath: implementation ? "packages/primeng/src/picklist/picklist.ts" : "n/a",
    ultimateDestination: destination,
    modificationStatus: implementation ? "reimplemented-with-reference" : "authored",
    modificationDescription: implementation ? "Batch 3 framework-native PickList; behavior referenced from the pinned PrimeNG 21.1.9 source; disclosed cuts remain excluded." : "Ultimate-authored PickList test, story, barrel, or structural style."
  });
}
writeFileSync(path, JSON.stringify(entries, null, 2) + "\n");
NODE
pnpm test
node scripts/provenance/validate-dependency-ceiling.mjs
```

Expected: the complete existing suite passes and the ceiling script exits 0. Do not infer full-suite success from the focused test alone.

- [ ] **Step 8: Commit**

```bash
git add packages/ng/src/listbox/listbox.ts packages/ng/src/listbox/listbox.spec.ts packages/ng/src/pick-list packages/ng/src/index.ts docs/architecture/provenance/ng.json
git commit -m "$(cat <<'EOF'
feat(ng): add UPickList

Real PrimeNG PickList behavior: two independent source/target inputs
(matching real shape, not a combined array), move-between-lists
controls, real opt-in CDK drag/drop. Composes two UListbox instances
and forwards independent sourceTrackBy/targetTrackBy callbacks through
the generic UListbox trackBy input. The focused Listbox and PickList
regressions pass before this commit.
EOF
)"
```

---

## Task 5: React `UPickList`

**Files:**

- Create: `packages/react/src/pick-list/pick-list.tsx`
- Create: `packages/react/src/pick-list/pick-list-style.ts`
- Create: `packages/react/src/pick-list/pick-list.spec.tsx`
- Create: `packages/react/src/pick-list/pick-list.stories.tsx`
- Create: `packages/react/src/pick-list/index.ts`
- Modify: `packages/react/src/index.ts`

- Modify: `docs/architecture/provenance/react.json` (only this component's new file records)

**Interfaces:**

- Consumes: `useComponentBase`. Same `UListbox`-preferred-not-mandatory evaluation as Task 2 (independent decision — React PickList also does not compose PrimeReact's own Listbox in real source).
- Produces: `UPickList` component, `source`/`target` as two independent props (matching Angular's shape, per real source).

**Depends on:** none.

- [ ] **Step 1: Write the failing test**

```tsx
// packages/react/src/pick-list/pick-list.spec.tsx
import * as React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UPickList } from "./pick-list";

function setup(dragdrop = false) {
  const change = vi.fn();
  const targetChange = vi.fn();
  const result = render(
    <UPickList
      source={["A", "B", "C", "D"]}
      target={["X", "Y", "Z", "W"]}
      onSourceChange={change}
      onTargetChange={targetChange}
      itemTemplate={(item) => <span>{item}</span>}
      dragdrop={dragdrop}
    />
  );
  return { ...result, change, targetChange };
}
describe("UPickList", () => {
  it.each([
    ["up", ["B", "A", "C", "D"]],
    ["top", ["B", "A", "C", "D"]],
    ["down", ["A", "C", "B", "D"]],
    ["bottom", ["A", "C", "D", "B"]],
  ])("moves selection %s", (direction, expected) => {
    const { container, change } = setup();
    const root = within(container.querySelector('[data-pc-section="sourcelist"]') as HTMLElement);
    fireEvent.click(root.getByRole("option", { name: "B" }));
    fireEvent.click(root.getByRole("button", { name: "Move " + direction }));
    expect(change).toHaveBeenLastCalledWith(expected);
  });
  it("does not add native DnD or a filter without opt-in", () => {
    const { container } = setup();
    expect(container.querySelector("[draggable]")).toBeNull();
    expect(screen.queryByRole("searchbox")).toBeNull();
  });
  it("uses actual native dragstart, dragover, and drop events for reorder", () => {
    const { change } = setup(true);
    const dataTransfer = { setData: vi.fn(), effectAllowed: "" };
    fireEvent.dragStart(screen.getByRole("option", { name: "B" }), { dataTransfer });
    expect(fireEvent.dragOver(screen.getByRole("option", { name: "A" }), { dataTransfer })).toBe(
      false
    );
    fireEvent.drop(screen.getByRole("option", { name: "A" }), { dataTransfer });
    expect(change).toHaveBeenLastCalledWith(["B", "A", "C", "D"]);
  });
  it("filters configured fields and supports keyboard selection", () => {
    const change = vi.fn();
    render(
      <UPickList
        source={[{ name: "Apple" }, { name: "Banana" }]}
        target={[]}
        onSourceChange={change}
        onTargetChange={vi.fn()}
        itemTemplate={(item) => <span>{item.name}</span>}
        dataKey="name"
        filter
        filterBy="name"
        filterMatchMode="startsWith"
      />
    );
    fireEvent.change(screen.getByRole("searchbox", { name: "Filter source" }), {
      target: { value: "App" },
    });
    expect(screen.queryByRole("option", { name: "Banana" })).toBeNull();
    fireEvent.keyDown(screen.getByRole("option", { name: "Apple" }), { key: "Enter" });
    expect(screen.getByRole("option", { name: "Apple" })).toHaveAttribute("aria-selected", "true");
  });
  it.each(["up", "top", "down", "bottom"])("also reorders target %s", (direction) => {
    const { container, targetChange } = setup();
    const root = within(container.querySelector('[data-pc-section="targetlist"]') as HTMLElement);
    fireEvent.click(root.getByRole("option", { name: "Y" }));
    fireEvent.click(root.getByRole("button", { name: "Move " + direction }));
    const expected: Record<string, string[]> = {
      up: ["Y", "X", "Z", "W"],
      top: ["Y", "X", "Z", "W"],
      down: ["X", "Z", "Y", "W"],
      bottom: ["X", "Z", "W", "Y"],
    };
    expect(targetChange).toHaveBeenLastCalledWith(expected[direction]);
  });
  it.each([0, 1])("transfers selected items from side %s", (side) => {
    const { change, targetChange } = setup();
    fireEvent.click(screen.getByRole("option", { name: side === 0 ? "A" : "X" }));
    fireEvent.click(screen.getByRole("button", { name: side === 0 ? "To Target" : "To Source" }));
    expect(change).toHaveBeenLastCalledWith(
      side === 0 ? ["B", "C", "D"] : ["A", "B", "C", "D", "X"]
    );
    expect(targetChange).toHaveBeenLastCalledWith(
      side === 0 ? ["X", "Y", "Z", "W", "A"] : ["Y", "Z", "W"]
    );
  });
  it.each([0, 1])("transfers all items from side %s", (side) => {
    const { change, targetChange } = setup();
    fireEvent.click(
      screen.getByRole("button", { name: side === 0 ? "All To Target" : "All To Source" })
    );
    expect(side === 0 ? change : targetChange).toHaveBeenLastCalledWith([]);
  });
  it.each([0, 1])("handles native cross-list drop from side %s", (side) => {
    const { change, targetChange } = setup(true);
    const dataTransfer = { setData: vi.fn(), effectAllowed: "" };
    const destination = screen.getByRole("option", { name: side === 0 ? "X" : "A" });
    fireEvent.dragStart(screen.getByRole("option", { name: side === 0 ? "A" : "X" }), {
      dataTransfer,
    });
    fireEvent.dragOver(destination, { dataTransfer });
    fireEvent.drop(destination, { dataTransfer });
    expect(change).toHaveBeenLastCalledWith(
      side === 0 ? ["B", "C", "D"] : ["X", "A", "B", "C", "D"]
    );
    expect(targetChange).toHaveBeenLastCalledWith(
      side === 0 ? ["A", "X", "Y", "Z", "W"] : ["Y", "Z", "W"]
    );
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm --filter @ultimate/react test pick-list.spec.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement**

```tsx
// packages/react/src/pick-list/pick-list.tsx
import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { pickListStyleModule } from "./pick-list-style";

type MatchMode =
  | "contains"
  | "startsWith"
  | "endsWith"
  | "equals"
  | "notEquals"
  | "in"
  | "lt"
  | "lte"
  | "gt"
  | "gte";
function field(item: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (v, key) =>
        v != null && typeof v === "object" ? (v as Record<string, unknown>)[key] : undefined,
      item
    );
}
function matches(value: unknown, query: unknown, mode: MatchMode, locale?: string): boolean {
  if (query == null || query === "") return true;
  const text = (v: unknown) => String(v ?? "").toLocaleLowerCase(locale || undefined);
  if (mode === "in") return Array.isArray(query) && query.some((v) => text(value) === text(v));
  if (value == null) return mode === "notEquals";
  switch (mode) {
    case "contains":
      return text(value).includes(text(query));
    case "startsWith":
      return text(value).startsWith(text(query));
    case "endsWith":
      return text(value).endsWith(text(query));
    case "equals":
      return text(value) === text(query);
    case "notEquals":
      return text(value) !== text(query);
    case "lt":
      return Number(value) < Number(query);
    case "lte":
      return Number(value) <= Number(query);
    case "gt":
      return Number(value) > Number(query);
    case "gte":
      return Number(value) >= Number(query);
  }
}

export interface UPickListProps<T = unknown> {
  source: T[];
  target: T[];
  onSourceChange: (value: T[]) => void;
  onTargetChange: (value: T[]) => void;
  showSourceFilter?: boolean;
  showTargetFilter?: boolean;
  showSourceControls?: boolean;
  showTargetControls?: boolean;
  sourceHeader?: React.ReactNode;
  targetHeader?: React.ReactNode;
  sourceStyle?: React.CSSProperties;
  targetStyle?: React.CSSProperties;
  itemTemplate: (item: T) => React.ReactNode;
  dataKey?: string;
  filter?: boolean;
  filterBy?: string;
  filterMatchMode?: MatchMode;
  filterLocale?: string;
  dragdrop?: boolean;
  metaKeySelection?: boolean;
  breakpoint?: string;
  className?: string;
}
export function UPickList<T = unknown>({
  source,
  target,
  onSourceChange,
  onTargetChange,
  showSourceFilter = true,
  showTargetFilter = true,
  showSourceControls = true,
  showTargetControls = true,
  sourceHeader = "Source",
  targetHeader = "Target",
  sourceStyle,
  targetStyle,
  itemTemplate,
  dataKey,
  filter = false,
  filterBy,
  filterMatchMode = "contains",
  filterLocale,
  dragdrop = false,
  metaKeySelection = false,
  breakpoint = "960px",
  className,
}: UPickListProps<T>): React.ReactElement {
  const { cx } = useComponentBase({ componentName: "pick-list", styleModule: pickListStyleModule });
  const id = React.useId().replace(/:/g, "");
  const lists = [source, target];
  const [selected, setSelected] = React.useState<T[][]>([[], []]);
  const [queries, setQueries] = React.useState<string[]>(["", ""]);
  const drag = React.useRef<{ side: number; item: T } | null>(null);
  const identity = (item: T): unknown => (dataKey ? field(item, dataKey) : item);
  const isSelected = (side: number, item: T): boolean =>
    selected[side].some((value) => identity(value) === identity(item));
  const emit = (side: number, items: T[]): void => {
    (side === 0 ? onSourceChange : onTargetChange)(items);
  };
  const select = (side: number, item: T, event: React.MouseEvent | React.KeyboardEvent): void => {
    setSelected((previous) => {
      const next = previous.map((items) => [...items]);
      const current = metaKeySelection && !event.ctrlKey && !event.metaKey ? [] : next[side];
      next[side] = current.some((value) => identity(value) === identity(item))
        ? current.filter((value) => identity(value) !== identity(item))
        : [...current, item];
      return next;
    });
  };
  const move = (side: number, direction: "up" | "top" | "down" | "bottom"): void => {
    const next = [...lists[side]];
    if (direction === "top" || direction === "bottom") {
      const chosen = next.filter((item) => isSelected(side, item));
      const rest = next.filter((item) => !isSelected(side, item));
      emit(side, direction === "top" ? [...chosen, ...rest] : [...rest, ...chosen]);
      return;
    }
    const delta = direction === "up" ? -1 : 1;
    const indexes = next.map((_, index) => index);
    if (delta === 1) indexes.reverse();
    for (const index of indexes) {
      const to = index + delta;
      if (
        to >= 0 &&
        to < next.length &&
        isSelected(side, next[index]) &&
        !isSelected(side, next[to])
      ) {
        [next[index], next[to]] = [next[to], next[index]];
      }
    }
    emit(side, next);
  };
  const transfer = (side: number, all: boolean): void => {
    const chosen = lists[side].filter((item) => all || isSelected(side, item));
    emit(
      side,
      lists[side].filter((item) => !chosen.includes(item))
    );
    emit(1 - side, [...lists[1 - side], ...chosen]);
    setSelected([[], []]);
  };
  const drop = (side: number, before: T | undefined, event: React.DragEvent): void => {
    if (!dragdrop || !drag.current) return;
    event.preventDefault();
    event.stopPropagation();
    const { side: fromSide, item } = drag.current;
    drag.current = null;
    const from = [...lists[fromSide]];
    const index = from.indexOf(item);
    if (index < 0) return;
    if (fromSide === side) {
      const destination = before === undefined ? from.length - 1 : from.indexOf(before);
      if (destination < 0) return;
      from.splice(index, 1);
      from.splice(destination, 0, item);
      emit(side, from);
    } else {
      const to = [...lists[side]];
      const destination = before === undefined ? to.length : to.indexOf(before);
      if (destination < 0) return;
      from.splice(index, 1);
      to.splice(destination, 0, item);
      emit(fromSide, from);
      emit(side, to);
    }
    setSelected([[], []]);
  };
  const keyDown = (side: number, item: T, event: React.KeyboardEvent<HTMLLIElement>): void => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      select(side, item, event);
      return;
    }
    const options = Array.from(
      event.currentTarget.parentElement?.querySelectorAll<HTMLElement>('[role="option"]') ?? []
    );
    const index = options.indexOf(event.currentTarget);
    const destination =
      event.key === "ArrowDown"
        ? index + 1
        : event.key === "ArrowUp"
          ? index - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? options.length - 1
              : -1;
    if (options[destination]) {
      event.preventDefault();
      options[destination].focus();
    }
  };
  return (
    <div id={id} className={[cx("root"), className].filter(Boolean).join(" ")}>
      <style>{`@media (max-width: ${breakpoint}) { #${id} { grid-template-columns: minmax(0, 1fr); } }`}</style>
      {lists.map((items, side) => {
        const showFilter = filter && (side === 0 ? showSourceFilter : showTargetFilter);
        const visible =
          !showFilter || !queries[side]
            ? items
            : items.filter((item) =>
                (filterBy
                  ? filterBy.split(",").map((key) => field(item, key.trim()))
                  : [item]
                ).some((value) => matches(value, queries[side], filterMatchMode, filterLocale))
              );
        return (
          <section
            key={side}
            data-pc-section={side === 0 ? "sourcelist" : "targetlist"}
            style={side === 0 ? sourceStyle : targetStyle}
          >
            <h3>{side === 0 ? sourceHeader : targetHeader}</h3>
            {(side === 0 ? showSourceControls : showTargetControls) && (
              <div className={cx("controls")}>
                {(["up", "top", "down", "bottom"] as const).map((direction) => (
                  <button
                    key={direction}
                    type="button"
                    data-move={direction}
                    disabled={selected[side].length === 0}
                    onClick={() => move(side, direction)}
                  >
                    Move {direction}
                  </button>
                ))}
              </div>
            )}
            {showFilter && (
              <input
                type="text"
                role="searchbox"
                aria-label={side === 0 ? "Filter source" : "Filter target"}
                value={queries[side]}
                onChange={(event) =>
                  setQueries((previous) =>
                    previous.map((value, index) => (index === side ? event.target.value : value))
                  )
                }
              />
            )}
            <ul
              className={cx("list")}
              role="listbox"
              aria-label={side === 0 ? "Source" : "Target"}
              aria-multiselectable="true"
              tabIndex={0}
              onDragOver={dragdrop ? (event) => event.preventDefault() : undefined}
              onDrop={dragdrop ? (event) => drop(side, undefined, event) : undefined}
            >
              {visible.map((item, index) => (
                <li
                  key={dataKey ? String(identity(item)) : index}
                  className={isSelected(side, item) ? cx("itemSelected") : cx("listItem")}
                  role="option"
                  aria-selected={isSelected(side, item)}
                  tabIndex={0}
                  draggable={dragdrop || undefined}
                  onClick={(event) => select(side, item, event)}
                  onKeyDown={(event) => keyDown(side, item, event)}

                  onDragStart={
                    dragdrop
                      ? (event) => {
                          drag.current = { side, item };
                          event.dataTransfer.setData("text/plain", String(index));
                          event.dataTransfer.effectAllowed = "move";
                        }
                      : undefined
                  }
                  onDragEnd={
                    dragdrop
                      ? () => {
                          drag.current = null;
                        }
                      : undefined
                  }
                  onDragOver={dragdrop ? (event) => event.preventDefault() : undefined}
                  onDrop={dragdrop ? (event) => drop(side, item, event) : undefined}
                >
                  {itemTemplate(item)}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      <div className={cx("controls")}>
        <button type="button" onClick={() => transfer(0, false)} disabled={!selected[0].length}>
          To Target
        </button>
        <button type="button" onClick={() => transfer(0, true)} disabled={!source.length}>
          All To Target
        </button>
        <button type="button" onClick={() => transfer(1, false)} disabled={!selected[1].length}>
          To Source
        </button>
        <button type="button" onClick={() => transfer(1, true)} disabled={!target.length}>
          All To Source
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Style module**

```typescript
// packages/react/src/pick-list/pick-list-style.ts
import type { StyleModule } from "@ultimate/react-core";

export const pickListStyleModule: StyleModule = {
  css: `
    .u-pick-list { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: start; gap: .75rem; }
    .u-pick-list-source, .u-pick-list-target { min-width: 0; border: 1px solid currentColor; }
    .u-pick-list-controls { display: flex; flex-direction: column; gap: .25rem; }
    .u-pick-list-list { margin: 0; padding: 0; list-style: none; overflow: auto; }
    .u-pick-list-item { display: block; padding: .5rem .75rem; cursor: pointer; }
    .u-pick-list-item-selected { outline: 2px solid currentColor; outline-offset: -2px; }
  `,
  classes: {
    root: () => "u-pick-list",
    sourceList: () => "u-pick-list-source",
    targetList: () => "u-pick-list-target",
    controls: () => "u-pick-list-controls",
    list: () => "u-pick-list-list",
    listItem: () => "u-pick-list-item",
    itemSelected: () => "u-pick-list-item u-pick-list-item-selected",
  },
};
```

- [ ] **Step 5: Run to verify pass**

Run: `pnpm --filter @ultimate/react test pick-list.spec.tsx`
Expected: PASS.

- [ ] **Step 6: Barrel + stories**

```typescript
// packages/react/src/pick-list/index.ts
export * from "./pick-list";
```

Append to `packages/react/src/index.ts`.

```tsx
// packages/react/src/pick-list/pick-list.stories.tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { UPickList } from "./pick-list";

function ControlledPickListStory(): React.ReactElement {
  const [source, setSource] = useState(["Apple", "Banana", "Cherry"]);
  const [target, setTarget] = useState<string[]>([]);
  return (
    <UPickList
      source={source}
      target={target}
      onSourceChange={setSource}
      onTargetChange={setTarget}
      itemTemplate={(item) => <span>{item as string}</span>}
    />
  );
}

const meta: Meta<typeof UPickList> = { title: "Data/PickList", component: UPickList };
export default meta;
type Story = StoryObj<typeof UPickList>;
export const Default: Story = {
  args: {
    source: ["Apple", "Banana", "Cherry"],
    target: [],
    itemTemplate: (item) => <span>{item as string}</span>,
  },
};

export const Controlled: Story = {
  render: () => <ControlledPickListStory />,
};
```

- [ ] **Step 7: Register provenance and run the full regression/ceiling checks**

Every new source, test, story, base, and barrel needs a manifest record. Preserve every existing record and append only missing records for this task:

```bash
node --input-type=module <<'NODE'
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
const directory = "packages/react/src/pick-list";
const path = "docs/architecture/provenance/react.json";
const entries = JSON.parse(readFileSync(path, "utf8"));
for (const name of readdirSync(directory).filter(name => /\.(ts|tsx|vue)$/.test(name))) {
  const destination = directory + "/" + name;
  if (entries.some(entry => entry.ultimateDestination === destination)) continue;
  const implementation = name === "pick-list.tsx";
  entries.push({
    originalPath: implementation ? "components/lib/picklist/PickList.js" : "n/a",
    ultimateDestination: destination,
    modificationStatus: implementation ? "reimplemented-with-reference" : "authored",
    modificationDescription: implementation ? "Batch 3 framework-native PickList; behavior referenced from the pinned PrimeReact 10.9.9 source; disclosed cuts remain excluded." : "Ultimate-authored PickList test, story, barrel, or structural style."
  });
}
writeFileSync(path, JSON.stringify(entries, null, 2) + "\n");
NODE
pnpm test
node scripts/provenance/validate-dependency-ceiling.mjs
```

Expected: the complete existing suite passes and the ceiling script exits 0. Do not infer full-suite success from the focused test alone.

- [ ] **Step 8: Commit**

```bash
git add packages/react/src/pick-list packages/react/src/index.ts docs/architecture/provenance/react.json
git commit -m "$(cat <<'EOF'
feat(react): add UPickList

Real PrimeReact PickList behavior: two independent source/target
props, real opt-in native HTML5 drag/drop. Bespoke item rendering,
matching real PrimeReact's own PickListSubList.js doubled per side.
EOF
)"
```

---

## Task 6: Vue `UPickList`

**Files:**

- Create: `packages/vue/src/pick-list/PickList.vue`
- Create: `packages/vue/src/pick-list/BasePickList.ts`
- Create: `packages/vue/src/pick-list/pick-list-style.ts`
- Create: `packages/vue/src/pick-list/pick-list.spec.ts`
- Create: `packages/vue/src/pick-list/pick-list.stories.ts`
- Create: `packages/vue/src/pick-list/index.ts`
- Modify: `packages/vue/src/index.ts`

- Modify: `docs/architecture/provenance/vue.json` (only this component's new file records)

**Interfaces:**

- Consumes: `createBaseComponent`; two `Listbox` instances.
- Produces: `UPickList` Vue component with `modelValue: Array` prop, default `() => [[], []]` (array-of-two-arrays — **binding, real, must not be flattened to source/target props**, Spec §3.2, §7).

**Depends on:** none.

- [ ] **Step 1: Write the failing test**

```typescript
// packages/vue/src/pick-list/pick-list.spec.ts
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import UPickList from "./PickList.vue";

function setup() {
  return mount(UPickList, {
    props: {
      modelValue: [
        ["A", "B", "C", "D"],
        ["X", "Y", "Z", "W"],
      ],
    },
  });
}
describe("UPickList", () => {
  it.each([
    ["up", ["B", "A", "C", "D"]],
    ["top", ["B", "A", "C", "D"]],
    ["down", ["A", "C", "B", "D"]],
    ["bottom", ["A", "C", "D", "B"]],
  ])("moves selection %s", async (direction, expected) => {
    const wrapper = setup();
    const root = wrapper.find('[data-pc-section="sourcelist"]');
    await root.findAll('[role="option"]')[1].trigger("click");
    await root.find('[data-pc-section="move' + direction + 'button"]').trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[0]?.[0]).toEqual([
      expected,
      ["X", "Y", "Z", "W"],
    ]);
  });
  it("has neither drag/drop nor filtering in its public props or rendered behavior", () => {
    const wrapper = setup();
    for (const prop of ["dragdrop", "filter", "filterBy", "filterMatchMode", "filterLocale"])
      expect(wrapper.props()).not.toHaveProperty(prop);
    expect(wrapper.find("[draggable]").exists()).toBe(false);
    expect(wrapper.find('[role="searchbox"]').exists()).toBe(false);
    expect(wrapper.find('input[type="text"]').exists()).toBe(false);
  });
  it("uses an accessible composed multiple-selection Listbox", async () => {
    const wrapper = setup();
    expect(wrapper.find('[role="listbox"]').attributes("aria-multiselectable")).toBe("true");
    await wrapper.find('[role="option"]').trigger("click");
    expect(wrapper.find('[role="option"]').attributes("aria-selected")).toBe("true");
  });
  it("defaults to the real two-array model and has no separate source/target props", () => {
    const wrapper = mount(UPickList);
    expect(wrapper.props("modelValue")).toEqual([[], []]);
    expect(wrapper.props()).not.toHaveProperty("source");
    expect(wrapper.props()).not.toHaveProperty("target");
  });
  it("retains source dataKey selection after an equivalent pair refresh", async () => {
    const wrapper = mount(UPickList, {
      props: {
        modelValue: [
          [
            { id: "a", label: "Apple" },
            { id: "b", label: "Banana" },
          ],
          [],
        ],
        dataKey: "id",
      },
    });
    await wrapper.find('[data-pc-section="sourcelist"] [role="option"]').trigger("click");
    await wrapper.setProps({
      modelValue: [
        [
          { id: "a", label: "Apple refreshed" },
          { id: "b", label: "Banana refreshed" },
        ],
        [],
      ],
    });
    expect(
      wrapper.find('[data-pc-section="sourcelist"] [role="option"]').attributes("aria-selected")
    ).toBe("true");
    await wrapper.find('[data-pc-section="sourcelist"] [role="option"]').trigger("click");
    expect(
      wrapper.find('[data-pc-section="sourcelist"] [role="option"]').attributes("aria-selected")
    ).toBe("false");
  });
  it("implements metaKeySelection in the composed source list", async () => {
    const wrapper = mount(UPickList, {
      props: { modelValue: [["A", "B"], []], metaKeySelection: true },
    });
    const options = wrapper.findAll('[data-pc-section="sourcelist"] [role="option"]');
    await options[0].trigger("click");
    await options[1].trigger("click");
    expect(options[0].attributes("aria-selected")).toBe("false");
    expect(options[1].attributes("aria-selected")).toBe("true");
    await options[1].trigger("click");
    expect(options[1].attributes("aria-selected")).toBe("true");
    await options[1].trigger("click", { metaKey: true });
    expect(options[1].attributes("aria-selected")).toBe("false");
  });
  it("drives each composed Listbox ul's tabindex, auto-focus, and hover-focus", async () => {
    const wrapper = mount(UPickList, {
      props: {
        modelValue: [["A", "B"], ["X"]],
        tabindex: 5,
        autoOptionFocus: false,
        focusOnHover: true,
      },
    });
    await wrapper.vm.$nextTick();
    const sourceListbox = wrapper.find('[data-pc-section="sourcelist"] [role="listbox"]');
    expect(sourceListbox.attributes("tabindex")).toBe("5");
    await wrapper.find('[data-pc-section="sourcelist"] [role="option"]').trigger("mouseover");
    expect(document.activeElement).toBe(sourceListbox.element);
    const auto = mount(UPickList, {
      props: { modelValue: [["A", "B"], ["X"]], autoOptionFocus: true },
    });
    const autoListbox = auto.find('[data-pc-section="sourcelist"] [role="listbox"]');
    await autoListbox.trigger("focus");
    await autoListbox.trigger("keydown", { code: "Enter" });
    expect(
      auto.find('[data-pc-section="sourcelist"] [role="option"]').attributes("aria-selected")
    ).toBe("true");
  });
  it.each(["up", "top", "down", "bottom"])("also reorders target %s", async (direction) => {
    const wrapper = setup();
    const root = wrapper.find('[data-pc-section="targetlist"]');
    await root.findAll('[role="option"]')[1].trigger("click");
    await root.find('[data-pc-section="move' + direction + 'button"]').trigger("click");
    const expected: Record<string, string[]> = {
      up: ["Y", "X", "Z", "W"],
      top: ["Y", "X", "Z", "W"],
      down: ["X", "Z", "Y", "W"],
      bottom: ["X", "Z", "W", "Y"],
    };
    expect(wrapper.emitted("update:modelValue")?.[0]?.[0]).toEqual([
      ["A", "B", "C", "D"],
      expected[direction],
    ]);
  });
  it.each([0, 1])("transfers selected items from side %s", async (side) => {
    const wrapper = setup();
    await wrapper
      .find(
        '[data-pc-section="' + (side === 0 ? "sourcelist" : "targetlist") + '"] [role="option"]'
      )
      .trigger("click");
    await wrapper
      .find(
        '[data-pc-section="' + (side === 0 ? "movetotargetbutton" : "movetosourcebutton") + '"]'
      )
      .trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[0]?.[0]).toEqual(
      side === 0
        ? [
            ["B", "C", "D"],
            ["X", "Y", "Z", "W", "A"],
          ]
        : [
            ["A", "B", "C", "D", "X"],
            ["Y", "Z", "W"],
          ]
    );
  });
  it.each([0, 1])("transfers all items from side %s", async (side) => {
    const wrapper = setup();
    await wrapper
      .find(
        '[data-pc-section="' +
          (side === 0 ? "movealltotargetbutton" : "movealltosourcebutton") +
          '"]'
      )
      .trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[0]?.[0]).toEqual(
      side === 0
        ? [[], ["X", "Y", "Z", "W", "A", "B", "C", "D"]]
        : [["A", "B", "C", "D", "X", "Y", "Z", "W"], []]
    );
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm --filter @ultimate/vue test pick-list.spec.ts`
Expected: FAIL.

- [ ] **Step 3: `BasePickList.ts`**

```typescript
// packages/vue/src/pick-list/BasePickList.ts
import { createBaseComponent } from "@ultimate/vue-core";
import type { ComponentOptions } from "vue";
import { pickListStyleModule } from "./pick-list-style";

export function createBasePickList(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "pick-list", styleModule: pickListStyleModule }),
    props: {
      modelValue: { type: Array, default: () => [[], []] },
      dataKey: { type: String, default: null },
      metaKeySelection: { type: Boolean, default: false },
      autoOptionFocus: { type: Boolean, default: true },
      focusOnHover: { type: Boolean, default: false },
      responsive: { type: Boolean, default: true },
      breakpoint: { type: String, default: "960px" },
      striped: { type: Boolean, default: false },
      scrollHeight: { type: String, default: "14rem" },
      tabindex: { type: Number, default: 0 },
      disabled: { type: Boolean, default: false },
      ariaLabel: { type: String, default: "Pick list" },
      ariaLabelledby: { type: String, default: null },
      showSourceControls: { type: Boolean, default: true },
      showTargetControls: { type: Boolean, default: true },
      buttonProps: { type: Object, default: () => ({}) },
      moveUpButtonProps: { type: Object, default: () => ({}) },
      moveTopButtonProps: { type: Object, default: () => ({}) },
      moveDownButtonProps: { type: Object, default: () => ({}) },
      moveBottomButtonProps: { type: Object, default: () => ({}) },
      moveToTargetButtonProps: { type: Object, default: () => ({}) },
      moveAllToTargetButtonProps: { type: Object, default: () => ({}) },
      moveToSourceButtonProps: { type: Object, default: () => ({}) },
      moveAllToSourceButtonProps: { type: Object, default: () => ({}) },
    },
    emits: ["update:modelValue"],
  };
}
```

- [ ] **Step 4: Style module**

```typescript
// packages/vue/src/pick-list/pick-list-style.ts
import type { StyleModule } from "@ultimate/vue-core";

export const pickListStyleModule: StyleModule = {
  css: `
    .u-pick-list { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: start; gap: .75rem; }
    .u-pick-list-source, .u-pick-list-target { min-width: 0; border: 1px solid currentColor; }
    .u-pick-list-controls { display: flex; flex-direction: column; gap: .25rem; }
    .u-pick-list-list { margin: 0; padding: 0; list-style: none; overflow: auto; }
    .u-pick-list-list [role="listbox"] { margin: 0; padding: 0; list-style: none; }
    .u-pick-list-item, .u-pick-list-list [role="option"] { display: block; padding: .5rem .75rem; cursor: pointer; }
    .u-pick-list-item-selected, .u-pick-list-list [role="option"][aria-selected="true"] { outline: 2px solid currentColor; outline-offset: -2px; }
    .u-pick-list.u-striped .u-pick-list-item:nth-child(even), .u-pick-list.u-striped .u-pick-list-list [role="option"]:nth-child(even) { background: rgba(0, 0, 0, .06); }
  `,
  classes: {
    root: () => "u-pick-list",
    sourceList: () => "u-pick-list-source",
    targetList: () => "u-pick-list-target",
    controls: () => "u-pick-list-controls",
    list: () => "u-pick-list-list",
  },
};
```

- [ ] **Step 5: `PickList.vue`**

```vue
<!-- packages/vue/src/pick-list/PickList.vue -->
<script>
import { createBasePickList } from "./BasePickList";
import Listbox from "../listbox/Listbox.vue";

export default {
  name: "UPickList",
  extends: createBasePickList(),
  components: { Listbox },
  data() {
    return {
      selected: [[], []],
      narrow: false,
      media: null,
      mediaListener: null,
      directions: ["up", "top", "down", "bottom"],
    };
  },
  computed: {
    lists() {
      return this.modelValue;
    },
  },
  watch: {
    breakpoint() {
      this.bindMedia();
    },
  },
  mounted() {
    this.bindMedia();
    this.syncListboxDom();
  },
  updated() {
    this.syncListboxDom();
  },
  beforeUnmount() {
    this.media?.removeEventListener("change", this.mediaListener);
  },
  methods: {
    bindMedia() {
      this.media?.removeEventListener("change", this.mediaListener);
      if (typeof window === "undefined" || !window.matchMedia) return;
      this.media = window.matchMedia("(max-width: " + this.breakpoint + ")");
      this.mediaListener = (event) => {
        this.narrow = event.matches;
      };
      this.narrow = this.media.matches;
      this.media.addEventListener("change", this.mediaListener);
    },
    identity(item) {
      return this.dataKey && item != null ? item[this.dataKey] : item;
    },
    optionValue(item) {
      return this.identity(item);
    },
    label(item) {
      return String(this.dataKey && item != null ? item[this.dataKey] : item);
    },
    isSelected(side, item) {
      return this.selected[side].includes(this.optionValue(item));
    },
    select(side, event) {
      if (this.disabled) return;
      const nextValue = Array.isArray(event.value) ? event.value : [];
      const next = this.selected.map((items) => [...items]);
      const current = next[side];
      const original = event.originalEvent;
      if (this.metaKeySelection && !original.ctrlKey && !original.metaKey) {
        const added = nextValue.find((value) => !current.includes(value));
        const removed = current.find((value) => !nextValue.includes(value));
        next[side] = added !== undefined ? [added] : removed !== undefined ? [removed] : current;
      } else {
        next[side] = nextValue;
      }
      this.selected = next;
    },
    move(side, direction) {
      if (this.disabled) return;
      const next = [...this.lists[side]];
      let result = next;
      if (direction === "top" || direction === "bottom") {
        const chosen = next.filter((item) => this.isSelected(side, item));
        const rest = next.filter((item) => !this.isSelected(side, item));
        result = direction === "top" ? [...chosen, ...rest] : [...rest, ...chosen];
      } else {
        const delta = direction === "up" ? -1 : 1;
        const indexes = next.map((_, index) => index);
        if (delta === 1) indexes.reverse();
        for (const index of indexes) {
          const to = index + delta;
          if (
            to >= 0 &&
            to < next.length &&
            this.isSelected(side, next[index]) &&
            !this.isSelected(side, next[to])
          ) {
            [next[index], next[to]] = [next[to], next[index]];
          }
        }
      }
      const pair = this.modelValue.map((items) => [...items]);
      pair[side] = result;
      this.$emit("update:modelValue", pair);
      this.focusListbox(side);
    },
    transfer(side, all) {
      if (this.disabled) return;
      const chosen = this.modelValue[side].filter((item) => all || this.isSelected(side, item));
      const pair = this.modelValue.map((items) => [...items]);
      pair[side] = pair[side].filter((item) => !chosen.includes(item));
      pair[1 - side].push(...chosen);
      this.$emit("update:modelValue", pair);
      this.selected = [[], []];
      this.focusListbox(1 - side);
    },
    propsFor(direction) {
      const names = {
        up: "moveUpButtonProps",
        top: "moveTopButtonProps",
        down: "moveDownButtonProps",
        bottom: "moveBottomButtonProps",
      };
      return { ...this.buttonProps, ...this[names[direction]] };
    },
    listboxElement(side) {
      const refs = Array.isArray(this.$refs.listboxes)
        ? this.$refs.listboxes
        : [this.$refs.listboxes];
      return refs[side]?.$el?.querySelector('[role="listbox"]') ?? null;
    },
    listboxComponent(side) {
      const refs = Array.isArray(this.$refs.listboxes)
        ? this.$refs.listboxes
        : [this.$refs.listboxes];
      return refs[side] ?? null;
    },
    syncListboxDom() {
      this.$nextTick(() => {
        for (const side of [0, 1]) {
          const listbox = this.listboxElement(side);
          if (listbox) listbox.tabIndex = this.disabled ? -1 : this.tabindex;
        }
      });
    },
    focusListbox(side, force = false) {
      if (!force && !this.autoOptionFocus) return;
      this.$nextTick(() => this.listboxElement(side)?.focus());
    },
    focusOption(event) {
      if (!this.autoOptionFocus || event.target.getAttribute("role") !== "listbox") return;
      const section = event.target.closest("[data-pc-section]");
      const side = section?.dataset.pcSection === "targetlist" ? 1 : 0;
      if (this.listboxComponent(side)?.focusedIndex < 0)
        event.target.dispatchEvent(
          new KeyboardEvent("keydown", { code: "ArrowDown", bubbles: true })
        );
    },
    hoverOption(event) {
      const section = event.target.closest("[data-pc-section]");
      const side = section?.dataset.pcSection === "targetlist" ? 1 : 0;
      if (this.focusOnHover && event.target.closest('[role="option"]'))
        this.focusListbox(side, true);
    },
  },
};
</script>

<template>
  <div
    :class="[cx('root'), { 'u-striped': striped }]"
    :style="{ gridTemplateColumns: responsive && narrow ? 'minmax(0, 1fr)' : undefined }"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    @focusin="focusOption"
  >
    <section
      v-for="(items, side) in lists"
      :key="side"
      :data-pc-section="side === 0 ? 'sourcelist' : 'targetlist'"
      :class="side === 0 ? cx('sourceList') : cx('targetList')"
    >
      <div v-if="side === 0 ? showSourceControls : showTargetControls" :class="cx('controls')">
        <button
          v-for="direction in directions"
          :key="direction"
          v-bind="propsFor(direction)"
          type="button"
          :data-pc-section="'move' + direction + 'button'"
          :disabled="disabled || !selected[side].length"
          @click="move(side, direction)"
        >
          Move {{ direction }}
        </button>
      </div>
      <div
        :class="cx('list')"
        :style="{ maxHeight: scrollHeight, overflow: 'auto' }"
        @mouseover="hoverOption"
      >
        <Listbox
          ref="listboxes"
          :options="items"
          :model-value="selected[side]"
          :multiple="true"
          :option-label="label"
          :option-value="optionValue"
          :disabled="disabled"
          :aria-label="side === 0 ? ariaLabel + ' source' : ariaLabel + ' target'"
          @change="select(side, $event)"
        />
      </div>
    </section>
    <div :class="cx('controls')">
      <button
        v-bind="{ ...buttonProps, ...moveToTargetButtonProps }"
        type="button"
        data-pc-section="movetotargetbutton"
        :disabled="disabled || !selected[0].length"
        @click="transfer(0, false)"
      >
        To Target
      </button>
      <button
        v-bind="{ ...buttonProps, ...moveAllToTargetButtonProps }"
        type="button"
        data-pc-section="movealltotargetbutton"
        :disabled="disabled || !modelValue[0].length"
        @click="transfer(0, true)"
      >
        All To Target
      </button>
      <button
        v-bind="{ ...buttonProps, ...moveToSourceButtonProps }"
        type="button"
        data-pc-section="movetosourcebutton"
        :disabled="disabled || !selected[1].length"
        @click="transfer(1, false)"
      >
        To Source
      </button>
      <button
        v-bind="{ ...buttonProps, ...moveAllToSourceButtonProps }"
        type="button"
        data-pc-section="movealltosourcebutton"
        :disabled="disabled || !modelValue[1].length"
        @click="transfer(1, true)"
      >
        All To Source
      </button>
    </div>
  </div>
</template>
```

- [ ] **Step 6: Run to verify pass**

Run: `pnpm --filter @ultimate/vue test pick-list.spec.ts`
Expected: PASS, including every behavior case in this task.

- [ ] **Step 7: Barrel + stories**

```typescript
// packages/vue/src/pick-list/index.ts
export { default as UPickList } from "./PickList.vue";
```

Append to `packages/vue/src/index.ts`.

```typescript
// packages/vue/src/pick-list/pick-list.stories.ts
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";
import UPickList from "./PickList.vue";

const meta: Meta<typeof UPickList> = { title: "Data/PickList", component: UPickList };
export default meta;
type Story = StoryObj<typeof UPickList>;
export const Default: Story = { args: { modelValue: [["Apple", "Banana"], ["Cherry"]] } };

export const Controlled: Story = {
  render: () => ({
    components: { UPickList },
    setup() {
      const modelValue = ref([["Apple", "Banana"], ["Cherry"]] as [string[], string[]]);
      return { modelValue };
    },
    template: '<UPickList v-model="modelValue" />',
  }),
};
```

- [ ] **Step 8: Register provenance and run the full regression/ceiling checks**

Every new source, test, story, base, and barrel needs a manifest record. Preserve every existing record and append only missing records for this task:

```bash
node --input-type=module <<'NODE'
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
const directory = "packages/vue/src/pick-list";
const path = "docs/architecture/provenance/vue.json";
const entries = JSON.parse(readFileSync(path, "utf8"));
for (const name of readdirSync(directory).filter(name => /\.(ts|tsx|vue)$/.test(name))) {
  const destination = directory + "/" + name;
  if (entries.some(entry => entry.ultimateDestination === destination)) continue;
  const implementation = name === "PickList.vue" || name === "BasePickList.ts";
  entries.push({
    originalPath: implementation ? "packages/primevue/src/picklist/PickList.vue" : "n/a",
    ultimateDestination: destination,
    modificationStatus: implementation ? "reimplemented-with-reference" : "authored",
    modificationDescription: implementation ? "Batch 3 framework-native PickList; behavior referenced from the pinned PrimeVue 4.5.5 source; disclosed cuts remain excluded." : "Ultimate-authored PickList test, story, barrel, or structural style."
  });
}
writeFileSync(path, JSON.stringify(entries, null, 2) + "\n");
NODE
pnpm test
node scripts/provenance/validate-dependency-ceiling.mjs
```

Expected: the complete existing suite passes and the ceiling script exits 0. Do not infer full-suite success from the focused test alone.

- [ ] **Step 9: Commit**

```bash
git add packages/vue/src/pick-list packages/vue/src/index.ts docs/architecture/provenance/vue.json
git commit -m "$(cat <<'EOF'
feat(vue): add UPickList

Real PrimeVue PickList data model: single modelValue prop as a
[source, target] array pair (default [[], []]) — NOT Angular/React's
two-separate-props shape, per ADR-006 (no forced cross-framework API
parity). Button-move-only, no drag/drop or filter (real upstream
absence, matching OrderList's own confirmed Vue shape).
EOF
)"
```

---

## Task 7: Angular `UDataView`

**Files:**

- Create: `packages/ng/src/data-view/data-view.ts`
- Create: `packages/ng/src/data-view/data-view-style.ts`
- Create: `packages/ng/src/data-view/data-view.spec.ts`
- Create: `packages/ng/src/data-view/data-view.stories.ts`
- Create: `packages/ng/src/data-view/index.ts`
- Modify: `packages/ng/src/index.ts`

- Modify: `docs/architecture/provenance/ng.json` (only this component's new file records)

**Interfaces:**

- Consumes: `UBaseComponent`; `UPaginator` from `../paginator/paginator` (real `first`/`rows`/`totalRecords`/`pageLinkSize` inputs, confirmed in `packages/ng/src/paginator/paginator.ts`).
- Produces: `UDataView` component with real `FilterService`-equivalent filtering (Angular-only).

**Depends on:** none.

- [ ] **Step 1: Write the failing test**

```typescript
// packages/ng/src/data-view/data-view.spec.ts
import { TestBed } from "@angular/core/testing";
import { describe, expect, it, vi } from "vitest";
import { UDataView } from "./data-view";
type Item = { name: string; score: number };
const items: Item[] = [
  { name: "Apple", score: 3 },
  { name: "Banana", score: 1 },
  { name: "Cherry", score: 2 },
];
function setup() {
  const fixture = TestBed.createComponent(UDataView<Item>);
  fixture.componentRef.setInput("value", items);
  fixture.componentRef.setInput(
    "itemTemplate",
    (item: Item, layout: string) => layout + ":" + item.name
  );
  fixture.detectChanges();
  return fixture;
}
describe("UDataView", () => {
  it("switches between real list and grid render branches", () => {
    const fixture = setup();
    expect(fixture.nativeElement.querySelector(".u-data-view-list").textContent).toContain(
      "list:Apple"
    );
    fixture.componentRef.setInput("layout", "grid");
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-data-view-list")).toBeNull();
    expect(fixture.nativeElement.querySelector(".u-data-view-grid").textContent).toContain(
      "grid:Apple"
    );
  });
  it("updates the rendered window through real UPaginator events and later first input changes", () => {
    const fixture = setup();
    fixture.componentRef.setInput("paginator", true);
    fixture.componentRef.setInput("rows", 2);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-data-view-list").textContent).not.toContain(
      "Cherry"
    );
    fixture.nativeElement.querySelector("[data-u-paginator-next]").click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-data-view-list").textContent).toContain(
      "Cherry"
    );
    expect(fixture.nativeElement.querySelector(".u-data-view-list").textContent).not.toContain(
      "Apple"
    );
    fixture.componentRef.setInput("first", 0);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-data-view-list").textContent).toContain("Apple");
  });
  it("sorts a copied array before paging", () => {
    const fixture = setup();
    fixture.componentRef.setInput("sortField", "score");
    fixture.componentRef.setInput("sortOrder", -1);
    fixture.componentRef.setInput("paginator", true);
    fixture.componentRef.setInput("rows", 2);
    fixture.detectChanges();
    expect(
      Array.from(
        fixture.nativeElement.querySelectorAll(".u-data-view-list > li"),
        (node: Element) => node.textContent
      )
    ).toEqual(["list:Apple", "list:Cherry"]);
    expect(items.map((item) => item.score)).toEqual([3, 1, 2]);
  });
  it.each([
    ["contains", "name", "pp", ["Apple"]],
    ["startsWith", "name", "Ba", ["Banana"]],
    ["endsWith", "name", "rry", ["Cherry"]],
    ["equals", "name", "apple", ["Apple"]],
    ["notEquals", "name", "apple", ["Banana", "Cherry"]],
    ["in", "name", ["Apple", "Cherry"], ["Apple", "Cherry"]],
    ["lt", "score", 2, ["Banana"]],
    ["lte", "score", 2, ["Banana", "Cherry"]],
    ["gt", "score", 2, ["Apple"]],
    ["gte", "score", 2, ["Apple", "Cherry"]],
  ] as const)("filters with %s", (mode, field, query, expected) => {
    const fixture = setup();
    fixture.componentRef.setInput("filterBy", field);
    fixture.componentInstance.filter(query, mode);
    fixture.detectChanges();
    expect(
      Array.from(
        fixture.nativeElement.querySelectorAll(".u-data-view-list > li"),
        (node: Element) => node.textContent?.replace("list:", "")
      )
    ).toEqual(expected);
  });
  it("filters multiple fields, resets paging, and derives the filtered page count", () => {
    const fixture = setup();
    fixture.componentRef.setInput("filterBy", "name,score");
    fixture.componentRef.setInput("paginator", true);
    fixture.componentRef.setInput("rows", 1);
    fixture.componentRef.setInput("first", 2);
    fixture.detectChanges();
    fixture.componentInstance.filter("Apple");
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-data-view-list").textContent).toContain("Apple");
    expect(fixture.nativeElement.querySelector("u-paginator").getAttribute("data-page-count")).toBe(
      "1"
    );
  });
  it("renders a lazy server page without slicing again and emits requests", () => {
    const fixture = setup();
    const request = vi.fn();
    fixture.componentInstance.onLazyLoad.subscribe(request);
    fixture.componentRef.setInput("lazy", true);
    fixture.componentRef.setInput("first", 20);
    fixture.componentRef.setInput("rows", 2);
    fixture.componentRef.setInput("paginator", true);
    fixture.componentRef.setInput("totalRecords", 100);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-data-view-list").textContent).toContain("Apple");
    expect(request).toHaveBeenCalledWith({ first: 20, rows: 2, sortField: "", sortOrder: 1 });
  });
  it("renders loading and empty state", () => {
    const fixture = setup();
    fixture.componentRef.setInput("value", []);
    fixture.componentRef.setInput("loading", true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain("No results found");
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm --filter @ultimate/ng test --watch=false --include='src/data-view/data-view.spec.ts'`
Expected: FAIL.

- [ ] **Step 3: Style module**

```typescript
// packages/ng/src/data-view/data-view-style.ts
export const dataViewStyleModule = {
  css: `
    .u-data-view { display: grid; grid-template-columns: minmax(0, 1fr); gap: .75rem; }
    .u-data-view-list { display: grid; grid-template-columns: minmax(0, 1fr); gap: .5rem; margin: 0; padding: 0; list-style: none; }
    .u-data-view-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: .75rem; }
    .u-data-view-item { min-width: 0; padding: .75rem; border: 1px solid currentColor; }
  `,
  classes: {
    root: () => "u-data-view",
    list: (params?: Record<string, unknown>) =>
      params?.["layout"] === "grid" ? "u-data-view-grid" : "u-data-view-list",
    listItem: () => "u-data-view-item",
  },
};
```

- [ ] **Step 4: Implement `UDataView`**

```typescript
// packages/ng/src/data-view/data-view.ts
import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
  booleanAttribute,
  input,
  output,
  computed,
  signal,
} from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { UPaginator, PaginatorPageChangeEvent } from "../paginator/paginator";
import { dataViewStyleModule } from "./data-view-style";

type MatchMode =
  | "contains"
  | "startsWith"
  | "endsWith"
  | "equals"
  | "notEquals"
  | "in"
  | "lt"
  | "lte"
  | "gt"
  | "gte";
function field(item: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (v, key) =>
        v != null && typeof v === "object" ? (v as Record<string, unknown>)[key] : undefined,
      item
    );
}
function matches(value: unknown, query: unknown, mode: MatchMode, locale?: string): boolean {
  if (query == null || query === "") return true;
  const text = (v: unknown) => String(v ?? "").toLocaleLowerCase(locale || undefined);
  if (mode === "in") return Array.isArray(query) && query.some((v) => text(value) === text(v));
  if (value == null) return mode === "notEquals";
  switch (mode) {
    case "contains":
      return text(value).includes(text(query));
    case "startsWith":
      return text(value).startsWith(text(query));
    case "endsWith":
      return text(value).endsWith(text(query));
    case "equals":
      return text(value) === text(query);
    case "notEquals":
      return text(value) !== text(query);
    case "lt":
      return Number(value) < Number(query);
    case "lte":
      return Number(value) <= Number(query);
    case "gt":
      return Number(value) > Number(query);
    case "gte":
      return Number(value) >= Number(query);
  }
}
function compare(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  return typeof a === "number" && typeof b === "number"
    ? a - b
    : String(a).localeCompare(String(b));
}

@Component({
  selector: "u-data-view",
  standalone: true,
  imports: [UPaginator],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div [class]="cx('root')" [attr.aria-busy]="loading()">
      @if (loading()) {
        <span role="status" [class]="loadingIcon()">Loading</span>
      }
      @if (showPaginator() && paginatorPosition() !== "bottom") {
        <u-paginator
          [first]="pageFirst()"
          [rows]="pageRows()"
          [totalRecords]="recordCount()"
          (onPageChange)="onPageChange($event)"
        />
      }
      @if (layout() === "grid") {
        <div [class]="cx('list', { layout: 'grid' })" role="list">
          @for (item of pageValue(); track identity($index, item)) {
            <div [class]="cx('listItem')" role="listitem">{{ itemTemplate()(item, "grid") }}</div>
          } @empty {
            <div>{{ emptyMessage() }}</div>
          }
        </div>
      } @else {
        <ul [class]="cx('list', { layout: 'list' })">
          @for (item of pageValue(); track identity($index, item)) {
            <li [class]="cx('listItem')">{{ itemTemplate()(item, "list") }}</li>
          } @empty {
            <li>{{ emptyMessage() }}</li>
          }
        </ul>
      }
      @if (showPaginator() && paginatorPosition() !== "top") {
        <u-paginator
          [first]="pageFirst()"
          [rows]="pageRows()"
          [totalRecords]="recordCount()"
          (onPageChange)="onPageChange($event)"
        />
      }
      @if (paginator()) {
        @if (rowsPerPageOptions().length) {
          <label
            >Rows per page
            <select [value]="pageRows()" (change)="changeRows(+$any($event.target).value)">
              @for (size of rowsPerPageOptions(); track size) {
                <option [value]="size">{{ size }}</option>
              }
            </select>
          </label>
        }
        <span aria-live="polite">{{ report() }}</span>
      }
    </div>
  `,
})
export class UDataView<T = unknown> extends UBaseComponent implements OnChanges {
  protected override readonly componentName = "data-view";
  protected override readonly styleModule = dataViewStyleModule;
  value = input<T[]>([]);
  itemTemplate = input.required<(item: T, layout: "list" | "grid") => string>();
  layout = input<"list" | "grid">("list");
  paginator = input(false, { transform: booleanAttribute });
  first = input(0);
  rows = input(0);
  totalRecords = input<number>();
  rowsPerPageOptions = input<number[]>([]);
  paginatorPosition = input<"top" | "bottom" | "both">("bottom");
  alwaysShowPaginator = input(true, { transform: booleanAttribute });
  currentPageReportTemplate = input("{first} to {last} of {totalRecords}");
  sortField = input("");
  sortOrder = input<1 | -1>(1);
  lazy = input(false, { transform: booleanAttribute });
  loading = input(false, { transform: booleanAttribute });
  loadingIcon = input("u-loading-icon");
  emptyMessage = input("No results found");
  dataKey = input("");
  trackBy = input<(index: number, item: T) => unknown>((index, item) => item);
  filterBy = input("");
  filterLocale = input<string>();
  pageChange = output<PaginatorPageChangeEvent>();
  onLazyLoad = output<{ first: number; rows: number; sortField: string; sortOrder: 1 | -1 }>();
  protected readonly pageFirst = signal(0);
  protected readonly pageRows = signal(0);
  private readonly query = signal<unknown>("");
  private readonly matchMode = signal<MatchMode>("contains");
  ngOnChanges(changes: SimpleChanges): void {
    if (changes["first"]) this.pageFirst.set(this.first());
    if (changes["rows"]) this.pageRows.set(this.rows());
    if (
      this.lazy() &&
      (changes["first"] ||
        changes["rows"] ||
        changes["sortField"] ||
        changes["sortOrder"] ||
        changes["lazy"])
    )
      this.emitLazy();
  }
  filter(query: unknown, mode: MatchMode = "contains"): void {
    this.query.set(query);
    this.matchMode.set(mode);
    this.pageFirst.set(0);
    if (this.lazy()) this.emitLazy();
  }
  protected readonly processed = computed(() => {
    if (this.lazy()) return this.value();
    const fields = this.filterBy()
      .split(",")
      .map((key) => key.trim())
      .filter(Boolean);
    const filtered = fields.length
      ? this.value().filter((item) =>
          fields.some((key) =>
            matches(field(item, key), this.query(), this.matchMode(), this.filterLocale())
          )
        )
      : this.value();
    const rows = [...filtered];
    return this.sortField()
      ? rows.sort(
          (a, b) =>
            compare(field(a, this.sortField()), field(b, this.sortField())) * this.sortOrder()
        )
      : rows;
  });
  protected readonly recordCount = computed(() =>
    this.lazy() ? (this.totalRecords() ?? this.value().length) : this.processed().length
  );
  protected readonly pageValue = computed(() =>
    this.lazy() || !this.paginator() || this.pageRows() <= 0
      ? this.processed()
      : this.processed().slice(this.pageFirst(), this.pageFirst() + this.pageRows())
  );
  protected readonly showPaginator = computed(
    () => this.paginator() && (this.alwaysShowPaginator() || this.recordCount() > this.pageRows())
  );
  protected identity(index: number, item: T): unknown {
    return this.dataKey() ? field(item, this.dataKey()) : this.trackBy()(index, item);
  }
  protected report(): string {
    const count = this.recordCount(),
      first = count ? this.pageFirst() + 1 : 0;
    const last = Math.min(this.pageFirst() + this.pageRows(), count);
    const pageCount = this.pageRows() > 0 ? Math.ceil(count / this.pageRows()) : 0;
    return this.currentPageReportTemplate()
      .replaceAll("{first}", String(first))
      .replaceAll("{last}", String(last))
      .replaceAll("{totalRecords}", String(count))
      .replaceAll(
        "{currentPage}",
        String(pageCount ? Math.floor(this.pageFirst() / this.pageRows()) + 1 : 0)
      )
      .replaceAll("{totalPages}", String(pageCount))
      .replaceAll("{rows}", String(this.pageRows()));
  }
  protected onPageChange(event: PaginatorPageChangeEvent): void {
    this.pageFirst.set(event.first);
    this.pageRows.set(event.rows);
    this.pageChange.emit(event);
    if (this.lazy()) this.emitLazy();
  }
  protected changeRows(rows: number): void {
    if (rows <= 0) return;
    this.onPageChange({ first: 0, rows, page: 0, pageCount: Math.ceil(this.recordCount() / rows) });
  }
  private emitLazy(): void {
    this.onLazyLoad.emit({
      first: this.pageFirst(),
      rows: this.pageRows(),
      sortField: this.sortField(),
      sortOrder: this.sortOrder(),
    });
  }
}
```

- [ ] **Step 5: Run to verify pass**

Run: `pnpm --filter @ultimate/ng test --watch=false --include='src/data-view/data-view.spec.ts'`
Expected: PASS.

- [ ] **Step 6: Barrel + stories**

```typescript
// packages/ng/src/data-view/index.ts
export * from "./data-view";
```

Append to `packages/ng/src/index.ts`.

```typescript
// packages/ng/src/data-view/data-view.stories.ts
import type { Meta, StoryObj } from "@storybook/angular";
import { UDataView } from "./data-view";

const meta: Meta<UDataView> = { title: "Data/DataView", component: UDataView };
export default meta;
type Story = StoryObj<UDataView>;
export const Default: Story = {
  args: {
    value: [{ name: "Apple" }, { name: "Banana" }],
    itemTemplate: (item) => (item as { name: string }).name,
  },
};
```

- [ ] **Step 7: Register provenance and run the full regression/ceiling checks**

Every new source, test, story, base, and barrel needs a manifest record. Preserve every existing record and append only missing records for this task:

```bash
node --input-type=module <<'NODE'
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
const directory = "packages/ng/src/data-view";
const path = "docs/architecture/provenance/ng.json";
const entries = JSON.parse(readFileSync(path, "utf8"));
for (const name of readdirSync(directory).filter(name => /\.(ts|tsx|vue)$/.test(name))) {
  const destination = directory + "/" + name;
  if (entries.some(entry => entry.ultimateDestination === destination)) continue;
  const implementation = name === "data-view.ts";
  entries.push({
    originalPath: implementation ? "packages/primeng/src/dataview/dataview.ts" : "n/a",
    ultimateDestination: destination,
    modificationStatus: implementation ? "reimplemented-with-reference" : "authored",
    modificationDescription: implementation ? "Batch 3 framework-native DataView; behavior referenced from the pinned PrimeNG 21.1.9 source; disclosed cuts remain excluded." : "Ultimate-authored DataView test, story, barrel, or structural style."
  });
}
writeFileSync(path, JSON.stringify(entries, null, 2) + "\n");
NODE
pnpm test
node scripts/provenance/validate-dependency-ceiling.mjs
```

Expected: the complete existing suite passes and the ceiling script exits 0. Do not infer full-suite success from the focused test alone.

- [ ] **Step 8: Commit**

```bash
git add packages/ng/src/data-view packages/ng/src/index.ts docs/architecture/provenance/ng.json
git commit -m "$(cat <<'EOF'
feat(ng): add UDataView

Real PrimeNG DataView behavior: list/grid layout toggle, real
FilterService-based filtering (Angular-only — genuine cross-framework
asymmetry, not present in React/Vue real source), direct UPaginator
composition matching Table's own established pattern.
EOF
)"
```

---

## Task 8: React `UDataView`

**Files:**

- Create: `packages/react/src/data-view/data-view.tsx`
- Create: `packages/react/src/data-view/data-view-style.ts`
- Create: `packages/react/src/data-view/data-view.spec.tsx`
- Create: `packages/react/src/data-view/data-view.stories.tsx`
- Create: `packages/react/src/data-view/index.ts`
- Modify: `packages/react/src/index.ts`

- Modify: `docs/architecture/provenance/react.json` (only this component's new file records)

**Interfaces:**

- Consumes: `useComponentBase`; `UPaginator` from `../paginator/paginator` (real `UPaginatorProps`: `first`, `rows`, `totalRecords`, `pageLinkSize?`, `onPageChange`).
- Produces: `UDataView` component, **no filtering prop of any kind** — real upstream absence (Spec §3.3).

**Depends on:** none.

- [ ] **Step 1: Write the failing test**

```tsx
// packages/react/src/data-view/data-view.spec.tsx
import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { UDataView, type UDataViewProps } from "./data-view";
const items = [
  { name: "Apple", score: 3 },
  { name: "Banana", score: 1 },
  { name: "Cherry", score: 2 },
];
const itemTemplate = (item: (typeof items)[number], layout: "list" | "grid") => (
  <span>
    {layout}:{item.name}
  </span>
);
describe("UDataView", () => {
  it("switches real list/grid branches", () => {
    const { container, rerender } = render(<UDataView value={items} itemTemplate={itemTemplate} />);
    expect(container.querySelector(".u-data-view-list")).not.toBeNull();
    rerender(<UDataView value={items} itemTemplate={itemTemplate} layout="grid" />);
    expect(container.querySelector(".u-data-view-list")).toBeNull();
    expect(screen.getByText("grid:Apple")).toBeInTheDocument();
  });
  it("updates the rendered page through UPaginator and synchronizes an external first change", () => {
    const { rerender } = render(
      <UDataView value={items} itemTemplate={itemTemplate} paginator rows={2} first={0} />
    );
    expect(screen.queryByText("list:Cherry")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Next Page" }));
    expect(screen.queryByText("list:Apple")).toBeNull();
    expect(screen.getByText("list:Cherry")).toBeInTheDocument();
    rerender(<UDataView value={items} itemTemplate={itemTemplate} paginator rows={2} first={1} />);
    expect(screen.getByText("list:Banana")).toBeInTheDocument();
  });
  it("responds to sorting state changes before paging without mutating input", () => {
    const { container, rerender } = render(
      <UDataView value={items} itemTemplate={itemTemplate} paginator rows={2} />
    );
    expect(
      Array.from(container.querySelectorAll(".u-data-view-list > li"), (node) => node.textContent)
    ).toEqual(["list:Apple", "list:Banana"]);
    rerender(
      <UDataView
        value={items}
        itemTemplate={itemTemplate}
        sortField="score"
        sortOrder={-1}
        paginator
        rows={2}
      />
    );
    expect(
      Array.from(container.querySelectorAll(".u-data-view-list > li"), (node) => node.textContent)
    ).toEqual(["list:Apple", "list:Cherry"]);
    expect(items.map((item) => item.score)).toEqual([3, 1, 2]);
  });
  it("has no filtering API and renders no filter controls", () => {
    expectTypeOf<
      Extract<keyof UDataViewProps, "filter" | "filterBy" | "filterMatchMode" | "filterLocale">
    >().toEqualTypeOf<never>();
    render(<UDataView value={items} itemTemplate={itemTemplate} />);
    expect(screen.queryByRole("searchbox")).toBeNull();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });
  it("keeps server pages intact in lazy mode and emits requests", () => {
    const onLazyLoad = vi.fn();
    render(
      <UDataView
        value={items}
        itemTemplate={itemTemplate}
        lazy
        paginator
        first={20}
        rows={2}
        totalRecords={100}
        onLazyLoad={onLazyLoad}
      />
    );
    expect(screen.getByText("list:Apple")).toBeInTheDocument();
    expect(onLazyLoad).toHaveBeenCalledWith({
      first: 20,
      rows: 2,
      sortField: undefined,
      sortOrder: 1,
    });
  });
  it("shows loading, empty state, and rows-per-page controls", () => {
    render(
      <UDataView
        value={[]}
        itemTemplate={itemTemplate}
        loading
        paginator
        rows={2}
        rowsPerPageOptions={[2, 5]}
      />
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("No results found")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Rows per page"), { target: { value: "5" } });
    expect(screen.getByLabelText("Rows per page")).toHaveValue("5");
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm --filter @ultimate/react test data-view.spec.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement**

```tsx
// packages/react/src/data-view/data-view.tsx
import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { UPaginator, type PaginatorPageChangeEvent } from "../paginator/paginator";
import { dataViewStyleModule } from "./data-view-style";

function field(item: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (value, key) =>
        value != null && typeof value === "object"
          ? (value as Record<string, unknown>)[key]
          : undefined,
      item
    );
}
function compare(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  return typeof a === "number" && typeof b === "number"
    ? a - b
    : String(a).localeCompare(String(b));
}

export interface UDataViewProps<T = unknown> {
  value: T[];
  itemTemplate: (item: T, layout: "list" | "grid") => React.ReactNode;
  layout?: "list" | "grid";
  paginator?: boolean;
  first?: number;
  rows?: number;
  totalRecords?: number;
  rowsPerPageOptions?: number[];
  paginatorPosition?: "top" | "bottom" | "both";
  alwaysShowPaginator?: boolean;
  currentPageReportTemplate?: string;
  sortField?: string;
  sortOrder?: 1 | -1;
  lazy?: boolean;
  loading?: boolean;
  loadingIcon?: React.ReactNode;
  emptyMessage?: string;
  dataKey?: string;
  trackBy?: (item: T, index: number) => React.Key;
  onPageChange?: (event: PaginatorPageChangeEvent) => void;
  onLazyLoad?: (event: {
    first: number;
    rows: number;
    sortField?: string;
    sortOrder: 1 | -1;
  }) => void;
  className?: string;
}
export function UDataView<T = unknown>({
  value,
  itemTemplate,
  layout = "list",
  paginator = false,
  first = 0,
  rows = 0,
  totalRecords,
  rowsPerPageOptions = [],
  paginatorPosition = "bottom",
  alwaysShowPaginator = true,
  currentPageReportTemplate = "{first} to {last} of {totalRecords}",
  sortField,
  sortOrder = 1,
  lazy = false,
  loading = false,
  loadingIcon = "Loading",
  emptyMessage = "No results found",
  dataKey,
  trackBy,
  onPageChange,
  onLazyLoad,
  className,
}: UDataViewProps<T>): React.ReactElement {
  const { cx } = useComponentBase({ componentName: "data-view", styleModule: dataViewStyleModule });
  const [pageFirst, setPageFirst] = React.useState(first);
  const [pageRows, setPageRows] = React.useState(rows);
  React.useEffect(() => {
    setPageFirst(first);
  }, [first]);
  React.useEffect(() => {
    setPageRows(rows);
  }, [rows]);
  React.useEffect(() => {
    if (lazy) onLazyLoad?.({ first: pageFirst, rows: pageRows, sortField, sortOrder });
  }, [lazy, pageFirst, pageRows, sortField, sortOrder, onLazyLoad]);
  const processed = React.useMemo(() => {
    if (lazy || !sortField) return value;
    return [...value].sort((a, b) => compare(field(a, sortField), field(b, sortField)) * sortOrder);
  }, [value, lazy, sortField, sortOrder]);
  const count = lazy ? (totalRecords ?? value.length) : processed.length;
  const paged =
    lazy || !paginator || pageRows <= 0
      ? processed
      : processed.slice(pageFirst, pageFirst + pageRows);
  const changePage = (event: PaginatorPageChangeEvent): void => {
    setPageFirst(event.first);
    setPageRows(event.rows);
    onPageChange?.(event);
  };
  const pageCount = pageRows > 0 ? Math.ceil(count / pageRows) : 0;
  const report = currentPageReportTemplate
    .replaceAll("{first}", String(count ? pageFirst + 1 : 0))
    .replaceAll("{last}", String(Math.min(pageFirst + pageRows, count)))
    .replaceAll("{totalRecords}", String(count))
    .replaceAll("{currentPage}", String(pageCount ? Math.floor(pageFirst / pageRows) + 1 : 0))
    .replaceAll("{totalPages}", String(pageCount))
    .replaceAll("{rows}", String(pageRows));
  const showPaginator = paginator && (alwaysShowPaginator || count > pageRows);
  const paging = (
    <UPaginator first={pageFirst} rows={pageRows} totalRecords={count} onPageChange={changePage} />
  );
  const key = (item: T, index: number): React.Key =>
    dataKey ? String(field(item, dataKey)) : trackBy ? trackBy(item, index) : index;
  return (
    <div className={[cx("root"), className].filter(Boolean).join(" ")} aria-busy={loading}>
      {loading && <span role="status">{loadingIcon}</span>}
      {showPaginator && paginatorPosition !== "bottom" && paging}
      {layout === "grid" ? (
        <div className={cx("list", { layout: "grid" })} role="list">
          {paged.length ? (
            paged.map((item, index) => (
              <div className={cx("listItem")} role="listitem" key={key(item, index)}>
                {itemTemplate(item, "grid")}
              </div>
            ))
          ) : (
            <div>{emptyMessage}</div>
          )}
        </div>
      ) : (
        <ul className={cx("list", { layout: "list" })}>
          {paged.length ? (
            paged.map((item, index) => (
              <li className={cx("listItem")} key={key(item, index)}>
                {itemTemplate(item, "list")}
              </li>
            ))
          ) : (
            <li>{emptyMessage}</li>
          )}
        </ul>
      )}
      {showPaginator && paginatorPosition !== "top" && paging}
      {paginator && (
        <>
          {rowsPerPageOptions.length > 0 && (
            <label>
              Rows per page
              <select
                value={pageRows}
                onChange={(event) => {
                  const nextRows = Number(event.target.value);
                  if (nextRows > 0)
                    changePage({
                      first: 0,
                      rows: nextRows,
                      page: 0,
                      pageCount: Math.ceil(count / nextRows),
                    });
                }}
              >
                {rowsPerPageOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          )}
          <span aria-live="polite">{report}</span>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Style module**

```typescript
// packages/react/src/data-view/data-view-style.ts
import type { StyleModule } from "@ultimate/react-core";

export const dataViewStyleModule: StyleModule = {
  css: `
    .u-data-view { display: grid; grid-template-columns: minmax(0, 1fr); gap: .75rem; }
    .u-data-view-list { display: grid; grid-template-columns: minmax(0, 1fr); gap: .5rem; margin: 0; padding: 0; list-style: none; }
    .u-data-view-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: .75rem; }
    .u-data-view-item { min-width: 0; padding: .75rem; border: 1px solid currentColor; }
  `,
  classes: {
    root: () => "u-data-view",
    list: (params?: Record<string, unknown>) =>
      params?.["layout"] === "grid" ? "u-data-view-grid" : "u-data-view-list",
    listItem: () => "u-data-view-item",
  },
};
```

- [ ] **Step 5: Run to verify pass**

Run: `pnpm --filter @ultimate/react test data-view.spec.tsx`
Expected: PASS.

- [ ] **Step 6: Barrel + stories**

```typescript
// packages/react/src/data-view/index.ts
export * from "./data-view";
```

Append to `packages/react/src/index.ts`.

```tsx
// packages/react/src/data-view/data-view.stories.tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UDataView } from "./data-view";

const meta: Meta<typeof UDataView> = { title: "Data/DataView", component: UDataView };
export default meta;
type Story = StoryObj<typeof UDataView>;
export const Default: Story = {
  args: {
    value: [{ name: "Apple" }, { name: "Banana" }],
    itemTemplate: (item) => <span>{(item as { name: string }).name}</span>,
  },
};
```

- [ ] **Step 7: Register provenance and run the full regression/ceiling checks**

Every new source, test, story, base, and barrel needs a manifest record. Preserve every existing record and append only missing records for this task:

```bash
node --input-type=module <<'NODE'
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
const directory = "packages/react/src/data-view";
const path = "docs/architecture/provenance/react.json";
const entries = JSON.parse(readFileSync(path, "utf8"));
for (const name of readdirSync(directory).filter(name => /\.(ts|tsx|vue)$/.test(name))) {
  const destination = directory + "/" + name;
  if (entries.some(entry => entry.ultimateDestination === destination)) continue;
  const implementation = name === "data-view.tsx";
  entries.push({
    originalPath: implementation ? "components/lib/dataview/DataView.js" : "n/a",
    ultimateDestination: destination,
    modificationStatus: implementation ? "reimplemented-with-reference" : "authored",
    modificationDescription: implementation ? "Batch 3 framework-native DataView; behavior referenced from the pinned PrimeReact 10.9.9 source; disclosed cuts remain excluded." : "Ultimate-authored DataView test, story, barrel, or structural style."
  });
}
writeFileSync(path, JSON.stringify(entries, null, 2) + "\n");
NODE
pnpm test
node scripts/provenance/validate-dependency-ceiling.mjs
```

Expected: the complete existing suite passes and the ceiling script exits 0. Do not infer full-suite success from the focused test alone.

- [ ] **Step 8: Commit**

```bash
git add packages/react/src/data-view packages/react/src/index.ts docs/architecture/provenance/react.json
git commit -m "$(cat <<'EOF'
feat(react): add UDataView

Real PrimeReact DataView behavior: list/grid layout, UPaginator
composition (matching Table's established pattern). No filtering
prop — real PrimeReact source has none (confirmed absent, matching
Angular's genuine asymmetry, not a scope cut).
EOF
)"
```

---

## Task 9: Vue `UDataView`

**Files:**

- Create: `packages/vue/src/data-view/DataView.vue`
- Create: `packages/vue/src/data-view/BaseDataView.ts`
- Create: `packages/vue/src/data-view/data-view-style.ts`
- Create: `packages/vue/src/data-view/data-view.spec.ts`
- Create: `packages/vue/src/data-view/data-view.stories.ts`
- Create: `packages/vue/src/data-view/index.ts`
- Modify: `packages/vue/src/index.ts`

- Modify: `docs/architecture/provenance/vue.json` (only this component's new file records)

**Interfaces:**

- Consumes: `createBaseComponent`; `Paginator` from `../paginator/Paginator.vue`.
- Produces: `UDataView` Vue component, **no filter prop** — real upstream absence.

**Depends on:** none.

- [ ] **Step 1: Write the failing test**

```typescript
// packages/vue/src/data-view/data-view.spec.ts
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import UDataView from "./DataView.vue";
const items = [
  { name: "Apple", score: 3 },
  { name: "Banana", score: 1 },
  { name: "Cherry", score: 2 },
];
const slots = {
  list: ({ items }: { items: { name: string }[] }) =>
    h("span", "list:" + items.map((item) => item.name).join(",")),
  grid: ({ items }: { items: { name: string }[] }) =>
    h("span", "grid:" + items.map((item) => item.name).join(",")),
};
describe("UDataView", () => {
  it("switches between independent list/grid slots", async () => {
    const wrapper = mount(UDataView, { props: { value: items }, slots });
    expect(wrapper.text()).toBe("list:Apple,Banana,Cherry");
    await wrapper.setProps({ layout: "grid" });
    expect(wrapper.text()).toBe("grid:Apple,Banana,Cherry");
    expect(wrapper.find(".u-data-view-list").exists()).toBe(false);
  });
  it("updates the rendered window from the real Paginator and external first changes", async () => {
    const wrapper = mount(UDataView, { props: { value: items, paginator: true, rows: 2 }, slots });
    expect(wrapper.findComponent({ name: "UPaginator" }).exists()).toBe(true);
    expect(wrapper.find(".u-data-view-list").text()).toBe("list:Apple,Banana");
    await wrapper.find("[data-u-paginator-next]").trigger("click");
    expect(wrapper.find(".u-data-view-list").text()).toBe("list:Cherry");
    await wrapper.setProps({ first: 1 });
    expect(wrapper.find(".u-data-view-list").text()).toBe("list:Banana,Cherry");
  });
  it("responds to sorting state changes before paging without mutating the source", async () => {
    const wrapper = mount(UDataView, {
      props: { value: items, paginator: true, rows: 2 },
      slots,
    });
    expect(wrapper.find(".u-data-view-list").text()).toBe("list:Apple,Banana");
    await wrapper.setProps({ sortField: "score", sortOrder: -1 });
    expect(wrapper.find(".u-data-view-list").text()).toBe("list:Apple,Cherry");
    expect(items.map((item) => item.score)).toEqual([3, 1, 2]);
  });
  it("has no filtering surface or control", () => {
    const wrapper = mount(UDataView, { props: { value: items }, slots });
    for (const prop of ["filter", "filterBy", "filterMatchMode", "filterLocale"])
      expect(wrapper.props()).not.toHaveProperty(prop);
    expect(wrapper.find('[role="searchbox"]').exists()).toBe(false);
    expect(wrapper.text()).toContain("Apple,Banana,Cherry");
  });
  it("keeps lazy pages intact and emits requests", () => {
    const wrapper = mount(UDataView, {
      props: { value: items, lazy: true, paginator: true, first: 20, rows: 2, totalRecords: 100 },
      slots,
    });
    expect(wrapper.find(".u-data-view-list").text()).toBe("list:Apple,Banana,Cherry");
    expect(wrapper.emitted("lazy-load")?.[0]?.[0]).toEqual({
      first: 20,
      rows: 2,
      sortField: null,
      sortOrder: 1,
    });
  });
  it("renders loading and empty state", () => {
    const wrapper = mount(UDataView, { props: { value: [], loading: true } });
    expect(wrapper.find('[role="status"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("No results found");
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm --filter @ultimate/vue test data-view.spec.ts`
Expected: FAIL.

- [ ] **Step 3: `BaseDataView.ts`**

```typescript
// packages/vue/src/data-view/BaseDataView.ts
import { createBaseComponent } from "@ultimate/vue-core";
import type { ComponentOptions } from "vue";
import { dataViewStyleModule } from "./data-view-style";
export function createBaseDataView(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "data-view", styleModule: dataViewStyleModule }),
    props: {
      value: { type: Array, default: () => [] },
      layout: { type: String, default: "list" },
      paginator: { type: Boolean, default: false },
      first: { type: Number, default: 0 },
      rows: { type: Number, default: 0 },
      totalRecords: { type: Number, default: undefined },
      rowsPerPageOptions: { type: Array, default: () => [] },
      paginatorPosition: { type: String, default: "bottom" },
      alwaysShowPaginator: { type: Boolean, default: true },
      currentPageReportTemplate: { type: String, default: "{first} to {last} of {totalRecords}" },
      sortField: { type: String, default: null },
      sortOrder: { type: Number, default: 1 },
      lazy: { type: Boolean, default: false },
      loading: { type: Boolean, default: false },
      loadingIcon: { type: String, default: "u-loading-icon" },
      emptyMessage: { type: String, default: "No results found" },
      dataKey: { type: String, default: null },
      trackBy: { type: Function, default: null },
      itemTemplate: { type: Function, default: (item: unknown) => String(item) },
    },
    emits: ["page", "lazy-load", "update:first", "update:rows"],
  };
}
```

- [ ] **Step 4: Style module**

```typescript
// packages/vue/src/data-view/data-view-style.ts
import type { StyleModule } from "@ultimate/vue-core";

export const dataViewStyleModule: StyleModule = {
  css: `
    .u-data-view { display: grid; grid-template-columns: minmax(0, 1fr); gap: .75rem; }
    .u-data-view-list { display: grid; grid-template-columns: minmax(0, 1fr); gap: .5rem; margin: 0; padding: 0; list-style: none; }
    .u-data-view-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: .75rem; }
    .u-data-view-item { min-width: 0; padding: .75rem; border: 1px solid currentColor; }
  `,
  classes: {
    root: () => "u-data-view",
    list: (params?: Record<string, unknown>) =>
      params?.["layout"] === "grid" ? "u-data-view-grid" : "u-data-view-list",
    listItem: () => "u-data-view-item",
  },
};
```

- [ ] **Step 5: `DataView.vue`**

```vue
<!-- packages/vue/src/data-view/DataView.vue -->
<script>
import { createBaseDataView } from "./BaseDataView";
import Paginator from "../paginator/Paginator.vue";
function field(item, path) {
  return path.split(".").reduce((value, key) => (value == null ? undefined : value[key]), item);
}
function compare(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  return typeof a === "number" && typeof b === "number"
    ? a - b
    : String(a).localeCompare(String(b));
}
export default {
  name: "UDataView",
  extends: createBaseDataView(),
  components: { Paginator },
  data() {
    return { pageFirst: this.first, pageRows: this.rows };
  },
  watch: {
    first(value) {
      this.pageFirst = value;
    },
    rows(value) {
      this.pageRows = value;
    },
    pageFirst() {
      this.emitLazy();
    },
    pageRows() {
      this.emitLazy();
    },
    sortField() {
      this.emitLazy();
    },
    sortOrder() {
      this.emitLazy();
    },
    lazy() {
      this.emitLazy();
    },
  },
  mounted() {
    this.emitLazy();
  },
  computed: {
    processed() {
      if (this.lazy || !this.sortField) return this.value;
      return [...this.value].sort(
        (a, b) => compare(field(a, this.sortField), field(b, this.sortField)) * this.sortOrder
      );
    },
    count() {
      return this.lazy ? (this.totalRecords ?? this.value.length) : this.processed.length;
    },
    pagedValue() {
      return this.lazy || !this.paginator || this.pageRows <= 0
        ? this.processed
        : this.processed.slice(this.pageFirst, this.pageFirst + this.pageRows);
    },
    showPaginator() {
      return this.paginator && (this.alwaysShowPaginator || this.count > this.pageRows);
    },
    report() {
      const pages = this.pageRows > 0 ? Math.ceil(this.count / this.pageRows) : 0;
      return this.currentPageReportTemplate
        .replaceAll("{first}", String(this.count ? this.pageFirst + 1 : 0))
        .replaceAll("{last}", String(Math.min(this.pageFirst + this.pageRows, this.count)))
        .replaceAll("{totalRecords}", String(this.count))
        .replaceAll(
          "{currentPage}",
          String(pages ? Math.floor(this.pageFirst / this.pageRows) + 1 : 0)
        )
        .replaceAll("{totalPages}", String(pages))
        .replaceAll("{rows}", String(this.pageRows));
    },
  },
  methods: {
    identity(item, index) {
      return this.dataKey
        ? field(item, this.dataKey)
        : this.trackBy
          ? this.trackBy(item, index)
          : index;
    },
    onPage(event) {
      this.pageFirst = event.first;
      this.pageRows = event.rows;
      this.$emit("page", event);
      this.$emit("update:first", event.first);
      this.$emit("update:rows", event.rows);
    },
    changeRows(event) {
      const rows = Number(event.target.value);
      if (rows > 0)
        this.onPage({ first: 0, rows, page: 0, pageCount: Math.ceil(this.count / rows) });
    },
    emitLazy() {
      if (this.lazy)
        this.$emit("lazy-load", {
          first: this.pageFirst,
          rows: this.pageRows,
          sortField: this.sortField,
          sortOrder: this.sortOrder,
        });
    },
  },
};
</script>
<template>
  <div :class="cx('root')" :aria-busy="loading">
    <span v-if="loading" role="status" :class="loadingIcon">Loading</span>
    <Paginator
      v-if="showPaginator && paginatorPosition !== 'bottom'"
      :first="pageFirst"
      :rows="pageRows"
      :total-records="count"
      @page="onPage"
    />
    <div v-if="layout === 'grid'" :class="cx('list', { layout: 'grid' })" role="list">
      <slot name="grid" :items="pagedValue">
        <div
          v-for="(item, index) in pagedValue"
          :key="identity(item, index)"
          :class="cx('listItem')"
          role="listitem"
        >
          {{ itemTemplate(item, "grid") }}
        </div>
      </slot>
    </div>
    <div v-else :class="cx('list', { layout: 'list' })" role="list">
      <slot name="list" :items="pagedValue">
        <div
          v-for="(item, index) in pagedValue"
          :key="identity(item, index)"
          :class="cx('listItem')"
          role="listitem"
        >
          {{ itemTemplate(item, "list") }}
        </div>
      </slot>
    </div>
    <div v-if="!pagedValue.length">{{ emptyMessage }}</div>
    <Paginator
      v-if="showPaginator && paginatorPosition !== 'top'"
      :first="pageFirst"
      :rows="pageRows"
      :total-records="count"
      @page="onPage"
    />
    <template v-if="paginator">
      <label v-if="rowsPerPageOptions.length"
        >Rows per page<select :value="pageRows" @change="changeRows">
          <option v-for="size in rowsPerPageOptions" :key="size" :value="size">{{ size }}</option>
        </select></label
      >
      <span aria-live="polite">{{ report }}</span>
    </template>
  </div>
</template>
```

- [ ] **Step 6: Run to verify pass**

Run: `pnpm --filter @ultimate/vue test data-view.spec.ts`
Expected: PASS.

- [ ] **Step 7: Barrel + stories**

```typescript
// packages/vue/src/data-view/index.ts
export { default as UDataView } from "./DataView.vue";
```

Append to `packages/vue/src/index.ts`.

```typescript
// packages/vue/src/data-view/data-view.stories.ts
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import UDataView from "./DataView.vue";

const meta: Meta<typeof UDataView> = { title: "Data/DataView", component: UDataView };
export default meta;
type Story = StoryObj<typeof UDataView>;
export const Default: Story = { args: { value: [{ name: "Apple" }, { name: "Banana" }] } };
```

- [ ] **Step 8: Register provenance and run the full regression/ceiling checks**

Every new source, test, story, base, and barrel needs a manifest record. Preserve every existing record and append only missing records for this task:

```bash
node --input-type=module <<'NODE'
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
const directory = "packages/vue/src/data-view";
const path = "docs/architecture/provenance/vue.json";
const entries = JSON.parse(readFileSync(path, "utf8"));
for (const name of readdirSync(directory).filter(name => /\.(ts|tsx|vue)$/.test(name))) {
  const destination = directory + "/" + name;
  if (entries.some(entry => entry.ultimateDestination === destination)) continue;
  const implementation = name === "DataView.vue" || name === "BaseDataView.ts";
  entries.push({
    originalPath: implementation ? "packages/primevue/src/dataview/DataView.vue" : "n/a",
    ultimateDestination: destination,
    modificationStatus: implementation ? "reimplemented-with-reference" : "authored",
    modificationDescription: implementation ? "Batch 3 framework-native DataView; behavior referenced from the pinned PrimeVue 4.5.5 source; disclosed cuts remain excluded." : "Ultimate-authored DataView test, story, barrel, or structural style."
  });
}
writeFileSync(path, JSON.stringify(entries, null, 2) + "\n");
NODE
pnpm test
node scripts/provenance/validate-dependency-ceiling.mjs
```

Expected: the complete existing suite passes and the ceiling script exits 0. Do not infer full-suite success from the focused test alone.

- [ ] **Step 9: Commit**

```bash
git add packages/vue/src/data-view packages/vue/src/index.ts docs/architecture/provenance/vue.json
git commit -m "$(cat <<'EOF'
feat(vue): add UDataView

Real PrimeVue DataView behavior: list/grid via named slots, real
direct Paginator composition. No filter prop — real PrimeVue source
has none (confirmed absent, matching React's own genuine asymmetry).
EOF
)"
```

---

## Task 10: React `UOrganizationChart`

**Files:**

- Create: `packages/react/src/organization-chart/organization-chart.tsx`
- Create: `packages/react/src/organization-chart/organization-chart-style.ts`
- Create: `packages/react/src/organization-chart/organization-chart.spec.tsx`
- Create: `packages/react/src/organization-chart/organization-chart.stories.tsx`
- Create: `packages/react/src/organization-chart/index.ts`
- Modify: `packages/react/src/index.ts`

- Modify: `docs/architecture/provenance/react.json` (only this component's new file records)

**Interfaces:**

- Consumes: `useComponentBase`; `SelectionMode` type from `@ultimate/uix-data` (real, matching vocabulary, no new primitive).
- Produces: `UOrganizationChart` component. **No Angular counterpart exists or is authorized (DECISION-D permanent exclusion).**

**Depends on:** none.

- [ ] **Step 1: Write the failing test**

```tsx
// packages/react/src/organization-chart/organization-chart.spec.tsx
import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { UOrganizationChart, type UOrganizationChartProps } from "./organization-chart";
const child = { label: "CTO" };
const root = { label: "CEO", expanded: true, children: [child, { label: "CFO" }] };
describe("UOrganizationChart", () => {
  it("expands and collapses per node without mutating the input or selecting from the toggler", () => {
    const select = vi.fn();
    render(<UOrganizationChart value={[root]} selectionMode="single" onSelectionChange={select} />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle CEO" }));
    expect(screen.queryByText("CTO")).toBeNull();
    expect(root.expanded).toBe(true);
    expect(select).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Toggle CEO" }));
    expect(screen.getByText("CTO")).toBeInTheDocument();
  });
  it("does not bubble nested toggler keyboard input into node selection", () => {
    const select = vi.fn();
    render(<UOrganizationChart value={[root]} selectionMode="single" onSelectionChange={select} />);
    fireEvent.keyDown(screen.getByRole("button", { name: "Toggle CEO" }), { key: "Enter" });
    expect(select).not.toHaveBeenCalled();
  });
  it("selects and unselects a single node", () => {
    const select = vi.fn();
    const { rerender } = render(
      <UOrganizationChart
        value={[root]}
        selectionMode="single"
        selection={null}
        onSelectionChange={select}
      />
    );
    fireEvent.click(screen.getByText("CEO"));
    expect(select).toHaveBeenLastCalledWith(root);
    rerender(
      <UOrganizationChart
        value={[root]}
        selectionMode="single"
        selection={root}
        onSelectionChange={select}
      />
    );
    fireEvent.keyDown(screen.getByText("CEO"), { key: "Enter" });
    expect(select).toHaveBeenLastCalledWith(null);
  });
  it("adds and removes multiple selection while preserving other nodes", () => {
    const select = vi.fn();
    const { rerender } = render(
      <UOrganizationChart
        value={[root]}
        selectionMode="multiple"
        selection={[child]}
        onSelectionChange={select}
      />
    );
    fireEvent.click(screen.getByText("CEO"));
    expect(select).toHaveBeenLastCalledWith([child, root]);
    rerender(
      <UOrganizationChart
        value={[root]}
        selectionMode="multiple"
        selection={[child, root]}
        onSelectionChange={select}
      />
    );
    fireEvent.click(screen.getByText("CEO"));
    expect(select).toHaveBeenLastCalledWith([child]);
    expect(screen.getByRole("tree")).toHaveAttribute("aria-multiselectable", "true");
  });
  it("respects nonselectable nodes and excludes togglerIcon", () => {
    expectTypeOf<Extract<keyof UOrganizationChartProps, "togglerIcon">>().toEqualTypeOf<never>();
    const select = vi.fn();
    render(
      <UOrganizationChart
        value={[{ label: "Locked", selectable: false }]}
        selectionMode="single"
        onSelectionChange={select}
      />
    );
    fireEvent.click(screen.getByText("Locked"));
    expect(select).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm --filter @ultimate/react test organization-chart.spec.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement**

```tsx
// packages/react/src/organization-chart/organization-chart.tsx
import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import type { SelectionMode } from "@ultimate/uix-data";
import { organizationChartStyleModule } from "./organization-chart-style";

export interface OrganizationChartNodeData {
  label?: string;
  className?: string;
  expanded?: boolean;
  selectable?: boolean;
  children?: OrganizationChartNodeData[];
}

export interface UOrganizationChartProps {
  value: OrganizationChartNodeData[];
  selectionMode?: SelectionMode;
  selection?: OrganizationChartNodeData | OrganizationChartNodeData[] | null;
  onSelectionChange?: (
    selection: OrganizationChartNodeData | OrganizationChartNodeData[] | null
  ) => void;
  className?: string;
}

function OrganizationChartNode({
  node,
  selectionMode,
  selection,
  onSelectionChange,
  cx,
}: {
  node: OrganizationChartNodeData;
  selectionMode?: SelectionMode;
  selection?: UOrganizationChartProps["selection"];
  onSelectionChange?: UOrganizationChartProps["onSelectionChange"];
  cx: (key: string) => string | undefined;
}): React.ReactElement {
  const [expanded, setExpanded] = React.useState(node.expanded ?? false);
  const isSelected =
    selectionMode === "single"
      ? selection === node
      : Array.isArray(selection) && selection.includes(node);

  const handleSelect = (): void => {
    if (!selectionMode || !onSelectionChange || node.selectable === false) return;
    if (selectionMode === "single") {
      onSelectionChange(selection === node ? null : node);
    } else {
      const current = Array.isArray(selection) ? selection : [];
      onSelectionChange(
        current.includes(node) ? current.filter((n) => n !== node) : [...current, node]
      );
    }
  };

  return (
    <div
      className={[cx("node"), node.className].filter(Boolean).join(" ")}
      role="treeitem"
      aria-expanded={node.children?.length ? expanded : undefined}
      aria-selected={selectionMode ? isSelected : undefined}
    >
      <div
        className={cx("nodeContent")}
        data-selected={isSelected || undefined}
        tabIndex={selectionMode ? 0 : undefined}
        onClick={handleSelect}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleSelect();
          }
        }}
      >
        {node.label}
        {node.children && node.children.length > 0 && (
          <button
            type="button"
            aria-label={"Toggle " + (node.label ?? "node")}
            aria-expanded={expanded}
            onKeyDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              setExpanded((e) => !e);
            }}
          >
            {expanded ? "-" : "+"}
          </button>
        )}
      </div>
      {expanded && node.children && node.children.length > 0 && (
        <div className={cx("children")} role="group">
          {node.children.map((child, index) => (
            <OrganizationChartNode
              key={index}
              node={child}
              selectionMode={selectionMode}
              selection={selection}
              onSelectionChange={onSelectionChange}
              cx={cx}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function UOrganizationChart({
  value,
  selectionMode,
  selection,
  onSelectionChange,
  className,
}: UOrganizationChartProps): React.ReactElement {
  const { cx } = useComponentBase({
    componentName: "organization-chart",
    styleModule: organizationChartStyleModule,
  });
  return (
    <div
      className={cx("root") + (className ? ` ${className}` : "")}
      role="tree"
      aria-label="Organization chart"
      aria-multiselectable={selectionMode === "multiple"}
    >
      {value.map((node, index) => (
        <OrganizationChartNode
          key={index}
          node={node}
          selectionMode={selectionMode}
          selection={selection}
          onSelectionChange={onSelectionChange}
          cx={cx}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Style module**

```typescript
// packages/react/src/organization-chart/organization-chart-style.ts
import type { StyleModule } from "@ultimate/react-core";

export const organizationChartStyleModule: StyleModule = {
  css: `
    .u-organization-chart { display: flex; justify-content: center; overflow: auto; }
    .u-organization-chart-node { position: relative; display: flex; flex-direction: column; align-items: center; min-width: max-content; }
    .u-organization-chart-node-content { position: relative; z-index: 1; padding: .5rem .75rem; border: 1px solid currentColor; background: Canvas; }
    .u-organization-chart-children { position: relative; display: flex; justify-content: center; gap: 1.5rem; margin-top: 1.5rem; padding-top: 1.5rem; }
    .u-organization-chart-children::before { content: ""; position: absolute; top: 0; left: 12.5%; right: 12.5%; border-top: 1px solid currentColor; }
    .u-organization-chart-children > .u-organization-chart-node::before { content: ""; position: absolute; top: -1.5rem; height: 1.5rem; border-left: 1px solid currentColor; }
  `,
  classes: {
    root: () => "u-organization-chart",
    node: () => "u-organization-chart-node",
    nodeContent: () => "u-organization-chart-node-content",
    children: () => "u-organization-chart-children",
  },
};
```

- [ ] **Step 5: Run to verify pass**

Run: `pnpm --filter @ultimate/react test organization-chart.spec.tsx`
Expected: PASS, including every behavior case in this task.

- [ ] **Step 6: Barrel + stories**

```typescript
// packages/react/src/organization-chart/index.ts
export * from "./organization-chart";
```

Append to `packages/react/src/index.ts`.

```tsx
// packages/react/src/organization-chart/organization-chart.stories.tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UOrganizationChart } from "./organization-chart";

const meta: Meta<typeof UOrganizationChart> = {
  title: "Panel/OrganizationChart",
  component: UOrganizationChart,
};
export default meta;
type Story = StoryObj<typeof UOrganizationChart>;
export const Default: Story = {
  args: {
    value: [{ label: "CEO", expanded: true, children: [{ label: "CTO" }, { label: "CFO" }] }],
  },
};
```

- [ ] **Step 7: Register provenance and run the full regression/ceiling checks**

Every new source, test, story, base, and barrel needs a manifest record. Preserve every existing record and append only missing records for this task:

```bash
node --input-type=module <<'NODE'
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
const directory = "packages/react/src/organization-chart";
const path = "docs/architecture/provenance/react.json";
const entries = JSON.parse(readFileSync(path, "utf8"));
for (const name of readdirSync(directory).filter(name => /\.(ts|tsx|vue)$/.test(name))) {
  const destination = directory + "/" + name;
  if (entries.some(entry => entry.ultimateDestination === destination)) continue;
  const implementation = name === "organization-chart.tsx";
  entries.push({
    originalPath: implementation ? "components/lib/organizationchart/OrganizationChart.js" : "n/a",
    ultimateDestination: destination,
    modificationStatus: implementation ? "reimplemented-with-reference" : "authored",
    modificationDescription: implementation ? "Batch 3 framework-native OrganizationChart; behavior referenced from the pinned PrimeReact 10.9.9 source; disclosed cuts remain excluded." : "Ultimate-authored OrganizationChart test, story, barrel, or structural style."
  });
}
writeFileSync(path, JSON.stringify(entries, null, 2) + "\n");
NODE
pnpm test
node scripts/provenance/validate-dependency-ceiling.mjs
```

Expected: the complete existing suite passes and the ceiling script exits 0. Do not infer full-suite success from the focused test alone.

- [ ] **Step 8: Commit**

```bash
git add packages/react/src/organization-chart packages/react/src/index.ts docs/architecture/provenance/react.json
git commit -m "$(cat <<'EOF'
feat(react): add UOrganizationChart

Real PrimeReact OrganizationChart behavior: hierarchical node tree,
expand/collapse via local per-node useState (not a shared key-map),
single/multiple selection using uix-data's own SelectionMode type.
Structurally independent of Tree, per DECISION-D's scope
clarification. React/Vue only — Angular remains permanently excluded.
EOF
)"
```

---

## Task 11: Vue `UOrganizationChart`

**Files:**

- Create: `packages/vue/src/organization-chart/OrganizationChart.vue`
- Create: `packages/vue/src/organization-chart/BaseOrganizationChart.ts`
- Create: `packages/vue/src/organization-chart/organization-chart-style.ts`
- Create: `packages/vue/src/organization-chart/organization-chart.spec.ts`
- Create: `packages/vue/src/organization-chart/organization-chart.stories.ts`
- Create: `packages/vue/src/organization-chart/index.ts`
- Modify: `packages/vue/src/index.ts`

- Modify: `docs/architecture/provenance/vue.json` (only this component's new file records)

**Interfaces:**

- Consumes: `createBaseComponent`; `SelectionMode` type from `@ultimate/uix-data`.
- Produces: `UOrganizationChart` Vue component using external `collapsedKeys`/`selectionKeys` maps (real, distinct from React's per-node local state and from Tree's own `expandedKeys` — Spec §3.4).

**Depends on:** none.

- [ ] **Step 1: Write the failing test**

```typescript
// packages/vue/src/organization-chart/organization-chart.spec.ts
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import UOrganizationChart from "./OrganizationChart.vue";
const value = {
  label: "CEO",
  key: "0",
  children: [
    { label: "CTO", key: "0_0" },
    { label: "CFO", key: "0_1" },
  ],
};
describe("UOrganizationChart", () => {
  it("renders a single root object and expanded children without a collapse affordance by default", () => {
    const wrapper = mount(UOrganizationChart, { props: { value } });
    expect(wrapper.text()).toContain("CEO");
    expect(wrapper.text()).toContain("CTO");
    expect(wrapper.find("button").exists()).toBe(false);
  });
  it("collapses and expands by key and responds to external map changes", async () => {
    const wrapper = mount(UOrganizationChart, { props: { value, collapsible: true } });
    await wrapper.find("button").trigger("click");
    expect(wrapper.text()).not.toContain("CTO");
    expect(wrapper.emitted("update:collapsedKeys")?.[0]?.[0]).toEqual({ "0": true });
    await wrapper.find("button").trigger("click");
    expect(wrapper.text()).toContain("CTO");
    await wrapper.setProps({ collapsedKeys: { "0": true } });
    expect(wrapper.text()).not.toContain("CTO");
    expect(value).not.toHaveProperty("expanded");
  });
  it("does not bubble nested toggler keyboard input into node selection", async () => {
    const wrapper = mount(UOrganizationChart, {
      props: { value, collapsible: true, selectionMode: "single", selectionKeys: {} },
    });
    await wrapper.find("button").trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("update:selectionKeys")).toBeUndefined();
  });
  it("emits a single selection key and removes it when selected again", async () => {
    const wrapper = mount(UOrganizationChart, {
      props: { value, selectionMode: "single", selectionKeys: {} },
    });
    await wrapper.find(".u-organization-chart-node-content").trigger("click");
    expect(wrapper.emitted("update:selectionKeys")?.[0]?.[0]).toEqual({ "0": true });
    await wrapper.setProps({ selectionKeys: { "0": true } });
    await wrapper.find(".u-organization-chart-node-content").trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("update:selectionKeys")?.[1]?.[0]).toEqual({});
  });
  it("adds and removes keys in multiple mode without discarding unrelated selections", async () => {
    const wrapper = mount(UOrganizationChart, {
      props: { value, selectionMode: "multiple", selectionKeys: { "0_0": true } },
    });
    await wrapper.find(".u-organization-chart-node-content").trigger("click");
    expect(wrapper.emitted("update:selectionKeys")?.[0]?.[0]).toEqual({ "0": true, "0_0": true });
    await wrapper.setProps({ selectionKeys: { "0": true, "0_0": true } });
    await wrapper.find(".u-organization-chart-node-content").trigger("click");
    expect(wrapper.emitted("update:selectionKeys")?.[1]?.[0]).toEqual({ "0_0": true });
    expect(wrapper.find('[role="tree"]').attributes("aria-multiselectable")).toBe("true");
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm --filter @ultimate/vue test organization-chart.spec.ts`
Expected: FAIL.

- [ ] **Step 3: `BaseOrganizationChart.ts`**

```typescript
// packages/vue/src/organization-chart/BaseOrganizationChart.ts
import { createBaseComponent } from "@ultimate/vue-core";
import type { ComponentOptions, PropType } from "vue";
import type { SelectionMode } from "@ultimate/uix-data";
import { organizationChartStyleModule } from "./organization-chart-style";
export function createBaseOrganizationChart(): ComponentOptions {
  return {
    extends: createBaseComponent({
      componentName: "organization-chart",
      styleModule: organizationChartStyleModule,
    }),
    props: {
      value: { type: null, default: null },
      selectionKeys: { type: Object, default: null },
      selectionMode: { type: String as PropType<SelectionMode>, default: null },
      collapsible: { type: Boolean, default: false },
      collapsedKeys: { type: Object, default: null },
    },
    emits: ["update:selectionKeys", "update:collapsedKeys"],
  };
}
```

- [ ] **Step 4: Style module**

```typescript
// packages/vue/src/organization-chart/organization-chart-style.ts
import type { StyleModule } from "@ultimate/vue-core";

export const organizationChartStyleModule: StyleModule = {
  css: `
    .u-organization-chart { display: flex; justify-content: center; overflow: auto; }
    .u-organization-chart-node { position: relative; display: flex; flex-direction: column; align-items: center; min-width: max-content; }
    .u-organization-chart-node-content { position: relative; z-index: 1; padding: .5rem .75rem; border: 1px solid currentColor; background: Canvas; }
    .u-organization-chart-children { position: relative; display: flex; justify-content: center; gap: 1.5rem; margin-top: 1.5rem; padding-top: 1.5rem; }
    .u-organization-chart-children::before { content: ""; position: absolute; top: 0; left: 12.5%; right: 12.5%; border-top: 1px solid currentColor; }
    .u-organization-chart-children > .u-organization-chart-node::before { content: ""; position: absolute; top: -1.5rem; height: 1.5rem; border-left: 1px solid currentColor; }
  `,
  classes: {
    root: () => "u-organization-chart",
    node: () => "u-organization-chart-node",
    nodeContent: () => "u-organization-chart-node-content",
    children: () => "u-organization-chart-children",
  },
};
```

- [ ] **Step 5: `OrganizationChart.vue`**

```vue
<!-- packages/vue/src/organization-chart/OrganizationChart.vue -->
<script>
import { h } from "vue";
import { createBaseOrganizationChart } from "./BaseOrganizationChart";
export default {
  name: "UOrganizationChart",
  extends: createBaseOrganizationChart(),
  data() {
    return { localCollapsedKeys: { ...(this.collapsedKeys ?? {}) } };
  },
  watch: {
    collapsedKeys(value) {
      this.localCollapsedKeys = { ...(value ?? {}) };
    },
  },
  methods: {
    toggleCollapse(node) {
      if (!this.collapsible || node.key == null) return;
      const keys = { ...this.localCollapsedKeys };
      if (keys[node.key]) delete keys[node.key];
      else keys[node.key] = true;
      this.localCollapsedKeys = keys;
      this.$emit("update:collapsedKeys", keys);
    },
    toggleSelect(node) {
      if (!this.selectionMode || node.selectable === false || node.key == null) return;
      let keys = { ...(this.selectionKeys ?? {}) };
      if (keys[node.key]) delete keys[node.key];
      else {
        if (this.selectionMode === "single") keys = {};
        keys[node.key] = true;
      }
      this.$emit("update:selectionKeys", keys);
    },
    renderNode(node) {
      if (!node) return null;
      const children = node.children ?? [];
      const expanded = !this.collapsible || !this.localCollapsedKeys[node.key];
      const selected = Boolean(this.selectionKeys?.[node.key]);
      return h(
        "div",
        {
          class: [this.cx("node"), node.className],
          role: "treeitem",
          "aria-expanded": children.length ? expanded : undefined,
          "aria-selected": this.selectionMode ? selected : undefined,
          "data-pc-section": "node",
          "data-selected": selected ? "true" : undefined,
        },
        [
          h(
            "div",
            {
              class: this.cx("nodeContent"),
              tabindex: this.selectionMode ? 0 : undefined,
              onClick: () => this.toggleSelect(node),
              onKeydown: (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  this.toggleSelect(node);
                }
              },
            },
            [
              node.label,
              this.collapsible && children.length
                ? h(
                    "button",
                    {
                      type: "button",
                      "aria-label": "Toggle " + (node.label ?? "node"),
                      "aria-expanded": expanded,
                      onKeydown: (event) => event.stopPropagation(),
                      onClick: (event) => {
                        event.stopPropagation();
                        this.toggleCollapse(node);
                      },
                    },
                    [h("span", { "aria-hidden": "true" }, expanded ? "−" : "+")]
                  )
                : null,
            ]
          ),
          expanded && children.length
            ? h(
                "div",
                { class: this.cx("children"), role: "group" },
                children.map((child) => this.renderNode(child))
              )
            : null,
        ]
      );
    },
  },
  render() {
    return h(
      "div",
      {
        class: this.cx("root"),
        role: "tree",
        "aria-label": "Organization chart",
        "aria-multiselectable": this.selectionMode === "multiple",
      },
      [this.renderNode(this.value)]
    );
  },
};
</script>
```

- [ ] **Step 6: Run to verify pass**

Run: `pnpm --filter @ultimate/vue test organization-chart.spec.ts`
Expected: PASS, including every behavior case in this task.

- [ ] **Step 7: Barrel + stories**

```typescript
// packages/vue/src/organization-chart/index.ts
export { default as UOrganizationChart } from "./OrganizationChart.vue";
```

Append to `packages/vue/src/index.ts`.

```typescript
// packages/vue/src/organization-chart/organization-chart.stories.ts
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import UOrganizationChart from "./OrganizationChart.vue";

const meta: Meta<typeof UOrganizationChart> = {
  title: "Panel/OrganizationChart",
  component: UOrganizationChart,
};
export default meta;
type Story = StoryObj<typeof UOrganizationChart>;
export const Default: Story = {
  args: {
    value: {
      label: "CEO",
      key: "0",
      children: [
        { label: "CTO", key: "0_0" },
        { label: "CFO", key: "0_1" },
      ],
    },
  },
};
```

- [ ] **Step 8: Register provenance and run the full regression/ceiling checks**

Every new source, test, story, base, and barrel needs a manifest record. Preserve every existing record and append only missing records for this task:

```bash
node --input-type=module <<'NODE'
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
const directory = "packages/vue/src/organization-chart";
const path = "docs/architecture/provenance/vue.json";
const entries = JSON.parse(readFileSync(path, "utf8"));
for (const name of readdirSync(directory).filter(name => /\.(ts|tsx|vue)$/.test(name))) {
  const destination = directory + "/" + name;
  if (entries.some(entry => entry.ultimateDestination === destination)) continue;
  const implementation = name === "OrganizationChart.vue" || name === "BaseOrganizationChart.ts";
  entries.push({
    originalPath: implementation ? "packages/primevue/src/organizationchart/OrganizationChart.vue" : "n/a",
    ultimateDestination: destination,
    modificationStatus: implementation ? "reimplemented-with-reference" : "authored",
    modificationDescription: implementation ? "Batch 3 framework-native OrganizationChart; behavior referenced from the pinned PrimeVue 4.5.5 source; disclosed cuts remain excluded." : "Ultimate-authored OrganizationChart test, story, barrel, or structural style."
  });
}
writeFileSync(path, JSON.stringify(entries, null, 2) + "\n");
NODE
pnpm test
node scripts/provenance/validate-dependency-ceiling.mjs
```

Expected: the complete existing suite passes and the ceiling script exits 0. Do not infer full-suite success from the focused test alone.

- [ ] **Step 9: Commit**

```bash
git add packages/vue/src/organization-chart packages/vue/src/index.ts docs/architecture/provenance/vue.json
git commit -m "$(cat <<'EOF'
feat(vue): add UOrganizationChart

Real PrimeVue OrganizationChart behavior: external collapsedKeys/
selectionKeys maps (distinct from React's per-node local useState and
from Tree's own expandedKeys — pattern-family resemblance only, no
shared code). Structurally independent of Tree, per DECISION-D.
React/Vue only — Angular remains permanently excluded.
EOF
)"
```

---

## Task 12: Whole-batch Verification

**Files:** Create ignored execution artifact `.superpowers/sdd/2026-09-21-phase-c-batch-3/task-12-report.md`; no tracked repository file is created or modified by this verification-only task.
**Interfaces:** Consumes Tasks 0–11; produces `.superpowers/sdd/2026-09-21-phase-c-batch-3/task-12-report.md` for Task 13.
**Depends on:** completed Tasks 0–11. This is the single whole-batch Verification pass; per-task test runs are regression checks.

- [ ] **Step 1: Validate dependencies and repository pointers**

```bash
node scripts/provenance/validate-dependency-ceiling.mjs
node scripts/provenance/validate-agents-md-pointers.mjs
```

Expected: each exits 0. Record actual output.

- [ ] **Step 2: Verify all new file provenance before interpreting the full gate**

The current full gate stops at a pre-existing missing Angular Accordion style record. That early exit cannot prove newer files are covered. Run this scoped check as well:

```bash
node --input-type=module <<'NODE'
import { readFileSync, readdirSync } from "node:fs";
const components = { ng: ["order-list", "pick-list", "data-view"], react: ["order-list", "pick-list", "data-view", "organization-chart"], vue: ["order-list", "pick-list", "data-view", "organization-chart"] };
for (const [framework, names] of Object.entries(components)) {
  const manifest = JSON.parse(readFileSync("docs/architecture/provenance/" + framework + ".json", "utf8"));
  const paths = new Set(manifest.map(entry => entry.ultimateDestination));
  for (const name of names) {
    const dir = "packages/" + framework + "/src/" + name;
    for (const file of readdirSync(dir).filter(file => /\.(ts|tsx|vue)$/.test(file))) {
      if (!paths.has(dir + "/" + file)) throw Error("Missing manifest entry: " + dir + "/" + file);
    }
  }
}
console.log("All Batch 3 files have manifest records.");
NODE
node scripts/provenance/validate-provenance.mjs
```

Expected: scoped check exits 0. The full gate currently exits 1 at `packages/ng/src/accordion/accordion-style.ts`; compare the actual error with the recorded pre-work baseline. A new failure returns to the owning implementation task for correction/review. Task 12 never silently edits production or provenance files.

- [ ] **Step 3: Run cross-framework consistency**

```bash
pnpm --filter @ultimate/themes test cross-framework-consistency.test.ts
```

Expected: exit 0. The new component styles below are authored structural CSS and contain no `dt()` calls; therefore the existing token-resolution test is a regression check, not evidence that it enumerates new component modules. If implementation introduces `dt()`, extend the owning task's style consistency coverage before its commit and record that change in the file-scope audit.

- [ ] **Step 4: Run complete tests, type checks, and build**

```bash
pnpm test
pnpm typecheck
pnpm build
```

Expected: each exits 0, or any failure is compared command-for-command with Task 0's recorded pre-implementation baseline. Disclose an unchanged baseline failure with its exact output and identify every new or changed failure as a Batch 3 regression that must return to its owning implementation task. Do not label a failing run clean and do not classify a failure as pre-existing without the Task 0 comparison.

- [ ] **Step 5: Record the result**

Record command, exit code, meaningful output, and current commit for each check in `.superpowers/sdd/2026-09-21-phase-c-batch-3/task-12-report.md`. The report is an ignored Superpowers execution artifact consumed by Task 13; it is not staged or committed. There is no commit in this task and no merge action.

---

## Task 13: Documentation and status closeout

**Files:**

- Modify: `docs/architecture/COMPONENT_INVENTORY.md`
- Modify: `docs/architecture/REACT_COMPONENT_STATUS.md`
- Modify: `docs/architecture/VUE_COMPONENT_STATUS.md`
- Modify: `docs/architecture/research/PHASE_C_MIGRATION_ROADMAP.md`
- Modify: `docs/architecture/PROVENANCE.md` (batch source/dependency disclosure)

**Interfaces:** Consumes Task 12's recorded evidence from `.superpowers/sdd/2026-09-21-phase-c-batch-3/task-12-report.md`; produces accurate status documentation.
**Depends on:** Task 12. Document implementation and verification as separate claims; final human review and merge have not happened yet.

- [ ] **Step 1: Update Angular inventory ownership correctly**

In `COMPONENT_INVENTORY.md`, change only OrderList, PickList, and DataView's **Migration phase** cells from `Later Phase` to `**Built -- Phase C Batch 3**`, matching that Angular inventory's established phase formatting. Preserve their `ADAPT` classification and the DECISION-C rationale. Keep Angular OrganizationChart's permanent exclusion unchanged. Do not add React or Vue rows to this Angular inventory.

Replace the heading `### Data components (later phase — NEEDS ARCHITECTURE DECISION, per spec)` with `### Data components (mixed built/later phase)`. In the reconciliation notice, replace the final two sentences with:

```markdown
TreeTable and Tree remain unbuilt architectural exceptions under DECISION-D. OrderList, PickList, and DataView are Built in Phase C Batch 3 after DECISION-C confirmed that they fit the existing architecture. See `docs/architecture/BLUEPRINT_GAPS.md` for the protected Tree-family scope and DECISION-C's separately tracked Table filter-vocabulary remainder.
```

Add the following paragraph beneath these three rows:

```markdown
OrderList, PickList, and DataView are implemented for Angular in Phase C Batch 3. OrderList/PickList compose UListbox for baseline interaction and use component-local @angular/cdk/drag-drop markup for opt-in drag/drop. DataView composes UPaginator and implements Angular-only filtering. Their source and tests are under packages/ng/src/order-list/, packages/ng/src/pick-list/, and packages/ng/src/data-view/. ADAPT remains the migration classification; Built records implementation state. Batch verification evidence is recorded separately from implementation status.
```

Append this cumulative statement immediately after the existing Phase C Batch 1 count bullet; preserve the earlier count as historical evidence:

```markdown
- **Phase C Batch 3 count:** 3 further directories moved from exclusively-remaining to exclusively-built: `orderlist`, `picklist`, and `dataview`. Updated arithmetic: **95 exclusively built** (92 + 3) + **2 split-scope** (`config`, `icons`, unchanged) + **20 exclusively remaining** = 117. The "remaining" table now lists **22 rows** (20 exclusively-remaining directories plus `config` and `icons` each recording their unfinished scope). React/Vue Batch 3 status remains in their separate status documents, not this Angular-scoped inventory.
```

- [ ] **Step 2: Add React's four rows to its own status document**

Insert this section in `REACT_COMPONENT_STATUS.md` immediately before its existing `## Verification` section, matching the established placement of Batch 2's status section:

```markdown
## Built (Phase C Batch 3) — 4 capabilities

| Component                              | Prime source path                 | Category     | Dependencies               | Framework-specific responsibilities                                                                                                                       | Migration classification | Migration phase         | Risk   |
| -------------------------------------- | --------------------------------- | ------------ | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ----------------------- | ------ |
| OrderList (UOrderList)                 | components/lib/orderlist/         | Data         | react-core base            | All four button moves, filtering, optional native HTML5 drag/drop; packages/react/src/order-list/                                                         | ADAPT                    | Built (Phase C Batch 3) | Medium |
| PickList (UPickList)                   | components/lib/picklist/          | Data         | react-core base            | Separate source/target arrays, bidirectional transfers and per-side reordering, filtering, optional native HTML5 drag/drop; packages/react/src/pick-list/ | ADAPT                    | Built (Phase C Batch 3) | Medium |
| DataView (UDataView)                   | components/lib/dataview/          | Data         | react-core base, paginator | List/grid rendering, sorting, pagination; no filtering; packages/react/src/data-view/                                                                     | ADAPT                    | Built (Phase C Batch 3) | Medium |
| OrganizationChart (UOrganizationChart) | components/lib/organizationchart/ | Data/Display | react-core base            | Per-node local expansion, object-reference single/multiple selection; packages/react/src/organization-chart/                                              | ADAPT                    | Built (Phase C Batch 3) | Medium |

OrganizationChart's React/Vue-only membership is a permanent framework asymmetry under DECISION-D. Angular OrganizationChart remains excluded.
```

Replace the existing Origin paragraph with this exact cumulative scope statement:

```markdown
**Origin of this file's scope:** every component `@ultimate/react` shipped **before** Phase C Batch 1 (8 components), every React capability closed by Phase C Batch 1 (73), React DataScroller from Batch 2 (1), and OrderList, PickList, DataView, and OrganizationChart from Batch 3 (4). Confirmed against direct inspection of `packages/react/src/`: **86 top-level component directories = 8 + 73 + 1 + 4**. No capability listed here is outside its approved framework eligibility, and no implemented React capability is omitted.
```

Replace the first Verification bullet with:

```markdown
- 8 pre-existing baseline components + 73 Phase C Batch 1 capabilities + 1 Phase C Batch 2 capability + 4 Phase C Batch 3 capabilities = **86 entries**, matching `packages/react/src/`'s 86 top-level component directories after Batch 3 (confirmed by direct directory inspection).
```

Extend the Migration phase definition bullet to include `Built (Phase C Batch 2)` and `Built (Phase C Batch 3)`; do not rewrite any earlier batch's rows or merge history.

- [ ] **Step 3: Add Vue's four rows to its own status document**

Insert this section in `VUE_COMPONENT_STATUS.md` immediately before its existing `## Verification` section, matching the established placement of Batch 2's status section:

```markdown
## Built (Phase C Batch 3) — 4 capabilities

| Component                              | Prime source path  | Category     | Dependencies             | Framework-specific responsibilities                                                                                               | Migration classification | Migration phase         | Risk   |
| -------------------------------------- | ------------------ | ------------ | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ----------------------- | ------ |
| OrderList (UOrderList)                 | orderlist/         | Data         | vue-core base, listbox   | All four button moves; no drag/drop or filtering; packages/vue/src/order-list/                                                    | ADAPT                    | Built (Phase C Batch 3) | Medium |
| PickList (UPickList)                   | picklist/          | Data         | vue-core base, listbox   | Combined modelValue pair, bidirectional transfers and per-side reordering; no drag/drop or filtering; packages/vue/src/pick-list/ | ADAPT                    | Built (Phase C Batch 3) | Medium |
| DataView (UDataView)                   | dataview/          | Data         | vue-core base, paginator | Separate list/grid slots, sorting, pagination; no filtering; packages/vue/src/data-view/                                          | ADAPT                    | Built (Phase C Batch 3) | Medium |
| OrganizationChart (UOrganizationChart) | organizationchart/ | Data/Display | vue-core base            | One root node, selectionKeys/collapsedKeys maps, opt-in collapse; packages/vue/src/organization-chart/                            | ADAPT                    | Built (Phase C Batch 3) | Medium |

OrganizationChart's React/Vue-only membership is a permanent framework asymmetry under DECISION-D. Angular OrganizationChart remains excluded.
```

Replace the existing Origin paragraph with this exact cumulative scope statement:

```markdown
**Origin of this file's scope:** every component `@ultimate/vue` shipped **before** Phase C Batch 1 (9 components), Vue Badge (the Batch 1 infrastructure-prefix item), the 76 Vue capabilities closed by Batch 1, Vue InlineMessage from Batch 2 (1), and OrderList, PickList, DataView, and OrganizationChart from Batch 3 (4). Confirmed against direct inspection of `packages/vue/src/`: **94 top-level directories** = 9 baseline + 1 Badge + 79 Batch 1 directories (76 capabilities, with Accordion occupying four directories) + 1 Batch 2 + 4 Batch 3. No capability listed here is outside its approved framework eligibility, and no implemented Vue capability is omitted.
```

Replace the first Verification bullet with:

```markdown
- 9 pre-existing baseline components + 1 Group A infrastructure item (Badge) + 76 Phase C Batch 1 canonical capabilities + 1 Phase C Batch 2 capability + 4 Phase C Batch 3 capabilities = **91 canonical-capability-equivalent rows**. This reconciles to `packages/vue/src/`'s 94 top-level directories after Batch 3: 94 total directories − 3 extra directories consumed by Accordion's four-directory family = 91.
```

Extend the Migration phase definition bullet to include `Built (Phase C Batch 2)` and `Built (Phase C Batch 3)`; do not rewrite any earlier batch's rows or merge history.

- [ ] **Step 4: Record Batch 3 implementation and provenance without claiming a merge**

Add `### 12.6 Phase C Batch 3 implementation and verification (<actual closeout date>)` to the Roadmap immediately before its final Status section, substituting the date on which Task 13 actually runs rather than copying the Plan's authorship date. Its body is:

```markdown
Phase C Batch 3 implements 11 realizations: OrderList, PickList, and DataView for Angular/React/Vue, and OrganizationChart for React/Vue. Angular OrderList/PickList use the disclosed @angular/cdk/drag-drop dependency for opt-in drag/drop; Vue OrderList/PickList have neither drag/drop nor filtering. DataView filtering remains Angular-only. DECISION-C and DECISION-D are unchanged, including Angular OrganizationChart's permanent exclusion.

Implementation and the recorded whole-batch Verification results are available for Final Review/Closeout. The branch is feature/phase-c-batch-3-migration. Final Review approval and merge are separate subsequent events; this entry does not claim either has occurred.
```

Immediately after that body, paste Task 12's already-recorded command, exit code, and meaningful output entries verbatim, followed by `Implementation HEAD: ` and the literal output of `git rev-parse HEAD`. Include the reproduced Accordion provenance baseline failure as a failed check, not as a pass. These values are execution evidence and must be copied from Task 12; never prefill or invent them. Do not edit Batch 2's history, the parity matrix, or other hygiene follow-ups.

Append to `PROVENANCE.md`:

```markdown
### Phase C Batch 3 source disclosure

OrderList, PickList, and DataView reference PrimeNG 21.1.9, PrimeReact 10.9.9, and PrimeVue 4.5.5. OrganizationChart references only PrimeReact 10.9.9 and PrimeVue 4.5.5; Angular is excluded by DECISION-D. The implementations are Ultimate-owned, framework-native components without Prime runtime dependencies. Per-file records are in provenance/ng.json, provenance/react.json, and provenance/vue.json.

Angular OrderList/PickList add the MIT-licensed @angular/cdk dependency solely for optional drag/drop. React uses native HTML5 events; Vue has no drag/drop. The exact CDK version and license verification are recorded in Task 0's commit and pnpm-lock.yaml.
```

- [ ] **Step 5: Validate documentation and dependency scope**

```bash
node scripts/provenance/validate-agents-md-pointers.mjs
node scripts/provenance/validate-dependency-ceiling.mjs
git diff --check
git diff -- docs/architecture/COMPONENT_INVENTORY.md docs/architecture/REACT_COMPONENT_STATUS.md docs/architecture/VUE_COMPONENT_STATUS.md docs/architecture/research/PHASE_C_MIGRATION_ROADMAP.md docs/architecture/PROVENANCE.md
```

Expected: commands exit 0; diff reflects only the 11 completed realizations and their actual verification evidence.

- [ ] **Step 6: Commit only these documents**

```bash
git add docs/architecture/COMPONENT_INVENTORY.md docs/architecture/REACT_COMPONENT_STATUS.md docs/architecture/VUE_COMPONENT_STATUS.md docs/architecture/research/PHASE_C_MIGRATION_ROADMAP.md docs/architecture/PROVENANCE.md
git commit -m "docs: close out Phase C Batch 3 status"
```

---

## Task 14: Final Review/Closeout

**Files:** None. This terminal review consumes Task 12 verification and Task 13 documentation; it is not a second independent batch or an implementation task.

- [ ] **Step 1: Review each Spec §11 acceptance criterion**

| Criterion                                          | Evidence to inspect                                                                                                             |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 1. Framework-native source-grounded implementation | Tasks 1–11; pinned source references and each framework's base/composition API                                                  |
| 2. Complete §9 test/verification bar               | Tests in Tasks 1–11, per-task full-suite/ceiling results, Task 12, and accessibility assertions                                 |
| 3. CDK prerequisite disclosed and verified         | Task 0 commit before Tasks 1/4; MIT and dependency-ceiling output                                                               |
| 4. Generic Angular `UListbox.trackBy`              | Task 4 Listbox default/index and custom-key DOM-reuse tests; PickList forwarding, stable selection, and deselection regressions |
| 5. Vue PickList pair model                         | Task 6 default-shape, transfer, and per-side reorder tests                                                                      |
| 6. Angular-only DataView filtering                 | Task 7 match-mode/multi-field tests; Tasks 8/9 runtime and type/prop absence guards                                             |
| 7. React/Vue-only OrganizationChart                | Tasks 10/11; explicit negative path check below                                                                                 |
| 8. Correct status-document ownership               | Task 13: Angular 3 rows, React 4, Vue 4                                                                                         |
| 9. Exact membership                                | Eleven source/test pairs, no substitution or extra capability                                                                   |
| 10. Protected decisions and exclusions unchanged   | Review base-to-head file diff and scope-cut guards                                                                              |
| 11. One Final Review/Closeout                      | This report; human review before separately authorized branch integration                                                       |

- [ ] **Step 2: Audit the entire branch diff from the actual Batch 3 base**

```bash
git diff --stat f8cd78b...HEAD
git diff --name-only f8cd78b...HEAD
git status --short
node --input-type=module <<'NODE'
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
const changed = execFileSync("git", ["diff", "--name-only", "f8cd78b...HEAD"], { encoding: "utf8" }).trim().split("\n").filter(Boolean);
const branch = execFileSync("git", ["branch", "--show-current"], { encoding: "utf8" }).trim();
if (branch !== "feature/phase-c-batch-3-migration") throw Error("Unexpected branch: " + branch);
const expectedBase = execFileSync("git", ["rev-parse", "f8cd78b"], { encoding: "utf8" }).trim();
const base = execFileSync("git", ["merge-base", "HEAD", expectedBase], { encoding: "utf8" }).trim();
if (base !== expectedBase) throw Error("Unexpected Batch 3 merge base: " + base);
const files = new Set([
  "packages/ng/package.json", "packages/ng/README.md", "pnpm-lock.yaml",
  "packages/ng/src/listbox/listbox.ts", "packages/ng/src/listbox/listbox.spec.ts",
  "packages/ng/src/index.ts", "packages/react/src/index.ts", "packages/vue/src/index.ts",
  "docs/superpowers/specs/2026-09-21-phase-c-batch-3-migration-design.md",
  "docs/superpowers/plans/2026-09-21-phase-c-batch-3-migration.md",
  "docs/architecture/COMPONENT_INVENTORY.md", "docs/architecture/REACT_COMPONENT_STATUS.md",
  "docs/architecture/VUE_COMPONENT_STATUS.md", "docs/architecture/research/PHASE_C_MIGRATION_ROADMAP.md",
  "docs/architecture/PROVENANCE.md", "docs/architecture/provenance/ng.json",
  "docs/architecture/provenance/react.json", "docs/architecture/provenance/vue.json",
]);
const componentPath = /^packages\/(ng|react|vue)\/src\/(order-list|pick-list|data-view)\//;
const orgPath = /^packages\/(react|vue)\/src\/organization-chart\//;
for (const file of changed) if (!files.has(file) && !componentPath.test(file) && !orgPath.test(file)) throw Error("Unexpected Batch 3 path: " + file);
for (const artifact of [
  "docs/superpowers/specs/2026-09-21-phase-c-batch-3-migration-design.md",
  "docs/superpowers/plans/2026-09-21-phase-c-batch-3-migration.md",
]) if (!changed.includes(artifact)) throw Error("Missing committed Batch 3 artifact: " + artifact);
const realizations = {
  ng: ["order-list", "pick-list", "data-view"],
  react: ["order-list", "pick-list", "data-view", "organization-chart"],
  vue: ["order-list", "pick-list", "data-view", "organization-chart"],
};
for (const [framework, names] of Object.entries(realizations)) for (const name of names) {
  const implementation = framework === "vue"
    ? `packages/vue/src/${name}/${name.split("-").map(part => part[0].toUpperCase() + part.slice(1)).join("")}.vue`
    : `packages/${framework}/src/${name}/${name}.${framework === "react" ? "tsx" : "ts"}`;
  const test = `packages/${framework}/src/${name}/${name}.spec.${framework === "react" ? "tsx" : "ts"}`;
  for (const path of [implementation, test]) {
    if (!existsSync(path)) throw Error("Missing Batch 3 realization file: " + path);
    if (!changed.includes(path)) throw Error("Realization not present in base-to-head diff: " + path);
  }
}
if (existsSync("packages/ng/src/organization-chart")) throw Error("Angular OrganizationChart is excluded");
console.log("Batch 3 file scope verified, including the already-committed Spec and this Plan.");
NODE
```

The Spec and Plan are legitimate branch artifacts even though the Spec was committed before implementation. Review any unexpected path or dirty state individually; never remove another contributor's work. The allowed provenance manifests are changed by their owning component tasks, not by the verification-only Task 12.

- [ ] **Step 3: Confirm verification is still current**

Task 12's full-suite/build evidence remains valid because Task 13 changes documentation only. Re-run the documentation/pointer/dependency checks and the provenance diff check:

```bash
node scripts/provenance/validate-agents-md-pointers.mjs
node scripts/provenance/validate-dependency-ceiling.mjs
node scripts/provenance/validate-provenance.mjs --base-ref f8cd78b
git diff --check f8cd78b...HEAD
git diff --check
```

Expected: pointer and dependency checks exit 0. The provenance command prints `diff check against f8cd78b passed`, then exits 1 only at the same pre-existing `packages/ng/src/accordion/accordion-style.ts` missing-manifest record captured in Task 0; report both facts and do not describe the full provenance gate as passing. Both diff checks exit 0. If code changed after Task 12, repeat its affected checks before presenting final verification claims.

- [ ] **Step 4: Present the single Final Review/Closeout report**

Report implementation, verified checks, CI-enforced checks, and externally unexercisable claims distinctly. Include all 11 realizations, real framework asymmetries, CDK/license disclosure, Listbox adaptation, the precise baseline exception, and the bounded diff. Do not claim all gates are clean while any failed. Use `finishing-a-development-branch` only after the human's Final Review; merge, push, and PR publication follow their applicable authorization. This task ends with a report, not a commit or automated merge.
