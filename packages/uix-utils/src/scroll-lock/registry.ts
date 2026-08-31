import { blockBodyScroll, unblockBodyScroll } from "../dom";

export interface ScrollLockRegistry {
  register(id: string): void;
  unregister(id: string): void;
}

const SCROLL_LOCK_OPTIONS = { className: "u-overflow-hidden", variableName: "--u-scrollbar-width" };

// Extracted verbatim in full from react-core/src/scroll-lock/use-scroll-lock.ts
// during Phase 4's prerequisite work (spec §16) — that file had zero load-bearing
// React coupling (useCallback was a non-load-bearing memoization wrapper only).
// Private, module-scoped — NOT a document property. Replaces PrimeReact's
// verified document.primeDialogParams global-mutation pattern. Coordinates body-
// scroll blocking across multiple simultaneous overlay instances: scroll stays
// blocked as long as at least one id is registered.
export function createScrollLockRegistry(): ScrollLockRegistry {
  const blockingIds = new Set<string>();

  return {
    register(id) {
      const wasEmpty = blockingIds.size === 0;
      blockingIds.add(id);
      if (wasEmpty) blockBodyScroll(SCROLL_LOCK_OPTIONS);
    },
    unregister(id) {
      if (!blockingIds.has(id)) return;
      blockingIds.delete(id);
      if (blockingIds.size === 0) unblockBodyScroll(SCROLL_LOCK_OPTIONS);
    },
  };
}

export const scrollLockRegistry: ScrollLockRegistry = createScrollLockRegistry();
