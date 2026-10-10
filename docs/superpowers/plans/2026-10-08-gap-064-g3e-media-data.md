# GAP-064 G3-E — Media and Data, Verification-First Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Status:** **Approved** (Plan Review, user, 2026-10-08; PR-1..PR-5 ruled, see "Plan Review decisions"). Execution: Native (inline), task by task.

**Goal:** Bring Carousel, Galleria, Image, ImageCompare, DataView, OrderList, OrganizationChart (Vue) and PickList to measured Prime parity for their canonical cases, judged by rendered comparison against PrimeNG 21.1.9 (Angular) and PrimeVue 4.5.5 (Vue), porting `@primeuix/styles` 2.0.3 (and, for Angular, PrimeNG-local CSS) only where the classified comparison calls for it.

**Architecture:**

- **E-0** builds the verification ground: committed local media fixtures served identically to both Prime reference apps and both Ultimate Storybooks; the minimum verification stories; a G3-E runner in `tooling/prime-reference/` (clock control, action scripts, per-batch selection); and the tranche tooling skeleton (upstream fixture, data module, fidelity test, accessibility validator, Ultimate regression specs), copied from G3-D per ADR-052 X-9.
- **Each batch (E-1..E-4)** runs three tasks: **A** finalize cases → before-port Prime comparison and before-port Ultimate baselines → batch record with classification and the proposed mapping → **HARD USER STOP**; **B** port exactly the approved record (generated CSS, ADR-051 key renames, fidelity data, reach entries); **C** after-port Prime comparison and Ultimate regression evidence → review → **HARD USER STOP** → accept baselines, record status.
- The data values of each batch (upstream group inventory, omission tags, selector mapping, base/runtime roles, PrimeNG-local rules) are **produced and approved in that batch's Task A record**, because the Spec is verification-first: they are not knowable before the before-port comparison. Task B transcribes the approved record; it never invents data.

