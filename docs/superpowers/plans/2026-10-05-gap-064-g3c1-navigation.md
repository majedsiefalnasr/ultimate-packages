# GAP-064 G3-C1 — Navigation (Breadcrumb, Dock, Steps, Stepper, Tabs) Aura Styles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hand-written CSS of the 5 Angular and 5 Vue C1 style modules with the applicable `@primeuix/styles` 2.0.3 structural CSS, mapped to the existing Ultimate DOM, so Breadcrumb, Dock, Steps, Stepper and Tabs render with their registered Aura tokens — and prove it with fidelity, runtime, layout, screenshot and accessibility evidence.

**Architecture (G3-B model, Spec §8):**

- **One data module drives the port and its verification.** `packages/themes/test/utils/g3c1-port.mjs` holds the Spec §8 categories (D1 ported, D2 omitted, D3 base role, D5 retained; D4/D6 empty) as explicit data and turns the committed upstream fixture into the exact rule list of every style module. It imports `parseGroups`/`norm` from the unchanged `g3a-port.mjs`.
- **Static check (C3).** A themes test compares each style module's `css` with that list and pins every invariant. Implementers paste the module's CLI output into the style files.
- **Runtime checks (C1, C2, C3 state).** Per-framework unit specs mount the components and check style keys, variable resolution and state-selector matching on the real DOM.
- **Browser checks (C5, C6, C7).** Per-framework Playwright specs hold the screenshot, layout/computed-style and accessibility tests; baselines are recorded in Linux Docker before any CSS change and updated only after the user's review gate.
- **Accessibility differential (Spec §10, SR-C1-2).** A new tranche-scoped validator plus a dated pre-existing evidence file; CI wired on the G3-B model in Task 8 only.

