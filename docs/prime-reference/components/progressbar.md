# ProgressBar

**Category:** Misc · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

ProgressBar is a horizontal status indicator for a running task. In determinate mode it fills to a 0–100 `value` and can print the value as a label; in indeterminate mode it shows a looping animation for work of unknown length. All three frameworks ship it (`primeng-21.1.9:packages/primeng/src/progressbar/progressbar.ts`, `primevue-4.5.5:packages/primevue/src/progressbar/ProgressBar.vue`, `primereact-10.9.9:components/lib/progressbar/ProgressBar.js`).

## 2. Names & status

- Canonical name: **ProgressBar**. No aliases; not deprecated.
- PrimeNG `styleClass` is `@deprecated since v20.0.0` (catalog `progressbar` in `docs/prime-reference/catalog/primeng.json`).
- Listed under Misc in all three showcase menus (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).

## 3. Per framework

| Aspect         | PrimeNG                                                    | PrimeVue                                            | PrimeReact                                             |
| -------------- | ---------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------ |
| Import         | `import { ProgressBarModule } from 'primeng/progressbar'`  | `import ProgressBar from 'primevue/progressbar'`    | `import { ProgressBar } from 'primereact/progressbar'` |
| Selector / tag | `<p-progressbar>` (also `p-progressBar`, `p-progress-bar`) | `<ProgressBar>`                                     | `<ProgressBar />`                                      |
| Source         | `packages/primeng/src/progressbar/progressbar.ts`          | `packages/primevue/src/progressbar/ProgressBar.vue` | `components/lib/progressbar/ProgressBar.js`            |
| Base           | `BaseComponent<ProgressBarPassThrough>`, standalone        | `BaseComponent` via `BaseProgressBar.vue`           | `ComponentBase.extend` (`ProgressBarBase.js`)          |

Sources: `primeng-21.1.9:apps/showcase/doc/progressbar/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/progressbar/ImportDoc.vue`, `primereact-10.9.9:components/doc/progressbar/importdoc.js`.

## 4. Anatomy

| Part                    | Element                           | PrimeNG PT key | PrimeVue PT key | PrimeReact PT key | Class                                                 |
| ----------------------- | --------------------------------- | -------------- | --------------- | ----------------- | ----------------------------------------------------- |
| Root                    | host / `div` `role="progressbar"` | `host`, `root` | `root`          | `root`            | `p-progressbar` + `-determinate` / `-indeterminate`   |
| Indeterminate container | `div` (PrimeReact only)           | —              | —               | `container`       | `p-progressbar-indeterminate-container`               |
| Value                   | `div` (filled part)               | `value`        | `value`         | `value`           | `p-progressbar-value` (PrimeReact + `-value-animate`) |
| Label                   | `div` (determinate only)          | `label`        | `label`         | `label`           | `p-progressbar-label`                                 |

- PT definitions: `primeng-21.1.9:packages/primeng/src/types/progressbar/progressbar.types.ts`, `primevue-4.5.5:packages/primevue/src/progressbar/ProgressBar.d.ts`, `primereact-10.9.9:components/lib/progressbar/progressbar.d.ts`.

## 5. API highlights

| Prop         | PrimeNG                                  | PrimeVue                           | PrimeReact                         |
| ------------ | ---------------------------------------- | ---------------------------------- | ---------------------------------- |
| `value`      | `number` (numberAttribute)               | `number` (`null`)                  | `number \| string` (`null`)        |
| `mode`       | `'determinate' \| 'indeterminate'`       | `'determinate' \| 'indeterminate'` | `'determinate' \| 'indeterminate'` |
| `showValue`  | `boolean` (`true`)                       | `boolean` (`true`)                 | `boolean` (`true`)                 |
| `unit`       | `string` (`'%'`)                         | — (always `%`)                     | `string` (`'%'`)                   |
| `color`      | `string` (value background)              | —                                  | `string` (value background)        |
| custom label | `#content` template (`$implicit: value`) | default slot                       | `displayValueTemplate(value)`      |

