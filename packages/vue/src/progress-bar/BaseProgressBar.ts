import { createBaseComponent } from "@ultimate/vue-core";
import { progressBarStyleModule } from "./progress-bar-style";
import type { ComponentOptions } from "vue";

// extends: createBaseComponent(...) directly — ProgressBar is a bare
// status/display primitive, not a form control, matching real extracted
// PrimeVue's own BaseProgressBar.vue's `extends: BaseComponent`.
export function createBaseProgressBar(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "progress-bar", styleModule: progressBarStyleModule }),
    props: {
      value: { type: Number, default: 0 },
      showValue: { type: Boolean, default: true },
      unit: { type: String, default: "%" },
      mode: { type: String, default: "determinate" },
    },
  };
}
