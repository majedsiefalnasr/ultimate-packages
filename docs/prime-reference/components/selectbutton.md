# SelectButton

**Category:** Form · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

SelectButton shows a short list of options as a row of joined toggle buttons and lets the user pick one option, or several when `multiple` is set. The value is a single option value (or `null`), or an array of values in multiple mode. All three frameworks ship it under the same name and the same menu category, Form (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).

PrimeNG and PrimeVue build it as a thin wrapper that renders one `ToggleButton` per option (`primeng-21.1.9:packages/primeng/src/selectbutton/selectbutton.ts`, `primevue-4.5.5:packages/primevue/src/selectbutton/SelectButton.vue`). PrimeReact does not use `ToggleButton`: it renders its own `div role="button"` items styled with the `p-button` classes (`primereact-10.9.9:components/lib/selectbutton/SelectButtonItem.js`). That structural split drives most of the differences in sections 4, 7, 8 and 11.

## 2. Names & status

- Canonical name: **SelectButton**. No legacy alias exists in any of the three frameworks, and the glossary has no separate entry for it; the file name is `selectbutton.md`.
- PrimeNG accepts three selector spellings: `p-selectButton`, `p-selectbutton`, `p-select-button` (`primeng-21.1.9:packages/primeng/src/selectbutton/selectbutton.ts`).
- Deprecated members:
  - PrimeReact `unselectable` is marked `@deprecated Use 'allowEmpty' property instead.` in the type declaration only (`primereact-10.9.9:components/lib/selectbutton/selectbutton.d.ts`; also listed in `docs/prime-reference/foundations/primereact/notes-for-component-records.md`).
  - PrimeNG still has an `unselectable` input, and it carries no deprecation tag in the source; its setter simply writes `allowEmpty = !value` (`primeng-21.1.9:packages/primeng/src/selectbutton/selectbutton.ts`).
  - PrimeVue has no `unselectable` prop (`primevue-4.5.5:packages/primevue/src/selectbutton/BaseSelectButton.vue`).
- Replacement role: PrimeVue's removed `DataViewLayoutOptions` is replaced by SelectButton according to the PrimeVue foundations note (`docs/prime-reference/foundations/primevue.md`).
- Status: current in all three; nothing else in the component is deprecated.

## 3. Per framework

| Aspect         | PrimeNG                                                                                                                                                     | PrimeVue                                                                                                                         | PrimeReact                                                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Import         | `import { SelectButtonModule } from 'primeng/selectbutton'` (the `SelectButton` component is standalone)                                                    | `import SelectButton from 'primevue/selectbutton'`                                                                               | `import { SelectButton } from 'primereact/selectbutton'`                                                         |
| Selector / tag | `<p-selectbutton>` (also `p-selectButton`, `p-select-button`)                                                                                               | `<SelectButton>`                                                                                                                 | `<SelectButton />`                                                                                               |
| Source         | `packages/primeng/src/selectbutton/selectbutton.ts`, `style/selectbuttonstyle.ts`, types in `packages/primeng/src/types/selectbutton/selectbutton.types.ts` | `packages/primevue/src/selectbutton/SelectButton.vue`, `BaseSelectButton.vue`, `SelectButton.d.ts`, `style/SelectButtonStyle.js` | `components/lib/selectbutton/SelectButton.js`, `SelectButtonItem.js`, `SelectButtonBase.js`, `selectbutton.d.ts` |
| Exports        | `SelectButton`, `SelectButtonModule`, `SELECTBUTTON_VALUE_ACCESSOR`, `SelectButtonStyle`, `SelectButtonClasses`, and the types                              | default export `SelectButton`; `SelectButtonStyle` from `primevue/selectbutton/style`                                            | `SelectButton` (re-exported by `primereact.all.js`); `SelectButtonItem` is internal                              |
| Base class     | `BaseEditableHolder<SelectButtonPassThrough>`, `ControlValueAccessor` provider                                                                              | `BaseEditableHolder` (through `BaseSelectButton`)                                                                                | `React.memo(forwardRef(...))` over `ComponentBase.extend`                                                        |
| Sub-components | `ToggleButton` per option                                                                                                                                   | `ToggleButton` per option                                                                                                        | `SelectButtonItem` per option; optional `Tooltip` sibling                                                        |

Sources: `primeng-21.1.9:packages/primeng/src/selectbutton/public_api.ts`, `primeng-21.1.9:apps/showcase/doc/selectbutton/import-doc.ts`, `primeng-21.1.9:packages/primeng/src/selectbutton/selectbutton.ts`, `primevue-4.5.5:packages/primevue/src/selectbutton/package.json`, `primevue-4.5.5:apps/showcase/doc/selectbutton/ImportDoc.vue`, `primevue-4.5.5:packages/primevue/src/index.js`, `primereact-10.9.9:components/lib/selectbutton/package.json`, `primereact-10.9.9:components/doc/selectbutton/importdoc.js`, `primereact-10.9.9:components/lib/primereact.all.js`.

