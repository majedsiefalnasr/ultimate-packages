import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { carouselStyleModule } from "./carousel-style";

// Props verified against real .vendor-extracted/vue/carousel/BaseCarousel.vue:
// value/page/numVisible/numScroll/circular/showIndicators/showNavigators/
// autoplayInterval/orientation all match. `responsiveOptions`/
// `verticalViewPortHeight`/prev-next `ButtonProps` passthrough/
// `contentClass`/indicator style-class overrides are excluded — same
// "smaller surface than upstream" precedent as every sibling component.
export function createBaseCarousel() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "carousel", styleModule: carouselStyleModule }),
    props: {
      value: { type: Array, default: () => [] },
      page: { type: Number, default: 0 },
      numVisible: { type: Number, default: 1 },
      numScroll: { type: Number, default: 1 },
      circular: { type: Boolean, default: false },
      showIndicators: { type: Boolean, default: true },
      showNavigators: { type: Boolean, default: true },
      autoplayInterval: { type: Number, default: 0 },
      orientation: { type: String, default: "horizontal" },
    },
  });
}
