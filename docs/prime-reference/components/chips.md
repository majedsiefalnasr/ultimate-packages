# Chips

**Category:** Form · **Frameworks:** PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Chips is a free-text tags input: the user types a value and presses Enter (or a separator key, or blurs the field when enabled) to turn it into a removable chip, and the model is an array of strings. This record is centred on the PrimeReact `Chips` component, which is the only stable, documented implementation of the pattern in the 2026 baseline. PrimeVue still ships `Chips` and `InputChips` only as deprecated compatibility wrappers that point to [AutoComplete](autocomplete.md) in multiple mode without typeahead, and PrimeNG removed Chips entirely in favour of the same AutoComplete mode.

## 2. Names & status

- Canonical name: **Chips** (file `chips`). Not to be confused with the display-only **Chip** component.
- PrimeReact: `Chips`; stable, documented, not deprecated (`primereact-10.9.9:components/lib/chips/chips.d.ts`, `primereact-10.9.9:pages/chips/index.js`); listed in the Form menu (`primereact-10.9.9:components/layout/menu.json`).
- PrimeVue alias chain: `Chips` → `InputChips` → `AutoComplete` (`multiple`, `typeahead=false`).
  - `Chips` extends `InputChips` and logs "Deprecated since v4. Use InputChips component instead." on mount; its type is tagged `@deprecated since v4` and all its interfaces extend the InputChips ones (`primevue-4.5.5:packages/primevue/src/chips/Chips.vue`, `primevue-4.5.5:packages/primevue/src/chips/Chips.d.ts`). Its style module only registers the name `chips` (`primevue-4.5.5:packages/primevue/src/chips/style/ChipsStyle.js`).
  - `InputChips` is a full implementation but logs "Deprecated since v4. Use AutoComplete component instead with its typeahead property." on mount (`primevue-4.5.5:packages/primevue/src/inputchips/InputChips.vue`).
  - The v4 migration guide lists Chips as a compatible-but-deprecated component to be replaced by AutoComplete with `multiple` enabled and `typeahead` disabled (`primevue-4.5.5:apps/showcase/doc/guides/migration/v4/changes/CompatibleDoc.vue`).
  - Neither has a showcase page or Form menu entry (`primevue-4.5.5:apps/showcase/assets/menu/menu.json`), but both remain in the component metadata list and catalog (`primevue-4.5.5:packages/metadata/src/components/index.ts`, `docs/prime-reference/catalog/primevue.json`).
- PrimeNG: N/A — not shipped in primeng-21.1.9. There is no `chips` folder under `packages/primeng/src` (only `chip`, `primeng-21.1.9:packages/primeng/src/chip/public_api.ts`); the v19 deprecation notes say to use AutoComplete with multiple enabled and typeahead disabled, and the v20 removals list records Chips as deprecated in v18 and removed (`primeng-21.1.9:apps/showcase/doc/migration/v19/deprecatedcomponentsdoc.ts`, `primeng-21.1.9:apps/showcase/doc/migration/v20/removalsdoc.ts`). The PrimeNG replacement is documented in the AutoComplete "Chips" demos (`primeng-21.1.9:apps/showcase/doc/autocomplete/basic-chips-doc.ts`).

## 3. Per framework

### PrimeNG 21.1.9

N/A — not shipped in primeng-21.1.9 (see §2). Use [AutoComplete](autocomplete.md) with `multiple`, `typeahead=false` and optionally `addOnBlur`, `addOnTab`, `separator`.

### PrimeVue 4.5.5

- Imports: `primevue/chips` (deprecated wrapper) and `primevue/inputchips` (deprecated implementation); no import doc in the showcase.
- Source: `primevue-4.5.5:packages/primevue/src/inputchips/InputChips.vue`, `primevue-4.5.5:packages/primevue/src/inputchips/BaseInputChips.vue` (extends `BaseComponent`, not `BaseInput`), types `primevue-4.5.5:packages/primevue/src/inputchips/InputChips.d.ts`, style `primevue-4.5.5:packages/primevue/src/inputchips/style/InputChipsStyle.js`; wrapper `primevue-4.5.5:packages/primevue/src/chips/Chips.vue`.

### PrimeReact 10.9.9