## 4. Anatomy

| Part               | PrimeNG                                    | PrimeVue                                                   | PrimeReact                            | Class / note                                               |
| ------------------ | ------------------------------------------ | ---------------------------------------------------------- | ------------------------------------- | ---------------------------------------------------------- |
| Root               | `<p-selectbutton>` host, `role="group"`    | `div role="group"`                                         | `div role="group"`                    | `p-selectbutton p-component` (React adds `p-button-group`) |
| Option button      | `p-togglebutton` (PT key `pcToggleButton`) | `ToggleButton` (PT key `pcToggleButton`)                   | `div role="button"` (PT key `button`) | `p-togglebutton` (NG/Vue); `p-button p-component` (React)  |
| Option label       | label span rendered by `ToggleButton`      | label span rendered by `ToggleButton` or the `option` slot | `span` (PT key `label`)               | `p-togglebutton-label`; React `p-button-label p-c`         |
| Custom option body | `item` template                            | `option` slot                                              | `itemTemplate` function               | replaces the default label                                 |
| Tooltip            | N/A                                        | N/A                                                        | `Tooltip` (PT key `tooltip`)          | only when `tooltip` is set                                 |
| Ripple             | via `ToggleButton`                         | via `ToggleButton`                                         | `Ripple` inside each enabled item     | skipped when the item is disabled in React                 |

- PrimeNG pass-through keys: `host`, `root`, `pcToggleButton` (the latter takes a full `ToggleButtonPassThrough`) (`primeng-21.1.9:packages/primeng/src/types/selectbutton/selectbutton.types.ts`).
- PrimeVue pass-through keys: `root`, `pcToggleButton`, `hooks` (`primevue-4.5.5:packages/primevue/src/selectbutton/SelectButton.d.ts`).
- PrimeReact pass-through keys: `root`, `button`, `label`, `tooltip`, `hooks`; its PT context is `{ selected, disabled, option }` (`primereact-10.9.9:components/lib/selectbutton/selectbutton.d.ts`, `primereact-10.9.9:components/lib/selectbutton/SelectButtonItem.js`).
- The root also carries a `data-p` attribute built from `cn({ invalid })` in PrimeNG and PrimeVue (`primeng-21.1.9:packages/primeng/src/selectbutton/selectbutton.ts`, `primevue-4.5.5:packages/primevue/src/selectbutton/SelectButton.vue`). Each `ToggleButton` stamps `data-p-checked`, `data-p-disabled` and `data-pc-name="togglebutton"` (`primeng-21.1.9:packages/primeng/src/togglebutton/togglebutton.ts`).

## 5. API highlights

Option handling is shared: `options`, `optionLabel`, `optionValue`, `optionDisabled`, `multiple`, `allowEmpty` (default `true`), `dataKey`, `disabled`, `invalid`. The full API is in the catalog (`docs/prime-reference/catalog/primeng.json` module `selectbutton`; `primevue.json` modules `selectbutton` and `selectbuttonstyle`; `primereact.json` module `selectbutton`).

