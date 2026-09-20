import { createBaseComponent } from "@ultimate/vue-core";
import { terminalStyleModule } from "./terminal-style";
import type { ComponentOptions } from "vue";

// extends: createBaseComponent(...) directly — Terminal is a text-based
// command-input/output-log display, not a form control, matching real
// extracted PrimeVue's own BaseTerminal.vue's `extends: BaseComponent`.
export function createBaseTerminal(): ComponentOptions {
  return {
    extends: createBaseComponent({ componentName: "terminal", styleModule: terminalStyleModule }),
    props: {
      welcomeMessage: { type: String, default: undefined },
      prompt: { type: String, default: "$" },
    },
  };
}
