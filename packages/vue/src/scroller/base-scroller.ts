import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { scrollerStyleModule } from "./scroller-style";

export function createBaseScroller() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "scroller", styleModule: scrollerStyleModule }),
    props: {
      items: { type: Array, default: () => [] },
      itemSize: { type: Number, default: 0 },
      numToleratedItems: { type: Number, default: null },
    },
  });
}