- Import: `import { Chips } from 'primereact/chips'` (`primereact-10.9.9:components/doc/chips/importdoc.js`).
- Source: `primereact-10.9.9:components/lib/chips/Chips.js` (a `React.memo(React.forwardRef(...))` component), base `primereact-10.9.9:components/lib/chips/ChipsBase.js` (`defaultProps` with `__TYPE: 'Chips'`, CSS and classes), types `primereact-10.9.9:components/lib/chips/chips.d.ts`.

## 4. Anatomy

PrimeReact (`ChipsPassThroughOptions`, `primereact-10.9.9:components/lib/chips/chips.d.ts`; wireframe `primereact-10.9.9:components/doc/chips/pt/wireframe.js`):

- **root** — wrapper `div`; click focuses the input.
- **container** — `ul` styled as an input (`p-inputtext`), role `listbox`.
- **token** — one `li` per value, containing **label** (`span`) and, when removable, **removeTokenIcon** (default `TimesCircleIcon`).
- **inputToken** — trailing `li` holding the **input**.
- **tooltip** — optional Tooltip bound to the container.

PrimeVue InputChips (PT keys in `primevue-4.5.5:packages/primevue/src/inputchips/InputChips.d.ts`): root, input (the `ul`), chipItem, pcChip (an embedded `Chip`), chipIcon, inputItem, inputItemField.

## 5. API highlights

PrimeReact `ChipsProps` (defaults from `primereact-10.9.9:components/lib/chips/ChipsBase.js` and the catalog):

- **Value:** `value: string[]`; `onChange(e: ChipsChangeEvent)` with `e.value` (the new array) and a `target` carrying `name`, `id`, `value`.
- **Adding:** Enter adds trimmed, non-empty text; `separator: string` adds on that key and splits pasted text (escaped `\n`, `\r`, `\t` are translated); `addOnBlur = false`; `allowDuplicate = true`; `max: number` caps the count and blocks further typing; `onAdd(e: ChipsAddEvent)` can return `false` to veto the addition.
- **Removing:** `removable: boolean | ((options) => boolean) = true` (per-chip via function); `removeIcon: IconType<ChipsProps>`; `onRemove(e: ChipsRemoveEvent)`.
- **Input behaviour:** `keyfilter: KeyFilterType` (same presets as [KeyFilter](keyfilter.md), applied to typing and paste); `placeholder`; `readOnly = false`; `disabled = false`; `autoFocus = false`; `inputId`, `inputRef`, `name`.
- **Rendering:** `itemTemplate(item) => ReactNode` replaces chip label content.
- **States:** `invalid = false`, `variant: 'filled' | 'outlined' = 'outlined'`.
- **Other:** `tooltip`, `tooltipOptions`, `onFocus`, `onBlur`, `onKeyDown`, `pt`, `ptOptions`, `unstyled`; methods `focus()`, `getElement()`, `getInput()`.

PrimeVue InputChips (`primevue-4.5.5:packages/primevue/src/inputchips/InputChips.d.ts`): `modelValue: any[]`, `max`, `separator`, `addOnBlur = false`, `allowDuplicate = true`, `placeholder`, `variant`, `invalid`, `disabled`, `inputId`, `inputClass`, `inputStyle`, `inputProps`, `ariaLabel`, `ariaLabelledby`, `chipIcon`; emits `update:modelValue`, `add`, `remove`, `focus`, `blur`; slots `chip`, `chipicon`, `removetokenicon` (deprecated since v4.0, use `chipicon`). No `keyfilter`, `removable`, `readOnly` or veto-on-add.

## 6. Usage guidance

PrimeReact showcase sections (`primereact-10.9.9:pages/chips/index.js`):

- Basic: bind an array value and `onChange` (`primereact-10.9.9:components/doc/chips/basicdoc.js`).
- Separator: add a chip when a delimiter such as a comma is typed (`primereact-10.9.9:components/doc/chips/separatordoc.js`).
- Template: custom chip content via `itemTemplate` (`primereact-10.9.9:components/doc/chips/templatedoc.js`).
- KeyFilter: restrict the characters that can be typed (`primereact-10.9.9:components/doc/chips/keyfilterdoc.js`).
- Float label: use within [FloatLabel](floatlabel.md) (`primereact-10.9.9:components/doc/chips/floatlabeldoc.js`).
- Filled: `variant="filled"` (`primereact-10.9.9:components/doc/chips/filleddoc.js`).
- Invalid: `invalid` state styling (`primereact-10.9.9:components/doc/chips/invaliddoc.js`).
- Disabled: `disabled` prevents adding and removing (`primereact-10.9.9:components/doc/chips/disableddoc.js`).
- PrimeVue/PrimeNG: no Chips showcase; the equivalent guidance lives on the AutoComplete pages (`primevue-4.5.5:apps/showcase/doc/autocomplete/MultipleDoc.vue`, `primeng-21.1.9:apps/showcase/doc/autocomplete/basic-chips-doc.ts`, `primeng-21.1.9:apps/showcase/doc/autocomplete/advanced-chips-doc.ts`).

