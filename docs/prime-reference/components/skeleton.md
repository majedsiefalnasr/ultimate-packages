# Skeleton

**Category:** Misc · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Skeleton is a non-interactive placeholder block shown in place of content that is still loading. It renders one empty element with a width, a height, an optional border radius and a `rectangle` or `circle` shape. A looping highlight sweeps across it by default (`animation="wave"`); `animation="none"` removes the sweep. It has no value, emits no events and takes no slots. All three frameworks ship it (`primeng-21.1.9:packages/primeng/src/skeleton/skeleton.ts`, `primevue-4.5.5:packages/primevue/src/skeleton/Skeleton.vue`, `primereact-10.9.9:components/lib/skeleton/Skeleton.js`).

## 2. Names & status

- Canonical name: **Skeleton**, identical in all three frameworks. No legacy alias and no renamed entry in the archives. The showcase menus list it as `Skeleton` under Components > Misc (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).
- The component itself is not deprecated in any framework.
- Deprecated member: the PrimeNG `styleClass` input is marked `@deprecated since v20.0.0, use class instead` (`primeng-21.1.9:packages/primeng/src/skeleton/skeleton.ts`). The catalog marks it the same way (`docs/prime-reference/catalog/primeng.json`, module `skeleton`).
- PrimeVue and PrimeReact declare no deprecated Skeleton members in their `.d.ts` files (`primevue-4.5.5:packages/primevue/src/skeleton/Skeleton.d.ts`, `primereact-10.9.9:components/lib/skeleton/skeleton.d.ts`).
- The component is not in `GLOSSARY.md`; this record uses the name as the three frameworks spell it.

## 3. Per framework

| Aspect         | PrimeNG 21.1.9                                                                                                | PrimeVue 4.5.5                                                                                 | PrimeReact 10.9.9                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Import         | `import { SkeletonModule } from 'primeng/skeleton'` (standalone `Skeleton` also exported)                     | `import Skeleton from 'primevue/skeleton'`                                                     | `import { Skeleton } from 'primereact/skeleton'`                                                               |
| Selector / tag | `<p-skeleton>` (`selector: 'p-skeleton'`)                                                                     | `<Skeleton>`                                                                                   | `<Skeleton />`                                                                                                 |
| Source         | `packages/primeng/src/skeleton/skeleton.ts`                                                                   | `packages/primevue/src/skeleton/Skeleton.vue`                                                  | `components/lib/skeleton/Skeleton.js`                                                                          |
| Base           | `Skeleton extends BaseComponent<SkeletonPassThrough>`, standalone, `OnPush`                                   | `Skeleton.vue` extends `BaseSkeleton.vue`, which extends `BaseComponent`                       | `SkeletonBase = ComponentBase.extend({...})` in `SkeletonBase.js`; `Skeleton` is `React.memo(forwardRef(...))` |
| Style service  | `SkeletonStyle extends BaseStyle` in `packages/primeng/src/skeleton/style/skeletonstyle.ts`                   | `SkeletonStyle` in `packages/primevue/src/skeleton/style/SkeletonStyle.js`                     | No style service; CSS string in `SkeletonBase.js`                                                              |
| Public entry   | `packages/primeng/src/skeleton/public_api.ts` (exports the component and `SkeletonStyle` / `SkeletonClasses`) | `packages/primevue/src/skeleton/package.json` (`main` `Skeleton.vue`, `types` `Skeleton.d.ts`) | `components/lib/skeleton/package.json` (`types` `skeleton.d.ts`)                                               |
| Public types   | `packages/primeng/src/types/skeleton/skeleton.types.ts`                                                       | `packages/primevue/src/skeleton/Skeleton.d.ts`                                                 | `components/lib/skeleton/skeleton.d.ts`                                                                        |
| Sub-components | None                                                                                                          | None                                                                                           | None                                                                                                           |
| Directives     | `Bind` host directive (`hostDirectives: [Bind]`)                                                              | None                                                                                           | None                                                                                                           |

Showcase import snippets: `primeng-21.1.9:apps/showcase/doc/skeleton/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/skeleton/ImportDoc.vue`, `primereact-10.9.9:components/doc/skeleton/importdoc.js`.

PrimeNG's `SKELETON_INSTANCE` injection token is module-private, so it is not part of the public surface (`primeng-21.1.9:packages/primeng/src/skeleton/skeleton.ts`).

