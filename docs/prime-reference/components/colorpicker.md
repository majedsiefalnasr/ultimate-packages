# ColorPicker

**Category:** Form · **Frameworks:** PrimeNG 21.1.9 · PrimeVue 4.5.5 · PrimeReact 10.9.9

## 1. Summary

ColorPicker lets the user choose a color from a two-dimensional saturation/brightness square plus a vertical hue slider. It has two presentations: a popup mode, where a small read-only input shows the current color as its background and opens an overlay panel on click or Space, and an inline mode (`inline`), where the panel is rendered directly in the page. The value can be exposed as a hex string, an `{r, g, b}` object, or an `{h, s, b}` object, selected with `format`. The panel has fixed pixel geometry (150×150 square, 17px hue strip, 193×166 panel); there is no alpha channel, no text fields, and no swatches.

## 2. Names & status

- Canonical name: **ColorPicker** (file `colorpicker`); listed in the Form group of the PrimeVue showcase menu (`primevue-4.5.5:apps/showcase/assets/menu/menu.json`).
- PrimeNG: `ColorPicker` (selectors `p-colorPicker`, `p-colorpicker`, `p-color-picker`); stable. `styleClass` is deprecated since v20.0.0 (use `class`); `showTransitionOptions` and `hideTransitionOptions` are deprecated since v21.0.0 (use `motionOptions`).
- PrimeVue: `ColorPicker`; stable. The `panelClass` prop is flagged deprecated since v4.0 in favor of `overlayClass`, yet the source still applies both.
- PrimeReact: `ColorPicker`; stable.
- Doc-comment slip shared by PrimeNG and PrimeVue: the component description says "ColorPicker groups a collection of contents in tabs" (copied from Tabs); PrimeReact's prop docs say "Defines valid properties in AutoComplete component".

## 3. Per framework

### PrimeNG 21.1.9

- Import: `ColorPickerModule` from `primeng/colorpicker` (`primeng-21.1.9:apps/showcase/doc/colorpicker/import-doc.ts`).
- Standalone `ColorPicker` class, OnPush, no view encapsulation, extends `BaseEditableHolder` (so it is a `ControlValueAccessor` through `COLORPICKER_VALUE_ACCESSOR` and works with `ngModel` and reactive forms); uses the `Bind` host directive.
- Source: `primeng-21.1.9:packages/primeng/src/colorpicker/colorpicker.ts`, style `primeng-21.1.9:packages/primeng/src/colorpicker/style/colorpickerstyle.ts`, PT types `primeng-21.1.9:packages/primeng/src/types/colorpicker/colorpicker.types.ts`, entry `primeng-21.1.9:packages/primeng/src/colorpicker/public_api.ts`, base `primeng-21.1.9:packages/primeng/src/baseeditableholder/baseeditableholder.ts`.
- Package also contains `primeng-21.1.9:packages/primeng/src/colorpicker/images/color.png` and `hue.png`, which no code references (the gradients come from CSS).

### PrimeVue 4.5.5

- Import: `import ColorPicker from 'primevue/colorpicker'` (`primevue-4.5.5:apps/showcase/doc/colorpicker/ImportDoc.vue`).
- `<ColorPicker>` renders a `<div>` root; `v-model` binds the value; extends `BaseEditableHolder` so it plugs into `@primevue/forms`.
- Source: `primevue-4.5.5:packages/primevue/src/colorpicker/ColorPicker.vue`, `primevue-4.5.5:packages/primevue/src/colorpicker/BaseColorPicker.vue`, `primevue-4.5.5:packages/primevue/src/colorpicker/ColorPicker.d.ts`, style `primevue-4.5.5:packages/primevue/src/colorpicker/style/ColorPickerStyle.js`, base `primevue-4.5.5:packages/core/src/baseeditableholder/BaseEditableHolder.vue`.

### PrimeReact 10.9.9

