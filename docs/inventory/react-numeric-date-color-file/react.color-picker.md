# React UColorPicker

ID: react.color-picker

Framework: react; availability: public

## Authored interpretation

Controlled color picker with a read-only swatch input and a portalled or inline saturation/brightness and hue panel driven by mouse and touch, emitting hex (rrggbb), RGB or HSB values, with a ref handle and pass-through.

## Framework surface

UColorPicker is a forwardRef (React.forwardRef<UColorPickerRef, UColorPickerProps>, displayName UColorPicker) whose ref handle UColorPickerRef has show, hide, focus, getElement, getOverlay and getInput. UColorPickerProps extends the div HTML attributes without onChange, defaultValue and defaultChecked. Props: value (UColorPickerValue | null), onChange (receives UColorPickerChangeEvent), format (hex | rgb | hsb, default hex), defaultColor (default "ff0000"), disabled, inline, appendTo (an element, 'self' or a function returning an element; default document.body through Portal), autoFocus, name, inputId, inputRef, inputClassName, inputStyle, panelClassName, panelStyle, tabIndex, transitionOptions (MotionOptions from @ultimate/uix-motion, merged over { name: 'u-anchored-overlay' }), onShow, onHide, unstyled, pt and ptOptions. aria-label (default 'Select a color') and aria-labelledby go to the preview input; every other attribute, including id and className, goes to the root. UColorPickerValue is string | Rgb | Hsb; Rgb and Hsb are local and not exported. UColorPickerChangeEvent carries originalEvent (Event | React.SyntheticEvent), value, target { name, id, value } and no-op preventDefault and stopPropagation (PrimeReact's form-style shape). The style module exports ColorPickerRootClassesParams (inline, dragging), ColorPickerPreviewClassesParams (disabled), ColorPickerPanelClassesParams (inline, disabled) and colorPickerStyleModule; none is re-exported by index.ts.

Value handling: the HSB state is initialised from value and re-derived by toHsb when value, format or defaultColor change, except while a drag runs (draggingRef), so the picker keeps its own colour during a drag. toHsb converts value by format without checking its type against format (rgb is cast to Rgb, hsb is cast to Hsb unvalidated, hex is cast to string); a null value uses defaultColor. hexToRgb strips an optional '#', calls parseInt(hex, 16) and splits it with >> 16, (& 0x00ff00) >> 8 and & 0x0000ff, so 3-digit hex misparses (#fff is 0x0fff and gives 0, 15, 255), 8-digit hex gives out-of-range channels (#12345678 gives 4660, 86, 120) and non-hex text gives NaN that becomes black; a non-string gives black. rgbToHsb returns h = 300 for gray and black (s = 0 path computes -1 * 60 + 360); HSB output is unrounded. hsbToRgb rounds h, s and v first, treats 360 as 0 and rounds the channels; rgbToHex does not clamp. Emitted hex is six lowercase digits without '#', as PrimeReact emits; the hsb format emits a copy of the HSB object.

Open and close: show and hide only set overlayVisible, a pure state update; the Portal mounts when it becomes true. Once the panel is in the DOM an update effect sets its z-index through useZIndex ('overlay'), aligns it to the root with alignOverlay from @ultimate/uix-utils/dom ('self' or 'body'), binds useOverlayListener (an outside click hides the panel; a window resize realigns it) and a ConnectedOverlayScrollHandler that realigns it on a scroll of any scrollable ancestor. useMotion runs the enter and leave motion; onShow is called after the enter motion and onHide after the leave motion, which also clears the z-index and unmounts the Portal. Escape and Tab on the input call hide(); Space toggles with preventDefault; Enter does nothing; a click toggles unless disabled. The panel stays open when disabled becomes true. useUnmountEffect stops a running drag, unbinds the overlay and scroll listeners and clears the z-index.

Input: unless inline, a read-only text input with the preview class (disabled modifier) plus inputClassName, backgroundColor from the HSB state over inputStyle, id from inputId, tabIndex, disabled, aria-label 'Select a color' by default, aria-labelledby, aria-haspopup=true and aria-expanded. Colour changes are pointer-only: there is no keyboard adjustment inside the panel, and the panel, square and strip have no role or ARIA attribute, as in PrimeReact source (ADR-104).

Panel: a div with the panel class (inline and disabled modifiers) plus panelClassName and panelStyle, rendered in place when inline and otherwise through Portal; it holds content, a 150 x 150 colorSelector and a hue strip, each with onMouseDown and onTouchStart. A press returns when disabled, ends any running drag, picks immediately and binds document listeners (mousemove and mouseup, or a non-passive touchmove plus touchend and touchcancel); moves read the pointer's clientX and clientY against the element's getBoundingClientRect, follow only the touch that started the drag and are ignored while disabled, and the listeners are removed when the drag ends or on unmount. pickColor sets saturation floor(100 * clamp(x, 0, 150) / 150) and brightness floor(100 * (150 - clamp(y, 0, 150)) / 150) and keeps the current hue; pickHue sets hue floor(360 * (150 - clamp(y)) / 150) and keeps saturation and brightness; validateHsb clamps every pick. Handle positions use floor(150 * s / 100), floor(150 * (100 - b) / 100) and floor(150 - 150 * h / 360). While a drag runs the root carries u-color-picker-dragging.

Pass-through: createPassThrough('colorpicker') with useMergeProps; sections root, preview, panel, content, colorSelector, colorBackground, colorHandle, hue and hueHandle, with PrimeReact's input, selector and color merged first for preview, colorSelector and colorBackground.

Styles: root class u-color-picker u-component (u-color-picker-overlay unless inline); class keys root, preview, panel, content, colorSelector, colorBackground, colorHandle, hue and hueHandle. The CSS imports the shared @ultimate/uix-styles/colorpicker module (ADR-082, ADR-104). componentName is colorpicker, the Aura registry key. Excluded (ADR-104): tooltip and tooltipOptions (compose UTooltip), PrimeReact's global context lookup, the props entry of the ref handle and the p-inputtext class on the preview.

## Public exports

@ultimate/react#UColorPicker
@ultimate/react/color-picker#UColorPicker
@ultimate/react#UColorPickerProps
@ultimate/react/color-picker#UColorPickerProps
@ultimate/react#UColorPickerChangeEvent
@ultimate/react/color-picker#UColorPickerChangeEvent
@ultimate/react#UColorPickerRef
@ultimate/react/color-picker#UColorPickerRef
@ultimate/react#UColorPickerValue
@ultimate/react/color-picker#UColorPickerValue

## Owned source and evidence

packages/react/src/color-picker/index.ts
packages/react/src/color-picker/color-picker.tsx
packages/react/src/color-picker/color-picker-style.ts

```text
packages/react/src/color-picker/index.ts: export { UColorPicker } from
packages/react/src/color-picker/index.ts: UColorPickerRef,
packages/react/src/color-picker/color-picker.tsx: export const UColorPicker = React.forwardRef<UColorPickerRef, UColorPickerProps>(
packages/react/src/color-picker/color-picker.tsx: export interface UColorPickerRef {
packages/react/src/color-picker/color-picker.tsx: const show = React.useCallback(() => setOverlayVisible(true), []);
packages/react/src/color-picker/color-picker.tsx: const [bindOverlay, unbindOverlay] = useOverlayListener({
packages/react/src/color-picker/color-picker.tsx: scrollHandlerRef.current = new ConnectedOverlayScrollHandler(
packages/react/src/color-picker/color-picker.tsx: document.addEventListener("touchmove", move, { passive: false });
packages/react/src/color-picker/color-picker.tsx: useUnmountEffect(() => {
packages/react/src/color-picker/color-picker.tsx: if (draggingRef.current) return;
packages/react/src/color-picker/color-picker.tsx: "aria-label": ariaLabel = "Select a color",
packages/react/src/color-picker/color-picker.tsx: target: { name: current.name, id: current.id, value: newValue },
packages/react/src/color-picker/color-picker.tsx: const { ptm } = createPassThrough("colorpicker", { props: { pt, ptOptions } });
packages/react/src/color-picker/color-picker.tsx: function validateHsb(hsb: Hsb): Hsb {
packages/react/src/color-picker/color-picker-style.ts: import { style as colorPickerStyle } from "@ultimate/uix-styles/colorpicker";
packages/react/src/color-picker/color-picker-style.ts: export const colorPickerStyleModule
packages/themes/src/presets/aura/index.ts: colorpicker: colorPicker,
packages/react/src/index.ts: export * from "./color-picker";
packages/react/package.json: "./color-picker": {
.github/workflows/ci.yml: run: pnpm run test
packages/react/package.json: "test": "vitest run"
```

## Relationships

package.ultimate.react.color-picker → [react.color-picker](react.color-picker.md) (reconciled family alias)
package.ultimate.react-core.base (pending cross-batch)
package.ultimate.react-core.styling (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Component, declared props and shared style module exist in source with a colocated spec; source inspection is not a passing test."
  },
  {
    "state": "not-run",
    "behavior": "Bounded React product spec for the numeric, date, color and file input families was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/react exec vitest run src/input-number/ src/date-picker/ src/color-picker/ src/file-upload/",
    "outcome": "not-run",
    "revision": "e99d41249677496cf6c531576dd6e1c181544883",
    "limitations": "Not run by instruction to avoid heavy local load (no vitest, build or Storybook); node_modules is absent in the worktree. No product or host repair attempted; presence of spec files is not pass evidence."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs CI Test step runs root pnpm run test, recursively invoking the @ultimate/react test script (vitest run). This is workflow configuration evidence only, not a successful CI execution or branch-protection claim. Scoped inventory Node tests are not included in test:scripts (provenance-only glob).",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on classification scope != docs and !cancelled(); upstream steps/dependencies can prevent assertions. No remote CI observed."
  }
]
```