**Tech Stack:** Angular 21 / Vue 3.5 style modules (`/*css*/` strings with `dt()`); Vitest (themes, Angular unit-test builder, Vue test-utils); Playwright 1.63 (root `ng-*`/`vue-*` projects for Ultimate regression; the harness's own config for Prime comparison); Docker `mcr.microsoft.com/playwright:v1.63.0-jammy` (arm64 locally); Node 24.15 (`~/.nvm/versions/node/v24.15.0/bin`) for install and runs; Node `--test` for scripts.

**Spec:** `docs/superpowers/specs/2026-10-08-gap-064-g3e-media-data-design.md` (approved, §14).
**Process:** `docs/architecture/PARITY_PLAYBOOK.md`. **Research:** `docs/architecture/research/2026-10-08-gap-064-g3e-research.md` (`ccb13f3`).
**Branch:** `feature/gap-064-g3e-media-data`. SDD workspace (git-ignored): `.superpowers/sdd/2026-10-08-gap-064-g3e-media-data/`.

## Global Constraints

- **Oracles:** PrimeNG 21.1.9 rendered → Angular; PrimeVue 4.5.5 rendered → Vue. Never substitute one for the other. Prime source is diagnostic; Ultimate baselines are regression evidence.
- **Flow per batch (Spec §3):** before-port comparison → classify → authorized work → after-port comparison → record. At most one confirmation run after review fixes; a further iteration on the same case is a stop (Playbook §8.3).
- **Authorized product changes (Spec §7):** style-module `css` only (generated from the data module), ADR-051 key renames `image-compare`→`imagecompare`, `data-view`→`dataview`, `order-list`→`orderlist`, `pick-list`→`picklist`, `organization-chart`→`organizationchart`, and A/B fixes that live in the style module. In component files only the `css` block, the registered key and one doc-comment line may change.
- **Not authorized:** DOM, template, class-resolver, input/output/emit, runtime or public-API changes; Listbox, Paginator, Button changes; any global/base rule or `*, ::before, ::after` box-sizing rule (GAP-098); GAP-099..102 remediation; React; `inheritAttrs`/`$attrs` changes (Spec §14.7).
- **PrimeNG-local CSS (OI-E1):** in the Angular port only, where Ultimate has the feature or host; G3-A..G3-D unchanged.
- **Stories (G3E-2):** only those listed in Task 2; existing stories change only their image source (G3E-1), and the Angular DataView repair (§4.1). The Angular Galleria `Default` story keeps `max-width` on the component (PR-5).
- **Fixtures (G3E-1):** no `primefaces.org` or network URL in any G3-E story or reference case.
- **Clock (G3E-4):** `page.clock` only in the harness and Ultimate regression specs; no product timing change.
- **No-reference (G3E-7):** Vue DataView `loading` is recorded as `no Prime reference`, never compared, never verified/D/defect.
- **Frozen tooling:** `g3a-port.mjs`, `g3b-port.mjs`, `g3c1-port.mjs`, `g3c2-port.mjs`, `g3d-port.mjs`, `validate-g3{a,b,c1,c2,d}-accessibility.mjs`, their tests, and the pilot runner `tooling/prime-reference/e2e/parity.spec.ts` stay byte-identical (the additive `clock` field in `probe.ts` is the only shared-harness change).
- **Evidence runs:** `--retries=0`, Docker for baselines and parity evidence; Chromium for parity, Chromium/Firefox/WebKit for Ultimate regression.
- **Provenance (X-12):** every changed file under `packages/{ng,vue}/src` gets a manifest entry; evidence is a changed-file completeness check, never `provenance:validate`.
- **Size (X-10):** per batch against its branch point; 15 % hard stop.
- **Stop conditions (Spec §12):** stop and report, no workaround, on: parity needing a DOM/template/runtime/API change; a fix needing a new rule category, ADR or second iteration; a story repair needing a product change; size above 15 %; a regression in existing tranche checks; a check that could only pass by editing data, evidence or tests.

## Review Focus

1. **A fixture that fails to load on one side.** A blank image on both sides would look like a match. Pinned in Task 1 (`fixtures.spec.ts` asserts `naturalWidth === 800` in all four servers) and Task 3 (the runner asserts every `img` part is loaded).
2. **Autoplay or transition caught mid-flight.** Carousel circular and Galleria must be captured with the clock installed; pinned in Task 3 (clock installed before navigation; the noise re-load must be 0).
3. **A framework-specific case routed to the wrong oracle or framework.** Angular-only (filters, drag-drop, DataView loading) and Vue-only (OrganizationChart) cases; pinned in Task 3 (`frameworks` field; the runner refuses a case without a story for that framework) and Task 15 (Vue DataView loading recorded as `no Prime reference`).
4. **RTL set on the wrong element.** PrimeNG ImageCompare detects RTL in JS; the shared CSS uses `:dir(rtl)`. Pinned in Task 3 (`direction` fact) and Task 5 (RTL cases assert the root's computed `direction` is `rtl` on both sides before comparing).
5. **A probe match hiding a visible difference (R-3).** Pinned in Task 3: a probe match with differing pixels is labelled `review image`, never `match`.

---

### Task 1: Media fixtures and serving (E-0, G3E-1, OI-E2)

**Files:**

- Create: `tooling/prime-reference/fixtures/generate.mjs`
- Create: `tooling/prime-reference/fixtures/media/landscape-1.png`, `landscape-2.png`, `landscape-3.png`, `landscape-4.png` (generated)
- Modify: `packages/ng/.storybook/main.ts`, `packages/vue/.storybook/main.ts` (one `staticDirs` entry each)
- Modify: `tooling/prime-reference/vue/vite.config.ts` (`publicDir`), `tooling/prime-reference/ng/angular.json` (`assets`)
- Create: `tooling/prime-reference/e2e/fixtures.spec.ts`

**Interfaces:**

- Produces: fixture URLs `/media/landscape-1.png` … `/media/landscape-4.png`, identical in all four servers (ports 6001, 6003, 6021, 6022). 800 × 600 PNG each.

- [ ] **Step 1: Write the failing fixture test**

```ts
// tooling/prime-reference/e2e/fixtures.spec.ts
import { expect, test } from "@playwright/test";

/** G3E-1: every fixture loads, at 800 × 600, from every server that renders a G3-E case. */
const SERVERS = [
  "http://localhost:6001",
  "http://localhost:6003",
  "http://localhost:6021",
  "http://localhost:6022",
];
const FILES = ["landscape-1.png", "landscape-2.png", "landscape-3.png", "landscape-4.png"];

for (const server of SERVERS) {
  test(`fixtures load from ${server}`, async ({ page }) => {
    for (const file of FILES) {
      const res = await page.request.get(`${server}/media/${file}`);
      expect(res.status(), `${server}/media/${file}`).toBe(200);
      expect(res.headers()["content-type"]).toContain("image/png");
    }
    await page.goto(`${server}/media/${FILES[0]}`);
    const size = await page
      .locator("img")
      .evaluate((i: HTMLImageElement) => [i.naturalWidth, i.naturalHeight]);
    expect(size).toEqual([800, 600]);
  });
}
```

- [ ] **Step 2: Run it to verify it fails**

Run: `PATH=$HOME/.nvm/versions/node/v24.15.0/bin:$PATH npx playwright test -c tooling/prime-reference/playwright.config.ts fixtures`
Expected: FAIL, status 404 for every server.

- [ ] **Step 3: Write the generator and generate the four images**

```js
// tooling/prime-reference/fixtures/generate.mjs
// G3E-1: generates the four 800 × 600 verification images (no third-party content).
// Run once from the repository root: node tooling/prime-reference/fixtures/generate.mjs
// Shapes only (no text), so the output does not depend on fonts.
import { writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";

const PALETTES = [
  ["#0f766e", "#99f6e4", "#f59e0b"],
  ["#1d4ed8", "#bfdbfe", "#ef4444"],
  ["#7c3aed", "#ddd6fe", "#10b981"],
  ["#b45309", "#fde68a", "#2563eb"],
];
const browser = await chromium.launch();
const page = await browser.newPage();
for (const [i, [dark, light, accent]] of PALETTES.entries()) {
  const dataUrl = await page.evaluate(
    ({ dark, light, accent, i }) => {
      const c = document.createElement("canvas");
      c.width = 800;
      c.height = 600;
      const x = c.getContext("2d");
      x.fillStyle = light;
      x.fillRect(0, 0, 800, 600);
      x.fillStyle = dark;
      x.fillRect(0, 400, 800, 200);
      x.fillStyle = accent;
      x.beginPath();
      x.arc(200 + i * 120, 220, 110, 0, Math.PI * 2);
      x.fill();
      x.fillStyle = dark;
      for (let k = 0; k <= i; k++) x.fillRect(560, 80 + k * 70, 160, 40);
      return c.toDataURL("image/png");
    },
    { dark, light, accent, i }
  );
  writeFileSync(
    new URL(`./media/landscape-${i + 1}.png`, import.meta.url),
    Buffer.from(dataUrl.split(",")[1], "base64")
  );
}
await browser.close();
console.log("generated 4 images");
```

Run: `mkdir -p tooling/prime-reference/fixtures/media && node tooling/prime-reference/fixtures/generate.mjs && ls -l tooling/prime-reference/fixtures/media`
Expected: four PNG files, each ≤ 40 KB.

- [ ] **Step 4: Serve the fixtures**

`packages/ng/.storybook/main.ts` and `packages/vue/.storybook/main.ts` — add to `config` (after `addons`):

```ts
  // GAP-064 G3-E (G3E-1, OI-E2): committed local media fixtures for verification stories.
  staticDirs: [{ from: "../../../tooling/prime-reference/fixtures", to: "/" }],
```

`tooling/prime-reference/vue/vite.config.ts`:

```ts
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

// G3E-1: the shared fixtures are served at /media/<file>, as in the Ultimate Storybooks.
export default defineConfig({ plugins: [vue()], publicDir: "../fixtures" });
```

`tooling/prime-reference/ng/angular.json` — `projects.prime-reference-ng.architect.build.options`:

```json
"assets": [{ "glob": "**/*", "input": "../fixtures", "output": "/" }],
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `PATH=$HOME/.nvm/versions/node/v24.15.0/bin:$PATH npx playwright test -c tooling/prime-reference/playwright.config.ts fixtures`
Expected: PASS, 4 tests.

- [ ] **Step 6: Commit**

```bash
git add tooling/prime-reference/fixtures tooling/prime-reference/e2e/fixtures.spec.ts tooling/prime-reference/vue/vite.config.ts tooling/prime-reference/ng/angular.json packages/ng/.storybook/main.ts packages/vue/.storybook/main.ts
git commit -m "test(gap-064): add the G3-E local media fixtures and serve them"
```

---

### Task 2: Verification stories and the story repair (E-0, G3E-2, Spec §4.1, §5.2)

**Files (append unless stated):**

- Modify: `packages/{ng,vue}/src/image/image.stories.ts` (fixture `src` only)
- Modify: `packages/{ng,vue}/src/image-compare/image-compare.stories.ts` (fixture `src`; add `Sized`, `Rtl`)
- Modify: `packages/{ng,vue}/src/carousel/carousel.stories.ts` (add `Vertical`, `Rtl`)
- Modify: `packages/{ng,vue}/src/galleria/galleria.stories.ts` (fixture `src`; add `WithoutThumbnails`, `FullScreen`)
- Modify: `packages/ng/src/data-view/data-view.stories.ts` (repair `Default`; add `Grid`, `Paginator`, `Empty`, `Loading`)
- Modify: `packages/vue/src/data-view/data-view.stories.ts` (add `Grid`, `Paginator`, `Empty`; **no** `Loading` comparison story is needed, but see Step 4)
- Modify: `packages/ng/src/order-list/order-list.stories.ts`, `packages/ng/src/pick-list/pick-list.stories.ts` (add `Filter`)
- Modify: `packages/vue/src/organization-chart/organization-chart.stories.ts` (add `SingleSelection`, `MultipleSelection`, `Collapsible`)

**Interfaces:**

- Produces story ids used by Tasks 3–17: `ng|vue-image--default|--with-preview`, `ng|vue-imagecompare--default|--sized|--rtl`, `ng|vue-carousel--default|--circular-with-autoplay|--vertical|--rtl`, `ng|vue-galleria--default|--without-thumbnails|--full-screen`, `data-dataview--default|--grid|--paginator|--empty` (both), `data-dataview--loading` (ng), `data-orderlist--filter`, `data-picklist--filter` (ng), `panel-organizationchart--single-selection|--multiple-selection|--collapsible` (vue).

- [ ] **Step 1: Write the failing story-render test**

Create `tooling/prime-reference/e2e/stories.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

/** G3E-2: every G3-E verification story renders its root, with no page error and no network image. */
const STORIES: ReadonlyArray<readonly [number, string, string]> = [
  ...(["ng", "vue"] as const).flatMap((fw) => {
    const p = fw === "ng" ? 6001 : 6003;
    return [
      [p, `${fw}-image--default`, ".u-image"],
      [p, `${fw}-image--with-preview`, ".u-image"],
      [p, `${fw}-imagecompare--default`, ".u-image-compare"],
      [p, `${fw}-imagecompare--sized`, ".u-image-compare"],
      [p, `${fw}-imagecompare--rtl`, ".u-image-compare"],
      [p, `${fw}-carousel--vertical`, ".u-carousel-vertical"],
      [p, `${fw}-carousel--rtl`, ".u-carousel"],
      [p, `${fw}-galleria--default`, ".u-galleria"],
      [p, `${fw}-galleria--without-thumbnails`, ".u-galleria"],
      [p, `${fw}-galleria--full-screen`, "button"],
      [p, "data-dataview--default", ".u-data-view"],
      [p, "data-dataview--grid", ".u-data-view-grid"],
      [p, "data-dataview--paginator", ".u-paginator"],
      [p, "data-dataview--empty", ".u-data-view"],
    ] as const;
  }),
  [6001, "data-dataview--loading", "[role=status]"],
  [6001, "data-orderlist--filter", "input[role=searchbox]"],
  [6001, "data-picklist--filter", "input[role=searchbox]"],
  [6003, "panel-organizationchart--single-selection", ".u-organization-chart"],
  [6003, "panel-organizationchart--multiple-selection", ".u-organization-chart"],
  [6003, "panel-organizationchart--collapsible", ".u-organization-chart"],
];

for (const [port, id, root] of STORIES) {
  test(`${id} renders`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on(
      "request",
      (r) => r.url().includes("primefaces.org") && errors.push(`network: ${r.url()}`)
    );
    await page.goto(`http://localhost:${port}/iframe.html?id=${id}&viewMode=story`);
    await expect(page.locator(root).first()).toBeAttached();
    for (const img of await page.locator("#storybook-root img").all())
      expect(await img.evaluate((i: HTMLImageElement) => i.naturalWidth), id).toBe(800);
    expect(errors, id).toEqual([]);
  });
}
```

Expected Angular DataView text check (add to the same file):

```ts
test("data-dataview--default renders its item text (Spec §4.1 repair)", async ({ page }) => {
  await page.goto("http://localhost:6001/iframe.html?id=data-dataview--default&viewMode=story");
  await expect(page.locator(".u-data-view-list > li")).toHaveText(["Apple", "Banana"]);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `PATH=$HOME/.nvm/versions/node/v24.15.0/bin:$PATH npx playwright test -c tooling/prime-reference/playwright.config.ts stories`
Expected: FAIL — unknown story ids, NG0950 for `data-dataview--default`, `primefaces.org` requests in the media stories.

- [ ] **Step 3: Implement the Angular stories**

Image (`packages/ng/src/image/image.stories.ts`): replace both `src` values with `"/media/landscape-1.png"`.

ImageCompare (`packages/ng/src/image-compare/image-compare.stories.ts`): in `Default`, replace the two image URLs with `/media/landscape-1.png` (left) and `/media/landscape-2.png` (right). Append:

```ts
/** GAP-064 G3-E verification story: sized by a wrapper, so the clipping cases do not depend on GAP-102. */
export const Sized: Story = {
  render: () => ({
    template: `
      <div style="width: 20rem;">
        <u-image-compare>
          <img left src="/media/landscape-1.png" alt="before" />
          <img right src="/media/landscape-2.png" alt="after" />
        </u-image-compare>
      </div>
    `,
  }),
};

/** GAP-064 G3-E verification story: RTL (upstream :dir(rtl) clip rule). */
export const Rtl: Story = {
  render: () => ({
    template: `
      <div dir="rtl" style="width: 20rem;">
        <u-image-compare>
          <img left src="/media/landscape-1.png" alt="before" />
          <img right src="/media/landscape-2.png" alt="after" />
        </u-image-compare>
      </div>
    `,
  }),
};
```

Carousel (`packages/ng/src/carousel/carousel.stories.ts`) — append:

```ts
/** GAP-064 G3-E verification story: vertical orientation. */
export const Vertical: Story = {
  args: { value: items, numVisible: 1, numScroll: 1, orientation: "vertical" },
  render: (args) => ({
    props: args,
    template: `
      <u-carousel [value]="value" [numVisible]="numVisible" [numScroll]="numScroll" [orientation]="orientation">
        <ng-template #item let-item>
          <div style="padding: 2rem; text-align: center; border: 1px solid #ddd;">{{ item }}</div>
        </ng-template>
      </u-carousel>
    `,
  }),
};

/** GAP-064 G3-E verification story: RTL (upstream :dir(rtl) rules). */
export const Rtl: Story = {
  args: { value: items, numVisible: 3, numScroll: 1 },
  render: (args) => ({
    props: args,
    template: `
      <div dir="rtl">
        <u-carousel [value]="value" [numVisible]="numVisible" [numScroll]="numScroll">
          <ng-template #item let-item>
            <div style="padding: 1rem; text-align: center; border: 1px solid #ddd; margin: 0 0.5rem;">{{ item }}</div>
          </ng-template>
        </u-carousel>
      </div>
    `,
  }),
};
```

Galleria (`packages/ng/src/galleria/galleria.stories.ts`): set `images` to `["/media/landscape-1.png", "/media/landscape-2.png", "/media/landscape-3.png"]`; `Default` keeps `style="max-width: 40rem;"` on `<u-galleria>` unchanged (PR-5). Append (same setup as `Default`: `max-width` on the component):

```ts
/** GAP-064 G3-E verification story: item navigators without thumbnails. */
export const WithoutThumbnails: Story = {
  render: () => ({
    props: { images },
    template: `
      <u-galleria [value]="images" [showThumbnails]="false" style="max-width: 40rem;">
        <ng-template #item let-item><img [src]="item" style="width: 100%; display: block;" /></ng-template>
      </u-galleria>
    `,
  }),
};

/** GAP-064 G3-E verification story: full screen, opened through its trigger. */
export const FullScreen: Story = {
  render: () => ({
    props: { images },
    template: `
      <button type="button" (click)="g.openFullScreen()">Show</button>
      <u-galleria #g [value]="images" [fullScreen]="true">
        <ng-template #item let-item><img [src]="item" style="width: 100%; display: block;" /></ng-template>
        <ng-template #thumbnail let-item><img [src]="item" style="width: 5rem; display: block;" /></ng-template>
      </u-galleria>
    `,
  }),
};
```

DataView (`packages/ng/src/data-view/data-view.stories.ts`) — replace `Default` (repair) and append:

```ts
const fruits = [{ name: "Apple" }, { name: "Banana" }];
const six = ["Apple", "Banana", "Cherry", "Date", "Elderberry", "Fig"].map((name) => ({ name }));
const itemTemplate = (item: unknown) => (item as { name: string }).name;

/** Repaired (G3-E Spec §4.1): binds the required itemTemplate input explicitly. */
export const Default: Story = {
  render: () => ({
    props: { value: fruits, itemTemplate },
    template: `<u-data-view [value]="value" [itemTemplate]="itemTemplate" />`,
  }),
};

/** GAP-064 G3-E verification story: grid layout. */
export const Grid: Story = {
  render: () => ({
    props: { value: fruits, itemTemplate },
    template: `<u-data-view [value]="value" [itemTemplate]="itemTemplate" layout="grid" />`,
  }),
};

/** GAP-064 G3-E verification story: paginator, 2 rows per page. */
export const Paginator: Story = {
  render: () => ({
    props: { value: six, itemTemplate },
    template: `<u-data-view [value]="value" [itemTemplate]="itemTemplate" [paginator]="true" [rows]="2" />`,
  }),
};

/** GAP-064 G3-E verification story: empty value. */
export const Empty: Story = {
  render: () => ({
    props: { value: [], itemTemplate },
    template: `<u-data-view [value]="value" [itemTemplate]="itemTemplate" />`,
  }),
};

/** GAP-064 G3-E verification story: loading (PrimeNG has a loading overlay oracle). */
export const Loading: Story = {
  render: () => ({
    props: { value: fruits, itemTemplate },
    template: `<u-data-view [value]="value" [itemTemplate]="itemTemplate" [loading]="true" />`,
  }),
};
```

OrderList and PickList (Angular) — append:

```ts
// order-list.stories.ts
/** GAP-064 G3-E verification story: filter (PrimeNG canonical; Angular only). */
export const Filter: Story = {
  args: {
    value: ["Apple", "Banana", "Cherry", "Date"].map((name) => ({ name })),
    dataKey: "name",
    filterBy: "name",
  },
};
```

```ts
// pick-list.stories.ts
/** GAP-064 G3-E verification story: filter (PrimeNG canonical; Angular only). */
export const Filter: Story = {
  args: {
    source: ["Apple", "Banana", "Cherry"].map((name) => ({ name })),
    target: [],
    dataKey: "name",
    filterBy: "name",
  },
};
```

- [ ] **Step 4: Implement the Vue stories**

Image, ImageCompare, Galleria: same fixture `src` replacements as Angular. ImageCompare and Carousel additions mirror Angular in Vue syntax:

```ts
// image-compare.stories.ts
/** GAP-064 G3-E verification story: sized by a wrapper, so the clipping cases do not depend on GAP-102. */
export const Sized: Story = {
  render: () => ({
    components: { UImageCompare },
    template: `
      <div style="width: 20rem;">
        <UImageCompare>
          <template #left><img src="/media/landscape-1.png" alt="before" /></template>
          <template #right><img src="/media/landscape-2.png" alt="after" /></template>
        </UImageCompare>
      </div>
    `,
  }),
};
/** GAP-064 G3-E verification story: RTL (upstream :dir(rtl) clip rule). */
export const Rtl: Story = {
  render: () => ({
    components: { UImageCompare },
    template: `
      <div dir="rtl" style="width: 20rem;">
        <UImageCompare>
          <template #left><img src="/media/landscape-1.png" alt="before" /></template>
          <template #right><img src="/media/landscape-2.png" alt="after" /></template>
        </UImageCompare>
      </div>
    `,
  }),
};
```

```ts
// carousel.stories.ts
/** GAP-064 G3-E verification story: vertical orientation. */
export const Vertical: Story = {
  render: () => ({
    components: { UCarousel },
    data: () => ({ items }),
    template: `
      <UCarousel :value="items" :numVisible="1" :numScroll="1" orientation="vertical">
        <template #item="{ data }">
          <div style="padding: 2rem; text-align: center; border: 1px solid #ddd;">{{ data }}</div>
        </template>
      </UCarousel>
    `,
  }),
};
/** GAP-064 G3-E verification story: RTL (upstream :dir(rtl) rules). */
export const Rtl: Story = {
  render: () => ({
    components: { UCarousel },
    data: () => ({ items }),
    template: `
      <div dir="rtl">
        <UCarousel :value="items" :numVisible="3" :numScroll="1">
          <template #item="{ data }">
            <div style="padding: 1rem; text-align: center; border: 1px solid #ddd; margin: 0 0.5rem;">{{ data }}</div>
          </template>
        </UCarousel>
      </div>
    `,
  }),
};
```

```ts
// galleria.stories.ts
/** GAP-064 G3-E verification story: item navigators without thumbnails. */
export const WithoutThumbnails: Story = {
  render: () => ({
    components: { UGalleria },
    data: () => ({ images }),
    template: `
      <div style="max-width: 40rem;">
        <UGalleria :value="images" :showThumbnails="false">
          <template #item="{ item }"><img :src="item" style="width: 100%; display: block;" /></template>
        </UGalleria>
      </div>
    `,
  }),
};
/** GAP-064 G3-E verification story: full screen, opened through its trigger. */
export const FullScreen: Story = {
  render: () => ({
    components: { UGalleria },
    setup() {
      const active = ref(false);
      return { images, active };
    },
    template: `
      <div>
        <button type="button" @click="active = true">Show</button>
        <UGalleria :value="images" fullScreen v-model:fullScreenActive="active">
          <template #item="{ item }"><img :src="item" style="width: 100%; display: block;" /></template>
          <template #thumbnail="{ item }"><img :src="item" style="width: 5rem; display: block;" /></template>
        </UGalleria>
      </div>
    `,
  }),
};
```

(Add `import { ref } from "vue";` to `galleria.stories.ts` if absent.)

```ts
// data-view.stories.ts (Vue)
const six = ["Apple", "Banana", "Cherry", "Date", "Elderberry", "Fig"].map((name) => ({ name }));
/** GAP-064 G3-E verification story: grid layout. */
export const Grid: Story = {
  args: { value: [{ name: "Apple" }, { name: "Banana" }], layout: "grid" },
};
/** GAP-064 G3-E verification story: paginator, 2 rows per page. */
export const Paginator: Story = { args: { value: six, paginator: true, rows: 2 } };
/** GAP-064 G3-E verification story: empty value. */
export const Empty: Story = { args: { value: [] } };
```

Vue DataView `loading` gets **no** story: it has no Prime reference (G3E-7) and no comparison case.

```ts
// organization-chart.stories.ts
const tree = {
  label: "CEO",
  key: "0",
  children: [
    { label: "CTO", key: "0_0" },
    { label: "CFO", key: "0_1" },
  ],
};
/** GAP-064 G3-E verification story: single selection (one node pre-selected). */
export const SingleSelection: Story = {
  args: { value: tree, selectionMode: "single", selectionKeys: { "0_0": true } },
};
/** GAP-064 G3-E verification story: multiple selection (two nodes pre-selected). */
export const MultipleSelection: Story = {
  args: { value: tree, selectionMode: "multiple", selectionKeys: { "0_0": true, "0_1": true } },
};
/** GAP-064 G3-E verification story: collapsible nodes. */
export const Collapsible: Story = { args: { value: tree, collapsible: true } };
```

- [ ] **Step 5: Run the story test to verify it passes**

Run: `PATH=$HOME/.nvm/versions/node/v24.15.0/bin:$PATH npx playwright test -c tooling/prime-reference/playwright.config.ts stories`
Expected: PASS for every id. If `data-dataview--default` still errors, **stop**: the Spec §4.1 classification would be wrong (Spec §12).

- [ ] **Step 6: Run the package unit suites and the existing strict runs touched by these stories**

Run: `pnpm --filter @ultimate/ng test && pnpm --filter @ultimate/vue test`
Expected: PASS (no unit change expected).

- [ ] **Step 7: Commit**

```bash
git add packages/ng/src/{image,image-compare,carousel,galleria,data-view,order-list,pick-list}/*.stories.ts packages/vue/src/{image,image-compare,carousel,galleria,data-view,organization-chart}/*.stories.ts tooling/prime-reference/e2e/stories.spec.ts
git commit -m "test(gap-064): add the G3-E verification stories and repair the Angular DataView story"
```

---

### Task 3: G3-E comparison runner (E-0, G3E-4, Review Focus 1–5)

**Files:**

- Modify: `tooling/prime-reference/e2e/probe.ts` (additive: `clock?: boolean` on `Target`, installed in `load`)
- Create: `tooling/prime-reference/e2e/actions.ts`
- Create: `tooling/prime-reference/cases-g3e.ts`
- Create: `tooling/prime-reference/e2e/g3e.spec.ts`
- Create: `tooling/prime-reference/vue/src/g3e/index.ts`, `tooling/prime-reference/ng/src/g3e.ts`
- Modify: `tooling/prime-reference/vue/src/App.vue`, `tooling/prime-reference/ng/src/main.ts` (dispatch `#/g3e/...` routes)

**Interfaces:**

- Consumes: `load`, `probe`, `compare`, `composite`, `capture`, `environment`, `container` from `probe.ts`.
- Produces:
  - `type Action = { click: string } | { press: string } | { hover: string } | { range: [string, number] } | { fill: [string, string] } | { advance: number }` (part names or ms).
  - `type Fact = { shown: string } | { texts: string } | { attr: [string, string] } | { focused: true } | { direction: string }`.
  - `interface G3ECase { id; batch: Batch; section; axis; prime: string; story: Partial<Record<Framework, string>>; open: Record<Framework, Open>; state?: State; clock?: boolean; actions?: Action[]; capture: "container" | "viewport"; parts: string[]; facts?: Fact[]; kind: "visual" | "behavior" }`.
  - `interface G3EComponent { key; tier; batch: Batch; parts: Record<string, Pair | Record<Framework, Pair>>; cases: G3ECase[]; recorded: RecordedCase[] }`; `type Batch = "smoke" | "E-1" | "E-2" | "E-3" | "E-4"`.
  - `export const G3E: G3EComponent[]` (filled per batch in Tasks 5, 8, 11, 14).
  - Runner selection: `G3E_BATCH=E-1 npx playwright test -c tooling/prime-reference/playwright.config.ts g3e`. Output `test-results/prime-parity-g3e/<batch>/{report.json,summary.md,*.png}`.
  - Reference routes: `#/g3e/<component>/<case>` in both apps.

- [ ] **Step 1: Write the failing smoke test**

`tooling/prime-reference/cases-g3e.ts` starts with one **smoke** component that reuses the pilot's Tag route, to prove the runner end to end:

```ts
import type { Framework, Open, Pair, RecordedCase, State } from "./cases";

export type Batch = "smoke" | "E-1" | "E-2" | "E-3" | "E-4";
export type Action =
  | { click: string }
  | { press: string }
  | { hover: string }
  | { range: [string, number] }
  | { fill: [string, string] }
  | { advance: number };
export type Fact =
  | { shown: string }
  | { texts: string }
  | { attr: [string, string] }
  | { focused: true }
  | { direction: string };

export interface G3ECase {
  id: string;
  batch: Batch;
  section: string;
  axis: string;
  /** Reference route; the same id in both reference apps (each renders its own framework's content). */
  prime: string;
  story: Partial<Record<Framework, string>>;
  open: Record<Framework, Open>;
  state?: State;
  clock?: boolean;
  actions?: Action[];
  capture: "container" | "viewport";
  parts: string[];
  facts?: Fact[];
  kind: "visual" | "behavior";
}

export interface G3EComponent {
  key: string;
  tier: "A" | "B";
  batch: Batch;
  parts: Record<string, Pair | Record<Framework, Pair>>;
  cases: G3ECase[];
  recorded: RecordedCase[];
}

const none = { ng: "none", vue: "none" } as const;

export const G3E: G3EComponent[] = [
  {
    key: "smoke",
    tier: "B",
    batch: "smoke",
    parts: { root: [".p-tag", ".u-tag"], label: [".p-tag-label", ".u-tag-label"] },
    cases: [
      {
        id: "smoke/tag",
        batch: "smoke",
        section: "Basic",
        axis: "runner smoke test",
        prime: "tag/default",
        story: { ng: "ng-tag--default", vue: "vue-tag--default" },
        open: none,
        capture: "container",
        parts: ["root", "label"],
        facts: [{ texts: "label" }, { direction: "root" }],
        kind: "visual",
      },
    ],
    recorded: [],
  },
];
```

`Pair` must be exported from `tooling/prime-reference/cases.ts` (it is a type alias there; add `export` if missing — additive).

Run: `G3E_BATCH=smoke PATH=$HOME/.nvm/versions/node/v24.15.0/bin:$PATH npx playwright test -c tooling/prime-reference/playwright.config.ts g3e`
Expected: FAIL — `g3e.spec.ts` does not exist (no tests found).

- [ ] **Step 2: Add the clock to `probe.ts` (additive)**

In `Target` add `clock?: boolean;` and in `load` insert, before `page.goto`:

```ts
// G3E-4: freeze timers (autoplay, transitions) before the page starts; cases advance time explicitly.
if (t.clock) await page.clock.install({ time: 0 });
```

- [ ] **Step 3: Write `actions.ts`**

```ts
import { expect, type Page } from "@playwright/test";
import type { Action, Fact } from "../cases-g3e";

/** Runs a case's actions on one side. `sel` maps part names to that side's selectors. */
export async function run(
  page: Page,
  sel: Record<string, string>,
  actions: Action[] = []
): Promise<void> {
  for (const a of actions) {
    if ("click" in a) await page.locator(sel[a.click]).first().click();
    else if ("press" in a) await page.keyboard.press(a.press);
    else if ("hover" in a) await page.locator(sel[a.hover]).first().hover();
    else if ("fill" in a) await page.locator(sel[a.fill[0]]).first().fill(a.fill[1]);
    else if ("range" in a)
      await page
        .locator(sel[a.range[0]])
        .first()
        .evaluate((el, v) => {
          (el as HTMLInputElement).value = String(v);
          el.dispatchEvent(new Event("input", { bubbles: true }));
        }, a.range[1]);
    else if ("advance" in a) await page.clock.runFor(a.advance);
    await page.waitForTimeout(150);
  }
  await page.mouse.move(0, 0);
}

/** Observable facts, compared Prime ↔ Ultimate. */
export async function facts(
  page: Page,
  sel: Record<string, string>,
  list: Fact[] = []
): Promise<Record<string, unknown>> {
  const out: Record<string, unknown> = {};
  for (const f of list) {
    if ("shown" in f)
      out[`shown:${f.shown}`] = await page
        .locator(sel[f.shown])
        .first()
        .isVisible()
        .catch(() => false);
    else if ("texts" in f)
      out[`texts:${f.texts}`] = (await page.locator(sel[f.texts]).allTextContents()).map((t) =>
        t.trim()
      );
    else if ("attr" in f)
      out[`attr:${f.attr[0]}.${f.attr[1]}`] = await page
        .locator(sel[f.attr[0]])
        .evaluateAll((els, n) => els.map((e) => e.getAttribute(n)), f.attr[1]);
    else if ("focused" in f)
      out.focused = await page.evaluate((s) => {
        const a = document.activeElement;
        return (
          Object.entries(s).find(([, q]) => a && a !== document.body && a.closest(q))?.[0] ??
          "outside"
        );
      }, sel);
    else if ("direction" in f)
      out[`direction:${f.direction}`] = await page
        .locator(sel[f.direction])
        .first()
        .evaluate((e) => getComputedStyle(e).direction);
  }
  return out;
}

/** Review Focus 1: every image inside the probed root has loaded. */
export async function imagesLoaded(page: Page, root: string): Promise<void> {
  for (const img of await page.locator(`${root} img`).all())
    await expect
      .poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0))
      .toBe(true);
}
```

- [ ] **Step 4: Write `g3e.spec.ts`**

```ts
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test, type Browser } from "@playwright/test";
import { selector, type Framework } from "../cases";
import { G3E, type G3EComponent, type G3ECase } from "../cases-g3e";
import { facts, imagesLoaded, run } from "./actions";
import {
  capture,
  compare,
  composite,
  environment,
  load,
  probe,
  type Difference,
  type Side,
  type Target,
} from "./probe";

/**
 * GAP-064 G3-E comparison runner (Spec §3; Playbook §6–§8). Report mode: parity differences are
 * recorded, never failed. Failures mean a harness problem. Select a batch with G3E_BATCH.
 */
const BATCH = process.env.G3E_BATCH ?? "smoke";
const OUT = resolve(__dirname, `../../../test-results/prime-parity-g3e/${BATCH}`);
const FWS: Framework[] = ["ng", "vue"];
const NAME: Record<Framework, string> = { ng: "PrimeNG 21.1.9", vue: "PrimeVue 4.5.5" };

interface Row {
  component: string;
  id: string;
  fw: Framework;
  kind: string;
  verdict: string;
  differences?: Difference[];
  explanatory?: Difference[];
  facts?: { prime: Record<string, unknown>; ultimate: Record<string, unknown> };
  pixelRatio?: number;
  noise?: { probe: number; primePixels: number; ultimatePixels: number };
  image?: string;
  note?: string;
}
const rows: Row[] = [];
test.describe.configure({ mode: "serial" });
mkdirSync(OUT, { recursive: true });

const sels = (c: G3EComponent, names: string[], fw: Framework, side: Side) =>
  Object.fromEntries(
    names.map((n) => [n, selector({ ...c, visual: [], recorded: [] } as never, n, fw, side)])
  );
const allParts = (c: G3EComponent) => Object.keys(c.parts);

async function observe(browser: Browser, comp: G3EComponent, c: G3ECase, t: Target) {
  const page = await load(browser, t);
  try {
    const all = sels(comp, allParts(comp), t.fw, t.side);
    await run(page, all, c.actions);
    const parts = await probe(page, sels(comp, c.parts, t.fw, t.side));
    expect(
      parts[c.parts[0]].missing,
      `${t.side} ${t.fw} ${t.ref}: first part missing (harness)`
    ).toBeFalsy();
    await imagesLoaded(page, sels(comp, [c.parts[0]], t.fw, t.side)[c.parts[0]]);
    return {
      env: await environment(page, t.side),
      parts,
      facts: await facts(page, all, c.facts),
      png: await capture(page, t.side, c.capture),
    };
  } finally {
    await page.close();
  }
}

const target = (c: G3ECase, fw: Framework, side: Side): Target => ({
  side,
  fw,
  ref: side === "prime" ? `g3e/${c.prime}` : c.story[fw]!,
  open: c.open[fw],
  state: c.state,
  clock: c.clock,
});

for (const comp of G3E.filter((x) => x.batch === BATCH)) {
  for (const c of comp.cases) {
    for (const fw of FWS.filter((f) => c.story[f])) {
      test(`${c.id} [${fw}] ${NAME[fw]} vs Ultimate`, async ({ browser }) => {
        const prime = await observe(browser, comp, c, target(c, fw, "prime"));
        const ult = await observe(browser, comp, c, target(c, fw, "ultimate"));
        expect(ult.env, "environment probe (harness artifact if this fails)").toEqual(prime.env);
        const differences = compare(prime.parts, ult.parts);
        const factDiffs = Object.keys(prime.facts)
          .filter((k) => JSON.stringify(prime.facts[k]) !== JSON.stringify(ult.facts[k]))
          .map((k) => ({
            part: "fact",
            property: k,
            expected: JSON.stringify(prime.facts[k]),
            actual: JSON.stringify(ult.facts[k]),
          }));
        const review = await composite(browser, prime.png, ult.png, [NAME[fw], `Ultimate ${fw}`]);
        const image = `${c.id.replaceAll("/", "--")}.${fw}.png`;
        writeFileSync(resolve(OUT, image), review.png);
        const prime2 = await observe(browser, comp, c, target(c, fw, "prime"));
        const ult2 = await observe(browser, comp, c, target(c, fw, "ultimate"));
        const noise = {
          probe: compare(prime.parts, prime2.parts).length + compare(ult.parts, ult2.parts).length,
          primePixels: (await composite(browser, prime.png, prime2.png, ["", ""])).differing,
          ultimatePixels: (await composite(browser, ult.png, ult2.png, ["", ""])).differing,
        };
        const all = [...differences, ...factDiffs];
        rows.push({
          component: comp.key,
          id: c.id,
          fw,
          kind: c.kind,
          // Playbook §6.4 / R-3: a probe match with differing pixels is not a Match until reviewed.
          verdict: all.length ? "differs" : review.differing > 0 ? "review image" : "match",
          differences: all,
          explanatory: compare(prime.parts, ult.parts, true),
          facts: { prime: prime.facts, ultimate: ult.facts },
          pixelRatio: review.ratio,
          noise,
          image,
        });
      });
    }
  }
  for (const r of comp.recorded) {
    test(`${r.id} [${r.kind}]`, () => {
      rows.push({
        component: comp.key,
        id: r.id,
        fw: "ng",
        kind: r.kind,
        verdict: r.kind,
        note: r.reason,
      });
    });
  }
}

test.afterAll(() => {
  writeFileSync(resolve(OUT, "report.json"), JSON.stringify({ batch: BATCH, rows }, null, 2));
  const list = (ds?: Difference[]) =>
    (ds ?? []).map((x) => `${x.part}.${x.property}: ${x.expected} → ${x.actual}`).join("<br>");
  const lines = [
    `# G3-E ${BATCH} comparison`,
    "",
    "| Case | fw | Kind | Verdict | Material | Explanatory | Pixel ratio | Noise | Image |",
    "|---|---|---|---|---|---|---|---|---|",
    ...rows.map(
      (r) =>
        `| ${r.id} | ${r.fw} | ${r.kind} | ${r.verdict} | ${list(r.differences) || r.note || ""} | ${list(r.explanatory)} | ${r.pixelRatio?.toFixed(4) ?? ""} | ${r.noise ? `${r.noise.probe}/${r.noise.primePixels}/${r.noise.ultimatePixels}` : ""} | ${r.image ?? ""} |`
    ),
  ];
  writeFileSync(resolve(OUT, "summary.md"), lines.join("\n") + "\n");
});
```

`recorded` kinds extend the pilot's `"D" | "coverage-gap"` with `"no-prime-reference"`: change `RecordedCase.kind` in `cases.ts` to `"D" | "coverage-gap" | "no-prime-reference"` (additive).

- [ ] **Step 5: Add the `g3e` route dispatch to both reference apps**

`tooling/prime-reference/vue/src/g3e/index.ts`:

```ts
import type { Component } from "vue";

