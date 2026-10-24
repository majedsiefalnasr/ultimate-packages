# Chart

**Category:** Misc · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Chart is a thin wrapper around a Chart.js chart. It renders a `<canvas>` inside a relatively positioned container, creates a Chart.js instance from the `type`, `data`, `options` and `plugins` inputs, and exposes a few helpers (`refresh`, `reinit`, `generateLegend`, `getBase64Image`, …). All drawing, chart types (bar, line, pie, doughnut, polarArea, radar, scatter, bubble) and chart behaviour belong to Chart.js; the Prime component only owns lifecycle, a click event, accessibility attributes on the canvas and the root element. Chart.js is an **external dependency that none of the three packages declares**: the application has to install it itself (see §10). All three frameworks ship it (`primeng-21.1.9:packages/primeng/src/chart/chart.ts`, `primevue-4.5.5:packages/primevue/src/chart/Chart.vue`, `primereact-10.9.9:components/lib/chart/Chart.js`).

## 2. Names & status

- Canonical name: **Chart**. The showcase menu has a category "Chart" containing one entry labelled "Chart.js" routed to `/chart` in all three frameworks (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).
- PrimeNG exports the component class as **`UIChart`** (selector `p-chart`) and the NgModule as `ChartModule`; PrimeVue and PrimeReact use `Chart` (`primeng-21.1.9:packages/primeng/src/chart/chart.ts`).
- Not to be confused with **OrganizationChart** (separate component, "Data" category in the menus); the two share only a name fragment.
- Not deprecated in any framework: the PrimeNG catalog entry for `UIChart` carries no deprecated members (`docs/prime-reference/catalog/primeng.json`).
- Upstream doc-comment mismatch: the class comments of PrimeNG `UIChart`, its `ChartStyle`, and the PrimeVue `Chart.d.ts` / `ChartStyle.d.ts` read "Chart groups a collection of contents in tabs" (copied from the tabs component). PrimeReact's typings are correct ("based on Chart.js") (`primeng-21.1.9:packages/primeng/src/chart/chart.ts`, `primevue-4.5.5:packages/primevue/src/chart/Chart.d.ts`, `primereact-10.9.9:components/lib/chart/chart.d.ts`).

## 3. Per framework

| Aspect              | PrimeNG                                                                                                  | PrimeVue                                                                      | PrimeReact                                                                                                         |
| ------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Import              | `import { ChartModule } from 'primeng/chart'`                                                            | `import Chart from 'primevue/chart'`                                          | `import { Chart } from 'primereact/chart'`                                                                         |
| Selector / tag      | `<p-chart>`                                                                                              | `<Chart>`                                                                     | `<Chart />`                                                                                                        |
| Source              | `packages/primeng/src/chart/chart.ts`                                                                    | `packages/primevue/src/chart/Chart.vue`                                       | `components/lib/chart/Chart.js`                                                                                    |
| Entry point         | secondary entry `primeng/chart` (`public_api.ts` re-exports `./chart` and `./style/chartstyle`)          | package export `./chart` → `./src/chart/Chart.vue`, `./chart/style`           | `components/lib/chart/package.json` (`main` `./chart.cjs.js`, `module` `./chart.esm.js`, `unpkg` `./chart.min.js`) |
| Base                | `BaseComponent<ChartPassThrough>`, standalone, `OnPush`, `hostDirectives: [Bind]`                        | `BaseComponent` via `BaseChart.vue`, `inheritAttrs: false`                    | `ComponentBase.extend` (`ChartBase.js`); `React.memo(React.forwardRef(...))`                                       |
| Exports             | `UIChart`, `ChartModule`, `ChartStyle`, `ChartClasses`                                                   | default `Chart` (+ `ChartStyle`)                                              | `Chart`                                                                                                            |
| Barrel availability | importable from `primeng/chart` only                                                                     | **not** in the generated per-component barrel entries (see §10); subpath only | subpath `primereact/chart` (own entry)                                                                             |
| Chart.js loading    | static `import Chart from 'chart.js/auto'` at module top; instance created in `ngZone.runOutsideAngular` | lazy `import('chart.js/auto')` on every (re)init                              | uses a global `Chart` when present (script-tag build), otherwise lazy `import('chart.js/auto')`                    |

