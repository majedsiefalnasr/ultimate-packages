# GAP-064 G3-A — Display (F5) and Feedback (F4) Aura Styles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hand-written CSS of 13 Angular and 14 Vue Display/Feedback components with the applicable `@primeuix/styles` 2.0.3 structural CSS, mapped to the existing Ultimate DOM, so that they render with their already-registered Aura tokens. Then verify the result with fidelity, runtime, screenshot and accessibility evidence.

**Architecture:**

- **One data module drives both the port and the verification.** `packages/themes/test/utils/g3a-port.mjs` holds the explicit mapping data (prefix renames, not-rendered classes, parity rewrites, retained rules and expected counts). It turns the committed upstream fixture into the exact rule list each style module must contain.
- **Static check (C3).** A themes test compares every style module's `css` against that list. Implementers paste the CLI output of the same module into the style files.
- **Runtime check (C1, C2, dynamic-class).** Per-framework specs mount the components and check the generated `<style>` keys, variable resolution, and the emitted dynamic classes.
- **Screenshots.** Baselines are recorded in Linux Docker before any CSS change, and updated only after the user's review gate.

**Tech Stack:** TypeScript 5.9, Angular (`@angular/build:unit-test`, Vitest, jsdom), Vue 3.5 (`@vue/test-utils`), Vitest, Storybook, Playwright 1.63, Docker `mcr.microsoft.com/playwright:v1.63.0-jammy`, pnpm 9.6.0.

**Spec:** `docs/superpowers/specs/2026-10-04-gap-064-g3a-display-feedback-design.md` (Approved; §13 decisions and clarifications). Research and decisions: `docs/architecture/research/2026-10-04-gap-064-g3-research.md` §11. ADR-051.

## Global Constraints

- **Immutable baseline:** `fa5c150` (local `main` after Tranche 1; the branch point) is the comparison point for every scope diff, size check and regression argument in this plan. `git fetch origin main` may only refresh remote metadata and never changes the baseline.
- **Node:** run every host command with Node 24.15.0: `export PATH=$HOME/.nvm/versions/node/v24.15.0/bin:$PATH`. Tests are per-package only.
- **Inventory.** 27 style files (13 Angular + 14 Vue) and 14 unique Aura keys:
  - `avatar`, `chip`, `tag`, `skeleton`, `overlaybadge`, `knob`, `progressbar`, `progressspinner`, `metergroup`, `timeline`, `terminal`, `message`, `toast`;
  - plus Vue-only `inlinemessage`.
- **Key renames (ADR-051).** Exactly 9 sites change their key literal, and nothing else changes at those sites:
  - Angular `overlay-badge`→`overlaybadge` (`overlay-badge/overlay-badge.ts:38`), `progress-bar`→`progressbar` (`progress-bar/progress-bar.ts:48`), `progress-spinner`→`progressspinner` (`progress-spinner/progress-spinner.ts:32`), `meter-group`→`metergroup` (`meter-group/meter-group.ts:60`);
  - Vue `overlaybadge` (`overlay-badge/BaseOverlayBadge.ts:19`), `progressbar` (`progress-bar/BaseProgressBar.ts:10`), `progressspinner` (`progress-spinner/BaseProgressSpinner.ts:11`), `metergroup` (`meter-group/BaseMeterGroup.ts:15`), `inlinemessage` (`inline-message/BaseInlineMessage.ts:22`).
- **C4 — DOM unchanged.** In existing component implementation files only the style module's `css` string and the 9 key literals change. Templates, `classes` resolvers and props/inputs/emits stay unchanged.
- **The CSS stays in each framework's own style module** (no `@ultimate/uix-styles` subpaths, no new exports). The Angular/Vue duplication is intentional.
- **C3 exactness.** Each style module's `css` is exactly the `g3a-port.mjs` expected list:
  1. every non-omitted upstream group — ported rules, adapted rules (PX-A1..A3) and used keyframes (renamed `p-`→`u-`) — **in upstream source order** (canonical ordering, Plan Review correction 3);
  2. then the retained rules PX-A4/PX-A5/PX-A6, in the exact order listed in Spec §5.3. A test proves these appended rules never redeclare a property of an upstream-derived rule on the same selector, so their position cannot change the cascade.

  No old hand-written CSS survives.

- **Stop rules.** Never edit `g3a-port.mjs` data, the exception lists or test expectations to make a check pass. If a check disagrees with the Spec, **stop and report**:
  - C2 unresolved variables;
  - a count mismatch;
  - a missing dynamic class;
  - an unexpected visual or accessibility change;
  - size above 15%;
  - a diff outside scope.
- **Screenshot policy (D-G3-7).** "Before" baselines are recorded in Docker before any CSS change. Default tolerance; tolerance is never tightened, and a change that stays inside the tolerance is recorded, not hidden. No baseline update without the user's visual/accessibility review gate. macOS screenshots are never used as baselines.
- **Accessibility.** No violation is pre-baselined. Only violations the user explicitly approves enter `ACCESSIBILITY_BASELINE.md`.
- **Out of scope:**
  - G3-B..E;
  - AvatarGroup;
  - Ripple;
  - DataTable/VirtualScroller, TabView/TabMenu;
  - React;
  - `@ultimate/themes` source and `@ultimate/uix-styled`/`uix-styles`;
  - the Tranche 1 follow-ups;
  - Timeline `align`;
  - provenance entries other than the 27 style files;
  - runtime JS additions;
  - unrelated CI failures; other GAPs.
- **Git.** Commits use Conventional Commits and end with the session attribution lines. Stage explicit paths (never `git add -A`). No push, no merge.
- **Pre-existing failures** are recorded, not fixed: `provenance:validate` (missing ng/vue entries), `lint` (60 problems on `main`), and the Prettier debt in `BLUEPRINT_GAPS.md`, `DECISIONS.md` and `ACCESSIBILITY_BASELINE.md`.

## Review Focus

1. **Toast centered positions.** These need both the retained offsets (`top: 50%; left: 50%`) and the ported upstream `transform`. If either is lost, the toast renders off-centre. Pinned by C3 exactness (Task 3) and the Toast position rows of the dynamic-class test (Task 4).
2. **Toast with several stacked messages.** The spacing comes only from the ported `.p-toast-message { margin }`, since the flex `gap` is dropped. Pinned by the six-message AllSeverities screenshot story (Tasks 1, 8).
3. **Skeleton with `animation="none"`.** There must be no animated `::after`, because the class `u-skeleton-wave` is absent and the animation lives only on `.u-skeleton-wave::after`. Pinned by the `animation: "none"` mount in C2 (Task 4) and by C3 (PX-A3).
4. **RTL direction.** The upstream `[dir='rtl'] .p-skeleton::after` and `:dir(rtl)` (overlaybadge, toast) groups must be ported and renamed, not dropped. Pinned by C3 exactness (Task 3).
5. **Determinate ProgressBar and horizontal MeterGroup (the default states).** These must get the adapted upstream groups even though they carry no state class. Pinned by C3 (PX-A1/A2 data) and by the Determinate/Default stories (Tasks 1, 8).

---

### Task 1: Verification-only stories and G3-A screenshot/accessibility specs

These are test infrastructure only (Spec §13.3); no component code changes. No baselines are recorded in this task (Task 2 does that, in Docker).

**Files:**

- Modify (append stories):
  - `packages/ng/src/avatar/avatar.stories.ts`, `packages/ng/src/tag/tag.stories.ts`, `packages/ng/src/message/message.stories.ts`, `packages/ng/src/timeline/timeline.stories.ts`, `packages/ng/src/toast/toast.stories.ts`;
  - `packages/vue/src/avatar/avatar.stories.ts`, `packages/vue/src/tag/tag.stories.ts`, `packages/vue/src/message/message.stories.ts`, `packages/vue/src/timeline/timeline.stories.ts`, `packages/vue/src/toast/toast.stories.ts`, `packages/vue/src/inline-message/inline-message.stories.ts`.
- Create: `packages/ng/e2e/g3a-aura-styles.spec.ts`, `packages/vue/e2e/g3a-aura-styles.spec.ts`

**Interfaces:**

- Produces: story exports `Xl`, `LocalImage` (Avatar), `AllSeverities` (Tag, Message, Toast, Vue InlineMessage) and `Horizontal` (Timeline), and the e2e test titles `<Fw>/<Story> G3-A visual` / `<Fw>/<Story> G3-A accessibility`. Tasks 2 and 8 run these specs.

- [ ] **Step 1: Angular stories**

Append to `packages/ng/src/avatar/avatar.stories.ts`:

```ts
/** GAP-064 G3-A verification story (Spec §13.3): extra-large size. */
export const Xl: Story = {
  args: { label: "AB", size: "xlarge" },
};

/** GAP-064 G3-A verification story: deterministic local image (no network). */
export const LocalImage: Story = {
  args: {
    image:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='64' height='64' fill='%2360a5fa'/></svg>",
  },
};
```

Append to `packages/ng/src/tag/tag.stories.ts`:

```ts
/** GAP-064 G3-A verification story: all six severities. */
export const AllSeverities: Story = {
  render: () => ({
    template: `
      <u-tag severity="success" value="Success"></u-tag>
      <u-tag severity="info" value="Info"></u-tag>
      <u-tag severity="warn" value="Warn"></u-tag>
      <u-tag severity="danger" value="Danger"></u-tag>
      <u-tag severity="secondary" value="Secondary"></u-tag>
      <u-tag severity="contrast" value="Contrast"></u-tag>
    `,
  }),
};
```

Append to `packages/ng/src/message/message.stories.ts`:

```ts
/** GAP-064 G3-A verification story: all six severities. */
export const AllSeverities: Story = {
  render: () => ({
    template: `
      <u-message severity="success">Success message</u-message>
      <u-message severity="info">Info message</u-message>
      <u-message severity="warn">Warn message</u-message>
      <u-message severity="error">Error message</u-message>
      <u-message severity="secondary">Secondary message</u-message>
      <u-message severity="contrast">Contrast message</u-message>
    `,
  }),
};
```

Append to `packages/ng/src/timeline/timeline.stories.ts`:

```ts
/** GAP-064 G3-A verification story: horizontal layout. */
export const Horizontal: Story = {
  render: () => ({
    props: { events: ["Ordered", "Shipped", "Delivered"] },
    template: `<u-timeline [value]="events" layout="horizontal">
      <ng-template #content let-event>{{ event }}</ng-template>
    </u-timeline>`,
  }),
};
```

Make `packages/ng/src/toast/toast.stories.ts` read exactly as follows. The `Default` story is unchanged; the imports and the host component are added.

```ts
import { AfterViewInit, ChangeDetectionStrategy, Component, inject } from "@angular/core";
import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { UToastService } from "@ultimate/ng-core";
import { UToast } from "./toast";

const meta: Meta<UToast> = {
  title: "Ng/Toast",
  component: UToast,
};

export default meta;
type Story = StoryObj<UToast>;

export const Default: Story = {
  render: () => ({ template: `<u-toast></u-toast>` }),
};

/**
 * GAP-064 G3-A verification story (Spec §13.3): six sticky messages, one per
 * severity, so the Toast CSS is actually exercised. Messages are added after
 * the first render (a macrotask) so the toast is subscribed and change
 * detection is not re-entered.
 */
@Component({
  standalone: true,
  selector: "u-toast-all-severities-story",
  imports: [UToast],
  template: `<u-toast></u-toast>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ToastAllSeveritiesStory implements AfterViewInit {
  private readonly toast = inject(UToastService);

  ngAfterViewInit(): void {
    setTimeout(() => {
      for (const severity of [
        "success",
        "info",
        "warn",
        "error",
        "secondary",
        "contrast",
      ] as const) {
        this.toast.add({
          severity,
          summary: `${severity} summary`,
          detail: `${severity} detail`,
          sticky: true,
        });
      }
    });
  }
}

