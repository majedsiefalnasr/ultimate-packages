# Slider

**Category:** Form · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Slider is a linear input for a number, or a pair of numbers (range mode), inside a `min`–`max` interval. It renders a track, a filled range bar and one or two draggable handles, and changes the value by pointer drag, click on the track, touch or keyboard. It can be horizontal or vertical. All three frameworks ship it under the same name (`primeng-21.1.9:packages/primeng/src/slider/slider.ts`, `primevue-4.5.5:packages/primevue/src/slider/Slider.vue`, `primereact-10.9.9:components/lib/slider/Slider.js`).

## 2. Names & status

- Canonical name: **Slider** in all three frameworks; no legacy aliases.
- Not deprecated. In PrimeNG the `styleClass` input is `@deprecated since v20.0.0, use class instead` (`primeng-21.1.9:packages/primeng/src/slider/slider.ts`).
- Listed under the Form group of every showcase menu (`primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primereact-10.9.9:components/layout/menu.json`).

## 3. Per framework

| Aspect         | PrimeNG                                                                                                                                                  | PrimeVue                                                                                           | PrimeReact                                                          |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Import         | `import { SliderModule } from 'primeng/slider'` (component `Slider` is standalone)                                                                       | `import Slider from 'primevue/slider'`                                                             | `import { Slider } from 'primereact/slider'`                        |
| Selector / tag | `<p-slider>`                                                                                                                                             | `<Slider>`                                                                                         | `<Slider />`                                                        |
| Source         | `packages/primeng/src/slider/slider.ts`, `style/sliderstyle.ts`, types in `packages/primeng/src/types/slider/slider.types.ts`                            | `packages/primevue/src/slider/Slider.vue`, `BaseSlider.vue`, `Slider.d.ts`, `style/SliderStyle.js` | `components/lib/slider/Slider.js`, `SliderBase.js`, `slider.d.ts`   |
| Exports        | `Slider`, `SliderModule`, `SLIDER_VALUE_ACCESSOR`, `SliderStyle`, `SliderClasses`, types `SliderChangeEvent`, `SliderSlideEndEvent`, `SliderPassThrough` | default `Slider`; `SliderStyle` from `primevue/slider/style`                                       | `Slider`                                                            |
| Base class     | `BaseEditableHolder<SliderPassThrough>` (host directive `Bind`, `OnPush`, `ViewEncapsulation.None`)                                                      | `BaseEditableHolder` (via `BaseSlider`; `inheritAttrs: false`)                                     | `React.memo(forwardRef)` over `ComponentBase.extend` (`SliderBase`) |

Sources: `primeng-21.1.9:apps/showcase/doc/slider/import-doc.ts`, `primeng-21.1.9:packages/primeng/src/slider/public_api.ts`, `primeng-21.1.9:packages/primeng/src/types/slider/public_api.ts`, `primevue-4.5.5:apps/showcase/doc/slider/ImportDoc.vue`, `primevue-4.5.5:packages/primevue/src/slider/package.json`, `primevue-4.5.5:packages/primevue/src/slider/BaseSlider.vue`, `primereact-10.9.9:components/doc/slider/importdoc.js`, `primereact-10.9.9:components/lib/slider/package.json`, `primereact-10.9.9:components/lib/slider/SliderBase.js`.

## 4. Anatomy

| Part         | Element                | PrimeNG PT key | PrimeVue PT key | PrimeReact PT key | Class                                                          |
| ------------ | ---------------------- | -------------- | --------------- | ----------------- | -------------------------------------------------------------- |
| Root         | host / `<div>`         | `root`         | `root`          | `root`            | `p-slider` (plus `p-component`, orientation and state classes) |
| Range        | `<span>` filled bar    | `range`        | `range`         | `range`           | `p-slider-range`                                               |
| Handle       | `<span>` (single mode) | `handle`       | `handle`        | `handle`          | `p-slider-handle`                                              |
| Start handle | `<span>` (range mode)  | `startHandler` | `startHandler`  | `handle`          | `p-slider-handle` (React adds `p-slider-handle-start`)         |
| End handle   | `<span>` (range mode)  | `endHandler`   | `endHandler`    | `handle`          | `p-slider-handle` (React adds `p-slider-handle-end`)           |

