# MeterGroup

**Category:** Misc · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

MeterGroup shows several quantities as coloured segments of one bar (for example storage used by apps, messages and media), with a legend listing each item's label and percentage. Each item has a label, value, colour and optional icon; values are scaled between `min` and `max`. All three frameworks ship it (`primeng-21.1.9:packages/primeng/src/metergroup/metergroup.ts`, `primevue-4.5.5:packages/primevue/src/metergroup/MeterGroup.vue`, `primereact-10.9.9:components/lib/metergroup/MeterGroup.js`).

## 2. Names & status

- Canonical name: **MeterGroup**. Item type: `MeterItem` (PrimeNG, PrimeVue) / `MeterGroupValue` (PrimeReact).
- PrimeNG and PrimeVue implement the legend as an internal sub-component, `MeterGroupLabel` (`primeng-21.1.9:packages/primeng/src/metergroup/metergroup.ts`, `primevue-4.5.5:packages/primevue/src/metergroup/MeterGroupLabel.vue`); PrimeReact renders it inline.
- Not deprecated; PrimeNG `styleClass` is `@deprecated since v20.0.0` (catalog `metergroup` in `docs/prime-reference/catalog/primeng.json`).
- Listed under Misc in all three showcase menus (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).

## 3. Per framework

| Aspect         | PrimeNG                                                 | PrimeVue                                          | PrimeReact                                                                      |
| -------------- | ------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------- |
| Import         | `import { MeterGroupModule } from 'primeng/metergroup'` | `import MeterGroup from 'primevue/metergroup'`    | `import { MeterGroup } from 'primereact/metergroup'`                            |
| Selector / tag | `<p-metergroup>` (also `p-meterGroup`, `p-meter-group`) | `<MeterGroup>`                                    | `<MeterGroup />`                                                                |
| Source         | `packages/primeng/src/metergroup/metergroup.ts`         | `packages/primevue/src/metergroup/MeterGroup.vue` | `components/lib/metergroup/MeterGroup.js`                                       |
| Base           | `BaseComponent<MeterGroupPassThrough>`, standalone      | `BaseComponent` via `BaseMeterGroup.vue`          | `ComponentBase.extend` (`MeterGroupBase.js`); plain function component (no ref) |

Sources: `primeng-21.1.9:apps/showcase/doc/metergroup/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/metergroup/ImportDoc.vue`, `primereact-10.9.9:components/doc/metergroup/importdoc.js`.

## 4. Anatomy

| Part         | Element                     | PrimeNG PT key | PrimeVue PT key | PrimeReact PT key | Class                                                              |
| ------------ | --------------------------- | -------------- | --------------- | ----------------- | ------------------------------------------------------------------ |
| Root         | host / `div` `role="meter"` | `host`, `root` | `root`          | `root`            | `p-metergroup` (+ `-horizontal` / `-vertical`)                     |
| Meters       | `div`                       | `meters`       | `meters`        | `metercontainer`  | `p-metergroup-meters` (PrimeReact `p-metergroup-meter-container`)  |
| Meter        | `span` per item             | `meter`        | `meter`         | `meter`           | `p-metergroup-meter`                                               |
| Label list   | `ol`                        | `labelList`    | `labelList`     | `labellist`       | `p-metergroup-label-list` (+ orientation)                          |
| Label        | `li`                        | `label`        | `label`         | `labellistitem`   | `p-metergroup-label` (PrimeReact `p-metergroup-label-list-item`)   |
| Label icon   | `i` (when item has `icon`)  | `labelIcon`    | `labelIcon`     | `labelicon`       | `p-metergroup-label-icon`                                          |
| Label marker | `span` (when no icon)       | `labelMarker`  | `labelMarker`   | `labellisttype`   | `p-metergroup-label-marker` (PrimeReact `p-metergroup-label-type`) |
| Label text   | `span` "label (n%)"         | `labelText`    | `labelText`     | `label`           | `p-metergroup-label-text` (PrimeReact `p-metergroup-label`)        |

