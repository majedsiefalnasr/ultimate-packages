# Rating

**Category:** Form · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

Rating is a star-based selection input: a row of `stars` clickable icons (default 5) bound to a single number, where the value `n` fills the first `n` stars. PrimeNG and PrimeVue build each star around a visually hidden native `<input type="radio">`, so the group behaves like a radio group, and clicking the already selected star clears the value to `null` (`primeng-21.1.9:packages/primeng/src/rating/rating.ts`, `primevue-4.5.5:packages/primevue/src/rating/Rating.vue`). PrimeReact is a different implementation: plain `div` items with `tabIndex`, a hand-written key handler, no radio inputs and no ARIA, and a separate "cancel" item (`cancel`, default `true`) for clearing (`primereact-10.9.9:components/lib/rating/Rating.js`). The showcase describes it in one line as a star based selection input (`primeng-21.1.9:apps/showcase/pages/rating/index.ts`, `primevue-4.5.5:apps/showcase/pages/rating/index.vue`).

## 2. Names & status

- Canonical name: **Rating**. GLOSSARY.md has no Rating entry; the name is the same in all three Prime packages, with no legacy alias.
- No component-level deprecation in any framework. Deprecated or odd members:
  - PrimeNG has no `styleClass` input on Rating (unlike ToggleSwitch); its icon styling inputs are `iconOnClass`, `iconOnStyle`, `iconOffClass`, `iconOffStyle` (`primeng-21.1.9:packages/primeng/src/rating/rating.ts`).
  - PrimeVue and PrimeNG have no `cancel` prop and no cancel icon, although stale doc text mentions one (see §6 and §11) (`primevue-4.5.5:apps/showcase/doc/rating/TemplateDoc.vue`, `primeng-21.1.9:apps/showcase/doc/rating/withoutcancel-doc.ts`).
  - PrimeReact declares `onIconProps` and `offIconProps` in the defaults and typings but `Rating.js` never reads them (`primereact-10.9.9:components/lib/rating/RatingBase.js`, `primereact-10.9.9:components/lib/rating/rating.d.ts`, `primereact-10.9.9:components/lib/rating/Rating.js`).
