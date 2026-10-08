# GAP-064 G3-D — Overlays and Composites Aura Structural Port Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Status:** **Approved** (Plan Review, user, 2026-10-07; PR-1..PR-4 ruled, see "Plan Review decisions"). Execution: inline, task by task.

**Goal:** Port the applicable `@primeuix/styles` 2.0.3 structural CSS of ConfirmDialog, ConfirmPopup, Drawer, Popover, SplitButton and SpeedDial onto the existing Angular and Vue DOM (34 groups per framework), perform the CSS-level defect corrections F-D1..F-D3, and prove every shipped selector reaches the rendered DOM.

**Architecture:**

- As in G3-B..G3-C2, the CSS is generated, never hand-written. A tranche-scoped data module (`packages/themes/test/utils/g3d-port.mjs`) holds D1 (ported groups with the Spec §4 mapping), D2 (omissions, FX-D1..FX-D8), D3 (B-2 base roles), D4 (X-4 runtime roles) and D5 (Ultimate-only rules). Its CLI prints each style module's exact `css`. A fidelity test pins the data.
- Runtime unit tests prove keys and variable resolution. Browser specs prove layout, open states, F-D1..F-D3, X-3b and X-1 reach.
- D5 candidates R-D2..R-D5 ship provisionally and are kept or dropped by gate G-D1 (Task 8) before the review gate. R-D1 is retained (D-D3c fallback).

**Tech Stack:** Angular 21 and Vue 3.5 style modules (`/*css*/` template strings with `dt()`); Vitest (themes package; Angular `@angular/build:unit-test`; Vue with `@vue/test-utils`); Playwright 1.63 (`ng-*` / `vue-*` projects; Docker `mcr.microsoft.com/playwright:v1.63.0-jammy` for baselines); Node `--test` for scripts.

**Spec:** `docs/superpowers/specs/2026-10-07-gap-064-g3d-overlays-composites-design.md` (approved; §16 Spec Review decisions).
**Normative rules:** ADR-052 (`docs/architecture/DECISIONS.md`).
**Research (evidence):** `docs/architecture/research/2026-10-07-gap-064-g3d-research.md` (`4eaceb3`).
**Branch:** `feature/gap-064-g3d-overlays-composites`. SDD workspace (git-ignored): `.superpowers/sdd/2026-10-07-gap-064-g3d-overlays-composites/`.

## Global Constraints

- Angular and Vue only. No React change. D-0 (`c567039`) is a completed prerequisite and is not reopened.
- **No DOM, template, class-resolver, input/output/emit, runtime or public API change** (ADR-052 X-2, Spec AC5). In component files only the `css` block, the registered key and one doc-comment line change.
- **Keys (ADR-051, Spec §3.1):** `confirm-dialog` → `confirmdialog`, `confirm-popup` → `confirmpopup`, `split-button` → `splitbutton`, `speed-dial` → `speeddial` (Angular 4 sites, Vue 4). `drawer` and `popover` are unchanged.
- **Counts (Spec §5.7):** per framework, confirmdialog 2/2/0, confirmpopup 13/6/7, drawer 33/12/21, popover 9/2/7, splitbutton 10/5/5, speeddial 10/7/3; total **77 / 34 / 43**.
- **Module order (Spec §8):** **D3 → D1 (upstream order) → D4 → D5**. D2 is never emitted. The SpeedDial mask keeps this exact cascade: the B-2 D3 mask role is never simplified or removed because D1 group 7 overrides its `position` (Spec §16 implementation lock).
- **Adaptations (Spec §4):** exactly the Spec §4 table. ConfirmDialog `.u-dialog-content:has(> .u-confirmdialog-message)` (D-D2); SpeedDial `.u-speeddial:has(> .u-speeddial-button.u-speeddial-open)` (D-D3a); Drawer same-element position compounds; SplitButton Angular host form.
- **Popover (OI-D1):** only `.u-popover { position: absolute; }`; no static `top`/`left` anywhere in the port.
- **Drawer placement (OI-D3):** `.u-drawer-position-right { margin-left: auto; }` and `.u-drawer-position-bottom { margin-top: auto; }` exactly; never converted to logical properties.
- **Tokens:** no unresolved reference in any emitted rule (Spec AC2). No new tokens or preset modules. The SpeedDial mask background is `dt('mask.background')` without the base `--px-mask-background` wrapper (G3-B PX-B3 precedent, B-2).
- **D5:** R-D1 retained. R-D2..R-D5 ship provisionally; each is kept only if gate G-D1 establishes both Spec §6.4 conditions; otherwise it is removed from data and CSS in Task 8. No new D5 rule may be introduced.
- **Frozen tooling:** `packages/themes/test/utils/g3a-port.mjs`, `g3b-port.mjs`, `g3c1-port.mjs`, `g3c2-port.mjs`, `scripts/provenance/validate-g3{a,b,c1,c2}-accessibility.mjs` and their tests stay byte-identical.
- **X-6:** park the pointer at (0, 0) after every navigation and after every trigger click; open through real triggers; wait for visibility and settled computed values before asserting or capturing.
- **Screenshot scope (OI-D4):** ConfirmDialog screenshots are of `.u-dialog`, Drawer screenshots of `.u-drawer`. SplitButton has no open-state screenshot (D-D6).
- **AC12 (retry-aware evidence):** every browser evidence run uses `--retries=0`. Report results as `passed_first_attempt` / `failed`; CI `flaky` = `passed_after_retry`. Do not change the repository retry policy. No new retry or suppression mechanism (X-8 row policy remains undecided).
- **Provenance (X-12):** every changed source file under `packages/{ng,vue}/src` gets a manifest entry; the evidence is a changed-file completeness check. Never cite `provenance:validate` (it exits at its first failure).
- **Out of scope (Spec §13):** Dialog mask, shared `u-overlay-mask`, SplitButton/UMenu positioning, SpeedDial circle-layout runtime, Drawer modal semantics, the NG04002 story harness, GAP-084..094 (including repository-wide provenance debt), X-8 row policy, ADR-053.
- **Stop conditions (Spec §14):** stop and report, with no workaround, on any of: a ported group that cannot reach the DOM without a DOM change; any unresolved token; a count, mapping or order mismatch; an unexpected visual change or introduced accessibility violation; size above 15%; a failing D-0 or C2-0 browser spec (subject to PR-1); gate G-D2 or G-D3 failing, or G-D1 contradicting Spec rule text; a check that could only pass by editing data, evidence or tests; a change to frozen tooling.

## Review Focus

1. **SpeedDial trigger unreachable by a real pointer (F-D1).** After the port a real click must open and close the dial in three engines. Pinned in Task 2 (`SpeedDial … real click` layout test) and gate G-D2 (Task 8).
2. **A disabled SpeedDial action or trigger.** Appearance (`disabled.opacity`, `pointer-events: none`) and the absence of a command must be proved separately (X-3b). Pinned in Task 2 (`x3b` test).
3. **A Drawer at each position, including `full` and RTL.** Size, inline-end placement, and the RTL mask direction. Pinned in Task 2 layout tests.
4. **Angular Drawer content height (F-D3).** The `[ufocustrap]` wrapper must fill the drawer. Pinned in Task 2 and gate G-D3.
5. **The overlay gutter versus D-0's zero-offset assertion.** See Plan Review item PR-1; pinned in Task 2 (`container tokens and anchoring`) and Task 7 Step 4.

---

### Task 1: Verification-only stories

**Files:**

- Modify (append): `packages/ng/src/confirm-dialog/confirm-dialog.stories.ts`, `packages/ng/src/confirm-popup/confirm-popup.stories.ts`, `packages/ng/src/drawer/drawer.stories.ts`, `packages/ng/src/speed-dial/speed-dial.stories.ts`
- Modify (append): `packages/vue/src/confirm-dialog/confirm-dialog.stories.ts`, `packages/vue/src/confirm-popup/confirm-popup.stories.ts`, `packages/vue/src/drawer/drawer.stories.ts`, `packages/vue/src/split-button/split-button.stories.ts`, `packages/vue/src/speed-dial/speed-dial.stories.ts`

**Interfaces:**

- Produces story IDs (both frameworks unless noted): `<fw>-confirmdialog--with-icon`, `<fw>-confirmpopup--with-icon`, `<fw>-drawer--top`, `--bottom`, `--full`, `--rtl`, `vue-splitbutton--disabled`, `<fw>-speeddial--directions`, `<fw>-speeddial--mask`.
- The `Directions` and `Mask` stories set `document.body.dataset.g3dCommand` from item commands (Task 2 X-3b test reads it).
- Existing stories are unchanged.

- [ ] **Step 1: Angular stories**

Append to `packages/ng/src/confirm-dialog/confirm-dialog.stories.ts` (add `moduleMetadata` to the existing `@storybook/angular` type import line as a value import):

```ts
import { moduleMetadata } from "@storybook/angular";

@Component({
  selector: "g3d-confirm-dialog-icon-demo",
  standalone: true,
  imports: [UButton, UConfirmDialog],
  template: `
    <u-button
      label="Delete"
      (onClick)="
        confirmationService.confirm({
          header: 'Confirm',
          message: 'Are you sure you want to delete this item?',
          icon: 'pi pi-exclamation-triangle',
          accept: noop,
        })
      "
    ></u-button>
    <u-confirm-dialog></u-confirm-dialog>
  `,
})
class ConfirmDialogIconDemo {
  protected readonly confirmationService = inject(UConfirmationService);
  protected readonly noop = () => {};
}

/** GAP-064 G3-D verification story (Spec §9.1): a confirmation with an icon. */
export const WithIcon: Story = {
  decorators: [moduleMetadata({ imports: [ConfirmDialogIconDemo] })],
  render: () => ({ template: `<g3d-confirm-dialog-icon-demo></g3d-confirm-dialog-icon-demo>` }),
};
```

Append to `packages/ng/src/confirm-popup/confirm-popup.stories.ts` (import `moduleMetadata` as above):

```ts
@Component({
  selector: "g3d-confirm-popup-icon-demo",
  standalone: true,
  imports: [UButton, UConfirmPopup],
  template: `
    <u-button label="Delete" severity="danger" (onClick)="onDeleteClick()"></u-button>
    <u-confirm-popup></u-confirm-popup>
  `,
})
class ConfirmPopupIconDemo {
  protected readonly confirmationService = inject(UConfirmationService);
  private readonly el = inject(ElementRef);

  protected onDeleteClick(): void {
    this.confirmationService.confirm({
      message: "Are you sure you want to delete this record?",
      icon: "pi pi-exclamation-triangle",
      target: this.el.nativeElement.querySelector("button"),
      accept: () => {},
    });
  }
}

/** GAP-064 G3-D verification story (Spec §9.1): a confirmation with an icon. */
export const WithIcon: Story = {
  decorators: [moduleMetadata({ imports: [ConfirmPopupIconDemo] })],
  render: () => ({ template: `<g3d-confirm-popup-icon-demo></g3d-confirm-popup-icon-demo>` }),
};
```

Append to `packages/ng/src/drawer/drawer.stories.ts` (add `Component, OnDestroy, OnInit` from `@angular/core` and `moduleMetadata` from `@storybook/angular`):

```ts
const at = (position: "top" | "bottom" | "full", header: string): Story => ({
  args: { visible: true, header, position },
  render: (args) => ({
    props: args,
    template: `<u-drawer [visible]="visible" [header]="header" [position]="position">Drawer body content.</u-drawer>`,
  }),
});

/** GAP-064 G3-D verification stories (Spec §9.1): the remaining positions. */
export const Top: Story = at("top", "Top");
export const Bottom: Story = at("bottom", "Bottom");
export const Full: Story = at("full", "Full");

/** Sets `dir="rtl"` on <html> while mounted (the drawer is appended to body) and restores it on destroy. */
@Component({
  selector: "g3d-rtl-drawer",
  standalone: true,
  imports: [UDrawer],
  template: `<u-drawer [visible]="true" header="RTL">Drawer body content.</u-drawer>`,
})
class RtlDrawerDemo implements OnInit, OnDestroy {
  private previous = "";
  ngOnInit(): void {
    this.previous = document.documentElement.dir;
    document.documentElement.dir = "rtl";
  }
  ngOnDestroy(): void {
    document.documentElement.dir = this.previous;
  }
}

/** GAP-064 G3-D verification story (Spec §9.1, OI-D3): a left drawer under `dir="rtl"` (group 23). */
export const Rtl: Story = {
  decorators: [moduleMetadata({ imports: [RtlDrawerDemo] })],
  render: () => ({ template: `<g3d-rtl-drawer></g3d-rtl-drawer>` }),
};
```