Sources: `primeng-21.1.9:packages/primeng/src/chart/public_api.ts`, `primeng-21.1.9:apps/showcase/doc/chart/import-doc.ts`, `primevue-4.5.5:packages/primevue/package.json`, `primevue-4.5.5:packages/primevue/src/chart/package.json`, `primevue-4.5.5:apps/showcase/doc/chart/ImportDoc.vue`, `primereact-10.9.9:components/lib/chart/package.json`, `primereact-10.9.9:components/doc/chart/importdoc.js`.

## 4. Anatomy

| Part   | Element                                 | PrimeNG PT key                    | PrimeVue PT key | PrimeReact PT key | Class / style                                       |
| ------ | --------------------------------------- | --------------------------------- | --------------- | ----------------- | --------------------------------------------------- |
| Root   | host element (PrimeNG) / `div` (others) | `host`, `root` (both on the host) | `root`          | `root`            | `p-chart`; `position: relative` (+ size, see below) |
| Canvas | `canvas` (child of root)                | `canvas`                          | `canvas`        | `canvas`          | none; Chart.js draws into it                        |

- Root inline style: PrimeNG `display: block; position: relative; width: <width>; height: <height>` (from the `width`/`height` string inputs); PrimeVue `position: relative` only; PrimeReact `width`/`height` from props merged with `style`, plus `.p-chart { position: relative }` in its own CSS (`primeng-21.1.9:packages/primeng/src/chart/style/chartstyle.ts`, `primevue-4.5.5:packages/primevue/src/chart/style/ChartStyle.js`, `primereact-10.9.9:components/lib/chart/ChartBase.js`).
- Canvas attributes: PrimeNG sets `role="img"`, `aria-label`, `aria-labelledby`, and `width`/`height` attributes only when not responsive or when explicitly given; PrimeVue always sets `width`/`height` (defaults 300/150) and spreads `canvasProps` then `ptm('canvas')`; PrimeReact sets `width`, `height`, `role="img"`, `aria-label` and merges `ptm('canvas')`.
- There are no sub-components, templates or slots. PrimeVue declares `ChartSlots {}` (empty) and its template has no `<slot>`; PrimeReact's `children` prop is typed but `Chart.js` never renders it (`primevue-4.5.5:packages/primevue/src/chart/Chart.d.ts`, `primereact-10.9.9:components/lib/chart/Chart.js`).
- PT definitions: `primeng-21.1.9:packages/primeng/src/types/chart/chart.types.ts`, `primevue-4.5.5:packages/primevue/src/chart/Chart.d.ts`, `primereact-10.9.9:components/lib/chart/chart.d.ts`.

## 5. API highlights

| Prop / input     | PrimeNG                                                                                     | PrimeVue                | PrimeReact                                     |
| ---------------- | ------------------------------------------------------------------------------------------- | ----------------------- | ---------------------------------------------- |
| `type`           | `'bar' \| 'line' \| 'scatter' \| 'bubble' \| 'pie' \| 'doughnut' \| 'polarArea' \| 'radar'` | `string`                | `string`                                       |
| `data`           | `any` (setter → `reinit()`)                                                                 | `object` (deep watch)   | `object`                                       |
| `options`        | `any` (setter → `reinit()`), default `{}`                                                   | `object` (watch)        | `object`                                       |
| `plugins`        | `any[]`, default `[]`                                                                       | `any[]`                 | `any[]`                                        |
| `width`          | `string`                                                                                    | `number`, default `300` | `string`                                       |
| `height`         | `string`                                                                                    | `number`, default `150` | `string`                                       |
| `responsive`     | `boolean`, default `true`                                                                   | — (not a prop)          | — (not a prop)                                 |
| `ariaLabel`      | `string`                                                                                    | — (use `canvasProps`)   | `string`, default `options.plugins.title.text` |
| `ariaLabelledBy` | `string`                                                                                    | — (use `canvasProps`)   | —                                              |
| `canvasProps`    | —                                                                                           | `CanvasHTMLAttributes`  | — (use `pt.canvas`)                            |

