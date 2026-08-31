import { useEffect, useState } from "react";
import { displayOrderRegistry } from "@ultimate/uix-utils/escape";

let uidCounter = 0;

// Delegates to @ultimate/uix-utils/escape's shared displayOrderRegistry as of
// Phase 4's prerequisite extraction (spec §11) — the useState-based
// return-and-re-render contract stays here, genuinely React-specific and
// unchanged; only the underlying groupToDisplayedElements registry moved.
export function useDisplayOrder(group: string, isVisible = true): number | undefined {
  const [uid] = useState(() => ++uidCounter);
  const [displayOrder, setDisplayOrder] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!isVisible) return;

    const newOrder = displayOrderRegistry.register(group, uid);
    setDisplayOrder(newOrder);

    return () => {
      displayOrderRegistry.unregister(group, uid);
      setDisplayOrder(undefined);
    };
  }, [group, uid, isVisible]);

  return displayOrder;
}
