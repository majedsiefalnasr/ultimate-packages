import { defineComponent } from "vue";
import { createBaseEditableHolder } from "@ultimate/vue-core";
import { ratingStyleModule } from "./rating-style";

// extends: createBaseEditableHolder(), matching verified BaseRating.vue's
// real chain: `export default { name: 'BaseRating', extends:
// BaseEditableHolder, ... }` (.vendor-extracted/vue/rating/BaseRating.vue).
//
// `componentName` and `styleModule` go through createBaseEditableHolder, so
// `cx`, style registration under the Aura `rating` key, `unstyled`,
// per-instance `dt` and `pt` all come from the shared base chain.
//
// The `$pcRating` provide is not ported: nothing injects it.
export function createBaseRating() {
  return defineComponent({
    extends: createBaseEditableHolder({
      componentName: "rating",
      styleModule: ratingStyleModule,
    }),
    props: {
      stars: { type: Number, default: 5 },
      readonly: { type: Boolean, default: false },
      disabled: { type: Boolean, default: false },
      invalid: { type: Boolean, default: false },
      name: { type: String, default: null },
      onIcon: { type: String, default: undefined },
      offIcon: { type: String, default: undefined },
      ariaLabelledby: { type: String, default: null },
    },
  });
}
