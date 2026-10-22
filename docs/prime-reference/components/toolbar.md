# Toolbar

**Category:** Panel · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Toolbar is a horizontal bar that groups buttons, inputs and other controls into three regions: start, center and end. It is a layout container with the `toolbar` role and no interactive behavior of its own. All three frameworks ship it under the same name (`primeng-21.1.9:packages/primeng/src/toolbar/toolbar.ts`, `primevue-4.5.5:packages/primevue/src/toolbar/Toolbar.vue`, `primereact-10.9.9:components/lib/toolbar/Toolbar.js`).

## 2. Names & status

- Canonical name: **Toolbar** in all three frameworks.
- Region naming: `start` / `center` / `end` is current everywhere. Legacy `left` / `right` remain:
  - PrimeReact props `left` and `right` are marked deprecated ("use start" / "use end") (`primereact-10.9.9:components/lib/toolbar/toolbar.d.ts`).
  - PrimeNG still maps `pTemplate="left"` / `"right"` onto start / end without a deprecation note (`primeng-21.1.9:packages/primeng/src/toolbar/toolbar.ts`).
  - PrimeReact keeps the legacy classes `p-toolbar-group-left` / `-right` next to the new ones (`primereact-10.9.9:components/lib/toolbar/ToolbarBase.js`).
- PrimeNG `styleClass` is deprecated since v20.0.0 in favor of `class`.
- Listed in the Panel group of every showcase menu (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).

## 3. Per framework

| Aspect         | PrimeNG                                                                                                       | PrimeVue                                                                                                | PrimeReact                                                            |
| -------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Import         | `import { ToolbarModule } from 'primeng/toolbar'` (component `Toolbar` is standalone)                         | `import Toolbar from 'primevue/toolbar'`                                                                | `import { Toolbar } from 'primereact/toolbar'`                        |
| Selector / tag | `<p-toolbar>`                                                                                                 | `<Toolbar>`                                                                                             | `<Toolbar />`                                                         |
| Source         | `packages/primeng/src/toolbar/toolbar.ts`, `style/toolbarstyle.ts`, types in `types/toolbar/toolbar.types.ts` | `packages/primevue/src/toolbar/Toolbar.vue`, `BaseToolbar.vue`, `Toolbar.d.ts`, `style/ToolbarStyle.js` | `components/lib/toolbar/Toolbar.js`, `ToolbarBase.js`, `toolbar.d.ts` |
| Base class     | `BaseComponent<ToolbarPassThrough>`, implements `BlockableUI`                                                 | `BaseComponent` (via `BaseToolbar`)                                                                     | `ComponentBase.extend` (`ToolbarBase`)                                |
| Sub-components | none                                                                                                          | none                                                                                                    | none                                                                  |

Sources: `primeng-21.1.9:apps/showcase/doc/toolbar/import-doc.ts`, `primeng-21.1.9:packages/primeng/src/toolbar/public_api.ts`, `primevue-4.5.5:apps/showcase/doc/toolbar/ImportDoc.vue`, `primevue-4.5.5:packages/primevue/src/toolbar/BaseToolbar.vue`, `primereact-10.9.9:components/doc/toolbar/importdoc.js`, `primereact-10.9.9:components/lib/toolbar/ToolbarBase.js`.

## 4. Anatomy

| Part   | PrimeNG PT key | PrimeVue PT key | PrimeReact PT key | Class (PrimeNG / PrimeVue) | Class (PrimeReact)                           |
| ------ | -------------- | --------------- | ----------------- | -------------------------- | -------------------------------------------- |
| Root   | `root`         | `root`          | `root`            | `p-toolbar`                | `p-toolbar`                                  |
| Start  | `start`        | `start`         | `start`           | `p-toolbar-start`          | `p-toolbar-group-start p-toolbar-group-left` |
| Center | `center`       | `center`        | `center`          | `p-toolbar-center`         | `p-toolbar-group-center`                     |
| End    | `end`          | `end`           | `end`             | `p-toolbar-end`            | `p-toolbar-group-end p-toolbar-group-right`  |

