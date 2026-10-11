# GAP-124 Loading Spinner Motion and Contrast Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Status:** Revision 4 for final approval. Revision 4 replaces the Task 8 contrast measurement with the coverage-based method of Spec revision 4 §10 (B-AC7, KL-4). Amendment A1 is approved and folded into the Spec. Revision 2 corrected the React file boundary (R-AC4) and the Task 4 diff-check order; revision 3 updated the Spec reference. Execution method: `superpowers:subagent-driven-development` (user, 2026-10-11). Not committed. Nothing in this plan is authorized until the user gives final approval.

**Goal:** Make Angular and Vue loading spinners rotate, stop under reduced motion (item A), and give the DataView loading icon ≥ 3:1 non-text contrast over declared surfaces (item B), without changing React-only documents.

**Architecture:**

- **Item A:** one class-scoped CSS rule (`.u-icon-spin` plus keyframes plus a reduced-motion stop), registered by a new `registerIconSpin(sheet)` helper in `@ultimate/uix-styled` from the same Angular and Vue registration points that already call `registerHiddenAccessible` (GAP-074 pattern).
- **Item B:** one DataView-only rule, `color: dt('text.hover.color')` on the loading `<svg>`, added through the G3-E style generator and regenerated into both DataView style modules.
- **Rollback:** A and B land in separate commits on one feature branch.

**Tech Stack:** TypeScript, Angular 20 (`ng test`/Vitest), Vue 3 (Vitest), React (Vitest), Playwright 1.63 against Storybook, `@ultimate/uix-styled` StyleSheet, Docker image `mcr.microsoft.com/playwright:v1.63.0-jammy` for baselines.

**Spec:** `docs/superpowers/specs/2026-10-11-gap-124-loading-spinner-design.md` (revision 4: SR-1..SR-3 outcomes, Amendment A1 folded into the body, React file boundary clarified, coverage-based contrast measurement §10). **Research input:** `docs/architecture/research/2026-10-11-gap-124-research-proposal.md` (revision 3).

## Global Constraints

- **Rule CSS:**
  - The rule CSS is exactly Spec §5.1.
  - Its only selector is `.u-icon-spin`.
  - The helper is never appended to `hiddenAccessibleCss`.
- **`registerIconSpin` call sites:** called from `ng-core` `UBaseComponent.ngOnInit` and `vue-core` `registerComponentStyle` only. **Never from `react-core`.**
- **Item B:** the DataView icon color is `dt('text.hover.color')`, scoped to `.u-data-view > [role="status"] svg`. It is added in `g3e-port.mjs` `RETAINED`, with the SR-1 comment, and never hand-edited into generated modules.
- **Off limits:**
  - `mask.*` tokens, the Aura preset or fixtures, `@ultimate/uix-styles/base`;
  - GAP-098 and its ruling;
  - React production source (`packages/react/src/**`, `packages/react-core/src/**`, excluding `*.spec.ts(x)`), production styles, or visual baselines. The only React-related additions allowed are the two GAP-124 test files and their `react.json` provenance entries (Spec §5.3, R-AC4);
  - GAP statuses (GAP-124 and GAP-064 stay PARTIAL);
  - the BAE document and worktree.
- **Allowed changes:**
  - DOM and accessibility: none to markup, `role="status"`, the hidden "Loading" text, `aria-busy`, or `aria-hidden`;
  - new dependencies: none (PNG decoding is done in the browser through canvas).
- **Contrast thresholds:**
  - **Required conditions:** C-L1..C-L5 and C-D1..C-D5 are each asserted at layer L1 ≥ 3:1. L1 is the minimum over every fully covered icon pixel (`W − K ≥ 254` on every channel) against every adjacent mask pixel, at device scale 4.
  - **Tolerance:** every L1 value is within ±0.10 of Spec §6.4.
  - **Not covered:** N-L1..N-L3 are annotated, with the tolerance check only.
  - **Negative control:** asserts < 3 (2.31 ± 0.10) in C-L1.
  - **Validity guards (B-AC7):** these fail closed.
  - **Layer L2:** the rendered anti-aliased contrast is reported only.
- **Stop rules:**
  - Any R-AC check fails: stop and return the React scope question to the user.
  - Any required contrast condition is below 3:1: stop and return the color decision to the user.
  - A baseline change outside Amendment A1-2: stop.
- **Commits:**
  - Conventional Commits; stage only named files; no `git add -A`.
  - End messages with the session's attribution lines.
- **Merge and push:** no merge to `main` and no push without separate user authorization.

## Review Focus

1. **Theme switch without reload.** Under `emulateMedia({ colorScheme: 'dark' })` the icon must resolve the dark `text.hover.color` (white), not the light one.
   - Pinned in Task 8: the cross-check asserts the computed color per scheme.
2. **Reduced motion toggled after load.** The rotation must stop when the preference changes on a live page, not only on first paint.
   - Pinned in Task 5: the reduced-motion test switches `emulateMedia` after `goto`.
3. **Consumer `loadingIcon` class override (Angular `loadingIcon` input).** The color rule must still apply, because it targets `[role="status"] svg`, not the class.
   - Pinned in Task 8: a test sets a custom `loadingIcon` class through the DOM and re-asserts the computed color.
4. **Second document (Angular SSR, GAP-078).** The spin rule must be in the server HTML once.
   - Pinned in Task 3: SSR assertion.
5. **React and Vue/Angular in one document (KL-2).** Accepted behavior, not a defect. A React-only Storybook page must show no rule.
   - Pinned in Task 4: R-AC3 also asserts that no `<style>` contains `@keyframes u-icon-spin`.

---

## File map

| File                                                                                                                            | Item    | Change                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------- |
| `packages/vue/src/data-view/data-view.stories.ts`                                                                               | fixture | Add `Loading` story (A1-1)                                                               |
| `packages/uix-styled/src/stylesheet/icon-spin.ts`                                                                               | A       | **Create**: key, CSS, `registerIconSpin`                                                 |
| `packages/uix-styled/src/index.ts`                                                                                              | A       | Export the three names                                                                   |
| `packages/uix-styled/test/icon-spin.test.ts`                                                                                    | A       | **Create**: unit tests (A-AC3)                                                           |
| `packages/ng-core/src/basecomponent/base-component.ts`                                                                          | A       | Call `registerIconSpin(sheet)`                                                           |
| `packages/ng-core/src/basecomponent/base-component.spec.ts`                                                                     | A       | Registration test (A-AC4)                                                                |
| `packages/vue-core/src/styling/vue-style-sheet.ts`                                                                              | A       | Call `registerIconSpin(vueCoreStyleSheet)`                                               |
| `packages/vue-core/src/styling/icon-spin.spec.ts`                                                                               | A       | **Create**: registration test (A-AC4)                                                    |
| `apps/playground-angular/e2e/ssr-hydration.spec.ts`                                                                             | A       | SSR key assertion (A-AC4)                                                                |
| `packages/react/src/button/gap-124-react-unchanged.spec.tsx`                                                                    | A       | **Create**: R-AC1                                                                        |
| `packages/react/e2e/gap-124-react-unchanged.spec.ts`                                                                            | A       | **Create**: R-AC3                                                                        |
| `packages/ng/e2e/gap-124-icon-spin.spec.ts`                                                                                     | A       | **Create**: A-AC1, A-AC2                                                                 |
| `packages/vue/e2e/gap-124-icon-spin.spec.ts`                                                                                    | A       | **Create**: A-AC1, A-AC2                                                                 |
| `packages/themes/test/utils/g3e-port.mjs`                                                                                       | B       | `DATAVIEW_LOADING_ICON` in `RETAINED` (both fws)                                         |
| `packages/ng/src/data-view/data-view-style.ts`                                                                                  | B       | Regenerated                                                                              |
| `packages/vue/src/data-view/data-view-style.ts`                                                                                 | B       | Regenerated                                                                              |
| `packages/ng/e2e/non-text-contrast.ts`                                                                                          | B       | **Create**: measurement helper                                                           |
| `packages/vue/e2e/non-text-contrast.ts`                                                                                         | B       | **Create**: identical helper (per-framework e2e pattern, as `accessibility-envelope.ts`) |
| `packages/ng/e2e/gap-124-contrast.spec.ts`                                                                                      | B       | **Create**: B-AC1, B-AC2, B-AC6                                                          |
| `packages/vue/e2e/gap-124-contrast.spec.ts`                                                                                     | B       | **Create**: same                                                                         |
| `packages/ng/e2e/g3e-aura-styles.spec.ts-snapshots/Ng-DataView-Loading-rest-G3-E-E-4-visual-1-ng-{chromium,firefox,webkit}.png` | B       | Updated after user review (A1-2)                                                         |
| `docs/architecture/provenance/{uix-styled,ng-core,vue-core,react,ng,vue}.json`                                                  | A/B     | Entries for new files                                                                    |
| `docs/architecture/MIGRATION.md`, `docs/architecture/PARITY_PLAYBOOK.md`                                                        | A/B     | One bullet set per item                                                                  |

