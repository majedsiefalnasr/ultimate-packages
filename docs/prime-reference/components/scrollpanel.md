# ScrollPanel

**Category:** Panel · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

ScrollPanel wraps content in a fixed-size viewport and replaces the native scrollbars with themable custom bars. The native scrollbars are hidden; the custom horizontal and vertical bars track the scroll position, can be dragged, and respond to arrow keys when focused. All three frameworks ship it under the same name (`primeng-21.1.9:packages/primeng/src/scrollpanel/scrollpanel.ts`, `primevue-4.5.5:packages/primevue/src/scrollpanel/ScrollPanel.vue`, `primereact-10.9.9:components/lib/scrollpanel/ScrollPanel.js`).

## 2. Names & status

- Canonical name: **ScrollPanel** in all three frameworks; no legacy component aliases.
- PrimeNG accepts three selectors: `p-scroll-panel`, `p-scrollPanel`, `p-scrollpanel` (`primeng-21.1.9:packages/primeng/src/scrollpanel/scrollpanel.ts`).
- Not deprecated. PrimeNG `styleClass` is deprecated since v20.0.0 in favor of `class`.
- Listed in the Panel group of every showcase menu (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).

## 3. Per framework

| Aspect         | PrimeNG                                                                                                                           | PrimeVue                                                                                                                    | PrimeReact                                                                            |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Import         | `import { ScrollPanelModule } from 'primeng/scrollpanel'` (component `ScrollPanel` is standalone)                                 | `import ScrollPanel from 'primevue/scrollpanel'`                                                                            | `import { ScrollPanel } from 'primereact/scrollpanel'`                                |
| Selector / tag | `<p-scrollpanel>` (aliases `p-scroll-panel`, `p-scrollPanel`)                                                                     | `<ScrollPanel>`                                                                                                             | `<ScrollPanel />`                                                                     |
| Source         | `packages/primeng/src/scrollpanel/scrollpanel.ts`, `style/scrollpanelstyle.ts`, types in `types/scrollpanel/scrollpanel.types.ts` | `packages/primevue/src/scrollpanel/ScrollPanel.vue`, `BaseScrollPanel.vue`, `ScrollPanel.d.ts`, `style/ScrollPanelStyle.js` | `components/lib/scrollpanel/ScrollPanel.js`, `ScrollPanelBase.js`, `scrollpanel.d.ts` |
| Base class     | `BaseComponent<ScrollPanelPassThrough>`                                                                                           | `BaseComponent` (via `BaseScrollPanel`)                                                                                     | `ComponentBase.extend` (`ScrollPanelBase`)                                            |
| Sub-components | none                                                                                                                              | none                                                                                                                        | none                                                                                  |

Sources: `primeng-21.1.9:apps/showcase/doc/scrollpanel/import-doc.ts`, `primeng-21.1.9:packages/primeng/src/scrollpanel/public_api.ts`, `primevue-4.5.5:apps/showcase/doc/scrollpanel/ImportDoc.vue`, `primevue-4.5.5:packages/primevue/src/scrollpanel/BaseScrollPanel.vue`, `primereact-10.9.9:components/doc/scrollpanel/importdoc.js`, `primereact-10.9.9:components/lib/scrollpanel/ScrollPanelBase.js`.

## 4. Anatomy

| Part              | Element                 | PrimeNG PT key     | PrimeVue PT key    | PrimeReact PT key | Class (PrimeNG / PrimeVue)              | Class (PrimeReact)      |
| ----------------- | ----------------------- | ------------------ | ------------------ | ----------------- | --------------------------------------- | ----------------------- |
| Root              | host / `<div>`          | `root`             | `root`             | `root`            | `p-scrollpanel`                         | `p-scrollpanel`         |
| Content container | `<div>` (clips)         | `contentContainer` | `contentContainer` | `wrapper`         | `p-scrollpanel-content-container`       | `p-scrollpanel-wrapper` |
| Content           | `<div>` (native scroll) | `content`          | `content`          | `content`         | `p-scrollpanel-content`                 | `p-scrollpanel-content` |
| Horizontal bar    | `<div role=scrollbar>`  | `barX`             | `barX`             | `barX`            | `p-scrollpanel-bar p-scrollpanel-bar-x` | same                    |
| Vertical bar      | `<div role=scrollbar>`  | `barY`             | `barY`             | `barY`            | `p-scrollpanel-bar p-scrollpanel-bar-y` | same                    |

- The content element is the real scroll container; its native scrollbar is pushed out of view by the container and the bars are absolutely positioned overlays sized from the content/viewport ratio (`@primeuix/styles-2.0.3:dist/scrollpanel/index.mjs`, `primereact-10.9.9:components/lib/scrollpanel/ScrollPanelBase.js`).
- A bar is hidden (`p-scrollpanel-hidden` added by script) when its axis does not overflow (`primeng-21.1.9:packages/primeng/src/scrollpanel/scrollpanel.ts`).
- PT definitions: `primeng-21.1.9:packages/primeng/src/types/scrollpanel/scrollpanel.types.ts`, `primevue-4.5.5:packages/primevue/src/scrollpanel/ScrollPanel.d.ts`, `primereact-10.9.9:components/lib/scrollpanel/scrollpanel.d.ts`.