Append to `packages/ng/src/speed-dial/speed-dial.stories.ts` (add `moduleMetadata` import):

```ts
const record = (label: string) => () => {
  document.body.dataset.g3dCommand = label;
};
const commandModel: UMenuItem[] = [
  { label: "Add", icon: "pi pi-plus", command: record("Add") },
  { label: "Edit", icon: "pi pi-pencil", command: record("Edit") },
  { label: "Hidden", icon: "pi pi-eye-slash", visible: false },
  { label: "Delete", icon: "pi pi-trash", disabled: true, command: record("Delete") },
];

/** GAP-064 G3-D verification story (Spec §9.1): the four linear directions, a hidden and a disabled action, and a disabled trigger. */
export const Directions: Story = {
  decorators: [moduleMetadata({ imports: [USpeedDial] })],
  args: { model: commandModel },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: grid; grid-template-columns: repeat(5, 12rem); gap: 1rem; padding: 12rem 2rem;">
        <u-speed-dial [model]="model" icon="pi pi-plus" direction="up" ariaLabel="Up"></u-speed-dial>
        <u-speed-dial [model]="model" icon="pi pi-plus" direction="down" ariaLabel="Down"></u-speed-dial>
        <u-speed-dial [model]="model" icon="pi pi-plus" direction="left" ariaLabel="Left"></u-speed-dial>
        <u-speed-dial [model]="model" icon="pi pi-plus" direction="right" ariaLabel="Right"></u-speed-dial>
        <u-speed-dial [model]="model" icon="pi pi-plus" direction="up" [disabled]="true" ariaLabel="Disabled"></u-speed-dial>
      </div>
    `,
  }),
};

/** GAP-064 G3-D verification story (Spec §9.1): the mask (D3 B-2 overlay role + group 7). */
export const Mask: Story = {
  args: { model: commandModel, icon: "pi pi-plus", direction: "up", mask: true, ariaLabel: "Mask" },
  render: (args) => ({
    props: args,
    template: `<div style="padding: 12rem 2rem;"><u-speed-dial [model]="model" [icon]="icon" [direction]="direction" [mask]="mask" [ariaLabel]="ariaLabel"></u-speed-dial></div>`,
  }),
};
```

- [ ] **Step 2: Vue stories**

Append to `packages/vue/src/confirm-dialog/confirm-dialog.stories.ts`:

```ts
/** GAP-064 G3-D verification story (Spec §9.1): a confirmation with an icon. */
export const WithIcon = {
  render: () => ({
    components: { UConfirmDialog },
    methods: {
      requestConfirm() {
        confirmationEventBus.emit("confirm", {
          header: "Confirm",
          message: "Are you sure you want to delete this item?",
          icon: "pi pi-exclamation-triangle",
          accept: () => {},
        });
      },
    },
    template: `
      <div>
        <button @click="requestConfirm">Delete</button>
        <UConfirmDialog />
      </div>
    `,
  }),
};
```

Append to `packages/vue/src/confirm-popup/confirm-popup.stories.ts`:

```ts
/** GAP-064 G3-D verification story (Spec §9.1): a confirmation with an icon. */
export const WithIcon: Story = {
  render: () => ({
    components: { UConfirmPopup },
    methods: {
      requestConfirm(event: MouseEvent) {
        confirmationEventBus.emit("confirm", {
          message: "Are you sure you want to delete this record?",
          icon: "pi pi-exclamation-triangle",
          target: event.currentTarget,
          accept: () => {},
        });
      },
    },
    template: `
      <div>
        <button @click="requestConfirm">Delete</button>
        <UConfirmPopup />
      </div>
    `,
  }),
};
```

Append to `packages/vue/src/drawer/drawer.stories.ts` (add `onBeforeUnmount, onMounted` to the `vue` import):

```ts
const at = (position: string, header: string): Story => ({
  render: () => ({
    components: { UDrawer },
    setup() {
      const visible = ref(false);
      return { visible, position, header };
    },
    template: `
      <div>
        <button @click="visible = true">Show drawer</button>
        <UDrawer v-model:visible="visible" :header="header" :position="position">Drawer body content.</UDrawer>
      </div>
    `,
  }),
});

/** GAP-064 G3-D verification stories (Spec §9.1): the remaining positions. */
export const Top: Story = at("top", "Top");
export const Bottom: Story = at("bottom", "Bottom");
export const Full: Story = at("full", "Full");

/** GAP-064 G3-D verification story (Spec §9.1, OI-D3): a left drawer under `dir="rtl"` on <html> (restored on unmount). */
export const Rtl: Story = {
  render: () => ({
    components: { UDrawer },
    setup() {
      const visible = ref(false);
      let previous = "";
      onMounted(() => {
        previous = document.documentElement.dir;
        document.documentElement.dir = "rtl";
      });
      onBeforeUnmount(() => {
        document.documentElement.dir = previous;
      });
      return { visible };
    },
    template: `
      <div>
        <button @click="visible = true">Show drawer</button>
        <UDrawer v-model:visible="visible" header="RTL">Drawer body content.</UDrawer>
      </div>
    `,
  }),
};
```

Append to `packages/vue/src/split-button/split-button.stories.ts`:

```ts
/** GAP-064 G3-D verification story (Spec §9.1): the disabled state (Angular already has one). */
export const Disabled: Story = {
  args: { label: "Save", model, disabled: true },
};
```

Append to `packages/vue/src/speed-dial/speed-dial.stories.ts`:

```ts
const record = (label: string) => () => {
  document.body.dataset.g3dCommand = label;
};
const commandModel = [
  { label: "Add", icon: "pi pi-plus", command: record("Add") },
  { label: "Edit", icon: "pi pi-pencil", command: record("Edit") },
  { label: "Hidden", icon: "pi pi-eye-slash", visible: false },
  { label: "Delete", icon: "pi pi-trash", disabled: true, command: record("Delete") },
];

/** GAP-064 G3-D verification story (Spec §9.1): the four linear directions, a hidden and a disabled action, and a disabled trigger. */
export const Directions: Story = {
  render: () => ({
    components: { USpeedDial },
    setup: () => ({ model: commandModel }),
    template: `
      <div style="display: grid; grid-template-columns: repeat(5, 12rem); gap: 1rem; padding: 12rem 2rem;">
        <USpeedDial :model="model" icon="pi pi-plus" direction="up" aria-label="Up" />
        <USpeedDial :model="model" icon="pi pi-plus" direction="down" aria-label="Down" />
        <USpeedDial :model="model" icon="pi pi-plus" direction="left" aria-label="Left" />
        <USpeedDial :model="model" icon="pi pi-plus" direction="right" aria-label="Right" />
        <USpeedDial :model="model" icon="pi pi-plus" direction="up" :disabled="true" aria-label="Disabled" />
      </div>
    `,
  }),
};

/** GAP-064 G3-D verification story (Spec §9.1): the mask (D3 B-2 overlay role + group 7). */
export const Mask: Story = {
  render: () => ({
    components: { USpeedDial },
    setup: () => ({ model: commandModel }),
    template: `<div style="padding: 12rem 2rem;"><USpeedDial :model="model" icon="pi pi-plus" direction="up" :mask="true" aria-label="Mask" /></div>`,
  }),
};
```

- [ ] **Step 3: Verify the stories build and render**

Run: `pnpm --filter @ultimate/ng run typecheck && pnpm --filter @ultimate/vue run typecheck`
Expected: exit 0.

Start both Storybooks and open each new story ID once in a browser (Playwright script or manual). Expected: each renders, the SpeedDial `Directions` story shows five dials, and opening then leaving `Rtl` restores `document.documentElement.dir` to `""`. If the Vue `aria-label` attribute does not reach the trigger (`USpeedDial` prop is `ariaLabel`), use `:ariaLabel` instead and record the change in the ledger.

- [ ] **Step 4: Commit**

```bash
git add packages/ng/src/{confirm-dialog,confirm-popup,drawer,speed-dial}/*.stories.ts packages/vue/src/{confirm-dialog,confirm-popup,drawer,split-button,speed-dial}/*.stories.ts
git commit -m "test(gap-064): add G3-D verification-only stories"
```

---

### Task 2: G3-D browser specs (visual, open, layout, x3b, accessibility)

**Files:**

- Create: `packages/ng/e2e/g3d-aura-styles.spec.ts`, `packages/vue/e2e/g3d-aura-styles.spec.ts`

**Interfaces:**

- Consumes: Task 1 story IDs.
- Produces: test titles `Ng|Vue/<Name> G3-D visual|open|layout|x3b|accessibility`; the `STORIES` table (17 entries per framework, each `story:` immediately followed by `ready:`), parsed by Task 10's validator; the `state(page, kind)` helper, reused in Task 9.

- [ ] **Step 1: Write `packages/ng/e2e/g3d-aura-styles.spec.ts`**

```ts
import { expect, test, type Locator, type Page } from "@playwright/test";
import { runAccessibilityScan, storyUrl } from "./accessibility-envelope";

/**
 * GAP-064 G3-D (Spec §9.2–§9.5): screenshots at rest and in open states,
 * layout/computed-style checks (F-D1..F-D3, X-3b) and accessibility scans.
 * Baselines are recorded in Linux Docker before any CSS change (Plan Task 3).
 * Tests that fail before the port (F-D1..F-D3) are before-state evidence; only
 * after-port results are acceptance criteria. All evidence runs use --retries=0.
 */
const FW = "ng";
const T = "Ng";
const TRIGGER = "#storybook-root button";
const SB_MAIN = ".u-splitbutton-button > .u-button";
const SB_DROPDOWN = ".u-splitbutton-dropdown > .u-button";
const WRAPPER = ".u-drawer > [ufocustrap]"; // D-D7, Angular only
const DRAWER: Record<"left" | "right" | "top" | "bottom" | "full" | "rtl", string> = {
  left: "ng-drawer--open",
  right: "ng-drawer--right-position",
  top: "ng-drawer--top",
  bottom: "ng-drawer--bottom",
  full: "ng-drawer--full",
  rtl: "ng-drawer--rtl",
};
const DRAWER_OPEN: Kind = "none"; // the Angular drawer stories render open
/** Before the port the SpeedDial trigger is covered by its list (F-D1); Task 3 records before-state with a dispatched click. */
const DISPATCH = process.env.G3D_DISPATCH === "1";

type Kind = "rest" | "none" | "click" | "speeddial";

const STORIES: ReadonlyArray<{ name: string; story: string; ready: string; kind: Kind }> = [
  {
    name: "ConfirmDialog Default",
    story: `${FW}-confirmdialog--default`,
    ready: ".u-dialog",
    kind: "click",
  },
  {
    name: "ConfirmDialog WithIcon",
    story: `${FW}-confirmdialog--with-icon`,
    ready: ".u-dialog",
    kind: "click",
  },
  {
    name: "ConfirmPopup Default",
    story: `${FW}-confirmpopup--default`,
    ready: ".u-confirmpopup",
    kind: "click",
  },
  {
    name: "ConfirmPopup WithIcon",
    story: `${FW}-confirmpopup--with-icon`,
    ready: ".u-confirmpopup",
    kind: "click",
  },
  { name: "Drawer Left", story: DRAWER.left, ready: ".u-drawer", kind: DRAWER_OPEN },
  { name: "Drawer Right", story: DRAWER.right, ready: ".u-drawer", kind: DRAWER_OPEN },
  { name: "Drawer Top", story: DRAWER.top, ready: ".u-drawer", kind: DRAWER_OPEN },
  { name: "Drawer Bottom", story: DRAWER.bottom, ready: ".u-drawer", kind: DRAWER_OPEN },
  { name: "Drawer Full", story: DRAWER.full, ready: ".u-drawer", kind: DRAWER_OPEN },
  { name: "Drawer Rtl", story: DRAWER.rtl, ready: ".u-drawer", kind: DRAWER_OPEN },
  { name: "Popover Default", story: `${FW}-popover--default`, ready: ".u-popover", kind: "click" },
  {
    name: "Popover NonDismissable",
    story: `${FW}-popover--non-dismissable`,
    ready: ".u-popover",
    kind: "click",
  },
  {
    name: "SplitButton Default",
    story: `${FW}-splitbutton--default`,
    ready: ".u-splitbutton",
    kind: "rest",
  },
  {
    name: "SplitButton Disabled",
    story: `${FW}-splitbutton--disabled`,
    ready: ".u-splitbutton",
    kind: "rest",
  },
  {
    name: "SpeedDial Default",
    story: `${FW}-speeddial--default`,
    ready: ".u-speeddial",
    kind: "speeddial",
  },
  {
    name: "SpeedDial Directions",
    story: `${FW}-speeddial--directions`,
    ready: ".u-speeddial",
    kind: "speeddial",
  },
  {
    name: "SpeedDial Mask",
    story: `${FW}-speeddial--mask`,
    ready: ".u-speeddial-mask",
    kind: "speeddial",
  },
];