| Event / callback | PrimeNG                                                | PrimeVue                                                              | PrimeReact                                                       |
| ---------------- | ------------------------------------------------------ | --------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Element click    | `onDataSelect` → `{ originalEvent, element, dataset }` | `select` → `ChartSelectEvent` (`originalEvent`, `element`, `dataset`) | — (no event; extra props such as `onClick` go to the root `div`) |
| Chart created    | —                                                      | `loaded(chart)`                                                       | —                                                                |

| Method             | PrimeNG                              | PrimeVue                                        | PrimeReact                    |
| ------------------ | ------------------------------------ | ----------------------------------------------- | ----------------------------- |
| `refresh()`        | `chart.update()` (documented)        | `chart.update()` (documented)                   | `chart.update()` (documented) |
| `reinit()`         | destroy + recreate (documented)      | recreate (documented)                           | —                             |
| `generateLegend()` | documented                           | documented                                      | documented                    |
| `getChart()`       | — (public field `chart`)             | documented                                      | documented                    |
| `getCanvas()`      | source only (not in the methods doc) | source only; returns `this.$canvas` (see below) | documented                    |
| `getBase64Image()` | source only                          | source only (not in `ChartMethods`)             | documented                    |
| `getElement()`     | —                                    | —                                               | documented                    |

- The click handler calls `chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false)` and `'dataset'`, and emits only when a nearest element exists (`primeng-21.1.9:packages/primeng/src/chart/chart.ts`, `primevue-4.5.5:packages/primevue/src/chart/Chart.vue`).
- Dimensions: PrimeNG, when `responsive` and a `width` or `height` is given, sets `maintainAspectRatio = false` on the options object; it also writes `responsive` onto the caller's `options` object (mutation). PrimeVue and PrimeReact do not touch options.
- Rebuild triggers differ (see §11): PrimeNG rebuilds on `data`/`options` assignment only (changing `type`, `plugins`, `responsive`, `width`, `height` after init does nothing until `reinit()` is called); PrimeVue rebuilds on `data` (deep), `type`, `options`; PrimeReact rebuilds on every committed render.
- Full API: catalog modules `chart` (PrimeNG `UIChart`, PrimeVue `chart`/`chartstyle`, PrimeReact `Chart`) in `docs/prime-reference/catalog/primeng.json`, `primevue.json`, `primereact.json`.
- PrimeNG showcase also holds `props-doc.ts` and `methods-doc.ts` (plain tables: props `type`, `data`, `options`, `plugins`, `width`, `height`, `responsive`, `onDataSelect`; methods `refresh`, `reinit`, `generateLegend`) that its page definition does not use; the page uses generated API docs instead (`primeng-21.1.9:apps/showcase/doc/chart/props-doc.ts`, `primeng-21.1.9:apps/showcase/doc/chart/methods-doc.ts`, `primeng-21.1.9:apps/showcase/pages/chart/index.ts`).

## 6. Usage guidance

