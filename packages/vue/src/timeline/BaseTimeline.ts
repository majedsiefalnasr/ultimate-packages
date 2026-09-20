import { createBaseComponent } from "@ultimate/vue-core";
import { timelineStyleModule } from "./timeline-style";
import type { ComponentOptions } from "vue";

// extends: createBaseComponent(...) directly — Timeline is a display
// component visualizing chained events, not a form control, matching real
// extracted PrimeVue's own BaseTimeline.vue's `extends: BaseComponent`.
export function createBaseTimeline(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "timeline", styleModule: timelineStyleModule }),
    props: {
      value: { type: Array, default: () => [] },
      align: { type: String, default: "left" },
      layout: { type: String, default: "vertical" },
    },
  };
}
