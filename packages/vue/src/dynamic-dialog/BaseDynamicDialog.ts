import { createBaseComponent } from "@ultimate/vue-core";
import { dynamicDialogStyleModule } from "./dynamic-dialog-style";
import type { ComponentOptions } from "vue";

/** `UDynamicDialog` takes no props of its own — every open instance's config comes from the `UDialogService.open()` call itself (matching real upstream's own `DynamicDialog.vue`, which is similarly prop-less). */
export function createBaseDynamicDialog(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "dynamic-dialog", styleModule: dynamicDialogStyleModule }),
  };
}
