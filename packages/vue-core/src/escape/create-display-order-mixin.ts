import { displayOrderRegistry } from "@ultimate/uix-utils/escape";
import type { ComponentOptions } from "vue";

export interface CreateDisplayOrderMixinOptions {
  group: string;
  isVisible: () => boolean;
}

let uidCounter = 0;

// Options-API-mixin-shaped sibling to useDisplayOrder (use-display-order.ts,
// Composition-API-shaped: onMounted/onUnmounted + Ref) — mirrors
// createGlobalEscapeKeyMixin's own shape exactly (registration/unregistration
// driven from real mounted()/beforeUnmount() hooks, plain ComponentOptions
// return, no Composition-API primitives). Calls @ultimate/uix-utils/escape's
// shared displayOrderRegistry directly, the same registry useDisplayOrder
// itself delegates to — both are thin framework-specific wrappers over one
// framework-neutral registry (spec §11).
//
// Exposes the registered order as `this.displayOrder` (plain instance
// property, not reactive `data()` state — matching this mixin's own
// non-reactive read pattern: consumers that need it inside a computed/render
// path, such as UDialog's escape-priority getter, read `this.displayOrder`
// directly at call time, the same way createGlobalEscapeKeyMixin's own
// `priority` getters are plain closures re-read on demand rather than
// reactive refs).
export function createDisplayOrderMixin({
  group,
  isVisible,
}: CreateDisplayOrderMixinOptions): ComponentOptions {
  const uid = ++uidCounter;

  return {
    mounted() {
      if (isVisible()) {
        (this as unknown as { displayOrder?: number }).displayOrder = displayOrderRegistry.register(
          group,
          uid
        );
      }
    },
    beforeUnmount() {
      displayOrderRegistry.unregister(group, uid);
      (this as unknown as { displayOrder?: number }).displayOrder = undefined;
    },
  };
}
