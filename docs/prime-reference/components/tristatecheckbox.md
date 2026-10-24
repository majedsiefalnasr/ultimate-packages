# TriStateCheckbox

**Category:** Form · **Frameworks:** PrimeReact 10.9.9

## 1. Summary

TriStateCheckbox is a PrimeReact checkbox whose value cycles through three states: `null` (unset), `true` (check icon) and `false` (times icon). It renders its own native input, box and icon rather than reusing PrimeReact `Checkbox` (`primereact-10.9.9:components/lib/tristatecheckbox/TriStateCheckbox.js`).

## 2. Names & status

- Canonical name: **TriStateCheckbox**; PrimeReact-only in the pinned set. Not deprecated in PrimeReact 10.9.9 (`primereact-10.9.9:components/lib/tristatecheckbox/tristatecheckbox.d.ts`).
- PrimeNG: N/A — not shipped in primeng-21.1.9. No `tristatecheckbox` source folder, doc folder, catalog module or menu entry. The v19 migration guide lists TriStateCheckbox under **Removed Components** with the replacement "Checkbox with indeterminate option" (`primeng-21.1.9:apps/showcase/doc/migration/v19/breakingchangesdoc.ts`, `primeng-21.1.9:apps/showcase/assets/data/menu.json`, `docs/prime-reference/catalog/primeng.json`).
- PrimeVue: N/A — not shipped in primevue-4.5.5. No source folder, doc folder, catalog module or menu entry; the v4 migration guide lists TriStateCheckbox as removed, replaced by Checkbox with the indeterminate option (`primevue-4.5.5:apps/showcase/doc/guides/migration/v4/changes/BreakingDoc.vue`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `docs/prime-reference/catalog/primevue.json`).
- The replacement is not equivalent: NG/Vue Checkbox `indeterminate` only masks the value visually (minus icon); the next click resolves it to `trueValue`, so there is no built-in three-value cycle (`primeng-21.1.9:packages/primeng/src/checkbox/checkbox.ts`, `primevue-4.5.5:packages/primevue/src/checkbox/Checkbox.vue`, `primevue-4.5.5:apps/showcase/doc/checkbox/IndeterminateDoc.vue`, `primeng-21.1.9:apps/showcase/doc/checkbox/indeterminate-doc.ts`).
- PrimeReact Checkbox has no `indeterminate` prop, so in React TriStateCheckbox remains the only three-state checkbox (`primereact-10.9.9:components/lib/checkbox/checkbox.d.ts`).
- Listed in the Form group of the PrimeReact menu (`primereact-10.9.9:components/layout/menu.json`).

## 3. Per framework

| Aspect         | PrimeNG | PrimeVue | PrimeReact                                                                                                |
| -------------- | ------- | -------- | --------------------------------------------------------------------------------------------------------- |
| Import         | N/A     | N/A      | `import { TriStateCheckbox } from 'primereact/tristatecheckbox'`                                          |
| Selector / tag | N/A     | N/A      | `<TriStateCheckbox />`                                                                                    |
| Source         | N/A     | N/A      | `components/lib/tristatecheckbox/TriStateCheckbox.js`, `TriStateCheckboxBase.js`, `tristatecheckbox.d.ts` |
| Exports        | N/A     | N/A      | `TriStateCheckbox` (also re-exported from the all-in-one bundle)                                          |
| Base class     | N/A     | N/A      | `ComponentBase.extend` (`TriStateCheckboxBase`)                                                           |

Sources: `primereact-10.9.9:components/doc/tristatecheckbox/importdoc.js`, `primereact-10.9.9:components/lib/tristatecheckbox/package.json`, `primereact-10.9.9:components/lib/tristatecheckbox/TriStateCheckboxBase.js`, `primereact-10.9.9:components/lib/primereact.all.js`.

## 4. Anatomy

| Part        | Element                                  | PrimeReact PT key          | Class (from `css.classes`)                                                                                   |
| ----------- | ---------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Root        | `div`                                    | `root`                     | `p-tristatecheckbox p-checkbox p-component` (+ `p-highlight`, `p-disabled`, `p-invalid`, `p-variant-filled`) |
| Input       | `input type="checkbox"`                  | `input`                    | `p-checkbox-input`                                                                                           |
| Live region | `span aria-live="polite"`                | `srOnlyAria`               | `p-hidden-accessible`                                                                                        |
| Box         | `div role="checkbox"`                    | `box`                      | `p-checkbox-box`                                                                                             |
| Icon        | `CheckIcon` (true) / `TimesIcon` (false) | `checkIcon`, `uncheckIcon` | `p-checkbox-icon p-c`                                                                                        |
| Tooltip     | PrimeReact `Tooltip` (when `tooltip`)    | `tooltip`                  | —                                                                                                            |

