import { escapeRegistry } from "@ultimate/uix-utils/escape";
import type { ComponentOptions } from "vue";

export interface CreateGlobalEscapeKeyMixinOptions {
  callback: (event: KeyboardEvent) => void;
  when: () => boolean;
  priority: [primary: number, secondary: () => number | undefined];
}

// Calls @ultimate/uix-utils/escape's shared escapeRegistry directly — NOT
// through react-core (spec §11, §28). Registration is triggered from the same
// mounted/beforeUnmount lifecycle pair BaseComponent's mixin chain already
// provides, matching this plan's Task 3 foundation.
export function createGlobalEscapeKeyMixin({
  callback,
  when,
  priority,
}: CreateGlobalEscapeKeyMixinOptions): ComponentOptions {
  const [primary, getSecondary] = priority;
  let registeredSecondary: number | undefined;

  function register() {
    const secondary = getSecondary();
    if (!when() || secondary === undefined || registeredSecondary !== undefined) return;
    escapeRegistry.register(primary, secondary, callback);
    registeredSecondary = secondary;
  }

  function unregister() {
    if (registeredSecondary === undefined) return;
    escapeRegistry.unregister(primary, registeredSecondary);
    registeredSecondary = undefined;
  }

  return {
    mounted() {
      register();
    },
    updated() {
      unregister();
      register();
    },
    beforeUnmount() {
      unregister();
    },
  };
}
