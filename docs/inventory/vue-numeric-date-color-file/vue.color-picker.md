# Vue UColorPicker

ID: vue.color-picker

Framework: vue; availability: public

## Authored interpretation

Colour picker: a preview swatch opens a portal panel (or an inline panel replaces it) with a saturation/brightness square and a hue strip, driven by mouse and touch, producing hex (rrggbb), rgb or hsb values.

## Framework surface

UColorPicker (Options API SFC ColorPicker.vue, name "UColorPicker", inheritAttrs false) and createBaseColorPicker (BaseColorPicker.ts) plus colorPickerStyleModule, ColorPickerRootClassesParams, ColorPickerPreviewClassesParams and ColorPickerPanelClassesParams (color-picker-style.ts; none of the style exports is re-exported from index.ts). Base factory chain: createBaseColorPicker extends createBaseEditableHolder({ componentName: "colorpicker", styleModule }) directly, so it has no size, fluid or variant (it has no size, fluid or variant props); cx, style registration under colorpicker (also the Aura registry key), unstyled, per-instance dt and pt come from the shared base chain. Declared props: defaultColor ("ff0000"), inline, format ("hex" default; "rgb" and "hsb" supported, any other value behaves as hex), tabindex, autoZIndex (true), baseZIndex (0), appendTo ("body"), inputId, overlayClass, disabled, invalid, ariaLabel ("Select a color") and ariaLabelledby, plus inherited modelValue and defaultValue; PrimeVue's deprecated panelClass is not declared (ADR-104). Emits declared: change, show, hide. change carries { originalEvent, value, event }, where event is the same pointer event under PrimeVue's name; show is emitted when the panel starts to enter and hide when it starts to leave, with no payload. Value shapes: hex is written as "rrggbb" without "#", rgb as { r, g, b } (rounded) and hsb as { h, s, b }; hex is read with or without "#"; defaultColor is used only when the model is falsy. Math (PrimeVue's, replayed in plain Node): hexToRgb uses parseInt(hex, 16) with bit masks, so a 3-digit "#fff" becomes 0x0fff and yields { r: 0, g: 15, b: 255 }, an 8-digit hex gives a negative r (-256 for "#ff0000ff"), and invalid text gives NaN and { r: 0, g: 0, b: 0 }; rgbToHsb sets hsb.h = -1 for gray, black and white, which becomes h = 300 after the multiply and wrap, but toHsb then replaces the hue of any colour with s 0 or b 0 by localHue (0 before a hue is known) and otherwise stores the hue in localHue, and a pick in the square uses localHue as its hue; hsbToRgb rounds h, s and v first; validateHsb clamps h to 0-360 and s, b to 0-100. Template: div root (ref container) with cx('root', { inline, dragging }) and ptmi('root'); unless inline, an input type=text readonly (the preview swatch, inline backgroundColor, ref input) with id from inputId, aria-label "Select a color" by default, aria-labelledby, aria-haspopup="true", aria-expanded, tabindex and disabled; UPortal (appendTo; disabled when inline) wrapping a JS-driven transition (:css false; u-anchored-overlay through createMotionTransitionHooks) around the panel div (ref panel; always rendered when inline, otherwise only while overlayVisible) with cx('panel', { inline, disabled, invalid }) plus overlayClass, then content, a saturation/brightness square (mousedown and touchstart) with colorBackground and colorHandle, and a hue strip (mousedown and touchstart) with hueHandle; pt sections root, preview, panel (merged with overlay), content, colorSelector, colorBackground, colorHandle, hue and hueHandle. The panel, square and strip have no role, label or key handler, so the colour cannot be changed with the keyboard, as in PrimeVue source (ADR-104). Input keys: Space toggles with preventDefault; Escape and Tab set overlayVisible to false; Enter does not toggle; a click toggles unless disabled. Opening runs onOverlayEnter: it positions the panel with relativePosition (appendTo self) or absolutePosition against the input, binds a capture-phase document click outside-click listener that hides the panel for clicks outside the panel and the input, a ConnectedOverlayScrollHandler on the container that hides it on a scroll of any scrollable ancestor and a window resize listener that hides it on non-touch devices, sets the z-index through ZIndex under the overlay key (baseZIndex, else 1000) when autoZIndex, and emits show; leaving unbinds the three listeners and emits hide, and the z-index is cleared after leave. The panel stays open when disabled becomes true (no watcher on disabled). Drag: each press returns when disabled, ends any running drag and binds document listeners (mousemove and mouseup, or a non-passive touchmove plus touchend and touchcancel) that follow only the touch that started the drag, read getBoundingClientRect with 150 px constants, floor and clamping, and are removed when the drag ends; beforeUnmount also stops a running drag, unbinds the outside-click, resize and scroll listeners and clears the z-index. While a drag runs the root carries u-color-picker-dragging and the dValue watcher does not overwrite the colour; a format watcher re-converts the model. Model: updateModel sets hsbValue itself and then calls writeValue(value, event), so the swatch follows each pick. Styles (color-picker-style.ts): the CSS imports the shared @ultimate/uix-styles/colorpicker module (ADR-082, ADR-104) with dt('colorpicker.…') tokens and no z-index rule; classes root (u-color-picker-overlay unless inline, u-color-picker-dragging), preview (p-disabled), panel (u-color-picker-panel-inline, p-disabled, p-invalid), content, colorSelector, colorBackground, colorHandle, hue and hueHandle. Theme: Aura registry key colorpicker (value colorPicker), differing from the family name color-picker. No component-metadata record exists. color-picker.spec.ts and color-picker.stories.ts are excluded supporting files. Composes UPortal.

## Public exports

@ultimate/vue#UColorPicker
@ultimate/vue/color-picker#UColorPicker
@ultimate/vue#createBaseColorPicker
@ultimate/vue/color-picker#createBaseColorPicker

## Owned source and evidence

packages/vue/src/color-picker/BaseColorPicker.ts
packages/vue/src/color-picker/ColorPicker.vue
packages/vue/src/color-picker/color-picker-style.ts
packages/vue/src/color-picker/index.ts

```text
packages/vue/src/color-picker/ColorPicker.vue: name: "UColorPicker",
packages/vue/src/color-picker/ColorPicker.vue: inheritAttrs: false,
packages/vue/src/color-picker/ColorPicker.vue: emits: ["change", "show", "hide"],
packages/vue/src/color-picker/ColorPicker.vue: this.$emit("change", { originalEvent: event, value, event });
packages/vue/src/color-picker/ColorPicker.vue: document.addEventListener("touchmove", move, { passive: false });
packages/vue/src/color-picker/ColorPicker.vue: document.addEventListener("click", this.outsideClickListener, true);
packages/vue/src/color-picker/ColorPicker.vue: this.scrollHandler = new ConnectedOverlayScrollHandler(this.$refs.container, () => {
packages/vue/src/color-picker/ColorPicker.vue: beforeUnmount() {
packages/vue/src/color-picker/ColorPicker.vue: if (hsb.s === 0 || hsb.b === 0) hsb.h = this.localHue ?? 0;
packages/vue/src/color-picker/ColorPicker.vue: const hexValue = parseInt(hex.indexOf("#") > -1 ? hex.substring(1) : hex, 16);
packages/vue/src/color-picker/BaseColorPicker.ts: extends: createBaseEditableHolder({
packages/vue/src/color-picker/BaseColorPicker.ts: componentName: "colorpicker",
packages/vue/src/color-picker/color-picker-style.ts: import { style as colorPickerStyle } from "@ultimate/uix-styles/colorpicker";
packages/vue/src/color-picker/color-picker-style.ts: export const colorPickerStyleModule
packages/vue/src/color-picker/index.ts: createBaseColorPicker
packages/vue/src/index.ts: export * from "./color-picker";
packages/vue/package.json: "./color-picker": {
```

## Relationships

package.ultimate.vue.color-picker → [vue.color-picker](vue.color-picker.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)
package.ultimate.vue-core.overlay (pending cross-batch)
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
    "behavior": "Bounded Vue product spec for the numeric, date, color and file families was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/vue exec vitest run src/input-number/ src/date-picker/ src/color-picker/ src/file-upload/",
    "outcome": "not-run",
    "revision": "3143b1f248e72addb28087e65a31014466c5969d",
    "limitations": "Not run by instruction to avoid heavy local load (no vitest, build or Storybook); no product or host repair attempted; presence of spec files is not pass evidence."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs CI Test step runs root pnpm run test, recursively invoking the @ultimate/vue test script (vitest run). This is workflow configuration evidence only, not a successful CI execution or branch-protection claim. Scoped inventory Node tests are not included in test:scripts (provenance-only glob).",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on classification scope != docs and !cancelled(); upstream steps/dependencies can prevent assertions. No remote CI observed."
  }
]
```
