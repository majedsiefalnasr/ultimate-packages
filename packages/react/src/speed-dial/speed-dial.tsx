import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { speedDialStyleModule } from "./speed-dial-style";
import type { UMenuItem } from "../menu";

export type USpeedDialDirection = "up" | "down" | "left" | "right" | "up-left" | "up-right" | "down-left" | "down-right";
export type USpeedDialType = "linear" | "circle" | "semi-circle" | "quarter-circle";

export interface USpeedDialProps {
  /** MenuModel instance to define the action items. */
  model?: UMenuItem[];
  /** Icon of the toggle button. */
  icon?: string;
  /** Specifies the opening direction of actions. */
  direction?: USpeedDialDirection;
  /** Specifies the opening type of actions. */
  type?: USpeedDialType;
  /** Radius for *circle types. */
  radius?: number;
  /** Transition delay step for each action item, in ms. */
  transitionDelay?: number;
  /** Whether to show a mask element behind the speed dial. */
  mask?: boolean;
  /** Whether the component is disabled. */
  disabled?: boolean;
  /** Whether the actions close when Escape is pressed. */
  closeOnEscape?: boolean;
  /** Defines a string value that labels an interactive element. */
  ariaLabel?: string;
  /** Fired when the visibility of element changed. */
  onVisibleChange?: (visible: boolean) => void;
  /** Fired when the button element is clicked. */
  onClick?: (event: React.MouseEvent) => void;
  /** Fired when the actions become visible. */
  onShow?: () => void;
  /** Fired when the actions are hidden. */
  onHide?: () => void;
  className?: string;
}

export interface USpeedDialHandle {
  show: () => void;
  hide: () => void;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `SpeedDial` component (see
 * `.vendor-extracted/react/speeddial/SpeedDial.js`). A floating action
 * button that expands into a list of secondary action items.
 *
 * Real PrimeReact's `SpeedDial` (composes only `Button`, no import of
 * `../menu` or `../tieredmenu`) is a standalone, independent component
 * driven by a flat `MenuItem[]` model. Expand/collapse is a single boolean
 * `visible` flag; the fan-out is pure CSS-transition + inline per-item
 * `transitionDelay`/positioning — no external animation library, no
 * overlay/z-index primitive beyond an optional CSS mask `<div>` — well
 * within this project's existing `useState` + computed-inline-style
 * pattern, already established by this same capability's `UTieredMenu`
 * sibling. This adaptation follows that same independent shape and
 * mechanism (see this same capability's Angular `speed-dial.ts` sibling's
 * doc comment for the full cross-framework confirmation).
 */
export const USpeedDial = React.forwardRef<USpeedDialHandle, USpeedDialProps>(function USpeedDial(
  {
    model = [],
    icon,
    direction = "up",
    type = "linear",
    radius = 0,
    transitionDelay = 30,
    mask = false,
    disabled = false,
    closeOnEscape = true,
    ariaLabel,
    onVisibleChange,
    onClick,
    onShow,
    onHide,
    className,
  },
  ref
) {
  const { cx } = useComponentBase({ componentName: "speed-dial", styleModule: speedDialStyleModule });
  const [visible, setVisible] = React.useState(false);

  const show = React.useCallback(() => {
    setVisible((current) => {
      if (current) return current;
      onVisibleChange?.(true);
      onShow?.();
      return true;
    });
  }, [onVisibleChange, onShow]);

  const hide = React.useCallback(() => {
    setVisible((current) => {
      if (!current) return current;
      onVisibleChange?.(false);
      onHide?.();
      return false;
    });
  }, [onVisibleChange, onHide]);

  React.useImperativeHandle(ref, () => ({ show, hide }), [show, hide]);

  React.useEffect(() => {
    if (!closeOnEscape || !visible) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") hide();
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [closeOnEscape, visible, hide]);

  const calculatePointStyle = (index: number): React.CSSProperties => {
    if (type === "linear") return {};
    const length = model.length;
    const r = radius || length * 20;

    if (type === "circle") {
      const step = (2 * Math.PI) / length;
      return { left: `${r * Math.cos(step * index)}px`, top: `${r * Math.sin(step * index)}px` };
    }
    if (type === "semi-circle") {
      const step = Math.PI / (length - 1);
      const x = `${r * Math.cos(step * index)}px`;
      const y = `${r * Math.sin(step * index)}px`;
      if (direction === "up") return { left: x, bottom: y };
      if (direction === "down") return { left: x, top: y };
      if (direction === "left") return { right: y, top: x };
      if (direction === "right") return { left: y, top: x };
    }
    if (type === "quarter-circle") {
      const step = Math.PI / (2 * (length - 1));
      const x = `${r * Math.cos(step * index)}px`;
      const y = `${r * Math.sin(step * index)}px`;
      if (direction === "up-left") return { right: x, bottom: y };
      if (direction === "up-right") return { left: x, bottom: y };
      if (direction === "down-left") return { right: y, top: x };
      if (direction === "down-right") return { left: y, top: x };
    }
    return {};
  };

  const getItemStyle = (index: number): React.CSSProperties => {
    const length = model.length;
    const delay = (visible ? index : length - index - 1) * transitionDelay;
    return { transitionDelay: `${delay}ms`, ...calculatePointStyle(index) };
  };

  const listFlexDirection =
    direction === "up" ? "column-reverse" : direction === "down" ? "column" : direction === "left" ? "row-reverse" : direction === "right" ? "row" : undefined;

  const onButtonClick = (event: React.MouseEvent) => {
    visible ? hide() : show();
    onClick?.(event);
  };

  const onItemClick = (event: React.MouseEvent, item: UMenuItem) => {
    item.command?.({ originalEvent: event, item });
    hide();
  };

  return (
    <>
      <div className={[cx("root", { direction }), className].filter(Boolean).join(" ")}>
        <button
          type="button"
          className={cx("pcButton", { open: visible })}
          disabled={disabled}
          aria-expanded={visible}
          aria-haspopup="true"
          aria-label={ariaLabel}
          onClick={onButtonClick}
        >
          {icon && <span className={icon} />}
        </button>
        <ul className={cx("list")} role="menu" style={listFlexDirection ? { flexDirection: listFlexDirection } : undefined}>
          {model.map((item, index) => (
            <li key={item.label ?? index} className={cx("item", { hidden: item.visible === false })} role="none" style={getItemStyle(index)}>
              <button
                type="button"
                className={cx("pcAction")}
                role="menuitem"
                disabled={item.disabled}
                aria-label={item.label}
                tabIndex={item.disabled || !visible ? -1 : 0}
                onClick={(event) => onItemClick(event, item)}
              >
                {item.icon && <span className={[cx("actionIcon"), item.icon].filter(Boolean).join(" ")} />}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {mask && visible && <div className={cx("mask")} onClick={hide} />}
    </>
  );
});