- **Import** — standard per-framework import line (`primeng-21.1.9:apps/showcase/doc/chart/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/chart/ImportDoc.vue`, `primereact-10.9.9:components/doc/chart/importdoc.js`).
- **Chart.js** — install the `chart.js` npm package first; the component does not ship it (`primeng-21.1.9:apps/showcase/doc/chart/chartjs-doc.ts`, `primevue-4.5.5:apps/showcase/doc/chart/ChartJSDoc.vue`, `primereact-10.9.9:components/doc/chart/chartjsdoc.js`).
- **Basic** — a chart needs `type`, `data` (datasets) and `options`; the demo builds colours from CSS variables (`--p-text-color`, `--p-text-muted-color`, `--p-content-border-color`) read with `getComputedStyle`, and the PrimeNG demo rebuilds its data/options after a theme transition (`primeng-21.1.9:apps/showcase/doc/chart/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/chart/BasicDoc.vue`, `primereact-10.9.9:components/doc/chart/basicdoc.js`).
- **Pie** — circular chart divided into proportional slices (`primeng-21.1.9:apps/showcase/doc/chart/pie-doc.ts`, `primevue-4.5.5:apps/showcase/doc/chart/PieChartDoc.vue`, `primereact-10.9.9:components/doc/chart/piechartdoc.js`).
- **Doughnut** — pie variant with an empty centre (`primeng-21.1.9:apps/showcase/doc/chart/doughnut-doc.ts`, `primevue-4.5.5:apps/showcase/doc/chart/DoughnutDoc.vue`, `primereact-10.9.9:components/doc/chart/doughnutdoc.js`).
- **Vertical bar** — `type="bar"` with grouped datasets (`primeng-21.1.9:apps/showcase/doc/chart/verticalbar-doc.ts`, `primevue-4.5.5:apps/showcase/doc/chart/VerticalBarDoc.vue`, `primereact-10.9.9:components/doc/chart/verticalbardoc.js`).
- **Horizontal bar** — set the Chart.js option `indexAxis: 'y'` (`primeng-21.1.9:apps/showcase/doc/chart/horizontalbar-doc.ts`, `primevue-4.5.5:apps/showcase/doc/chart/HorizontalBarDoc.vue`, `primereact-10.9.9:components/doc/chart/horizontalbardoc.js`).
- **Stacked bar** — enable `stacked` on the scales (`primeng-21.1.9:apps/showcase/doc/chart/stackedbar-doc.ts`, `primevue-4.5.5:apps/showcase/doc/chart/StackedBarDoc.vue`, `primereact-10.9.9:components/doc/chart/stackedbardoc.js`).
- **Line** — `type="line"` (`primeng-21.1.9:apps/showcase/doc/chart/line-doc.ts`, `primevue-4.5.5:apps/showcase/doc/chart/LineDoc.vue`, `primereact-10.9.9:components/doc/chart/linedoc.js`).
- **Multi axis** — several axes through the `scales` option (`primeng-21.1.9:apps/showcase/doc/chart/multiaxis-doc.ts`, `primevue-4.5.5:apps/showcase/doc/chart/MultiAxisDoc.vue`, `primereact-10.9.9:components/doc/chart/multiaxisdoc.js`).
- **Line styles** — dataset-level styling, for example filled area charts (`primeng-21.1.9:apps/showcase/doc/chart/linestyle-doc.ts`, `primevue-4.5.5:apps/showcase/doc/chart/LineStylesDoc.vue`, `primereact-10.9.9:components/doc/chart/linestylesdoc.js`).
- **Polar area** — like a pie but with equal angles and value-dependent radius (`primeng-21.1.9:apps/showcase/doc/chart/polararea-doc.ts`, `primevue-4.5.5:apps/showcase/doc/chart/PolarAreaDoc.vue`, `primereact-10.9.9:components/doc/chart/polarareadoc.js`).
- **Radar** — multivariate data on axes from a common origin (`primeng-21.1.9:apps/showcase/doc/chart/radar-doc.ts`, `primevue-4.5.5:apps/showcase/doc/chart/RadarDoc.vue`, `primereact-10.9.9:components/doc/chart/radardoc.js`).
- **Combo** — mix chart types in one graph through each dataset's own `type` (`primeng-21.1.9:apps/showcase/doc/chart/combo-doc.ts`, `primevue-4.5.5:apps/showcase/doc/chart/ComboDoc.vue`, `primereact-10.9.9:components/doc/chart/combodoc.js`).
- **Accessibility** — see §7 (`primeng-21.1.9:apps/showcase/doc/chart/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/chart/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/chart/accessibilitydoc.js`).
- Required services/providers: none. The PrimeNG and PrimeReact bar/pie demos use plain `class="w-full md:w-[30rem]"`-style sizing on the component; wide charts get an explicit height class (for example `h-[30rem]`) because the canvas fills its container in responsive mode (`primeng-21.1.9:apps/showcase/doc/chart/line-doc.ts`).
- The PrimeNG and PrimeReact doc text for **Basic** spells the type as "doughtnut" (typo; the value is `doughnut`) (`primeng-21.1.9:apps/showcase/doc/chart/basic-doc.ts`, `primereact-10.9.9:components/doc/chart/basicdoc.js`).
- Pass-through and theming pages exist in all three showcases (`primeng-21.1.9:apps/showcase/doc/chart/pt/PTViewer.ts`, `primevue-4.5.5:apps/showcase/doc/chart/pt/index.vue`, `primereact-10.9.9:components/doc/chart/pt/wireframe.js`).

