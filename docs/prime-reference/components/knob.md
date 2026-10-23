# Knob

**Category:** Form · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Knob is a circular dial input for a number inside a range. It draws an SVG with a background arc (range), a foreground arc (value) and an optional text label, and changes the value by pointer drag, click, touch or keyboard. All three frameworks ship it under the same name (`primeng-21.1.9:packages/primeng/src/knob/knob.ts`, `primevue-4.5.5:packages/primevue/src/knob/Knob.vue`, `primereact-10.9.9:components/lib/knob/Knob.js`).

## 2. Names & status

- Canonical name: **Knob** in all three frameworks; no legacy aliases.
- Not deprecated. In PrimeNG the `styleClass` input is `@deprecated since v20.0.0, use class instead` (`primeng-21.1.9:packages/primeng/src/knob/knob.ts`).
- Listed under the Form group of every showcase menu (`primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primereact-10.9.9:components/layout/menu.json`).

## 3. Per framework

| Aspect         | PrimeNG                                                                                        | PrimeVue                                                                                 | PrimeReact                                                |
| -------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Import         | `import { KnobModule } from 'primeng/knob'` (component `Knob` is standalone)                   | `import Knob from 'primevue/knob'`                                                       | `import { Knob } from 'primereact/knob'`                  |
| Selector / tag | `<p-knob>`                                                                                     | `<Knob>`                                                                                 | `<Knob />`                                                |
| Source         | `packages/primeng/src/knob/knob.ts`, `style/knobstyle.ts`, types in `types/knob/knob.types.ts` | `packages/primevue/src/knob/Knob.vue`, `BaseKnob.vue`, `Knob.d.ts`, `style/KnobStyle.js` | `components/lib/knob/Knob.js`, `KnobBase.js`, `knob.d.ts` |
| Exports        | `Knob`, `KnobModule`, `KNOB_VALUE_ACCESSOR`, `KnobStyle`, `KnobClasses`                        | default `Knob`; `KnobStyle` from `primevue/knob/style`                                   | `Knob`                                                    |
| Base class     | `BaseEditableHolder<KnobPassThrough>`                                                          | `BaseEditableHolder` (via `BaseKnob`)                                                    | `ComponentBase.extend` (`KnobBase`)                       |

Sources: `primeng-21.1.9:apps/showcase/doc/knob/import-doc.ts`, `primeng-21.1.9:packages/primeng/src/knob/public_api.ts`, `primevue-4.5.5:apps/showcase/doc/knob/ImportDoc.vue`, `primevue-4.5.5:packages/primevue/src/knob/package.json`, `primevue-4.5.5:packages/primevue/src/knob/BaseKnob.vue`, `primereact-10.9.9:components/doc/knob/importdoc.js`, `primereact-10.9.9:components/lib/knob/KnobBase.js`.

## 4. Anatomy

| Part  | Element        | PrimeNG PT key | PrimeVue PT key | PrimeReact PT key | Class          |
| ----- | -------------- | -------------- | --------------- | ----------------- | -------------- |
| Root  | host / `<div>` | `host`         | `root`          | `root`            | `p-knob`       |
| SVG   | `<svg>` slider | `svg`          | `svg`           | `svg`             | —              |
| Range | `<path>`       | `range`        | `range`         | `range`           | `p-knob-range` |
| Value | `<path>`       | `value`        | `value`         | `value`           | `p-knob-value` |
| Text  | `<text>`       | `text`         | `text`          | `label`           | `p-knob-text`  |

PrimeNG renders the SVG directly inside the `<p-knob>` host element (no wrapper `div`); PrimeVue and PrimeReact wrap it in a `div` root. The text element renders only when `showValue` is true (`primeng-21.1.9:packages/primeng/src/types/knob/knob.types.ts`, `primevue-4.5.5:packages/primevue/src/knob/Knob.d.ts`, `primereact-10.9.9:components/lib/knob/knob.d.ts`).

## 5. API highlights

Shared props (same name and default everywhere unless noted): `min = 0`, `max = 100`, `step = 1`, `size = 100` (diameter in px), `strokeWidth = 14`, `showValue = true`, `valueTemplate = '{value}'`, `disabled = false`, `name`, `valueColor`, `rangeColor`, `textColor`.

