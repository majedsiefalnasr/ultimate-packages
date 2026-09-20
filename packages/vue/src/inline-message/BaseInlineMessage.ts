import { createBaseComponent } from "@ultimate/vue-core";
import { inlineMessageStyleModule } from "./inline-message-style";
import type { ComponentOptions } from "vue";

// extends: createBaseComponent(...) directly — InlineMessage is a
// status/display component, not a form control, matching real extracted
// PrimeVue's own BaseInlineMessage.vue's `extends: BaseComponent`. Props
// verified against real source: only `severity`/`icon` are declared.
//
// Real source's `InlineMessage.vue` `mounted()` hook references
// `this.sticky`/`this.life`, but NEITHER is declared as a prop or data
// field anywhere in real `BaseInlineMessage.vue` or `InlineMessage.vue` —
// both are always `undefined` at runtime, and the real template never
// gates on `visible` at all (unlike `Message.vue`'s own `v-if="visible"`).
// This is confirmed dead code with no observable effect in the actual
// shipped PrimeVue component, not a working feature — this port
// deliberately does NOT implement a `sticky`/`life`/auto-dismiss
// mechanism, since doing so would port behavior real InlineMessage does
// not actually have.
export function createBaseInlineMessage(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "inline-message", styleModule: inlineMessageStyleModule }),
    props: {
      severity: { type: String, default: "error" },
      icon: { type: String, default: undefined },
    },
  };
}
