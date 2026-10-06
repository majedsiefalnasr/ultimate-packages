# GAP-064 C2-0 — Angular ContextMenu Runtime and Story Corrections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Status:** **Approved** (revision 2, user, 2026-10-06; Plan Review corrections 1–7 applied). Execution: subagent-driven.

**Goal:** Make Angular `UContextMenu` open at the pointer (timing-only fix), document and demonstrate its real non-global host trigger, verify both in unit tests and in Chromium, Firefox and WebKit, and record provenance for the changed files.

**Architecture:**

- `UContextMenu.show()` currently computes the position in a `queueMicrotask`, which runs before Angular renders the `@if (render())` list, so `position()` returns early and the menu stays at CSS `top: 0; left: 0`.
- The fix schedules the **unchanged** `position()` with Angular's `afterNextRender` (component `Injector`; precedent `packages/ng/src/dialog/dialog.ts:290`), so it runs once the list exists. That is PrimeNG 21.1.9's timing (`onBeforeEnter`).
- Everything else is documentation, story markup, tests and provenance.

**Tech Stack:** Angular 21 (zoneless), Vitest 4 through `@angular/build:unit-test` (jsdom), Playwright 1.63 (projects `ng-chromium`, `ng-firefox`, `ng-webkit` against the Angular Storybook on :6001).

**Spec:** `docs/superpowers/specs/2026-10-06-gap-064-c2-0-runtime-fixes-design.md` (approved, revision 2).

**Normative rules:** **ADR-052** in `docs/architecture/DECISIONS.md` (X-1, X-2, X-3, X-3b, X-4, X-6, X-12). Every X-rule reference in this Plan means ADR-052.

**Evidence (not normative):** `docs/architecture/research/2026-10-06-gap-064-cross-tranche-study.md` §4.1 (F-3c facts), §10–§11 (history of the rulings).

**Execution method (user, Plan Review):** subagent-driven development: a fresh implementer and a fresh reviewer per task, then a whole-branch review. Stop conditions are preserved exactly; an implementer that meets one stops and reports and never introduces an alternative mechanism.

**Branch:** `feature/gap-064-c2-0-runtime-fixes`. Branch point for changed-file checks: `95f3c65`.

## Global Constraints

