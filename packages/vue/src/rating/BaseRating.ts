import { defineComponent } from "vue";
import { createBaseEditableHolder, registerComponentStyle } from "@ultimate/vue-core";
import { ratingStyleModule } from "./rating-style";
import type { ClassValue } from "@ultimate/vue-core";

// extends: createBaseEditableHolder(), matching verified BaseRating.vue's
// real chain exactly: `export default { name: 'BaseRating', extends:
// BaseEditableHolder, ... }` — confirmed against
// .vendor-extracted/vue/rating/BaseRating.vue — same tier
// UToggleButton/USelectButton already extend, NOT BaseInput.
//
// Same createBaseInput()-parameterless-signature cx()/mounted()-shadow fix
// documented in packages/vue/src/checkbox/BaseCheckbox.ts/
// packages/vue/src/select-button/BaseSelectButton.ts applies identically here.
export function createBaseRating() {
  return defineComponent({
    extends: createBaseEditableHolder(),
    props: {
      stars: { type: Number, default: 5 },
      readonly: { type: Boolean, default: false },
      disabled: { type: Boolean, default: false },
      name: { type: String, default: null },
      ariaLabelledby: { type: String, default: null },
    },
    methods: {
      cx(key: string, params?: Record<string, unknown>): ClassValue | undefined {
        const resolver = ratingStyleModule.classes[key];
        if (resolver === undefined) return undefined;
        return typeof resolver === "function" ? resolver(params) : resolver;
      },
    },
    mounted() {
      registerComponentStyle("rating", ratingStyleModule);
    },
  });
}