| Member              | PrimeNG                                                    | PrimeVue                                                                                         | PrimeReact                                                                                               |
| ------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Value binding       | `ngModel` / `formControlName`                              | `modelValue` / `v-model`, `defaultValue`                                                         | `value: any` (controlled) plus `onChange`                                                                |
| `options`           | `any[]`                                                    | `any[]`                                                                                          | `SelectItemOptionsType`                                                                                  |
| `optionLabel`       | `string`                                                   | `string` (declared `string \| ((data) => string)`)                                               | `string`                                                                                                 |
| `optionValue`       | `string`                                                   | `string` (declared `string \| ((data) => any)`)                                                  | `string`                                                                                                 |
| `optionDisabled`    | `string`                                                   | `string` (declared `string \| ((data) => boolean)`)                                              | `string \| ((option) => boolean)`                                                                        |
| `multiple`          | `boolean` (default `false`)                                | `boolean`                                                                                        | `boolean = false`                                                                                        |
| `allowEmpty`        | `boolean = true`                                           | `boolean = true`                                                                                 | `boolean = true`                                                                                         |
| `unselectable`      | `boolean` (setter, inverse of `allowEmpty`)                | N/A                                                                                              | `boolean = true`, deprecated                                                                             |
| `dataKey`           | `string`                                                   | `string`                                                                                         | `string`                                                                                                 |
| ARIA label ref      | `ariaLabelledBy: string`                                   | `ariaLabelledby: string = null`                                                                  | `ariaLabelledBy: string`                                                                                 |
| Size                | `size: 'large' \| 'small' \| undefined` (signal)           | `size: 'small' \| 'large'` (hinted string, default `null`)                                       | N/A                                                                                                      |
| Fluid               | `fluid` (signal, boolean)                                  | `fluid: boolean = null`                                                                          | N/A                                                                                                      |
| Invalid             | `invalid` (signal, `false`)                                | `invalid` (from the editable-holder base)                                                        | `invalid: boolean = false`                                                                               |
| Disabled            | `disabled` (signal, `false`)                               | `disabled`                                                                                       | `disabled: boolean = false`                                                                              |
| Name / required     | `name`, `required` (signals)                               | `name`; forms integration through `formControl`                                                  | N/A (`name` appears only inside the change event target)                                                 |
| Other               | `autofocus`, `tabindex = 0`, `styleClass`                  | N/A                                                                                              | `tabIndex`, `id`, `className`, `style`, `tooltip`, `tooltipOptions`, `children`                          |
| Change event        | `onChange` with `{ originalEvent?, value? }`               | `change` with `{ originalEvent, value }`; also `update:modelValue(value)`, `value-change(value)` | `onChange` with `{ originalEvent, value, stopPropagation, preventDefault, target: { name, id, value } }` |
| Per-option event    | `onOptionClick` with `{ originalEvent?, option?, index? }` | N/A                                                                                              | N/A                                                                                                      |
| Focus / blur events | N/A as outputs                                             | `focus(event)`, `blur(event)` declared in the emits type                                         | N/A                                                                                                      |
| Custom content      | template `item`, context `{ $implicit: option, index }`    | slot `option`, scope `{ option, index }`                                                         | `itemTemplate(item)` returns a node                                                                      |
| Methods             | N/A                                                        | N/A                                                                                              | `focus()`, `getElement(): HTMLDivElement \| null`                                                        |

Behavior worth knowing (all cited to the three source files):

- **Label and value lookup.** PrimeNG and PrimeReact fall back to `option.label` / `option.value` when `optionLabel` / `optionValue` are absent, and fall back to the option itself otherwise. PrimeVue has no such fallback: without `optionLabel` / `optionValue` the option itself is both label and value, so object options always need the two props. PrimeNG's value rule is slightly stranger: setting `optionLabel` without `optionValue` makes the whole option the value (`primeng-21.1.9:packages/primeng/src/selectbutton/selectbutton.ts`, `primevue-4.5.5:packages/primevue/src/selectbutton/SelectButton.vue`, `primereact-10.9.9:components/lib/selectbutton/SelectButton.js`).
- **Per-option disabled flag.** PrimeNG and PrimeReact also read `option.disabled`; PrimeVue only reads the field named by `optionDisabled`.
- **Selection logic.** Clicking a selected option clears it to `null` in single mode, unless clearing is blocked; in multiple mode it removes the value from the array. Equality uses `equals` with `dataKey` as the key only when `optionValue` is not set (PrimeNG, PrimeVue); PrimeReact passes `dataKey` straight to `ObjectUtils.equals`.
- **`allowEmpty` in multiple mode.** PrimeNG and PrimeVue keep at least one value selected when `allowEmpty` is `false`: the last selected button is made non-clickable (`allowEmpty` passed to the `ToggleButton` is `allowEmpty || value?.length !== 1` in PrimeNG; PrimeVue marks the last selected option read-only through `isOptionReadonly`). PrimeReact has no such guard: with `allowEmpty` false (or `unselectable` false) a selected option can never be deselected, in single or multiple mode, so the clear check is `selected && !(unselectable && allowEmpty)`.
- **Event order in PrimeNG.** `onOptionSelect` writes the value, calls the model-change callback, emits `onChange`, then emits `onOptionClick`.
- **PrimeVue wiring.** `change` is emitted after `writeValue(newValue, event)`; `fluid` and `invalid` are not passed down to the buttons, they only affect the root class (`primevue-4.5.5:packages/primevue/src/selectbutton/SelectButton.vue`).
- **PrimeNG unused members.** The `tabindex` input, `focusedIndex`, `changeTabIndexes` and `removeOption` exist in the class but the template does not use them: `tabindex` is not forwarded to the buttons and no arrow-key handler is attached (`primeng-21.1.9:packages/primeng/src/selectbutton/selectbutton.ts`).
- **PrimeReact unknown props.** Props that are not part of `defaultProps` (for example `aria-labelledby`, `data-*`) are forwarded to the root `div` through `getOtherProps` (`primereact-10.9.9:components/lib/selectbutton/SelectButtonBase.js`, `primereact-10.9.9:components/lib/componentbase/ComponentBase.js`, `primereact-10.9.9:components/lib/utils/ObjectUtils.js`). `ariaLabelledBy` is declared in the types but is not in `defaultProps` and no selectbutton file maps it to `aria-labelledby`, so it is forwarded as a literal `ariaLabelledBy` attribute rather than the ARIA attribute.