## 7. Accessibility

- A canvas is opaque to assistive technology, so all three docs defer to the Chart.js accessibility guide and add the framework hooks below (`primeng-21.1.9:apps/showcase/doc/chart/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/chart/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/chart/accessibilitydoc.js`).
- **PrimeNG** — canvas has `role="img"` with `aria-label` / `aria-labelledby` bound to the inputs `ariaLabel` / `ariaLabelledBy` (`primeng-21.1.9:packages/primeng/src/chart/chart.ts`).
- **PrimeVue** — no role or label by default; supply them with `canvasProps` (the doc example passes `role: 'img'` and `aria-label`) (`primevue-4.5.5:packages/primevue/src/chart/Chart.vue`).
- **PrimeReact** — canvas has `role="img"` and `aria-label` = `ariaLabel` prop, falling back to `options.plugins.title.text`; more attributes via `pt.canvas` (`primereact-10.9.9:components/lib/chart/Chart.js`).
- Doc/source mismatch: the PrimeVue and PrimeReact accessibility docs say content placed inside the component is passed as a child of the canvas to provide fallback content (such as a table). Neither implementation renders a slot or `children` inside the canvas (PrimeVue template has no `<slot>`; PrimeReact renders `<canvas {...canvasProps} />` only), so that fallback does not appear in the DOM. The PrimeReact doc example is also malformed (`pt={canvas: {...}}}`). PrimeNG's doc makes no such claim.
- Keyboard support: none; the chart is not focusable. Chart.js tooltips and legend interactions are pointer-driven.

## 8. Theming