## 4. Anatomy

Skeleton has one visible element and no sub-parts. The highlight is a CSS pseudo-element, not a DOM node.

| Part      | PrimeNG                                                  | PrimeVue                         | PrimeReact            | Classes                                                                              |
| --------- | -------------------------------------------------------- | -------------------------------- | --------------------- | ------------------------------------------------------------------------------------ |
| Root      | The host element itself; the component template is empty | `div` with `data-p` shape marker | `div`                 | `p-skeleton p-component`, plus `p-skeleton-circle` and the animation-off class below |
| Highlight | `::after` pseudo-element of the root                     | `::after` of the root            | `::after` of the root | None                                                                                 |

- PT sections: PrimeNG `host` and `root` (both bound to the same element through the `Bind` directive and `ptms(['host', 'root'])`), PrimeVue `root`, PrimeReact `root`. PrimeVue and PrimeReact also accept `hooks`; PrimeNG's PT type does not declare it. Sources: `primeng-21.1.9:packages/primeng/src/types/skeleton/skeleton.types.ts`, `primevue-4.5.5:packages/primevue/src/skeleton/Skeleton.d.ts`, `primereact-10.9.9:components/lib/skeleton/skeleton.d.ts`.
- PrimeVue sets `inheritAttrs: false` and binds `ptmi('root')` on the root `div`, so attributes passed by the consumer land on the root (`primevue-4.5.5:packages/primevue/src/skeleton/Skeleton.vue`).

## 5. API highlights

Skeleton's own inputs are the same six visual props in all three frameworks. PrimeNG declares them with `@Input()`, not signals. The shared inputs `dt`, `pt`, `ptOptions` and `unstyled` come from the base class; the catalog types them as `InputSignal` (`docs/prime-reference/catalog/primeng.json`).

| Input                         | PrimeNG 21.1.9                                       | PrimeVue 4.5.5                                               | PrimeReact 10.9.9                                |
| ----------------------------- | ---------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------ |
| `shape`                       | `string`, default `'rectangle'`                      | `HintedString<'rectangle' \| 'circle'>`, default `rectangle` | `'rectangle' \| 'circle'`, default `'rectangle'` |
| `size`                        | `string`, default `undefined`                        | `string`, default `null`                                     | `string`, default `null`                         |
| `width`                       | `string`, default `'100%'`                           | `string`, default `'100%'`                                   | `string`, default `'100%'`                       |
| `height`                      | `string`, default `'1rem'`                           | `string`, default `'1rem'`                                   | `string`, default `'1rem'`                       |
| `borderRadius`                | `string`, default `undefined`                        | `string`, default `null`                                     | `string`, default `null`                         |
| `animation`                   | `string`, default `'wave'`; missing from the catalog | `HintedString<'wave' \| 'none'>`, default `wave`             | `'wave' \| 'none'`, default `'wave'`             |
| `styleClass`                  | `string`; **deprecated** since v20.0.0 (use `class`) | Not declared                                                 | Not declared                                     |
| `children`                    | Not declared                                         | Not declared                                                 | `React.ReactNode`, readonly, typed only          |
| `dt`                          | Yes (base class)                                     | Yes, typed `DesignToken<any>` in the `.d.ts`                 | Not declared (no tokens)                         |
| `pt`, `ptOptions`, `unstyled` | Yes (base class)                                     | Yes                                                          | Yes                                              |

Sources: `primeng-21.1.9:packages/primeng/src/skeleton/skeleton.ts`, `primevue-4.5.5:packages/primevue/src/skeleton/BaseSkeleton.vue`, `primevue-4.5.5:packages/primevue/src/skeleton/Skeleton.d.ts`, `primereact-10.9.9:components/lib/skeleton/SkeletonBase.js`, `primereact-10.9.9:components/lib/skeleton/skeleton.d.ts`. Catalog reference: `docs/prime-reference/catalog/primeng.json`, `primevue.json`, `primereact.json` (module `skeleton`).