- Import: `import { ColorPicker } from 'primereact/colorpicker'` (`primereact-10.9.9:components/doc/colorpicker/importdoc.js`).
- `React.memo(forwardRef(...))` function component; controlled through `value` and `onChange`. The popup panel lives in a sub-component that wraps content in `CSSTransition` and `Portal` unless `inline`.
- Source: `primereact-10.9.9:components/lib/colorpicker/ColorPicker.js`, `primereact-10.9.9:components/lib/colorpicker/ColorPickerBase.js`, `primereact-10.9.9:components/lib/colorpicker/ColorPickerPanel.js`, `primereact-10.9.9:components/lib/colorpicker/colorpicker.d.ts`.

## 4. Anatomy

- **root** — `p-colorpicker p-component`; in popup mode also `p-colorpicker-overlay`; while dragging, a `p-colorpicker-dragging` class/attribute.
- **preview** (the input) — read-only `type="text"` input, `p-colorpicker-preview` (PrimeReact calls this part `input` and also adds `p-inputtext`). Its background is the chosen color. Popup mode only.
- **panel** — `p-colorpicker-panel` (+ `p-colorpicker-panel-inline` when inline, `p-disabled`; PrimeVue also `p-invalid`). In PrimeReact the popup panel additionally has `p-colorpicker-overlay-panel`.
- **content** — wrapper `p-colorpicker-content` inside the panel.
- **colorSelector** — the 150×150 saturation/brightness area, `p-colorpicker-color-selector`, containing:
  - **colorBackground** — the gradient layer, `p-colorpicker-color-background` (PrimeReact: `p-colorpicker-color`);
  - **colorHandle** — the draggable circle, `p-colorpicker-color-handle`.
- **hue** — the vertical hue slider, `p-colorpicker-hue`, containing **hueHandle** (`p-colorpicker-hue-handle`).
- PrimeNG renders the popup through its `p-overlay` component (PT key `pcOverlay`); PrimeVue through `Portal` + `<transition name="p-anchored-overlay">`; PrimeReact through `Portal` + `CSSTransition` (class `p-connected-overlay`).

## 5. API highlights

- **Value**
  - `format`: `'hex'` (default), `'rgb'`, `'hsb'`. Hex strings are unprefixed in PrimeVue and PrimeReact (`'6466f1'`); PrimeNG writes `'#' + hex` to the model, though it parses input with or without `#`.
  - `defaultColor` (default `'ff0000'`) is used when the model is empty.
  - Model: PrimeNG `ngModel`/`formControl`; PrimeVue `modelValue` (+ `defaultValue`, `formControl`, `name`); PrimeReact `value` (`string | {r,g,b} | {h,s,b}`).
- **Mode and placement**
  - `inline` (default false). `appendTo`: PrimeNG inherits `config.overlayAppendTo()` (default `'self'`), PrimeVue default `'body'`, PrimeReact default `document.body`.
  - `autoZIndex` (true) in PrimeNG/PrimeVue; PrimeVue also `baseZIndex` (0). PrimeReact reads `autoZIndex` and the overlay z-index from `PrimeReactContext`.
- **State and forms**
  - `disabled`, `inputId`, `tabindex`/`tabIndex`, `name`; PrimeNG and PrimeVue add `invalid`; PrimeNG adds `required` and `autofocus`; PrimeReact has `autoFocus` and extends the native input attributes.
- **Events**
  - PrimeNG: `onChange` (`ColorPickerChangeEvent` with `originalEvent`, `value`), `onShow`, `onHide`.
  - PrimeVue: `update:modelValue`, `value-change`, `change` (`{event, value}`), `show`, `hide`.
  - PrimeReact: `onChange` (`ColorPickerChangeEvent` carrying `value`), `onShow`, `onHide`.
- **Imperative API**: PrimeNG `show()`, `hide()`, `togglePanel()`; PrimeReact ref methods `show`, `hide`, `focus`, `getElement`, `getInput`, `getOverlay`; PrimeVue exposes none.
- **Customization**
  - PrimeNG `overlayOptions`, `motionOptions`; PrimeVue `overlayClass`, `panelClass` (deprecated); PrimeReact `inputClassName`, `inputStyle`, `panelClassName`, `panelStyle`, `transitionOptions`, `tooltip`, `tooltipOptions`.
  - No slots or templates in any framework.
