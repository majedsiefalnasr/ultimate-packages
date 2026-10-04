import type { PropType } from "vue";
import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { megaMenuStyleModule } from "./mega-menu-style";

// Props verified against real .vendor-extracted/vue/megamenu/BaseMegaMenu.vue
// (this task's Step 1). Real BaseMegaMenu.vue also carries orientation,
// breakpoint, scrollHeight (mobile-breakpoint hamburger-menu collapse) and
// tabindex/ariaLabelledby (keyboard roving-focus machinery) — deliberately
// excluded here, matching the same reduction this task's Angular/React
// `UMegaMenu` siblings already applied to real PrimeVue's own `MegaMenu`.
// Real BaseMegaMenu.vue also does `provide() { return { $pcMegaMenu: this,
// $parentInstance: this } }` — the passthrough-system inject/provide wiring
// this project's "Option B" posture excludes entirely (spec §7); not
// reproduced here.
export function createBaseMegaMenu() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "mega-menu", styleModule: megaMenuStyleModule }),
    props: {
      model: { type: Array as PropType<readonly unknown[]>, default: () => [] },
      ariaLabel: { type: String, default: null },
    },
  });
}