async function go(page: Page, story: string) {
  await page.goto(storyUrl(story));
  await page.mouse.move(0, 0); // X-6: no pointer residue
}

async function nonZero(l: Locator) {
  await expect(l).toBeVisible();
  const b = await l.boundingBox();
  expect(b && b.width > 0 && b.height > 0, "non-zero box").toBe(true);
}

/** Opens a state through its real trigger and waits for visibility and settled values (X-6). */
export async function state(page: Page, kind: Kind, ready: string) {
  if (kind === "click") {
    await page.locator(TRIGGER).first().click();
    await page.mouse.move(0, 0);
  } else if (kind === "speeddial") {
    const triggers = page.locator(".u-speeddial-button:not(:disabled)");
    for (let i = 0; i < (await triggers.count()); i++) {
      const t = triggers.nth(i);
      if (DISPATCH) await t.dispatchEvent("click");
      else await t.click();
      await expect(t).toHaveClass(/u-speeddial-open/);
    }
    await page.mouse.move(0, 0);
    await expect
      .poll(() =>
        page
          .locator(
            ".u-speeddial-button.u-speeddial-open + .u-speeddial-list .u-speeddial-item:not(.u-speeddial-item-hidden)"
          )
          .first()
          .evaluate((el) => getComputedStyle(el).opacity)
      )
      .toBe("1");
  }
  await nonZero(page.locator(ready).first());
}

for (const { name, story, ready, kind } of STORIES) {
  test(`${T}/${name} G3-D accessibility`, async ({ page }, testInfo) => {
    await go(page, story);
    await state(page, kind, ready);
    await runAccessibilityScan(page, testInfo, story);
  });
}

/** Spec §9.2 screenshot matrix. `shot` scopes the capture (OI-D4); "page" captures the viewport. */
const VISUAL: ReadonlyArray<{ name: string; story: string; kind: Kind; shot: string }> = [
  {
    name: "SplitButton Default rest",
    story: `${FW}-splitbutton--default`,
    kind: "rest",
    shot: "page",
  },
  {
    name: "SplitButton Disabled rest",
    story: `${FW}-splitbutton--disabled`,
    kind: "rest",
    shot: "page",
  },
  { name: "SpeedDial Default rest", story: `${FW}-speeddial--default`, kind: "rest", shot: "page" },
  {
    name: "SpeedDial Directions rest",
    story: `${FW}-speeddial--directions`,
    kind: "rest",
    shot: "page",
  },
  { name: "Popover Default open", story: `${FW}-popover--default`, kind: "click", shot: "page" },
  {
    name: "ConfirmPopup Default open",
    story: `${FW}-confirmpopup--default`,
    kind: "click",
    shot: "page",
  },
  {
    name: "ConfirmPopup WithIcon open",
    story: `${FW}-confirmpopup--with-icon`,
    kind: "click",
    shot: "page",
  },
  {
    name: "ConfirmDialog Default open",
    story: `${FW}-confirmdialog--default`,
    kind: "click",
    shot: ".u-dialog",
  },
  {
    name: "ConfirmDialog WithIcon open",
    story: `${FW}-confirmdialog--with-icon`,
    kind: "click",
    shot: ".u-dialog",
  },
  { name: "Drawer Left open", story: DRAWER.left, kind: DRAWER_OPEN, shot: ".u-drawer" },
  { name: "Drawer Right open", story: DRAWER.right, kind: DRAWER_OPEN, shot: ".u-drawer" },
  { name: "Drawer Top open", story: DRAWER.top, kind: DRAWER_OPEN, shot: ".u-drawer" },
  { name: "Drawer Bottom open", story: DRAWER.bottom, kind: DRAWER_OPEN, shot: ".u-drawer" },
  { name: "Drawer Full open", story: DRAWER.full, kind: DRAWER_OPEN, shot: ".u-drawer" },
  { name: "Drawer Rtl open", story: DRAWER.rtl, kind: DRAWER_OPEN, shot: ".u-drawer" },
  {
    name: "SpeedDial Default open",
    story: `${FW}-speeddial--default`,
    kind: "speeddial",
    shot: "page",
  },
  {
    name: "SpeedDial Directions open",
    story: `${FW}-speeddial--directions`,
    kind: "speeddial",
    shot: "page",
  },
  { name: "SpeedDial Mask open", story: `${FW}-speeddial--mask`, kind: "speeddial", shot: "page" },
];
for (const v of VISUAL) {
  const tag = v.kind === "rest" ? "visual" : "open";
  test(`${T}/${v.name} G3-D ${tag}`, async ({ page }) => {
    await go(page, v.story);
    const ready = v.shot === "page" ? "#storybook-root" : v.shot;
    await state(page, v.kind, v.kind === "rest" ? "#storybook-root" : ready);
    if (v.shot === "page") await expect(page).toHaveScreenshot();
    else await expect(page.locator(v.shot).first()).toHaveScreenshot();
  });
}

/** The computed value of `property` when set to `value` (a `var(...)` or a length) on a probe element. */
async function resolved(page: Page, value: string, property: string): Promise<string> {
  return page.evaluate(
    ([v, p]) => {
      const probe = document.createElement("div");
      probe.style.setProperty(p, v.startsWith("--") ? `var(${v})` : v);
      document.body.appendChild(probe);
      const out = getComputedStyle(probe).getPropertyValue(p);
      probe.remove();
      return out;
    },
    [value, property] as const
  );
}
const css = (l: Locator, p: string) =>
  l.evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop), p);
async function box(l: Locator) {
  const b = await l.boundingBox();
  expect(b, "bounding box").not.toBeNull();
  return b!;
}

for (const o of [
  { name: "Popover", story: `${FW}-popover--default`, root: ".u-popover", key: "popover" },
  {
    name: "ConfirmPopup",
    story: `${FW}-confirmpopup--with-icon`,
    root: ".u-confirmpopup",
    key: "confirmpopup",
  },
] as const)
  test(`${T}/${o.name} container tokens and anchoring G3-D layout`, async ({ page }) => {
    await go(page, o.story);
    const trigger = page.locator(TRIGGER).first();
    await state(page, "click", o.root);
    const root = page.locator(o.root);
    const k = `--u-${o.key}`;
    expect(await css(root, "background-color")).toBe(
      await resolved(page, `${k}-background`, "background-color")
    );
    expect(await css(root, "border-top-color")).toBe(
      await resolved(page, `${k}-border-color`, "border-top-color")
    );
    expect(await css(root, "border-top-left-radius")).toBe(
      await resolved(page, `${k}-border-radius`, "border-top-left-radius")
    );
    expect(await css(root, "box-shadow")).toBe(await resolved(page, `${k}-shadow`, "box-shadow"));
    const gutter = await resolved(page, `${k}-gutter`, "margin-top");
    expect(await css(root, "margin-top")).toBe(gutter);
    const t = await box(trigger);
    const r = await box(root);
    expect(Math.abs(r.x - t.x), "left edges aligned (D-0)").toBeLessThanOrEqual(1);
    expect(
      Math.abs(r.y - (t.y + t.height + Number.parseFloat(gutter))),
      "below the trigger by the gutter"
    ).toBeLessThanOrEqual(1);
    if (o.key === "confirmpopup") {
      const icon = page.locator(".u-confirmpopup-icon");
      expect(await css(icon, "font-size")).toBe(
        await resolved(page, `${k}-icon-size`, "font-size")
      );
      expect(await css(icon, "color")).toBe(await resolved(page, `${k}-icon-color`, "color"));
    }
  });

test(`${T}/ConfirmDialog content layout (F-D2) G3-D layout`, async ({ page }) => {
  await go(page, `${FW}-confirmdialog--with-icon`);
  await state(page, "click", ".u-dialog");
  const content = page.locator(".u-dialog-content:has(> .u-confirmdialog-message)");
  await expect(content).toHaveCount(1);
  expect(await css(content, "display")).toBe("flex");
  expect(await css(content, "align-items")).toBe("center");
  expect(await css(content, "column-gap")).toBe(
    await resolved(page, "--u-confirmdialog-content-gap", "column-gap")
  );
  const icon = page.locator(".u-confirmdialog-icon");
  expect(await css(icon, "font-size")).toBe(
    await resolved(page, "--u-confirmdialog-icon-size", "font-size")
  );
  expect(await css(icon, "color")).toBe(
    await resolved(page, "--u-confirmdialog-icon-color", "color")
  );
});

for (const [pos, prop, value] of [
  ["left", "width", "20rem"],
  ["right", "width", "20rem"],
  ["top", "height", "10rem"],
  ["bottom", "height", "10rem"],
] as const)
  test(`${T}/Drawer ${pos} size, tokens and placement G3-D layout`, async ({ page }) => {
    await go(page, DRAWER[pos]);
    await state(page, DRAWER_OPEN, ".u-drawer");
    const drawer = page.locator(".u-drawer");
    expect(await css(drawer, prop)).toBe(await resolved(page, value, prop));
    expect(await css(drawer, "background-color")).toBe(
      await resolved(page, "--u-drawer-background", "background-color")
    );
    expect(await css(drawer, "border-top-color")).toBe(
      await resolved(page, "--u-drawer-border-color", "border-top-color")
    );
    expect(await css(page.locator(".u-drawer-header"), "padding-top")).toBe(
      await resolved(page, "--u-drawer-header-padding", "padding-top")
    );
    const vp = page.viewportSize()!;
    const b = await box(drawer);
    if (pos === "right") expect(Math.abs(b.x + b.width - vp.width)).toBeLessThanOrEqual(1);
    if (pos === "bottom") expect(Math.abs(b.y + b.height - vp.height)).toBeLessThanOrEqual(1);
    if (WRAPPER) {
      // F-D3 / G-D3 (Angular): the focus-trap wrapper fills the drawer.
      const w = await box(page.locator(WRAPPER));
      expect(w.height, "wrapper fills the drawer").toBeGreaterThanOrEqual(b.height - 1);
    }
  });