- Catalog: `docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`, `docs/prime-reference/catalog/primereact.json` (module `colorpicker`).

## 6. Usage guidance

- **Import** — one import per framework; PrimeNG needs the module or the standalone class (`primeng-21.1.9:apps/showcase/doc/colorpicker/import-doc.ts`, `primevue-4.5.5:apps/showcase/doc/colorpicker/ImportDoc.vue`, `primereact-10.9.9:components/doc/colorpicker/importdoc.js`).
- **Basic** — bind a model (`ngModel`, `v-model`, or `value` + `onChange`) and the component shows the popup variant by default (`primeng-21.1.9:apps/showcase/doc/colorpicker/basic-doc.ts`, `primevue-4.5.5:apps/showcase/doc/colorpicker/BasicDoc.vue`, `primereact-10.9.9:components/doc/colorpicker/basicdoc.js`).
- **Inline** — set `inline` to render the panel without the input and overlay (`primeng-21.1.9:apps/showcase/doc/colorpicker/inline-doc.ts`, `primevue-4.5.5:apps/showcase/doc/colorpicker/InlineDoc.vue`, `primereact-10.9.9:components/doc/colorpicker/inlinedoc.js`).
- **Format** — pick `hex`, `rgb`, or `hsb` to choose the model's shape; the docs also label the input through `inputId` (`primeng-21.1.9:apps/showcase/doc/colorpicker/format-doc.ts`, `primevue-4.5.5:apps/showcase/doc/colorpicker/FormatDoc.vue`, `primereact-10.9.9:components/doc/colorpicker/formatdoc.js`).
- **Disabled** — `disabled` blocks opening and dragging (`primeng-21.1.9:apps/showcase/doc/colorpicker/disabled-doc.ts`, `primevue-4.5.5:apps/showcase/doc/colorpicker/DisabledDoc.vue`, `primereact-10.9.9:components/doc/colorpicker/disableddoc.js`).
- **Forms (PrimeNG)** — reactive form with `formControlName` and `Validators.required`, plus a template-driven `ngModel` + `required` variant (`primeng-21.1.9:apps/showcase/doc/colorpicker/reactiveforms-doc.ts`, `primeng-21.1.9:apps/showcase/doc/colorpicker/templatedrivenforms-doc.ts`).
- **Forms (PrimeVue)** — inside `@primevue/forms` `<Form>` via `name`, validated with a zod resolver (`primevue-4.5.5:apps/showcase/doc/colorpicker/FormsDoc.vue`). PrimeReact has no forms page.
- **Accessibility** — the page documents screen-reader limits; do not rely on it as the only way to enter a color (`primeng-21.1.9:apps/showcase/doc/colorpicker/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/colorpicker/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/colorpicker/accessibilitydoc.js`).
- **Styling** — PrimeReact lists the CSS classes (`primereact-10.9.9:components/doc/colorpicker/styledoc.js`, `primereact-10.9.9:components/doc/colorpicker/theming/styleddoc.js`); Tailwind pages exist for PrimeVue and PrimeReact (`primevue-4.5.5:apps/showcase/doc/colorpicker/theming/TailwindDoc.vue`, `primereact-10.9.9:components/doc/colorpicker/theming/tailwinddoc.js`).
- **Pass Through** — viewers exist for PrimeNG and PrimeVue (`primeng-21.1.9:apps/showcase/doc/colorpicker/pt/PTViewer.ts`, `primevue-4.5.5:apps/showcase/doc/colorpicker/pt/PTViewer.vue`); PrimeReact has a wireframe (`primereact-10.9.9:components/doc/colorpicker/pt/wireframe.js`).
- No services are required for the component itself (the Forms demos use a toast service only for feedback).

## 7. Accessibility