- PrimeNG renders a region only when its template exists, and projects any plain content (`ng-content`) before the regions; PrimeVue and PrimeReact always render all three region `div`s (`primeng-21.1.9:packages/primeng/src/toolbar/toolbar.ts`, `primevue-4.5.5:packages/primevue/src/toolbar/Toolbar.vue`, `primereact-10.9.9:components/lib/toolbar/Toolbar.js`).
- PrimeReact declares `children` but does not render them; only `start`/`center`/`end` (or the legacy props) produce content (`primereact-10.9.9:components/lib/toolbar/Toolbar.js`).
- PT definitions: `primeng-21.1.9:packages/primeng/src/types/toolbar/toolbar.types.ts`, `primevue-4.5.5:packages/primevue/src/toolbar/Toolbar.d.ts`, `primereact-10.9.9:components/lib/toolbar/toolbar.d.ts`.

## 5. API highlights

| Member    | PrimeNG                                                                       | PrimeVue                                      | PrimeReact                                                                                |
| --------- | ----------------------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Regions   | `start`, `center`, `end` templates (`pTemplate` also accepts `left`, `right`) | `start`, `center`, `end` slots                | `start`, `center`, `end`: `ReactNode \| (props) => ReactNode`; `left`, `right` deprecated |
| Labelling | `ariaLabelledBy: string` input                                                | `ariaLabelledby: String = null`               | pass `aria-labelledby` as an attribute                                                    |
| Styling   | `styleClass` (deprecated since v20.0.0)                                       | inherited `pt`, `ptOptions`, `unstyled`, `dt` | `style`, `className`, `pt`, `ptOptions`, `unstyled`                                       |
| Methods   | `getBlockableElement()`                                                       | —                                             | `getElement()`                                                                            |
| Events    | none                                                                          | none                                          | none                                                                                      |

- PrimeNG's `getBlockableElement()` returns the host's first child element rather than the host itself (`primeng-21.1.9:packages/primeng/src/toolbar/toolbar.ts`).
- Full API: catalog module `toolbar` in `docs/prime-reference/catalog/primeng.json`, `primevue.json`, `primereact.json`.

## 6. Usage guidance

- **Basic** — put action buttons in the start region, a search input in the center or end, and a split button or other actions in the end region (`primeng-21.1.9:apps/showcase/doc/toolbar/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/toolbar/BasicDoc.vue`, `primereact-10.9.9:components/doc/toolbar/basicdoc.js`).
- **Custom** — restyle the toolbar into an application navigation bar (logo, links, avatar) using the same three regions (`primeng-21.1.9:apps/showcase/doc/toolbar/custom-doc.ts`, `primevue-4.5.5:apps/showcase/doc/toolbar/CustomDoc.vue`, `primereact-10.9.9:components/doc/toolbar/customdoc.js`).

No services or providers are required.

## 7. Accessibility

- Root has `role="toolbar"`; `aria-orientation` is omitted because horizontal is the implicit default. Add `aria-labelledby` (or `aria-label`) to name the toolbar (`primeng-21.1.9:apps/showcase/doc/toolbar/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/toolbar/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/toolbar/accessibilitydoc.js`).
- No keyboard handling of its own: focus moves with Tab through the embedded controls. The roving-tabindex arrow-key pattern of the WAI-ARIA toolbar is not implemented, so consumers needing it must add it.

## 8. Theming

- Style classes (PrimeNG/PrimeVue): `p-toolbar` (with `p-component`), `p-toolbar-start`, `p-toolbar-center`, `p-toolbar-end` (`primeng-21.1.9:packages/primeng/src/toolbar/style/toolbarstyle.ts`, `primevue-4.5.5:packages/primevue/src/toolbar/style/ToolbarStyle.js`).
- Structural CSS: `@primeuix/styles-2.0.3:dist/toolbar/index.mjs` (flex row, wrap, space-between).
- Design tokens (`@primeuix/themes-2.0.3:types/toolbar/index.d.ts`, `@primeuix/themes-2.0.3:tokens/index.mjs`; 6 tokens): `root` (`background`, `borderColor`, `borderRadius`, `color`, `gap`, `padding`). Aura values: `@primeuix/themes-2.0.3:dist/aura/toolbar/index.mjs`.
- PrimeReact: classes and own structural CSS in `ToolbarBase.js` (`p-toolbar-group-*`); design tokens N/A (`primereact-10.9.9:components/lib/toolbar/ToolbarBase.js`, `primereact-10.9.9:components/doc/toolbar/styledoc.js`).
- Pass-through docs: `primeng-21.1.9:apps/showcase/doc/toolbar/pt/PTViewer.ts`, `primevue-4.5.5:apps/showcase/doc/toolbar/pt/index.vue`, `primereact-10.9.9:components/doc/toolbar/pt/wireframe.js`.

