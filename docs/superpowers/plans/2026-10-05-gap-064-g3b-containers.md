# GAP-064 G3-B — Containers & Panels (F1) Aura Styles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hand-written CSS of the 10 Angular and 10 Vue F1 style modules with the applicable `@primeuix/styles` 2.0.3 structural CSS, mapped to the existing Ultimate DOM, so they render with their registered Aura tokens — and prove it with fidelity, runtime, layout, screenshot and accessibility evidence.

**Architecture:**

- **One data module drives the port and its verification.** `packages/themes/test/utils/g3b-port.mjs` holds the Spec §5.9 categories D1–D6 as explicit data and turns the committed upstream fixture into the exact rule list of every style module. It imports `parseGroups`/`norm` from the unchanged `g3a-port.mjs`.
- **Static check (C3).** A themes test compares each style module's `css` with that list and pins every D1–D6 invariant. Implementers paste the module's CLI output into the style files.
- **Runtime checks (C1, C2, C3 state).** Per-framework unit specs mount the components and check generated style keys, variable resolution and state-selector matching on the real DOM.
- **Browser checks (C5, C6, C7).** Per-framework Playwright specs hold the screenshot, layout/computed-style and accessibility tests; baselines are recorded in Linux Docker before any CSS change and updated only after the user's review gate.
- **Accessibility differential (B-8).** A new tranche-scoped validator plus a dated pre-existing evidence file, wired into CI only in Task 8.

**Tech Stack:** TypeScript 5.9, Angular (`@angular/build:unit-test`, Vitest, jsdom), Vue 3.5 (`@vue/test-utils`), Vitest, Storybook, Playwright 1.63, Docker `mcr.microsoft.com/playwright:v1.63.0-jammy` (native arm64, as CI's `ubuntu-24.04-arm` job), pnpm 9.6.0, Node 24.15.0.

**Spec:** `docs/superpowers/specs/2026-10-05-gap-064-g3b-containers-design.md` (Approved, `fc5bad8`; §13 decisions; §5.9 data model). Research and decisions: `docs/architecture/research/2026-10-05-gap-064-g3b-containers-research.md` §11 (`f2698e3`). ADR-051.

**Status:** Approved (Plan Review 2026-10-05; decisions recorded under "Plan Review Decisions"). Implementation not started; requires separate authorization.

## Global Constraints

- **Immutable baseline:** `fe86fe4` (`main` == `origin/main`, the branch point) is the comparison point for every scope diff, size check and regression argument. `git fetch` may only refresh metadata.
- **Node:** every host command runs with Node 24.15.0: `export PATH=$HOME/.nvm/versions/node/v24.15.0/bin:$PATH`. Tests are run per package.
- **Workspace for evidence:** `.superpowers/sdd/2026-10-05-gap-064-g3b-containers/` (git-ignored, persistent). Never `/tmp` — it is wiped between sessions. Below it is called `$SDD` in prose only; commands spell the literal path (the local `dcg` hook blocks redirects to variable paths).
- **Inventory (Spec §1, §4.1).** 10 keys: `accordion`, `blockui`, `card`, `divider`, `fieldset`, `inplace`, `panel`, `scrollpanel`, `splitter`, `toolbar`. 20 style files `packages/{ng,vue}/src/<dir>/<dir>-style.ts` (dirs: `accordion`, `block-ui`, `card`, `divider`, `fieldset`, `inplace`, `panel`, `scroll-panel`, `splitter`, `toolbar`).
- **Key renames (ADR-051, Spec §5.1).** Exactly 4 sites change their key literal, nothing else at those sites: Angular `packages/ng/src/block-ui/block-ui.ts:58` `block-ui`→`blockui`, `packages/ng/src/scroll-panel/scroll-panel.ts:89` `scroll-panel`→`scrollpanel`; Vue `packages/vue/src/block-ui/BaseBlockUI.ts:12` `block-ui`→`blockui`, `packages/vue/src/scroll-panel/BaseScrollPanel.ts:10` `scroll-panel`→`scrollpanel`. React's own `block-ui`/`scroll-panel` registrations are out of scope and unchanged.
- **D1–D6 invariant (Spec §5.9, user-confirmed).** Per framework D1 + D2 = exactly 89 upstream component groups (76 + 13). D3–D6 never count toward 89/76/13. Every emitted rule belongs to exactly one of D1, D3, D4, D5, in canonical order D3 → D1 (upstream source order) → D4 → D5. D2 and D6 never appear. No other rule.
- **C4 — DOM unchanged.** In existing component files only the style module's `css` block (plus one added doc-comment line, G3-A precedent) and the 4 key literals change. Templates, `classes` resolvers and inputs/props/emits stay unchanged. No runtime JS, no DOM/class change, no state class.
- **CSS location.** Each framework's own style module holds its own copy; no shared export (G3-A §13.1).
- **Unresolved tokens.** Exactly `scrollpanel.barfocus.ring.width` / `.offset` (both frameworks); every other list empty. Ported as-is.
- **Screenshots (D-G3-7).** Before-baselines in Docker before any CSS change; default tolerance, never tightened; changes inside tolerance recorded; no baseline update without the user's review gate (Task 9). macOS screenshots are never baselines.
- **Accessibility.** No violation pre-baselined. Only user-approved rows enter `ACCESSIBILITY_BASELINE.md`.
- **B-8 tooling.** New `scripts/provenance/validate-g3b-accessibility.mjs`. `validate-g3a-accessibility.mjs`, `validate-accessibility-baseline.mjs` and `g3a-port.mjs` stay byte-identical. The only CI change is Task 8's: strict selection `--grep-invert "G3-A|G3-B"` plus the G3-B steps. No CI change before Task 8.
- **Size (C8, B-7).** 15% gate against `fe86fe4` is a hard stop: no split, no override, no rationalisation. Authoritative for Angular and Vue: the direct `fe86fe4`-build vs current-build gzip comparison (Task 10 Step 4); `validate-bundle-size.mjs` is an additional check only (stale Angular baseline).
- **Stop rules (Spec §11).** Stop and report — never work around — on:
  1. any DOM/class/runtime change being needed, or any diff outside C4/C9 scope;
  2. any unresolved token beyond the §5.6 list, or a §5.6 reference that resolves;
  3. any fidelity, count or order mismatch with the Spec (fix only by a recorded Spec amendment);
  4. any unexpected visual change, failing regression screenshot, or introduced accessibility violation not approved at the gate;
  5. size above 15%;
  6. any need to edit fidelity data, exception lists, evidence files or test expectations to make a check pass;
  7. any need to alter frozen G3-A tooling (`g3a-port.mjs`, `validate-g3a-accessibility.mjs`, the G3-A spec/evidence files) or the strict validator.
- **Out of scope:** G3-A, G3-C..E; Ripple; React; `@ultimate/themes` source; `uix-styled`/`uix-styles`; cores; Tranche 1/G3-A follow-ups; provenance outside the 20 files; separate fixes for the BlockUI/ScrollPanel before-state observations; unrelated CI failures; new GAPs/tokens/modules.
- **Git.** Conventional Commits, ending with the session attribution lines. Stage explicit paths only. No push, no merge.
- **Pre-existing failures** are recorded, not fixed: `provenance:validate` (missing ng/vue entries), `lint` debt on `main`, Prettier debt in `BLUEPRINT_GAPS.md`/`DECISIONS.md`/`ACCESSIBILITY_BASELINE.md`, and the stale Angular `PERFORMANCE.md` size baseline (G3-A deferred limitation).

## Review Focus

1. **Vue AccordionPanel with `disabled` false.** Vue may render `data-p-disabled="false"` instead of omitting it; an enabled panel must still get hover/focus/active styling. Pinned by the Task 4 Vue false-attribute test and state rows.
2. **BlockUI `fullScreen`.** The mask must be `position: fixed` and cover the viewport even though the generic mask rule says `absolute` (PX-B4 relies on specificity 0,2,0 of `.u-blockui-mask.u-blockui-mask-document`). Pinned by the Task 1 BlockUI layout test (viewport box).
3. **ScrollPanel whose content fits.** A bar with nothing to scroll must be invisible (`visibility: hidden`), not just transparent. Pinned by the Task 1 ScrollPanel layout test (shrinks the content, expects the hidden class and `visibility: hidden`); jsdom cannot reach this state.
4. **Nested Splitter inside a SplitterPanel.** The ported descendant rule `.u-splitter-panel .u-splitter` must apply although `-nested` is excluded. Pinned by the Task 4 nested-splitter state row (both frameworks).
5. **Unblocked BlockUI.** No mask element and no overlay. Pinned by the Task 1 BlockUI layout test (mask count 0 on Unblocked) and the Unblocked screenshot.

---

### Task 1: Verification stories and G3-B e2e specs (screenshot, layout, accessibility)

**Files:**

- Modify (append stories): `packages/ng/src/{accordion,block-ui,divider,fieldset,inplace,panel,splitter}/*.stories.ts`
- Modify (append stories): `packages/vue/src/{block-ui,divider,fieldset,inplace,panel,splitter}/*.stories.ts`
- Create: `packages/ng/e2e/g3b-aura-styles.spec.ts`, `packages/vue/e2e/g3b-aura-styles.spec.ts`

**Interfaces:**

- Produces: story IDs used by Tasks 2, 8, 9 (25 ng, 25 vue; Spec §8 C5); test titles `Ng|Vue/<Name> G3-B visual|layout|accessibility` (Spec §9.1). The `STORIES` table literal `story: "<id>"` is parsed by Task 8's validator.

- [ ] **Step 1: Angular verification stories (9)**

Append to `packages/ng/src/accordion/accordion.stories.ts` (reuses its `panels` const, whose third panel is disabled):

```ts
/** GAP-064 G3-B verification story (Spec §8 C5): an active and a disabled panel. */
export const ActiveAndDisabled: Story = {
  args: { panels, value: "0" },
  render: (args) => ({
    props: args,
    template: `
      <u-accordion [panels]="panels" [value]="value">
        <ng-template #panelContent let-panel>
          <p>Content for {{ panel.header }}.</p>
        </ng-template>
      </u-accordion>
    `,
  }),
};
```

Append to `packages/ng/src/block-ui/block-ui.stories.ts`:

```ts
/** GAP-064 G3-B verification story (Spec §8 C5): full-screen mask. */
export const FullScreen: Story = {
  args: { blocked: true, fullScreen: true },
  render: (args) => ({
    props: args,
    template: `
      <u-block-ui [blocked]="blocked" [fullScreen]="fullScreen" style="display: block; height: 150px; border: 1px dashed #999;">
        <p style="padding: 1rem;">Content that can be blocked.</p>
      </u-block-ui>
    `,
  }),
};
```

Append to `packages/ng/src/divider/divider.stories.ts`:

```ts
/** GAP-064 G3-B verification story (Spec §8 C5): horizontal divider with content. */
export const WithContent: Story = {
  render: () => ({
    template: `
      <div>
        <p>Content above</p>
        <u-divider><b>Label</b></u-divider>
        <p>Content below</p>
      </div>
    `,
  }),
};

/** GAP-064 G3-B verification story (Spec §8 C5): vertical divider with content. */
export const WithContentVertical: Story = {
  render: () => ({
    template: `
      <div style="display: flex; height: 4rem;">
        <span>Left</span>
        <u-divider [layout]="'vertical'"><b>OR</b></u-divider>
        <span>Right</span>
      </div>
    `,
  }),
};
```

Append to `packages/ng/src/fieldset/fieldset.stories.ts`:

```ts
/** GAP-064 G3-B verification story (Spec §8 C5): toggleable, initially collapsed. */
export const Collapsed: Story = {
  args: { legend: "Collapsed Fieldset", toggleable: true, collapsed: true },
  render: (args) => ({
    props: args,
    template: `
      <u-fieldset [legend]="legend" [toggleable]="toggleable" [collapsed]="collapsed">
        <p>Content within the fieldset.</p>
      </u-fieldset>
    `,
  }),
};
```

Append to `packages/ng/src/inplace/inplace.stories.ts`:

```ts
/** GAP-064 G3-B verification story (Spec §8 C5): disabled display. */
export const Disabled: Story = {
  render: () => ({
    template: `
      <u-inplace [disabled]="true">
        <span displayContent>Click to Edit</span>
        <ng-template #content let-closeCallback="closeCallback">
          <input type="text" value="Editable content" />
          <button type="button" (click)="closeCallback($event)">Close</button>
        </ng-template>
      </u-inplace>
    `,
  }),
};

/** GAP-064 G3-B verification story (Spec §8 C5): active (content shown). */
export const Active: Story = {
  render: () => ({
    template: `
      <u-inplace [active]="true">
        <span displayContent>Click to Edit</span>
        <ng-template #content let-closeCallback="closeCallback">
          <input type="text" value="Editable content" />
          <button type="button" (click)="closeCallback($event)">Close</button>
        </ng-template>
      </u-inplace>
    `,
  }),
};
```

Append to `packages/ng/src/panel/panel.stories.ts`:

```ts
/** GAP-064 G3-B verification story (Spec §8 C5): toggleable, initially collapsed. */
export const Collapsed: Story = {
  args: { header: "Collapsed Panel", toggleable: true, collapsed: true },
  render: (args) => ({
    props: args,
    template: `<u-panel [header]="header" [toggleable]="toggleable" [collapsed]="collapsed"><p>Panel content.</p></u-panel>`,
  }),
};
```

Append to `packages/ng/src/splitter/splitter.stories.ts`:

```ts
/** GAP-064 G3-B verification story (Spec §8 C5): vertical layout. */
export const Vertical: Story = {
  render: () => ({
    moduleMetadata: { imports: [USplitterPanel] },
    template: `<u-splitter layout="vertical" style="height: 200px; display: flex;">
      <ng-template uSplitterPanel>Top panel</ng-template>
      <ng-template uSplitterPanel [uSplitterPanelMinSize]="20">Bottom panel</ng-template>
    </u-splitter>`,
  }),
};
```

- [ ] **Step 2: Vue verification stories (9)**

Append to `packages/vue/src/block-ui/block-ui.stories.ts`:

```ts
/** GAP-064 G3-B verification story (Spec §8 C5): full-screen mask. */
export const FullScreen: Story = {
  args: { blocked: true, fullScreen: true },
  render: (args) => ({
    components: { UBlockUI },
    setup: () => ({ args }),
    template: `
      <UBlockUI v-bind="args" style="display: block; height: 150px; border: 1px dashed #999;">
        <p style="padding: 1rem;">Content that can be blocked.</p>
      </UBlockUI>
    `,
  }),
};
```

Append to `packages/vue/src/divider/divider.stories.ts`:

```ts
/** GAP-064 G3-B verification story (Spec §8 C5): horizontal divider with content. */
export const WithContent: Story = {
  render: () => ({
    components: { UDivider },
    template: `
      <div>
        <p>Content above</p>
        <UDivider><b>Label</b></UDivider>
        <p>Content below</p>
      </div>
    `,
  }),
};

/** GAP-064 G3-B verification story (Spec §8 C5): vertical divider with content. */
export const WithContentVertical: Story = {
  render: () => ({
    components: { UDivider },
    template: `
      <div style="display: flex; height: 4rem;">
        <span>Left</span>
        <UDivider layout="vertical"><b>OR</b></UDivider>
        <span>Right</span>
      </div>
    `,
  }),
};
```

Append to `packages/vue/src/fieldset/fieldset.stories.ts`:

```ts
/** GAP-064 G3-B verification story (Spec §8 C5): toggleable, initially collapsed. */
export const Collapsed: Story = {
  args: { legend: "Collapsed Fieldset", toggleable: true, collapsed: true },
  render: (args) => ({
    components: { UFieldset },
    setup: () => ({ args }),
    template: `<UFieldset v-bind="args"><p>Content within the fieldset.</p></UFieldset>`,
  }),
};
```

Append to `packages/vue/src/inplace/inplace.stories.ts`:

```ts
/** GAP-064 G3-B verification story (Spec §8 C5): disabled display. */
export const Disabled: Story = {
  render: () => ({
    components: { UInplace },
    template: `
      <UInplace disabled>
        <template #display>Click to Edit</template>
        <template #content="{ closeCallback }">
          <input type="text" value="Editable content" />
          <button type="button" @click="closeCallback">Close</button>
        </template>
      </UInplace>
    `,
  }),
};

/** GAP-064 G3-B verification story (Spec §8 C5): active (content shown). */
export const Active: Story = {
  render: () => ({
    components: { UInplace },
    template: `
      <UInplace active>
        <template #display>Click to Edit</template>
        <template #content="{ closeCallback }">
          <input type="text" value="Editable content" />
          <button type="button" @click="closeCallback">Close</button>
        </template>
      </UInplace>
    `,
  }),
};
```

Append to `packages/vue/src/panel/panel.stories.ts`:

```ts
/** GAP-064 G3-B verification story (Spec §8 C5): toggleable, initially collapsed. */
export const Collapsed: Story = {
  args: { header: "Collapsed Panel", toggleable: true, collapsed: true },
  render: (args) => ({
    components: { UPanel },
    setup: () => ({ args }),
    template: `<UPanel v-bind="args"><p>Panel content.</p></UPanel>`,
  }),
};

/** GAP-064 G3-B verification story (Spec §8 C5): footer slot (Vue renders the footer wrapper). */
export const WithFooter: Story = {
  args: { header: "Panel with Footer" },
  render: (args) => ({
    components: { UPanel },
    setup: () => ({ args }),
    template: `<UPanel v-bind="args"><p>Panel content.</p><template #footer>Footer content</template></UPanel>`,
  }),
};
```

Append to `packages/vue/src/splitter/splitter.stories.ts`:

```ts
/** GAP-064 G3-B verification story (Spec §8 C5): vertical layout. */
export const Vertical: Story = {
  render: () => ({
    components: { USplitter },
    setup: () => ({ panels: [{ label: "Top panel" }, { label: "Bottom panel", minSize: 20 }] }),
    template: `<USplitter :panels="panels" layout="vertical" style="height: 200px;">
      <template #default="{ item }">{{ item.label }}</template>
    </USplitter>`,
  }),
};
```

- [ ] **Step 3: Create `packages/ng/e2e/g3b-aura-styles.spec.ts`**

```ts
import { expect, test, type Locator, type Page } from "@playwright/test";
import { runAccessibilityScan, storyUrl } from "./accessibility-envelope";

