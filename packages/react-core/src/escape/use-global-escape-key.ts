import { useEffect } from "react";
import { escapeRegistry } from "@ultimate/uix-utils/escape";

export interface UseGlobalEscapeKeyOptions {
  callback: (event: KeyboardEvent) => void;
  when: boolean;
  priority: [primary: number, secondary: number | undefined];
}

// Delegates to @ultimate/uix-utils/escape's shared escapeRegistry as of Phase 4's
// prerequisite extraction (spec §11) — react-core no longer owns the registry
// itself, only the mount/unmount lifecycle trigger, matching this file's public
// signature exactly (no consumer-visible change).
export function useGlobalEscapeKey({ callback, when, priority }: UseGlobalEscapeKeyOptions): void {
  const [primary, secondary] = priority;

  useEffect(() => {
    if (!when || secondary === undefined) return;

    escapeRegistry.register(primary, secondary, callback);

    return () => {
      escapeRegistry.unregister(primary, secondary);
    };
  }, [callback, when, primary, secondary]);
}