- PrimeNG extra: `valueStyleClass` adds classes to the value element; any `pTemplate` (not only `content`) is taken as the content template (`primeng-21.1.9:packages/primeng/src/progressbar/progressbar.ts`).
- PrimeReact: `getElement()`; an unknown `mode` throws `<mode> is not a valid mode for the ProgressBar. Valid values are 'determinate' and 'indeterminate'` (`primereact-10.9.9:components/lib/progressbar/ProgressBar.js`).
- Label visibility: PrimeNG and PrimeVue hide the label when `value` is `null` or `0`; PrimeReact shows it for any non-null value, including `0`.
- Full API: catalog module `progressbar` in `docs/prime-reference/catalog/primeng.json`, `primevue.json`, `primereact.json`.

## 6. Usage guidance

- **Basic** — set `value` (`primeng-21.1.9:apps/showcase/doc/progressbar/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/progressbar/BasicDoc.vue`, `primereact-10.9.9:components/doc/progressbar/basicdoc.js`).
- **Dynamic** — the bar tracks a changing value; the value element animates its width (`primeng-21.1.9:apps/showcase/doc/progressbar/dynamic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/progressbar/DynamicDoc.vue`, `primereact-10.9.9:components/doc/progressbar/dynamicdoc.js`).
- **Template** — custom label content (`primeng-21.1.9:apps/showcase/doc/progressbar/template-doc.ts`, `primevue-4.5.5:apps/showcase/doc/progressbar/TemplateDoc.vue`, `primereact-10.9.9:components/doc/progressbar/templatedoc.js`).
- **Indeterminate** — `mode="indeterminate"` when progress can't be measured; usually with a fixed small height (`primeng-21.1.9:apps/showcase/doc/progressbar/indeterminate-doc.ts`, `primevue-4.5.5:apps/showcase/doc/progressbar/IndeterminateDoc.vue`, `primereact-10.9.9:components/doc/progressbar/indeterminatedoc.js`).

No services or providers are required.

## 7. Accessibility

- Root has `role="progressbar"`, `aria-valuemin="0"`, `aria-valuemax="100"` and `aria-valuenow` set to `value`; label it with `aria-label` or `aria-labelledby`. Not interactive, so no keyboard support (`primeng-21.1.9:apps/showcase/doc/progressbar/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/progressbar/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/progressbar/accessibilitydoc.js`).
- In indeterminate mode `aria-valuenow` still carries `value` (usually empty) rather than being omitted deliberately.
- PrimeNG also writes `aria-level` with `value + unit` on the host, which is not a valid attribute for the `progressbar` role (`primeng-21.1.9:packages/primeng/src/progressbar/progressbar.ts`).
- `aria-valuemax` is fixed at 100 in all three, so `value` must be a percentage.

## 8. Theming

- Style classes: `p-progressbar p-component`, `p-progressbar-determinate`, `p-progressbar-indeterminate`, `p-progressbar-value`, `p-progressbar-label`; `data-p` reports `determinate` / `indeterminate` (`primeng-21.1.9:packages/primeng/src/progressbar/style/progressbarstyle.ts`, `primevue-4.5.5:packages/primevue/src/progressbar/style/ProgressBarStyle.js`).
- Structural CSS (including the indeterminate keyframes): `@primeuix/styles-2.0.3:dist/progressbar/index.mjs`.
- Design tokens (`@primeuix/themes-2.0.3:types/progressbar/index.d.ts`): `root` (`background`, `borderRadius`, `height`), `value` (`background`), `label` (`color`, `fontSize`, `fontWeight`). Aura values: `@primeuix/themes-2.0.3:dist/aura/progressbar/index.mjs`.
- PrimeReact: same root/value/label classes plus `p-progressbar-value-animate` and `p-progressbar-indeterminate-container`; own CSS and keyframes in `ProgressBarBase.js`; design tokens N/A (`primereact-10.9.9:components/lib/progressbar/ProgressBarBase.js`, `primereact-10.9.9:components/doc/progressbar/theming/styleddoc.js`).
- PT docs: `primeng-21.1.9:apps/showcase/doc/progressbar/pt/PTViewer.ts`, `primevue-4.5.5:apps/showcase/doc/progressbar/pt/index.vue`, `primereact-10.9.9:components/doc/progressbar/pt/wireframe.js`.