export const AllSeverities: Story = {
  decorators: [moduleMetadata({ imports: [ToastAllSeveritiesStory] })],
  render: () => ({ template: `<u-toast-all-severities-story></u-toast-all-severities-story>` }),
};
```

The file's original doc comment, if it has one, stays above `const meta`.

- [ ] **Step 2: Vue stories**

Append to `packages/vue/src/avatar/avatar.stories.ts`:

```ts
/** GAP-064 G3-A verification story (Spec §13.3): extra-large size. */
export const Xl: Story = {
  args: { label: "AB", size: "xlarge" },
};

/** GAP-064 G3-A verification story: deterministic local image (no network). */
export const LocalImage: Story = {
  args: {
    image:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='64' height='64' fill='%2360a5fa'/></svg>",
  },
};
```

Append to `packages/vue/src/tag/tag.stories.ts`:

```ts
/** GAP-064 G3-A verification story: all six severities. */
export const AllSeverities: Story = {
  render: () => ({
    components: { UTag },
    template: `
      <UTag severity="success" value="Success" />
      <UTag severity="info" value="Info" />
      <UTag severity="warn" value="Warn" />
      <UTag severity="danger" value="Danger" />
      <UTag severity="secondary" value="Secondary" />
      <UTag severity="contrast" value="Contrast" />
    `,
  }),
};
```

Append to `packages/vue/src/message/message.stories.ts`. It uses the file's existing `UMessage` import.

```ts
/** GAP-064 G3-A verification story: all six severities. */
export const AllSeverities: Story = {
  render: () => ({
    components: { UMessage },
    template: `
      <UMessage severity="success">Success message</UMessage>
      <UMessage severity="info">Info message</UMessage>
      <UMessage severity="warn">Warn message</UMessage>
      <UMessage severity="error">Error message</UMessage>
      <UMessage severity="secondary">Secondary message</UMessage>
      <UMessage severity="contrast">Contrast message</UMessage>
    `,
  }),
};
```

Append to `packages/vue/src/inline-message/inline-message.stories.ts`. It uses the file's existing `UInlineMessage` import.

```ts
/** GAP-064 G3-A verification story: all six severities. */
export const AllSeverities: Story = {
  render: () => ({
    components: { UInlineMessage },
    template: `
      <UInlineMessage severity="success">Success</UInlineMessage>
      <UInlineMessage severity="info">Info</UInlineMessage>
      <UInlineMessage severity="warn">Warn</UInlineMessage>
      <UInlineMessage severity="error">Error</UInlineMessage>
      <UInlineMessage severity="secondary">Secondary</UInlineMessage>
      <UInlineMessage severity="contrast">Contrast</UInlineMessage>
    `,
  }),
};
```

Append to `packages/vue/src/timeline/timeline.stories.ts`:

```ts
/** GAP-064 G3-A verification story: horizontal layout. */
export const Horizontal: Story = {
  render: () => ({
    components: { UTimeline },
    setup: () => ({ events: ["Ordered", "Shipped", "Delivered"] }),
    template: `<UTimeline :value="events" layout="horizontal">
      <template #content="{ item }">{{ item }}</template>
    </UTimeline>`,
  }),
};
```

In `packages/vue/src/toast/toast.stories.ts`, make two changes:

1. Add these imports at the top:

   ```ts
   import { onMounted } from "vue";
   import { toastEventBus } from "@ultimate/vue-core";
   ```

2. Append:

   ```ts
   /**
    * GAP-064 G3-A verification story (Spec §13.3): six sticky messages, one per
    * severity. UToast is mounted (and listening) before the parent's onMounted.
    */
   export const AllSeverities: Story = {
     render: () => ({
       components: { UToast },
       setup() {
         onMounted(() => {
           for (const severity of ["success", "info", "warn", "error", "secondary", "contrast"]) {
             toastEventBus.emit("add", {
               severity,
               summary: `${severity} summary`,
               detail: `${severity} detail`,
               sticky: true,
             });
           }
         });
         return {};
       },
       template: `<UToast />`,
     }),
   };
   ```

- [ ] **Step 3: Angular e2e spec**

Create `packages/ng/e2e/g3a-aura-styles.spec.ts`:

```ts
import { expect, test } from "@playwright/test";
import { runAccessibilityScan, storyUrl } from "./accessibility-envelope";

/**
 * GAP-064 G3-A (Spec §8 C5/C6, §13.3–§13.4): screenshot and accessibility
 * coverage for every story that exercises changed G3-A CSS. Baselines are
 * recorded in Linux Docker before any CSS change (Plan Task 2). The CDN-based
 * Avatar "Image" story and the empty Toast "Default" story are deliberately
 * excluded; LocalImage and AllSeverities replace them in this contract.
 * Readiness uses toBeAttached() because some "before" roots have no size.
 */
const STORIES: ReadonlyArray<{ name: string; story: string; ready: string; count?: number }> = [
  { name: "Avatar Label", story: "ng-avatar--label", ready: ".u-avatar" },
  { name: "Avatar Icon", story: "ng-avatar--icon", ready: ".u-avatar" },
  { name: "Avatar Circle", story: "ng-avatar--circle", ready: ".u-avatar" },
  { name: "Avatar Large", story: "ng-avatar--large", ready: ".u-avatar" },
  { name: "Avatar Xl", story: "ng-avatar--xl", ready: ".u-avatar" },
  { name: "Avatar LocalImage", story: "ng-avatar--local-image", ready: ".u-avatar" },
  { name: "Chip Default", story: "ng-chip--default", ready: ".u-chip" },
  { name: "Chip WithIcon", story: "ng-chip--with-icon", ready: ".u-chip" },
  { name: "Chip Removable", story: "ng-chip--removable", ready: ".u-chip" },
  { name: "Tag Default", story: "ng-tag--default", ready: ".u-tag" },
  { name: "Tag Severity", story: "ng-tag--severity", ready: ".u-tag" },
  { name: "Tag AllSeverities", story: "ng-tag--all-severities", ready: ".u-tag", count: 6 },
  { name: "Skeleton Default", story: "ng-skeleton--default", ready: ".u-skeleton" },
  { name: "Skeleton Circle", story: "ng-skeleton--circle", ready: ".u-skeleton" },
  { name: "OverlayBadge Default", story: "ng-overlaybadge--default", ready: ".u-overlaybadge" },
  { name: "OverlayBadge DotOnly", story: "ng-overlaybadge--dot-only", ready: ".u-overlaybadge" },
  { name: "Knob Default", story: "ng-knob--default", ready: ".u-knob" },
  { name: "Knob NoValueText", story: "ng-knob--no-value-text", ready: ".u-knob" },
  { name: "Knob Readonly", story: "ng-knob--readonly", ready: ".u-knob" },
  {
    name: "ProgressBar Determinate",
    story: "ng-progressbar--determinate",
    ready: ".u-progress-bar",
  },
  {
    name: "ProgressBar Indeterminate",
    story: "ng-progressbar--indeterminate",
    ready: ".u-progress-bar",
  },
  {
    name: "ProgressSpinner Default",
    story: "ng-progressspinner--default",
    ready: ".u-progress-spinner",
  },
  { name: "MeterGroup Default", story: "ng-metergroup--default", ready: ".u-meter-group" },
  { name: "MeterGroup Vertical", story: "ng-metergroup--vertical", ready: ".u-meter-group" },
  { name: "Timeline Default", story: "ng-timeline--default", ready: ".u-timeline" },
  { name: "Timeline Horizontal", story: "ng-timeline--horizontal", ready: ".u-timeline" },
  { name: "Terminal Default", story: "ng-terminal--default", ready: ".u-terminal" },
  { name: "Message Default", story: "ng-message--default", ready: ".u-message" },
  { name: "Message Closable", story: "ng-message--closable", ready: ".u-message" },
  {
    name: "Message AllSeverities",
    story: "ng-message--all-severities",
    ready: ".u-message",
    count: 6,
  },
  {
    name: "Toast AllSeverities",
    story: "ng-toast--all-severities",
    ready: ".u-toast-message",
    count: 6,
  },
];

for (const { name, story, ready, count } of STORIES) {
  test(`Ng/${name} G3-A visual`, async ({ page }) => {
    await page.goto(storyUrl(story));
    if (count) await expect(page.locator(ready)).toHaveCount(count);
    else await expect(page.locator(ready).first()).toBeAttached();
    await expect(page).toHaveScreenshot();
  });

  test(`Ng/${name} G3-A accessibility`, async ({ page }, testInfo) => {
    await page.goto(storyUrl(story));
    if (count) await expect(page.locator(ready)).toHaveCount(count);
    else await expect(page.locator(ready).first()).toBeAttached();
    await runAccessibilityScan(page, testInfo, story);
  });
}
```

- [ ] **Step 4: Vue e2e spec**

Create `packages/vue/e2e/g3a-aura-styles.spec.ts`. It is the same as Step 3, except for the stories table and the `Vue/` test-title prefix:

```ts
import { expect, test } from "@playwright/test";
import { runAccessibilityScan, storyUrl } from "./accessibility-envelope";

/**
 * GAP-064 G3-A (Spec §8 C5/C6, §13.3–§13.4): screenshot and accessibility
 * coverage for every story that exercises changed G3-A CSS. Baselines are
 * recorded in Linux Docker before any CSS change (Plan Task 2). The CDN-based
 * Avatar "Image" story and the empty Toast "Default" story are deliberately
 * excluded; LocalImage and AllSeverities replace them in this contract.
 * Readiness uses toBeAttached() because some "before" roots have no size.
 */
