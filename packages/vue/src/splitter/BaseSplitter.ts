import { createBaseComponent } from "@ultimate/vue-core";
import { splitterStyleModule } from "./splitter-style";
import type { ComponentOptions } from "vue";

// extends: createBaseComponent(...) directly — Splitter is a drag-resize
// layout component, not a form control, matching real extracted PrimeVue's
// own BaseSplitter.vue's `extends: BaseComponent`.
//
// `panels` is a config array (`{minSize}[]`, content supplied via a
// scoped default slot indexed by position) — a config-driven panel list
// rather than real source's child-scanning `SplitterPanel` component tree,
// same "reduce a multi-component family to one component with a config
// surface" precedent as this session's `UAccordion`/`UPanelMenu`
// reductions, disclosed here rather than silently presented as matching
// upstream's own children-based shape.
export function createBaseSplitter(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "splitter", styleModule: splitterStyleModule }),
    props: {
      panels: { type: Array, default: () => [] },
      layout: { type: String, default: "horizontal" },
      gutterSize: { type: Number, default: 4 },
      step: { type: Number, default: 5 },
    },
    emits: ["resizestart", "resizeend"],
  };
}
