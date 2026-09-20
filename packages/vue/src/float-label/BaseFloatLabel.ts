import { createBaseComponent } from "@ultimate/vue-core";
import { floatLabelStyleModule } from "./float-label-style";
import type { ComponentOptions } from "vue";

// extends: createBaseComponent(...) directly — matching verified
// BaseFloatLabel.vue's own `extends: BaseComponent` chain (one tier, not
// the editable-holder/input chain): real FloatLabel has no CVA/controlled-
// value concept of its own, only a `variant` prop and slot projection.
// Same reasoning as this package's own `createBaseBadge()`
// (packages/vue/src/badge/base-badge.ts), which extends
// createBaseComponent directly for the same "display/layout primitive, no
// editable state" reason.
export function createBaseFloatLabel(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "float-label", styleModule: floatLabelStyleModule }),
    props: {
      variant: { type: String, default: "over" },
    },
  };
}