## 5. API highlights

| Member  | PrimeNG                                     | PrimeVue                                        | PrimeReact                                                                                             |
| ------- | ------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `step`  | `step: number = 5` (px per keyboard repeat) | `step: Number = 5`                              | `step = 5` in `defaultProps` (not declared in `ScrollPanelProps`)                                      |
| Content | projection or `content` template            | default slot                                    | `children`                                                                                             |
| Methods | `refresh()`, `scrollTop(scrollTop: number)` | `refresh()`, `scrollTop(scrollTop)` (in source) | `getElement()`, `getContent()`, `getXBar()`, `getYBar()`; `refresh()` exposed by the ref but not typed |
| Styling | `styleClass` (deprecated since v20.0.0)     | inherited `pt`, `ptOptions`, `unstyled`, `dt`   | `style`, `className`, `pt`, `ptOptions`, `unstyled`                                                    |
| Events  | none                                        | none                                            | none                                                                                                   |

- `refresh()` recomputes bar sizes after the content changes; `scrollTop()` clamps the value to the scrollable range (`primeng-21.1.9:packages/primeng/src/scrollpanel/scrollpanel.ts`, `primevue-4.5.5:packages/primevue/src/scrollpanel/ScrollPanel.vue`).
- Dimensions are set by the consumer through `style`/`class`; there is no width/height prop.
- Full API: catalog module `scrollpanel` in `docs/prime-reference/catalog/primeng.json`, `primevue.json`, `primereact.json`.

## 6. Usage guidance

- **Basic** — give the panel an explicit width and height so it can scroll its content (`primeng-21.1.9:apps/showcase/doc/scrollpanel/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/scrollpanel/BasicDoc.vue`, `primereact-10.9.9:components/doc/scrollpanel/basicdoc.js`).
- **Custom** — restyle the bars (color, size, radius, hover opacity) for a consistent look across browsers; PrimeNG/PrimeVue do it through the `bar` design tokens or PT classes, PrimeReact through CSS on the bar classes (`primeng-21.1.9:apps/showcase/doc/scrollpanel/custom-doc.ts`, `primevue-4.5.5:apps/showcase/doc/scrollpanel/CustomDoc.vue`, `primereact-10.9.9:components/doc/scrollpanel/customdoc.js`).

No services or providers are required.

## 7. Accessibility

- Each bar has `role="scrollbar"`, `aria-orientation`, `aria-valuenow` (the last scroll offset) and `aria-controls` pointing at the content id, and is focusable with `tabindex="0"` (`primeng-21.1.9:apps/showcase/doc/scrollpanel/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/scrollpanel/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/scrollpanel/accessibilitydoc.js`).
- Keyboard on a focused bar: Up/Down arrows scroll vertically, Left/Right arrows scroll horizontally, repeating while the key is held, by `step` pixels per tick. Which axis responds depends on the last scroll direction recorded by the component, not on which bar has focus (`primevue-4.5.5:packages/primevue/src/scrollpanel/ScrollPanel.vue`).
- Source gaps:
  - Only PrimeVue puts the id on the content element. PrimeNG and PrimeReact generate a content id for `aria-controls` but never assign it, so the reference is dangling (`primeng-21.1.9:packages/primeng/src/scrollpanel/scrollpanel.ts`, `primereact-10.9.9:components/lib/scrollpanel/ScrollPanel.js`).
  - PrimeReact swaps `aria-valuenow`: the horizontal bar reports the top offset and the vertical bar the left offset (`primereact-10.9.9:components/lib/scrollpanel/ScrollPanel.js`).
  - `aria-valuemin`/`aria-valuemax` are not set in any framework.
- The scrollable content itself keeps native keyboard/wheel scrolling.

## 8. Theming

- Style classes (PrimeNG/PrimeVue): `p-scrollpanel` (with `p-component`), `p-scrollpanel-content-container`, `p-scrollpanel-content`, `p-scrollpanel-bar`, `p-scrollpanel-bar-x`, `p-scrollpanel-bar-y`; runtime classes `p-scrollpanel-hidden` and `p-scrollpanel-grabbed` (`primeng-21.1.9:packages/primeng/src/scrollpanel/style/scrollpanelstyle.ts`, `primevue-4.5.5:packages/primevue/src/scrollpanel/style/ScrollPanelStyle.js`).
- Structural CSS: `@primeuix/styles-2.0.3:dist/scrollpanel/index.mjs`; PrimeNG appends `.p-scrollpanel { display: block }`.
- Design tokens (`@primeuix/themes-2.0.3:types/scrollpanel/index.d.ts`, `@primeuix/themes-2.0.3:tokens/index.mjs`; 9 tokens): `root.transitionDuration`, `bar` (`size`, `borderRadius`, `background`, `focusRing.width/style/color/offset/shadow`). Aura values: `@primeuix/themes-2.0.3:dist/aura/scrollpanel/index.mjs`.
- PrimeReact: classes and own structural CSS in `ScrollPanelBase.js` (`p-scrollpanel-wrapper` instead of `content-container`); design tokens N/A (`primereact-10.9.9:components/lib/scrollpanel/ScrollPanelBase.js`, `primereact-10.9.9:components/doc/scrollpanel/styledoc.js`).
- Pass-through docs: `primeng-21.1.9:apps/showcase/doc/scrollpanel/pt/PTViewer.ts`, `primevue-4.5.5:apps/showcase/doc/scrollpanel/pt/index.vue`, `primereact-10.9.9:components/doc/scrollpanel/pt/wireframe.js`.

