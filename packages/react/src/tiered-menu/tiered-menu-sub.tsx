import * as React from "react";
import type { UMenuItem } from "../menu";

export interface UTieredMenuSubProps {
  items: UMenuItem[];
  root: boolean;
  cx: (key: string, params?: Record<string, unknown>) => string | undefined;
  onItemSelect: (event: { originalEvent: React.SyntheticEvent; item: UMenuItem }) => void;
}

/**
 * Recursive submenu renderer for `UTieredMenu`, adapted from real
 * PrimeReact's `TieredMenuSub`
 * (`.vendor-extracted/react/tieredmenu/TieredMenuSub.js`) — same
 * recursive-self-reference shape, scoped down to this task's smaller
 * surface (click/hover-driven open only, no keyboard roving-focus/search-
 * by-typing machinery, matching `UMenu`'s own established reduction
 * pattern).
 */
export const UTieredMenuSub: React.FC<UTieredMenuSubProps> = ({ items, root, cx, onItemSelect }) => {
  const [openItem, setOpenItem] = React.useState<UMenuItem | null>(null);

  const hasItems = (item: UMenuItem) => !!item.items && item.items.length > 0;

  const onItemClick = (event: React.MouseEvent, item: UMenuItem) => {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    if (hasItems(item)) {
      event.preventDefault();
      setOpenItem((current) => (current === item ? null : item));
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
    <ul className={root ? cx("rootList") : cx("submenu")} role="menu">
      {items.map((item, index) => {
        if (item.separator) {
          return <li key={`sep_${index}`} className={cx("separator")} role="separator" />;
        }
        if (item.visible === false) return null;
        const open = openItem === item;
        return (
          <li
            key={item.label ?? index}
            role="menuitem"
            className={cx("menuitem", { disabled: !!item.disabled, open })}
            data-u-disabled={String(!!item.disabled)}
            data-u-open={String(open)}
            onMouseEnter={() => hasItems(item) && !item.disabled && setOpenItem(item)}
          >
            <div className={cx("content")}>
              <a
                href={item.url ?? "#"}
                className={cx("action")}
                aria-haspopup={hasItems(item) ? "menu" : undefined}
                aria-expanded={hasItems(item) ? open : undefined}
                aria-disabled={item.disabled}
                tabIndex={-1}
                onClick={(event) => onItemClick(event, item)}
              >
                {item.icon && <span className={cx("icon")}>{item.icon}</span>}
                {item.label && <span className={cx("label")}>{item.label}</span>}
                {hasItems(item) && (
                  <span className={cx("submenuIcon")} aria-hidden="true">
                    ▸
                  </span>
                )}
              </a>
            </div>
            {hasItems(item) && (
              <UTieredMenuSub items={item.items ?? []} root={false} cx={cx} onItemSelect={onItemSelect} />
            )}
          </li>
        );
      })}
    </ul>
  );
};
