import { useCallback } from "react";
import { scrollLockRegistry } from "@ultimate/uix-utils/scroll-lock";

// Delegates to @ultimate/uix-utils/scroll-lock's shared scrollLockRegistry as of
// Phase 4's prerequisite extraction (spec §16) — react-core no longer owns the
// Set itself, only this useCallback wrapper (kept for React's
// reference-stability convention). Public signature unchanged.
export function useScrollLock(): {
  register: (id: string) => void;
  unregister: (id: string) => void;
} {
  const register = useCallback((id: string) => {
    scrollLockRegistry.register(id);
  }, []);

  const unregister = useCallback((id: string) => {
    scrollLockRegistry.unregister(id);
  }, []);

  return { register, unregister };
}