| Member          | PrimeNG                                                                             | PrimeVue                                                            | PrimeReact                                                                                              |
| --------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Value binding   | `ngModel` / `formControlName` (`ControlValueAccessor`)                              | `modelValue` / `v-model`, `defaultValue`                            | `value` (controlled)                                                                                    |
| Read-only       | `readonly: boolean = false`                                                         | `readonly: boolean = false`                                         | `readOnly: boolean = false`                                                                             |
| Tab index       | `tabindex: number = 0`                                                              | `tabindex: number = 0`                                              | `tabIndex` (default `0` in `defaultProps`)                                                              |
| ARIA            | `ariaLabel`, `ariaLabelledBy`                                                       | `ariaLabel`, `ariaLabelledby`                                       | `ariaLabel`, `ariaLabelledby` (read in JSX)                                                             |
| `valueTemplate` | `string`                                                                            | `string \| Function`                                                | `string`                                                                                                |
| Color defaults  | `$dt('knob.value.background').variable` etc.                                        | `$dt('knob.value.background')` etc.                                 | `var(--primary-color, Black)`, `var(--surface-border, LightGray)`, `var(--text-color-secondary, Black)` |
| Form state      | `invalid`, `required`, `disabled`, `name` (signal inputs from `BaseEditableHolder`) | `invalid`, `disabled`, `name`, `formControl` (`BaseEditableHolder`) | `invalid` not declared in `KnobProps`                                                                   |
| Change event    | `onChange: EventEmitter<number>`                                                    | `change(value: number)`, `update:modelValue`, `value-change`        | `onChange(event: KnobChangeEvent)` with `value: number`                                                 |
| Methods         | —                                                                                   | —                                                                   | `getElement(): null \| HTMLDivElement`                                                                  |

- PrimeNG decorator inputs (`@Input`) cover `ariaLabel`, `ariaLabelledBy`, `tabindex`, colors, `valueTemplate`, `size`, `min`, `max`, `step`, `strokeWidth`, `showValue`, `readonly`; `disabled`, `invalid`, `required` and `name` are signal `input()`s inherited from `BaseEditableHolder` (`primeng-21.1.9:packages/primeng/src/knob/knob.ts`, `primeng-21.1.9:packages/primeng/src/baseeditableholder/baseeditableholder.ts`).
- PrimeVue's `valueTemplate` accepts a function `(value) => string`; PrimeNG and PrimeReact only replace the `{value}` placeholder in a string (`primevue-4.5.5:packages/primevue/src/knob/Knob.vue`, `primereact-10.9.9:components/lib/knob/Knob.js`).
- Full API: catalog modules `knob` in `docs/prime-reference/catalog/primeng.json`, `primevue.json`, `primereact.json`.

## 6. Usage guidance

- **Basic** — bind a number with the framework's value binding (`ngModel`, `v-model`, controlled `value` + `onChange`) (`primeng-21.1.9:apps/showcase/doc/knob/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/knob/BasicDoc.vue`, `primereact-10.9.9:components/doc/knob/basicdoc.js`).
- **Min/Max** — set the bounds with `min` and `max` (`primevue-4.5.5:apps/showcase/doc/knob/MinMaxDoc.vue`, `primeng-21.1.9:apps/showcase/doc/knob/minmax-doc.ts`, `primereact-10.9.9:components/doc/knob/minmaxdoc.js`).
- **Step** — `step` sets the increment of each movement (`primevue-4.5.5:apps/showcase/doc/knob/StepDoc.vue`, `primeng-21.1.9:apps/showcase/doc/knob/step-doc.ts`, `primereact-10.9.9:components/doc/knob/stepdoc.js`).
- **Template** — format the label with `valueTemplate` (for example a `%` suffix); PrimeVue also accepts a function (`primevue-4.5.5:apps/showcase/doc/knob/TemplateDoc.vue`, `primeng-21.1.9:apps/showcase/doc/knob/template-doc.ts`, `primereact-10.9.9:components/doc/knob/templatedoc.js`).
- **Stroke** — `strokeWidth` sets the arc thickness in pixels (`primevue-4.5.5:apps/showcase/doc/knob/StrokeDoc.vue`, `primeng-21.1.9:apps/showcase/doc/knob/stroke-doc.ts`, `primereact-10.9.9:components/doc/knob/strokedoc.js`).
- **Size** — `size` sets the diameter in pixels (`primevue-4.5.5:apps/showcase/doc/knob/SizeDoc.vue`, `primeng-21.1.9:apps/showcase/doc/knob/size-doc.ts`, `primereact-10.9.9:components/doc/knob/sizedoc.js`).
- **Color** — `valueColor`, `rangeColor` and `textColor` override the theme colors (`primevue-4.5.5:apps/showcase/doc/knob/ColorDoc.vue`, `primeng-21.1.9:apps/showcase/doc/knob/color-doc.ts`, `primereact-10.9.9:components/doc/knob/colordoc.js`).
- **Reactive** — the value can be driven by external controls such as +/- buttons (`primevue-4.5.5:apps/showcase/doc/knob/ReactiveDoc.vue`, `primeng-21.1.9:apps/showcase/doc/knob/reactive-doc.ts`, `primereact-10.9.9:components/doc/knob/reactivedoc.js`).
- **ReadOnly / Disabled** — `readonly` (`readOnly` in React) blocks editing; `disabled` also dims the component (`primevue-4.5.5:apps/showcase/doc/knob/ReadOnlyDoc.vue`, `primevue-4.5.5:apps/showcase/doc/knob/DisabledDoc.vue`, `primeng-21.1.9:apps/showcase/doc/knob/readonly-doc.ts`, `primeng-21.1.9:apps/showcase/doc/knob/disabled-doc.ts`, `primereact-10.9.9:components/doc/knob/readonlydoc.js`, `primereact-10.9.9:components/doc/knob/disableddoc.js`).
- **Forms** — PrimeNG shows template-driven and reactive forms; PrimeVue shows `@primevue/forms` integration (`primeng-21.1.9:apps/showcase/doc/knob/templatedrivenforms-doc.ts`, `primeng-21.1.9:apps/showcase/doc/knob/reactiveforms-doc.ts`, `primevue-4.5.5:apps/showcase/doc/knob/FormsDoc.vue`).

