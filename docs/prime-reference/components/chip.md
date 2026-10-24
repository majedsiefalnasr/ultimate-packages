# Chip

**Category:** Misc · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Chip is a compact rounded element that represents an entity such as a person, tag or filter value, showing a label with an optional leading image or icon and an optional remove button that hides the chip. All three frameworks ship it (`primeng-21.1.9:packages/primeng/src/chip/chip.ts`, `primevue-4.5.5:packages/primevue/src/chip/Chip.vue`, `primereact-10.9.9:components/lib/chip/Chip.js`).

## 2. Names & status

- Canonical name: **Chip**. No legacy aliases; not deprecated.
- PrimeNG `styleClass` is `@deprecated since v20.0.0` (catalog `chip` in `docs/prime-reference/catalog/primeng.json`).
- Not to be confused with the multi-value input (PrimeVue `InputChips`, PrimeReact `Chips`), which renders Chip-like tokens; that input is covered elsewhere.
- Listed under Misc in all three showcase menus (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).

## 3. Per framework

| Aspect         | PrimeNG                                      | PrimeVue                              | PrimeReact                               |
| -------------- | -------------------------------------------- | ------------------------------------- | ---------------------------------------- |
| Import         | `import { ChipModule } from 'primeng/chip'`  | `import Chip from 'primevue/chip'`    | `import { Chip } from 'primereact/chip'` |
| Selector / tag | `<p-chip>`                                   | `<Chip>`                              | `<Chip />`                               |
| Source         | `packages/primeng/src/chip/chip.ts`          | `packages/primevue/src/chip/Chip.vue` | `components/lib/chip/Chip.js`            |
| Base           | `BaseComponent<ChipPassThrough>`, standalone | `BaseComponent` via `BaseChip.vue`    | `ComponentBase.extend` (`ChipBase.js`)   |

Sources: `primeng-21.1.9:apps/showcase/doc/chip/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/chip/ImportDoc.vue`, `primereact-10.9.9:components/doc/chip/importdoc.js`.

## 4. Anatomy

| Part        | Element                              | PrimeNG PT key | PrimeVue PT key | PrimeReact PT key | Class                                     |
| ----------- | ------------------------------------ | -------------- | --------------- | ----------------- | ----------------------------------------- |
| Root        | host / `div`                         | `host`, `root` | `root`          | `root`            | `p-chip`                                  |
| Image       | `img`                                | `image`        | `image`         | `image`           | `p-chip-image` (PrimeReact: on root)      |
| Icon        | `span` / icon component              | `icon`         | `icon`          | `icon`            | `p-chip-icon`                             |
| Label       | `div` (PrimeReact `span`)            | `label`        | `label`         | `label`           | `p-chip-label` (PrimeReact `p-chip-text`) |
| Remove icon | `TimesCircleIcon` SVG or font `span` | `removeIcon`   | `removeIcon`    | `removeIcon`      | `p-chip-remove-icon`                      |

- The image is shown instead of the icon when both are set; the label follows; the remove icon comes last and only when `removable` (`primeng-21.1.9:packages/primeng/src/chip/chip.ts`, `primevue-4.5.5:packages/primevue/src/chip/Chip.vue`, `primereact-10.9.9:components/lib/chip/Chip.js`).
- PT definitions: `primeng-21.1.9:packages/primeng/src/types/chip/chip.types.ts`, `primevue-4.5.5:packages/primevue/src/chip/Chip.d.ts`, `primereact-10.9.9:components/lib/chip/chip.d.ts`.

## 5. API highlights

| Prop         | PrimeNG               | PrimeVue              | PrimeReact                    |
| ------------ | --------------------- | --------------------- | ----------------------------- |
| `label`      | `string`              | `string \| number`    | `string`                      |
| `icon`       | `string`              | `string`              | `IconType<ChipProps>`         |
| `image`      | `string`              | `string`              | `string`                      |
| image alt    | `alt`                 | — (not rendered)      | `imageAlt` (default `'chip'`) |
| `removable`  | `boolean` (`false`)   | `boolean` (`false`)   | `boolean` (`false`)           |
| `removeIcon` | `string` (font class) | `string` (font class) | `IconType<ChipProps>`         |
| `disabled`   | `boolean` (`false`)   | —                     | —                             |