PrimeNG renders the markup directly inside the `<p-slider>` host element (no wrapper `div`); PrimeVue and PrimeReact use a `div` root. The range `span` is always rendered. PrimeNG and PrimeReact mark the handle being dragged with `p-slider-handle-active`. Handles and the range bar are positioned absolutely by inline styles: `inset-inline-start` percentage in PrimeNG and PrimeVue (RTL aware), `left` percentage in PrimeReact, and `bottom` percentage in vertical mode. PrimeNG and PrimeVue also set `data-pc-section` (`root`, `range`, `handle`, `startHandler`, `endHandler`), `data-p` (orientation) and `data-p-sliding` (true while dragging) (`primeng-21.1.9:packages/primeng/src/slider/slider.ts`, `primeng-21.1.9:packages/primeng/src/types/slider/slider.types.ts`, `primevue-4.5.5:packages/primevue/src/slider/Slider.vue`, `primevue-4.5.5:packages/primevue/src/slider/Slider.d.ts`, `primereact-10.9.9:components/lib/slider/Slider.js`, `primereact-10.9.9:components/lib/slider/slider.d.ts`).

## 5. API highlights

Shared props (same name and default everywhere unless noted): `min = 0`, `max = 100`, `step`, `orientation = 'horizontal'` (or `'vertical'`), `range = false`, `disabled = false`, plus the framework's pass-through and unstyled options. The value is a `number`, or a two-element array in range mode.

| Member        | PrimeNG                                                                                           | PrimeVue                                                         | PrimeReact                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Value binding | `ngModel` / `formControlName` (`ControlValueAccessor`); `number` or `number[]`                    | `modelValue` / `v-model`, `defaultValue`; `number` or `number[]` | `value` (controlled): `number` or `[number, number]`                                    |
| `step`        | `number \| undefined`, no default                                                                 | `1` in the type docs, `null` in `BaseSlider.vue`                 | `1` in the type docs, `null` in `SliderBase.js`                                         |
| Tab index     | `tabindex = 0`                                                                                    | `tabindex = 0` (in `BaseSlider.vue`)                             | `tabIndex = 0` (in `defaultProps`, not in `SliderProps`)                                |
| ARIA          | `ariaLabel`, `ariaLabelledBy`                                                                     | `ariaLabel`, `ariaLabelledby`                                    | `ariaLabelledBy` declared; `aria-label` / `aria-labelledby` pass through to each handle |
| Form state    | `invalid`, `required`, `name` (signal inputs from `BaseEditableHolder`), `autofocus`              | `invalid`, `name`, `formControl` (`BaseEditableHolder`)          | no `invalid` prop                                                                       |
| Animation     | `animate: boolean` adds `p-slider-animate`                                                        | —                                                                | —                                                                                       |
| Change event  | `onChange: EventEmitter<SliderChangeEvent>` with `value` (single) or `values` (range) and `event` | `change(value)`, `update:modelValue`, `value-change`             | `onChange({ originalEvent, value })`                                                    |
| Slide end     | `onSlideEnd: EventEmitter<SliderSlideEndEvent>` (`originalEvent`, `value` / `values`)             | `slideend({ originalEvent, value })`                             | `onSlideEnd({ originalEvent, value })`                                                  |
| Slots         | none                                                                                              | none                                                             | `children` prop only (no templates)                                                     |
| Methods       | —                                                                                                 | —                                                                | `getElement(): null \| HTMLDivElement`                                                  |

