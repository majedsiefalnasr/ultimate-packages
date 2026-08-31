import { ref, onMounted, onUnmounted, type Ref } from "vue";
import { displayOrderRegistry } from "@ultimate/uix-utils/escape";

let uidCounter = 0;

// Vue-native ref()-based reactive wrapper over uix-utils/escape's shared
// displayOrderRegistry (NOT React's useState/return-value contract, spec §11 —
// that stays in react-core, unchanged and un-extracted). Own implementation,
// informed by but not copied from use-display-order.ts's React shape.
export function useDisplayOrder(group: string, isVisible: Ref<boolean> | boolean): Ref<number | undefined> {
  const uid = ++uidCounter;
  const displayOrder = ref<number | undefined>(undefined);

  function isCurrentlyVisible(): boolean {
    return typeof isVisible === "boolean" ? isVisible : isVisible.value;
  }

  onMounted(() => {
    if (isCurrentlyVisible()) {
      displayOrder.value = displayOrderRegistry.register(group, uid);
    }
  });

  onUnmounted(() => {
    displayOrderRegistry.unregister(group, uid);
    displayOrder.value = undefined;
  });

  return displayOrder;
}
