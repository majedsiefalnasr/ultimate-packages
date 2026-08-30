import { useCallback, useRef } from "react";

export interface UseEventListenerOptions {
  target: EventTarget | (() => EventTarget | null) | "window" | "document";
  type: string;
  listener: (event: Event) => void;
  when?: boolean;
}

function resolveTarget(
  target: UseEventListenerOptions["target"]
): EventTarget | null {
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
  const boundRef = useRef(false);

  const bind = useCallback(() => {
    if (boundRef.current || !when) return;
    const el = resolveTarget(target);
    el?.addEventListener(type, listener);
    boundRef.current = true;
  }, [target, type, listener, when]);

  const unbind = useCallback(() => {
    if (!boundRef.current) return;
    const el = resolveTarget(target);
    el?.removeEventListener(type, listener);
    boundRef.current = false;
  }, [target, type, listener]);

  return [bind, unbind];
}
