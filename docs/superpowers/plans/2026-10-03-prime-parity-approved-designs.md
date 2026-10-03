# Approved-Design Implementation (GAP-078, GAP-074, GAP-081) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver three approved Prime-parity designs:

- Angular per-document SSR style injection, with React and Vue documented as client-only (GAP-078);
- one shared `u-hidden-accessible` utility (GAP-074);
- Option 1 Angular barrel re-exports with no duplicate component classes (GAP-081).

**Architecture:** Three families in fixed order, one phase, one final review.

- **Family A (GAP-078):** the module-level Angular style sheet becomes one registry per `Document`, writing into the injected `DOCUMENT`. It keys each `<style>` so hydration adopts the server's element instead of duplicating it.
- **Family B (GAP-074):** one small `uix-styled` helper registers a single shared rule into whichever `StyleSheet` each core already uses. In Angular that is Family A's per-document registry.
- **Family C (GAP-081):** the Angular barrel and 13 internal imports switch to package specifiers. A development-only path mapping in `packages/ng/tsconfig.json` lets `typecheck`, tests and Storybook resolve them before a build. The published `ng-packagr` build provably ignores it.

**Tech Stack:** Angular 21 (standalone, `DOCUMENT`, `PLATFORM_ID`, SSR via `@angular/ssr`), React 19, Vue 3, `@ultimate/uix-styled` `StyleSheet`, `ng-packagr` 21.2.7, Vitest, Playwright 1.63.0, pnpm 9.6.0.

**Spec:** `docs/superpowers/specs/2026-10-03-prime-parity-approved-designs-design.md` (approved for Plan creation 2026-10-03)

## Global Constraints

- Order: Family A (Tasks 1–2) → Family B (Tasks 3–4) → Family C (Tasks 5–6). Do not start a family before the previous one is complete.
- No public component API change. The only new export is the GAP-074 helper in `@ultimate/uix-styled` (Spec §5.3).
- **GAP-074 helper scope (Plan Review constraint):** the helper only registers the shared rule under one reserved key into an existing `StyleSheet`. It must not become a general cross-framework style-registration abstraction (no registry, no options object, no framework detection).
- **GAP-081 build isolation (Plan Review constraint):** prove that the `packages/ng/tsconfig.json` mapping is development-tooling only. Required proof:
  - `typecheck` passes before any build;
  - Storybook builds with the mapping;
  - `ng-packagr` does not consume it;
  - build output with and without the mapping is equivalent apart from the intended re-export changes;
  - pack/install integrity and class identity are green.
- React and Vue stay client-only for style injection; no server CSS collector.
- `UInputNumber` stays subpath-only. The 19 barrel-only Angular components stay barrel-only. The `packages/ng/package.json` `exports` map is unchanged.
- GAP-064 and GAP-082 are out of scope. Change no GAP status in this Plan (closeout is a later gate).
- Node 20 for builds and tests: `export PATH="$HOME/.nvm/versions/node/v20.19.2/bin:$PATH"`. Per-package tests only (`pnpm --filter <pkg> test`), never full-monorepo `pnpm test`.
- No new prettier or lint failures in touched files, and no `prettier --write` on whole pre-existing files that already fail.
- A shell hook blocks output redirects to variable paths and heredocs with angle-bracket placeholders, so use literal paths.
- Stage explicit files only. Every commit ends with:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
  `Claude-Session: https://claude.ai/code/session_01PpFcC3BnfH1gFB1Gc1n7VS`

## Review Focus

1. A document that already contains some, but not all, keyed `<style>` elements (partial server output) must adopt the existing ones and create only the missing ones. Covered by a Task 1 test.
2. Two Angular apps bootstrapped into different documents in the same process must not see each other's styles. Covered by the Task 1 two-document test.
3. A style key containing characters that are special in CSS selectors must still be found. The lookup compares attribute values instead of building a selector. Covered by a Task 1 test.
4. The shared hidden-accessible rule must be present even when no theme was applied. Covered by Task 3's no-theme tests.
5. Consumers importing the same Angular component from both `@ultimate/ng` and its subpath must get one class with no `NG0912` warning. Covered by the Task 6 identity probe.

---

## Family A — GAP-078 (Angular per-document style injection)

### Task 1: Per-document Angular style registry with hydration adoption

**Files:**

- Modify: `packages/ng-core/src/basecomponent/style-sheet.ts` (whole file)
- Modify: `packages/ng-core/src/basecomponent/base-component.ts:6` (import) and `:49-58` (`ngOnInit`)
- Test: `packages/ng-core/src/basecomponent/style-sheet.spec.ts` (create)
- Test: `packages/ng-core/src/basecomponent/base-component.spec.ts` (add cases)

**Interfaces:**

- Consumes: `StyleSheet`, `StyleMeta`, `registerThemeVariables(sheet, componentName)`, `css` from `@ultimate/uix-styled`. `StyleSheet.add(key, css)` sets `meta.name = key` and calls `this.createStyleElement(meta)` (`packages/uix-styled/src/stylesheet/index.ts:34-46`).
- Produces:
  - `export function ngCoreStyleSheetFor(doc: Document | undefined): StyleSheet<HTMLStyleElement>`, which returns the same registry for the same document;
  - `export const ngCoreStyleSheet` (unchanged name), now the registry for the global `document`, or an inert registry when there is none;
  - `export const NG_CORE_STYLE_KEY_ATTR = "data-u-style"`.

- [ ] **Step 1: Write the failing tests**

Create `packages/ng-core/src/basecomponent/style-sheet.spec.ts`:

```ts
import { describe, expect, it } from "vitest";
import { NG_CORE_STYLE_KEY_ATTR, ngCoreStyleSheet, ngCoreStyleSheetFor } from "./style-sheet";

function newDoc(): Document {
  return document.implementation.createHTMLDocument("t");
}
const keyed = (doc: Document, key: string) =>
  Array.from(doc.head.querySelectorAll("style")).filter(
    (s) => s.getAttribute(NG_CORE_STYLE_KEY_ATTR) === key
  );

describe("ngCoreStyleSheetFor (GAP-078)", () => {
  it("writes a keyed <style> into the given document, not the global one", () => {
    const doc = newDoc();
    const before = document.head.querySelectorAll("style").length;
    ngCoreStyleSheetFor(doc).add("probe-a", ".a{color:red}");
    expect(keyed(doc, "probe-a")).toHaveLength(1);
    expect(keyed(doc, "probe-a")[0].textContent).toBe(".a{color:red}");
    expect(document.head.querySelectorAll("style").length).toBe(before);
  });

  it("returns one registry per document and keeps documents separate", () => {
    const a = newDoc();
    const b = newDoc();
    expect(ngCoreStyleSheetFor(a)).toBe(ngCoreStyleSheetFor(a));
    expect(ngCoreStyleSheetFor(a)).not.toBe(ngCoreStyleSheetFor(b));
    ngCoreStyleSheetFor(a).add("probe-b", ".b{}");
    expect(keyed(a, "probe-b")).toHaveLength(1);
    expect(keyed(b, "probe-b")).toHaveLength(0);
  });

  it("creates one element when the same key is added twice to a document", () => {
    const doc = newDoc();
    const sheet = ngCoreStyleSheetFor(doc);
    sheet.add("probe-c", ".c{}");
    if (!sheet.has("probe-c")) sheet.add("probe-c", ".c{}");
    sheet.add("probe-c", ".c{}");
    expect(keyed(doc, "probe-c")).toHaveLength(1);
  });

  it("adopts an existing server-rendered keyed <style> instead of duplicating it", () => {
    const doc = newDoc();
    const server = doc.createElement("style");
    server.setAttribute(NG_CORE_STYLE_KEY_ATTR, "probe-d");
    server.textContent = ".d{}";
    doc.head.appendChild(server);
    const sheet = ngCoreStyleSheetFor(doc);
    sheet.add("probe-d", ".d{}");
    expect(keyed(doc, "probe-d")).toHaveLength(1);
    expect(sheet.get("probe-d")?.element).toBe(server);
  });

  it("adopts existing keys and creates only the missing ones (partial server output)", () => {
    const doc = newDoc();
    const server = doc.createElement("style");
    server.setAttribute(NG_CORE_STYLE_KEY_ATTR, "probe-e1");
    doc.head.appendChild(server);
    const sheet = ngCoreStyleSheetFor(doc);
    sheet.add("probe-e1", ".e1{}");
    sheet.add("probe-e2", ".e2{}");
    expect(keyed(doc, "probe-e1")).toHaveLength(1);
    expect(keyed(doc, "probe-e2")).toHaveLength(1);
  });

  it("finds a key with CSS-selector-special characters", () => {
    const doc = newDoc();
    const odd = 'probe"f]:x';
    const server = doc.createElement("style");
    server.setAttribute(NG_CORE_STYLE_KEY_ATTR, odd);
    doc.head.appendChild(server);
    ngCoreStyleSheetFor(doc).add(odd, ".f{}");
    expect(keyed(doc, odd)).toHaveLength(1);
  });

  it("is inert without a document", () => {
    const sheet = ngCoreStyleSheetFor(undefined);
    expect(() => sheet.add("probe-g", ".g{}")).not.toThrow();
    expect(sheet.get("probe-g")?.element).toBeUndefined();
  });

  it("keeps ngCoreStyleSheet as the global document's registry", () => {
    expect(ngCoreStyleSheet).toBe(ngCoreStyleSheetFor(document));
  });
});
```