## 6. Usage guidance

- **Import** — bring in the module or component from the framework entry point (`primeng-21.1.9:apps/showcase/doc/selectbutton/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/selectbutton/ImportDoc.vue`, `primereact-10.9.9:components/doc/selectbutton/importdoc.js`).
- **Basic** — bind a value and give a list of options. PrimeNG and PrimeVue demos use `ngModel` / `v-model`; PrimeReact is controlled with `value` and `onChange={(e) => setValue(e.value)}`. Primitive options (a string array) need no `optionLabel` / `optionValue`, and PrimeReact's doc says the option object itself becomes the value when it has no `value` field (`primeng-21.1.9:apps/showcase/doc/selectbutton/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/selectbutton/BasicDoc.vue`, `primereact-10.9.9:components/doc/selectbutton/basicdoc.js`).
- **Multiple** — set `multiple` and bind an array; single mode is the default (`primeng-21.1.9:apps/showcase/doc/selectbutton/multiple-doc.ts`, `primevue-4.5.5:apps/showcase/doc/selectbutton/MultipleDoc.vue`, `primereact-10.9.9:components/doc/selectbutton/multipledoc.js`). The PrimeNG demo types its model as `number` although multiple mode needs an array.
- **Template** — render custom button content (the demos use alignment icons) with the `item` template, the `option` slot or `itemTemplate`; keep `optionLabel` set, since the label still feeds the accessible name (`primeng-21.1.9:apps/showcase/doc/selectbutton/template-doc.ts`, `primevue-4.5.5:apps/showcase/doc/selectbutton/TemplateDoc.vue`, `primereact-10.9.9:components/doc/selectbutton/templatedoc.js`).
- **Sizes** — `size="small"` and `size="large"` are alternatives to the base size, PrimeNG and PrimeVue only (`primeng-21.1.9:apps/showcase/doc/selectbutton/sizes-doc.ts`, `primevue-4.5.5:apps/showcase/doc/selectbutton/SizesDoc.vue`).
- **Fluid** — `fluid` stretches the control to the container width, PrimeNG and PrimeVue only (`primeng-21.1.9:apps/showcase/doc/selectbutton/fluid-doc.ts`, `primevue-4.5.5:apps/showcase/doc/selectbutton/FluidDoc.vue`).
- **Invalid** — `invalid` marks failed validation; the demos derive it from an empty value (`primeng-21.1.9:apps/showcase/doc/selectbutton/invalid-doc.ts`, `primevue-4.5.5:apps/showcase/doc/selectbutton/InvalidDoc.vue`, `primereact-10.9.9:components/doc/selectbutton/invaliddoc.js`).
- **Disabled** — `disabled` locks the whole control; `optionDisabled` names the option field that disables a single button (`primeng-21.1.9:apps/showcase/doc/selectbutton/disabled-doc.ts`, `primevue-4.5.5:apps/showcase/doc/selectbutton/DisabledDoc.vue`, `primereact-10.9.9:components/doc/selectbutton/disableddoc.js`).
- **Forms** — PrimeNG shows template-driven forms (`#model="ngModel"`, `required`, `[invalid]` after touch or submit, a `p-message` and `MessageService` with a toast) and reactive forms (`formControlName` with an `isInvalid` helper); PrimeVue shows `@primevue/forms` with `name="selection"`, a zod resolver and a `Message`; PrimeReact has no forms demo (`primeng-21.1.9:apps/showcase/doc/selectbutton/templatedrivenforms-doc.ts`, `primeng-21.1.9:apps/showcase/doc/selectbutton/reactiveforms-doc.ts`, `primevue-4.5.5:apps/showcase/doc/selectbutton/FormsDoc.vue`).
- **Accessibility** — see section 7 (`primeng-21.1.9:apps/showcase/doc/selectbutton/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/selectbutton/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/selectbutton/accessibilitydoc.js`).
- **Pass Through** — PrimeNG and PrimeVue ship a PT viewer fed by `getPTOptions('SelectButton')`; PrimeReact ships a wireframe image page (`primeng-21.1.9:apps/showcase/doc/selectbutton/pt/PTViewer.ts`, `primevue-4.5.5:apps/showcase/doc/selectbutton/pt/PTViewer.vue`, `primereact-10.9.9:components/doc/selectbutton/pt/wireframe.js`).
- **Theming** — PrimeVue and PrimeReact have a Tailwind page that only points to the presets project; PrimeReact also has a "styled" page whose class table is empty (`primevue-4.5.5:apps/showcase/doc/selectbutton/theming/TailwindDoc.vue`, `primereact-10.9.9:components/doc/selectbutton/theming/tailwinddoc.js`, `primereact-10.9.9:components/doc/selectbutton/theming/styleddoc.js`).

