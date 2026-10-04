# GAP-064 Tranche 1 — Aura Key Wiring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Angular and Vue components whose structural CSS already calls `dt()` receive their Aura variable definitions. Three changes do this:

- the style keys of 16 Angular and 17 Vue components are renamed to the upstream preset key;
- Vue `InputNumber` also registers the `inputtext` variables;
- the `badge`, `inputgroup` and `paginator` Aura modules are ported.

Every effect is verified on the generated `<style>` elements and in reviewed screenshots.

**Architecture:**

- `componentName` is both the stylesheet key and the preset lookup key (`registerThemeVariables` → `Theme.getComponent(name)`, exact match). Renaming the literal at each registration site is therefore the whole of D1. The shared lookup and React are untouched.
- D2 adds one optional parameter to `@ultimate/vue-core`'s `registerComponentStyle`. It calls the existing `registerThemeVariables` once per additional key, before the structural CSS, and never adds structural CSS under that key.
- The three Aura modules follow the existing port pipeline: module file, registration, upstream-fidelity fixture, `themes.json` provenance.

**Tech Stack:** TypeScript 5.9, Angular (`@angular/build:unit-test`, Vitest, jsdom), Vue 3.5 (`@vue/test-utils`, Vitest, jsdom), React (Testing Library), Playwright 1.63 with Storybook, pnpm 9.

**Spec:** `docs/superpowers/specs/2026-10-04-gap-064-tranche-1-aura-key-wiring-design.md` (Approved; Spec Review decisions in §13). Decision: ADR-051. Evidence: `docs/architecture/research/2026-10-04-gap-064-aura-token-wiring-research.md`.

## Global Constraints

- **Node.** Run every command with Node 24.15.0: `export PATH=$HOME/.nvm/versions/node/v24.15.0/bin:$PATH`.
- **Tests.** Per-package tests only, never the full-monorepo `pnpm test`.
- **Built packages.** Tests and Storybook resolve workspace packages through their built `dist`. After changing `packages/themes/src` run `pnpm --filter @ultimate/themes run build`. After changing `packages/vue-core/src` run `pnpm --filter @ultimate/vue-core run build`. Do this before running any downstream test.
- **Style keys (ADR-051).** Upstream keys, exactly:
  - `cascadeselect`, `colorpicker`, `datepicker`, `fileupload`, `floatlabel`, `iconfield`, `iftalabel`, `inputgroup`, `inputnumber`, `inputotp`, `inputtext`, `multiselect`, `radiobutton`, `selectbutton`, `togglebutton`, `toggleswitch`, plus `inputchips` (Vue only).
  - Unchanged: `input-group-addon`, `input-icon`, `button-group`, Vue `menuitem`.
- **D2.** `registerComponentStyle(componentName, styleModule, additionalPresetKeys?)`.
  - Additional keys register variables only, never structural CSS.
  - Omitting the parameter keeps existing behavior identical.
  - No other abstraction. The logic stays in `vue-core`, not in `InputNumber`.
- **D1 contract boundary (Spec §5.4).**
  - No exported API or signature change except D2's.
  - Angular `componentName` stays `protected`.
  - Vue's key stays an internal factory argument.
  - The generated style keys are not documented as a public contract.
- **Exception lists (Spec §4.5, §13.2).** These are the only references that may stay unresolved, asserted exactly in both directions (`--u-` names):
  - **Angular:**
    - CascadeSelect: `--u-cascadeselect-empty-message-padding`, `--u-cascadeselect-option-disabled-color`
    - ColorPicker: `--u-colorpicker-preview-border-color`
    - DatePicker: `--u-datepicker-day-border-radius`, `--u-datepicker-day-cell-padding`, `--u-datepicker-day-color`, `--u-datepicker-day-height`, `--u-datepicker-day-selected-background`, `--u-datepicker-day-selected-color`, `--u-datepicker-day-selected-focus-shadow`, `--u-datepicker-day-width`, `--u-datepicker-select-month-font-weight`
    - FileUpload: `--u-button-border-radius`, `--u-button-secondary-background`, `--u-fileupload-content-border-color`, `--u-fileupload-content-border-radius`, `--u-fileupload-content-color`, `--u-fileupload-content-highlight-background`, `--u-fileupload-file-actions-color`, `--u-fileupload-file-info-border-radius`, `--u-fileupload-file-size-color`, `--u-message-error-background`, `--u-message-error-color`
    - MultiSelect: `--u-multiselect-option-disabled-color`
  - **Vue:** the same, except that FileUpload omits `--u-fileupload-file-info-border-radius`, plus InputChips: `--u-inputchips-chip-focus-color`.
  - **Badge, InputGroup and Paginator have no exceptions.**
  - If a run shows any other difference, **stop and report it**. Do not edit a list to make a test pass.
- **Out of scope; do not touch:**
  - G3's 46 Angular / 48 Vue hand-written components;
  - Ripple; DataTable/VirtualScroller; TabView/TabMenu;
  - React source and React tokenization;
  - Angular InputNumber's template and style module (only its key literal changes);
  - FileUpload's cross-component tokens;
  - every E1–E3 CSS reference;
  - `@ultimate/uix-styled`;
  - unrelated CI failures; GAP-083; any other GAP.
- **Baselines.** No visual or accessibility baseline is updated without the user reviewing the diff first (Task 6 gate).
- **Formatting.** Do not add new prettier or lint failures. `BLUEPRINT_GAPS.md` and `DECISIONS.md` already fail `prettier --check` on `main`. Do not reformat them. None of the files this plan changes is on that list.
- **Commits.** Conventional Commits, ending with the session's attribution lines. No push, no merge.

## Review Focus

1. **InputNumber and InputText on one page, in either mount order.** InputText's structural CSS must still be registered under `inputtext`, and there must be one `inputtext-variables`. If InputNumber registered structural CSS under `inputtext`, the `has()` guard would block InputText's own CSS. Pinned in Task 4, both orders.
2. **Many instances of one component in one document.** Exactly one structural element and one variables element per key. Pinned in Task 3 (registry level) and Tasks 4/5 (component level).
3. **Dark mode for Badge.** Upstream Badge has a light/dark `colorScheme`, so the emitted variables must include the dark block. Pinned in Task 2.
4. **Angular SSR with a renamed component.** The server must emit the new key, and the client must adopt it rather than create a second element or keep an old-key element. Pinned in Task 5.
5. **Vue FileUpload's two registration sites renamed inconsistently.** That would leave a stray `file-upload` element. Pinned by Task 4's key table, which asserts that no old-key element exists.

---

### Task 1: Screenshot coverage and "before" baselines

The new coverage is recorded against the **current, unchanged** code, so the later rename produces a reviewable diff (Spec §8 criterion 7, §9).

**Files:**

- Create: `packages/ng/src/input-text/input-text.stories.ts`
- Create: `packages/ng/src/input-number/input-number.stories.ts`
- Create: `packages/ng/e2e/aura-token-wiring.spec.ts`
- Create: `packages/vue/e2e/aura-token-wiring.spec.ts`
- Create (generated): `packages/ng/e2e/aura-token-wiring.spec.ts-snapshots/*.png`, `packages/vue/e2e/aura-token-wiring.spec.ts-snapshots/*.png`

**Interfaces:**

- Produces: story IDs `ng-inputtext--default`, `ng-inputnumber--default`, and test titles `Ng/<Name> story: visual regression` / `Vue/<Name> story: visual regression`. Task 6 reviews and updates these snapshots.

- [ ] **Step 1: Add the Angular InputText story**

Create `packages/ng/src/input-text/input-text.stories.ts`:

```ts
import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { UInputText } from "./input-text";

/**
 * Verification fixture for GAP-064 Tranche 1 screenshot coverage (Spec §13.3).
 * `UInputText` is an attribute directive, so the story applies it to a native
 * input.
 */
const meta: Meta = {
  title: "Ng/InputText",
  decorators: [moduleMetadata({ imports: [UInputText] })],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => ({
    template: `<input uInputText placeholder="Text" aria-label="Text" />`,
  }),
};
```

- [ ] **Step 2: Add the Angular InputNumber story**

Create `packages/ng/src/input-number/input-number.stories.ts`:

```ts
import type { Meta, StoryObj } from "@storybook/angular";
import { UInputNumber } from "./input-number";

/**
 * Verification fixture for GAP-064 Tranche 1 screenshot coverage (Spec §13.3).
 */
const meta: Meta<UInputNumber> = {
  title: "Ng/InputNumber",
  component: UInputNumber,
};

export default meta;
type Story = StoryObj<UInputNumber>;

export const Default: Story = {};
```

- [ ] **Step 3: Add the Angular visual spec**

Create `packages/ng/e2e/aura-token-wiring.spec.ts`:

```ts
import { expect, test } from "@playwright/test";
import { storyUrl } from "./accessibility-envelope";

/**
 * GAP-064 Tranche 1 (Spec §8 criteria 6–7): screenshot coverage for the
 * components whose style key is renamed to the upstream Aura preset key
 * (ADR-051). The baselines were first recorded before the rename, so the
 * post-rename diff is reviewable. Readiness uses toBeAttached(), not
 * toBeVisible(): before the rename some roots have undefined size tokens and
 * may have an empty bounding box.
 */
const STORIES: ReadonlyArray<{ name: string; story: string; root: string }> = [
  { name: "CascadeSelect", story: "ng-cascadeselect--default", root: ".u-cascade-select" },
  { name: "ColorPicker", story: "ng-colorpicker--default", root: ".u-color-picker" },
  { name: "DatePicker", story: "ng-datepicker--default", root: ".u-date-picker" },
  { name: "FileUpload", story: "ng-fileupload--default", root: ".u-file-upload" },
  { name: "FloatLabel", story: "ng-floatlabel--default", root: ".u-float-label" },
  { name: "IconField", story: "ng-iconfield--leading-icon", root: ".u-icon-field" },
  { name: "IftaLabel", story: "ng-iftalabel--default", root: ".u-ifta-label" },
  { name: "InputGroup", story: "ng-inputgroup--leading-addon", root: ".u-input-group" },
  { name: "InputNumber", story: "ng-inputnumber--default", root: ".u-inputnumber" },
  { name: "InputOtp", story: "ng-inputotp--default", root: ".u-inputotp" },
  { name: "InputText", story: "ng-inputtext--default", root: ".u-inputtext" },
  { name: "MultiSelect", story: "ng-multiselect--default", root: ".u-multi-select" },
  { name: "RadioButton", story: "ng-radiobutton--default", root: ".u-radio-button" },
  { name: "SelectButton", story: "ng-selectbutton--default", root: ".u-select-button" },
  { name: "ToggleButton", story: "ng-togglebutton--default", root: ".u-toggle-button" },
  { name: "ToggleSwitch", story: "ng-toggleswitch--default", root: ".u-toggle-switch" },
];

for (const { name, story, root } of STORIES) {
  test(`Ng/${name} story: visual regression`, async ({ page }) => {
    await page.goto(storyUrl(story));
    await expect(page.locator(root).first()).toBeAttached();
    await expect(page).toHaveScreenshot();
  });
}
```

- [ ] **Step 4: Add the Vue visual spec**

Create `packages/vue/e2e/aura-token-wiring.spec.ts`:

```ts
import { expect, test } from "@playwright/test";
import { storyUrl } from "./accessibility-envelope";

/**
 * GAP-064 Tranche 1 (Spec §8 criteria 6–7): screenshot coverage for the
 * components whose style key is renamed to the upstream Aura preset key
 * (ADR-051), plus Badge (new `badge` module). The baselines were first
 * recorded before the change, so the post-change diff is reviewable.
 * Readiness uses toBeAttached(), not toBeVisible(): before the change some
 * roots have undefined size tokens and may have an empty bounding box.
 */
const STORIES: ReadonlyArray<{ name: string; story: string; root: string }> = [
  { name: "Badge", story: "vue-badge--default", root: ".u-badge" },
  { name: "CascadeSelect", story: "vue-cascadeselect--default", root: ".u-cascade-select" },
  { name: "ColorPicker", story: "vue-colorpicker--default", root: ".u-color-picker" },
  { name: "DatePicker", story: "vue-datepicker--default", root: ".u-date-picker" },
  { name: "FileUpload", story: "vue-fileupload--default", root: ".u-file-upload" },
  { name: "FloatLabel", story: "vue-floatlabel--default", root: ".u-float-label" },
  { name: "IconField", story: "vue-iconfield--leading-icon", root: ".u-icon-field" },
  { name: "IftaLabel", story: "vue-iftalabel--default", root: ".u-ifta-label" },
  { name: "InputChips", story: "vue-inputchips--default", root: ".u-input-chips" },
  { name: "InputGroup", story: "vue-inputgroup--leading-addon", root: ".u-input-group" },
  { name: "InputNumber", story: "vue-inputnumber--default", root: ".u-input-number" },
  { name: "InputOtp", story: "vue-inputotp--default", root: ".u-input-otp" },
  { name: "InputText", story: "vue-inputtext--default", root: ".u-input-text" },
  { name: "MultiSelect", story: "vue-multiselect--default", root: ".u-multi-select" },
  { name: "RadioButton", story: "vue-radiobutton--default", root: ".u-radio-button" },
  { name: "SelectButton", story: "vue-selectbutton--default", root: ".u-select-button" },
  { name: "ToggleButton", story: "vue-togglebutton--default", root: ".u-toggle-button" },
  { name: "ToggleSwitch", story: "vue-toggleswitch--default", root: ".u-toggle-switch" },
];

for (const { name, story, root } of STORIES) {
  test(`Vue/${name} story: visual regression`, async ({ page }) => {
    await page.goto(storyUrl(story));
    await expect(page.locator(root).first()).toBeAttached();
    await expect(page).toHaveScreenshot();
  });
}
```

- [ ] **Step 5: Build, then confirm story IDs and root selectors**

Run: `pnpm run build`
Expected: every package builds.

Start the two Storybooks (`pnpm run storybook:ng -- --port=6001 --compodoc=false` and `pnpm --filter @ultimate/vue exec storybook dev -p 6003`) and run:

```bash
curl -s http://localhost:6001/index.json | node -e 'const j=JSON.parse(require("fs").readFileSync(0,"utf8"));console.log(Object.keys(j.entries).filter(k=>/^ng-(cascadeselect|colorpicker|datepicker|fileupload|floatlabel|iconfield|iftalabel|inputgroup|inputnumber|inputotp|inputtext|multiselect|radiobutton|selectbutton|togglebutton|toggleswitch)--/.test(k)).join("\n"))'
curl -s http://localhost:6003/index.json | node -e 'const j=JSON.parse(require("fs").readFileSync(0,"utf8"));console.log(Object.keys(j.entries).filter(k=>/^vue-(badge|cascadeselect|colorpicker|datepicker|fileupload|floatlabel|iconfield|iftalabel|inputchips|inputgroup|inputnumber|inputotp|inputtext|multiselect|radiobutton|selectbutton|togglebutton|toggleswitch)--/.test(k)).join("\n"))'
```

Expected: every `story` ID used in Steps 3–4 appears. If an ID differs, use the listed ID.

For each root selector, confirm it is the first class emitted by `classes.root` in that component's `*-style.ts`. Correct any mismatch in the spec table. Then stop the Storybooks; Playwright starts its own.

- [ ] **Step 6: Record the "before" baselines**

Run:

```bash
npx playwright test --project=ng-chromium --project=ng-firefox --project=ng-webkit packages/ng/e2e/aura-token-wiring.spec.ts --update-snapshots
npx playwright test --project=vue-chromium --project=vue-firefox --project=vue-webkit packages/vue/e2e/aura-token-wiring.spec.ts --update-snapshots
```

Expected: 48 Angular and 54 Vue snapshots written, and all tests pass.

- [ ] **Step 7: Confirm the baselines are stable**

