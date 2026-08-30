import { useEffect } from "react";

type EscapeListener = (event: KeyboardEvent) => void;

const escKeyListeners = new Map<number, Map<number, EscapeListener>>();

function onGlobalKeyDown(event: KeyboardEvent): void {
  if (event.code !== "Escape") return;
  const primaryKeys = [...escKeyListeners.keys()];
  if (primaryKeys.length === 0) return;
  const maxPrimary = Math.max(...primaryKeys);
  const secondaryMap = escKeyListeners.get(maxPrimary);
  if (!secondaryMap || secondaryMap.size === 0) return;
  const maxSecondary = Math.max(...secondaryMap.keys());
  secondaryMap.get(maxSecondary)?.(event);
}

function refreshGlobalListener(): void {
  if (typeof document === "undefined") return;
  const hasListeners = [...escKeyListeners.values()].some((m) => m.size > 0);
  document.removeEventListener("keydown", onGlobalKeyDown);
  if (hasListeners) document.addEventListener("keydown", onGlobalKeyDown);
}

export interface UseGlobalEscapeKeyOptions {
  callback: EscapeListener;
  when: boolean;
  priority: [primary: number, secondary: number | undefined];
}

export function useGlobalEscapeKey({ callback, when, priority }: UseGlobalEscapeKeyOptions): void {
  const [primary, secondary] = priority;

  useEffect(() => {
    if (!when || secondary === undefined) return;

    if (!escKeyListeners.has(primary)) escKeyListeners.set(primary, new Map());
    const secondaryMap = escKeyListeners.get(primary)!;
    secondaryMap.set(secondary, callback);
    refreshGlobalListener();

    return () => {
      secondaryMap.delete(secondary);
      if (secondaryMap.size === 0) escKeyListeners.delete(primary);
      refreshGlobalListener();
    };
  }, [callback, when, primary, secondary]);
}