- PrimeNG `disabled`, `invalid`, `required` and `name` are signal `input()`s inherited from `BaseEditableHolder`; the remaining props are decorator `@Input`s (`primeng-21.1.9:packages/primeng/src/slider/slider.ts`, `primeng-21.1.9:packages/primeng/src/baseeditableholder/baseeditableholder.ts`).
- PrimeVue forms integration uses `name` plus `formControl` from `BaseEditableHolder`; the handle blur calls the form field's `onBlur` (`primevue-4.5.5:packages/core/src/baseeditableholder/BaseEditableHolder.vue`, `primevue-4.5.5:packages/primevue/src/slider/BaseSlider.vue`).
- Event timing differs. PrimeNG emits `onSlideEnd` on mouse-up, touch-end and track click. PrimeVue emits `slideend` only when a drag ends (not for a track click, not for keyboard). PrimeReact emits `onSlideEnd` on drag end and on track click (`primeng-21.1.9:packages/primeng/src/slider/slider.ts`, `primevue-4.5.5:packages/primevue/src/slider/Slider.vue`, `primereact-10.9.9:components/lib/slider/Slider.js`).
- Without `step`, pointer values are floored to whole numbers; with a decimal `step`, PrimeNG rounds with `toFixed` to the step's decimals, PrimeVue rounds to two decimals, PrimeReact to ten (`primeng-21.1.9:packages/primeng/src/slider/slider.ts`, `primevue-4.5.5:packages/primevue/src/slider/Slider.vue`, `primereact-10.9.9:components/lib/slider/Slider.js`).
- Range mode: PrimeNG sorts the emitted pair as `[min, max]` even when the handles cross; PrimeVue and PrimeReact let the handles cross without re-sorting (same sources).
- Full API: catalog modules `slider` in `docs/prime-reference/catalog/primeng.json`, `primevue.json`, `primereact.json`.

## 6. Usage guidance

- **Basic** — bind a number with the framework's value binding (`ngModel`, `v-model`, controlled `value` + `onChange`) (`primeng-21.1.9:apps/showcase/doc/slider/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/slider/BasicDoc.vue`, `primereact-10.9.9:components/doc/slider/basicdoc.js`).
- **Input** — pair the slider with a text input that edits the same model; the demo defaults to 50 (`primeng-21.1.9:apps/showcase/doc/slider/input-doc.ts`, `primevue-4.5.5:apps/showcase/doc/slider/InputDoc.vue`, `primereact-10.9.9:components/doc/slider/inputdoc.js`). The PrimeReact demo passes the text input's string `e.target.value` straight to the slider value; convert to a number in application code.
- **Step** — `step` sets the increment (the demos use 20) (`primeng-21.1.9:apps/showcase/doc/slider/step-doc.ts`, `primevue-4.5.5:apps/showcase/doc/slider/StepDoc.vue`, `primereact-10.9.9:components/doc/slider/stepdoc.js`).
- **Range** — set `range` and bind an array such as `[20, 80]` (`primeng-21.1.9:apps/showcase/doc/slider/range-doc.ts`, `primevue-4.5.5:apps/showcase/doc/slider/RangeDoc.vue`, `primereact-10.9.9:components/doc/slider/rangedoc.js`).
- **Filter** — several sliders (0–200) drive an image filter, with SelectButton choosing which filter applies (`primeng-21.1.9:apps/showcase/doc/slider/filter-doc.ts`, `primevue-4.5.5:apps/showcase/doc/slider/FilterDoc.vue`, `primereact-10.9.9:components/doc/slider/filterdoc.js`).
- **Vertical** — `orientation="vertical"`; give the slider an explicit height (the demos use a Tailwind `h-56` class), otherwise it falls back to the 100px minimum (`primeng-21.1.9:apps/showcase/doc/slider/vertical-doc.ts`, `primevue-4.5.5:apps/showcase/doc/slider/VerticalDoc.vue`, `primereact-10.9.9:components/doc/slider/verticaldoc.js`).
- **Forms** — PrimeNG shows template-driven and reactive forms with Toast, Message and Button; PrimeVue shows `@primevue/forms` with a zod resolver (rule: greater than 25 and less than 75) and Message; PrimeReact has no forms doc (`primeng-21.1.9:apps/showcase/doc/slider/templatedrivenforms-doc.ts`, `primeng-21.1.9:apps/showcase/doc/slider/reactiveforms-doc.ts`, `primevue-4.5.5:apps/showcase/doc/slider/FormsDoc.vue`).
- **Pass-through** — the PT demos list the available keys (`primeng-21.1.9:apps/showcase/doc/slider/pt/PTComponent.ts`, `primeng-21.1.9:apps/showcase/doc/slider/pt/PTViewer.ts`, `primevue-4.5.5:apps/showcase/doc/slider/pt/index.vue`, `primevue-4.5.5:apps/showcase/doc/slider/pt/PTViewer.vue`, `primereact-10.9.9:components/doc/slider/pt/wireframe.js`).

