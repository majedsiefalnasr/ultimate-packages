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

  const [bindClick, unbindClick] = useEventListener({
    target: "document",
    type: "click",
    listener: (event) => {
      const valid = isOutsideClicked(event);
      if (valid) listener(event, { type: "outside", valid });
    },
    when,
  });

  const [bindResize, unbindResize] = useResizeListener({
    listener: (event) => listener(event, { type: "resize", valid: true }),
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