- **Sizing rule (all three):** when `size` is set, the element's width and height are both `size`; otherwise they come from the `width` and `height` inputs. `borderRadius` applies in both cases. PrimeNG (`containerStyle`), PrimeVue (`containerStyle` computed) and PrimeReact (`style` constant) all implement this (`primeng-21.1.9:packages/primeng/src/skeleton/skeleton.ts`, `primevue-4.5.5:packages/primevue/src/skeleton/Skeleton.vue`, `primereact-10.9.9:components/lib/skeleton/Skeleton.js`).
- **PrimeNG unstyled mode:** `containerStyle` returns `undefined` when `$unstyled()` is true, so the inline width, height and radius are dropped and sizing must come from `pt` or the consumer's CSS (`primeng-21.1.9:packages/primeng/src/skeleton/skeleton.ts`).
- **PrimeNG `animation` JSDoc:** the source declares `@Input() animation` but its JSDoc tag reads `@gruop Props` (a typo for `@group`, line 54), and the catalog omits the input. I did not verify the cause of the omission (`primeng-21.1.9:packages/primeng/src/skeleton/skeleton.ts`).
- **Events:** none in any framework. PrimeVue declares an empty `SkeletonEmitsOptions` (`primevue-4.5.5:packages/primevue/src/skeleton/Skeleton.d.ts`).
- **Slots / templates:** none. PrimeVue declares an empty `SkeletonSlots`; PrimeNG's template is empty.
- **Methods:** PrimeReact's `.d.ts` declares `getElement(): HTMLDivElement | null` on a class. The runtime exposes `props` and `getElement` through `useImperativeHandle` on a memoised forwardRef function (`primereact-10.9.9:components/lib/skeleton/Skeleton.js`). PrimeNG and PrimeVue expose no public methods.

## 6. Usage guidance

- **Import** — Add the module (PrimeNG `SkeletonModule`), the component (PrimeVue default import) or the named export (PrimeReact). No providers or services are needed in any framework (`primeng-21.1.9:apps/showcase/doc/skeleton/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/skeleton/ImportDoc.vue`, `primereact-10.9.9:components/doc/skeleton/importdoc.js`).
- **Shapes** — Build rectangles with `width` and `height` (default `100%` by `1rem`), change corners with `borderRadius`, and make squares or circles with `size`, adding `shape="circle"` for circles. The showcase covers these combinations and pairs them with Tailwind spacing utilities (`primeng-21.1.9:apps/showcase/doc/skeleton/shapes-doc.ts`, `primevue-4.5.5:apps/showcase/doc/skeleton/ShapesDoc.vue`, `primereact-10.9.9:components/doc/skeleton/shapesdoc.js`). No showcase example sets `animation`.
- **Card** — A bordered container holds a circular block, two text-line blocks, a thin bar, a tall rectangle and two button-sized blocks. This is a composition of Skeleton elements, not a Skeleton feature (`primeng-21.1.9:apps/showcase/doc/skeleton/card-doc.ts`, `primevue-4.5.5:apps/showcase/doc/skeleton/CardDoc.vue`, `primereact-10.9.9:components/doc/skeleton/carddoc.js`).
- **List** — The same circular-plus-two-lines pattern repeats for four rows, with lines at `100%` and `75%` width (`primeng-21.1.9:apps/showcase/doc/skeleton/list-doc.ts`, `primevue-4.5.5:apps/showcase/doc/skeleton/ListDoc.vue`, `primereact-10.9.9:components/doc/skeleton/listdoc.js`).
- **DataTable** — A Skeleton fills each body cell of a table with a header row, showing placeholder rows while data loads. PrimeNG uses `p-table` with a `#body` template, PrimeVue uses `Column` with a `#body` slot, and PrimeReact uses `DataTable` with `Column` (`primeng-21.1.9:apps/showcase/doc/skeleton/datatable-doc.ts`, `primevue-4.5.5:apps/showcase/doc/skeleton/DataTableDoc.vue`, `primereact-10.9.9:components/doc/skeleton/datatabledoc.js`).
- **Accessibility** — The showcase explains screen-reader behaviour and the container `aria-busy` pattern. See section 7 (`primeng-21.1.9:apps/showcase/doc/skeleton/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/skeleton/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/skeleton/accessibilitydoc.js`).
- **Pass-through** — A PT viewer and a PT options table are provided (`primeng-21.1.9:apps/showcase/doc/skeleton/pt/PTViewer.ts`, `primevue-4.5.5:apps/showcase/doc/skeleton/pt/index.vue`, `primereact-10.9.9:components/doc/skeleton/pt/wireframe.js`). The PrimeNG viewer uses the deprecated `styleClass` input in its examples, which is a doc-source mismatch.
- No showcase in any framework has a Basic section. After Import, the first example section is Shapes.