test(`${T}/Drawer full and RTL G3-D layout`, async ({ page }) => {
  await go(page, DRAWER.full);
  await state(page, DRAWER_OPEN, ".u-drawer");
  const vp = page.viewportSize()!;
  const b = await box(page.locator(".u-drawer"));
  expect(Math.abs(b.width - vp.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(b.height - vp.height)).toBeLessThanOrEqual(1);
  await go(page, DRAWER.rtl);
  await state(page, DRAWER_OPEN, ".u-drawer");
  expect(await page.evaluate(() => document.documentElement.dir)).toBe("rtl");
  expect(await css(page.locator(".u-drawer-mask"), "flex-direction")).toBe("row-reverse"); // group 23
});

test(`${T}/SplitButton seams, radius and focus G3-D layout`, async ({ page }) => {
  await go(page, `${FW}-splitbutton--default`);
  await nonZero(page.locator(".u-splitbutton"));
  const main = page.locator(SB_MAIN);
  const dropdown = page.locator(SB_DROPDOWN);
  expect(await css(page.locator(".u-splitbutton"), "border-top-left-radius")).toBe(
    await resolved(page, "--u-splitbutton-border-radius", "border-top-left-radius")
  );
  expect(await css(main, "border-top-right-radius")).toBe("0px");
  expect(await css(main, "border-bottom-right-radius")).toBe("0px");
  expect(await css(main, "border-right-width")).toBe("0px");
  expect(await css(dropdown, "border-top-left-radius")).toBe("0px");
  expect(await css(dropdown, "border-bottom-left-radius")).toBe("0px");
  await page.keyboard.press("Tab");
  await expect(main).toBeFocused();
  expect(await css(main, "z-index")).toBe("1"); // group 3
});

const items = (root: Locator) => root.locator(".u-speeddial-item:not(.u-speeddial-item-hidden)");

test(`${T}/SpeedDial closed, opened and closed by a real click (F-D1, G-D2) G3-D layout`, async ({
  page,
}) => {
  await go(page, `${FW}-speeddial--default`);
  const root = page.locator(".u-speeddial").first();
  await expect(root).toBeAttached();
  await expect
    .poll(() =>
      items(root)
        .first()
        .evaluate((el) => getComputedStyle(el).opacity)
    )
    .toBe("0");
  expect(await css(root.locator(".u-speeddial-list"), "pointer-events")).toBe("none");
  await root.locator(".u-speeddial-button").click(); // real pointer (G-D2)
  await expect
    .poll(() =>
      items(root)
        .first()
        .evaluate((el) => getComputedStyle(el).opacity)
    )
    .toBe("1");
  expect(await css(root.locator(".u-speeddial-list"), "pointer-events")).toBe("auto");
  await root.locator(".u-speeddial-button").click();
  await expect
    .poll(() =>
      items(root)
        .first()
        .evaluate((el) => getComputedStyle(el).opacity)
    )
    .toBe("0");
});

test(`${T}/SpeedDial directions and gap (R-3) G3-D layout`, async ({ page }) => {
  await go(page, `${FW}-speeddial--directions`);
  for (const dir of ["up", "down", "left", "right"] as const) {
    const root = page
      .locator(`.u-speeddial-direction-${dir}`)
      .filter({ has: page.locator(".u-speeddial-button:not(:disabled)") })
      .first();
    await root.locator(".u-speeddial-button").click();
    await page.mouse.move(0, 0);
    await expect
      .poll(() =>
        items(root)
          .first()
          .evaluate((el) => getComputedStyle(el).opacity)
      )
      .toBe("1");
    const t = await box(root.locator(".u-speeddial-button"));
    const l = await box(root.locator(".u-speeddial-list"));
    if (dir === "up") expect(l.y + l.height).toBeLessThanOrEqual(t.y + 1);
    if (dir === "down") expect(l.y).toBeGreaterThanOrEqual(t.y + t.height - 1);
    if (dir === "left") expect(l.x + l.width).toBeLessThanOrEqual(t.x + 1);
    if (dir === "right") expect(l.x).toBeGreaterThanOrEqual(t.x + t.width - 1);
    const axis = dir === "up" || dir === "down" ? "row-gap" : "column-gap";
    expect(await css(root, axis)).toBe(await resolved(page, "--u-speeddial-gap", axis));
  }
});

test(`${T}/SpeedDial mask (B-2 + group 7) G3-D layout`, async ({ page }) => {
  await go(page, `${FW}-speeddial--mask`);
  await state(page, "speeddial", ".u-speeddial-mask");
  const mask = page.locator(".u-speeddial-mask");
  expect(await css(mask, "background-color")).toBe(
    await resolved(page, "--u-mask-background", "background-color")
  );
  expect(await css(mask, "position")).toBe("absolute");
});

test(`${T}/SpeedDial disabled appearance and guards G3-D x3b`, async ({ page }) => {
  await go(page, `${FW}-speeddial--directions`);
  const opacity = await resolved(page, "--u-disabled-opacity", "opacity");
  // Disabled trigger: appearance, then interaction separately.
  const dTrigger = page.locator(".u-speeddial-button:disabled");
  await expect(dTrigger).toHaveCount(1);
  expect(await css(dTrigger, "opacity")).toBe(opacity);
  expect(await css(dTrigger, "pointer-events")).toBe("none");
  await dTrigger.click({ force: true });
  await expect(dTrigger).toHaveAttribute("aria-expanded", "false");
  // Disabled action in an open dial.
  const up = page
    .locator(".u-speeddial-direction-up")
    .filter({ has: page.locator(".u-speeddial-button:not(:disabled)") })
    .first();
  await up.locator(".u-speeddial-button").click();
  await page.mouse.move(0, 0);
  const dAction = up.locator(".u-speeddial-action:disabled");
  await expect(dAction).toHaveCount(1);
  await expect.poll(() => dAction.evaluate((el) => getComputedStyle(el).opacity)).toBe(opacity);
  expect(await css(dAction, "pointer-events")).toBe("none");
  await dAction.click({ force: true });
  expect(await page.evaluate(() => document.body.dataset.g3dCommand ?? null)).toBeNull();
  await expect(dAction).toBeDisabled(); // not keyboard-activatable
  // Sanity: an enabled action does run its command.
  await up.locator('.u-speeddial-action[aria-label="Edit"]').click();
  expect(await page.evaluate(() => document.body.dataset.g3dCommand ?? null)).toBe("Edit");
});
```

- [ ] **Step 2: Write `packages/vue/e2e/g3d-aura-styles.spec.ts`**

The Vue file is the Angular file from Step 1 with exactly these constant lines replaced; the rest is identical:

```ts
const FW = "vue";
const T = "Vue";
const SB_MAIN = ".u-splitbutton-button.u-button";
const SB_DROPDOWN = ".u-splitbutton-dropdown.u-button";
const WRAPPER = ""; // no wrapper in Vue (D-D7 is Angular only)
const DRAWER: Record<"left" | "right" | "top" | "bottom" | "full" | "rtl", string> = {
  left: "vue-drawer--default",
  right: "vue-drawer--right-position",
  top: "vue-drawer--top",
  bottom: "vue-drawer--bottom",
  full: "vue-drawer--full",
  rtl: "vue-drawer--rtl",
};
const DRAWER_OPEN: Kind = "click"; // the Vue drawer stories open by click
```

Both files keep the `STORIES` table at 17 entries.

- [ ] **Step 3: Run the specs once against the current (pre-port) CSS, locally, Chromium**

Run: `npx playwright test packages/ng/e2e/g3d-aura-styles.spec.ts packages/vue/e2e/g3d-aura-styles.spec.ts --project=ng-chromium --project=vue-chromium --retries=0 --update-snapshots=none --reporter=list`
Expected: visual/open tests fail only for missing baselines; accessibility tests pass; layout and x3b tests fail where the pre-port DOM shows F-D1..F-D3 or missing token styling. Record the failing titles in the ledger as before-state evidence. A failure caused by a selector or story error (not a pre-port state) must be fixed now.

- [ ] **Step 4: Commit**

```bash
git add packages/ng/e2e/g3d-aura-styles.spec.ts packages/vue/e2e/g3d-aura-styles.spec.ts
git commit -m "test(gap-064): add G3-D browser specs (visual, open, layout, x3b, accessibility)"
```

---

### Task 3: Docker "before" baselines and before-state evidence

**Files:**

- Create (git-ignored): `.superpowers/sdd/2026-10-07-gap-064-g3d-overlays-composites/docker/run.sh`
- Create (committed): `packages/{ng,vue}/e2e/g3d-aura-styles.spec.ts-snapshots/*.png` (before baselines)

- [ ] **Step 1: Write the Docker runner**

Create `.superpowers/sdd/2026-10-07-gap-064-g3d-overlays-composites/docker/run.sh` with modes `before`, `d`, `regression`, `ci <fw>`, `update "<grep>"`, `compare "<grep>"`, following `.superpowers/sdd/2026-10-06-gap-064-g3c2-menus/docker/run.sh` with:

- `SPECS="packages/ng/e2e/g3d-aura-styles.spec.ts packages/vue/e2e/g3d-aura-styles.spec.ts"`;
- `SNAP="packages/ng/e2e/g3d-aura-styles.spec.ts-snapshots packages/vue/e2e/g3d-aura-styles.spec.ts-snapshots"`;
- `before` runs with `G3D_DISPATCH=1` and `--update-snapshots=missing --retries=0`;
- `regression` uses `--grep-invert "G3-D"` across the 9 Storybook projects plus the 3 SSR projects;
- `ci <fw>` adds a G3-D run and `node scripts/provenance/validate-g3d-accessibility.mjs <fw>` after the G3-C2 pair.

Build the source tarball with `git ls-files -z | COPYFILE_DISABLE=1 tar --no-xattrs --null -T - -cf <workspace>/docker/src.tar` and confirm it contains no `._*` entries.

- [ ] **Step 2: Record before baselines**

Run: `docker run --rm --ipc=host -v "$PWD/.superpowers/sdd/2026-10-07-gap-064-g3d-overlays-composites/docker:/io" mcr.microsoft.com/playwright:v1.63.0-jammy bash /io/run.sh before`
Expected: 36 visual/open baselines per framework × 3 engines written (18 per framework per engine). Layout/x3b failures are F-D1..F-D3 evidence. Extract the snapshots into the repo.

- [ ] **Step 3: Record the before-port accessibility rows**

From the `before` run's envelopes (`test-results/accessibility/{ng,vue}/<browser>/<storyId>.json`), list every fingerprint with `computeFingerprint` from `scripts/provenance/validate-accessibility-baseline.mjs`. Save the list in the ledger (it becomes half of the pre-existing derivation in Task 10).

- [ ] **Step 4: Commit the before baselines**

```bash
git add packages/ng/e2e/g3d-aura-styles.spec.ts-snapshots packages/vue/e2e/g3d-aura-styles.spec.ts-snapshots
git commit -m "test(gap-064): record G3-D pre-change baselines in Linux Docker"
```

---

### Task 4: Upstream fixture, G3-D data module and static fidelity test

**Files:**

- Create: `packages/themes/test/fixtures/primeuix-styles-g3d.json`, `packages/themes/test/utils/g3d-port.mjs`, `packages/themes/test/g3d-upstream-fidelity.test.ts`

**Interfaces:**

- Produces: `g3d-port.mjs` exports `REPO, FIXTURE, FRAMEWORKS, KEYS, DIRS, MAPPING, OMITTED, COUNTS, TOTALS, BASE_ROLE, BASE_SOURCES, RUNTIME_ROLE, CANDIDATES, KEPT, RETAINED, mapSelector, expected, expectedCss, declarations, styleFile, actualCssText, actualRules, norm, parseGroups`; CLI `node packages/themes/test/utils/g3d-port.mjs <ng|vue> <key>`.

- [ ] **Step 1: Generate the fixture**

```bash
TMP=$(mktemp -d) && tar -xzf .vendor-cache/@primeuix__styles-2.0.3.tar.gz -C "$TMP"
node --input-type=module -e '
import { writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const dist = path.join(process.argv[1], "package/dist");
const keys = ["confirmdialog", "confirmpopup", "drawer", "popover", "splitbutton", "speeddial", "base"];
const modules = {};
for (const k of keys) modules[k] = (await import(pathToFileURL(path.join(dist, k, "index.mjs")).href)).style;
writeFileSync("packages/themes/test/fixtures/primeuix-styles-g3d.json", JSON.stringify({
  _meta: {
    source: "@primeuix/styles@2.0.3 (MIT, https://github.com/primefaces/primeuix) - dist/<key>/index.mjs export style",
    method: "one-off script: dynamic import() of each dist/<key>/index.mjs from the pinned tarball .vendor-cache/@primeuix__styles-2.0.3.tar.gz; no hand edits",
    scope: "GAP-064 G3-D: the 6 Overlays + Composites Aura keys, plus the base module (source of the B-2 base-role declarations)",
    purpose: "CI-runnable upstream structural CSS snapshot for the G3-D fidelity test. Test data only, not shipped source."
  },
  modules
}, null, 2) + "\n");
' "$TMP"
```

Expected: the file has 7 modules; `parseGroups` gives confirmdialog 2, confirmpopup 13, drawer 33, popover 9, splitbutton 10, speeddial 10.

- [ ] **Step 2: Write `packages/themes/test/utils/g3d-port.mjs`**

```js
/**
 * GAP-064 G3-D (Spec §4–§8): the explicit upstream → Ultimate data for the
 * Overlays + Composites port (confirmdialog, confirmpopup, drawer, popover,
 * splitbutton, speeddial):
 *   D1 ported groups (Spec §4 mapping), D2 omitted groups (FX-D1..FX-D8),
 *   D3 B-2 base roles, D4 ADR-052 X-4 runtime roles, D5 Ultimate-only rules (Plan Task 8 gate).
 * Used by g3d-upstream-fidelity.test.ts and, as a CLI, to print the exact
 * css body of one style module:  node packages/themes/test/utils/g3d-port.mjs <ng|vue> <key>
 * Never edit this data to make a check pass (Spec §14).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { norm, parseGroups } from "./g3a-port.mjs";

export { norm, parseGroups };

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const REPO = path.resolve(HERE, "../../../..");
export const FIXTURE = JSON.parse(
  readFileSync(path.join(HERE, "../fixtures/primeuix-styles-g3d.json"), "utf8")
);

export const FRAMEWORKS = ["ng", "vue"];
export const KEYS = [
  "confirmdialog",
  "confirmpopup",
  "drawer",
  "popover",
  "splitbutton",
  "speeddial",
];
/** Aura key → Ultimate directory (style file: <dir>/<dir>-style.ts). */
export const DIRS = {
  confirmdialog: "confirm-dialog",
  confirmpopup: "confirm-popup",
  drawer: "drawer",
  popover: "popover",
  splitbutton: "split-button",
  speeddial: "speed-dial",
};

/**
 * Spec §4 mapping, applied in order to every selector part of a D1 group, then
 * the generic `.p-` → `.u-` rule. Kinds: "text" (replace one exact part),
 * "class" (replace a token inside a part, followed by a non-name character).
 */
const POS = ["left", "right", "top", "bottom"];
const DRAWER = [
  ["text", ".p-drawer-full .p-drawer", ".u-drawer.u-drawer-position-full"],
  ...POS.map((p) => ["text", `.p-drawer-${p} .p-drawer`, `.u-drawer.u-drawer-position-${p}`]),
  ...POS.map((p) => [
    "text",
    `.p-drawer-${p} .p-drawer-content`,
    `.u-drawer.u-drawer-position-${p} .u-drawer-content`,
  ]),
];
const OPEN = ".u-speeddial:has(> .u-speeddial-button.u-speeddial-open)";
const SHARED = {
  confirmdialog: [
    [
      "text",
      ".p-confirmdialog .p-dialog-content",
      ".u-dialog-content:has(> .u-confirmdialog-message)",
    ],
  ],
  drawer: DRAWER,
  speeddial: [
    ["text", ".p-speeddial-open .p-speeddial-list", `${OPEN} .u-speeddial-list`],
    ["text", ".p-speeddial-open .p-speeddial-item", `${OPEN} .u-speeddial-item`],
  ],
};
const SPLIT = (button, dropdown) => [
  ["class", ".p-splitbutton-button.p-button", button],
  ["class", ".p-splitbutton-dropdown.p-button", dropdown],
];
export const MAPPING = {
  ng: {
    ...SHARED,
    splitbutton: SPLIT(".u-splitbutton-button > .u-button", ".u-splitbutton-dropdown > .u-button"),
  },
  vue: {
    ...SHARED,
    splitbutton: SPLIT(".u-splitbutton-button.u-button", ".u-splitbutton-dropdown.u-button"),
  },
};

const range = (a, b, tag) =>
  Object.fromEntries(Array.from({ length: b - a + 1 }, (_, i) => [a + i, tag]));
/** D2 — Spec §5: omitted upstream group numbers (1-based source order) with their FX tag. Identical in both frameworks. */
const OMIT = {
  confirmdialog: {},
  confirmpopup: { 7: "FX-D2", ...range(8, 13, "FX-D1") },
  drawer: { ...range(7, 16, "FX-D3"), 22: "FX-D4", ...range(24, 33, "FX-D3") },
  popover: { 3: "FX-D2", ...range(4, 9, "FX-D1") },
  splitbutton: { 6: "FX-D5", ...range(7, 10, "FX-D6") },
  speeddial: { 3: "FX-D7", 6: "FX-D8", 10: "FX-D7" },
};
export const OMITTED = { ng: OMIT, vue: OMIT };

/** Spec §5.7 counts: [upstream groups, D1 ported] (identical in both frameworks). */
export const COUNTS = {
  confirmdialog: [2, 2],
  confirmpopup: [13, 6],
  drawer: [33, 12],
  popover: [9, 2],
  splitbutton: [10, 5],
  speeddial: [10, 7],
};
export const TOTALS = {
  ng: { upstream: 77, ported: 34, omitted: 43 },
  vue: { upstream: 77, ported: 34, omitted: 43 },
};

/** D3 — Spec §6.1: B-2 base roles, exact text, first in the module (SpeedDial only). */
const SPEEDDIAL_BASE = [
  ".u-speeddial-mask { background: dt('mask.background'); color: dt('mask.color'); position: fixed; top: 0; left: 0; width: 100%; height: 100%; }",
  ".u-speeddial-button:disabled, .u-speeddial-button:disabled *, .u-speeddial-action:disabled, .u-speeddial-action:disabled * { cursor: default; pointer-events: none; user-select: none; }",
  ".u-speeddial-button:disabled, .u-speeddial-action:disabled { opacity: dt('disabled.opacity'); }",
];
export const BASE_ROLE = { ng: { speeddial: SPEEDDIAL_BASE }, vue: { speeddial: SPEEDDIAL_BASE } };
/** Each D3 rule's declarations equal its base group's, except the recorded PX-B3 difference (no --px-mask-background wrapper). */
export const BASE_SOURCES = [
  {
    base: ".p-overlay-mask",
    ruleIndex: 0,
    keys: ["speeddial"],
    differs: {
      background: ["var(--px-mask-background, dt('mask.background'))", "dt('mask.background')"],
    },
  },
  { base: ".p-disabled, .p-disabled *", ruleIndex: 1, keys: ["speeddial"], differs: {} },
  { base: ".p-disabled, .p-component:disabled", ruleIndex: 2, keys: ["speeddial"], differs: {} },
];

/** D4 — Spec §6.2: runtime-role CSS, exact text, after D1 (R-1, R-2, R-3, R-4). */
const RUNTIME = (wrapper) => ({
  popover: [".u-popover { position: absolute; }"],
  drawer: [
    ".u-drawer-mask { position: fixed; inset: 0; display: flex; }",
    ".u-drawer-position-right { margin-left: auto; }",
    ".u-drawer-position-bottom { margin-top: auto; }",
    ...wrapper,
  ],
  speeddial: [
    ".u-speeddial-direction-up { flex-direction: column-reverse; align-items: center; }",
    ".u-speeddial-direction-down { flex-direction: column; align-items: center; }",
    ".u-speeddial-direction-left { flex-direction: row-reverse; justify-content: center; }",
    ".u-speeddial-direction-right { flex-direction: row; justify-content: center; }",
  ],
});
export const RUNTIME_ROLE = {
  ng: RUNTIME([
    ".u-drawer > [ufocustrap] { display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; }",
  ]),
  vue: RUNTIME([]),
};

/** D5 — Spec §6.4, exact text. R-D1 is retained (D-D3c fallback); R-D2..R-D5 are gate G-D1 candidates. */
const CANDIDATE_RULES = {
  "R-D1": [
    ".u-speeddial-action { display: flex; align-items: center; justify-content: center; border-radius: 50%; cursor: pointer; width: 2.5rem; height: 2.5rem; }",
  ],
  "R-D2": [".u-speeddial-item-hidden { visibility: hidden; }"],
  "R-D3": [".u-confirmdialog-footer { display: flex; justify-content: flex-end; gap: 0.5rem; }"],
  "R-D4": [
    ".u-confirmdialog-icon { flex-shrink: 0; }",
    ".u-confirmdialog-message { flex-grow: 1; }",
  ],
  "R-D5": [".u-popover-content { position: relative; }"],
};
export const CANDIDATES = { ng: CANDIDATE_RULES, vue: CANDIDATE_RULES };
const CANDIDATE_KEY = {
  "R-D1": "speeddial",
  "R-D2": "speeddial",
  "R-D3": "confirmdialog",
  "R-D4": "confirmdialog",
  "R-D5": "popover",
};
/** Gate outcome (Plan Task 8; Spec §8 G-D1). Provisional until Task 8 records the result. */
export const KEPT = ["R-D1", "R-D2", "R-D3", "R-D4", "R-D5"];
const retained = () => {
  const out = {};
  for (const id of KEPT) (out[CANDIDATE_KEY[id]] ??= []).push(...CANDIDATE_RULES[id]);
  return out;
};
export const RETAINED = { ng: retained(), vue: retained() };

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const token = (from) => new RegExp(`${escape(from)}(?![a-z0-9-])`, "g");

export function mapSelector(fw, key, selector) {
  let parts = selector.split(",").map((p) => p.trim().replace(/\s+/g, " "));
  for (const [kind, from, to] of MAPPING[fw][key] ?? []) {
    if (kind === "text") parts = parts.map((p) => (p === from ? to : p));
    else parts = parts.map((p) => p.replace(token(from), to));
  }
  return parts.map((p) => p.replace(/\.p-/g, ".u-")).join(", ");
}

/** D1 and D2 for one framework style module, in upstream source order. Keyframes may only be omitted. */
export function expected(fw, key) {
  const groups = parseGroups(FIXTURE.modules[key]);
  const omitted = OMITTED[fw][key] ?? {};
  const d1 = [];
  const d2 = [];
  groups.forEach((g, i) => {
    const n = i + 1;
    if (omitted[n]) d2.push({ n, tag: omitted[n], head: norm(g.head) });
    else if (g.keyframes) throw new Error(`${key}: keyframes group ${n} must be omitted`);
    else d1.push({ n, text: norm(`${mapSelector(fw, key, g.head)}{${g.body}}`) });
  });
  return { upstream: groups.length, d1, d2 };
}

/** Spec §8 canonical order: D3, D1 (upstream order), D4, D5. */
export function expectedCss(fw, key) {
  return [
    ...(BASE_ROLE[fw][key] ?? []).map(norm),
    ...expected(fw, key).d1.map((r) => r.text),
    ...(RUNTIME_ROLE[fw][key] ?? []).map(norm),
    ...(RETAINED[fw][key] ?? []).map(norm),
  ];
}

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
    throw new Error(`usage: g3d-port.mjs <ng|vue> <key>; key one of ${KEYS.join(", ")}`);
  console.log(expectedCss(fw, key).join("\n"));
}
```

- [ ] **Step 3: Write `packages/themes/test/g3d-upstream-fidelity.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import {
  BASE_ROLE,
  BASE_SOURCES,
  CANDIDATES,
  COUNTS,
  FIXTURE,
  FRAMEWORKS,
  KEPT,
  KEYS,
  OMITTED,
  RETAINED,
  RUNTIME_ROLE,
  TOTALS,
  actualCssText,
  actualRules,
  declarations,
  expected,
  expectedCss,
  mapSelector,
  norm,
  parseGroups,
} from "./utils/g3d-port.mjs";