## 9. Relationships

- Embedded by FileUpload in all three frameworks to show upload progress (`primeng-21.1.9:packages/primeng/src/fileupload/fileupload.ts`, `primevue-4.5.5:packages/primevue/src/fileupload/FileUpload.vue`, `primereact-10.9.9:components/lib/fileupload/FileUpload.js`).
- Siblings: ProgressSpinner (circular, indeterminate only) and MeterGroup (several values, `role="meter"`).

## 10. Dependencies

- PrimeNG: `@angular/common`, `@angular/core`, `primeng/api`, `primeng/basecomponent`, `primeng/bind`, `@primeuix/styles/progressbar` (`primeng-21.1.9:packages/primeng/src/progressbar/progressbar.ts`).
- PrimeVue: `@primeuix/utils` (`cn`), `@primevue/core/basecomponent`, `@primeuix/styles/progressbar` (`primevue-4.5.5:packages/primevue/src/progressbar/ProgressBar.vue`).
- PrimeReact: `../api/Api`, `../componentbase/ComponentBase`, `../hooks/Hooks`, `../utils/Utils` (`primereact-10.9.9:components/lib/progressbar/ProgressBar.js`).
- External npm packages: none.

## 11. Framework differences

| Aspect               | PrimeNG                | PrimeVue             | PrimeReact               |
| -------------------- | ---------------------- | -------------------- | ------------------------ |
| Unit                 | `unit`                 | fixed `%`            | `unit`                   |
| Bar colour prop      | `color`                | — (tokens / PT only) | `color`                  |
| Custom label         | `#content` template    | default slot         | `displayValueTemplate`   |
| Label at `value = 0` | hidden                 | hidden               | shown                    |
| Indeterminate DOM    | root › value           | root › value         | root › container › value |
| Invalid `mode`       | renders nothing        | renders nothing      | throws                   |
| Extra ARIA           | `aria-level` (invalid) | —                    | —                        |
| Theming              | `@primeuix` tokens     | `@primeuix` tokens   | own CSS, no tokens       |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/progressbar/progressbar.ts`
- `primeng-21.1.9:packages/primeng/src/progressbar/style/progressbarstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/progressbar/progressbar.types.ts`
- `primeng-21.1.9:packages/primeng/src/fileupload/fileupload.ts`
- `primeng-21.1.9:apps/showcase/doc/progressbar/` (`import-doc.ts`, `basic-doc.ts`, `dynamic-doc.ts`, `template-doc.ts`, `indeterminate-doc.ts`, `accessibility-doc.ts`, `pt/PTViewer.ts`)
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/progressbar/` (`ProgressBar.vue`, `BaseProgressBar.vue`, `ProgressBar.d.ts`, `style/ProgressBarStyle.js`)
- `primevue-4.5.5:packages/primevue/src/fileupload/FileUpload.vue`
- `primevue-4.5.5:apps/showcase/doc/progressbar/` (`ImportDoc.vue`, `BasicDoc.vue`, `DynamicDoc.vue`, `TemplateDoc.vue`, `IndeterminateDoc.vue`, `AccessibilityDoc.vue`, `pt/index.vue`, `theming/index.vue`)
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/progressbar/` (`ProgressBar.js`, `ProgressBarBase.js`, `progressbar.d.ts`)
- `primereact-10.9.9:components/lib/fileupload/FileUpload.js`
- `primereact-10.9.9:components/doc/progressbar/` (`importdoc.js`, `basicdoc.js`, `dynamicdoc.js`, `templatedoc.js`, `indeterminatedoc.js`, `accessibilitydoc.js`, `pt/wireframe.js`, `theming/styleddoc.js`)
- `primereact-10.9.9:components/layout/menu.json`
- `@primeuix/styles-2.0.3:dist/progressbar/index.mjs`
- `@primeuix/themes-2.0.3:types/progressbar/index.d.ts`
- `@primeuix/themes-2.0.3:dist/aura/progressbar/index.mjs`