const STORIES: ReadonlyArray<{ name: string; story: string; ready: string; count?: number }> = [
  { name: "Avatar Label", story: "vue-avatar--label", ready: ".u-avatar" },
  { name: "Avatar Icon", story: "vue-avatar--icon", ready: ".u-avatar" },
  { name: "Avatar Circle", story: "vue-avatar--circle", ready: ".u-avatar" },
  { name: "Avatar Large", story: "vue-avatar--large", ready: ".u-avatar" },
  { name: "Avatar Xl", story: "vue-avatar--xl", ready: ".u-avatar" },
  { name: "Avatar LocalImage", story: "vue-avatar--local-image", ready: ".u-avatar" },
  { name: "Chip Default", story: "vue-chip--default", ready: ".u-chip" },
  { name: "Chip WithIcon", story: "vue-chip--with-icon", ready: ".u-chip" },
  { name: "Chip Removable", story: "vue-chip--removable", ready: ".u-chip" },
  { name: "Tag Default", story: "vue-tag--default", ready: ".u-tag" },
  { name: "Tag Severity", story: "vue-tag--severity", ready: ".u-tag" },
  { name: "Tag AllSeverities", story: "vue-tag--all-severities", ready: ".u-tag", count: 6 },
  { name: "Skeleton Default", story: "vue-skeleton--default", ready: ".u-skeleton" },
  { name: "Skeleton Circle", story: "vue-skeleton--circle", ready: ".u-skeleton" },
  { name: "OverlayBadge Default", story: "vue-overlaybadge--default", ready: ".u-overlaybadge" },
  { name: "OverlayBadge DotOnly", story: "vue-overlaybadge--dot-only", ready: ".u-overlaybadge" },
  { name: "Knob Default", story: "vue-knob--default", ready: ".u-knob" },
  { name: "Knob NoValueText", story: "vue-knob--no-value-text", ready: ".u-knob" },
  { name: "Knob Readonly", story: "vue-knob--readonly", ready: ".u-knob" },
  {
    name: "ProgressBar Determinate",
    story: "vue-progressbar--determinate",
    ready: ".u-progress-bar",
  },
  {
    name: "ProgressBar Indeterminate",
    story: "vue-progressbar--indeterminate",
    ready: ".u-progress-bar",
  },
  {
    name: "ProgressSpinner Default",
    story: "vue-progressspinner--default",
    ready: ".u-progress-spinner",
  },
  { name: "MeterGroup Default", story: "vue-metergroup--default", ready: ".u-meter-group" },
  { name: "MeterGroup Vertical", story: "vue-metergroup--vertical", ready: ".u-meter-group" },
  { name: "Timeline Default", story: "vue-timeline--default", ready: ".u-timeline" },
  { name: "Timeline Horizontal", story: "vue-timeline--horizontal", ready: ".u-timeline" },
  { name: "Terminal Default", story: "vue-terminal--default", ready: ".u-terminal" },
  { name: "Message Default", story: "vue-message--default", ready: ".u-message" },
  { name: "Message Closable", story: "vue-message--closable", ready: ".u-message" },
  {
    name: "Message AllSeverities",
    story: "vue-message--all-severities",
    ready: ".u-message",
    count: 6,
  },
  {
    name: "InlineMessage Default",
    story: "vue-inlinemessage--default",
    ready: ".u-inline-message",
  },
  {
    name: "InlineMessage Success",
    story: "vue-inlinemessage--success",
    ready: ".u-inline-message",
  },
  {
    name: "InlineMessage AllSeverities",
    story: "vue-inlinemessage--all-severities",
    ready: ".u-inline-message",
    count: 6,
  },
  {
    name: "Toast AllSeverities",
    story: "vue-toast--all-severities",
    ready: ".u-toast-message",
    count: 6,
  },
];

for (const { name, story, ready, count } of STORIES) {
  test(`Vue/${name} G3-A visual`, async ({ page }) => {
    await page.goto(storyUrl(story));
    if (count) await expect(page.locator(ready)).toHaveCount(count);
    else await expect(page.locator(ready).first()).toBeAttached();
    await expect(page).toHaveScreenshot();
  });

  test(`Vue/${name} G3-A accessibility`, async ({ page }, testInfo) => {
    await page.goto(storyUrl(story));
    if (count) await expect(page.locator(ready)).toHaveCount(count);
    else await expect(page.locator(ready).first()).toBeAttached();
    await runAccessibilityScan(page, testInfo, story);
  });
}
```

- [ ] **Step 5: Confirm story IDs and readiness selectors**

1. Run `pnpm run build`.
2. Start the two Storybooks: `pnpm run storybook:ng -- --port=6001 --compodoc=false` and `pnpm --filter @ultimate/vue exec storybook dev -p 6003`.
3. Run:

   ```bash
   curl -s http://localhost:6001/index.json | node -e 'const j=JSON.parse(require("fs").readFileSync(0,"utf8"));console.log(Object.keys(j.entries).filter(k=>/^ng-(avatar|chip|tag|skeleton|overlaybadge|knob|progressbar|progressspinner|metergroup|timeline|terminal|message|toast)--/.test(k)).join("\n"))'
   curl -s http://localhost:6003/index.json | node -e 'const j=JSON.parse(require("fs").readFileSync(0,"utf8"));console.log(Object.keys(j.entries).filter(k=>/^vue-(avatar|chip|tag|skeleton|overlaybadge|knob|progressbar|progressspinner|metergroup|timeline|terminal|message|inlinemessage|toast)--/.test(k)).join("\n"))'
   ```

   Expected: every `story` ID in Steps 3–4 is listed. If an ID differs, use the listed ID and record the correction.

4. Open the two Toast AllSeverities stories (`ng-toast--all-severities`, `vue-toast--all-severities`) in a browser.

   Expected: six visible messages.

   If they don't render, or a readiness selector never matches its story's root (check against that component's `classes.root`), **stop and report**. Do not change component code.

5. Stop the Storybooks.

- [ ] **Step 6: Typecheck and commit**

Run: `pnpm --filter @ultimate/ng run typecheck && pnpm --filter @ultimate/vue run typecheck`
Expected: pass.

```bash
git add packages/ng/src/avatar/avatar.stories.ts packages/ng/src/tag/tag.stories.ts packages/ng/src/message/message.stories.ts packages/ng/src/timeline/timeline.stories.ts packages/ng/src/toast/toast.stories.ts packages/vue/src/avatar/avatar.stories.ts packages/vue/src/tag/tag.stories.ts packages/vue/src/message/message.stories.ts packages/vue/src/timeline/timeline.stories.ts packages/vue/src/toast/toast.stories.ts packages/vue/src/inline-message/inline-message.stories.ts packages/ng/e2e/g3a-aura-styles.spec.ts packages/vue/e2e/g3a-aura-styles.spec.ts
git commit -m "test(gap-064): add G3-A verification stories and screenshot/a11y specs"
```

---

### Task 2: Docker "before" baselines

This task records the pre-change state in Linux Docker (D-G3-7). It must run on a commit where no G3-A CSS has changed yet: HEAD after Task 1.

**Files:**

- Create (generated): `packages/ng/e2e/g3a-aura-styles.spec.ts-snapshots/*.png` (31 stories × 3 browsers = 93) and `packages/vue/e2e/g3a-aura-styles.spec.ts-snapshots/*.png` (34 × 3 = 102).

**Interfaces:**

- Produces: `/tmp/g3a-docker/run.sh`, with modes `before | stable | g3a | regression | update <grep>`. Task 8 reuses it: `g3a` for the targeted G3-A validation, `regression` for the existing suite.

- [ ] **Step 1: Write the container script**

```bash
mkdir -p /tmp/g3a-docker
cat > /tmp/g3a-docker/run.sh <<'EOF'
#!/bin/bash
# GAP-064 G3-A Docker runner (inside mcr.microsoft.com/playwright:v1.63.0-jammy).
# usage: bash /io/run.sh before|stable|g3a|regression|update "<grep>"
#   g3a        = TARGETED G3-A run: only the two g3a-aura-styles specs (visual + a11y), ng/vue projects.
#   regression = EXISTING suite: every other spec in all 9 Storybook projects (ng, vue AND react) plus the
#                3 SSR projects, with the G3-A specs excluded. React is regression coverage only —
#                React is out of G3-A scope and must show no change.
set -uo pipefail
export CI=true
mkdir -p /work && tar -xf /io/src.tar -C /work && cd /work
corepack enable >/dev/null && corepack prepare pnpm@9.6.0 --activate >/dev/null
echo "node $(node -v) pnpm $(pnpm -v) arch $(uname -m)"
pnpm install --frozen-lockfile > /io/install.log 2>&1 || { echo "install failed"; exit 1; }
pnpm run build > /io/build.log 2>&1 || { echo "build failed"; exit 1; }
SPECS="packages/ng/e2e/g3a-aura-styles.spec.ts packages/vue/e2e/g3a-aura-styles.spec.ts"
G3A="--project=ng-chromium --project=ng-firefox --project=ng-webkit --project=vue-chromium --project=vue-firefox --project=vue-webkit"
REGRESSION="$G3A --project=react-chromium --project=react-firefox --project=react-webkit --project=ng-ssr-chromium --project=react-ssr-chromium --project=vue-ssr-chromium"
SNAP="packages/ng/e2e/g3a-aura-styles.spec.ts-snapshots packages/vue/e2e/g3a-aura-styles.spec.ts-snapshots"
case "$1" in
  before)
    npx playwright test $SPECS $G3A -g "G3-A visual" --update-snapshots=missing --reporter=list > /io/before.log 2>&1; echo "before exit $?"
    tar -cf /io/snapshots.tar $SNAP ;;
  stable)
    npx playwright test $SPECS $G3A -g "G3-A visual" --reporter=list > /io/stable.log 2>&1; echo "stable exit $?" ;;
  g3a)
    npx playwright test $SPECS $G3A --reporter=list > /io/g3a.log 2>&1; echo "g3a exit $?"
    tar -cf /io/g3a-results.tar test-results ;;
  regression)
    npx playwright test $REGRESSION --grep-invert "G3-A" --reporter=list > /io/regression.log 2>&1; echo "regression exit $?"
    tar -cf /io/regression-results.tar test-results ;;
  update)
    npx playwright test $SPECS $G3A -g "$2" --update-snapshots=changed --reporter=list > /io/update.log 2>&1; echo "update exit $?"
    tar -cf /io/snapshots.tar $SNAP ;;
esac
EOF
```

- [ ] **Step 2: Record the "before" baselines**

```bash
git archive -o /tmp/g3a-docker/src.tar HEAD
docker run --rm -v /tmp/g3a-docker:/io mcr.microsoft.com/playwright:v1.63.0-jammy bash /io/run.sh before
tar -xf /tmp/g3a-docker/snapshots.tar -C .
git status --short | grep -c 'g3a-aura-styles.spec.ts-snapshots'
```

Expected: `before exit 0`, and 195 new PNGs (93 Angular + 102 Vue). The output starts with `node v24.x pnpm 9.6.0 arch aarch64` (or `x86_64`). Record the architecture.

- [ ] **Step 3: Prove stability in Docker, twice**

```bash
git add packages/ng/e2e/g3a-aura-styles.spec.ts-snapshots packages/vue/e2e/g3a-aura-styles.spec.ts-snapshots
git archive -o /tmp/g3a-docker/src.tar "$(git write-tree)"
docker run --rm -v /tmp/g3a-docker:/io mcr.microsoft.com/playwright:v1.63.0-jammy bash /io/run.sh stable
docker run --rm -v /tmp/g3a-docker:/io mcr.microsoft.com/playwright:v1.63.0-jammy bash /io/run.sh stable
```

Expected: `stable exit 0` twice.

If a story is flaky (for example an animation frame), **stop and report**. Do not mask regions, add thresholds, or retry until it passes.

- [ ] **Step 4: Commit**

```bash
git commit -m "test(gap-064): record G3-A pre-change baselines in Linux Docker"
```

---

### Task 3: Upstream fixture, port data module and static fidelity test (C3)

**Files:**

- Create: `packages/themes/test/fixtures/primeuix-styles-g3a.json`
- Create: `packages/themes/test/utils/g3a-port.mjs`
- Create: `packages/themes/test/g3a-upstream-fidelity.test.ts`

**Interfaces:**

- Produces from `g3a-port.mjs`:
  - `KEYS: string[]`;
  - `FRAMEWORK_KEYS: { ng: string[]; vue: string[] }`;
  - `DIRS: Record<string, string>`;
  - `RETAINED: Record<string, string[]>`;
  - `COUNTS: Record<string, [ported: number, omitted: number]>`;
  - `norm(css: string): string`;
  - `expected(key): { ordered: string[]; upstreamIndex: number[]; ported: string[]; keyframes: string[]; adapted: string[]; omitted: string[] }`, where `ordered` is the canonical upstream-source-order list, `upstreamIndex[i]` is the fixture group index of `ordered[i]`, and the other arrays are for counting only;
  - `expectedCss(key): string[]`, i.e. `ordered` followed by the retained rules;
  - `declarations(ruleText): { selector: string; props: string[] }`;
  - `actualRules(fw, key): string[]`.
- CLI: `node packages/themes/test/utils/g3a-port.mjs <ng|vue> <key>` prints the exact `css` body to paste (Tasks 5–6).

- [ ] **Step 1: Generate the fixture from the pinned tarball (no hand edits)**

```bash
mkdir -p /tmp/g3a-fixture
tar -xzf .vendor-cache/@primeuix__styles-2.0.3.tar.gz -C /tmp/g3a-fixture
node --input-type=module -e '
import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
const keys = ["avatar","chip","tag","skeleton","overlaybadge","knob","progressbar","progressspinner","metergroup","timeline","terminal","message","inlinemessage","toast"];
const modules = {};
for (const k of keys) modules[k] = (await import(pathToFileURL(`/tmp/g3a-fixture/package/dist/${k}/index.mjs`).href)).style;
const fixture = { _meta: {
  source: "@primeuix/styles@2.0.3 (MIT, https://github.com/primefaces/primeuix) - dist/<key>/index.mjs export style",
  method: "one-off script: dynamic import() of each dist/<key>/index.mjs from the pinned tarball .vendor-cache/@primeuix__styles-2.0.3.tar.gz; no hand edits",
  scope: "GAP-064 G3-A: the 14 unique Aura keys of F5 Display + F4 Feedback",
  purpose: "CI-runnable upstream structural CSS snapshot for the G3-A fidelity test. Test data only, not shipped source." }, modules };
writeFileSync("packages/themes/test/fixtures/primeuix-styles-g3a.json", JSON.stringify(fixture, null, 2) + "\n");
'
node -e 'const f=require("./packages/themes/test/fixtures/primeuix-styles-g3a.json");console.log(Object.keys(f.modules).length, Object.values(f.modules).every(s=>s.includes(".p-")))'
```

Expected: `14 true`.

- [ ] **Step 2: Create the port data module**

Create `packages/themes/test/utils/g3a-port.mjs`:

```js
/**
 * GAP-064 G3-A (Spec §4.3–§5.4, §13): the explicit upstream → Ultimate mapping
 * data, and the transform that turns the committed @primeuix/styles 2.0.3
 * fixture into the exact CSS each G3-A style module must contain. Used by
 * g3a-upstream-fidelity.test.ts (C3) and, as a CLI, to print the CSS to paste:
 *   node packages/themes/test/utils/g3a-port.mjs <ng|vue> <key>
 * Never edit this data to make a check pass (Plan stop rules).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const REPO = path.resolve(HERE, "../../../..");
const FIXTURE = JSON.parse(
  readFileSync(path.join(HERE, "../fixtures/primeuix-styles-g3a.json"), "utf8")
);

export const KEYS = [
  "avatar",
  "chip",
  "tag",
  "skeleton",
  "overlaybadge",
  "knob",
  "progressbar",
  "progressspinner",
  "metergroup",
  "timeline",
  "terminal",
  "message",
  "inlinemessage",
  "toast",
];
export const FRAMEWORK_KEYS = { ng: KEYS.filter((k) => k !== "inlinemessage"), vue: KEYS };

/** Ultimate component directory per Aura key (style file: <dir>/<dir>-style.ts). */
export const DIRS = {
  avatar: "avatar",
  chip: "chip",
  tag: "tag",
  skeleton: "skeleton",
  overlaybadge: "overlay-badge",
  knob: "knob",
  progressbar: "progress-bar",
  progressspinner: "progress-spinner",
  metergroup: "meter-group",
  timeline: "timeline",
  terminal: "terminal",
  message: "message",
  inlinemessage: "inline-message",
  toast: "toast",
};

