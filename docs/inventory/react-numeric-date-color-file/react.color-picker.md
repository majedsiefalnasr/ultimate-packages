# React UColorPicker

ID: react.color-picker

Framework: react; availability: public

## Authored interpretation

Controlled color picker with a read-only swatch input and a mouse-driven saturation/brightness and hue panel that emits hex, RGB or HSB values.

## Framework surface

UColorPicker is a plain function component (not a forwardRef) with UColorPickerProps. Props: value (UColorPickerValue | null, required), onChange (required, receives UColorPickerChangeEvent), format (hex | rgb | hsb, default hex), defaultColor (default "ff0000"), disabled, className, onShow and onHide. UColorPickerValue is string | Rgb | Hsb; Rgb and Hsb are local and not exported. UColorPickerChangeEvent carries originalEvent (Event | React.SyntheticEvent) and value. The style module exports ColorPickerPreviewClassesParams (disabled) and colorPickerStyleModule; neither is re-exported by index.ts.

Value handling: toHsb converts value by format without checking its type against format (rgb is cast to Rgb, hsb is cast to Hsb unvalidated, hex is cast to string); a null value uses defaultColor. hexToRgb calls parseInt(hex without '#', 16) and splits it with >> 16, (& 0x00ff00) >> 8 and & 0x0000ff, so 3-digit hex misparses (#fff is 0x0fff and gives 0, 15, 255), 8-digit hex gives out-of-range channels (#12345678 gives 4660, 86, 120) and non-hex text gives NaN that becomes black. rgbToHsb returns h = 300 for gray and black (s = 0 path computes -1 * 60 + 360); HSB output is unrounded. hsbToRgb rounds and treats 360 as 0; rgbToHex does not clamp. Emitted hex is '#' plus six lowercase digits; the hsb format emits a copy of the HSB object.

Open and close: togglePanel returns when disabled and calls onShow or onHide inside the setOverlayVisible updater function, so these callbacks run during state processing and may run twice under StrictMode. Escape and Tab on the input call setOverlayVisible(false) and onHide when visible. There is no outside-click or blur handler; the panel also closes on input click and Space, and it stays open when disabled becomes true.

Input: a read-only text input with className preview (disabled modifier), backgroundColor from the unvalidated HSB value, hard-coded aria-label 'Select color', aria-haspopup=true, aria-expanded, tabIndex -1 and disabled attribute when disabled. Space toggles with preventDefault; Enter does nothing. Color changes are mouse-only: there is no keyboard adjustment and no touch or pointer handler.

Panel: an absolutely positioned div without role, aria-label or portal, holding a 150 x 150 colorSelector and a hue strip, each with a ref and onMouseDown and without ARIA roles. Mousedown returns when disabled, marks dragging, picks immediately and calls bindDragListeners, which adds document mousemove and mouseup listeners on every mousedown; mouseup removes both and resets the refs. There is no unmount cleanup, and the mousemove handler closes over the pickColor and hsbValue of the render in which the drag started. pickColor sets saturation floor(100 * clamp(x, 0, 150) / 150) and brightness floor(100 * (150 - clamp(y, 0, 150)) / 150) and keeps the current hue; pickHue sets hue floor(360 * (150 - clamp(y)) / 150) and keeps saturation and brightness. validateHsb clamps picks and the selector background but the input swatch uses the unvalidated value. The 150 px size is hard-coded; handle positions use floor(150 * s / 100), floor(150 * (100 - b) / 100) and floor(150 - 150 * h / 360).

Styles: root class u-color-picker u-component; class keys root, preview (reads disabled), panel, content, colorSelector, colorBackground, colorHandle, hue, hueHandle. The doc comment lists inline mode, touch, context configuration and portal as not implemented. componentName is color-picker while the Aura registry key is colorpicker.

## Public exports

@ultimate/react#UColorPicker
@ultimate/react/color-picker#UColorPicker
@ultimate/react#UColorPickerProps
@ultimate/react/color-picker#UColorPickerProps
@ultimate/react#UColorPickerChangeEvent
@ultimate/react/color-picker#UColorPickerChangeEvent
@ultimate/react#UColorPickerValue
@ultimate/react/color-picker#UColorPickerValue

## Owned source and evidence

packages/react/src/color-picker/index.ts
packages/react/src/color-picker/color-picker.tsx
packages/react/src/color-picker/color-picker-style.ts

```text
packages/react/src/color-picker/index.ts: export { UColorPicker } from
packages/react/src/color-picker/color-picker.tsx: export function UColorPicker({
packages/react/src/color-picker/color-picker.tsx: if (next) onShow?.();
packages/react/src/color-picker/color-picker.tsx: document.addEventListener("mousemove"
packages/react/src/color-picker/color-picker.tsx: function validateHsb(hsb: Hsb): Hsb {
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
    "behavior": "Component, declared props and local style module exist in source with a colocated spec; source inspection is not a passing test."
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