**Tech Stack:** TypeScript 5.9, Angular (`@angular/build:unit-test`, Vitest, jsdom), Vue 3.5 (`@vue/test-utils`), Vitest, Storybook, Playwright 1.63, Docker `mcr.microsoft.com/playwright:v1.63.0-jammy` (native arm64, as CI's `ubuntu-24.04-arm` job), pnpm 9.6.0, Node 24.15.0.

**Spec:** `docs/superpowers/specs/2026-10-05-gap-064-g3c1-navigation-design.md` (Approved at Spec Review, `b31f2bb`; §15 decisions SR-C1-1..5). Research and decisions: `docs/architecture/research/2026-10-05-gap-064-g3c-menus-navigation-research.md` §9 C-1..C-11 (`6721085`). ADR-051.

**Status:** Approved at Plan Review (2026-10-06; decisions under "Plan Review Decisions", Spec Amendment A1 / PX-C2 applied). Implementation authorized from Task 1, with both hard gates.

## Global Constraints

- **Immutable baseline:** `2c8ef45` (`main` == `origin/main`, the G3-C branch point; the C1 branch adds only research/spec/plan docs on top) is the comparison point for every scope diff, size check and regression argument. `git fetch` may only refresh metadata.
- **Node:** every host command runs with Node 24.15.0: `export PATH=$HOME/.nvm/versions/node/v24.15.0/bin:$PATH`. Tests are run per package.
- **Workspace for evidence:** `.superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/` (git-ignored, persistent). Never `/tmp`. Below it is called `$SDD` in prose only; commands spell the literal path (the local `dcg` hook blocks redirects to variable paths, heredocs, `node -e` with `=>`, and commands containing `<template>`; use the Write tool for files).
- **Inventory (Spec §1, §3.1).** 5 keys: `breadcrumb`, `dock`, `steps`, `stepper`, `tabs`. 10 style files `packages/{ng,vue}/src/<key>/<key>-style.ts` (directory = key for all five). **No key rename** in C1 (all five already register their Aura key).
- **Counts invariant (Spec §5.6, §8).** Per framework D1 + D2 = exactly 90 upstream component groups: **Angular 79 + 11, Vue 81 + 9**. D3/D5 never count toward 90. Every emitted rule belongs to exactly one of D1, D3, D5, in canonical order D3 → D1 (upstream source order) → D5. D2 never appears. No other rule.
- **Exclusions:** exactly FX-C1..FX-C6 (Spec §5). **D3:** the disabled base-role pair for `breadcrumb`, `dock`, `stepper`, `tabs` only — never `steps` (PX-C1, SR-C1-1). **D5:** exactly R-C1, R-C2 (dock, both frameworks) and R-C3 (stepper, Angular only).
- **C4 — DOM unchanged.** In existing component files only the style module's `css` block (plus one added doc-comment line, G3 precedent) changes. Templates, `classes` resolvers, inputs/props/emits and component `.ts`/`.vue` files stay unchanged. No runtime JS, no DOM/class change, no state class.
- **CSS location.** Each framework's own style module holds its own copy; no shared export.
- **Tokens.** No unresolved reference in C1: every C2 exception list is empty. No new token, preset module or `@ultimate/themes` source change.
- **Screenshots (D-G3-7).** Before-baselines in Docker before any CSS change; default tolerance, never tightened; no baseline update without the user's review gate (Task 9). macOS screenshots are never baselines.
- **Accessibility.** No violation pre-baselined. Only user-approved rows enter `ACCESSIBILITY_BASELINE.md`.
- **Tooling freeze.** `g3a-port.mjs`, `g3b-port.mjs`, `validate-g3a-accessibility.mjs`, `validate-g3b-accessibility.mjs` (+ their tests), `validate-accessibility-baseline.mjs`, the G3-A/G3-B e2e specs, snapshots and evidence files stay byte-identical.
- **CI (SR-C1-2).** The only CI change is Task 8's: strict selection `--grep-invert "G3-A|G3-B|G3-C1"` plus the G3-C1 run/validate/upload steps. No CI change before Task 8; G3-A/G3-B steps byte-identical.
- **Size (C8).** 15% gate against `2c8ef45` is a hard stop: no split, no override, no rationalisation. Authoritative for Angular and Vue: the direct `2c8ef45`-build vs current-build `index.mjs` gzip comparison (Task 10 Step 4); `validate-bundle-size.mjs` is an additional check only (stale Angular baseline).
- **Mandatory regression:** `packages/vue/e2e/stepper.spec.ts` passes unchanged (Task 6 Step 5, Task 9 Step 1, Task 10 Step 2).
- **Stop rules (Spec §12).** Stop and report — never work around — on:
  1. any DOM/class/runtime change being needed, or any diff outside C4/C9 scope;
  2. any unresolved token;
  3. any fidelity, count, mapping or order mismatch with the Spec (fix only by a recorded Spec amendment);
  4. any unexpected visual change, failing regression screenshot, or introduced accessibility violation not approved at the gate;
  5. size above 15%;
  6. `stepper.spec.ts` failing;
  7. any need to edit fidelity data, exception lists, evidence files or test expectations to make a check pass;
  8. any need to alter frozen G3-A/G3-B tooling or the strict validator.
- **Out of scope (Spec §12):** G3-C2 (TieredMenu, ContextMenu, Menubar, MegaMenu, PanelMenu) and its renames; G3-D/G3-E; G3-B follow-ups U1, U2, Vue BlockUI; the `ng.json` `accordion.spec.ts` provenance gap; React; Ripple; Steps/Stepper readonly classes; Angular horizontal Stepper separators; Breadcrumb home-item disabled class; new GAP IDs. GAP-064 stays PARTIAL.
- **Git.** Conventional Commits, ending with the session attribution lines. Stage explicit paths only. No push, no merge.
- **Pre-existing failures** are recorded, not fixed: `lint` debt on `main`, Prettier debt in `BLUEPRINT_GAPS.md`/`DECISIONS.md`/`ACCESSIBILITY_BASELINE.md`, the `ng.json` `accordion.spec.ts` manifest gap (reported by `provenance:validate` without `--base-ref`), and the stale Angular `PERFORMANCE.md` size baseline.

## Review Focus

1. **Steps parity (PX-C1).** Disabled Steps items — including every non-active item of a readonly (default) Steps — lose their dimming (`0.6` → `1`). Steps Default therefore changes visually; this is approved, not a regression. Pinned by the Task 1 Steps layout test (`opacity: 1`) and the Task 4 state rows.
2. **Angular vertical Stepper (R-C3).** Ported group 22 sets `display: grid` on `.u-step-item .u-step-panel`; without R-C3 every inactive Angular panel would show. Pinned by the Task 1 Stepper layout test (exactly one visible panel) and the Task 4 `[hidden]` row.
3. **Tabs navigators (C-3).** The prev/next buttons carry only `u-tablist-prev-button` / `u-tablist-next-button`; the expanded selector list must position them absolutely at the tablist's inline edges. jsdom cannot overflow, so this is pinned in the browser only (Task 1 Tabs layout test); PR-C1-3.
4. **Dock magnification (R-C1/R-C2).** Upstream sets `cursor: default` and token size on the link; Ultimate's documented hover magnification must survive. Pinned by the Dock hover screenshot, the Dock layout test and the Task 4 `data-u-active` row.
5. **Vue horizontal separators (GAP-077).** `packages/vue/e2e/stepper.spec.ts` checks separators sit between headers on one row; the ported groups 2, 3, 15 replace the current layout literals.
6. **Steps focus exclusion (PX-C2, PR-C1-7).** The only adapted D1 selector in C1. A disabled item's link must not get the token focus ring, although PX-C1 restores its opacity. Pinned by the Task 3 PX-C2 test, the Task 4 rows and the Task 1 keyboard focus check in all three browsers.

---

### Task 1: Verification stories and G3-C1 e2e specs (screenshot, layout, accessibility)

**Files:**

- Modify (append stories): `packages/{ng,vue}/src/{dock,steps,stepper,tabs}/*.stories.ts`
- Create: `packages/ng/e2e/g3c1-aura-styles.spec.ts`, `packages/vue/e2e/g3c1-aura-styles.spec.ts`

**Interfaces:**

- Produces: story IDs used by Tasks 2, 8, 9 (17 ng, 17 vue; Spec §9.2, SR-C1-3); test titles `Ng|Vue/<Name> G3-C1 visual|layout|accessibility`. The `STORIES` table literal `story: "<id>"` is parsed by Task 8's validator.

- [ ] **Step 1: Angular verification stories (7)**

Append to `packages/ng/src/dock/dock.stories.ts`:

```ts
/** GAP-064 G3-C1 verification story (Spec §9.2): top position. */
export const TopPosition: Story = {
  args: { model, position: "top" },
};

/** GAP-064 G3-C1 verification story (Spec §9.2): right position. */
export const RightPosition: Story = {
  args: { model, position: "right" },
};

/** GAP-064 G3-C1 verification story (Spec §9.2): a disabled item. */
export const WithDisabledItem: Story = {
  args: {
    model: [model[0], { ...model[1], disabled: true }, model[2], model[3]],
    position: "bottom",
  },
};
```

Append to `packages/ng/src/steps/steps.stories.ts`:

```ts
/** GAP-064 G3-C1 verification story (Spec §9.2): an explicitly disabled item (PX-C1). */
export const WithDisabledItem: Story = {
  args: {
    model: [{ label: "Personal" }, { label: "Payment", disabled: true }, { label: "Confirmation" }],
    activeIndex: 0,
    readonly: false,
  },
};
```

Append to `packages/ng/src/stepper/stepper.stories.ts`, and add `import { UStepItem } from "./step-item";` to its imports:

```ts
/** GAP-064 G3-C1 verification story (Spec §9.2): vertical layout with step items. */
export const Vertical: Story = {
  args: { value: 1 },
  decorators: [moduleMetadata({ imports: [UStepItem] })],
  render: (args) => ({
    props: args,
    template: `
      <u-stepper [value]="value">
        <u-step-item [value]="1">
          <u-step [value]="1">Personal</u-step>
          <u-step-panel [value]="1">Personal details</u-step-panel>
        </u-step-item>
        <u-step-item [value]="2">
          <u-step [value]="2">Payment</u-step>
          <u-step-panel [value]="2">Payment details</u-step-panel>
        </u-step-item>
        <u-step-item [value]="3">
          <u-step [value]="3">Confirmation</u-step>
          <u-step-panel [value]="3">Confirmation</u-step-panel>
        </u-step-item>
      </u-stepper>
    `,
  }),
};
```

Append to `packages/ng/src/tabs/tabs.stories.ts`:

```ts
/** GAP-064 G3-C1 verification story (Spec §9.2): a disabled tab. */
export const WithDisabledTab: Story = {
  args: { value: 0 },
  render: (args) => ({
    props: args,
    template: `
      <u-tabs [value]="value">
        <u-tab-list>
          <u-tab [value]="0">Header 1</u-tab>
          <u-tab [value]="1" disabled>Header 2</u-tab>
          <u-tab [value]="2">Header 3</u-tab>
        </u-tab-list>
        <u-tab-panels>
          <u-tab-panel [value]="0">Content 1</u-tab-panel>
          <u-tab-panel [value]="1">Content 2</u-tab-panel>
          <u-tab-panel [value]="2">Content 3</u-tab-panel>
        </u-tab-panels>
      </u-tabs>
    `,
  }),
};

/** GAP-064 G3-C1 verification story (Spec §9.2): overflowing tabs show the navigators. */
export const WithNavigators: Story = {
  args: { value: 0 },
  render: (args) => ({
    props: args,
    template: `
      <div style="width: 20rem;">
        <u-tabs [value]="value">
          <u-tab-list>
            <u-tab [value]="0">Header 1</u-tab>
            <u-tab [value]="1">Header 2</u-tab>
            <u-tab [value]="2">Header 3</u-tab>
            <u-tab [value]="3">Header 4</u-tab>
            <u-tab [value]="4">Header 5</u-tab>
            <u-tab [value]="5">Header 6</u-tab>
          </u-tab-list>
          <u-tab-panels>
            <u-tab-panel [value]="0">Content 1</u-tab-panel>
            <u-tab-panel [value]="1">Content 2</u-tab-panel>
            <u-tab-panel [value]="2">Content 3</u-tab-panel>
            <u-tab-panel [value]="3">Content 4</u-tab-panel>
            <u-tab-panel [value]="4">Content 5</u-tab-panel>
            <u-tab-panel [value]="5">Content 6</u-tab-panel>
          </u-tab-panels>
        </u-tabs>
      </div>
    `,
  }),
};
```

- [ ] **Step 2: Vue verification stories (7)**

Append to `packages/vue/src/dock/dock.stories.ts`:

```ts
/** GAP-064 G3-C1 verification story (Spec §9.2): top position. */
export const TopPosition: Story = {
  args: { model, position: "top" },
};

/** GAP-064 G3-C1 verification story (Spec §9.2): right position. */
export const RightPosition: Story = {
  args: { model, position: "right" },
};

/** GAP-064 G3-C1 verification story (Spec §9.2): a disabled item. */
export const WithDisabledItem: Story = {
  args: {
    model: [model[0], { ...model[1], disabled: true }, model[2], model[3]],
    position: "bottom",
  },
};
```

Append to `packages/vue/src/steps/steps.stories.ts`:

```ts
/** GAP-064 G3-C1 verification story (Spec §9.2): an explicitly disabled item (PX-C1). */
export const WithDisabledItem: Story = {
  args: {
    model: [{ label: "Personal" }, { label: "Payment", disabled: true }, { label: "Confirmation" }],
    activeStep: 0,
    readonly: false,
  },
};
```

Append to `packages/vue/src/stepper/stepper.stories.ts`, and add `UStepItem` to its `./index` import:

```ts
/** GAP-064 G3-C1 verification story (Spec §9.2): vertical layout with step items. */
export const Vertical: Story = {
  render: () => ({
    components: { UStepper, UStepItem, UStep, UStepPanel },
    template: `
      <UStepper :value="1">
        <UStepItem :value="1">
          <UStep :value="1">Personal</UStep>
          <UStepPanel :value="1">Personal details</UStepPanel>
        </UStepItem>
        <UStepItem :value="2">
          <UStep :value="2">Payment</UStep>
          <UStepPanel :value="2">Payment details</UStepPanel>
        </UStepItem>
        <UStepItem :value="3">
          <UStep :value="3">Confirmation</UStep>
          <UStepPanel :value="3">Confirmation</UStepPanel>
        </UStepItem>
      </UStepper>
    `,
  }),
};
```

Append to `packages/vue/src/tabs/tabs.stories.ts`:

```ts
/** GAP-064 G3-C1 verification story (Spec §9.2): a disabled tab. */
export const WithDisabledTab: Story = {
  render: () => ({
    components: { UTabs, UTabList, UTab, UTabPanels, UTabPanel },
    template: `
      <UTabs :value="0">
        <UTabList>
          <UTab :value="0">Header 1</UTab>
          <UTab :value="1" disabled>Header 2</UTab>
          <UTab :value="2">Header 3</UTab>
        </UTabList>
        <UTabPanels>
          <UTabPanel :value="0">Content 1</UTabPanel>
          <UTabPanel :value="1">Content 2</UTabPanel>
          <UTabPanel :value="2">Content 3</UTabPanel>
        </UTabPanels>
      </UTabs>
    `,
  }),
};

/** GAP-064 G3-C1 verification story (Spec §9.2): overflowing tabs show the navigators. */
export const WithNavigators: Story = {
  render: () => ({
    components: { UTabs, UTabList, UTab, UTabPanels, UTabPanel },
    template: `
      <div style="width: 20rem;">
        <UTabs :value="0">
          <UTabList>
            <UTab :value="0">Header 1</UTab>
            <UTab :value="1">Header 2</UTab>
            <UTab :value="2">Header 3</UTab>
            <UTab :value="3">Header 4</UTab>
            <UTab :value="4">Header 5</UTab>
            <UTab :value="5">Header 6</UTab>
          </UTabList>
          <UTabPanels>
            <UTabPanel :value="0">Content 1</UTabPanel>
            <UTabPanel :value="1">Content 2</UTabPanel>
            <UTabPanel :value="2">Content 3</UTabPanel>
            <UTabPanel :value="3">Content 4</UTabPanel>
            <UTabPanel :value="4">Content 5</UTabPanel>
            <UTabPanel :value="5">Content 6</UTabPanel>
          </UTabPanels>
        </UTabs>
      </div>
    `,
  }),
};
```

No story uses an external resource (the Dock `pi pi-*` classes are inert: no icon font is loaded in Storybook). Existing stories are not changed.

- [ ] **Step 3: Create `packages/ng/e2e/g3c1-aura-styles.spec.ts`**

```ts
import { expect, test, type Locator, type Page } from "@playwright/test";
import { runAccessibilityScan, storyUrl } from "./accessibility-envelope";

/**
 * GAP-064 G3-C1 (Spec §9.2–§9.3, §10): screenshot, layout and accessibility
 * coverage for every story that exercises changed G3-C1 CSS. Baselines are
 * recorded in Linux Docker before any CSS change (Plan Task 2). Layout tests
 * that fail before the port are before-state evidence; only the after-port
 * results are acceptance criteria.
 */
const STORIES: ReadonlyArray<{ name: string; story: string; ready: string }> = [
  { name: "Breadcrumb Default", story: "ng-breadcrumb--default", ready: ".u-breadcrumb" },
  { name: "Breadcrumb WithoutHome", story: "ng-breadcrumb--without-home", ready: ".u-breadcrumb" },
  {
    name: "Breadcrumb WithDisabledItem",
    story: "ng-breadcrumb--with-disabled-item",
    ready: ".u-breadcrumb",
  },
  { name: "Dock Default", story: "ng-dock--default", ready: ".u-dock" },
  { name: "Dock LeftPosition", story: "ng-dock--left-position", ready: ".u-dock" },
  { name: "Dock TopPosition", story: "ng-dock--top-position", ready: ".u-dock" },
  { name: "Dock RightPosition", story: "ng-dock--right-position", ready: ".u-dock" },
  { name: "Dock WithDisabledItem", story: "ng-dock--with-disabled-item", ready: ".u-dock" },
  { name: "Steps Default", story: "ng-steps--default", ready: ".u-steps" },
  { name: "Steps NotReadonly", story: "ng-steps--not-readonly", ready: ".u-steps" },
  { name: "Steps WithDisabledItem", story: "ng-steps--with-disabled-item", ready: ".u-steps" },
  { name: "Stepper Default", story: "ng-stepper--default", ready: ".u-stepper" },
  { name: "Stepper Linear", story: "ng-stepper--linear", ready: ".u-stepper" },
  { name: "Stepper Vertical", story: "ng-stepper--vertical", ready: ".u-stepper" },
  { name: "Tabs Default", story: "ng-tabs--default", ready: ".u-tabs" },
  { name: "Tabs WithDisabledTab", story: "ng-tabs--with-disabled-tab", ready: ".u-tabs" },
  { name: "Tabs WithNavigators", story: "ng-tabs--with-navigators", ready: ".u-tabs" },
];

for (const { name, story, ready } of STORIES) {
  test(`Ng/${name} G3-C1 visual`, async ({ page }) => {
    await page.goto(storyUrl(story));
    await expect(page.locator(ready).first()).toBeAttached();
    await expect(page).toHaveScreenshot();
  });

  test(`Ng/${name} G3-C1 accessibility`, async ({ page }, testInfo) => {
    await page.goto(storyUrl(story));
    await expect(page.locator(ready).first()).toBeAttached();
    await runAccessibilityScan(page, testInfo, story);
  });
}

const SCALED = "matrix(1.5, 0, 0, 1.5, 0, 0)";

// Spec §9.2 (SR-C1-3): the magnification is hover-only, so Dock Default also gets a hover screenshot.
test("Ng/Dock Default (hover) G3-C1 visual", async ({ page }) => {
  await page.goto(storyUrl("ng-dock--default"));
  const link = page.locator(".u-dock-item-link").first();
  await expect(link).toBeAttached();
  await link.hover();
  await expect(link).toHaveCSS("transform", SCALED);
  await expect(page).toHaveScreenshot();
});

/** The computed value of `property` when set to `var(<variable>)` on a probe element. */
async function resolved(page: Page, variable: string, property: string): Promise<string> {
  return page.evaluate(
    ([v, p]) => {
      const probe = document.createElement("div");
      probe.style.setProperty(p, `var(${v})`);
      document.body.appendChild(probe);
      const value = getComputedStyle(probe).getPropertyValue(p);
      probe.remove();
      return value;
    },
    [variable, property] as const
  );
}
const disabledOpacity = (page: Page) => resolved(page, "--u-disabled-opacity", "opacity");
const color = (page: Page, variable: string) => resolved(page, variable, "color");

async function box(locator: Locator) {
  const b = await locator.boundingBox();
  expect(b, "bounding box").not.toBeNull();
  return b!;
}

// Spec §9.3 — computed style and layout that screenshots do not prove. Every
// colour assertion compares two token values that differ in Aura (rest vs
// hover/active), so it can fail (G3-B Amendment A2 lesson).
test("Ng/Breadcrumb G3-C1 layout", async ({ page }) => {
  await page.goto(storyUrl("ng-breadcrumb--with-disabled-item"));
  const disabled = page.locator(".u-breadcrumb-item-disabled");
  await expect(disabled).toHaveCount(1);
  await expect(disabled).toHaveCSS("opacity", await disabledOpacity(page));
  await expect(disabled.locator(".u-breadcrumb-item-link")).toHaveCSS("pointer-events", "none");
  const link = page
    .locator(
      ".u-breadcrumb-item:not(.u-breadcrumb-home-item):not(.u-breadcrumb-item-disabled) .u-breadcrumb-item-link"
    )
    .first();
  const label = link.locator(".u-breadcrumb-item-label");
  await expect(label).toHaveCSS("color", await color(page, "--u-breadcrumb-item-color"));
  await link.hover();
  await expect(label).toHaveCSS("color", await color(page, "--u-breadcrumb-item-hover-color"));
});

test("Ng/Dock G3-C1 layout", async ({ page }) => {
  const viewport = page.viewportSize()!;
  for (const [story, edge] of [
    ["ng-dock--default", "bottom"],
    ["ng-dock--top-position", "top"],
    ["ng-dock--left-position", "left"],
    ["ng-dock--right-position", "right"],
  ] as const) {
    await page.goto(storyUrl(story));
    const b = await box(page.locator(".u-dock"));
    const gap = {
      top: b.y,
      bottom: viewport.height - (b.y + b.height),
      left: b.x,
      right: viewport.width - (b.x + b.width),
    }[edge];
    expect(Math.abs(gap), story).toBeLessThanOrEqual(0.5);
  }

  await page.goto(storyUrl("ng-dock--with-disabled-item"));
  const disabled = page.locator(".u-dock-item-disabled");
  await expect(disabled).toHaveCount(1);
  await expect(disabled).toHaveCSS("opacity", await disabledOpacity(page));
  await expect(disabled.locator(".u-dock-item-link")).toHaveCSS("pointer-events", "none");
  // R-C1/R-C2: an enabled link still magnifies on hover.
  const link = page.locator(".u-dock-item:not(.u-dock-item-disabled) .u-dock-item-link").first();
  await link.hover();
  await expect(link).toHaveCSS("transform", SCALED);
});

test("Ng/Steps G3-C1 layout", async ({ page }) => {
  await page.goto(storyUrl("ng-steps--with-disabled-item"));
  const items = page.locator(".u-steps-item");
  await expect(items).toHaveCount(3);
  const number = (i: number) => items.nth(i).locator(".u-steps-item-number");
  await expect(number(0)).toHaveCSS(
    "color",
    await color(page, "--u-steps-item-number-active-color")
  );
  await expect(number(2)).toHaveCSS("color", await color(page, "--u-steps-item-number-color"));
  // PX-C1 (SR-C1-1): a disabled Steps item is not dimmed, as upstream.
  await expect(items.nth(1)).toHaveClass(/\bu-steps-item-disabled\b/);
  await expect(items.nth(1)).toHaveCSS("opacity", "1");

  // PX-C2 (Spec §6.5): an enabled link reached by keyboard shows the token focus
  // ring; the disabled item's link, focused after keyboard use, does not.
  const link = (i: number) => items.nth(i).locator(".u-steps-item-link");
  await page.keyboard.press("Tab");
  await expect(link(0)).toBeFocused();
  expect(await link(0).evaluate((el) => el.matches(":focus-visible"))).toBe(true);
  await expect(link(0)).toHaveCSS("outline-style", "solid");
  await expect(link(0)).toHaveCSS(
    "outline-color",
    await color(page, "--u-steps-item-link-focus-ring-color")
  );
  await link(1).focus();
  await expect(link(1)).toBeFocused();
  expect(await link(1).evaluate((el) => el.matches(":focus-visible"))).toBe(true);
  await expect(link(1)).toHaveCSS("outline-color", "rgba(0, 0, 0, 0)");
  await expect(link(1)).toHaveCSS("box-shadow", "none");
});

test("Ng/Stepper G3-C1 layout", async ({ page }) => {
  await page.goto(storyUrl("ng-stepper--default"));
  const steps = page.locator(".u-step");
  await expect(steps).toHaveCount(3);
  await expect(steps.nth(0).locator(".u-step-number")).toHaveCSS(
    "color",
    await color(page, "--u-stepper-step-number-active-color")
  );
  await expect(steps.nth(1).locator(".u-step-number")).toHaveCSS(
    "color",
    await color(page, "--u-stepper-step-number-color")
  );

  await page.goto(storyUrl("ng-stepper--linear"));
  const disabled = page.locator(".u-step.u-step-disabled");
  await expect(disabled).toHaveCount(2);
  await expect(disabled.first()).toHaveCSS("opacity", await disabledOpacity(page));
  await expect(disabled.first().locator(".u-step-header")).toHaveCSS("pointer-events", "none");

  // Review Focus 2: only the active panel shows in the vertical layout.
  await page.goto(storyUrl("ng-stepper--vertical"));
  await expect(page.locator(".u-step-item")).toHaveCount(3);
  await expect(page.locator(".u-step-panel:visible")).toHaveCount(1);
  await expect(page.locator(".u-step-item-active .u-step-panel")).toBeVisible();
});

test("Ng/Tabs G3-C1 layout", async ({ page }) => {
  await page.goto(storyUrl("ng-tabs--default"));
  const tabs = page.locator(".u-tab");
  await expect(tabs).toHaveCount(3);
  await expect(tabs.nth(0)).toHaveCSS("color", await color(page, "--u-tabs-tab-active-color"));
  await expect(tabs.nth(1)).toHaveCSS("color", await color(page, "--u-tabs-tab-color"));
  await tabs.nth(1).hover();
  await expect(tabs.nth(1)).toHaveCSS("color", await color(page, "--u-tabs-tab-hover-color"));
  await expect(page.locator(".u-tablist-active-bar")).toHaveCSS(
    "height",
    await resolved(page, "--u-tabs-active-bar-height", "height")
  );

  await page.goto(storyUrl("ng-tabs--with-disabled-tab"));
  const disabled = page.locator(".u-tab.u-tab-disabled");
  await expect(disabled).toHaveCount(1);
  await expect(disabled).toHaveCSS("opacity", await disabledOpacity(page));
  await expect(disabled).toHaveCSS("pointer-events", "none");

  // Review Focus 3 (C-3): the navigators sit absolutely at the tablist's inline edges.
  await page.goto(storyUrl("ng-tabs--with-navigators"));
  const list = await box(page.locator(".u-tablist"));
  const next = page.locator(".u-tablist-next-button");
  await expect(next).toBeVisible();
  await expect(next).toHaveCSS("position", "absolute");
  const n = await box(next);
  expect(Math.abs(n.x + n.width - (list.x + list.width))).toBeLessThanOrEqual(0.5);
  expect(Math.abs(n.y - list.y)).toBeLessThanOrEqual(0.5);
  await page
    .locator(".u-tablist-content")
    .evaluate((el) => el.scrollTo({ left: el.scrollWidth, behavior: "instant" }));
  const prev = page.locator(".u-tablist-prev-button");
  await expect(prev).toBeVisible();
  await expect(prev).toHaveCSS("position", "absolute");
  expect(Math.abs((await box(prev)).x - list.x)).toBeLessThanOrEqual(0.5);
});
```

- [ ] **Step 4: Create `packages/vue/e2e/g3c1-aura-styles.spec.ts`**

The Vue spec is the Angular spec of Step 3 with exactly these changes, and nothing else:

1. every `Ng/` title prefix becomes `Vue/` (8 titles: the two loop templates, the hover test and the 5 layout tests);
2. every story ID prefix `"ng-` becomes `"vue-` (the `STORIES` table and every `storyUrl(...)` argument);
3. append this Vue-only test at the end (Vue renders separators inside each `UStep`, Spec §3.2):

```ts
test("Vue/Stepper separator G3-C1 layout", async ({ page }) => {
  await page.goto(storyUrl("vue-stepper--default"));
  const separators = page.locator(".u-step-list .u-stepper-separator");
  await expect(separators).toHaveCount(2);
  await expect(separators.first()).toHaveCSS(
    "background-color",
    await resolved(page, "--u-stepper-separator-background", "background-color")
  );
});
```

Check: `grep -c "Ng/\|\"ng-" packages/vue/e2e/g3c1-aura-styles.spec.ts` prints `0`.

- [ ] **Step 5: Check the stories build and the specs typecheck**

```bash
export PATH=$HOME/.nvm/versions/node/v24.15.0/bin:$PATH
pnpm run build
pnpm run typecheck
grep -c 'story: "' packages/ng/e2e/g3c1-aura-styles.spec.ts packages/vue/e2e/g3c1-aura-styles.spec.ts
```

Expected: build and typecheck pass; `17` for each spec file. Story IDs are proven by Task 2's Docker run (a wrong ID makes its visual and accessibility tests fail there); a mismatch is a stop — do not rename stories to fit.

- [ ] **Step 6: Commit**

```bash
git add packages/ng/src/{dock,steps,stepper,tabs}/*.stories.ts \
  packages/vue/src/{dock,steps,stepper,tabs}/*.stories.ts \
  packages/ng/e2e/g3c1-aura-styles.spec.ts packages/vue/e2e/g3c1-aura-styles.spec.ts
git commit -m "test(gap-064): add G3-C1 verification stories and e2e specs"
```

---

### Task 2: Docker "before" baselines and before-state evidence

Runs on HEAD after Task 1, before any G3-C1 CSS change (D-G3-7).

**Files:**

- Create (git-ignored): `.superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/docker/run.sh`
- Create (generated): `packages/{ng,vue}/e2e/g3c1-aura-styles.spec.ts-snapshots/*.png` — (17 + 1 hover) × 3 browsers = 54 per framework, 108 total.

**Interfaces:**

- Produces: `run.sh` modes `before | stable | c1 | stepper | regression | update "<grep>" | ci "<fw>"` (used by Tasks 6, 8–10); `docker/before/` = before-state envelopes and layout results (Tasks 8, 9).

- [ ] **Step 1: Write the runner** (Write tool, path `.superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/docker/run.sh`)

```bash
#!/bin/bash
# GAP-064 G3-C1 Docker runner (inside mcr.microsoft.com/playwright:v1.63.0-jammy).
# usage: bash /io/run.sh before|stable|c1|stepper|regression|update "<grep>"|ci "<fw>"
#   before     = G3-C1 specs, writes missing screenshots; layout failures are before-state evidence.
#   c1         = targeted G3-C1 run (visual + layout + accessibility), ng/vue projects.
#   stepper    = the mandatory Vue GAP-077 regression (packages/vue/e2e/stepper.spec.ts).
#   regression = every other spec (G3-A, G3-B included) in all 9 Storybook projects + 3 SSR projects.
#   ci <fw>    = simulation of the track-a-browser-visual-a11y job as wired in Plan Task 8.
set -uo pipefail
export CI=true
mkdir -p /work && tar -xf /io/src.tar -C /work && cd /work
corepack enable >/dev/null && corepack prepare pnpm@9.6.0 --activate >/dev/null
echo "node $(node -v) pnpm $(pnpm -v) arch $(uname -m)"
pnpm install --frozen-lockfile > /io/install.log 2>&1 || { echo "install failed"; exit 1; }
pnpm run build > /io/build.log 2>&1 || { echo "build failed"; exit 1; }
SPECS="packages/ng/e2e/g3c1-aura-styles.spec.ts packages/vue/e2e/g3c1-aura-styles.spec.ts"
C1="--project=ng-chromium --project=ng-firefox --project=ng-webkit --project=vue-chromium --project=vue-firefox --project=vue-webkit"
VUE="--project=vue-chromium --project=vue-firefox --project=vue-webkit"
REGRESSION="$C1 --project=react-chromium --project=react-firefox --project=react-webkit --project=ng-ssr-chromium --project=react-ssr-chromium --project=vue-ssr-chromium"
SNAP="packages/ng/e2e/g3c1-aura-styles.spec.ts-snapshots packages/vue/e2e/g3c1-aura-styles.spec.ts-snapshots"
case "$1" in
  before)
    npx playwright test $SPECS $C1 --update-snapshots=missing --reporter=list > /io/before.log 2>&1; echo "before exit $?"
    tar -cf /io/before-results.tar test-results
    tar -cf /io/snapshots.tar $SNAP ;;
  stable)
    npx playwright test $SPECS $C1 -g "G3-C1 visual" --reporter=list > /io/stable.log 2>&1; echo "stable exit $?" ;;
  c1)
    npx playwright test $SPECS $C1 --reporter=list > /io/c1.log 2>&1; echo "c1 exit $?"
    tar -cf /io/c1-results.tar test-results ;;
  stepper)
    npx playwright test packages/vue/e2e/stepper.spec.ts $VUE --reporter=list > /io/stepper.log 2>&1; echo "stepper exit $?" ;;
  regression)
    npx playwright test $REGRESSION --grep-invert "G3-C1" --reporter=list > /io/regression.log 2>&1; echo "regression exit $?"
    tar -cf /io/regression-results.tar test-results ;;
  update)
    npx playwright test $SPECS $C1 -g "$2" --update-snapshots=changed --reporter=list > /io/update.log 2>&1; echo "update exit $?"
    tar -cf /io/snapshots.tar $SNAP ;;
  ci)
    fw="$2"
    P="--project=$fw-chromium --project=$fw-firefox --project=$fw-webkit"
    npx playwright test $P --grep-invert "G3-A|G3-B|G3-C1" --reporter=list > /io/ci-$fw-strict-run.log 2>&1; echo "ci $fw strict run exit $?"
    node scripts/provenance/validate-accessibility-baseline.mjs --check "test-results/accessibility/$fw/**/*.json" > /io/ci-$fw-strict-check.log 2>&1; echo "ci $fw strict check exit $?"
    if [ "$fw" != "react" ]; then
      npx playwright test packages/$fw/e2e/g3a-aura-styles.spec.ts $P --reporter=list > /io/ci-$fw-g3a-run.log 2>&1; echo "ci $fw g3a run exit $?"
      node scripts/provenance/validate-g3a-accessibility.mjs "$fw" > /io/ci-$fw-g3a-check.log 2>&1; echo "ci $fw g3a check exit $?"
      npx playwright test packages/$fw/e2e/g3b-aura-styles.spec.ts $P --reporter=list > /io/ci-$fw-g3b-run.log 2>&1; echo "ci $fw g3b run exit $?"
      node scripts/provenance/validate-g3b-accessibility.mjs "$fw" > /io/ci-$fw-g3b-check.log 2>&1; echo "ci $fw g3b check exit $?"
      npx playwright test packages/$fw/e2e/g3c1-aura-styles.spec.ts $P --reporter=list > /io/ci-$fw-g3c1-run.log 2>&1; echo "ci $fw g3c1 run exit $?"
      node scripts/provenance/validate-g3c1-accessibility.mjs "$fw" > /io/ci-$fw-g3c1-check.log 2>&1; echo "ci $fw g3c1 check exit $?"
      tar -cf /io/ci-$fw-results.tar test-results
    fi ;;
esac
```

- [ ] **Step 2: Record the before-state**

```bash
git archive -o .superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/docker/src.tar HEAD
docker run --rm -v "$PWD/.superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/docker:/io" mcr.microsoft.com/playwright:v1.63.0-jammy bash /io/run.sh before
mkdir -p .superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/docker/before
tar -xf .superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/docker/before-results.tar -C .superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/docker/before
tar -xf .superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/docker/snapshots.tar -C .
git status --short | grep -c 'g3c1-aura-styles.spec.ts-snapshots/'
git rev-parse --short HEAD
```

Expected:

- 108 new PNGs (54 ng + 54 vue); the output's first line names the architecture (record it; CI is arm64).
- `before.log`: **every visual and accessibility test passes**. Layout tests may fail; each failure (test, assertion, received value) is copied into `docker/before/layout-evidence.txt` as before-state evidence. Layout tests that already pass are recorded as such.
- Any failing visual or accessibility test is **UNEXPECTED**: stop and report.
- Record the HEAD short SHA as `<beforeSha>` (Task 8).

- [ ] **Step 3: Prove screenshot stability, twice**

```bash
git add packages/ng/e2e/g3c1-aura-styles.spec.ts-snapshots packages/vue/e2e/g3c1-aura-styles.spec.ts-snapshots
git archive -o .superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/docker/src.tar "$(git write-tree)"
docker run --rm -v "$PWD/.superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/docker:/io" mcr.microsoft.com/playwright:v1.63.0-jammy bash /io/run.sh stable
docker run --rm -v "$PWD/.superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/docker:/io" mcr.microsoft.com/playwright:v1.63.0-jammy bash /io/run.sh stable
```

Expected: `stable exit 0` twice. A flaky story: stop and report; no masks, thresholds or retries-until-green.

- [ ] **Step 4: Commit**

```bash
git commit -m "test(gap-064): record G3-C1 pre-change baselines in Linux Docker"
```

---

### Task 3: Upstream fixture, G3-C1 data module and static fidelity test (C3)

**Files:**

- Create (git-ignored): `.superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/make-fixture.mjs`
- Create: `packages/themes/test/fixtures/primeuix-styles-g3c1.json`
- Create: `packages/themes/test/utils/g3c1-port.mjs`
- Create: `packages/themes/test/g3c1-upstream-fidelity.test.ts`

**Interfaces:**

- Consumes: `parseGroups(css): {head, body, keyframes}[]` and `norm(css): string` from the unchanged `packages/themes/test/utils/g3a-port.mjs`.
- Produces from `g3c1-port.mjs`: `FIXTURE`, `REPO`, `FRAMEWORKS`, `KEYS`, `MAPPING`, `OMITTED` (D2), `COUNTS`, `TOTALS`, `BASE_ROLE` (D3), `BASE_SOURCES`, `RETAINED` (D5), `mapSelector`, `expected`, `expectedCss`, `declarations`, `styleFile`, `actualCssText`, `actualRules`. CLI: `node packages/themes/test/utils/g3c1-port.mjs <ng|vue> <key>` prints the exact `css` body (Tasks 5–6).

- [ ] **Step 1: Generate the fixture from the pinned tarball (no hand edits)**

Write `.superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/make-fixture.mjs`:

```js
// GAP-064 G3-C1 one-off fixture generator (Plan Task 3 Step 1). Not committed.
// usage: node make-fixture.mjs <extracted-tarball-dir> <output-json>
import { writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [dir, out] = process.argv.slice(2);
const keys = ["breadcrumb", "dock", "steps", "stepper", "tabs", "base"];
const modules = {};
for (const k of keys) {
  const file = path.resolve(dir, "package/dist", k, "index.mjs");
  modules[k] = (await import(pathToFileURL(file).href)).style;
}
const fixture = {
  _meta: {
    source:
      "@primeuix/styles@2.0.3 (MIT, https://github.com/primefaces/primeuix) - dist/<key>/index.mjs export style",
    method:
      "one-off script: dynamic import() of each dist/<key>/index.mjs from the pinned tarball .vendor-cache/@primeuix__styles-2.0.3.tar.gz; no hand edits",
    scope:
      "GAP-064 G3-C1: the 5 Navigation Aura keys, plus the base module (source of the C-7 base-role declarations)",
    purpose:
      "CI-runnable upstream structural CSS snapshot for the G3-C1 fidelity test. Test data only, not shipped source.",
  },
  modules,
};
writeFileSync(out, JSON.stringify(fixture, null, 2) + "\n");
console.log(
  Object.keys(modules).length,
  Object.values(modules).every((s) => s.includes(".p-"))
);
```

Run:

```bash
mkdir -p .superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/upstream
tar -xzf .vendor-cache/@primeuix__styles-2.0.3.tar.gz -C .superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/upstream
node .superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/make-fixture.mjs .superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/upstream packages/themes/test/fixtures/primeuix-styles-g3c1.json
npx prettier --check packages/themes/test/fixtures/primeuix-styles-g3c1.json
```

Expected: `6 true`; Prettier clean (if not, run `npx prettier --write` on the fixture — formatting only).

- [ ] **Step 2: Create `packages/themes/test/utils/g3c1-port.mjs`** (dry-run verified at Plan time, in the git-ignored research workspace, against a fixture generated the same way: Angular 90 / 79 / 11, Vue 90 / 81 / 9, 0 problems; CLI output round-trips through `parseGroups`; the Step 3 test, run on style files built from this CLI output, passed 50/50, and the fixture matches `.vendor-extracted` for all 5 keys)

```js
/**
 * GAP-064 G3-C1 (Spec §4–§6, §8, §15): the explicit upstream → Ultimate data
 * for the Navigation port (breadcrumb, dock, steps, stepper, tabs), in the
 * Spec §8 categories:
 *   D1 ported component groups (with the §4 selector mapping),
 *   D2 omitted component groups (FX-C1..FX-C6),
 *   D3 C-7 base-role rules (disabled; never for steps, PX-C1),
 *   D5 C-8 retained Ultimate-only rules (R-C1..R-C3).
 * D4 (inline roles) and D6 (base exclusions) are empty in C1.
 * Used by g3c1-upstream-fidelity.test.ts (C3) and, as a CLI, to print the
 * exact css body of one style module:
 *   node packages/themes/test/utils/g3c1-port.mjs <ng|vue> <key>
 * Never edit this data to make a check pass (Spec §12).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { norm, parseGroups } from "./g3a-port.mjs";

export { norm, parseGroups };

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const REPO = path.resolve(HERE, "../../../..");
export const FIXTURE = JSON.parse(
  readFileSync(path.join(HERE, "../fixtures/primeuix-styles-g3c1.json"), "utf8")
);

export const FRAMEWORKS = ["ng", "vue"];
/** Aura key = Ultimate directory for all five (style file: <key>/<key>-style.ts). */
export const KEYS = ["breadcrumb", "dock", "steps", "stepper", "tabs"];

/**
 * Spec §4 selector mapping, applied in order to every selector of a D1 group,
 * then the generic `.p-` → `.u-` rule. Entry kinds:
 *   "text"   — replace one exact upstream selector (PX-C2 only, Spec §6.5);
 *   "class"  — replace a whole class token (not followed by [a-z0-9-]);
 *   "expand" — turn one selector of a list into one selector per target (C-3).
 * Identical for Angular and Vue.
 */
const SHARED = {
  steps: [
    [
      "text",
      ".p-steps-item-link:not(.p-disabled):focus-visible",
      ".u-steps-item:not(.u-steps-item-disabled) .u-steps-item-link:focus-visible",
    ],
    ["class", ".p-disabled", ".u-steps-item-disabled"],
  ],
  stepper: [
    ["class", ".p-steppanel-content-wrapper", ".u-step-panel-content-wrapper"],
    ["class", ".p-steppanel-content", ".u-step-panel-content"],
    ["class", ".p-steppanels", ".u-step-panels"],
    ["class", ".p-steppanel", ".u-step-panel"],
    ["class", ".p-stepitem-active", ".u-step-item-active"],
    ["class", ".p-stepitem", ".u-step-item"],
    ["class", ".p-steplist", ".u-step-list"],
    ["class", ".p-disabled", ".u-step-disabled"],
  ],
  tabs: [
    ["class", ".p-tablist-viewport", ".u-tablist-content"],
    ["expand", ".p-tablist-nav-button", [".u-tablist-prev-button", ".u-tablist-next-button"]],
    ["class", ".p-disabled", ".u-tab-disabled"],
  ],
};
export const MAPPING = { ng: SHARED, vue: SHARED };

/** D2 — Spec §5: omitted upstream group numbers (1-based source order) with their FX tag. */
const OMIT_SHARED = {
  breadcrumb: { 4: "FX-C1" },
  dock: { 5: "FX-C2", 13: "FX-C3", 14: "FX-C3", 15: "FX-C3", 16: "FX-C3", 17: "FX-C3" },
  steps: { 13: "FX-C4" },
};
export const OMITTED = {
  ng: { ...OMIT_SHARED, stepper: { 6: "FX-C5", 23: "FX-C6", 24: "FX-C6" } },
  vue: { ...OMIT_SHARED, stepper: { 6: "FX-C5" } },
};

/** Spec §5 counts: [upstream groups, D1 ported ng, D1 ported vue]. */
export const COUNTS = {
  breadcrumb: [11, 10, 10],
  dock: [17, 11, 11],
  steps: [15, 14, 14],
  stepper: [28, 25, 27],
  tabs: [19, 19, 19],
};
export const TOTALS = {
  ng: { upstream: 90, ported: 79, omitted: 11 },
  vue: { upstream: 90, ported: 81, omitted: 9 },
};

const DISABLED_ROLE = (sel) => [
  `${sel}, ${sel} * { cursor: default; pointer-events: none; user-select: none; }`,
  `${sel} { opacity: dt('disabled.opacity'); }`,
];

/** D3 — Spec §6.1: base-role rules, exact text, first in the module. Never steps (PX-C1). */
const BASE_SHARED = {
  breadcrumb: DISABLED_ROLE(".u-breadcrumb-item-disabled"),
  dock: DISABLED_ROLE(".u-dock-item-disabled"),
  stepper: DISABLED_ROLE(".u-step-disabled"),
  tabs: DISABLED_ROLE(".u-tab-disabled"),
};
export const BASE_ROLE = { ng: BASE_SHARED, vue: BASE_SHARED };

/** D3 source evidence: each base-role rule's declarations equal the upstream base group's (no difference). */
export const BASE_SOURCES = [
  {
    base: ".p-disabled, .p-disabled *",
    ruleIndex: 0,
    keys: ["breadcrumb", "dock", "stepper", "tabs"],
  },
  {
    base: ".p-disabled, .p-component:disabled",
    ruleIndex: 1,
    keys: ["breadcrumb", "dock", "stepper", "tabs"],
  },
];

/** D5 — Spec §6.3: the only retained Ultimate-only rules, exact text, last. */
const DOCK_RETAINED = [
  ".u-dock-item-link { transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1); transform-origin: bottom center; }",
  '.u-dock-item-link:hover, .u-dock-item-link[data-u-active="true"] { transform: scale(1.5); }',
];
export const RETAINED = {
  ng: { dock: DOCK_RETAINED, stepper: [".u-step-panel[hidden] { display: none; }"] },
  vue: { dock: DOCK_RETAINED },
};

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const token = (from) => new RegExp(`${escape(from)}(?![a-z0-9-])`, "g");

export function mapSelector(fw, key, selector) {
  let parts = selector.split(",").map((p) => p.trim());
  for (const [kind, from, to] of MAPPING[fw][key] ?? []) {
    if (kind === "text") parts = parts.map((p) => (p === from ? to : p));
    else if (kind === "class") parts = parts.map((p) => p.replace(token(from), to));
    else
      parts = parts.flatMap((p) =>
        token(from).test(p) ? to.map((t) => p.replace(token(from), t)) : [p]
      );
  }
  return parts.map((p) => p.replace(/\.p-/g, ".u-")).join(", ");
}

/** D1 and D2 for one framework style module, in upstream source order. */
export function expected(fw, key) {
  const groups = parseGroups(FIXTURE.modules[key]);
  const omitted = OMITTED[fw][key] ?? {};
  const d1 = [];
  const d2 = [];
  groups.forEach((g, i) => {
    const n = i + 1;
    if (g.keyframes) throw new Error(`${key}: unexpected keyframes in a G3-C1 module`);
    if (omitted[n]) d2.push({ n, tag: omitted[n], head: norm(g.head) });
    else d1.push({ n, text: norm(`${mapSelector(fw, key, g.head)}{${g.body}}`) });
  });
  return { upstream: groups.length, d1, d2 };
}

/** Spec §8 canonical order: D3, then D1 (upstream order), then D5. */
export function expectedCss(fw, key) {
  return [
    ...(BASE_ROLE[fw][key] ?? []).map(norm),
    ...expected(fw, key).d1.map((r) => r.text),
    ...(RETAINED[fw][key] ?? []).map(norm),
  ];
}

/** Property names declared by a normalized rule text. */
export function declarations(ruleText) {
  const open = ruleText.indexOf("{");
  const props = ruleText
    .slice(open + 1, -1)
    .split(";")
    .map((d) => d.split(":")[0].trim())
    .filter(Boolean);
  return { selector: ruleText.slice(0, open), props };
}

export function styleFile(fw, key) {
  return path.join(REPO, "packages", fw, "src", key, `${key}-style.ts`);
}

export function actualCssText(fw, key) {
  const src = readFileSync(styleFile(fw, key), "utf8");
  const blocks = [...src.matchAll(/\/\*css\*\/\s*`([\s\S]*?)`/g)];
  if (blocks.length !== 1)
    throw new Error(`${fw}/${key}: expected exactly one /*css*/ block, found ${blocks.length}`);
  if (blocks[0][1].includes("${")) throw new Error(`${fw}/${key}: css must not interpolate`);
  return blocks[0][1];
}

export function actualRules(fw, key) {
  return parseGroups(actualCssText(fw, key)).map((g) => norm(`${g.head}{${g.body}}`));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [fw, key] = process.argv.slice(2);
  if (!FRAMEWORKS.includes(fw) || !KEYS.includes(key))
    throw new Error(`usage: g3c1-port.mjs <ng|vue> <key>; key one of ${KEYS.join(", ")}`);
  console.log(expectedCss(fw, key).join("\n"));
}
```

Run `npx prettier --write packages/themes/test/utils/g3c1-port.mjs` (formatting only).

- [ ] **Step 3: Write the fidelity test `packages/themes/test/g3c1-upstream-fidelity.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  BASE_ROLE,
  BASE_SOURCES,
  COUNTS,
  FIXTURE,
  FRAMEWORKS,
  KEYS,
  OMITTED,
  REPO,
  RETAINED,
  TOTALS,
  actualCssText,
  actualRules,
  declarations,
  expected,
  expectedCss,
  mapSelector,
  norm,
  parseGroups,
} from "./utils/g3c1-port.mjs";

/**
 * GAP-064 G3-C1 C3 (Spec §5, §6, §8, §15): each of the 10 framework style
 * files contains exactly D3 → D1 (upstream source order) → D5, derived from
 * the committed @primeuix/styles 2.0.3 fixture; D2 never appears.
 */
type Fw = "ng" | "vue";
type Rules = Record<Fw, Record<string, string[]>>;
const CASES = (FRAMEWORKS as Fw[]).flatMap((fw) => (KEYS as string[]).map((key) => ({ fw, key })));
const decl = (body: string) =>
  Object.fromEntries(
    norm(body)
      .split(";")
      .filter(Boolean)
      .map((d) => [d.slice(0, d.indexOf(":")).trim(), d.slice(d.indexOf(":") + 1).trim()])
  );
const bodyOf = (rule: string) => rule.slice(rule.indexOf("{") + 1, -1);

describe("G3-C1 upstream fixture and data model (Spec §8)", () => {
  it("covers the 5 G3-C1 keys plus base and records its source", () => {
    expect(Object.keys(FIXTURE.modules).sort()).toEqual([...KEYS, "base"].sort());
    expect(FIXTURE._meta.source).toContain("@primeuix/styles@2.0.3");
  });

  it.each(FRAMEWORKS as Fw[])(
    "%s: D1 + D2 = 90, disjoint, per-key counts pinned (ng 79 + 11, vue 81 + 9)",
    (fw) => {
      let upstream = 0;
      let ported = 0;
      let omitted = 0;
      for (const key of KEYS as string[]) {
        const e = expected(fw, key);
        const [u, ng, vue] = (COUNTS as Record<string, number[]>)[key];
        expect(e.upstream, key).toBe(u);
        expect(e.d1.length, key).toBe(fw === "ng" ? ng : vue);
        const d1n = e.d1.map((r: { n: number }) => r.n);
        const d2n = e.d2.map((r: { n: number }) => r.n);
        expect(
          d1n.filter((n: number) => d2n.includes(n)),
          key
        ).toEqual([]);
        expect(
          [...d1n, ...d2n].sort((a, b) => a - b),
          key
        ).toEqual(Array.from({ length: u }, (_, i) => i + 1));
        upstream += e.upstream;
        ported += e.d1.length;
        omitted += e.d2.length;
      }
      expect({ upstream, ported, omitted }).toEqual((TOTALS as Record<Fw, unknown>)[fw]);
    }
  );

  it("D2 tags are exactly FX-C1..FX-C6; FX-C6 is Angular-only", () => {
    const tags = (fw: Fw) =>
      new Set(
        Object.values((OMITTED as Record<Fw, Record<string, Record<number, string>>>)[fw]).flatMap(
          (m) => Object.values(m)
        )
      );
    expect([...tags("ng")].sort()).toEqual(["FX-C1", "FX-C2", "FX-C3", "FX-C4", "FX-C5", "FX-C6"]);
    expect([...tags("vue")].sort()).toEqual(["FX-C1", "FX-C2", "FX-C3", "FX-C4", "FX-C5"]);
  });

  it("D1 is in upstream source order (strictly increasing group numbers)", () => {
    for (const fw of FRAMEWORKS as Fw[])
      for (const key of KEYS as string[]) {
        const ns = expected(fw, key).d1.map((r: { n: number }) => r.n);
        ns.forEach(
          (n: number, i: number) => i > 0 && expect(n, `${fw} ${key}`).toBeGreaterThan(ns[i - 1])
        );
      }
  });

  it("Spec §4 normative mapping examples", () => {
    for (const fw of FRAMEWORKS as Fw[]) {
      expect(mapSelector(fw, "steps", ".p-steps-item.p-disabled, .p-steps-item.p-disabled *")).toBe(
        ".u-steps-item.u-steps-item-disabled, .u-steps-item.u-steps-item-disabled *"
      );
      expect(mapSelector(fw, "tabs", ".p-tablist-nav-button:hover")).toBe(
        ".u-tablist-prev-button:hover, .u-tablist-next-button:hover"
      );
      expect(mapSelector(fw, "tabs", ".p-tablist-viewport::-webkit-scrollbar")).toBe(
        ".u-tablist-content::-webkit-scrollbar"
      );
      expect(mapSelector(fw, "stepper", ".p-stepitem .p-steppanel-content-wrapper")).toBe(
        ".u-step-item .u-step-panel-content-wrapper"
      );
      expect(mapSelector(fw, "stepper", ".p-stepitem.p-stepitem-active")).toBe(
        ".u-step-item.u-step-item-active"
      );
    }
  });

  it("PX-C2: steps group 9 is the only adapted selector; its focus filter sits on the item", () => {
    const ADAPTED = ".u-steps-item:not(.u-steps-item-disabled) .u-steps-item-link:focus-visible";
    for (const fw of FRAMEWORKS as Fw[]) {
      const group9 = expected(fw, "steps").d1.find((r: { n: number }) => r.n === 9);
      expect(group9.text.startsWith(`${ADAPTED}{`), fw).toBe(true);
      // The plain C-1 mapping (inert, as upstream) never appears.
      expect(expectedCss(fw, "steps").join("\n")).not.toContain(
        ".u-steps-item-link:not(.u-steps-item-disabled)"
      );
      // Declarations are upstream's, unchanged.
      const upstream = parseGroups(FIXTURE.modules.steps)[8];
      expect(norm(upstream.head)).toBe(".p-steps-item-link:not(.p-disabled):focus-visible");
      expect(bodyOf(group9.text)).toBe(bodyOf(norm(`${upstream.head}{${upstream.body}}`)));
    }
  });

  it("D3 is never emitted for steps (PX-C1, SR-C1-1)", () => {
    for (const fw of FRAMEWORKS as Fw[]) expect((BASE_ROLE as Rules)[fw].steps, fw).toBeUndefined();
  });

  it("D3 declarations equal the upstream base groups exactly", () => {
    const base = parseGroups(FIXTURE.modules.base).map((g: { head: string; body: string }) => ({
      head: norm(g.head),
      body: g.body,
    }));
    for (const src of BASE_SOURCES) {
      const group = base.find((b: { head: string }) => b.head === src.base);
      expect(group, src.base).toBeDefined();
      for (const fw of FRAMEWORKS as Fw[])
        for (const key of src.keys)
          expect(
            decl(bodyOf(norm((BASE_ROLE as Rules)[fw][key][src.ruleIndex]))),
            `${fw} ${key} ${src.base}`
          ).toEqual(decl(group!.body));
    }
  });

  it("D5 is exactly R-C1, R-C2 (dock) and R-C3 (Angular stepper)", () => {
    expect(Object.keys((RETAINED as Rules).ng).sort()).toEqual(["dock", "stepper"]);
    expect(Object.keys((RETAINED as Rules).vue)).toEqual(["dock"]);
    expect((RETAINED as Rules).ng.dock).toEqual((RETAINED as Rules).vue.dock);
    expect((RETAINED as Rules).ng.dock).toHaveLength(2);
    expect((RETAINED as Rules).ng.stepper).toEqual([".u-step-panel[hidden] { display: none; }"]);
  });

  it("D5 never redeclares a D1 property on the same selector", () => {
    for (const fw of FRAMEWORKS as Fw[])
      for (const key of KEYS as string[]) {
        const d1 = expected(fw, key).d1.map((r: { text: string }) => declarations(r.text));
        for (const x of ((RETAINED as Rules)[fw][key] ?? []).map((r) => declarations(norm(r)))) {
          const clash = d1
            .filter((u: { selector: string }) => u.selector === x.selector)
            .flatMap((u: { props: string[] }) => u.props.filter((p) => x.props.includes(p)));
          expect(clash, `${fw} ${key} ${x.selector}`).toEqual([]);
        }
      }
  });

  const vendor = join(REPO, ".vendor-extracted/uix-styles-full/src");
  describe.skipIf(!existsSync(vendor))("fixture vs .vendor-extracted source", () => {
    it.each(KEYS as string[])("%s matches the vendored source", (key) => {
      const src = readFileSync(join(vendor, key, "index.ts"), "utf8");
      const css = (src.match(/\/\*css\*\/\s*`([\s\S]*?)`/) ?? [])[1] ?? "";
      expect(norm(css)).toBe(norm((FIXTURE.modules as Record<string, string>)[key]));
    });
  });
});

describe.each(CASES)("$fw $key style module (C3)", ({ fw, key }) => {
  it("contains exactly D3 → D1 → D5, nothing else", () => {
    expect(actualRules(fw, key)).toEqual(expectedCss(fw, key));
  });

  it("every rule belongs to exactly one of D1, D3, D5; nothing from D2", () => {
    const d1 = expected(fw, key).d1.map((r: { text: string }) => r.text);
    const d3 = ((BASE_ROLE as Rules)[fw][key] ?? []).map(norm);
    const d5 = ((RETAINED as Rules)[fw][key] ?? []).map(norm);
    for (const rule of actualRules(fw, key)) {
      const hits = [d1, d3, d5].filter((set) => set.includes(rule)).length;
      expect(hits, rule).toBe(1);
    }
    const heads = actualRules(fw, key).map((r) => r.slice(0, r.indexOf("{")));
    for (const g of expected(fw, key).d2)
      expect(heads, g.head).not.toContain(mapSelector(fw, key, g.head));
  });

  it("keeps no upstream p- name and no raw --u- variable", () => {
    const css = norm(actualCssText(fw, key));
    expect(css).not.toMatch(/\.p-[a-z]/);
    expect(css).not.toMatch(/var\(--u-/);
  });

  it("D1 references at least one own token (C2 own-token invariant)", () => {
    expect(
      expected(fw, key)
        .d1.map((r: { text: string }) => r.text)
        .join(" ")
    ).toContain(`dt('${key}.`);
  });
});
```

- [ ] **Step 4: Run — fixture/data tests GREEN, style-module tests RED**

```bash
pnpm --filter @ultimate/themes exec vitest run test/g3c1-upstream-fidelity.test.ts
```

Expected: every test in "G3-C1 upstream fixture and data model" passes; each `$fw $key style module` case fails on "contains exactly" and "every rule belongs" (the current hand-written CSS). Any data-model failure: stop and report (never edit data to fit).

- [ ] **Step 5: Commit**

```bash
git add packages/themes/test/fixtures/primeuix-styles-g3c1.json packages/themes/test/utils/g3c1-port.mjs \
  packages/themes/test/g3c1-upstream-fidelity.test.ts