No services or providers are required.

## 7. Accessibility

- The `<svg>` carries `role="slider"` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, plus `aria-label` / `aria-labelledby` from props; it is focusable with `tabindex`, set to `-1` when read-only or disabled (`primeng-21.1.9:packages/primeng/src/knob/knob.ts`, `primevue-4.5.5:packages/primevue/src/knob/Knob.vue`, `primereact-10.9.9:components/lib/knob/Knob.js`).
- Keyboard (identical in all three docs): Tab focuses; Left/Down arrow decrement by `step`; Right/Up arrow increment; Home sets `min`; End sets `max`; Page Up / Page Down change the value by 10 (`primeng-21.1.9:apps/showcase/doc/knob/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/knob/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/knob/accessibilitydoc.js`).
- Source detail: Page Up / Page Down add or subtract a literal `10`, not `10 * step` as the doc wording suggests (`primevue-4.5.5:packages/primevue/src/knob/Knob.vue`, `primeng-21.1.9:packages/primeng/src/knob/knob.ts`).
- PrimeReact defect: the keyboard handler and the `tabIndex` expression test `props.readonly` (lower case), while the declared prop is `readOnly`; pointer handlers check `readOnly`. A read-only React Knob therefore stays focusable and keyboard-editable (`primereact-10.9.9:components/lib/knob/Knob.js`, `primereact-10.9.9:components/lib/knob/knob.d.ts`).
- PrimeNG adds `required` on the SVG when the `required` input is set (`primeng-21.1.9:packages/primeng/src/knob/knob.ts`).

## 8. Theming

- Style classes: `p-knob` (root, plus `p-component`, `p-disabled`; PrimeVue also `p-invalid`), `p-knob-range`, `p-knob-value`, `p-knob-text` (catalog `primeng.json` `modules.knob.style.classes`; `primevue.json` `modules.knobstyle.enumerations.KnobClasses`; `primeng-21.1.9:packages/primeng/src/knob/style/knobstyle.ts`, `primevue-4.5.5:packages/primevue/src/knob/style/KnobStyle.js`).
- Structural CSS: `@primeuix/styles-2.0.3:dist/knob/index.mjs` (arc fills, `p-knob-dash-frame` keyframe animation of the value arc, focus ring on the SVG). Both PrimeNG and PrimeVue import it as `style` with no additions.
- Design tokens (`@primeuix/themes-2.0.3:types/knob/index.d.ts`, `@primeuix/themes-2.0.3:tokens/index.mjs`; 9 tokens): `root` (`transitionDuration`, `focusRing.width/style/color/offset/shadow`), `value.background`, `range.background`, `text.color`. The color props default to these tokens in PrimeNG and PrimeVue.
- PrimeReact: classes from `css.classes` in `KnobBase.js` (`root`, `range`, `value`, `label` → `p-knob-text`); structural CSS in `css.styles` under `@layer primereact` with a `dash-frame` keyframe; colors from CSS variables of the theme (`--primary-color`, `--surface-border`, `--text-color-secondary`); design tokens N/A (`primereact-10.9.9:components/lib/knob/KnobBase.js`, `primereact-10.9.9:components/doc/knob/theming/styleddoc.js`).

## 9. Relationships

- Embeds no other Prime components.
- Related: Slider (linear range input), InputNumber (typed numeric entry).
- The showcase Reactive demo pairs Knob with Button (`primeng-21.1.9:apps/showcase/doc/knob/reactive-doc.ts`).

