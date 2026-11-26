import { defineComponent, type PropType } from "vue";
import { createBaseEditableHolder } from "@ultimate/vue-core";
import { colorPickerStyleModule } from "./color-picker-style";

// extends: createBaseEditableHolder(), matching verified BaseColorPicker.vue's
// real chain: `export default { name: 'BaseColorPicker', extends:
// BaseEditableHolder, ... }` — the tier UKnob/USlider already extend.
//
// `componentName` and `styleModule` go through createBaseEditableHolder, so
// `cx`, style registration under the Aura `colorpicker` key, `unstyled`,
// per-instance `dt` and `pt` all come from the shared base chain. The props
// are PrimeVue's, except the deprecated `panelClass` (ADR-104), plus
// `invalid` and the preview input's `ariaLabel`/`ariaLabelledby`.
export function createBaseColorPicker() {
  return defineComponent({
    extends: createBaseEditableHolder({
      componentName: "colorpicker",
      styleModule: colorPickerStyleModule,
    }),
    props: {
      defaultColor: { type: null as unknown as PropType<string>, default: "ff0000" },
      inline: { type: Boolean, default: false },
      format: { type: String as PropType<"hex" | "rgb" | "hsb">, default: "hex" },
      tabindex: { type: String, default: null },
      autoZIndex: { type: Boolean, default: true },
      baseZIndex: { type: Number, default: 0 },
      appendTo: { type: [String, Object] as PropType<string | HTMLElement>, default: "body" },
      inputId: { type: String, default: null },
      overlayClass: { type: null as unknown as PropType<unknown>, default: null },
      disabled: { type: Boolean, default: false },
      invalid: { type: Boolean, default: false },
      ariaLabel: { type: String, default: "Select a color" },
      ariaLabelledby: { type: String, default: null },
    },
  });
}