`p-highlight` is added when the value is neither `''` nor `null`, i.e. for both `true` and `false` (`primereact-10.9.9:components/lib/tristatecheckbox/TriStateCheckboxBase.js`, `primereact-10.9.9:components/lib/tristatecheckbox/tristatecheckbox.d.ts`).

## 5. API highlights

| Member  | PrimeReact                                                                                                                                        |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Value   | `value: boolean \| null \| undefined` (controlled; any other value is treated as `null`) + `onChange`                                             |
| Change  | `onChange(event: TriStateCheckboxChangeEvent)` with `value`, `originalEvent`, `target: { name, id, value }`                                       |
| Cycle   | `null` → `true` → `false` → `null`                                                                                                                |
| Icons   | `checkIcon`, `uncheckIcon` (`IconType<TriStateCheckboxProps>`); defaults `CheckIcon`, `TimesIcon`                                                 |
| State   | `disabled = false`, `readOnly = false`, `invalid = false`, `variant: 'outlined' \| 'filled'` (default `null`, falls back to context `inputStyle`) |
| Focus   | `autoFocus = false`, `tabIndex` (`defaultProps` `'0'`; `-1` when disabled)                                                                        |
| Tooltip | `tooltip`, `tooltipOptions`                                                                                                                       |
| Methods | `focus()`, `getElement(): HTMLDivElement \| null`                                                                                                 |
| Common  | `pt`, `ptOptions`, `unstyled`, `className`, `style`, `id`                                                                                         |

- `TriStateCheckboxProps` extends `InputHTMLAttributes<HTMLDivElement>` minus `onChange`, `value` and `ref`, so `name` and `inputId` (both read by the source) arrive as untyped extra attributes; `inputId` is applied to the native input (`primereact-10.9.9:components/lib/tristatecheckbox/tristatecheckbox.d.ts`, `primereact-10.9.9:components/lib/tristatecheckbox/TriStateCheckbox.js`).
- The `.d.ts` declares `variant` `@defaultValue outlined`, while `defaultProps` sets `null` with a context fallback (`primereact-10.9.9:components/lib/tristatecheckbox/TriStateCheckboxBase.js`).
- Full API: catalog module `tristatecheckbox` in `docs/prime-reference/catalog/primereact.json`.

## 6. Usage guidance

- **Basic** — controlled `value` + `onChange` (`primereact-10.9.9:components/doc/tristatecheckbox/basicdoc.js`).
- **Filled** — `variant="filled"` for a higher-emphasis background (`primereact-10.9.9:components/doc/tristatecheckbox/filleddoc.js`).
- **Invalid** — `invalid` prop shows the failed-validation style (`primereact-10.9.9:components/doc/tristatecheckbox/invaliddoc.js`).
- **Disabled** — `disabled` prevents editing and focus (`primereact-10.9.9:components/doc/tristatecheckbox/disableddoc.js`).
- **Style / Pass Through** — structural class list and PT wireframe (`primereact-10.9.9:components/doc/tristatecheckbox/styledoc.js`, `primereact-10.9.9:components/doc/tristatecheckbox/pt/wireframe.js`).

Page assembly: `primereact-10.9.9:pages/tristatecheckbox/index.js`. No providers or services are required.

## 7. Accessibility

- Documented model: an element with `checkbox` role, labelled by `aria-label` / `aria-labelledby`, plus a screen-reader-only `aria-live` element reading the locale `aria.trueLabel` (`'True'`), `aria.falseLabel` (`'False'`) or `aria.nullLabel` (`'Not Selected'`). The doc notes there is no one-to-one WCAG mapping (`primereact-10.9.9:components/doc/tristatecheckbox/accessibilitydoc.js`, `primereact-10.9.9:components/lib/api/Locale.js`).
- Source: the focusable box `div` has `role="checkbox"`, `aria-checked` `'true'` only for `true` (both `false` and `null` report `'false'`), and receives the forwarded ARIA props; the native input carries `aria-invalid`. Unlike MultiStateCheckbox, the live region is always rendered (`primereact-10.9.9:components/lib/tristatecheckbox/TriStateCheckbox.js`).
- Keyboard: Tab focuses; Space and Enter (also NumpadEnter) advance the state (`primereact-10.9.9:components/doc/tristatecheckbox/accessibilitydoc.js`, `primereact-10.9.9:components/lib/tristatecheckbox/TriStateCheckbox.js`).

## 8. Theming