- PrimeNG: outputs `onRemove: EventEmitter<MouseEvent>` and `onImageError: EventEmitter<Event>`; `chipProps: ChipProps` sets several inputs at once (used by MultiSelect/AutoComplete); template `#removeicon`; projected content is rendered before the built-in parts (`primeng-21.1.9:packages/primeng/src/chip/chip.ts`).
- PrimeVue: emit `remove(event)`; slots `default` (replaces image/icon/label), `icon`, `removeicon` (scope `removeCallback`, `keydownCallback`) (`primevue-4.5.5:packages/primevue/src/chip/Chip.d.ts`).
- PrimeReact: `onRemove(event: ChipRemoveEvent)` receives `{ originalEvent, value }` (value is the label, image or icon) and returning `false` keeps the chip visible; `onImageError`; `template` replaces the content; methods `getVisible()`, `setVisible(visible)`, `getElement()` (`primereact-10.9.9:components/lib/chip/chip.d.ts`, `primereact-10.9.9:components/lib/chip/Chip.js`).
- Removal only hides the chip internally (`visible = false`); the parent owns any data change.
- Full API: catalog module `chip` in `docs/prime-reference/catalog/primeng.json`, `primevue.json`, `primereact.json`.

## 6. Usage guidance

- **Basic** — `label` plus optional `removable` (`primeng-21.1.9:apps/showcase/doc/chip/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/chip/BasicDoc.vue`, `primereact-10.9.9:components/doc/chip/basicdoc.js`).
- **Icon** — add a font icon before the label with `icon` (`primeng-21.1.9:apps/showcase/doc/chip/icon-doc.ts`, `primevue-4.5.5:apps/showcase/doc/chip/IconDoc.vue`, `primereact-10.9.9:components/doc/chip/icondoc.js`).
- **Image** — show an avatar-like image with `image` (`primeng-21.1.9:apps/showcase/doc/chip/image-doc.ts`, `primevue-4.5.5:apps/showcase/doc/chip/ImageDoc.vue`, `primereact-10.9.9:components/doc/chip/imagedoc.js`).
- **Template** — replace the content with projected content, the `default` slot, or the `template` prop (`primeng-21.1.9:apps/showcase/doc/chip/template-doc.ts`, `primevue-4.5.5:apps/showcase/doc/chip/TemplateDoc.vue`, `primereact-10.9.9:components/doc/chip/templatedoc.js`).

No services or providers are required.

## 7. Accessibility

- The `label` becomes the root `aria-label`; override it with `aria-label`/`aria-labelledby`. Removable chips are documented as focusable, and Enter or Backspace hides them (`primeng-21.1.9:apps/showcase/doc/chip/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/chip/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/chip/accessibilitydoc.js`).
- PrimeNG gives the remove icon `role="button"`, `tabindex` (`-1` when disabled, otherwise `0`) and an `aria-label` from the `removeLabel` ARIA translation. PrimeReact gives it `role="button"` and `tabIndex: 0` but no label; it also accepts `NumpadEnter`.
- Doc/source mismatch: PrimeVue's remove icon has no `tabindex` or `role` in `Chip.vue`, so it is not keyboard focusable despite the documented behaviour (`primevue-4.5.5:packages/primevue/src/chip/Chip.vue`).

## 8. Theming

- Style classes: `p-chip p-component` (PrimeNG adds `p-disabled`), `p-chip-image`, `p-chip-icon`, `p-chip-label`, `p-chip-remove-icon`; `data-p` reports `removable` in PrimeNG and PrimeVue (`primeng-21.1.9:packages/primeng/src/chip/style/chipstyle.ts`, `primevue-4.5.5:packages/primevue/src/chip/style/ChipStyle.js`).
- Structural CSS: `@primeuix/styles-2.0.3:dist/chip/index.mjs`.
- Design tokens (`@primeuix/themes-2.0.3:types/chip/index.d.ts`): `root` (`borderRadius`, `paddingX`, `paddingY`, `gap`, `transitionDuration`, `background`, `color`), `image` (`width`, `height`), `icon` (`size`, `color`), `removeIcon` (`size`, `focusRing` width/style/color/offset/shadow, `color`). Aura values: `@primeuix/themes-2.0.3:dist/aura/chip/index.mjs`.
- PrimeReact: root `p-chip p-component` (+ `p-chip-image` when an image is set), label `p-chip-text`; own CSS in `ChipBase.js`; design tokens N/A (`primereact-10.9.9:components/lib/chip/ChipBase.js`, `primereact-10.9.9:components/doc/chip/theming/styleddoc.js`).
- PT docs: `primeng-21.1.9:apps/showcase/doc/chip/pt/PTViewer.ts`, `primevue-4.5.5:apps/showcase/doc/chip/pt/index.vue`, `primereact-10.9.9:components/doc/chip/pt/wireframe.js`.