git commit -m "test(gap-064): add the G3-C1 upstream fixture, data module and fidelity test"
```

---

### Task 4: Runtime tests — keys (C1), variable resolution (C2), state selectors (C3)

**Files:**

- Create: `packages/ng/src/g3c1-aura-styles.spec.ts`, `packages/vue/src/g3c1-aura-styles.spec.ts`

State rows assert two things: the selector text is styled (appears in the generated CSS) and it matches exactly the expected rendered elements. jsdom cannot evaluate `:hover`/`:focus-visible` (stripped, as in G3-B), cannot overflow (so Tabs navigators are not rendered — browser-only, PR-C1-3) and has no reliable `:has()` (the three Stepper `:has()` groups 14, 18, 27 are browser-only, PR-C1-4).

- [ ] **Step 1: Angular spec `packages/ng/src/g3c1-aura-styles.spec.ts`**

```ts
import { Component, PLATFORM_ID, type Type } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { TestBed } from "@angular/core/testing";
import { beforeAll, describe, expect, it } from "vitest";
import { applyUltimateTheme } from "@ultimate/themes";
import { UBreadcrumb } from "./breadcrumb";
import { UDock } from "./dock";
import { USteps } from "./steps";
import { UStep, UStepItem, UStepList, UStepPanel, UStepPanels, UStepper } from "./stepper";
import { UTab, UTabList, UTabPanel, UTabPanels, UTabs } from "./tabs";