No services or providers are required beyond the PrimeNG `SLIDER_VALUE_ACCESSOR` that the component registers itself.

## 7. Accessibility

- Each handle carries `role="slider"` with `aria-orientation`, `aria-valuemin`, `aria-valuemax` and `aria-valuenow`; the label comes from `ariaLabel` / `ariaLabelledBy` (PrimeNG) or `aria-label` / `aria-labelledby` (PrimeVue, PrimeReact) (`primeng-21.1.9:apps/showcase/doc/slider/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/slider/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/slider/accessibilitydoc.js`).
- Keyboard per the docs: Tab focuses a handle; Home sets `min`; End sets `max`; Page Up / Page Down change the value by 10 steps; the arrow keys are listed as Left/Up decrement and Right/Down increment.
- Source detail, arrows: in PrimeNG and PrimeVue Down/Left decrement and Up/Right increment, so the docs table has Up and Down reversed (`primeng-21.1.9:packages/primeng/src/slider/slider.ts`, `primevue-4.5.5:packages/primevue/src/slider/Slider.vue`).
- Source detail, paging: PrimeNG and PrimeVue add or subtract a literal `10` only when no `step` is set; with a `step`, Page Up / Page Down move by one step, and in range mode by 1 (or the step), so the docs' "10 steps" is not accurate (same sources).
- PrimeReact keyboard handling goes through `spin(event, dir)` with `step = (props.step || 1) * dir`. Page Up is `spin(10)` (ten steps, matching the docs). Home is `spin(-value)` and End is `spin(props.max)`, which multiply by `step`, so Home does not reach `min` when `step` is not 1 or `min` is not 0, and both receive an array (NaN) in range mode (`primereact-10.9.9:components/lib/slider/Slider.js`).
- PrimeReact computes `aria-valuenow` from the handle's percentage position, not the real value, so it is wrong when `min` is not 0 or `max` is not 100. PrimeNG and PrimeVue report the actual value (`primereact-10.9.9:components/lib/slider/Slider.js`, `primevue-4.5.5:packages/primevue/src/slider/Slider.vue`).
- Disabled handling: PrimeNG removes `tabindex` from the handle when disabled; PrimeVue and PrimeReact keep `tabindex` on the handle, and only PrimeReact's key handler returns early when disabled (`primeng-21.1.9:packages/primeng/src/slider/slider.ts`, `primevue-4.5.5:packages/primevue/src/slider/Slider.vue`, `primereact-10.9.9:components/lib/slider/Slider.js`).

## 8. Theming