- The label list is placed before (`labelPosition="start"`) or after (`"end"`, default) the meters; `start` and `end` templates sit directly around the meters.
- PT definitions: `primeng-21.1.9:packages/primeng/src/types/metergroup/metergroup.types.ts`, `primevue-4.5.5:packages/primevue/src/metergroup/MeterGroup.d.ts`, `primereact-10.9.9:components/lib/metergroup/metergroup.d.ts`.

## 5. API highlights

| Prop               | PrimeNG                      | PrimeVue                     | PrimeReact                   |
| ------------------ | ---------------------------- | ---------------------------- | ---------------------------- |
| items              | `value: MeterItem[]`         | `value: MeterItem[]`         | `values: MeterGroupValue[]`  |
| `min` / `max`      | `0` / `100`                  | `0` / `100`                  | `0` / `100`                  |
| `orientation`      | `'horizontal' \| 'vertical'` | `'horizontal' \| 'vertical'` | `'horizontal' \| 'vertical'` |
| `labelPosition`    | `'start' \| 'end'` (`'end'`) | `'start' \| 'end'` (`'end'`) | `'start' \| 'end'` (`'end'`) |
| `labelOrientation` | `'horizontal' \| 'vertical'` | `'horizontal' \| 'vertical'` | `'horizontal' \| 'vertical'` |

- Item fields: `label`, `value`, `color`, `icon` (PrimeNG/PrimeVue `MeterItem`); PrimeReact `MeterGroupValue` has `label`, `value`, `color`, an index signature (`icon` and per-item `meterTemplate` are read from it) (`primeng-21.1.9:packages/primeng/src/types/metergroup/metergroup.types.ts`, `primereact-10.9.9:components/lib/metergroup/metergroup.d.ts`).
- Customisation: PrimeNG templates `#label`, `#meter`, `#icon`, `#start`, `#end`; PrimeVue slots `label`, `meter`, `icon`, `start`, `end` (scopes include `value`, `totalPercent`, `percentages`, and for `meter` `index`, `class`, `orientation`, `size`); PrimeReact function props `labelList`, `meter`, `start`, `end` receiving `{ values, totalPercent, percentages }` (`primevue-4.5.5:packages/primevue/src/metergroup/MeterGroup.d.ts`, `primereact-10.9.9:components/lib/metergroup/MeterGroup.js`).
- Calculation: each meter is `(value - min) / (max - min) × 100`, clamped to 0–100 and rounded; `totalPercent` is the same calculation on the sum of values in PrimeNG/PrimeVue. PrimeReact's `totalPercent` is the raw sum of values (not scaled by `min`/`max`) and its `percentages` array holds a running share rather than cumulative sums (`primereact-10.9.9:components/lib/metergroup/MeterGroup.js`).
- PrimeNG returns 100% when `min === max`; PrimeVue and PrimeReact divide by zero in that case (`primeng-21.1.9:packages/primeng/src/metergroup/metergroup.ts`, `primevue-4.5.5:packages/primevue/src/metergroup/MeterGroup.vue`).
- Full API: catalog module `metergroup` in `docs/prime-reference/catalog/primeng.json`, `primevue.json`, `primereact.json`.

## 6. Usage guidance

