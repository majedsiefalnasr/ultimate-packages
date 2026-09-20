import { createBaseComponent } from "@ultimate/vue-core";
import { meterGroupStyleModule } from "./meter-group-style";
import type { ComponentOptions } from "vue";

// extends: createBaseComponent(...) directly — MeterGroup is a display-only
// segmented-bar primitive, not a form control, matching real extracted
// PrimeVue's own BaseMeterGroup.vue's `extends: BaseComponent`. Props
// verified against real source: value/min/max/labelOrientation match
// verbatim; `labelPosition` is fixed at 'end' (see UMeterGroup's own doc
// comment) — same "smaller surface than upstream" precedent as every
// sibling component.
export function createBaseMeterGroup(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "meter-group", styleModule: meterGroupStyleModule }),
    props: {
      value: { type: Array, default: () => [] },
      min: { type: Number, default: 0 },
      max: { type: Number, default: 100 },
      orientation: { type: String, default: "horizontal" },
    },
  };
}
