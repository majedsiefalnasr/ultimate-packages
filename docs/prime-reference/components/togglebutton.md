# ToggleButton

**Category:** Form · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

ToggleButton selects a boolean value through a button whose look changes between an off state and an on state. It can swap a label (`onLabel` / `offLabel`, defaults `Yes` / `No`) and an icon (`onIcon` / `offIcon`) with the state, and it exposes a `checked` / `modelValue` binding, `invalid`, `disabled`, and a fluid layout. All three frameworks ship it under the same name: PrimeNG `ToggleButton` (`primeng-21.1.9:packages/primeng/src/togglebutton/togglebutton.ts`), PrimeVue `ToggleButton` (`primevue-4.5.5:packages/primevue/src/togglebutton/ToggleButton.vue`) and PrimeReact `ToggleButton` (`primereact-10.9.9:components/lib/togglebutton/ToggleButton.js`).

The three implementations are structurally different. PrimeNG makes the host element itself the button (`role="button"`, `aria-pressed`). PrimeVue renders a native `<button type="button">`. PrimeReact renders a `div` that wraps a hidden `<input type="checkbox">` and a `div` styled with Button classes (`p-button`).

## 2. Names & status

- Canonical name: **ToggleButton**. No legacy alias or renamed predecessor exists in any of the three frameworks (no other folder or module in the sources reviewed maps to it).
- Menu category is Form in all three showcases (`primeng-21.1.9:apps/showcase/assets/data/menu.json`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`, `primereact-10.9.9:components/layout/menu.json`). In the PrimeNG and PrimeVue menus it sits between Textarea and ToggleSwitch; in the PrimeReact menu it is the last Form entry.
- Deprecated member: PrimeNG `styleClass` is `@deprecated since v20.0.0, use class instead` (`primeng-21.1.9:packages/primeng/src/togglebutton/togglebutton.ts`). No deprecated members are declared in PrimeVue or PrimeReact.
- PrimeNG selector spellings: `p-toggleButton`, `p-togglebutton` and `p-toggle-button` (`primeng-21.1.9:packages/primeng/src/togglebutton/togglebutton.ts`).
- Do not confuse with unrelated names that contain the string: Tree and TreeTable have a `nodeToggleButton` part (`primeng-21.1.9:packages/primeng/src/tree/tree.ts`, `primevue-4.5.5:packages/primevue/src/treetable/BodyCell.vue`), and Panel names its toggle-icon pass-through section `pcToggleButton` although it is typed as a Button (`primevue-4.5.5:packages/primevue/src/panel/Panel.d.ts`, `primeng-21.1.9:packages/primeng/src/types/panel/panel.types.ts`).

## 3. Per framework

| Aspect         | PrimeNG                                                                                                                                                     | PrimeVue                                                                                                                          | PrimeReact                                                                                |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Import         | `import { ToggleButtonModule } from 'primeng/togglebutton'` (component `ToggleButton` is standalone)                                                        | `import ToggleButton from 'primevue/togglebutton'`                                                                                | `import { ToggleButton } from 'primereact/togglebutton'`                                  |
| Selector / tag | `<p-togglebutton>` (also `p-toggleButton`, `p-toggle-button`)                                                                                               | `<ToggleButton>`                                                                                                                  | `<ToggleButton />`                                                                        |
| Source         | `packages/primeng/src/togglebutton/togglebutton.ts`, `style/togglebuttonstyle.ts`, types in `packages/primeng/src/types/togglebutton/togglebutton.types.ts` | `packages/primevue/src/togglebutton/ToggleButton.vue`, `BaseToggleButton.vue`, `ToggleButton.d.ts`, `style/ToggleButtonStyle.js`  | `components/lib/togglebutton/ToggleButton.js`, `ToggleButtonBase.js`, `togglebutton.d.ts` |
| Exports        | `ToggleButton`, `ToggleButtonModule`, `TOGGLEBUTTON_VALUE_ACCESSOR`, `ToggleButtonStyle`, `ToggleButtonClasses`, change/template-context/pass-through types | default `ToggleButton`; `ToggleButtonStyle` from `primevue/togglebutton/style`; both re-exported by the umbrella `primevue` index | `ToggleButton` (re-exported by `primereact.all.js`); `ToggleButtonBase` is internal       |
| Base class     | `BaseEditableHolder<ToggleButtonPassThrough>` with hostDirectives `Ripple` and `Bind`                                                                       | `BaseEditableHolder` (via `BaseToggleButton`), `v-ripple` directive                                                               | `React.memo(forwardRef(...))` over `ComponentBase.extend` (`ToggleButtonBase`)            |
| Sub-components | None; `icon` and `content` are templates                                                                                                                    | None; `icon` and default are slots                                                                                                | `Ripple` inside the box and an optional `Tooltip` sibling                                 |

Sources: `primeng-21.1.9:packages/primeng/src/togglebutton/public_api.ts`, `primeng-21.1.9:apps/showcase/doc/togglebutton/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/togglebutton/ImportDoc.vue`, `primevue-4.5.5:packages/primevue/src/togglebutton/package.json`, `primevue-4.5.5:packages/primevue/src/index.js`, `primereact-10.9.9:components/doc/togglebutton/importdoc.js`, `primereact-10.9.9:components/lib/togglebutton/package.json`, `primereact-10.9.9:components/lib/primereact.all.js`.

## 4. Anatomy

| Part    | PrimeNG PT key / element    | PrimeVue PT key / element | PrimeReact PT key / element             | Class                                                                                       |
| ------- | --------------------------- | ------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------- |
| Root    | `root` (host element)       | `root` (`button`)         | `root` (`div`)                          | `p-togglebutton` (React: also `p-component`, `p-highlight` / `p-disabled` / `p-invalid`)    |
| Input   | N/A                         | N/A                       | `input` (hidden `input[type=checkbox]`) | `p-togglebutton-input` (React only)                                                         |
| Box     | N/A                         | N/A                       | `box` (`div`)                           | `p-button p-component` (React only; adds `p-button-icon-only` when icon without label)      |
| Content | `content` (`span`)          | `content` (`span`)        | N/A                                     | `p-togglebutton-content`                                                                    |
| Icon    | `icon` (`span`)             | `icon` (`span`)           | `icon` (icon element)                   | `p-togglebutton-icon` (NG adds `-left` / `-right`); React: `p-button-icon` + `-left/-right` |
| Label   | `label` (`span`)            | `label` (`span`)          | `label` (`span`)                        | `p-togglebutton-label`; React: `p-button-label`                                             |
| Tooltip | N/A                         | N/A                       | `tooltip` (`Tooltip`)                   | —                                                                                           |
| Hooks   | N/A (host also keys `host`) | `hooks`                   | `hooks`                                 | —                                                                                           |

- PrimeNG: the host is root; pass-through attributes for `host` and `root` are merged onto it. The template is a `content` span holding either the `content` template, or the icon (template or `onIcon` / `offIcon` span) followed by the label span (`primeng-21.1.9:packages/primeng/src/togglebutton/togglebutton.ts`, `primeng-21.1.9:packages/primeng/src/types/togglebutton/togglebutton.types.ts`).
- PrimeVue: `button > span.content > (default slot | icon slot + label span)` (`primevue-4.5.5:packages/primevue/src/togglebutton/ToggleButton.vue`, `primevue-4.5.5:packages/primevue/src/togglebutton/ToggleButton.d.ts`).
- PrimeReact: `div.root > input + div.box > (icon, span.label, Ripple)`. The component returns a fragment so the `Tooltip` is a sibling of the root, not a child (`primereact-10.9.9:components/lib/togglebutton/ToggleButton.js`, `primereact-10.9.9:components/lib/togglebutton/togglebutton.d.ts`).
- State attributes: PrimeNG and PrimeVue stamp `data-p-checked`, `data-p-disabled` and `data-p` on the root and `data-p` on the content (the `data-p` value comes from `cn({ checked, invalid, [size]: size })`; PrimeNG's variant omits `disabled` there). PrimeReact stamps `data-p-highlight` and `data-p-disabled` on the root.

## 5. API highlights

Shared names and defaults: `onLabel = 'Yes'`, `offLabel = 'No'`, `onIcon`, `offIcon`, `invalid`, `disabled`. Both labels (PrimeVue, PrimeReact) must be non-empty for labels to display; otherwise a non-breaking space is rendered so the control keeps its height.

| Member            | PrimeNG                                                                                           | PrimeVue                                                                               | PrimeReact                                                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Value binding     | `ngModel` / `formControlName` (`ControlValueAccessor`)                                            | `modelValue` / `v-model`, `defaultValue`                                               | `checked: boolean = false`, controlled with `onChange`                                                                                                   |
| Labels            | `onLabel = 'Yes'`, `offLabel = 'No'` (each checked independently)                                 | `onLabel = 'Yes'`, `offLabel = 'No'` (both must be set to show either)                 | `onLabel = 'Yes'`, `offLabel = 'No'` (both must be set)                                                                                                  |
| Icons             | `onIcon`, `offIcon`: `string`; `iconPos: 'left' \| 'right' = 'left'`                              | `onIcon`, `offIcon`: `string`; no `iconPos`                                            | `onIcon`, `offIcon`: `IconType<ToggleButtonProps>`; `iconPos: 'left' \| 'right' = 'left'`                                                                |
| Size              | `size: 'large' \| 'small'`                                                                        | `size: HintedString<'small' \| 'large'> = null`                                        | N/A                                                                                                                                                      |
| Fluid             | `fluid` (signal input)                                                                            | `fluid: boolean = null`                                                                | N/A                                                                                                                                                      |
| Allow empty       | `allowEmpty: boolean`; when `false` an on button cannot be switched off                           | N/A                                                                                    | N/A                                                                                                                                                      |
| Read-only         | N/A                                                                                               | `readonly: boolean = false`                                                            | `readonly: boolean` (declared in `.d.ts`, guarded in the toggle handler)                                                                                 |
| Tab index         | `tabindex: number = 0`                                                                            | `tabindex: number = null`                                                              | `tabIndex: number = 0` (forced to `-1` when disabled)                                                                                                    |
| ARIA              | `ariaLabel`, `ariaLabelledBy`                                                                     | `ariaLabel`, `ariaLabelledby` (the `.d.ts` declares only `ariaLabelledby`)             | `aria-label`, `aria-labelledby` forwarded to the hidden input                                                                                            |
| Input id / focus  | `inputId`, `autofocus` declared, but not used in the template or class                            | N/A                                                                                    | `inputId`, `autoFocus` (focuses on mount); `id`, `name`                                                                                                  |
| Change event      | `onChange: EventEmitter<ToggleButtonChangeEvent>` with `originalEvent: Event`, `checked: boolean` | `change(event: Event)`, `update:modelValue(boolean)`, `value-change(boolean)`          | `onChange(event: ToggleButtonChangeEvent)` with `originalEvent`, `value: boolean`, `stopPropagation()`, `preventDefault()`, `target { name, id, value }` |
| Focus / blur      | internal only; `onBlur` marks the model touched                                                   | `focus(event)`, `blur(event)` declared in `.d.ts`; blur also calls `formField.onBlur`  | `onFocus`, `onBlur` (`React.FocusEvent`)                                                                                                                 |
| Templates / slots | `content` (replaces icon and label), `icon`; both context `{ $implicit: boolean }`                | default slot (replaces icon and label), `icon` slot scope `{ value: any, class: any }` | `children` (declared, but not rendered by the component)                                                                                                 |
| Tooltip           | N/A                                                                                               | N/A                                                                                    | `tooltip: string`, `tooltipOptions`                                                                                                                      |
| Methods           | N/A                                                                                               | N/A                                                                                    | `focus()`, `getElement(): HTMLDivElement \| null`                                                                                                        |
| Form props        | `name`, `invalid`, `disabled`, `required` from `BaseEditableHolder`                               | `name`, `invalid`, `disabled`, `formControl` from `BaseEditableHolder`                 | `invalid: boolean = false`, `disabled`                                                                                                                   |

- Toggle logic. PrimeNG: a host `click` handler (`toggle`) does nothing when disabled or when `allowEmpty === false` and already checked; otherwise it flips `checked`, writes the model, notifies the form control, marks touched and emits `onChange`. PrimeVue: `onChange` guards `disabled` and `readonly`, calls `writeValue(!d_value, event)`, and emits `change`. PrimeReact: `toggle` guards `disabled`, a missing `onChange`, and `readonly`, then calls `props.onChange` with `value: !props.checked` (`primeng-21.1.9:packages/primeng/src/togglebutton/togglebutton.ts`, `primevue-4.5.5:packages/primevue/src/togglebutton/ToggleButton.vue`, `primereact-10.9.9:components/lib/togglebutton/ToggleButton.js`).
- PrimeVue types: `modelValue?: boolean`, `defaultValue?: boolean`, `tabindex?: string` in the `.d.ts` but `Number` in the base props (`primevue-4.5.5:packages/primevue/src/togglebutton/ToggleButton.d.ts`, `primevue-4.5.5:packages/primevue/src/togglebutton/BaseToggleButton.vue`). `update:modelValue` and `value-change` come from `BaseEditableHolder` (`primevue-4.5.5:packages/core/src/baseeditableholder/BaseEditableHolder.vue`).
- PrimeVue pass-through functions receive a context `{ active: boolean, disabled: boolean }` (`primevue-4.5.5:packages/primevue/src/togglebutton/ToggleButton.d.ts`).
- Full API: catalog module `togglebutton` in `docs/prime-reference/catalog/primeng.json`, `primevue.json` (plus `togglebuttonstyle`) and `primereact.json`.

## 6. Usage guidance

- **Import** — import the module or component from the framework entry point (`primeng-21.1.9:apps/showcase/doc/togglebutton/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/togglebutton/ImportDoc.vue`, `primereact-10.9.9:components/doc/togglebutton/importdoc.js`).
- **Basic** — bind a boolean two-way: `ngModel` (PrimeNG), `v-model` (PrimeVue), or controlled `checked` with `onChange={(e) => setChecked(e.value)}` (PrimeReact). The PrimeReact page text speaks of a `value` property although the prop is `checked` (`primeng-21.1.9:apps/showcase/doc/togglebutton/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/togglebutton/BasicDoc.vue`, `primereact-10.9.9:components/doc/togglebutton/basicdoc.js`).
- **Customized** — change labels and icons per state with `onLabel`, `offLabel`, `onIcon`, `offIcon`; give the control an explicit width and an aria label that does not change with state (`primeng-21.1.9:apps/showcase/doc/togglebutton/customized-doc.ts`, `primevue-4.5.5:apps/showcase/doc/togglebutton/CustomizedDoc.vue`, `primereact-10.9.9:components/doc/togglebutton/customizeddoc.js`).
- **Sizes** — `size="small"` and `size="large"` are alternatives to the base size; PrimeReact has no size demo (`primeng-21.1.9:apps/showcase/doc/togglebutton/sizes-doc.ts`, `primevue-4.5.5:apps/showcase/doc/togglebutton/SizesDoc.vue`).
- **Fluid** — `fluid` stretches the button to the container width; PrimeReact has no fluid demo (`primeng-21.1.9:apps/showcase/doc/togglebutton/fluid-doc.ts`, `primevue-4.5.5:apps/showcase/doc/togglebutton/FluidDoc.vue`).
- **Invalid** — set `invalid` to show failed validation (`primeng-21.1.9:apps/showcase/doc/togglebutton/invalid-doc.ts`, `primevue-4.5.5:apps/showcase/doc/togglebutton/InvalidDoc.vue`, `primereact-10.9.9:components/doc/togglebutton/invaliddoc.js`).
- **Disabled** — `disabled` blocks editing and focus per the docs (`primeng-21.1.9:apps/showcase/doc/togglebutton/disabled-doc.ts`, `primevue-4.5.5:apps/showcase/doc/togglebutton/DisabledDoc.vue`, `primereact-10.9.9:components/doc/togglebutton/disableddoc.js`). See the PrimeNG tab-order caveat in section 7.
- **Forms** — PrimeNG shows template-driven forms (`#model="ngModel"`, `required`, `[invalid]` after touch or submit) and reactive forms (`formControlName` with an `isInvalid` helper); PrimeVue shows `@primevue/forms` with a `name`, a zod resolver that requires `true`, and a `Message`; PrimeReact has no forms demo (`primeng-21.1.9:apps/showcase/doc/togglebutton/templatedrivenforms-doc.ts`, `primeng-21.1.9:apps/showcase/doc/togglebutton/reactiveforms-doc.ts`, `primevue-4.5.5:apps/showcase/doc/togglebutton/FormsDoc.vue`).
- **Accessibility** — always supply an `aria-label` or `aria-labelledby` that stays constant, because the visible label changes with state (`primeng-21.1.9:apps/showcase/doc/togglebutton/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/togglebutton/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/togglebutton/accessibilitydoc.js`).
- **Pass Through** — PrimeNG and PrimeVue ship a PT viewer and (PrimeVue) a PT options table; PrimeReact ships a wireframe image page (`primeng-21.1.9:apps/showcase/doc/togglebutton/pt/PTViewer.ts`, `primevue-4.5.5:apps/showcase/doc/togglebutton/pt/PTViewer.vue`, `primevue-4.5.5:apps/showcase/doc/togglebutton/pt/index.vue`, `primereact-10.9.9:components/doc/togglebutton/pt/wireframe.js`).
- **Theming** — PrimeVue and PrimeReact ship a Tailwind (unstyled) preset page (`primevue-4.5.5:apps/showcase/doc/togglebutton/theming/TailwindDoc.vue`, `primereact-10.9.9:components/doc/togglebutton/theming/tailwinddoc.js`).

No services or providers are required.

## 7. Accessibility

- **PrimeNG.** The host gets `role="button"`, `aria-pressed` (`"true"` / `"false"`), `aria-label`, `aria-labelledby`, and `tabindex` (`primeng-21.1.9:packages/primeng/src/togglebutton/togglebutton.ts`). `Enter` and `Space` (matched by `event.code`) both toggle and call `preventDefault`; the accessibility doc lists only `tab` and `space` (`primeng-21.1.9:apps/showcase/doc/togglebutton/accessibility-doc.ts`).
- **PrimeNG tab-order caveat.** `tabindex` defaults to `0` and the host binding only falls back to `-1` when disabled if `tabindex` is `undefined`, so a disabled PrimeNG ToggleButton with the default input stays in the tab order; the `disabled` state is conveyed with `data-p-disabled` and blocked in the click handler, not with a native `disabled` attribute (`primeng-21.1.9:packages/primeng/src/togglebutton/togglebutton.ts`).
- **PrimeVue.** A native `<button type="button">` with `aria-pressed` bound to the raw model value `d_value`, `aria-label`, `aria-labelledby`, `tabindex` and the native `disabled` attribute (`primevue-4.5.5:packages/primevue/src/togglebutton/ToggleButton.vue`). Keyboard is the native button behaviour (Enter and Space); the doc table lists `tab` and `space` and describes the control as "derived from the native browser handling of checkboxs in a group", wording that does not fit a button (`primevue-4.5.5:apps/showcase/doc/togglebutton/AccessibilityDoc.vue`). `readonly` is not rendered as an attribute; it only prevents the change in `onChange`.
- **PrimeReact.** The hidden `input type="checkbox"` receives `aria-label`, `aria-labelledby`, `aria-invalid`, `disabled`, `readOnly`, `checked`, `tabIndex` (`-1` when disabled), and a keydown handler that toggles on `keyCode === 32` and calls `preventDefault` (`primereact-10.9.9:components/lib/togglebutton/ToggleButton.js`).
- **Doc/source mismatch (PrimeReact).** The accessibility doc says the component "uses an element with button role and updates aria-pressed", but the source renders no `role` and no `aria-pressed`; assistive technology sees a checkbox (`primereact-10.9.9:components/doc/togglebutton/accessibilitydoc.js`, `primereact-10.9.9:components/lib/togglebutton/ToggleButton.js`).
- All three docs give the same advice: provide a state-independent `aria-label` or `aria-labelledby`, because the visible label changes (`primeng-21.1.9:apps/showcase/doc/togglebutton/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/togglebutton/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/togglebutton/accessibilitydoc.js`).
- Focus ring: structural CSS styles `:focus-visible` on the root in the `@primeuix` frameworks (`@primeuix/styles-2.0.3:dist/togglebutton/index.mjs`); in PrimeReact it is applied when the hidden input matches `:focus-visible` (`primereact-10.9.9:public/themes/lara-light-blue/theme.css`).

## 8. Theming

- Style classes (PrimeNG): `p-togglebutton p-component` plus `p-togglebutton-checked`, `p-invalid`, `p-disabled`, `p-togglebutton-sm p-inputfield-sm`, `p-togglebutton-lg p-inputfield-lg`, `p-togglebutton-fluid`; children `p-togglebutton-content`, `p-togglebutton-icon`, `p-togglebutton-icon-left`, `p-togglebutton-icon-right`, `p-togglebutton-label`. The catalog `style.classes` and the `ToggleButtonClasses` enum list `root`, `icon`, `iconLeft`, `iconRight`, `label` but omit `content`, which is rendered (`primeng-21.1.9:packages/primeng/src/togglebutton/style/togglebuttonstyle.ts`).
- Style classes (PrimeVue): the same root modifiers except `p-disabled`, then `p-togglebutton-content`, `p-togglebutton-icon`, `p-togglebutton-label`. The `ToggleButtonClasses` enum lists only `root`, `icon`, `label` (`primevue-4.5.5:packages/primevue/src/togglebutton/style/ToggleButtonStyle.js`; catalog `primevue.json` `modules.togglebuttonstyle.enumerations.ToggleButtonClasses`). Disabled styling there comes from the native `:disabled` selector.
- PrimeNG additions to the shared CSS: `.p-togglebutton-icon-right { order: 1 }` (implements `iconPos`) and `.p-togglebutton.ng-invalid.ng-dirty` using the invalid border color (`primeng-21.1.9:packages/primeng/src/togglebutton/style/togglebuttonstyle.ts`).
- Pass-through section keys: PrimeNG `root`, `content`, `icon`, `label`; PrimeVue the same plus `hooks`; PrimeReact `root`, `input`, `box`, `icon`, `label`, `tooltip`, `hooks` (`primeng-21.1.9:packages/primeng/src/types/togglebutton/togglebutton.types.ts`, `primevue-4.5.5:packages/primevue/src/togglebutton/ToggleButton.d.ts`, `primereact-10.9.9:components/lib/togglebutton/togglebutton.d.ts`). PrimeReact's `box` section is typed with `CheckboxPassThroughType`.
- Structural CSS: `@primeuix/styles-2.0.3:dist/togglebutton/index.mjs`, imported as `style` by PrimeNG and PrimeVue. It defines an inline-flex, clickable, `overflow: hidden` root with token-driven color, border and padding; a transparent content area whose own background and shadow are used when checked (the segmented "pill" look); hover colors only when not disabled and not checked; `sm` / `lg` padding and font size; `.p-togglebutton-fluid { width: 100% }`; and a disabled state that keeps `opacity: 1` and recolors background, border, text and icon instead.
- Design tokens (`@primeuix/themes-2.0.3:types/togglebutton/index.d.ts`, `@primeuix/themes-2.0.3:tokens/index.mjs`; three sections):
  - `root` (26): `padding`, `borderRadius`, `gap`, `fontWeight`, `disabledBackground`, `disabledBorderColor`, `disabledColor`, `invalidBorderColor`, `focusRing.width/style/color/offset/shadow`, `transitionDuration`, `sm.fontSize/padding`, `lg.fontSize/padding`, `background`, `checkedBackground`, `hoverBackground`, `borderColor`, `color`, `hoverColor`, `checkedColor`, `checkedBorderColor`.
  - `icon` (4): `color`, `hoverColor`, `checkedColor`, `disabledColor`.
  - `content` (6): `padding`, `borderRadius`, `checkedBackground`, `checkedShadow`, `sm.padding`, `lg.padding`.
  - Aura values: root `padding: 0.25rem`, `gap: 0.5rem`, `fontWeight: 500`; content `padding: 0.25rem 0.75rem`; light scheme root `background: {surface.100}` and checked content `background: {surface.0}`; dark scheme root `background: {surface.950}` and checked content `{surface.800}` (`@primeuix/themes-2.0.3:dist/aura/togglebutton/index.mjs`). Presets exist for aura, lara, material and nora.
- PrimeReact (no `@primeuix`, tokens N/A): `ToggleButtonBase.js` defines only classes (no `styles` entry). Root: `p-togglebutton p-component` with `p-disabled`, `p-highlight`, `p-invalid`; input `p-togglebutton-input`; box `p-button p-component` (and `p-button-icon-only`); icon `p-button-icon` with `p-button-icon-left/right`; label `p-button-label`. Structural and visual rules live in the shipped theme CSS, which stretches the input over the box and restyles `.p-button` inside `.p-togglebutton` (`primereact-10.9.9:components/lib/togglebutton/ToggleButtonBase.js`, `primereact-10.9.9:public/themes/lara-light-blue/theme.css`).
- Doc/source mismatch (PrimeReact): the class tables list `p-button-icon-left` and `p-button-text` for the icon and label, but the label class in source is `p-button-label`, and the tables omit `p-highlight` and `p-togglebutton-input` (`primereact-10.9.9:components/doc/togglebutton/styledoc.js`, `primereact-10.9.9:components/doc/togglebutton/theming/styleddoc.js`, `primereact-10.9.9:components/lib/togglebutton/ToggleButtonBase.js`).

## 9. Relationships

- Embeds no other Prime component in PrimeNG and PrimeVue. It uses the `Ripple` directive. PrimeReact embeds `Ripple` and optionally a `Tooltip`, and borrows Button's CSS classes rather than rendering a `Button` (`primereact-10.9.9:components/lib/togglebutton/ToggleButton.js`).
- Embedded by: SelectButton renders one ToggleButton per option in PrimeNG and PrimeVue and styles it through its `pcToggleButton` pass-through section (`primeng-21.1.9:packages/primeng/src/selectbutton/selectbutton.ts`, `primevue-4.5.5:packages/primevue/src/selectbutton/SelectButton.vue`). PrimeReact's SelectButton has its own `SelectButtonItem` and does not reference ToggleButton (`primereact-10.9.9:components/lib/selectbutton/SelectButtonItem.js`).
- Related Form components: ToggleSwitch (on/off switch semantics), Checkbox (boolean input), SelectButton (single or multiple choice from a set of toggle buttons), MultiStateCheckbox / TriStateCheckbox (more than two states).
- Related across categories: Button is the visual base in PrimeReact (`p-button` classes); Panel's `pcToggleButton` section name is unrelated to this component (see section 2).
- Alias chain: none.
- Shared base: PrimeNG and PrimeVue extend their `BaseEditableHolder`, shared with ToggleSwitch, Checkbox and other editable inputs (`primeng-21.1.9:packages/primeng/src/baseeditableholder/baseeditableholder.ts`, `primevue-4.5.5:packages/core/src/baseeditableholder/BaseEditableHolder.vue`).

## 10. Dependencies

- PrimeNG: `@angular/common`, `@angular/core`, `@angular/forms` (`NG_VALUE_ACCESSOR`), `primeng/api` (`PrimeTemplate`, `SharedModule`), `primeng/basecomponent` (`PARENT_INSTANCE`), `primeng/baseeditableholder`, `primeng/bind` (`Bind`, `BindModule`), `primeng/ripple`, `primeng/ts-helpers`, `primeng/base` (`BaseStyle`), `@primeuix/styles/togglebutton` (`primeng-21.1.9:packages/primeng/src/togglebutton/togglebutton.ts`, `primeng-21.1.9:packages/primeng/src/togglebutton/style/togglebuttonstyle.ts`).
- PrimeVue: `@primevue/core/baseeditableholder`, `@primevue/core/base/style`, `@primeuix/utils` (`cn`, `object/isNotEmpty`), `@primeuix/styles/togglebutton`, `primevue/ripple`, `primevue/togglebutton/style` (`primevue-4.5.5:packages/primevue/src/togglebutton/ToggleButton.vue`, `primevue-4.5.5:packages/primevue/src/togglebutton/BaseToggleButton.vue`, `primevue-4.5.5:packages/primevue/src/togglebutton/style/ToggleButtonStyle.js`).
- PrimeReact: `../api/Api` (`PrimeReactContext`), `../componentbase/ComponentBase` (`useHandleStyle`), `../hooks/Hooks` (`useMergeProps`, `useMountEffect`), `../ripple/Ripple`, `../tooltip/Tooltip`, `../utils/Utils` (`classNames`, `DomHandler`, `IconUtils`, `ObjectUtils`) (`primereact-10.9.9:components/lib/togglebutton/ToggleButton.js`, `primereact-10.9.9:components/lib/togglebutton/ToggleButtonBase.js`).
- External npm packages: none beyond the framework.

## 11. Framework differences

| Aspect                | PrimeNG                                                  | PrimeVue                                       | PrimeReact                                                          |
| --------------------- | -------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------- |
| Root element          | Host element with `role="button"`                        | Native `<button type="button">`                | `div` wrapping hidden checkbox + `div.p-button`                     |
| Pressed semantics     | `aria-pressed` on host                                   | `aria-pressed` on button                       | None (checkbox `checked`); docs claim button role + `aria-pressed`  |
| Keyboard              | `Enter` and `Space` handled in code                      | Native button (Enter / Space)                  | `Space` handler on hidden checkbox + native checkbox behaviour      |
| Disabled              | Signal; no native attribute; default tab index stays `0` | Native `disabled`                              | Native `disabled` on input; `tabIndex` `-1`                         |
| Value binding         | `ngModel` / `formControlName`                            | `v-model`, `@primevue/forms`                   | Controlled `checked` + `onChange`                                   |
| Change event payload  | `{ originalEvent, checked }`                             | Native `Event` (value via `update:modelValue`) | `{ originalEvent, value, target, stopPropagation, preventDefault }` |
| Icon position         | `iconPos` (`left` / `right`)                             | N/A                                            | `iconPos`                                                           |
| Label logic           | `onLabel` / `offLabel` independent                       | Both required                                  | Both required                                                       |
| Custom content        | `content` + `icon` templates                             | Default + `icon` slots                         | N/A (`children` not rendered)                                       |
| Size / fluid          | `size`, `fluid`                                          | `size`, `fluid`                                | N/A                                                                 |
| Allow empty           | `allowEmpty`                                             | N/A                                            | N/A                                                                 |
| Read-only             | N/A                                                      | `readonly`                                     | `readonly`                                                          |
| Tooltip / methods     | N/A                                                      | N/A                                            | `tooltip`, `tooltipOptions`, `focus()`, `getElement()`              |
| Checked class         | `p-togglebutton-checked`                                 | `p-togglebutton-checked`                       | `p-highlight`                                                       |
| Styling source        | `@primeuix/styles` + tokens                              | `@primeuix/styles` + tokens                    | Theme CSS files (reuse `p-button`); no tokens                       |
| `className` / `style` | `class` (`styleClass` deprecated)                        | `class` merged onto root                       | `className` applied to root and box; `style` applied to the input   |
| Deprecations          | `styleClass`                                             | None                                           | None                                                                |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/togglebutton/togglebutton.ts`
- `primeng-21.1.9:packages/primeng/src/togglebutton/public_api.ts`
- `primeng-21.1.9:packages/primeng/src/togglebutton/style/togglebuttonstyle.ts`
- `primeng-21.1.9:packages/primeng/src/types/togglebutton/togglebutton.types.ts`
- `primeng-21.1.9:packages/primeng/src/baseeditableholder/baseeditableholder.ts`
- `primeng-21.1.9:packages/primeng/src/selectbutton/selectbutton.ts`
- `primeng-21.1.9:packages/primeng/src/tree/tree.ts`
- `primeng-21.1.9:packages/primeng/src/types/panel/panel.types.ts`
- `primeng-21.1.9:apps/showcase/doc/togglebutton/` (`import-doc.ts`, `basic-doc.ts`, `customized-doc.ts`, `sizes-doc.ts`, `fluid-doc.ts`, `invalid-doc.ts`, `disabled-doc.ts`, `templatedrivenforms-doc.ts`, `reactiveforms-doc.ts`, `accessibility-doc.ts`, `pt/PTViewer.ts`)
- `primeng-21.1.9:apps/showcase/assets/data/menu.json`
- `primevue-4.5.5:packages/primevue/src/togglebutton/ToggleButton.vue`
- `primevue-4.5.5:packages/primevue/src/togglebutton/BaseToggleButton.vue`
- `primevue-4.5.5:packages/primevue/src/togglebutton/ToggleButton.d.ts`
- `primevue-4.5.5:packages/primevue/src/togglebutton/package.json`
- `primevue-4.5.5:packages/primevue/src/togglebutton/style/ToggleButtonStyle.js`
- `primevue-4.5.5:packages/primevue/src/selectbutton/SelectButton.vue`
- `primevue-4.5.5:packages/primevue/src/panel/Panel.d.ts`
- `primevue-4.5.5:packages/primevue/src/treetable/BodyCell.vue`
- `primevue-4.5.5:packages/primevue/src/index.js`
- `primevue-4.5.5:packages/core/src/baseeditableholder/BaseEditableHolder.vue`
- `primevue-4.5.5:apps/showcase/doc/togglebutton/` (`ImportDoc.vue`, `BasicDoc.vue`, `CustomizedDoc.vue`, `SizesDoc.vue`, `FluidDoc.vue`, `InvalidDoc.vue`, `DisabledDoc.vue`, `FormsDoc.vue`, `AccessibilityDoc.vue`, `pt/index.vue`, `pt/PTViewer.vue`, `theming/TailwindDoc.vue`)
- `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primereact-10.9.9:components/lib/togglebutton/ToggleButton.js`
- `primereact-10.9.9:components/lib/togglebutton/ToggleButtonBase.js`
- `primereact-10.9.9:components/lib/togglebutton/togglebutton.d.ts`
- `primereact-10.9.9:components/lib/togglebutton/package.json`
- `primereact-10.9.9:components/lib/selectbutton/SelectButtonItem.js`
- `primereact-10.9.9:components/lib/primereact.all.js`
- `primereact-10.9.9:components/doc/togglebutton/` (`importdoc.js`, `basicdoc.js`, `customizeddoc.js`, `invaliddoc.js`, `disableddoc.js`, `accessibilitydoc.js`, `styledoc.js`, `pt/wireframe.js`, `theming/styleddoc.js`, `theming/tailwinddoc.js`)
- `primereact-10.9.9:components/layout/menu.json`
- `primereact-10.9.9:public/themes/lara-light-blue/theme.css`
- `@primeuix/styles-2.0.3:dist/togglebutton/index.mjs`
- `@primeuix/themes-2.0.3:types/togglebutton/index.d.ts`
- `@primeuix/themes-2.0.3:tokens/index.mjs`
- `@primeuix/themes-2.0.3:dist/aura/togglebutton/index.mjs`