## 7. Accessibility

- **Hidden from assistive technology:** the root carries `aria-hidden="true"` in all three frameworks. PrimeNG sets it on the host (`[attr.aria-hidden]: 'true'`), PrimeVue as an attribute on the root `div`, and PrimeReact as `'aria-hidden': true` on the root `div` (`primeng-21.1.9:packages/primeng/src/skeleton/skeleton.ts`, `primevue-4.5.5:packages/primevue/src/skeleton/Skeleton.vue`, `primereact-10.9.9:components/lib/skeleton/Skeleton.js`). The PrimeReact snapshot shows `aria-hidden="true"` on the rendered root (`primereact-10.9.9:components/lib/skeleton/__snapshots__/Skeleton.spec.js.snap`).
- **Extra attributes:** the showcase says any valid attribute passed to the root is kept, so consumers can override or extend it. PrimeVue merges consumer attributes through `ptmi` (`primevue-4.5.5:packages/core/src/basecomponent/BaseComponent.vue`). PrimeReact spreads unknown props onto the root (`primereact-10.9.9:components/lib/componentbase/ComponentBase.js`).
- **Grouped placeholders:** the showcase recommends `aria-busy` on the container that holds several skeletons. None of the three components sets `aria-busy` itself (`primeng-21.1.9:apps/showcase/doc/skeleton/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/skeleton/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/skeleton/accessibilitydoc.js`).
- **Keyboard:** Skeleton has no interactive elements and no keyboard support. The showcase says so in all three frameworks.
- **Motion:** none of the three sources contains a `prefers-reduced-motion` rule for the skeleton sweep (`@primeuix/styles-2.0.3:dist/skeleton/index.mjs`, `primereact-10.9.9:components/lib/skeleton/SkeletonBase.js`). Use `animation="none"` to stop it.
- Skeleton does not announce a loading state. The showcase leaves that to the container's `aria-busy`.

## 8. Theming

- **Style classes:** `p-skeleton` (root), `p-skeleton-circle` (when `shape="circle"`) and the animation-off class. PrimeNG and PrimeVue use `p-skeleton-animation-none`; PrimeReact uses `p-skeleton-none` (see the framework differences table). Sources: `primeng-21.1.9:packages/primeng/src/skeleton/style/skeletonstyle.ts`, `primevue-4.5.5:packages/primevue/src/skeleton/style/SkeletonStyle.js`, `primereact-10.9.9:components/lib/skeleton/SkeletonBase.js`.
- **Catalog gap:** the catalog lists only `p-skeleton` as a style class for PrimeNG (`modules.skeleton.style.classes`) and only `SkeletonClasses.root` for PrimeVue (`enumerations.SkeletonClasses`). The two modifier classes come from source only.
- **Structural CSS (PrimeNG and PrimeVue):** `@primeuix/styles-2.0.3:dist/skeleton/index.mjs` sets `display: block`, `overflow: hidden`, `background: dt('skeleton.background')` and `border-radius: dt('skeleton.border.radius')` on `.p-skeleton`. The `::after` highlight is an absolutely positioned gradient using `dt('skeleton.animation.background')`, animated by `p-skeleton-animation` over 1.2s, infinite. An RTL variant `p-skeleton-animation-rtl` applies under `[dir='rtl']`. `.p-skeleton-animation-none::after` sets `animation: none`.
- **Design tokens (PrimeNG and PrimeVue):** the skeleton component key holds three tokens: `skeleton.border.radius`, `skeleton.background` and `skeleton.animation.background`. Types are in `@primeuix/themes-2.0.3:types/skeleton/index.d.ts`, and the CSS variable names (`--p-skeleton-border-radius`, `--p-skeleton-background`, `--p-skeleton-animation-background`) are in `@primeuix/themes-2.0.3:tokens/index.mjs`.
- **Preset values** (`@primeuix/themes-2.0.3:dist/<preset>/skeleton/index.mjs`):
  - Aura and Lara: `root.borderRadius` `{content.border.radius}`; light `background` `{surface.200}` and `animationBackground` `rgba(255,255,255,0.4)`; dark `background` `rgba(255, 255, 255, 0.06)` and `animationBackground` `rgba(255, 255, 255, 0.04)`.
  - Material: the same values as Aura, plus an empty `css` string.
  - Nora: light `background` `{surface.300}`; dark `background` `rgba(255, 255, 255, 0.1)`; animation values as in Aura.