## 10. Dependencies

- PrimeNG: `@angular/forms` (`NG_VALUE_ACCESSOR`), `@primeuix/styled` (`$dt`), `primeng/api`, `primeng/basecomponent`, `primeng/baseeditableholder`, `primeng/bind`, `primeng/ts-helpers`, `@primeuix/styles/knob` (`primeng-21.1.9:packages/primeng/src/knob/knob.ts`, `primeng-21.1.9:packages/primeng/src/knob/style/knobstyle.ts`).
- PrimeVue: `@primevue/core/baseeditableholder`, `@primevue/core/base/style`, `@primeuix/styled` (`$dt`), `@primeuix/styles/knob` (`primevue-4.5.5:packages/primevue/src/knob/BaseKnob.vue`, `primevue-4.5.5:packages/primevue/src/knob/style/KnobStyle.js`).
- PrimeReact: `../api/Api`, `../componentbase/ComponentBase`, `../hooks/Hooks` (`useEventListener`, `useMergeProps`), `../utils/Utils` (`primereact-10.9.9:components/lib/knob/Knob.js`).
- External npm packages: none beyond the framework.

## 11. Framework differences

| Aspect                 | PrimeNG                           | PrimeVue                                      | PrimeReact                                   |
| ---------------------- | --------------------------------- | --------------------------------------------- | -------------------------------------------- |
| Root element           | `<p-knob>` host, no wrapper `div` | `div` root                                    | `div` root                                   |
| Read-only prop         | `readonly`                        | `readonly`                                    | `readOnly` (keyboard path checks `readonly`) |
| `valueTemplate`        | string                            | string or function                            | string                                       |
| Default colors         | `@primeuix` token variables       | `@primeuix` token variables                   | Theme CSS variables with fallbacks           |
| Text PT key            | `text`                            | `text`                                        | `label`                                      |
| `invalid` / `required` | both                              | `invalid` only                                | neither                                      |
| Forms integration      | `ControlValueAccessor`            | `@primevue/forms` via `BaseEditableHolder`    | controlled props only                        |
| Change event           | `onChange` emits the number       | `change`, `update:modelValue`, `value-change` | `onChange({ value })`                        |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/knob/knob.ts`
- `primeng-21.1.9:packages/primeng/src/knob/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/knob/style/knobstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/knob/knob.types.ts`
- `primeng-21.1.9:packages/primeng/src/baseeditableholder/baseeditableholder.ts`
- `primeng-21.1.9:apps/showcase/doc/knob/` (`import-doc.ts`, `basic-doc.ts`, `minmax-doc.ts`, `step-doc.ts`, `template-doc.ts`, `stroke-doc.ts`, `size-doc.ts`, `color-doc.ts`, `reactive-doc.ts`, `readonly-doc.ts`, `disabled-doc.ts`, `templatedrivenforms-doc.ts`, `reactiveforms-doc.ts`, `accessibility-doc.ts`)
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/knob/Knob.vue`
- `primevue-4.5.5:packages/primevue/src/knob/BaseKnob.vue`
- `primevue-4.5.5:packages/primevue/src/knob/Knob.d.ts`
- `primevue-4.5.5:packages/primevue/src/knob/package.json`
- `primevue-4.5.5:packages/primevue/src/knob/style/KnobStyle.js`
- `primevue-4.5.5:apps/showcase/doc/knob/` (`ImportDoc.vue`, `BasicDoc.vue`, `MinMaxDoc.vue`, `StepDoc.vue`, `TemplateDoc.vue`, `StrokeDoc.vue`, `SizeDoc.vue`, `ColorDoc.vue`, `ReactiveDoc.vue`, `ReadOnlyDoc.vue`, `DisabledDoc.vue`, `FormsDoc.vue`, `AccessibilityDoc.vue`)
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/knob/Knob.js`
- `primereact-10.9.9:components/lib/knob/KnobBase.js`
- `primereact-10.9.9:components/lib/knob/knob.d.ts`
- `primereact-10.9.9:components/doc/knob/` (`importdoc.js`, `basicdoc.js`, `minmaxdoc.js`, `stepdoc.js`, `templatedoc.js`, `strokedoc.js`, `sizedoc.js`, `colordoc.js`, `reactivedoc.js`, `readonlydoc.js`, `disableddoc.js`, `accessibilitydoc.js`, `theming/styleddoc.js`)
- `primereact-10.9.9:components/layout/menu.json`
- `@primeuix/styles-2.0.3:dist/knob/index.mjs`
- `@primeuix/themes-2.0.3:types/knob/index.d.ts`
- `@primeuix/themes-2.0.3:tokens/index.mjs`
