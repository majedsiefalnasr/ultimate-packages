import { useCallback, useRef } from "react";

export interface UseEventListenerOptions {
  target: EventTarget | (() => EventTarget | null) | "window" | "document";
  type: string;
  listener: (event: Event) => void;
  when?: boolean;
}

function resolveTarget(target: UseEventListenerOptions["target"]): EventTarget | null {
  if (target === "window") return typeof window !== "undefined" ? window : null;
  if (target === "document") return typeof document !== "undefined" ? document : null;
  if (typeof target === "function") return target();
  return target;
}

export function useEventListener({
  target,
  type,
  listener,
  when = true,
}: UseEventListenerOptions): [bind: () => void, unbind: () => void] {
  // Stores the exact function object actually passed to addEventListener, not just
  // whether *something* is bound. This is the fix for a leaked-listener bug: bind()
  // and unbind() can be called from different renders' closures (e.g. bind() from an
  // effect that ran while a caller-supplied `listener` prop had one identity, unbind()
  // later from a closure where that same prop — or a callback derived from it — has
  // since changed identity, such as menu.tsx's `hide`, which is useCallback(...,
  // [visible]) and is expected to change identity across the very bind/unbind
  // transition it's used in). A plain boolean "is it bound" flag has no way to know
  // which function was actually registered, so calling removeEventListener(type,
  // <current listener>) can target a different function object than the one
  // addEventListener received — removeEventListener silently no-ops on a mismatched
  // reference, and the real listener leaks forever. Storing the bound function itself
  // makes unbind() correct regardless of what the current-render `listener` value is.
  const boundListenerRef = useRef<((event: Event) => void) | null>(null);

  const bind = useCallback(() => {
    if (boundListenerRef.current || !when) return;
    const el = resolveTarget(target);
    el?.addEventListener(type, listener);
    boundListenerRef.current = listener;
  }, [target, type, listener, when]);

  const unbind = useCallback(() => {
    if (!boundListenerRef.current) return;
    const el = resolveTarget(target);
    el?.removeEventListener(type, boundListenerRef.current);
    boundListenerRef.current = null;
  }, [target, type]);

  return [bind, unbind];
}