- **PrimeReact:** no `@primeuix` tokens; design tokens are N/A. Its own CSS is an inline string in `SkeletonBase.js` inside `@layer primereact`: `.p-skeleton { position: relative; overflow: hidden }`, a `::after` sweep of 1.2s infinite, `.p-skeleton-circle { border-radius: 50% }`, and `.p-skeleton-none::after { animation: none }`. The colours come from the theme stylesheet, for example `.p-skeleton { background-color: #e5e7eb; border-radius: 6px }` in `primereact-10.9.9:public/themes/lara-light-amber/theme.css`.
- **Pass-through:** global key `skeleton` in `primeng-21.1.9:packages/primeng/src/config/primeng.types.ts`, `primevue-4.5.5:packages/primevue/src/config/Config.d.ts` and `primereact-10.9.9:components/lib/api/api.d.ts`.
- **Tailwind:** PrimeReact's Tailwind preset has a `skeleton.root` entry (`primereact-10.9.9:components/lib/passthrough/tailwind/index.js`, line 1766). Its showcase example uses `animate-pulse` and gradient utilities (`primereact-10.9.9:components/doc/skeleton/theming/tailwinddoc.js`). PrimeVue's Tailwind page links out to an external presets project (`primevue-4.5.5:apps/showcase/doc/skeleton/theming/TailwindDoc.vue`); that project is not in the archive.
- **Theming docs:** PrimeVue's theming page lists CSS classes, design tokens and built-in presets (`primevue-4.5.5:apps/showcase/doc/skeleton/theming/index.vue`). PrimeReact's lists CSS classes (`primereact-10.9.9:components/doc/skeleton/theming/styleddoc.js`), The styled table has two copy-paste errors: it describes `p-skeleton-circle` as the container of a "determinate progressbar" and `p-skeleton-none` as the container of an "indeterminate progressbar" (`primereact-10.9.9:components/doc/skeleton/theming/styleddoc.js`, lines 24 and 28). PrimeNG's page sets `themeDocs="skeleton"`, which adds a THEMING tab through the shared `app-docthemingsection` component. The archive has no `apps/showcase/doc/skeleton/theming/` folder for it (`primeng-21.1.9:apps/showcase/pages/skeleton/index.ts`, `primeng-21.1.9:apps/showcase/components/doc/app.doc.ts`).

## 9. Relationships

- **Embeds:** nothing. No component source in any framework imports Skeleton. A search of each framework's package source outside the Skeleton folder finds only barrel exports, config types and the PrimeReact Tailwind preset: `primeng-21.1.9:packages/primeng/src/config/primeng.types.ts`, `primevue-4.5.5:packages/primevue/src/index.js`, `primevue-4.5.5:packages/primevue/src/index.d.ts`, `primevue-4.5.5:packages/primevue/src/umd/primevue.js`, `primevue-4.5.5:packages/primevue/src/config/Config.d.ts`, `primereact-10.9.9:components/lib/primereact.all.js`, `primereact-10.9.9:components/lib/passthrough/tailwind/index.js`.
- **Used by:** consumers only. Showcase compositions place it inside DataTable cells, Card layouts and List rows (`primeng-21.1.9:apps/showcase/doc/skeleton/datatable-doc.ts`, `primevue-4.5.5:apps/showcase/doc/skeleton/DataTableDoc.vue`, `primereact-10.9.9:components/doc/skeleton/datatabledoc.js`).
- **Related loading indicators (Misc):** ProgressBar (its `mode="indeterminate"` is the linear loading alternative), ProgressSpinner (spinning indicator with no value), and BlockUI (masks a region while it loads). Records: `progressbar`, `progressspinner`, `blockui`.
- **Cross-category:** Data (DataTable, see the `datatable` record) and Panel (Card, see the `card` record) both appear in the showcase examples.
- **Alias chain:** none.

## 10. Dependencies

