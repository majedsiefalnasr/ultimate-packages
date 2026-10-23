# Divider

**Category:** Panel · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Divider draws a horizontal or vertical separator line between content, with a solid, dashed or dotted stroke and optional inline content (text, icon, button) aligned along the line. All three frameworks ship it under the same name (`primeng-21.1.9:packages/primeng/src/divider/divider.ts`, `primevue-4.5.5:packages/primevue/src/divider/Divider.vue`, `primereact-10.9.9:components/lib/divider/Divider.js`).

## 2. Names & status

- Canonical name: **Divider** in all three frameworks; no legacy aliases.
- Not deprecated. In PrimeNG the `styleClass` input is deprecated since v20.0.0 in favor of `class` (`primeng-21.1.9:packages/primeng/src/divider/divider.ts`).
- Listed in the Panel group of every showcase menu (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).

## 3. Per framework

| Aspect         | PrimeNG                                                                                                       | PrimeVue                                                                                                | PrimeReact                                                            |
| -------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Import         | `import { DividerModule } from 'primeng/divider'` (component `Divider` is standalone)                         | `import Divider from 'primevue/divider'`                                                                | `import { Divider } from 'primereact/divider'`                        |
| Selector / tag | `<p-divider>`                                                                                                 | `<Divider>`                                                                                             | `<Divider />`                                                         |
| Source         | `packages/primeng/src/divider/divider.ts`, `style/dividerstyle.ts`, types in `types/divider/divider.types.ts` | `packages/primevue/src/divider/Divider.vue`, `BaseDivider.vue`, `Divider.d.ts`, `style/DividerStyle.js` | `components/lib/divider/Divider.js`, `DividerBase.js`, `divider.d.ts` |
| Base class     | `BaseComponent<DividerPassThrough>`                                                                           | `BaseComponent` (via `BaseDivider`)                                                                     | `ComponentBase.extend` (`DividerBase`)                                |
| Sub-components | none                                                                                                          | none                                                                                                    | none                                                                  |

Sources: `primeng-21.1.9:apps/showcase/doc/divider/import-doc.ts`, `primeng-21.1.9:packages/primeng/src/divider/public_api.ts`, `primevue-4.5.5:apps/showcase/doc/divider/ImportDoc.vue`, `primevue-4.5.5:packages/primevue/src/divider/BaseDivider.vue`, `primereact-10.9.9:components/doc/divider/importdoc.js`, `primereact-10.9.9:components/lib/divider/DividerBase.js`.

## 4. Anatomy

| Part    | Element                           | PrimeNG PT key | PrimeVue PT key | PrimeReact PT key | Class               |
| ------- | --------------------------------- | -------------- | --------------- | ----------------- | ------------------- |
| Root    | host / `<div role=separator>`     | `root`         | `root`          | `root`            | `p-divider`         |
| Content | `<div>` holding projected content | `content`      | `content`       | `content`         | `p-divider-content` |

- The line itself is drawn by a `::before` pseudo-element of the root, not by a child element (`@primeuix/styles-2.0.3:dist/divider/index.mjs`, `primereact-10.9.9:components/lib/divider/DividerBase.js`).
- PrimeVue renders the content `div` only when the default slot is used; PrimeNG and PrimeReact always render it (`primevue-4.5.5:packages/primevue/src/divider/Divider.vue`, `primeng-21.1.9:packages/primeng/src/divider/divider.ts`, `primereact-10.9.9:components/lib/divider/Divider.js`).
- PT definitions: `primeng-21.1.9:packages/primeng/src/types/divider/divider.types.ts`, `primevue-4.5.5:packages/primevue/src/divider/Divider.d.ts`, `primereact-10.9.9:components/lib/divider/divider.d.ts`.

## 5. API highlights

Shared props (same name and default everywhere):

| Prop     | Type                                                 | Default        | Notes                                                                              |
| -------- | ---------------------------------------------------- | -------------- | ---------------------------------------------------------------------------------- |
| `layout` | `'horizontal' \| 'vertical'`                         | `'horizontal'` | Orientation; also written to `aria-orientation`                                    |
| `type`   | `'solid' \| 'dashed' \| 'dotted'`                    | `'solid'`      | Stroke style                                                                       |
| `align`  | `'left' \| 'center' \| 'right' \| 'top' \| 'bottom'` | none           | Content position; left/center/right for horizontal, top/center/bottom for vertical |

