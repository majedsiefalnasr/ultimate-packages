# Inplace

**Category:** Misc · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Inplace switches between a read-only "display" view and an editable or detailed "content" view: activating the display (click or Enter) reveals the content, and a close callback or close button returns to the display. It is used for click-to-edit fields and lazily revealed content. All three frameworks ship it (`primeng-21.1.9:packages/primeng/src/inplace/inplace.ts`, `primevue-4.5.5:packages/primevue/src/inplace/Inplace.vue`, `primereact-10.9.9:components/lib/inplace/Inplace.js`).

## 2. Names & status

- Canonical name: **Inplace**. PrimeNG and PrimeReact also export helper components **InplaceDisplay** and **InplaceContent**; PrimeVue uses named slots instead.
- Not deprecated as a component. PrimeNG deprecates `closable` (`@deprecated since v20.0.0, use closeCallback within content template`), `closeIcon` and `styleClass` (both `@deprecated since v20.0.0, use class instead`) (`primeng-21.1.9:packages/primeng/src/inplace/inplace.ts`).
- PrimeVue 4.5.5 has no `closable` prop at all; closing is done only through the content slot's `closeCallback` (`primevue-4.5.5:packages/primevue/src/inplace/BaseInplace.vue`).
- Listed under Misc in all three showcase menus (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).

## 3. Per framework

| Aspect         | PrimeNG                                                           | PrimeVue                                    | PrimeReact                                                                     |
| -------------- | ----------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------ |
| Import         | `import { InplaceModule } from 'primeng/inplace'`                 | `import Inplace from 'primevue/inplace'`    | `import { Inplace, InplaceDisplay, InplaceContent } from 'primereact/inplace'` |
| Selector / tag | `<p-inplace>`; helpers `<p-inplacedisplay>`, `<p-inplacecontent>` | `<Inplace>` with `#display` / `#content`    | `<Inplace>` with `<InplaceDisplay>` / `<InplaceContent>` children              |
| Source         | `packages/primeng/src/inplace/inplace.ts`                         | `packages/primevue/src/inplace/Inplace.vue` | `components/lib/inplace/Inplace.js`                                            |
| Base           | `BaseComponent<InplacePassThrough>`, standalone                   | `BaseComponent` via `BaseInplace.vue`       | `ComponentBase.extend` (`InplaceBase.js`)                                      |

Sources: `primeng-21.1.9:apps/showcase/doc/inplace/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inplace/ImportDoc.vue`, `primereact-10.9.9:components/doc/inplace/importdoc.js`.

## 4. Anatomy

| Part         | Element                               | PrimeNG PT key | PrimeVue PT key | PrimeReact PT key | Class                                |
| ------------ | ------------------------------------- | -------------- | --------------- | ----------------- | ------------------------------------ |
| Root         | host / `div`, `aria-live="polite"`    | `host`, `root` | `root`          | `root`            | `p-inplace`                          |
| Display      | `div` `role="button"`, `tabindex="0"` | `display`      | `display`       | `display`         | `p-inplace-display`                  |
| Content      | `div`                                 | `content`      | `content`       | `content`         | `p-inplace-content`                  |
| Close button | embedded Button (when `closable`)     | `pcButton`     | —               | `closeButton`     | PrimeReact `p-inplace-content-close` |

- Only one of display or content is rendered at a time.
- PT definitions: `primeng-21.1.9:packages/primeng/src/types/inplace/inplace.types.ts`, `primevue-4.5.5:packages/primevue/src/inplace/Inplace.d.ts`, `primereact-10.9.9:components/lib/inplace/inplace.d.ts`.

## 5. API highlights

| Prop / member | PrimeNG                                  | PrimeVue                               | PrimeReact                                                |
| ------------- | ---------------------------------------- | -------------------------------------- | --------------------------------------------------------- |
| `active`      | `boolean` (`false`)                      | `boolean` (`false`), `v-model:active`  | `boolean` (`false`); controlled with `onToggle`           |
| `disabled`    | `boolean` (`false`)                      | `boolean` (`false`)                    | `boolean` (`false`)                                       |
| `closable`    | `boolean`, deprecated                    | —                                      | `boolean` (`false`)                                       |
| `closeIcon`   | `string`, deprecated                     | —                                      | `IconType<InplaceProps>`                                  |
| open / close  | `onActivate`, `onDeactivate` outputs     | `open`, `close`, `update:active` emits | `onOpen`, `onClose`, `onToggle({ originalEvent, value })` |
| methods       | `activate(event?)`, `deactivate(event?)` | —                                      | `getElement()`                                            |

