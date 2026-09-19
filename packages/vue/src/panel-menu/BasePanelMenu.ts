import { createBaseComponent } from "@ultimate/vue-core";
import { panelMenuStyleModule } from "./panel-menu-style";
import type { ComponentOptions } from "vue";

// Props verified against real .vendor-extracted/vue/panelmenu/BasePanelMenu.vue
// (this task's Step 1) — matches: model, multiple. Real BasePanelMenu.vue
// also carries expandedKeys (controlled v-model expand state) and
// tabindex (keyboard roving-focus machinery) — deliberately excluded
// here, matching the same reduction this task's Angular/React
// `UPanelMenu` siblings already applied to real PrimeVue's own
// `PanelMenu`. Real BasePanelMenu.vue also does `provide() { return {
// $pcPanelMenu: this, $parentInstance: this } }` — the passthrough-system
// inject/provide wiring this project's "Option B" posture excludes
// entirely (spec §7); not reproduced here.
export function createBasePanelMenu(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "panel-menu", styleModule: panelMenuStyleModule }),
    props: {
      model: { type: Array, default: () => [] },
      multiple: { type: Boolean, default: false },
    },
  };
}
