import { defineComponent } from "vue";
import { createBaseComponent } from "@ultimate/vue-core";
import { confirmPopupStyleModule } from "./confirm-popup-style";

/** Real upstream `ConfirmPopup`'s prop surface, scoped to this capability's spec-mandated fields. */
export function createBaseConfirmPopup() {
  return defineComponent({
    extends: createBaseComponent({ componentName: "confirm-popup", styleModule: confirmPopupStyleModule }),
    props: {
      group: { type: String, default: undefined },
    },
  });
}
