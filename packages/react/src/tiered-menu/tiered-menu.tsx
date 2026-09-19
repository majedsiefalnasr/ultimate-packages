import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { UTieredMenuSub } from "./tiered-menu-sub";
import { tieredMenuStyleModule } from "./tiered-menu-style";
import type { UMenuItem } from "../menu";

export interface UTieredMenuProps {
  /** An array of menuitems. */
  model?: UMenuItem[];
  /** Defines if menu would displayed as a popup. */
  popup?: boolean;
  /** Fired when an item is selected. */
  onItemSelect?: (event: { originalEvent: React.SyntheticEvent; item: UMenuItem }) => void;
  /** Callback to invoke when the popup menu is shown. */
  onShow?: () => void;
  /** Callback to invoke when the popup menu is hidden. */
  onHide?: () => void;
  className?: string;
}

export interface UTieredMenuHandle {
  toggle: () => void;
  show: () => void;
  hide: () => void;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `TieredMenu` component (see
 * `.vendor-extracted/react/tieredmenu/TieredMenu.js`; `TieredMenuSub`
 * split into `UTieredMenuSub`). Renders nested popup submenus via a
 * recursive sub-component, either inline (`popup: false`, matching
 * `UMenu`'s own inline mode) or as a toggleable popup (`popup: true`).
 *
 * Real PrimeReact's `TieredMenu` (no import of `../menu`) is a standalone,
 * independent component — it does NOT compose `Menu`.
 */
export const UTieredMenu = React.forwardRef<UTieredMenuHandle, UTieredMenuProps>(function UTieredMenu(
  { model = [], popup = false, onItemSelect, onShow, onHide, className },
  ref
) {
  const { cx } = useComponentBase({ componentName: "tiered-menu", styleModule: tieredMenuStyleModule });
  const [visible, setVisible] = React.useState(!popup);

  const hide = React.useCallback(() => {
    setVisible((current) => {
      if (!current) return current;
      onHide?.();
      return false;
    });
  }, [onHide]);

  const show = React.useCallback(() => {
    setVisible((current) => {
      if (current) return current;
      onShow?.();
      return true;
    });
  }, [onShow]);

  React.useImperativeHandle(
    ref,
    () => ({
      toggle: () => (visible ? hide() : show()),
      show,
      hide,
    }),
    [visible, show, hide]
  );

  React.useEffect(() => {
    if (!popup || !visible) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") hide();
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [popup, visible, hide]);

  const handleItemSelect = (event: { originalEvent: React.SyntheticEvent; item: UMenuItem }) => {
    onItemSelect?.(event);
    if (popup) hide();
  };

  if (popup && !visible) return null;

  return (
    <div className={[cx("root", { popup }), className].filter(Boolean).join(" ")}>
      <UTieredMenuSub items={model} root cx={cx} onItemSelect={handleItemSelect} />
    </div>
  );
});