- PrimeNG / PrimeVue: N/A — not shipped; no `@primeuix/styles` module or `@primeuix/themes` token group for it.
- PrimeReact classes from `css.classes` (see Anatomy). There is no `css.styles` block: the box look comes from the shared `p-checkbox` classes in the theme CSS. Design tokens N/A (`primereact-10.9.9:components/lib/tristatecheckbox/TriStateCheckboxBase.js`).
- Doc/source mismatch: the styled-mode doc lists `p-tristatechkbox`, `p-chkbox`, `p-chkbox-box`, `p-chkbox-icon`, not the emitted `p-tristatecheckbox` / `p-checkbox-*` classes (`primereact-10.9.9:components/doc/tristatecheckbox/theming/styleddoc.js`).
- PT keys: `root`, `input`, `box`, `checkIcon`, `uncheckIcon`, `srOnlyAria`, `tooltip`, `hooks`. The Tailwind preset has a `tristatecheckbox` entry, but `PrimeReactPTOptions` has no `tristatecheckbox` key, so global PT for it is untyped (`primereact-10.9.9:components/lib/passthrough/tailwind/index.js`, `primereact-10.9.9:components/lib/api/api.d.ts`).

## 9. Relationships

- Embeds: Tooltip; icons `CheckIcon` and `TimesIcon`. Does not embed Checkbox.
- Related: Checkbox (binary; NG/Vue `indeterminate` is the documented replacement), MultiStateCheckbox (arbitrary state list).
- Alias chain: none; removed upstream in PrimeNG v19 and PrimeVue v4.

## 10. Dependencies

- PrimeReact: `../api/Api` (`PrimeReactContext`, `ariaLabel`), `../componentbase/ComponentBase` (`useHandleStyle`), `../hooks/Hooks` (`useMergeProps`, `useMountEffect`), `../icons/check`, `../icons/times`, `../tooltip/Tooltip`, `../utils/Utils` (`DomHandler`, `IconUtils`, `ObjectUtils`, `classNames`) (`primereact-10.9.9:components/lib/tristatecheckbox/TriStateCheckbox.js`).
- External npm packages: none beyond React.

## 11. Framework differences

| Aspect           | PrimeNG                                | PrimeVue                               | PrimeReact                         |
| ---------------- | -------------------------------------- | -------------------------------------- | ---------------------------------- |
| Availability     | removed (v19)                          | removed (v4)                           | `TriStateCheckbox`                 |
| Replacement      | Checkbox `indeterminate` (visual only) | Checkbox `indeterminate` (visual only) | —                                  |
| Value set        | —                                      | —                                      | `null`, `true`, `false`            |
| Keyboard toggle  | —                                      | —                                      | Space, Enter                       |
| Global PT typing | —                                      | —                                      | missing from `PrimeReactPTOptions` |

## 12. Sources

- `primereact-10.9.9:components/lib/tristatecheckbox/TriStateCheckbox.js`
- `primereact-10.9.9:components/lib/tristatecheckbox/TriStateCheckboxBase.js`
- `primereact-10.9.9:components/lib/tristatecheckbox/tristatecheckbox.d.ts`
- `primereact-10.9.9:components/lib/tristatecheckbox/package.json`
- `primereact-10.9.9:components/lib/checkbox/checkbox.d.ts`
- `primereact-10.9.9:components/lib/api/Locale.js`
- `primereact-10.9.9:components/lib/api/api.d.ts`
- `primereact-10.9.9:components/lib/passthrough/tailwind/index.js`
- `primereact-10.9.9:components/lib/primereact.all.js`
- `primereact-10.9.9:components/doc/tristatecheckbox/` (`importdoc.js`, `basicdoc.js`, `filleddoc.js`, `invaliddoc.js`, `disableddoc.js`, `styledoc.js`, `accessibilitydoc.js`, `pt/wireframe.js`, `theming/styleddoc.js`)
- `primereact-10.9.9:pages/tristatecheckbox/index.js`
- `primereact-10.9.9:components/layout/menu.json`
- `primeng-21.1.9:apps/showcase/doc/migration/v19/breakingchangesdoc.ts`
- `primeng-21.1.9:apps/showcase/doc/checkbox/indeterminate-doc.ts`
- `primeng-21.1.9:packages/primeng/src/checkbox/checkbox.ts`
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:apps/showcase/doc/guides/migration/v4/changes/BreakingDoc.vue`
- `primevue-4.5.5:apps/showcase/doc/checkbox/IndeterminateDoc.vue`
- `primevue-4.5.5:packages/primevue/src/checkbox/Checkbox.vue`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`, `docs/prime-reference/catalog/primereact.json`