- PrimeNG extras: `preventClick` (ignore clicks, leaving only programmatic toggling), `closeAriaLabel`; templates `#display`, `#content` (context `closeCallback`), `#closeicon`; content can also be projected with `[pInplaceDisplay]` / `[pInplaceContent]` attributes (`primeng-21.1.9:packages/primeng/src/inplace/inplace.ts`).
- PrimeVue extras: `displayProps: HTMLAttributes` spread on the display element; slots `display` and `content` (scope `closeCallback`) (`primevue-4.5.5:packages/primevue/src/inplace/Inplace.d.ts`).
- PrimeReact extras: `tabIndex` (default `0`), `ariaLabel` (set on the display); children are filtered so only `InplaceDisplay` or `InplaceContent` render (`primereact-10.9.9:components/lib/inplace/InplaceBase.js`, `primereact-10.9.9:components/lib/inplace/Inplace.js`).
- Full API: catalog module `inplace` in `docs/prime-reference/catalog/primeng.json`, `primevue.json`, `primereact.json`.

## 6. Usage guidance

- **Basic** — supply a display part and a content part (`primeng-21.1.9:apps/showcase/doc/inplace/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inplace/BasicDoc.vue`, `primereact-10.9.9:components/doc/inplace/basicdoc.js`).
- **Input** — click-to-edit: PrimeNG and PrimeVue call `closeCallback` from a button inside the content; PrimeReact uses `closable` (`primeng-21.1.9:apps/showcase/doc/inplace/input-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inplace/InputDoc.vue`, `primereact-10.9.9:components/doc/inplace/inputdoc.js`).
- **Image** — reveal any content, such as an image (`primeng-21.1.9:apps/showcase/doc/inplace/image-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inplace/ImageDoc.vue`, `primereact-10.9.9:components/doc/inplace/imagedoc.js`).
- **Lazy** — load data in the open event (`onActivate`, `open`, `onOpen`) before showing it, for example in a table (`primeng-21.1.9:apps/showcase/doc/inplace/lazy-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inplace/LazyDoc.vue`, `primereact-10.9.9:components/doc/inplace/lazydoc.js`).

No services or providers are required.

## 7. Accessibility