- All three showcase accessibility pages carry the same text: the WAI-ARIA specification has no color-picker role, and the native color input behaves inconsistently, so the component is stated to be not compatible with screen readers. Text fields (hsl, rgba, hex) are listed as planned (`primeng-21.1.9:apps/showcase/doc/colorpicker/accessibility-doc.ts`, `primevue-4.5.5:apps/showcase/doc/colorpicker/AccessibilityDoc.vue`, `primereact-10.9.9:components/doc/colorpicker/accessibilitydoc.js`).
- Keyboard actually implemented (all three): on the preview input, Space toggles the popup; Escape and Tab close it; click toggles; Tab moves focus to the input as a normal text field. Outside click and scrolling also close the popup; PrimeVue additionally closes on window resize outside touch devices.
- Pointer: the square and hue strip respond to mouse drag (document-level move/up listeners) and touch drag.
- **Doc/source mismatch:** the keyboard tables promise arrow-key control of the color square and hue slider, Space moving focus to the slider, and Enter/Space selecting and closing. The panel elements have no `tabindex`, no key handlers, and no role/ARIA attributes in any framework, so none of that exists in the source.
- ARIA: only PrimeNG sets `aria-label` on the input, from the locale key `aria.selectColor` (`'Select a color'`; `primeng-21.1.9:packages/primeng/src/config/primeng.ts`, `primeng-21.1.9:packages/primeng/src/api/translationkeys.ts`). PrimeVue and PrimeReact add none, so supply a label via `inputId` + `<label>` or native attributes.
- PrimeReact's Escape handling uses `useGlobalOnEscapeKey` guarded by a `closeOnEscape` prop that is neither declared in `ColorPickerBase` defaults nor in the typings.

## 8. Theming

- Style classes: see section 4. PrimeVue's style module defines `content: 'p-colorpicker-content'` as an element name but it is missing from the `classes` map, so `cx('content')` resolves to nothing there; the PrimeNG enum also omits `content`.
- PT keys:
  - PrimeNG: `host`, `root`, `preview`, `panel`, `content`, `colorSelector`, `colorBackground`, `colorHandle`, `hue`, `hueHandle`, `motion`, plus nested `pcOverlay`.
  - PrimeVue: `root`, `preview`, `overlay`, `content`, `colorSelector`, `colorBackground`, `colorHandle`, `hue`, `hueHandle`, `hooks`, `transition`. The template merges `ptm('panel')` and `ptm('overlay')` onto the panel, but the typings declare no `panel` key.
  - PrimeReact: `root`, `input`, `panel`, `content`, `selector`, `color`, `colorHandle`, `hue`, `hueHandle`, `tooltip`, `hooks`, `transition`.
  - Global PT option: `colorpicker` in `primevue-4.5.5:packages/primevue/src/config/Config.d.ts` and in `primereact-10.9.9:components/lib/api/api.d.ts`.
- Design tokens (`@primeuix/themes-2.0.3:types/colorpicker/index.d.ts`): `root.transitionDuration`; `preview` (`width`, `height`, `borderRadius`, `focusRing.*`); `panel` (`shadow`, `borderRadius`, `background`, `borderColor`); `handle.color`. The type file declares PrimeNG and PrimeVue as the compatible libraries.
- Presets: `@primeuix/themes-2.0.3:dist/aura/colorpicker/index.mjs`, `@primeuix/themes-2.0.3:dist/lara/colorpicker/index.mjs`, `@primeuix/themes-2.0.3:dist/material/colorpicker/index.mjs`, `@primeuix/themes-2.0.3:dist/nora/colorpicker/index.mjs`. Preview size is 1.5rem (Aura, Nora), 1.75rem (Lara), 2rem (Material). Aura's panel uses `surface.800`/`surface.900` (light) and `surface.900`/`surface.700` (dark) with a `surface.0` handle.
- Structural CSS: `@primeuix/styles-2.0.3:dist/colorpicker/index.mjs`; it uses logical inset properties. It reads `colorpicker.preview.focus.border.color`, a token that does not appear in the token type.
- PrimeReact inlines its own CSS in `ColorPickerBase.js` (layer `primereact`) using physical `top`/`left`, so it is not RTL-aware.

## 9. Relationships

