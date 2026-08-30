import { useEventListener, type UseEventListenerOptions } from "./use-event-listener";

export function useResizeListener({
  listener,
  when = true,
}: Pick<UseEventListenerOptions, "listener" | "when">): [bind: () => void, unbind: () => void] {
  return useEventListener({ target: "window", type: "resize", listener, when });
}