- When `align` is unset the content defaults to the left on a horizontal divider and to the center on a vertical one (`primeng-21.1.9:packages/primeng/src/divider/style/dividerstyle.ts`, `primevue-4.5.5:packages/primevue/src/divider/style/DividerStyle.js`).
- Content: PrimeNG `ng-content`, PrimeVue default slot, PrimeReact `children`.
- PrimeNG extra: `styleClass` (deprecated since v20.0.0). PrimeReact extra: `getElement()` method, `style`, `className`, `pt`, `ptOptions`, `unstyled` (`primereact-10.9.9:components/lib/divider/divider.d.ts`).
- No events.
- Full API: catalog module `divider` in `docs/prime-reference/catalog/primeng.json`, `primevue.json`, `primereact.json`.

## 6. Usage guidance

- **Basic** — place a divider between blocks of text to separate them (`primeng-21.1.9:apps/showcase/doc/divider/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/divider/BasicDoc.vue`, `primereact-10.9.9:components/doc/divider/basicdoc.js`).
- **Type** — switch the stroke to dashed or dotted with `type` (`primeng-21.1.9:apps/showcase/doc/divider/type-doc.ts`, `primevue-4.5.5:apps/showcase/doc/divider/TypeDoc.vue`, `primereact-10.9.9:components/doc/divider/typedoc.js`).
- **Vertical** — set `layout` to vertical to separate items placed side by side in a flex row (`primeng-21.1.9:apps/showcase/doc/divider/vertical-doc.ts`, `primevue-4.5.5:apps/showcase/doc/divider/VerticalDoc.vue`, `primereact-10.9.9:components/doc/divider/verticaldoc.js`).
- **Content** — nest a label or icon inside the divider and position it with `align` (`primeng-21.1.9:apps/showcase/doc/divider/content-doc.ts`, `primevue-4.5.5:apps/showcase/doc/divider/ContentDoc.vue`, `primereact-10.9.9:components/doc/divider/contentdoc.js`).
- **Login** — a sample form split into two columns by a vertical divider that collapses to a horizontal "OR" divider on small screens (`primeng-21.1.9:apps/showcase/doc/divider/login-doc.ts`, `primevue-4.5.5:apps/showcase/doc/divider/LoginDoc.vue`, `primereact-10.9.9:components/doc/divider/logindoc.js`).

No services or providers are required.

## 7. Accessibility

- The root carries `role="separator"` and `aria-orientation` set to the `layout` value (`primeng-21.1.9:packages/primeng/src/divider/divider.ts`, `primevue-4.5.5:packages/primevue/src/divider/Divider.vue`, `primereact-10.9.9:components/lib/divider/Divider.js`).
- Not focusable; no keyboard interaction (`primeng-21.1.9:apps/showcase/doc/divider/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/divider/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/divider/accessibilitydoc.js`).
- Content placed inside a `separator` is presentational to assistive technology, so text in the divider (for example "OR") should not carry essential meaning on its own.

## 8. Theming

- Style classes: `p-divider` (with `p-component`), `p-divider-horizontal`, `p-divider-vertical`, `p-divider-solid`, `p-divider-dashed`, `p-divider-dotted`, `p-divider-left`, `p-divider-center`, `p-divider-right`, `p-divider-top`, `p-divider-bottom`, `p-divider-content` (`primeng-21.1.9:packages/primeng/src/divider/style/dividerstyle.ts`, `primevue-4.5.5:packages/primevue/src/divider/style/DividerStyle.js`; the catalog enumerates `p-divider` and `p-divider-content`).
- Inline styles: root `justify-content` (horizontal) or `align-items` (vertical) derived from `align` (same style files).
- Structural CSS: `@primeuix/styles-2.0.3:dist/divider/index.mjs`, imported unchanged by PrimeNG and PrimeVue.
- Design tokens (`@primeuix/themes-2.0.3:types/divider/index.d.ts`, `@primeuix/themes-2.0.3:tokens/index.mjs`; 9 tokens): `root.borderColor`, `content` (`background`, `color`), `horizontal` (`margin`, `padding`, `content.padding`), `vertical` (`margin`, `padding`, `content.padding`). Aura values: `@primeuix/themes-2.0.3:dist/aura/divider/index.mjs`.
- PrimeReact: classes and own structural CSS in `DividerBase.js`; design tokens N/A. Defect: the rule meant for a dotted vertical divider targets `.p-divider-dotted.p-divider-horizontal`, so a vertical dotted divider is not styled as dotted (`primereact-10.9.9:components/lib/divider/DividerBase.js`, `primereact-10.9.9:components/doc/divider/theming/styleddoc.js`).
- Pass-through docs: `primeng-21.1.9:apps/showcase/doc/divider/pt/PTViewer.ts`, `primevue-4.5.5:apps/showcase/doc/divider/pt/index.vue`, `primereact-10.9.9:components/doc/divider/pt/wireframe.js`.