- **PrimeNG:** `@angular/common` (`CommonModule`), `@angular/core`, `primeng/api` (`SharedModule`), `primeng/basecomponent` (`BaseComponent`, `PARENT_INSTANCE`), `primeng/bind` (`Bind`), `primeng/base` (`BaseStyle`), `primeng/types/skeleton` and `@primeuix/styles/skeleton` (`primeng-21.1.9:packages/primeng/src/skeleton/skeleton.ts`, `primeng-21.1.9:packages/primeng/src/skeleton/style/skeletonstyle.ts`).
- **PrimeVue:** `@primeuix/utils` (`cn`), `@primevue/core/basecomponent`, `primevue/skeleton/style` (in `BaseSkeleton.vue`), `@primeuix/styles/skeleton` and `@primevue/core/base/style` (`primevue-4.5.5:packages/primevue/src/skeleton/Skeleton.vue`, `primevue-4.5.5:packages/primevue/src/skeleton/BaseSkeleton.vue`, `primevue-4.5.5:packages/primevue/src/skeleton/style/SkeletonStyle.js`).
- **PrimeReact:** `react`, `../api/Api` (`PrimeReactContext`), `../componentbase/ComponentBase` (`ComponentBase`, `useHandleStyle`), `../hooks/Hooks` (`useMergeProps`) and `../utils/Utils` (`classNames`) (`primereact-10.9.9:components/lib/skeleton/Skeleton.js`, `primereact-10.9.9:components/lib/skeleton/SkeletonBase.js`).
- **Internal modules shared with other components:** `@primeuix/styles`, `@primeuix/themes`, and the PrimeNG `Bind` directive and `BaseComponent` base classes.
- **External npm packages:** none beyond each framework's runtime (Angular, Vue and React).

## 11. Framework differences

| Aspect                 | PrimeNG                                                                          | PrimeVue                                                    | PrimeReact                                                |
| ---------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------- |
| Implementation         | Standalone Angular component, `OnPush`                                           | Vue SFC over `BaseSkeleton.vue`                             | `React.memo(forwardRef)` function component               |
| Rendered root          | Host element, empty template                                                     | `div`                                                       | `div`                                                     |
| `aria-hidden`          | `[attr.aria-hidden]` `'true'` on host                                            | `aria-hidden="true"` on root                                | `'aria-hidden': true` on root                             |
| `data-p` shape marker  | Yes (`dataP`)                                                                    | Yes (`dataP`)                                               | No                                                        |
| Circle class           | `p-skeleton-circle`                                                              | `p-skeleton-circle`                                         | `p-skeleton-circle`                                       |
| Animation-off class    | `p-skeleton-animation-none`                                                      | `p-skeleton-animation-none`                                 | `p-skeleton-none`                                         |
| Size when unstyled     | Inline width, height and radius omitted                                          | Always applied                                              | Always applied                                            |
| Structural CSS         | `@primeuix/styles` skeleton, with RTL keyframes                                  | `@primeuix/styles` skeleton, with RTL keyframes             | Inline CSS string in `SkeletonBase.js`, no RTL rule       |
| Design tokens          | `skeleton.background`, `skeleton.border.radius`, `skeleton.animation.background` | Same as PrimeNG                                             | N/A (theme stylesheet colours)                            |
| `dt` prop              | Yes                                                                              | Yes                                                         | No                                                        |
| Pass-through sections  | `host`, `root`                                                                   | `root`, `hooks`                                             | `root`, `hooks`                                           |
| Public methods         | None                                                                             | None                                                        | `getElement()` and `props` via imperative handle          |
| Deprecated members     | `styleClass`                                                                     | None                                                        | None                                                      |
| Unit tests             | `packages/primeng/src/skeleton/skeleton.spec.ts` (1466 lines)                    | `packages/primevue/src/skeleton/Skeleton.spec.js` (5 tests) | `components/lib/skeleton/Skeleton.spec.js` with snapshots |
| Showcase Basic section | None                                                                             | None                                                        | None                                                      |
| Showcase menu          | Components > Misc                                                                | Components > Misc                                           | Components > Misc                                         |

