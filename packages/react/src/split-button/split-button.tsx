import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { UButton } from "../button";
import { UMenu, type UMenuHandle, type UMenuItem } from "../menu";
import { splitButtonStyleModule } from "./split-button-style";

export interface USplitButtonProps {
  /** MenuModel instance to define the overlay items. */
  model?: UMenuItem[];
  /** Text of the button. */
  label?: string;
  /** Name of the icon. */
  icon?: React.ReactNode;
  /** Position of the icon. */
  iconPos?: "left" | "right" | "top" | "bottom";
  /** Defines the style of the button. */
  severity?: "secondary" | "success" | "info" | "warning" | "danger" | "help" | "contrast";
  /** Add a textual class to the button without a background initially. */
  text?: boolean;
  /** Add a border class without a background initially. */
  outlined?: boolean;
  /** Defines the size of the button. */
  size?: "small" | "large";
  /** When present, it specifies that the component should be disabled. */
  disabled?: boolean;
  /** Callback to execute when the default command button is clicked. */
  onClick?: (event: React.SyntheticEvent) => void;
  /** Callback to execute when the popup menu is shown. */
  onShow?: () => void;
  /** Callback to execute when the popup menu is hidden. */
  onHide?: () => void;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `SplitButton` component (see
 * `.vendor-extracted/react/splitbutton/SplitButton.js`). Renders a default
 * command button attached to a dropdown-toggle button, which opens a
 * popup `Menu` of secondary commands.
 *
 * Real PrimeReact's `SplitButton` composes `Button` + `TieredMenu`
 * (verified this task's Step 1 — `SplitButton.js` imports `../tieredmenu`,
 * not `../menu`), since upstream's own secondary items may themselves have
 * nested `items`. This task's binding instruction (implementation-plan §5,
 * Task Group C table) is explicit: SplitButton "composes already-Built
 * Button + Menu — no dependency wait needed, both already exist" — so this
 * adaptation composes Ultimate's own already-Built `UButton` + `UMenu`
 * (in `popup` mode) directly, not `UTieredMenu` (itself one of this same
 * batch's own new capabilities, not the plan's stated dependency).
 *
 * `UMenu`'s own popup mode already closes itself on outside click/Escape/
 * item selection (its own established behavior, read-only reference) — no
 * additional wrapping is needed beyond wiring `UMenuHandle.toggle()`/
 * `hide()` to the dropdown/default buttons.
 */
export const USplitButton = React.forwardRef<HTMLDivElement, USplitButtonProps>(function USplitButton(
  { model = [], label, icon, iconPos, severity, text, outlined, size, disabled, onClick, onShow, onHide, className },
  ref
) {
  const { cx } = useComponentBase({ componentName: "split-button", styleModule: splitButtonStyleModule });
  const menuRef = React.useRef<UMenuHandle>(null);

  const handleDefaultClick = (event: React.SyntheticEvent) => {
    menuRef.current?.hide();
    onClick?.(event);
  };

  const handleDropdownClick = (event: React.SyntheticEvent) => {
    menuRef.current?.toggle(event);
  };

  return (
    <div ref={ref} className={[cx("root"), className].filter(Boolean).join(" ")}>
      <UButton
        className={cx("button")}
        label={label}
        icon={icon}
        iconPos={iconPos}
        severity={severity}
        text={text}
        outlined={outlined}
        size={size}
        disabled={disabled}
        onClick={handleDefaultClick}
      />
      <UButton
        className={cx("dropdown")}
        icon="▾"
        severity={severity}
        text={text}
        outlined={outlined}
        size={size}
        disabled={disabled}
        aria-haspopup="menu"
        onClick={handleDropdownClick}
      />
      <UMenu ref={menuRef} model={model} popup onShow={onShow} onHide={onHide} />
    </div>
  );
});