- Style class (the only one): `p-chart` on the root (catalog `ChartClasses.root`; PrimeNG `ChartStyle.classes.root`, PrimeVue `classes.root`, PrimeReact `css.classes.root`) (`primeng-21.1.9:packages/primeng/src/chart/style/chartstyle.ts`, `primevue-4.5.5:packages/primevue/src/chart/style/ChartStyle.js`, `primereact-10.9.9:components/lib/chart/ChartBase.js`).
- Pass-through sections: PrimeNG `host`, `root`, `canvas`; PrimeVue `root`, `canvas` (+ `hooks`); PrimeReact `root`, `canvas` (+ `hooks`).
- Structural CSS: **none**. `@primeuix/styles` ships no `chart` module and the PrimeNG/PrimeVue style classes do not import one; layout comes only from the inline styles listed in §4 (`@primeuix/styles-2.0.3:dist/index.mjs`, `primeng-21.1.9:packages/primeng/src/chart/style/chartstyle.ts`).
- Design tokens: **none**. `@primeuix/themes` has no `chart` token group and no `ChartDesignTokens` (only `organizationchart`), so the `dt` prop is accepted but has nothing to scope (`@primeuix/themes-2.0.3:types/index.d.ts`, `primevue-4.5.5:packages/primevue/src/chart/Chart.d.ts`).
- Chart colours are therefore the application's job: the showcase reads global tokens such as `--p-text-color` with `getComputedStyle` and feeds them into Chart.js `options` (`primevue-4.5.5:apps/showcase/doc/chart/BasicDoc.vue`).
- PrimeReact: own CSS in `ChartBase.js` (`@layer primereact { .p-chart { position: relative } }`); design tokens N/A. The PrimeReact theming docs list only `p-chart` ("Container element") and a Tailwind sample `chart: { root: 'relative' }` (`primereact-10.9.9:components/doc/chart/theming/styleddoc.js`, `primereact-10.9.9:components/doc/chart/theming/tailwinddoc.js`).
- Theming docs: `primevue-4.5.5:apps/showcase/doc/chart/theming/index.vue`, `primevue-4.5.5:apps/showcase/doc/chart/theming/TailwindDoc.vue`.

## 9. Relationships

- Embeds no Prime components; it only wraps Chart.js. Showcase demos place it in plain `.card` containers.
- Data-visualisation siblings: **MeterGroup** (multi-segment bar, no Chart.js), **ProgressBar**, **Knob** (circular value input) and **OrganizationChart** (hierarchy diagram, unrelated implementation).
- Same optional-third-party pattern as **Editor** (Quill): not a dependency, lazily or externally loaded, excluded from PrimeVue's root barrel imports and Nuxt auto-registration (see §10).
- No alias chain or legacy names.

## 10. Dependencies

- **External: `chart.js`** (imported as `chart.js/auto`). Not declared as `dependencies`, `peerDependencies` or optional peer in any published package manifest; the application must install it.

| Framework  | Declared in package manifest                                                                                                                                            | Version evidence in the repository                                                                                                                                                                | Loading                                                         |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| PrimeNG    | No. `packages/primeng/package.json` has `peerDependencies` for Angular, CDK and `rxjs` only; `ng-package.json` allow-list has no `chart.js`.                            | Showcase `chart.js` `4.4.2` (exact). Showcase page text: "Charts.js 3.3.2+".                                                                                                                      | Static top-level import in `chart.ts`.                          |
| PrimeVue   | No. `packages/primevue/package.json` `dependencies` are `@primeuix/*`, `@primevue/core`, `@primevue/icons`; the only peer is `vue` (on `@primevue/core`).               | Showcase `chart.js` `3.3.2` via `catalogs.app` in `pnpm-workspace.yaml`; code-sample dependency hint `3.3.2`. Rollup lists `chart.js/auto` in `GLOBAL_EXTERNALS`.                                 | Lazy `import('chart.js/auto')` in `initChart()`.                |
| PrimeReact | No. The published `package.json` (generated in `rollup.config.js`) has peers `react`, `react-dom`, optional `@types/react`, and `react-transition-group` as dependency. | Repository `package.json` `dependencies` `chart.js` `4.5.0` (this is the showcase app, not what consumers install); code-sample dependency hint `3.9.1`. `chart.js/auto` is in rollup `EXTERNAL`. | Global `Chart` if defined, else lazy `import('chart.js/auto')`. |