**Workspace (git-ignored):** `.superpowers/sdd/2026-10-11-gap-124-loading-spinner/` holds `progress.md`, `docker/run.sh` and logs.

---

### Task 0: Branch and record the approved documents

**Files:**

- Commit: `docs/architecture/research/2026-10-11-gap-124-research-proposal.md`
- Commit: `docs/superpowers/specs/2026-10-11-gap-124-loading-spinner-design.md`
- Commit: `docs/superpowers/plans/2026-10-11-gap-124-loading-spinner.md`

- [ ] **Step 1: Confirm the starting state**

Run: `git status --short --branch && git rev-parse main origin/main`
Expected:

- `## main...origin/main`
- both SHAs equal (`b2bd892` or later);
- the only untracked files are the three GAP-124 documents and `docs/architecture/research/2026-10-09-bounded-autonomous-execution-design.md`, which is BAE: never stage it.

- [ ] **Step 2: Create the branch**

Run: `git switch -c feature/gap-124-loading-spinner`

- [ ] **Step 3: Commit the three documents only**

```bash
git add docs/architecture/research/2026-10-11-gap-124-research-proposal.md \
  docs/superpowers/specs/2026-10-11-gap-124-loading-spinner-design.md \
  docs/superpowers/plans/2026-10-11-gap-124-loading-spinner.md
git commit -m "docs(gap-124): record the loading-spinner research, Spec and Plan"
```

- [ ] **Step 4: Create the SDD workspace**

```bash
mkdir -p .superpowers/sdd/2026-10-11-gap-124-loading-spinner/docker
cp .superpowers/sdd/2026-10-08-gap-064-g3e-media-data/docker/run.sh .superpowers/sdd/2026-10-11-gap-124-loading-spinner/docker/run.sh
```

Then add one mode to the copied `run.sh` `case` block, before `esac`:

```bash
  gap124)
    npx playwright test $P --project=react-chromium --project=react-firefox --project=react-webkit gap-124 --retries=0 --reporter=list > /io/gap124-$2.log 2>&1; echo "gap124 $2 exit $?" ;;
```

Write `progress.md` with a line per task, and record `git rev-parse HEAD`.

---

### Task 1: Vue DataView `Loading` story (shared fixture, A1-1)

The story is its own commit, so reverting item A or item B never removes the other item's fixture.

**Files:**

- Modify: `packages/vue/src/data-view/data-view.stories.ts` (append after `Empty`)

- [ ] **Step 1: Add the story**

```ts
/**
 * GAP-124 test fixture: the loading overlay. PrimeVue 4.5.5 DataView renders no loading
 * state (G3E-7), so this story is not a parity case; only the GAP-124 specs use it.
 */
export const Loading: Story = {
  args: { value: [{ name: "Apple" }, { name: "Banana" }], itemTemplate, loading: true },
};
```

- [ ] **Step 2: Verify it renders the status region**

Run: `pnpm run storybook:vue`, then open `http://localhost:6003/iframe.html?id=data-dataview--loading&viewMode=story`.
Expected:

- `.u-data-view > [role="status"]` contains an `svg.u-icon-spin`, and the hidden text "Loading".

Stop Storybook afterwards.

- [ ] **Step 3: Confirm no other suite enumerates it**

Run: `grep -rn "data-dataview--loading" packages/vue/e2e tooling/prime-reference`
Expected: no match in `packages/vue/e2e`, and the only `tooling` match is the ng case (`story: { ng: ... }`).

- [ ] **Step 4: Commit**

```bash
git add packages/vue/src/data-view/data-view.stories.ts
git commit -m "test(gap-124): add the Vue DataView loading story as a GAP-124 fixture"
```

---

### Task 2: `registerIconSpin` in `@ultimate/uix-styled` (item A, A-AC3)

**Files:**

- Create: `packages/uix-styled/src/stylesheet/icon-spin.ts`
- Modify: `packages/uix-styled/src/index.ts` (after the `hidden-accessible` export block)
- Test: `packages/uix-styled/test/icon-spin.test.ts`
- Modify: `docs/architecture/provenance/uix-styled.json`

**Interfaces:**

- Produces: `ICON_SPIN_KEY: "u-icon-spin"`, `iconSpinCss: string`, `registerIconSpin(sheet: StyleSheet<any>): void`, all exported from `@ultimate/uix-styled`.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it, vi } from "vitest";
import {
  StyleSheet,
  ICON_SPIN_KEY,
  iconSpinCss,
  registerIconSpin,
  hiddenAccessibleCss,
} from "../src/index";

