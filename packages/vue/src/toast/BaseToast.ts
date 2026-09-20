import { createBaseComponent } from "@ultimate/vue-core";
import { toastStyleModule } from "./toast-style";
import type { ComponentOptions } from "vue";

// extends: createBaseComponent(...) directly — Toast is a service-driven,
// transient-notification-stack overlay (spec §3.0's own description), not
// a form control, matching real extracted PrimeVue's own BaseToast.vue's
// `extends: BaseComponent`.
export function createBaseToast(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "toast", styleModule: toastStyleModule }),
    props: {
      /** Matches only messages published via `UToastService` carrying the same `group` (undefined matches undefined) — matching real PrimeVue's own `group` field, used when a component tree has multiple toasts. */
      group: { type: String, default: null },
      position: { type: String, default: "top-right" },
      life: { type: Number, default: 3000 },
    },
  };
}
