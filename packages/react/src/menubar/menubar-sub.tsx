import * as React from "react";
import type { UMenuItem } from "../menu";

export interface UMenubarSubProps {
  items: UMenuItem[];
  root: boolean;
  cx: (key: string, params?: Record<string, unknown>) => string | undefined;
  onItemSelect: (event: { originalEvent: React.SyntheticEvent; item: UMenuItem }) => void;
}

/**
 * Recursive submenu renderer for `UMenubar`, adapted from real PrimeReact's
 * `MenubarSub` (`.vendor-extracted/react/menubar/MenubarSub.js`) — same
 * recursive-self-reference shape (a `MenubarSub` renders a nested
 * `MenubarSub` for each item with `items`), scoped down to this task's
 * smaller surface (click/hover-driven open only, no keyboard roving-focus/
 * search-by-typing machinery, matching `UMenu`'s own established reduction
 * pattern).
 */
export const UMenubarSub: React.FC<UMenubarSubProps> = ({ items, root, cx, onItemSelect }) => {
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
    <ul className={root ? cx("rootList") : cx("submenu")}>
      {items.map((item, index) => {
        if (item.separator) {
          return <li key={`sep_${index}`} className={cx("separator")} role="separator" />;
        }
        if (item.visible === false) return null;
        const open = openItem === item;
        return (
          <li
            key={item.label ?? index}
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
                tabIndex={item.disabled ? -1 : 0}
                onClick={(event) => onItemClick(event, item)}
              >
                {item.icon && <span className={cx("icon")}>{item.icon}</span>}
                {item.label && <span className={cx("label")}>{item.label}</span>}
                {hasItems(item) && (
                  <span className={cx("submenuIcon")} aria-hidden="true">
                    {root ? "▾" : "▸"}
                  </span>
                )}
              </a>
            </div>
            {hasItems(item) && (
              <UMenubarSub items={item.items ?? []} root={false} cx={cx} onItemSelect={onItemSelect} />
            )}
          </li>
        );
      })}
    </ul>
  );
};
