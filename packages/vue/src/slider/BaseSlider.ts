import { defineComponent } from "vue";
import { createBaseEditableHolder } from "@ultimate/vue-core";
import { sliderStyleModule } from "./slider-style";

// extends: createBaseEditableHolder(), matching verified BaseSlider.vue's
// real chain exactly: `export default { name: 'BaseSlider', extends:
// BaseEditableHolder, ... }` — same tier USelectButton and URating extend,
// NOT BaseInput.
//
// `componentName` and `styleModule` go through createBaseEditableHolder, so
// `cx`, style registration under the Aura `slider` key, `unstyled`,
// per-instance `dt` and `pt` all come from the shared base chain.
export function createBaseSlider() {
  return defineComponent({
    extends: createBaseEditableHolder({
      componentName: "slider",
      styleModule: sliderStyleModule,
    }),
    props: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 100 },
      orientation: { type: String, default: "horizontal" },
      step: { type: Number, default: null },
      range: { type: Boolean, default: false },
      disabled: { type: Boolean, default: false },
      invalid: { type: Boolean, default: false },
      tabindex: { type: Number, default: 0 },
      ariaLabelledby: { type: String, default: null },
      ariaLabel: { type: String, default: null },
    },
  });
}
