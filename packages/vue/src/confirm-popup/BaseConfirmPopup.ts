import { createBaseComponent } from "@ultimate/vue-core";
import { confirmPopupStyleModule } from "./confirm-popup-style";
import type { ComponentOptions } from "vue";

/** Real upstream `ConfirmPopup`'s prop surface, scoped to this capability's spec-mandated fields. */
export function createBaseConfirmPopup(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "confirm-popup", styleModule: confirmPopupStyleModule }),
    props: {
      group: { type: String, default: undefined },
    },
  };
}