- **Basic** — pass an array of items (`primeng-21.1.9:apps/showcase/doc/metergroup/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/metergroup/BasicDoc.vue`, `primereact-10.9.9:components/doc/metergroup/basicdoc.js`).
- **Multiple** — more items create more segments (`primeng-21.1.9:apps/showcase/doc/metergroup/multiple-doc.ts`, `primevue-4.5.5:apps/showcase/doc/metergroup/MultipleDoc.vue`, `primereact-10.9.9:components/doc/metergroup/multipledoc.js`).
- **Icon** — item `icon` replaces the colour marker in the legend (`primeng-21.1.9:apps/showcase/doc/metergroup/icon-doc.ts`, `primevue-4.5.5:apps/showcase/doc/metergroup/IconDoc.vue`, `primereact-10.9.9:components/doc/metergroup/icondoc.js`).
- **Label** — `labelPosition` and `labelOrientation` (`primeng-21.1.9:apps/showcase/doc/metergroup/label-doc.ts`, `primevue-4.5.5:apps/showcase/doc/metergroup/LabelDoc.vue`, `primereact-10.9.9:components/doc/metergroup/labeldoc.js`).
- **Vertical** — `orientation="vertical"` (`primeng-21.1.9:apps/showcase/doc/metergroup/vertical-doc.ts`, `primevue-4.5.5:apps/showcase/doc/metergroup/VerticalDoc.vue`, `primereact-10.9.9:components/doc/metergroup/verticaldoc.js`).
- **MinMax** — change the scale boundaries (`primeng-21.1.9:apps/showcase/doc/metergroup/minmax-doc.ts`, `primevue-4.5.5:apps/showcase/doc/metergroup/MinMaxDoc.vue`, `primereact-10.9.9:components/doc/metergroup/minmaxdoc.js`).
- **Template** — custom label cards, meters and surrounding content (`primeng-21.1.9:apps/showcase/doc/metergroup/template-doc.ts`, `primevue-4.5.5:apps/showcase/doc/metergroup/TemplateDoc.vue`, `primereact-10.9.9:components/doc/metergroup/templatedoc.js`).
- The PrimeReact template and vertical docs repeat the basic description text instead of describing their demos (`primereact-10.9.9:components/doc/metergroup/templatedoc.js`).

## 7. Accessibility

- The root has `role="meter"` with `aria-valuemin`, `aria-valuemax` and `aria-valuenow` (the total percentage); describe it with `aria-labelledby`. No interactive elements, so no keyboard support (`primeng-21.1.9:apps/showcase/doc/metergroup/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/metergroup/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/metergroup/accessibilitydoc.js`).
- PrimeReact sets `aria-valuenow` to the raw sum of item values, so it may disagree with `aria-valuemax` when a custom `max` is used (`primereact-10.9.9:components/lib/metergroup/MeterGroup.js`).
- Colour is the only distinction between segments; the legend text carries the meaning.

## 8. Theming

- Style classes: `p-metergroup p-component`, `p-metergroup-horizontal|vertical`, `p-metergroup-meters`, `p-metergroup-meter`, `p-metergroup-label-list` (+ `-vertical|-horizontal`), `p-metergroup-label`, `p-metergroup-label-icon`, `p-metergroup-label-marker`, `p-metergroup-label-text`; `data-p` carries the orientation (`primeng-21.1.9:packages/primeng/src/metergroup/style/metergroupstyle.ts`, `primevue-4.5.5:packages/primevue/src/metergroup/style/MeterGroupStyle.js`).
- Structural CSS: `@primeuix/styles-2.0.3:dist/metergroup/index.mjs`.
- Design tokens (`@primeuix/themes-2.0.3:types/metergroup/index.d.ts`): `root` (`borderRadius`, `gap`), `meters` (`background`, `size`), `label` (`gap`), `labelMarker` (`size`), `labelIcon` (`size`), `labelList` (`verticalGap`, `horizontalGap`). Aura values: `@primeuix/themes-2.0.3:dist/aura/metergroup/index.mjs`.
- PrimeReact: own class set (`p-metergroup-meter-container`, `p-metergroup-label-list-item`, `p-metergroup-label-type`, label list `-start|-end` modifiers); own CSS in `MeterGroupBase.js`; design tokens N/A (`primereact-10.9.9:components/lib/metergroup/MeterGroupBase.js`, `primereact-10.9.9:components/doc/metergroup/theming/styleddoc.js`).
- PT docs: `primeng-21.1.9:apps/showcase/doc/metergroup/pt/PTViewer.ts`, `primevue-4.5.5:apps/showcase/doc/metergroup/pt/index.vue`, `primereact-10.9.9:components/doc/metergroup/pt/wireframe.js`.

## 9. Relationships

- Multi-value sibling of ProgressBar (single value, determinate/indeterminate); unlike ProgressBar it exposes `role="meter"`, not `progressbar`.
- Embeds no other Prime components; templates in the showcase use Card and Button.