## 7. Accessibility

- PrimeReact (`primereact-10.9.9:components/lib/chips/Chips.js`, `primereact-10.9.9:components/doc/chips/accessibilitydoc.js`): the container `ul` has `role="listbox"`, `aria-orientation="horizontal"`, `tabIndex=-1`, `aria-activedescendant` while a chip is focused; each chip `li` has `role="option"`, `aria-label` set to its value, `aria-selected="true"`, `aria-setsize`, `aria-posinset`; the remove icon is `aria-hidden`. The label is provided via `inputId` + `<label>`, or `aria-label` / `aria-labelledby` passed through.
- Source/type mismatch: the d.ts declares `ariaLabelledBy` (default `null`), but the component reads `props.ariaLabelledby` and `props.ariaLabel`, so the declared prop is not applied to the listbox.
- Keyboard: in the input, Enter adds, Backspace on an empty input removes the last chip, Left Arrow on an empty input moves focus to the chips; on the chip list Left/Right Arrow move between chips and Backspace removes the focused chip.
- PrimeVue InputChips mirrors this structure (listbox `ul`, option `li` per chip; the trailing input `li` is also given `role="option"`) and keyboard map (`primevue-4.5.5:packages/primevue/src/inputchips/InputChips.vue`).

## 8. Theming

- PrimeReact classes (`primereact-10.9.9:components/lib/chips/ChipsBase.js`, documented in `primereact-10.9.9:components/doc/chips/theming/styleddoc.js`): root `p-chips p-component p-inputwrapper` with `p-inputwrapper-filled`, `p-inputwrapper-focus`, `p-disabled`, `p-invalid`, `p-focus`; container `p-inputtext p-chips-multiple-container` (+ `p-variant-filled`); `p-chips-token` (+ `p-focus`), `p-chips-token-label`, `p-chips-token-icon`, `p-chips-input-token`. Structural CSS is injected from `ChipsBase.js` in the `primereact` layer; Tailwind preset guidance in `primereact-10.9.9:components/doc/chips/theming/tailwinddoc.js`. Design tokens N/A.
- PrimeVue InputChips: classes `p-inputchips`, `p-inputchips-input`, `p-inputchips-chip-item`, `p-inputchips-chip`, `p-inputchips-chip-icon`, `p-inputchips-input-item` (from `docs/prime-reference/catalog/primevue.json`); style module `@primeuix/styles-2.0.3:dist/inputchips/index.mjs`; tokens `@primeuix/themes-2.0.3:types/inputchips/index.d.ts` with sections `root` (field colours, padding, radius, `focusRing`, `transitionDuration`) and `chip` (`borderRadius`, `focusBackground`, `color`); Aura values `@primeuix/themes-2.0.3:dist/aura/inputchips/index.mjs`. The `chips` wrapper has no style of its own.
- PrimeNG: N/A — not shipped.

## 9. Relationships

- Replacement: [AutoComplete](autocomplete.md) `multiple` + `typeahead=false` (PrimeNG, PrimeVue).
- Builds on: [KeyFilter](keyfilter.md) (PrimeReact `keyfilter`), Tooltip, Chip (PrimeVue InputChips embeds `Chip`; PrimeReact renders its own token markup).
- Wrapped by: [FloatLabel](floatlabel.md); styled like [InputText](inputtext.md) through the shared `p-inputtext` container class (PrimeReact).
- Not related to the display-only Chip component beyond styling.

## 10. Dependencies

- PrimeReact: `../api/Api` (`PrimeReactContext`), `../componentbase/ComponentBase` (`useHandleStyle`), `../hooks/Hooks` (`useMergeProps`, `useMountEffect`), `../icons/timescircle`, `../keyfilter/KeyFilter`, `../tooltip/Tooltip`, `../utils/Utils` (`classNames`, `DomHandler`, `IconUtils`, `ObjectUtils`).
- PrimeVue: `@primevue/core/basecomponent`, `primevue/chip`, `primevue/inputchips/style` (→ `@primeuix/styles/inputchips`).
- No external npm dependencies.