No services or providers are required. The PrimeNG forms demos additionally use `MessageService` for a toast, which is demo code, not a component requirement.

## 7. Accessibility

- **Roles.** The container has `role="group"` in all three. Each option button has `role="button"` with `aria-pressed` reflecting selection (PrimeNG `ToggleButton` host, PrimeVue native `<button>` with `aria-pressed`, PrimeReact `div role="button"` with `aria-pressed`) (`primeng-21.1.9:packages/primeng/src/selectbutton/selectbutton.ts`, `primeng-21.1.9:packages/primeng/src/togglebutton/togglebutton.ts`, `primevue-4.5.5:packages/primevue/src/togglebutton/ToggleButton.vue`, `primereact-10.9.9:components/lib/selectbutton/SelectButtonItem.js`).
- **Naming.** The group name comes from `aria-labelledby` (`ariaLabelledBy` in PrimeNG and PrimeReact, `ariaLabelledby` in PrimeVue). Each button's accessible name is its option label: PrimeReact sets `aria-label` to the label directly, and the docs recommend always defining a label even for icon-only content (`primeng-21.1.9:apps/showcase/doc/selectbutton/accessibility-doc.ts`, `primereact-10.9.9:components/doc/selectbutton/accessibilitydoc.js`, `primereact-10.9.9:components/lib/selectbutton/SelectButtonItem.js`).
- **Disabled state.** PrimeReact sets `aria-disabled` on the item; PrimeVue passes `disabled` to the native `<button>`; PrimeNG's `ToggleButton` host sets `data-p-disabled` and `tabindex` (`primevue-4.5.5:packages/primevue/src/togglebutton/ToggleButton.vue`, `primeng-21.1.9:packages/primeng/src/togglebutton/togglebutton.ts`). No framework sets `aria-invalid` on the group; invalidity is a class and an outline only.
- **Keyboard, per the showcase docs.** All three docs list Tab (moves focus to the buttons) and Space (toggles the button); the PrimeVue doc adds Shift+Tab and says the behavior is derived from native handling of checkboxes in a group (`primeng-21.1.9:apps/showcase/doc/selectbutton/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/selectbutton/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/selectbutton/accessibilitydoc.js`).
- **Keyboard, per the source.**
  - PrimeNG: every `ToggleButton` is its own tab stop; Enter and Space both toggle (and call `preventDefault`); no arrow-key handling, because the roving-tabindex helper in `SelectButton` is not wired (`primeng-21.1.9:packages/primeng/src/togglebutton/togglebutton.ts`, `primeng-21.1.9:packages/primeng/src/selectbutton/selectbutton.ts`).
  - PrimeVue: native `<button>` elements, so each is a tab stop and Enter or Space fire a click (`primevue-4.5.5:packages/primevue/src/togglebutton/ToggleButton.vue`).
  - PrimeReact: roving tabindex (only the focused item has `tabindex` `0`, the others `-1`); Space selects; ArrowRight / ArrowDown move to the next item and ArrowLeft / ArrowUp to the previous, both wrapping around; Enter is not handled on the `div` (`primereact-10.9.9:components/lib/selectbutton/SelectButtonItem.js`). The doc table does not mention the arrow keys.
- **Doc wording issue.** The PrimeNG doc refers to an `ariaLabel` property and the PrimeVue doc has the typo "checkboxs"; neither affects the API.

## 8. Theming

- **Style classes.** Root: `p-selectbutton p-component`, plus `p-invalid` and `p-selectbutton-fluid` (PrimeNG and PrimeVue) (`primeng-21.1.9:packages/primeng/src/selectbutton/style/selectbuttonstyle.ts`, `primevue-4.5.5:packages/primevue/src/selectbutton/style/SelectButtonStyle.js`). The catalog lists a single class, `p-selectbutton`: PrimeNG `modules.selectbutton.style.classes`, and the PrimeVue `SelectButtonClasses` enum with one member `root` (`docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`). The two modifier classes are applied but not enumerated. Option buttons carry the `ToggleButton` classes (see the ToggleButton record).
- **PrimeReact classes.** Root `p-selectbutton p-button-group p-component` plus `p-invalid`; item `p-button p-component` plus `p-highlight` (selected), `p-disabled`, `p-focus`; label `p-button-label p-c` (`primereact-10.9.9:components/lib/selectbutton/SelectButtonBase.js`). The styled-mode doc page for these classes has an empty table (`primereact-10.9.9:components/doc/selectbutton/theming/styleddoc.js`).
- **Pass-through sections.** PrimeNG `host`, `root`, `pcToggleButton`; PrimeVue `root`, `pcToggleButton`, `hooks`; PrimeReact `root`, `button`, `label`, `tooltip`, `hooks` (see section 4). PrimeNG also exposes a global key `selectButton` in its PrimeNG config pass-through type (`primeng-21.1.9:packages/primeng/src/config/primeng.types.ts`).
- **Structural CSS** (`@primeuix/styles-2.0.3:dist/selectbutton/index.mjs`, used by PrimeNG and PrimeVue):
  - The root is `inline-flex`, `user-select: none`, bottom-aligned, with `border-radius` from the root token.
  - Inner `.p-togglebutton` elements lose their own radius and the left border (`border-width: 1px 1px 1px 0`) so the buttons join up; the first child restores the inline-start border and start radii and the last child restores the end radii, using logical properties, so RTL is handled.
  - A focus-visible button gets `position: relative; z-index: 1` so its ring is not clipped.
  - `.p-selectbutton.p-invalid` draws a `1px` solid outline in the invalid border color token.
  - `.p-selectbutton-fluid` is `width: 100%` and its buttons get `flex: 1 1 0`.
  - PrimeNG appends `.p-selectbutton.ng-invalid.ng-dirty` with the same outline, so Angular form state alone triggers the invalid look.
