import type { Component } from "vue";
import ImageCases from "./ImageCases.vue";
import ImageCompareCases from "./ImageCompareCases.vue";
import CarouselCases from "./CarouselCases.vue";
import GalleriaCases from "./GalleriaCases.vue";

/** G3-E reference cases, one component per Aura key; filled per batch (Plan Tasks 5, 8, 11, 14). */
export const G3E_CASES: Record<string, Component> = {
  image: ImageCases,
  imagecompare: ImageCompareCases,
  carousel: CarouselCases,
  galleria: GalleriaCases,
};