Sources are cited in sections 3, 4, 5, 7 and 8 above.

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/skeleton/skeleton.ts`
- `primeng-21.1.9:packages/primeng/src/skeleton/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/skeleton/style/skeletonstyle.ts`
- `primeng-21.1.9:packages/primeng/src/skeleton/skeleton.spec.ts`
- `primeng-21.1.9:packages/primeng/src/types/skeleton/skeleton.types.ts`
- `primeng-21.1.9:packages/primeng/src/config/primeng.types.ts`
- `primeng-21.1.9:apps/showcase/doc/skeleton/import-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/skeleton/shapes-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/skeleton/card-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/skeleton/list-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/skeleton/datatable-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/skeleton/accessibility-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/skeleton/pt/PTViewer.ts`
- `primeng-21.1.9:apps/showcase/doc/skeleton/pt/PTComponent.ts`
- `primeng-21.1.9:apps/showcase/pages/skeleton/index.ts`
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/skeleton/Skeleton.vue`
- `primevue-4.5.5:packages/primevue/src/skeleton/BaseSkeleton.vue`
- `primevue-4.5.5:packages/primevue/src/skeleton/Skeleton.d.ts`
- `primevue-4.5.5:packages/primevue/src/skeleton/Skeleton.spec.js`
- `primevue-4.5.5:packages/primevue/src/skeleton/package.json`
- `primevue-4.5.5:packages/primevue/src/skeleton/style/SkeletonStyle.js`
- `primevue-4.5.5:packages/primevue/src/skeleton/style/SkeletonStyle.d.ts`
- `primevue-4.5.5:packages/primevue/src/index.js`
- `primevue-4.5.5:packages/primevue/src/config/Config.d.ts`
- `primevue-4.5.5:packages/core/src/basecomponent/BaseComponent.vue`
- `primevue-4.5.5:apps/showcase/doc/skeleton/ImportDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/skeleton/ShapesDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/skeleton/CardDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/skeleton/ListDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/skeleton/DataTableDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/skeleton/AccessibilityDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/skeleton/pt/index.vue`
- `primevue-4.5.5:apps/showcase/doc/skeleton/pt/PTViewer.vue`
- `primevue-4.5.5:apps/showcase/doc/skeleton/theming/index.vue`
- `primevue-4.5.5:apps/showcase/doc/skeleton/theming/TailwindDoc.vue`
- `primevue-4.5.5:apps/showcase/pages/skeleton/index.vue`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/skeleton/Skeleton.js`
- `primereact-10.9.9:components/lib/skeleton/SkeletonBase.js`
- `primereact-10.9.9:components/lib/skeleton/skeleton.d.ts`
- `primereact-10.9.9:components/lib/skeleton/Skeleton.spec.js`
- `primereact-10.9.9:components/lib/skeleton/__snapshots__/Skeleton.spec.js.snap`
- `primereact-10.9.9:components/lib/skeleton/package.json`
- `primereact-10.9.9:components/lib/componentbase/ComponentBase.js`
- `primereact-10.9.9:components/lib/api/api.d.ts`
- `primereact-10.9.9:components/lib/primereact.all.js`
- `primereact-10.9.9:components/lib/passthrough/tailwind/index.js`
- `primevue-4.5.5:packages/primevue/src/umd/primevue.js`
- `primevue-4.5.5:packages/primevue/src/index.d.ts`
- `primeng-21.1.9:apps/showcase/components/doc/app.doc.ts`
- `primereact-10.9.9:components/doc/skeleton/importdoc.js`
- `primereact-10.9.9:components/doc/skeleton/shapesdoc.js`
- `primereact-10.9.9:components/doc/skeleton/carddoc.js`
- `primereact-10.9.9:components/doc/skeleton/listdoc.js`
- `primereact-10.9.9:components/doc/skeleton/datatabledoc.js`
- `primereact-10.9.9:components/doc/skeleton/accessibilitydoc.js`
- `primereact-10.9.9:components/doc/skeleton/pt/wireframe.js`
- `primereact-10.9.9:components/doc/skeleton/theming/styleddoc.js`
- `primereact-10.9.9:components/doc/skeleton/theming/tailwinddoc.js`
- `primereact-10.9.9:components/layout/menu.json`
- `primereact-10.9.9:public/themes/lara-light-amber/theme.css`
- `@primeuix/styles-2.0.3:dist/skeleton/index.mjs`
- `@primeuix/themes-2.0.3:types/skeleton/index.d.ts`
- `@primeuix/themes-2.0.3:tokens/index.mjs`
- `@primeuix/themes-2.0.3:dist/aura/skeleton/index.mjs`
- `@primeuix/themes-2.0.3:dist/lara/skeleton/index.mjs`
- `@primeuix/themes-2.0.3:dist/material/skeleton/index.mjs`
- `@primeuix/themes-2.0.3:dist/nora/skeleton/index.mjs`