/** §4.3 renamed class prefixes (Angular and Vue identical); every other `.p-X` maps to `.u-X`. */
const PREFIX_RENAMES = {
  progressbar: ["p-progressbar", "u-progress-bar"],
  progressspinner: ["p-progressspinner", "u-progress-spinner"],
  metergroup: ["p-metergroup", "u-meter-group"],
  inlinemessage: ["p-inlinemessage", "u-inline-message"],
};

/** §4.3 upstream classes Ultimate does not render; a group whose selector uses one is omitted (§5.4 FX-A1..A7). */
export const NOT_RENDERED = {
  avatar: ["p-avatar-group"],
  skeleton: ["p-skeleton-animation-none"],
  timeline: ["p-timeline-left", "p-timeline-right", "p-timeline-alternate", "p-timeline-bottom"],
  terminal: ["p-terminal-input"],
  message: [
    "p-message-content-wrapper",
    "p-message-close-icon",
    "p-message-outlined",
    "p-message-simple",
    "p-message-sm",
    "p-message-lg",
    "p-message-enter-active",
    "p-message-leave-active",
  ],
  inlinemessage: ["p-inlinemessage-icon-only"],
  toast: [
    "p-toast-message-icon",
    "p-toast-message-text",
    "p-toast-close-icon",
    "p-toast-message-enter-active",
    "p-toast-message-leave-active",
    "p-toast-message-leave-to",
  ],
};

/** §5.3 parity-exception selector rewrites PX-A1..A3, applied before renaming; a rewritten group is "adapted". */
const REWRITES = {
  progressbar: [
    [".p-progressbar-determinate", ".u-progress-bar:not(.u-progress-bar-indeterminate)"],
  ],
  metergroup: [
    [
      ".p-metergroup-label-list-horizontal",
      ".u-meter-group-label-list:not(.u-meter-group-label-list-vertical)",
    ],
    [".p-metergroup-horizontal", ".u-meter-group:not(.u-meter-group-vertical)"],
  ],
  skeleton: [[".p-skeleton::after", ".u-skeleton-wave::after"]],
};

/** §5.3 retained Ultimate-only rules PX-A4 (toast), PX-A5 (chip, terminal), PX-A6 (skeleton) — exact text, appended last. */
export const RETAINED = {
  toast: [
    ".u-toast { position: fixed; z-index: 1200; max-width: calc(100vw - 2rem); }",
    ".u-toast-top-right { top: 1rem; right: 1rem; }",
    ".u-toast-top-left { top: 1rem; left: 1rem; }",
    ".u-toast-bottom-right { bottom: 1rem; right: 1rem; }",
    ".u-toast-bottom-left { bottom: 1rem; left: 1rem; }",
    ".u-toast-top-center { top: 1rem; left: 50%; }",
    ".u-toast-bottom-center { bottom: 1rem; left: 50%; }",
    ".u-toast-center { top: 50%; left: 50%; }",
  ],
  chip: [".u-chip-label { line-height: 1.5; padding: 0.25rem 0; }"],
  terminal: [
    ".u-terminal-welcome-message { margin-bottom: 0.5rem; }",
    ".u-terminal-command { display: block; margin-bottom: 0.25rem; }",
  ],
  skeleton: [".u-skeleton { position: relative; }"],
};

/** Spec §4.4 counts [ported rule groups incl. adapted, omitted groups] — pins the data above. */
export const COUNTS = {
  avatar: [10, 5],
  chip: [7, 0],
  tag: [9, 0],
  skeleton: [4, 1],
  overlaybadge: [3, 0],
  knob: [5, 0],
  progressbar: [7, 0],
  progressspinner: [4, 0],
  metergroup: [17, 0],
  timeline: [18, 12],
  terminal: [5, 1],
  message: [25, 28],
  inlinemessage: [15, 1],
  toast: [36, 6],
};

/** Whitespace normalisation only; never touches parentheses or operators (calc() stays valid). */
export const norm = (css) =>
  css
    .replace(/\s+/g, " ")
    .replace(/\s*([{};])\s*/g, "$1")
    .trim();
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/** Top-level groups; @keyframes / @-webkit-keyframes are kept whole. Any other at-rule is an error. */
export function parseGroups(css) {
  const src = stripComments(css);
  const groups = [];
  let i = 0;
  while (i < src.length) {
    const open = src.indexOf("{", i);
    if (open < 0) {
      if (src.slice(i).trim()) throw new Error(`trailing CSS: ${src.slice(i).trim()}`);
      break;
    }
    let depth = 0;
    let j = open;
    for (; j < src.length; j++) {
      if (src[j] === "{") depth++;
      else if (src[j] === "}" && --depth === 0) break;
    }
    const head = src.slice(i, open).trim();
    if (head.startsWith("@") && !/^@(-webkit-)?keyframes\s/.test(head))
      throw new Error(`unexpected at-rule: ${head}`);
    groups.push({ head, body: src.slice(open + 1, j), keyframes: head.startsWith("@") });
    i = j + 1;
  }
  return groups;
}

const renameKeyframeRefs = (s) => s.replace(/\bp-([a-z0-9-]+)/g, "u-$1");

function mapSelector(key, selector) {
  let s = selector;
  let adapted = false;
  for (const [from, to] of REWRITES[key] ?? []) {
    if (s.includes(from)) {
      s = s.split(from).join(to);
      adapted = true;
    }
  }
  const pr = PREFIX_RENAMES[key];
  if (pr) s = s.replace(new RegExp(`\\.${pr[0]}(?![a-z0-9])`, "g"), `.${pr[1]}`);
  return { selector: s.replace(/\.p-/g, ".u-"), adapted };
}

/**
 * Canonical C3 ordering (Plan Review correction 3): `ordered` keeps the
 * UPSTREAM SOURCE ORDER of every non-omitted group — ported rules, adapted
 * (PX-A1..A3) rules and used keyframes interleaved exactly as upstream wrote
 * them — so the cascade between same-specificity rules is upstream's. The
 * category arrays (ported/adapted/keyframes/omitted) exist only for counting.
 */
export function expected(key) {
  const groups = parseGroups(FIXTURE.modules[key]);
  const ported = [];
  const adapted = [];
  const omitted = [];
  const mapped = []; // { kind: "rule" | "keyframes", index, text, name? } in upstream order
  for (const [index, g] of groups.entries()) {
    if (g.keyframes) {
      mapped.push({
        kind: "keyframes",
        index,
        name: renameKeyframeRefs(g.head.split(/\s+/)[1]),
        text: norm(`${renameKeyframeRefs(g.head)}{${g.body}}`),
      });
      continue;
    }
    const classes = [...g.head.matchAll(/\.(p-[a-z0-9-]+)/g)].map((m) => m[1]);
    if (classes.some((c) => (NOT_RENDERED[key] ?? []).includes(c))) {
      omitted.push(norm(g.head));
      continue;
    }
    const m = mapSelector(key, g.head);
    const text = norm(`${m.selector}{${renameKeyframeRefs(g.body)}}`);
    (m.adapted ? adapted : ported).push(text);
    mapped.push({ kind: "rule", index, text });
  }
  const used = [...ported, ...adapted].join("\n");
  const isUsed = (name) => new RegExp(`\\b${name}(?![a-z0-9-])`).test(used);
  const keyframes = mapped
    .filter((x) => x.kind === "keyframes" && isUsed(x.name))
    .map((x) => x.text);
  const kept = mapped.filter((x) => x.kind === "rule" || isUsed(x.name));
  return {
    ordered: kept.map((x) => x.text),
    upstreamIndex: kept.map((x) => x.index),
    ported,
    keyframes,
    adapted,
    omitted,
  };
}

/** The exact rule list of a style module: upstream-ordered port, then the retained rules (§5.3), in RETAINED order. */
export function expectedCss(key) {
  return [...expected(key).ordered, ...(RETAINED[key] ?? []).map(norm)];
}

