import type { PropType } from "vue";
import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { tieredMenuStyleModule } from "./tiered-menu-style";

// Props verified against real .vendor-extracted/vue/tieredmenu/BaseTieredMenu.vue
// (this task's Step 1) — matches: model, popup. Real BaseTieredMenu.vue
// also carries appendTo/autoZIndex/baseZIndex (Portal-based popup
// positioning) and tabindex/ariaLabelledby (keyboard roving-focus
// machinery) — deliberately excluded here: this task's Angular/React
// `UTieredMenu` siblings (real source's own binding instruction for this
// capability, matched here for cross-framework consistency) render the
// popup in-place via a plain `v-if`-toggled wrapper `div`, not a
// Portal/Teleport-based overlay — matching the same reduction `UMenu`
// already applied to real PrimeVue's `Menu` elsewhere in this batch. Real
// BaseTieredMenu.vue also does `provide() { return { $pcTieredMenu: this,
// $parentInstance: this } }` — the passthrough-system inject/provide
// wiring this project's "Option B" posture excludes entirely (spec §7);
// not reproduced here.
export function createBaseTieredMenu() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "tiered-menu", styleModule: tieredMenuStyleModule }),
    props: {
      model: { type: Array as PropType<readonly unknown[]>, default: () => [] },
      popup: { type: Boolean, default: false },
    },
  });
}