- The four numbers differ (3.3.2, 3.9.1, 4.4.2, 4.5.0) and none is a declared range; the only stated floor is "3.3.2+" in the PrimeNG page description. Treat Chart.js 3.x–4.x as the observed range, with no enforced constraint.
- PrimeVue: `chart` is in `ignoredFolders` of the package prebuild script, so no per-component barrel entry is generated for it; the UMD list adds Chart explicitly, and the Nuxt module excludes `Editor` and `Chart` from auto-registration by default (`primevue-4.5.5:packages/primevue/scripts/prebuild.mjs`, `primevue-4.5.5:packages/nuxt-module/src/module.ts`).
- Internal modules — PrimeNG: `@angular/common`, `@angular/core`, `primeng/api` (`SharedModule`), `primeng/basecomponent`, `primeng/bind`, `primeng/base` (style), `primeng/types/chart`. PrimeVue: `@primevue/core/basecomponent`, `@primevue/core/base/style`, `primevue/chart/style`. PrimeReact: `../api/Api`, `../componentbase/ComponentBase`, `../hooks/Hooks` (`useMergeProps`, `useUnmountEffect`), `../utils/Utils` (`classNames`). No `@primeuix/utils` or motion usage, no icons, no overlay.
- Sources: `primeng-21.1.9:packages/primeng/package.json`, `primeng-21.1.9:packages/primeng/src/ng-package.json`, `primeng-21.1.9:apps/showcase/package.json`, `primeng-21.1.9:apps/showcase/pages/chart/index.ts`, `primevue-4.5.5:packages/primevue/package.json`, `primevue-4.5.5:packages/core/package.json`, `primevue-4.5.5:pnpm-workspace.yaml`, `primevue-4.5.5:apps/showcase/package.json`, `primevue-4.5.5:packages/primevue/rollup.config.mjs`, `primereact-10.9.9:package.json`, `primereact-10.9.9:rollup.config.js`.

## 11. Framework differences

| Aspect                    | PrimeNG                                                                            | PrimeVue                                                                                            | PrimeReact                                                                                                 |
| ------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Chart.js import           | static (`chart.js/auto`, hard requirement at build)                                | lazy dynamic import, async                                                                          | global `Chart` or lazy dynamic import, async                                                               |
| Load failure              | module resolution error at build                                                   | unhandled rejected promise (no `catch`)                                                             | unhandled rejected promise (no `catch`)                                                                    |
| Unmount during async load | n/a (sync)                                                                         | no guard in the `then` callback                                                                     | guarded (`canvasRef.current` check)                                                                        |
| SSR guard                 | `isPlatformBrowser` check                                                          | init in `mounted`                                                                                   | init in `useEffect`                                                                                        |
| Change detection          | `runOutsideAngular`, `OnPush`                                                      | normal                                                                                              | normal                                                                                                     |
| Rebuild trigger           | `data` / `options` setters only                                                    | `data` (deep), `type`, `options`                                                                    | every committed render; `memo` only lets renders through when `data`, `options` or `type` identity changes |
| `plugins` change          | ignored until `reinit()`                                                           | ignored (not watched)                                                                               | ignored (memo comparator)                                                                                  |
| `responsive` prop         | yes (default `true`), also forces `maintainAspectRatio = false` with explicit size | no                                                                                                  | no                                                                                                         |
| Size inputs               | strings, applied as host style and (non-responsive) canvas attrs                   | numbers, default 300 × 150, always canvas attrs                                                     | strings, applied as root style and canvas attrs                                                            |
| Click event               | `onDataSelect`                                                                     | `select`                                                                                            | none                                                                                                       |
| Creation event            | none                                                                               | `loaded(chart)`                                                                                     | none                                                                                                       |
| Accessible name           | `ariaLabel`, `ariaLabelledBy`                                                      | `canvasProps`                                                                                       | `ariaLabel` (default chart title), `pt.canvas`                                                             |
| Default canvas role       | `img`                                                                              | none                                                                                                | `img`                                                                                                      |
| `getChart()`              | no (field `chart`)                                                                 | yes                                                                                                 | yes                                                                                                        |
| `getCanvas()` works       | yes                                                                                | **broken**: returns `this.$canvas`, which is defined nowhere (the real reference is `$refs.canvas`) | yes                                                                                                        |
| `reinit()`                | yes                                                                                | yes                                                                                                 | no                                                                                                         |
| Theming                   | no tokens, no structural CSS                                                       | no tokens, no structural CSS                                                                        | own CSS, no tokens                                                                                         |