- Embeds / uses: the overlay machinery (PrimeNG `p-overlay`; Portal in PrimeVue and PrimeReact); PrimeReact also embeds Tooltip; PrimeNG uses the `pAutoFocus` directive.
- The preview input shares the [InputText](inputtext.md) look (PrimeReact literally adds `p-inputtext`).
- Popup-capable siblings with the same open/close flow: [Select](select.md), [DatePicker](datepicker.md), [Popover](popover.md).
- Alternative drag-based numeric input: [Knob](knob.md).
- Form integration: PrimeNG `BaseEditableHolder`, PrimeVue `BaseEditableHolder` + `@primevue/forms`.

## 10. Dependencies

- PrimeNG: `@primeuix/styles/colorpicker`, `@primeuix/motion`, internal overlay, bind, autofocus, and shared modules.
- PrimeVue: `@primeuix/styles/colorpicker`, `@primeuix/utils` (dom, zindex), `@primevue/core` (base editable holder, connected-overlay scroll handler), `primevue/portal`.
- PrimeReact: internal hooks (`useOverlayListener`, `useEventListener`, `useGlobalOnEscapeKey`, `useDisplayOrder`), `CSSTransition` (react-transition-group), `Portal`, `Tooltip`, `DomHandler`, `ZIndexUtils`, `OverlayService`.
- No third-party color library in any framework; HSB/RGB/hex conversion is hand-written.

## 11. Framework differences

| Aspect                 | PrimeNG                                    | PrimeVue                            | PrimeReact                             |
| ---------------------- | ------------------------------------------ | ----------------------------------- | -------------------------------------- |
| Hex model value        | `'#rrggbb'` written                        | `'rrggbb'`                          | `'rrggbb'`                             |
| `appendTo` default     | `'self'` (config)                          | `'body'`                            | `document.body`                        |
| Forms integration      | CVA (`ngModel`, reactive)                  | `@primevue/forms` via `name`        | controlled `value`/`onChange` only     |
| `invalid` / `required` | yes / yes                                  | yes / no                            | no / no                                |
| ARIA label             | `aria-label` from locale                   | none                                | none                                   |
| Imperative methods     | `show`, `hide`, `togglePanel`              | none                                | `show`, `hide`, `focus`, `getInput`, … |
| Hue memory at s/b = 0  | no separate hue memory                     | keeps `localHue`                    | hue is lost for grey/black             |
| Gradient layer class   | `p-colorpicker-color-background`           | same                                | `p-colorpicker-color`                  |
| PT overlay key         | `pcOverlay` (nested)                       | `overlay`                           | `panel` + `transition`                 |
| Tooltip props          | none                                       | none                                | `tooltip`, `tooltipOptions`            |
| Transition config      | `motionOptions`                            | CSS transition `p-anchored-overlay` | `transitionOptions` (CSSTransition)    |
| CSS source             | `@primeuix/styles` + tokens                | same                                | inline CSS in `ColorPickerBase.js`     |
| Deprecated             | `styleClass`, `show/hideTransitionOptions` | `panelClass`                        | —                                      |
| Showcase pages         | + reactive/template forms, PT viewer       | + forms, Tailwind, PT viewer        | + styled, Tailwind, wireframe          |

## 12. Sources

