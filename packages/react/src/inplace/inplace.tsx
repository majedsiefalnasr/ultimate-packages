import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { inplaceStyleModule } from "./inplace-style";

export interface UInplaceProps {
  active?: boolean;
  disabled?: boolean;
  preventClick?: boolean;
  onToggle?: (event: { originalEvent: React.SyntheticEvent; value: boolean }) => void;
  onOpen?: (event: React.SyntheticEvent) => void;
  onClose?: (event: React.SyntheticEvent) => void;
  display: React.ReactNode;
  /** Render-prop for the edit content, given a `closeCallback`. */
  children: (closeCallback: (event?: React.SyntheticEvent) => void) => React.ReactNode;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `Inplace` component (real
 * source: `components/lib/inplace/Inplace.js`). Provides easy
 * editing/display at the same time: clicking the display content opens
 * the edit content — matching real source's own `active`/`disabled`/
 * `preventClick`/`onOpen`/`onClose`/`onToggle` structural shape
 * (uncontrolled by default, controlled when `onToggle` is supplied,
 * exactly matching real source's own `props.onToggle ? props.active :
 * activeState` branch).
 *
 * Deliberately excludes real source's separate `InplaceDisplay`/
 * `InplaceContent` marker components — this port uses a plain `display`
 * prop for the display slot and a `children` render-prop (given the
 * `closeCallback`) for the edit slot, same "smaller surface than
 * upstream" precedent as every sibling component.
 */
export function UInplace({
  active: activeProp = false,
  disabled = false,
  preventClick = false,
  onToggle,
  onOpen,
  onClose,
  display,
  children,
  className,
}: UInplaceProps): React.ReactElement {
  const { cx } = useComponentBase({ componentName: "inplace", styleModule: inplaceStyleModule });
  const [activeState, setActiveState] = React.useState(activeProp);
  const active = onToggle ? activeProp : activeState;

  const open = (event: React.SyntheticEvent) => {
    if (disabled) return;
    onOpen?.(event);
    if (onToggle) {
      onToggle({ originalEvent: event, value: true });
    } else {
      setActiveState(true);
    }
  };

  const close = (event?: React.SyntheticEvent) => {
    if (disabled) return;
    if (event) onClose?.(event);
    if (onToggle) {
      onToggle({ originalEvent: event as React.SyntheticEvent, value: false });
    } else {
      setActiveState(false);
    }
  };

  const onDisplayClick = (event: React.MouseEvent) => {
    if (!preventClick) open(event);
  };

  const onDisplayKeyDown = (event: React.KeyboardEvent) => {
    if (event.code === "Enter" || event.code === "NumpadEnter") {
      if (!preventClick) open(event);
      event.preventDefault();
    }
  };

  return (
    <div className={[cx("root"), className].filter(Boolean).join(" ")} aria-live="polite">
      {!active ? (
        <div
          className={cx("display")}
          tabIndex={0}
          role="button"
          data-p-disabled={disabled}
          onClick={onDisplayClick}
          onKeyDown={onDisplayKeyDown}
        >
          {display}
        </div>
      ) : (
        <div className={cx("content")}>{children(close)}</div>
      )}
    </div>
  );
}