describe("registerIconSpin (GAP-124)", () => {
  it("adds the shared rule once under the reserved key", () => {
    const sheet = new StyleSheet();
    const add = vi.spyOn(sheet, "add");
    registerIconSpin(sheet);
    registerIconSpin(sheet);
    expect(add).toHaveBeenCalledTimes(1);
    expect(add).toHaveBeenCalledWith(ICON_SPIN_KEY, iconSpinCss);
    expect(ICON_SPIN_KEY).toBe("u-icon-spin");
  });

  it("is Prime's .p-icon-spin rule renamed to u-, plus an Ultimate reduced-motion stop", () => {
    expect(iconSpinCss).toContain("animation: u-icon-spin 2s infinite linear;");
    expect(iconSpinCss).toContain("transform: rotate(0deg);");
    expect(iconSpinCss).toContain("transform: rotate(359deg);");
    expect(iconSpinCss).toMatch(
      /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.u-icon-spin\s*\{\s*animation: none;\s*\}\s*\}/
    );
    expect(iconSpinCss).not.toContain("p-icon");
    expect(iconSpinCss).not.toContain("-webkit-");
  });

  it("selects only elements carrying .u-icon-spin", () => {
    const selectors = [...iconSpinCss.matchAll(/^\s*([^@{}\s][^{}]*?)\s*\{/gm)]
      .map((m) => m[1].trim())
      .filter((s) => !/^\d+%$/.test(s));
    expect(selectors).toEqual([".u-icon-spin", ".u-icon-spin"]);
  });

  it("is separate from the hidden-accessible rule", () => {
    expect(hiddenAccessibleCss).not.toContain("u-icon-spin");
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `pnpm --filter @ultimate/uix-styled test -- icon-spin`
Expected: FAIL, because `ICON_SPIN_KEY` / `registerIconSpin` is not exported.

- [ ] **Step 3: Implement**

`packages/uix-styled/src/stylesheet/icon-spin.ts`:

```ts
import type StyleSheet from "./index";

/** Reserved style key for the shared icon-spin rule (GAP-124). */
export const ICON_SPIN_KEY = "u-icon-spin";

/**
 * PrimeNG 21.1.9 `icons/baseicon/style/baseiconstyle.ts` and PrimeVue 4.5.5
 * `@primevue/icons` `baseicon/style/BaseIconStyle.js` `.p-icon-spin` rule,
 * renamed to Ultimate's `u-` prefix. The `-webkit-` duplicates are omitted;
 * the reduced-motion block is Ultimate-only (GAP-124 D-124-6). Only elements
 * that opt in with the class are matched (GAP-124 D-124-1).
 */
export const iconSpinCss = `
.u-icon-spin {
    animation: u-icon-spin 2s infinite linear;
}

@keyframes u-icon-spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(359deg);
    }
}

@media (prefers-reduced-motion: reduce) {
    .u-icon-spin {
        animation: none;
    }
}
`;

/**
 * Registers the shared icon-spin rule into `sheet` once. Called by the
 * Angular and Vue cores from their existing style-registration points;
 * deliberately not called by `react-core` (GAP-124 D-124-5).
 */
export function registerIconSpin(sheet: StyleSheet<any>): void {
  if (!sheet.has(ICON_SPIN_KEY)) {
    sheet.add(ICON_SPIN_KEY, iconSpinCss);
  }
}
```

In `packages/uix-styled/src/index.ts`, after the `hidden-accessible` export block, add:

```ts
export { ICON_SPIN_KEY, iconSpinCss, registerIconSpin } from "./stylesheet/icon-spin";
```

- [ ] **Step 4: Run it and confirm it passes**

Run: `pnpm --filter @ultimate/uix-styled test`
Expected: PASS, with the 4 new tests and every existing test green.

- [ ] **Step 5: Add the provenance entries**

Append both to `docs/architecture/provenance/uix-styled.json`:

```json
{
  "originalPath": "packages/primeng/src/icons/baseicon/style/baseiconstyle.ts",
  "ultimateDestination": "packages/uix-styled/src/stylesheet/icon-spin.ts",
  "modificationStatus": "adapted",
  "modificationDescription": "PrimeNG 21.1.9 baseiconstyle.ts `.p-icon-spin` rule and `p-icon-spin` keyframes (identical in PrimeVue 4.5.5 packages/icons/src/baseicon/style/BaseIconStyle.js), renamed to `u-icon-spin`; -webkit- duplicates omitted; `.p-icon` display rules not ported. Adds an Ultimate-authored prefers-reduced-motion stop (GAP-124 D-124-6), ICON_SPIN_KEY and registerIconSpin(), which the Angular and Vue cores call once per StyleSheet (GAP-124 D-124-4)."
},
{
  "originalPath": "n/a",
  "ultimateDestination": "packages/uix-styled/test/icon-spin.test.ts",
  "modificationStatus": "authored",
  "modificationDescription": "Ultimate-authored test, not derived from upstream. Verifies the icon-spin rule text, its single class selector, its reduced-motion stop and once-per-sheet registration (GAP-124)."
}
```

Run: `pnpm run provenance:validate -- --base-ref origin/main`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add packages/uix-styled/src/stylesheet/icon-spin.ts packages/uix-styled/src/index.ts \
  packages/uix-styled/test/icon-spin.test.ts docs/architecture/provenance/uix-styled.json
git commit -m "feat(uix-styled): add the shared class-scoped icon-spin rule (GAP-124 A)"
```

---

### Task 3: Register from the Angular and Vue cores (item A, A-AC4)

**Files:**

- Modify: `packages/ng-core/src/basecomponent/base-component.ts:4` (import) and `:58` (call)
- Modify: `packages/vue-core/src/styling/vue-style-sheet.ts:1-7` (import) and `:45` (call)
- Test: `packages/ng-core/src/basecomponent/base-component.spec.ts` (new `it` after line 67)
- Test: `packages/vue-core/src/styling/icon-spin.spec.ts` (create)
- Test: `apps/playground-angular/e2e/ssr-hydration.spec.ts` (GAP-078 block, after line 396)
- Modify: `docs/architecture/provenance/vue-core.json`

**Interfaces:**

- Consumes: `registerIconSpin`, `ICON_SPIN_KEY` from Task 2.

- [ ] **Step 1: Write the failing Angular test**

Add the following `it` to `packages/ng-core/src/basecomponent/base-component.spec.ts` inside `describe("UBaseComponent")`:

```ts
it("registers the shared u-icon-spin rule into the component's document, once (GAP-124)", () => {
  TestBed.createComponent(TestHostComponent).detectChanges();
  TestBed.createComponent(TestHostComponent).detectChanges();
  const spin = Array.from(document.head.querySelectorAll("style")).filter(
    (s) => s.getAttribute("data-u-ng-style") === "u-icon-spin"
  );
  expect(spin).toHaveLength(1);
  expect(spin[0].textContent).toContain("@keyframes u-icon-spin");
});
```

- [ ] **Step 2: Write the failing Vue test**

Create `packages/vue-core/src/styling/icon-spin.spec.ts`:

```ts
import { afterEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import { createBaseComponent } from "../base/base-component";
import { vueCoreStyleSheet } from "./vue-style-sheet";

const Probe = {
  extends: createBaseComponent({
    componentName: "icon-spin-probe",
    styleModule: { css: ".isp {}", classes: {} },
  }),
  render: () => h("span", { class: "isp" }, "x"),
};

describe("shared u-icon-spin rule (GAP-124)", () => {
  afterEach(() => {
    vueCoreStyleSheet.clear();
    document.head.querySelectorAll("style[data-u-style]").forEach((el) => el.remove());
  });

  it("registers the shared u-icon-spin rule on mount, once", () => {
    mount(Probe);
    mount(Probe);
    expect(vueCoreStyleSheet.has("u-icon-spin")).toBe(true);
    const styles = document.head.querySelectorAll('style[data-u-style="u-icon-spin"]');
    expect(styles).toHaveLength(1);
    expect(styles[0].textContent).toContain("@keyframes u-icon-spin");
  });
});
```

- [ ] **Step 3: Run both tests and confirm they fail**

Run: `pnpm --filter @ultimate/ng-core test` and `pnpm --filter @ultimate/vue-core test -- icon-spin`
Expected: both new tests FAIL (0 matching `<style>` elements); every other test passes.

- [ ] **Step 4: Implement the two call sites**

In `packages/ng-core/src/basecomponent/base-component.ts`, change line 4 to:

```ts
import {
  css,
  registerHiddenAccessible,
  registerIconSpin,
  registerThemeVariables,
} from "@ultimate/uix-styled";
```

and after `registerHiddenAccessible(sheet);` add:

```ts
// GAP-124: the opt-in `.u-icon-spin` rule (class-scoped; see uix-styled icon-spin.ts).
registerIconSpin(sheet);
```

In `packages/vue-core/src/styling/vue-style-sheet.ts`, add `registerIconSpin,` to the `@ultimate/uix-styled` import list (after `registerHiddenAccessible,`), and after `registerHiddenAccessible(vueCoreStyleSheet);` add:

```ts
// GAP-124: the opt-in `.u-icon-spin` rule (class-scoped; see uix-styled icon-spin.ts).
registerIconSpin(vueCoreStyleSheet);
```

- [ ] **Step 5: Run both suites and confirm they pass**

Run: `pnpm --filter @ultimate/ng-core test && pnpm --filter @ultimate/vue-core test`
Expected: PASS, with no regressions.

- [ ] **Step 6: Add the SSR assertion**

In `apps/playground-angular/e2e/ssr-hydration.spec.ts`, after `expect(body).toContain('data-u-ng-style="u-hidden-accessible"');`, add:

```ts
expect(body).toContain('data-u-ng-style="u-icon-spin"'); // GAP-124
```

The block's existing per-key loop (lines 409+) already asserts that each key appears once after hydration.

Run: `pnpm run build && npx playwright test --project=ng-ssr-chromium`
Expected: PASS.

- [ ] **Step 7: Add the provenance entry for the Vue test, then validate**

Append to `docs/architecture/provenance/vue-core.json`:

```json
{
  "originalPath": "n/a",
  "ultimateDestination": "packages/vue-core/src/styling/icon-spin.spec.ts",
  "modificationStatus": "authored",
  "modificationDescription": "Ultimate-authored test, not derived from upstream. Verifies the shared u-icon-spin rule is registered once on mount (GAP-124)."
}
```

Run: `pnpm run provenance:validate -- --base-ref origin/main`
Expected: exit 0. If it reports a modified existing file (`base-component.ts`, `vue-style-sheet.ts`), update that file's existing entry's `modificationDescription` with "; registers the GAP-124 icon-spin rule".

- [ ] **Step 8: Commit**

```bash
git add packages/ng-core/src/basecomponent/base-component.ts packages/ng-core/src/basecomponent/base-component.spec.ts \
  packages/vue-core/src/styling/vue-style-sheet.ts packages/vue-core/src/styling/icon-spin.spec.ts \
  apps/playground-angular/e2e/ssr-hydration.spec.ts docs/architecture/provenance/vue-core.json \
  docs/architecture/provenance/ng-core.json
git commit -m "feat(ng-core,vue-core): register the icon-spin rule from both cores (GAP-124 A)"
```

(Stage `ng-core.json` only if Step 7 changed it.)

---

### Task 4: Prove React is unchanged (item A, R-AC1..R-AC4)

**Files:**

- Test: `packages/react/src/button/gap-124-react-unchanged.spec.tsx` (create)
- Test: `packages/react/e2e/gap-124-react-unchanged.spec.ts` (create)
- Modify: `docs/architecture/provenance/react.json`

- [ ] **Step 1: Write the R-AC1 unit test**

```tsx
import { beforeEach, describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { reactCoreStyleSheet } from "@ultimate/react-core";
import { UButton } from "./button";

describe("GAP-124 React scope (D-124-5)", () => {
  beforeEach(() => {
    reactCoreStyleSheet.clear();
    document.head.querySelectorAll("style").forEach((el) => el.remove());
  });

  it("a loading UButton registers no u-icon-spin rule in React", () => {
    const { container } = render(<UButton loading label="Save" />);
    expect(container.querySelector("svg.u-icon-spin")).not.toBeNull();
    expect(reactCoreStyleSheet.has("u-icon-spin")).toBe(false);
    expect(
      Array.from(document.head.querySelectorAll("style")).some((s) =>
        (s.textContent ?? "").includes("@keyframes u-icon-spin")
      )
    ).toBe(false);
  });
});
```

Run: `pnpm --filter @ultimate/react test -- gap-124`
Expected: PASS, both before and after Tasks 2–3. **If it FAILS: stop the plan** (stop rule) and report.

- [ ] **Step 2: Run the R-AC2 built-output check**

Run:

```bash
pnpm --filter @ultimate/uix-styled build && pnpm --filter @ultimate/react-core build && pnpm --filter @ultimate/react build
grep -rlE "@keyframes u-icon-spin|registerIconSpin" packages/react-core/dist packages/react/dist; echo "exit=$?"
```

Expected: no file listed and `exit=1` (grep found nothing). `@ultimate/uix-styled` stays external: `grep -c 'from "@ultimate/uix-styled"' packages/react-core/dist/index.mjs` is ≥ 1. Record the output in `progress.md`. **Any match: stop.**

- [ ] **Step 3: Write the R-AC3 browser test**

`packages/react/e2e/gap-124-react-unchanged.spec.ts`:

```ts
import { expect, test } from "@playwright/test";
import { storyUrl } from "./accessibility-envelope";

test("GAP-124 React: a React-only page has no icon-spin rule and the loading icon does not animate", async ({
  page,
}) => {
  await page.goto(storyUrl("react-button--loading"));
  const icon = page.locator(".u-button svg.u-icon-spin").first();
  await expect(icon).toBeVisible();
  expect(await icon.evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  expect(
    await page.evaluate(() =>
      Array.from(document.querySelectorAll("style")).some((s) =>
        (s.textContent ?? "").includes("@keyframes u-icon-spin")
      )
    )
  ).toBe(false);
});
```

Run: `pnpm run build && npx playwright test --project=react-chromium --project=react-firefox --project=react-webkit gap-124`
Expected: 3 passed. **Any failure: stop.**

- [ ] **Step 4: Add the provenance entries**

Append to `docs/architecture/provenance/react.json`:

```json
{
  "originalPath": "n/a",
  "ultimateDestination": "packages/react/src/button/gap-124-react-unchanged.spec.tsx",
  "modificationStatus": "authored",
  "modificationDescription": "Ultimate-authored test, not derived from upstream. Verifies a loading UButton registers no u-icon-spin rule in React (GAP-124 D-124-5, R-AC1)."
},
{
  "originalPath": "n/a",
  "ultimateDestination": "packages/react/e2e/gap-124-react-unchanged.spec.ts",
  "modificationStatus": "authored",
  "modificationDescription": "Ultimate-authored browser test. Verifies a React-only Storybook page carries no icon-spin rule and the loading icon does not animate (GAP-124 R-AC3)."
}
```

Run: `pnpm run provenance:validate -- --base-ref origin/main`
Expected: exit 0.

- [ ] **Step 5: R-AC4 working-tree check (before staging)**

This covers staged, unstaged and untracked files. A clean `main...HEAD` diff is **not** evidence that uncommitted changes are absent.

Run: `git status --porcelain --untracked-files=all -- packages/react packages/react-core docs/architecture/provenance/react.json docs/architecture/provenance/react-core.json`
Expected, exactly these three lines (any order):

```text
 M docs/architecture/provenance/react.json
?? packages/react/e2e/gap-124-react-unchanged.spec.ts
?? packages/react/src/button/gap-124-react-unchanged.spec.tsx
```

Any other line, for example a modified React production file or `react-core.json`: **stop** and report.

- [ ] **Step 6: Stage, then check the index**

```bash
git add packages/react/src/button/gap-124-react-unchanged.spec.tsx packages/react/e2e/gap-124-react-unchanged.spec.ts \
  docs/architecture/provenance/react.json
git diff --cached --name-status
```

Expected: the whole index contains exactly:

```text
M	docs/architecture/provenance/react.json
A	packages/react/e2e/gap-124-react-unchanged.spec.ts
A	packages/react/src/button/gap-124-react-unchanged.spec.tsx
```

- [ ] **Step 7: Commit**

```bash
git commit -m "test(react): prove React-only documents get no icon-spin rule (GAP-124 A)"
```

- [ ] **Step 8: R-AC4 committed-branch check (after the commit)**

Run: `git diff --name-status main...HEAD -- packages/react packages/react-core docs/architecture/provenance/react.json docs/architecture/provenance/react-core.json`
Expected, exactly:

```text
M	docs/architecture/provenance/react.json
A	packages/react/e2e/gap-124-react-unchanged.spec.ts
A	packages/react/src/button/gap-124-react-unchanged.spec.tsx
```

Run: `git diff --name-only main...HEAD -- packages/react packages/react-core ':(exclude)*.spec.ts' ':(exclude)*.spec.tsx' ':(exclude)packages/react/e2e/*-snapshots/**'`
Expected: no output. No React production source or style file is on the branch.

Run: `git diff --name-only main...HEAD -- 'packages/react/e2e/*-snapshots/**'`
Expected: no output. No React visual baseline changed.

Run: `git status --porcelain --untracked-files=all -- packages/react packages/react-core docs/architecture/provenance/react.json docs/architecture/provenance/react-core.json`
Expected: no output. Nothing React-related is left uncommitted.

Record all four outputs in `progress.md`. Any deviation: **stop** and return the React scope question to the user.

---

### Task 5: Motion browser tests and item A records (A-AC1, A-AC2)

**Files:**

- Test: `packages/ng/e2e/gap-124-icon-spin.spec.ts` (create)
- Test: `packages/vue/e2e/gap-124-icon-spin.spec.ts` (create; identical except for the `CASES` story ids)
- Modify: `docs/architecture/provenance/ng.json`, `docs/architecture/provenance/vue.json`
- Modify: `docs/architecture/MIGRATION.md` (new section at the end), `docs/architecture/PARITY_PLAYBOOK.md:225` (`dataview` row note)

- [ ] **Step 1: Write the test (ng version)**

```ts
import { expect, test, type Locator } from "@playwright/test";
import { storyUrl } from "./accessibility-envelope";

/** GAP-124 item A (Spec §5, A-AC1/A-AC2): loading icons rotate, and stop under reduced motion. */
const CASES: Array<[story: string, icon: string, status: boolean]> = [
  ["ng-button--loading", ".u-button svg.u-icon-spin", false],
  ["data-dataview--loading", '.u-data-view > [role="status"] svg.u-icon-spin', true],
];

const animation = (icon: Locator) =>
  icon.evaluate((el) => {
    const c = getComputedStyle(el);
    return [
      c.animationName,
      c.animationDuration,
      c.animationTimingFunction,
      c.animationIterationCount,
    ];
  });

/** Bounding box at the 0° frame: pause running animations first, so rotation does not inflate the box. */
const restBox = (icon: Locator) =>
  icon.evaluate((el) => {
    for (const a of el.getAnimations()) {
      a.pause();
      a.currentTime = 0;
    }
    const r = el.getBoundingClientRect();
    return { width: r.width, height: r.height };
  });

for (const [story, selector, status] of CASES) {
  test.describe(`GAP-124 A ${story}`, () => {
    test("rotates continuously with normal motion", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto(storyUrl(story));
      const icon = page.locator(selector).first();
      await expect(icon).toBeVisible();
      expect(await animation(icon)).toEqual(["u-icon-spin", "2s", "linear", "infinite"]);
      const first = await icon.evaluate((el) => getComputedStyle(el).transform);
      await expect
        .poll(() => icon.evaluate((el) => getComputedStyle(el).transform), { timeout: 2000 })
        .not.toBe(first);
    });

    test("is static, visible and unchanged in size under reduced motion (set after load)", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto(storyUrl(story));
      const icon = page.locator(selector).first();
      await expect(icon).toBeVisible();
      const normal = await restBox(icon);
      await page.emulateMedia({ reducedMotion: "reduce" });
      expect((await animation(icon))[0]).toBe("none");
      await expect(icon).toBeVisible();
      const reduced = await icon.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return { width: r.width, height: r.height, opacity: getComputedStyle(el).opacity };
      });
      expect(reduced.width).toBeGreaterThan(0);
      expect(Math.abs(reduced.width - normal.width)).toBeLessThanOrEqual(0.5);
      expect(Math.abs(reduced.height - normal.height)).toBeLessThanOrEqual(0.5);
      expect(reduced.opacity).toBe("1");
      if (status) await expect(page.getByRole("status")).toHaveText("Loading");
    });
  });
}
```

For `packages/vue/e2e/gap-124-icon-spin.spec.ts`, use the same file with `"vue-button--loading"` in place of `"ng-button--loading"` (the Vue DataView id is the same, `data-dataview--loading`, from Task 1).

- [ ] **Step 2: Run against the pre-Task-2 code and confirm the tests fail**

Do not use `git stash` (it would touch the user's existing `stash@{0}`). Use a temporary worktree at the Task 1 commit, which has the fixture but not Tasks 2–4:

```bash
git worktree add ../ultimate-gap124-base <Task 1 commit SHA from progress.md>
```

Copy the two new spec files into that worktree, then run there:
`pnpm install --frozen-lockfile && pnpm run build && npx playwright test --project=ng-chromium --project=vue-chromium gap-124-icon-spin`
Expected: FAIL on both motion tests (`animationName` is `none`).
Then: `git worktree remove ../ultimate-gap124-base`.

- [ ] **Step 3: Run on the branch and confirm the tests pass**

Run: `pnpm run build && npx playwright test --project=ng-chromium --project=ng-firefox --project=ng-webkit --project=vue-chromium --project=vue-firefox --project=vue-webkit gap-124-icon-spin`
Expected: 24 passed (2 stories × 2 tests × 6 projects).

- [ ] **Step 4: Write the item A records**

Append to `docs/architecture/MIGRATION.md`:

```markdown
Added for GAP-124 (`feature/gap-124-loading-spinner`), same status — unreleased, no changesets:

- **`@ultimate/ng`, `@ultimate/vue` — loading spinners rotate (item A).** The Button and DataView loading icons rotate (2 s, linear), as in Prime. Under `prefers-reduced-motion: reduce` they stay visible and stop rotating; Prime has no reduced-motion handling. `@ultimate/uix-styled` exports `registerIconSpin` (and `ICON_SPIN_KEY`, `iconSpinCss`); the Angular and Vue cores register the `u-icon-spin` style key.
- **Known limitations.** KL-1: an Angular or Vue Ultimate icon with `spin` does not rotate unless an Angular or Vue Ultimate component has registered the rule in that document. KL-2: the rule is a document-level class selector, so in a document that also renders an Angular or Vue Ultimate component, a React Ultimate spinner rotates too. React-only documents are unchanged.
```

In `docs/architecture/PARITY_PLAYBOOK.md`, append the following to the end of the `dataview` row's notes cell (line 225):

` GAP-124 A: the loading icon now rotates as in PrimeNG; under reduced motion it is static (deliberate difference, [GAP-124 Spec](../superpowers/specs/2026-10-11-gap-124-loading-spinner-design.md)).`

The classification is unchanged.

- [ ] **Step 5: Add provenance entries, then validate**

Append to `ng.json` and to `vue.json` (with the matching path):

```json
{
  "originalPath": "n/a",
  "ultimateDestination": "packages/ng/e2e/gap-124-icon-spin.spec.ts",
  "modificationStatus": "authored",
  "modificationDescription": "Ultimate-authored browser test. Verifies Button and DataView loading icons rotate with normal motion and are static, visible and unchanged in size under reduced motion (GAP-124 A-AC1/A-AC2)."
}
```

Run: `pnpm run provenance:validate -- --base-ref origin/main && npx prettier --check docs/architecture/MIGRATION.md docs/architecture/PARITY_PLAYBOOK.md`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add packages/ng/e2e/gap-124-icon-spin.spec.ts packages/vue/e2e/gap-124-icon-spin.spec.ts \
  docs/architecture/provenance/ng.json docs/architecture/provenance/vue.json \
  docs/architecture/MIGRATION.md docs/architecture/PARITY_PLAYBOOK.md
git commit -m "test(gap-124): verify spinner rotation and the reduced-motion stop; record item A"
```

---

### Task 6: Item A verification gate (A-AC5, A-AC6)

**Files:** none changed. Evidence goes to the workspace.

- [ ] **Step 1: Run the unit suites**

Run: `pnpm run test`
Expected: exit 0.

- [ ] **Step 2: Run the Docker verification**

```bash
W=.superpowers/sdd/2026-10-11-gap-124-loading-spinner/docker
git archive HEAD -o $W/src.tar && git rev-parse HEAD > $W/commit.txt
for mode in "ci ng" "ci vue" "check E-4" "regression" "gap124 A"; do
  docker run --rm --ipc=host -v "$PWD/$W":/io mcr.microsoft.com/playwright:v1.63.0-jammy bash /io/run.sh $mode
done
```

Expected:

- **`ci ng` / `ci vue`:** the strict suite and the accessibility validator exit 0, apart from the inherited failures recorded at `d3aabf5`. Compare against the G3-E closeout CI evidence.
- **`check E-4`:** 0 snapshot differences. This is A-AC5: item A changes no baseline.
- **`regression`:** no new failures.
- **`gap124 A`:** all GAP-124 A and React specs pass.

Record exit codes in `progress.md`.

- [ ] **Step 3: Run the Angular `dataview/loading` parity probe**

Run: `docker run --rm --ipc=host -v "$PWD/$W":/io mcr.microsoft.com/playwright:v1.63.0-jammy bash /io/run.sh parity E-4 after`
Expected: `dataview/loading` (ng) has **0 probe differences** (A1-3).

- [ ] **Step 4: Item A gate**

Item A is complete when Steps 1–3 meet their expectations. Any unexpected failure: stop and report. No commit.

---

### Task 7: Generator rule and regenerated DataView modules (item B, B-AC3)

**Files:**

- Modify: `packages/themes/test/utils/g3e-port.mjs`: the `RETAINED` section (around line 380 for the constants; around lines 410/428 for the `dataview` entries)
- Regenerate: `packages/ng/src/data-view/data-view-style.ts`, `packages/vue/src/data-view/data-view-style.ts`

- [ ] **Step 1: Add the rule to the generator**

Add the following after the `DATAVIEW_GRID` constant:

```js
// GAP-124 B-2 (Spec 2026-10-11-gap-124-loading-spinner-design.md §6, SR-1): the loading icon takes a
// colour with ≥ 3:1 non-text contrast (WCAG 2.2 SC 1.4.11) over the mask on the declared surfaces.
// `text.hover.color` is used for a static, non-hover purpose ON PURPOSE: it is the existing semantic token
// that is dark in the light scheme (surface.800) and white in the dark scheme, with the widest margin
// (4.28:1 over surface.200, where `text.color` gives 3.03:1). Do not "correct" it to `text.color`.
const DATAVIEW_LOADING_ICON =
  ".u-data-view > [role=\"status\"] svg { color: dt('text.hover.color'); }";
```

Change `RETAINED.ng.dataview` to:
`[".u-data-view-list { margin: 0; padding: 0; list-style: none; }", DATAVIEW_GRID, DATAVIEW_LOADING_ICON]`

Change `RETAINED.vue.dataview` to:
`[DATAVIEW_GRID, DATAVIEW_LOADING_ICON]`

- [ ] **Step 2: Run the fidelity test and confirm it fails**

Run: `pnpm --filter @ultimate/themes test -- g3e-upstream-fidelity`
Expected: FAIL for `ng/dataview` and `vue/dataview` (the actual CSS lacks the new rule); every other key passes.

- [ ] **Step 3: Regenerate both modules from the generator**

```bash
for fw in ng vue; do FW=$fw node --input-type=module -e '
import { readFileSync, writeFileSync } from "node:fs";
import { expectedCss, styleFile } from "./packages/themes/test/utils/g3e-port.mjs";
const fw = process.env.FW, f = styleFile(fw, "dataview"), src = readFileSync(f, "utf8");
const out = src.replace(/(\/\*css\*\/ `\n)[\s\S]*?(\n`)/, (_, a, b) => a + expectedCss(fw, "dataview").join("\n") + b);
if (out === src) throw new Error("unchanged: " + f);
writeFileSync(f, out);
'; done
git diff --stat packages/ng/src/data-view packages/vue/src/data-view
```

Expected: each file `1 +`, adding only the line `.u-data-view > [role="status"] svg{color: dt('text.hover.color');}` (normalized form) at the end of the css block. **Any other line changed: stop** (the module had drifted from the generator).

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `pnpm --filter @ultimate/themes test && pnpm --filter @ultimate/ng test && pnpm --filter @ultimate/vue test`
Expected: PASS.

- [ ] **Step 5: Run the diff scope check (B-AC3)**

Run: `git diff --name-only`
Expected: exactly `packages/themes/test/utils/g3e-port.mjs`, `packages/ng/src/data-view/data-view-style.ts`, `packages/vue/src/data-view/data-view-style.ts`.

- [ ] **Step 6: Commit**

```bash
git add packages/themes/test/utils/g3e-port.mjs packages/ng/src/data-view/data-view-style.ts \
  packages/vue/src/data-view/data-view-style.ts
git commit -m "fix(ng,vue): give the DataView loading icon 3:1 non-text contrast (GAP-124 B)"
```

---

### Task 8: Contrast measurement tests (item B, B-AC1, B-AC2, B-AC6, B-AC7)

**Files:**

- Create: `packages/ng/e2e/non-text-contrast.ts` and the identical `packages/vue/e2e/non-text-contrast.ts`
- Create: `packages/ng/e2e/gap-124-contrast.spec.ts` and the identical `packages/vue/e2e/gap-124-contrast.spec.ts`
- Modify: `docs/architecture/provenance/ng.json`, `docs/architecture/provenance/vue.json`

**Interfaces:**

- Produces: `contrastRatio(a: Rgb, b: Rgb): number`, `measureIconContrast(page: Page, icon: Locator, options?: { validate?: boolean }): Promise<IconContrast>`, where `type Rgb = readonly [number, number, number]` and `interface IconContrast { ratio: number; corePixels: number; inkPixels: number; maxCoreDeviation: number; renderedMedian: number }`.

- [ ] **Step 1: Write the helper**

`non-text-contrast.ts`, the same in both frameworks:

```ts
import type { Locator, Page } from "@playwright/test";

/**
 * GAP-124 Spec §10: non-text contrast of an icon against the mask behind it.
 * Layer L1 (asserted): the minimum contrast between EVERY fully covered icon pixel and EVERY
 * adjacent mask pixel, with anti-aliased edge pixels identified by measured coverage and excluded
 * (W3C evaluates contrast with anti-aliasing turned off). Layer L2 (reported): `renderedMedian`.
 */
export type Rgb = readonly [number, number, number];

export interface IconContrast {
  /** L1: min over (core pixel, adjacent pixel) pairs. */
  ratio: number;
  /** Fully covered pixels: W − K ≥ 254 on every channel (full coverage within 8-bit rounding). */
  corePixels: number;
  /** Pixels with coverage α ≥ 0.05. */
  inkPixels: number;
  /** Largest per-channel distance of a core pixel from the icon's computed `color`. */
  maxCoreDeviation: number;
  /** L2: median contrast of pixels with α ≥ 0.5 against the least-contrasting adjacent pixel. */
  renderedMedian: number;
}

const channel = (v: number): number => {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = ([r, g, b]: Rgb): number =>
  0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

/** WCAG 2.2 contrast ratio. */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const MARGIN = 6; // CSS px of mask captured around the icon box
const FULL = 254; // W − K per channel; 255 = exact full coverage, 254 allows 8-bit rounding
const INK = 0.05;
const MIN_CORE = 100;
const MIN_CORE_SHARE = 0.25;

/** Decodes a PNG screenshot in the page (canvas), so no PNG dependency is needed. */
async function capture(page: Page, clip: { x: number; y: number; width: number; height: number }) {
  const png = await page.screenshot({ clip, animations: "disabled" });
  return page.evaluate(async (b64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    return Array.from(ctx.getImageData(0, 0, img.width, img.height).data);
  }, png.toString("base64"));
}

export async function measureIconContrast(
  page: Page,
  icon: Locator,
  { validate = true }: { validate?: boolean } = {}
): Promise<IconContrast> {
  const box = await icon.boundingBox();
  if (!box) throw new Error("icon has no bounding box");
  const clip = {
    x: box.x - MARGIN,
    y: box.y - MARGIN,
    width: box.width + 2 * MARGIN,
    height: box.height + 2 * MARGIN,
  };
  const original = await icon.evaluate((el) => (el as SVGElement).style.cssText);
  const computed = (await icon.evaluate((el) => getComputedStyle(el).color))
    .match(/\d+/g)!
    .slice(0, 3)
    .map(Number);
  const withStyle = async (extra: string) => {
    await icon.evaluate(
      (el, css) => ((el as SVGElement).style.cssText = css),
      `${original};${extra}`
    );
    return capture(page, clip);
  };
  const N = await withStyle("");
  const H = await withStyle("visibility:hidden");
  const K = await withStyle("color:#000");
  const W = await withStyle("color:#fff");
  await icon.evaluate((el, css) => ((el as SVGElement).style.cssText = css), original);

  const px = (d: number[], k: number): Rgb => [d[k], d[k + 1], d[k + 2]];
  const adjacent = [
    ...new Map(
      Array.from({ length: H.length / 4 }, (_, i) => px(H, i * 4)).map((c) => [c.join(","), c])
    ).values(),
  ];
  const core: Rgb[] = [];
  const partial: Rgb[] = [];
  let ink = 0;
  for (let k = 0; k < N.length; k += 4) {
    const alpha = (W[k] - K[k] + (W[k + 1] - K[k + 1]) + (W[k + 2] - K[k + 2])) / (3 * 255);
    if (alpha >= INK) ink++;
    if (W[k] - K[k] >= FULL && W[k + 1] - K[k + 1] >= FULL && W[k + 2] - K[k + 2] >= FULL)
      core.push(px(N, k));
    if (alpha >= 0.5) partial.push(px(N, k));
  }
  const maxCoreDeviation = Math.max(
    0,
    ...core.map((c) => Math.max(...c.map((v, i) => Math.abs(v - computed[i]))))
  );
  if (validate) {
    if (core.length < MIN_CORE || core.length < MIN_CORE_SHARE * ink)
      throw new Error(`invalid measurement: ${core.length} fully covered of ${ink} icon pixels`);
    if (maxCoreDeviation > 2)
      throw new Error(
        `invalid measurement: core pixels deviate ${maxCoreDeviation} from computed color ${computed}`
      );
  }
  const uniqueCore = [...new Map(core.map((c) => [c.join(","), c])).values()];
  const ratio = Math.min(...uniqueCore.flatMap((c) => adjacent.map((a) => contrastRatio(c, a))));
  const worstAdjacent = (c: Rgb) => Math.min(...adjacent.map((a) => contrastRatio(c, a)));
  const sorted = partial.map(worstAdjacent).sort((a, b) => a - b);
  const renderedMedian = sorted.length ? sorted[Math.floor(sorted.length / 2)] : NaN;
  return { ratio, corePixels: core.length, inkPixels: ink, maxCoreDeviation, renderedMedian };
}
```

`Math.min()` over an empty list is `Infinity`. The validity guard runs before it, so an empty core can never produce a pass.

- [ ] **Step 2: Write the spec**

`gap-124-contrast.spec.ts`, the same in both frameworks; both use story `data-dataview--loading`:

```ts
import { expect, test, type Page } from "@playwright/test";
import { storyUrl } from "./accessibility-envelope";
import { measureIconContrast } from "./non-text-contrast";

/** GAP-124 item B (Spec §6.4, §10). Expected values: Spec §6.4; tolerance ±0.10 (B-AC6). */
type Scheme = "light" | "dark";
const REQUIRED: Array<[id: string, scheme: Scheme, surface: string, expected: number]> = [
  ["C-L1", "light", "#ffffff", 5.13],
  ["C-L2", "light", "#f1f5f9", 4.74],
  ["C-L3", "light", "#e2e8f0", 4.28],
  ["C-L4", "light", "#cbd5e1", 3.67],
  ["C-L5", "light", "#ecfdf5", 4.92],
  ["C-D1", "dark", "#18181b", 19.79],
  ["C-D2", "dark", "#27272a", 19.02],
  ["C-D3", "dark", "#a1a1aa", 10.32],
  ["C-D4", "dark", "#ffffff", 5.74],
  ["C-D5", "dark", "#34d399", 8.87],
];
const NOT_COVERED: Array<[id: string, surface: string, expected: number]> = [
  ["N-L1", "#94a3b8", 2.37],
  ["N-L2", "#64748b", 1.53],
  ["N-L3", "#10b981", 2.36],
];
const TOLERANCE = 0.1;
const ICON = '.u-data-view > [role="status"] svg';
const EXPECTED_COLOR: Record<Scheme, string> = {
  light: "rgb(30, 41, 59)",
  dark: "rgb(255, 255, 255)",
};

async function open(page: Page, scheme: Scheme) {
  await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
  await page.goto(storyUrl("data-dataview--loading"));
  await expect(page.locator(ICON)).toBeVisible();
}
/** Spec §10 setup: a declared uniform surface under the mask; test-time inline styles only. */
async function setSurface(page: Page, surface: string) {
  await page.locator(".u-data-view").evaluate((root, bg) => {
    (root as HTMLElement).style.backgroundColor = bg;
    for (const el of Array.from(root.children))
      if (el.getAttribute("role") !== "status") (el as HTMLElement).style.visibility = "hidden";
  }, surface);
}
const note = (id: string, text: string) =>
  test.info().annotations.push({ type: id, description: text });

test.describe("GAP-124 B layer L1 (device scale 4)", () => {
  test.use({ deviceScaleFactor: 4 });

  for (const scheme of ["light", "dark"] as const) {
    test(`GAP-124 B DataView loading icon ≥ 3:1 on every required ${scheme} surface`, async ({
      page,
    }) => {
      await open(page, scheme);
      const icon = page.locator(ICON);
      expect(await icon.evaluate((el) => getComputedStyle(el).color)).toBe(EXPECTED_COLOR[scheme]);
      for (const [id, , surface, expected] of REQUIRED.filter(([, s]) => s === scheme)) {
        await setSurface(page, surface);
        const m = await measureIconContrast(page, icon);
        note(
          id,
          `${scheme} ${surface}: L1 ${m.ratio.toFixed(2)} (core ${m.corePixels}/${m.inkPixels})`
        );
        expect.soft(m.ratio, `${id} (${surface}) ≥ 3`).toBeGreaterThanOrEqual(3);
        expect
          .soft(Math.abs(m.ratio - expected), `${id} within ±${TOLERANCE} of ${expected}`)
          .toBeLessThanOrEqual(TOLERANCE);
      }
    });
  }

  test("GAP-124 B not-covered light surfaces are reported and match the Spec (N-L1..N-L3)", async ({
    page,
  }) => {
    await open(page, "light");
    for (const [id, surface, expected] of NOT_COVERED) {
      await setSurface(page, surface);
      const m = await measureIconContrast(page, page.locator(ICON));
      note(
        id,
        `light ${surface}: L1 ${m.ratio.toFixed(2)} (not covered; core ${m.corePixels}/${m.inkPixels})`
      );
      expect
        .soft(Math.abs(m.ratio - expected), `${id} within ±${TOLERANCE} of ${expected}`)
        .toBeLessThanOrEqual(TOLERANCE);
    }
  });

  test("GAP-124 B negative control: the pre-change mask.color icon measures < 3:1 on C-L1", async ({
    page,
  }) => {
    await open(page, "light");
    await setSurface(page, "#ffffff");
    const icon = page.locator(ICON);
    await icon.evaluate((el) => {
      (el as SVGElement).style.color = getComputedStyle(el.closest('[role="status"]')!).color;
    });
    const m = await measureIconContrast(page, icon);
    note("negative", `C-L1 with mask.color: L1 ${m.ratio.toFixed(2)}`);
    expect(m.ratio).toBeLessThan(3);
    expect(Math.abs(m.ratio - 2.31)).toBeLessThanOrEqual(TOLERANCE);
  });

  test("GAP-124 B the color rule survives a custom loadingIcon class on the status region", async ({
    page,
  }) => {
    await open(page, "light");
    await page
      .locator('.u-data-view > [role="status"]')
      .evaluate((el) => el.setAttribute("class", "my-loading"));
    expect(await page.locator(ICON).evaluate((el) => getComputedStyle(el).color)).toBe(
      EXPECTED_COLOR.light
    );
  });
});

for (const dpr of [1, 2]) {
  test.describe(`GAP-124 B layer L2 (device scale ${dpr}, reported only)`, () => {
    test.use({ deviceScaleFactor: dpr });
    for (const [id, scheme, surface] of [
      ["C-L1", "light", "#ffffff"],
      ["C-D1", "dark", "#18181b"],
    ] as const) {
      test(`GAP-124 B rendered anti-aliased contrast, ${id} at ${dpr}x (KL-4)`, async ({
        page,
      }) => {
        await open(page, scheme);
        await setSurface(page, surface);
        const m = await measureIconContrast(page, page.locator(ICON), { validate: false });
        note(
          `${id} L2 ${dpr}x`,
          `median ${m.renderedMedian.toFixed(2)}; core ${m.corePixels}/${m.inkPixels} px`
        );
      });
    }
  });
}
```

- [ ] **Step 3: Confirm the test fails without item B**

Run in a temporary worktree at the Task 5 commit (as in Task 5 Step 2: copy in the two contrast files, build, run, then `git worktree remove`):
`npx playwright test --project=ng-chromium gap-124-contrast`
Expected:

- **Light L1 test:** FAILS. The cross-check finds `rgb(226, 232, 240)`.
- **Dark L1 test:** FAILS on the color cross-check.
- **Negative control:** passes.
- **L2 tests:** pass (report only).

- [ ] **Step 4: Run on the branch and confirm it passes**

Run: `pnpm run build && npx playwright test --project=ng-chromium --project=ng-firefox --project=ng-webkit --project=vue-chromium --project=vue-firefox --project=vue-webkit gap-124-contrast`
Expected: all pass (9 tests × 6 projects).

Copy every annotation into `progress.md`, including:

- every C-_, N-L_ and negative L1 value with its core/ink counts;
- the L2 medians and counts at 1× and 2×.

Stop rules:

- _*Any C-* below 3:_* stop and return the color decision to the user.
- **Any value outside ±0.10, or any validity-guard error (B-AC7):** stop and report the engine and value. Do not loosen the tolerance or the guards to make a run pass.

- [ ] **Step 5: Add provenance entries, then validate**

Add four `authored` entries (helper and spec, ng and vue) in the Task 5 Step 5 form, each describing "GAP-124 B-AC1/B-AC2/B-AC6/B-AC7 coverage-based non-text contrast measurement (Spec §10)". Then run:
`pnpm run provenance:validate -- --base-ref origin/main`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add packages/ng/e2e/non-text-contrast.ts packages/vue/e2e/non-text-contrast.ts \
  packages/ng/e2e/gap-124-contrast.spec.ts packages/vue/e2e/gap-124-contrast.spec.ts \
  docs/architecture/provenance/ng.json docs/architecture/provenance/vue.json
git commit -m "test(gap-124): measure the DataView loading icon contrast on declared surfaces"
```

---

### Task 9: Baselines, parity record and item B records — HARD USER STOP (B-AC5, B-AC4)

**Files:**

- Modify: `packages/ng/e2e/g3e-aura-styles.spec.ts-snapshots/Ng-DataView-Loading-rest-G3-E-E-4-visual-1-ng-{chromium,firefox,webkit}.png`
- Modify: `docs/architecture/MIGRATION.md` (GAP-124 section), `docs/architecture/PARITY_PLAYBOOK.md:225`

- [ ] **Step 1: Check the snapshots in Docker**

Run: `bash /io/run.sh check E-4` through the Task 6 Step 2 docker loop (refresh `src.tar` and `commit.txt` first).
Expected: exactly 3 failures, the three `Ng-DataView-Loading-rest` snapshots. **Any other failure: stop.**

- [ ] **Step 2: HARD USER STOP**

Present the three actual and diff images (from the `check` results in the workspace) with the explanation from Spec §6.3. Wait for explicit user acceptance. Do not update snapshots without it.

- [ ] **Step 3: After acceptance, update only those three snapshots**

Run: `bash /io/run.sh accept E-4` through docker, then copy the three PNGs from the container results into `packages/ng/e2e/g3e-aura-styles.spec.ts-snapshots/`.
Run: `git status --short packages/ng/e2e`
Expected: exactly the 3 PNGs modified.

- [ ] **Step 4: Run the parity probe and accessibility checks**

Run: `bash /io/run.sh parity E-4 after` and `bash /io/run.sh ci ng`, `bash /io/run.sh ci vue` through docker.
Expected:

- `dataview/loading` (ng) shows the icon-color difference from PrimeNG (A1-3); record the probe output;
- the G3-E differential accessibility validator reports 0 introduced rows (B-AC4);
- the a11y tree is unchanged: `status`, polite, atomic, "Loading".

- [ ] **Step 5: Write the item B records**

Append to the GAP-124 section in `MIGRATION.md`:

```markdown
- **`@ultimate/ng`, `@ultimate/vue` — DataView loading icon contrast (item B).** The loading icon uses `text.hover.color` (light scheme `surface.800`, dark scheme white) instead of `mask.color`, for WCAG 2.2 SC 1.4.11 3:1 non-text contrast over the mask on the declared surfaces (GAP-124 Spec §6.4). This differs from Prime. KL-3: over darker or saturated light-scheme content under the mask (for example `surface.400`, `surface.500`, `primary.500`), the icon is below 3:1. KL-4: the spinner stroke is about 1.17 CSS px wide, so at low device pixel ratios anti-aliasing renders it fainter than its specified color. The 3:1 figure is for the specified colors, and the rendered values are in the verification record.
```

Append to the `dataview` row note in `PARITY_PLAYBOOK.md`:

` GAP-124 B: the loading icon color differs from PrimeNG by design (3:1 non-text contrast); the ng dataview/loading probe records this difference.`

Run: `npx prettier --check docs/architecture/MIGRATION.md docs/architecture/PARITY_PLAYBOOK.md`
Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add packages/ng/e2e/g3e-aura-styles.spec.ts-snapshots/Ng-DataView-Loading-rest-G3-E-E-4-visual-1-ng-chromium.png \
  packages/ng/e2e/g3e-aura-styles.spec.ts-snapshots/Ng-DataView-Loading-rest-G3-E-E-4-visual-1-ng-firefox.png \
  packages/ng/e2e/g3e-aura-styles.spec.ts-snapshots/Ng-DataView-Loading-rest-G3-E-E-4-visual-1-ng-webkit.png \
  docs/architecture/MIGRATION.md docs/architecture/PARITY_PLAYBOOK.md
git commit -m "test(gap-124): accept the reviewed DataView loading baselines and record item B"
```

---

### Task 10: Final verification and handoff — HARD USER STOP

- [ ] **Step 1: Run the full local checks**

Run: `pnpm run lint && pnpm run typecheck && pnpm run test && pnpm run provenance:validate -- --base-ref origin/main && pnpm run size:validate`
Expected:

- every command exits 0;
- the size change is limited to the `uix-styled`, `ng-core` and `vue-core` deltas (small) and the DataView modules.

- [ ] **Step 2: Run the full Docker regression**

Run `ci ng`, `ci vue`, `regression` and `gap124 final`.
Expected: no new failures against the inherited set, and all GAP-124 specs green.

- [ ] **Step 3: Check scope**

Run: `git diff --stat main...HEAD`
Expected:

- only the File-map files changed;
- nothing under `packages/themes/src`, `packages/uix-styles`, or `docs/architecture/BLUEPRINT_GAPS.md`.

Run: `git diff --name-status main...HEAD -- packages/react packages/react-core docs/architecture/provenance/react.json docs/architecture/provenance/react-core.json`
Expected: exactly the three lines from Task 4 Step 8 (R-AC4).

Run: `git diff --name-only main...HEAD -- packages/react packages/react-core ':(exclude)*.spec.ts' ':(exclude)*.spec.tsx'`
Expected: no output.

Run: `git status --porcelain --untracked-files=all`
Expected: only `?? docs/architecture/research/2026-10-09-bounded-autonomous-execution-design.md`. That is BAE, untouched and never staged. No other uncommitted change.

- [ ] **Step 4: Write the verification record**

Write `docs/architecture/research/2026-10-11-gap-124-verification.md`. It records:

- the commits;
- every AC with its evidence, including the per-condition contrast values and the N-L annotations;
- the parity probe result;
- the baseline acceptance;
- KL-1..KL-4, with the layer-L2 rendered values;
- the statement "GAP-124 stays PARTIAL pending a separate closeout decision".

Commit it: `docs(gap-124): record the loading-spinner verification`.

- [ ] **Step 5: HARD USER STOP**

Report to the user and wait. No merge to `main`, no push, no GAP-124 status change without separate authorization.

---

## Rollback

| To revert | Command (on the branch, or as revert commits after merge)                    | Leaves intact                     |
| --------- | ---------------------------------------------------------------------------- | --------------------------------- |
| Item B    | `git revert <Task 9 commit> <Task 8 commit> <Task 7 commit>`                 | Item A, React proofs, Vue fixture |
| Item A    | `git revert <Task 5 commit> <Task 4 commit> <Task 3 commit> <Task 2 commit>` | Item B, Vue fixture               |
| Fixture   | `git revert <Task 1 commit>`, only after A and B are reverted                | —                                 |

`MIGRATION.md` and `PARITY_PLAYBOOK.md` get one bullet or note per item, committed with that item, so each revert removes only its own text. If reverting A after B conflicts in those two files, resolve by deleting only the item A bullet and note.

## Self-review

- **Spec coverage:**
  - §5.1–5.2 → Tasks 2–3; §5.3 → Task 4; §5.4 → Task 5; §6.1–6.2 → Task 7; §6.4/§10 → Task 8; §6.3/§8 → Tasks 5 and 9; §7 → Tasks 5 and 9 (status/a11y-tree checks); §11 → Rollback; A1-1..A1-4 (approved) → Tasks 1, 9, 6/9, 4; React file boundary (§5.3, R-AC4) → Task 4 Steps 5–8 and Task 10 Step 3.
  - A-AC1–A-AC6, R-AC1–R-AC4 and B-AC1–B-AC6 are each mapped to a step.
- **Placeholder scan:** none. The commit SHAs in the Rollback table are filled in at execution time from `progress.md`.
- **Name consistency:** `ICON_SPIN_KEY`, `iconSpinCss`, `registerIconSpin`, `DATAVIEW_LOADING_ICON`, `measureIconContrast` and `contrastRatio` are used identically in every task.
- **Review Focus:** each of the five items is pinned to a test in Tasks 3, 4, 5 and 8.