- **Design tokens.** Only two exist, both under the `root` section (`@primeuix/themes-2.0.3:types/selectbutton/index.d.ts`, `@primeuix/themes-2.0.3:tokens/index.mjs`): `borderRadius` (`--p-selectbutton-border-radius`) and `invalidBorderColor` (`--p-selectbutton-invalid-border-color`). The Aura preset points them at `{form.field.border.radius}` and, in both light and dark color schemes, `{form.field.invalid.border.color}` (`@primeuix/themes-2.0.3:dist/aura/selectbutton/index.mjs`). Presets also exist for lara, material and nora (`@primeuix/themes-2.0.3:dist/lara/selectbutton/index.mjs`, `@primeuix/themes-2.0.3:dist/material/selectbutton/index.mjs`, `@primeuix/themes-2.0.3:dist/nora/selectbutton/index.mjs`). The button look (colors, sizes, checked state) comes from the `togglebutton` tokens, not from SelectButton tokens.
- **PrimeReact.** No `@primeuix`; tokens are N/A. It registers its style with `useHandleStyle(..., { name: 'selectbutton', styled: true })`, which skips the per-component style string because the structural CSS for SelectButton is already in the common style; the visual rules sit in the shipped theme files, for example `.p-selectbutton .p-button` and `.p-highlight` in `public/themes/lara-light-blue/theme.css` (`primereact-10.9.9:components/lib/selectbutton/SelectButton.js`, `docs/prime-reference/foundations/primereact/architecture.md`, `primereact-10.9.9:public/themes/lara-light-blue/theme.css`).

## 9. Relationships

- **Embeds.** `ToggleButton` for every option in PrimeNG and PrimeVue (`primeng-21.1.9:packages/primeng/src/selectbutton/selectbutton.ts`, `primevue-4.5.5:packages/primevue/src/selectbutton/SelectButton.vue`). PrimeReact embeds `Ripple` and optionally `Tooltip`, not `ToggleButton` (`primereact-10.9.9:components/lib/selectbutton/SelectButton.js`, `primereact-10.9.9:components/lib/selectbutton/SelectButtonItem.js`).
- **Embedded by.** The PrimeNG `Table` imports `SelectButtonModule` (`primeng-21.1.9:packages/primeng/src/table/table.ts`); no other Prime component embeds it in the reviewed sources. It is also the documented replacement for PrimeVue's removed `DataViewLayoutOptions` (`docs/prime-reference/foundations/primevue.md`).
- **Related components.** ToggleButton (single two-state button, the building block), ToggleSwitch (two-state switch), Checkbox (several independent booleans, the multiple-mode alternative), RadioButton (single choice, radio-style), Select, MultiSelect and Listbox (same single/multiple choice over a longer list), Button and SplitButton (visually similar button styling, PrimeReact reuses `p-button`).
- **Shared base.** PrimeNG and PrimeVue derive from their `BaseEditableHolder`, shared with ToggleSwitch, Checkbox and other editable inputs (`primeng-21.1.9:packages/primeng/src/baseeditableholder/baseeditableholder.ts`, `primevue-4.5.5:packages/core/src/baseeditableholder/BaseEditableHolder.vue`).
- **Cross-category.** Form component embedded by a Data component (Table in PrimeNG) and built from another Form component (ToggleButton); it depends on button styling in PrimeReact.

## 10. Dependencies