- The root has `aria-live="polite"`; the display element has `role="button"` and `tabindex="0"` (`primeng-21.1.9:apps/showcase/doc/inplace/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/inplace/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/inplace/accessibilitydoc.js`).
- Keyboard: Enter opens the content in all three. The PrimeNG and PrimeReact docs also list Space, but only PrimeReact handles it (`Enter`, `NumpadEnter`, `Space`); PrimeNG's `onKeydown` checks `Enter` only and PrimeVue binds `@keydown.enter` (`primeng-21.1.9:packages/primeng/src/inplace/inplace.ts`, `primevue-4.5.5:packages/primevue/src/inplace/Inplace.vue`, `primereact-10.9.9:components/lib/inplace/Inplace.js`).
- The close button's `aria-label` comes from `closeAriaLabel` (PrimeNG) or the `aria.close` locale key (PrimeReact). PrimeVue returns focus to the display element after closing.
- Doc/source mismatch: the PrimeNG accessibility doc mentions `displayProps` and `closeButtonProps`, which PrimeNG Inplace does not have (`displayProps` exists only in PrimeVue; neither exists in PrimeReact's API).

## 8. Theming

- Style classes: `p-inplace p-component`, `p-inplace-display` (+ `p-disabled`), `p-inplace-content` (`primeng-21.1.9:packages/primeng/src/inplace/style/inplacestyle.ts`, `primevue-4.5.5:packages/primevue/src/inplace/style/InplaceStyle.js`).
- Structural CSS: `@primeuix/styles-2.0.3:dist/inplace/index.mjs`.
- Design tokens (`@primeuix/themes-2.0.3:types/inplace/index.d.ts`): `root` (`padding`, `borderRadius`, `focusRing` width/style/color/offset/shadow, `transitionDuration`), `display` (`hoverBackground`, `hoverColor`). Aura values: `@primeuix/themes-2.0.3:dist/aura/inplace/index.mjs`.
- PrimeReact: classes `p-inplace` (+ `p-inplace-closable`), `p-inplace-display`, `p-inplace-content`, `p-inplace-content-close`; own CSS in `InplaceBase.js`; design tokens N/A (`primereact-10.9.9:components/lib/inplace/InplaceBase.js`, `primereact-10.9.9:components/doc/inplace/theming/styleddoc.js`).
- PT docs: `primeng-21.1.9:apps/showcase/doc/inplace/pt/PTViewer.ts`, `primevue-4.5.5:apps/showcase/doc/inplace/pt/index.vue`, `primereact-10.9.9:components/doc/inplace/pt/wireframe.js`.

## 9. Relationships

- Embeds Button for the close control in PrimeNG (with the Ripple directive and `TimesIcon`) and PrimeReact (`TimesIcon`); PrimeVue embeds nothing.
- Typically wraps form inputs such as InputText, or data views such as Table for lazy loading.

## 10. Dependencies

- PrimeNG: `@angular/common`, `@angular/core`, `primeng/api`, `primeng/basecomponent`, `primeng/bind`, `primeng/button`, `primeng/icons`, `primeng/ripple`, `@primeuix/styles/inplace` (`primeng-21.1.9:packages/primeng/src/inplace/inplace.ts`).
- PrimeVue: `@primevue/core/basecomponent`, `@primeuix/styles/inplace` (`primevue-4.5.5:packages/primevue/src/inplace/BaseInplace.vue`, `primevue-4.5.5:packages/primevue/src/inplace/style/InplaceStyle.js`).
- PrimeReact: `../api/Api`, `../button/Button`, `../componentbase/ComponentBase`, `../hooks/Hooks`, `../icons/times`, `../utils/Utils` (`primereact-10.9.9:components/lib/inplace/Inplace.js`).
- External npm packages: none.

## 11. Framework differences

| Aspect            | PrimeNG                           | PrimeVue                    | PrimeReact                                   |
| ----------------- | --------------------------------- | --------------------------- | -------------------------------------------- |
| Parts API         | templates or attribute projection | named slots                 | `InplaceDisplay` / `InplaceContent` children |
| Built-in close    | `closable` (deprecated)           | none (slot `closeCallback`) | `closable`                                   |
| Two-way binding   | `active` input + events           | `v-model:active`            | controlled via `onToggle`                    |
| Keys that open    | Enter                             | Enter                       | Enter, NumpadEnter, Space                    |
| Click suppression | `preventClick`                    | —                           | —                                            |
| Display attrs     | PT only                           | `displayProps`              | `ariaLabel`, `tabIndex`                      |
| Theming           | `@primeuix` tokens                | `@primeuix` tokens          | own CSS, no tokens                           |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/inplace/inplace.ts`
- `primeng-21.1.9:packages/primeng/src/inplace/style/inplacestyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/inplace/inplace.types.ts`
- `primeng-21.1.9:apps/showcase/doc/inplace/` (`import-doc.ts`, `basic-doc.ts`, `input-doc.ts`, `image-doc.ts`, `lazy-doc.ts`, `accessibility-doc.ts`, `pt/PTViewer.ts`)
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/inplace/` (`Inplace.vue`, `BaseInplace.vue`, `Inplace.d.ts`, `style/InplaceStyle.js`)
- `primevue-4.5.5:apps/showcase/doc/inplace/` (`ImportDoc.vue`, `BasicDoc.vue`, `InputDoc.vue`, `ImageDoc.vue`, `LazyDoc.vue`, `AccessibilityDoc.vue`, `pt/index.vue`, `theming/index.vue`)
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/inplace/` (`Inplace.js`, `InplaceBase.js`, `inplace.d.ts`)
- `primereact-10.9.9:components/doc/inplace/` (`importdoc.js`, `basicdoc.js`, `inputdoc.js`, `imagedoc.js`, `lazydoc.js`, `accessibilitydoc.js`, `pt/wireframe.js`, `theming/styleddoc.js`)
- `primereact-10.9.9:components/layout/menu.json`
- `@primeuix/styles-2.0.3:dist/inplace/index.mjs`
- `@primeuix/themes-2.0.3:types/inplace/index.d.ts`
- `@primeuix/themes-2.0.3:dist/aura/inplace/index.mjs`