/**
 * GAP-064 G3-D (Spec §5, §6, §8, §9.5 AC3): each of the 12 style modules
 * contains exactly D3 → D1 (upstream order) → D4 → D5, derived from the
 * committed @primeuix/styles 2.0.3 fixture; D2 never appears.
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

describe("G3-D upstream fixture and data model (Spec §5, §8)", () => {
  it("covers the 6 G3-D keys plus base and records its source", () => {
    expect(Object.keys(FIXTURE.modules).sort()).toEqual([...KEYS, "base"].sort());
    expect(FIXTURE._meta.source).toContain("@primeuix/styles@2.0.3");
  });

  it.each(FRAMEWORKS as Fw[])(
    "%s: D1 + D2 = 77, disjoint, per-key counts pinned (34 + 43)",
    (fw) => {
      let upstream = 0;
      let ported = 0;
      let omitted = 0;
      for (const key of KEYS as string[]) {
        const e = expected(fw, key);
        const [u, p] = (COUNTS as Record<string, number[]>)[key];
        expect(e.upstream, key).toBe(u);
        expect(e.d1.length, key).toBe(p);
        const all = [
          ...e.d1.map((r: { n: number }) => r.n),
          ...e.d2.map((r: { n: number }) => r.n),
        ];
        expect(
          all.sort((a, b) => a - b),
          key
        ).toEqual(Array.from({ length: u }, (_, i) => i + 1));
        upstream += e.upstream;
        ported += e.d1.length;
        omitted += e.d2.length;
      }
      expect({ upstream, ported, omitted }).toEqual((TOTALS as Record<Fw, unknown>)[fw]);
    }
  );

  it("Spec §5.7 per-key counts are literal", () => {
    expect(COUNTS).toEqual({
      confirmdialog: [2, 2],
      confirmpopup: [13, 6],
      drawer: [33, 12],
      popover: [9, 2],
      splitbutton: [10, 5],
      speeddial: [10, 7],
    });
  });

  it("D2 tags are exactly FX-D1..FX-D8, identical in both frameworks", () => {
    const tags = (fw: Fw) =>
      new Set(
        Object.values((OMITTED as Record<Fw, Record<string, Record<number, string>>>)[fw]).flatMap(
          (m) => Object.values(m)
        )
      );
    const all = ["FX-D1", "FX-D2", "FX-D3", "FX-D4", "FX-D5", "FX-D6", "FX-D7", "FX-D8"];
    expect([...tags("ng")].sort()).toEqual(all);
    expect([...tags("vue")].sort()).toEqual(all);
  });

  it("Spec §4 normative mapping examples", () => {
    for (const fw of FRAMEWORKS as Fw[]) {
      expect(mapSelector(fw, "confirmdialog", ".p-confirmdialog .p-dialog-content")).toBe(
        ".u-dialog-content:has(> .u-confirmdialog-message)"
      );
      expect(mapSelector(fw, "drawer", ".p-drawer-full .p-drawer")).toBe(
        ".u-drawer.u-drawer-position-full"
      );
      expect(
        mapSelector(
          fw,
          "drawer",
          ".p-drawer-left .p-drawer-content, .p-drawer-top .p-drawer-content"
        )
      ).toBe(
        ".u-drawer.u-drawer-position-left .u-drawer-content, .u-drawer.u-drawer-position-top .u-drawer-content"
      );
      expect(mapSelector(fw, "drawer", ".p-drawer-mask:dir(rtl)")).toBe(".u-drawer-mask:dir(rtl)");
      expect(mapSelector(fw, "speeddial", ".p-speeddial-open .p-speeddial-item")).toBe(
        ".u-speeddial:has(> .u-speeddial-button.u-speeddial-open) .u-speeddial-item"
      );
    }
    expect(
      mapSelector("ng", "splitbutton", ".p-splitbutton-button.p-button:not(:disabled):hover")
    ).toBe(".u-splitbutton-button > .u-button:not(:disabled):hover");
    expect(
      mapSelector("vue", "splitbutton", ".p-splitbutton-dropdown.p-button:focus-visible")
    ).toBe(".u-splitbutton-dropdown.u-button:focus-visible");
  });

  it("D3 declarations equal the upstream base groups, except the recorded PX-B3 difference", () => {
    const base = parseGroups(FIXTURE.modules.base).map((g: { head: string; body: string }) => ({
      head: norm(g.head),
      body: g.body,
    }));
    for (const src of BASE_SOURCES) {
      const group = base.find((b: { head: string }) => b.head === src.base);
      expect(group, src.base).toBeDefined();
      const want = decl(group!.body);
      for (const [prop, [from, to]] of Object.entries(src.differs as Record<string, string[]>)) {
        expect(want[prop], `${src.base} ${prop}`).toBe(from);
        want[prop] = to;
      }
      for (const fw of FRAMEWORKS as Fw[])
        for (const key of src.keys)
          expect(
            decl(bodyOf(norm((BASE_ROLE as Rules)[fw][key][src.ruleIndex]))),
            `${fw} ${key}`
          ).toEqual(want);
    }
  });

  it("D4 is exactly the Spec §6.2 runtime roles (R-1..R-4)", () => {
    for (const fw of FRAMEWORKS as Fw[])
      expect(Object.keys((RUNTIME_ROLE as Rules)[fw]).sort(), fw).toEqual([
        "drawer",
        "popover",
        "speeddial",
      ]);
    expect((RUNTIME_ROLE as Rules).vue.popover).toEqual([".u-popover { position: absolute; }"]); // OI-D1
    expect(JSON.stringify(RUNTIME_ROLE)).not.toMatch(/\.u-popover \{[^}]*(top|left)/);
    expect((RUNTIME_ROLE as Rules).ng.drawer).toContain(
      ".u-drawer-position-right { margin-left: auto; }"
    ); // OI-D3
    expect((RUNTIME_ROLE as Rules).ng.drawer).toContain(
      ".u-drawer-position-bottom { margin-top: auto; }"
    );
    expect(JSON.stringify(RUNTIME_ROLE)).not.toMatch(/margin-inline|margin-block/);
    expect((RUNTIME_ROLE as Rules).ng.drawer.join(" ")).toContain("[ufocustrap]"); // D-D7
    expect((RUNTIME_ROLE as Rules).vue.drawer.join(" ")).not.toContain("[ufocustrap]");
    expect(JSON.stringify(RUNTIME_ROLE)).not.toMatch(/data-u-/);
  });

  it("D5 is a subset of the Spec §6.4 rules; R-D1 always retained", () => {
    for (const fw of FRAMEWORKS as Fw[]) {
      const allowed = new Set(
        Object.values((CANDIDATES as Rules)[fw])
          .flat()
          .map(norm)
      );
      for (const rules of Object.values((RETAINED as Rules)[fw]))
        for (const r of rules) expect(allowed.has(norm(r)), `${fw}: ${r}`).toBe(true);
    }
    expect(KEPT).toContain("R-D1");
  });

  it("D4 and D5 never redeclare a D1 property on the same selector", () => {
    for (const fw of FRAMEWORKS as Fw[])
      for (const key of KEYS as string[]) {
        const d1 = expected(fw, key).d1.map((r: { text: string }) => declarations(r.text));
        const extra = [
          ...((RUNTIME_ROLE as Rules)[fw][key] ?? []),
          ...((RETAINED as Rules)[fw][key] ?? []),
        ].map((r) => declarations(norm(r)));
        for (const x of extra) {
          const clash = d1
            .filter((u: { selector: string }) => u.selector === x.selector)
            .flatMap((u: { props: string[] }) => u.props.filter((p) => x.props.includes(p)));
          expect(clash, `${fw} ${key} ${x.selector}`).toEqual([]);
        }
      }
  });

  it("SpeedDial mask cascade: D3 fixed role precedes D1 group 7 (Spec §16 lock)", () => {
    for (const fw of FRAMEWORKS as Fw[]) {
      const css = expectedCss(fw, "speeddial");
      const role = css.findIndex((r: string) => r.startsWith(".u-speeddial-mask{background:"));
      const g7 = css.findIndex((r: string) => r.startsWith(".u-speeddial-mask{position:absolute"));
      expect(role, fw).toBe(0);
      expect(g7, fw).toBeGreaterThan(role);
    }
  });
});

describe.each(CASES)("$fw $key style module (AC3)", ({ fw, key }) => {
  it("contains exactly D3 → D1 → D4 → D5, nothing else", () => {
    expect(actualRules(fw, key)).toEqual(expectedCss(fw, key));
  });

  it("every rule belongs to exactly one of D1, D3, D4, D5; nothing from D2", () => {
    const sets = [
      expected(fw, key).d1.map((r: { text: string }) => r.text),
      ((BASE_ROLE as Rules)[fw][key] ?? []).map(norm),
      ((RUNTIME_ROLE as Rules)[fw][key] ?? []).map(norm),
      ((RETAINED as Rules)[fw][key] ?? []).map(norm),
    ];
    for (const rule of actualRules(fw, key))
      expect(sets.filter((s) => s.includes(rule)).length, rule).toBe(1);
    const heads = actualRules(fw, key).map((r) => r.slice(0, r.indexOf("{")));
    for (const g of expected(fw, key).d2)
      expect(heads, g.head).not.toContain(mapSelector(fw, key, g.head));
  });

  it("keeps no upstream p- name, no raw --u- variable and no data-u- attribute selector", () => {
    const css = norm(actualCssText(fw, key));
    expect(css).not.toMatch(/\.p-[a-z]/);
    expect(css).not.toMatch(/var\(--u-/);
    expect(css).not.toMatch(/\[data-u-/);
  });

  it("D1 references at least one own token", () => {
    expect(
      expected(fw, key)
        .d1.map((r: { text: string }) => r.text)
        .join(" ")
    ).toContain(`dt('${key}.`);
  });
});
```

Note: the `norm()` form of a rule has no spaces around `{` and `:`; adjust the two `startsWith` literals in the cascade test to the actual `norm` output if they differ (verify by printing `expectedCss("vue","speeddial")[0]`), without changing the data.

- [ ] **Step 4: Run the fidelity test (fails until Tasks 6–7)**

Run: `pnpm --filter @ultimate/themes exec vitest run test/g3d-upstream-fidelity.test.ts`
Expected: the data-model block passes; the 12 per-module blocks fail (current CSS is pre-port).

- [ ] **Step 5: Commit**

```bash
git add packages/themes/test/fixtures/primeuix-styles-g3d.json packages/themes/test/utils/g3d-port.mjs packages/themes/test/g3d-upstream-fidelity.test.ts
git commit -m "test(gap-064): add the G3-D upstream fixture, data module and fidelity test"
```

---

### Task 5: Runtime unit tests — keys and variable resolution

**Files:**

- Create: `packages/ng/src/g3d-aura-styles.spec.ts`, `packages/vue/src/g3d-aura-styles.spec.ts`

- [ ] **Step 1: Angular — `packages/ng/src/g3d-aura-styles.spec.ts`**

```ts
import { PLATFORM_ID, type Type } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { beforeAll, describe, expect, it } from "vitest";
import { applyUltimateTheme } from "@ultimate/themes";
import { UConfirmDialog } from "./confirm-dialog";
import { UConfirmPopup } from "./confirm-popup";
import { UDrawer } from "./drawer";
import { UPopover } from "./popover";
import { USplitButton } from "./split-button";
import { USpeedDial } from "./speed-dial";

/**
 * GAP-064 G3-D (Spec §9.5 AC1, AC2). Fresh document per mount under a server
 * PLATFORM_ID, as G3-A..G3-C2. No unresolved reference is allowed.
 */