## 9. Relationships

- Embeds no other Prime components.
- Typical content: Button, SplitButton, InputText with IconField/InputIcon, Avatar (`primevue-4.5.5:apps/showcase/doc/toolbar/BasicDoc.vue`, `primeng-21.1.9:apps/showcase/doc/toolbar/basic-doc.ts`).
- Related: Menubar (menu-model navigation bar), Panel (header actions), DataTable (toolbars above tables in CRUD demos).
- PrimeNG Toolbar implements `BlockableUI`, so BlockUI can target it.

## 10. Dependencies

- PrimeNG: `@angular/common`, `@angular/core`, `primeng/api`, `primeng/basecomponent`, `primeng/bind`, `primeng/base`, `@primeuix/styles/toolbar` (`primeng-21.1.9:packages/primeng/src/toolbar/toolbar.ts`, `primeng-21.1.9:packages/primeng/src/toolbar/style/toolbarstyle.ts`).
- PrimeVue: `@primevue/core/basecomponent`, `@primevue/core/base/style`, `@primeuix/styles/toolbar` (`primevue-4.5.5:packages/primevue/src/toolbar/BaseToolbar.vue`, `primevue-4.5.5:packages/primevue/src/toolbar/style/ToolbarStyle.js`).
- PrimeReact: `../api/Api`, `../componentbase/ComponentBase`, `../hooks/Hooks`, `../utils/Utils` (`primereact-10.9.9:components/lib/toolbar/Toolbar.js`).
- External npm packages: none beyond the framework.

## 11. Framework differences

| Aspect         | PrimeNG                             | PrimeVue                     | PrimeReact                               |
| -------------- | ----------------------------------- | ---------------------------- | ---------------------------------------- |
| Region API     | templates                           | slots                        | props (node or function)                 |
| Legacy names   | `pTemplate` `left`/`right` accepted | none                         | `left`/`right` props deprecated          |
| Empty regions  | not rendered                        | rendered empty               | rendered empty                           |
| Free content   | projected before regions            | not supported (slots only)   | `children` ignored                       |
| Labelling prop | `ariaLabelledBy`                    | `ariaLabelledby`             | attribute pass-through                   |
| Region classes | `p-toolbar-start/center/end`        | `p-toolbar-start/center/end` | `p-toolbar-group-*` (+ `-left`/`-right`) |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/toolbar/toolbar.ts`
- `primeng-21.1.9:packages/primeng/src/toolbar/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/toolbar/style/toolbarstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/toolbar/toolbar.types.ts`
- `primeng-21.1.9:apps/showcase/doc/toolbar/` (`import-doc.ts`, `basic-doc.ts`, `custom-doc.ts`, `accessibility-doc.ts`, `pt/PTViewer.ts`)
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/toolbar/Toolbar.vue`
- `primevue-4.5.5:packages/primevue/src/toolbar/BaseToolbar.vue`
- `primevue-4.5.5:packages/primevue/src/toolbar/Toolbar.d.ts`
- `primevue-4.5.5:packages/primevue/src/toolbar/style/ToolbarStyle.js`
- `primevue-4.5.5:apps/showcase/doc/toolbar/` (`ImportDoc.vue`, `BasicDoc.vue`, `CustomDoc.vue`, `AccessibilityDoc.vue`, `pt/index.vue`, `theming/index.vue`)
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/toolbar/Toolbar.js`
- `primereact-10.9.9:components/lib/toolbar/ToolbarBase.js`
- `primereact-10.9.9:components/lib/toolbar/toolbar.d.ts`
- `primereact-10.9.9:components/doc/toolbar/` (`importdoc.js`, `basicdoc.js`, `customdoc.js`, `accessibilitydoc.js`, `styledoc.js`, `theming/styleddoc.js`, `pt/wireframe.js`)
- `primereact-10.9.9:components/layout/menu.json`
- `@primeuix/styles-2.0.3:dist/toolbar/index.mjs`
- `@primeuix/themes-2.0.3:types/toolbar/index.d.ts`
- `@primeuix/themes-2.0.3:tokens/index.mjs`
- `@primeuix/themes-2.0.3:dist/aura/toolbar/index.mjs`
