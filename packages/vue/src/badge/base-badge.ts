import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { badgeStyleModule } from "./badge-style";

// extends: createBaseComponent(...) directly — Badge is a display-only
// primitive with no editable/input state, matching the real extracted
// PrimeVue BaseBadge.vue's own `extends: BaseComponent` (one tier, not the
// editable-holder/input chain), and matching this package's own UButton
// (packages/vue/src/button/base-button.ts), which extends
// createBaseComponent directly for the same reason.
//
// Prop surface verified against the real extracted
// .vendor-extracted (via extract-primevue-source.mjs primevue root)
// BaseBadge.vue: value/severity/size all match verbatim. Angular's already-
// Built UBadge (packages/ng/src/badge/badge.ts) additionally carries a
// deprecated `size` alias (`badgeSize`) and a `badgeDisabled` input — real
// PrimeVue's Vue Badge has neither; this Vue realization follows real
// PrimeVue's own prop surface (Option B: reference the real framework
// source, not a sibling framework's port), not Angular's.
export function createBaseBadge() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "badge", styleModule: badgeStyleModule }),
    props: {
      value: { type: [String, Number], default: null },
      severity: { type: String, default: null },
      size: { type: String, default: null },
    },
  });
}