- PrimeNG: `@angular/common`, `@angular/core`, `@angular/forms` (`NG_VALUE_ACCESSOR`, `FormsModule`), `@primeuix/utils` (`equals`, `resolveFieldData`), `primeng/api` (`PrimeTemplate`, `SharedModule`), `primeng/basecomponent`, `primeng/baseeditableholder`, `primeng/bind`, `primeng/base` (`BaseStyle`), `primeng/togglebutton`, `@primeuix/styles/selectbutton` (`primeng-21.1.9:packages/primeng/src/selectbutton/selectbutton.ts`, `primeng-21.1.9:packages/primeng/src/selectbutton/style/selectbuttonstyle.ts`).
- PrimeVue: `@primevue/core/baseeditableholder`, `@primevue/core/base/style`, `@primeuix/utils` (`cn`), `@primeuix/utils/object` (`equals`, `resolveFieldData`), `primevue/togglebutton`, `primevue/ripple` (imported and registered as a directive but not used in the template), `@primeuix/styles/selectbutton`, `primevue/selectbutton/style` (`primevue-4.5.5:packages/primevue/src/selectbutton/SelectButton.vue`, `primevue-4.5.5:packages/primevue/src/selectbutton/BaseSelectButton.vue`, `primevue-4.5.5:packages/primevue/src/selectbutton/style/SelectButtonStyle.js`).
- PrimeReact: `../api/Api` (`PrimeReactContext`), `../componentbase/ComponentBase` (`useHandleStyle`), `../hooks/Hooks` (`useMergeProps`), `../tooltip/Tooltip`, `../ripple/Ripple`, `../utils/Utils` (`DomHandler`, `ObjectUtils`, `classNames`) (`primereact-10.9.9:components/lib/selectbutton/SelectButton.js`, `primereact-10.9.9:components/lib/selectbutton/SelectButtonItem.js`, `primereact-10.9.9:components/lib/selectbutton/SelectButtonBase.js`).
- External npm packages: none beyond the framework. The PrimeVue forms demo uses `@primevue/forms` and `zod`, which are demo-only (`primevue-4.5.5:apps/showcase/doc/selectbutton/FormsDoc.vue`).

## 11. Framework differences

