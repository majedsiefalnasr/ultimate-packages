import { useCallback } from "react";
import { blockBodyScroll, unblockBodyScroll } from "@ultimate/uix-utils";

// Private, module-scoped — NOT a document property. Replaces PrimeReact's verified
// document.primeDialogParams global-mutation pattern (spec §16). Coordinates
// body-scroll blocking across multiple simultaneous UDialog instances: scroll
// stays blocked as long as at least one dialog is registered.
const blockingIds = new Set<string>();
const SCROLL_LOCK_OPTIONS = { className: "u-overflow-hidden", variableName: "--u-scrollbar-width" };

export function useScrollLock(): {
  register: (id: string) => void;
  unregister: (id: string) => void;
} {
  const register = useCallback((id: string) => {
    const wasEmpty = blockingIds.size === 0;
    blockingIds.add(id);
    if (wasEmpty) blockBodyScroll(SCROLL_LOCK_OPTIONS);
  }, []);

  const unregister = useCallback((id: string) => {
    if (!blockingIds.has(id)) return;
    blockingIds.delete(id);
    if (blockingIds.size === 0) unblockBodyScroll(SCROLL_LOCK_OPTIONS);
  }, []);

  return { register, unregister };
}