## 9. Relationships

- Embeds no other Prime components.
- Related: Splitter (a separator that is also a resize handle). Menu-model `separator` items in the Menu family are a different concept.
- The Login demo combines Divider with InputText and Button (`primevue-4.5.5:apps/showcase/doc/divider/LoginDoc.vue`).

## 10. Dependencies

- PrimeNG: `@angular/common`, `@angular/core`, `primeng/api`, `primeng/basecomponent`, `primeng/bind`, `primeng/base`, `@primeuix/styles/divider` (`primeng-21.1.9:packages/primeng/src/divider/divider.ts`, `primeng-21.1.9:packages/primeng/src/divider/style/dividerstyle.ts`).
- PrimeVue: `@primevue/core/basecomponent`, `@primevue/core/base/style`, `@primeuix/utils`, `@primeuix/styles/divider` (`primevue-4.5.5:packages/primevue/src/divider/BaseDivider.vue`, `primevue-4.5.5:packages/primevue/src/divider/style/DividerStyle.js`).
- PrimeReact: `../api/Api`, `../componentbase/ComponentBase`, `../hooks/Hooks`, `../utils/Utils` (`primereact-10.9.9:components/lib/divider/Divider.js`).
- External npm packages: none beyond the framework.

## 11. Framework differences

| Aspect                | PrimeNG                 | PrimeVue                | PrimeReact                    |
| --------------------- | ----------------------- | ----------------------- | ----------------------------- |
| Root element          | `<p-divider>` host      | `div`                   | `div`                         |
| Content `div`         | always rendered         | only with default slot  | always rendered               |
| Dotted vertical style | from `@primeuix/styles` | from `@primeuix/styles` | not applied (selector defect) |
| Methods               | —                       | —                       | `getElement()`                |
| Theming               | `@primeuix` tokens      | `@primeuix` tokens      | own CSS, theme variables      |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/divider/divider.ts`
- `primeng-21.1.9:packages/primeng/src/divider/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/divider/style/dividerstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/divider/divider.types.ts`
- `primeng-21.1.9:apps/showcase/doc/divider/` (`import-doc.ts`, `basic-doc.ts`, `type-doc.ts`, `vertical-doc.ts`, `content-doc.ts`, `login-doc.ts`, `accessibility-doc.ts`, `pt/PTViewer.ts`)
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/divider/Divider.vue`
- `primevue-4.5.5:packages/primevue/src/divider/BaseDivider.vue`
- `primevue-4.5.5:packages/primevue/src/divider/Divider.d.ts`
- `primevue-4.5.5:packages/primevue/src/divider/style/DividerStyle.js`
- `primevue-4.5.5:apps/showcase/doc/divider/` (`ImportDoc.vue`, `BasicDoc.vue`, `TypeDoc.vue`, `VerticalDoc.vue`, `ContentDoc.vue`, `LoginDoc.vue`, `AccessibilityDoc.vue`, `pt/index.vue`, `theming/index.vue`)
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/divider/Divider.js`
- `primereact-10.9.9:components/lib/divider/DividerBase.js`
- `primereact-10.9.9:components/lib/divider/divider.d.ts`
- `primereact-10.9.9:components/doc/divider/` (`importdoc.js`, `basicdoc.js`, `typedoc.js`, `verticaldoc.js`, `contentdoc.js`, `logindoc.js`, `accessibilitydoc.js`, `theming/styleddoc.js`, `pt/wireframe.js`)
- `primereact-10.9.9:components/layout/menu.json`
- `@primeuix/styles-2.0.3:dist/divider/index.mjs`
- `@primeuix/themes-2.0.3:types/divider/index.d.ts`
- `@primeuix/themes-2.0.3:tokens/index.mjs`
- `@primeuix/themes-2.0.3:dist/aura/divider/index.mjs`
