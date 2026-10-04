import type { PropType } from "vue";
import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { menubarStyleModule } from "./menubar-style";

// Props verified against real .vendor-extracted/vue/menubar/BaseMenubar.vue
// (this task's Step 1). Real BaseMenubar.vue also carries breakpoint
// (mobile-breakpoint hamburger-menu collapse) and tabindex/ariaLabelledby
// (keyboard roving-focus machinery) — deliberately excluded here, matching
// the same reduction this task's Angular/React `UMenubar` siblings already
// applied to real PrimeVue's own `Menubar`. Real BaseMenubar.vue also does
// `provide() { return { $pcMenubar: this, $parentInstance: this } }` — the
// passthrough-system inject/provide wiring this project's "Option B"
// posture excludes entirely (spec §7); not reproduced here.
export function createBaseMenubar() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "menubar", styleModule: menubarStyleModule }),
    props: {
      model: { type: Array as PropType<readonly unknown[]>, default: () => [] },
      ariaLabel: { type: String, default: null },
    },
  });
}