- PrimeNG `reinit()` runs only when a chart exists, so assigning `data` before the view initialises does nothing extra; the first chart is created in `onAfterViewInit` (`primeng-21.1.9:packages/primeng/src/chart/chart.ts`).
- PrimeVue and PrimeReact reinit/recreate paths: `primevue-4.5.5:packages/primevue/src/chart/Chart.vue`, `primereact-10.9.9:components/lib/chart/Chart.js`.

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/chart/` (`chart.ts`, `public_api.ts`, `ng-package.json`, `style/chartstyle.ts`)
- `primeng-21.1.9:packages/primeng/src/types/chart/chart.types.ts`
- `primeng-21.1.9:packages/primeng/package.json`
- `primeng-21.1.9:packages/primeng/src/ng-package.json`
- `primeng-21.1.9:apps/showcase/package.json`
- `primeng-21.1.9:apps/showcase/pages/chart/index.ts`
- `primeng-21.1.9:apps/showcase/doc/chart/` (`import-doc.ts`, `chartjs-doc.ts`, `basic-doc.ts`, `pie-doc.ts`, `doughnut-doc.ts`, `verticalbar-doc.ts`, `horizontalbar-doc.ts`, `stackedbar-doc.ts`, `line-doc.ts`, `multiaxis-doc.ts`, `linestyle-doc.ts`, `polararea-doc.ts`, `radar-doc.ts`, `combo-doc.ts`, `accessibility-doc.ts`, `props-doc.ts`, `methods-doc.ts`, `pt/PTViewer.ts`)
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/chart/` (`Chart.vue`, `BaseChart.vue`, `Chart.d.ts`, `package.json`, `style/ChartStyle.js`)
- `primevue-4.5.5:packages/primevue/package.json`
- `primevue-4.5.5:packages/primevue/rollup.config.mjs`
- `primevue-4.5.5:packages/primevue/scripts/prebuild.mjs`
- `primevue-4.5.5:packages/nuxt-module/src/module.ts`
- `primevue-4.5.5:packages/core/package.json`
- `primevue-4.5.5:pnpm-workspace.yaml`
- `primevue-4.5.5:apps/showcase/package.json`
- `primevue-4.5.5:apps/showcase/doc/chart/` (`ImportDoc.vue`, `ChartJSDoc.vue`, `BasicDoc.vue`, `PieChartDoc.vue`, `DoughnutDoc.vue`, `VerticalBarDoc.vue`, `HorizontalBarDoc.vue`, `StackedBarDoc.vue`, `LineDoc.vue`, `MultiAxisDoc.vue`, `LineStylesDoc.vue`, `PolarAreaDoc.vue`, `RadarDoc.vue`, `ComboDoc.vue`, `AccessibilityDoc.vue`, `pt/index.vue`, `theming/index.vue`, `theming/TailwindDoc.vue`)
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/chart/` (`Chart.js`, `ChartBase.js`, `chart.d.ts`, `package.json`)
- `primereact-10.9.9:package.json`
- `primereact-10.9.9:rollup.config.js`
- `primereact-10.9.9:components/doc/chart/` (`importdoc.js`, `chartjsdoc.js`, `basicdoc.js`, `piechartdoc.js`, `doughnutdoc.js`, `verticalbardoc.js`, `horizontalbardoc.js`, `stackedbardoc.js`, `linedoc.js`, `multiaxisdoc.js`, `linestylesdoc.js`, `polarareadoc.js`, `radardoc.js`, `combodoc.js`, `accessibilitydoc.js`, `pt/wireframe.js`, `theming/styleddoc.js`, `theming/tailwinddoc.js`)
- `primereact-10.9.9:components/layout/menu.json`
- `@primeuix/styles-2.0.3:dist/index.mjs`
- `@primeuix/themes-2.0.3:types/index.d.ts`