Run the two commands from Step 6 **without** `--update-snapshots`, twice.
Expected: all pass both times, so the coverage is deterministic before anything changes. If a story is flaky (for example a DatePicker showing today's date), stop and report it rather than loosening thresholds.

- [ ] **Step 8: Commit**

```bash
git add packages/ng/src/input-text/input-text.stories.ts packages/ng/src/input-number/input-number.stories.ts packages/ng/e2e/aura-token-wiring.spec.ts packages/ng/e2e/aura-token-wiring.spec.ts-snapshots packages/vue/e2e/aura-token-wiring.spec.ts packages/vue/e2e/aura-token-wiring.spec.ts-snapshots
git commit -m "test(gap-064): add Tranche 1 screenshot coverage with pre-change baselines"
```

---

### Task 2: Port the `badge`, `inputgroup` and `paginator` Aura modules

**Files:**

- Create: `packages/themes/src/presets/aura/badge.ts`, `packages/themes/src/presets/aura/input-group.ts`, `packages/themes/src/presets/aura/paginator.ts`
- Create: `packages/themes/test/aura-badge-inputgroup-paginator-presets.test.ts`
- Modify: `packages/themes/src/presets/aura/index.ts` (imports, doc comment, `components`)
- Modify: `packages/themes/test/fixtures/aura-upstream-tokens.json` (three `modules` entries, `_meta.scope`)
- Modify: `docs/architecture/provenance/themes.json` (three entries)
- Modify: `packages/themes/test/cross-framework-consistency.test.ts` (React Paginator variables, C8)
- Modify: `packages/themes/README.md:12`, `:43`, `:105`; `docs/architecture/PACKAGE_ARCHITECTURE.md:20`

**Interfaces:**

- Produces: `auraPreset.components.badge`, `.inputgroup` and `.paginator`, plus the named exports `badge`, `inputGroup` and `paginator`. After `pnpm --filter @ultimate/themes run build`, `Theme.getComponent("badge" | "inputgroup" | "paginator")` returns non-empty CSS. Tasks 4 and 5 rely on that.

- [ ] **Step 1: Write the failing preset test**

Create `packages/themes/test/aura-badge-inputgroup-paginator-presets.test.ts`:

```ts
import { describe, it, expect, beforeAll } from "vitest";
import { Theme } from "@ultimate/uix-styled";
import { applyUltimateTheme } from "../src/apply-theme";
import { auraPreset } from "../src/presets/aura";
import { malformedReferences, unresolvedReferences } from "./utils/token-paths";

interface PresetModule {
  /** Ultimate file name under `src/presets/aura/` (without `.ts`). */
  file: string;
  /** Ultimate named export. */
  exportName: string;
  /** Upstream module directory name; also the `auraPreset.components` key. */
  upstream: string;
  /** Upstream default-export top-level keys, in upstream order. */
  keys: string[];
  /** Whether upstream has a `colorScheme` split. */
  colorScheme: boolean;
}

// GAP-064 Tranche 1. Key lists derived from `@primeuix/themes@2.0.3`
// (aura/<module>/index.mjs). Deep equality against upstream lives in
// aura-upstream-fidelity.test.ts.
const MODULES: PresetModule[] = [
  {
    file: "badge",
    exportName: "badge",
    upstream: "badge",
    keys: ["root", "dot", "sm", "lg", "xl", "colorScheme"],
    colorScheme: true,
  },
  {
    file: "input-group",
    exportName: "inputGroup",
    upstream: "inputgroup",
    keys: ["addon"],
    colorScheme: false,
  },
  {
    file: "paginator",
    exportName: "paginator",
    upstream: "paginator",
    keys: ["root", "navButton", "currentPageReport", "jumpToPageInput"],
    colorScheme: false,
  },
];

const modules = import.meta.glob<Record<string, unknown>>("../src/presets/aura/*.ts", {
  eager: true,
});

function ultimateModule({ file, exportName }: PresetModule): Record<string, unknown> {
  const loaded = modules[`../src/presets/aura/${file}.ts`];
  return loaded?.[exportName] as Record<string, unknown>;
}

describe("Aura Badge/InputGroup/Paginator preset modules (GAP-064 Tranche 1)", () => {
  it("covers the 3 Tranche 1 modules", () => {
    expect(MODULES).toHaveLength(3);
  });

  describe.each(MODULES)("$file", (mod) => {
    it("exists and is registered under its upstream key", () => {
      expect(ultimateModule(mod)).toBeDefined();
      expect(auraPreset.components[mod.upstream]).toBe(ultimateModule(mod));
    });

    it("has exactly upstream's top-level keys", () => {
      expect(Object.keys(ultimateModule(mod) ?? {})).toEqual(mod.keys);
    });

    it(`${mod.colorScheme ? "has" : "has no"} colorScheme split, matching upstream`, () => {
      const tokens = ultimateModule(mod) as { colorScheme?: { light?: object; dark?: object } };
      if (mod.colorScheme) {
        expect(tokens.colorScheme?.light).toBeDefined();
        expect(tokens.colorScheme?.dark).toBeDefined();
      } else {
        expect(tokens.colorScheme).toBeUndefined();
      }
    });

    it("has only well-formed {token.path} references", () => {
      expect(malformedReferences(ultimateModule(mod))).toEqual([]);
    });

    it("resolves every {token.path} reference against base.ts in light and dark", () => {
      expect(unresolvedReferences(ultimateModule(mod))).toEqual([]);
    });
  });

  describe("applyUltimateTheme with the Tranche 1 modules", () => {
    beforeAll(() => {
      applyUltimateTheme();
    });

    it.each(MODULES)("emits CSS variables for $upstream", ({ upstream }) => {
      const { css } = Theme.getComponent(upstream, {}) ?? {};
      expect(css).toContain(`--u-${upstream}-`);
    });

    it("emits Badge's dark colorScheme block (Review Focus 3)", () => {
      const { css } = Theme.getComponent("badge", {}) ?? {};
      expect(css).toContain("prefers-color-scheme: dark");
      expect(css).toContain("--u-badge-primary-background");
    });
  });
});
```

- [ ] **Step 2: Add the failing React Paginator assertion (C8)**

In `packages/themes/test/cross-framework-consistency.test.ts`, inside `describe("React and Vue's real UPaginator renders resolve the same paginator.background token", …)`, add this test after the existing React test, before the describe's closing `});`:

```ts
it("React's real UPaginator has its paginator variables defined (GAP-064 D3)", async () => {
  const { UPaginator } = await import("@ultimate/react/paginator");

  render(
    React.createElement(UPaginator, {
      first: 0,
      rows: 10,
      totalRecords: 95,
      onPageChange: () => {},
    })
  );

  // react-core's <style> elements carry no key attribute; Vue's carry
  // data-u-style, so excluding those leaves React's registrations.
  const reactCss = Array.from(document.head.querySelectorAll("style:not([data-u-style])"))
    .map((el) => el.textContent ?? "")
    .join("\n");
  expect(reactCss).toContain("--u-paginator-background:");
  expect(reactCss).toContain("--u-paginator-nav-button-selected-background:");
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `pnpm --filter @ultimate/themes test -- aura-badge-inputgroup-paginator-presets cross-framework-consistency`
Expected:

- the new preset tests FAIL (module undefined; `Theme.getComponent` CSS empty);
- the new React test FAILS (`--u-paginator-background:` not found);
- all pre-existing tests pass.

- [ ] **Step 4: Create the three modules**

Create `packages/themes/src/presets/aura/badge.ts`:

```ts
import type { ComponentTokens } from "../../contract";

/**
 * Ultimate Aura-derived badge component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset badge module
 * (`.vendor-extracted/themes/src/presets/aura/badge/index.ts`). Top-level
 * sections `root`, `dot`, `sm`, `lg`, `xl` and `colorScheme` are transcribed
 * as-is from the extracted upstream source (GAP-064 Tranche 1).
 *
 * Upstream's badge module HAS a `colorScheme` split, so it is typed against the
 * `ComponentTokens` contract, extended by a local `BadgeComponentTokens` because
 * the contract only models `root` + `colorScheme` and upstream also has `dot`,
 * `sm`, `lg`, `xl` sections outside the split. `colorScheme.light` and
 * `colorScheme.dark` are transcribed as-is.
 */
export interface BadgeComponentTokens extends ComponentTokens {
  dot?: Record<string, unknown>;
  sm?: Record<string, unknown>;
  lg?: Record<string, unknown>;
  xl?: Record<string, unknown>;
}

export const badge: BadgeComponentTokens = {
  root: {
    borderRadius: "{border.radius.md}",
    padding: "0 0.5rem",
    fontSize: "0.75rem",
    fontWeight: "700",
    minWidth: "1.5rem",
    height: "1.5rem",
  },
  dot: {
    size: "0.5rem",
  },
  sm: {
    fontSize: "0.625rem",
    minWidth: "1.25rem",
    height: "1.25rem",
  },
  lg: {
    fontSize: "0.875rem",
    minWidth: "1.75rem",
    height: "1.75rem",
  },
  xl: {
    fontSize: "1rem",
    minWidth: "2rem",
    height: "2rem",
  },
  colorScheme: {
    light: {
      primary: { background: "{primary.color}", color: "{primary.contrast.color}" },
      secondary: { background: "{surface.100}", color: "{surface.600}" },
      success: { background: "{green.500}", color: "{surface.0}" },
      info: { background: "{sky.500}", color: "{surface.0}" },
      warn: { background: "{orange.500}", color: "{surface.0}" },
      danger: { background: "{red.500}", color: "{surface.0}" },
      contrast: { background: "{surface.950}", color: "{surface.0}" },
    },
    dark: {
      primary: { background: "{primary.color}", color: "{primary.contrast.color}" },
      secondary: { background: "{surface.800}", color: "{surface.300}" },
      success: { background: "{green.400}", color: "{green.950}" },
      info: { background: "{sky.400}", color: "{sky.950}" },
      warn: { background: "{orange.400}", color: "{orange.950}" },
      danger: { background: "{red.400}", color: "{red.950}" },
      contrast: { background: "{surface.0}", color: "{surface.950}" },
    },
  },
};
```

Create `packages/themes/src/presets/aura/input-group.ts`:

```ts
/**
 * Ultimate Aura-derived inputgroup component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset inputgroup module
 * (`.vendor-extracted/themes/src/presets/aura/inputgroup/index.ts`). The
 * top-level section `addon` is transcribed as-is from the extracted upstream
 * source (GAP-064 Tranche 1).
 *
 * Upstream's inputgroup module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `InputGroupComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface InputGroupComponentTokens {
  addon?: Record<string, unknown>;
}

export const inputGroup: InputGroupComponentTokens = {
  addon: {
    background: "{form.field.background}",
    borderColor: "{form.field.border.color}",
    color: "{form.field.icon.color}",
    borderRadius: "{form.field.border.radius}",
    padding: "0.5rem",
    minWidth: "2.5rem",
  },
};
```

Create `packages/themes/src/presets/aura/paginator.ts`:

```ts
/**
 * Ultimate Aura-derived paginator component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset paginator module
 * (`.vendor-extracted/themes/src/presets/aura/paginator/index.ts`). Top-level
 * sections `root`, `navButton`, `currentPageReport` and `jumpToPageInput` are
 * transcribed as-is from the extracted upstream source (GAP-064 Tranche 1).
 *
 * Upstream's paginator module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `PaginatorComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface PaginatorComponentTokens {
  root?: Record<string, unknown>;
  navButton?: Record<string, unknown>;
  currentPageReport?: Record<string, unknown>;
  jumpToPageInput?: Record<string, unknown>;
}

export const paginator: PaginatorComponentTokens = {
  root: {
    padding: "0.5rem 1rem",
    gap: "0.25rem",
    borderRadius: "{content.border.radius}",
    background: "{content.background}",
    color: "{content.color}",
    transitionDuration: "{transition.duration}",
  },
  navButton: {
    background: "transparent",
    hoverBackground: "{content.hover.background}",
    selectedBackground: "{highlight.background}",
    color: "{text.muted.color}",
    hoverColor: "{text.hover.muted.color}",
    selectedColor: "{highlight.color}",
    width: "2.5rem",
    height: "2.5rem",
    borderRadius: "50%",
    focusRing: {
      width: "{focus.ring.width}",
      style: "{focus.ring.style}",
      color: "{focus.ring.color}",
      offset: "{focus.ring.offset}",
      shadow: "{focus.ring.shadow}",
    },
  },
  currentPageReport: {
    color: "{text.muted.color}",
  },
  jumpToPageInput: {
    maxWidth: "2.5rem",
  },
};
```

- [ ] **Step 5: Register the modules**

In `packages/themes/src/presets/aura/index.ts`, make three changes.

1. Add the imports in alphabetical position among the existing ones:
   - `import { badge } from "./badge";` after `import { avatar } from "./avatar";`
   - `import { inputGroup } from "./input-group";` after `import { inputChips } from "./input-chips";`
   - `import { paginator } from "./paginator";` after `import { overlayBadge } from "./overlay-badge";`
2. In `components`, add:
   - `badge,` after `avatar,`
   - `inputgroup: inputGroup,` after `inputchips: inputChips,`
   - `paginator,` after `overlaybadge: overlayBadge,`
3. In the doc comment, change `Data family (3 modules: OrderList, PickList, DataView) and OrganizationChart.` to `Data family (3 modules: OrderList, PickList, DataView), OrganizationChart, and GAP-064 Tranche 1 (3 modules: Badge, InputGroup, Paginator).`

- [ ] **Step 6: Add the upstream fixture entries (generated, no hand edits)**

Run from the repository root:

```bash
SCRATCH=$(mktemp -d)
tar -xzf .vendor-cache/@primeuix__themes-2.0.3.tar.gz -C "$SCRATCH"
node --input-type=module -e '
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
const dir = process.argv[1];
const path = "packages/themes/test/fixtures/aura-upstream-tokens.json";
const fixture = JSON.parse(readFileSync(path, "utf8"));
for (const key of ["badge", "inputgroup", "paginator"]) {
  if (key in fixture.modules) throw new Error(`${key} is already in the fixture`);
  const mod = await import(pathToFileURL(`${dir}/package/dist/aura/${key}/index.mjs`).href);
  fixture.modules[key] = JSON.parse(JSON.stringify(mod.default));
}
fixture._meta.scope += " + GAP-064 Tranche 1 (3 modules: badge, inputgroup, paginator)";
writeFileSync(path, JSON.stringify(fixture, null, 2) + "\n");
' "$SCRATCH"
git diff --numstat packages/themes/test/fixtures/aura-upstream-tokens.json
```

Expected: one deleted line (the old `_meta.scope`) and only added lines otherwise. The file already round-trips through `JSON.stringify(…, null, 2)` unchanged.

- [ ] **Step 7: Add the provenance entries**

Run:

```bash
node --input-type=module -e '
import { readFileSync, writeFileSync } from "node:fs";
const path = "docs/architecture/provenance/themes.json";
const entries = JSON.parse(readFileSync(path, "utf8"));
const add = [
  ["badge.ts", "badge", "Upstream'"'"'s badge module has a colorScheme split (colorScheme.light/dark transcribed as-is), so it is typed against the ComponentTokens contract via a local BadgeComponentTokens extension because the contract only models root + colorScheme and upstream also has dot, sm, lg and xl sections outside the split."],
  ["input-group.ts", "inputgroup", "Upstream'"'"'s inputgroup module has no colorScheme split, so it is typed with a flat local InputGroupComponentTokens interface."],
  ["paginator.ts", "paginator", "Upstream'"'"'s paginator module has no colorScheme split, so it is typed with a flat local PaginatorComponentTokens interface."],
];
for (const [file, upstream, typing] of add) {
  const destination = `packages/themes/src/presets/aura/${file}`;
  if (entries.some((e) => e.ultimateDestination === destination)) throw new Error(`${destination} already recorded`);
  entries.push({
    originalPath: `src/presets/aura/${file}`,
    ultimateDestination: destination,
    modificationStatus: "reference-derived",
    modificationDescription: `Ported (Option B — reference, not verbatim copy) from @primeuix/themes@2.0.3'"'"'s Aura preset ${upstream} module (.vendor-extracted/themes/src/presets/aura/${upstream}/index.ts); all top-level sections and values are transcribed as-is (GAP-064 Tranche 1). ${typing}`,
  });
}
writeFileSync(path, JSON.stringify(entries, null, 2) + "\n");
'
git diff --numstat docs/architecture/provenance/themes.json
```

Expected: additions only. The same entry shape as the existing Aura entries (for example `inline-message.ts`), with 87 entries in total.

- [ ] **Step 8: Update module counts in documentation**

- `packages/themes/README.md:12`:
  - replace `real per-component design tokens for 76 components: the original five-component proof set (Button, Checkbox, Dialog, Menu, Tooltip) plus 71 modules ported in GAP-064's Batches 1-3 tranche (2026-10-01).` with `real per-component design tokens for 79 components: the original five-component proof set (Button, Checkbox, Dialog, Menu, Tooltip), 71 modules ported in GAP-064's Batches 1-3 tranche (2026-10-01) and Badge, InputGroup and Paginator (GAP-064 Tranche 1).`;
  - replace `Component style files do not consume the new modules yet; see GAP-064` with `Many component style files do not consume their modules yet; see GAP-064`.
- `packages/themes/README.md:43`: `registering all 76 component modules` → `registering all 79 component modules`.
- `packages/themes/README.md:105`: replace `76 component modules exist; the remaining scope (for example `badge`, `inputgroup`, `paginator`, `tabview`/`tabmenu`, `ripple`) is tracked under GAP-064.` with `79 component modules exist. Not ported: `tabview`/`tabmenu`(React-only consumers) and`ripple`(excluded from GAP-064);`datatable`/`virtualscroller` are out of scope by earlier decision.`
- `docs/architecture/PACKAGE_ARCHITECTURE.md:20`: `(76 component modules after GAP-064's Batches 1-3 tranche;` → `(79 component modules after GAP-064's Batches 1-3 tranche and Tranche 1;`.

- [ ] **Step 9: Run the tests to verify they pass**

Run: `pnpm --filter @ultimate/themes test`
Expected: all pass, including:

- `aura-upstream-fidelity.test.ts`: `badge`, `inputgroup` and `paginator` strictly deep-equal the fixture; the "covers every registered module" test passes; when `.vendor-extracted/` exists, the fixture equals the vendored source;
- the new preset test;
- the new React Paginator test.

Then run: `pnpm --filter @ultimate/themes run typecheck && pnpm --filter @ultimate/themes run build`
Expected: both succeed.

Then run: `pnpm run provenance:validate && npx prettier --check packages/themes docs/architecture/provenance/themes.json docs/architecture/PACKAGE_ARCHITECTURE.md`
Expected: both pass.

- [ ] **Step 10: Commit**

```bash
git add packages/themes docs/architecture/provenance/themes.json docs/architecture/PACKAGE_ARCHITECTURE.md
git commit -m "feat(themes): port the Aura badge, inputgroup and paginator modules (GAP-064)"
```

---

### Task 3: `registerComponentStyle` additional preset keys (`@ultimate/vue-core`)

**Files:**

- Modify: `packages/vue-core/src/styling/vue-style-sheet.ts:28-46`
- Create: `packages/vue-core/src/styling/additional-preset-keys.spec.ts`
- Modify: `packages/vue-core/README.md:23`

**Interfaces:**

- Produces: `registerComponentStyle(componentName: string, styleModule: StyleModule, additionalPresetKeys?: readonly string[]): void`. For each additional key it calls `registerThemeVariables(vueCoreStyleSheet, key)`, after the component's own variables and before its structural CSS. Task 4 calls it from Vue `InputNumber`.

- [ ] **Step 1: Write the failing tests**

Create `packages/vue-core/src/styling/additional-preset-keys.spec.ts`:

```ts
import { afterEach, beforeAll, describe, expect, expectTypeOf, it } from "vitest";
import { Theme } from "@ultimate/uix-styled";
import type { StyleModule } from "../base/base-component";
import { registerComponentStyle, vueCoreStyleSheet } from "./vue-style-sheet";

/**
 * ADR-051 / GAP-064 D2: registerComponentStyle's optional additionalPresetKeys
 * registers theme VARIABLES for further preset keys and never structural CSS
 * under them. Omitting it keeps the existing behavior.
 */
const alphaStyle: StyleModule = { css: ".u-alpha { color: dt('alpha.color'); }", classes: {} };
const betaStyle: StyleModule = { css: ".u-beta { color: dt('beta.color'); }", classes: {} };

function keys(): string[] {
  return Array.from(document.head.querySelectorAll("style[data-u-style]")).map(
    (el) => el.getAttribute("data-u-style") ?? ""
  );
}

describe("registerComponentStyle — additionalPresetKeys (ADR-051)", () => {
  beforeAll(() => {
    Theme.setTheme({
      preset: {
        components: {
          alpha: { root: { color: "#111111" } },
          beta: { root: { color: "#222222" } },
          gamma: { root: { color: "#333333" } },
        },
      },
      options: { prefix: "u", darkModeSelector: "system", cssLayer: false },
    });
  });

  afterEach(() => {
    vueCoreStyleSheet.clear();
    document.head.querySelectorAll("style[data-u-style]").forEach((el) => el.remove());
  });

  it("keeps the existing signature and adds one optional readonly-array parameter", () => {
    expectTypeOf(registerComponentStyle).parameters.toEqualTypeOf<
      [componentName: string, styleModule: StyleModule, additionalPresetKeys?: readonly string[]]
    >();
    expectTypeOf(registerComponentStyle).returns.toEqualTypeOf<void>();
  });

  it("without additional keys registers exactly the existing elements, in order", () => {
    registerComponentStyle("alpha", alphaStyle);
    expect(keys()).toEqual([
      "u-hidden-accessible",
      "u-common-variables",
      "alpha-variables",
      "alpha",
    ]);
  });

  it("an empty list behaves exactly like an omitted one", () => {
    registerComponentStyle("alpha", alphaStyle, []);
    expect(keys()).toEqual([
      "u-hidden-accessible",
      "u-common-variables",
      "alpha-variables",
      "alpha",
    ]);
  });

  it("registers additional keys' variables in the given order, before the structural CSS, and no structural CSS under them", () => {
    registerComponentStyle("alpha", alphaStyle, ["gamma", "beta"]);
    expect(keys()).toEqual([
      "u-hidden-accessible",
      "u-common-variables",
      "alpha-variables",
      "gamma-variables",
      "beta-variables",
      "alpha",
    ]);
    expect(
      document.head.querySelector('style[data-u-style="gamma-variables"]')?.textContent
    ).toContain("--u-gamma-color:");
    expect(keys()).not.toContain("beta");
    expect(keys()).not.toContain("gamma");
  });

  it("is idempotent across repeated registrations (Review Focus 2)", () => {
    registerComponentStyle("alpha", alphaStyle, ["beta"]);
    registerComponentStyle("alpha", alphaStyle, ["beta"]);
    expect(keys()).toEqual([
      "u-hidden-accessible",
      "u-common-variables",
      "alpha-variables",
      "beta-variables",
      "alpha",
    ]);
  });

  it("does not block the additional key's own component from registering its structural CSS, in either order (Review Focus 1)", () => {
    registerComponentStyle("alpha", alphaStyle, ["beta"]);
    registerComponentStyle("beta", betaStyle);
    expect(keys().filter((k) => k === "beta-variables")).toHaveLength(1);
    expect(document.head.querySelector('style[data-u-style="beta"]')?.textContent).toContain(
      ".u-beta"
    );

    vueCoreStyleSheet.clear();
    document.head.querySelectorAll("style[data-u-style]").forEach((el) => el.remove());

    registerComponentStyle("beta", betaStyle);
    registerComponentStyle("alpha", alphaStyle, ["beta"]);
    expect(keys().filter((k) => k === "beta-variables")).toHaveLength(1);
    expect(document.head.querySelector('style[data-u-style="beta"]')?.textContent).toContain(
      ".u-beta"
    );
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter @ultimate/vue-core test -- additional-preset-keys`
Expected:

- the ordering, idempotence and reverse-order tests FAIL, because no `gamma-variables`/`beta-variables` element is created;
- the two "existing elements" tests PASS.

Run: `pnpm --filter @ultimate/vue-core run typecheck`
Expected: FAIL on the `expectTypeOf(...).parameters` assertion and on the three-argument calls (`Expected 2 arguments, but got 3`).

- [ ] **Step 3: Implement**

In `packages/vue-core/src/styling/vue-style-sheet.ts`, replace the comment block above `registerComponentStyle` and the function itself (lines 28–46) with:

```ts
// Registers styleModule with vueCoreStyleSheet exactly once per componentName
// (has()/add() guard) — called from createBaseComponent's mounted()
// lifecycle point. StyleSheet.add(key, css) takes the CSS string directly
// (verified against packages/uix-styled/src/stylesheet/index.ts — not a meta
// object) and builds the StyleMeta + calls createStyleElement internally,
// matching react-core's/ng-core's identical has()/add(componentName,
// styleModule.css) call shape.
//
// additionalPresetKeys (ADR-051): further Aura preset keys whose theme
// VARIABLES this component's structural CSS consumes. Only their variables
// are registered — never structural CSS under those keys, which belong to
// their own components.
export function registerComponentStyle(
  componentName: string,
  styleModule: StyleModule,
  additionalPresetKeys: readonly string[] = []
): void {
  registerHiddenAccessible(vueCoreStyleSheet);

  // Theme variable DEFINITIONS first — the structural CSS below refers to
  // them via dt()-resolved var(--u-*) references, which resolve to nothing
  // unless something also defines the properties. Idempotent per its own
  // has() guards; see registerThemeVariables' doc comment.
  registerThemeVariables(vueCoreStyleSheet, componentName);
  for (const presetKey of additionalPresetKeys) {
    registerThemeVariables(vueCoreStyleSheet, presetKey);
  }

  if (vueCoreStyleSheet.has(componentName)) return;
  vueCoreStyleSheet.add(
    componentName,
    css`
      ${styleModule.css}
    `
  );
}
```

- [ ] **Step 4: Document it**

In `packages/vue-core/README.md:23`, replace `` `registerComponentStyle(componentName, styleModule)` (called from `createBaseComponent`'s `mounted()` hook). `` with `` `registerComponentStyle(componentName, styleModule, additionalPresetKeys?)` (called from `createBaseComponent`'s `mounted()` hook; the optional `additionalPresetKeys` also registers the theme variables of further Aura preset keys the component's CSS consumes, never structural CSS under them — ADR-051). ``

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm --filter @ultimate/vue-core test && pnpm --filter @ultimate/vue-core run typecheck`
Expected: all pass, including the existing `styling.spec.ts` and `test/exports.test.ts`, which are unchanged.

Run: `pnpm --filter @ultimate/vue-core run build`
Expected: success. Downstream Vue tests use this `dist`.

- [ ] **Step 6: Commit**

```bash
git add packages/vue-core/src/styling/vue-style-sheet.ts packages/vue-core/src/styling/additional-preset-keys.spec.ts packages/vue-core/README.md
git commit -m "feat(vue-core): register additional preset keys' theme variables (ADR-051)"
```

---

### Task 4: Vue style keys and InputNumber's `inputtext` variables

**Files:**

- Create: `packages/vue/src/aura-token-wiring.spec.ts`
- Modify (key literal only, 18 sites): `packages/vue/src/cascade-select/BaseCascadeSelect.ts:42`, `color-picker/BaseColorPicker.ts:28`, `date-picker/BaseDatePicker.ts:59`, `file-upload/BaseFileUpload.ts:18` and `:44`, `float-label/BaseFloatLabel.ts:15`, `icon-field/BaseIconField.ts:11`, `ifta-label/BaseIftaLabel.ts:12`, `input-chips/BaseInputChips.ts:24`, `input-group/BaseInputGroup.ts:10`, `input-number/BaseInputNumber.ts:47`, `input-otp/BaseInputOtp.ts:32`, `input-text/BaseInputText.ts:34`, `multi-select/BaseMultiSelect.ts:47`, `radio-button/BaseRadioButton.ts:41`, `select-button/BaseSelectButton.ts:37`, `toggle-button/BaseToggleButton.ts:52`, `toggle-switch/BaseToggleSwitch.ts:48` (all under `packages/vue/src/`)

**Interfaces:**

- Consumes: Task 2's built `@ultimate/themes`; Task 3's built `@ultimate/vue-core` with `registerComponentStyle(name, module, additionalPresetKeys?)`.

- [ ] **Step 1: Write the failing tests**

Create `packages/vue/src/aura-token-wiring.spec.ts`:

```ts
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import type { Component } from "vue";
import { applyUltimateTheme } from "@ultimate/themes";
import { vueCoreStyleSheet } from "@ultimate/vue-core";
import { UBadge } from "./badge";
import { UCascadeSelect } from "./cascade-select";
import { UColorPicker } from "./color-picker";
import { UDatePicker } from "./date-picker";
import { UFileUpload } from "./file-upload";
import { UFloatLabel } from "./float-label";
import { UIconField } from "./icon-field";
import { UIftaLabel } from "./ifta-label";
import { UInputChips } from "./input-chips";
import { UInputGroup } from "./input-group";
import { UInputNumber } from "./input-number";
import { UInputOtp } from "./input-otp";
import { UInputText } from "./input-text";
import { UMultiSelect } from "./multi-select";
import { UPaginator } from "./paginator";
import { URadioButton } from "./radio-button";
import { USelectButton } from "./select-button";
import { UToggleButton } from "./toggle-button";
import { UToggleSwitch } from "./toggle-switch";

/**
 * GAP-064 Tranche 1 (ADR-051; Spec §8 criteria 1–3). Assertions are made on
 * the generated <style data-u-style> elements, not on source componentName
 * values.
 */
const KEY_ATTR = "data-u-style";

interface Case {
  name: string;
  component: Component;
  key: string;
  /** Pre-rename key; absent for components whose key does not change. */
  oldKey?: string;
  /** Approved unresolved references (Spec §4.5 E1–E3); empty means none. */
  unresolved: readonly string[];
}

const CASES: readonly Case[] = [
  {
    name: "UCascadeSelect",
    component: UCascadeSelect,
    key: "cascadeselect",
    oldKey: "cascade-select",
    unresolved: [
      "--u-cascadeselect-empty-message-padding",
      "--u-cascadeselect-option-disabled-color",
    ],
  },
  {
    name: "UColorPicker",
    component: UColorPicker,
    key: "colorpicker",
    oldKey: "color-picker",
    unresolved: ["--u-colorpicker-preview-border-color"],
  },
  {
    name: "UDatePicker",
    component: UDatePicker,
    key: "datepicker",
    oldKey: "date-picker",
    unresolved: [
      "--u-datepicker-day-border-radius",
      "--u-datepicker-day-cell-padding",
      "--u-datepicker-day-color",
      "--u-datepicker-day-height",
      "--u-datepicker-day-selected-background",
      "--u-datepicker-day-selected-color",
      "--u-datepicker-day-selected-focus-shadow",
      "--u-datepicker-day-width",
      "--u-datepicker-select-month-font-weight",
    ],
  },
  {
    name: "UFileUpload",
    component: UFileUpload,
    key: "fileupload",
    oldKey: "file-upload",
    unresolved: [
      "--u-button-border-radius",
      "--u-button-secondary-background",
      "--u-fileupload-content-border-color",
      "--u-fileupload-content-border-radius",
      "--u-fileupload-content-color",
      "--u-fileupload-content-highlight-background",
      "--u-fileupload-file-actions-color",
      "--u-fileupload-file-size-color",
      "--u-message-error-background",
      "--u-message-error-color",
    ],
  },
  {
    name: "UFloatLabel",
    component: UFloatLabel,
    key: "floatlabel",
    oldKey: "float-label",
    unresolved: [],
  },
  {
    name: "UIconField",
    component: UIconField,
    key: "iconfield",
    oldKey: "icon-field",
    unresolved: [],
  },
  {
    name: "UIftaLabel",
    component: UIftaLabel,
    key: "iftalabel",
    oldKey: "ifta-label",
    unresolved: [],
  },
  {
    name: "UInputChips",
    component: UInputChips,
    key: "inputchips",
    oldKey: "input-chips",
    unresolved: ["--u-inputchips-chip-focus-color"],
  },
  {
    name: "UInputGroup",
    component: UInputGroup,
    key: "inputgroup",
    oldKey: "input-group",
    unresolved: [],
  },
  {
    name: "UInputNumber",
    component: UInputNumber,
    key: "inputnumber",
    oldKey: "input-number",
    unresolved: [],
  },
  { name: "UInputOtp", component: UInputOtp, key: "inputotp", oldKey: "input-otp", unresolved: [] },
  {
    name: "UInputText",
    component: UInputText,
    key: "inputtext",
    oldKey: "input-text",
    unresolved: [],
  },
  {
    name: "UMultiSelect",
    component: UMultiSelect,
    key: "multiselect",
    oldKey: "multi-select",
    unresolved: ["--u-multiselect-option-disabled-color"],
  },
  {
    name: "URadioButton",
    component: URadioButton,
    key: "radiobutton",
    oldKey: "radio-button",
    unresolved: [],
  },
  {
    name: "USelectButton",
    component: USelectButton,
    key: "selectbutton",
    oldKey: "select-button",
    unresolved: [],
  },
  {
    name: "UToggleButton",
    component: UToggleButton,
    key: "togglebutton",
    oldKey: "toggle-button",
    unresolved: [],
  },
  {
    name: "UToggleSwitch",
    component: UToggleSwitch,
    key: "toggleswitch",
    oldKey: "toggle-switch",
    unresolved: [],
  },
  { name: "UBadge", component: UBadge, key: "badge", unresolved: [] },
  { name: "UPaginator", component: UPaginator, key: "paginator", unresolved: [] },
];

function styleElements(): HTMLStyleElement[] {
  return Array.from(document.head.querySelectorAll<HTMLStyleElement>(`style[${KEY_ATTR}]`));
}

function count(key: string): number {
  return styleElements().filter((el) => el.getAttribute(KEY_ATTR) === key).length;
}

function cssFor(key: string): string {
  return styleElements()
    .filter((el) => el.getAttribute(KEY_ATTR) === key)
    .map((el) => el.textContent ?? "")
    .join("\n");
}

/** var(--u-…) references in `key`'s structural CSS that no registered <style> defines. */
function unresolvedReferences(key: string): string[] {
  const refs = new Set(Array.from(cssFor(key).matchAll(/var\(\s*(--u-[a-z0-9-]+)/g), (m) => m[1]));
  const allCss = styleElements()
    .map((el) => el.textContent ?? "")
    .join("\n");
  const defined = new Set(Array.from(allCss.matchAll(/(--u-[a-z0-9-]+)\s*:/g), (m) => m[1]));
  return [...refs].filter((name) => !defined.has(name)).sort();
}

function resetRegistry(): void {
  vueCoreStyleSheet.clear();
  styleElements().forEach((el) => el.remove());
}

describe("GAP-064 Tranche 1 — Vue style keys and variables", () => {
  beforeAll(() => {
    applyUltimateTheme();
  });

  beforeEach(() => {
    resetRegistry();
  });

  describe.each(CASES)("$name", (c) => {
    it(`registers its structural CSS and variables under "${c.key}" and nothing under the old key (C1)`, () => {
      mount(c.component);
      expect(count(c.key)).toBe(1);
      expect(count(`${c.key}-variables`)).toBe(1);
      expect(cssFor(`${c.key}-variables`)).toContain(`--u-${c.key}-`);
      if (c.oldKey) {
        expect(count(c.oldKey)).toBe(0);
        expect(count(`${c.oldKey}-variables`)).toBe(0);
      }
    });

    it("resolves every referenced variable except exactly the approved exceptions (C2)", () => {
      mount(c.component);
      const actual = unresolvedReferences(c.key);
      const unexpected = actual.filter((name) => !c.unresolved.includes(name));
      const notObserved = c.unresolved.filter((name) => !actual.includes(name));
      expect(unexpected, "unresolved but not in the approved exception list").toEqual([]);
      expect(notObserved, "approved exception not observed as unresolved").toEqual([]);
    });
  });

  it("keeps one element per key when a component is mounted twice (Review Focus 2)", () => {
    mount(UInputText);
    mount(UInputText);
    expect(count("inputtext")).toBe(1);
    expect(count("inputtext-variables")).toBe(1);
  });

  describe("InputNumber additional preset key (C3)", () => {
    it("alone registers inputnumber, inputnumber-variables and inputtext-variables, and no inputtext structural CSS", () => {
      mount(UInputNumber);
      expect(count("inputnumber")).toBe(1);
      expect(count("inputnumber-variables")).toBe(1);
      expect(count("inputtext-variables")).toBe(1);
      expect(count("inputtext")).toBe(0);
    });

    it("InputNumber then InputText: InputText's own structural CSS under inputtext, one inputtext-variables (Review Focus 1)", () => {
      mount(UInputNumber);
      mount(UInputText);
      expect(count("inputtext")).toBe(1);
      expect(cssFor("inputtext")).toContain(".u-input-text");
      expect(count("inputtext-variables")).toBe(1);
    });

    it("InputText then InputNumber: the same set (Review Focus 1)", () => {
      mount(UInputText);
      mount(UInputNumber);
      expect(count("inputtext")).toBe(1);
      expect(cssFor("inputtext")).toContain(".u-input-text");
      expect(count("inputtext-variables")).toBe(1);
      expect(count("inputnumber")).toBe(1);
    });
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter @ultimate/vue test -- aura-token-wiring`
Expected:

- every renamed case FAILS C1, because `count("<new key>")` is `0`;
- Badge and Paginator PASS C1 and C2, since Task 2 is already built;
- the InputNumber C3 tests FAIL.

If Badge or Paginator fails, stop: Task 2's build is missing.

- [ ] **Step 3: Rename the 18 sites**

At each site listed under **Files**, change only the key string literal, as mapped in Spec §4.2. In `BaseFileUpload.ts`, change **both** line 18 (`createBaseComponent({ componentName: "file-upload", … })`) and line 44 (`registerComponentStyle("file-upload", …)`) to `"fileupload"`. In `BaseInputNumber.ts:47`, write:

```ts
registerComponentStyle("inputnumber", inputNumberStyleModule, ["inputtext"]);
```

Then confirm that no old key is left:

```bash
grep -rnE "(componentName\s*:\s*|registerComponentStyle\()\"(cascade-select|color-picker|date-picker|file-upload|float-label|icon-field|ifta-label|input-chips|input-group|input-number|input-otp|input-text|multi-select|radio-button|select-button|toggle-button|toggle-switch)\"" packages/vue/src
```

Expected: no output. `input-group-addon` and `input-icon` keep their keys and do not match this pattern.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm --filter @ultimate/vue test -- aura-token-wiring`
Expected: all pass.

If a C2 case fails with a non-empty `unexpected` or `notObserved` list, **stop and report** the component and both lists (Global Constraints). Do not edit `unresolved`.

- [ ] **Step 5: Run the full Vue suite and typecheck**

Run: `pnpm --filter @ultimate/vue test && pnpm --filter @ultimate/vue run typecheck`
Expected: all pass. No existing test asserts the old keys (verified on `f05bd9b`).

- [ ] **Step 6: Commit**

```bash
git add packages/vue/src
git commit -m "fix(vue): register Aura-consuming components under upstream preset keys (GAP-064)"
```

---

### Task 5: Angular style keys, contract boundary and SSR reuse

**Files:**

- Create: `packages/ng/src/aura-token-wiring.spec.ts`
- Modify (key literal only, 16 sites): `packages/ng/src/cascade-select/cascade-select.ts:129`, `color-picker/color-picker.ts:96`, `date-picker/date-picker.ts:168`, `file-upload/file-upload.ts:160`, `float-label/float-label.ts:41`, `icon-field/icon-field.ts:34`, `ifta-label/ifta-label.ts:30`, `input-group/input-group.ts:29`, `input-number/input-number.ts:106`, `input-otp/input-otp.ts:81`, `input-text/input-text.ts:86`, `multi-select/multi-select.ts:129`, `radio-button/radio-button.ts:78`, `select-button/select-button.ts:88`, `toggle-button/toggle-button.ts:62`, `toggle-switch/toggle-switch.ts:56` (all under `packages/ng/src/`)
- Modify: `apps/playground-angular/src/app/proof-page.component.ts` (import `UInputText`, one section, doc comment)
- Modify: `apps/playground-angular/e2e/ssr-hydration.spec.ts:386-413` (GAP-078 test)

**Interfaces:**

- Consumes: Task 2's built `@ultimate/themes`.

- [ ] **Step 1: Write the failing unit tests**

Create `packages/ng/src/aura-token-wiring.spec.ts`:

```ts
import { ChangeDetectionStrategy, Component, PLATFORM_ID, type Type } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { TestBed } from "@angular/core/testing";
import { beforeAll, describe, expect, it } from "vitest";
import { applyUltimateTheme } from "@ultimate/themes";
import { UBadge } from "./badge";
import { UCascadeSelect } from "./cascade-select";
import { UColorPicker } from "./color-picker";
import { UDatePicker } from "./date-picker";
import { UFileUpload } from "./file-upload";
import { UFloatLabel } from "./float-label";
import { UIconField } from "./icon-field";
import { UIftaLabel } from "./ifta-label";
import { UInputGroup } from "./input-group";
import { UInputNumber } from "./input-number";
import { UInputOtp } from "./input-otp";
import { UInputText } from "./input-text";
import { UMultiSelect } from "./multi-select";
import { UPaginator } from "./paginator";
import { URadioButton } from "./radio-button";
import { USelectButton } from "./select-button";
import { UToggleButton } from "./toggle-button";
import { UToggleSwitch } from "./toggle-switch";

/**
 * GAP-064 Tranche 1 (ADR-051; Spec §8 criteria 1, 2, 4). Assertions are made
 * on the generated <style data-u-ng-style> elements, not on source
 * componentName values. Each case mounts into a fresh document under a server
 * PLATFORM_ID, which gives it a fresh per-document registry (GAP-078) — the
 * same isolation base-component.spec.ts uses.
 */
const KEY_ATTR = "data-u-ng-style";

/** `UInputText` is an attribute directive, so it is mounted on a host input. */
@Component({
  standalone: true,
  selector: "u-aura-token-wiring-input-text-host",
  imports: [UInputText],
  template: `<input uInputText />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class InputTextHost {}

interface Case {
  name: string;
  type: Type<unknown>;
  key: string;
  /** Pre-rename key; absent for components whose key does not change. */
  oldKey?: string;
  /** Approved unresolved references (Spec §4.5 E1–E2); empty means none. */
  unresolved: readonly string[];
}

const CASES: readonly Case[] = [
  {
    name: "UCascadeSelect",
    type: UCascadeSelect,
    key: "cascadeselect",
    oldKey: "cascade-select",
    unresolved: [
      "--u-cascadeselect-empty-message-padding",
      "--u-cascadeselect-option-disabled-color",
    ],
  },
  {
    name: "UColorPicker",
    type: UColorPicker,
    key: "colorpicker",
    oldKey: "color-picker",
    unresolved: ["--u-colorpicker-preview-border-color"],
  },
  {
    name: "UDatePicker",
    type: UDatePicker,
    key: "datepicker",
    oldKey: "date-picker",
    unresolved: [
      "--u-datepicker-day-border-radius",
      "--u-datepicker-day-cell-padding",
      "--u-datepicker-day-color",
      "--u-datepicker-day-height",
      "--u-datepicker-day-selected-background",
      "--u-datepicker-day-selected-color",
      "--u-datepicker-day-selected-focus-shadow",
      "--u-datepicker-day-width",
      "--u-datepicker-select-month-font-weight",
    ],
  },
  {
    name: "UFileUpload",
    type: UFileUpload,
    key: "fileupload",
    oldKey: "file-upload",
    unresolved: [
      "--u-button-border-radius",
      "--u-button-secondary-background",
      "--u-fileupload-content-border-color",
      "--u-fileupload-content-border-radius",
      "--u-fileupload-content-color",
      "--u-fileupload-content-highlight-background",
      "--u-fileupload-file-actions-color",
      "--u-fileupload-file-info-border-radius",
      "--u-fileupload-file-size-color",
      "--u-message-error-background",
      "--u-message-error-color",
    ],
  },
  {
    name: "UFloatLabel",
    type: UFloatLabel,
    key: "floatlabel",
    oldKey: "float-label",
    unresolved: [],
  },
  { name: "UIconField", type: UIconField, key: "iconfield", oldKey: "icon-field", unresolved: [] },
  { name: "UIftaLabel", type: UIftaLabel, key: "iftalabel", oldKey: "ifta-label", unresolved: [] },
  {
    name: "UInputGroup",
    type: UInputGroup,
    key: "inputgroup",
    oldKey: "input-group",
    unresolved: [],
  },
  {
    name: "UInputNumber",
    type: UInputNumber,
    key: "inputnumber",
    oldKey: "input-number",
    unresolved: [],
  },
  { name: "UInputOtp", type: UInputOtp, key: "inputotp", oldKey: "input-otp", unresolved: [] },
  {
    name: "UInputText",
    type: InputTextHost,
    key: "inputtext",
    oldKey: "input-text",
    unresolved: [],
  },
  {
    name: "UMultiSelect",
    type: UMultiSelect,
    key: "multiselect",
    oldKey: "multi-select",
    unresolved: ["--u-multiselect-option-disabled-color"],
  },
  {
    name: "URadioButton",
    type: URadioButton,
    key: "radiobutton",
    oldKey: "radio-button",
    unresolved: [],
  },
  {
    name: "USelectButton",
    type: USelectButton,
    key: "selectbutton",
    oldKey: "select-button",
    unresolved: [],
  },
  {
    name: "UToggleButton",
    type: UToggleButton,
    key: "togglebutton",
    oldKey: "toggle-button",
    unresolved: [],
  },
  {
    name: "UToggleSwitch",
    type: UToggleSwitch,
    key: "toggleswitch",
    oldKey: "toggle-switch",
    unresolved: [],
  },
  { name: "UBadge", type: UBadge, key: "badge", unresolved: [] },
  { name: "UPaginator", type: UPaginator, key: "paginator", unresolved: [] },
];

function mountInFreshDocument(type: Type<unknown>, times = 1): Document {
  const doc = document.implementation.createHTMLDocument("aura-token-wiring");
  TestBed.configureTestingModule({
    providers: [
      { provide: DOCUMENT, useValue: doc },
      { provide: PLATFORM_ID, useValue: "server" },
    ],
  });
  for (let i = 0; i < times; i++) TestBed.createComponent(type).detectChanges();
  return doc;
}

function styleElements(doc: Document): HTMLStyleElement[] {
  return Array.from(doc.head.querySelectorAll<HTMLStyleElement>(`style[${KEY_ATTR}]`));
}

function count(doc: Document, key: string): number {
  return styleElements(doc).filter((el) => el.getAttribute(KEY_ATTR) === key).length;
}

function cssFor(doc: Document, key: string): string {
  return styleElements(doc)
    .filter((el) => el.getAttribute(KEY_ATTR) === key)
    .map((el) => el.textContent ?? "")
    .join("\n");
}

/** var(--u-…) references in `key`'s structural CSS that no registered <style> defines. */
function unresolvedReferences(doc: Document, key: string): string[] {
  const refs = new Set(
    Array.from(cssFor(doc, key).matchAll(/var\(\s*(--u-[a-z0-9-]+)/g), (m) => m[1])
  );
  const allCss = styleElements(doc)
    .map((el) => el.textContent ?? "")
    .join("\n");
  const defined = new Set(Array.from(allCss.matchAll(/(--u-[a-z0-9-]+)\s*:/g), (m) => m[1]));
  return [...refs].filter((name) => !defined.has(name)).sort();
}

describe("GAP-064 Tranche 1 — Angular style keys and variables", () => {
  beforeAll(() => {
    applyUltimateTheme();
  });

  describe.each(CASES)("$name", (c) => {
    it(`registers its structural CSS and variables under "${c.key}" and nothing under the old key (C1)`, () => {
      const doc = mountInFreshDocument(c.type);
      expect(count(doc, c.key)).toBe(1);
      expect(count(doc, `${c.key}-variables`)).toBe(1);
      expect(cssFor(doc, `${c.key}-variables`)).toContain(`--u-${c.key}-`);
      if (c.oldKey) {
        expect(count(doc, c.oldKey)).toBe(0);
        expect(count(doc, `${c.oldKey}-variables`)).toBe(0);
      }
    });

    it("resolves every referenced variable except exactly the approved exceptions (C2)", () => {
      const doc = mountInFreshDocument(c.type);
      const actual = unresolvedReferences(doc, c.key);
      const unexpected = actual.filter((name) => !c.unresolved.includes(name));
      const notObserved = c.unresolved.filter((name) => !actual.includes(name));
      expect(unexpected, "unresolved but not in the approved exception list").toEqual([]);
      expect(notObserved, "approved exception not observed as unresolved").toEqual([]);
    });
  });

  it("keeps one element per key when a component is mounted twice (Review Focus 2)", () => {
    const doc = mountInFreshDocument(InputTextHost, 2);
    expect(count(doc, "inputtext")).toBe(1);
    expect(count(doc, "inputtext-variables")).toBe(1);
  });

  it("keeps componentName protected (type-checked, D1 contract boundary)", () => {
    const read = (directive: UInputText): unknown =>
      // @ts-expect-error componentName is protected on every Ultimate component
      directive.componentName;
    expect(typeof read).toBe("function");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter @ultimate/ng exec ng test --project=ng --include=src/aura-token-wiring.spec.ts --watch=false`
Expected:

- every renamed case FAILS C1 (`count(doc, "<new key>")` is `0`);
- Badge and Paginator PASS;
- the "protected" test PASSES. It is type-level, and fails only if the access ever becomes legal (TS2578 unused `@ts-expect-error`).

- [ ] **Step 3: Rename the 16 sites**

At each site listed under **Files**, change only the string literal of `protected override readonly componentName = "…";` to the upstream key (Spec §4.2). `input-group.ts:57` (`input-group-addon`) stays unchanged. Then confirm:

```bash
grep -rnE "componentName = \"(cascade-select|color-picker|date-picker|file-upload|float-label|icon-field|ifta-label|input-group|input-number|input-otp|input-text|multi-select|radio-button|select-button|toggle-button|toggle-switch)\"" packages/ng/src
```

Expected: no output.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm --filter @ultimate/ng exec ng test --project=ng --include=src/aura-token-wiring.spec.ts --watch=false`
Expected: all pass.

If a C2 case reports a non-empty `unexpected` or `notObserved` list, **stop and report** it. Do not edit `unresolved`.

- [ ] **Step 5: Extend the SSR test (red)**

In `apps/playground-angular/e2e/ssr-hydration.spec.ts`, in the GAP-078 test, add after `expect(body).toContain('data-u-ng-style="u-hidden-accessible"');`:

```ts
// GAP-064 Tranche 1 (ADR-051): a renamed component is server-rendered
// under the upstream preset key and adopted once on hydration.
expect(body).toContain('data-u-ng-style="inputtext"');
expect(body).toContain('data-u-ng-style="inputtext-variables"');
expect(body).not.toContain('data-u-ng-style="input-text"');
expect(body).not.toContain('data-u-ng-style="input-text-variables"');
```

and after `for (const [key, n] of Object.entries(counts)) expect(n, key).toBe(1);`:

```ts
expect(counts["inputtext"]).toBe(1);
expect(counts["inputtext-variables"]).toBe(1);
```

Run: `pnpm --filter-prod "playground-angular..." run build && TRACK_E_SSR_FRAMEWORK=ng npx playwright test --project=ng-ssr-chromium`
Expected: the GAP-078 test FAILS on `data-u-ng-style="inputtext"`, because the proof page has no InputText yet.

- [ ] **Step 6: Add `UInputText` to the SSR proof page (green)**

In `apps/playground-angular/src/app/proof-page.component.ts`:

- add `UInputText,` to the `@ultimate/ng` import list after `UDialog,`;
- add `UInputText` to `imports: [...]` after `UDialog`;
- in the doc comment, change `rendering all 8 `@ultimate/ng` components` to `rendering the 8 Track E `@ultimate/ng`components plus`UInputText` (GAP-064 Tranche 1 SSR key check)`;
- add this section before the Tooltip section:

```html
<section aria-labelledby="input-text-heading">
  <h2 id="input-text-heading">InputText</h2>
  <input uInputText aria-labelledby="input-text-heading" data-testid="input-text" />
</section>
```

Run: `pnpm --filter-prod "playground-angular..." run build && TRACK_E_SSR_FRAMEWORK=ng npx playwright test --project=ng-ssr-chromium`
Expected: all pass, including the GAP-078 test and "serves byte-identical SSR output across two separate requests".

- [ ] **Step 7: Run the full Angular suites and typecheck**

Run: `pnpm --filter @ultimate/ng test -- --watch=false && pnpm --filter @ultimate/ng run typecheck && pnpm --filter @ultimate/ng-core test -- --watch=false`
Expected: all pass. The typecheck also proves the `@ts-expect-error` is still needed.

- [ ] **Step 8: Commit**

```bash
git add packages/ng/src apps/playground-angular/src/app/proof-page.component.ts apps/playground-angular/e2e/ssr-hydration.spec.ts
git commit -m "fix(ng): register Aura-consuming components under upstream preset keys (GAP-064)"
```

---

### Task 6: Visual and accessibility review gate, then baseline update

This task has a **mandatory user review stop** (D6, Spec §8 criterion 7).

**Files:**

- Modify (only after approval): `packages/{ng,vue,react}/e2e/*-snapshots/*.png` for the reviewed tests
- Create: `docs/superpowers/plans/2026-10-04-gap-064-tranche-1-visual-review.md` (review record)

- [ ] **Step 1: Build and run every framework's browser projects**

Run:

```bash
pnpm run build
npx playwright test --project=ng-chromium --project=ng-firefox --project=ng-webkit --project=vue-chromium --project=vue-firefox --project=vue-webkit --project=react-chromium --project=react-firefox --project=react-webkit
```

Expected: the screenshot tests that show a token change fail with diffs. The expected set:

- the Task 1 specs;
- Angular `badge` and `paginator`;
- Vue `paginator`;
- React `paginator`;
- `table` in all three frameworks, if their paginator is in frame;
- Vue/React `button`, if a badge is in frame.

Every non-screenshot test passes.

- [ ] **Step 2: Run the accessibility baseline check**

Run: `pnpm run accessibility:validate`
Expected: pass. If new or removed violations appear (for example color-contrast changes on Badge or Paginator), add them to the review record. Do not change `ACCESSIBILITY_BASELINE.md`.

- [ ] **Step 3: Write the review record**

Create `docs/superpowers/plans/2026-10-04-gap-064-tranche-1-visual-review.md`. For each failing screenshot, list:

- the test title and project;
- the paths of its `-expected.png`, `-actual.png` and `-diff.png` under `test-results/`;
- a one-line description of the visible change (for example "input now has border, padding and background").

Mark every changed baseline that is **outside** the expected set as **UNEXPECTED**, with its cause investigated. Add any accessibility result from Step 2.

- [ ] **Step 4: STOP — user review**

Report the review record and hand over the `test-results/` images, or the Playwright HTML report (`npx playwright show-report`). Wait for explicit approval, which may approve only some baselines. Do not continue without it.

- [ ] **Step 5: Update only the approved baselines**

For each approved spec file, run `npx playwright test --project=<project> <spec file> --update-snapshots`, once per project. Then re-run Step 1's command without `--update-snapshots`.
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add packages/ng/e2e packages/vue/e2e packages/react/e2e docs/superpowers/plans/2026-10-04-gap-064-tranche-1-visual-review.md
git commit -m "test(gap-064): accept reviewed Tranche 1 screenshot baselines"
```

---

### Task 7: Contract boundary and gate verification

**Files:**

- Modify: `docs/superpowers/plans/2026-10-04-gap-064-tranche-1-visual-review.md` (append a "Verification" section with the command outputs). No source changes.

- [ ] **Step 1: Check the built Vue declarations for style-key literals (C4)**

Run:

```bash
pnpm --filter @ultimate/vue run build
grep -rlE "[\"'](cascade-?select|color-?picker|date-?picker|file-?upload|float-?label|icon-?field|ifta-?label|input-?chips|input-?group|input-?number|input-?otp|input-?text|multi-?select|radio-?button|select-?button|toggle-?button|toggle-?switch)[\"']" packages/vue/dist --include='*.d.mts'
grep -rho "componentName[^;,]*" packages/vue-core/dist --include='*.d.mts' | sort -u
```

Expected:

- the first `grep` has no output;
- the second prints only `componentName: string`.

- [ ] **Step 2: Check the export surfaces and the unit suites**

Run each of:

```bash
pnpm --filter @ultimate/uix-styled test
pnpm --filter @ultimate/vue-core test
pnpm --filter @ultimate/vue test
pnpm --filter @ultimate/react test
pnpm --filter @ultimate/react-core test
pnpm --filter @ultimate/themes test
pnpm --filter @ultimate/ng test -- --watch=false
pnpm --filter @ultimate/ng-core test -- --watch=false
pnpm run typecheck
pnpm run lint
pnpm run provenance:validate
pnpm --filter @ultimate/vue run validate
```

Expected: all pass, including each package's existing exports test.

Then run:

```bash
git diff main --stat -- packages/uix-styled packages/react packages/react-core packages/ng-core
```

Expected: no output.

- [ ] **Step 3: Check the scope boundary**

Run: `git diff main --name-only`
Expected: only files named in this plan's tasks.

Then run:

```bash
git diff main -- packages/ng/src packages/vue/src | grep -E "^[-+][^-+]" | grep -vE "componentName|registerComponentStyle|^\+\+\+|^---"
```

Expected: only lines from the new spec and story files. No CSS, template or other source line changes in component files.

- [ ] **Step 4: Run the size gate**

Run:

```bash
git fetch origin main
pnpm run build
pnpm run size:measure
pnpm run size:validate
```

Expected: pass. `@ultimate/themes` grows by three small modules, from about 13.1 KB gzip.

If any package exceeds the 15% threshold, **stop and report**. The established two-step procedure applies at merge (a separate `docs/architecture/PERFORMANCE.md`-only change re-measured on `main`, with an explicit human override). Nothing is overridden here.

- [ ] **Step 5: Record and commit**

Append each command's result to the review record's "Verification" section.

```bash
git add docs/superpowers/plans/2026-10-04-gap-064-tranche-1-visual-review.md
git commit -m "docs(gap-064): record Tranche 1 verification results"
```

---

### Task 8 (only if approved at Plan Review): `MIGRATION.md` note

**Files:**

- Modify: `docs/architecture/MIGRATION.md` §8 (append a new paragraph block at the end of §8)

- [ ] **Step 1: Add the entry**

Append to `docs/architecture/MIGRATION.md` §8:

```markdown
Added for GAP-064 Tranche 1 (`feature/gap-064-aura-token-wiring`), same status — unreleased, no changesets:

- **`@ultimate/ng`, `@ultimate/vue` — Aura tokens now apply to 16 Angular and 17 Vue form components, and to Badge, InputGroup and Paginator.** These components (CascadeSelect, ColorPicker, DatePicker, FileUpload, FloatLabel, IconField, IftaLabel, InputGroup, InputNumber, InputOtp, InputText, MultiSelect, RadioButton, SelectButton, ToggleButton, ToggleSwitch; Vue also InputChips) previously referenced theme variables that were never defined. They now render with their Aura values and follow theme customization. Visual appearance changes accordingly. (ADR-051.)
- **`@ultimate/react` — Paginator** now receives the Aura `paginator` variables it already referenced, so its appearance changes too.
- **Generated `<style>` keys changed** for the components above (`data-u-ng-style` / `data-u-style`, for example `input-text` → `inputtext`, `input-text-variables` → `inputtext-variables`). These keys are internal, not a supported contract; CSS or scripts that selected these elements by key must use the new values.
- **`@ultimate/vue-core` — `registerComponentStyle` takes an optional third parameter, `additionalPresetKeys`** (additive; existing calls unchanged).
```

- [ ] **Step 2: Check and commit**

Run: `npx prettier --check docs/architecture/MIGRATION.md`
Expected: pass.

```bash
git add docs/architecture/MIGRATION.md
git commit -m "docs(gap-064): record Tranche 1 consumer-visible changes in MIGRATION"
```

---

## After this plan

Final Review and Closeout are a separate gate. They cover the GAP-064 progress note in `BLUEPRINT_GAPS.md` (status stays PARTIAL), the closeout record, and merge or push decisions. None of them is part of this plan.