- Style classes: `p-slider` (root, plus `p-component`, `p-disabled`, `p-slider-horizontal`, `p-slider-vertical`; `p-invalid` in PrimeNG and PrimeVue; `p-slider-animate` in PrimeNG), `p-slider-range`, `p-slider-handle`; the active or range handle adds `p-slider-handle-active` (PrimeNG, PrimeReact) and PrimeReact adds `p-slider-handle-start` / `p-slider-handle-end` (catalog `primeng.json` `modules.slider.style.classes`; `primevue.json` `modules.sliderstyle.enumerations.SliderClasses`; `primeng-21.1.9:packages/primeng/src/slider/style/sliderstyle.ts`, `primevue-4.5.5:packages/primevue/src/slider/style/SliderStyle.js`).
- Structural CSS: `@primeuix/styles-2.0.3:dist/slider/index.mjs` (track background and radius, grab cursor and `touch-action: none` on the handle, an inner `::before` content element, hover color only for `.p-slider:not(.p-disabled)`, focus-visible ring, horizontal height from the track size, vertical `min-height: 100px`). No rule for `p-slider-animate` was found there. Both PrimeNG and PrimeVue import it as `style` and add inline styles for absolute positioning.
- Design tokens (`@primeuix/themes-2.0.3:types/slider/index.d.ts`, `@primeuix/themes-2.0.3:tokens/index.mjs`; 21 variables): `root.transitionDuration`; `track.background`, `track.borderRadius`, `track.size`; `range.background`; `handle.width`, `handle.height`, `handle.borderRadius`, `handle.background`, `handle.hoverBackground`; `handle.content.borderRadius`, `.background`, `.hoverBackground`, `.width`, `.height`, `.shadow`; `handle.focusRing.width/style/color/offset/shadow`. A preset such as Aura defines the values (`@primeuix/themes-2.0.3:dist/aura/slider/index.mjs`).
- PrimeReact: classes from `css.classes` in `SliderBase.js`; structural CSS in `css.styles` under `@layer primereact` (relative root, absolute handle and range, grab cursor, vertical height 100px); colors from the theme's CSS; design tokens N/A. The styled-mode doc lists only `p-slider` and `p-slider-handle` and omits `p-slider-range` (`primereact-10.9.9:components/lib/slider/SliderBase.js`, `primereact-10.9.9:components/doc/slider/styledoc.js`, `primereact-10.9.9:components/doc/slider/theming/styleddoc.js`, `primereact-10.9.9:components/doc/slider/theming/tailwinddoc.js`).
- PrimeVue ships theming and Tailwind docs (`primevue-4.5.5:apps/showcase/doc/slider/theming/index.vue`, `primevue-4.5.5:apps/showcase/doc/slider/theming/TailwindDoc.vue`).
- PT keys: `root`, `range`, `handle`, `startHandler`, `endHandler` in PrimeNG and PrimeVue (PrimeVue adds `hooks`); `root`, `range`, `handle`, `hooks` in PrimeReact.

## 9. Relationships

- Embeds no other Prime components.
- Related: Knob (circular dial for the same kind of bounded number), InputNumber (typed numeric entry).
- Showcase demos pair Slider with InputText (Input demo), SelectButton (Filter demo), and Toast, Message and Button (forms demos) (`primeng-21.1.9:apps/showcase/doc/slider/input-doc.ts`, `primeng-21.1.9:apps/showcase/doc/slider/filter-doc.ts`, `primeng-21.1.9:apps/showcase/doc/slider/reactiveforms-doc.ts`, `primevue-4.5.5:apps/showcase/doc/slider/FormsDoc.vue`).

## 10. Dependencies

- PrimeNG: `@angular/common`, `@angular/core`, `@angular/forms` (`NG_VALUE_ACCESSOR`), `@primeuix/utils`, `primeng/api` (`SharedModule`), `primeng/autofocus`, `primeng/basecomponent`, `primeng/baseeditableholder`, `primeng/bind`, `primeng/ts-helpers`, `primeng/base`, `@primeuix/styles/slider` (`primeng-21.1.9:packages/primeng/src/slider/slider.ts`, `primeng-21.1.9:packages/primeng/src/slider/style/sliderstyle.ts`).
- PrimeVue: `@primeuix/utils`, `@primeuix/utils/dom`, `@primevue/core/baseeditableholder`, `@primevue/core/base/style`, `primevue/slider/style`, `@primeuix/styles/slider` (`primevue-4.5.5:packages/primevue/src/slider/Slider.vue`, `primevue-4.5.5:packages/primevue/src/slider/BaseSlider.vue`, `primevue-4.5.5:packages/primevue/src/slider/style/SliderStyle.js`). The forms demo also uses `@primevue/forms` and zod (`primevue-4.5.5:apps/showcase/doc/slider/FormsDoc.vue`).
- PrimeReact: `../api/Api`, `../componentbase/ComponentBase`, `../hooks/Hooks` (`useEventListener`, `useMergeProps`), `../utils/Utils` (`DomHandler`, `ObjectUtils`, `classNames`) (`primereact-10.9.9:components/lib/slider/Slider.js`).
- External npm packages: none beyond the framework.

## 11. Framework differences

