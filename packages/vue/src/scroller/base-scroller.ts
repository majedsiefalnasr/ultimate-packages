import { createBaseComponent } from "@ultimate/vue-core";
import { scrollerStyleModule } from "./scroller-style";
import type { ComponentOptions } from "vue";

export function createBaseScroller(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "scroller", styleModule: scrollerStyleModule }),
    props: {
      items: { type: Array, default: () => [] },
      itemSize: { type: Number, default: 0 },
      numToleratedItems: { type: Number, default: null },
    },
  };
}