/** G3-E reference cases, one component per Aura key; filled per batch (Tasks 5, 8, 11, 14). */
export const G3E_CASES: Record<string, Component> = {};
```

`tooling/prime-reference/vue/src/App.vue`: add as the first branch of the template

```vue
<component :is="g3e" v-if="g3e" :id="id" />
```

change the next branch's `v-if` to `v-else-if`, and add to the script:

```ts
import { G3E_CASES } from "./g3e";
const g3eKey = id.startsWith("g3e/") ? id.split("/")[1] : "";
const g3e = g3eKey === "smoke" ? null : G3E_CASES[g3eKey];
```

The smoke route `g3e/tag/default` reuses the pilot `tag/default` branch: in `App.vue`, compute `const id = location.hash.replace(/^#\//, "").replace(/^g3e\/(?=tag\/)/, "");`.

`tooling/prime-reference/ng/src/g3e.ts`:

```ts
import { Component, input } from "@angular/core";

/** G3-E reference cases; one `@case` per component route, filled per batch (Tasks 5, 8, 11, 14). */
@Component({
  selector: "app-g3e",
  standalone: true,
  imports: [],
  template: `@switch (id()) {}`,
})
export class G3ECases {
  readonly id = input.required<string>();
}
```

`tooling/prime-reference/ng/src/main.ts`: import `G3ECases`, add it to `imports`, and change the route parsing to

```ts
  readonly id = location.hash.replace(/^#\//, "").replace(/^g3e\/(?=tag\/)/, "");
  readonly g3e = this.id.startsWith("g3e/") ? this.id.slice(4) : "";
```

and wrap the existing `@switch` in `@if (g3e) { <app-g3e [id]="g3e" /> } @else { …existing switch… }`.

- [ ] **Step 6: Run the smoke batch to verify it passes**

Run: `G3E_BATCH=smoke PATH=$HOME/.nvm/versions/node/v24.15.0/bin:$PATH npx playwright test -c tooling/prime-reference/playwright.config.ts g3e`
Expected: PASS (2 tests); `test-results/prime-parity-g3e/smoke/report.json` shows `smoke/tag` `match` for ng and vue (the pilot result), noise `0/0/0`, `texts:label` `["New"]` on both sides, `direction:root` `ltr`.

- [ ] **Step 7: Run the pilot runner to prove it is unchanged**

Run: `PATH=$HOME/.nvm/versions/node/v24.15.0/bin:$PATH npx playwright test -c tooling/prime-reference/playwright.config.ts parity`
Expected: 46 passed; Tag rows `match`; Message closable ng `review image`.

- [ ] **Step 8: Commit**

```bash
git add tooling/prime-reference
git commit -m "test(gap-064): add the G3-E comparison runner with clock, actions and batch selection"
```

---

### Task 4: Tranche tooling skeleton (E-0; X-9 copy of G3-D)

**Files:**

- Create: `packages/themes/test/fixtures/primeuix-styles-g3e.json` (generated)
- Create: `packages/themes/test/fixtures/primeng-local-g3e.json` (generated; OI-E1)
- Create: `packages/themes/test/utils/g3e-port.mjs`
- Create: `packages/themes/test/g3e-upstream-fidelity.test.ts`
- Create: `scripts/provenance/validate-g3e-accessibility.mjs`, `scripts/provenance/validate-g3e-accessibility.test.mjs`
- Create: `docs/architecture/research/2026-10-08-gap-064-g3e-accessibility-preexisting.md`
- Create: `packages/ng/e2e/g3e-aura-styles.spec.ts`, `packages/vue/e2e/g3e-aura-styles.spec.ts`

**Interfaces:**

- Produces (`g3e-port.mjs`, same shape as `g3d-port.mjs`): `FIXTURE`, `NG_LOCAL`, `FRAMEWORKS`, `KEYS`, `DIRS`, `PORTED` (keys whose batch is ported; starts `[]`), `MAPPING`, `OMITTED`, `COUNTS`, `TOTALS`, `BASE_ROLE`, `BASE_SOURCES`, `RUNTIME_ROLE`, `LOCAL_RULES` (Angular PrimeNG-local, OI-E1), `RETAINED`, `mapSelector(fw,key,selector)`, `expected(fw,key)`, `expectedCss(fw,key)`, `actualCssText`, `actualRules`, `styleFile`. CLI: `node packages/themes/test/utils/g3e-port.mjs <ng|vue> <key>`.
- Canonical module order: **D3 (base roles) → D1 (upstream order) → L (PrimeNG-local, Angular only) → D4 (runtime roles) → D5 (retained Ultimate-only)**.
- Regression specs export `STORIES`, `VISUAL`, `REACH` arrays, filled per batch; titles carry the tag `G3-E` (and the batch, e.g. `G3-E E-1 visual`).

- [ ] **Step 1: Generate the two fixtures**

SDD tool `.superpowers/sdd/2026-10-08-gap-064-g3e-media-data/tools/fixture.mjs` (not committed; same method as G3-D):

```js
// usage: node fixture.mjs <extracted @primeuix/styles package root> <repo> <extracted primeng tarball root>
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [pkgRoot, repo, ngRoot] = process.argv.slice(2);
const keys = [
  "carousel",
  "galleria",
  "image",
  "imagecompare",
  "dataview",
  "orderlist",
  "organizationchart",
  "picklist",
  "base",
];
const modules = {};
for (const k of keys)
  modules[k] = (
    await import(pathToFileURL(path.join(pkgRoot, "package/dist", k, "index.mjs")).href)
  ).style;
const meta = (scope, source, method) => ({
  source,
  method,
  scope,
  purpose:
    "CI-runnable upstream snapshot for the G3-E fidelity test. Test data only, not shipped source.",
});
writeFileSync(
  path.join(repo, "packages/themes/test/fixtures/primeuix-styles-g3e.json"),
  JSON.stringify(
    {
      _meta: meta(
        "GAP-064 G3-E: the 8 Media + Data Aura keys plus base (B-2 roles)",
        "@primeuix/styles@2.0.3 (MIT) - dist/<key>/index.mjs export style",
        "one-off script: dynamic import() from .vendor-cache/@primeuix__styles-2.0.3.tar.gz; no hand edits"
      ),
      modules,
    },
    null,
    2
  ) + "\n"
);
// OI-E1: PrimeNG-local CSS = the text PrimeNG appends after `${style}` in packages/primeng/src/<key>/style/<key>style.ts.
const local = {};
for (const k of keys.filter((x) => x !== "base")) {
  const src = readFileSync(
    path.join(ngRoot, `packages/primeng/src/${k}/style/${k}style.ts`),
    "utf8"
  );
  const m = src.match(/const theme = \/\*css\*\/ `\s*\$\{style\}([\s\S]*?)`;/);
  local[k] = m ? m[1].trim() : "";
}
writeFileSync(
  path.join(repo, "packages/themes/test/fixtures/primeng-local-g3e.json"),
  JSON.stringify(
    {
      _meta: meta(
        "GAP-064 G3-E OI-E1: PrimeNG-local CSS appended after the shared style",
        "primeng@21.1.9 (MIT) packages/primeng/src/<key>/style/<key>style.ts",
        "one-off script from .vendor-cache/primeng-21.1.9.tar.gz; no hand edits"
      ),
      modules: local,
    },
    null,
    2
  ) + "\n"
);
console.log("written");
```

Run (after extracting the two pinned tarballs into the SDD workspace):

```bash
SDD=.superpowers/sdd/2026-10-08-gap-064-g3e-media-data
mkdir -p $SDD/up/uix $SDD/up/ng && tar -xzf .vendor-cache/@primeuix__styles-2.0.3.tar.gz -C $SDD/up/uix && tar -xzf .vendor-cache/primeng-21.1.9.tar.gz -C $SDD/up/ng
node $SDD/tools/fixture.mjs $SDD/up/uix $PWD $SDD/up/ng/primeng-c493b1c6d9f7cdffbe1c4dc195493dd73d733593
```

Expected: both files written; `primeng-local-g3e.json` has a non-empty `orderlist` entry (the `.p-orderlist-controls-right` rule) and empty strings elsewhere (research §C.2).

- [ ] **Step 2: Write the failing fidelity test**

`packages/themes/test/g3e-upstream-fidelity.test.ts` — fixture and data-model contract (per-batch assertions are appended in Tasks 6, 9, 12, 15):

```ts
import { describe, expect, it } from "vitest";
import {
  FIXTURE,
  KEYS,
  NG_LOCAL,
  PORTED,
  actualCssText,
  expectedCss,
  norm,
  parseGroups,
} from "./utils/g3e-port.mjs";

/** GAP-064 G3-E (Spec §6–§8): the upstream fixture, and for every ported key, generated CSS == shipped CSS. */
describe("G3-E upstream fixture and data model", () => {
  it("covers the 8 G3-E keys plus base and records its source", () => {
    expect(Object.keys(FIXTURE.modules).sort()).toEqual([...KEYS, "base"].sort());
    expect(FIXTURE._meta.source).toContain("@primeuix/styles@2.0.3");
  });
  it("records the PrimeNG-local CSS (OI-E1) for every key", () => {
    expect(Object.keys(NG_LOCAL.modules).sort()).toEqual([...KEYS].sort());
    expect(NG_LOCAL._meta.source).toContain("primeng@21.1.9");
  });
  it.each(["ng", "vue"] as const)(
    "%s: every ported style module equals its generated css",
    (fw) => {
      for (const key of PORTED as string[]) {
        if (fw === "ng" && key === "organizationchart") continue;
        expect(
          parseGroups(actualCssText(fw, key)).map((g: { head: string; body: string }) =>
            norm(`${g.head}{${g.body}}`)
          ),
          `${fw}/${key}`
        ).toEqual(expectedCss(fw, key));
      }
    }
  );
});
```

Run: `pnpm --filter @ultimate/themes exec vitest run test/g3e-upstream-fidelity.test.ts`
Expected: FAIL — `g3e-port.mjs` does not exist.

- [ ] **Step 3: Write `g3e-port.mjs`**

Copy `packages/themes/test/utils/g3d-port.mjs` to `g3e-port.mjs` and change exactly:

```js
export const FIXTURE = JSON.parse(
  readFileSync(path.join(HERE, "../fixtures/primeuix-styles-g3e.json"), "utf8")
);
export const NG_LOCAL = JSON.parse(
  readFileSync(path.join(HERE, "../fixtures/primeng-local-g3e.json"), "utf8")
);
export const KEYS = [
  "carousel",
  "galleria",
  "image",
  "imagecompare",
  "dataview",
  "orderlist",
  "organizationchart",
  "picklist",
];
export const DIRS = {
  carousel: "carousel",
  galleria: "galleria",
  image: "image",
  imagecompare: "image-compare",
  dataview: "data-view",
  orderlist: "order-list",
  organizationchart: "organization-chart",
  picklist: "pick-list",
};
/** Keys whose batch has been ported (Tasks 6, 9, 12, 15 append). */
export const PORTED = [];
export const MAPPING = { ng: {}, vue: {} };
export const OMITTED = { ng: {}, vue: {} };
export const COUNTS = {};
export const TOTALS = {
  ng: { upstream: 0, ported: 0, omitted: 0 },
  vue: { upstream: 0, ported: 0, omitted: 0 },
};
export const BASE_ROLE = { ng: {}, vue: {} };
export const BASE_SOURCES = [];
export const RUNTIME_ROLE = { ng: {}, vue: {} };
/** OI-E1: PrimeNG-local rules ported into the Angular module (mapped text), per key. */
export const LOCAL_RULES = { ng: {}, vue: {} };
export const RETAINED = { ng: {}, vue: {} };
```

Remove the G3-D-only exports (`CANDIDATES`, `KEPT`, `CANDIDATE_RULES`, `retained()`), keep `mapSelector`, `expected`, `declarations`, `styleFile`, `actualCssText`, `actualRules` unchanged, update the header comment to G3-E, and set the canonical order:

```js
/** Spec §7 canonical order: D3, D1 (upstream order), L (Angular only), D4, D5. */
export function expectedCss(fw, key) {
  return [
    ...(BASE_ROLE[fw][key] ?? []).map(norm),
    ...expected(fw, key).d1.map((r) => r.text),
    ...(LOCAL_RULES[fw][key] ?? []).map(norm),
    ...(RUNTIME_ROLE[fw][key] ?? []).map(norm),
    ...(RETAINED[fw][key] ?? []).map(norm),
  ];
}
```

CLI usage line: `g3e-port.mjs <ng|vue> <key>`.

- [ ] **Step 4: Run the fidelity test to verify it passes**

Run: `pnpm --filter @ultimate/themes exec vitest run test/g3e-upstream-fidelity.test.ts`
Expected: PASS (3 tests; the per-framework test passes vacuously while `PORTED` is empty).

- [ ] **Step 5: Copy the accessibility validator and its test**

Copy `scripts/provenance/validate-g3d-accessibility.mjs` → `validate-g3e-accessibility.mjs` and `validate-g3d-accessibility.test.mjs` → `validate-g3e-accessibility.test.mjs`; replace `G3-D`/`g3d` with `G3-E`/`g3e`, set

```js
const PREEXISTING_PATH =
  "docs/architecture/research/2026-10-08-gap-064-g3e-accessibility-preexisting.md";
const EXPECTED_STORY_COUNT = { ng: 0, vue: 0 }; // raised per batch (Tasks 5, 8, 11, 14)
```

and point the story-table parser at `packages/<fw>/e2e/g3e-aura-styles.spec.ts`. Create the evidence file with the header used by the G3-D file and an empty table.

Run: `node --test scripts/provenance/validate-g3e-accessibility.test.mjs`
Expected: PASS.

- [ ] **Step 6: Create the Ultimate regression spec skeletons**

`packages/{ng,vue}/e2e/g3e-aura-styles.spec.ts`: copy the G3-D spec's `go`, `nonZero`, accessibility loop, `VISUAL` loop and `REACH` loop (with `ATTR`, `K`, `STATE`) unchanged except `G3-D` → `G3-E`, and start with empty tables:

```ts
const FW = "ng"; // "vue" in the Vue file
const T = "Ng"; // "Vue"
type Kind = "rest" | "click" | "fullscreen";
/** Filled per batch (Tasks 5, 8, 11, 14). `trigger` overrides the click target (default `#storybook-root button`). */
const STORIES: ReadonlyArray<{
  name: string;
  story: string;
  ready: string;
  kind: Kind;
  batch: string;
  trigger?: string;
}> = [];
const VISUAL: ReadonlyArray<{
  name: string;
  story: string;
  kind: Kind;
  shot: string;
  batch: string;
  trigger?: string;
}> = [];
const REACH: ReadonlyArray<{ key: string; runs: ReadonlyArray<readonly [string, Kind, string]> }> =
  [];
```

`state(page, kind, ready, trigger = "#storybook-root button")` handles `"click"` (clicks `trigger`, parks the pointer) and `"fullscreen"` (clicks the `Show` button, then waits for `.u-galleria-mask` to be visible). Test titles: `` `${T}/${name} G3-E ${batch} accessibility` ``, `` `… G3-E ${batch} visual` ``, `` `${T}/${key} selector reach G3-E reach` ``. Install `page.clock` before `go` for stories whose name contains `Circular` (G3E-4).

Run: `npx playwright test packages/ng/e2e/g3e-aura-styles.spec.ts --project=ng-chromium`
Expected: "No tests found" is acceptable at this point (empty tables); no compile error.

- [ ] **Step 7: Commit**

```bash
git add packages/themes/test/fixtures/primeuix-styles-g3e.json packages/themes/test/fixtures/primeng-local-g3e.json packages/themes/test/utils/g3e-port.mjs packages/themes/test/g3e-upstream-fidelity.test.ts scripts/provenance/validate-g3e-accessibility.mjs scripts/provenance/validate-g3e-accessibility.test.mjs docs/architecture/research/2026-10-08-gap-064-g3e-accessibility-preexisting.md packages/ng/e2e/g3e-aura-styles.spec.ts packages/vue/e2e/g3e-aura-styles.spec.ts
git commit -m "test(gap-064): add the G3-E tranche tooling skeleton (fixture, data module, validator, specs)"
```

---

## Batch tasks (E-1..E-4)

Each batch has the same three-task shape. Batch-specific content (cases, reference templates, stories, part maps, regression entries) is written out in each batch's Task A. The **batch record** produced in Task A is the input to Task B and must contain, per key and framework:

1. **Case results** (before-port): the runner `summary.md` table plus the review of every `differs` and `review image` row.
2. **Classification** of every material difference: harness artifact / A / B / C (proposed; user ruling) / D / no Prime reference — Playbook §8.
3. **Upstream group inventory:** every group of `FIXTURE.modules[key]` in source order (1-based), each **ported** (D1) or **omitted** with a tag `FX-E<n>` and reason (a D case, a feature Ultimate does not render, or a keyframes group).
4. **Selector mapping:** the `text`/`class` mapping entries (Spec D-G3-1/2; never a DOM change).
5. **Base roles (D3), runtime roles (D4, X-4), PrimeNG-local rules (L, Angular only, OI-E1), retained Ultimate-only rules (D5)** — exact text.
6. **Proposed fixes** for A/B findings that live in the style module; every other A linked to an existing GAP or proposed as a new GAP; every C with its reason.
7. **Counts** `[upstream, ported]` per key and totals.

Task B transcribes the **approved** record into `g3e-port.mjs` verbatim. If an approved entry cannot reach the DOM without a DOM change, Task B stops (Spec §12).

---

### Task 5: E-1 Task A — Image and ImageCompare: cases, before-port evidence, batch record — HARD USER STOP

**Files:**

- Modify: `tooling/prime-reference/cases-g3e.ts` (append `IMAGE`, `IMAGECOMPARE`)
- Create: `tooling/prime-reference/vue/src/g3e/ImageCases.vue`, `ImageCompareCases.vue`; modify `vue/src/g3e/index.ts`
- Modify: `tooling/prime-reference/ng/src/g3e.ts` (cases `image/*`, `imagecompare/*`)
- Modify: `packages/{ng,vue}/e2e/g3e-aura-styles.spec.ts` (E-1 `STORIES`, `VISUAL`), `scripts/provenance/validate-g3e-accessibility.mjs` (`EXPECTED_STORY_COUNT` += E-1 story count)
- Create: `docs/architecture/research/2026-10-08-gap-064-g3e-e1-record.md`

**Interfaces:**

- Consumes: Task 1 fixtures; Task 2 stories; Task 3 runner types; Task 4 skeletons.
- Produces: approved E-1 record (input of Task 6); E-1 before-port Ultimate baselines.

- [ ] **Step 1: Add the E-1 cases**

Append to `cases-g3e.ts`:

```ts
const ng = (id: string) => `ng-${id}`;
const vue = (id: string) => `vue-${id}`;
const both = (id: string) => ({ ng: ng(id), vue: vue(id) });

G3E.push(
  {
    key: "image",
    tier: "B",
    batch: "E-1",
    parts: {
      root: [".p-image", ".u-image"],
      img: [".p-image > img", ".u-image > img"],
      previewMask: [".p-image-preview-mask", ".u-image-preview-mask"],
      mask: [".p-image-mask", ".u-image-mask"],
      toolbar: [".p-image-toolbar", ".u-image-toolbar"],
      original: [".p-image-original", ".u-image-original"],
      zoomIn: [".p-image-zoom-in-button", ".u-image-zoom-in-button"],
      zoomOut: [".p-image-zoom-out-button", ".u-image-zoom-out-button"],
      close: [".p-image-close-button", ".u-image-close-button"],
    },
    cases: [
      {
        id: "image/default",
        batch: "E-1",
        section: "Basic",
        axis: "default",
        prime: "image/default",
        story: both("image--default"),
        open: none,
        capture: "container",
        parts: ["root", "img"],
        kind: "visual",
      },
      {
        id: "image/preview-hover",
        batch: "E-1",
        section: "Preview",
        axis: "hover",
        prime: "image/preview",
        story: both("image--with-preview"),
        open: none,
        actions: [{ hover: "root" }],
        capture: "container",
        parts: ["root", "previewMask"],
        kind: "visual",
      },
      {
        id: "image/preview-open",
        batch: "E-1",
        section: "Preview",
        axis: "open",
        prime: "image/preview",
        story: both("image--with-preview"),
        open: none,
        actions: [{ click: "previewMask" }],
        capture: "viewport",
        parts: ["mask", "toolbar", "original", "close"],
        kind: "visual",
      },
      {
        id: "image/preview-zoom",
        batch: "E-1",
        section: "Preview",
        axis: "zoom in",
        prime: "image/preview",
        story: both("image--with-preview"),
        open: none,
        actions: [{ click: "previewMask" }, { click: "zoomIn" }],
        capture: "viewport",
        parts: ["mask", "original", "zoomOut"],
        facts: [{ attr: ["zoomOut", "disabled"] }],
        kind: "behavior",
      },
      {
        id: "image/preview-close",
        batch: "E-1",
        section: "Preview",
        axis: "Escape",
        prime: "image/preview",
        story: both("image--with-preview"),
        open: none,
        actions: [{ click: "previewMask" }, { press: "Escape" }],
        capture: "viewport",
        parts: ["root"],
        facts: [{ shown: "mask" }, { focused: true }],
        kind: "behavior",
      },
    ],
    recorded: [
      {
        id: "image/template",
        section: "Template",
        kind: "D",
        reason: "No Ultimate indicator/image template slots.",
      },
      {
        id: "image/preview-image-source",
        section: "PreviewImageSource (PrimeNG)",
        kind: "D",
        reason: "No Ultimate previewImageSrc input.",
      },
    ],
  },
  {
    key: "imagecompare",
    tier: "B",
    batch: "E-1",
    parts: {
      root: [".p-imagecompare", ".u-image-compare"],
      left: [".p-imagecompare > img:first-of-type", ".u-image-compare > img"],
      right: [".p-imagecompare img + img", ".u-image-compare > span > img"],
      slider: [".p-imagecompare-slider", ".u-image-compare-slider"],
    },
    cases: [
      {
        id: "imagecompare/default",
        batch: "E-1",
        section: "Basic",
        axis: "default 50 %",
        prime: "imagecompare/sized",
        story: both("imagecompare--sized"),
        open: none,
        capture: "container",
        parts: ["root", "left", "right", "slider"],
        kind: "visual",
      },
      {
        id: "imagecompare/slide",
        batch: "E-1",
        section: "Basic",
        axis: "slider 25 %",
        prime: "imagecompare/sized",
        story: both("imagecompare--sized"),
        open: none,
        actions: [{ range: ["slider", 25] }],
        capture: "container",
        parts: ["root", "right"],
        kind: "behavior",
      },
      {
        id: "imagecompare/focus",
        batch: "E-1",
        section: "Basic",
        axis: "focus-visible",
        prime: "imagecompare/sized",
        story: both("imagecompare--sized"),
        open: none,
        state: "tab",
        capture: "container",
        parts: ["root", "slider"],
        kind: "visual",
      },
      {
        id: "imagecompare/rtl",
        batch: "E-1",
        section: "(upstream :dir(rtl))",
        axis: "RTL",
        prime: "imagecompare/rtl",
        story: both("imagecompare--rtl"),
        open: none,
        capture: "container",
        parts: ["root", "right"],
        facts: [{ direction: "root" }],
        kind: "visual",
      },
      {
        id: "imagecompare/root-style",
        batch: "E-1",
        section: "Basic",
        axis: "consumer style on root (GAP-102)",
        prime: "imagecompare/root-style",
        story: both("imagecompare--default"),
        open: none,
        capture: "container",
        parts: ["root"],
        kind: "visual",
      },
    ],
    recorded: [
      {
        id: "imagecompare/responsive",
        section: "Responsive",
        kind: "D",
        reason: "Demo-only Tailwind sizing classes.",
      },
    ],
  }
);
```

- [ ] **Step 2: Add the reference templates**

`tooling/prime-reference/vue/src/g3e/ImageCases.vue`:

```vue
<template>
  <Image v-if="c === 'default'" src="/media/landscape-1.png" alt="Image" width="200" />
  <Image v-else-if="c === 'preview'" src="/media/landscape-1.png" alt="Image" width="200" preview />
</template>
<script setup lang="ts">
import Image from "primevue/image";
const props = defineProps<{ id: string }>();
const c = props.id.split("/")[2];
</script>
```

`ImageCompareCases.vue`:

```vue
<template>
  <div v-if="c === 'sized'" style="width: 20rem">
    <ImageCompare>
      <template #left><img src="/media/landscape-1.png" alt="before" /></template>
      <template #right><img src="/media/landscape-2.png" alt="after" /></template>
    </ImageCompare>
  </div>
  <div v-else-if="c === 'rtl'" dir="rtl" style="width: 20rem">
    <ImageCompare>
      <template #left><img src="/media/landscape-1.png" alt="before" /></template>
      <template #right><img src="/media/landscape-2.png" alt="after" /></template>
    </ImageCompare>
  </div>
  <ImageCompare v-else-if="c === 'root-style'" style="width: 20rem">
    <template #left><img src="/media/landscape-1.png" alt="before" /></template>
    <template #right><img src="/media/landscape-2.png" alt="after" /></template>
  </ImageCompare>
</template>
<script setup lang="ts">
import ImageCompare from "primevue/imagecompare";
const props = defineProps<{ id: string }>();
const c = props.id.split("/")[2];
</script>
```

`vue/src/g3e/index.ts`: `import ImageCases from "./ImageCases.vue"; import ImageCompareCases from "./ImageCompareCases.vue";` and `export const G3E_CASES = { image: ImageCases, imagecompare: ImageCompareCases };`.

`tooling/prime-reference/ng/src/g3e.ts` — imports `ImageModule` (`primeng/image`), `ImageCompareModule` (`primeng/imagecompare`); template:

```ts
  template: `
    @switch (id()) {
      @case ("image/default") { <p-image src="/media/landscape-1.png" alt="Image" width="200" /> }
      @case ("image/preview") { <p-image src="/media/landscape-1.png" alt="Image" width="200" [preview]="true" /> }
      @case ("imagecompare/sized") {
        <div style="width: 20rem">
          <p-imagecompare>
            <ng-template #left><img src="/media/landscape-1.png" alt="before" /></ng-template>
            <ng-template #right><img src="/media/landscape-2.png" alt="after" /></ng-template>
          </p-imagecompare>
        </div>
      }
      @case ("imagecompare/rtl") {
        <div dir="rtl" style="width: 20rem">
          <p-imagecompare>
            <ng-template #left><img src="/media/landscape-1.png" alt="before" /></ng-template>
            <ng-template #right><img src="/media/landscape-2.png" alt="after" /></ng-template>
          </p-imagecompare>
        </div>
      }
      @case ("imagecompare/root-style") {
        <p-imagecompare style="width: 20rem">
          <ng-template #left><img src="/media/landscape-1.png" alt="before" /></ng-template>
          <ng-template #right><img src="/media/landscape-2.png" alt="after" /></ng-template>
        </p-imagecompare>
      }
    }
  `,
```

- [ ] **Step 3: Verify the E-1 routes render on both reference apps**

Run: `G3E_BATCH=E-1 PATH=$HOME/.nvm/versions/node/v24.15.0/bin:$PATH npx playwright test -c tooling/prime-reference/playwright.config.ts g3e`
Expected: every test passes (report mode); any failure is a harness problem to fix in the reference template or case before Step 4. Review Focus 4: `imagecompare/rtl` reports `direction:root` `rtl` on both sides.

- [ ] **Step 4: Before-port Prime comparison in Docker**

Create the G3-E Docker runner (SDD workspace, not committed) `.superpowers/sdd/2026-10-08-gap-064-g3e-media-data/docker/run.sh`; it is used by every later evidence step:

```bash
#!/bin/bash
# G3-E Docker runner (inside mcr.microsoft.com/playwright:v1.63.0-jammy).
# usage: bash /io/run.sh parity <batch> <before|after>   Prime comparison (harness)
#        bash /io/run.sh baseline <batch>                Ultimate regression: write missing baselines
#        bash /io/run.sh check <batch>                   Ultimate regression: compare only
#        bash /io/run.sh accept <batch>                  Ultimate regression: update changed baselines
#        bash /io/run.sh reach                           G3-E selector reach, 6 projects
#        bash /io/run.sh regression                      every non-G3-E spec, 9 Storybook + 3 SSR projects
#        bash /io/run.sh ci <ng|vue>                     CI job simulation
set -uo pipefail
export CI=true
mkdir -p /work && tar -xf /io/src.tar -C /work && cd /work
corepack enable >/dev/null && corepack prepare pnpm@9.6.0 --activate >/dev/null
echo "node $(node -v) arch $(uname -m) commit $(cat /io/commit.txt)"
pnpm install --frozen-lockfile > /io/install.log 2>&1 || { echo "install failed"; exit 1; }
pnpm run build > /io/build.log 2>&1 || { echo "build failed"; exit 1; }
P="--project=ng-chromium --project=ng-firefox --project=ng-webkit --project=vue-chromium --project=vue-firefox --project=vue-webkit"
SPECS="packages/ng/e2e/g3e-aura-styles.spec.ts packages/vue/e2e/g3e-aura-styles.spec.ts"
SNAP="packages/ng/e2e/g3e-aura-styles.spec.ts-snapshots packages/vue/e2e/g3e-aura-styles.spec.ts-snapshots"
case "$1" in
  parity)
    G3E_BATCH=$2 npx playwright test -c tooling/prime-reference/playwright.config.ts g3e > /io/parity-$2-$3.log 2>&1; echo "parity $2 $3 exit $?"
    mkdir -p /io/parity-$2-$3 && cp -r test-results/prime-parity-g3e/$2/. /io/parity-$2-$3/ ;;
  baseline)
    npx playwright test $SPECS $P -g "G3-E $2" --update-snapshots=missing --retries=0 --reporter=list > /io/baseline-$2.log 2>&1; echo "baseline $2 exit $?"
    tar -cf /io/snapshots.tar $SNAP; tar -cf /io/baseline-$2-results.tar test-results ;;
  check)
    npx playwright test $SPECS $P -g "G3-E $2" --retries=0 --reporter=list > /io/check-$2.log 2>&1; echo "check $2 exit $?"
    tar -cf /io/check-$2-results.tar test-results ;;
  accept)
    npx playwright test $SPECS $P -g "G3-E $2" --update-snapshots=changed --retries=0 --reporter=list > /io/accept-$2.log 2>&1; echo "accept $2 exit $?"
    tar -cf /io/snapshots.tar $SNAP ;;
  reach)
    npx playwright test $SPECS $P -g "G3-E reach" --retries=0 --reporter=list > /io/reach.log 2>&1; echo "reach exit $?" ;;
  regression)
    npx playwright test $P --project=react-chromium --project=react-firefox --project=react-webkit --project=ng-ssr-chromium --project=react-ssr-chromium --project=vue-ssr-chromium --grep-invert "G3-E" --retries=0 --reporter=list > /io/regression.log 2>&1; echo "regression exit $?" ;;
  ci)
    fw=$2; PF="--project=$fw-chromium --project=$fw-firefox --project=$fw-webkit"
    npx playwright test $PF --grep-invert "G3-A|G3-B|G3-C1|G3-C2|G3-D|G3-E" --retries=0 --reporter=list > /io/ci-$fw-strict.log 2>&1; echo "ci $fw strict exit $?"
    node scripts/provenance/validate-accessibility-baseline.mjs --check "test-results/accessibility/$fw/**/*.json" > /io/ci-$fw-strict-check.log 2>&1; echo "ci $fw strict check exit $?"
    for t in g3a g3b g3c1 g3c2 g3d g3e; do
      npx playwright test packages/$fw/e2e/$t-aura-styles.spec.ts $PF --retries=0 --reporter=list > /io/ci-$fw-$t.log 2>&1; echo "ci $fw $t exit $?"
      node scripts/provenance/validate-$t-accessibility.mjs "$fw" > /io/ci-$fw-$t-check.log 2>&1; echo "ci $fw $t check exit $?"
    done ;;
esac
```

Before every Docker run, refresh the inputs (macOS `tar` must not add AppleDouble files):

```bash
D=.superpowers/sdd/2026-10-08-gap-064-g3e-media-data/docker
git rev-parse HEAD > $D/commit.txt && git ls-files -z | COPYFILE_DISABLE=1 tar --no-mac-metadata --null -T - -cf $D/src.tar
```

Run: `docker run --rm --ipc=host -v "$PWD/.superpowers/sdd/2026-10-08-gap-064-g3e-media-data/docker":/io mcr.microsoft.com/playwright:v1.63.0-jammy bash /io/run.sh parity E-1 before`
Expected: `parity E-1 before exit 0`; noise `0/0/0` on every comparison in `/io/parity-E-1-before/report.json` (AC4). Any non-zero noise is a harness problem: stop and fix before classifying.

- [ ] **Step 5: E-1 regression entries and before-port Ultimate baselines**

Add to `packages/{ng,vue}/e2e/g3e-aura-styles.spec.ts` (`FW` = `ng`/`vue`):

```ts
// E-1 (Image, ImageCompare)
STORIES: [
  {
    name: "Image Default",
    story: `${FW}-image--default`,
    ready: ".u-image",
    kind: "rest",
    batch: "E-1",
  },
  {
    name: "Image WithPreview",
    story: `${FW}-image--with-preview`,
    ready: ".u-image",
    kind: "rest",
    batch: "E-1",
  },
  {
    name: "ImageCompare Sized",
    story: `${FW}-imagecompare--sized`,
    ready: ".u-image-compare",
    kind: "rest",
    batch: "E-1",
  },
  {
    name: "ImageCompare Rtl",
    story: `${FW}-imagecompare--rtl`,
    ready: ".u-image-compare",
    kind: "rest",
    batch: "E-1",
  },
];
VISUAL: [
  {
    name: "Image Default rest",
    story: `${FW}-image--default`,
    kind: "rest",
    shot: ".u-image",
    batch: "E-1",
  },
  {
    name: "Image WithPreview open",
    story: `${FW}-image--with-preview`,
    kind: "click",
    shot: "page",
    batch: "E-1",
  },
  {
    name: "ImageCompare Sized rest",
    story: `${FW}-imagecompare--sized`,
    kind: "rest",
    shot: ".u-image-compare",
    batch: "E-1",
  },
  {
    name: "ImageCompare Rtl rest",
    story: `${FW}-imagecompare--rtl`,
    kind: "rest",
    shot: ".u-image-compare",
    batch: "E-1",
  },
];
```

The `Image WithPreview open` entry carries `trigger: ".u-image-preview-mask"`. Raise `EXPECTED_STORY_COUNT` to `{ ng: 4, vue: 4 }`.

Run: `docker run … bash /io/run.sh baseline E-1` (same mount as Step 4).
Expected: `baseline E-1 exit 0`; extract `/io/snapshots.tar` into the repository (new PNGs only). Copy every accessibility violation fingerprint of the E-1 stories from `/io/baseline-E-1-results.tar` (`test-results/accessibility/<fw>/<browser>/<story>.json`) into the pre-existing evidence file — these are before-port rows.

- [ ] **Step 6: Write the E-1 batch record**

`docs/architecture/research/2026-10-08-gap-064-g3e-e1-record.md` with the seven sections listed under "Batch tasks". For §3–§5 use the upstream fixture: `node -e` listing of `parseGroups(FIXTURE.modules.image)` / `imagecompare` heads with their 1-based numbers (script in the SDD workspace). Each omission carries an `FX-E<n>` tag and reason; each mapping entry cites the before-port evidence that requires it. Classification rows cite the runner row (case, fw, property, Prime → Ultimate). GAP-102 is linked for the Vue `imagecompare/root-style` row; GAP-098 for any `box-sizing`-explained geometry.

- [ ] **Step 7: Commit and STOP**

```bash
git add tooling/prime-reference packages/ng/e2e/g3e-aura-styles.spec.ts packages/vue/e2e/g3e-aura-styles.spec.ts packages/ng/e2e/g3e-aura-styles.spec.ts-snapshots packages/vue/e2e/g3e-aura-styles.spec.ts-snapshots scripts/provenance/validate-g3e-accessibility.mjs docs/architecture/research/2026-10-08-gap-064-g3e-e1-record.md docs/architecture/research/2026-10-08-gap-064-g3e-accessibility-preexisting.md
git commit -m "docs(gap-064): record the G3-E E-1 before-port comparison and proposed mapping"
```

**HARD USER STOP.** Present the record: classifications, proposed C rows, proposed fixes, group inventory and mapping. Task 6 starts only after the user approves the record (and rules on every C).

---

### Task 6: E-1 Task B — port Image and ImageCompare per the approved record (Procedure B)

**Procedure B.** Steps 1–7 below are the canonical port procedure. Tasks 9, 12 and 15 run exactly these steps with their own parameter table (keys, directories, renames, count constant, REACH entries). Parameters for E-1: keys `image`, `imagecompare`; directories `image`, `image-compare`; rename `image-compare` → `imagecompare`; count constant `E1_COUNTS`; batch `E-1`.

**Files:**

- Modify: `packages/themes/test/utils/g3e-port.mjs` (E-1 entries), `packages/themes/test/g3e-upstream-fidelity.test.ts` (E-1 literal counts)
- Modify: `packages/{ng,vue}/src/image/image-style.ts` (`css`), `packages/{ng,vue}/src/image-compare/image-compare-style.ts` (`css`)
- Modify: the `image-compare` key sites (Angular component `componentName`, Vue `createBaseComponent({ componentName })`) → `imagecompare`
- Modify: `packages/{ng,vue}/e2e/g3e-aura-styles.spec.ts` (`REACH` E-1)
- Modify: `packages/themes/test/` runtime key test (copy of the G3-D Task 5 test pattern, E-1 keys)

**Interfaces:**

- Consumes: approved E-1 record.
- Produces: `PORTED` += `["image", "imagecompare"]`; generated CSS in four style modules.

- [ ] **Step 1: Write the failing assertions**

Append to `g3e-upstream-fidelity.test.ts`:

```ts
it("E-1 counts are the approved record's literals", () => {
  expect({ image: COUNTS.image, imagecompare: COUNTS.imagecompare }).toEqual(E1_COUNTS);
});
```

with `const E1_COUNTS = { image: [<upstream>, <ported>], imagecompare: [<upstream>, <ported>] }` written as number literals copied from the approved record §7 (PR-4: the values exist only after the Task 5 gate), and `COUNTS` added to the test's import list. Add `"image", "imagecompare"` to `PORTED` first, so the per-framework equality test now compares the (still hand-written) shipped CSS with the generated CSS.

Run: `pnpm --filter @ultimate/themes exec vitest run test/g3e-upstream-fidelity.test.ts`
Expected: FAIL (counts and CSS differ).

- [ ] **Step 2: Transcribe the record into `g3e-port.mjs`**

Add `MAPPING`, `OMITTED`, `COUNTS`, `TOTALS`, `BASE_ROLE`/`BASE_SOURCES`, `RUNTIME_ROLE`, `LOCAL_RULES` and `RETAINED` entries for `image` and `imagecompare` exactly as approved. No entry that is not in the record.

- [ ] **Step 3: Generate and write the CSS**

Run, for each of the four modules:
`node packages/themes/test/utils/g3e-port.mjs ng image` (and `vue image`, `ng imagecompare`, `vue imagecompare`)
Replace the body of the single `/*css*/` template literal in the style file with the printed output (one rule per line). Update the doc-comment line to "GAP-064 G3-E: generated from g3e-port.mjs (record E-1)". Rename the `image-compare` registration key to `imagecompare` at every site (`grep -rn '"image-compare"' packages/ng/src packages/vue/src`).

- [ ] **Step 4: Run the fidelity test and the runtime key test to verify they pass**

Run: `pnpm --filter @ultimate/themes exec vitest run test/g3e-upstream-fidelity.test.ts && pnpm --filter @ultimate/ng test && pnpm --filter @ultimate/vue test`
Expected: PASS.

- [ ] **Step 5: Add the E-1 reach runs and run them**

```ts
// REACH
{ key: "image", runs: [[`${FW}-image--default`, "rest", ".u-image"], [`${FW}-image--with-preview`, "click", ".u-image-mask"]] },
{ key: "imagecompare", runs: [[`${FW}-imagecompare--sized`, "rest", ".u-image-compare"], [`${FW}-imagecompare--rtl`, "rest", ".u-image-compare"]] },
```

Run: `npx playwright test packages/{ng,vue}/e2e/g3e-aura-styles.spec.ts -g "selector reach" --project=ng-chromium --project=vue-chromium --retries=0`
Expected: PASS. An unreachable part that the record says is reachable is a stop (Spec §12), not a data edit.

- [ ] **Step 6: Size check**

Run the X-10 measurement (Angular `packages/ng/dist/fesm2022/*.mjs` per-file gzip sum; Vue `dist/index.mjs` gzip) against the batch branch point. Expected: < 15 %.

- [ ] **Step 7: Commit**

```bash
git add packages/themes/test packages/ng/src/image packages/vue/src/image packages/ng/src/image-compare packages/vue/src/image-compare packages/ng/e2e/g3e-aura-styles.spec.ts packages/vue/e2e/g3e-aura-styles.spec.ts
git commit -m "feat(gap-064): port Image and ImageCompare per the approved G3-E E-1 record"
```

---

### Task 7: E-1 Task C — after-port evidence and review — HARD USER STOP (Procedure C)

**Procedure C.** Steps 1–6 below are the canonical after-port procedure. Tasks 10, 13 and 16 run exactly these steps with their batch id, record file and Playbook rows. Parameters for E-1: batch `E-1`; record `2026-10-08-gap-064-g3e-e1-record.md`; rows `image`, `imagecompare`.

**Files:**

- Modify: `docs/architecture/research/2026-10-08-gap-064-g3e-e1-record.md` (after-port section)
- Modify: `packages/{ng,vue}/e2e/g3e-aura-styles.spec.ts-snapshots/*` (accepted after review), `docs/architecture/ACCESSIBILITY_BASELINE.md` (only accepted rows)
- Modify: `docs/architecture/PARITY_PLAYBOOK.md` §11 rows `image`, `imagecompare`
- Modify: `packages/{ng,vue}/src` provenance manifests for every changed source file

- [ ] **Step 1: After-port Prime comparison (Docker)**

Refresh `src.tar`/`commit.txt` (Task 5 Step 4), then run: `docker run --rm --ipc=host -v "$PWD/.superpowers/sdd/2026-10-08-gap-064-g3e-media-data/docker":/io mcr.microsoft.com/playwright:v1.63.0-jammy bash /io/run.sh parity E-1 after`
Expected: `exit 0`; noise 0 in `/io/parity-E-1-after/report.json`. Every row is compared with its before-port row in the record.

- [ ] **Step 2: Ultimate regression run (Docker)**

Run, in order, with the same mount: `run.sh check E-1`, `run.sh reach`, `run.sh regression`, and `node scripts/provenance/validate-g3e-accessibility.mjs ng` / `vue` on the extracted `check-E-1-results.tar`.
Expected: `check` fails only on screenshots whose change the port explains (each listed in the record); validator: no introduced row; `reach exit 0`; `regression` fails only on the known U2 and GAP-097 tests (AC7).

- [ ] **Step 3: Write the after-port section of the record**

Per case and framework: before → after verdict; remaining differences and their classification; proposed status per key (`verified`, `verified-with-differences`, `partial`, `open-gap`) with the reason; screenshot changes; accessibility rows; size.

- [ ] **Step 4: HARD USER STOP — review**

Present the record, the Prime | Ultimate | diff images of every remaining difference, and the changed Ultimate screenshots. A review fix that is authorized gets **one** confirmation run (Spec §3); anything more stops.

- [ ] **Step 5: Accept and record**

After approval: `run.sh accept E-1` and extract `/io/snapshots.tar` (accepted baselines), add the accepted accessibility rows, the Playbook §11 rows of `image` and `imagecompare` (commit and record link), and provenance manifest entries for every changed file under `packages/{ng,vue}/src` (changed-file completeness check).

- [ ] **Step 6: Commit**

```bash
git add docs/architecture/research/2026-10-08-gap-064-g3e-e1-record.md docs/architecture/PARITY_PLAYBOOK.md docs/architecture/ACCESSIBILITY_BASELINE.md packages/ng/e2e/g3e-aura-styles.spec.ts-snapshots packages/vue/e2e/g3e-aura-styles.spec.ts-snapshots packages/ng/provenance packages/vue/provenance docs/architecture/provenance
git commit -m "test(gap-064): accept the reviewed G3-E E-1 evidence and record Image/ImageCompare status"
```

(Stage only the provenance manifest files that actually changed.)

---

### Task 8: E-2 Task A — Carousel and Galleria: cases, before-port evidence, batch record — HARD USER STOP

**Files:** as Task 5, for `carousel` and `galleria` (`CarouselCases.vue`, `GalleriaCases.vue`, `ng/src/g3e.ts` cases `carousel/*`, `galleria/*`; record `…-g3e-e2-record.md`).

- [ ] **Step 1: Add the E-2 cases**

```ts
G3E.push(
  {
    key: "carousel",
    tier: "A",
    batch: "E-2",
    parts: {
      root: [".p-carousel", ".u-carousel"],
      viewport: [".p-carousel-viewport", ".u-carousel-viewport"],
      item: [".p-carousel-item", ".u-carousel-item"],
      prev: {
        ng: [".p-carousel-prev-button .p-button", ".u-carousel-prev-button"],
        vue: [".p-carousel-prev-button", ".u-carousel-prev-button"],
      },
      next: {
        ng: [".p-carousel-next-button .p-button", ".u-carousel-next-button"],
        vue: [".p-carousel-next-button", ".u-carousel-next-button"],
      },
      indicators: [".p-carousel-indicator-button", ".u-carousel-indicator-button"],
      activeIndicator: [
        ".p-carousel-indicator-active .p-carousel-indicator-button",
        ".u-carousel-indicator-active .u-carousel-indicator-button",
      ],
    },
    cases: [
      {
        id: "carousel/default",
        batch: "E-2",
        section: "Basic",
        axis: "default",
        prime: "carousel/basic",
        story: both("carousel--default"),
        open: none,
        capture: "container",
        parts: ["root", "item", "prev", "activeIndicator"],
        facts: [{ attr: ["prev", "disabled"] }],
        kind: "visual",
      },
      {
        id: "carousel/next",
        batch: "E-2",
        section: "Basic",
        axis: "next",
        prime: "carousel/basic",
        story: both("carousel--default"),
        open: none,
        actions: [{ click: "next" }],
        capture: "container",
        parts: ["root", "item", "prev", "activeIndicator"],
        facts: [{ attr: ["prev", "disabled"] }],
        kind: "behavior",
      },
      {
        id: "carousel/indicator",
        batch: "E-2",
        section: "Basic",
        axis: "indicator click",
        prime: "carousel/basic",
        story: both("carousel--default"),
        open: none,
        actions: [{ click: "indicators" }, { press: "ArrowRight" }, { press: "Enter" }],
        capture: "container",
        parts: ["root", "activeIndicator"],
        kind: "behavior",
      },
      {
        id: "carousel/nav-focus",
        batch: "E-2",
        section: "Basic",
        axis: "focus-visible next",
        prime: "carousel/basic",
        story: both("carousel--default"),
        open: none,
        actions: [{ press: "Tab" }, { press: "Tab" }],
        capture: "container",
        parts: ["root", "next"],
        facts: [{ focused: true }],
        kind: "visual",
      },
      {
        id: "carousel/circular",
        batch: "E-2",
        section: "Circular",
        axis: "circular, 1 visible",
        prime: "carousel/circular",
        story: both("carousel--circular-with-autoplay"),
        open: none,
        clock: true,
        capture: "container",
        parts: ["root", "item", "prev"],
        facts: [{ attr: ["prev", "disabled"] }],
        kind: "visual",
      },
      {
        id: "carousel/vertical",
        batch: "E-2",
        section: "Vertical",
        axis: "vertical",
        prime: "carousel/vertical",
        story: both("carousel--vertical"),
        open: none,
        capture: "container",
        parts: ["root", "viewport", "prev"],
        kind: "visual",
      },
      {
        id: "carousel/rtl",
        batch: "E-2",
        section: "(upstream :dir(rtl))",
        axis: "RTL",
        prime: "carousel/rtl",
        story: both("carousel--rtl"),
        open: none,
        capture: "container",
        parts: ["root", "prev", "next"],
        facts: [{ direction: "root" }],
        kind: "visual",
      },
    ],
    recorded: [
      {
        id: "carousel/responsive",
        section: "Responsive",
        kind: "D",
        reason: "No responsiveOptions.",
      },
      {
        id: "carousel/header-footer",
        section: "(facets)",
        kind: "D",
        reason: "No header/footer template.",
      },
    ],
  },
  {
    key: "galleria",
    tier: "A",
    batch: "E-2",
    parts: {
      root: [".p-galleria", ".u-galleria"],
      item: [".p-galleria-item", ".u-galleria-item-container"],
      prev: [".p-galleria-prev-button", ".u-galleria-prev-button"],
      next: [".p-galleria-next-button", ".u-galleria-next-button"],
      thumbnails: [".p-galleria-thumbnail-items", ".u-galleria-thumbnail-list"],
      thumbnail: [".p-galleria-thumbnail-item", ".u-galleria-thumbnail-item"],
      current: [".p-galleria-thumbnail-item-current", ".u-galleria-thumbnail-item-active"],
      mask: [".p-galleria-mask", ".u-galleria-mask"],
      close: [".p-galleria-close-button", ".u-galleria-close-button"],
      show: ["#root button", "#storybook-root button"],
    },
    cases: [
      {
        id: "galleria/item-thumbnails",
        batch: "E-2",
        section: "Navigator: item + thumbnails",
        axis: "default",
        prime: "galleria/item-thumbnails",
        story: both("galleria--default"),
        open: none,
        capture: "container",
        parts: ["root", "item", "next", "current"],
        kind: "visual",
      },
      {
        id: "galleria/no-thumbnails",
        batch: "E-2",
        section: "Navigator: without thumbnails",
        axis: "showThumbnails false",
        prime: "galleria/no-thumbnails",
        story: both("galleria--without-thumbnails"),
        open: none,
        capture: "container",
        parts: ["root", "item", "next"],
        kind: "visual",
      },
      {
        id: "galleria/next",
        batch: "E-2",
        section: "Navigator",
        axis: "next",
        prime: "galleria/item-thumbnails",
        story: both("galleria--default"),
        open: none,
        actions: [{ click: "next" }],
        capture: "container",
        parts: ["root", "current"],
        facts: [{ attr: ["prev", "disabled"] }],
        kind: "behavior",
      },
      {
        id: "galleria/thumbnail-select",
        batch: "E-2",
        section: "Basic",
        axis: "thumbnail click",
        prime: "galleria/item-thumbnails",
        story: both("galleria--default"),
        open: none,
        actions: [{ click: "thumbnail" }],
        capture: "container",
        parts: ["root", "current"],
        kind: "behavior",
      },
      {
        id: "galleria/nav-focus",
        batch: "E-2",
        section: "Navigator",
        axis: "focus-visible next",
        prime: "galleria/item-thumbnails",
        story: both("galleria--default"),
        open: none,
        actions: [{ press: "Tab" }, { press: "Tab" }],
        capture: "container",
        parts: ["root", "next"],
        facts: [{ focused: true }],
        kind: "visual",
      },
      {
        id: "galleria/fullscreen",
        batch: "E-2",
        section: "FullScreen: with thumbnails",
        axis: "open",
        prime: "galleria/fullscreen",
        story: both("galleria--full-screen"),
        open: none,
        clock: true,
        actions: [{ click: "show" }, { advance: 500 }],
        capture: "viewport",
        parts: ["mask", "item", "close"],
        kind: "visual",
      },
      {
        id: "galleria/fullscreen-close",
        batch: "E-2",
        section: "FullScreen",
        axis: "Escape",
        prime: "galleria/fullscreen",
        story: both("galleria--full-screen"),
        open: none,
        clock: true,
        actions: [{ click: "show" }, { advance: 500 }, { press: "Escape" }, { advance: 500 }],
        capture: "viewport",
        parts: ["show"],
        facts: [{ shown: "mask" }, { focused: true }],
        kind: "behavior",
      },
    ],
    recorded: [
      {
        id: "galleria/indicators",
        section: "Indicator (all)",
        kind: "D",
        reason: "No showIndicators.",
      },
      {
        id: "galleria/thumbnail-position",
        section: "Thumbnail",
        kind: "D",
        reason: "No thumbnailsPosition.",
      },
      {
        id: "galleria/responsive",
        section: "Responsive",
        kind: "D",
        reason: "No responsiveOptions.",
      },
      { id: "galleria/caption", section: "Caption", kind: "D", reason: "No caption template." },
      {
        id: "galleria/hover-navigators",
        section: "Navigator: hover",
        kind: "D",
        reason: "No showItemNavigatorsOnHover.",
      },
      {
        id: "galleria/custom-fullscreen",
        section: "FullScreen: custom content",
        kind: "D",
        reason: "No custom full-screen content.",
      },
      {
        id: "galleria/advanced",
        section: "Advanced",
        kind: "D",
        reason: "Composite demo of unsupported features.",
      },
    ],
  }
);
```

Observation (OI-E5): every Galleria reference case sets `showItemNavigators` explicitly to match the Ultimate story.

- [ ] **Step 2: Add the reference templates**

Register them in `vue/src/g3e/index.ts`: add `import CarouselCases from "./CarouselCases.vue"; import GalleriaCases from "./GalleriaCases.vue";` and the entries `carousel: CarouselCases, galleria: GalleriaCases`.

`CarouselCases.vue`:

```vue
<template>
  <Carousel v-if="c === 'basic'" :value="items" :numVisible="3" :numScroll="1">
    <template #item="{ data }"
      ><div style="padding: 1rem; text-align: center; border: 1px solid #ddd; margin: 0 0.5rem">
        {{ data }}
      </div></template
    >
  </Carousel>
  <Carousel
    v-else-if="c === 'circular'"
    :value="items"
    :numVisible="1"
    circular
    :autoplayInterval="3000"
  >
    <template #item="{ data }"
      ><div style="padding: 2rem; text-align: center; border: 1px solid #ddd">
        {{ data }}
      </div></template
    >
  </Carousel>
  <Carousel
    v-else-if="c === 'vertical'"
    :value="items"
    :numVisible="1"
    :numScroll="1"
    orientation="vertical"
  >
    <template #item="{ data }"
      ><div style="padding: 2rem; text-align: center; border: 1px solid #ddd">
        {{ data }}
      </div></template
    >
  </Carousel>
  <div v-else-if="c === 'rtl'" dir="rtl">
    <Carousel :value="items" :numVisible="3" :numScroll="1">
      <template #item="{ data }"
        ><div style="padding: 1rem; text-align: center; border: 1px solid #ddd; margin: 0 0.5rem">
          {{ data }}
        </div></template
      >
    </Carousel>
  </div>
</template>
<script setup lang="ts">
import Carousel from "primevue/carousel";
const props = defineProps<{ id: string }>();
const c = props.id.split("/")[2];
const items = Array.from({ length: 8 }, (_, i) => `Item ${i + 1}`);
</script>
```

`GalleriaCases.vue`:

```vue
<template>
  <div v-if="c === 'item-thumbnails'" style="max-width: 40rem">
    <Galleria :value="images" :showItemNavigators="true">
      <template #item="{ item }"><img :src="item" style="width: 100%; display: block" /></template>
      <template #thumbnail="{ item }"
        ><img :src="item" style="width: 5rem; display: block"
      /></template>
    </Galleria>
  </div>
  <div v-else-if="c === 'no-thumbnails'" style="max-width: 40rem">
    <Galleria :value="images" :showItemNavigators="true" :showThumbnails="false">
      <template #item="{ item }"><img :src="item" style="width: 100%; display: block" /></template>
    </Galleria>
  </div>
  <div v-else-if="c === 'fullscreen'">
    <button type="button" @click="visible = true">Show</button>
    <Galleria
      v-model:visible="visible"
      :value="images"
      :fullScreen="true"
      :showItemNavigators="true"
    >
      <template #item="{ item }"><img :src="item" style="width: 100%; display: block" /></template>
      <template #thumbnail="{ item }"
        ><img :src="item" style="width: 5rem; display: block"
      /></template>
    </Galleria>
  </div>
</template>
<script setup lang="ts">
import Galleria from "primevue/galleria";
import { ref } from "vue";
const props = defineProps<{ id: string }>();
const c = props.id.split("/")[2];
const images = ["/media/landscape-1.png", "/media/landscape-2.png", "/media/landscape-3.png"];
const visible = ref(false);
</script>
```

`ng/src/g3e.ts` — import `CarouselModule`, `GalleriaModule`; add a `items` and `images` field and `visible = false`; cases:

```html
@case ("carousel/basic") {
<p-carousel [value]="items" [numVisible]="3" [numScroll]="1">
  <ng-template #item let-item
    ><div style="padding: 1rem; text-align: center; border: 1px solid #ddd; margin: 0 0.5rem">
      {{ item }}
    </div></ng-template
  >
</p-carousel>
} @case ("carousel/circular") {
<p-carousel [value]="items" [numVisible]="1" [circular]="true" [autoplayInterval]="3000">
  <ng-template #item let-item
    ><div style="padding: 2rem; text-align: center; border: 1px solid #ddd">
      {{ item }}
    </div></ng-template
  >
</p-carousel>
} @case ("carousel/vertical") {
<p-carousel [value]="items" [numVisible]="1" [numScroll]="1" orientation="vertical">
  <ng-template #item let-item
    ><div style="padding: 2rem; text-align: center; border: 1px solid #ddd">
      {{ item }}
    </div></ng-template
  >
</p-carousel>
} @case ("carousel/rtl") {
<div dir="rtl">
  <p-carousel [value]="items" [numVisible]="3" [numScroll]="1">
    <ng-template #item let-item
      ><div style="padding: 1rem; text-align: center; border: 1px solid #ddd; margin: 0 0.5rem">
        {{ item }}
      </div></ng-template
    >
  </p-carousel>
</div>
} @case ("galleria/item-thumbnails") {
<p-galleria [value]="images" [showItemNavigators]="true" style="max-width: 40rem">
  <ng-template #item let-item><img [src]="item" style="width: 100%; display: block" /></ng-template>
  <ng-template #thumbnail let-item
    ><img [src]="item" style="width: 5rem; display: block"
  /></ng-template>
</p-galleria>
} @case ("galleria/no-thumbnails") {
<p-galleria
  [value]="images"
  [showItemNavigators]="true"
  [showThumbnails]="false"
  style="max-width: 40rem"
>
  <ng-template #item let-item><img [src]="item" style="width: 100%; display: block" /></ng-template>
</p-galleria>
} @case ("galleria/fullscreen") {
<button type="button" (click)="visible = true">Show</button>
<p-galleria [(visible)]="visible" [value]="images" [fullScreen]="true" [showItemNavigators]="true">
  <ng-template #item let-item><img [src]="item" style="width: 100%; display: block" /></ng-template>
  <ng-template #thumbnail let-item
    ><img [src]="item" style="width: 5rem; display: block"
  /></ng-template>
</p-galleria>
}
```

(The Angular reference uses zoneless change detection: make `visible` a `signal(false)` and bind `[visible]="visible()" (visibleChange)="visible.set($event)"`, `(click)="visible.set(true)"`.)

- [ ] **Step 3: Verify the E-2 routes render on both reference apps**

Run: `G3E_BATCH=E-2 PATH=$HOME/.nvm/versions/node/v24.15.0/bin:$PATH npx playwright test -c tooling/prime-reference/playwright.config.ts g3e`
Expected: every test passes (report mode); a failure is a harness problem fixed in the reference template or case before Step 4. Review Focus 2: `carousel/circular` and the full-screen cases run with the clock installed (noise 0 in Step 4).

- [ ] **Step 4: Before-port Prime comparison (Docker)**

Refresh `src.tar`/`commit.txt` (Task 5 Step 4), then run: `docker run --rm --ipc=host -v "$PWD/.superpowers/sdd/2026-10-08-gap-064-g3e-media-data/docker":/io mcr.microsoft.com/playwright:v1.63.0-jammy bash /io/run.sh parity E-2 before`
Expected: `exit 0`; noise `0/0/0` on every comparison in `/io/parity-E-2-before/report.json` (AC4).

- [ ] **Step 5: E-2 regression entries and before-port Ultimate baselines**

```ts
// E-2 (Carousel, Galleria) — STORIES
{ name: "Carousel Default", story: `${FW}-carousel--default`, ready: ".u-carousel", kind: "rest", batch: "E-2" },
{ name: "Carousel CircularWithAutoplay", story: `${FW}-carousel--circular-with-autoplay`, ready: ".u-carousel", kind: "rest", batch: "E-2" },
{ name: "Carousel Vertical", story: `${FW}-carousel--vertical`, ready: ".u-carousel", kind: "rest", batch: "E-2" },
{ name: "Carousel Rtl", story: `${FW}-carousel--rtl`, ready: ".u-carousel", kind: "rest", batch: "E-2" },
{ name: "Galleria Default", story: `${FW}-galleria--default`, ready: ".u-galleria", kind: "rest", batch: "E-2" },
{ name: "Galleria WithoutThumbnails", story: `${FW}-galleria--without-thumbnails`, ready: ".u-galleria", kind: "rest", batch: "E-2" },
{ name: "Galleria FullScreen", story: `${FW}-galleria--full-screen`, ready: ".u-galleria-mask", kind: "fullscreen", batch: "E-2" },
// E-2 — VISUAL
{ name: "Carousel Default rest", story: `${FW}-carousel--default`, kind: "rest", shot: ".u-carousel", batch: "E-2" },
{ name: "Carousel CircularWithAutoplay rest", story: `${FW}-carousel--circular-with-autoplay`, kind: "rest", shot: ".u-carousel", batch: "E-2" },
{ name: "Carousel Vertical rest", story: `${FW}-carousel--vertical`, kind: "rest", shot: ".u-carousel", batch: "E-2" },
{ name: "Carousel Rtl rest", story: `${FW}-carousel--rtl`, kind: "rest", shot: ".u-carousel", batch: "E-2" },
{ name: "Galleria Default rest", story: `${FW}-galleria--default`, kind: "rest", shot: ".u-galleria", batch: "E-2" },
{ name: "Galleria WithoutThumbnails rest", story: `${FW}-galleria--without-thumbnails`, kind: "rest", shot: ".u-galleria", batch: "E-2" },
{ name: "Galleria FullScreen open", story: `${FW}-galleria--full-screen`, kind: "fullscreen", shot: "page", batch: "E-2" },
```

The regression spec installs `page.clock` for the `CircularWithAutoplay` entries (Task 4 Step 6). Raise `EXPECTED_STORY_COUNT` by 7 per framework. Run `run.sh baseline E-2`, extract the new PNGs, and record the before-port accessibility rows (as Task 5 Step 5).

- [ ] **Step 6: Write the E-2 batch record** (`docs/architecture/research/2026-10-08-gap-064-g3e-e2-record.md`), with the seven sections listed under "Batch tasks". G3E-5 for Galleria thumbnails: if parity needs a thumbnail carousel (new DOM/runtime), the record says so and proposes escalation instead of a mapping.

- [ ] **Step 7: Commit and STOP** — `docs(gap-064): record the G3-E E-2 before-port comparison and proposed mapping`. **HARD USER STOP.**

---

### Task 9: E-2 Task B — port Carousel and Galleria per the approved record

Run **Procedure B** (Task 6 Steps 1–7) with: keys `carousel`, `galleria`; directories `carousel`, `galleria`; no rename (both keys already equal the Aura keys); count constant `E2_COUNTS`; batch `E-2`; CSS into `packages/{ng,vue}/src/carousel/carousel-style.ts` and `packages/{ng,vue}/src/galleria/galleria-style.ts`; REACH entries:

```ts
{ key: "carousel", runs: [[`${FW}-carousel--default`, "rest", ".u-carousel"], [`${FW}-carousel--vertical`, "rest", ".u-carousel"], [`${FW}-carousel--rtl`, "rest", ".u-carousel"]] },
{ key: "galleria", runs: [[`${FW}-galleria--default`, "rest", ".u-galleria"], [`${FW}-galleria--without-thumbnails`, "rest", ".u-galleria"], [`${FW}-galleria--full-screen`, "fullscreen", ".u-galleria-mask"]] },
```

Commit message: `feat(gap-064): port Carousel and Galleria per the approved G3-E E-2 record`.

### Task 10: E-2 Task C — after-port evidence and review — HARD USER STOP

Run **Procedure C** (Task 7 Steps 1–6) with: batch `E-2`; record `2026-10-08-gap-064-g3e-e2-record.md`; Playbook rows `carousel`, `galleria`. Commit `test(gap-064): accept the reviewed G3-E E-2 evidence and record Carousel/Galleria status`.

---

### Task 11: E-3 Task A — OrderList and PickList: cases, before-port evidence, batch record — HARD USER STOP

- [ ] **Step 1: Add the E-3 cases**

```ts
G3E.push(
  {
    key: "orderlist",
    tier: "B",
    batch: "E-3",
    parts: {
      root: [".p-orderlist", ".u-order-list"],
      controls: [".p-orderlist-controls", ".u-order-list-controls"],
      firstControl: [".p-orderlist-controls button", ".u-order-list-controls button"],
      list: {
        ng: [".p-listbox", ".u-listbox"],
        vue: [".p-listbox", ".u-order-list-list .u-listbox"],
      },
      option: [".p-listbox-option", ".u-listbox-option"],
      filter: [".p-listbox-filter, .p-orderlist input[type=text]", "input[role=searchbox]"],
    },
    cases: [
      {
        id: "orderlist/default",
        batch: "E-3",
        section: "Basic",
        axis: "default",
        prime: "orderlist/basic",
        story: { ng: "data-orderlist--default", vue: "data-orderlist--default" },
        open: none,
        capture: "container",
        parts: ["root", "controls", "firstControl", "option"],
        kind: "visual",
      },
      {
        id: "orderlist/selected",
        batch: "E-3",
        section: "Basic",
        axis: "one selected",
        prime: "orderlist/basic",
        story: { ng: "data-orderlist--controlled", vue: "data-orderlist--controlled" },
        open: none,
        actions: [{ click: "option" }],
        capture: "container",
        parts: ["root", "option", "firstControl"],
        facts: [{ attr: ["option", "aria-selected"] }],
        kind: "visual",
      },
      {
        id: "orderlist/move",
        batch: "E-3",
        section: "Basic",
        axis: "select second, move up",
        prime: "orderlist/basic",
        story: { ng: "data-orderlist--controlled", vue: "data-orderlist--controlled" },
        open: none,
        actions: [{ click: "option" }, { press: "ArrowDown" }, { press: "Enter" }],
        capture: "container",
        parts: ["root"],
        facts: [{ texts: "option" }, { attr: ["option", "aria-selected"] }],
        kind: "behavior",
      },
      {
        id: "orderlist/focus",
        batch: "E-3",
        section: "Basic",
        axis: "keyboard focus on an option",
        prime: "orderlist/basic",
        story: { ng: "data-orderlist--default", vue: "data-orderlist--default" },
        open: none,
        actions: [
          { press: "Tab" },
          { press: "Tab" },
          { press: "Tab" },
          { press: "Tab" },
          { press: "Tab" },
        ],
        capture: "container",
        parts: ["root", "option"],
        facts: [{ focused: true }],
        kind: "visual",
      },
      {
        id: "orderlist/filter",
        batch: "E-3",
        section: "Filter (PrimeNG)",
        axis: "filter input",
        prime: "orderlist/filter",
        story: { ng: "data-orderlist--filter" },
        open: none,
        actions: [{ fill: ["filter", "an"] }],
        capture: "container",
        parts: ["root", "filter", "option"],
        facts: [{ texts: "option" }],
        kind: "visual",
      },
      {
        id: "orderlist/dragdrop",
        batch: "E-3",
        section: "DragDrop (PrimeNG)",
        axis: "drag reorder",
        prime: "orderlist/dragdrop",
        story: { ng: "data-orderlist--with-drag-drop" },
        open: none,
        capture: "container",
        parts: ["root", "option"],
        facts: [{ texts: "option" }],
        kind: "behavior",
      },
    ],
    recorded: [
      {
        id: "orderlist/controls-position",
        section: "controlsPosition (PrimeNG)",
        kind: "D",
        reason:
          "No Ultimate controlsPosition input; the PrimeNG-local rule is recorded, not ported (OI-E1: feature absent).",
      },
      {
        id: "orderlist/template",
        section: "Template",
        kind: "D",
        reason: "No Ultimate item template.",
      },
    ],
  },
  {
    key: "picklist",
    tier: "B",
    batch: "E-3",
    parts: {
      root: [".p-picklist", ".u-pick-list"],
      source: [".p-picklist-source-list-container", ".u-pick-list-source .u-pick-list-list"],
      transfer: [".p-picklist-transfer-controls", ".u-pick-list > .u-pick-list-controls"],
      target: [".p-picklist-target-list-container", ".u-pick-list-target .u-pick-list-list"],
      option: [
        ".p-picklist-source-list-container .p-listbox-option",
        ".u-pick-list-source .u-listbox-option",
      ],
      targetOption: [
        ".p-picklist-target-list-container .p-listbox-option",
        ".u-pick-list-target .u-listbox-option",
      ],
      transferButton: [
        ".p-picklist-transfer-controls button",
        ".u-pick-list > .u-pick-list-controls button",
      ],
      filter: [
        ".p-picklist-source-list-container input[type=text]",
        ".u-pick-list-source input[role=searchbox]",
      ],
    },
    cases: [
      {
        id: "picklist/default",
        batch: "E-3",
        section: "Basic",
        axis: "default",
        prime: "picklist/basic",
        story: { ng: "data-picklist--default", vue: "data-picklist--default" },
        open: none,
        capture: "container",
        parts: ["root", "source", "transfer", "target"],
        kind: "visual",
      },
      {
        id: "picklist/selected",
        batch: "E-3",
        section: "Basic",
        axis: "one source item selected",
        prime: "picklist/basic",
        story: { ng: "data-picklist--controlled", vue: "data-picklist--controlled" },
        open: none,
        actions: [{ click: "option" }],
        capture: "container",
        parts: ["root", "option", "transferButton"],
        facts: [{ attr: ["option", "aria-selected"] }],
        kind: "visual",
      },
      {
        id: "picklist/transfer",
        batch: "E-3",
        section: "Basic",
        axis: "move to target",
        prime: "picklist/basic",
        story: { ng: "data-picklist--controlled", vue: "data-picklist--controlled" },
        open: none,
        actions: [{ click: "option" }, { click: "transferButton" }],
        capture: "container",
        parts: ["root"],
        facts: [{ texts: "option" }, { texts: "targetOption" }],
        kind: "behavior",
      },
      {
        id: "picklist/focus",
        batch: "E-3",
        section: "Basic",
        axis: "keyboard focus on an option",
        prime: "picklist/basic",
        story: { ng: "data-picklist--default", vue: "data-picklist--default" },
        open: none,
        actions: [
          { press: "Tab" },
          { press: "Tab" },
          { press: "Tab" },
          { press: "Tab" },
          { press: "Tab" },
        ],
        capture: "container",
        parts: ["root", "option"],
        facts: [{ focused: true }],
        kind: "visual",
      },
      {
        id: "picklist/filter",
        batch: "E-3",
        section: "Filter (PrimeNG)",
        axis: "source filter",
        prime: "picklist/filter",
        story: { ng: "data-picklist--filter" },
        open: none,
        actions: [{ fill: ["filter", "an"] }],
        capture: "container",
        parts: ["root", "filter", "option"],
        facts: [{ texts: "option" }],
        kind: "visual",
      },
    ],
    recorded: [
      {
        id: "picklist/template",
        section: "Template(s)",
        kind: "D",
        reason: "No Ultimate item templates.",
      },
      {
        id: "picklist/responsive",
        section: "breakpoint",
        kind: "D",
        reason: "Needs a viewport change; not canonical at 1280 × 720.",
      },
    ],
  }
);
```

The `orderlist/dragdrop` behavior uses an extra action added to `actions.ts` in this step:

```ts
  | { drag: [string, number, number] } // part, from index, to index (Angular CDK drag on both sides)
```

implemented as `await page.locator(sel[part]).nth(from).dragTo(page.locator(sel[part]).nth(to));`. Focus-case Tab counts are finalized in Step 3 (the number of Tabs that lands on the first option on each side, recorded as a harness fact, not a parity difference).

- [ ] **Step 2: Add the reference templates**

Register them in `vue/src/g3e/index.ts`: add `import OrderListCases from "./OrderListCases.vue"; import PickListCases from "./PickListCases.vue";` and the entries `orderlist: OrderListCases, picklist: PickListCases`.

PrimeVue mirrors the Vue stories' content (below). PrimeNG mirrors the Angular stories: add to `ng/src/g3e.ts` (imports `OrderListModule` from `primeng/orderlist`, `PickListModule` from `primeng/picklist`) the fields

```ts
  items = ["Apple", "Banana", "Cherry", "Date"];
  named = ["Apple", "Banana", "Cherry", "Date"].map((name) => ({ name }));
  src = ["Apple", "Banana", "Cherry"];
  tgt: string[] = [];
  namedSrc = ["Apple", "Banana", "Cherry"].map((name) => ({ name }));
  namedTgt: { name: string }[] = [];
```

and the cases

```html
@case ("orderlist/basic") {
<p-orderlist [value]="items"><ng-template #item let-option>{{ option }}</ng-template></p-orderlist>
} @case ("orderlist/filter") {
<p-orderlist [value]="named" filterBy="name" dataKey="name"
  ><ng-template #item let-option>{{ option.name }}</ng-template></p-orderlist
>
} @case ("orderlist/dragdrop") {
<p-orderlist [value]="items" [dragdrop]="true"
  ><ng-template #item let-option>{{ option }}</ng-template></p-orderlist
>
} @case ("picklist/basic") {
<p-picklist [source]="src" [target]="tgt"
  ><ng-template #item let-item>{{ item }}</ng-template></p-picklist
>
} @case ("picklist/filter") {
<p-picklist [source]="namedSrc" [target]="namedTgt" filterBy="name" dataKey="name"
  ><ng-template #item let-item>{{ item.name }}</ng-template></p-picklist
>
}
```

(PrimeNG OrderList/PickList mutate the bound arrays in place, so plain fields reproduce the stories' controlled behavior.)

```vue
<!-- OrderListCases.vue -->
<template>
  <OrderList v-if="c === 'basic'" v-model="items"
    ><template #option="{ option }">{{ option }}</template></OrderList
  >
</template>
<script setup lang="ts">
import OrderList from "primevue/orderlist";
import { ref } from "vue";
const props = defineProps<{ id: string }>();
const c = props.id.split("/")[2];
const items = ref(["Apple", "Banana", "Cherry", "Date"]);
</script>
```

```vue
<!-- PickListCases.vue -->
<template>
  <PickList v-if="c === 'basic'" v-model="lists"
    ><template #option="{ option }">{{ option }}</template></PickList
  >
</template>
<script setup lang="ts">
import PickList from "primevue/picklist";
import { ref } from "vue";
const props = defineProps<{ id: string }>();
const c = props.id.split("/")[2];
const lists = ref([["Apple", "Banana"], ["Cherry"]]);
</script>
```

- [ ] **Step 3: Verify the E-3 routes render on both reference apps**

Run: `G3E_BATCH=E-3 PATH=$HOME/.nvm/versions/node/v24.15.0/bin:$PATH npx playwright test -c tooling/prime-reference/playwright.config.ts g3e`
Expected: every test passes (report mode); a failure is a harness problem fixed in the reference template or case before Step 4. Review Focus 3: the filter and drag-drop cases produce rows only for `ng`; the focus cases' Tab counts are confirmed here (Step 1).

- [ ] **Step 4: Before-port Prime comparison (Docker)**

Refresh `src.tar`/`commit.txt` (Task 5 Step 4), then run: `docker run --rm --ipc=host -v "$PWD/.superpowers/sdd/2026-10-08-gap-064-g3e-media-data/docker":/io mcr.microsoft.com/playwright:v1.63.0-jammy bash /io/run.sh parity E-3 before`
Expected: `exit 0`; noise `0/0/0` on every comparison in `/io/parity-E-3-before/report.json` (AC4).

- [ ] **Step 5: E-3 regression entries and before-port Ultimate baselines**

```ts
// E-3 (OrderList, PickList) — STORIES (VISUAL: the same entries with `shot` = the `ready` selector and " rest" appended to `name`)
{ name: "OrderList Default", story: "data-orderlist--default", ready: ".u-order-list", kind: "rest", batch: "E-3" },
{ name: "OrderList Controlled", story: "data-orderlist--controlled", ready: ".u-order-list", kind: "rest", batch: "E-3" },
...(FW === "ng" ? [{ name: "OrderList Filter", story: "data-orderlist--filter", ready: ".u-order-list", kind: "rest" as const, batch: "E-3" }] : []),
{ name: "PickList Default", story: "data-picklist--default", ready: ".u-pick-list", kind: "rest", batch: "E-3" },
{ name: "PickList Controlled", story: "data-picklist--controlled", ready: ".u-pick-list", kind: "rest", batch: "E-3" },
...(FW === "ng" ? [{ name: "PickList Filter", story: "data-picklist--filter", ready: ".u-pick-list", kind: "rest" as const, batch: "E-3" }] : []),
```

Raise `EXPECTED_STORY_COUNT` by ng 6, vue 4. Run `run.sh baseline E-3`, extract the new PNGs, record the before-port accessibility rows.

- [ ] **Step 6: Write the E-3 batch record** (`docs/architecture/research/2026-10-08-gap-064-g3e-e3-record.md`, seven sections). Composition rule (Spec §6.5): Listbox differences are classified against Listbox and recorded, not ported here unless their cause is in the OrderList/PickList module.
- [ ] **Step 7: Commit and STOP** — `docs(gap-064): record the G3-E E-3 before-port comparison and proposed mapping`. **HARD USER STOP.**

### Task 12: E-3 Task B — port OrderList and PickList per the approved record

Run **Procedure B** (Task 6 Steps 1–7) with: keys `orderlist`, `picklist`; directories `order-list`, `pick-list`; renames `order-list` → `orderlist`, `pick-list` → `picklist` at every registration site (`grep -rn '"order-list"\|"pick-list"' packages/ng/src packages/vue/src`); count constant `E3_COUNTS`; batch `E-3`; CSS into `packages/{ng,vue}/src/order-list/order-list-style.ts` and `packages/{ng,vue}/src/pick-list/pick-list-style.ts`; REACH:

```ts
{ key: "orderlist", runs: [[`data-orderlist--default`, "rest", ".u-order-list"], [`data-orderlist--controlled`, "rest", ".u-order-list"], ...(FW === "ng" ? [[`data-orderlist--filter`, "rest", ".u-order-list"] as const] : [])] },
{ key: "picklist", runs: [[`data-picklist--default`, "rest", ".u-pick-list"], [`data-picklist--controlled`, "rest", ".u-pick-list"], ...(FW === "ng" ? [[`data-picklist--filter`, "rest", ".u-pick-list"] as const] : [])] },
```

Commit message: `feat(gap-064): port OrderList and PickList per the approved G3-E E-3 record`.

### Task 13: E-3 Task C — after-port evidence and review — HARD USER STOP

Run **Procedure C** (Task 7 Steps 1–6) with: batch `E-3`; record `2026-10-08-gap-064-g3e-e3-record.md`; Playbook rows `orderlist`, `picklist`. Commit `test(gap-064): accept the reviewed G3-E E-3 evidence and record OrderList/PickList status`.

---

### Task 14: E-4 Task A — DataView and OrganizationChart: cases, before-port evidence, batch record — HARD USER STOP

- [ ] **Step 1: Add the E-4 cases**

```ts
G3E.push(
  {
    key: "dataview",
    tier: "B",
    batch: "E-4",
    parts: {
      root: [".p-dataview", ".u-data-view"],
      content: [".p-dataview-content", ".u-data-view-list"],
      paginator: [".p-paginator", ".u-paginator"],
      empty: {
        ng: [".p-dataview-empty-message", ".u-data-view-list > li"],
        vue: [".p-dataview-empty-message", ".u-data-view-list > div"],
      },
      loading: [".p-dataview-loading-overlay", ".u-data-view [role=status]"],
    },
    cases: [
      {
        id: "dataview/list",
        batch: "E-4",
        section: "Basic",
        axis: "list",
        prime: "dataview/list",
        story: { ng: "data-dataview--default", vue: "data-dataview--default" },
        open: none,
        capture: "container",
        parts: ["root", "content"],
        kind: "visual",
      },
      {
        id: "dataview/grid",
        batch: "E-4",
        section: "Layout",
        axis: "grid",
        prime: "dataview/grid",
        story: { ng: "data-dataview--grid", vue: "data-dataview--grid" },
        open: none,
        capture: "container",
        parts: ["root", "content"],
        kind: "visual",
      },
      {
        id: "dataview/paginator",
        batch: "E-4",
        section: "Pagination",
        axis: "rows 2",
        prime: "dataview/paginator",
        story: { ng: "data-dataview--paginator", vue: "data-dataview--paginator" },
        open: none,
        capture: "container",
        parts: ["root", "content", "paginator"],
        kind: "visual",
      },
      {
        id: "dataview/empty",
        batch: "E-4",
        section: "(emptyMessage)",
        axis: "empty",
        prime: "dataview/empty",
        story: { ng: "data-dataview--empty", vue: "data-dataview--empty" },
        open: none,
        capture: "container",
        parts: ["root", "empty"],
        kind: "visual",
      },
      {
        id: "dataview/loading",
        batch: "E-4",
        section: "Loading (PrimeNG overlay)",
        axis: "loading",
        prime: "dataview/loading",
        story: { ng: "data-dataview--loading" },
        open: none,
        capture: "container",
        parts: ["root", "loading"],
        kind: "visual",
      },
    ],
    recorded: [
      {
        id: "dataview/loading [vue]",
        section: "Loading",
        kind: "no-prime-reference",
        reason: "PrimeVue 4.5.5 DataView renders no loading state (G3E-7).",
      },
      {
        id: "dataview/sorting",
        section: "Sorting",
        kind: "D",
        reason: "Demo header Select; no Ultimate header facet.",
      },
      {
        id: "dataview/header-footer",
        section: "(facets)",
        kind: "D",
        reason: "No header/footer template.",
      },
    ],
  },
  {
    key: "organizationchart",
    tier: "B",
    batch: "E-4",
    parts: {
      root: [".p-organizationchart", ".u-organization-chart"],
      node: [".p-organizationchart-node", ".u-organization-chart-node-content"],
      children: [".p-organizationchart-node-children", ".u-organization-chart-children"],
      selected: [
        ".p-organizationchart-node-selected",
        ".u-organization-chart-node-content[aria-selected=true]",
      ],
      toggle: [
        ".p-organizationchart-node-toggle-button",
        ".u-organization-chart-node-content button",
      ],
    },
    cases: [
      {
        id: "organizationchart/basic",
        batch: "E-4",
        section: "Basic",
        axis: "two levels",
        prime: "organizationchart/basic",
        story: { vue: "panel-organizationchart--default" },
        open: none,
        capture: "container",
        parts: ["root", "node", "children"],
        kind: "visual",
      },
      {
        id: "organizationchart/select",
        batch: "E-4",
        section: "Template (single)",
        axis: "single selected",
        prime: "organizationchart/single",
        story: { vue: "panel-organizationchart--single-selection" },
        open: none,
        capture: "container",
        parts: ["root", "selected"],
        kind: "visual",
      },
      {
        id: "organizationchart/multi",
        batch: "E-4",
        section: "Selection (multiple)",
        axis: "two selected",
        prime: "organizationchart/multiple",
        story: { vue: "panel-organizationchart--multiple-selection" },
        open: none,
        capture: "container",
        parts: ["root", "selected"],
        facts: [{ texts: "selected" }],
        kind: "visual",
      },
      {
        id: "organizationchart/toggle",
        batch: "E-4",
        section: "Colored (collapsible)",
        axis: "collapse root",
        prime: "organizationchart/collapsible",
        story: { vue: "panel-organizationchart--collapsible" },
        open: none,
        actions: [{ click: "toggle" }],
        capture: "container",
        parts: ["root", "toggle"],
        facts: [{ shown: "children" }],
        kind: "behavior",
      },
    ],
    recorded: [
      {
        id: "organizationchart/colored-template",
        section: "Colored / Template",
        kind: "D",
        reason: "No Ultimate node styleClass or node template slot.",
      },
      {
        id: "organizationchart [ng]",
        section: "—",
        kind: "D",
        reason: "No Angular component (protected DECISION-D).",
      },
    ],
  }
);
```

The `selected` and `toggle` Ultimate selectors are finalized in Step 3 from the rendered DOM of the new stories (Spec §6.8 🔶); a selector change there is a harness correction recorded in the batch record.

- [ ] **Step 2: Add the reference templates**

Register them in `vue/src/g3e/index.ts`: add `import DataViewCases from "./DataViewCases.vue"; import OrganizationChartCases from "./OrganizationChartCases.vue";` and the entries `dataview: DataViewCases, organizationchart: OrganizationChartCases`.

```vue
<!-- DataViewCases.vue (PrimeVue; no loading case: G3E-7) -->
<template>
  <DataView v-if="c === 'list' || c === 'grid'" :value="fruits" :layout="c">
    <template #list="{ items }"
      ><div v-for="item in items" :key="item.name">{{ item.name }}</div></template
    >
    <template #grid="{ items }"
      ><div v-for="item in items" :key="item.name">{{ item.name }}</div></template
    >
  </DataView>
  <DataView v-else-if="c === 'paginator'" :value="six" paginator :rows="2">
    <template #list="{ items }"
      ><div v-for="item in items" :key="item.name">{{ item.name }}</div></template
    >
  </DataView>
  <DataView v-else-if="c === 'empty'" :value="[]">
    <template #list="{ items }"
      ><div v-for="item in items" :key="item.name">{{ item.name }}</div></template
    >
  </DataView>
</template>
<script setup lang="ts">
import DataView from "primevue/dataview";
const props = defineProps<{ id: string }>();
const c = props.id.split("/")[2];
const fruits = [{ name: "Apple" }, { name: "Banana" }];
const six = ["Apple", "Banana", "Cherry", "Date", "Elderberry", "Fig"].map((name) => ({ name }));
</script>
```

```vue
<!-- OrganizationChartCases.vue (PrimeVue) -->
<template>
  <OrganizationChart v-if="c === 'basic'" :value="tree" />
  <OrganizationChart
    v-else-if="c === 'single'"
    :value="tree"
    selectionMode="single"
    v-model:selectionKeys="single"
  />
  <OrganizationChart
    v-else-if="c === 'multiple'"
    :value="tree"
    selectionMode="multiple"
    v-model:selectionKeys="multiple"
  />
  <OrganizationChart v-else-if="c === 'collapsible'" :value="tree" collapsible />
</template>
<script setup lang="ts">
import OrganizationChart from "primevue/organizationchart";
import { ref } from "vue";
const props = defineProps<{ id: string }>();
const c = props.id.split("/")[2];
const tree = {
  label: "CEO",
  key: "0",
  children: [
    { label: "CTO", key: "0_0" },
    { label: "CFO", key: "0_1" },
  ],
};
const single = ref({ "0_0": true });
const multiple = ref({ "0_0": true, "0_1": true });
</script>
```

PrimeNG (`ng/src/g3e.ts`, imports `DataViewModule` from `primeng/dataview`) — fields `fruits = [{ name: "Apple" }, { name: "Banana" }]`, `six = ["Apple", "Banana", "Cherry", "Date", "Elderberry", "Fig"].map((name) => ({ name }))`, `none: { name: string }[] = []`, and the cases

```html
@case ("dataview/list") {
<p-dataview [value]="fruits" layout="list">
  <ng-template #list let-items
    >@for (item of items; track item.name) {
    <div>{{ item.name }}</div>
    }</ng-template
  >
</p-dataview>
} @case ("dataview/grid") {
<p-dataview [value]="fruits" layout="grid">
  <ng-template #grid let-items
    >@for (item of items; track item.name) {
    <div>{{ item.name }}</div>
    }</ng-template
  >
</p-dataview>
} @case ("dataview/paginator") {
<p-dataview [value]="six" [paginator]="true" [rows]="2">
  <ng-template #list let-items
    >@for (item of items; track item.name) {
    <div>{{ item.name }}</div>
    }</ng-template
  >
</p-dataview>
} @case ("dataview/empty") {
<p-dataview [value]="none">
  <ng-template #list let-items
    >@for (item of items; track item.name) {
    <div>{{ item.name }}</div>
    }</ng-template
  >
</p-dataview>
} @case ("dataview/loading") {
<p-dataview [value]="fruits" [loading]="true">
  <ng-template #list let-items
    >@for (item of items; track item.name) {
    <div>{{ item.name }}</div>
    }</ng-template
  >
</p-dataview>
}
```

- [ ] **Step 3: Verify the E-4 routes render on both reference apps**

Run: `G3E_BATCH=E-4 PATH=$HOME/.nvm/versions/node/v24.15.0/bin:$PATH npx playwright test -c tooling/prime-reference/playwright.config.ts g3e`
Expected: every test passes (report mode); a failure is a harness problem fixed in the reference template or case before Step 4. Review Focus 3: `dataview/loading` produces an `ng` row only; the Vue loading row is `no-prime-reference`. The `selected` and `toggle` selectors are finalized here.

- [ ] **Step 4: Before-port Prime comparison (Docker)**

Refresh `src.tar`/`commit.txt` (Task 5 Step 4), then run: `docker run --rm --ipc=host -v "$PWD/.superpowers/sdd/2026-10-08-gap-064-g3e-media-data/docker":/io mcr.microsoft.com/playwright:v1.63.0-jammy bash /io/run.sh parity E-4 before`
Expected: `exit 0`; noise `0/0/0` on every comparison in `/io/parity-E-4-before/report.json` (AC4).

- [ ] **Step 5: E-4 regression entries and before-port Ultimate baselines**

```ts
// E-4 (DataView, OrganizationChart) — STORIES (VISUAL: the same entries with `shot` = the `ready` selector and " rest" appended to `name`)
{ name: "DataView Default", story: "data-dataview--default", ready: ".u-data-view", kind: "rest", batch: "E-4" },
{ name: "DataView Grid", story: "data-dataview--grid", ready: ".u-data-view", kind: "rest", batch: "E-4" },
{ name: "DataView Paginator", story: "data-dataview--paginator", ready: ".u-data-view", kind: "rest", batch: "E-4" },
{ name: "DataView Empty", story: "data-dataview--empty", ready: ".u-data-view", kind: "rest", batch: "E-4" },
...(FW === "ng" ? [{ name: "DataView Loading", story: "data-dataview--loading", ready: ".u-data-view", kind: "rest" as const, batch: "E-4" }] : []),
...(FW === "vue"
  ? (["default", "single-selection", "multiple-selection", "collapsible"] as const).map((v) => ({
      name: `OrganizationChart ${v}`,
      story: `panel-organizationchart--${v}`,
      ready: ".u-organization-chart",
      kind: "rest" as const,
      batch: "E-4",
    }))
  : []),
```

Raise `EXPECTED_STORY_COUNT` by ng 5, vue 8. Run `run.sh baseline E-4`, extract the new PNGs, record the before-port accessibility rows.

- [ ] **Step 6: Write the E-4 batch record** (`docs/architecture/research/2026-10-08-gap-064-g3e-e4-record.md`, seven sections). G3E-5: DataView item wrappers and OrganizationChart connectors — a parity need that requires new DOM is proposed as an escalation, not as a mapping.
- [ ] **Step 7: Commit and STOP** — `docs(gap-064): record the G3-E E-4 before-port comparison and proposed mapping`. **HARD USER STOP.**

### Task 15: E-4 Task B — port DataView and OrganizationChart per the approved record

Run **Procedure B** (Task 6 Steps 1–7) with: keys `dataview` (both frameworks), `organizationchart` (Vue only); directories `data-view`, `organization-chart`; renames `data-view` → `dataview`, `organization-chart` → `organizationchart` at every registration site; count constant `E4_COUNTS`; batch `E-4`; CSS into `packages/{ng,vue}/src/data-view/data-view-style.ts` and `packages/vue/src/organization-chart/organization-chart-style.ts`; REACH:

```ts
{ key: "dataview", runs: [["data-dataview--default", "rest", ".u-data-view"], ["data-dataview--grid", "rest", ".u-data-view"], ["data-dataview--paginator", "rest", ".u-data-view"], ["data-dataview--empty", "rest", ".u-data-view"], ...(FW === "ng" ? [["data-dataview--loading", "rest", ".u-data-view"] as const] : [])] },
// Vue file only:
{ key: "organizationchart", runs: [["panel-organizationchart--default", "rest", ".u-organization-chart"], ["panel-organizationchart--single-selection", "rest", ".u-organization-chart"], ["panel-organizationchart--multiple-selection", "rest", ".u-organization-chart"], ["panel-organizationchart--collapsible", "rest", ".u-organization-chart"]] },
```

Commit message: `feat(gap-064): port DataView and OrganizationChart per the approved G3-E E-4 record`.

### Task 16: E-4 Task C — after-port evidence and review — HARD USER STOP

Run **Procedure C** (Task 7 Steps 1–6) with: batch `E-4`; record `2026-10-08-gap-064-g3e-e4-record.md`; Playbook rows `dataview` (Vue loading noted as `no Prime reference`), `organizationchart`. Commit `test(gap-064): accept the reviewed G3-E E-4 evidence and record DataView/OrganizationChart status`.

---

### Task 17: G3-E regression CI step (OI-E3)

**Files:**

- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Add `G3-E` to the strict run's exclusion and the three G3-E steps**

In "Run Playwright projects", change `--grep-invert "G3-A|G3-B|G3-C1|G3-C2|G3-D"` to `--grep-invert "G3-A|G3-B|G3-C1|G3-C2|G3-D|G3-E"`. After the G3-D upload step, add:

```yaml
# GAP-064 G3-E Spec §8 / OI-E3: Ultimate regression evidence for the G3-E verification
# stories (screenshots, reach, differential accessibility). Not a Prime-parity gate:
# the Prime comparison harness (tooling/prime-reference) is not run in CI.
- name: Run G3-E verification specs (${{ matrix.framework }})
  if: ${{ !cancelled() && matrix.framework != 'react' }}
  run: |
    npx playwright test packages/${{ matrix.framework }}/e2e/g3e-aura-styles.spec.ts \
      --project=${{ matrix.framework }}-chromium \
      --project=${{ matrix.framework }}-firefox \
      --project=${{ matrix.framework }}-webkit

- name: G3-E differential accessibility validation (${{ matrix.framework }})
  if: ${{ !cancelled() && matrix.framework != 'react' }}
  shell: bash
  run: |
    mkdir -p test-results/g3e-accessibility
    node scripts/provenance/validate-g3e-accessibility.mjs ${{ matrix.framework }} 2>&1 \
      | tee test-results/g3e-accessibility/${{ matrix.framework }}-validation.txt

- name: Upload G3-E accessibility reports (${{ matrix.framework }})
  if: ${{ always() && matrix.framework != 'react' }}
  uses: actions/upload-artifact@v4
  with:
    name: g3e-accessibility-reports-${{ matrix.framework }}
    path: |
      test-results/accessibility/${{ matrix.framework }}/
      test-results/g3e-accessibility/
```

- [ ] **Step 2: Simulate the CI job locally in Docker**

Refresh `src.tar`/`commit.txt`, then run `run.sh ci ng` and `run.sh ci vue` (Task 5 Step 4 runner).
Expected: strict run unchanged except known failures; G3-E run and validator OK; G3-A..G3-D steps unchanged (AC7).

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci(gap-064): run the G3-E regression specs and accessibility differential"
```

---

### Task 18: MIGRATION, final verification and the G3-E record

**Files:**

- Modify: `docs/architecture/MIGRATION.md` (G3-E consumer-visible changes; wording reviewed by the user)
- Modify: `docs/architecture/PERFORMANCE.md` (X-10 refresh)
- Create: `docs/architecture/research/2026-10-08-gap-064-g3e-closeout.md` (draft; finalized at the closeout gate)

- [ ] **Step 1: Fresh verification at the branch head (`--retries=0`, Docker where applicable)**

Run and record: unit suites (`ng`, `vue`, `themes`), typecheck, `g3e-upstream-fidelity`, `node --test scripts/provenance/validate-g3e-accessibility.test.mjs`, the four batch harness runs (`run.sh E-1..E-4 after`), the G3-E regression spec (three engines, both frameworks), the full regression (9 Storybook + 3 SSR projects), the CI simulation, the size measurement, and the provenance changed-file completeness check.
Expected: everything passes except the known U2 and GAP-097 failures (AC7); harness noise 0 everywhere (AC4).

- [ ] **Step 2: MIGRATION and PERFORMANCE**

Add "Added for GAP-064 G3-E" to `MIGRATION.md` §8: the five key renames (theme overrides under the old hyphenated keys no longer apply) and the visible styling changes per component from the batch records. Refresh `PERFORMANCE.md` with the measured sizes.

- [ ] **Step 3: Draft the closeout record**

Per key and framework: final Playbook status, remaining differences with classification, D and no-Prime-reference cases, coverage gaps, GAPs linked (GAP-098, GAP-102 and any new ones registered at the batch gates), size, CI evidence plan. GAP-064 status proposal (G3 complete → GAP-064 status decision for the user).

- [ ] **Step 4: Commit**

```bash
git add docs/architecture/MIGRATION.md docs/architecture/PERFORMANCE.md docs/architecture/research/2026-10-08-gap-064-g3e-closeout.md
git commit -m "docs(gap-064): record G3-E migration notes, sizes and the draft closeout"
```

**STOP:** closeout acceptance, merge and push are separate user decisions.

---

## Spec coverage

| Spec                                  | Tasks                                                 |
| ------------------------------------- | ----------------------------------------------------- |
| §1 scope, batches                     | 5–16                                                  |
| §2 G3E-1 fixtures                     | 1, 2                                                  |
| §2 G3E-2 stories                      | 2 (and per-batch STORIES/VISUAL only)                 |
| §2 G3E-3 classifications              | 2 Step 3–5 (repair; stop if wrong); GAP-102 case in 5 |
| §2 G3E-4 clock                        | 3, 8, 4 Step 6                                        |
| §2 G3E-5 option (b), escalation       | Batch record rule; 8 Step 6; 14 Step 6                |
| §2 G3E-6 batch order                  | 5–16                                                  |
| §2 G3E-7 no Prime reference           | 14 Step 1, 16                                         |
| §3 workflow, re-run boundary          | Task A/B/C of each batch; 7 Step 4                    |
| §4 classifications                    | 2, 5                                                  |
| §5 E-0                                | 1–4                                                   |
| §6 per component                      | 5, 8, 11, 14 (cases, parts, D, GAPs)                  |
| §7 authorized changes                 | 6, 9, 12, 15; Global Constraints                      |
| §8 regression evidence, size          | 4, 5–16, 17, 18                                       |
| §9 status recording                   | 7, 10, 13, 16                                         |
| §10 AC1–AC7                           | 5–18                                                  |
| §12 stop conditions                   | Global Constraints; 2 Step 5; 6 Step 5                |
| §14 rulings (OI-E1..E5, fall-through) | 4 (L), 1 (staticDirs), 17, 5, 8                       |

## Items for Plan Review

- **PR-1 — Fixture URL path.** The Spec §5.1 says `/fixtures/media/<file>`; serving the fixtures directory at the root of each server (the simplest single `staticDirs`/`publicDir`/`assets` entry) gives `/media/<file>`, used consistently everywhere in this Plan. Recommended: accept `/media/<file>`.
- **PR-2 — Four images.** Spec §5.1 says "five" images but describes four reused as thumbnails; the Plan generates four. Recommended: four.
- **PR-3 — OrganizationChart `basic`.** The existing Vue story has two levels (Spec §6.8 said three). Under G3E-2 the existing story is reused and no new story is added. Recommended: two levels.
- **PR-4 — Batch data come from the batch records.** The upstream group inventory, mapping and roles of each key are decided in that batch's Task A record and approved at its HARD USER STOP, then transcribed in Task B. This is the verification-first design, not an open placeholder. Recommended: confirm.
- **PR-5 — Angular Galleria `max-width`.** Revised per Plan Review: the Angular story keeps `max-width` on the component; the PrimeNG reference cases put it on `<p-galleria>` the same way; Vue keeps its existing wrapper on both sides. No wrapper is introduced.

## Plan Review decisions (2026-10-08, user)

- **PR-1 — approved.** Fixtures at `/media/<file>`, consistent across the reference apps and the Ultimate stories.
- **PR-2 — approved with correction.** Four fixtures; Spec §5.1 and this Plan both say four.
- **PR-3 — approved.** The existing two-level OrganizationChart story is reused; no three-level story.
- **PR-4 — approved.** No CSS rule list is predefined before rendered evidence. Each batch records observed → mapped → approved → ported → rerun; the batch HARD USER STOP authorizes its rule mapping.
- **PR-5 — revised.** `max-width` stays on the Angular Galleria component (story geometry unchanged); reference cases mirror each framework's story setup.
- **Execution:** Native (inline) approved.
- **Constraints:** E-0 (Tasks 1–4) complete and verified before Task 5; no pre-authorized CSS mapping; GAP-102 not expanded; the other Vue components' fall-through observation not investigated; no DOM/runtime/API change to fit Prime selectors; every new difference classified (A/B/C/D) before any product change; a new architectural rule, ADR or second verification iteration is a stop; no unrelated CI/coverage/infrastructure work; no merge or push before final review and closeout.

## After this plan

Plan Review → execution (task by task, HARD USER STOPs at Tasks 5, 7, 8, 10, 11, 13, 14, 16) → closeout gate → merge/push decisions.