- `primeng-21.1.9:packages/primeng/src/colorpicker/colorpicker.ts`, `primeng-21.1.9:packages/primeng/src/colorpicker/public_api.ts`, `primeng-21.1.9:packages/primeng/src/colorpicker/style/colorpickerstyle.ts`, `primeng-21.1.9:packages/primeng/src/colorpicker/colorpicker.spec.ts`, `primeng-21.1.9:packages/primeng/src/types/colorpicker/colorpicker.types.ts`
- `primeng-21.1.9:packages/primeng/src/baseeditableholder/baseeditableholder.ts`, `primeng-21.1.9:packages/primeng/src/config/primeng.ts`, `primeng-21.1.9:packages/primeng/src/api/translationkeys.ts`
- `primeng-21.1.9:apps/showcase/doc/colorpicker/import-doc.ts`, `primeng-21.1.9:apps/showcase/doc/colorpicker/basic-doc.ts`, `primeng-21.1.9:apps/showcase/doc/colorpicker/inline-doc.ts`, `primeng-21.1.9:apps/showcase/doc/colorpicker/format-doc.ts`, `primeng-21.1.9:apps/showcase/doc/colorpicker/disabled-doc.ts`, `primeng-21.1.9:apps/showcase/doc/colorpicker/reactiveforms-doc.ts`, `primeng-21.1.9:apps/showcase/doc/colorpicker/templatedrivenforms-doc.ts`, `primeng-21.1.9:apps/showcase/doc/colorpicker/accessibility-doc.ts`, `primeng-21.1.9:apps/showcase/doc/colorpicker/pt/PTViewer.ts`
- `primevue-4.5.5:packages/primevue/src/colorpicker/ColorPicker.vue`, `primevue-4.5.5:packages/primevue/src/colorpicker/BaseColorPicker.vue`, `primevue-4.5.5:packages/primevue/src/colorpicker/ColorPicker.d.ts`, `primevue-4.5.5:packages/primevue/src/colorpicker/style/ColorPickerStyle.js`, `primevue-4.5.5:packages/primevue/src/config/Config.d.ts`, `primevue-4.5.5:packages/core/src/baseeditableholder/BaseEditableHolder.vue`, `primevue-4.5.5:apps/showcase/assets/menu/menu.json`
- `primevue-4.5.5:apps/showcase/doc/colorpicker/ImportDoc.vue`, `primevue-4.5.5:apps/showcase/doc/colorpicker/BasicDoc.vue`, `primevue-4.5.5:apps/showcase/doc/colorpicker/InlineDoc.vue`, `primevue-4.5.5:apps/showcase/doc/colorpicker/FormatDoc.vue`, `primevue-4.5.5:apps/showcase/doc/colorpicker/DisabledDoc.vue`, `primevue-4.5.5:apps/showcase/doc/colorpicker/FormsDoc.vue`, `primevue-4.5.5:apps/showcase/doc/colorpicker/AccessibilityDoc.vue`, `primevue-4.5.5:apps/showcase/doc/colorpicker/theming/TailwindDoc.vue`, `primevue-4.5.5:apps/showcase/doc/colorpicker/pt/PTViewer.vue`
- `primereact-10.9.9:components/lib/colorpicker/ColorPicker.js`, `primereact-10.9.9:components/lib/colorpicker/ColorPickerBase.js`, `primereact-10.9.9:components/lib/colorpicker/ColorPickerPanel.js`, `primereact-10.9.9:components/lib/colorpicker/colorpicker.d.ts`, `primereact-10.9.9:components/lib/api/api.d.ts`
- `primereact-10.9.9:components/doc/colorpicker/importdoc.js`, `primereact-10.9.9:components/doc/colorpicker/basicdoc.js`, `primereact-10.9.9:components/doc/colorpicker/inlinedoc.js`, `primereact-10.9.9:components/doc/colorpicker/formatdoc.js`, `primereact-10.9.9:components/doc/colorpicker/disableddoc.js`, `primereact-10.9.9:components/doc/colorpicker/accessibilitydoc.js`, `primereact-10.9.9:components/doc/colorpicker/styledoc.js`, `primereact-10.9.9:components/doc/colorpicker/theming/styleddoc.js`, `primereact-10.9.9:components/doc/colorpicker/theming/tailwinddoc.js`, `primereact-10.9.9:components/doc/colorpicker/pt/wireframe.js`
- `@primeuix/styles-2.0.3:dist/colorpicker/index.mjs`
- `@primeuix/themes-2.0.3:types/colorpicker/index.d.ts`, `@primeuix/themes-2.0.3:dist/aura/colorpicker/index.mjs`, `@primeuix/themes-2.0.3:dist/lara/colorpicker/index.mjs`, `@primeuix/themes-2.0.3:dist/material/colorpicker/index.mjs`, `@primeuix/themes-2.0.3:dist/nora/colorpicker/index.mjs`
- `docs/prime-reference/catalog/primeng.json`, `docs/prime-reference/catalog/primevue.json`, `docs/prime-reference/catalog/primereact.json`