| Aspect                    | PrimeNG                                | PrimeVue                                   | PrimeReact                                 |
| ------------------------- | -------------------------------------- | ------------------------------------------ | ------------------------------------------ |
| Root element              | `<p-slider>` host, no wrapper `div`    | `div` root                                 | `div` root                                 |
| Value binding             | `ngModel` / `formControlName`          | `v-model`                                  | controlled `value` + `onChange`            |
| Range output              | `values` field, sorted `[min, max]`    | array, handles may cross                   | array, handles may cross                   |
| Handle PT keys            | `handle`, `startHandler`, `endHandler` | `handle`, `startHandler`, `endHandler`     | `handle` only                              |
| `invalid` state / class   | yes                                    | yes                                        | no                                         |
| `animate` option          | yes (`p-slider-animate`)               | no                                         | no                                         |
| `ariaLabel` prop          | declared                               | declared                                   | not declared (`aria-label` passes through) |
| RTL positioning           | `inset-inline-start`                   | `inset-inline-start`                       | `left` (no RTL support)                    |
| `aria-valuenow`           | actual value                           | actual value                               | handle percentage position                 |
| Disabled `tabindex`       | removed                                | kept                                       | kept (key handler returns early)           |
| `slideend` on track click | yes                                    | no                                         | yes                                        |
| Home / End keys           | to `min` / `max`                       | to `min` / `max`                           | `spin`-based, can miss the bounds          |
| Forms integration         | `ControlValueAccessor`                 | `@primevue/forms` via `BaseEditableHolder` | controlled props only                      |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/slider/slider.ts`
- `primeng-21.1.9:packages/primeng/src/slider/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/slider/style/sliderstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/slider/slider.types.ts`
- `primeng-21.1.9:packages/primeng/src/types/slider/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/baseeditableholder/baseeditableholder.ts`
- `primeng-21.1.9:apps/showcase/doc/slider/` (`import-doc.ts`, `basic-doc.ts`, `input-doc.ts`, `step-doc.ts`, `range-doc.ts`, `filter-doc.ts`, `vertical-doc.ts`, `templatedrivenforms-doc.ts`, `reactiveforms-doc.ts`, `accessibility-doc.ts`, `pt/PTComponent.ts`, `pt/PTViewer.ts`)
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/slider/Slider.vue`
- `primevue-4.5.5:packages/primevue/src/slider/BaseSlider.vue`
- `primevue-4.5.5:packages/primevue/src/slider/Slider.d.ts`
- `primevue-4.5.5:packages/primevue/src/slider/package.json`
- `primevue-4.5.5:packages/primevue/src/slider/style/SliderStyle.js`
- `primevue-4.5.5:packages/core/src/baseeditableholder/BaseEditableHolder.vue`
- `primevue-4.5.5:apps/showcase/doc/slider/` (`ImportDoc.vue`, `BasicDoc.vue`, `InputDoc.vue`, `StepDoc.vue`, `RangeDoc.vue`, `FilterDoc.vue`, `VerticalDoc.vue`, `FormsDoc.vue`, `AccessibilityDoc.vue`, `pt/index.vue`, `pt/PTViewer.vue`, `theming/index.vue`, `theming/TailwindDoc.vue`)
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/slider/Slider.js`
- `primereact-10.9.9:components/lib/slider/SliderBase.js`
- `primereact-10.9.9:components/lib/slider/slider.d.ts`
- `primereact-10.9.9:components/lib/slider/package.json`
- `primereact-10.9.9:components/doc/slider/` (`importdoc.js`, `basicdoc.js`, `inputdoc.js`, `stepdoc.js`, `rangedoc.js`, `filterdoc.js`, `verticaldoc.js`, `accessibilitydoc.js`, `styledoc.js`, `pt/wireframe.js`, `theming/styleddoc.js`, `theming/tailwinddoc.js`)
- `primereact-10.9.9:components/layout/menu.json`
- `@primeuix/styles-2.0.3:dist/slider/index.mjs`
- `@primeuix/themes-2.0.3:types/slider/index.d.ts`
- `@primeuix/themes-2.0.3:tokens/index.mjs`
- `@primeuix/themes-2.0.3:dist/aura/slider/index.mjs`
