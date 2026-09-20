import { createBaseComponent } from "@ultimate/vue-core";
import { confirmDialogStyleModule } from "./confirm-dialog-style";
import type { ComponentOptions } from "vue";

/** Real upstream `ConfirmDialog`'s prop surface, scoped to this capability's spec-mandated fields — a `group` key to match the key of a `UConfirmationService.confirm()` request, matching real PrimeVue's own `group` prop (used when a component tree has multiple confirm dialogs). */
export function createBaseConfirmDialog(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "confirm-dialog", styleModule: confirmDialogStyleModule }),
    props: {
      group: { type: String, default: undefined },
    },
  };
}