## 10. Dependencies

- PrimeNG: `@angular/common`, `@angular/core`, `@primeuix/utils` (`getOuterHeight`, to fix the height of vertical groups), `primeng/api`, `primeng/basecomponent`, `primeng/bind`, `@primeuix/styles/metergroup` (`primeng-21.1.9:packages/primeng/src/metergroup/metergroup.ts`).
- PrimeVue: `@primeuix/utils` (`cn`), `@primevue/core/basecomponent`, `@primeuix/styles/metergroup` (`primevue-4.5.5:packages/primevue/src/metergroup/MeterGroup.vue`).
- PrimeReact: `../api/Api`, `../componentbase/ComponentBase`, `../hooks/Hooks`, `../utils/Utils` (`primereact-10.9.9:components/lib/metergroup/MeterGroup.js`).
- External npm packages: none.

## 11. Framework differences

| Aspect               | PrimeNG                           | PrimeVue                     | PrimeReact                          |
| -------------------- | --------------------------------- | ---------------------------- | ----------------------------------- |
| Items prop           | `value`                           | `value`                      | `values`                            |
| Label template       | rendered after the default legend | slot replaces default legend | `labelList` replaces default legend |
| Legend icon template | `#icon`                           | `icon` slot                  | —                                   |
| `totalPercent`       | scaled + clamped                  | scaled + clamped             | raw sum                             |
| `min === max`        | 100%                              | division by zero             | division by zero                    |
| Zero-value meter     | not rendered (`value > 0`)        | not rendered (rounded 0%)    | rendered                            |
| Theming              | `@primeuix` tokens                | `@primeuix` tokens           | own CSS, no tokens                  |

- PrimeNG renders `p-meterGroupLabel` unconditionally for the chosen position and then the `#label` template, so a custom label template is added to, not substituted for, the default legend; at `labelPosition="start"` the outlet reads `labelTemplate || labelTemplate`, ignoring a `pTemplate="label"` registration (`primeng-21.1.9:packages/primeng/src/metergroup/metergroup.ts`).

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/metergroup/metergroup.ts`
- `primeng-21.1.9:packages/primeng/src/metergroup/style/metergroupstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/metergroup/metergroup.types.ts`
- `primeng-21.1.9:apps/showcase/doc/metergroup/` (`import-doc.ts`, `basic-doc.ts`, `multiple-doc.ts`, `icon-doc.ts`, `label-doc.ts`, `vertical-doc.ts`, `minmax-doc.ts`, `template-doc.ts`, `accessibility-doc.ts`, `pt/PTViewer.ts`)
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/metergroup/` (`MeterGroup.vue`, `MeterGroupLabel.vue`, `BaseMeterGroup.vue`, `MeterGroup.d.ts`, `style/MeterGroupStyle.js`)
- `primevue-4.5.5:apps/showcase/doc/metergroup/` (`ImportDoc.vue`, `BasicDoc.vue`, `MultipleDoc.vue`, `IconDoc.vue`, `LabelDoc.vue`, `VerticalDoc.vue`, `MinMaxDoc.vue`, `TemplateDoc.vue`, `AccessibilityDoc.vue`, `pt/index.vue`, `theming/index.vue`)
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/metergroup/` (`MeterGroup.js`, `MeterGroupBase.js`, `metergroup.d.ts`)
- `primereact-10.9.9:components/doc/metergroup/` (`importdoc.js`, `basicdoc.js`, `multipledoc.js`, `icondoc.js`, `labeldoc.js`, `verticaldoc.js`, `minmaxdoc.js`, `templatedoc.js`, `accessibilitydoc.js`, `pt/wireframe.js`, `theming/styleddoc.js`)
- `primereact-10.9.9:components/layout/menu.json`
- `@primeuix/styles-2.0.3:dist/metergroup/index.mjs`
- `@primeuix/themes-2.0.3:types/metergroup/index.d.ts`
- `@primeuix/themes-2.0.3:dist/aura/metergroup/index.mjs`