- Menu category is Form in all three showcases, between RadioButton and Select / SelectButton (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`).

## 3. Per framework

| Aspect         | PrimeNG                                                                                                      | PrimeVue                                                                                           | PrimeReact                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Import         | `import { RatingModule } from 'primeng/rating'` (component `Rating` is standalone)                           | `import Rating from 'primevue/rating'`                                                             | `import { Rating } from 'primereact/rating'`                             |
| Selector / tag | `<p-rating>`                                                                                                 | `<Rating>`                                                                                         | `<Rating />`                                                             |
| Source         | `packages/primeng/src/rating/rating.ts`, `style/ratingstyle.ts`, types in `types/rating/rating.types.ts`     | `packages/primevue/src/rating/Rating.vue`, `BaseRating.vue`, `Rating.d.ts`, `style/RatingStyle.js` | `components/lib/rating/Rating.js`, `RatingBase.js`, `rating.d.ts`        |
| Exports        | `Rating`, `RatingModule`, `RATING_VALUE_ACCESSOR`, `RatingStyle`, `RatingClasses`, types from `types/rating` | default `Rating`; `RatingStyle` from `primevue/rating/style`                                       | `Rating` (re-exported by `primereact.all.js`)                            |
| Base class     | `BaseEditableHolder<RatingPassThrough>`, `hostDirectives: [Bind]`                                            | `BaseEditableHolder` (via `BaseRating`)                                                            | `React.memo(forwardRef(...))` over `ComponentBase.extend` (`RatingBase`) |
| Sub-components | None                                                                                                         | None                                                                                               | None; optionally a sibling `Tooltip`                                     |

Sources: `primeng-21.1.9:packages/primeng/src/rating/public_api.ts`, `primeng-21.1.9:packages/primeng/src/rating/rating.ts`, `primeng-21.1.9:apps/showcase/doc/rating/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/rating/ImportDoc.vue`, `primevue-4.5.5:packages/primevue/src/rating/package.json`, `primevue-4.5.5:packages/primevue/src/rating/style/package.json`, `primevue-4.5.5:packages/primevue/src/rating/BaseRating.vue`, `primereact-10.9.9:components/doc/rating/importdoc.js`, `primereact-10.9.9:components/lib/rating/package.json`, `primereact-10.9.9:components/lib/primereact.all.js`.

## 4. Anatomy

| Part                 | PrimeNG / PrimeVue                                           | PrimeReact                                           | Class                                                                 |
| -------------------- | ------------------------------------------------------------ | ---------------------------------------------------- | --------------------------------------------------------------------- |
| Root                 | `<p-rating>` host (PT `host`, `root`) / `div` (PT `root`)    | `div` (PT `root`)                                    | `p-rating`                                                            |
| Star item            | `div` (PT `option`)                                          | `div` (PT `item`)                                    | `p-rating-option` / `p-rating-item`                                   |
| Hidden input wrapper | `span.p-hidden-accessible` (PT `hiddenOptionInputContainer`) | N/A                                                  | `p-hidden-accessible`                                                 |
| Hidden input         | `<input type="radio">` (PT `hiddenOptionInput`)              | N/A                                                  | —                                                                     |
| On icon              | `StarFillIcon` svg or custom (PT `onIcon`)                   | `StarFillIcon` or custom (PT `onIcon`)               | `p-rating-icon p-rating-on-icon` / `p-rating-icon`                    |
| Off icon             | `StarIcon` svg or custom (PT `offIcon`)                      | `StarIcon` or custom (PT `offIcon`)                  | `p-rating-icon p-rating-off-icon` / see §8                            |
| Cancel item and icon | N/A                                                          | `div` (PT `cancelItem`), `BanIcon` (PT `cancelIcon`) | `p-rating-item p-rating-cancel-item`, `p-rating-icon p-rating-cancel` |
| Tooltip              | N/A                                                          | `Tooltip` (PT `tooltip`)                             | —                                                                     |

- Per star, PrimeNG and PrimeVue render the option `div`, and inside it the hidden radio wrapper followed by exactly one icon: the on icon when `star <= value`, else the off icon (`primeng-21.1.9:packages/primeng/src/rating/rating.ts`, `primevue-4.5.5:packages/primevue/src/rating/Rating.vue`).
- Both also stamp `data-p` (from `cn({ readonly, disabled })`) on the root; PrimeVue additionally stamps `data-p-active`, `data-p-focused` and a per-option `data-p` with `active` and `focus-visible` (`primevue-4.5.5:packages/primevue/src/rating/Rating.vue`).
- PrimeReact puts the cancel item before the stars and stamps only `data-p-focused` on star items (`primereact-10.9.9:components/lib/rating/Rating.js`).
- PrimeNG PT keys: `host`, `root`, `option`, `onIcon`, `offIcon`, `hiddenOptionInputContainer`, `hiddenOptionInput` (`primeng-21.1.9:packages/primeng/src/types/rating/rating.types.ts`). PrimeVue: the same minus `host`, plus `hooks` (`primevue-4.5.5:packages/primevue/src/rating/Rating.d.ts`). PrimeReact: `root`, `cancelIcon`, `item`, `cancelItem`, `onIcon`, `offIcon`, `tooltip`, `hooks` (`primereact-10.9.9:components/lib/rating/rating.d.ts`).

## 5. API highlights

| Member            | PrimeNG                                                                                     | PrimeVue                                                                                                                   | PrimeReact                                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Value binding     | `ngModel` / `formControlName` (`ControlValueAccessor` via `RATING_VALUE_ACCESSOR`)          | `modelValue?: number` / `v-model`, `defaultValue?: number`                                                                 | `value?: number` (default `null`), controlled with `onChange`                                                                          |
| Star count        | `stars: number = 5`                                                                         | `stars?: number`, default `5`                                                                                              | `stars?: number`, default `5`                                                                                                          |
| Read-only         | `readonly: boolean` (default `false`)                                                       | `readonly?: boolean`, default `false`                                                                                      | `readOnly?: boolean`, default `false` (camel-case `O`)                                                                                 |
| Disabled          | `disabled` (from base, default `false`)                                                     | `disabled?: boolean`                                                                                                       | `disabled?: boolean`, default `false`                                                                                                  |
| Invalid           | `invalid` (signal input, default `false`)                                                   | `invalid?: boolean` (also from `@primevue/forms`)                                                                          | N/A                                                                                                                                    |
| Name / required   | `name` (signal input), `required` (default `false`)                                         | `name?: string`; `required` N/A                                                                                            | `id`; `name` / `required` N/A (name only echoed in `onChange` `target`)                                                                |
| Autofocus         | `autofocus: boolean` (default `false`) via `pAutoFocus`                                     | N/A                                                                                                                        | N/A                                                                                                                                    |
| Cancel            | N/A                                                                                         | N/A                                                                                                                        | `cancel?: boolean`, default `true`; `cancelIcon`, `cancelIconProps`                                                                    |
| Custom icons      | `iconOnClass`, `iconOnStyle`, `iconOffClass`, `iconOffStyle`; templates `onicon`, `officon` | `onIcon?: string`, `offIcon?: string` (CSS class names); slots `onicon`, `officon`                                         | `onIcon`, `offIcon`: `IconType<RatingProps>` (node, class or function)                                                                 |
| Change event      | `onRate: EventEmitter<RatingRateEvent>` with `originalEvent: Event`, `value: number`        | `change(event: RatingChangeEvent)` with `originalEvent`, `value`; also `update:modelValue(number)`, `value-change(number)` | `onChange(event: RatingChangeEvent)` with `originalEvent`, `value`, `stopPropagation`, `preventDefault`, `target: { name, id, value }` |
| Focus / blur      | `onFocus`, `onBlur: EventEmitter<FocusEvent>`                                               | `focus(event: Event)`, `blur(event: Event)`                                                                                | N/A (internal handlers only)                                                                                                           |
| Icon template ctx | `RatingIconTemplateContext`: `$implicit: number` (1-based star value), `class: string`      | slot scope `{ value: number, class: string, toggleCallback: (event: Event) => void }`                                      | N/A                                                                                                                                    |
| Tooltip           | N/A                                                                                         | N/A                                                                                                                        | `tooltip?: string`, `tooltipOptions?: TooltipOptions`                                                                                  |
| Methods           | N/A                                                                                         | N/A                                                                                                                        | `getElement(): HTMLDivElement \| null`                                                                                                 |

- Value semantics: values are 1-based star numbers; `null` (or no value) means nothing selected. In PrimeNG and PrimeVue, selecting the star equal to the current value (or the focused one) sets the model to `null`, otherwise it sets `value || null` (`primeng-21.1.9:packages/primeng/src/rating/rating.ts`, `primevue-4.5.5:packages/primevue/src/rating/Rating.vue`).
- PrimeNG `updateModel` writes the value, calls the form model-change and touched callbacks, then emits `onRate`; PrimeVue calls `writeValue(value, event)` then emits `change`; its blur handler also calls `formField.onBlur?.()` for `@primevue/forms` (`primeng-21.1.9:packages/primeng/src/rating/rating.ts`, `primevue-4.5.5:packages/primevue/src/rating/Rating.vue`).
- PrimeNG reads `stars` once in `onInit` to build the `starsArray`, so changing `stars` afterwards does not rebuild the stars (`primeng-21.1.9:packages/primeng/src/rating/rating.ts`). PrimeVue iterates `v-for="value in stars"` and PrimeReact maps over `props.stars` every render, so both react to changes.
- PrimeNG icon defaults: when no template and no `iconOnClass` / `iconOffClass`, the inline SVG `star-fill` (on) and `star` (off) icons are used (`primeng-21.1.9:packages/primeng/src/rating/rating.ts`). PrimeVue falls back to `StarFillIcon` / `StarIcon` unless `onIcon` / `offIcon` is set, in which case a `span` carrying that class is rendered (`primevue-4.5.5:packages/primevue/src/rating/Rating.vue`).
- The PrimeVue catalog entry `modules.rating.components` is empty (`{ "default": {} }`); the Vue API facts above come from `Rating.d.ts`. PrimeNG facts match catalog `modules.rating.components.Rating`, PrimeReact `modules.rating.components.Rating` (`primevue-4.5.5:packages/primevue/src/rating/Rating.d.ts`).
- Full API: catalog modules `rating` in `docs/prime-reference/catalog/primeng.json`, `primevue.json` (plus `ratingstyle`) and `primereact.json`.

## 6. Usage guidance

- **Import** — import the module or component from the framework entry point (`primeng-21.1.9:apps/showcase/doc/rating/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/rating/ImportDoc.vue`, `primereact-10.9.9:components/doc/rating/importdoc.js`).
- **Basic** — two-way bind the value with `ngModel` or `v-model`; in React it is a controlled input using `value` and `onChange` (`primeng-21.1.9:apps/showcase/doc/rating/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/rating/BasicDoc.vue`, `primereact-10.9.9:components/doc/rating/basicdoc.js`).
- **Without Cancel** — PrimeReact only: the cancel item is on by default and `cancel={false}` removes it (`primereact-10.9.9:components/doc/rating/withoutcanceldoc.js`). PrimeNG ships a `withoutcancel-doc.ts` file with the same sentence and a plain `<p-rating>`, but it is not registered in the PrimeNG page, and PrimeNG has no `cancel` input (`primeng-21.1.9:apps/showcase/doc/rating/withoutcancel-doc.ts`, `primeng-21.1.9:apps/showcase/pages/rating/index.ts`).
- **Number of Stars** — set `stars` (the demos use 10 with an initial value 5) (`primeng-21.1.9:apps/showcase/doc/rating/numberofstars-doc.ts`, `primevue-4.5.5:apps/showcase/doc/rating/NumberOfStarsDoc.vue`, `primereact-10.9.9:components/doc/rating/numberofstarsdoc.js`).
- **Template** — replace the star icons: PrimeNG `#onicon` / `#officon` templates, PrimeVue `onicon` / `officon` slots (the demos use images); PrimeReact passes `onIcon`, `offIcon`, `cancelIcon` props. The PrimeVue text also names a `cancelicon` slot, which the component does not have (`primeng-21.1.9:apps/showcase/doc/rating/template-doc.ts`, `primevue-4.5.5:apps/showcase/doc/rating/TemplateDoc.vue`, `primereact-10.9.9:components/doc/rating/templatedoc.js`).
- **Readonly** — `readonly` (`readOnly` in React) keeps the displayed value but blocks edits; the demos start at 3 (NG, Vue) or 5 (React) (`primeng-21.1.9:apps/showcase/doc/rating/readonly-doc.ts`, `primevue-4.5.5:apps/showcase/doc/rating/ReadOnlyDoc.vue`, `primereact-10.9.9:components/doc/rating/readonlydoc.js`).
- **Disabled** — `disabled` blocks interaction; the doc sentence in all three says "Knob", a copy-paste slip from another component (`primeng-21.1.9:apps/showcase/doc/rating/disabled-doc.ts`, `primevue-4.5.5:apps/showcase/doc/rating/DisabledDoc.vue`, `primereact-10.9.9:components/doc/rating/disableddoc.js`).
- **Forms** — PrimeNG shows template-driven (`ngModel`, `required`, `[invalid]` once touched or submitted, with a `p-message`) and reactive forms (`formControlName` with `Validators.required` and an `isInvalid` helper); PrimeVue shows `@primevue/forms` with `name="rating"`, a zod resolver (`zod` 3.23.8 in the demo dependencies) and a `Message`; PrimeReact has no forms demo (`primeng-21.1.9:apps/showcase/doc/rating/templatedrivenforms-doc.ts`, `primeng-21.1.9:apps/showcase/doc/rating/reactiveforms-doc.ts`, `primevue-4.5.5:apps/showcase/doc/rating/FormsDoc.vue`).
- **Accessibility** — see §7 (`primeng-21.1.9:apps/showcase/doc/rating/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/rating/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/rating/accessibilitydoc.js`).
- **Pass Through** — PrimeNG and PrimeVue ship a PT viewer for the `Rating` key; PrimeReact ships a wireframe image page (`primeng-21.1.9:apps/showcase/doc/rating/pt/PTViewer.ts`, `primevue-4.5.5:apps/showcase/doc/rating/pt/PTViewer.vue`, `primereact-10.9.9:components/doc/rating/pt/wireframe.js`).
- **Theming** — PrimeVue and PrimeReact ship a Tailwind (unstyled) preset page; PrimeReact additionally lists its class names (`primevue-4.5.5:apps/showcase/doc/rating/theming/TailwindDoc.vue`, `primereact-10.9.9:components/doc/rating/theming/tailwinddoc.js`, `primereact-10.9.9:components/doc/rating/theming/styleddoc.js`).
- Services and providers: none are required. The accessible star labels read the locale `aria.star` / `aria.stars` strings from the PrimeNG config (`PrimeNG` service) and the PrimeVue config (`$primevue.config.locale`); defaults are `'1 star'` and `'{star} stars'` (`primeng-21.1.9:packages/primeng/src/config/primeng.ts`, `primevue-4.5.5:packages/core/src/config/PrimeVue.js`).

## 7. Accessibility

- PrimeNG and PrimeVue: every star owns a hidden native radio input (`span.p-hidden-accessible`) with `aria-label` from `starAriaLabel(n)`: the locale `aria.star` for 1, and `aria.stars` with `{star}` replaced for other values. All inputs share one `name` (the `name` input, else a generated id plus `_name`), so the browser handles the radio group (`primeng-21.1.9:packages/primeng/src/rating/rating.ts`, `primevue-4.5.5:packages/primevue/src/rating/Rating.vue`, `primeng-21.1.9:packages/primeng/src/api/translation.ts`).
- Keyboard (all three docs, derived from native radio handling): Tab moves to the star representing the value (else the first star); Left / Up arrow moves to the previous star (wraps to the last); Right / Down arrow moves to the next star (wraps to the first); Space sets the value to the focused star if it is not already the value (`primeng-21.1.9:apps/showcase/doc/rating/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/rating/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/rating/accessibilitydoc.js`).
- PrimeNG renders `required`, `readonly` and `disabled` attributes on each input when set; PrimeVue passes `disabled` and `readonly` as props to each input. Native `readonly` has no effect on radios, so blocking edits relies on the click guard (`primeng-21.1.9:packages/primeng/src/rating/rating.ts`, `primevue-4.5.5:packages/primevue/src/rating/Rating.vue`).
- Focus ring: PrimeNG and PrimeVue add `p-focus-visible` to the focused option only when the focus did not come from touch (`event.sourceCapabilities?.firesTouchEvents === false`) or a keyboard change; mouse click sets the flag to false so no ring appears (`primeng-21.1.9:packages/primeng/src/rating/rating.ts`, `primevue-4.5.5:packages/primevue/src/rating/Rating.vue`).
- PrimeReact (doc/source mismatch): the AccessibilityDoc claims hidden radio buttons and locale-based labels, but `Rating.js` renders no inputs, no `role`, no `aria-*` attributes and never reads the locale. Stars are focusable `div`s (`tabIndex` 0 when enabled, `null` otherwise) with `onKeyDown`: `Enter` selects the focused star; the `'Space'` case can never match because `event.key` for the space bar is `' '`; ArrowLeft / ArrowUp and ArrowRight / ArrowDown step relative to `props.value` (not the focused star), wrapping at the ends; the cancel item responds to `Enter` only (`primereact-10.9.9:components/lib/rating/Rating.js`, `primereact-10.9.9:components/doc/rating/accessibilitydoc.js`).
- Doc text of the Accessibility pages is identical across the three showcases, which is why the React page describes behaviour the React component lacks.

## 8. Theming

- Style classes (catalog `primeng.json` `modules.rating.style.classes` and `primevue.json` `modules.ratingstyle.enumerations.RatingClasses`): `p-rating` (root; plus `p-readonly`, `p-disabled`), `p-rating-option` (star item; plus `p-rating-option-active`, `p-focus-visible`), `p-rating-on-icon`, `p-rating-off-icon` (both also carry `p-rating-icon`, and `p-invalid` when invalid) (`primeng-21.1.9:packages/primeng/src/rating/style/ratingstyle.ts`, `primevue-4.5.5:packages/primevue/src/rating/style/RatingStyle.js`, `primevue-4.5.5:packages/primevue/src/rating/style/RatingStyle.d.ts`).
- Pass-through section keys: see §4. PrimeVue pass-through functions receive `context: { active, focused }` for `option` only; PrimeReact passes `context: { active }` computed from `props.value`, not from the specific star (`primevue-4.5.5:packages/primevue/src/rating/Rating.vue`, `primereact-10.9.9:components/lib/rating/Rating.js`).
- Structural CSS: `@primeuix/styles-2.0.3:dist/rating/index.mjs`, imported as `style` by PrimeNG and PrimeVue. It makes the root an inline flex row with `gap`, makes each option a round (`border-radius: 50%`) clickable box with a `box-shadow` / `outline` focus ring on `.p-focus-visible`, sizes the icon from `rating.icon.size`, recolours icon on hover (only when neither `.p-disabled` nor `.p-readonly`) and when `.p-rating-option-active`, and sets `cursor: not-allowed` on readonly options. A disabled rating gets no extra rule in this CSS (no opacity change), and `.p-rating-icon.p-invalid` uses `stroke: dt('rating.invalid.icon.color')` marked `@todo` upstream (`@primeuix/styles-2.0.3:dist/rating/index.mjs`).
- PrimeNG extra rule: `p-rating.ng-invalid.ng-dirty > .p-rating > .p-rating-icon { stroke: dt('rating.invalid.icon.color') }`. Because the host element itself is `.p-rating` and has no `.p-rating` child, the selector as written cannot match (`primeng-21.1.9:packages/primeng/src/rating/style/ratingstyle.ts`).
- Design tokens (`@primeuix/themes-2.0.3:types/rating/index.d.ts`, `@primeuix/themes-2.0.3:tokens/index.mjs`; 11 tokens in two sections):
  - `root` (7): `gap`, `transitionDuration`, `focusRing.width`, `focusRing.style`, `focusRing.color`, `focusRing.offset`, `focusRing.shadow`.
  - `icon` (4): `size`, `color`, `hoverColor`, `activeColor`.
  - There is no `invalid.icon.color` token, although the CSS and the PrimeNG style reference `dt('rating.invalid.icon.color')`.
  - Aura values: `gap: 0.25rem`, icon `size: 1rem`, `color: {text.muted.color}`, `hoverColor` and `activeColor` `{primary.color}` (`@primeuix/themes-2.0.3:dist/aura/rating/index.mjs`). Lara uses icon `size: 1.25rem` (`@primeuix/themes-2.0.3:dist/lara/rating/index.mjs`). Nora equals Aura (`@primeuix/themes-2.0.3:dist/nora/rating/index.mjs`). Material uses `gap: 0.5rem`, icon `size: 1.125rem`, a disabled focus ring (`width: "0"`, `style: "none"`) and an extra `css` block with `color-mix` halo backgrounds on hover, active hover and focus-visible options (`@primeuix/themes-2.0.3:dist/material/rating/index.mjs`).
- PrimeReact (no `@primeuix`, tokens N/A): classes come from `css.classes` in `RatingBase.js`: root `p-rating` (+ `p-disabled`, `p-readonly`), item `p-rating-item` (+ `p-rating-item-active`, `p-focus`), `onIcon` = `p-rating-icon`, `cancelIcon` = `p-rating-icon p-rating-cancel`, `cancelItem` = `p-rating-item p-rating-cancel-item`. There is no `offIcon` class entry, and the off icon is built with `cx('onIcon')`, so off icons also get `p-rating-icon`. A small `@layer primereact` block supplies layout only (`display: flex`, item cursor, readonly cursor); colours and sizes live in the theme CSS (for example the `.p-rating-item.p-rating-item-active .p-rating-icon` and hover rules in `lara-light-blue/theme.css`) (`primereact-10.9.9:components/lib/rating/RatingBase.js`, `primereact-10.9.9:components/lib/rating/Rating.js`, `primereact-10.9.9:public/themes/lara-light-blue/theme.css`).
- PrimeReact's focus modifier class is `p-focus` and its class tables in the docs list only four names (`p-rating`, `p-rating-item`, `p-rating-item-active`, `p-rating-cancel-item`) (`primereact-10.9.9:components/doc/rating/styledoc.js`).

## 9. Relationships

- Embeds no Prime component, only icon components: `StarFillIcon`, `StarIcon` (all three) and `BanIcon` (React cancel; imported but unused in the PrimeVue SFC). PrimeReact optionally renders a `Tooltip` sibling when `tooltip` is set (`primeng-21.1.9:packages/primeng/src/rating/rating.ts`, `primevue-4.5.5:packages/primevue/src/rating/Rating.vue`, `primereact-10.9.9:components/lib/rating/Rating.js`).
- Embedded by: no Prime component embeds it in the reviewed sources. Showcase forms demos pair it with Message, Button and Toast (`primeng-21.1.9:apps/showcase/doc/rating/reactiveforms-doc.ts`, `primevue-4.5.5:apps/showcase/doc/rating/FormsDoc.vue`).
- Related Form components: RadioButton (same hidden-radio model, one item per input), Knob and Slider (numeric picking by range), SelectButton and ToggleSwitch (other choice or boolean inputs), InputNumber. Rating is not an alias of any other component.
- Shared base: PrimeNG and PrimeVue extend `BaseEditableHolder`, the base also used by Knob, Select, ToggleSwitch and other editable inputs (`primeng-21.1.9:packages/primeng/src/baseeditableholder/baseeditableholder.ts`, `primevue-4.5.5:packages/core/src/baseeditableholder/BaseEditableHolder.vue`).

## 10. Dependencies

- PrimeNG: `@angular/common`, `@angular/core`, `@angular/forms` (`NG_VALUE_ACCESSOR`), `@primeuix/utils` (`focus`, `getFirstFocusableElement`, `uuid`), `primeng/api` (`PrimeTemplate`, `SharedModule`), `primeng/autofocus` (`AutoFocus`), `primeng/basecomponent`, `primeng/baseeditableholder`, `primeng/bind`, `primeng/icons` (`StarFillIcon`, `StarIcon`), `primeng/ts-helpers`, `primeng/base` (`BaseStyle`), `@primeuix/styles/rating` (`primeng-21.1.9:packages/primeng/src/rating/rating.ts`, `primeng-21.1.9:packages/primeng/src/rating/style/ratingstyle.ts`).
- PrimeVue: `@primevue/core/baseeditableholder`, `@primevue/core/base/style`, `@primeuix/utils` (`cn`), `@primeuix/utils/dom` (`focus`, `getFirstFocusableElement`), `@primevue/icons/star`, `@primevue/icons/starfill`, `@primevue/icons/ban`, `primevue/rating/style`, `@primeuix/styles/rating` (`primevue-4.5.5:packages/primevue/src/rating/Rating.vue`, `primevue-4.5.5:packages/primevue/src/rating/BaseRating.vue`, `primevue-4.5.5:packages/primevue/src/rating/style/RatingStyle.js`).
- PrimeReact: `../api/Api` (`PrimeReactContext`), `../componentbase/ComponentBase` (`useHandleStyle`), `../hooks/Hooks` (`useMergeProps`), `../icons/ban`, `../icons/star`, `../icons/starfill`, `../tooltip/Tooltip`, `../utils/Utils` (`IconUtils`, `ObjectUtils`, `classNames`) (`primereact-10.9.9:components/lib/rating/Rating.js`, `primereact-10.9.9:components/lib/rating/RatingBase.js`).
- External npm packages: none beyond the framework (the `zod` package appears only in the PrimeVue forms demo).

## 11. Framework differences

| Aspect                  | PrimeNG                                              | PrimeVue                               | PrimeReact                                                 |
| ----------------------- | ---------------------------------------------------- | -------------------------------------- | ---------------------------------------------------------- |
| Star element            | `div` + hidden radio input                           | `div` + hidden radio input             | `div` with `tabIndex`, no input                            |
| Native semantics        | Radio group (shared `name`)                          | Radio group (shared `name`)            | None; no ARIA at all                                       |
| Clear by clicking value | Yes (sets `null`)                                    | Yes (sets `null`)                      | No; use the cancel item                                    |
| Cancel item             | N/A                                                  | N/A                                    | `cancel` (default `true`), `cancelIcon`, `cancelIconProps` |
| Value binding           | `ngModel` / `formControlName`                        | `v-model`, `@primevue/forms`           | Controlled `value` + `onChange`                            |
| Change event            | `onRate` `{ originalEvent, value }`                  | `change` `{ originalEvent, value }`    | `onChange` `{ originalEvent, value, target, ... }`         |
| Focus / blur events     | `onFocus`, `onBlur`                                  | `focus`, `blur`                        | N/A                                                        |
| Read-only prop name     | `readonly`                                           | `readonly`                             | `readOnly`                                                 |
| Invalid support         | `invalid` + (ineffective) `ng-invalid.ng-dirty` rule | `invalid` (class `p-invalid` on icons) | N/A                                                        |
| Name / required         | `name`, `required`                                   | `name`                                 | N/A                                                        |
| Autofocus               | `autofocus`                                          | N/A                                    | N/A                                                        |
| Custom icons            | `iconOnClass/Style`, `iconOffClass/Style`, templates | `onIcon`, `offIcon` (class), slots     | `onIcon`, `offIcon`, `cancelIcon` as `IconType`            |
| Icon template context   | `$implicit` (value), `class`                         | `value`, `class`, `toggleCallback`     | N/A                                                        |
| Stars reactivity        | Read once in `onInit`                                | Reactive                               | Reactive                                                   |
| Locale aria labels      | `aria.star`, `aria.stars`                            | `aria.star`, `aria.stars`              | Not used (docs claim they are)                             |
| Star item class         | `p-rating-option`                                    | `p-rating-option`                      | `p-rating-item`                                            |
| Focus class             | `p-focus-visible`                                    | `p-focus-visible`                      | `p-focus`                                                  |
| Tooltip                 | N/A                                                  | N/A                                    | `tooltip`, `tooltipOptions`                                |
| Imperative API          | N/A                                                  | N/A                                    | `getElement()`                                             |
| Styling source          | `@primeuix/styles` + tokens                          | `@primeuix/styles` + tokens            | Inline layout CSS + theme files; no tokens                 |
| Forms demo              | Template-driven and reactive                         | `@primevue/forms` + zod                | None                                                       |
| Stale doc content       | `withoutcancel-doc.ts` unregistered                  | `cancelicon` slot mentioned, absent    | Accessibility text claims radios and locale labels         |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/rating/rating.ts`
- `primeng-21.1.9:packages/primeng/src/rating/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/rating/style/ratingstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/rating/rating.types.ts`
- `primeng-21.1.9:packages/primeng/src/baseeditableholder/baseeditableholder.ts`
- `primeng-21.1.9:packages/primeng/src/config/primeng.ts`
- `primeng-21.1.9:packages/primeng/src/api/translation.ts`
- `primeng-21.1.9:apps/showcase/pages/rating/index.ts`
- `primeng-21.1.9:apps/showcase/doc/rating/` (`import-doc.ts`, `basic-doc.ts`, `numberofstars-doc.ts`, `template-doc.ts`, `readonly-doc.ts`, `disabled-doc.ts`, `templatedrivenforms-doc.ts`, `reactiveforms-doc.ts`, `accessibility-doc.ts`, `withoutcancel-doc.ts`, `pt/PTViewer.ts`)
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/rating/Rating.vue`
- `primevue-4.5.5:packages/primevue/src/rating/BaseRating.vue`
- `primevue-4.5.5:packages/primevue/src/rating/Rating.d.ts`
- `primevue-4.5.5:packages/primevue/src/rating/package.json`
- `primevue-4.5.5:packages/primevue/src/rating/style/RatingStyle.js`
- `primevue-4.5.5:packages/primevue/src/rating/style/RatingStyle.d.ts`
- `primevue-4.5.5:packages/primevue/src/rating/style/package.json`
- `primevue-4.5.5:packages/core/src/baseeditableholder/BaseEditableHolder.vue`
- `primevue-4.5.5:packages/core/src/config/PrimeVue.js`
- `primevue-4.5.5:apps/showcase/pages/rating/index.vue`
- `primevue-4.5.5:apps/showcase/doc/rating/` (`ImportDoc.vue`, `BasicDoc.vue`, `FormsDoc.vue`, `NumberOfStarsDoc.vue`, `TemplateDoc.vue`, `ReadOnlyDoc.vue`, `DisabledDoc.vue`, `AccessibilityDoc.vue`, `pt/PTViewer.vue`, `theming/TailwindDoc.vue`)
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/rating/Rating.js`
- `primereact-10.9.9:components/lib/rating/RatingBase.js`
- `primereact-10.9.9:components/lib/rating/rating.d.ts`
- `primereact-10.9.9:components/lib/rating/package.json`
- `primereact-10.9.9:components/lib/primereact.all.js`
- `primereact-10.9.9:components/doc/rating/` (`importdoc.js`, `basicdoc.js`, `withoutcanceldoc.js`, `numberofstarsdoc.js`, `templatedoc.js`, `readonlydoc.js`, `disableddoc.js`, `accessibilitydoc.js`, `styledoc.js`, `pt/wireframe.js`, `theming/styleddoc.js`, `theming/tailwinddoc.js`)
- `primereact-10.9.9:components/layout/menu.json`
- `primereact-10.9.9:public/themes/lara-light-blue/theme.css`
- `@primeuix/styles-2.0.3:dist/rating/index.mjs`
- `@primeuix/themes-2.0.3:types/rating/index.d.ts`
- `@primeuix/themes-2.0.3:tokens/index.mjs`
- `@primeuix/themes-2.0.3:dist/aura/rating/index.mjs`
- `@primeuix/themes-2.0.3:dist/lara/rating/index.mjs`
- `@primeuix/themes-2.0.3:dist/material/rating/index.mjs`
- `@primeuix/themes-2.0.3:dist/nora/rating/index.mjs`