| Aspect                   | PrimeNG                                                 | PrimeVue                                                  | PrimeReact                                         |
| ------------------------ | ------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------- |
| Option button            | `ToggleButton` component                                | `ToggleButton` component                                  | Own `div role="button"` with `p-button` classes    |
| Root element             | `<p-selectbutton>` host                                 | `div`                                                     | `div` (plus optional `Tooltip` sibling)            |
| Value binding            | `ngModel` / `formControlName`                           | `v-model`, `@primevue/forms`                              | Controlled `value` + `onChange`                    |
| Label/value fallback     | `option.label` / `option.value` read automatically      | Option itself; needs `optionLabel` / `optionValue`        | `option.label` / `option.value` read automatically |
| `optionDisabled`         | field name; also `option.disabled`                      | field name only                                           | field name or function; also `option.disabled`     |
| Clear control            | `allowEmpty` and `unselectable` (not deprecated)        | `allowEmpty`                                              | `allowEmpty`; `unselectable` deprecated            |
| `allowEmpty` = false     | Single: no deselect. Multiple: last selected stays on   | Single: no deselect. Multiple: last selected stays on     | Nothing selected can be deselected, in either mode |
| Size / fluid             | `size`, `fluid`                                         | `size`, `fluid`                                           | N/A                                                |
| Change event             | `onChange` `{ originalEvent, value }` + `onOptionClick` | `change` `{ originalEvent, value }` + `update:modelValue` | `onChange` with form-style event incl. `target`    |
| Custom content           | `item` template                                         | `option` slot                                             | `itemTemplate`                                     |
| Roles / keyboard         | Each button a tab stop; Enter and Space                 | Native buttons; Enter and Space via click                 | Roving tabindex; Space and arrow keys; no Enter    |
| Invalid indication       | Class `p-invalid`, plus `ng-invalid.ng-dirty` outline   | Class `p-invalid` (source note `@todo: check`)            | Class `p-invalid`                                  |
| Style classes enumerated | `p-selectbutton` only                                   | `p-selectbutton` only                                     | Doc table empty                                    |
| Tooltip                  | N/A                                                     | N/A                                                       | `tooltip`, `tooltipOptions`                        |
| Imperative API           | N/A                                                     | N/A                                                       | `focus()`, `getElement()`                          |
| Styling source           | `@primeuix/styles` + 2 tokens                           | `@primeuix/styles` + 2 tokens                             | Theme CSS files; no tokens                         |
| PT keys                  | `host`, `root`, `pcToggleButton`                        | `root`, `pcToggleButton`, `hooks`                         | `root`, `button`, `label`, `tooltip`, `hooks`      |
| Dead / unwired members   | `tabindex`, `changeTabIndexes`, `focusedIndex`          | `ripple` directive registered, unused                     | `ariaLabelledBy` not mapped to `aria-labelledby`   |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/selectbutton/selectbutton.ts`
- `primeng-21.1.9:packages/primeng/src/selectbutton/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/selectbutton/style/selectbuttonstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/selectbutton/selectbutton.types.ts`
- `primeng-21.1.9:packages/primeng/src/togglebutton/togglebutton.ts`
- `primeng-21.1.9:packages/primeng/src/baseeditableholder/baseeditableholder.ts`
- `primeng-21.1.9:packages/primeng/src/table/table.ts`
- `primeng-21.1.9:packages/primeng/src/config/primeng.types.ts`
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primeng-21.1.9:apps/showcase/doc/selectbutton/import-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/selectbutton/basic-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/selectbutton/multiple-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/selectbutton/template-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/selectbutton/sizes-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/selectbutton/fluid-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/selectbutton/invalid-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/selectbutton/disabled-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/selectbutton/templatedrivenforms-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/selectbutton/reactiveforms-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/selectbutton/accessibility-doc.ts`
- `primeng-21.1.9:apps/showcase/doc/selectbutton/pt/PTViewer.ts`
- `primevue-4.5.5:packages/primevue/src/selectbutton/SelectButton.vue`
- `primevue-4.5.5:packages/primevue/src/selectbutton/BaseSelectButton.vue`
- `primevue-4.5.5:packages/primevue/src/selectbutton/SelectButton.d.ts`
- `primevue-4.5.5:packages/primevue/src/selectbutton/package.json`
- `primevue-4.5.5:packages/primevue/src/selectbutton/style/SelectButtonStyle.js`
- `primevue-4.5.5:packages/primevue/src/togglebutton/ToggleButton.vue`
- `primevue-4.5.5:packages/primevue/src/index.js`
- `primevue-4.5.5:packages/core/src/baseeditableholder/BaseEditableHolder.vue`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primevue-4.5.5:apps/showcase/doc/selectbutton/ImportDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/selectbutton/BasicDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/selectbutton/MultipleDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/selectbutton/TemplateDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/selectbutton/SizesDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/selectbutton/FluidDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/selectbutton/InvalidDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/selectbutton/DisabledDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/selectbutton/FormsDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/selectbutton/AccessibilityDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/selectbutton/pt/PTViewer.vue`
- `primevue-4.5.5:apps/showcase/doc/selectbutton/theming/TailwindDoc.vue`
- `primereact-10.9.9:components/lib/selectbutton/SelectButton.js`
- `primereact-10.9.9:components/lib/selectbutton/SelectButtonItem.js`
- `primereact-10.9.9:components/lib/selectbutton/SelectButtonBase.js`
- `primereact-10.9.9:components/lib/selectbutton/selectbutton.d.ts`
- `primereact-10.9.9:components/lib/selectbutton/package.json`
- `primereact-10.9.9:components/lib/primereact.all.js`
- `primereact-10.9.9:components/lib/componentbase/ComponentBase.js`
- `primereact-10.9.9:components/lib/utils/ObjectUtils.js`
- `primereact-10.9.9:components/layout/menu.json`
- `primereact-10.9.9:public/themes/lara-light-blue/theme.css`
- `primereact-10.9.9:components/doc/selectbutton/importdoc.js`
- `primereact-10.9.9:components/doc/selectbutton/basicdoc.js`
- `primereact-10.9.9:components/doc/selectbutton/multipledoc.js`
- `primereact-10.9.9:components/doc/selectbutton/templatedoc.js`
- `primereact-10.9.9:components/doc/selectbutton/disableddoc.js`
- `primereact-10.9.9:components/doc/selectbutton/invaliddoc.js`
- `primereact-10.9.9:components/doc/selectbutton/accessibilitydoc.js`
- `primereact-10.9.9:components/doc/selectbutton/pt/wireframe.js`
- `primereact-10.9.9:components/doc/selectbutton/theming/styleddoc.js`
- `primereact-10.9.9:components/doc/selectbutton/theming/tailwinddoc.js`
- `@primeuix/styles-2.0.3:dist/selectbutton/index.mjs`
- `@primeuix/themes-2.0.3:types/selectbutton/index.d.ts`
- `@primeuix/themes-2.0.3:tokens/index.mjs`
- `@primeuix/themes-2.0.3:dist/aura/selectbutton/index.mjs`
- `@primeuix/themes-2.0.3:dist/lara/selectbutton/index.mjs`
- `@primeuix/themes-2.0.3:dist/material/selectbutton/index.mjs`
- `@primeuix/themes-2.0.3:dist/nora/selectbutton/index.mjs`
- Study files: `docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`, `docs/prime-reference/catalog/primereact.json`, `docs/prime-reference/foundations/primevue.md`, `docs/prime-reference/foundations/primereact/architecture.md`, `docs/prime-reference/foundations/primereact/notes-for-component-records.md`