Append to `packages/ng-core/src/basecomponent/base-component.spec.ts` (inside `describe("UBaseComponent", ...)`; reuse that file's existing test-component and fixture helpers. Read its first 60 lines to match them, and add `DOCUMENT` from `@angular/common` and `PLATFORM_ID` to the imports):

```ts
it("registers its style module into the injected DOCUMENT, not the global document (GAP-078)", () => {
  const doc = document.implementation.createHTMLDocument("server");
  const docSpy = vi.spyOn(document.head, "appendChild");
  TestBed.configureTestingModule({
    providers: [
      { provide: DOCUMENT, useValue: doc },
      { provide: PLATFORM_ID, useValue: "server" },
    ],
  });
  // Create the file's existing test component (same helper the "registers its
  // style module on init" test uses), then run change detection once.
  const fixture = TestBed.createComponent(TestComponent);
  fixture.detectChanges();
  expect(
    Array.from(doc.head.querySelectorAll("style")).some(
      (s) => s.getAttribute("data-u-style") === "test-component"
    )
  ).toBe(true);
  expect(docSpy).not.toHaveBeenCalled();
  docSpy.mockRestore();
});
```

If the existing test component class has a different name than `TestComponent`, or a different `componentName` than `"test-component"`, use the real ones from that file.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter @ultimate/ng-core test`
Expected: the new `style-sheet.spec.ts` fails, because `ngCoreStyleSheetFor`/`NG_CORE_STYLE_KEY_ATTR` are not exported. The new base-component case fails because styles go to the global `document`.

- [ ] **Step 3: Implement**

Replace `packages/ng-core/src/basecomponent/style-sheet.ts` with:

```ts
import { StyleSheet, type StyleMeta } from "@ultimate/uix-styled";

/** Attribute that identifies a registered `<style>` element by its style key. */
export const NG_CORE_STYLE_KEY_ATTR = "data-u-style";

/**
 * `ng-core`'s `StyleSheet<HTMLStyleElement>` for ONE document (GAP-078).
 * Writes into that document's `<head>` (the injected Angular `DOCUMENT`,
 * per request under SSR) instead of the global `document`, and adopts an
 * existing `<style>` with the same key (server-rendered HTML being
 * hydrated) instead of creating a duplicate. PrimeNG 21.1.9's `UseStyle`
 * likewise writes into the injected `DOCUMENT`.
 */
class NgCoreStyleSheet extends StyleSheet<HTMLStyleElement> {
  constructor(private readonly doc: Document | undefined) {
    super();
  }

  override createStyleElement(meta: StyleMeta): HTMLStyleElement | undefined {
    const head = this.doc?.head;
    if (!head) return undefined;
    const key = meta.name ?? "";
    // Compare attribute values instead of building a CSS selector, so keys
    // with selector-special characters are still found.
    const existing = Array.from(head.querySelectorAll("style")).find(
      (el) => el.getAttribute(NG_CORE_STYLE_KEY_ATTR) === key
    );
    if (existing) return existing;
    const el = this.doc!.createElement("style");
    el.setAttribute(NG_CORE_STYLE_KEY_ATTR, key);
    el.textContent = meta.css ?? "";
    head.appendChild(el);
    return el;
  }
}

const sheets = new WeakMap<Document, NgCoreStyleSheet>();

/** The style registry for `doc`: one per document, inert when `doc` is undefined. */
export function ngCoreStyleSheetFor(doc: Document | undefined): StyleSheet<HTMLStyleElement> {
  if (!doc) return new NgCoreStyleSheet(undefined);
  let sheet = sheets.get(doc);
  if (!sheet) {
    sheet = new NgCoreStyleSheet(doc);
    sheets.set(doc, sheet);
  }
  return sheet;
}

/**
 * The registry for the global `document` (inert when there is none, e.g.
 * on the server). Kept for existing callers and tests; components use
 * `ngCoreStyleSheetFor(this.document)`.
 */
export const ngCoreStyleSheet = ngCoreStyleSheetFor(
  typeof document === "undefined" ? undefined : document
);
```

In `packages/ng-core/src/basecomponent/base-component.ts`:

- change line 6 to `import { ngCoreStyleSheetFor } from "./style-sheet";`;
- replace the body of `ngOnInit` with:

```ts
  ngOnInit(): void {
    // Per-document registry (GAP-078): the injected DOCUMENT is the
    // per-request document under SSR and the real document in the browser.
    const sheet = ngCoreStyleSheetFor(this.document);
    // Theme variable DEFINITIONS first — the structural CSS below refers to
    // them via dt()-resolved var(--u-*) references, which resolve to nothing
    // unless something also defines the properties. Idempotent per its own
    // has() guards; see registerThemeVariables' doc comment.
    registerThemeVariables(sheet, this.componentName);

    if (!sheet.has(this.componentName)) {
      sheet.add(this.componentName, css`${this.styleModule.css}`);
    }
  }
```

Do not change `UBaseComponent`'s public members. `ngCoreStyleSheet` is not exported from `packages/ng-core/src/index.ts`; leave the barrels as they are.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm --filter @ultimate/ng-core test` — Expected: all pass, including the existing "registers its style module on init" test, which uses `ngCoreStyleSheet`. Under TestBed the injected `DOCUMENT` is the global `document`, so `ngCoreStyleSheetFor(this.document) === ngCoreStyleSheet`.

Run: `pnpm --filter @ultimate/ng test` — Expected: all pass. The `button`/`paginator`/`table` specs locate `<style>` elements by selector in the global document, which is still where browser-platform tests write.

Run: `pnpm --filter @ultimate/themes test` — Expected: all pass (`cross-framework-consistency.test.ts`).

- [ ] **Step 5: Typecheck and commit**

Run: `pnpm --filter @ultimate/ng-core run typecheck` — Expected: no errors.

```bash
git add packages/ng-core/src/basecomponent/style-sheet.ts packages/ng-core/src/basecomponent/base-component.ts packages/ng-core/src/basecomponent/style-sheet.spec.ts packages/ng-core/src/basecomponent/base-component.spec.ts
git commit -m "feat(ng-core): register component styles per document with hydration adoption (GAP-078)"
```

---

### Task 2: SSR verification and the React/Vue client-only contract

**Files:**

- Modify: `apps/playground-angular/e2e/ssr-hydration.spec.ts` (header comment + one new `test.describe`)
- Create: `packages/react-core/src/styling/ssr-contract.spec.tsx`
- Create: `packages/vue-core/src/styling/ssr-contract.spec.ts`
- Modify: `packages/react-core/README.md`, `packages/vue-core/README.md` (add a short "Server rendering and styles" section)

**Interfaces:**

- Consumes: Task 1's `data-u-style` key attribute; `reactCoreStyleSheet` (`packages/react-core/src/styling/react-style-sheet.ts`), `useComponentStyle`; `vueCoreStyleSheet`, `createBaseComponent` from `@ultimate/vue-core`.
- Produces: nothing used by later tasks.

- [ ] **Step 1: Find the proof page's Angular components and their style keys**

Read `apps/playground-angular/src/app/proof-page.component.ts` and list the `UBaseComponent`-based components it renders. Each component's `componentName` (e.g. `button`, `checkbox`) is its style key, and theme variables use `u-common-variables` and `<componentName>-variables` (`packages/uix-styled/src/stylesheet/theme-variables.ts:9,54`). Use two real keys from that page in Step 2: `u-common-variables` and the first component's name.

- [ ] **Step 2: Write the Angular SSR assertions**

In `ssr-hydration.spec.ts`, replace the header sentence that says no `<style>` presence is asserted with: "GAP-078: the last describe block asserts that server HTML carries keyed `<style data-u-style>` elements and that hydration adopts them (each key once)." Append (using the file's existing `HARNESS_URL`, `captureUnexpectedErrors` and hydration wait; copy the wait exactly from an existing test):

```ts
test.describe("GAP-078 server-rendered styles", () => {
  test("server HTML contains keyed theme and component styles, adopted once after hydration", async ({
    page,
  }) => {
    const errors = captureUnexpectedErrors(page);
    const response = await page.request.get(HARNESS_URL);
    const body = await response.text();
    expect(body).toContain('data-u-style="u-common-variables"');
    expect(body).toContain('data-u-style="COMPONENT_KEY"');

    await page.goto(HARNESS_URL);
    // Same hydration-complete wait as the other tests in this file.
    await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");

    const counts = await page.evaluate(() => {
      const c: Record<string, number> = {};
      for (const el of Array.from(document.querySelectorAll("style[data-u-style]"))) {
        const k = el.getAttribute("data-u-style")!;
        c[k] = (c[k] ?? 0) + 1;
      }
      return c;
    });
    expect(Object.keys(counts).length).toBeGreaterThan(1);
    for (const [key, n] of Object.entries(counts)) expect(n, key).toBe(1);
    expect(errors).toEqual([]);
  });
});
```

Replace `COMPONENT_KEY` with the real component key from Step 1. If the file's existing tests check errors through a helper rather than `expect(errors).toEqual([])`, use that helper instead.

- [ ] **Step 3: Write the React and Vue server-contract tests**

Create `packages/react-core/src/styling/ssr-contract.spec.tsx`:

```tsx
// @vitest-environment node
import * as React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { useComponentStyle } from "./use-component-style";
import { reactCoreStyleSheet } from "./react-style-sheet";

function Probe() {
  useComponentStyle("ssr-contract-probe", { css: ".ssr-contract-probe{color:red}", classes: {} });
  return <span className="ssr-contract-probe">x</span>;
}

describe("React styling server contract (GAP-078)", () => {
  it("server render emits no <style> and registers nothing (client-only injection)", () => {
    expect(typeof document).toBe("undefined");
    const html = renderToString(<Probe />);
    expect(html).not.toContain("<style");
    expect(reactCoreStyleSheet.has("ssr-contract-probe")).toBe(false);
  });
});
```

Create `packages/vue-core/src/styling/ssr-contract.spec.ts`:

```ts
// @vitest-environment node
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";
import { createBaseComponent } from "../base/base-component";
import { vueCoreStyleSheet } from "./vue-style-sheet";

describe("Vue styling server contract (GAP-078)", () => {
  it("server render emits no <style> and registers nothing (client-only injection)", async () => {
    expect(typeof document).toBe("undefined");
    const Probe = {
      extends: createBaseComponent({
        componentName: "ssr-contract-probe",
        styleModule: { css: ".ssr-contract-probe{color:red}", classes: {} },
      }),
      render: () => h("span", { class: "ssr-contract-probe" }, "x"),
    };
    const html = await renderToString(createSSRApp(Probe));
    expect(html).not.toContain("<style");
    expect(vueCoreStyleSheet.has("ssr-contract-probe")).toBe(false);
  });
});
```

Before running, confirm the exact import paths and `StyleModule` shapes by reading `packages/react-core/src/styling/use-component-style.ts`, `packages/react-core/src/base/component-base.ts`, `packages/vue-core/src/base/base-component.ts` and `packages/vue-core/src/styling/vue-style-sheet.ts`. Fix the imports to the real paths, and do not change those source files. If `react-dom/server` or `vue/server-renderer` is not resolvable from the package, add nothing. Instead report it in the task report, because both are already dependencies of the SSR playgrounds and may need to be dev dependencies here; that would be a manifest change that needs a ruling.

- [ ] **Step 4: Write the contract note**

Add to both `packages/react-core/README.md` and `packages/vue-core/README.md`, near their existing styling/StyleSheet section:

```markdown
### Server rendering and styles

Component styles are injected on the client only: they are registered on
first mount into the document `<head>`. Server-rendered HTML therefore
contains no component CSS, and markup is unstyled until hydration
(accepted; matches PrimeReact 10.9.9 / PrimeVue 4.5.5). Angular
(`@ultimate/ng-core`) differs: it writes styles into the per-request
document during server rendering and adopts them on hydration (GAP-078).
```

(For the Vue README, replace "PrimeReact 10.9.9" with "PrimeVue 4.5.5" only.)

- [ ] **Step 5: Run the checks**

Run: `pnpm --filter @ultimate/react-core test` and `pnpm --filter @ultimate/vue-core test` — Expected: all pass, including the new server-contract tests.

Run (Node 20): `pnpm --filter-prod "playground-angular..." run build`, then `TRACK_E_SSR_FRAMEWORK=ng npx playwright test --project=ng-ssr-chromium`. Expected: all pass, including the new GAP-078 test. Before Task 1 this test would fail on the `data-u-style` body check.

- [ ] **Step 6: Commit**

```bash
git add apps/playground-angular/e2e/ssr-hydration.spec.ts packages/react-core/src/styling/ssr-contract.spec.tsx packages/vue-core/src/styling/ssr-contract.spec.ts packages/react-core/README.md packages/vue-core/README.md
git commit -m "test(ssr): verify Angular server styles and document the React/Vue client-only contract (GAP-078)"
```

---

## Family B — GAP-074 (shared `u-hidden-accessible`)

### Task 3: Shared rule and registration in all three cores

**Files:**

- Create: `packages/uix-styled/src/stylesheet/hidden-accessible.ts`
- Modify: `packages/uix-styled/src/index.ts:19` (add one export line)
- Modify: `packages/ng-core/src/basecomponent/base-component.ts` (`ngOnInit`, after `registerThemeVariables`)
- Modify: `packages/react-core/src/styling/use-component-style.ts` (inside `useMountEffect`, before `registerThemeVariables`)
- Modify: `packages/vue-core/src/styling/vue-style-sheet.ts` (`registerComponentStyle`, first line)
- Test: `packages/uix-styled/test/hidden-accessible.test.ts` (create); one new test in each of `packages/ng-core/src/basecomponent/base-component.spec.ts`, `packages/react-core/src/styling/` (existing styling spec, or new `hidden-accessible.spec.tsx`), `packages/vue-core/src/styling/` (existing styling spec, or new `hidden-accessible.spec.ts`)

**Interfaces:**

- Consumes: Task 1's `ngCoreStyleSheetFor(this.document)` in `UBaseComponent.ngOnInit`; `reactCoreStyleSheet`; `vueCoreStyleSheet`.
- Produces: `export const HIDDEN_ACCESSIBLE_KEY = "u-hidden-accessible"`, `export const hiddenAccessibleCss: string`, and `export function registerHiddenAccessible(sheet: StyleSheet<any>): void` from `@ultimate/uix-styled`.

- [ ] **Step 1: Write the failing tests**

Create `packages/uix-styled/test/hidden-accessible.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import {
  StyleSheet,
  HIDDEN_ACCESSIBLE_KEY,
  hiddenAccessibleCss,
  registerHiddenAccessible,
} from "../src/index";

describe("registerHiddenAccessible (GAP-074)", () => {
  it("adds the shared rule once under the reserved key", () => {
    const sheet = new StyleSheet();
    const add = vi.spyOn(sheet, "add");
    registerHiddenAccessible(sheet);
    registerHiddenAccessible(sheet);
    expect(add).toHaveBeenCalledTimes(1);
    expect(add).toHaveBeenCalledWith(HIDDEN_ACCESSIBLE_KEY, hiddenAccessibleCss);
    expect(sheet.has(HIDDEN_ACCESSIBLE_KEY)).toBe(true);
  });

  it("is PrimeNG 21.1.9's .p-hidden-accessible rule renamed to u-, with no u-hidden-focusable rule", () => {
    for (const decl of [
      "border: 0",
      "clip: rect(0 0 0 0)",
      "height: 1px",
      "margin: -1px",
      "overflow: hidden",
      "padding: 0",
      "position: absolute",
      "width: 1px",
      "transform: scale(0)",
    ]) {
      expect(hiddenAccessibleCss).toContain(decl);
    }
    expect(hiddenAccessibleCss).toContain(".u-hidden-accessible input");
    expect(hiddenAccessibleCss).not.toContain("p-hidden-accessible");
    expect(hiddenAccessibleCss).not.toContain("hidden-focusable");
  });
});
```

Add one test per core (match each existing spec's setup):

```ts
// ng-core base-component.spec.ts — no theme is applied in this spec file by default
it("registers the shared u-hidden-accessible rule into the component's document (GAP-074)", () => {
  // create the file's existing test component and run detectChanges (as in the other tests)
  const fixture = TestBed.createComponent(TestComponent);
  fixture.detectChanges();
  expect(
    Array.from(document.head.querySelectorAll("style")).filter(
      (s) => s.getAttribute("data-u-style") === "u-hidden-accessible"
    )
  ).toHaveLength(1);
});
```

```tsx
// react-core: render any component that calls useComponentStyle (or a probe like Task 2's) with @testing-library/react
it("registers the shared u-hidden-accessible rule on first mount, once, without a theme (GAP-074)", () => {
  render(<Probe />);
  render(<Probe />);
  expect(reactCoreStyleSheet.has("u-hidden-accessible")).toBe(true);
  expect(
    Array.from(document.head.querySelectorAll("style")).filter((s) =>
      (s.textContent ?? "").includes(".u-hidden-accessible {")
    )
  ).toHaveLength(1);
});
```

```ts
// vue-core: mount any createBaseComponent-based probe twice with @vue/test-utils
it("registers the shared u-hidden-accessible rule on mount, once, without a theme (GAP-074)", () => {
  mount(Probe);
  mount(Probe);
  expect(vueCoreStyleSheet.has("u-hidden-accessible")).toBe(true);
  expect(document.head.querySelectorAll('style[data-u-style="u-hidden-accessible"]')).toHaveLength(
    1
  );
});
```

If a spec file applies a theme in a `beforeAll`, put the "without a theme" test in a new spec file that does not, so the no-theme case is really exercised.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter @ultimate/uix-styled test`, `pnpm --filter @ultimate/ng-core test`, `pnpm --filter @ultimate/react-core test`, `pnpm --filter @ultimate/vue-core test`
Expected: the new tests fail (export missing / rule not registered).

- [ ] **Step 3: Implement**

Create `packages/uix-styled/src/stylesheet/hidden-accessible.ts`:

```ts
import type StyleSheet from "./index";

/** Reserved style key for the shared hidden-accessible utility (GAP-074). */
export const HIDDEN_ACCESSIBLE_KEY = "u-hidden-accessible";

/**
 * PrimeNG 21.1.9 `base/style/basestyle.ts:8-22` `.p-hidden-accessible`
 * rule and its form-control companion, renamed to Ultimate's `u-` prefix.
 * `u-hidden-focusable` is deliberately NOT styled: as in Prime it is only a
 * selector marker.
 */
export const hiddenAccessibleCss = `
.u-hidden-accessible {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
}

.u-hidden-accessible input,
.u-hidden-accessible select {
    transform: scale(0);
}
`;

/**
 * Registers the shared hidden-accessible rule into `sheet` once. Purpose-
 * specific: each core calls it from its existing style-registration point,
 * so the rule lands wherever that core already writes styles (per document
 * in Angular, GAP-078). Not a general registration API.
 */
export function registerHiddenAccessible(sheet: StyleSheet<any>): void {
  if (!sheet.has(HIDDEN_ACCESSIBLE_KEY)) {
    sheet.add(HIDDEN_ACCESSIBLE_KEY, hiddenAccessibleCss);
  }
}
```

Before writing, open `.vendor-cache/primeng-21.1.9.tar.gz` → `packages/primeng/src/base/style/basestyle.ts` and confirm the declarations match lines 8-22 exactly. If they differ, copy PrimeNG's declarations, keep the `u-` rename, and note it in the report.

In `packages/uix-styled/src/index.ts`, after the `registerThemeVariables` export line, add:

```ts
export {
  HIDDEN_ACCESSIBLE_KEY,
  hiddenAccessibleCss,
  registerHiddenAccessible,
} from "./stylesheet/hidden-accessible";
```

In `packages/ng-core/src/basecomponent/base-component.ts`, import `registerHiddenAccessible` from `@ultimate/uix-styled` and call `registerHiddenAccessible(sheet);` right after `registerThemeVariables(sheet, this.componentName);`.

In `packages/react-core/src/styling/use-component-style.ts`, import it and call `registerHiddenAccessible(reactCoreStyleSheet);` as the first line inside `useMountEffect`.

In `packages/vue-core/src/styling/vue-style-sheet.ts`, import it and call `registerHiddenAccessible(vueCoreStyleSheet);` as the first line of `registerComponentStyle`.

These are the only four source changes: one helper module, one export line, and one call per core.

- [ ] **Step 4: Run the tests to verify they pass**

Run the four package suites from Step 2, plus `pnpm --filter @ultimate/ng test`, `pnpm --filter @ultimate/react test`, `pnpm --filter @ultimate/vue test` and `pnpm --filter @ultimate/themes test`. Expected: all pass. The Vue suite has one known load-dependent flake (`table.spec.ts > package export > is exported from the package root`); if only that fails, re-run it in isolation and report both results.

Angular server HTML (Spec §8, GAP-074 row): in `apps/playground-angular/e2e/ssr-hydration.spec.ts`, add one line to Task 2's GAP-078 test right after its `COMPONENT_KEY` body assertion: `expect(body).toContain('data-u-style="u-hidden-accessible"');`. Then run (Node 20) `pnpm --filter-prod "playground-angular..." run build` and `TRACK_E_SSR_FRAMEWORK=ng npx playwright test --project=ng-ssr-chromium`. Expected: pass. The test's adoption check then also proves the shared rule is server-rendered and adopted once.

- [ ] **Step 5: Typecheck and commit**

Run: `pnpm --filter @ultimate/uix-styled run typecheck`, and the same for `ng-core`, `react-core` and `vue-core`. Expected: no errors.

```bash
git add packages/uix-styled/src/stylesheet/hidden-accessible.ts packages/uix-styled/src/index.ts packages/uix-styled/test/hidden-accessible.test.ts packages/ng-core/src/basecomponent/base-component.ts packages/ng-core/src/basecomponent/base-component.spec.ts packages/react-core/src/styling/use-component-style.ts packages/vue-core/src/styling/vue-style-sheet.ts
git commit -m "feat(uix-styled): add shared u-hidden-accessible rule registered by each core (GAP-074)"
```

Before running the commit above, also stage (by literal path) the react-core and vue-core spec files you edited or created in Step 1, and `apps/playground-angular/e2e/ssr-hydration.spec.ts` (edited in Step 4).

---

### Task 4: Migrate usages and verify in a real browser

**Files:**

- Modify: `packages/ng/src/rating/rating.ts:45` (`p-hidden-accessible` → `u-hidden-accessible`)
- Modify: `packages/vue/src/rating/Rating.vue:9` (same)
- Modify: `packages/vue/src/password/password-style.ts:76-89` (remove the local rule and its comment) and `:129` (remove `hiddenAccessible` class mapping)
- Modify: `packages/vue/src/password/Password.vue:65` (`:class="cx('hiddenAccessible')"` → `class="u-hidden-accessible"`)
- Modify: `packages/vue/src/password/password.spec.ts:112,118,131` (assertions)
- Test: `packages/ng/src/rating/rating.spec.ts`, `packages/vue/src/rating/rating.spec.ts` (add assertions)
- Create: `packages/vue/e2e/hidden-accessible.spec.ts`

**Interfaces:**

- Consumes: Task 3's registered `u-hidden-accessible` rule.
- Produces: nothing used by later tasks.

- [ ] **Step 1: Write the failing tests**

Add to `packages/ng/src/rating/rating.spec.ts` (inside its main `describe`, using its existing fixture setup):

```ts
it("wraps each star's radio input in the shared u-hidden-accessible class (GAP-074)", () => {
  const host: HTMLElement = fixture.nativeElement;
  expect(host.querySelectorAll(".u-hidden-accessible input[type=radio]").length).toBeGreaterThan(0);
  expect(host.querySelector(".p-hidden-accessible")).toBeNull();
});
```

Add the equivalent to `packages/vue/src/rating/rating.spec.ts` (`wrapper.findAll(".u-hidden-accessible input[type=radio]").length > 0` and `wrapper.find(".p-hidden-accessible").exists() === false`).

In `packages/vue/src/password/password.spec.ts`:

- change line 112's and 118's selector `span.u-password-hidden-accessible` to `span.u-hidden-accessible`;
- replace the line-131 assertion (`expect(css).toContain(".u-password-hidden-accessible {")`) with `expect(css).not.toContain("u-password-hidden-accessible");`.

Create `packages/vue/e2e/hidden-accessible.spec.ts`:

```ts
import { expect, test } from "@playwright/test";
import { storyUrl } from "./accessibility-envelope";

/**
 * GAP-074 real-browser check: an element in the shared u-hidden-accessible
 * wrapper is visually hidden (1x1, clipped) but still in the accessibility
 * tree. Uses the existing Vue Rating story. No screenshots.
 */
test("Rating's hidden radio inputs are visually hidden but exposed to assistive tech", async ({
  page,
}) => {
  await page.goto(storyUrl("vue-rating--default"));
  const wrapper = page.locator(".u-hidden-accessible").first();
  await expect(wrapper).toBeAttached();
  const box = await wrapper.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeLessThanOrEqual(1);
  expect(box!.height).toBeLessThanOrEqual(1);
  expect(await wrapper.evaluate((el) => getComputedStyle(el).position)).toBe("absolute");
  await expect(page.getByRole("radio").first()).toBeAttached();
});
```

Confirm the Vue Rating story ID in `packages/vue/src/rating/rating.stories.ts`, or `http://localhost:6003/index.json` while the Vue Storybook runs, and use the real ID.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter @ultimate/ng test` and `pnpm --filter @ultimate/vue test`. Expected: the new Rating tests and the updated Password assertions fail.

- [ ] **Step 3: Implement**

- `packages/ng/src/rating/rating.ts:45`: `<span class="p-hidden-accessible">` → `<span class="u-hidden-accessible">`.
- `packages/vue/src/rating/Rating.vue:9`: same change.
- `packages/vue/src/password/password-style.ts`: delete the comment and the `.u-password-hidden-accessible { ... }` block (lines 76-89 as of `cdcc65e`) and the `hiddenAccessible: "u-password-hidden-accessible",` entry (line 129).
- `packages/vue/src/password/Password.vue:65`: `<span :class="cx('hiddenAccessible')" aria-live="polite">` → `<span class="u-hidden-accessible" aria-live="polite">`.

Do not change React TriStateCheckbox or either focus trap; they already use `u-hidden-accessible`.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm --filter @ultimate/ng test`, `pnpm --filter @ultimate/vue test`, `pnpm --filter @ultimate/react test`. Expected: all pass (known Vue flake handling as in Task 3).

Run: `npx playwright test --project=vue-chromium --project=vue-firefox --project=vue-webkit packages/vue/e2e/hidden-accessible.spec.ts`. Expected: pass in all three. The Playwright config starts the Storybooks; if a cold Angular Storybook start exceeds the 120 s webServer timeout, pre-start the Storybooks and rerun.

Run the existing visual baselines for the touched components and the components that contain focus traps: `npx playwright test --project=ng-chromium --project=react-chromium --project=vue-chromium --grep "visual regression"`. Expected: pass. If a baseline changes because a previously visible sentinel or input is now hidden, stop and report the exact snapshots in the task report; do not update baselines in this task.

Verify no source still uses the Prime class: `git grep -n "p-hidden-accessible" -- 'packages/*/src/*'` returns only the PrimeNG-source citation comment in `hidden-accessible.ts`, if you kept one.

- [ ] **Step 5: Commit**

```bash
git add packages/ng/src/rating/rating.ts packages/ng/src/rating/rating.spec.ts packages/vue/src/rating/Rating.vue packages/vue/src/rating/rating.spec.ts packages/vue/src/password/password-style.ts packages/vue/src/password/Password.vue packages/vue/src/password/password.spec.ts packages/vue/e2e/hidden-accessible.spec.ts
git commit -m "refactor: move Rating and Vue Password to the shared u-hidden-accessible class (GAP-074)"
```

---

## Family C — GAP-081 (Angular barrel re-exports, Option 1)

### Task 5: Development-only path mapping and build-isolation baseline

**Files:**

- Modify: `packages/ng/tsconfig.json` (add `baseUrl` + `paths`)
- Record: `.superpowers/sdd/2026-10-03-prime-parity-approved-designs/` ledger and the task report

**Interfaces:**

- Consumes: nothing from earlier tasks.
- Produces: the mapping `"@ultimate/ng/*": ["src/*/index.ts"]` in `packages/ng/tsconfig.json`, used by Task 6. Also a recorded hash of the `dist` tree built with and without the mapping at this commit.

- [ ] **Step 1: Add the mapping**

In `packages/ng/tsconfig.json`, add to `compilerOptions`:

```json
    "baseUrl": ".",
    "paths": {
      "@ultimate/ng/*": ["src/*/index.ts"]
    }
```

Keep every other option. `tsconfig.spec.json` and `tsconfig.storybook.json` extend this file, so they inherit it. Do not add the mapping to `ng-package.json` or anywhere `ng-packagr` reads.

- [ ] **Step 2: Prove `ng-packagr` does not read `packages/ng/tsconfig.json`**

Record in the report:

- the `build` script (`packages/ng/package.json`: `ng-packagr -p ng-package.json`, no `-c`);
- the `ng-packagr` source lines showing that without `-c` it reads its bundled `tsconfig.ngc.json`: `node_modules/.pnpm/ng-packagr@21.2.7*/node_modules/ng-packagr/src/lib/ts/tsconfig.js:45-82`.

Then build twice at this commit and compare:

```bash
export PATH="$HOME/.nvm/versions/node/v20.19.2/bin:$PATH"
pnpm --filter-prod "@ultimate/ng^..." run build
pnpm --filter @ultimate/ng run build
(cd packages/ng/dist && find . -type f -print0 | sort -z | xargs -0 shasum -a 256) | shasum -a 256 | tee /tmp/claude-501/gap081-with-mapping.txt
git stash push -m "gap081-mapping-probe" -- packages/ng/tsconfig.json
pnpm --filter @ultimate/ng run build
(cd packages/ng/dist && find . -type f -print0 | sort -z | xargs -0 shasum -a 256) | shasum -a 256 | tee /tmp/claude-501/gap081-without-mapping.txt
git stash list --format='%H %gs'
```

Then restore the mapping with `git stash apply <that stash's SHA>` and drop that one entry by its SHA (never a bare `git stash pop`). Also confirm `git diff packages/ng/tsconfig.json` shows the mapping again. Expected: the two hashes are identical, which proves the mapping does not affect the build. (Alternatively, do the without-mapping build in a scratch worktree at this commit with the mapping removed, and avoid the stash entirely.)

- [ ] **Step 3: Typecheck and tests with the mapping (no source change yet)**

Run: `pnpm --filter @ultimate/ng run typecheck` and `pnpm --filter @ultimate/ng test`. Expected: both pass; the mapping alone changes no behavior.

- [ ] **Step 4: Commit**

```bash
git add packages/ng/tsconfig.json
git commit -m "build(ng): add development-only @ultimate/ng/* path mapping (GAP-081)"
```

---

### Task 6: Barrel re-exports and internal imports by package specifier

**Files:**

- Modify: `packages/ng/src/index.ts` (69 export lines)
- Modify: the 11 files with the 13 cross-directory imports: `packages/ng/src/{button/button.ts, menu/menu.ts, input-text/input-text.ts, textarea/textarea.ts, overlay-badge/overlay-badge.ts, select-button/select-button.ts, table/table.ts, data-view/data-view.ts, order-list/order-list.ts, pick-list/pick-list.ts, file-upload/file-upload.ts}`
- Tooling (scratch, not committed): `.superpowers/sdd/post-closeout/spike-081/{rewrite_barrel.py,rewrite_internal.py,dupes.py,identity-probe.mjs}` (from the approved spike)

**Interfaces:**

- Consumes: Task 5's mapping.
- Produces: the final Option 1 packaging.

- [ ] **Step 1: Capture the "before" measurements**

With Task 5's build in `packages/ng/dist`, run `python3 .superpowers/sdd/post-closeout/spike-081/dupes.py packages/ng/dist` and record the output. Expected: about 86 primary classes duplicated in subpaths.

Copy `.superpowers/sdd/post-closeout/spike-081/identity-probe.mjs` to `apps/playground-angular/identity-probe.mjs` (scratch only; never stage it). Run it with Node 20 from `apps/playground-angular`, record the output, and delete the copy. Expected: 0/6 identical, with `NG0912` warnings.

- [ ] **Step 2: Rewrite the barrel and the 13 imports**

The spike scripts change the working tree of a fixed path, so adapt them or edit by hand:

- **Barrel:** in `packages/ng/src/index.ts`, every `export * from "./<dir>";` whose `<dir>` is a secondary entry (a `packages/ng/<entry>/ng-package.json` whose `entryFile` is `../src/<dir>/index.ts`) becomes `export * from "@ultimate/ng/<entry>";`. That is 69 lines. The 19 others stay relative.
- **Imports:** the 13 imports of `../badge`, `../fluid`, `../listbox`, `../paginator`, `../progress-bar`, `../ripple`, `../scroller`, `../toggle-button`, `../tooltip` (any `/<file>` suffix) in the 11 files become `@ultimate/ng/<entry>`. Each named import must already be exported from that entry's `index.ts`; check each one, and if a symbol is missing from the entry index, stop and report.

Verify the counts:

```bash
grep -c '@ultimate/ng/' packages/ng/src/index.ts        # expect 69
grep -c 'export \* from "\./' packages/ng/src/index.ts  # expect 19
git grep -nE 'from "\.\./(badge|fluid|listbox|paginator|progress-bar|ripple|scroller|toggle-button|tooltip)' -- 'packages/ng/src/*.ts' ':!*.spec.*' ':!*.stories.*' | wc -l   # expect 0
```

- [ ] **Step 3: Typecheck before build, then build**

Remove `packages/ng/dist` first, so typecheck cannot fall back on built files. Use `git clean -fdX -- packages/ng/dist` on the ignored directory only, after checking that nothing else is listed by `git clean -ndX -- packages/ng/dist`. Then:

```bash
pnpm --filter @ultimate/ng run typecheck     # must pass with NO dist present
pnpm --filter @ultimate/ng run build
```

Expected: both succeed.

- [ ] **Step 4: Verify duplicates, identity, integrity and build isolation**

- `python3 .superpowers/sdd/post-closeout/spike-081/dupes.py packages/ng/dist`: expected 0 primary classes duplicated in a subpath, and 69 subpath imports in the primary bundle.
- Identity probe (scratch copy as in Step 1): expected 6/6 identical and no `NG0912` output.
- `pnpm run integrity:pack-install -- @ultimate/ng`: expected OK.
- `git diff cdcc65e -- packages/ng/package.json`: expected no change (the `exports` map is unchanged).
- Barrel export set unchanged: compare the sorted export names of `dist/types/ultimate-ng.d.ts` before (Task 5 build) and after. Expected identical, with `UInputNumber` still absent from the barrel.
- **Build isolation:** hash `packages/ng/dist` (Task 5 Step 2 command, file `/tmp/claude-501/gap081-final-with-mapping.txt`). Then rebuild with the mapping removed (stash-by-SHA or scratch worktree, as in Task 5) and hash again to `/tmp/claude-501/gap081-final-without-mapping.txt`. Expected: identical. The only difference from the Task 5 baseline comes from this task's source changes.

- [ ] **Step 5: Tests and Storybook**

Run: `pnpm --filter @ultimate/ng test`, `pnpm --filter @ultimate/ng-core test`. Expected: all pass.

Run: `pnpm --filter @ultimate/ng run build-storybook`. Expected: success (the Storybook config extends `tsconfig.json` and so has the mapping).

Run (Node 20): `pnpm --filter-prod "playground-angular..." run build`, then `TRACK_E_SSR_FRAMEWORK=ng npx playwright test --project=ng-ssr-chromium`. Expected: pass, which shows the consumer app builds against the re-exporting barrel.

Run: `npx playwright test --project=ng-chromium`. Expected: pass, including visual baselines (no rendering change is expected).

- [ ] **Step 6: Commit**

```bash
git add packages/ng/src/index.ts packages/ng/src/button/button.ts packages/ng/src/menu/menu.ts packages/ng/src/input-text/input-text.ts packages/ng/src/textarea/textarea.ts packages/ng/src/overlay-badge/overlay-badge.ts packages/ng/src/select-button/select-button.ts packages/ng/src/table/table.ts packages/ng/src/data-view/data-view.ts packages/ng/src/order-list/order-list.ts packages/ng/src/pick-list/pick-list.ts packages/ng/src/file-upload/file-upload.ts
git commit -m "build(ng): re-export secondary entries from the barrel by package specifier (GAP-081)"
```

Record in the task report every measurement from Steps 1 and 4, before and after, so the final review can see the evidence without rebuilding.