const KEY_ATTR = "data-u-ng-style";
const ITEMS = {
  model: [
    { label: "Add", icon: "pi pi-plus" },
    { label: "Delete", disabled: true },
  ],
};
const CASES: { key: string; type: Type<unknown>; inputs: Record<string, unknown> }[] = [
  { key: "confirmdialog", type: UConfirmDialog, inputs: {} },
  { key: "confirmpopup", type: UConfirmPopup, inputs: {} },
  { key: "drawer", type: UDrawer, inputs: { header: "Menu" } },
  { key: "popover", type: UPopover, inputs: {} },
  { key: "splitbutton", type: USplitButton, inputs: { label: "Save", ...ITEMS } },
  { key: "speeddial", type: USpeedDial, inputs: { icon: "pi pi-plus", ...ITEMS } },
];

function mount(type: Type<unknown>, inputs: Record<string, unknown>) {
  TestBed.resetTestingModule();
  const doc = document.implementation.createHTMLDocument("g3d");
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]), // SplitButton composes UMenu, whose template binds [routerLink]
      { provide: DOCUMENT, useValue: doc },
      { provide: PLATFORM_ID, useValue: "server" },
    ],
  });
  const fixture = TestBed.createComponent(type);
  for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
  fixture.detectChanges();
  return { doc };
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

describe("GAP-064 G3-D — Angular", () => {
  beforeAll(() => applyUltimateTheme());

  describe.each(CASES)("$key", (c) => {
    it("registers under the Aura key (AC1)", () => {
      const { doc } = mount(c.type, c.inputs);
      expect(count(doc, c.key)).toBe(1);
      expect(count(doc, `${c.key}-variables`)).toBe(1);
      expect(cssFor(doc, `${c.key}-variables`)).toContain(`--u-${c.key}-`);
    });

    it("resolves every variable (AC2)", () => {
      const { doc } = mount(c.type, c.inputs);
      expect(unresolved(doc, c.key)).toEqual([]);
      expect(cssFor(doc, c.key)).toContain(`var(--u-${c.key}-`);
    });
  });
});
```

If a component registers its style only when shown (for example a closed overlay under the server platform), mount it in its shown state (for `UDrawer`, `inputs: { header: "Menu", visible: true }`) and record the reason in the ledger. Do not change component code.

- [ ] **Step 2: Vue — `packages/vue/src/g3d-aura-styles.spec.ts`**

```ts
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { enableAutoUnmount, mount } from "@vue/test-utils";
import { h, nextTick, type VNode } from "vue";
import { applyUltimateTheme } from "@ultimate/themes";
import { vueCoreStyleSheet } from "@ultimate/vue-core";
import { UConfirmDialog } from "./confirm-dialog";
import { UConfirmPopup } from "./confirm-popup";
import { UDrawer } from "./drawer";
import { UPopover } from "./popover";
import { USplitButton } from "./split-button";
import { USpeedDial } from "./speed-dial";

