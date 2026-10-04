import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { cardStyleModule } from "./card-style";

// extends: createBaseComponent(...) directly — Card is a display-only
// layout primitive with no editable/input state, matching the real
// extracted PrimeVue BaseCard.vue's own `extends: BaseComponent`. Real
// source carries no props of its own — every section (header/title/
// subtitle/content/footer) is a named slot, not a prop.
export function createBaseCard() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "card", styleModule: cardStyleModule }),
  });
}