/** Property names declared by a normalized rule text, keyed by selector. */
export function declarations(ruleText) {
  const open = ruleText.indexOf("{");
  const selector = ruleText.slice(0, open);
  const props = ruleText
    .slice(open + 1, -1)
    .split(";")
    .map((d) => d.split(":")[0].trim())
    .filter(Boolean);
  return { selector, props };
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
  if (!FRAMEWORK_KEYS[fw]?.includes(key))
    throw new Error(
      `usage: g3a-port.mjs <ng|vue> <key>; key one of ${FRAMEWORK_KEYS[fw ?? "vue"].join(", ")}`
    );
  console.log(expectedCss(key).join("\n"));
}
```

- [ ] **Step 3: Write the fidelity test**

Create `packages/themes/test/g3a-upstream-fidelity.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  COUNTS,
  FRAMEWORK_KEYS,
  KEYS,
  REPO,
  RETAINED,
  actualCssText,
  actualRules,
  declarations,
  expected,
  expectedCss,
  norm,
} from "./utils/g3a-port.mjs";
import fixture from "./fixtures/primeuix-styles-g3a.json";

/**
 * GAP-064 G3-A C3 (Spec §8, §13.6 A–F): every one of the 27 framework style
 * files (13 Angular + 14 Vue) contains exactly the ported, keyframe, adapted
 * and retained rules derived from the committed @primeuix/styles 2.0.3 fixture
 * of the 14 unique Aura keys — nothing more, nothing less.
 */
const CASES = (["ng", "vue"] as const).flatMap((fw) =>
  (FRAMEWORK_KEYS[fw] as string[]).map((key) => ({ fw, key }))
);

describe("G3-A upstream fixture", () => {
  it("covers the 14 unique G3-A keys and records its source", () => {
    expect(Object.keys(fixture.modules).sort()).toEqual([...KEYS].sort());
    expect(fixture._meta.source).toContain("@primeuix/styles@2.0.3");
  });

  it("pins the Spec §4.4 group counts", () => {
    for (const key of KEYS) {
      const e = expected(key);
      expect([e.ported.length + e.adapted.length, e.omitted.length], key).toEqual(COUNTS[key]);
    }
  });

  it("canonical order is upstream source order (Plan Review correction 3)", () => {
    for (const key of KEYS) {
      const e = expected(key);
      // `ordered` holds exactly the categorised groups, nothing more ...
      expect([...e.ordered].sort(), key).toEqual(
        [...e.ported, ...e.adapted, ...e.keyframes].sort()
      );
      // ... and every entry keeps its upstream position: source indices strictly increase.
      expect(e.upstreamIndex.length, key).toBe(e.ordered.length);
      e.upstreamIndex.forEach((idx: number, i: number) => {
        if (i > 0) expect(idx, `${key} entry ${i}`).toBeGreaterThan(e.upstreamIndex[i - 1]);
      });
    }
  });

  it("appended retained rules never redeclare a property of an upstream-derived rule on the same selector", () => {
    for (const key of KEYS) {
      const upstream = expected(key)
        .ordered.filter((r) => !r.startsWith("@"))
        .map(declarations);
      for (const retained of (RETAINED[key] ?? []).map(norm).map(declarations)) {
        const clash = upstream
          .filter((u) => u.selector === retained.selector)
          .flatMap((u) => u.props.filter((p) => retained.props.includes(p)));
        expect(clash, `${key} ${retained.selector}`).toEqual([]);
      }
    }
  });

  const vendor = join(REPO, ".vendor-extracted/uix-styles-full/src");
  describe.skipIf(!existsSync(vendor))("fixture vs .vendor-extracted source", () => {
    it.each(KEYS)("%s matches the vendored source", (key) => {
      const src = readFileSync(join(vendor, key, "index.ts"), "utf8");
      const css = (src.match(/\/\*css\*\/\s*`([\s\S]*?)`/) ?? [])[1] ?? "";
      expect(norm(css)).toBe(norm((fixture.modules as Record<string, string>)[key]));
    });
  });
});

