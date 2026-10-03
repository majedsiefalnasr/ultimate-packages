import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { tabsStyleModule } from "./tabs-style";

// Props verified against real .vendor-extracted/vue/tabs/BaseTabs.vue
// (this task's Step 1) — matches: value, lazy, scrollable, showNavigators,
// tabindex, selectOnFocus. `lazy` is accepted for API-surface parity but
// not wired to any lazy-mount logic here (matching this project's existing
// reduction pattern for out-of-scope upstream behavior); every `UTabPanel`
// always renders, hidden via `v-show`, not conditionally mounted.
export function createBaseTabs() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "tabs", styleModule: tabsStyleModule }),
    props: {
      value: { type: [String, Number], default: undefined },
      lazy: { type: Boolean, default: false },
      scrollable: { type: Boolean, default: false },
      showNavigators: { type: Boolean, default: true },
      tabindex: { type: Number, default: 0 },
      selectOnFocus: { type: Boolean, default: false },
    },
  });
}