## 9. Relationships

- Embeds no other Prime components.
- Related: VirtualScroller (renders only visible items of large lists); Splitter panels and Dialog bodies commonly host a ScrollPanel.

## 10. Dependencies

- PrimeNG: `@angular/common`, `@angular/core`, `@primeuix/utils` (DOM helpers, `uuid`), `primeng/api`, `primeng/basecomponent`, `primeng/bind`, `primeng/ts-helpers`, `primeng/base`, `@primeuix/styles/scrollpanel` (`primeng-21.1.9:packages/primeng/src/scrollpanel/scrollpanel.ts`, `primeng-21.1.9:packages/primeng/src/scrollpanel/style/scrollpanelstyle.ts`).
- PrimeVue: `@primevue/core/basecomponent`, `@primevue/core/base/style`, `@primeuix/utils/dom`, `@primeuix/styles/scrollpanel` (`primevue-4.5.5:packages/primevue/src/scrollpanel/ScrollPanel.vue`, `primevue-4.5.5:packages/primevue/src/scrollpanel/style/ScrollPanelStyle.js`).
- PrimeReact: `../api/Api`, `../componentbase/ComponentBase`, `../hooks/Hooks`, `../utils/Utils` (`primereact-10.9.9:components/lib/scrollpanel/ScrollPanel.js`).
- External npm packages: none beyond the framework.

## 11. Framework differences

| Aspect                         | PrimeNG                                  | PrimeVue                                 | PrimeReact                                                             |
| ------------------------------ | ---------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------- |
| Selectors                      | three aliases                            | `ScrollPanel`                            | `ScrollPanel`                                                          |
| Container class / PT key       | `content-container` / `contentContainer` | `content-container` / `contentContainer` | `wrapper` / `wrapper`                                                  |
| Content id for `aria-controls` | not assigned                             | assigned                                 | not assigned                                                           |
| `aria-valuenow`                | matches axis                             | matches axis                             | swapped between bars                                                   |
| Public methods                 | `refresh`, `scrollTop`                   | `refresh`, `scrollTop`                   | `getElement`, `getContent`, `getXBar`, `getYBar` (+ untyped `refresh`) |
| `step` typing                  | typed input                              | typed prop                               | default only, missing from `.d.ts`                                     |
| Theming                        | `@primeuix` tokens                       | `@primeuix` tokens                       | own CSS, theme variables                                               |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/scrollpanel/scrollpanel.ts`
- `primeng-21.1.9:packages/primeng/src/scrollpanel/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/scrollpanel/style/scrollpanelstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/scrollpanel/scrollpanel.types.ts`
- `primeng-21.1.9:apps/showcase/doc/scrollpanel/` (`import-doc.ts`, `basic-doc.ts`, `custom-doc.ts`, `accessibility-doc.ts`, `pt/PTViewer.ts`)
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/scrollpanel/ScrollPanel.vue`
- `primevue-4.5.5:packages/primevue/src/scrollpanel/BaseScrollPanel.vue`
- `primevue-4.5.5:packages/primevue/src/scrollpanel/ScrollPanel.d.ts`
- `primevue-4.5.5:packages/primevue/src/scrollpanel/style/ScrollPanelStyle.js`
- `primevue-4.5.5:apps/showcase/doc/scrollpanel/` (`ImportDoc.vue`, `BasicDoc.vue`, `CustomDoc.vue`, `AccessibilityDoc.vue`, `pt/index.vue`, `theming/index.vue`)
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/scrollpanel/ScrollPanel.js`
- `primereact-10.9.9:components/lib/scrollpanel/ScrollPanelBase.js`
- `primereact-10.9.9:components/lib/scrollpanel/scrollpanel.d.ts`
- `primereact-10.9.9:components/doc/scrollpanel/` (`importdoc.js`, `basicdoc.js`, `customdoc.js`, `accessibilitydoc.js`, `styledoc.js`, `theming/styleddoc.js`, `pt/wireframe.js`)
- `primereact-10.9.9:components/layout/menu.json`
- `@primeuix/styles-2.0.3:dist/scrollpanel/index.mjs`
- `@primeuix/themes-2.0.3:types/scrollpanel/index.d.ts`
- `@primeuix/themes-2.0.3:tokens/index.mjs`
- `@primeuix/themes-2.0.3:dist/aura/scrollpanel/index.mjs`
