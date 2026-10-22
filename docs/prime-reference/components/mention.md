# Mention

**Category:** Form · **Frameworks:** PrimeReact 10.9.9

## 1. Summary

Mention is a PrimeReact textarea that watches for trigger characters (default `@`) and, after a trigger, asks the application for suggestions through `onSearch` and shows them in a popup list. Picking a suggestion replaces the typed fragment with the suggestion text. It wraps PrimeReact `InputTextarea` and renders the suggestion panel through `Portal` with `appendTo="self"` (`primereact-10.9.9:components/lib/mention/Mention.js`).

## 2. Names & status

- Canonical name: **Mention**; PrimeReact-only. Not deprecated.
- PrimeNG: N/A — not shipped in primeng-21.1.9. No `mention` source folder or catalog module, and no Mention entry in the showcase menu (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `docs/prime-reference/catalog/primeng.json`).
- PrimeVue: N/A — not shipped in primevue-4.5.5. No `mention` source folder or catalog module, and no Mention entry in the showcase menu (`primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `docs/prime-reference/catalog/primevue.json`). Neither archive documents a replacement; the closest built-in is AutoComplete, which completes the whole input value rather than a fragment inside free text.
- Listed in the Form group of the PrimeReact menu (`primereact-10.9.9:components/layout/menu.json`).

## 3. Per framework

| Aspect         | PrimeNG | PrimeVue | PrimeReact                                                            |
| -------------- | ------- | -------- | --------------------------------------------------------------------- |
| Import         | N/A     | N/A      | `import { Mention } from 'primereact/mention'`                        |
| Selector / tag | N/A     | N/A      | `<Mention />`                                                         |
| Source         | N/A     | N/A      | `components/lib/mention/Mention.js`, `MentionBase.js`, `mention.d.ts` |
| Exports        | N/A     | N/A      | `Mention`                                                             |
| Base class     | N/A     | N/A      | `ComponentBase.extend` (`MentionBase`)                                |

Sources: `primereact-10.9.9:components/doc/mention/importdoc.js`, `primereact-10.9.9:components/lib/mention/MentionBase.js`.

## 4. Anatomy

| Part          | Element                      | PrimeReact PT key     | Class                                                                                      |
| ------------- | ---------------------------- | --------------------- | ------------------------------------------------------------------------------------------ |
| Root          | `div`                        | `root`                | `p-mention p-component p-inputwrapper` (+ `p-inputwrapper-filled`, `p-inputwrapper-focus`) |
| Input         | `InputTextarea` (`textarea`) | `input`               | `p-mention-input`                                                                          |
| Panel         | `div` inside `CSSTransition` | `panel`, `transition` | `p-mention-panel p-component`, transition `p-connected-overlay`                            |
| Header/footer | template output              | —                     | —                                                                                          |
| List          | `ul`                         | `items`               | `p-mention-items`                                                                          |
| Item          | `li` (+ Ripple)              | `item`                | `p-mention-item` (+ `p-highlight`)                                                         |

Sources: `primereact-10.9.9:components/lib/mention/MentionBase.js`, `primereact-10.9.9:components/lib/mention/mention.d.ts`.

## 5. API highlights

| Member      | PrimeReact                                                                                                                             |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Value       | Native textarea `value` / `defaultValue` plus `onChange`; Mention inherits all textarea attributes except the event props it redefines |
| Trigger     | `trigger = '@'` (`string \| string[]`)                                                                                                 |
| Suggestions | `suggestions` array, `field` (`string \| string[]`, one entry per trigger), `itemTemplate`, `headerTemplate`, `footerTemplate`         |
| Search      | `onSearch({ originalEvent, trigger, query })`, `delay = 0` (ms)                                                                        |
| Panel       | `scrollHeight = '200px'`, `panelClassName`, `panelStyle`, `transitionOptions`, `autoHighlight = true`                                  |
| Input       | `inputId`, `inputRef`, `inputClassName`, `inputStyle`, `autoResize`, `variant = 'outlined'` (`'filled' \| 'outlined'`)                 |
| Events      | `onChange`, `onInput`, `onFocus`, `onBlur`, `onSelect({ originalEvent, suggestion })`, `onShow`, `onHide`                              |
| Methods     | `show()`, `hide()`, `focus()`, `getElement()`, `getInput()`, `getOverlay()`                                                            |
| Common      | `pt`, `ptOptions`, `unstyled`                                                                                                          |

- `MentionProps` extends the textarea attribute set (`Omit<…TextareaHTMLAttributes…, 'onSelect' | 'onChange' | 'onInput' | 'onFocus' | 'onBlur' | 'ref' | 'pt'>`), so `disabled`, `rows`, `cols` and `placeholder` are plain textarea attributes; there is no dedicated `invalid` prop (the invalid demo sets `inputClassName="p-invalid"`) (`primereact-10.9.9:components/lib/mention/mention.d.ts`, `primereact-10.9.9:components/doc/mention/invaliddoc.js`).
- On selection the component removes all whitespace from the formatted suggestion, writes the new text into the textarea, calls `onChange` with the textarea as target, and places the caret after the inserted text (`primereact-10.9.9:components/lib/mention/Mention.js`).
- Typing a space closes the panel; a search only starts when the text after the nearest trigger is reached (`primereact-10.9.9:components/lib/mention/Mention.js`).
- Full API: catalog module `mention` in `docs/prime-reference/catalog/primereact.json`.

## 6. Usage guidance

- **Basic** — controlled `value` + `onChange`, with `suggestions` filled by `onSearch` (`primereact-10.9.9:components/doc/mention/basicdoc.js`).
- **Triggers** — pass several trigger characters, for example `['@', '#']`, and a matching `field` array (`primereact-10.9.9:components/doc/mention/triggersdoc.js`).
- **Auto resize** — `autoResize` makes the textarea grow with its content (`primereact-10.9.9:components/doc/mention/autoresizedoc.js`).
- **Float label** — wrap in a float-label container (`primereact-10.9.9:components/doc/mention/floatlabeldoc.js`).
- **Invalid / Disabled** — invalid styling via the `p-invalid` class on the input; `disabled` as a textarea attribute (`primereact-10.9.9:components/doc/mention/invaliddoc.js`, `primereact-10.9.9:components/doc/mention/disableddoc.js`).
- **Style** — legacy structural class list (`primereact-10.9.9:components/doc/mention/styledoc.js`).

## 7. Accessibility

- Documented model: the textarea is a `combobox` with `aria-autocomplete`, `aria-haspopup`, `aria-expanded`, `aria-controls` and `aria-activedescendant`; the list is a `listbox` of `option`s; keys Tab, Up/Down, Enter, Home, End and Escape (`primereact-10.9.9:components/doc/mention/accessibilitydoc.js`).
- Doc/source mismatch: `Mention.js` sets none of these roles or ARIA attributes — the `ul` and `li` carry only classes and `data-p-highlight`. The key handler (by `event.which`) covers Down (40), Up (38), Backspace (8, closes the panel when deleting the trigger), Enter (13) and Escape (27); Home and End are not handled (`primereact-10.9.9:components/lib/mention/Mention.js`).
- Labelling relies on a `label` bound to `inputId`, or `aria-label` / `aria-labelledby` passed through to the textarea.

## 8. Theming

- PrimeNG / PrimeVue: N/A — component not shipped; no `@primeuix/styles` module or `@primeuix/themes` token group named `mention` exists in the pinned packages.
- PrimeReact: classes from `MentionBase.js` `css.classes` (see Anatomy). Structural CSS in `css.styles`: inline-flex root, absolutely positioned panel with `min-width: 100%`, unstyled list, `.p-fluid .p-mention` full width; it also carries a leftover `.p-autocomplete-loader` rule. Design tokens N/A (`primereact-10.9.9:components/lib/mention/MentionBase.js`, `primereact-10.9.9:components/doc/mention/theming/styleddoc.js`).
- Tailwind pass-through preset has a `mention` entry (`primereact-10.9.9:components/lib/passthrough/tailwind/index.js`).

## 9. Relationships

- Embeds: InputTextarea (see textarea.md), Portal, CSSTransition, Ripple.
- Related: AutoComplete (whole-value suggestions), Textarea.
- PrimeReact registers `mention` in `PrimeReactPTOptions` (`primereact-10.9.9:components/lib/api/api.d.ts`).

## 10. Dependencies

- PrimeReact: `../api/Api`, `../componentbase/ComponentBase`, `../csstransition/CSSTransition`, `../hooks/Hooks` (`useMergeProps`, `useOverlayListener`, `useUnmountEffect`, `useUpdateEffect`), `../inputtextarea/InputTextarea`, `../overlayservice/OverlayService`, `../portal/Portal`, `../ripple/Ripple`, `../utils/Utils` (`DomHandler`, `ObjectUtils`, `ZIndexUtils`, `classNames`) (`primereact-10.9.9:components/lib/mention/Mention.js`).
- External npm packages: none beyond React (`react-transition-group` through `CSSTransition`).

## 11. Framework differences

| Aspect              | PrimeNG                    | PrimeVue                   | PrimeReact                     |
| ------------------- | -------------------------- | -------------------------- | ------------------------------ |
| Availability        | not shipped                | not shipped                | `Mention`                      |
| Nearest alternative | AutoComplete (whole value) | AutoComplete (whole value) | —                              |
| Base element        | —                          | —                          | `InputTextarea`                |
| ARIA                | —                          | —                          | documented but not implemented |

## 12. Sources

- `primereact-10.9.9:components/lib/mention/Mention.js`
- `primereact-10.9.9:components/lib/mention/MentionBase.js`
- `primereact-10.9.9:components/lib/mention/mention.d.ts`
- `primereact-10.9.9:components/lib/api/api.d.ts`
- `primereact-10.9.9:components/lib/passthrough/tailwind/index.js`
- `primereact-10.9.9:components/doc/mention/` (`importdoc.js`, `basicdoc.js`, `triggersdoc.js`, `autoresizedoc.js`, `floatlabeldoc.js`, `invaliddoc.js`, `disableddoc.js`, `styledoc.js`, `accessibilitydoc.js`, `theming/styleddoc.js`)
- `primereact-10.9.9:components/layout/menu.json`
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`, `docs/prime-reference/catalog/primereact.json`