/** GAP-064 G3-D (Spec §9.5 AC1, AC2). No unresolved reference is allowed. */
const KEY_ATTR = "data-u-style";
const ITEMS = {
  model: [
    { label: "Add", icon: "pi pi-plus" },
    { label: "Delete", disabled: true },
  ],
};
const CASES: { key: string; node: () => VNode }[] = [
  { key: "confirmdialog", node: () => h(UConfirmDialog) },
  { key: "confirmpopup", node: () => h(UConfirmPopup) },
  { key: "drawer", node: () => h(UDrawer, { header: "Menu" }) },
  { key: "popover", node: () => h(UPopover) },
  { key: "splitbutton", node: () => h(USplitButton, { label: "Save", ...ITEMS }) },
  { key: "speeddial", node: () => h(USpeedDial, { icon: "pi pi-plus", ...ITEMS }) },
];

async function render(node: () => VNode) {
  mount({ render: node });
  await nextTick();
  await nextTick();
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

describe("GAP-064 G3-D — Vue", () => {
  beforeAll(() => applyUltimateTheme());
  enableAutoUnmount(afterEach);
  beforeEach(() => {
    vueCoreStyleSheet.clear();
    styles().forEach((s) => s.remove());
  });

  describe.each(CASES)("$key", (c) => {
    it("registers under the Aura key (AC1)", async () => {
      await render(c.node);
      expect(count(c.key)).toBe(1);
      expect(count(`${c.key}-variables`)).toBe(1);
      expect(cssFor(`${c.key}-variables`)).toContain(`--u-${c.key}-`);
    });

    it("resolves every variable (AC2)", async () => {
      await render(c.node);
      expect(unresolved(c.key)).toEqual([]);
      expect(cssFor(c.key)).toContain(`var(--u-${c.key}-`);
    });
  });
});
```

The same shown-state rule as Step 1 applies.

- [ ] **Step 3: Run (fails until Tasks 6–7)**

Run: `pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include=src/g3d-aura-styles.spec.ts` and `pnpm --filter @ultimate/vue exec vitest run src/g3d-aura-styles.spec.ts`
Expected: AC1 fails for the four renamed keys (registered under the hyphenated name); AC2 fails where the module has no `var(--u-<key>-` yet.

- [ ] **Step 4: Commit**

```bash
git add packages/ng/src/g3d-aura-styles.spec.ts packages/vue/src/g3d-aura-styles.spec.ts
git commit -m "test(gap-064): add G3-D runtime key and token tests"
```

---

### Task 6: Angular port (6 style modules, 4 key sites)

**Files:**

- Modify: `packages/ng/src/{confirm-dialog,confirm-popup,drawer,popover,split-button,speed-dial}/*-style.ts` (the `css` block only)
- Modify: `packages/ng/src/confirm-dialog/confirm-dialog.ts:81`, `confirm-popup/confirm-popup.ts:72`, `split-button/split-button.ts:83`, `speed-dial/speed-dial.ts:72` (registered key only)

- [ ] **Step 1: Replace each `css` block**

For each key, run `node packages/themes/test/utils/g3d-port.mjs ng <key>` and replace the content of the module's single `/*css*/` template literal with the printed rules, one per line, nothing else. Keep `classes`, exports and the doc comment unchanged, except one doc-comment line stating that the css is the G3-D Aura structural port (Spec §5–§8). No `${…}` interpolation.

- [ ] **Step 2: Rename the registered keys**

`componentName = "confirm-dialog"` → `"confirmdialog"`; `"confirm-popup"` → `"confirmpopup"`; `"split-button"` → `"splitbutton"`; `"speed-dial"` → `"speeddial"`. Re-verify the line numbers at the branch point; no other line in the component files changes.

- [ ] **Step 3: Verify**

Run: `pnpm --filter @ultimate/themes exec vitest run test/g3d-upstream-fidelity.test.ts -t "ng "`, `pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include=src/g3d-aura-styles.spec.ts`, `pnpm --filter @ultimate/ng run typecheck`.
Expected: the six `ng` module blocks pass; Angular AC1/AC2 pass. Any unresolved token is a stop condition.

- [ ] **Step 4: Commit**

```bash
git add packages/ng/src/{confirm-dialog,confirm-popup,drawer,popover,split-button,speed-dial}/*-style.ts packages/ng/src/confirm-dialog/confirm-dialog.ts packages/ng/src/confirm-popup/confirm-popup.ts packages/ng/src/split-button/split-button.ts packages/ng/src/speed-dial/speed-dial.ts
git commit -m "feat(gap-064): port G3-D Aura structural CSS to Angular"
```

---

### Task 7: Vue port (6 style modules, 4 key sites), early size check and mandatory regressions

**Files:**

- Modify: `packages/vue/src/{confirm-dialog,confirm-popup,drawer,popover,split-button,speed-dial}/*-style.ts` (the `css` block only)
- Modify: `packages/vue/src/confirm-dialog/BaseConfirmDialog.ts:8`, `confirm-popup/BaseConfirmPopup.ts:8`, `split-button/BaseSplitButton.ts:21`, `speed-dial/BaseSpeedDial.ts:13` (registered key only)

- [ ] **Step 1: Replace each `css` block** with `node packages/themes/test/utils/g3d-port.mjs vue <key>`, as Task 6 Step 1.

- [ ] **Step 2: Rename the registered keys** as Task 6 Step 2 (`componentName: "confirm-dialog"` → `"confirmdialog"`, etc.).

- [ ] **Step 3: Verify**

Run the full fidelity test (`pnpm --filter @ultimate/themes exec vitest run test/g3d-upstream-fidelity.test.ts`), both runtime unit specs, both typechecks, and the full unit suites of `@ultimate/ng`, `@ultimate/vue` and `@ultimate/themes`.
Expected: all pass (the Drawer specs still assert `.u-drawer-position-right`, unchanged).

- [ ] **Step 4: Mandatory regressions and PR-1**

Run (local Chromium and in Docker `ci ng`): `packages/ng/e2e/overlay-anchoring.spec.ts` (D-0) and `packages/ng/e2e/context-menu.spec.ts` (C2-0), `--retries=0`.
Expected: C2-0 passes unchanged. The D-0 spec is expected to fail by exactly the resolved `popover.gutter` / `confirmpopup.gutter` (the ported `margin-block-start`), see PR-1: apply the Plan Review's PR-1 ruling here; if PR-1 is not yet ruled, stop and report.

- [ ] **Step 5: Early size check (AC9)**

Measure with the C1 E1 method (Angular `fesm2022` per-file gzip sum; Vue `dist/index.mjs`) against the G3-D branch point (`c567039`). Record both deltas. Above 15% in either package: stop.

- [ ] **Step 6: Commit**

```bash
git add packages/vue/src/{confirm-dialog,confirm-popup,drawer,popover,split-button,speed-dial}/*-style.ts packages/vue/src/confirm-dialog/BaseConfirmDialog.ts packages/vue/src/confirm-popup/BaseConfirmPopup.ts packages/vue/src/split-button/BaseSplitButton.ts packages/vue/src/speed-dial/BaseSpeedDial.ts
git commit -m "feat(gap-064): port G3-D Aura structural CSS to Vue"
```

---

### Task 8: Spec §8 gates G-D1, G-D2, G-D3 and the D5 decision

**Files:**

- Modify: `packages/themes/test/utils/g3d-port.mjs` (`KEPT` only), the affected style modules (regenerated), the Spec (§17 Gate results, appended)

- [ ] **Step 1: G-D2 — SpeedDial trigger reachability.** Run `SpeedDial closed, opened and closed by a real click (F-D1, G-D2)` in three engines, both frameworks, `--retries=0`. Must pass; otherwise stop.

- [ ] **Step 2: G-D3 — Angular Drawer wrapper.** Run the four `Drawer <pos> size, tokens and placement` tests (Angular) in three engines. The wrapper height must be ≥ drawer height − 1; otherwise stop.

- [ ] **Step 3: G-D1 — candidates R-D2..R-D5.** For each candidate, in three engines and both frameworks, compare the relevant computed values and element boxes with the rule present versus removed (inject a temporary override in the page that resets exactly the candidate's properties to their initial values, e.g. `.u-popover-content { position: static; }`; never edit the module for the comparison):

| Candidate                       | Story / state                    | Compare                                  |
| ------------------------------- | -------------------------------- | ---------------------------------------- |
| R-D2 `.u-speeddial-item-hidden` | `speeddial--directions`, open    | hidden item box and `visibility`         |
| R-D3 `.u-confirmdialog-footer`  | `confirmdialog--default`, open   | footer button boxes (inline layout, gap) |
| R-D4 icon/message               | `confirmdialog--with-icon`, open | icon box width, message box width        |
| R-D5 `.u-popover-content`       | `popover--default`, open         | content box position                     |

A candidate with no difference is dropped (removed from `KEPT`). Regenerate the affected modules with the CLI and rerun the fidelity test.

- [ ] **Step 4: Record** the gate results in the Spec as `## 17. Gate results (Plan Task 8, <date>)` (measurements per candidate and engine, and the final `KEPT`).

- [ ] **Step 5: Commit**

```bash
git add packages/themes/test/utils/g3d-port.mjs packages/ng/src/*/*-style.ts packages/vue/src/*/*-style.ts docs/superpowers/specs/2026-10-07-gap-064-g3d-overlays-composites-design.md
git commit -m "test(gap-064): record G3-D gates G-D1..G-D3 and the D5 decision"
```

---

### Task 9: X-1 selector reach test

**Files:**

- Modify: `packages/ng/e2e/g3d-aura-styles.spec.ts`, `packages/vue/e2e/g3d-aura-styles.spec.ts` (append)

- [ ] **Step 1: Append to both specs**

```ts
const ATTR = FW === "ng" ? "data-u-ng-style" : "data-u-style";
/** ADR-052 X-1: every emitted selector part must match the rendered DOM in a declared story and state. */
const REACH: ReadonlyArray<{ key: string; runs: ReadonlyArray<readonly [string, Kind, string]> }> =
  [
    { key: "confirmdialog", runs: [[`${FW}-confirmdialog--with-icon`, "click", ".u-dialog"]] },
    { key: "confirmpopup", runs: [[`${FW}-confirmpopup--with-icon`, "click", ".u-confirmpopup"]] },
    {
      key: "drawer",
      runs: (["left", "right", "top", "bottom", "full", "rtl"] as const).map(
        (p) => [DRAWER[p], DRAWER_OPEN, ".u-drawer"] as const
      ),
    },
    { key: "popover", runs: [[`${FW}-popover--default`, "click", ".u-popover"]] },
    {
      key: "splitbutton",
      runs: [
        [`${FW}-splitbutton--default`, "rest", ".u-splitbutton"],
        [`${FW}-splitbutton--disabled`, "rest", ".u-splitbutton"],
      ],
    },
    {
      key: "speeddial",
      runs: [
        [`${FW}-speeddial--directions`, "speeddial", ".u-speeddial"],
        [`${FW}-speeddial--mask`, "speeddial", ".u-speeddial-mask"],
      ],
    },
  ];
/** ADR-052 X-1 class K: emitted by a cited source under a state no story exercises (none expected). */
const K: Record<string, Record<string, string>> = {};
const STATE =
  /::?(before|after|-webkit-[a-z-]+)\b|:(hover|focus-visible|focus|active|dir\([a-z]+\))/g;

for (const r of REACH) {
  test(`${T}/${r.key} selector reach G3-D reach`, async ({ page }) => {
    const hit = new Map<string, string>();
    let parts: string[] = [];
    for (const [story, kind, ready] of r.runs) {
      await go(page, story);
      await state(page, kind, ready);
      await expect(page.locator(`style[${ATTR}="${r.key}"]`)).toBeAttached();
      const res = await page.evaluate(
        ([key, attr, re]) => {
          const sheet = (
            document.querySelector(`style[${attr}="${key}"]`) as HTMLStyleElement | null
          )?.sheet;
          if (!sheet) return null;
          const all: string[] = [];
          for (const rule of Array.from(sheet.cssRules) as CSSStyleRule[]) {
            if (!rule.selectorText) continue;
            let depth = 0,
              cur = "";
            for (const ch of rule.selectorText) {
              if (ch === "(") depth++;
              if (ch === ")") depth--;
              if (ch === "," && !depth) {
                all.push(cur.trim());
                cur = "";
              } else cur += ch;
            }
            all.push(cur.trim());
          }
          return all.map((s) => {
            const stripped = s.replace(new RegExp(re, "g"), "");
            return { s, stripped, n: stripped ? document.querySelectorAll(stripped).length : 0 };
          });
        },
        [r.key, ATTR, STATE.source] as const
      );
      expect(res, `structural sheet for ${r.key}`).not.toBeNull();
      for (const x of res!)
        expect(x.stripped, `selector part "${x.s}" strips to empty`).not.toBe("");
      parts = [...new Set([...parts, ...res!.map((x) => x.s)])];
      for (const x of res!) if (x.n > 0 && !hit.has(x.s)) hit.set(x.s, `${story}/${kind}`);
    }
    const unreached = parts.filter((s) => !hit.has(s) && !(K[r.key] ?? {})[s]);
    expect(unreached, "selector parts with no R evidence and no K citation").toEqual([]);
    test
      .info()
      .annotations.push({ type: "reach", description: `${parts.length} parts; R ${hit.size}` });
  });
}
```

- [ ] **Step 2: Run** in Chromium, both frameworks, `--retries=0`. Expected: pass. An unreached part is a stop condition (a K citation needs a Spec decision).

- [ ] **Step 3: Commit**

```bash
git add packages/ng/e2e/g3d-aura-styles.spec.ts packages/vue/e2e/g3d-aura-styles.spec.ts
git commit -m "test(gap-064): add the G3-D X-1 selector reach test"
```

---

### Task 10: Accessibility differential, evidence and CI wiring

**Files:**

- Create: `scripts/provenance/validate-g3d-accessibility.mjs`, `scripts/provenance/validate-g3d-accessibility.test.mjs`, `docs/architecture/research/2026-10-07-gap-064-g3d-accessibility-preexisting.md`
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Validator.** Create `scripts/provenance/validate-g3d-accessibility.mjs` as a copy of `validate-g3c2-accessibility.mjs` with only these changes: every `g3c2`/`G3-C2` → `g3d`/`G3-D` (script name, spec path `packages/<fw>/e2e/g3d-aura-styles.spec.ts`, messages, header comment), `PREEXISTING_PATH` → `docs/architecture/research/2026-10-07-gap-064-g3d-accessibility-preexisting.md`, `EXPECTED_STORY_COUNT` → `{ ng: 17, vue: 17 }`, and the header's grep-invert text → `"G3-A|G3-B|G3-C1|G3-C2|G3-D"`. The G3-C2 file stays byte-identical.

- [ ] **Step 2: Self-test.** Create `scripts/provenance/validate-g3d-accessibility.test.mjs` as a copy of `validate-g3c2-accessibility.test.mjs` with the same renames, `STORIES` length 17, and the wrong-count case expecting `lists 16 G3-D stories, expected 17`. Run `node --test scripts/provenance/validate-g3d-accessibility.test.mjs`. Expected: pass.

- [ ] **Step 3: After-port run and pre-existing record.** Run Docker `d` mode (`--retries=0`) to produce after-port envelopes. Derive the rows observed both before (Task 3 Step 3) and after. Write them to the pre-existing record, using the G3-C2 record's header structure (date, type, what this is, derivation with both commit SHAs, consumer, the rule that introduced rows are not listed, the fingerprint table). Rows observed only after the port are **introduced**: do not add them; list them for the Task 11 review gate.

- [ ] **Step 4: CI wiring.** In `.github/workflows/ci.yml`: change the strict run's `--grep-invert "G3-A|G3-B|G3-C1|G3-C2"` to `--grep-invert "G3-A|G3-B|G3-C1|G3-C2|G3-D"`, and append, after the G3-C2 upload step, three steps that mirror the G3-C2 block with `g3c2`→`g3d` and `G3-C2`→`G3-D` (verification specs, differential validation with `tee` into `test-results/g3d-accessibility/`, report upload `g3d-accessibility-reports-<fw>`). No other workflow change.

- [ ] **Step 5: Verify.** Run `node scripts/provenance/validate-g3d-accessibility.mjs ng` and `vue` on the Docker after-port envelopes. Expected: OK, or FAIL listing only the introduced rows reserved for Task 11. Run the Docker `ci ng` and `ci vue` simulations.

- [ ] **Step 6: Commit**

```bash
git add scripts/provenance/validate-g3d-accessibility.mjs scripts/provenance/validate-g3d-accessibility.test.mjs docs/architecture/research/2026-10-07-gap-064-g3d-accessibility-preexisting.md .github/workflows/ci.yml
git commit -m "ci(gap-064): add the G3-D differential accessibility validator and CI steps"
```

---

### Task 11: Visual and accessibility review gate — HARD USER STOP

- [ ] **Step 1: Produce the review package** (Docker, `--retries=0`): for every Spec §9.2 screenshot, the before baseline, the after capture and the diff, grouped by component and framework; the computed-value evidence for F-D1..F-D3; the list of introduced accessibility rows with rule, story and target; the gate results (§17); and the size deltas.

- [ ] **Step 2: Stop and present the package to the user.** Do not update any baseline, add any `ACCESSIBILITY_BASELINE.md` row or continue until the user approves (per screenshot group and per accessibility row). Record the decisions in the Spec as an amendment if any rule text changes.

- [ ] **Step 3: After approval only:** update the approved baselines with Docker `update "<grep>"` (approved groups only), add only the approved accessibility rows to `ACCESSIBILITY_BASELINE.md` with the tag the user specifies, rerun `compare` for every updated group, and commit:

```bash
git add packages/ng/e2e/g3d-aura-styles.spec.ts-snapshots packages/vue/e2e/g3d-aura-styles.spec.ts-snapshots docs/architecture/ACCESSIBILITY_BASELINE.md
git commit -m "test(gap-064): accept the reviewed G3-D baselines and accessibility rows"
```

---

### Task 12: Provenance, MIGRATION and final verification

**Files:**

- Modify: `docs/architecture/provenance/ng.json`, `docs/architecture/provenance/vue.json`, `docs/architecture/MIGRATION.md`

- [ ] **Step 1: Provenance (AC11).** For every source file under `packages/{ng,vue}/src` changed on this branch since `c567039` (`git diff --name-only c567039...HEAD -- packages/ng/src packages/vue/src`), add or update a manifest entry: one `reference-derived` entry per style file (12), and entries for the changed component files, stories and specs (`authored` for Ultimate-authored tests and stories). Verify completeness with a script over that changed-file list against `ultimateDestination` (never `provenance:validate`). Record the result in the ledger.

- [ ] **Step 2: `MIGRATION.md` §8.** Add a "GAP-064 G3-D" block with the wording proposed for Plan Review (PR-3): the six components use their Aura tokens; the four style-key renames; F-D1..F-D3 as defect corrections; SpeedDial disabled dimming via `disabled.opacity`; PX-D1..PX-D7.

- [ ] **Step 3: Final verification (fresh, `--retries=0`).** Unit suites, typechecks, the fidelity test, `test:scripts`; Docker `d` (all G3-D tests, both frameworks, three engines), `regression` (everything else, including SSR and the earlier G3 tranches, with U2 the only allowed failure), `ci ng`, `ci vue`, `ci react`; the D-0 (per PR-1) and C2-0 specs; size (AC9). Every result is reported per AC12.

- [ ] **Step 4: Commit**

```bash
git add docs/architecture/provenance/ng.json docs/architecture/provenance/vue.json docs/architecture/MIGRATION.md
git commit -m "docs(gap-064): record G3-D provenance and consumer-visible changes"
```

After Task 12 the work stops for the final review and closeout authorization; merge and push are separate decisions.

## Spec coverage

| Spec                      | Task                                                                                                            |
| ------------------------- | --------------------------------------------------------------------------------------------------------------- |
| §3.1 renames              | 6, 7                                                                                                            |
| §4 mapping, §5 counts     | 4, 6, 7                                                                                                         |
| §6.1 D3, §6.2 D4, §6.4 D5 | 4, 8                                                                                                            |
| §6.3 D-D3c result         | 4 (R-D1 retained)                                                                                               |
| §7 F-D1..F-D3             | 2, 3, 8                                                                                                         |
| §8 order and gates        | 4, 8                                                                                                            |
| §9.1 stories              | 1                                                                                                               |
| §9.2 screenshots          | 2, 3, 11                                                                                                        |
| §9.3 layout               | 2                                                                                                               |
| §9.4 reach                | 9                                                                                                               |
| §9.5 AC1–AC2              | 5; AC3 4; AC4 9; AC5 6, 7; AC6 3, 11; AC7 2; AC8 10, 11; AC9 7, 12; AC10 7, 12; AC11 12; AC12 all browser steps |
| §10 CI                    | 10                                                                                                              |
| §11 docs                  | 12                                                                                                              |
| §12 tooling               | 4, 10                                                                                                           |
| §16 OI-D1..OI-D4 and lock | Global Constraints, 2, 4                                                                                        |

## Items for Plan Review

- **PR-1 — D-0 spec versus the ported gutter (Spec conflict, decision needed).** Popover group 1 and ConfirmPopup group 1 add `margin-block-start: dt('<key>.gutter')`, so after the port each container's box sits one gutter below the trigger's bottom, as upstream intends. D-0's `packages/ng/e2e/overlay-anchoring.spec.ts` asserts a zero vertical offset, and Spec AC10 requires it to pass unchanged. Options:
  - (a) **amend AC10 to allow a one-line D-0 spec change**: measure the anchor as the container's top minus its computed `margin-top` (the positioned origin, which D-0 owns), keeping the left-edge check unchanged (recommended; D-0's placement contract is unchanged, and the gutter is the ported upstream style);
  - (b) keep the D-0 spec unchanged and omit `margin-block-start` from groups 1 (a fidelity deviation that needs a new PX);
  - (c) other.
- **PR-2 — SpeedDial `Directions` story layout.** Five dials in a grid with 12rem vertical padding so up/down lists stay inside the viewport. Confirm, or specify another arrangement.
- **PR-3 — `MIGRATION.md` wording** (Task 12 Step 2): approve the listed content; exact sentences are drafted in Task 12 and shown at the final review.
- **PR-4 — The Vue `Drawer Left` story is the existing `Default`** (click to open); Angular uses `Open`. Confirm that no new Vue `Left` story is needed.

## After this plan

Final review and closeout (separately authorized), then merge and push decisions. G3-E remains after G3-D (D-G3-6).

## Plan Review decisions (2026-10-07, user)

- **PR-1 = (a).** Task 7 Step 4 updates the D-0 overlay-positioning e2e assertion to account for the computed `margin-block-start` gutter: the overlay top is compared with the trigger's bottom plus the computed margin. The upstream gutter rule stays; no parity exception is introduced. This is strictly a correction to the D-0 test contract.
- **PR-2 — approved.** The SpeedDial `Directions` story uses five dials in a grid with 12rem vertical padding, as verification scaffolding only; it is not product layout behaviour.
- **PR-3 — approved with conditions.** The `MIGRATION.md` update is limited to actual consumer-visible G3-D changes (overlay/composite styling parity, the retained SpeedDial PX-D3 action-styling difference, and any other actual G3-D consumer-visible effect), with no unrelated GAP-064 items or CI/debt changes. The exact wording is shown at the final review before the task is considered complete.
- **PR-4 — approved.** Vue Drawer left coverage reuses the existing Vue `Default` story; no Vue `Left` story is created.
- **SpeedDial layout check (user instruction).** During implementation, verify whether closed SpeedDial actions occupy layout space and push surrounding content. If it is existing Ultimate behaviour that needs a DOM/runtime/behavioural change, record a separate gap and do not fix it. If an already-approved upstream CSS rule resolves it within the CSS-only scope, it is ported normally. No runtime fix and no scope expansion.