## 9. Relationships

- Embeds the `TimesCircleIcon` icon.
- Embedded by selection inputs in chip display mode: PrimeNG MultiSelect, AutoComplete and TreeSelect; PrimeVue MultiSelect, AutoComplete, TreeSelect and InputChips (PT key `pcChip`). No PrimeReact component imports Chip (`primeng-21.1.9:packages/primeng/src/multiselect/multiselect.ts`, `primevue-4.5.5:packages/primevue/src/inputchips/InputChips.vue`).
- Visually related to Avatar (image/label) and Tag (status label without removal).

## 10. Dependencies

- PrimeNG: `@angular/common`, `@angular/core`, `primeng/api` (`TranslationKeys`), `primeng/basecomponent`, `primeng/bind`, `primeng/icons` (`TimesCircleIcon`), `@primeuix/styles/chip` (`primeng-21.1.9:packages/primeng/src/chip/chip.ts`).
- PrimeVue: `@primeuix/utils`, `@primevue/icons/timescircle`, `@primevue/core/basecomponent`, `@primeuix/styles/chip` (`primevue-4.5.5:packages/primevue/src/chip/Chip.vue`).
- PrimeReact: `../api/Api`, `../componentbase/ComponentBase`, `../hooks/Hooks`, `../icons/timescircle`, `../utils/Utils` (`primereact-10.9.9:components/lib/chip/Chip.js`).
- External npm packages: none.

## 11. Framework differences

| Aspect          | PrimeNG                         | PrimeVue                | PrimeReact                                     |
| --------------- | ------------------------------- | ----------------------- | ---------------------------------------------- |
| Remove event    | `onRemove(MouseEvent)`          | `remove(event)`         | `onRemove({ originalEvent, value })`, can veto |
| Remove keyboard | focusable, labelled button      | not focusable           | focusable button, no label                     |
| Disabled state  | `disabled` input                | —                       | —                                              |
| Image alt       | `alt`                           | none                    | `imageAlt` (`'chip'`)                          |
| Image error     | `onImageError`                  | —                       | `onImageError`                                 |
| Custom content  | projected before built-in parts | `default` slot replaces | `template` replaces                            |
| Label class     | `p-chip-label`                  | `p-chip-label`          | `p-chip-text`                                  |
| Theming         | `@primeuix` tokens              | `@primeuix` tokens      | own CSS, no tokens                             |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/chip/chip.ts`
- `primeng-21.1.9:packages/primeng/src/chip/style/chipstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/chip/chip.types.ts`
- `primeng-21.1.9:packages/primeng/src/multiselect/multiselect.ts`
- `primeng-21.1.9:apps/showcase/doc/chip/` (`import-doc.ts`, `basic-doc.ts`, `icon-doc.ts`, `image-doc.ts`, `template-doc.ts`, `accessibility-doc.ts`, `pt/PTViewer.ts`)
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/chip/` (`Chip.vue`, `BaseChip.vue`, `Chip.d.ts`, `style/ChipStyle.js`)
- `primevue-4.5.5:packages/primevue/src/inputchips/InputChips.vue`
- `primevue-4.5.5:apps/showcase/doc/chip/` (`ImportDoc.vue`, `BasicDoc.vue`, `IconDoc.vue`, `ImageDoc.vue`, `TemplateDoc.vue`, `AccessibilityDoc.vue`, `pt/index.vue`, `theming/index.vue`)
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/chip/` (`Chip.js`, `ChipBase.js`, `chip.d.ts`)
- `primereact-10.9.9:components/doc/chip/` (`importdoc.js`, `basicdoc.js`, `icondoc.js`, `imagedoc.js`, `templatedoc.js`, `accessibilitydoc.js`, `pt/wireframe.js`, `theming/styleddoc.js`)
- `primereact-10.9.9:components/layout/menu.json`
- `@primeuix/styles-2.0.3:dist/chip/index.mjs`
- `@primeuix/themes-2.0.3:types/chip/index.d.ts`
- `@primeuix/themes-2.0.3:dist/aura/chip/index.mjs`
