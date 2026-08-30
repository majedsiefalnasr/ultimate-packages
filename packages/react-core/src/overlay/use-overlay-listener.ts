import { useCallback } from "react";
import { useEventListener } from "../hooks/use-event-listener";
import { useResizeListener } from "../hooks/use-resize-listener";

export interface OverlayListenerMeta {
  type: "outside" | "resize" | "orientationchange" | "scroll";
  valid: boolean;
}

export interface UseOverlayListenerOptions {
  target: React.RefObject<HTMLElement>;
  overlay: React.RefObject<HTMLElement>;
  listener: (event: Event, meta: OverlayListenerMeta) => void;
  when?: boolean;
}

export function useOverlayListener({
  target,
  overlay,
  listener,
  when = true,
}: UseOverlayListenerOptions): [bind: () => void, unbind: () => void] {
  const isOutsideClicked = useCallback(
    (event: Event) => {
      const t = target.current;
      const o = overlay.current;
      const eventTarget = event.target as Node;
      if (!t) return false;
      return !(t.isSameNode(eventTarget) || t.contains(eventTarget) || o?.contains(eventTarget));
    },
    [target, overlay]
  );

  // Stabilized via useCallback so useEventListener's own bind/unbind memoization
  // (which keys on this exact listener reference) actually holds across renders.
  // Without this, a fresh inline arrow function on every render defeats bind/unbind
  // memoization: addEventListener and the later removeEventListener end up targeting
  // different function objects, so removeEventListener silently no-ops and the
  // listener leaks past unbind/unmount (verified regression, see spec file).
  const onDocumentClick = useCallback(
    (event: Event) => {
      const valid = isOutsideClicked(event);
      if (valid) listener(event, { type: "outside", valid });
    },
    [isOutsideClicked, listener]
  );

  const onWindowResize = useCallback(
    (event: Event) => listener(event, { type: "resize", valid: true }),
    [listener]
  );

  const [bindClick, unbindClick] = useEventListener({
    target: "document",
    type: "click",
    listener: onDocumentClick,
    when,
  });

  const [bindResize, unbindResize] = useResizeListener({
    listener: onWindowResize,
    when,
  });

  const bind = useCallback(() => {
    bindClick();
    bindResize();
  }, [bindClick, bindResize]);

  const unbind = useCallback(() => {
    unbindClick();
    unbindResize();
  }, [unbindClick, unbindResize]);

  return [bind, unbind];
}
