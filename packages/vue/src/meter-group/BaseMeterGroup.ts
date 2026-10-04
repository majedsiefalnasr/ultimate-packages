import type { PropType } from "vue";
import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { meterGroupStyleModule } from "./meter-group-style";

// extends: createBaseComponent(...) directly — MeterGroup is a display-only
// segmented-bar primitive, not a form control, matching real extracted
// PrimeVue's own BaseMeterGroup.vue's `extends: BaseComponent`. Props
// verified against real source: value/min/max/labelOrientation match
// verbatim; `labelPosition` is fixed at 'end' (see UMeterGroup's own doc
// comment) — same "smaller surface than upstream" precedent as every
// sibling component.
export function createBaseMeterGroup() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "metergroup", styleModule: meterGroupStyleModule }),
    props: {
      value: { type: Array as PropType<readonly unknown[]>, default: () => [] },
      min: { type: Number, default: 0 },
      max: { type: Number, default: 100 },
      orientation: { type: String, default: "horizontal" },
    },
  });
}
