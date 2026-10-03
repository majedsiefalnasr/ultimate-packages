import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { popoverStyleModule } from "./popover-style";

/** Real upstream `BasePopover.vue`'s prop surface (`.vendor-extracted/vue/popover/BasePopover.vue`), scoped to this capability's spec-mandated fields — no `breakpoints`/passthrough/`appendTo` "self" variant (matches `UDialog`'s own already-established `appendTo` default of `"body"`, the only real mode this port's `UPortal` composition supports). */
export function createBasePopover() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "popover", styleModule: popoverStyleModule }),
    props: {
      dismissable: { type: Boolean, default: true },
      appendTo: { type: [String, Object], default: "body" },
    },
  });
}