/**
 * GAP-064 G3-C1 (Spec §9.1 C1, C2, C3 state selectors). Assertions use the
 * generated <style data-u-ng-style> elements and the rendered DOM. Each mount
 * uses a fresh document under a server PLATFORM_ID (fresh per-document style
 * registry, GAP-078), as in G3-A/G3-B. No C1 key has an unresolved reference.
 */
const KEY_ATTR = "data-u-ng-style";

const STEPPER_IMPORTS = [UStepper, UStepList, UStep, UStepPanels, UStepPanel];
const STEPS_TEMPLATE = `<u-step-list
    ><u-step [value]="1">A</u-step><u-step [value]="2">B</u-step><u-step [value]="3">C</u-step></u-step-list
  ><u-step-panels
    ><u-step-panel [value]="1">a</u-step-panel><u-step-panel [value]="2">b</u-step-panel
    ><u-step-panel [value]="3">c</u-step-panel></u-step-panels
  >`;

@Component({
  standalone: true,
  imports: STEPPER_IMPORTS,
  template: `<u-stepper [value]="1">${STEPS_TEMPLATE}</u-stepper>`,
})
class StepperHost {}

@Component({
  standalone: true,
  imports: STEPPER_IMPORTS,
  template: `<u-stepper [value]="1" [linear]="true">${STEPS_TEMPLATE}</u-stepper>`,
})
class LinearStepperHost {}