## 11. Framework differences

| Aspect             | PrimeNG                                     | PrimeVue                                          | PrimeReact                      |
| ------------------ | ------------------------------------------- | ------------------------------------------------- | ------------------------------- |
| Component          | N/A — removed in v20; use AutoComplete      | `Chips` → `InputChips` (both deprecated since v4) | `Chips` (stable)                |
| Showcase           | AutoComplete "Chips" demos                  | none                                              | `pages/chips`                   |
| Model              | AutoComplete `multiple` array               | `modelValue: any[]`                               | `value: string[]`               |
| Add triggers       | Enter, `addOnBlur`, `addOnTab`, `separator` | Enter, `addOnBlur`, `separator`                   | Enter, `addOnBlur`, `separator` |
| Veto add           | —                                           | —                                                 | `onAdd` returning `false`       |
| Per-chip removable | —                                           | —                                                 | `removable` function            |
| Key filtering      | —                                           | —                                                 | `keyfilter`                     |
| Chip rendering     | AutoComplete `selecteditem` template        | embedded `Chip`, `chip` slot                      | own token `li`, `itemTemplate`  |
| Design tokens      | autocomplete tokens                         | `inputchips` tokens                               | N/A (theme CSS)                 |

## 12. Sources

- `primereact-10.9.9:components/lib/chips/Chips.js`, `primereact-10.9.9:components/lib/chips/ChipsBase.js`, `primereact-10.9.9:components/lib/chips/chips.d.ts`, `primereact-10.9.9:components/layout/menu.json`
- `primereact-10.9.9:pages/chips/index.js`, `primereact-10.9.9:components/doc/chips/importdoc.js`, `primereact-10.9.9:components/doc/chips/basicdoc.js`, `primereact-10.9.9:components/doc/chips/separatordoc.js`, `primereact-10.9.9:components/doc/chips/templatedoc.js`, `primereact-10.9.9:components/doc/chips/keyfilterdoc.js`, `primereact-10.9.9:components/doc/chips/floatlabeldoc.js`, `primereact-10.9.9:components/doc/chips/filleddoc.js`, `primereact-10.9.9:components/doc/chips/invaliddoc.js`, `primereact-10.9.9:components/doc/chips/disableddoc.js`, `primereact-10.9.9:components/doc/chips/accessibilitydoc.js`, `primereact-10.9.9:components/doc/chips/pt/wireframe.js`, `primereact-10.9.9:components/doc/chips/theming/styleddoc.js`, `primereact-10.9.9:components/doc/chips/theming/tailwinddoc.js`
- `primevue-4.5.5:packages/primevue/src/chips/Chips.vue`, `primevue-4.5.5:packages/primevue/src/chips/Chips.d.ts`, `primevue-4.5.5:packages/primevue/src/chips/style/ChipsStyle.js`, `primevue-4.5.5:packages/primevue/src/inputchips/InputChips.vue`, `primevue-4.5.5:packages/primevue/src/inputchips/BaseInputChips.vue`, `primevue-4.5.5:packages/primevue/src/inputchips/InputChips.d.ts`, `primevue-4.5.5:packages/primevue/src/inputchips/style/InputChipsStyle.js`
- `primevue-4.5.5:apps/showcase/doc/guides/migration/v4/changes/CompatibleDoc.vue`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primevue-4.5.5:packages/metadata/src/components/index.ts`, `primevue-4.5.5:apps/showcase/doc/autocomplete/MultipleDoc.vue`
- `primeng-21.1.9:packages/primeng/src/chip/public_api.ts`, `primeng-21.1.9:apps/showcase/doc/migration/v19/deprecatedcomponentsdoc.ts`, `primeng-21.1.9:apps/showcase/doc/migration/v20/removalsdoc.ts`, `primeng-21.1.9:apps/showcase/doc/autocomplete/basic-chips-doc.ts`, `primeng-21.1.9:apps/showcase/doc/autocomplete/advanced-chips-doc.ts`
- `@primeuix/styles-2.0.3:dist/inputchips/index.mjs`, `@primeuix/themes-2.0.3:types/inputchips/index.d.ts`, `@primeuix/themes-2.0.3:dist/aura/inputchips/index.mjs`
- `docs/prime-reference/catalog/primevue.json`, `docs/prime-reference/catalog/primereact.json`
