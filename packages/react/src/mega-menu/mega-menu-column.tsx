import * as React from "react";
import type { UMenuItem } from "../menu";
import type { UMegaMenuGroup } from "./mega-menu-item";

export interface UMegaMenuColumnGroupProps {
  group: UMegaMenuGroup;
  cx: (key: string, params?: Record<string, unknown>) => string | undefined;
  onItemSelect: (event: { originalEvent: React.SyntheticEvent; item: UMenuItem }) => void;
}

/**
 * Renders one submenu group within a MegaMenu overlay column — an optional
 * label header followed by a flat list of leaf items. Adapted from real
 * PrimeReact's `MegaMenu.js`'s `createSubmenu` applied to a single group.
 */
export const UMegaMenuColumnGroup: React.FC<UMegaMenuColumnGroupProps> = ({ group, cx, onItemSelect }) => {
  const onItemClick = (event: React.MouseEvent, item: UMenuItem) => {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    item.command?.({ originalEvent: event, item });
    onItemSelect({ originalEvent: event, item });
    if (!item.url) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  return (
    <ul className={cx("submenu")} role="menu">
      {group.label && (
        <li className={cx("submenuLabel")} role="presentation">
          {group.label}
        </li>
      )}
      {(group.items ?? []).map((item, index) => {
        if (item.visible === false) return null;
        return (
          <li key={item.label ?? index} className={cx("menuitem")} role="none">
            <div className={cx("content")}>
              <a
                role="menuitem"
                href={item.url ?? "#"}
                className={cx("action")}
                aria-disabled={item.disabled}
                tabIndex={item.disabled ? -1 : 0}
                onClick={(event) => onItemClick(event, item)}
              >
                {item.icon && <span className={cx("icon")}>{item.icon}</span>}
                {item.label && <span className={cx("label")}>{item.label}</span>}
              </a>
            </div>
          </li>
        );
      })}
    </ul>
  );
};
