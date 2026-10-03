import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { breadcrumbStyleModule } from "./breadcrumb-style";

// Props verified against real .vendor-extracted/vue/breadcrumb/BaseBreadcrumb.vue
// (this task's Step 1) — matches: model, home, homeAriaLabel is this
// project's own addition (Angular/React siblings both expose it; real
// PrimeVue's own Breadcrumb has no equivalent prop, only an
// aria/navigation-locale string pulled from global config, which this
// project's smaller surface does not carry — homeAriaLabel is a
// reasonable, real-source-adjacent per-instance override matching the
// same input already established on `UBreadcrumb`'s Angular/React
// siblings for this same capability). Real BaseBreadcrumb.vue also does
// `provide() { return { $parentInstance: this } }` — the
// passthrough-system inject/provide wiring this project's "Option B"
// posture excludes entirely (spec §7); not reproduced here.
export function createBaseBreadcrumb() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "breadcrumb", styleModule: breadcrumbStyleModule }),
    props: {
      model: { type: Array, default: () => [] },
      home: { type: Object, default: null },
      homeAriaLabel: { type: String, default: null },
    },
  });
}
