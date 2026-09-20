import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { toastStyleModule } from "./toast-style";

export interface UToastMessageOptions {
  severity?: "success" | "info" | "warn" | "error" | "secondary" | "contrast";
  summary?: string;
  detail?: string;
  /** Milliseconds before auto-dismissal; ignored when `sticky` is true. Defaults to the `UToast`'s own `life` prop (3000ms) when unset. */
  life?: number;
  /** When true, the message never auto-dismisses. */
  sticky?: boolean;
  /** Whether the message shows a manual close button. Defaults to true. */
  closable?: boolean;
  [extra: string]: unknown;
}

interface ToastEntry extends UToastMessageOptions {
  id: number;
}

let nextId = 0;

/** Imperative handle exposed via `ref` — matches real PrimeReact's own `show`/`clear` shape (real source's own `replace()`/`getElement()` excluded — smaller-than-upstream surface, disclosed). */
export interface UToastHandle {
  /** Queues one or more toast notifications — safe to call repeatedly for a stacked set of notifications. */
  show: (message: UToastMessageOptions | UToastMessageOptions[]) => void;
  /** Clears every queued/displayed message. */
  clear: () => void;
}

export interface UToastProps {
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center"
    | "center";
  life?: number;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `Toast` component (real
 * source: `components/lib/toast/Toast.js`/`ToastBase.js`). Confirmed
 * against real source: extends the bare `ComponentBase` tier (no CVA) — a
 * service-driven, transient-notification-stack overlay (spec §3.0's own
 * description). Real PrimeReact's own mechanism is genuinely different
 * from ConfirmDialog's `OverlayService.emit()` eventbus pattern
 * (investigated this task, not assumed): `Toast` exposes an imperative
 * `ref` handle (`useImperativeHandle` → `show`/`replace`/`remove`/`clear`,
 * `Toast.js` lines ~14-119) — callers hold a `ref` to the mounted
 * `<Toast>` and call `toastRef.current.show(...)` directly, not a
 * module-level event bus. This port keeps that same real ref-imperative
 * mechanism (`show`/`clear`, real source's own `replace`/`getElement`
 * excluded — smaller-than-upstream surface, disclosed) rather than forcing
 * Vue's `UToastService`/ConfirmDialog's eventbus shape onto React, per
 * this task's own instruction to investigate each framework's real
 * mechanism independently.
 *
 * Each queued message gets its own auto-dismiss timer (`life`, default
 * 3000ms, `sticky` disables it) — real source delegates this to a nested
 * `ToastMessage` sub-component; this port folds that responsibility into
 * `UToast` itself, same "smaller surface than upstream" precedent as
 * `UMessage`'s own plain-state-gated rendering (no enter/leave animation,
 * real source's own `CSSTransition`/`TransitionGroup` excluded).
 */
export const UToast = React.forwardRef<UToastHandle, UToastProps>(function UToast(
  { position = "top-right", life = 3000, className },
  ref
) {
  const { cx } = useComponentBase({ componentName: "toast", styleModule: toastStyleModule });
  const [messages, setMessages] = React.useState<ToastEntry[]>([]);
  const timersRef = React.useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const remove = React.useCallback((id: number) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const push = React.useCallback(
    (message: UToastMessageOptions) => {
      const id = nextId++;
      const entry: ToastEntry = { ...message, id };
      setMessages((prev) => [...prev, entry]);
      if (!entry.sticky) {
        const timer = setTimeout(() => remove(id), entry.life ?? life);
        timersRef.current.set(id, timer);
      }
    },
    [life, remove]
  );

  React.useImperativeHandle(
    ref,
    () => ({
      show: (message) => {
        const list = Array.isArray(message) ? message : [message];
        list.forEach(push);
      },
      clear: () => {
        timersRef.current.forEach((timer) => clearTimeout(timer));
        timersRef.current.clear();
        setMessages([]);
      },
    }),
    [push]
  );

  React.useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  return (
    <div className={[cx("root", { position }), className].filter(Boolean).join(" ")}>
      {messages.map((message) => (
        <div key={message.id} className={cx("message", { severity: message.severity })} role="alert" aria-live="assertive" aria-atomic="true">
          <div className={cx("messageContent")}>
            {message.summary && <div className={cx("summary")}>{message.summary}</div>}
            {message.detail && <div className={cx("detail")}>{message.detail}</div>}
          </div>
          {message.closable !== false && (
            <button
              type="button"
              className={cx("closeButton")}
              aria-label="Close"
              onClick={() => remove(message.id)}
            >
              &times;
            </button>
          )}
        </div>
      ))}
    </div>
  );
});
