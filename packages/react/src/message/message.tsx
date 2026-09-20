import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { messageStyleModule } from "./message-style";

export interface UMessageProps {
  severity?: "success" | "info" | "warn" | "error" | "secondary" | "contrast";
  closable?: boolean;
  icon?: React.ReactNode;
  closeIcon?: React.ReactNode;
  life?: number;
  closeAriaLabel?: string;
  onClose?: (event: { originalEvent: React.SyntheticEvent }) => void;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `Message` component (real
 * source: `components/lib/message/Message.js`/`MessageBase.js`). Confirmed
 * against real source: extends the bare `ComponentBase` tier (no CVA) — a
 * status/display component (severity-colored banner with an optional close
 * button and optional auto-dismiss timer), never a form control.
 *
 * Real PrimeReact's own `Message` auto-selects a default icon per severity
 * (info/warn/error/success) when no `icon` prop is given — this port keeps
 * that behavior with plain `pi pi-*` icon classes (no bundled SVG icon
 * components exist in `react-core` yet for these 4 glyphs), disclosed
 * rather than silently omitted. Deliberately excludes real source's
 * `content` render-prop override and `pt`/passthrough system — same
 * "smaller surface than upstream" precedent as every sibling component.
 */
export const UMessage = React.forwardRef<HTMLDivElement, UMessageProps>(function UMessage(
  {
    severity = "info",
    closable = false,
    icon,
    closeIcon,
    life,
    closeAriaLabel = "Close",
    onClose,
    children,
    className,
  },
  ref
) {
  const { cx } = useComponentBase({ componentName: "message", styleModule: messageStyleModule });
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    if (!life) return;
    const timer = setTimeout(() => setVisible(false), life);
    return () => clearTimeout(timer);
  }, [life]);

  const close = (event: React.SyntheticEvent) => {
    setVisible(false);
    onClose?.({ originalEvent: event });
  };

  const defaultIconClass: Record<string, string> = {
    info: "pi pi-info-circle",
    success: "pi pi-check",
    warn: "pi pi-exclamation-triangle",
    error: "pi pi-times-circle",
  };
  const resolvedIcon = icon ?? (defaultIconClass[severity] ? <i className={defaultIconClass[severity]} aria-hidden="true" /> : null);

  if (!visible) return null;

  return (
    <div
      ref={ref}
      className={[cx("root", { severity }), className].filter(Boolean).join(" ")}
      role="alert"
      aria-live="polite"
      data-severity={severity}
    >
      <div className={cx("content")}>
        {resolvedIcon && <span className={cx("icon")}>{resolvedIcon}</span>}
        <span className={cx("text")}>{children}</span>
        {closable && (
          <button
            type="button"
            className={cx("closeButton")}
            aria-label={closeAriaLabel}
            onClick={close}
          >
            {closeIcon ?? <>&times;</>}
          </button>
        )}
      </div>
    </div>
  );
});
