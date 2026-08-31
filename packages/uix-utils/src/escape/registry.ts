export type EscapeListener = (event: KeyboardEvent) => void;

export interface EscapeRegistry {
  register(primary: number, secondary: number, callback: EscapeListener): void;
  unregister(primary: number, secondary: number): void;
}

// Extracted from react-core/src/escape/use-global-escape-key.ts's non-React
// portion during Phase 4's prerequisite work (spec §11) — same registry/
// comparison/document-listener logic, framework-neutral by construction (no
// React/Vue/Angular API dependency). react-core's useGlobalEscapeKey and
// vue-core's createGlobalEscapeKeyMixin both call this same registry instance.
export function createEscapeRegistry(): EscapeRegistry {
  const listeners = new Map<number, Map<number, EscapeListener>>();

  function onGlobalKeyDown(event: KeyboardEvent): void {
    if (event.code !== "Escape") return;
    const primaryKeys = [...listeners.keys()];
    if (primaryKeys.length === 0) return;
    const maxPrimary = Math.max(...primaryKeys);
    const secondaryMap = listeners.get(maxPrimary);
    if (!secondaryMap || secondaryMap.size === 0) return;
    const maxSecondary = Math.max(...secondaryMap.keys());
    secondaryMap.get(maxSecondary)?.(event);
  }

  function refreshGlobalListener(): void {
    if (typeof document === "undefined") return;
    const hasListeners = [...listeners.values()].some((m) => m.size > 0);
    document.removeEventListener("keydown", onGlobalKeyDown);
    if (hasListeners) document.addEventListener("keydown", onGlobalKeyDown);
  }

  return {
    register(primary, secondary, callback) {
      if (!listeners.has(primary)) listeners.set(primary, new Map());
      listeners.get(primary)!.set(secondary, callback);
      refreshGlobalListener();
    },
    unregister(primary, secondary) {
      const secondaryMap = listeners.get(primary);
      if (!secondaryMap) return;
      secondaryMap.delete(secondary);
      if (secondaryMap.size === 0) listeners.delete(primary);
      refreshGlobalListener();
    },
  };
}

export const escapeRegistry: EscapeRegistry = createEscapeRegistry();
