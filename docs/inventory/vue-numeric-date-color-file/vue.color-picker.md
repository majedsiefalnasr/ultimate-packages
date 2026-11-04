# Vue UColorPicker

ID: vue.color-picker

Framework: vue; availability: public

## Authored interpretation

Colour picker: a preview swatch opens a portal panel with a saturation/brightness square and a hue strip, producing hex, rgb or hsb values.

## Framework surface

UColorPicker (Options API SFC ColorPicker.vue, name "UColorPicker") and createBaseColorPicker (BaseColorPicker.ts) plus colorPickerStyleModule and ColorPickerPreviewClassesParams (color-picker-style.ts; neither style export is re-exported from index.ts). Base factory chain: createBaseColorPicker extends createBaseEditableHolder() directly, so it has no size, fluid or variant (it has no size, fluid or variant props); the factory shadows cx() and mounted() and registers the style under the name colorpicker, which is also the Aura registry key. Declared props: format ("hex" default; "rgb" and "hsb" supported, any other value behaves as hex), defaultColor ("ff0000"), disabled, appendTo ("body"), plus inherited modelValue and defaultValue. No id, placeholder or invalid prop. Emits declared: change, show, hide. change carries { originalEvent, value }; show and hide carry no payload. Value shapes: hex is written as "#rrggbb", rgb as { r, g, b } (rounded) and hsb as { h, s, b }; defaultColor is used only when the model is falsy and is read without a leading "#". Math (hand-written, replayed in plain Node): hexToRgb uses parseInt(hex, 16) with bit masks, so a 3-digit "#fff" becomes 0x0fff and yields { r: 0, g: 15, b: 255 }, an 8-digit hex gives a negative r (-256 for "#ff0000ff"), and invalid text gives NaN and { r: 0, g: 0, b: 0 }; rgbToHsb sets hsb.h = -1 for gray, black and white, which becomes h = 300 after the multiply and wrap; validateHsb clamps h to 0-360 and s, b to 0-100. Template: div root; input type=text readonly (the preview swatch, inline backgroundColor) with aria-label "Select color", aria-haspopup="true", aria-expanded, tabindex and disabled; UPortal (appendTo) rendered only while overlayVisible, containing a panel div with no role or label, a saturation/brightness square (ref colorSelectorRef, mousedown) and a hue strip (ref hueRef, mousedown) with positioned handle divs. Interaction is mouse-only: there is no touch, pointer or keyboard handling inside the panel, so the colour cannot be changed with the keyboard. Input keys: Space toggles with preventDefault; Escape and Tab hide when open; Enter does not toggle. There is no outside-click handler and the panel stays open when disabled becomes true (no watcher). Drag: each mousedown adds a document mousemove and mouseup listener pair, removed only inside the mouseup handler; there is no unmount cleanup (no beforeUnmount or unmounted hook), so a component unmounted mid-drag leaves its listeners until the next mouseup; pickColor and pickHue read getBoundingClientRect and use 150 px constants, floor and clamping. Model: when only defaultValue is passed (controlled is false) writeValue emits value-change only and dValue is not updated, so the swatch does not follow later selections (it keeps the initial defaultValue colour). Styles (color-picker-style.ts, hand-ported, no @ultimate/uix-styles import, 6 dt('colorpicker.…') uses): classes root, preview (disabled), panel, content, colorSelector, colorBackground, colorHandle, hue and hueHandle all used; the panel is position absolute with z-index: 1000, the only z-index among the four scoped families. Theme: Aura registry key colorpicker (value colorPicker), differing from the family name color-picker. No component-metadata record exists. color-picker.spec.ts and color-picker.stories.ts are excluded supporting files. Composes UPortal.

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
packages/vue/src/color-picker/ColorPicker.vue: emits: ["change", "show", "hide"],
packages/vue/src/color-picker/ColorPicker.vue: document.addEventListener("mousemove", move);
packages/vue/src/color-picker/ColorPicker.vue: const hexValue = parseInt(hex.indexOf("#") > -1 ? hex.substring(1) : hex, 16);
packages/vue/src/color-picker/BaseColorPicker.ts: extends: createBaseEditableHolder(),
packages/vue/src/color-picker/BaseColorPicker.ts: registerComponentStyle("colorpicker", colorPickerStyleModule);
packages/vue/src/color-picker/color-picker-style.ts: z-index: 1000;
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
    "behavior": "Component, declared props and local style module exist in source with a colocated spec; source inspection is not a passing test."
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
