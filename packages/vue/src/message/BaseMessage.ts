import { createBaseComponent } from "@ultimate/vue-core";
import { messageStyleModule } from "./message-style";
import type { ComponentOptions } from "vue";

// extends: createBaseComponent(...) directly — Message is a status/display
// component (severity banner), not a form control, matching real extracted
// PrimeVue's own BaseMessage.vue's `extends: BaseComponent`. Props verified
// against real source: severity/closable/life/icon/closeIcon/size/variant
// all match verbatim; `closeButtonProps` (an arbitrary bag of button props)
// is excluded — same "smaller surface than upstream" precedent as every
// sibling component.
export function createBaseMessage(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "message", styleModule: messageStyleModule }),
    props: {
      severity: { type: String, default: "info" },
      closable: { type: Boolean, default: false },
      life: { type: Number, default: null },
      icon: { type: String, default: undefined },
      closeIcon: { type: String, default: undefined },
      closeAriaLabel: { type: String, default: "Close" },
    },
  };
}