@Component({
  standalone: true,
  imports: [...STEPPER_IMPORTS, UStepItem],
  template: `<u-stepper [value]="1"
    ><u-step-item [value]="1"
      ><u-step [value]="1">A</u-step><u-step-panel [value]="1">a</u-step-panel></u-step-item
    ><u-step-item [value]="2"
      ><u-step [value]="2">B</u-step><u-step-panel [value]="2">b</u-step-panel></u-step-item
    ><u-step-item [value]="3"
      ><u-step [value]="3">C</u-step><u-step-panel [value]="3">c</u-step-panel></u-step-item
    ></u-stepper
  >`,
})
class VerticalStepperHost {}

@Component({
  standalone: true,
  imports: [UTabs, UTabList, UTab, UTabPanels, UTabPanel],
  template: `<u-tabs [value]="0"
    ><u-tab-list
      ><u-tab [value]="0">A</u-tab><u-tab [value]="1" disabled>B</u-tab
      ><u-tab [value]="2">C</u-tab></u-tab-list
    ><u-tab-panels
      ><u-tab-panel [value]="0">a</u-tab-panel><u-tab-panel [value]="1">b</u-tab-panel
      ><u-tab-panel [value]="2">c</u-tab-panel></u-tab-panels
    ></u-tabs
  >`,
})
class TabsHost {}

type Inputs = Record<string, unknown>;
const CRUMBS = {
  model: [
    { label: "A", url: "#a" },
    { label: "B", disabled: true },
  ],
};
const DOCK = (position = "bottom") => ({
  model: [{ label: "A" }, { label: "B", disabled: true }, { label: "C" }],
  position,
});
const STEPS = (readonly: boolean) => ({
  model: [{ label: "A" }, { label: "B", disabled: true }, { label: "C" }],
  activeIndex: 0,
  readonly,
});

interface Case {
  name: string;
  type: Type<unknown>;
  key: string;
  mounts: Inputs[];
}
const CASES: Case[] = [
  { name: "breadcrumb", type: UBreadcrumb, key: "breadcrumb", mounts: [CRUMBS] },
  {
    name: "dock",
    type: UDock,
    key: "dock",
    mounts: [DOCK("bottom"), DOCK("top"), DOCK("left"), DOCK("right")],
  },
  { name: "steps", type: USteps, key: "steps", mounts: [STEPS(true), STEPS(false)] },
  { name: "stepper horizontal", type: StepperHost, key: "stepper", mounts: [{}] },
  { name: "stepper linear", type: LinearStepperHost, key: "stepper", mounts: [{}] },
  { name: "stepper vertical", type: VerticalStepperHost, key: "stepper", mounts: [{}] },
  { name: "tabs", type: TabsHost, key: "tabs", mounts: [{}] },
];

/** G3-A / GAP-078 isolation: reset, one configureTestingModule with a new Document, one createComponent. */
function mount(type: Type<unknown>, inputs: Inputs = {}) {
  TestBed.resetTestingModule();
  const doc = document.implementation.createHTMLDocument("g3c1");
  TestBed.configureTestingModule({
    providers: [
      { provide: DOCUMENT, useValue: doc },
      { provide: PLATFORM_ID, useValue: "server" },
    ],
  });
  const fixture = TestBed.createComponent(type);
  for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
  fixture.detectChanges();
  return { doc, fixture, el: fixture.nativeElement as HTMLElement };
}

const styles = (doc: Document) =>
  Array.from(doc.head.querySelectorAll<HTMLStyleElement>(`style[${KEY_ATTR}]`));
const count = (doc: Document, key: string) =>
  styles(doc).filter((s) => s.getAttribute(KEY_ATTR) === key).length;
const cssFor = (doc: Document, key: string) =>
  styles(doc)
    .filter((s) => s.getAttribute(KEY_ATTR) === key)
    .map((s) => s.textContent ?? "")
    .join("\n");