/**
 * GAP-064 G3-B (Spec §8 C5–C7, §9, §13.5–§13.6): screenshot, layout and
 * accessibility coverage for every story that exercises changed G3-B CSS.
 * Baselines are recorded in Linux Docker before any CSS change (Plan Task 2).
 * The layout tests are RED until the port; their "before" results are
 * evidence (Spec §4.3) and only the "after" results are acceptance criteria.
 */
const STORIES: ReadonlyArray<{ name: string; story: string; ready: string }> = [
  { name: "Accordion Default", story: "ng-accordion--default", ready: ".u-accordion" },
  { name: "Accordion Multiple", story: "ng-accordion--multiple", ready: ".u-accordion" },
  {
    name: "Accordion ActiveAndDisabled",
    story: "ng-accordion--active-and-disabled",
    ready: ".u-accordion",
  },
  { name: "BlockUI Default", story: "ng-blockui--default", ready: ".u-blockui-container" },
  { name: "BlockUI Unblocked", story: "ng-blockui--unblocked", ready: ".u-blockui-container" },
  { name: "BlockUI FullScreen", story: "ng-blockui--full-screen", ready: ".u-blockui-container" },
  { name: "Card Default", story: "ng-card--default", ready: ".u-card" },
  { name: "Card WithHeaderAndFooter", story: "ng-card--with-header-and-footer", ready: ".u-card" },
  { name: "Divider Horizontal", story: "ng-divider--horizontal", ready: ".u-divider" },
  { name: "Divider Vertical", story: "ng-divider--vertical", ready: ".u-divider" },
  { name: "Divider WithContent", story: "ng-divider--with-content", ready: ".u-divider" },
  {
    name: "Divider WithContentVertical",
    story: "ng-divider--with-content-vertical",
    ready: ".u-divider",
  },
  { name: "Fieldset Default", story: "ng-fieldset--default", ready: ".u-fieldset" },
  { name: "Fieldset Toggleable", story: "ng-fieldset--toggleable", ready: ".u-fieldset" },
  { name: "Fieldset Collapsed", story: "ng-fieldset--collapsed", ready: ".u-fieldset" },
  { name: "Inplace Default", story: "ng-inplace--default", ready: ".u-inplace" },
  { name: "Inplace Disabled", story: "ng-inplace--disabled", ready: ".u-inplace" },
  { name: "Inplace Active", story: "ng-inplace--active", ready: ".u-inplace" },
  { name: "Panel Default", story: "ng-panel--default", ready: ".u-panel" },
  { name: "Panel Toggleable", story: "ng-panel--toggleable", ready: ".u-panel" },
  { name: "Panel Collapsed", story: "ng-panel--collapsed", ready: ".u-panel" },
  { name: "ScrollPanel Default", story: "ng-scrollpanel--default", ready: ".u-scroll-panel" },
  { name: "Splitter Default", story: "ng-splitter--default", ready: ".u-splitter" },
  { name: "Splitter Vertical", story: "ng-splitter--vertical", ready: ".u-splitter" },
  { name: "Toolbar Default", story: "ng-toolbar--default", ready: ".u-toolbar" },
];

for (const { name, story, ready } of STORIES) {
  test(`Ng/${name} G3-B visual`, async ({ page }) => {
    await page.goto(storyUrl(story));
    await expect(page.locator(ready).first()).toBeAttached();
    await expect(page).toHaveScreenshot();
  });

  test(`Ng/${name} G3-B accessibility`, async ({ page }, testInfo) => {
    await page.goto(storyUrl(story));
    await expect(page.locator(ready).first()).toBeAttached();
    await runAccessibilityScan(page, testInfo, story);
  });
}

