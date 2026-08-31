import { useCallback } from "react";
import { ZIndex } from "@ultimate/uix-utils";

// Verified default values from PrimeReact's real api/PrimeReact.js — adopted as
// Ultimate's own starting values (spec §12).
export const Z_INDEX_BUCKETS = {
  modal: 1100,
  overlay: 1000,
  menu: 1000,
  tooltip: 1100,
  toast: 1200,
} as const;

export function useZIndex(): {
  set: (
    key: keyof typeof Z_INDEX_BUCKETS,
    element: HTMLElement | null,
    baseZIndex?: number
  ) => void;
  clear: (element: HTMLElement | null) => void;
} {
  const set = useCallback(
    (key: keyof typeof Z_INDEX_BUCKETS, element: HTMLElement | null, baseZIndex?: number) => {
      if (!element) return;
      ZIndex.set(key, element, baseZIndex ?? Z_INDEX_BUCKETS[key]);
    },
    []
  );

  const clear = useCallback((element: HTMLElement | null) => {
    if (!element) return;
    ZIndex.clear(element);
  }, []);

  return { set, clear };
}
