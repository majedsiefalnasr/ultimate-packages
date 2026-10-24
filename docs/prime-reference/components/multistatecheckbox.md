# MultiStateCheckbox

**Category:** Form · **Frameworks:** PrimeReact 10.9.9

## 1. Summary

MultiStateCheckbox is a PrimeReact checkbox that cycles through an ordered list of options instead of a boolean. Each activation moves to the next option; each option supplies its own icon (and optionally a style and class), and the empty state (no option selected) can be part of the cycle or skipped. It is built on top of PrimeReact `Checkbox` (`primereact-10.9.9:components/lib/multistatecheckbox/MultiStateCheckbox.js`).

## 2. Names & status

- Canonical name: **MultiStateCheckbox**; PrimeReact-only. Not deprecated, no legacy aliases (`primereact-10.9.9:components/lib/multistatecheckbox/multistatecheckbox.d.ts`).
- PrimeNG: N/A — not shipped in primeng-21.1.9. No `multistatecheckbox` source folder, showcase doc folder or catalog module, and no menu entry (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `docs/prime-reference/catalog/primeng.json`).
- PrimeVue: N/A — not shipped in primevue-4.5.5. No source folder, doc folder, catalog module or menu entry (`primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `docs/prime-reference/catalog/primevue.json`).
- Neither PrimeNG nor PrimeVue documents a replacement for a multi-state checkbox. The nearest built-ins are SelectButton (one of N options, all visible) and Checkbox with `indeterminate` (three visual states only) (`primeng-21.1.9:apps/showcase/doc/checkbox/indeterminate-doc.ts`, `primevue-4.5.5:apps/showcase/doc/checkbox/IndeterminateDoc.vue`).
- Listed in the Form group of the PrimeReact menu (`primereact-10.9.9:components/layout/menu.json`).

## 3. Per framework

| Aspect         | PrimeNG | PrimeVue | PrimeReact                                                                                                        |
| -------------- | ------- | -------- | ----------------------------------------------------------------------------------------------------------------- |
| Import         | N/A     | N/A      | `import { MultiStateCheckbox } from 'primereact/multistatecheckbox'`                                              |
| Selector / tag | N/A     | N/A      | `<MultiStateCheckbox />`                                                                                          |
| Source         | N/A     | N/A      | `components/lib/multistatecheckbox/MultiStateCheckbox.js`, `MultiStateCheckboxBase.js`, `multistatecheckbox.d.ts` |
| Exports        | N/A     | N/A      | `MultiStateCheckbox` (also re-exported from the all-in-one bundle)                                                |
| Base class     | N/A     | N/A      | `ComponentBase.extend` (`MultiStateCheckboxBase`)                                                                 |

Sources: `primereact-10.9.9:components/doc/multistatecheckbox/importdoc.js`, `primereact-10.9.9:components/lib/multistatecheckbox/package.json`, `primereact-10.9.9:components/lib/multistatecheckbox/MultiStateCheckboxBase.js`, `primereact-10.9.9:components/lib/primereact.all.js`.

## 4. Anatomy

| Part        | Element                               | PrimeReact PT key | Class (from `css.classes`)                                                     |
| ----------- | ------------------------------------- | ----------------- | ------------------------------------------------------------------------------ |
| Root        | `div` (click target)                  | `root`            | `p-multistatecheckbox p-checkbox p-component` (+ `p-variant-filled`)           |
| Checkbox    | embedded PrimeReact `Checkbox`        | `checkbox`        | user `className` + `p-invalid` when `invalid`; inline style of selected option |
| Icon        | icon of the selected option           | `icon`            | `p-checkbox-icon p-c` + the option's icon class                                |
| Live region | `span` (rendered only while focused)  | `srOnlyAria`      | `p-hidden-accessible`                                                          |
| Tooltip     | PrimeReact `Tooltip` (when `tooltip`) | `tooltip`         | —                                                                              |

The embedded Checkbox renders its own `input`, `box` and icon parts with `p-checkbox-*` classes (`primereact-10.9.9:components/lib/multistatecheckbox/MultiStateCheckbox.js`, `primereact-10.9.9:components/lib/multistatecheckbox/multistatecheckbox.d.ts`, `primereact-10.9.9:components/lib/checkbox/Checkbox.js`).

## 5. API highlights

| Member      | PrimeReact                                                                                                                 |
| ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| Value       | `value: any` (controlled) + `onChange(event: MultiStateCheckboxChangeEvent)` with `value`, `originalEvent`, `target`       |
| Options     | `options: MultiStateCheckboxOption[] \| any[]`; `MultiStateCheckboxOption` = `{ icon, style, className }`                  |
| Option keys | `optionValue` (field used as value; whole option when unset), `optionLabel` (aria text), `optionIcon` (defaults to `icon`) |
| Equality    | `dataKey` — used for equality only when `optionValue` is not set                                                           |
| Empty state | `empty: boolean = true` — when `false` the cycle skips "no value", and a `null` value is advanced on mount                 |
| Icon        | `iconTemplate: ReactNode \| ((options: MultiStateCheckboxIconTemplateEvent) => ReactNode)`                                 |
| State       | `disabled = false`, `readOnly = false`, `invalid = false`, `variant: 'filled' \| string` (default `null`)                  |
| Focus       | `autoFocus = false`, `tabIndex` (`defaultProps` `'0'`, passed to the inner checkbox)                                       |
| Tooltip     | `tooltip`, `tooltipOptions`                                                                                                |
| Methods     | `focus()`, `getElement(): HTMLDivElement \| null`                                                                          |
| Common      | `pt`, `ptOptions`, `unstyled`, `className`, `style`, `id`                                                                  |

- Cycling: the next option is `options[index + 1]`; after the last option the value becomes `null` when `empty` is true, otherwise wraps to `options[0]` (`primereact-10.9.9:components/lib/multistatecheckbox/MultiStateCheckbox.js`).
- Source reads `props.name` (for `event.target.name`) and `props.inputId` (inner checkbox id), but neither is declared in `MultiStateCheckboxProps`; `tabIndex` is also not declared there (`primereact-10.9.9:components/lib/multistatecheckbox/multistatecheckbox.d.ts`, `primereact-10.9.9:components/lib/multistatecheckbox/MultiStateCheckbox.js`).
- `variant` only checks for `'filled'`; unlike most PrimeReact inputs it does not fall back to the context `inputStyle` (`primereact-10.9.9:components/lib/multistatecheckbox/MultiStateCheckboxBase.js`).
- Full API: catalog module `multistatecheckbox` in `docs/prime-reference/catalog/primereact.json`.

## 6. Usage guidance

- **Basic** — controlled `value` + `onChange`, an `options` array whose items carry `value` and `icon` (PrimeIcons classes in the demo), and `optionValue="value"` (`primereact-10.9.9:components/doc/multistatecheckbox/basicdoc.js`).
- **Invalid** — the demo adds `className="p-invalid"` rather than the `invalid` prop (`primereact-10.9.9:components/doc/multistatecheckbox/invaliddoc.js`).
- **Disabled** — `disabled` blocks editing and focus (`primereact-10.9.9:components/doc/multistatecheckbox/disableddoc.js`).
- **Style** — structural class list (`primereact-10.9.9:components/doc/multistatecheckbox/styledoc.js`).
- **Pass Through** — wireframe of the sections (`primereact-10.9.9:components/doc/multistatecheckbox/pt/wireframe.js`).

No providers or services are required.

## 7. Accessibility

- Documented model: the component exposes a `checkbox` role, is labelled by `aria-label` / `aria-labelledby`, and announces the current option through a screen-reader-only `aria-live` element; the text is the `optionLabel` field (falling back to `optionValue`), and the empty state reads the locale `aria.nullLabel` (default `'Not Selected'`). The doc calls this a custom pattern without a one-to-one WCAG mapping (`primereact-10.9.9:components/doc/multistatecheckbox/accessibilitydoc.js`, `primereact-10.9.9:components/lib/api/Locale.js`).
- Source: the `checkbox` role comes from the native `input type="checkbox"` of the embedded Checkbox; ARIA props passed to MultiStateCheckbox are forwarded to that checkbox; `checked` is true whenever any option is selected. The `aria-live="polite"` `span` is rendered only while the component has focus (`primereact-10.9.9:components/lib/multistatecheckbox/MultiStateCheckbox.js`, `primereact-10.9.9:components/lib/checkbox/Checkbox.js`).
- Keyboard: Tab focuses; Space moves to the next value. The handler tests `keyCode === 32` and calls `preventDefault()` (`primereact-10.9.9:components/doc/multistatecheckbox/accessibilitydoc.js`, `primereact-10.9.9:components/lib/multistatecheckbox/MultiStateCheckbox.js`).

## 8. Theming

- PrimeNG / PrimeVue: N/A — not shipped; no `@primeuix/styles` module or `@primeuix/themes` token group for it in the pinned packages.
- PrimeReact classes from `css.classes` in `MultiStateCheckboxBase.js`: `root` (`p-multistatecheckbox p-checkbox p-component`, `p-variant-filled`), `checkbox` (`p-invalid`), `icon` (`p-checkbox-icon p-c` + option icon). `css.inlineStyles.checkbox` applies the selected option's `style`. There is no `css.styles` block; the visual box styling comes from the embedded Checkbox and the theme CSS. Design tokens N/A (`primereact-10.9.9:components/lib/multistatecheckbox/MultiStateCheckboxBase.js`).
- Doc/source mismatch: the styled-mode doc lists `p-multistatechkbox`, `p-chkbox`, `p-chkbox-box` and `p-chkbox-icon`, which are not the classes the source emits (`primereact-10.9.9:components/doc/multistatecheckbox/theming/styleddoc.js`, `primereact-10.9.9:components/doc/multistatecheckbox/styledoc.js`).
- PT keys: `root`, `checkbox`, `icon`, `srOnlyAria`, `tooltip`, `hooks`; `multistatecheckbox` is registered in `PrimeReactPTOptions` and has a Tailwind preset entry (`primereact-10.9.9:components/lib/api/api.d.ts`, `primereact-10.9.9:components/lib/passthrough/tailwind/index.js`).

## 9. Relationships

- Embeds: Checkbox (the visual box, input and focus handling), Tooltip.
- Related: TriStateCheckbox (fixed `true` / `false` / `null` cycle), Checkbox, SelectButton (all options visible).
- No alias chain.

## 10. Dependencies

- PrimeReact: `../api/Api` (`ariaLabel`, `PrimeReactContext`), `../checkbox/Checkbox`, `../componentbase/ComponentBase` (`useHandleStyle`), `../hooks/Hooks` (`useMergeProps`, `useMountEffect`), `../tooltip/Tooltip`, `../utils/Utils` (`classNames`, `DomHandler`, `IconUtils`, `ObjectUtils`, `UniqueComponentId`) (`primereact-10.9.9:components/lib/multistatecheckbox/MultiStateCheckbox.js`).
- External npm packages: none beyond React.

## 11. Framework differences

| Aspect              | PrimeNG                                | PrimeVue                               | PrimeReact                               |
| ------------------- | -------------------------------------- | -------------------------------------- | ---------------------------------------- |
| Availability        | not shipped                            | not shipped                            | `MultiStateCheckbox`                     |
| Nearest alternative | SelectButton; Checkbox `indeterminate` | SelectButton; Checkbox `indeterminate` | —                                        |
| States              | —                                      | —                                      | any number of options (+ optional empty) |
| Built on            | —                                      | —                                      | PrimeReact `Checkbox`                    |
| Design tokens       | —                                      | —                                      | N/A (theme CSS)                          |

## 12. Sources

- `primereact-10.9.9:components/lib/multistatecheckbox/MultiStateCheckbox.js`
- `primereact-10.9.9:components/lib/multistatecheckbox/MultiStateCheckboxBase.js`
- `primereact-10.9.9:components/lib/multistatecheckbox/multistatecheckbox.d.ts`
- `primereact-10.9.9:components/lib/multistatecheckbox/package.json`
- `primereact-10.9.9:components/lib/checkbox/Checkbox.js`
- `primereact-10.9.9:components/lib/api/Locale.js`
- `primereact-10.9.9:components/lib/api/api.d.ts`
- `primereact-10.9.9:components/lib/passthrough/tailwind/index.js`
- `primereact-10.9.9:components/lib/primereact.all.js`
- `primereact-10.9.9:components/doc/multistatecheckbox/` (`importdoc.js`, `basicdoc.js`, `invaliddoc.js`, `disableddoc.js`, `styledoc.js`, `accessibilitydoc.js`, `pt/wireframe.js`, `theming/styleddoc.js`)
- `primereact-10.9.9:components/layout/menu.json`
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primeng-21.1.9:apps/showcase/doc/checkbox/indeterminate-doc.ts`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primevue-4.5.5:apps/showcase/doc/checkbox/IndeterminateDoc.vue`
- `docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`, `docs/prime-reference/catalog/primereact.json`