function unresolved(doc: Document, key: string): string[] {
  const refs = new Set(
    Array.from(cssFor(doc, key).matchAll(/var\(\s*(--u-[a-z0-9-]+)/g), (m) => m[1])
  );
  const all = styles(doc)
    .map((s) => s.textContent ?? "")
    .join("\n");
  const defined = new Set(Array.from(all.matchAll(/(--u-[a-z0-9-]+)\s*:/g), (m) => m[1]));
  return [...refs].filter((n) => !defined.has(n)).sort();
}

/** User-action pseudo-classes cannot be matched in jsdom; the rest of the selector must match. */
const strip = (selector: string) =>
  selector.replace(/:(hover|focus-visible|active)(?![a-z-])/g, "");
/** Indices (document order, root first) of the elements matching `all` that match the stripped selector. */
function matching(root: HTMLElement, all: string, selector: string): number[] {
  const els = [
    ...(root.matches(all) ? [root] : []),
    ...Array.from(root.querySelectorAll<HTMLElement>(all)),
  ];
  return els.flatMap((el, i) => (el.matches(strip(selector)) ? [i] : []));
}

interface StateRow {
  name: string;
  key: string;
  type: Type<unknown>;
  inputs?: Inputs;
  act?: (el: HTMLElement) => void;
  all: string;
  selector: string;
  expected: number[];
}
const hoverFirstDockLink = (el: HTMLElement) =>
  el.querySelector(".u-dock-item-link")!.dispatchEvent(new MouseEvent("mouseenter"));

const ROWS: StateRow[] = [
  {
    name: "breadcrumb disabled role (C-7)",
    key: "breadcrumb",
    type: UBreadcrumb,
    inputs: CRUMBS,
    all: ".u-breadcrumb-item",
    selector: ".u-breadcrumb-item-disabled",
    expected: [1],
  },
  ...(["top", "bottom", "left", "right"] as const).map((p) => ({
    name: `dock position ${p}`,
    key: "dock",
    type: UDock,
    inputs: DOCK(p),
    all: ".u-dock",
    selector: `.u-dock-${p}`,
    expected: [0],
  })),
  {
    name: "dock disabled role (C-7)",
    key: "dock",
    type: UDock,
    inputs: DOCK(),
    all: ".u-dock-item",
    selector: ".u-dock-item-disabled",
    expected: [1],
  },
  {
    name: "dock idle: no magnified link (R-C2)",
    key: "dock",
    type: UDock,
    inputs: DOCK(),
    all: ".u-dock-item-link",
    selector: '.u-dock-item-link[data-u-active="true"]',
    expected: [],
  },
  {
    name: "dock hovered link magnified (R-C2)",
    key: "dock",
    type: UDock,
    inputs: DOCK(),
    act: hoverFirstDockLink,
    all: ".u-dock-item-link",
    selector: '.u-dock-item-link[data-u-active="true"]',
    expected: [0],
  },
  {
    name: "steps disabled item (PX-C1 group 4)",
    key: "steps",
    type: USteps,
    inputs: STEPS(false),
    all: ".u-steps-item",
    selector: ".u-steps-item.u-steps-item-disabled",
    expected: [1],
  },
  {
    name: "steps readonly disables every non-active item",
    key: "steps",
    type: USteps,
    inputs: STEPS(true),
    all: ".u-steps-item",
    selector: ".u-steps-item.u-steps-item-disabled",
    expected: [1, 2],
  },
  {
    name: "steps focus ring excludes the disabled item's link (PX-C2)",
    key: "steps",
    type: USteps,
    inputs: STEPS(false),
    all: ".u-steps-item-link",
    selector: ".u-steps-item:not(.u-steps-item-disabled) .u-steps-item-link:focus-visible",
    expected: [0, 2],
  },
  {
    name: "steps readonly: focus ring only on the active item's link (PX-C2)",
    key: "steps",
    type: USteps,
    inputs: STEPS(true),
    all: ".u-steps-item-link",
    selector: ".u-steps-item:not(.u-steps-item-disabled) .u-steps-item-link:focus-visible",
    expected: [0],
  },
  {
    name: "steps active number",
    key: "steps",
    type: USteps,
    inputs: STEPS(false),
    all: ".u-steps-item-number",
    selector: ".u-steps-item-active .u-steps-item-number",
    expected: [0],
  },
  {
    name: "stepper active number",
    key: "stepper",
    type: StepperHost,
    all: ".u-step-number",
    selector: ".u-step-active .u-step-number",
    expected: [0],
  },
  {
    name: "stepper linear disabled role (C-7)",
    key: "stepper",
    type: LinearStepperHost,
    all: ".u-step",
    selector: ".u-step-disabled",
    expected: [1, 2],
  },
  {
    name: "stepper focus mapping skips disabled steps",
    key: "stepper",
    type: LinearStepperHost,
    all: ".u-step",
    selector: ".u-step:not(.u-step-disabled):focus-visible",
    expected: [0],
  },
  {
    name: "stepper vertical active item",
    key: "stepper",
    type: VerticalStepperHost,
    all: ".u-step-item",
    selector: ".u-step-item.u-step-item-active",
    expected: [0],
  },
  {
    name: "stepper vertical panels (group 22)",
    key: "stepper",
    type: VerticalStepperHost,
    all: ".u-step-panel",
    selector: ".u-step-item .u-step-panel",
    expected: [0, 1, 2],
  },
  {
    name: "stepper vertical inactive panels hidden (R-C3)",
    key: "stepper",
    type: VerticalStepperHost,
    all: ".u-step-panel",
    selector: ".u-step-panel[hidden]",
    expected: [1, 2],
  },
  {
    name: "tabs active tab",
    key: "tabs",
    type: TabsHost,
    all: ".u-tab",
    selector: ".u-tab-active",
    expected: [0],
  },
  {
    name: "tabs disabled role (C-7)",
    key: "tabs",
    type: TabsHost,
    all: ".u-tab",
    selector: ".u-tab-disabled",
    expected: [1],
  },
  {
    name: "tabs hover mapping skips active and disabled tabs",
    key: "tabs",
    type: TabsHost,
    all: ".u-tab",
    selector: ".u-tab:not(.u-tab-active):not(.u-tab-disabled):hover",
    expected: [2],
  },
  {
    name: "tabs viewport mapping (C-3)",
    key: "tabs",
    type: TabsHost,
    all: ".u-tablist-content",
    selector: ".u-tablist-content::-webkit-scrollbar",
    expected: [],
  },
  {
    name: "tabs viewport element renders (C-3)",
    key: "tabs",
    type: TabsHost,
    all: ".u-tablist-content",
    selector: ".u-tablist-content",
    expected: [0],
  },
];

describe("GAP-064 G3-C1 — Angular", () => {
  beforeAll(() => applyUltimateTheme());

  describe.each(CASES)("$name", (c) => {
    it("registers under the Aura key (C1)", () => {
      const { doc } = mount(c.type, c.mounts[0]);
      expect(count(doc, c.key)).toBe(1);
      expect(count(doc, `${c.key}-variables`)).toBe(1);
      expect(cssFor(doc, `${c.key}-variables`)).toContain(`--u-${c.key}-`);
    });

    it.each(c.mounts)("resolves every variable (C2) %o", (inputs) => {
      const { doc } = mount(c.type, inputs);
      expect(unresolved(doc, c.key)).toEqual([]);
      expect(cssFor(doc, c.key)).toContain(`var(--u-${c.key}-`);
    });
  });

  describe("state selectors match the rendered state (C3)", () => {
    it.each(ROWS)("$name", (row) => {
      const { doc, fixture, el } = mount(row.type, row.inputs);
      if (row.act) {
        row.act(el);
        fixture.detectChanges();
      }
      expect(cssFor(doc, row.key), "selector styled").toContain(row.selector);
      expect(matching(el, row.all, row.selector)).toEqual(row.expected);
    });
  });
});
```

- [ ] **Step 2: Vue spec `packages/vue/src/g3c1-aura-styles.spec.ts`**

```ts
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { h, nextTick, type VNode } from "vue";
import { applyUltimateTheme } from "@ultimate/themes";
import { vueCoreStyleSheet } from "@ultimate/vue-core";
import { UBreadcrumb } from "./breadcrumb";
import { UDock } from "./dock";
import { USteps } from "./steps";
import { UStep, UStepItem, UStepList, UStepPanel, UStepPanels, UStepper } from "./stepper";
import { UTab, UTabList, UTabPanel, UTabPanels, UTabs } from "./tabs";

/**
 * GAP-064 G3-C1 (Spec §9.1 C1, C2, C3 state selectors) for Vue. Assertions
 * use the generated <style data-u-style> elements and the rendered DOM; the
 * registry is reset before every test, as in G3-A/G3-B. No C1 key has an
 * unresolved reference.
 */
const KEY_ATTR = "data-u-style";

type Render = () => VNode;
const VALUES = [1, 2, 3];
const breadcrumb: Render = () =>
  h(UBreadcrumb, {
    model: [
      { label: "A", url: "#a" },
      { label: "B", disabled: true },
    ],
  });
const dock =
  (position = "bottom"): Render =>
  () =>
    h(UDock, { model: [{ label: "A" }, { label: "B", disabled: true }, { label: "C" }], position });
const steps =
  (readonly: boolean): Render =>
  () =>
    h(USteps, {
      model: [{ label: "A" }, { label: "B", disabled: true }, { label: "C" }],
      activeStep: 0,
      readonly,
    });
const stepper =
  (linear: boolean): Render =>
  () =>
    h(UStepper, { value: 1, linear }, () => [
      h(UStepList, null, () => VALUES.map((v) => h(UStep, { value: v }, () => `S${v}`))),
      h(UStepPanels, null, () => VALUES.map((v) => h(UStepPanel, { value: v }, () => `P${v}`))),
    ]);
const verticalStepper: Render = () =>
  h(UStepper, { value: 1 }, () =>
    VALUES.map((v) =>
      h(UStepItem, { value: v }, () => [
        h(UStep, { value: v }, () => `S${v}`),
        h(UStepPanel, { value: v }, () => `P${v}`),
      ])
    )
  );
const tabs: Render = () =>
  h(UTabs, { value: 0 }, () => [
    h(UTabList, null, () =>
      [0, 1, 2].map((v) => h(UTab, { value: v, disabled: v === 1 }, () => `T${v}`))
    ),
    h(UTabPanels, null, () => [0, 1, 2].map((v) => h(UTabPanel, { value: v }, () => `P${v}`))),
  ]);

interface Case {
  name: string;
  key: string;
  mounts: Render[];
}
const CASES: Case[] = [
  { name: "breadcrumb", key: "breadcrumb", mounts: [breadcrumb] },
  { name: "dock", key: "dock", mounts: [dock("bottom"), dock("top"), dock("left"), dock("right")] },
  { name: "steps", key: "steps", mounts: [steps(true), steps(false)] },
  { name: "stepper", key: "stepper", mounts: [stepper(false), stepper(true), verticalStepper] },
  { name: "tabs", key: "tabs", mounts: [tabs] },
];

async function render(node: Render) {
  const wrapper = mount({ render: node });
  await nextTick();
  await nextTick();
  return wrapper.element as HTMLElement;
}

const styles = () =>
  Array.from(document.head.querySelectorAll<HTMLStyleElement>(`style[${KEY_ATTR}]`));
const count = (key: string) => styles().filter((s) => s.getAttribute(KEY_ATTR) === key).length;
const cssFor = (key: string) =>
  styles()
    .filter((s) => s.getAttribute(KEY_ATTR) === key)
    .map((s) => s.textContent ?? "")
    .join("\n");

function unresolved(key: string): string[] {
  const refs = new Set(Array.from(cssFor(key).matchAll(/var\(\s*(--u-[a-z0-9-]+)/g), (m) => m[1]));
  const all = styles()
    .map((s) => s.textContent ?? "")
    .join("\n");
  const defined = new Set(Array.from(all.matchAll(/(--u-[a-z0-9-]+)\s*:/g), (m) => m[1]));
  return [...refs].filter((n) => !defined.has(n)).sort();
}

/** User-action pseudo-classes cannot be matched in jsdom; the rest of the selector must match. */
const strip = (selector: string) =>
  selector.replace(/:(hover|focus-visible|active)(?![a-z-])/g, "");
/** Indices (document order, root first) of the elements matching `all` that match the stripped selector. */
function matching(root: HTMLElement, all: string, selector: string): number[] {
  const els = [
    ...(root.matches(all) ? [root] : []),
    ...Array.from(root.querySelectorAll<HTMLElement>(all)),
  ];
  return els.flatMap((el, i) => (el.matches(strip(selector)) ? [i] : []));
}

interface StateRow {
  name: string;
  key: string;
  node: Render;
  act?: (el: HTMLElement) => void;
  all: string;
  selector: string;
  expected: number[];
}
const hoverFirstDockLink = (el: HTMLElement) =>
  el.querySelector(".u-dock-item-link")!.dispatchEvent(new MouseEvent("mouseenter"));

const ROWS: StateRow[] = [
  {
    name: "breadcrumb disabled role (C-7)",
    key: "breadcrumb",
    node: breadcrumb,
    all: ".u-breadcrumb-item",
    selector: ".u-breadcrumb-item-disabled",
    expected: [1],
  },
  ...(["top", "bottom", "left", "right"] as const).map((p) => ({
    name: `dock position ${p}`,
    key: "dock",
    node: dock(p),
    all: ".u-dock",
    selector: `.u-dock-${p}`,
    expected: [0],
  })),
  {
    name: "dock disabled role (C-7)",
    key: "dock",
    node: dock(),
    all: ".u-dock-item",
    selector: ".u-dock-item-disabled",
    expected: [1],
  },
  {
    name: "dock idle: no magnified link (R-C2)",
    key: "dock",
    node: dock(),
    all: ".u-dock-item-link",
    selector: '.u-dock-item-link[data-u-active="true"]',
    expected: [],
  },
  {
    name: "dock hovered link magnified (R-C2)",
    key: "dock",
    node: dock(),
    act: hoverFirstDockLink,
    all: ".u-dock-item-link",
    selector: '.u-dock-item-link[data-u-active="true"]',
    expected: [0],
  },
  {
    name: "steps disabled item (PX-C1 group 4)",
    key: "steps",
    node: steps(false),
    all: ".u-steps-item",
    selector: ".u-steps-item.u-steps-item-disabled",
    expected: [1],
  },
  {
    name: "steps readonly disables every non-active item",
    key: "steps",
    node: steps(true),
    all: ".u-steps-item",
    selector: ".u-steps-item.u-steps-item-disabled",
    expected: [1, 2],
  },
  {
    name: "steps focus ring excludes the disabled item's link (PX-C2)",
    key: "steps",
    node: steps(false),
    all: ".u-steps-item-link",
    selector: ".u-steps-item:not(.u-steps-item-disabled) .u-steps-item-link:focus-visible",
    expected: [0, 2],
  },
  {
    name: "steps readonly: focus ring only on the active item's link (PX-C2)",
    key: "steps",
    node: steps(true),
    all: ".u-steps-item-link",
    selector: ".u-steps-item:not(.u-steps-item-disabled) .u-steps-item-link:focus-visible",
    expected: [0],
  },
  {
    name: "steps active number",
    key: "steps",
    node: steps(false),
    all: ".u-steps-item-number",
    selector: ".u-steps-item-active .u-steps-item-number",
    expected: [0],
  },
  {
    name: "stepper active number",
    key: "stepper",
    node: stepper(false),
    all: ".u-step-number",
    selector: ".u-step-active .u-step-number",
    expected: [0],
  },
  {
    name: "stepper linear disabled role (C-7)",
    key: "stepper",
    node: stepper(true),
    all: ".u-step",
    selector: ".u-step-disabled",
    expected: [1, 2],
  },
  {
    name: "stepper focus mapping skips disabled steps",
    key: "stepper",
    node: stepper(true),
    all: ".u-step",
    selector: ".u-step:not(.u-step-disabled):focus-visible",
    expected: [0],
  },
  {
    name: "stepper vertical active item",
    key: "stepper",
    node: verticalStepper,
    all: ".u-step-item",
    selector: ".u-step-item.u-step-item-active",
    expected: [0],
  },
  {
    name: "stepper vertical panels (group 22)",
    key: "stepper",
    node: verticalStepper,
    all: ".u-step-panel",
    selector: ".u-step-item .u-step-panel",
    expected: [0, 1, 2],
  },
  {
    name: "stepper vertical content wrapper (group 23, Vue only)",
    key: "stepper",
    node: verticalStepper,
    all: ".u-step-panel-content-wrapper",
    selector: ".u-step-item .u-step-panel-content-wrapper",
    expected: [0, 1, 2],
  },
  {
    name: "stepper vertical content (group 24, Vue only)",
    key: "stepper",
    node: verticalStepper,
    all: ".u-step-panel-content",
    selector: ".u-step-item .u-step-panel-content",
    expected: [0, 1, 2],
  },
  {
    name: "tabs active tab",
    key: "tabs",
    node: tabs,
    all: ".u-tab",
    selector: ".u-tab-active",
    expected: [0],
  },
  {
    name: "tabs disabled role (C-7)",
    key: "tabs",
    node: tabs,
    all: ".u-tab",
    selector: ".u-tab-disabled",
    expected: [1],
  },
  {
    name: "tabs hover mapping skips active and disabled tabs",
    key: "tabs",
    node: tabs,
    all: ".u-tab",
    selector: ".u-tab:not(.u-tab-active):not(.u-tab-disabled):hover",
    expected: [2],
  },
  {
    name: "tabs viewport mapping (C-3)",
    key: "tabs",
    node: tabs,
    all: ".u-tablist-content",
    selector: ".u-tablist-content::-webkit-scrollbar",
    expected: [],
  },
  {
    name: "tabs viewport element renders (C-3)",
    key: "tabs",
    node: tabs,
    all: ".u-tablist-content",
    selector: ".u-tablist-content",
    expected: [0],
  },
];

describe("GAP-064 G3-C1 — Vue", () => {
  beforeAll(() => applyUltimateTheme());
  beforeEach(() => {
    vueCoreStyleSheet.clear();
    styles().forEach((s) => s.remove());
  });

  describe.each(CASES)("$name", (c) => {
    it("registers under the Aura key (C1)", async () => {
      await render(c.mounts[0]);
      expect(count(c.key)).toBe(1);
      expect(count(`${c.key}-variables`)).toBe(1);
      expect(cssFor(`${c.key}-variables`)).toContain(`--u-${c.key}-`);
    });

    it.each(c.mounts.map((node, i) => ({ i, node })))(
      "resolves every variable (C2) mount $i",
      async ({ node }) => {
        await render(node);
        expect(unresolved(c.key)).toEqual([]);
        expect(cssFor(c.key)).toContain(`var(--u-${c.key}-`);
      }
    );
  });

  describe("state selectors match the rendered state (C3)", () => {
    it.each(ROWS)("$name", async (row) => {
      const el = await render(row.node);
      if (row.act) {
        row.act(el);
        await nextTick();
      }
      expect(cssFor(row.key), "selector styled").toContain(row.selector);
      expect(matching(el, row.all, row.selector)).toEqual(row.expected);
    });
  });
});
```

The `.u-dock` root in Vue is the component root element, so `matching` counts it as index 0, as in Angular (whose `u-dock` host carries no class).

- [ ] **Step 3: Run both — RED for the expected reasons**

```bash
pnpm --filter @ultimate/ng exec ng test --project=ng --include=src/g3c1-aura-styles.spec.ts --watch=false
pnpm --filter @ultimate/vue exec vitest run src/g3c1-aura-styles.spec.ts
```

Expected: C1 key tests **pass** already (no rename in C1). C2 fails only on `toContain("var(--u-<key>-")` (the current CSS has no token reference); `unresolved` is `[]`. State rows fail only on "selector styled" for selectors absent from the current CSS; every **`matching` expectation already holds** (the DOM does not change in C1). A `matching` failure means the row's expected indices are wrong about the existing DOM: stop and report — do not adjust indices without approval.

- [ ] **Step 4: Commit**

```bash
git add packages/ng/src/g3c1-aura-styles.spec.ts packages/vue/src/g3c1-aura-styles.spec.ts
git commit -m "test(gap-064): add G3-C1 runtime key, variable and state-selector tests"
```

---

### Task 5: Angular port (5 style modules)

**Files:**

- Modify: `packages/ng/src/{breadcrumb,dock,steps,stepper,tabs}/*-style.ts` (`css` block + one doc-comment line)

- [ ] **Step 1: Replace each `css` body with the CLI output**

For each key in `breadcrumb dock steps stepper tabs`:

```bash
node packages/themes/test/utils/g3c1-port.mjs ng breadcrumb
```

Replace the whole content between ``const css = /*css*/ ` `` and the closing `` ` `` with that output (one rule per line, a leading and trailing newline). Do not hand-edit any rule. Add this line at the end of the file's leading doc comment:

```
 * GAP-064 G3-C1: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3c1-port.mjs).
```

Nothing else in the file changes (`classes`, exports, other comments).

- [ ] **Step 2: Run the checks — GREEN**

```bash
pnpm --filter @ultimate/themes exec vitest run test/g3c1-upstream-fidelity.test.ts -t "^ng "
pnpm --filter @ultimate/ng exec ng test --project=ng --include=src/g3c1-aura-styles.spec.ts --watch=false
pnpm --filter @ultimate/ng exec ng test --project=ng --include="src/{breadcrumb,dock,steps,stepper,tabs}/**/*.spec.ts" --watch=false
```

Expected: all ng fidelity cases, the whole Angular runtime spec and the existing C1 component specs pass. An existing component spec that asserts a removed literal (for example a hard-coded CSS value) is a **stop**: report it — do not edit the test.

- [ ] **Step 3: C4 diff check (Angular)**

```bash
git diff --stat -- packages/ng/src
git diff -- packages/ng/src/{breadcrumb,dock,steps,stepper,tabs}/*-style.ts
```

Expected: the stat lists only the 5 style files. In each file's diff, every hunk lies inside the `css` template literal, except the one added doc-comment line; the `classes` object and exports are untouched.

- [ ] **Step 4: Commit**

```bash
git add packages/ng/src/{breadcrumb,dock,steps,stepper,tabs}/*-style.ts
git commit -m "feat(gap-064): port Navigation Aura structural CSS to Angular (G3-C1)"
```

---

### Task 6: Vue port (5 style modules), early size check and mandatory Stepper regression

**Files:**

- Modify: `packages/vue/src/{breadcrumb,dock,steps,stepper,tabs}/*-style.ts` (`css` block + one doc-comment line)

- [ ] **Step 1: Replace each `css` body with the CLI output**

For each key: `node packages/themes/test/utils/g3c1-port.mjs vue <key>`, pasted exactly as in Task 5 Step 1, with the same doc-comment line. Nothing else changes.

- [ ] **Step 2: Run the checks — GREEN**

```bash
pnpm --filter @ultimate/themes exec vitest run test/g3c1-upstream-fidelity.test.ts
pnpm --filter @ultimate/vue exec vitest run src/g3c1-aura-styles.spec.ts
pnpm --filter @ultimate/vue exec vitest run src/breadcrumb src/dock src/steps src/stepper src/tabs
```

Expected: the whole fidelity test (both frameworks), the Vue runtime spec and the existing C1 Vue component specs pass. An existing spec asserting a removed literal is a stop (report; do not edit).

- [ ] **Step 3: C4 diff check (Vue)**

```bash
git diff --stat -- packages/vue/src
git diff -- packages/vue/src/{breadcrumb,dock,steps,stepper,tabs}/*-style.ts
```

Expected: only the 5 style files; every hunk inside the `css` literal except the one doc-comment line.

- [ ] **Step 4: Early size check (hard stop)**

```bash
pnpm run build && pnpm run size:measure
node scripts/provenance/validate-bundle-size.mjs --base-ref 2c8ef45
```

Expected: pass. Record the ng and vue rows. Any package above 15%: **stop and report** — no split, no override. (Early warning only; the authoritative gate is Task 10 Step 4.)

- [ ] **Step 5: Mandatory Vue Stepper regression (Spec C10)**

```bash
git add packages/vue/src/{breadcrumb,dock,steps,stepper,tabs}/*-style.ts
git archive -o .superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/docker/src.tar "$(git write-tree)"
docker run --rm -v "$PWD/.superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/docker:/io" mcr.microsoft.com/playwright:v1.63.0-jammy bash /io/run.sh stepper
```

Expected: `stepper exit 0` (3 tests: vue chromium/firefox/webkit). A failure is a **stop** (Spec §12): report it with `stepper.log`; do not change the spec, the stories or the CSS data.

- [ ] **Step 6: Commit**

```bash
git commit -m "feat(gap-064): port Navigation Aura structural CSS to Vue (G3-C1)"
```

---

### Task 7: Provenance for the 10 style files (C11)

**Files:**

- Modify: `docs/architecture/provenance/ng.json`, `docs/architecture/provenance/vue.json` (append 5 entries each, after the last G3-B entry)
- Modify (approved at Plan Review, PR-C1-2): `docs/architecture/PROVENANCE.md` (`@primeuix/styles` entry)

- [ ] **Step 1: Append the entries**

Each entry has this shape (G3-A/G3-B wording):

```json
{
  "originalPath": "src/<key>/index.ts",
  "ultimateDestination": "packages/<fw>/src/<key>/<key>-style.ts",
  "modificationStatus": "reference-derived",
  "modificationDescription": "Ported (Option B — reference, not verbatim copy) from @primeuix/styles@2.0.3 <key>, selectors adapted to Ultimate's DOM per the GAP-064 G3-C1 mapping (packages/themes/test/utils/g3c1-port.mjs); exceptions <list>."
}
```

`<list>` per entry (exactly):

| key        | ng                                               | vue                                              |
| ---------- | ------------------------------------------------ | ------------------------------------------------ |
| breadcrumb | C-7 disabled base role, FX-C1                    | C-7 disabled base role, FX-C1                    |
| dock       | C-7 disabled base role, R-C1, R-C2, FX-C2, FX-C3 | C-7 disabled base role, R-C1, R-C2, FX-C2, FX-C3 |
| steps      | PX-C1, PX-C2, FX-C4                              | PX-C1, PX-C2, FX-C4                              |
| stepper    | C-7 disabled base role, R-C3, FX-C5, FX-C6       | C-7 disabled base role, FX-C5                    |
| tabs       | C-7 disabled base role                           | C-7 disabled base role                           |

- [ ] **Step 2 (approved, PR-C1-2): update `PROVENANCE.md`**

In the `@primeuix/styles` entry's Modification status, after the GAP-064 G3-B sentence (G3-B Amendment A2), add: `GAP-064 G3-C1: 5 keys (breadcrumb, dock, steps, stepper, tabs), 10 ng/vue style files.` Nothing else in the file changes.

- [ ] **Step 3: Check**

```bash
grep -c "GAP-064 G3-C1 mapping" docs/architecture/provenance/ng.json docs/architecture/provenance/vue.json
npx prettier --check docs/architecture/provenance/ng.json docs/architecture/provenance/vue.json docs/architecture/PROVENANCE.md
pnpm run provenance:validate -- --base-ref 2c8ef45
```

Expected: `ng.json:5`, `vue.json:5`; Prettier clean for the JSON files (`PROVENANCE.md` Prettier state compared with `2c8ef45`: no new debt); `provenance:validate --base-ref 2c8ef45` passes (Step 2 updates `PROVENANCE.md`; without it the check fails with "diff touches a Prime-derived package path but does not update docs/architecture/PROVENANCE.md", G3-B Amendment A2).

- [ ] **Step 4: Commit**

```bash
git add docs/architecture/provenance/ng.json docs/architecture/provenance/vue.json docs/architecture/PROVENANCE.md
git commit -m "docs(gap-064): record provenance for the G3-C1 style modules"
```

---

### Task 8: Accessibility differential for G3-C1 (validator, evidence, CI wiring)

Spec §10, SR-C1-2. CI changes happen here and nowhere earlier.

**Files:**

- Create: `scripts/provenance/validate-g3c1-accessibility.mjs`, `scripts/provenance/validate-g3c1-accessibility.test.mjs`
- Create (git-ignored): `.superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/docker/fingerprints.mjs`
- Create: `docs/architecture/research/2026-10-05-gap-064-g3c1-accessibility-preexisting.md`
- Modify: `.github/workflows/ci.yml` (job `track-a-browser-visual-a11y` only)

**Interfaces:**

- Consumes: `BASELINE_PATH`, `computeFingerprint`, `parseBaselineFingerprints`, `loadBaseline`, `readEnvelopes` from the unchanged `scripts/provenance/validate-accessibility-baseline.mjs`; Task 2's `docker/before/`; the `STORIES` tables of Task 1.
- Produces: `node scripts/provenance/validate-g3c1-accessibility.mjs <ng|vue>` (exit 0/1); `docker/after/` envelopes (Task 9).

- [ ] **Step 1: Write the failing tests `scripts/provenance/validate-g3c1-accessibility.test.mjs`**

Create it as a copy of the frozen `scripts/provenance/validate-g3b-accessibility.test.mjs` (which stays byte-identical) with exactly these substitutions, and nothing else:

| Line (G3-B test) | Exact fragment in the G3-B test                       | Replacement in the G3-C1 test                          |
| ---------------- | ----------------------------------------------------- | ------------------------------------------------------ |
| 8                | `validate-g3b-accessibility.mjs`                      | `validate-g3c1-accessibility.mjs`                      |
| 11               | `2026-10-05-gap-064-g3b-accessibility-preexisting.md` | `2026-10-05-gap-064-g3c1-accessibility-preexisting.md` |
| 13               | `length: 25`                                          | `length: 17`                                           |
| comment          | `the ng G3-B spec's STORIES table`                    | `the ng G3-C1 spec's STORIES table`                    |
| `makeWorkDir`    | `"g3b-a11y-"`                                         | `"g3c1-a11y-"`                                         |
| `makeWorkDir`    | `packages/ng/e2e/g3b-aura-styles.spec.ts`             | `packages/ng/e2e/g3c1-aura-styles.spec.ts`             |
| 65               | `75\/75`                                              | `51\/51`                                               |
| 75               | `of 75`                                               | `of 51`                                                |
| 103              | `lists 24 G3-B stories, expected 25`                  | `lists 16 G3-C1 stories, expected 17`                  |

Check: `grep -n "g3b\|G3-B\|25\|75" scripts/provenance/validate-g3c1-accessibility.test.mjs` prints nothing.

Run: `node --test scripts/provenance/validate-g3c1-accessibility.test.mjs`
Expected: FAIL (the script does not exist).

- [ ] **Step 2: Write `scripts/provenance/validate-g3c1-accessibility.mjs`**

Create it as a copy of the frozen `scripts/provenance/validate-g3b-accessibility.mjs` with exactly these substitutions, and nothing else (logic identical):

| In the G3-B validator                                                   | In the G3-C1 validator                                                                  |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| header path `validate-g3b-accessibility.mjs`, usage line                | `validate-g3c1-accessibility.mjs`                                                       |
| header `GAP-064 G3-B differential … (G3-B Spec §9, §13.1)`              | `GAP-064 G3-C1 differential … (G3-C1 Spec §10, §15 SR-C1-2)`                            |
| header `` `--grep-invert "G3-A\|G3-B"` ``                               | `` `--grep-invert "G3-A\|G3-B\|G3-C1"` ``                                               |
| header `(ng 25, vue 25)`                                                | `(ng 17, vue 17)`                                                                       |
| header `the G3-B pre-existing evidence list`, `G3-B story`              | `the G3-C1 pre-existing evidence list`, `G3-C1 story`                                   |
| header `validate-g3a-accessibility.mjs is left unchanged.`              | `validate-g3a-accessibility.mjs and validate-g3b-accessibility.mjs are left unchanged.` |
| `PREEXISTING_PATH` `…-g3b-accessibility-preexisting.md`                 | `…-g3c1-accessibility-preexisting.md`                                                   |
| `EXPECTED_STORY_COUNT = { ng: 25, vue: 25 }`                            | `{ ng: 17, vue: 17 }`                                                                   |
| `PREFIX = "[validate-g3b-accessibility]"`                               | `"[validate-g3c1-accessibility]"`                                                       |
| function `g3bStoryIds`, comment `G3-B story set`                        | `g3c1StoryIds`, `G3-C1 story set`                                                       |
| `` `packages/${fw}/e2e/g3b-aura-styles.spec.ts` ``, label `"G3-B spec"` | `` `packages/${fw}/e2e/g3c1-aura-styles.spec.ts` ``, `"G3-C1 spec"`                     |
| message `` `G3-B stories, expected` ``                                  | `` `G3-C1 stories, expected` ``                                                         |

Check: `grep -n "g3b\|G3-B" scripts/provenance/validate-g3c1-accessibility.mjs` prints only the header line naming `validate-g3b-accessibility.mjs`.

Run: `node --test scripts/provenance/validate-g3c1-accessibility.test.mjs && pnpm run test:scripts`
Expected: 8/8 pass; `test:scripts` all pass (G3-A/G3-B script tests included, unchanged).

- [ ] **Step 3: Post-port Docker run (the "after" state)**

```bash
git archive -o .superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/docker/src.tar HEAD
docker run --rm -v "$PWD/.superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/docker:/io" mcr.microsoft.com/playwright:v1.63.0-jammy bash /io/run.sh c1
mkdir -p .superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/docker/after
tar -xf .superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/docker/c1-results.tar -C .superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/docker/after
git rev-parse --short HEAD
```

Expected: every **layout** and **accessibility** test passes; **visual** tests may fail with screenshot diffs only (reviewed in Task 9). A failing layout test is **UNEXPECTED**: stop and report. Record HEAD as `<afterSha>`.

- [ ] **Step 4: Derive the pre-existing evidence**

Write `.superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/docker/fingerprints.mjs` as a copy of `.superpowers/sdd/2026-10-05-gap-064-g3b-containers/docker/fingerprints.mjs` (G3-B Plan Task 8 Step 4) with `G3-B` → `G3-C1` in its comments and in the printed note (`Pre-existing before the G3-C1 port (<beforeSha>) and still present after it (<afterSha>).`). The import path `../../../../scripts/provenance/validate-accessibility-baseline.mjs` is unchanged (same depth).

Create `docs/architecture/research/2026-10-05-gap-064-g3c1-accessibility-preexisting.md` (Write tool) with this header, filling the counts from the script's stderr:

```markdown
# GAP-064 G3-C1 — pre-existing accessibility violations on the G3-C1 verification stories

**Date:** <execution date>. **Type:** dated evidence (AGENTS.md tier 6). This file is **not** an accessibility baseline and not CI configuration.

## What this is

These are the <N> axe violation fingerprints (`rule:story:target`) that the 34 G3-C1 verification stories (ng 17, vue 17) show **before and after** the G3-C1 CSS port. They predate G3-C1; the G3-C1 stories only expose them, because most of those story IDs were never scanned before.

- Derivation: the unique rows observed both in the pre-port run (`<beforeSha>`, Plan Task 2) and the post-port run (`<afterSha>`, Plan Task 8 Step 3). Both are Docker `mcr.microsoft.com/playwright:v1.63.0-jammy` runs of `packages/{ng,vue}/e2e/g3c1-aura-styles.spec.ts`, recorded in `docs/superpowers/plans/2026-10-05-gap-064-g3c1-visual-review.md`. Counts: before <B>, after <A>, pre-existing <N>, introduced <I>, fixed <F>.
- Consumer: `scripts/provenance/validate-g3c1-accessibility.mjs` only. `validate-accessibility-baseline.mjs`, `validate-g3a-accessibility.mjs` and `validate-g3b-accessibility.mjs` never read it.
- Introduced rows are **not** listed here; they go to the Task 9 review gate, and only approved ones enter `ACCESSIBILITY_BASELINE.md`.
- Changes are human-authored, reviewed edits only. Remove a row once its debt is fixed (the check reports it as STALE). Never add a row to silence a violation introduced by a later change.

| Fingerprint | Rule | Component/Story | Note |
| ----------- | ---- | --------------- | ---- |
```

Then append the rows (literal path; append only):

```bash
node .superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/docker/fingerprints.mjs \
  .superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/docker/before \
  .superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/docker/after <beforeSha> <afterSha> \
  >> docs/architecture/research/2026-10-05-gap-064-g3c1-accessibility-preexisting.md
npx prettier --write docs/architecture/research/2026-10-05-gap-064-g3c1-accessibility-preexisting.md
```

Save the stderr output (counts, INTRODUCED, FIXED) for Task 9.

- [ ] **Step 5: Run the validator on the after-state**

If a local `test-results/` exists, first move it to `.superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/local-test-results/` (never delete it), and move it back afterwards.

```bash
cp -R .superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/docker/after/test-results test-results
node scripts/provenance/validate-g3c1-accessibility.mjs ng; node scripts/provenance/validate-g3c1-accessibility.mjs vue
rm -r test-results
```

(The `rm` removes only the copy made on the first line.)

Expected: `51/51` reports per framework. Exit 0 if 0 introduced; otherwise exit 1 listing exactly the INTRODUCED rows of Step 4 — these go to Task 9, never into the evidence file.

- [ ] **Step 6: Wire CI (SR-C1-2)**

In `.github/workflows/ci.yml`, job `track-a-browser-visual-a11y`:

1. In the strict run step `Run Playwright projects (${{ matrix.framework }})`, change `--grep-invert "G3-A|G3-B"` to `--grep-invert "G3-A|G3-B|G3-C1"` (this one line only; its comment is left as G3-B left it).
2. After the step `Upload G3-B accessibility reports (${{ matrix.framework }})`, add:

```yaml
# GAP-064 G3-C1 Spec §10 (SR-C1-2): differential accessibility contract for
# the G3-C1 verification stories (same contract as G3-A/G3-B, own story set
# and evidence list). The visual and layout tests in this run stay a hard gate.
- name: Run G3-C1 verification specs (${{ matrix.framework }})
  if: ${{ !cancelled() && matrix.framework != 'react' }}
  run: |
    npx playwright test packages/${{ matrix.framework }}/e2e/g3c1-aura-styles.spec.ts \
      --project=${{ matrix.framework }}-chromium \
      --project=${{ matrix.framework }}-firefox \
      --project=${{ matrix.framework }}-webkit

- name: G3-C1 differential accessibility validation (${{ matrix.framework }})
  if: ${{ !cancelled() && matrix.framework != 'react' }}
  # An explicit bash shell adds pipefail, so the validator's exit code
  # survives the pipe into tee.
  shell: bash
  run: |
    mkdir -p test-results/g3c1-accessibility
    node scripts/provenance/validate-g3c1-accessibility.mjs ${{ matrix.framework }} 2>&1 \
      | tee test-results/g3c1-accessibility/${{ matrix.framework }}-validation.txt

- name: Upload G3-C1 accessibility reports (${{ matrix.framework }})
  if: ${{ always() && matrix.framework != 'react' }}
  uses: actions/upload-artifact@v4
  with:
    name: g3c1-accessibility-reports-${{ matrix.framework }}
    path: |
      test-results/accessibility/${{ matrix.framework }}/
      test-results/g3c1-accessibility/
```

Nothing else in `ci.yml` changes; the G3-A and G3-B steps stay byte-identical. Then:

```bash
actionlint .github/workflows/ci.yml
git diff -- .github/workflows/ci.yml
git diff --quiet 2c8ef45 -- scripts/provenance/validate-g3a-accessibility.mjs scripts/provenance/validate-g3a-accessibility.test.mjs scripts/provenance/validate-g3b-accessibility.mjs scripts/provenance/validate-g3b-accessibility.test.mjs scripts/provenance/validate-accessibility-baseline.mjs packages/themes/test/utils/g3a-port.mjs packages/themes/test/utils/g3b-port.mjs && echo "frozen tooling unchanged"
```

Expected: actionlint clean; the diff shows only the changed strict-run line and the added steps; `frozen tooling unchanged`. The end-to-end CI simulation runs in Task 10 (after the baselines exist).

- [ ] **Step 7: Commit**

```bash
git add scripts/provenance/validate-g3c1-accessibility.mjs scripts/provenance/validate-g3c1-accessibility.test.mjs \
  docs/architecture/research/2026-10-05-gap-064-g3c1-accessibility-preexisting.md .github/workflows/ci.yml
git commit -m "ci(gap-064): add the G3-C1 differential accessibility check"
```

---

### Task 9: Visual and accessibility review gate — HARD USER STOP

**Files:**

- Create: `docs/superpowers/plans/2026-10-05-gap-064-g3c1-visual-review.md`
- Modify (only after approval): `packages/{ng,vue}/e2e/g3c1-aura-styles.spec.ts-snapshots/*.png`; `docs/architecture/ACCESSIBILITY_BASELINE.md` (approved rows only)

- [ ] **Step 1: Existing regression suite (must stay clean)**

```bash
git archive -o .superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/docker/src.tar HEAD
docker run --rm -v "$PWD/.superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/docker:/io" mcr.microsoft.com/playwright:v1.63.0-jammy bash /io/run.sh regression
mkdir -p .superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/docker/regression
tar -xf .superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/docker/regression-results.tar -C .superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/docker/regression
```

Expected: 0 failures apart from retry-passing flakes (record each) and the known G3-B exception U2 (Vue Card WebKit, external CDN; recorded, not fixed). Includes G3-A, G3-B, React and `packages/vue/e2e/stepper.spec.ts` (mandatory). Any other failure is **UNEXPECTED**: investigate, record, stop. Never update a regression baseline here.

- [ ] **Step 2: Write the review record**

`docs/superpowers/plans/2026-10-05-gap-064-g3c1-visual-review.md`, sections:

1. Environment: image, architecture, Node, pnpm, `<beforeSha>`, `<afterSha>`.
2. Changed G3-C1 screenshots (Task 8 Step 3): per test and project, the expected/actual/diff paths under `docker/after/test-results/` and a one-line description of the visible change. Flag the **approved parity changes** explicitly: PX-C1 (Steps Default/WithDisabledItem: disabled items no longer dimmed, SR-C1-1) and SR-C1-4 (Dock WithDisabledItem: `0.5` → `disabled.opacity`).
3. Unchanged G3-C1 screenshots: "identical" or "inside tolerance" (recorded explicitly).
4. Before-state evidence: Task 2's `layout-evidence.txt` and the passing after results.
5. Regression run: pass/flaky/fail counts per project; `stepper.spec.ts` result stated separately.
6. Accessibility: the Task 8 Step 4 counts; every INTRODUCED row (rule, story, target, browser, contrast ratio where axe reports one); FIXED rows.
7. C5 coverage checklist: which story exercises which D1/D3/D5 rule family per key (Spec §9.2 table).
8. UNEXPECTED items with investigated causes.

Copy the diff PNGs into `.superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/review/` so they survive later runs.

- [ ] **Step 3: STOP — user review**

Report the record and artifacts. Wait for explicit approval of (a) which screenshots to accept and (b) which INTRODUCED accessibility rows, if any, enter `ACCESSIBILITY_BASELINE.md`. A rejected change is a stop: no fix is attempted without a new decision. **No baseline or accessibility change happens without that approval.**

- [ ] **Step 4: Update only the approved baselines, in Docker**

With `<grep>` built from the approved titles (for example `"Ng/(Steps Default|Tabs Default) G3-C1 visual|Vue/(…) G3-C1 visual"`):

```bash
git archive -o .superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/docker/src.tar HEAD
docker run --rm -v "$PWD/.superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/docker:/io" mcr.microsoft.com/playwright:v1.63.0-jammy bash /io/run.sh update "<grep>"
tar -xf .superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/docker/snapshots.tar -C .
git status --short
```

Expected: only approved PNGs modified. Add approved accessibility rows to `ACCESSIBILITY_BASELINE.md` in its existing format with the note `GAP-064 G3-C1 — upstream Aura parity exception (user-approved <date>)`.

Then stage, archive the staged tree (`git archive -o .superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/docker/src.tar "$(git write-tree)"`) and re-run `c1`: expected 0 failures.

- [ ] **Step 5: Commit**

```bash
git add packages/ng/e2e/g3c1-aura-styles.spec.ts-snapshots packages/vue/e2e/g3c1-aura-styles.spec.ts-snapshots \
  docs/superpowers/plans/2026-10-05-gap-064-g3c1-visual-review.md
git add docs/architecture/ACCESSIBILITY_BASELINE.md   # only if approved rows were added
git commit -m "test(gap-064): accept reviewed G3-C1 screenshot baselines"
```

---

### Task 10: Final verification (C4, C8, C9, C10, CI simulation)

**Files:**

- Modify: `docs/superpowers/plans/2026-10-05-gap-064-g3c1-visual-review.md` (append "Verification")

- [ ] **Step 1: Suites, typecheck, SSR**

```bash
pnpm --filter @ultimate/uix-styled test
pnpm --filter @ultimate/themes test
pnpm --filter @ultimate/vue-core test
pnpm --filter @ultimate/vue test
pnpm --filter @ultimate/react test
pnpm --filter @ultimate/ng test --watch=false
pnpm --filter @ultimate/ng-core test --watch=false
pnpm run test:scripts
pnpm run typecheck
pnpm --filter-prod "playground-angular..." run build && TRACK_E_SSR_FRAMEWORK=ng npx playwright test --project=ng-ssr-chromium
```

Expected: all pass (G3-A and G3-B tests included).

- [ ] **Step 2: CI simulation (SR-C1-2) for all three frameworks, plus the mandatory Stepper regression**

```bash
git archive -o .superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/docker/src.tar HEAD
for fw in ng vue react; do docker run --rm -v "$PWD/.superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/docker:/io" mcr.microsoft.com/playwright:v1.63.0-jammy bash /io/run.sh ci $fw; done
docker run --rm -v "$PWD/.superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/docker:/io" mcr.microsoft.com/playwright:v1.63.0-jammy bash /io/run.sh stepper
```

Expected: for every framework, strict run and strict check exit 0 (the vue strict run includes `stepper.spec.ts`; the known U2 exception is the only permitted Vue failure and is recorded); for ng and vue, G3-A and G3-B run/check exit 0 with their recorded counts (G3-A ng `93/93`, vue `102/102`; G3-B `75/75`), and G3-C1 run/check exit 0 (`51/51`). React runs only the strict steps. `stepper exit 0`.

- [ ] **Step 3: Scope and DOM (C4, C9)**

```bash
git diff 2c8ef45 --name-only
git diff 2c8ef45 --stat -- packages/react packages/react-core packages/uix-styled packages/uix-styles packages/themes/src packages/ng-core packages/vue-core
git diff 2c8ef45 --quiet -- scripts/provenance/validate-g3a-accessibility.mjs scripts/provenance/validate-g3a-accessibility.test.mjs scripts/provenance/validate-g3b-accessibility.mjs scripts/provenance/validate-g3b-accessibility.test.mjs scripts/provenance/validate-accessibility-baseline.mjs packages/themes/test/utils/g3a-port.mjs packages/themes/test/utils/g3b-port.mjs packages/ng/e2e/g3a-aura-styles.spec.ts packages/vue/e2e/g3a-aura-styles.spec.ts packages/ng/e2e/g3b-aura-styles.spec.ts packages/vue/e2e/g3b-aura-styles.spec.ts packages/vue/e2e/stepper.spec.ts && echo "frozen tooling unchanged"
```

Expected: the second command prints nothing; `frozen tooling unchanged`; every path in the first is one of: the 10 style modules; the 8 story files of Task 1; the two G3-C1 e2e specs with their snapshots; `packages/themes/test/{fixtures/primeuix-styles-g3c1.json,utils/g3c1-port.mjs,g3c1-upstream-fidelity.test.ts}`; the 2 runtime specs; the 2 provenance JSON files; `PROVENANCE.md` (one sentence, PR-C1-2); the G3-C1 validator and its test; `.github/workflows/ci.yml`; `ACCESSIBILITY_BASELINE.md` (only if approved rows); the research/spec/plan/record/evidence docs; `MIGRATION.md` (Task 11). Anything else: stop and report.

- [ ] **Step 4: Size gate (C8, hard stop)**

```bash
pnpm run build && pnpm run size:measure
node scripts/provenance/validate-bundle-size.mjs --base-ref 2c8ef45
```

Record the result and the ng and vue rows (additional check only; stale Angular baseline). The authoritative gate for Angular and Vue is the direct comparison:

```bash
git worktree add .superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/base 2c8ef45
(cd .superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/base && pnpm install --frozen-lockfile && pnpm run build && node scripts/provenance/measure-package-size.mjs | grep -E 'packages/(ng|vue) ')
node scripts/provenance/measure-package-size.mjs | grep -E 'packages/(ng|vue) '
git worktree remove .superpowers/sdd/2026-10-05-gap-064-g3c1-navigation/base
```

Expected: the `index.mjs gzip size` of `packages/ng` and `packages/vue` grows by at most 15% from the `2c8ef45` build. Above 15% for either: **hard stop** — report, and do not continue without explicit user authorization.

- [ ] **Step 5: Record and commit**

Append every result to the record's "Verification" section, including the pre-existing failures (`lint`, the `accordion.spec.ts` manifest gap) with their causes.

```bash
git add docs/superpowers/plans/2026-10-05-gap-064-g3c1-visual-review.md
git commit -m "docs(gap-064): record G3-C1 verification results"
```

---

### Task 11 (approved at Plan Review, PR-C1-1): `MIGRATION.md` note

Strictly limited to G3-C1 consumer-visible behaviour, API and CSS implications. No other `MIGRATION.md` edits.

**Files:**

- Modify: `docs/architecture/MIGRATION.md` §8 (append after the G3-B entry)

- [ ] **Step 1: Append**

```markdown
Added for GAP-064 G3-C1 (`feature/gap-064-g3c-menus-navigation`), same status — unreleased, no changesets:

- **`@ultimate/ng`, `@ultimate/vue` — Navigation components now use their Aura tokens.** Breadcrumb, Dock, Steps, Stepper and Tabs now take their applicable structural styling from the upstream Aura styles (`@primeuix/styles` 2.0.3), mapped to Ultimate's existing DOM, and follow theme customization. Visual appearance changes accordingly; notably disabled Breadcrumb, Dock, Stepper and Tabs items use the theme's `disabled.opacity` (Dock previously used `0.5`), disabled Steps items are no longer dimmed (upstream parity; they stay non-interactive), and the Tabs scroll navigators use the upstream positioning. Dock keeps its documented hover magnification, and Angular's vertical Stepper keeps inactive panels hidden; both are documented Ultimate-specific rules. The approved parity exceptions and feature exclusions are listed in the G3-C1 Spec (§5, §6). (GAP-064 G3-C1; DOM, classes and style keys unchanged.)
```

- [ ] **Step 2: Check and commit**

```bash
npx prettier --check docs/architecture/MIGRATION.md
git add docs/architecture/MIGRATION.md
git commit -m "docs(gap-064): record G3-C1 consumer-visible changes in MIGRATION"
```

---

## Spec coverage

| Spec requirement                                                   | Plan                                                                 |
| ------------------------------------------------------------------ | -------------------------------------------------------------------- |
| §1/§3.1 scope: 5 keys, 10 style files, no rename                   | Global Constraints; Tasks 5–6; C1 in Task 4                          |
| §4 mapping incl. C-1, C-3 expansion, Stepper names                 | `MAPPING` + normative examples (Task 3); state rows (Task 4)         |
| §5 inventory: 90 / 79 / 11 (ng), 90 / 81 / 9 (vue), FX-C1..FX-C6   | `OMITTED`, `COUNTS`, `TOTALS` + tests (Task 3)                       |
| §6.1 D3 (not steps), PX-C1, SR-C1-4                                | `BASE_ROLE`, `BASE_SOURCES` + tests (Task 3); layout tests (Task 1)  |
| §6.3 D5 R-C1..R-C3                                                 | `RETAINED` + tests (Task 3); Dock/Stepper layout + rows (Tasks 1, 4) |
| §6.4 dropped rules                                                 | exactness test (Task 3)                                              |
| §7 tokens: none unresolved, no new tokens                          | C2 empty lists (Task 4); Task 10 Step 3 (`packages/themes/src`)      |
| §8 data model and invariants                                       | Task 3                                                               |
| §9.1 C1–C3                                                         | Tasks 3–4                                                            |
| C4                                                                 | Tasks 5–6 Step 3; Task 10 Step 3                                     |
| C5 / §9.2 (17 + 17 stories, Dock hover, Docker before/after, gate) | Tasks 1, 2, 9                                                        |
| C6 / §9.3 (three browsers)                                         | Task 1 layout tests; run in Tasks 2, 8, 9, 10                        |
| C7 / §10 accessibility differential, SR-C1-2 CI                    | Task 8; gate Task 9; CI simulation Task 10                           |
| C8 / §11 size hard stop vs `2c8ef45`                               | Task 6 Step 4 (early), Task 10 Step 4 (authoritative)                |
| C9 / §12 scope; C10 regression incl. `stepper.spec.ts`             | Task 6 Step 5; Task 9 Step 1; Task 10 Steps 2–3                      |
| C11 provenance                                                     | Task 7                                                               |
| §12 stop conditions                                                | Global Constraints "Stop rules"; per-step expectations               |
| §15 SR-C1-5 MIGRATION at Plan Review                               | Task 11 (approved, PR-C1-1)                                          |
| §6.5 / §16 PX-C2 Steps focus exclusion                             | Task 3 mapping + test; Task 4 rows; Task 1 focus check; Task 7       |

## Plan Review Decisions (2026-10-06, user)

The Plan is approved. Implementation is authorized from Task 1 once this record and Spec Amendment A1 are committed. Unchanged and still binding: TDD order, the counts invariant, FX-C1..FX-C6, the three D5 rules, the 15% hard stop against `2c8ef45`, the G3-A/G3-B tooling freeze, and every scope and stop condition.

| ID      | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Effect in this Plan                                                                                                                                                                                                                                                               |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PR-C1-1 | **`MIGRATION.md` approved.** Task 11 uses the drafted G3-C1-only note, strictly limited to the consumer-visible Navigation/Aura changes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Task 11 is unconditional.                                                                                                                                                                                                                                                         |
| PR-C1-2 | **`PROVENANCE.md` approved.** One sentence for G3-C1 in the existing `@primeuix/styles` entry; nothing else in the file.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Task 7 Step 2 is unconditional; `provenance:validate --base-ref 2c8ef45` must pass.                                                                                                                                                                                               |
| PR-C1-3 | **Tabs navigators: browser-only verification accepted.** The jsdom limitation stays documented; positioning is verified in all three browsers (Task 1 Tabs layout test) and by the static fidelity test.                                                                                                                                                                                                                                                                                                                                                                                                                                                              | No jsdom navigator row.                                                                                                                                                                                                                                                           |
| PR-C1-4 | **Stepper `:has()` groups (14, 18, 27): browser-only verification accepted.** No unreliable jsdom assertions; static fidelity plus browser layout/screenshot coverage.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | No jsdom `:has()` row.                                                                                                                                                                                                                                                            |
| PR-C1-5 | **Execution: subagent-driven**, preserving both hard gates: no screenshot or accessibility-baseline change before the Task 9 review, and no continuation past any hard stop without explicit authorization.                                                                                                                                                                                                                                                                                                                                                                                                                                                           | `ci.yml` changes only in Task 8; no push before Task 10.                                                                                                                                                                                                                          |
| PR-C1-6 | **PX-C1 confirmed.** Disabled Steps items use `opacity: 1` instead of the previous dimming. This applies to explicitly disabled items and to every non-active item of a readonly (default) Steps. Items stay non-interactive, and the change is intentional upstream parity, not a regression.                                                                                                                                                                                                                                                                                                                                                                        | Task 1 Steps layout test; Task 4 readonly row; Task 9 record flags it.                                                                                                                                                                                                            |
| PR-C1-7 | **Steps focus selector amended before implementation (Spec Amendment A1, PX-C2).** Upstream's `:not(.p-disabled)` on the link is inert, because upstream (PrimeVue, PrimeNG) and Ultimate both put the disabled class on the item. The user chose to move the filter to the item: `.u-steps-item:not(.u-steps-item-disabled) .u-steps-item-link:focus-visible`. This is a CSS selector adaptation only, with no runtime/JS change. Invariant: a disabled Steps item stays excluded from the focus ring although PX-C1 removes its dimming. Verified 2026-10-06 against the pinned upstream source, the Ultimate DOM and Chromium/Firefox/WebKit × ng/vue (Spec §6.5). | Task 3: `"text"` mapping kind, PX-C2 fidelity test. Task 4: PX-C2 rows (`[0, 2]`, readonly `[0]`). Task 1: keyboard focus check (enabled link has the token ring; the disabled item's link has `outline-color: rgba(0, 0, 0, 0)`). Task 7: PX-C2 in the steps provenance entries. |

**Verification evidence for PR-C1-7** (git-ignored workspace `.superpowers/sdd/2026-10-05-gap-064-g3c-research/sim/`): `verify-steps-focus.mjs` and its output `verify-steps-focus.out` (12 runs: 2 frameworks × 3 browsers × the plain and the PX-C2 selector, on freshly rebuilt Storybooks). With the plain mapping, the disabled link shows the token ring in 6/6 runs. With PX-C2 it shows no ring in 6/6 runs, while the enabled link keeps the ring in 12/12 runs. The data module was re-run with PX-C2: counts unchanged, 0 problems, and the fidelity test is green on style files built from its output.

## After this plan

Final Review and Closeout are a separate gate: GAP-064 progress note (G3-A, G3-B, G3-C1 complete; G3-C2, G3-D, G3-E open; status stays PARTIAL), the closeout record, and merge/push decisions. G3-C2 (Menus) starts only after its own authorization.
