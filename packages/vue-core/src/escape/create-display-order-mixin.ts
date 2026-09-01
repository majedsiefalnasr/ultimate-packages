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
  let registered = false;

  function register(this: unknown) {
    if (!isVisible() || registered) return;
    (this as { displayOrder?: number }).displayOrder = displayOrderRegistry.register(group, uid);
    registered = true;
  }

  function unregister(this: unknown) {
    if (!registered) return;
    displayOrderRegistry.unregister(group, uid);
    (this as { displayOrder?: number }).displayOrder = undefined;
    registered = false;
  }

  return {
    mounted() {
      register.call(this);
    },
    // Mirrors createGlobalEscapeKeyMixin's own updated() retry: a component
    // mounted while invisible (isVisible() false, e.g. v-model:visible
    // starting false) never registers at mount time — without this retry,
    // toggling visible to true later would leave displayOrder permanently
    // undefined, since register() is only ever called from mounted()/
    // updated(), never from a reactive watcher. Idempotent (registered
    // guard) so an already-registered instance doesn't push a duplicate
    // entry into the shared registry on every subsequent update.
    updated() {
      unregister.call(this);
      register.call(this);
    },
    beforeUnmount() {
      unregister.call(this);
    },
  };
}