- Angular only (`packages/ng`). No Vue, React or TieredMenu file changes.
- No CSS change: no `*-style.ts` file is touched.
- No public API change: `UContextMenu` inputs (`model`, `global`), outputs (`onShow`, `onHide`, `onItemSelect`) and methods (`show(event)`, `hide()`) stay identical. No `target` input.
- No template or DOM structure change in `context-menu.ts`.
- Placement algorithm unchanged: `left = pageX + 1`, `top = pageY + 1`; subtract the container width/height when it would exceed `innerWidth`/`innerHeight`; clamp at ≥ 0; then `ZIndex.set("menu", container, 1000)`. No scroll-aware change.
- SSR-safe: no browser access on the server. The existing GAP-065 tests stay green, unmodified.
- Existing `context-menu.spec.ts` tests must pass **unmodified** (Spec AC4). New tests are added in a new `describe` block only.
- E2E: layout assertions only. No `toHaveScreenshot`, no `runAccessibilityScan`. Test titles must not contain `G3-A`, `G3-B` or `G3-C1` (CI's strict run selects `--grep-invert "G3-A|G3-B|G3-C1"`; these tests must run in it).
- ADR-052 X-6: park the pointer at (0, 0) before interacting; use fixed coordinates.
- Provenance: entries only for the changed files under `packages/ng/src`. Do not edit `validate-provenance.mjs` or add any other entry. `provenance:validate` output is not evidence.
- Stop conditions (Spec §11), with no workaround:
  - R1 needs an API or template change;
  - the R2 hit area is unreliable in any engine;
  - an existing ContextMenu test needs modification;
  - an accessibility violation is introduced;
  - an unrelated test or baseline changes;
  - a Vue, React, TieredMenu or CSS file would need to change.

## Review Focus

1. **Second right-click while the menu is already open.** Nothing structural re-renders. The menu must still move to the new pointer. Pinned in Task 1 (unit test "repositions on a second right-click while open") and Task 3 (e2e).
2. **Two right-clicks before the first render.** The last pointer position must win, and the menu must not jump back. Pinned in Task 1 (unit test "last right-click before render wins").
3. **The menu hides, or the component is destroyed, before the scheduled position runs** (right-click then immediate Escape, or navigation), including hide-then-reopen before render. Expected: no exception, no menu reappearance, no new visible state, and the latest right-click wins. This is achieved without cancellation state. Pinned in Task 1 (the three invariant tests).
4. **A right-click near the right or bottom viewport edge.** The existing flip must still apply, now that the container has real dimensions. Pinned in Task 1 (unit test "flips near the viewport edges").
5. **A right-click just outside the Default story's host box.** It must not open the menu (the host trigger is exactly the host element). Pinned in Task 3 (e2e "outside the host does not open").

---

### Task 1: R1 — Position the ContextMenu after render (timing only)

**Files:**

- Modify: `packages/ng/src/context-menu/context-menu.ts`:
  - the `@angular/core` import (lines 1–10);
  - add an injector field next to the other private fields (after line 122);
  - the `show()` body (lines 158–170).
- Test: `packages/ng/src/context-menu/context-menu.spec.ts`. Append a new `describe` block at the end of the top-level `describe("UContextMenu", …)`; existing tests untouched.

**Interfaces:**

- Consumes: existing `UContextMenu` (selector `u-context-menu`, input `model`, method `show(event: MouseEvent)`, private `position(pageX, pageY)`), `UMenuItem` from `@ultimate/ng-core`.
- Produces: no new public names. Behaviour later tasks rely on: after a right-click and one render, `.u-contextmenu` (the root `div`, `list.parentElement`) has inline `left`/`top` = pointer + 1 px, and a non-empty `z-index`.

- [ ] **Step 1: Write the failing tests**

Append inside the top-level `describe("UContextMenu", () => { … })`, after the last existing `describe` block:

```ts
describe("positioning after render (GAP-064 C2-0 R1)", () => {
  @Component({
    standalone: true,
    imports: [UContextMenu],
    template: `<u-context-menu [model]="items"></u-context-menu>`,
  })
  class PositionHostComponent {
    items = items;
  }

  /** jsdom's MouseEvent ignores pageX/pageY in its init dict; set them directly (splitter.spec.ts precedent). */
  function contextMenuAt(pageX: number, pageY: number): MouseEvent {
    const event = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "pageX", { value: pageX, configurable: true });
    Object.defineProperty(event, "pageY", { value: pageY, configurable: true });
    return event;
  }

  /**
   * Mirrors the browser order: the right-click handler runs, queued
   * microtasks drain, and only then does the zoneless scheduler render.
   */
  async function rightClick(
    fixture: ComponentFixture<PositionHostComponent>,
    pageX: number,
    pageY: number
  ) {
    const host: HTMLElement = fixture.nativeElement.querySelector("u-context-menu");
    host.dispatchEvent(contextMenuAt(pageX, pageY));
    await Promise.resolve();
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function container(): HTMLElement | null {
    return document.querySelector<HTMLElement>(".u-contextmenu");
  }

  function setup(): ComponentFixture<PositionHostComponent> {
    const fixture = TestBed.createComponent(PositionHostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => {
    vi.restoreAllMocks();
    document.querySelectorAll(".u-contextmenu").forEach((el) => el.remove());
  });

  it("places the menu at the pointer + 1px once the list has rendered, with a z-index", async () => {
    const fixture = setup();
    await rightClick(fixture, 50, 60);

    const el = container();
    expect(el).not.toBeNull();
    expect(el!.style.left).toBe("51px");
    expect(el!.style.top).toBe("61px");
    expect(el!.style.zIndex).not.toBe("");

    fixture.destroy();
    fixture.nativeElement.remove();
  });

  it("flips near the viewport edges using the rendered container size", async () => {
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(200);
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(100);
    const fixture = setup();
    const x = window.innerWidth - 20;
    const y = window.innerHeight - 10;
    await rightClick(fixture, x, y);

    const el = container()!;
    expect(el.style.left).toBe(`${x + 1 - 200}px`);
    expect(el.style.top).toBe(`${y + 1 - 100}px`);

    fixture.destroy();
    fixture.nativeElement.remove();
  });

  it("repositions on a second right-click while open", async () => {
    const fixture = setup();
    await rightClick(fixture, 50, 60);
    await rightClick(fixture, 300, 200);

    const el = container()!;
    expect(el.style.left).toBe("301px");
    expect(el.style.top).toBe("201px");

    fixture.destroy();
    fixture.nativeElement.remove();
  });

  it("last right-click before render wins", async () => {
    const fixture = setup();
    const host: HTMLElement = fixture.nativeElement.querySelector("u-context-menu");
    host.dispatchEvent(contextMenuAt(50, 60));
    host.dispatchEvent(contextMenuAt(400, 300));
    await Promise.resolve();
    fixture.detectChanges();
    await fixture.whenStable();

    const el = container()!;
    expect(el.style.left).toBe("401px");
    expect(el.style.top).toBe("301px");

    fixture.destroy();
    fixture.nativeElement.remove();
  });

  // The three tests below pin the scheduled-callback invariants of the
  // timing-only fix: each right-click schedules its own afterNextRender
  // callback that calls the unchanged position(); there is no cancellation
  // state. The invariants: the latest right-click's coordinates win; hiding or
  // destroying before a callback runs never re-shows the menu; nothing throws.
  // "No effect" below means exactly: no exception, no menu reappearance, no
  // new visible state.

  it("hidden before its callback runs: no exception, no reappearance", async () => {
    const fixture = setup();
    const host: HTMLElement = fixture.nativeElement.querySelector("u-context-menu");

    host.dispatchEvent(contextMenuAt(50, 60));
    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" })); // same dispatch as the existing "hides on Escape" test
    await Promise.resolve();
    fixture.detectChanges();
    await expect(fixture.whenStable()).resolves.not.toThrow();
    expect(container()).toBeNull();

    // a further render pass must not bring it back
    fixture.detectChanges();
    await fixture.whenStable();
    expect(container()).toBeNull();

    fixture.destroy();
    fixture.nativeElement.remove();
  });

  it("hidden and re-opened before render: the latest right-click wins", async () => {
    const fixture = setup();
    const host: HTMLElement = fixture.nativeElement.querySelector("u-context-menu");

    host.dispatchEvent(contextMenuAt(50, 60));
    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
    host.dispatchEvent(contextMenuAt(400, 300));
    await Promise.resolve();
    fixture.detectChanges();
    await fixture.whenStable();

    const el = container()!;
    expect(el).not.toBeNull();
    expect(el.style.left).toBe("401px");
    expect(el.style.top).toBe("301px");

    fixture.destroy();
    fixture.nativeElement.remove();
  });

  it("destroyed before its callback runs: no exception, no menu left behind", async () => {
    const fixture = setup();
    const host: HTMLElement = fixture.nativeElement.querySelector("u-context-menu");

    host.dispatchEvent(contextMenuAt(70, 80));
    await Promise.resolve();
    expect(() => fixture.destroy()).not.toThrow();
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(container()).toBeNull();

    fixture.nativeElement.remove();
  });
});
```

Add `afterEach` to the existing vitest import on line 5:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
```

- [ ] **Step 2: Run the new tests to verify they fail**

Run: `pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include src/context-menu/context-menu.spec.ts`

Expected: FAIL in "places the menu at the pointer + 1px …", "flips near …", "repositions …", "last right-click …" and "hidden and re-opened … latest right-click wins", with `expected '' to be '51px'` (or similar). The queued microtask runs before the render, so `style.left` stays empty. The two "no exception / no reappearance" tests may already pass on the pre-change code; they guard the new behaviour. All pre-existing tests PASS.

The early-hide tests close the menu with Escape, using the exact dispatch from the existing "hides on Escape" test, because Escape is registered synchronously in `show()`. An outside click would **not** work here: the dismiss listener needs the rendered container, which doesn't exist yet.

- [ ] **Step 3: Implement the timing fix**

In `packages/ng/src/context-menu/context-menu.ts`, change the `@angular/core` import to:

```ts
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  ViewChild,
  ViewEncapsulation,
  afterNextRender,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
```

Add, directly after `private readonly instanceUid = ++UContextMenu.instanceCount;`:

```ts
  private readonly injector = inject(Injector);
```

Replace the body of `show()` so the method reads:

```ts
  /** Shows the menu positioned at the given event's page coordinates. */
  show(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.focusedIndex.set(-1);
    this.visible.set(true);
    this.render.set(true);
    this.bindDismissListeners();
    this.registerEscape();
    const pageX = event.pageX;
    const pageY = event.pageY;
    // The list only exists once Angular renders the @if (render()) block, so
    // position after the next render (PrimeNG positions in onBeforeEnter,
    // once its container exists). position() is unchanged and still returns
    // early if the menu was hidden before this runs.
    afterNextRender(() => this.position(pageX, pageY), { injector: this.injector });
    this.onShow.emit();
  }
```

Do not change `position()`, `hide()`, the template, the listeners or the CSS. Do **not** add cancellation state, a pending-position field, a guard flag or any other runtime mechanism to satisfy the invariant tests. The approved requirement is timing-only. If an invariant test can only pass by adding such state, stop and report.

- [ ] **Step 4: Run the ContextMenu tests to verify they pass**

Run: `pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include src/context-menu/context-menu.spec.ts`

Expected: all tests PASS, the seven new ones and every pre-existing one (show, select, disabled, outside click, Escape, SSR GAP-065 ×2, Escape arbitration GAP-067 ×3).

If any pre-existing test fails, **stop** (Spec §11). Do not edit it.

Then prove that the diff is timing-only:

Run: `git diff -- packages/ng/src/context-menu/context-menu.ts`

Expected: exactly three hunks:

1. the `@angular/core` import gains `Injector`, `afterNextRender`, `inject`;
2. one added line, `private readonly injector = inject(Injector);`;
3. inside `show()`, the `queueMicrotask(...)` line replaced by the comment and the `afterNextRender(...)` line.

No change inside `position()`, `hide()`, the template or the listeners. Any other hunk: stop and report.

- [ ] **Step 5: Run the Angular unit suite and typecheck**

Run: `pnpm --filter @ultimate/ng test` then `pnpm --filter @ultimate/ng typecheck`

Expected: both PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/ng/src/context-menu/context-menu.ts packages/ng/src/context-menu/context-menu.spec.ts
git commit -m "fix(ng): position UContextMenu after its list renders (GAP-064 C2-0)"
```

(Commit body ends with the session's `Co-Authored-By` / `Claude-Session` attribution lines.)

Then capture the immutable pre-fix reference and record it in the task report and the SDD ledger. Task 3 uses this literal SHA:

```bash
git rev-parse HEAD^   # PRE_FIX_SHA: the parent of the Task 1 commit (contains the original queueMicrotask implementation)
git rev-parse HEAD    # TASK1_SHA
git show HEAD^:packages/ng/src/context-menu/context-menu.ts | grep -c "queueMicrotask"   # expected: 1
```

---

### Task 2: R2 — Correct the host-trigger documentation and the Default story

**Files:**

- Modify: `packages/ng/src/context-menu/context-menu.ts`, the class doc comment (lines 21–47) only.
- Modify: `packages/ng/src/context-menu/context-menu.stories.ts`: the file comment (lines 5–9) and the `Default` story template (line 28).

**Interfaces:**

- Consumes: Task 1's component (no API).
- Produces: the Default story (`ng-contextmenu--default`) renders `<u-context-menu>` as a visible block hit area with inline style `display: block; min-height: 6rem; border: 1px dashed #999;`, with the instruction text in a sibling `<p>` before it. Task 3 locates the host with `page.locator("u-context-menu")`.

- [ ] **Step 1: Replace the class doc comment**

Replace the whole comment block above `@Component({` in `context-menu.ts` with:

```ts
/**
 * Ultimate-owned adaptation of PrimeNG's `ContextMenu` component (see
 * `.vendor-extracted/ng/contextmenu/contextmenu.ts`). Confirmed against real
 * source: ContextMenu's real activation mechanism is the browser's native
 * `contextmenu` DOM event (right-click) — real source's `bindTriggerEventListener`
 * defaults `triggerEvent = 'contextmenu'` and listens either on `document`
 * (`global: true`) or on a given `target` element, calling `show(event)`,
 * which reads `event.pageX`/`event.pageY` to position the menu and calls
 * `event.preventDefault()` to suppress the browser's own native context menu.
 *
 * This port has no `target` input. It supports two triggers:
 * - `global: true` — listens for `contextmenu` on the whole document;
 * - otherwise — a right-click on this component's own `<u-context-menu>` host
 *   element (an Ultimate adaptation; PrimeNG has no host fallback). The host
 *   renders no content of its own (the menu is appended to `document.body`),
 *   so a consumer using this mode must give the host element a hit area, for
 *   example `style="display: block; min-height: 6rem"`, or use `global`.
 *
 * The menu is positioned at the right-click's page coordinates once its list
 * has rendered.
 *
 * Renders a flat `UMenuItem[]` list (no nested submenus) — matching
 * `UMenu`'s own established reduction of PrimeNG's real recursive
 * `ContextMenuSub` structure; nested-submenu support is `UTieredMenu`'s own
 * distinct capability, not duplicated here. Composes `UOverlay` for the
 * body-append + z-index behavior. Dismissed on outside click, Escape, and
 * window resize — the same real dismissal triggers upstream's own
 * `bindGlobalListeners`/`onEscapeKey`/`resizeListener` implement.
 *
 * Deliberately excludes upstream's much larger surface: nested submenus,
 * roving/virtual keyboard focus beyond a simple focused-index highlight,
 * touch long-press activation, `breakpoints`-driven responsive `<style>`
 * injection, and router-link items — none of these appear in this
 * capability's spec-mandated surface (same "smaller surface than upstream"
 * precedent as every sibling component).
 */
```

- [ ] **Step 2: Correct the story file comment and the Default story**

In `context-menu.stories.ts`, replace the file comment (lines 5–9) with:

```ts
/**
 * `UContextMenu` opens on a native `contextmenu` (right-click) event.
 * Default: the trigger is the `<u-context-menu>` host element itself, which
 * renders no content, so the story gives the host a visible hit area with
 * inline style; right-click inside the dashed box. Global: `global: true`
 * listens on the whole document; right-click anywhere.
 */
```

Replace the `Default` story's `template` with:

```ts
    template: `<p style="margin: 0 0 0.5rem;">Right-click inside the dashed box.</p><u-context-menu [model]="model" style="display: block; min-height: 6rem; border: 1px dashed #999;"></u-context-menu>`,
```

Leave the `Global` story and `meta` unchanged.

- [ ] **Step 3: Verify no `target` claim remains, and nothing else changed**

Run: `grep -n "target" packages/ng/src/context-menu/context-menu.ts packages/ng/src/context-menu/context-menu.stories.ts`

Expected: matches only inside the PrimeNG description ("on a given `target` element", "no `target` input"), and in the existing `event.target` code in the dismiss listener. No sentence claims Ultimate has a `target` input.

Run: `git diff --stat`. Expected: only the two files above.

- [ ] **Step 4: Run the ContextMenu unit tests and typecheck**

Run: `pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include src/context-menu/context-menu.spec.ts` then `pnpm --filter @ultimate/ng typecheck`

Expected: PASS (comment and story changes only).

- [ ] **Step 5: Commit**

```bash
git add packages/ng/src/context-menu/context-menu.ts packages/ng/src/context-menu/context-menu.stories.ts
git commit -m "docs(ng): document the UContextMenu host trigger and fix its Default story (GAP-064 C2-0)"
```

---

### Task 3: R3 — Three-engine e2e layout checks

**Files:**

- Create: `packages/ng/e2e/context-menu.spec.ts`

**Interfaces:**

- Consumes: `storyUrl(storyId)` from `packages/ng/e2e/accessibility-envelope.ts` (returns `http://localhost:6001/iframe.html?id=<id>&viewMode=story`); stories `ng-contextmenu--global` and `ng-contextmenu--default` (Task 2 markup); behaviour from Task 1.
- Produces: tests titled `Ng/ContextMenu C2-0 …`, run by projects `ng-chromium`, `ng-firefox`, `ng-webkit`.

- [ ] **Step 1: Write the e2e spec**

```ts
import { expect, test, type Page } from "@playwright/test";
import { storyUrl } from "./accessibility-envelope";

/**
 * GAP-064 C2-0 (Spec §9 AC2–AC3): real-browser layout checks for
 * UContextMenu's post-render positioning and its non-global host trigger.
 * Layout assertions only — no screenshot and no accessibility scan.
 * Unit tests (src/context-menu/context-menu.spec.ts) cover the timing,
 * flip and early-hide cases.
 */

async function open(page: Page, storyId: string): Promise<void> {
  await page.goto(storyUrl(storyId));
  await expect(page.locator("u-context-menu")).toBeAttached();
  await page.mouse.move(0, 0); // ADR-052 X-6: no pointer residue before interacting
}

type Box = { x: number; y: number; width: number; height: number };

/**
 * A point inside the viewport and outside the host box, derived from the
 * host's geometry: below it, else to its right, else above it, else to its
 * left (each 20px clear of the edge and at least 5px inside the viewport).
 * Throws if none fits, so the test cannot silently click inside the host.
 */
function outsidePoint(
  host: Box,
  viewport: { width: number; height: number }
): { x: number; y: number } {
  const gap = 20;
  const margin = 5;
  const midX = Math.round(
    Math.min(Math.max(host.x + host.width / 2, margin), viewport.width - margin - 1)
  );
  const midY = Math.round(
    Math.min(Math.max(host.y + host.height / 2, margin), viewport.height - margin - 1)
  );
  const below = Math.round(host.y + host.height + gap);
  if (below <= viewport.height - margin - 1) return { x: midX, y: below };
  const right = Math.round(host.x + host.width + gap);
  if (right <= viewport.width - margin - 1) return { x: right, y: midY };
  const above = Math.round(host.y - gap);
  if (above >= margin) return { x: midX, y: above };
  const left = Math.round(host.x - gap);
  if (left >= margin) return { x: left, y: midY };
  throw new Error("no in-viewport point outside the host");
}

async function menuTopLeft(page: Page): Promise<{ x: number; y: number }> {
  const menu = page.locator(".u-contextmenu");
  await expect(menu).toBeVisible();
  const box = await menu.boundingBox();
  expect(box, "menu bounding box").not.toBeNull();
  return { x: Math.round(box!.x), y: Math.round(box!.y) };
}

test.describe("Ng/ContextMenu C2-0", () => {
  test("Global: opens at the pointer + 1px, identically across three opens", async ({ page }) => {
    await open(page, "ng-contextmenu--global");
    for (let run = 0; run < 3; run++) {
      await page.mouse.click(300, 200, { button: "right" });
      expect(await menuTopLeft(page)).toEqual({ x: 301, y: 201 });
      await page.mouse.click(1200, 680); // outside left-click dismisses
      await expect(page.locator(".u-contextmenu")).toHaveCount(0);
    }
  });

  test("Global: a second right-click while open repositions the menu", async ({ page }) => {
    await open(page, "ng-contextmenu--global");
    await page.mouse.click(300, 200, { button: "right" });
    expect(await menuTopLeft(page)).toEqual({ x: 301, y: 201 });
    await page.mouse.click(500, 320, { button: "right" });
    expect(await menuTopLeft(page)).toEqual({ x: 501, y: 321 });
  });

  test("Default: a right-click inside the host hit area opens the menu at the pointer", async ({
    page,
  }) => {
    await open(page, "ng-contextmenu--default");
    const host = await page.locator("u-context-menu").boundingBox();
    expect(host, "host bounding box").not.toBeNull();
    expect(host!.height).toBeGreaterThan(50);
    const x = Math.round(host!.x + 40);
    const y = Math.round(host!.y + 30);
    await page.mouse.click(x, y, { button: "right" });
    expect(await menuTopLeft(page)).toEqual({ x: x + 1, y: y + 1 });
    await page.mouse.click(1200, 680);
    await expect(page.locator(".u-contextmenu")).toHaveCount(0);
  });

  test("Default: a right-click outside the host does not open the menu", async ({ page }) => {
    await open(page, "ng-contextmenu--default");
    const host = await page.locator("u-context-menu").boundingBox();
    expect(host, "host bounding box").not.toBeNull();
    const viewport = page.viewportSize();
    expect(viewport, "viewport size").not.toBeNull();
    const point = outsidePoint(host!, viewport!);
    // the chosen point is inside the viewport and outside the host box
    expect(point.x).toBeGreaterThanOrEqual(0);
    expect(point.x).toBeLessThan(viewport!.width);
    expect(point.y).toBeGreaterThanOrEqual(0);
    expect(point.y).toBeLessThan(viewport!.height);
    const insideHost =
      point.x >= host!.x &&
      point.x <= host!.x + host!.width &&
      point.y >= host!.y &&
      point.y <= host!.y + host!.height;
    expect(insideHost, `point ${point.x},${point.y} must be outside the host`).toBe(false);
    await page.mouse.click(point.x, point.y, { button: "right" });
    await expect(page.locator(".u-contextmenu")).toHaveCount(0);
  });
});
```

- [ ] **Step 2: Run on the pre-fix code to confirm it detects the defect**

Use the literal `PRE_FIX_SHA` recorded at the end of Task 1 (the parent of the Task 1 commit). Never a relative reference such as `HEAD~2`.

Swap in the original implementation of the component file only, keeping Task 2's committed comment and story changes. Run Chromium, then restore the committed fixed file, and prove nothing is left behind:

```bash
PRE_FIX_SHA=<literal SHA from the Task 1 report>
git show "$PRE_FIX_SHA":packages/ng/src/context-menu/context-menu.ts | grep -c "queueMicrotask"   # expected: 1 (original implementation)
git show "$PRE_FIX_SHA":packages/ng/src/context-menu/context-menu.ts > packages/ng/src/context-menu/context-menu.ts
npx playwright test --project=ng-chromium packages/ng/e2e/context-menu.spec.ts
git show HEAD:packages/ng/src/context-menu/context-menu.ts > packages/ng/src/context-menu/context-menu.ts
git diff --quiet HEAD -- packages/ng/src && echo "src restored: identical to HEAD"
git status --short -- packages/ng/src   # expected: no output
```

`HEAD` here is the Task 2 commit, which contains the fixed implementation and the corrected doc comment.

Expected:

- with the original implementation, the three "opens/repositions … at the pointer" tests FAIL (menu at `{ x: 0, y: 0 }`), and "outside the host does not open" PASSES;
- after the restore, `src restored: identical to HEAD` is printed and `git status` shows nothing under `packages/ng/src`.

Note: the swapped file carries the old doc comment, which is irrelevant to the e2e result. If the restore check prints anything else, stop and report before continuing.

- [ ] **Step 3: Run on the fixed code in all three engines**

Run: `npx playwright test --project=ng-chromium --project=ng-firefox --project=ng-webkit packages/ng/e2e/context-menu.spec.ts`

Expected: 12 passed (4 tests × 3 engines), with no retries needed.

If either Default test fails in any engine because the host hit area does not receive the right-click, **stop and report** (Spec §5.2 stop rule). Do not introduce another mechanism or a `target` input.

- [ ] **Step 4: Confirm no accessibility or screenshot coverage was added**

Run: `grep -nE "toHaveScreenshot|runAccessibilityScan" packages/ng/e2e/context-menu.spec.ts`

Expected: no output.

Run: `grep -rln "ng-contextmenu" packages/ng/e2e docs/architecture/ACCESSIBILITY_BASELINE.md`

Expected: only `packages/ng/e2e/context-menu.spec.ts`. No existing scan or baseline covers these stories, so AC9 holds by construction.

- [ ] **Step 5: Commit**

```bash
git add packages/ng/e2e/context-menu.spec.ts
git commit -m "test(ng): verify UContextMenu placement and host trigger in three engines (GAP-064 C2-0)"
```

---

### Task 4: R4 — Provenance, MIGRATION entry and final verification

**Files:**

- Modify: `docs/architecture/provenance/ng.json` — add 3 entries.
- Modify: `docs/architecture/MIGRATION.md` — append a C2-0 block at the end of §8.

**Interfaces:**

- Consumes: the files changed by Tasks 1–3.
- Produces: changed-file provenance completeness (Spec AC7) and the recorded verification results for closeout.

- [ ] **Step 1: List the changed source files**

Run: `git diff --name-only 95f3c65...HEAD -- packages/ng/src`

Expected exactly:

```
packages/ng/src/context-menu/context-menu.spec.ts
packages/ng/src/context-menu/context-menu.stories.ts
packages/ng/src/context-menu/context-menu.ts
```

If the list differs, stop and report (AC5 scope).

- [ ] **Step 2: Add the three provenance entries**

Append these three objects to the JSON array in `docs/architecture/provenance/ng.json` (keep the existing formatting; append at the end of the array):

```json
  {
    "originalPath": "packages/primeng/src/contextmenu/contextmenu.ts",
    "ultimateDestination": "packages/ng/src/context-menu/context-menu.ts",
    "modificationStatus": "adapted",
    "modificationDescription": "Adapted from primeng@21.1.9 ContextMenu. ContextMenu→UContextMenu: flat UMenuItem list (no nested submenus), native contextmenu trigger on the document (global) or on the u-context-menu host element (Ultimate adaptation; no target input), body-appended via UOverlay, dismissed on outside click, Escape and resize, positioned at pageX/pageY + 1 with viewport flip and 0 clamp after the list renders (afterNextRender; upstream positions in onBeforeEnter). Excludes nested submenus, roving/virtual keyboard focus, touch long-press, breakpoints styling, router-link items and scroll-aware flip/fit."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/ng/src/context-menu/context-menu.spec.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test, not derived from upstream. Covers rendering on right-click, native-menu suppression, item selection, disabled items, outside-click and Escape dismissal, SSR safety (GAP-065), Escape arbitration with UMenu popups (GAP-067), and post-render positioning, flip, repositioning and early-hide (GAP-064 C2-0)."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/ng/src/context-menu/context-menu.stories.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored ContextMenu stories: Default (host-element trigger with an inline-styled hit area) and Global (document trigger)."
  }
```

Validate the JSON: `node -e "JSON.parse(require('fs').readFileSync('docs/architecture/provenance/ng.json','utf8')); console.log('ok')"`. Expected: `ok`.

- [ ] **Step 3: Run the changed-file completeness check (authoritative provenance evidence, ADR-052 X-12)**

```bash
git diff --name-only 95f3c65...HEAD -- packages/ng/src > /tmp/c2-0-changed.txt
node --input-type=module -e '
import { readFileSync } from "node:fs";
const manifest = new Set(JSON.parse(readFileSync("docs/architecture/provenance/ng.json", "utf8")).map(function (e) { return e.ultimateDestination; }));
const changed = readFileSync("/tmp/c2-0-changed.txt", "utf8").split("\n").filter(function (f) { return /\.(ts|tsx|vue)$/.test(f); });
const missing = changed.filter(function (f) { return !manifest.has(f); });
console.log("changed source files:", changed.length, "missing entries:", missing.length, missing.join(" "));
process.exit(missing.length ? 1 : 0);
'
```

Expected: `changed source files: 3 missing entries: 0`, exit 0. Paste the output into the closeout.

**What this proves, and only this:** every changed `packages/ng/src` source file has a corresponding `ng.json` entry.

It does **not** make the repository-wide `provenance:validate` green, and it does not remediate the existing repository-wide missing-entry debt (362 Angular / 473 Vue files at `95f3c65`). That validator stays red and classified as pre-existing debt. Do not run or cite it as C2-0 evidence. Do not modify `validate-provenance.mjs`, and do not add any manifest entry other than the three in Step 2.

- [ ] **Step 4: Append the MIGRATION.md entry**

Append at the end of `docs/architecture/MIGRATION.md` (after the G3-C1 block in §8):

```markdown
Added for GAP-064 C2-0 (`feature/gap-064-c2-0-runtime-fixes`), same status — unreleased, no changesets:

- **`@ultimate/ng` — `UContextMenu` now opens at the pointer.** The menu previously appeared at the top-left corner of the page, because its position was computed before the menu list existed. It now opens at the right-click's page coordinates + 1px, flipped to stay inside the viewport. No API change. In non-global mode the trigger is a right-click on the `<u-context-menu>` host element, which renders no content of its own: give the host a hit area (for example `display: block` with a height) or use `global`. Placement still does not account for page scroll (a known divergence from PrimeNG).
```

Exact wording is subject to Plan Review approval.

- [ ] **Step 5: Final verification (record every result for the closeout)**

Run each and record the result:

```bash
pnpm --filter @ultimate/ng test
pnpm --filter @ultimate/ng typecheck
pnpm --filter @ultimate/ng build
pnpm --filter-prod "playground-angular..." run build && TRACK_E_SSR_FRAMEWORK=ng npx playwright test --project=ng-ssr-chromium
npx playwright test --project=ng-chromium --project=ng-firefox --project=ng-webkit --grep-invert "G3-A|G3-B|G3-C1"
npx eslint packages/ng/src/context-menu/context-menu.ts packages/ng/src/context-menu/context-menu.spec.ts packages/ng/src/context-menu/context-menu.stories.ts packages/ng/e2e/context-menu.spec.ts
npx prettier --check docs/architecture/MIGRATION.md docs/architecture/provenance/ng.json packages/ng/src/context-menu packages/ng/e2e/context-menu.spec.ts
pnpm run coverage:validate
git diff --name-only 95f3c65...HEAD
```

Expected:

- unit suite, typecheck and build pass;
- the Angular SSR project passes;
- the strict ng Playwright run passes (it now includes the 4 new tests per engine; the visual and accessibility specs are unchanged);
- eslint reports no problems in the changed files;
- prettier passes;
- `coverage:validate` passes for ng;
- the final diff lists only the §8 Spec files plus this Plan, the approved Spec and the study.

If the strict run fails anywhere outside `context-menu.spec.ts`, check whether the failure also occurs on `95f3c65` (pre-existing) before treating it as introduced. Report either way.

- [ ] **Step 6: Commit**

```bash
git add docs/architecture/provenance/ng.json docs/architecture/MIGRATION.md
git commit -m "docs(ng): record C2-0 provenance and the UContextMenu migration note (GAP-064 C2-0)"
```

---

## After the tasks (not part of execution)

- **Final whole-branch review**, then **closeout**: a research record with the verification results, Spec §18-style errata if any, and the user's merge decision for `feature/gap-064-c2-0-runtime-fixes` into `main`. Merge and push need separate authorization.
- **CI (ADR-052 X-12):** on the merge commit, Build, Typecheck, Coverage measurement, the strict ng Playwright run (including the new spec, so this is also the Linux evidence) and the accessibility baseline validation must be green. Known pre-existing failures stay unchanged.
- No Docker run is planned: C2-0 adds no screenshots, and its layout assertions are pointer-relative. CI's Linux run is the Linux evidence.

## Self-review notes

- **Spec coverage:** R1 → Task 1 (AC1, AC4). R2 → Task 2 (AC6). AC2/AC3 → Task 3. R4/AC7 → Task 4 Steps 1–3. MIGRATION → Task 4 Step 4. AC5 scope → Task 2 Step 3 and Task 4 Step 1. AC8 → After the tasks. AC9 → Task 3 Step 4.
- **Names used across tasks:** `.u-contextmenu`, `u-context-menu`, `ng-contextmenu--global`, `ng-contextmenu--default` and `storyUrl` are consistent throughout.
- **Known uncertainty, handled in steps:** the pre-fix reference is the literal `PRE_FIX_SHA` captured at the end of Task 1. Whether `afterNextRender` fires under `fixture.detectChanges()` + `whenStable()` in this zoneless jsdom setup is proven by Task 1 Step 4. If the new tests still fail after Step 3 only because the hook never runs in the test environment, stop and report rather than changing the timing mechanism.
