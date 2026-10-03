import type { PropType } from "vue";
import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { timelineStyleModule } from "./timeline-style";

// extends: createBaseComponent(...) directly — Timeline is a display
// component visualizing chained events, not a form control, matching real
// extracted PrimeVue's own BaseTimeline.vue's `extends: BaseComponent`.
export function createBaseTimeline() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "timeline", styleModule: timelineStyleModule }),
    props: {
      value: { type: Array as PropType<readonly unknown[]>, default: () => [] },
      align: { type: String, default: "left" },
      layout: { type: String, default: "vertical" },
    },
  });
}
