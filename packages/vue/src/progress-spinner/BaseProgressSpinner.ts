import { createBaseComponent } from "@ultimate/vue-core";
import { progressSpinnerStyleModule } from "./progress-spinner-style";
import type { ComponentOptions } from "vue";

// extends: createBaseComponent(...) directly — ProgressSpinner is a bare,
// purely visual primitive, not a form control, matching real extracted
// PrimeVue's own BaseProgressSpinner.vue's `extends: BaseComponent`.
export function createBaseProgressSpinner(): ComponentOptions {
  return {
    extends: createBaseComponent({
      componentName: "progress-spinner",
      styleModule: progressSpinnerStyleModule,
    }),
    props: {
      strokeWidth: { type: String, default: "2" },
      fill: { type: String, default: "none" },
      animationDuration: { type: String, default: "2s" },
      ariaLabel: { type: String, default: null },
    },
  };
}