describe.each(CASES)("$fw $key style module (C3)", ({ fw, key }) => {
  it("contains exactly the upstream-ordered port followed by the retained rules", () => {
    expect(actualRules(fw, key)).toEqual(expectedCss(key));
  });

  it("keeps no upstream p- name and no invented --u- variable outside the retained rules", () => {
    const css = norm(actualCssText(fw, key));
    expect(css).not.toMatch(/\bp-[a-z]/);
    const retained = (RETAINED[key] ?? []).join(" ");
    expect(retained).not.toMatch(/var\(/);
    expect(css).not.toMatch(/var\(--u-/); // ported CSS uses dt(); raw var() names are gone
  });

  it("ported structural CSS references at least one own token (C2 own-token invariant)", () => {
    const e = expected(key);
    expect([...e.ported, ...e.adapted].join(" ")).toContain(`dt('${key}.`);
  });
});
```

- [ ] **Step 4: Run it to verify it fails (RED)**

Run: `pnpm --filter @ultimate/themes test -- g3a-upstream-fidelity`
Expected:

- the fixture tests and the "own token" tests PASS;
- every "contains exactly" and "keeps no upstream p- name / invented variable" test FAILS for all 27 cases, because the current CSS is hand-written.

If "pins the Spec §4.4 group counts" fails, **stop and report** the key and the counts.

- [ ] **Step 5: Commit (red tests are committed deliberately; Tasks 5–6 turn them green)**

```bash
git add packages/themes/test/fixtures/primeuix-styles-g3a.json packages/themes/test/utils/g3a-port.mjs packages/themes/test/g3a-upstream-fidelity.test.ts
git commit -m "test(gap-064): add G3-A upstream fixture, port data and fidelity test"
```

---

### Task 4: Runtime tests: keys (C1), variable resolution (C2), dynamic classes (C3)

**Files:**

- Create: `packages/ng/src/g3a-aura-styles.spec.ts`
- Create: `packages/vue/src/g3a-aura-styles.spec.ts`

**Interfaces:**

- Consumes: the built `@ultimate/themes` (79 modules, current). The cores are unchanged.

- [ ] **Step 1: Angular spec**

Create `packages/ng/src/g3a-aura-styles.spec.ts`:

```ts
import { PLATFORM_ID, type Type } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { TestBed } from "@angular/core/testing";
import { beforeAll, describe, expect, it } from "vitest";
import { applyUltimateTheme } from "@ultimate/themes";
import { UToastService } from "@ultimate/ng-core";
import { UAvatar } from "./avatar";
import { UChip } from "./chip";
import { UTag } from "./tag";
import { USkeleton } from "./skeleton";
import { UOverlayBadge } from "./overlay-badge";
import { UKnob } from "./knob";
import { UProgressBar } from "./progress-bar";
import { UProgressSpinner } from "./progress-spinner";
import { UMeterGroup } from "./meter-group";
import { UTimeline } from "./timeline";
import { UTerminal } from "./terminal";
import { UMessage } from "./message";
import { UToast } from "./toast";

/**
 * GAP-064 G3-A (Spec §8 C1, C2, C3-dynamic). Assertions use the generated
 * <style data-u-ng-style> elements and the actually rendered DOM — not source
 * literals. Each mount uses a fresh document under a server PLATFORM_ID, which
 * gives it a fresh per-document style registry (GAP-078), as in Tranche 1.
 */
const KEY_ATTR = "data-u-ng-style";
const SEVERITIES = ["success", "info", "warn", "error", "secondary", "contrast"] as const;
const TAG_SEVERITIES = ["success", "info", "warn", "danger", "secondary", "contrast"] as const;
const POSITIONS = [
  "top-right",
  "top-left",
  "bottom-right",
  "bottom-left",
  "top-center",
  "bottom-center",
  "center",
] as const;

type Inputs = Record<string, unknown>;
interface Case {
  type: Type<unknown>;
  key: string;
  oldKey?: string;
  mounts: Inputs[];
}

const METER = [{ label: "Used", value: 40, color: "#34d399" }];
const CASES: Case[] = [
  {
    type: UAvatar,
    key: "avatar",
    mounts: [
      { label: "AB" },
      { label: "AB", size: "large", shape: "circle" },
      { label: "AB", size: "xlarge" },
    ],
  },
  { type: UChip, key: "chip", mounts: [{ label: "Chip" }, { label: "Chip", removable: true }] },
  {
    type: UTag,
    key: "tag",
    mounts: [
      { value: "T" },
      ...TAG_SEVERITIES.map((severity) => ({ value: "T", severity })),
      { value: "T", rounded: true },
    ],
  },
  { type: USkeleton, key: "skeleton", mounts: [{}, { shape: "circle" }, { animation: "none" }] },
  { type: UOverlayBadge, key: "overlaybadge", oldKey: "overlay-badge", mounts: [{ value: "2" }] },
  { type: UKnob, key: "knob", mounts: [{}] },
  {
    type: UProgressBar,
    key: "progressbar",
    oldKey: "progress-bar",
    mounts: [{ value: 40 }, { mode: "indeterminate" }],
  },
  { type: UProgressSpinner, key: "progressspinner", oldKey: "progress-spinner", mounts: [{}] },
  {
    type: UMeterGroup,
    key: "metergroup",
    oldKey: "meter-group",
    mounts: [{ value: METER }, { value: METER, orientation: "vertical" }],
  },
  {
    type: UTimeline,
    key: "timeline",
    mounts: [{ value: ["A", "B"] }, { value: ["A", "B"], layout: "horizontal" }],
  },
  { type: UTerminal, key: "terminal", mounts: [{ welcomeMessage: "Welcome" }] },
  {
    type: UMessage,
    key: "message",
    mounts: SEVERITIES.map((severity) => ({ severity, closable: true })),
  },
  { type: UToast, key: "toast", mounts: POSITIONS.map((position) => ({ position })) },
];

/**
 * Tranche 1 / GAP-078 isolation pattern: exactly ONE configureTestingModule +
 * createComponent per call, on a TestBed that has just been reset, with a new
 * Document injected as DOCUMENT. A new Document is a new per-document style
 * registry (ngCoreStyleSheetFor), so every mount starts with an empty <head>.
 * The explicit resetTestingModule() makes this independent of the builder's
 * own per-test teardown and is the only supported way to re-provide DOCUMENT.
 */
function mount(type: Type<unknown>, inputs: Inputs, toastMessages = false) {
  TestBed.resetTestingModule();
  const doc = document.implementation.createHTMLDocument("g3a");
  TestBed.configureTestingModule({
    providers: [
      { provide: DOCUMENT, useValue: doc },
      { provide: PLATFORM_ID, useValue: "server" },
    ],
  });
  const fixture = TestBed.createComponent(type);
  for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
  fixture.detectChanges();
  if (toastMessages) {
    const toast = TestBed.inject(UToastService);
    for (const severity of SEVERITIES) toast.add({ severity, summary: severity, sticky: true });
    fixture.detectChanges();
  }
  return { doc, el: fixture.nativeElement as HTMLElement };
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

const hasClass = (el: HTMLElement, cls: string) =>
  el.classList.contains(cls) || el.querySelector(`.${cls}`) !== null;

describe("GAP-064 G3-A — Angular", () => {
  beforeAll(() => applyUltimateTheme());

  describe.each(CASES)("$key", (c) => {
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

    it.each(c.mounts)(
      "resolves every referenced variable; exception list empty (C2) %o",
      (inputs) => {
        const { doc } = mount(c.type, inputs);
        expect(unresolved(doc, c.key)).toEqual([]);
        expect(cssFor(doc, c.key)).toContain(`var(--u-${c.key}-`);
      }
    );
  });

  it("toast with messages of all six severities resolves every variable (C2)", () => {
    const { doc } = mount(UToast, {}, true);
    expect(unresolved(doc, "toast")).toEqual([]);
  });

  it("isolates styles per document: two mounts, two registries, nothing in the global document", () => {
    const globalBefore = document.head.querySelectorAll(`style[${KEY_ATTR}="progressbar"]`).length;
    const first = mount(UProgressBar, { value: 40 }).doc;
    const second = mount(UProgressBar, { value: 40 }).doc;
    expect(first).not.toBe(second);
    expect(count(first, "progressbar")).toBe(1);
    expect(count(second, "progressbar")).toBe(1);
    expect(count(second, "progressbar-variables")).toBe(1);
    expect(document.head.querySelectorAll(`style[${KEY_ATTR}="progressbar"]`).length).toBe(
      globalBefore
    );
  });

  describe("dynamic classes are emitted and styled (C3, §13.6 A/F)", () => {
    const rows: Array<{
      type: Type<unknown>;
      key: string;
      inputs: Inputs;
      cls: string;
      toast?: boolean;
    }> = [
      ...POSITIONS.map((position) => ({
        type: UToast,
        key: "toast",
        inputs: { position },
        cls: `u-toast-${position}`,
      })),
      ...SEVERITIES.map((s) => ({
        type: UToast,
        key: "toast",
        inputs: {},
        cls: `u-toast-message-${s}`,
        toast: true,
      })),
      ...SEVERITIES.map((severity) => ({
        type: UMessage,
        key: "message",
        inputs: { severity },
        cls: `u-message-${severity}`,
      })),
      ...TAG_SEVERITIES.map((severity) => ({
        type: UTag,
        key: "tag",
        inputs: { value: "T", severity },
        cls: `u-tag-${severity}`,
      })),
      ...(["vertical", "horizontal"] as const).map((layout) => ({
        type: UTimeline,
        key: "timeline",
        inputs: { value: ["A"], layout },
        cls: `u-timeline-${layout}`,
      })),
    ];
    it.each(rows)("$cls", ({ type, key, inputs, cls, toast }) => {
      const { doc, el } = mount(type, inputs, toast);
      expect(hasClass(el, cls), "class emitted").toBe(true);
      expect(cssFor(doc, key), "selector styled").toContain(`.${cls}`);
    });
  });
});
```

- [ ] **Step 2: Vue spec**

Create `packages/vue/src/g3a-aura-styles.spec.ts`:

```ts
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick, type Component } from "vue";
import { applyUltimateTheme } from "@ultimate/themes";
import { toastEventBus, vueCoreStyleSheet } from "@ultimate/vue-core";
import { UAvatar } from "./avatar";
import { UChip } from "./chip";
import { UTag } from "./tag";
import { USkeleton } from "./skeleton";
import { UOverlayBadge } from "./overlay-badge";
import { UKnob } from "./knob";
import { UProgressBar } from "./progress-bar";
import { UProgressSpinner } from "./progress-spinner";
import { UMeterGroup } from "./meter-group";
import { UTimeline } from "./timeline";
import { UTerminal } from "./terminal";
import { UMessage } from "./message";
import { UInlineMessage } from "./inline-message";
import { UToast } from "./toast";

/**
 * GAP-064 G3-A (Spec §8 C1, C2, C3-dynamic) for Vue. Assertions use the
 * generated <style data-u-style> elements and the rendered DOM; the registry is
 * reset before every test, as in Tranche 1.
 */
const KEY_ATTR = "data-u-style";
const SEVERITIES = ["success", "info", "warn", "error", "secondary", "contrast"] as const;
const TAG_SEVERITIES = ["success", "info", "warn", "danger", "secondary", "contrast"] as const;
const POSITIONS = [
  "top-right",
  "top-left",
  "bottom-right",
  "bottom-left",
  "top-center",
  "bottom-center",
  "center",
] as const;

type Props = Record<string, unknown>;
interface Case {
  component: Component;
  key: string;
  oldKey?: string;
  mounts: Props[];
}

const METER = [{ label: "Used", value: 40, color: "#34d399" }];
const CASES: Case[] = [
  {
    component: UAvatar,
    key: "avatar",
    mounts: [
      { label: "AB" },
      { label: "AB", size: "large", shape: "circle" },
      { label: "AB", size: "xlarge" },
    ],
  },
  {
    component: UChip,
    key: "chip",
    mounts: [{ label: "Chip" }, { label: "Chip", removable: true }],
  },
  {
    component: UTag,
    key: "tag",
    mounts: [
      { value: "T" },
      ...TAG_SEVERITIES.map((severity) => ({ value: "T", severity })),
      { value: "T", rounded: true },
    ],
  },
  {
    component: USkeleton,
    key: "skeleton",
    mounts: [{}, { shape: "circle" }, { animation: "none" }],
  },
  {
    component: UOverlayBadge,
    key: "overlaybadge",
    oldKey: "overlay-badge",
    mounts: [{ value: "2" }],
  },
  { component: UKnob, key: "knob", mounts: [{}] },
  {
    component: UProgressBar,
    key: "progressbar",
    oldKey: "progress-bar",
    mounts: [{ value: 40 }, { mode: "indeterminate" }],
  },
  { component: UProgressSpinner, key: "progressspinner", oldKey: "progress-spinner", mounts: [{}] },
  {
    component: UMeterGroup,
    key: "metergroup",
    oldKey: "meter-group",
    mounts: [{ value: METER }, { value: METER, orientation: "vertical" }],
  },
  {
    component: UTimeline,
    key: "timeline",
    mounts: [{ value: ["A", "B"] }, { value: ["A", "B"], layout: "horizontal" }],
  },
  { component: UTerminal, key: "terminal", mounts: [{ welcomeMessage: "Welcome" }] },
  {
    component: UMessage,
    key: "message",
    mounts: SEVERITIES.map((severity) => ({ severity, closable: true })),
  },
  {
    component: UInlineMessage,
    key: "inlinemessage",
    oldKey: "inline-message",
    mounts: SEVERITIES.map((severity) => ({ severity })),
  },
  { component: UToast, key: "toast", mounts: POSITIONS.map((position) => ({ position })) },
];

async function render(component: Component, props: Props, toastMessages = false) {
  const wrapper = mount(component, { props });
  if (toastMessages) {
    for (const severity of SEVERITIES)
      toastEventBus.emit("add", { severity, summary: severity, sticky: true });
    await nextTick();
  }
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

const hasClass = (el: HTMLElement, cls: string) =>
  el.classList?.contains(cls) || el.querySelector?.(`.${cls}`) != null;

describe("GAP-064 G3-A — Vue", () => {
  beforeAll(() => applyUltimateTheme());
  beforeEach(() => {
    vueCoreStyleSheet.clear();
    styles().forEach((s) => s.remove());
    toastEventBus.emit("remove-all");
  });

  describe.each(CASES)("$key", (c) => {
    it("registers under the Aura key and never under an old key (C1)", async () => {
      await render(c.component, c.mounts[0]);
      expect(count(c.key)).toBe(1);
      expect(count(`${c.key}-variables`)).toBe(1);
      expect(cssFor(`${c.key}-variables`)).toContain(`--u-${c.key}-`);
      if (c.oldKey) {
        expect(count(c.oldKey)).toBe(0);
        expect(count(`${c.oldKey}-variables`)).toBe(0);
      }
    });

    it.each(c.mounts)(
      "resolves every referenced variable; exception list empty (C2) %o",
      async (props) => {
        await render(c.component, props);
        expect(unresolved(c.key)).toEqual([]);
        expect(cssFor(c.key)).toContain(`var(--u-${c.key}-`);
      }
    );
  });

  it("toast with messages of all six severities resolves every variable (C2)", async () => {
    await render(UToast, {}, true);
    expect(unresolved("toast")).toEqual([]);
  });

  describe("dynamic classes are emitted and styled (C3, §13.6 A/F)", () => {
    const rows: Array<{
      component: Component;
      key: string;
      props: Props;
      cls: string;
      toast?: boolean;
    }> = [
      ...POSITIONS.map((position) => ({
        component: UToast,
        key: "toast",
        props: { position },
        cls: `u-toast-${position}`,
      })),
      ...SEVERITIES.map((s) => ({
        component: UToast,
        key: "toast",
        props: {},
        cls: `u-toast-message-${s}`,
        toast: true,
      })),
      ...SEVERITIES.map((severity) => ({
        component: UMessage,
        key: "message",
        props: { severity },
        cls: `u-message-${severity}`,
      })),
      ...TAG_SEVERITIES.map((severity) => ({
        component: UTag,
        key: "tag",
        props: { value: "T", severity },
        cls: `u-tag-${severity}`,
      })),
      ...SEVERITIES.map((severity) => ({
        component: UInlineMessage,
        key: "inlinemessage",
        props: { severity },
        cls: `u-inline-message-${severity}`,
      })),
      ...(["vertical", "horizontal"] as const).map((layout) => ({
        component: UTimeline,
        key: "timeline",
        props: { value: ["A"], layout },
        cls: `u-timeline-${layout}`,
      })),
    ];
    it.each(rows)("$cls", async ({ component, key, props, cls, toast }) => {
      const el = await render(component, props, toast);
      expect(hasClass(el, cls), "class emitted").toBe(true);
      expect(cssFor(key), "selector styled").toContain(`.${cls}`);
    });
  });
});
```

- [ ] **Step 3: Run to verify they fail as expected (RED)**

Run:

- `pnpm --filter @ultimate/ng exec ng test --project=ng --include=src/g3a-aura-styles.spec.ts --watch=false`
- `pnpm --filter @ultimate/vue test -- g3a-aura-styles`

Expected RED:

- **C1** fails for the renamed keys: `overlaybadge`, `progressbar`, `progressspinner`, `metergroup`, and Vue `inlinemessage`. The Angular per-document isolation test also fails, because it counts the `progressbar` key, which isn't registered until Task 5. Its other assertions — two distinct documents, nothing written into the global document — must already hold. If they don't, **stop and report**: the isolation pattern itself would be broken.
- **C2** fails for every component whose current CSS references no `var(--u-<key>-…)`, or references invented names. That is most of the 27 cases, and toast/message/tag fail on invented names such as `--u-toast-info-bg`.
- **The dynamic "selector styled" rows** pass or fail depending on the current hand-written selectors.
- **Every "class emitted" assertion must PASS**, because the DOM is unchanged.

If a "class emitted" assertion fails, **stop and report**: the dynamic-class mapping in Spec §4.3 would be wrong. Record the RED counts.

- [ ] **Step 4: Commit**

```bash
git add packages/ng/src/g3a-aura-styles.spec.ts packages/vue/src/g3a-aura-styles.spec.ts
git commit -m "test(gap-064): add G3-A runtime key, variable and dynamic-class tests"
```

---

### Task 5: Angular port (13 style modules, 4 key renames)

**Files:**

- Modify: the `css` template in each of the 13 files `packages/ng/src/{avatar,chip,tag,skeleton,overlay-badge,knob,progress-bar,progress-spinner,meter-group,timeline,terminal,message,toast}/<dir>-style.ts`.
- Modify: the key literal at `packages/ng/src/overlay-badge/overlay-badge.ts:38`, `progress-bar/progress-bar.ts:48`, `progress-spinner/progress-spinner.ts:32` and `meter-group/meter-group.ts:60`.

**Interfaces:**

- Consumes: the `g3a-port.mjs` CLI (Task 3) and the tests (Tasks 3–4).

- [ ] **Step 1: Replace each Angular style module's CSS with the generated port**

For each key in `avatar chip tag skeleton overlaybadge knob progressbar progressspinner metergroup timeline terminal message toast`:

1. Run `node packages/themes/test/utils/g3a-port.mjs ng <key>`.
2. Replace the **entire content between the backticks** of `const css = /*css*/ \`…\`;` in that key's style module with the printed lines, verbatim.
3. Change nothing else in the file: not the doc comment, not `classes`, not the export. One small exception: in a doc comment that says the CSS is hand-written or that "no `@ultimate/uix-styles/<x>` entry exists yet", add the single sentence `GAP-064 G3-A: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3a-port.mjs).`

- [ ] **Step 2: Rename the four Angular keys**

Change only the string literal of `protected override readonly componentName = "…";`:

- `overlay-badge`→`overlaybadge`;
- `progress-bar`→`progressbar`;
- `progress-spinner`→`progressspinner`;
- `meter-group`→`metergroup`.

Then run:

```bash
grep -rnE 'componentName = "(overlay-badge|progress-bar|progress-spinner|meter-group)"' packages/ng/src
```

Expected: no output.

- [ ] **Step 3: Run the Angular checks (GREEN)**

Run:

- `pnpm --filter @ultimate/themes test -- g3a-upstream-fidelity`. Expected: all 13 `ng …` cases pass. The `vue …` cases still fail until Task 6.
- `pnpm --filter @ultimate/ng exec ng test --project=ng --include=src/g3a-aura-styles.spec.ts --watch=false`. Expected: all pass.

If a C2 case reports an unresolved variable, a dynamic row fails, or a fidelity case fails after a verbatim paste, **stop and report** the case and the diff. Do not edit the test data.

- [ ] **Step 4: Full Angular suites, typecheck and DOM-unchanged check**

Run: `pnpm --filter @ultimate/ng test --watch=false && pnpm --filter @ultimate/ng run typecheck`
Expected: pass.

Then run:

```bash
git diff -U0 -- packages/ng/src | grep -E '^[+-][^+-]' | grep -vE '^[+-]\s*(\.|\[|@|0%|[0-9]+%|from|to|\}|[a-z-]+:)' | grep -vE 'componentName = "|GAP-064 G3-A: the css below'
```

Expected: no output. Only CSS lines, the 4 key literals and the one-sentence comment changed (C4).

- [ ] **Step 5: Commit**

```bash
git add packages/ng/src/{avatar,chip,tag,skeleton,overlay-badge,knob,progress-bar,progress-spinner,meter-group,timeline,terminal,message,toast}
git commit -m "feat(ng): use upstream Aura structural CSS for G3-A display and feedback components (GAP-064)"
```

---

### Task 6: Vue port (14 style modules, 5 key renames)

**Files:**

- Modify: the `css` template in each of the 14 files `packages/vue/src/{avatar,chip,tag,skeleton,overlay-badge,knob,progress-bar,progress-spinner,meter-group,timeline,terminal,message,inline-message,toast}/<dir>-style.ts`.
- Modify: the key literal at `packages/vue/src/overlay-badge/BaseOverlayBadge.ts:19`, `progress-bar/BaseProgressBar.ts:10`, `progress-spinner/BaseProgressSpinner.ts:11`, `meter-group/BaseMeterGroup.ts:15` and `inline-message/BaseInlineMessage.ts:22`.

**Interfaces:**

- Consumes: the `g3a-port.mjs` CLI and the tests.

- [ ] **Step 1: Replace each Vue style module's CSS with the generated port**

For each key in `avatar chip tag skeleton overlaybadge knob progressbar progressspinner metergroup timeline terminal message inlinemessage toast`:

1. Run `node packages/themes/test/utils/g3a-port.mjs vue <key>`.
2. Replace the entire content between the backticks of that key's `css` template, verbatim.
3. Change nothing else in the file, except for adding the same one-sentence comment as in Task 5 Step 1 where a doc comment says the CSS is hand-written.

- [ ] **Step 2: Rename the five Vue keys**

Change only the literal in `createBaseComponent({ componentName: "…", … })`:

- `overlay-badge`→`overlaybadge`;
- `progress-bar`→`progressbar`;
- `progress-spinner`→`progressspinner`;
- `meter-group`→`metergroup`;
- `inline-message`→`inlinemessage`.

Then run:

```bash
grep -rnE '(componentName:\s*|registerComponentStyle\()"(overlay-badge|progress-bar|progress-spinner|meter-group|inline-message)"' packages/vue/src
```

Expected: no output.

- [ ] **Step 3: Run the Vue checks (GREEN)**

Run:

- `pnpm --filter @ultimate/themes test -- g3a-upstream-fidelity`. Expected: all 27 cases pass.
- `pnpm --filter @ultimate/vue test -- g3a-aura-styles`. Expected: all pass.

The stop rule from Task 5 Step 3 applies.

- [ ] **Step 4: Full Vue suite, typecheck and DOM-unchanged check**

Run: `pnpm --filter @ultimate/vue test && pnpm --filter @ultimate/vue run typecheck`
Expected: pass.

Then run the Task 5 Step 4 diff filter on `packages/vue/src`, extended to allow the Vue key form:

```bash
git diff -U0 -- packages/vue/src | grep -E '^[+-][^+-]' | grep -vE '^[+-]\s*(\.|\[|@|0%|[0-9]+%|from|to|\}|[a-z-]+:)' | grep -vE 'componentName: "|GAP-064 G3-A: the css below'
```

Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add packages/vue/src/{avatar,chip,tag,skeleton,overlay-badge,knob,progress-bar,progress-spinner,meter-group,timeline,terminal,message,inline-message,toast}
git commit -m "feat(vue): use upstream Aura structural CSS for G3-A display and feedback components (GAP-064)"
```

---

### Task 7: Provenance for the 27 style files

**Files:**

- Modify: `docs/architecture/provenance/ng.json` (13 entries) and `docs/architecture/provenance/vue.json` (14 entries).

- [ ] **Step 1: Add the entries (scripted; additions only)**

```bash
node --input-type=module -e '
import { readFileSync, writeFileSync } from "node:fs";
const shared = ["avatar:avatar","chip:chip","tag:tag","skeleton:skeleton","overlay-badge:overlaybadge","knob:knob","progress-bar:progressbar","progress-spinner:progressspinner","meter-group:metergroup","timeline:timeline","terminal:terminal","message:message","toast:toast"];
const lists = { ng: shared, vue: [...shared, "inline-message:inlinemessage"] };
const EXC = { skeleton: "PX-A3, PX-A6, FX-A2", progressbar: "PX-A1", metergroup: "PX-A2", toast: "PX-A4, FX-A7", chip: "PX-A5", terminal: "PX-A5, FX-A4", avatar: "FX-A1", timeline: "FX-A3", message: "FX-A5", inlinemessage: "FX-A6" };
for (const [fw, list] of Object.entries(lists)) {
  const path = `docs/architecture/provenance/${fw}.json`;
  const entries = JSON.parse(readFileSync(path, "utf8"));
  for (const item of list) {
    const [dir, key] = item.split(":");
    const dest = `packages/${fw}/src/${dir}/${dir}-style.ts`;
    if (entries.some((e) => e.ultimateDestination === dest)) throw new Error(`${dest} already recorded`);
    entries.push({
      originalPath: `src/${key}/index.ts`,
      ultimateDestination: dest,
      modificationStatus: "reference-derived",
      modificationDescription: `Ported (Option B — reference, not verbatim copy) from @primeuix/styles@2.0.3 ${key}, selectors adapted to Ultimate'"'"'s DOM per the GAP-064 G3-A mapping (packages/themes/test/utils/g3a-port.mjs); exceptions ${EXC[key] ?? "none"}.`,
    });
  }
  writeFileSync(path, JSON.stringify(entries, null, 2) + "\n");
}
'
git diff --numstat docs/architecture/provenance/ng.json docs/architecture/provenance/vue.json
```

Expected: additions only (13 and 14 entries). Both files already round-trip through `JSON.stringify(…, null, 2)`; if the numstat shows deletions, **stop and report**.

- [ ] **Step 2: Validate and commit**

Run: `pnpm run provenance:validate`
Expected: it still fails, but **only** on files outside the 27. Its first failure must not name any G3-A style file. Record the message.

```bash
git add docs/architecture/provenance/ng.json docs/architecture/provenance/vue.json
git commit -m "docs(gap-064): record provenance for the G3-A style modules"
```

---

### Task 8: Visual and accessibility review gate — HARD USER STOP

**Files:**

- Create: `docs/superpowers/plans/2026-10-04-gap-064-g3a-visual-review.md` (record)
- Modify (only after approval): `packages/{ng,vue}/e2e/g3a-aura-styles.spec.ts-snapshots/*.png`, and `docs/architecture/ACCESSIBILITY_BASELINE.md` (approved rows only)

- [ ] **Step 1a: Targeted G3-A run (the intended changes)**

```bash
git archive -o /tmp/g3a-docker/src.tar HEAD
docker run --rm -v /tmp/g3a-docker:/io mcr.microsoft.com/playwright:v1.63.0-jammy bash /io/run.sh g3a
mkdir -p /tmp/g3a-docker/g3a && tar -xf /tmp/g3a-docker/g3a-results.tar -C /tmp/g3a-docker/g3a
```

This runs only the two `g3a-aura-styles` specs (visual + accessibility) on the ng and vue projects.

Expected:

- screenshot mismatches only in "G3-A visual" tests — the G3-A changes under review;
- every "G3-A accessibility" test runs and writes its envelope.

Any non-screenshot failure, apart from a retry-passing flake, is **UNEXPECTED**.

- [ ] **Step 1b: Existing regression suite (must stay clean)**

```bash
docker run --rm -v /tmp/g3a-docker:/io mcr.microsoft.com/playwright:v1.63.0-jammy bash /io/run.sh regression
mkdir -p /tmp/g3a-docker/regression && tar -xf /tmp/g3a-docker/regression-results.tar -C /tmp/g3a-docker/regression
```

This runs every **existing** spec in all 9 Storybook projects (ng, vue, react × chromium/firefox/webkit) plus the 3 SSR projects, with the G3-A specs excluded (`--grep-invert "G3-A"`). React is **regression coverage only**: React is out of G3-A scope, has no G3-A changes, and must show none.

Expected: **0 failures**, apart from retry-passing flakes (record each). Any screenshot or test failure here is **UNEXPECTED**: an existing baseline changed, or a regression elsewhere. Investigate and record it. Never update a regression-suite baseline in this task.

- [ ] **Step 2: Accessibility, both runs**

- Targeted G3-A envelopes (ng, vue):

  ```bash
  node scripts/provenance/validate-accessibility-baseline.mjs --check "/tmp/g3a-docker/g3a/test-results/accessibility/<ng|vue>/**/*.json"
  ```

- Existing-suite envelopes (ng, vue, react — regression):

  ```bash
  node scripts/provenance/validate-accessibility-baseline.mjs --check "/tmp/g3a-docker/regression/test-results/accessibility/<ng|vue|react>/**/*.json"
  ```

Expected:

- the regression set reports OK for all three frameworks;
- the G3-A set may report new violations, which are recorded verbatim (rule, story, target, ratio) for the review gate.

Do not change `ACCESSIBILITY_BASELINE.md`.

- [ ] **Step 3: Write the review record**

Create `docs/superpowers/plans/2026-10-04-gap-064-g3a-visual-review.md` with these sections:

1. Environment: image, architecture, Node, pnpm, durations.
2. Targeted G3-A run (Step 1a). Changed G3-A screenshots: per test, the project, the paths of the expected/actual/diff images under `/tmp/g3a-docker/g3a/test-results/`, and a one-line description of the visible change.
3. Unchanged G3-A screenshots. For each, state whether the change is "inside tolerance" (record it explicitly) or truly identical.
4. Existing regression suite (Step 1b): pass/flaky/fail counts per project, including React (regression only), and every flake.
5. UNEXPECTED items from either run, each with its investigated cause.
6. Accessibility results, targeted and regression separately.
7. The C5 coverage checklist: which story exercises which ported/adapted/retained group family.

Copy the PNG artifacts into the git-ignored SDD workspace so they survive later runs.

- [ ] **Step 4: STOP — user review**

Report the record and the artifacts. Wait for explicit approval of:

- (a) which baselines to update;
- (b) any accessibility rows.

**No baseline or accessibility change happens without that approval.**

- [ ] **Step 5: Update only the approved baselines, in Docker**

With `<grep>` built from the approved test titles (for example `"Ng/(Tag AllSeverities|Message Default) G3-A visual|Vue/(…) G3-A visual"`):

```bash
git archive -o /tmp/g3a-docker/src.tar HEAD
docker run --rm -v /tmp/g3a-docker:/io mcr.microsoft.com/playwright:v1.63.0-jammy bash /io/run.sh update "<grep>"
tar -xf /tmp/g3a-docker/snapshots.tar -C .
git status --short
```

Expected: only approved PNGs are modified. Add any approved accessibility rows to `ACCESSIBILITY_BASELINE.md`, in its existing format, with the note `GAP-064 G3-A — upstream Aura parity exception (user-approved <date>)`.

Then, on an export that includes these changes (`git archive -o /tmp/g3a-docker/src.tar "$(git write-tree)"` after staging them), re-run:

- **Step 1a (`g3a`).** Expected: 0 failures.
- **Step 1b (`regression`).** Expected: still 0 failures, apart from retry-passing flakes.
- **Step 2, both sets.** Expected: ng/vue/react OK.

- [ ] **Step 6: Commit**

```bash
git add packages/ng/e2e/g3a-aura-styles.spec.ts-snapshots packages/vue/e2e/g3a-aura-styles.spec.ts-snapshots docs/superpowers/plans/2026-10-04-gap-064-g3a-visual-review.md
git add docs/architecture/ACCESSIBILITY_BASELINE.md   # only if approved rows were added
git commit -m "test(gap-064): accept reviewed G3-A screenshot baselines"
```

---

### Task 9: Final verification (C4, C7, C8, C9)

**Files:**

- Modify: `docs/superpowers/plans/2026-10-04-gap-064-g3a-visual-review.md` (append a "Verification" section)

- [ ] **Step 1: Suites, typecheck and SSR**

Run each of:

- `pnpm --filter @ultimate/uix-styled test`
- `pnpm --filter @ultimate/themes test`
- `pnpm --filter @ultimate/vue-core test`
- `pnpm --filter @ultimate/vue test`
- `pnpm --filter @ultimate/react test`
- `pnpm --filter @ultimate/ng test --watch=false`
- `pnpm --filter @ultimate/ng-core test --watch=false`
- `pnpm run typecheck`
- `pnpm --filter-prod "playground-angular..." run build && TRACK_E_SSR_FRAMEWORK=ng npx playwright test --project=ng-ssr-chromium`

Expected: all pass.

- [ ] **Step 2: Scope and DOM checks (C4, C8)**

Run:

```bash
git diff fa5c150 --name-only
git diff fa5c150 --stat -- packages/react packages/react-core packages/uix-styled packages/uix-styles packages/themes/src packages/ng-core packages/vue-core
```

Expected:

- The second command prints nothing.
- Every path in the first output is one of:
  - the 27 style modules;
  - the 9 key files;
  - the stories and e2e specs (and their snapshots);
  - `packages/themes/test/**` (the fixture, `g3a-port.mjs` and the fidelity test);
  - the 2 runtime specs;
  - the 2 provenance files;
  - `ACCESSIBILITY_BASELINE.md` (if approved);
  - the research/spec/plan/record docs.

Anything else: **stop and report**.

- [ ] **Step 3: Size gate (C7)**

The **immutable baseline for G3-A is `fa5c150`**: local `main` after GAP-064 Tranche 1 and the branch point. Every scope, size and regression comparison in this plan uses it explicitly. `git fetch origin main` may be run only to refresh remote metadata, never to choose the baseline. `origin/main` (still `f05bd9b`, before Tranche 1) is **not** the comparison point. The npm script `size:validate` defaults to `--base-ref origin/main`, so call the validator directly with the pinned ref:

```bash
pnpm run build && pnpm run size:measure
node scripts/provenance/validate-bundle-size.mjs --base-ref fa5c150
```

Expected: pass. Record the per-package change for ng and vue against `fa5c150`. If any package is above 15%, **stop and report**; no override, and no `PERFORMANCE.md` edit.

- [ ] **Step 4: Record and commit**

Append every result to the record's "Verification" section, including the pre-existing failures (`provenance:validate`, `lint`), each with its cause.

```bash
git add docs/superpowers/plans/2026-10-04-gap-064-g3a-visual-review.md
git commit -m "docs(gap-064): record G3-A verification results"
```

---

### Task 10 (only if approved at Plan Review): `MIGRATION.md` note

**Files:**

- Modify: `docs/architecture/MIGRATION.md` §8 (append)

- [ ] **Step 1: Append**

```markdown
Added for GAP-064 G3-A (`feature/gap-064-g3a-display-feedback`), same status — unreleased, no changesets:

- **`@ultimate/ng`, `@ultimate/vue` — Display and Feedback components now use their Aura tokens.** Avatar, Chip, Tag, Skeleton, OverlayBadge, Knob, ProgressBar, ProgressSpinner, MeterGroup, Timeline, Terminal, Message and Toast (and Vue InlineMessage) now take their applicable structural styling from the upstream Aura styles (`@primeuix/styles` 2.0.3), mapped to Ultimate's existing DOM, and follow theme customization. The hand-written rules those upstream styles cover are replaced, so visual appearance changes accordingly. A small set of documented Ultimate-specific rules remains:
  - the Toast root positioning, offsets and stacking (Spec PX-A4);
  - the Chip label and Terminal welcome/command layout (PX-A5);
  - the Skeleton root positioning (PX-A6).

  The other approved parity exceptions and feature exclusions are listed in the G3-A Spec (§5.3–§5.4). (GAP-064 G3-A; DOM and classes unchanged.)

- **Generated `<style>` keys changed** for OverlayBadge, ProgressBar, ProgressSpinner, MeterGroup and Vue InlineMessage (for example `progress-bar` → `progressbar`); these keys are internal, not a supported contract.
```

- [ ] **Step 2: Check and commit**

Run: `npx prettier --check docs/architecture/MIGRATION.md`
Expected: pass.

```bash
git add docs/architecture/MIGRATION.md
git commit -m "docs(gap-064): record G3-A consumer-visible changes in MIGRATION"
```

---

## Plan Review (2026-10-04)

**Result of the first review: Changes Requested.** Five corrections were applied in this revision:

1. **Task 4 — Angular TestBed isolation.**
   - `mount()` now follows the proven Tranche 1 / GAP-078 pattern explicitly. It calls `TestBed.resetTestingModule()`, then exactly one `configureTestingModule` with a **new `Document`** as `DOCUMENT` (server `PLATFORM_ID`), then one `createComponent`. A TestBed is never re-provided after instantiation.
   - A new test proves real per-document behaviour. Two mounts give two distinct documents, each with its own registry holding exactly one `progressbar` and one `progressbar-variables` element, and nothing is written into the global document.
2. **Task 8 — Two separate validations.**
   - `g3a` is the targeted run: the G3-A specs only, visual and accessibility, on ng and vue.
   - `regression` is the existing suite: every other spec in all 9 Storybook projects plus the 3 SSR projects, with the G3-A specs excluded. It must stay at 0 failures, apart from recorded retry-passing flakes.
   - React is named explicitly as regression coverage, not G3-A coverage. Accessibility is validated per run.
   - The old `full` mode is removed.
3. **Task 3 — Explicit C3 ordering contract.**
   - The canonical output is **upstream source order**: ported, adapted and used keyframes interleaved exactly as upstream wrote them, so the cascade is preserved. The retained PX-A4/A5/A6 rules come after, in Spec §5.3 order.
   - `expected()` returns `ordered` plus `upstreamIndex`. A test asserts strictly increasing source indices.
   - A second test asserts that no appended retained rule redeclares a property of an upstream-derived rule on the same selector, so the appended position cannot alter the cascade.
   - Spec §5.2 is updated to match (Spec §13 item 10).
4. **Task 9 — Immutable baseline.** `fa5c150` is the explicit baseline for scope, size and regression reasoning (Global Constraints). Size validation calls the validator with `--base-ref fa5c150`, because the `size:validate` npm script would default to `origin/main` (`f05bd9b`, before Tranche 1). `git fetch` only refreshes metadata.
5. **Task 10 — MIGRATION wording.** The text no longer implies that all hand-written styling disappears. It says that the _applicable structural styling_ becomes upstream Aura-derived, and names the retained documented exceptions (PX-A4/A5/A6) and the Spec's exception and exclusion lists.

**Final consistency check against the approved Spec.** Each requirement below is covered:

| Spec requirement                                      | Where the Plan covers it                                          |
| ----------------------------------------------------- | ----------------------------------------------------------------- |
| §4.1 inventory and the 9 renames                      | Global Constraints; Tasks 5–6                                     |
| §4.3 mapping and dynamic classes (§13 A, F)           | `g3a-port.mjs` PREFIX_RENAMES / NOT_RENDERED; Task 4 dynamic rows |
| §4.4 counts, including the corrected ProgressBar 7/7  | `COUNTS` plus a pin test; verified by dry run                     |
| §5.2 canonical order                                  | `expected().ordered`, ordering tests                              |
| §5.3 PX-A1..A6                                        | REWRITES and RETAINED, with exact text                            |
| §5.4 FX-A1..A7                                        | NOT_RENDERED, and keyframes dropped when unused                   |
| §5.5 provenance                                       | Task 7                                                            |
| §8 C1 / C2 (own-token invariant on ported CSS, §13 B) | Task 4; the Task 3 own-token test                                 |
| C3 exactness (§13 C)                                  | Task 3                                                            |
| C4 scope (§13 D)                                      | Task 5/6 diff filters; Task 9                                     |
| C5 / C6                                               | Tasks 1, 2, 8                                                     |
| C7                                                    | Task 9, against `fa5c150`                                         |
| C8 / C9                                               | Tasks 8–9                                                         |
| 14 keys vs 27 files (§13 E)                           | Fixture of 14 keys; 27 fidelity cases                             |

No Spec requirement is uncovered. No new scope, architecture or runtime change was introduced by this revision.

## After this plan

Final Review and Closeout are a separate gate. That gate covers:

- the GAP-064 progress note: G3-A complete, G3-B..E open, status stays PARTIAL;
- recording Timeline `align` as a follow-up in `BLUEPRINT_GAPS.md`;
- the closeout record;
- the merge/push decisions.