// Spec §13.5: the bars are invisible at rest, so ScrollPanel also gets a hover screenshot.
test("Ng/ScrollPanel Default (hover) G3-B visual", async ({ page }) => {
  await page.goto(storyUrl("ng-scrollpanel--default"));
  const content = page.locator(".u-scroll-panel-content");
  await expect(content).toBeAttached();
  await content.hover();
  await expect(page.locator(".u-scroll-panel-bar-y")).toHaveCSS("opacity", "1");
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

async function box(locator: Locator) {
  const b = await locator.boundingBox();
  expect(b, "bounding box").not.toBeNull();
  return b!;
}

type Box = { x: number; y: number; width: number; height: number };
function expectInside(inner: Box, outer: Box) {
  expect(inner.x).toBeGreaterThanOrEqual(outer.x - 0.5);
  expect(inner.y).toBeGreaterThanOrEqual(outer.y - 0.5);
  expect(inner.x + inner.width).toBeLessThanOrEqual(outer.x + outer.width + 0.5);
  expect(inner.y + inner.height).toBeLessThanOrEqual(outer.y + outer.height + 0.5);
}

// Spec §8 C6 — computed style and layout that screenshots do not prove.
test("Ng/Accordion G3-B layout", async ({ page }) => {
  await page.goto(storyUrl("ng-accordion--active-and-disabled"));
  const panels = page.locator(".u-accordion-panel");
  await expect(panels).toHaveCount(3);
  const header = (i: number) => panels.nth(i).locator(".u-accordion-header");
  await expect(header(0)).toHaveCSS(
    "background-color",
    await resolved(page, "--u-accordion-header-active-background", "background-color")
  );
  await expect(panels.nth(2)).toHaveCSS(
    "opacity",
    await resolved(page, "--u-disabled-opacity", "opacity")
  );
  await expect(header(2)).toHaveCSS("pointer-events", "none");
  await header(1).hover();
  await expect(header(1)).toHaveCSS(
    "background-color",
    await resolved(page, "--u-accordion-header-hover-background", "background-color")
  );
});

test("Ng/BlockUI G3-B layout", async ({ page }) => {
  await page.goto(storyUrl("ng-blockui--default"));
  const container = page.locator(".u-blockui-container");
  const mask = container.locator(".u-blockui-mask");
  await expect(mask).toHaveCount(1);
  const c = await box(container);
  const m = await box(mask);
  for (const k of ["x", "y", "width", "height"] as const)
    expect(Math.abs(m[k] - c[k]), k).toBeLessThanOrEqual(0.5);
  await expect(mask).toHaveCSS(
    "background-color",
    await resolved(page, "--u-mask-background", "background-color")
  );

  await page.goto(storyUrl("ng-blockui--full-screen"));
  const full = page.locator(".u-blockui-mask.u-blockui-mask-document");
  await expect(full).toHaveCSS("position", "fixed");
  const viewport = page.viewportSize()!;
  const f = await box(full);
  expect(Math.abs(f.x)).toBeLessThanOrEqual(0.5);
  expect(Math.abs(f.y)).toBeLessThanOrEqual(0.5);
  expect(Math.abs(f.width - viewport.width)).toBeLessThanOrEqual(0.5);
  expect(Math.abs(f.height - viewport.height)).toBeLessThanOrEqual(0.5);

  // Review Focus 5: unblocked renders no mask.
  await page.goto(storyUrl("ng-blockui--unblocked"));
  await expect(page.locator(".u-blockui-container")).toBeAttached();
  await expect(page.locator(".u-blockui-mask")).toHaveCount(0);
});

test("Ng/ScrollPanel G3-B layout", async ({ page }) => {
  await page.goto(storyUrl("ng-scrollpanel--default"));
  const root = page.locator(".u-scroll-panel");
  const content = root.locator(".u-scroll-panel-content");
  const barX = root.locator(".u-scroll-panel-bar-x");
  const barY = root.locator(".u-scroll-panel-bar-y");
  await content.hover();
  await expect(barX).toHaveCSS("opacity", "1");
  await expect(barY).toHaveCSS("opacity", "1");
  const r = await box(root);
  expectInside(await box(barX), r);
  expectInside(await box(barY), r);

  // Review Focus 3: content that fits horizontally hides the X bar.
  await content.evaluate((el) => {
    (el.firstElementChild as HTMLElement).style.width = "50px";
  });
  await content.dispatchEvent("mouseenter");
  await expect(barX).toHaveClass(/\bu-scroll-panel-bar-hidden\b/);
  await expect(barX).toHaveCSS("visibility", "hidden");
});

test("Ng/Divider G3-B layout", async ({ page }) => {
  for (const [story, axis] of [
    ["ng-divider--with-content", "x"],
    ["ng-divider--with-content-vertical", "y"],
  ] as const) {
    await page.goto(storyUrl(story));
    const root = page.locator(".u-divider");
    const r = await box(root);
    const c = await box(root.locator(".u-divider-content"));
    const centre = (b: Box) => (axis === "x" ? b.x + b.width / 2 : b.y + b.height / 2);
    expect(Math.abs(centre(c) - centre(r)), story).toBeLessThanOrEqual(1);
  }
});

test("Ng/Inplace G3-B layout", async ({ page }) => {
  await page.goto(storyUrl("ng-inplace--default"));
  const display = page.locator(".u-inplace-display");
  await display.hover();
  await expect(display).toHaveCSS(
    "background-color",
    await resolved(page, "--u-inplace-display-hover-background", "background-color")
  );

  await page.goto(storyUrl("ng-inplace--disabled"));
  const disabled = page.locator(".u-inplace-display");
  const rest = await disabled.evaluate((el) => getComputedStyle(el).backgroundColor);
  await disabled.hover({ force: true });
  // Negative assertion: give any hover transition time to run before reading once.
  await page.waitForTimeout(500);
  expect(await disabled.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(rest);
  await expect(disabled).toHaveCSS(
    "opacity",
    await resolved(page, "--u-disabled-opacity", "opacity")
  );
});

test("Ng/Splitter G3-B layout", async ({ page }) => {
  for (const [story, cursor] of [
    ["ng-splitter--default", "col-resize"],
    ["ng-splitter--vertical", "row-resize"],
  ] as const) {
    await page.goto(storyUrl(story));
    const root = page.locator(".u-splitter");
    const gutter = root.locator(".u-splitter-gutter");
    await expect(gutter).toHaveCSS("touch-action", "none");
    const g = await box(gutter);
    await page.mouse.move(g.x + g.width / 2, g.y + g.height / 2);
    await page.mouse.down();
    await expect(root).toHaveAttribute("data-resizing", "true");
    await expect(root, story).toHaveCSS("cursor", cursor);
    await page.mouse.up();
  }
});

test("Ng/Fieldset G3-B layout", async ({ page }) => {
  await page.goto(storyUrl("ng-fieldset--toggleable"));
  const legend = page.locator(".u-fieldset-legend");
  const button = legend.locator(".u-fieldset-toggle-button");
  const { font, color } = await legend.evaluate((el) => ({
    font: getComputedStyle(el).fontFamily,
    color: getComputedStyle(el).color,
  }));
  await expect(button).toHaveCSS("font-family", font);
  await expect(button).toHaveCSS("color", color);
});
```

- [ ] **Step 4: Create `packages/vue/e2e/g3b-aura-styles.spec.ts`**

```ts
import { expect, test, type Locator, type Page } from "@playwright/test";
import { runAccessibilityScan, storyUrl } from "./accessibility-envelope";

/**
 * GAP-064 G3-B (Spec §8 C5–C7, §9, §13.5–§13.6): screenshot, layout and
 * accessibility coverage for every story that exercises changed G3-B CSS.
 * Baselines are recorded in Linux Docker before any CSS change (Plan Task 2).
 * The layout tests are RED until the port; their "before" results are
 * evidence (Spec §4.3) and only the "after" results are acceptance criteria.
 */
const STORIES: ReadonlyArray<{ name: string; story: string; ready: string }> = [
  { name: "Accordion Default", story: "vue-accordion--default", ready: ".u-accordion" },
  { name: "Accordion Multiple", story: "vue-accordion--multiple", ready: ".u-accordion" },
  { name: "BlockUI Default", story: "vue-blockui--default", ready: ".u-blockui-container" },
  { name: "BlockUI Unblocked", story: "vue-blockui--unblocked", ready: ".u-blockui-container" },
  { name: "BlockUI FullScreen", story: "vue-blockui--full-screen", ready: ".u-blockui-container" },
  { name: "Card Default", story: "vue-card--default", ready: ".u-card" },
  { name: "Card WithHeaderAndFooter", story: "vue-card--with-header-and-footer", ready: ".u-card" },
  { name: "Divider Horizontal", story: "vue-divider--horizontal", ready: ".u-divider" },
  { name: "Divider Vertical", story: "vue-divider--vertical", ready: ".u-divider" },
  { name: "Divider WithContent", story: "vue-divider--with-content", ready: ".u-divider" },
  {
    name: "Divider WithContentVertical",
    story: "vue-divider--with-content-vertical",
    ready: ".u-divider",
  },
  { name: "Fieldset Default", story: "vue-fieldset--default", ready: ".u-fieldset" },
  { name: "Fieldset Toggleable", story: "vue-fieldset--toggleable", ready: ".u-fieldset" },
  { name: "Fieldset Collapsed", story: "vue-fieldset--collapsed", ready: ".u-fieldset" },
  { name: "Inplace Default", story: "vue-inplace--default", ready: ".u-inplace" },
  { name: "Inplace Disabled", story: "vue-inplace--disabled", ready: ".u-inplace" },
  { name: "Inplace Active", story: "vue-inplace--active", ready: ".u-inplace" },
  { name: "Panel Default", story: "vue-panel--default", ready: ".u-panel" },
  { name: "Panel Toggleable", story: "vue-panel--toggleable", ready: ".u-panel" },
  { name: "Panel Collapsed", story: "vue-panel--collapsed", ready: ".u-panel" },
  { name: "Panel WithFooter", story: "vue-panel--with-footer", ready: ".u-panel" },
  { name: "ScrollPanel Default", story: "vue-scrollpanel--default", ready: ".u-scroll-panel" },
  { name: "Splitter Default", story: "vue-splitter--default", ready: ".u-splitter" },
  { name: "Splitter Vertical", story: "vue-splitter--vertical", ready: ".u-splitter" },
  { name: "Toolbar Default", story: "vue-toolbar--default", ready: ".u-toolbar" },
];

for (const { name, story, ready } of STORIES) {
  test(`Vue/${name} G3-B visual`, async ({ page }) => {
    await page.goto(storyUrl(story));
    await expect(page.locator(ready).first()).toBeAttached();
    await expect(page).toHaveScreenshot();
  });

  test(`Vue/${name} G3-B accessibility`, async ({ page }, testInfo) => {
    await page.goto(storyUrl(story));
    await expect(page.locator(ready).first()).toBeAttached();
    await runAccessibilityScan(page, testInfo, story);
  });
}

// Spec §13.5: the bars are invisible at rest, so ScrollPanel also gets a hover screenshot.
test("Vue/ScrollPanel Default (hover) G3-B visual", async ({ page }) => {
  await page.goto(storyUrl("vue-scrollpanel--default"));
  const content = page.locator(".u-scroll-panel-content");
  await expect(content).toBeAttached();
  await content.hover();
  await expect(page.locator(".u-scroll-panel-bar-y")).toHaveCSS("opacity", "1");
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

async function box(locator: Locator) {
  const b = await locator.boundingBox();
  expect(b, "bounding box").not.toBeNull();
  return b!;
}

type Box = { x: number; y: number; width: number; height: number };
function expectInside(inner: Box, outer: Box) {
  expect(inner.x).toBeGreaterThanOrEqual(outer.x - 0.5);
  expect(inner.y).toBeGreaterThanOrEqual(outer.y - 0.5);
  expect(inner.x + inner.width).toBeLessThanOrEqual(outer.x + outer.width + 0.5);
  expect(inner.y + inner.height).toBeLessThanOrEqual(outer.y + outer.height + 0.5);
}

// Spec §8 C6 — computed style and layout that screenshots do not prove.
test("Vue/Accordion G3-B layout", async ({ page }) => {
  // vue Default: panel 0 active, panel 1 enabled, panel 2 disabled.
  await page.goto(storyUrl("vue-accordion--default"));
  const panels = page.locator(".u-accordionpanel");
  await expect(panels).toHaveCount(3);
  const header = (i: number) => panels.nth(i).locator(".u-accordionheader");
  await expect(header(0)).toHaveCSS(
    "background-color",
    await resolved(page, "--u-accordion-header-active-background", "background-color")
  );
  await expect(panels.nth(2)).toHaveCSS(
    "opacity",
    await resolved(page, "--u-disabled-opacity", "opacity")
  );
  await expect(header(2)).toHaveCSS("pointer-events", "none");
  await header(1).hover();
  await expect(header(1)).toHaveCSS(
    "background-color",
    await resolved(page, "--u-accordion-header-hover-background", "background-color")
  );
});

test("Vue/BlockUI G3-B layout", async ({ page }) => {
  await page.goto(storyUrl("vue-blockui--default"));
  const container = page.locator(".u-blockui-container");
  const mask = container.locator(".u-blockui-mask");
  await expect(mask).toHaveCount(1);
  const c = await box(container);
  const m = await box(mask);
  for (const k of ["x", "y", "width", "height"] as const)
    expect(Math.abs(m[k] - c[k]), k).toBeLessThanOrEqual(0.5);
  await expect(mask).toHaveCSS(
    "background-color",
    await resolved(page, "--u-mask-background", "background-color")
  );

  await page.goto(storyUrl("vue-blockui--full-screen"));
  const full = page.locator(".u-blockui-mask.u-blockui-mask-document");
  await expect(full).toHaveCSS("position", "fixed");
  const viewport = page.viewportSize()!;
  const f = await box(full);
  expect(Math.abs(f.x)).toBeLessThanOrEqual(0.5);
  expect(Math.abs(f.y)).toBeLessThanOrEqual(0.5);
  expect(Math.abs(f.width - viewport.width)).toBeLessThanOrEqual(0.5);
  expect(Math.abs(f.height - viewport.height)).toBeLessThanOrEqual(0.5);

  // Review Focus 5: unblocked renders no mask.
  await page.goto(storyUrl("vue-blockui--unblocked"));
  await expect(page.locator(".u-blockui-container")).toBeAttached();
  await expect(page.locator(".u-blockui-mask")).toHaveCount(0);
});

test("Vue/ScrollPanel G3-B layout", async ({ page }) => {
  await page.goto(storyUrl("vue-scrollpanel--default"));
  const root = page.locator(".u-scroll-panel");
  const content = root.locator(".u-scroll-panel-content");
  const barX = root.locator(".u-scroll-panel-bar-x");
  const barY = root.locator(".u-scroll-panel-bar-y");
  await content.hover();
  await expect(barX).toHaveCSS("opacity", "1");
  await expect(barY).toHaveCSS("opacity", "1");
  const r = await box(root);
  expectInside(await box(barX), r);
  expectInside(await box(barY), r);

  // Review Focus 3: content that fits horizontally hides the X bar.
  await content.evaluate((el) => {
    (el.firstElementChild as HTMLElement).style.width = "50px";
  });
  await content.dispatchEvent("mouseenter");
  await expect(barX).toHaveClass(/\bu-scroll-panel-bar-hidden\b/);
  await expect(barX).toHaveCSS("visibility", "hidden");
});

test("Vue/Divider G3-B layout", async ({ page }) => {
  for (const [story, axis] of [
    ["vue-divider--with-content", "x"],
    ["vue-divider--with-content-vertical", "y"],
  ] as const) {
    await page.goto(storyUrl(story));
    const root = page.locator(".u-divider");
    const r = await box(root);
    const c = await box(root.locator(".u-divider-content"));
    const centre = (b: Box) => (axis === "x" ? b.x + b.width / 2 : b.y + b.height / 2);
    expect(Math.abs(centre(c) - centre(r)), story).toBeLessThanOrEqual(1);
  }
});

test("Vue/Inplace G3-B layout", async ({ page }) => {
  await page.goto(storyUrl("vue-inplace--default"));
  const display = page.locator(".u-inplace-display");
  await display.hover();
  await expect(display).toHaveCSS(
    "background-color",
    await resolved(page, "--u-inplace-display-hover-background", "background-color")
  );

  await page.goto(storyUrl("vue-inplace--disabled"));
  const disabled = page.locator(".u-inplace-display");
  const rest = await disabled.evaluate((el) => getComputedStyle(el).backgroundColor);
  await disabled.hover({ force: true });
  // Negative assertion: give any hover transition time to run before reading once.
  await page.waitForTimeout(500);
  expect(await disabled.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(rest);
  await expect(disabled).toHaveCSS(
    "opacity",
    await resolved(page, "--u-disabled-opacity", "opacity")
  );
});

test("Vue/Splitter G3-B layout", async ({ page }) => {
  // Vue renders no resizing state (FX-B7); only the retained touch-action rule applies.
  for (const story of ["vue-splitter--default", "vue-splitter--vertical"]) {
    await page.goto(storyUrl(story));
    await expect(page.locator(".u-splitter-gutter"), story).toHaveCSS("touch-action", "none");
  }
});

test("Vue/Fieldset G3-B layout", async ({ page }) => {
  await page.goto(storyUrl("vue-fieldset--toggleable"));
  const legend = page.locator(".u-fieldset-legend");
  const button = legend.locator(".u-fieldset-toggle-button");
  const { font, color } = await legend.evaluate((el) => ({
    font: getComputedStyle(el).fontFamily,
    color: getComputedStyle(el).color,
  }));
  await expect(button).toHaveCSS("font-family", font);
  await expect(button).toHaveCSS("color", color);
});
```

- [ ] **Step 5: Check the stories build and the specs typecheck**

```bash
export PATH=$HOME/.nvm/versions/node/v24.15.0/bin:$PATH
pnpm run build
pnpm run typecheck
grep -c 'story: "' packages/ng/e2e/g3b-aura-styles.spec.ts packages/vue/e2e/g3b-aura-styles.spec.ts
```

Expected: build and typecheck pass; `25` for each spec file. The story IDs themselves are proven by Task 2's Docker run (a wrong ID makes its visual and accessibility tests fail there); a mismatch is a stop — do not rename stories to fit.

- [ ] **Step 6: Commit**

```bash
git add packages/ng/src/{accordion,block-ui,divider,fieldset,inplace,panel,splitter}/*.stories.ts \
  packages/vue/src/{block-ui,divider,fieldset,inplace,panel,splitter}/*.stories.ts \
  packages/ng/e2e/g3b-aura-styles.spec.ts packages/vue/e2e/g3b-aura-styles.spec.ts
git commit -m "test(gap-064): add G3-B verification stories and e2e specs"
```

---

### Task 2: Docker "before" baselines and before-state evidence

Runs on HEAD after Task 1, before any G3-B CSS change (D-G3-7).

**Files:**

- Create (git-ignored): `.superpowers/sdd/2026-10-05-gap-064-g3b-containers/docker/run.sh`
- Create (generated): `packages/{ng,vue}/e2e/g3b-aura-styles.spec.ts-snapshots/*.png` — (25 + 1 hover) × 3 browsers = 78 per framework, 156 total.

**Interfaces:**

- Produces: `run.sh` modes `before | stable | g3b | regression | update "<grep>" | ci "<fw>"` (used by Tasks 8–10); `docker/before/` = the before-state envelopes and layout results (used by Task 8's evidence derivation and Task 9's record).

- [ ] **Step 1: Write the runner** (Write tool, path `.superpowers/sdd/2026-10-05-gap-064-g3b-containers/docker/run.sh`)

```bash
#!/bin/bash
# GAP-064 G3-B Docker runner (inside mcr.microsoft.com/playwright:v1.63.0-jammy).
# usage: bash /io/run.sh before|stable|g3b|regression|update "<grep>"|ci "<fw>"
#   before     = G3-B specs, writes missing screenshots; layout tests are EXPECTED to fail (before-state evidence).
#   g3b        = targeted G3-B run (visual + layout + accessibility), ng/vue projects.
#   regression = every other spec (G3-A included) in all 9 Storybook projects + 3 SSR projects.
#   ci <fw>    = simulation of the track-a-browser-visual-a11y job as wired in Plan Task 8.
set -uo pipefail
export CI=true
mkdir -p /work && tar -xf /io/src.tar -C /work && cd /work
corepack enable >/dev/null && corepack prepare pnpm@9.6.0 --activate >/dev/null
echo "node $(node -v) pnpm $(pnpm -v) arch $(uname -m)"
pnpm install --frozen-lockfile > /io/install.log 2>&1 || { echo "install failed"; exit 1; }
pnpm run build > /io/build.log 2>&1 || { echo "build failed"; exit 1; }
SPECS="packages/ng/e2e/g3b-aura-styles.spec.ts packages/vue/e2e/g3b-aura-styles.spec.ts"
G3B="--project=ng-chromium --project=ng-firefox --project=ng-webkit --project=vue-chromium --project=vue-firefox --project=vue-webkit"
REGRESSION="$G3B --project=react-chromium --project=react-firefox --project=react-webkit --project=ng-ssr-chromium --project=react-ssr-chromium --project=vue-ssr-chromium"
SNAP="packages/ng/e2e/g3b-aura-styles.spec.ts-snapshots packages/vue/e2e/g3b-aura-styles.spec.ts-snapshots"
case "$1" in
  before)
    npx playwright test $SPECS $G3B --update-snapshots=missing --reporter=list > /io/before.log 2>&1; echo "before exit $?"
    tar -cf /io/before-results.tar test-results
    tar -cf /io/snapshots.tar $SNAP ;;
  stable)
    npx playwright test $SPECS $G3B -g "G3-B visual" --reporter=list > /io/stable.log 2>&1; echo "stable exit $?" ;;
  g3b)
    npx playwright test $SPECS $G3B --reporter=list > /io/g3b.log 2>&1; echo "g3b exit $?"
    tar -cf /io/g3b-results.tar test-results ;;
  regression)
    npx playwright test $REGRESSION --grep-invert "G3-B" --reporter=list > /io/regression.log 2>&1; echo "regression exit $?"
    tar -cf /io/regression-results.tar test-results ;;
  update)
    npx playwright test $SPECS $G3B -g "$2" --update-snapshots=changed --reporter=list > /io/update.log 2>&1; echo "update exit $?"
    tar -cf /io/snapshots.tar $SNAP ;;
  ci)
    fw="$2"
    P="--project=$fw-chromium --project=$fw-firefox --project=$fw-webkit"
    npx playwright test $P --grep-invert "G3-A|G3-B" --reporter=list > /io/ci-$fw-strict-run.log 2>&1; echo "ci $fw strict run exit $?"
    node scripts/provenance/validate-accessibility-baseline.mjs --check "test-results/accessibility/$fw/**/*.json" > /io/ci-$fw-strict-check.log 2>&1; echo "ci $fw strict check exit $?"
    if [ "$fw" != "react" ]; then
      npx playwright test packages/$fw/e2e/g3a-aura-styles.spec.ts $P --reporter=list > /io/ci-$fw-g3a-run.log 2>&1; echo "ci $fw g3a run exit $?"
      node scripts/provenance/validate-g3a-accessibility.mjs "$fw" > /io/ci-$fw-g3a-check.log 2>&1; echo "ci $fw g3a check exit $?"
      npx playwright test packages/$fw/e2e/g3b-aura-styles.spec.ts $P --reporter=list > /io/ci-$fw-g3b-run.log 2>&1; echo "ci $fw g3b run exit $?"
      node scripts/provenance/validate-g3b-accessibility.mjs "$fw" > /io/ci-$fw-g3b-check.log 2>&1; echo "ci $fw g3b check exit $?"
      tar -cf /io/ci-$fw-results.tar test-results
    fi ;;
esac
```

- [ ] **Step 2: Record the before-state**

```bash
git archive -o .superpowers/sdd/2026-10-05-gap-064-g3b-containers/docker/src.tar HEAD
docker run --rm -v "$PWD/.superpowers/sdd/2026-10-05-gap-064-g3b-containers/docker:/io" mcr.microsoft.com/playwright:v1.63.0-jammy bash /io/run.sh before
mkdir -p .superpowers/sdd/2026-10-05-gap-064-g3b-containers/docker/before
tar -xf .superpowers/sdd/2026-10-05-gap-064-g3b-containers/docker/before-results.tar -C .superpowers/sdd/2026-10-05-gap-064-g3b-containers/docker/before
tar -xf .superpowers/sdd/2026-10-05-gap-064-g3b-containers/docker/snapshots.tar -C .
git status --short | grep -c 'g3b-aura-styles.spec.ts-snapshots/'
git rev-parse --short HEAD
```

Expected:

- 156 new PNGs (78 ng + 78 vue); the output's first line names the architecture (record it; CI is arm64).
- `before.log` shows **every visual and accessibility test passing** and the **layout tests failing**. Copy `before.log`'s layout failures (test, assertion, received value) into `docker/before/layout-evidence.txt` — this is the Spec §4.3 evidence (BlockUI mask geometry, ScrollPanel bar position, Divider centring, …).
- Any failing visual or accessibility test is **UNEXPECTED**: stop and report.
- Record the HEAD short SHA as the before commit (`<beforeSha>`, used by Task 8).

- [ ] **Step 3: Prove screenshot stability, twice**

```bash
git add packages/ng/e2e/g3b-aura-styles.spec.ts-snapshots packages/vue/e2e/g3b-aura-styles.spec.ts-snapshots
git archive -o .superpowers/sdd/2026-10-05-gap-064-g3b-containers/docker/src.tar "$(git write-tree)"
docker run --rm -v "$PWD/.superpowers/sdd/2026-10-05-gap-064-g3b-containers/docker:/io" mcr.microsoft.com/playwright:v1.63.0-jammy bash /io/run.sh stable
docker run --rm -v "$PWD/.superpowers/sdd/2026-10-05-gap-064-g3b-containers/docker:/io" mcr.microsoft.com/playwright:v1.63.0-jammy bash /io/run.sh stable
```

Expected: `stable exit 0` twice. A flaky story: stop and report; no masks, thresholds or retries-until-green.

- [ ] **Step 4: Commit**

```bash
git commit -m "test(gap-064): record G3-B pre-change baselines in Linux Docker"
```

---

### Task 3: Upstream fixture, G3-B data module and static fidelity test (C3, D1–D6)

**Files:**

- Create (git-ignored): `.superpowers/sdd/2026-10-05-gap-064-g3b-containers/make-fixture.mjs`
- Create: `packages/themes/test/fixtures/primeuix-styles-g3b.json`
- Create: `packages/themes/test/utils/g3b-port.mjs`
- Create: `packages/themes/test/g3b-upstream-fidelity.test.ts`

**Interfaces:**

- Consumes: `parseGroups(css): {head, body, keyframes}[]` and `norm(css): string` from the unchanged `packages/themes/test/utils/g3a-port.mjs`.
- Produces from `g3b-port.mjs`: `FIXTURE`, `FRAMEWORKS`, `KEYS`, `DIRS`, `OLD_KEYS`, `MAPPING`, `OMITTED` (D2), `COUNTS`, `TOTALS`, `BASE_ROLE` (D3), `BASE_SOURCES`, `INLINE_ROLE` (D4), `RETAINED` (D5), `BASE_EXCLUDED` (D6), `UNRESOLVED`, `mapSelector(fw,key,selector)`, `expected(fw,key): {upstream, d1: {n,text}[], d2: {n,tag,head}[]}`, `expectedCss(fw,key): string[]`, `declarations(rule)`, `actualCssText(fw,key)`, `actualRules(fw,key)`. CLI: `node packages/themes/test/utils/g3b-port.mjs <ng|vue> <key>` prints the exact `css` body (Tasks 5–6).

- [ ] **Step 1: Generate the fixture from the pinned tarball (no hand edits)**

Write `.superpowers/sdd/2026-10-05-gap-064-g3b-containers/make-fixture.mjs`:

```js
// GAP-064 G3-B one-off fixture generator (Plan Task 3 Step 1). Not committed.
// usage: node make-fixture.mjs <extracted-tarball-dir> <output-json>
import { writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [dir, out] = process.argv.slice(2);
const keys = [
  "accordion",
  "blockui",
  "card",
  "divider",
  "fieldset",
  "inplace",
  "panel",
  "scrollpanel",
  "splitter",
  "toolbar",
  "base",
];
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
      "GAP-064 G3-B: the 10 F1 Aura keys, plus the base module (source of the B-2 base-role declarations and the FX-B8 exclusion)",
    purpose:
      "CI-runnable upstream structural CSS snapshot for the G3-B fidelity test. Test data only, not shipped source.",
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
mkdir -p .superpowers/sdd/2026-10-05-gap-064-g3b-containers/upstream
tar -xzf .vendor-cache/@primeuix__styles-2.0.3.tar.gz -C .superpowers/sdd/2026-10-05-gap-064-g3b-containers/upstream
node .superpowers/sdd/2026-10-05-gap-064-g3b-containers/make-fixture.mjs .superpowers/sdd/2026-10-05-gap-064-g3b-containers/upstream packages/themes/test/fixtures/primeuix-styles-g3b.json
```

Expected: `11 true`.

- [ ] **Step 2: Create `packages/themes/test/utils/g3b-port.mjs`** (dry-run verified at Plan time: ng and vue each 89 / 76 / 13, 0 problems)

```js
/**
 * GAP-064 G3-B (Spec §5.2–§5.9, §13): the explicit upstream → Ultimate data for
 * the F1 Containers & Panels port, in the six Spec §5.9 categories:
 *   D1 ported component groups (with the §5.2 selector mapping),
 *   D2 omitted component groups (FX-B1..FX-B7),
 *   D3 B-2 base-role rules (PX-B1..PX-B3),
 *   D4 B-3 inline-role rules (PX-B6),
 *   D5 B-4 retained Ultimate-only rules (PX-B9),
 *   D6 base-module exclusions (FX-B8).
 * Used by g3b-upstream-fidelity.test.ts (C3) and, as a CLI, to print the exact
 * css body of one style module:
 *   node packages/themes/test/utils/g3b-port.mjs <ng|vue> <key>
 * Never edit this data to make a check pass (Spec §11 stop condition 6).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { norm, parseGroups } from "./g3a-port.mjs";

export { norm, parseGroups };

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const REPO = path.resolve(HERE, "../../../..");
export const FIXTURE = JSON.parse(
  readFileSync(path.join(HERE, "../fixtures/primeuix-styles-g3b.json"), "utf8")
);

export const FRAMEWORKS = ["ng", "vue"];
export const KEYS = [
  "accordion",
  "blockui",
  "card",
  "divider",
  "fieldset",
  "inplace",
  "panel",
  "scrollpanel",
  "splitter",
  "toolbar",
];

/** Ultimate component directory per Aura key (style file: <dir>/<dir>-style.ts). */
export const DIRS = {
  accordion: "accordion",
  blockui: "block-ui",
  card: "card",
  divider: "divider",
  fieldset: "fieldset",
  inplace: "inplace",
  panel: "panel",
  scrollpanel: "scroll-panel",
  splitter: "splitter",
  toolbar: "toolbar",
};

/** The 4 ADR-051 renames (Spec §5.1): Aura key → old registered key. */
export const OLD_KEYS = { blockui: "block-ui", scrollpanel: "scroll-panel" };

/**
 * Spec §5.2 selector mapping, applied in order to every D1 selector, then the
 * generic `.p-` → `.u-` rule. Entry kinds:
 *   "class"  — replace a whole class token (not followed by [a-z0-9-]);
 *   "prefix" — replace every occurrence, including longer class names;
 *   "text"   — replace an exact selector fragment.
 */
const ACCORDION_NG = [
  ["class", ".p-accordionpanel-active", ".u-accordion-panel-active"],
  ["class", ".p-accordionpanel", ".u-accordion-panel"],
  ["class", ".p-disabled", ".u-accordion-panel-disabled"],
  ["class", ".p-accordionheader-toggle-icon", ".u-accordion-toggle-icon"],
  ["class", ".p-accordionheader", ".u-accordion-header"],
  ["class", ".p-accordioncontent-content", ".u-accordion-content-inner"],
  ["class", ".p-accordioncontent", ".u-accordion-content"],
];
const ACCORDION_VUE = [
  ["class", ".p-accordionpanel-active", '[data-p-active="true"]'],
  ["class", ".p-disabled", '[data-p-disabled="true"]'],
  ["class", ".p-accordionheader-toggle-icon", ".u-accordionheader-toggleicon"],
];
const SHARED = {
  blockui: [
    ["text", ".p-blockui-mask-document.p-overlay-mask", ".u-blockui-mask.u-blockui-mask-document"],
    ["text", ".p-blockui-mask.p-overlay-mask", ".u-blockui-mask"],
    ["class", ".p-blockui", ".u-blockui-container"],
  ],
  inplace: [["class", ".p-disabled", '[data-p-disabled="true"]']],
  panel: [
    ["text", ".p-panel-toggleable .p-panel-header", ".u-panel-header.u-panel-header-toggleable"],
  ],
  scrollpanel: [
    ["class", ".p-scrollpanel-hidden", ".u-scroll-panel-bar-hidden"],
    ["class", ".p-scrollpanel-grabbed", ".u-scroll-panel-bar-grabbed"],
    ["prefix", ".p-scrollpanel", ".u-scroll-panel"],
  ],
};
export const MAPPING = {
  ng: {
    ...SHARED,
    accordion: ACCORDION_NG,
    splitter: [
      ["prefix", ".p-splitterpanel", ".u-splitter-panel"],
      ["class", ".p-splitter-resizing", "[data-resizing]"],
    ],
  },
  vue: {
    ...SHARED,
    accordion: ACCORDION_VUE,
    splitter: [["prefix", ".p-splitterpanel", ".u-splitter-panel"]],
  },
};

/** D2 — Spec §5.3: omitted upstream group numbers (1-based source order) with their FX tag. */
const OMIT_SHARED = {
  accordion: { 15: "FX-B1" },
  divider: {
    8: "FX-B3",
    9: "FX-B3",
    10: "FX-B3",
    11: "FX-B3",
    12: "FX-B3",
    13: "FX-B3",
    14: "FX-B4",
  },
  fieldset: { 11: "FX-B1" },
};
export const OMITTED = {
  ng: {
    ...OMIT_SHARED,
    card: { 2: "FX-B2" },
    panel: { 6: "FX-B1", 8: "FX-B5" },
    splitter: { 13: "FX-B6" },
  },
  vue: {
    ...OMIT_SHARED,
    panel: { 6: "FX-B1" },
    splitter: { 6: "FX-B7", 7: "FX-B7", 13: "FX-B6" },
  },
};

/** Spec §5.3 / §5.9 counts: [upstream groups, D1 ported ng, D1 ported vue]. */
export const COUNTS = {
  accordion: [16, 15, 15],
  blockui: [4, 4, 4],
  card: [5, 4, 5],
  divider: [14, 7, 7],
  fieldset: [12, 11, 11],
  inplace: [4, 4, 4],
  panel: [8, 6, 7],
  scrollpanel: [10, 10, 10],
  splitter: [14, 13, 11],
  toolbar: [2, 2, 2],
};
export const TOTALS = { upstream: 89, ported: 76, omitted: 13 };

const DISABLED_ROLE = (sel) => [
  `${sel}, ${sel} * { cursor: default; pointer-events: none; user-select: none; }`,
  `${sel} { opacity: dt('disabled.opacity'); }`,
];

/** D3 — Spec §5.5 PX-B1..PX-B3: base-role rules, exact text, first in the module. */
export const BASE_ROLE = {
  ng: {
    accordion: DISABLED_ROLE(".u-accordion-panel-disabled"),
    inplace: DISABLED_ROLE('.u-inplace-display[data-p-disabled="true"]'),
  },
  vue: {
    accordion: DISABLED_ROLE('.u-accordionpanel[data-p-disabled="true"]'),
    inplace: DISABLED_ROLE('.u-inplace-display[data-p-disabled="true"]'),
  },
};
const MASK_ROLE =
  ".u-blockui-mask { background: dt('mask.background'); color: dt('mask.color'); position: fixed; top: 0; left: 0; width: 100%; height: 100%; }";
BASE_ROLE.ng.blockui = [MASK_ROLE];
BASE_ROLE.vue.blockui = [MASK_ROLE];

/**
 * D3 source evidence: each base-role rule's declarations equal the upstream base
 * group's, except the one recorded difference (PX-B3: no `--px-mask-background` wrapper).
 */
export const BASE_SOURCES = [
  { base: ".p-disabled, .p-disabled *", ruleIndex: 0, keys: ["accordion", "inplace"] },
  { base: ".p-disabled, .p-component:disabled", ruleIndex: 1, keys: ["accordion", "inplace"] },
  {
    base: ".p-overlay-mask",
    ruleIndex: 0,
    keys: ["blockui"],
    differences: {
      background: ["var(--px-mask-background, dt('mask.background'))", "dt('mask.background')"],
    },
  },
];

/** D4 — Spec §5.5 PX-B6: inline-role rules, exact text, after the D1 groups. */
export const INLINE_ROLE = {
  divider: [
    ".u-divider-horizontal { justify-content: center; }",
    ".u-divider-vertical { align-items: center; }",
  ],
};

/** D5 — Spec §5.5 PX-B9: the only retained Ultimate-only rules, exact text, last. */
export const RETAINED = {
  fieldset: [
    ".u-fieldset-toggle-button { font: inherit; color: inherit; }",
    ".u-fieldset-toggle-icon { font-weight: 700; width: 1rem; display: inline-flex; justify-content: center; }",
  ],
  splitter: [".u-splitter-gutter { touch-action: none; }"],
};

/** D6 — Spec §5.7 FX-B8: base-module groups never emitted (not part of the 89). */
export const BASE_EXCLUDED = [
  ".p-overlay-mask-enter-active",
  ".p-overlay-mask-leave-active",
  "@keyframes p-animate-overlay-mask-enter",
  "@keyframes p-animate-overlay-mask-leave",
];

/** Spec §5.6: the only unresolved references (both frameworks). */
export const UNRESOLVED = {
  scrollpanel: ["--u-scrollpanel-barfocus-ring-offset", "--u-scrollpanel-barfocus-ring-width"],
};

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function mapSelector(fw, key, selector) {
  let s = selector;
  for (const [kind, from, to] of MAPPING[fw][key] ?? []) {
    if (kind === "class") s = s.replace(new RegExp(`${escape(from)}(?![a-z0-9-])`, "g"), to);
    else s = s.split(from).join(to);
  }
  return s.replace(/\.p-/g, ".u-");
}

/** D1 and D2 for one framework style module, in upstream source order. */
export function expected(fw, key) {
  const groups = parseGroups(FIXTURE.modules[key]);
  const omitted = OMITTED[fw][key] ?? {};
  const d1 = [];
  const d2 = [];
  groups.forEach((g, i) => {
    const n = i + 1;
    if (g.keyframes) throw new Error(`${key}: unexpected keyframes in a G3-B module`);
    if (omitted[n]) d2.push({ n, tag: omitted[n], head: norm(g.head) });
    else d1.push({ n, text: norm(`${mapSelector(fw, key, g.head)}{${g.body}}`) });
  });
  return { upstream: groups.length, d1, d2 };
}

/** Spec §5.4 canonical order: D3, then D1 (upstream order), then D4, then D5. */
export function expectedCss(fw, key) {
  return [
    ...(BASE_ROLE[fw][key] ?? []).map(norm),
    ...expected(fw, key).d1.map((r) => r.text),
    ...(INLINE_ROLE[key] ?? []).map(norm),
    ...(RETAINED[key] ?? []).map(norm),
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
  return path.join(REPO, "packages", fw, "src", DIRS[key], `${DIRS[key]}-style.ts`);
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
    throw new Error(`usage: g3b-port.mjs <ng|vue> <key>; key one of ${KEYS.join(", ")}`);
  console.log(expectedCss(fw, key).join("\n"));
}
```

- [ ] **Step 3: Write the fidelity test `packages/themes/test/g3b-upstream-fidelity.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  BASE_EXCLUDED,
  BASE_ROLE,
  BASE_SOURCES,
  COUNTS,
  FIXTURE,
  FRAMEWORKS,
  INLINE_ROLE,
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
  norm,
  parseGroups,
} from "./utils/g3b-port.mjs";

/**
 * GAP-064 G3-B C3 (Spec §8 C3, §5.4, §5.9, §13): each of the 20 framework style
 * files contains exactly D3 → D1 (upstream source order) → D4 → D5, derived
 * from the committed @primeuix/styles 2.0.3 fixture; D2 and D6 never appear.
 */
type Fw = "ng" | "vue";
const CASES = (FRAMEWORKS as Fw[]).flatMap((fw) => (KEYS as string[]).map((key) => ({ fw, key })));
const decl = (body: string) =>
  Object.fromEntries(
    norm(body)
      .split(";")
      .filter(Boolean)
      .map((d) => [d.slice(0, d.indexOf(":")).trim(), d.slice(d.indexOf(":") + 1).trim()])
  );
const bodyOf = (rule: string) => rule.slice(rule.indexOf("{") + 1, -1);

describe("G3-B upstream fixture and data model (Spec §5.9)", () => {
  it("covers the 10 G3-B keys plus base and records its source", () => {
    expect(Object.keys(FIXTURE.modules).sort()).toEqual([...KEYS, "base"].sort());
    expect(FIXTURE._meta.source).toContain("@primeuix/styles@2.0.3");
  });

  it.each(FRAMEWORKS as Fw[])(
    "%s: D1 + D2 = 89 per framework (76 + 13), disjoint, per-key counts pinned",
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
      expect({ upstream, ported, omitted }).toEqual(TOTALS);
    }
  );

  it("D2 tags are exactly FX-B1..FX-B7 (FX-B8 is D6, not a component group)", () => {
    const tags = new Set(
      (FRAMEWORKS as Fw[]).flatMap((fw) =>
        Object.values((OMITTED as Record<Fw, Record<string, Record<number, string>>>)[fw]).flatMap(
          (m) => Object.values(m)
        )
      )
    );
    expect([...tags].sort()).toEqual([
      "FX-B1",
      "FX-B2",
      "FX-B3",
      "FX-B4",
      "FX-B5",
      "FX-B6",
      "FX-B7",
    ]);
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

  it("D3 declarations equal the upstream base groups, except the recorded PX-B3 difference", () => {
    const base = parseGroups(FIXTURE.modules.base).map((g: { head: string; body: string }) => ({
      head: norm(g.head),
      body: g.body,
    }));
    for (const src of BASE_SOURCES) {
      const group = base.find((b: { head: string }) => b.head === src.base);
      expect(group, src.base).toBeDefined();
      const upstream = decl(group!.body);
      for (const fw of FRAMEWORKS as Fw[])
        for (const key of src.keys) {
          const mine = decl(
            bodyOf(
              norm((BASE_ROLE as Record<Fw, Record<string, string[]>>)[fw][key][src.ruleIndex])
            )
          );
          const want = Object.fromEntries(
            Object.entries(upstream).map(([p, v]) => {
              const diff = (src as { differences?: Record<string, string[]> }).differences?.[p];
              if (diff) expect(v, `${src.base} ${p}`).toBe(diff[0]);
              return [p, diff ? diff[1] : v];
            })
          );
          expect(mine, `${fw} ${key} ${src.base}`).toEqual(want);
        }
    }
  });

  it("D6 groups exist in the upstream base module", () => {
    const heads = parseGroups(FIXTURE.modules.base).map((g: { head: string }) => norm(g.head));
    for (const h of BASE_EXCLUDED) expect(heads, h).toContain(h);
  });

  it("D4 and D5 never redeclare a D1 property on the same selector", () => {
    for (const fw of FRAMEWORKS as Fw[])
      for (const key of KEYS as string[]) {
        const d1 = expected(fw, key).d1.map((r: { text: string }) => declarations(r.text));
        const extra = [
          ...((INLINE_ROLE as Record<string, string[]>)[key] ?? []),
          ...((RETAINED as Record<string, string[]>)[key] ?? []),
        ].map((r) => declarations(norm(r)));
        for (const x of extra) {
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
  it("contains exactly D3 → D1 → D4 → D5, nothing else", () => {
    expect(actualRules(fw, key)).toEqual(expectedCss(fw, key));
  });

  it("every rule belongs to exactly one of D1, D3, D4, D5; nothing from D2 or D6", () => {
    const d1 = expected(fw, key).d1.map((r: { text: string }) => r.text);
    const d3 = ((BASE_ROLE as Record<Fw, Record<string, string[]>>)[fw][key] ?? []).map(norm);
    const d4 = ((INLINE_ROLE as Record<string, string[]>)[key] ?? []).map(norm);
    const d5 = ((RETAINED as Record<string, string[]>)[key] ?? []).map(norm);
    for (const rule of actualRules(fw, key)) {
      const hits = [d1, d3, d4, d5].filter((set) => set.includes(rule)).length;
      expect(hits, rule).toBe(1);
    }
    const css = norm(actualCssText(fw, key));
    for (const g of expected(fw, key).d2) expect(css).not.toContain(g.head.replace(/\.p-/g, ".u-"));
    expect(css).not.toMatch(/overlay-mask-(enter|leave)|animate-overlay-mask/);
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
pnpm --filter @ultimate/themes exec vitest run test/g3b-upstream-fidelity.test.ts
```

Expected: every "G3-B upstream fixture and data model" test passes; the 20 × 4 style-module tests fail (old CSS). A failing data-model test is a Spec/data mismatch: **stop and report**.

- [ ] **Step 5: Commit**

```bash
git add packages/themes/test/fixtures/primeuix-styles-g3b.json packages/themes/test/utils/g3b-port.mjs packages/themes/test/g3b-upstream-fidelity.test.ts
git commit -m "test(gap-064): add G3-B upstream fixture, D1-D6 data module and fidelity test"
```

---

### Task 4: Runtime tests — keys (C1), variable resolution (C2), state selectors (C3)

**Files:**

- Create: `packages/ng/src/g3b-aura-styles.spec.ts`
- Create: `packages/vue/src/g3b-aura-styles.spec.ts`

**Interfaces:**

- Consumes: component exports `UAccordion`, `UBlockUI`, `UCard`, `UDivider`, `UFieldset`, `UInplace`, `UPanel`, `UScrollPanel`, `USplitter`, `USplitterPanel` (ng), `UToolbar`; Vue adds `UAccordionPanel`, `UAccordionHeader`, `UAccordionContent`.
- Produces: nothing consumed later; RED until Tasks 5–6.

- [ ] **Step 1: Angular spec `packages/ng/src/g3b-aura-styles.spec.ts`**

```ts
import { Component, PLATFORM_ID, type Type } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { TestBed } from "@angular/core/testing";
import { beforeAll, describe, expect, it } from "vitest";
import { applyUltimateTheme } from "@ultimate/themes";
import { UAccordion } from "./accordion";
import { UBlockUI } from "./block-ui";
import { UCard } from "./card";
import { UDivider } from "./divider";
import { UFieldset } from "./fieldset";
import { UInplace } from "./inplace";
import { UPanel } from "./panel";
import { UScrollPanel } from "./scroll-panel";
import { USplitter, USplitterPanel } from "./splitter";
import { UToolbar } from "./toolbar";

/**
 * GAP-064 G3-B (Spec §8 C1, C2, C3 state selectors). Assertions use the
 * generated <style data-u-ng-style> elements and the rendered DOM. Each mount
 * uses a fresh document under a server PLATFORM_ID (fresh per-document style
 * registry, GAP-078), as in G3-A.
 */
const KEY_ATTR = "data-u-ng-style";
/** Spec §5.6: the only unresolved references; every other list is empty. */
const UNRESOLVED: Record<string, string[]> = {
  scrollpanel: ["--u-scrollpanel-barfocus-ring-offset", "--u-scrollpanel-barfocus-ring-width"],
};

@Component({
  standalone: true,
  imports: [USplitter, USplitterPanel],
  template: `<u-splitter
    ><ng-template uSplitterPanel>A</ng-template
    ><ng-template uSplitterPanel>B</ng-template></u-splitter
  >`,
})
class SplitterHost {}

@Component({
  standalone: true,
  imports: [USplitter, USplitterPanel],
  template: `<u-splitter layout="vertical"
    ><ng-template uSplitterPanel>A</ng-template
    ><ng-template uSplitterPanel>B</ng-template></u-splitter
  >`,
})
class SplitterVerticalHost {}

@Component({
  standalone: true,
  imports: [USplitter, USplitterPanel],
  template: `<u-splitter
    ><ng-template uSplitterPanel
      ><u-splitter
        ><ng-template uSplitterPanel>A</ng-template
        ><ng-template uSplitterPanel>B</ng-template></u-splitter
      ></ng-template
    ><ng-template uSplitterPanel>C</ng-template></u-splitter
  >`,
})
class NestedSplitterHost {}

type Inputs = Record<string, unknown>;
const PANELS = [
  { value: "0", header: "A" },
  { value: "1", header: "B" },
  { value: "2", header: "C", disabled: true },
];

interface Case {
  name: string;
  type: Type<unknown>;
  key: string;
  oldKey?: string;
  mounts: Inputs[];
}
const CASES: Case[] = [
  {
    name: "accordion",
    type: UAccordion,
    key: "accordion",
    mounts: [{ panels: PANELS, value: "0" }],
  },
  {
    name: "blockui",
    type: UBlockUI,
    key: "blockui",
    oldKey: "block-ui",
    mounts: [{ blocked: true }, { blocked: true, fullScreen: true }],
  },
  { name: "card", type: UCard, key: "card", mounts: [{ header: "T", subheader: "S" }] },
  { name: "divider", type: UDivider, key: "divider", mounts: [{}, { layout: "vertical" }] },
  {
    name: "fieldset",
    type: UFieldset,
    key: "fieldset",
    mounts: [
      { legend: "L" },
      { legend: "L", toggleable: true },
      { legend: "L", toggleable: true, collapsed: true },
    ],
  },
  {
    name: "inplace",
    type: UInplace,
    key: "inplace",
    mounts: [{}, { disabled: true }, { active: true }],
  },
  {
    name: "panel",
    type: UPanel,
    key: "panel",
    mounts: [
      { header: "P" },
      { header: "P", toggleable: true },
      { header: "P", toggleable: true, collapsed: true },
    ],
  },
  {
    name: "scrollpanel",
    type: UScrollPanel,
    key: "scrollpanel",
    oldKey: "scroll-panel",
    mounts: [{}],
  },
  { name: "splitter horizontal", type: SplitterHost, key: "splitter", mounts: [{}] },
  { name: "splitter vertical", type: SplitterVerticalHost, key: "splitter", mounts: [{}] },
  { name: "toolbar", type: UToolbar, key: "toolbar", mounts: [{}] },
];

/** G3-A / GAP-078 isolation: reset, one configureTestingModule with a new Document, one createComponent. */
function mount(type: Type<unknown>, inputs: Inputs = {}) {
  TestBed.resetTestingModule();
  const doc = document.implementation.createHTMLDocument("g3b");
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
const ACTIVE =
  ".u-accordion-panel:not(.u-accordion-panel-disabled).u-accordion-panel-active > .u-accordion-header";
const HOVER =
  ".u-accordion-panel:not(.u-accordion-panel-active):not(.u-accordion-panel-disabled) > .u-accordion-header:hover";
const FOCUS =
  ".u-accordion-panel:not(.u-accordion-panel-disabled) .u-accordion-header:focus-visible";
const ACC = { key: "accordion", type: UAccordion, inputs: { panels: PANELS, value: "0" } };
const INPLACE_HOVER = '.u-inplace-display:not([data-p-disabled="true"]):hover';
const INPLACE_DISABLED = '.u-inplace-display[data-p-disabled="true"]';
const mousedownGutter = (el: HTMLElement) =>
  el
    .querySelector(".u-splitter-gutter")!
    .dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

const ROWS: StateRow[] = [
  {
    name: "accordion active header",
    ...ACC,
    all: ".u-accordion-header",
    selector: ACTIVE,
    expected: [0],
  },
  {
    name: "accordion hover header",
    ...ACC,
    all: ".u-accordion-header",
    selector: HOVER,
    expected: [1],
  },
  {
    name: "accordion focus ring",
    ...ACC,
    all: ".u-accordion-header",
    selector: FOCUS,
    expected: [0, 1],
  },
  {
    name: "accordion disabled role PX-B1",
    ...ACC,
    all: ".u-accordion-panel",
    selector: ".u-accordion-panel-disabled",
    expected: [2],
  },
  {
    name: "inplace enabled hover",
    key: "inplace",
    type: UInplace,
    all: ".u-inplace-display",
    selector: INPLACE_HOVER,
    expected: [0],
  },
  {
    name: "inplace disabled no hover",
    key: "inplace",
    type: UInplace,
    inputs: { disabled: true },
    all: ".u-inplace-display",
    selector: INPLACE_HOVER,
    expected: [],
  },
  {
    name: "inplace disabled role PX-B2",
    key: "inplace",
    type: UInplace,
    inputs: { disabled: true },
    all: ".u-inplace-display",
    selector: INPLACE_DISABLED,
    expected: [0],
  },
  {
    name: "inplace enabled not disabled",
    key: "inplace",
    type: UInplace,
    all: ".u-inplace-display",
    selector: INPLACE_DISABLED,
    expected: [],
  },
  {
    name: "panel toggleable header PX-B7",
    key: "panel",
    type: UPanel,
    inputs: { header: "P", toggleable: true },
    all: ".u-panel-header",
    selector: ".u-panel-header.u-panel-header-toggleable",
    expected: [0],
  },
  {
    name: "panel plain header",
    key: "panel",
    type: UPanel,
    inputs: { header: "P" },
    all: ".u-panel-header",
    selector: ".u-panel-header.u-panel-header-toggleable",
    expected: [],
  },
  {
    name: "fieldset toggleable legend",
    key: "fieldset",
    type: UFieldset,
    inputs: { legend: "L", toggleable: true },
    all: ".u-fieldset-legend",
    selector: ".u-fieldset-toggleable > .u-fieldset-legend",
    expected: [0],
  },
  {
    name: "fieldset plain legend",
    key: "fieldset",
    type: UFieldset,
    inputs: { legend: "L" },
    all: ".u-fieldset-legend",
    selector: ".u-fieldset-toggleable > .u-fieldset-legend",
    expected: [],
  },
  {
    name: "divider horizontal",
    key: "divider",
    type: UDivider,
    all: ".u-divider",
    selector: ".u-divider-horizontal",
    expected: [0],
  },
  {
    name: "divider vertical",
    key: "divider",
    type: UDivider,
    inputs: { layout: "vertical" },
    all: ".u-divider",
    selector: ".u-divider-vertical",
    expected: [0],
  },
  {
    name: "blockui document mask PX-B4",
    key: "blockui",
    type: UBlockUI,
    inputs: { blocked: true, fullScreen: true },
    all: ".u-blockui-mask",
    selector: ".u-blockui-mask.u-blockui-mask-document",
    expected: [0],
  },
  {
    name: "blockui container mask",
    key: "blockui",
    type: UBlockUI,
    inputs: { blocked: true },
    all: ".u-blockui-mask",
    selector: ".u-blockui-mask.u-blockui-mask-document",
    expected: [],
  },
  {
    name: "splitter idle PX-B8",
    key: "splitter",
    type: SplitterHost,
    all: ".u-splitter",
    selector: ".u-splitter-horizontal[data-resizing]",
    expected: [],
  },
  {
    name: "splitter dragging PX-B8",
    key: "splitter",
    type: SplitterHost,
    act: mousedownGutter,
    all: ".u-splitter",
    selector: ".u-splitter-horizontal[data-resizing]",
    expected: [0],
  },
  {
    name: "splitter vertical",
    key: "splitter",
    type: SplitterVerticalHost,
    all: ".u-splitter",
    selector: ".u-splitter-vertical",
    expected: [0],
  },
  {
    name: "nested splitter descendant rule (Review Focus 4)",
    key: "splitter",
    type: NestedSplitterHost,
    all: ".u-splitter",
    selector: ".u-splitter-panel .u-splitter",
    expected: [1],
  },
];

describe("GAP-064 G3-B — Angular", () => {
  beforeAll(() => applyUltimateTheme());

  describe.each(CASES)("$name", (c) => {
    it("registers under the Aura key and never under an old key (C1)", () => {
      const { doc } = mount(c.type, c.mounts[0]);
      expect(count(doc, c.key)).toBe(1);
      expect(count(doc, `${c.key}-variables`)).toBe(1);
      expect(cssFor(doc, `${c.key}-variables`)).toContain(`--u-${c.key}-`);
      if (c.oldKey) {
        expect(count(doc, c.oldKey)).toBe(0);
        expect(count(doc, `${c.oldKey}-variables`)).toBe(0);
      }
    });

    it.each(c.mounts)("resolves every variable except the Spec §5.6 list (C2) %o", (inputs) => {
      const { doc } = mount(c.type, inputs);
      expect(unresolved(doc, c.key)).toEqual(UNRESOLVED[c.key] ?? []);
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

- [ ] **Step 2: Vue spec `packages/vue/src/g3b-aura-styles.spec.ts`**

```ts
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { h, nextTick, type VNode } from "vue";
import { applyUltimateTheme } from "@ultimate/themes";
import { vueCoreStyleSheet } from "@ultimate/vue-core";
import { UAccordion } from "./accordion";
import { UAccordionPanel } from "./accordion-panel";
import { UAccordionHeader } from "./accordion-header";
import { UAccordionContent } from "./accordion-content";
import { UBlockUI } from "./block-ui";
import { UCard } from "./card";
import { UDivider } from "./divider";
import { UFieldset } from "./fieldset";
import { UInplace } from "./inplace";
import { UPanel } from "./panel";
import { UScrollPanel } from "./scroll-panel";
import { USplitter } from "./splitter";
import { UToolbar } from "./toolbar";

/**
 * GAP-064 G3-B (Spec §8 C1, C2, C3 state selectors) for Vue. Assertions use
 * the generated <style data-u-style> elements and the rendered DOM; the
 * registry is reset before every test, as in G3-A.
 */
const KEY_ATTR = "data-u-style";
/** Spec §5.6: the only unresolved references; every other list is empty. */
const UNRESOLVED: Record<string, string[]> = {
  scrollpanel: ["--u-scrollpanel-barfocus-ring-offset", "--u-scrollpanel-barfocus-ring-width"],
};

type Render = () => VNode;
const PANELS: Array<[string, string, boolean]> = [
  ["0", "A", false],
  ["1", "B", false],
  ["2", "C", true],
];
const accordion: Render = () =>
  h(UAccordion, { value: "0" }, () =>
    PANELS.map(([value, title, disabled]) =>
      h(UAccordionPanel, { value, disabled }, () => [
        h(UAccordionHeader, null, () => title),
        h(UAccordionContent, null, () => `${title} content`),
      ])
    )
  );
const inplace =
  (props: Record<string, unknown>): Render =>
  () =>
    h(UInplace, props, { display: () => "Display", content: () => "Content" });
const panel =
  (props: Record<string, unknown>): Render =>
  () =>
    h(UPanel, props, { default: () => "Content", footer: () => "Footer" });
const fieldset =
  (props: Record<string, unknown>): Render =>
  () =>
    h(UFieldset, props, () => "Content");
const splitter =
  (props: Record<string, unknown>): Render =>
  () =>
    h(USplitter, { panels: [{}, {}], ...props });
const nestedSplitter: Render = () =>
  h(
    USplitter,
    { panels: [{}, {}] },
    {
      default: ({ index }: { index: number }) =>
        index === 0 ? h(USplitter, { panels: [{}, {}] }) : "C",
    }
  );

interface Case {
  name: string;
  key: string;
  oldKey?: string;
  mounts: Render[];
}
const CASES: Case[] = [
  { name: "accordion", key: "accordion", mounts: [accordion] },
  {
    name: "blockui",
    key: "blockui",
    oldKey: "block-ui",
    mounts: [
      () => h(UBlockUI, { blocked: true }, () => "C"),
      () => h(UBlockUI, { blocked: true, fullScreen: true }, () => "C"),
    ],
  },
  {
    name: "card",
    key: "card",
    mounts: [
      () =>
        h(UCard, null, {
          title: () => "T",
          subtitle: () => "S",
          content: () => "C",
          footer: () => "F",
        }),
    ],
  },
  {
    name: "divider",
    key: "divider",
    mounts: [
      () => h(UDivider, null, () => "L"),
      () => h(UDivider, { layout: "vertical" }, () => "L"),
    ],
  },
  {
    name: "fieldset",
    key: "fieldset",
    mounts: [
      fieldset({ legend: "L" }),
      fieldset({ legend: "L", toggleable: true }),
      fieldset({ legend: "L", toggleable: true, collapsed: true }),
    ],
  },
  {
    name: "inplace",
    key: "inplace",
    mounts: [inplace({}), inplace({ disabled: true }), inplace({ active: true })],
  },
  {
    name: "panel",
    key: "panel",
    mounts: [
      panel({ header: "P" }),
      panel({ header: "P", toggleable: true }),
      panel({ header: "P", toggleable: true, collapsed: true }),
    ],
  },
  {
    name: "scrollpanel",
    key: "scrollpanel",
    oldKey: "scroll-panel",
    mounts: [() => h(UScrollPanel, null, () => "C")],
  },
  { name: "splitter", key: "splitter", mounts: [splitter({}), splitter({ layout: "vertical" })] },
  {
    name: "toolbar",
    key: "toolbar",
    mounts: [() => h(UToolbar, null, { start: () => "S", end: () => "E" })],
  },
];

async function render(node: Render) {
  const wrapper = mount({ render: node });
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
  all: string;
  selector: string;
  expected: number[];
}
const ACTIVE =
  '.u-accordionpanel:not([data-p-disabled="true"])[data-p-active="true"] > .u-accordionheader';
const HOVER =
  '.u-accordionpanel:not([data-p-active="true"]):not([data-p-disabled="true"]) > .u-accordionheader:hover';
const FOCUS = '.u-accordionpanel:not([data-p-disabled="true"]) .u-accordionheader:focus-visible';
const INPLACE_HOVER = '.u-inplace-display:not([data-p-disabled="true"]):hover';
const INPLACE_DISABLED = '.u-inplace-display[data-p-disabled="true"]';

const ROWS: StateRow[] = [
  {
    name: "accordion active header",
    key: "accordion",
    node: accordion,
    all: ".u-accordionheader",
    selector: ACTIVE,
    expected: [0],
  },
  {
    name: "accordion hover header",
    key: "accordion",
    node: accordion,
    all: ".u-accordionheader",
    selector: HOVER,
    expected: [1],
  },
  {
    name: "accordion focus ring",
    key: "accordion",
    node: accordion,
    all: ".u-accordionheader",
    selector: FOCUS,
    expected: [0, 1],
  },
  {
    name: "accordion disabled role PX-B1",
    key: "accordion",
    node: accordion,
    all: ".u-accordionpanel",
    selector: '.u-accordionpanel[data-p-disabled="true"]',
    expected: [2],
  },
  {
    name: "inplace enabled hover",
    key: "inplace",
    node: inplace({}),
    all: ".u-inplace-display",
    selector: INPLACE_HOVER,
    expected: [0],
  },
  {
    name: "inplace disabled no hover",
    key: "inplace",
    node: inplace({ disabled: true }),
    all: ".u-inplace-display",
    selector: INPLACE_HOVER,
    expected: [],
  },
  {
    name: "inplace disabled role PX-B2",
    key: "inplace",
    node: inplace({ disabled: true }),
    all: ".u-inplace-display",
    selector: INPLACE_DISABLED,
    expected: [0],
  },
  {
    name: "inplace enabled not disabled",
    key: "inplace",
    node: inplace({}),
    all: ".u-inplace-display",
    selector: INPLACE_DISABLED,
    expected: [],
  },
  {
    name: "panel toggleable header PX-B7",
    key: "panel",
    node: panel({ header: "P", toggleable: true }),
    all: ".u-panel-header",
    selector: ".u-panel-header.u-panel-header-toggleable",
    expected: [0],
  },
  {
    name: "panel plain header",
    key: "panel",
    node: panel({ header: "P" }),
    all: ".u-panel-header",
    selector: ".u-panel-header.u-panel-header-toggleable",
    expected: [],
  },
  {
    name: "fieldset toggleable legend",
    key: "fieldset",
    node: fieldset({ legend: "L", toggleable: true }),
    all: ".u-fieldset-legend",
    selector: ".u-fieldset-toggleable > .u-fieldset-legend",
    expected: [0],
  },
  {
    name: "fieldset plain legend",
    key: "fieldset",
    node: fieldset({ legend: "L" }),
    all: ".u-fieldset-legend",
    selector: ".u-fieldset-toggleable > .u-fieldset-legend",
    expected: [],
  },
  {
    name: "divider horizontal",
    key: "divider",
    node: () => h(UDivider, null, () => "L"),
    all: ".u-divider",
    selector: ".u-divider-horizontal",
    expected: [0],
  },
  {
    name: "divider vertical",
    key: "divider",
    node: () => h(UDivider, { layout: "vertical" }, () => "L"),
    all: ".u-divider",
    selector: ".u-divider-vertical",
    expected: [0],
  },
  {
    name: "blockui document mask PX-B4",
    key: "blockui",
    node: () => h(UBlockUI, { blocked: true, fullScreen: true }, () => "C"),
    all: ".u-blockui-mask",
    selector: ".u-blockui-mask.u-blockui-mask-document",
    expected: [0],
  },
  {
    name: "blockui container mask",
    key: "blockui",
    node: () => h(UBlockUI, { blocked: true }, () => "C"),
    all: ".u-blockui-mask",
    selector: ".u-blockui-mask.u-blockui-mask-document",
    expected: [],
  },
  {
    name: "splitter horizontal",
    key: "splitter",
    node: splitter({}),
    all: ".u-splitter",
    selector: ".u-splitter-horizontal",
    expected: [0],
  },
  {
    name: "splitter vertical",
    key: "splitter",
    node: splitter({ layout: "vertical" }),
    all: ".u-splitter",
    selector: ".u-splitter-vertical",
    expected: [0],
  },
  {
    name: "nested splitter descendant rule (Review Focus 4)",
    key: "splitter",
    node: nestedSplitter,
    all: ".u-splitter",
    selector: ".u-splitter-panel .u-splitter",
    expected: [1],
  },
];

describe("GAP-064 G3-B — Vue", () => {
  beforeAll(() => applyUltimateTheme());
  beforeEach(() => {
    vueCoreStyleSheet.clear();
    styles().forEach((s) => s.remove());
  });

  describe.each(CASES)("$name", (c) => {
    it("registers under the Aura key and never under an old key (C1)", async () => {
      await render(c.mounts[0]);
      expect(count(c.key)).toBe(1);
      expect(count(`${c.key}-variables`)).toBe(1);
      expect(cssFor(`${c.key}-variables`)).toContain(`--u-${c.key}-`);
      if (c.oldKey) {
        expect(count(c.oldKey)).toBe(0);
        expect(count(`${c.oldKey}-variables`)).toBe(0);
      }
    });

    it.each(c.mounts.map((node, i) => ({ i, node })))(
      "resolves every variable except the Spec §5.6 list (C2) mount $i",
      async ({ node }) => {
        await render(node);
        expect(unresolved(c.key)).toEqual(UNRESOLVED[c.key] ?? []);
        expect(cssFor(c.key)).toContain(`var(--u-${c.key}-`);
      }
    );
  });

  describe("state selectors match the rendered state (C3)", () => {
    it.each(ROWS)("$name", async (row) => {
      const el = await render(row.node);
      expect(cssFor(row.key), "selector styled").toContain(row.selector);
      expect(matching(el, row.all, row.selector)).toEqual(row.expected);
    });
  });

  it("an enabled AccordionPanel's data-p-disabled is 'false' or absent, never 'true' (Spec §13.7, Review Focus 1)", async () => {
    const el = await render(accordion);
    const value = el.querySelectorAll(".u-accordionpanel")[1].getAttribute("data-p-disabled");
    expect(["false", null]).toContain(value);
  });
});
```

- [ ] **Step 3: Run both — RED for the expected reasons**

```bash
pnpm run build
pnpm --filter @ultimate/ng exec ng test --project=ng --include=src/g3b-aura-styles.spec.ts --watch=false
pnpm --filter @ultimate/vue exec vitest run src/g3b-aura-styles.spec.ts
```

Expected failures, and only these kinds: C1 for blockui/scrollpanel (old keys); C2 where old CSS references undefined/invented variables or lacks `var(--u-<key>-`; C3 "selector styled" (selectors absent). The Vue false-attribute test passes already. Rows whose `matching` assertion fails **before** the port for a reason other than a missing selector (for example the splitter mousedown not setting `data-resizing` in jsdom) are a test-environment problem: stop and report.

- [ ] **Step 4: Commit**

```bash
git add packages/ng/src/g3b-aura-styles.spec.ts packages/vue/src/g3b-aura-styles.spec.ts
git commit -m "test(gap-064): add G3-B runtime key, token and state-selector tests"
```

---

### Task 5: Angular port (10 style modules, 2 key renames)

**Files:**

- Modify: `packages/ng/src/{accordion,block-ui,card,divider,fieldset,inplace,panel,scroll-panel,splitter,toolbar}/*-style.ts` (`css` block + one doc-comment line)
- Modify: `packages/ng/src/block-ui/block-ui.ts:58`, `packages/ng/src/scroll-panel/scroll-panel.ts:89` (key literal only)

**Interfaces:**

- Consumes: `node packages/themes/test/utils/g3b-port.mjs ng <key>`.

- [ ] **Step 1: Replace each `css` body with the CLI output**

For each key in `accordion blockui card divider fieldset inplace panel scrollpanel splitter toolbar`:

```bash
node packages/themes/test/utils/g3b-port.mjs ng accordion
```

Replace the whole content between ``const css = /*css*/ ` `` and the closing `` ` `` with that output (one rule per line, a leading and trailing newline). Do not hand-edit any rule. Add this line at the end of the file's leading doc comment (G3-A precedent):

```
 * GAP-064 G3-B: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3b-port.mjs).
```

Nothing else in the file changes (`classes`, exports, other comments).

- [ ] **Step 2: Rename the two keys**

`packages/ng/src/block-ui/block-ui.ts:58`: `componentName = "block-ui"` → `componentName = "blockui"`.
`packages/ng/src/scroll-panel/scroll-panel.ts:89`: `componentName = "scroll-panel"` → `componentName = "scrollpanel"`.

- [ ] **Step 3: Run the checks — GREEN**

```bash
pnpm --filter @ultimate/themes exec vitest run test/g3b-upstream-fidelity.test.ts -t "^ng "
pnpm --filter @ultimate/ng exec ng test --project=ng --include=src/g3b-aura-styles.spec.ts --watch=false
```

Expected: all ng fidelity cases and the whole Angular runtime spec pass. Any failure: stop and report (never edit data or tests).

- [ ] **Step 4: C4 diff check (Angular)**

```bash
git diff -U0 -- packages/ng/src/block-ui/block-ui.ts packages/ng/src/scroll-panel/scroll-panel.ts
git diff --stat -- packages/ng/src
```

Expected: exactly one changed line in each component file (the key literal); the stat lists only those 2 files and the 10 style files. In every style file, the diff touches only the `css` block and the one comment line (inspect `git diff -- packages/ng/src/*/*-style.ts`).

- [ ] **Step 5: Commit**

```bash
git add packages/ng/src/{accordion,block-ui,card,divider,fieldset,inplace,panel,scroll-panel,splitter,toolbar}/*-style.ts \
  packages/ng/src/block-ui/block-ui.ts packages/ng/src/scroll-panel/scroll-panel.ts
git commit -m "feat(gap-064): port F1 Aura structural CSS to Angular (G3-B)"
```

---

### Task 6: Vue port (10 style modules, 2 key renames) and early size check

**Files:**

- Modify: `packages/vue/src/{accordion,block-ui,card,divider,fieldset,inplace,panel,scroll-panel,splitter,toolbar}/*-style.ts` (`css` block + one doc-comment line)
- Modify: `packages/vue/src/block-ui/BaseBlockUI.ts:12`, `packages/vue/src/scroll-panel/BaseScrollPanel.ts:10` (key literal only)

**Interfaces:**

- Consumes: `node packages/themes/test/utils/g3b-port.mjs vue <key>`.

- [ ] **Step 1: Replace each `css` body with the CLI output**

For each key: `node packages/themes/test/utils/g3b-port.mjs vue <key>`, pasted exactly as in Task 5 Step 1, with the same doc-comment line. Nothing else changes.

- [ ] **Step 2: Rename the two keys**

`packages/vue/src/block-ui/BaseBlockUI.ts:12`: `componentName: "block-ui"` → `componentName: "blockui"`.
`packages/vue/src/scroll-panel/BaseScrollPanel.ts:10`: `componentName: "scroll-panel"` → `componentName: "scrollpanel"`.

- [ ] **Step 3: Run the checks — GREEN**

```bash
pnpm --filter @ultimate/themes exec vitest run test/g3b-upstream-fidelity.test.ts
pnpm --filter @ultimate/vue exec vitest run src/g3b-aura-styles.spec.ts
```

Expected: the whole fidelity test (both frameworks) and the Vue runtime spec pass.

- [ ] **Step 4: C4 diff check (Vue)**

```bash
git diff -U0 -- packages/vue/src/block-ui/BaseBlockUI.ts packages/vue/src/scroll-panel/BaseScrollPanel.ts
git diff --stat -- packages/vue/src
```

Expected: one changed line per component file; only those 2 files and the 10 style files.

- [ ] **Step 5: Early size check (hard stop)**

```bash
pnpm run build && pnpm run size:measure
node scripts/provenance/validate-bundle-size.mjs --base-ref fe86fe4
```

Expected: pass. Record the ng and vue rows. If any package exceeds 15%: **stop and report** — no split, no override (B-7). (Early warning only; the authoritative Angular/Vue gate is the direct `fe86fe4` comparison in Task 10 Step 4.)

- [ ] **Step 6: Commit**

```bash
git add packages/vue/src/{accordion,block-ui,card,divider,fieldset,inplace,panel,scroll-panel,splitter,toolbar}/*-style.ts \
  packages/vue/src/block-ui/BaseBlockUI.ts packages/vue/src/scroll-panel/BaseScrollPanel.ts
git commit -m "feat(gap-064): port F1 Aura structural CSS to Vue (G3-B)"
```

---

### Task 7: Provenance for the 20 style files (C11)

**Files:**

- Modify: `docs/architecture/provenance/ng.json`, `docs/architecture/provenance/vue.json` (append 10 entries each, after the last G3-A entry)

- [ ] **Step 1: Append the entries**

Each entry has this shape (G3-A wording, Spec §5.8):

```json
{
  "originalPath": "src/<key>/index.ts",
  "ultimateDestination": "packages/<fw>/src/<dir>/<dir>-style.ts",
  "modificationStatus": "reference-derived",
  "modificationDescription": "Ported (Option B — reference, not verbatim copy) from @primeuix/styles@2.0.3 <key>, selectors adapted to Ultimate's DOM per the GAP-064 G3-B mapping (packages/themes/test/utils/g3b-port.mjs); exceptions <list>."
}
```

`<list>` per entry (exactly):

| key         | ng                                     | vue                                    |
| ----------- | -------------------------------------- | -------------------------------------- |
| accordion   | PX-B1, PX-B11, FX-B1                   | PX-B1, PX-B5, PX-B11, FX-B1            |
| blockui     | PX-B3, PX-B4                           | PX-B3, PX-B4                           |
| card        | PX-B10, FX-B2                          | none                                   |
| divider     | PX-B6, FX-B3, FX-B4                    | PX-B6, FX-B3, FX-B4                    |
| fieldset    | PX-B9, FX-B1                           | PX-B9, FX-B1                           |
| inplace     | PX-B2, PX-B5                           | PX-B2, PX-B5                           |
| panel       | PX-B7, FX-B1, FX-B5                    | PX-B7, FX-B1                           |
| scrollpanel | unresolved-token exception (Spec §5.6) | unresolved-token exception (Spec §5.6) |
| splitter    | PX-B8, PX-B9, FX-B6                    | PX-B9, FX-B6, FX-B7                    |
| toolbar     | none                                   | none                                   |

For "none", end the description with `; no exceptions.` instead of `; exceptions <list>.`.

- [ ] **Step 2: Check**

```bash
grep -c "GAP-064 G3-B mapping" docs/architecture/provenance/ng.json docs/architecture/provenance/vue.json
npx prettier --check docs/architecture/provenance/ng.json docs/architecture/provenance/vue.json
pnpm run provenance:validate 2>&1 | grep -E "g3b|block-ui-style|scroll-panel-style" || true
```

Expected: `ng.json:10`, `vue.json:10`; Prettier clean; no provenance error naming one of the 20 files (the pre-existing failures for other files are recorded, not fixed).

- [ ] **Step 3: Commit**

```bash
git add docs/architecture/provenance/ng.json docs/architecture/provenance/vue.json
git commit -m "docs(gap-064): record provenance for the G3-B style modules"
```

---

### Task 8: Accessibility differential for G3-B (validator, evidence, CI wiring)

Spec §9, §13.1. CI changes happen here and nowhere earlier.

**Files:**

- Create: `scripts/provenance/validate-g3b-accessibility.mjs`, `scripts/provenance/validate-g3b-accessibility.test.mjs`
- Create (git-ignored): `.superpowers/sdd/2026-10-05-gap-064-g3b-containers/docker/fingerprints.mjs`
- Create: `docs/architecture/research/2026-10-05-gap-064-g3b-accessibility-preexisting.md`
- Modify: `.github/workflows/ci.yml` (job `track-a-browser-visual-a11y` only)

**Interfaces:**

- Consumes: `BASELINE_PATH`, `computeFingerprint`, `parseBaselineFingerprints`, `loadBaseline`, `readEnvelopes` from the unchanged `scripts/provenance/validate-accessibility-baseline.mjs`; Task 2's `docker/before/`; the `STORIES` tables of Task 1.
- Produces: `node scripts/provenance/validate-g3b-accessibility.mjs <ng|vue>` (exit 0/1); `docker/after/` envelopes (used by Task 9).

- [ ] **Step 1: Write the failing tests `scripts/provenance/validate-g3b-accessibility.test.mjs`**

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const SCRIPT_PATH = join(process.cwd(), "scripts/provenance/validate-g3b-accessibility.mjs");
const BASELINE = "docs/architecture/ACCESSIBILITY_BASELINE.md";
const PREEXISTING =
  "docs/architecture/research/2026-10-05-gap-064-g3b-accessibility-preexisting.md";
const BROWSERS = ["chromium", "firefox", "webkit"];
const STORIES = Array.from({ length: 25 }, (_, i) => `ng-story${i}--default`);

function runScript(cwd, fw = "ng") {
  return spawnSync("node", [SCRIPT_PATH, fw], { cwd, encoding: "utf8" });
}

function table(fingerprints) {
  return [
    "| Fingerprint | Rule | Component/Story | Note |",
    "| ----------- | ---- | --------------- | ---- |",
    ...fingerprints.map((f) => `| ${f} | ${f.split(":")[0]} | ${f.split(":")[1]} | note |`),
    "",
  ].join("\n");
}

function writeEnvelope(dir, browser, storyId, violations) {
  writeFileSync(
    join(dir, `test-results/accessibility/ng/${browser}/${storyId}.json`),
    JSON.stringify({ componentStoryId: storyId, framework: "ng", browser, results: { violations } })
  );
}

// A work dir shaped like the repo root: both lists, the ng G3-B spec's STORIES
// table, and one envelope per story x browser with the given violations.
function makeWorkDir({ baseline = [], preexisting = [], stories = STORIES, violations = {} }) {
  const dir = mkdtempSync(join(tmpdir(), "g3b-a11y-"));
  mkdirSync(join(dir, "docs/architecture/research"), { recursive: true });
  writeFileSync(join(dir, BASELINE), table(baseline));
  writeFileSync(join(dir, PREEXISTING), table(preexisting));
  mkdirSync(join(dir, "packages/ng/e2e"), { recursive: true });
  writeFileSync(
    join(dir, "packages/ng/e2e/g3b-aura-styles.spec.ts"),
    stories.map((s) => `  { name: "x", story: "${s}", ready: ".x" },`).join("\n")
  );
  for (const browser of BROWSERS) {
    mkdirSync(join(dir, `test-results/accessibility/ng/${browser}`), { recursive: true });
    for (const storyId of stories) writeEnvelope(dir, browser, storyId, violations[storyId] || []);
  }
  return dir;
}

const region = { id: "region", nodes: [{ target: ["#storybook-root"] }] };
const contrast = { id: "color-contrast", nodes: [{ target: [".u-panel-title"] }] };

test("passes when every violation is baselined or pre-existing", () => {
  const dir = makeWorkDir({
    baseline: ["color-contrast:ng-story0--default:.u-panel-title"],
    preexisting: ["region:ng-story1--default:#storybook-root"],
    violations: { "ng-story0--default": [contrast], "ng-story1--default": [region] },
  });
  const result = runScript(dir);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /OK: ng 75\/75 reports, 0 introduced violations, 0 stale/);
  rmSync(dir, { recursive: true, force: true });
});

test("fails when a report is missing", () => {
  const dir = makeWorkDir({});
  rmSync(join(dir, "test-results/accessibility/ng/webkit/ng-story5--default.json"));
  const result = runScript(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /MISSING REPORT: .*webkit\/ng-story5--default\.json/);
  assert.match(result.stderr, /1 missing report\(s\) of 75/);
  rmSync(dir, { recursive: true, force: true });
});

test("fails on a violation in neither list", () => {
  const dir = makeWorkDir({ violations: { "ng-story2--default": [contrast] } });
  const result = runScript(dir);
  assert.equal(result.status, 1);
  assert.match(
    result.stderr,
    /INTRODUCED VIOLATION: color-contrast:ng-story2--default:\.u-panel-title \(chromium\)/
  );
  rmSync(dir, { recursive: true, force: true });
});

test("reports a pre-existing row that is no longer observed as stale without failing", () => {
  const dir = makeWorkDir({ preexisting: ["region:ng-story3--default:#storybook-root"] });
  const result = runScript(dir);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /STALE \(informational\): region:ng-story3--default:#storybook-root/);
  assert.match(result.stdout, /1 stale pre-existing row/);
  rmSync(dir, { recursive: true, force: true });
});

test("fails when the spec's story table has the wrong size", () => {
  const dir = makeWorkDir({ stories: STORIES.slice(1) });
  const result = runScript(dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /lists 24 G3-B stories, expected 25/);
  rmSync(dir, { recursive: true, force: true });
});

test("fails on an envelope whose story id does not match its file name", () => {
  const dir = makeWorkDir({});
  writeFileSync(
    join(dir, "test-results/accessibility/ng/firefox/ng-story4--default.json"),
    JSON.stringify({ componentStoryId: "ng-other--default", results: { violations: [] } })
  );
  const result = runScript(dir);
  assert.equal(result.status, 1);
  assert.match(
    result.stderr,
    /componentStoryId "ng-other--default", expected "ng-story4--default"/
  );
  rmSync(dir, { recursive: true, force: true });
});

test("rejects a framework other than ng or vue", () => {
  const dir = makeWorkDir({});
  const result = runScript(dir, "react");
  assert.equal(result.status, 1);
  assert.match(result.stderr, /usage: .*<ng\|vue>/);
  rmSync(dir, { recursive: true, force: true });
});

test("never modifies either list", () => {
  const dir = makeWorkDir({
    preexisting: ["region:ng-story3--default:#storybook-root"],
    violations: { "ng-story2--default": [contrast] },
  });
  const before = [readFileSync(join(dir, BASELINE)), readFileSync(join(dir, PREEXISTING))];
  runScript(dir);
  assert.deepEqual(before[0], readFileSync(join(dir, BASELINE)));
  assert.deepEqual(before[1], readFileSync(join(dir, PREEXISTING)));
  rmSync(dir, { recursive: true, force: true });
});
```

Run: `node --test scripts/provenance/validate-g3b-accessibility.test.mjs`
Expected: FAIL (script missing).

- [ ] **Step 2: Write `scripts/provenance/validate-g3b-accessibility.mjs`**

```js
#!/usr/bin/env node
// scripts/provenance/validate-g3b-accessibility.mjs
//
// GAP-064 G3-B differential accessibility check (G3-B Spec §9, §13.1). It
// covers only the G3-B verification stories, which CI excludes from the
// strict repository-wide scan (`--grep-invert "G3-A|G3-B"`). For one framework
// (ng or vue) it reads the axe envelopes the G3-B spec wrote to
// test-results/accessibility/<fw>/<browser>/<storyId>.json and:
//
//   - FAILS if any G3-B story is missing an envelope in any of the three
//     browsers. The story list is parsed from the spec's own STORIES table and
//     must have the approved size (ng 25, vue 25), so a skipped scan cannot pass;
//   - FAILS on any violation whose fingerprint is in neither
//     docs/architecture/ACCESSIBILITY_BASELINE.md nor the G3-B pre-existing
//     evidence list;
//   - reports pre-existing rows that are no longer observed as STALE
//     (informational, never a failure).
//
// Fingerprints come from validate-accessibility-baseline.mjs's exported
// computeFingerprint/parseBaselineFingerprints, so the identity contract
// (`rule:story:target`) is identical by construction. Strictly read-only.
// Tranche-scoped by design: validate-g3a-accessibility.mjs is left unchanged.
//
// Usage: node scripts/provenance/validate-g3b-accessibility.mjs <ng|vue>

import { existsSync, readFileSync } from "node:fs";
import {
  BASELINE_PATH,
  computeFingerprint,
  parseBaselineFingerprints,
} from "./validate-accessibility-baseline.mjs";

const PREEXISTING_PATH =
  "docs/architecture/research/2026-10-05-gap-064-g3b-accessibility-preexisting.md";
const BROWSERS = ["chromium", "firefox", "webkit"];
const EXPECTED_STORY_COUNT = { ng: 25, vue: 25 };

const PREFIX = "[validate-g3b-accessibility]";

function fail(message) {
  console.error(`${PREFIX} FAIL: ${message}`);
  process.exit(1);
}

function readText(path, label) {
  if (!existsSync(path)) fail(`${label} not found at ${path}`);
  return readFileSync(path, "utf8");
}

// The spec's STORIES table is the single source of the G3-B story set.
function g3bStoryIds(fw) {
  const specPath = `packages/${fw}/e2e/g3b-aura-styles.spec.ts`;
  const ids = [
    ...new Set(
      Array.from(readText(specPath, "G3-B spec").matchAll(/story: "([a-z0-9-]+)"/g), (m) => m[1])
    ),
  ];
  if (ids.length !== EXPECTED_STORY_COUNT[fw]) {
    fail(`${specPath} lists ${ids.length} G3-B stories, expected ${EXPECTED_STORY_COUNT[fw]}`);
  }
  return ids;
}

function main(fw) {
  if (!(fw in EXPECTED_STORY_COUNT)) {
    fail(`usage: node scripts/provenance/validate-g3b-accessibility.mjs <ng|vue> (got "${fw}")`);
  }

  const baseline = parseBaselineFingerprints(readText(BASELINE_PATH, "baseline file"));
  const preexisting = parseBaselineFingerprints(readText(PREEXISTING_PATH, "pre-existing list"));
  const storyIds = g3bStoryIds(fw);

  const missing = [];
  const introduced = [];
  const observed = new Set();
  for (const storyId of storyIds) {
    for (const browser of BROWSERS) {
      const path = `test-results/accessibility/${fw}/${browser}/${storyId}.json`;
      if (!existsSync(path)) {
        missing.push(path);
        continue;
      }
      let envelope;
      try {
        envelope = JSON.parse(readFileSync(path, "utf8"));
      } catch (error) {
        fail(`envelope file at ${path} is not valid JSON: ${error.message}`);
      }
      if (envelope.componentStoryId !== storyId) {
        fail(`${path} has componentStoryId "${envelope.componentStoryId}", expected "${storyId}"`);
      }
      for (const violation of envelope.results?.violations || []) {
        for (const node of violation.nodes || []) {
          const fingerprint = computeFingerprint(storyId, violation, node);
          observed.add(fingerprint);
          if (!baseline.has(fingerprint) && !preexisting.has(fingerprint)) {
            introduced.push(`${fingerprint} (${browser})`);
          }
        }
      }
    }
  }

  const stale = [...preexisting].filter(
    (fingerprint) => fingerprint.split(":")[1].startsWith(`${fw}-`) && !observed.has(fingerprint)
  );
  for (const fingerprint of stale) {
    console.log(`${PREFIX} STALE (informational): ${fingerprint} is no longer observed`);
  }
  for (const path of missing) {
    console.error(`${PREFIX} MISSING REPORT: ${path}`);
  }
  for (const entry of introduced) {
    console.error(
      `${PREFIX} INTRODUCED VIOLATION: ${entry} — in neither ${BASELINE_PATH} nor ${PREEXISTING_PATH}`
    );
  }

  const expectedReports = storyIds.length * BROWSERS.length;
  if (missing.length > 0 || introduced.length > 0) {
    fail(
      `${missing.length} missing report(s) of ${expectedReports}, ${introduced.length} introduced violation node(s)`
    );
  }
  console.log(
    `${PREFIX} OK: ${fw} ${expectedReports}/${expectedReports} reports, 0 introduced violations, ${stale.length} stale pre-existing row(s)`
  );
}

main(process.argv[2]);
```

Run: `node --test scripts/provenance/validate-g3b-accessibility.test.mjs && pnpm run test:scripts`
Expected: 8/8 pass; `test:scripts` all pass (G3-A script tests included, unchanged).

- [ ] **Step 3: Post-port Docker run (the "after" state)**

```bash
git archive -o .superpowers/sdd/2026-10-05-gap-064-g3b-containers/docker/src.tar HEAD
docker run --rm -v "$PWD/.superpowers/sdd/2026-10-05-gap-064-g3b-containers/docker:/io" mcr.microsoft.com/playwright:v1.63.0-jammy bash /io/run.sh g3b
mkdir -p .superpowers/sdd/2026-10-05-gap-064-g3b-containers/docker/after
tar -xf .superpowers/sdd/2026-10-05-gap-064-g3b-containers/docker/g3b-results.tar -C .superpowers/sdd/2026-10-05-gap-064-g3b-containers/docker/after
git rev-parse --short HEAD
```

Expected: every **layout** and **accessibility** test passes; **visual** tests may fail with screenshot diffs only (reviewed in Task 9). A failing layout test is **UNEXPECTED**: stop and report. Record HEAD as `<afterSha>`.

- [ ] **Step 4: Derive the pre-existing evidence**

Write `.superpowers/sdd/2026-10-05-gap-064-g3b-containers/docker/fingerprints.mjs`:

```js
// GAP-064 G3-B: pre-existing = fingerprints observed both before and after the
// port (not in ACCESSIBILITY_BASELINE.md). Prints table rows on stdout; prints
// counts, INTRODUCED (after only) and FIXED (before only) on stderr.
// usage (repo root): node .superpowers/sdd/2026-10-05-gap-064-g3b-containers/docker/fingerprints.mjs <beforeRoot> <afterRoot> <beforeSha> <afterSha>
import {
  BASELINE_PATH,
  loadBaseline,
  readEnvelopes,
} from "../../../../scripts/provenance/validate-accessibility-baseline.mjs";

const [before, after, beforeSha, afterSha] = process.argv.slice(2);
const baseline = loadBaseline(BASELINE_PATH);
const collect = (root) => {
  const set = new Set();
  for (const fw of ["ng", "vue"])
    for (const entry of readEnvelopes(`${root}/test-results/accessibility/${fw}/**/*.json`))
      if (!baseline.has(entry.fingerprint)) set.add(entry.fingerprint);
  return set;
};
const b = collect(before);
const a = collect(after);
const pre = [...a].filter((f) => b.has(f)).sort();
const introduced = [...a].filter((f) => !b.has(f)).sort();
const fixed = [...b].filter((f) => !a.has(f)).sort();
console.error(
  `before ${b.size}, after ${a.size}, pre-existing ${pre.length}, introduced ${introduced.length}, fixed ${fixed.length}`
);
for (const f of introduced) console.error(`INTRODUCED ${f}`);
for (const f of fixed) console.error(`FIXED ${f}`);
for (const f of pre) {
  const [rule, story] = f.split(":");
  console.log(
    `| ${f} | ${rule} | ${story} | Pre-existing before the G3-B port (${beforeSha}) and still present after it (${afterSha}). |`
  );
}
```

Create `docs/architecture/research/2026-10-05-gap-064-g3b-accessibility-preexisting.md` (Write tool) with this header, filling the counts from the script's stderr:

```markdown
# GAP-064 G3-B — pre-existing accessibility violations on the G3-B verification stories

**Date:** <execution date>. **Type:** dated evidence (AGENTS.md tier 6). This file is **not** an accessibility baseline and not CI configuration.

## What this is

These are the <N> axe violation fingerprints (`rule:story:target`) that the 50 G3-B verification stories (ng 25, vue 25) show **before and after** the G3-B CSS port. They predate G3-B; the G3-B stories only expose them, because those story IDs were never scanned before.

- Derivation: the unique rows observed both in the pre-port run (`<beforeSha>`, Plan Task 2) and the post-port run (`<afterSha>`, Plan Task 8 Step 3). Both are Docker `mcr.microsoft.com/playwright:v1.63.0-jammy` runs of `packages/{ng,vue}/e2e/g3b-aura-styles.spec.ts`, recorded in `docs/superpowers/plans/2026-10-05-gap-064-g3b-visual-review.md`. Counts: before <B>, after <A>, pre-existing <N>, introduced <I>, fixed <F>.
- Consumer: `scripts/provenance/validate-g3b-accessibility.mjs` only. `validate-accessibility-baseline.mjs` and `validate-g3a-accessibility.mjs` never read it.
- Introduced rows are **not** listed here; they go to the Task 9 review gate, and only approved ones enter `ACCESSIBILITY_BASELINE.md`.
- Changes are human-authored, reviewed edits only. Remove a row once its debt is fixed (the check reports it as STALE). Never add a row to silence a violation introduced by a later change.

| Fingerprint | Rule | Component/Story | Note |
| ----------- | ---- | --------------- | ---- |
```

Then append the rows (literal path; append only):

```bash
node .superpowers/sdd/2026-10-05-gap-064-g3b-containers/docker/fingerprints.mjs \
  .superpowers/sdd/2026-10-05-gap-064-g3b-containers/docker/before \
  .superpowers/sdd/2026-10-05-gap-064-g3b-containers/docker/after <beforeSha> <afterSha> \
  >> docs/architecture/research/2026-10-05-gap-064-g3b-accessibility-preexisting.md
npx prettier --write docs/architecture/research/2026-10-05-gap-064-g3b-accessibility-preexisting.md
```

Save the stderr output (counts, INTRODUCED, FIXED) for Task 9.

- [ ] **Step 5: Run the validator on the after-state**

The validator reads `test-results/` relative to the repo root. If a local `test-results/` exists, first move it to `.superpowers/sdd/2026-10-05-gap-064-g3b-containers/local-test-results/` (never delete it), and move it back afterwards.

```bash
cp -R .superpowers/sdd/2026-10-05-gap-064-g3b-containers/docker/after/test-results test-results
node scripts/provenance/validate-g3b-accessibility.mjs ng; node scripts/provenance/validate-g3b-accessibility.mjs vue
rm -r test-results
```

(The `rm` removes only the copy made on the previous line.)

Expected: `75/75` reports per framework. Exit 0 if 0 introduced; otherwise exit 1 listing exactly the INTRODUCED rows of Step 4 — these go to Task 9, never into the evidence file.

- [ ] **Step 6: Wire CI (Spec §9.6)**

In `.github/workflows/ci.yml`, job `track-a-browser-visual-a11y`:

1. In the existing strict run step, change `--grep-invert "G3-A"` to `--grep-invert "G3-A|G3-B"`.
2. After the step `Upload G3-A accessibility reports (${{ matrix.framework }})`, add:

```yaml
# GAP-064 G3-B Spec §9: differential accessibility contract for the G3-B
# verification stories (same contract as G3-A, own story set and evidence
# list). The visual and layout tests in this run stay a hard gate.
- name: Run G3-B verification specs (${{ matrix.framework }})
  if: ${{ !cancelled() && matrix.framework != 'react' }}
  run: |
    npx playwright test packages/${{ matrix.framework }}/e2e/g3b-aura-styles.spec.ts \
      --project=${{ matrix.framework }}-chromium \
      --project=${{ matrix.framework }}-firefox \
      --project=${{ matrix.framework }}-webkit

- name: G3-B differential accessibility validation (${{ matrix.framework }})
  if: ${{ !cancelled() && matrix.framework != 'react' }}
  # An explicit bash shell adds pipefail, so the validator's exit code
  # survives the pipe into tee.
  shell: bash
  run: |
    mkdir -p test-results/g3b-accessibility
    node scripts/provenance/validate-g3b-accessibility.mjs ${{ matrix.framework }} 2>&1 \
      | tee test-results/g3b-accessibility/${{ matrix.framework }}-validation.txt

- name: Upload G3-B accessibility reports (${{ matrix.framework }})
  if: ${{ always() && matrix.framework != 'react' }}
  uses: actions/upload-artifact@v4
  with:
    name: g3b-accessibility-reports-${{ matrix.framework }}
    path: |
      test-results/accessibility/${{ matrix.framework }}/
      test-results/g3b-accessibility/
```

Nothing else in `ci.yml` changes; the G3-A steps stay byte-identical. Then:

```bash
actionlint .github/workflows/ci.yml
git diff -- .github/workflows/ci.yml
git diff --quiet fe86fe4 -- scripts/provenance/validate-g3a-accessibility.mjs scripts/provenance/validate-accessibility-baseline.mjs packages/themes/test/utils/g3a-port.mjs && echo "frozen tooling unchanged"
```

Expected: actionlint clean; only the one changed line plus the added steps; `frozen tooling unchanged`. The end-to-end CI simulation runs in Task 10 (after the baselines exist).

- [ ] **Step 7: Commit**

```bash
git add scripts/provenance/validate-g3b-accessibility.mjs scripts/provenance/validate-g3b-accessibility.test.mjs \
  docs/architecture/research/2026-10-05-gap-064-g3b-accessibility-preexisting.md .github/workflows/ci.yml
git commit -m "ci(gap-064): add the G3-B differential accessibility check"
```

---

### Task 9: Visual and accessibility review gate — HARD USER STOP

**Files:**

- Create: `docs/superpowers/plans/2026-10-05-gap-064-g3b-visual-review.md`
- Modify (only after approval): `packages/{ng,vue}/e2e/g3b-aura-styles.spec.ts-snapshots/*.png`; `docs/architecture/ACCESSIBILITY_BASELINE.md` (approved rows only)

- [ ] **Step 1: Existing regression suite (must stay clean)**

```bash
git archive -o .superpowers/sdd/2026-10-05-gap-064-g3b-containers/docker/src.tar HEAD
docker run --rm -v "$PWD/.superpowers/sdd/2026-10-05-gap-064-g3b-containers/docker:/io" mcr.microsoft.com/playwright:v1.63.0-jammy bash /io/run.sh regression
mkdir -p .superpowers/sdd/2026-10-05-gap-064-g3b-containers/docker/regression
tar -xf .superpowers/sdd/2026-10-05-gap-064-g3b-containers/docker/regression-results.tar -C .superpowers/sdd/2026-10-05-gap-064-g3b-containers/docker/regression
```

Expected: 0 failures apart from retry-passing flakes (record each). Includes G3-A and React (regression only). Any failure is **UNEXPECTED**: investigate, record, stop. Never update a regression baseline here.

- [ ] **Step 2: Write the review record**

`docs/superpowers/plans/2026-10-05-gap-064-g3b-visual-review.md`, sections:

1. Environment: image, architecture, Node, pnpm, `<beforeSha>`, `<afterSha>`.
2. Changed G3-B screenshots (Task 8 Step 3): per test and project, the expected/actual/diff paths under `docker/after/test-results/` and a one-line description of the visible change.
3. Unchanged G3-B screenshots: "identical" or "inside tolerance" (recorded explicitly).
4. Before-state evidence (Spec §4.3): Task 2's `layout-evidence.txt` — what each layout test measured before the port (BlockUI mask, ScrollPanel bars, Divider centring, …) — and the passing after results.
5. Regression run: pass/flaky/fail counts per project.
6. Accessibility: the Task 8 Step 4 counts; every INTRODUCED row (rule, story, target, browser, contrast ratio where axe reports one); FIXED rows.
7. C5 coverage checklist: which story exercises which D1/D3/D4/D5 rule family per key.
8. UNEXPECTED items with investigated causes.

Copy the diff PNGs into `.superpowers/sdd/2026-10-05-gap-064-g3b-containers/review/` so they survive later runs.

- [ ] **Step 3: STOP — user review**

Report the record and artifacts. Wait for explicit approval of (a) which screenshots to accept and (b) which INTRODUCED accessibility rows, if any, enter `ACCESSIBILITY_BASELINE.md`. A rejected change is a stop: no fix is attempted without a new decision. **No baseline or accessibility change happens without that approval.**

- [ ] **Step 4: Update only the approved baselines, in Docker**

With `<grep>` built from the approved titles (for example `"Ng/(Panel Default|Card Default) G3-B visual|Vue/(…) G3-B visual"`):

```bash
git archive -o .superpowers/sdd/2026-10-05-gap-064-g3b-containers/docker/src.tar HEAD
docker run --rm -v "$PWD/.superpowers/sdd/2026-10-05-gap-064-g3b-containers/docker:/io" mcr.microsoft.com/playwright:v1.63.0-jammy bash /io/run.sh update "<grep>"
tar -xf .superpowers/sdd/2026-10-05-gap-064-g3b-containers/docker/snapshots.tar -C .
git status --short
```

Expected: only approved PNGs modified. Add approved accessibility rows to `ACCESSIBILITY_BASELINE.md` in its existing format with the note `GAP-064 G3-B — upstream Aura parity exception (user-approved <date>)`.

Then stage, archive the staged tree (`git archive -o .superpowers/sdd/2026-10-05-gap-064-g3b-containers/docker/src.tar "$(git write-tree)"`) and re-run `g3b`: expected 0 failures.

- [ ] **Step 5: Commit**

```bash
git add packages/ng/e2e/g3b-aura-styles.spec.ts-snapshots packages/vue/e2e/g3b-aura-styles.spec.ts-snapshots \
  docs/superpowers/plans/2026-10-05-gap-064-g3b-visual-review.md
git add docs/architecture/ACCESSIBILITY_BASELINE.md   # only if approved rows were added
git commit -m "test(gap-064): accept reviewed G3-B screenshot baselines"
```

---

### Task 10: Final verification (C4, C8, C9, C10, CI simulation)

**Files:**

- Modify: `docs/superpowers/plans/2026-10-05-gap-064-g3b-visual-review.md` (append "Verification")

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

Expected: all pass (G3-A tests included).

- [ ] **Step 2: CI simulation (Spec §9.6) for all three frameworks**

```bash
git archive -o .superpowers/sdd/2026-10-05-gap-064-g3b-containers/docker/src.tar HEAD
for fw in ng vue react; do docker run --rm -v "$PWD/.superpowers/sdd/2026-10-05-gap-064-g3b-containers/docker:/io" mcr.microsoft.com/playwright:v1.63.0-jammy bash /io/run.sh ci $fw; done
```

Expected: for every framework, strict run and strict check exit 0; for ng and vue, G3-A run/check exit 0 (`93/93`, `102/102`) and G3-B run/check exit 0 (`75/75`). React runs only the strict steps.

- [ ] **Step 3: Scope and DOM (C4, C9)**

```bash
git diff fe86fe4 --name-only
git diff fe86fe4 --stat -- packages/react packages/react-core packages/uix-styled packages/uix-styles packages/themes/src packages/ng-core packages/vue-core
git diff fe86fe4 --quiet -- scripts/provenance/validate-g3a-accessibility.mjs scripts/provenance/validate-accessibility-baseline.mjs packages/themes/test/utils/g3a-port.mjs packages/ng/e2e/g3a-aura-styles.spec.ts packages/vue/e2e/g3a-aura-styles.spec.ts && echo "G3-A tooling unchanged"
```

Expected: the second command prints nothing; `G3-A tooling unchanged`; every path in the first is one of: the 20 style modules; the 4 key files; the stories and the two G3-B e2e specs with their snapshots; `packages/themes/test/{fixtures/primeuix-styles-g3b.json,utils/g3b-port.mjs,g3b-upstream-fidelity.test.ts}`; the 2 runtime specs; the 2 provenance files; the G3-B validator and its test; `.github/workflows/ci.yml`; `ACCESSIBILITY_BASELINE.md` (if approved); the research/spec/plan/record/evidence docs; `MIGRATION.md` (only if Task 11 is approved). Anything else: stop and report.

- [ ] **Step 4: Size gate (C8, hard stop)**

```bash
pnpm run build && pnpm run size:measure
node scripts/provenance/validate-bundle-size.mjs --base-ref fe86fe4
```

Record the result and the ng and vue rows. Any package it reports above 15%: **stop and report** — no split, override or `PERFORMANCE.md` edit. This check is **additional only**: the recorded Angular baseline is known to be stale (G3-A deferred limitation), so it is not the authoritative Angular growth gate. The authoritative gate for Angular and Vue is the direct `fe86fe4`-build vs current-build comparison below (Plan Review decision 2):

```bash
git worktree add .superpowers/sdd/2026-10-05-gap-064-g3b-containers/base fe86fe4
(cd .superpowers/sdd/2026-10-05-gap-064-g3b-containers/base && pnpm install --frozen-lockfile && pnpm run build && node scripts/provenance/measure-package-size.mjs | grep -E 'packages/(ng|vue) ')
node scripts/provenance/measure-package-size.mjs | grep -E 'packages/(ng|vue) '
git worktree remove .superpowers/sdd/2026-10-05-gap-064-g3b-containers/base
```

Expected: the `index.mjs gzip size` of `packages/ng` and `packages/vue` grows by at most 15% from the `fe86fe4` build. Above 15% for either: **hard stop** — report, and do not continue without explicit user authorization.

- [ ] **Step 5: Record and commit**

Append every result to the record's "Verification" section, including the pre-existing failures (`provenance:validate`, `lint`) with their causes.

```bash
git add docs/superpowers/plans/2026-10-05-gap-064-g3b-visual-review.md
git commit -m "docs(gap-064): record G3-B verification results"
```

---

### Task 11 (approved at Plan Review): `MIGRATION.md` note

Strictly limited to G3-B consumer-visible behaviour, API and CSS implications (Plan Review decision 3). No other `MIGRATION.md` edits.

**Files:**

- Modify: `docs/architecture/MIGRATION.md` §8 (append after the G3-A entry)

- [ ] **Step 1: Append**

```markdown
Added for GAP-064 G3-B (`feature/gap-064-g3b-containers`), same status — unreleased, no changesets:

- **`@ultimate/ng`, `@ultimate/vue` — Containers & Panels components now use their Aura tokens.** Accordion, BlockUI, Card, Divider, Fieldset, Inplace, Panel, ScrollPanel, Splitter and Toolbar now take their applicable structural styling from the upstream Aura styles (`@primeuix/styles` 2.0.3), mapped to Ultimate's existing DOM, and follow theme customization. Visual appearance changes accordingly; notably the BlockUI mask now covers its container, ScrollPanel bars use the upstream positioning, Divider content is centred, and the Toolbar no longer adds a gap inside its start/center/end groups. A small set of documented Ultimate-specific rules remains (Fieldset toggle button font/colour and toggle-icon sizing, Splitter gutter `touch-action`). The approved parity exceptions and feature exclusions are listed in the G3-B Spec (§5.5–§5.7). (GAP-064 G3-B; DOM and classes unchanged.)
- **Generated `<style>` keys changed** for BlockUI (`block-ui` → `blockui`) and ScrollPanel (`scroll-panel` → `scrollpanel`) in Angular and Vue; these keys are internal, not a supported contract.
```

- [ ] **Step 2: Check and commit**

```bash
npx prettier --check docs/architecture/MIGRATION.md
git add docs/architecture/MIGRATION.md
git commit -m "docs(gap-064): record G3-B consumer-visible changes in MIGRATION"
```

---

## Spec coverage

| Spec requirement                                                  | Plan                                                                        |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------- |
| §1/§4.1 scope: 10 keys, 20 style files                            | Global Constraints; Tasks 5–6                                               |
| §5.1 four key renames                                             | Tasks 5–6 Step 2; C1 in Task 4                                              |
| §5.2 mapping incl. attribute selectors, specificity               | `MAPPING` (Task 3); C3 static + state rows (Tasks 3–4)                      |
| §5.3 89 / 76 / 13 and exact exclusion set                         | `OMITTED`, `COUNTS`, `TOTALS` + tests (Task 3)                              |
| §5.4 canonical order D3 → D1 → D4 → D5                            | `expectedCss`; exactness test (Task 3)                                      |
| §5.5 PX-B1..B11 exact text                                        | `BASE_ROLE`, `INLINE_ROLE`, `RETAINED`, `MAPPING`; provenance list (Task 7) |
| §5.6 two unresolved tokens                                        | `UNRESOLVED`; C2 bidirectional (Task 4)                                     |
| §5.7 FX-B1..B8, FX-B8 outside the 89                              | `OMITTED` (D2), `BASE_EXCLUDED` (D6); tests (Task 3)                        |
| §5.8 provenance                                                   | Task 7                                                                      |
| §5.9 D1–D6 invariants                                             | Task 3 tests                                                                |
| §4.3 before-state as evidence                                     | Task 2 Step 2 (`layout-evidence.txt`); Task 9 record §4                     |
| §8 C1–C3                                                          | Tasks 3–4                                                                   |
| C4                                                                | Tasks 5–6 Step 4; Task 10 Step 3                                            |
| C5 (25 + 25 stories, hover screenshot, Docker before/after, gate) | Tasks 1, 2, 9                                                               |
| C6 (three browsers)                                               | Task 1 layout tests; run in Tasks 2, 8, 9, 10                               |
| C7 / §9 accessibility differential                                | Task 8; gate Task 9; CI simulation Task 10                                  |
| C8 size hard stop vs `fe86fe4`                                    | Task 6 Step 5 (early), Task 10 Step 4                                       |
| C9 scope, C10 regression                                          | Task 9 Step 1; Task 10                                                      |
| C11 provenance                                                    | Task 7                                                                      |
| §11 stop conditions                                               | Global Constraints "Stop rules"; per-step expectations                      |
| §13.8 MIGRATION at Plan Review                                    | Task 11 (approved)                                                          |

## Plan Review Decisions (2026-10-05, user)

The Plan is approved. Unchanged and still approved: the TDD order, the D1–D6 invariants, the 15% hard stop, the G3-A tooling freeze, three-browser verification, and every scope and stop condition.

1. **ScrollPanel hidden-state check: moved to the browser.** The C3 assertion for `u-scroll-panel-bar-hidden` runs in the Task 1 ScrollPanel layout test in all three browsers, where the rendered state can occur (jsdom has no layout, so `moveBar()` never adds the class there). This is a test-location correction only; the C3 behavioural requirement is unchanged.
2. **True size measurement: approved.** The direct `fe86fe4`-build vs current-build `index.mjs gzip` comparison for `packages/ng` and `packages/vue` (Task 10 Step 4) is the **authoritative** growth gate, with the same 15% hard stop. `validate-bundle-size.mjs --base-ref fe86fe4` stays as an additional check (Task 6 Step 5, Task 10 Step 4); because the recorded Angular baseline is stale, it is not the authoritative Angular gate.
3. **MIGRATION.md: Task 11 approved.** The G3-B consumer-facing note follows the G3-A pattern and is strictly limited to actual G3-B consumer-visible behaviour, API and CSS implications. No unrelated documentation cleanup.
4. **Expected before-state failures: approved.** The RED layout failures in Task 2 are explicit before-state evidence (Spec §4.3). Visual and accessibility tests must pass in that run. Tests are never weakened or altered to make the before-state run green.
5. **Execution method: subagent-driven** (`superpowers:subagent-driven-development`), with a fresh implementation and review cycle per task. The two hard gates are preserved:
   - no screenshot or accessibility baseline change before the explicit review gate (Task 9);
   - no continuation past any hard-stop condition without explicit user authorization.

Also recorded: `ci.yml` changes only in Task 8, and the branch is not pushed before Task 10, so no CI run sees the G3-B specs before their baselines and evidence exist.

**Next gate:** implementation authorization — not started.

## After this plan

Final Review and Closeout are a separate gate: GAP-064 progress note (G3-A, G3-B complete; G3-C..E open; status stays PARTIAL), the closeout record, and merge/push decisions.
