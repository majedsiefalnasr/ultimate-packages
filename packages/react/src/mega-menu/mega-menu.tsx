import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { UMegaMenuColumnGroup } from "./mega-menu-column";
import { megaMenuStyleModule } from "./mega-menu-style";
import type { UMenuItem } from "../menu";
import type { UMegaMenuItem } from "./mega-menu-item";

export interface UMegaMenuProps {
  /** An array of root items, each root item's own `items` a 2D column grid. */
  model?: UMegaMenuItem[];
  /** Defines a string value that labels an interactive element. */
  ariaLabel?: string;
  /** Fired when a leaf item is selected. */
  onItemSelect?: (event: { originalEvent: React.SyntheticEvent; item: UMenuItem }) => void;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `MegaMenu` component (see
 * `.vendor-extracted/react/megamenu/MegaMenu.js`). Renders a horizontal
 * bar of top-level items; a root item with `items` (a `UMegaMenuItem[][]`
 * — see `mega-menu-item.ts`) opens a multi-column overlay grid on click,
 * each column stacking one or more labeled groups (`UMegaMenuColumnGroup`)
 * of flat leaf items — MegaMenu's genuinely distinguishing structural
 * trait vs. Menubar/TieredMenu's single-column nested popups.
 *
 * Real PrimeReact's `MegaMenu` (no import of `../menu`) is a standalone,
 * independent component — it does NOT compose `Menu`.
 */
export const UMegaMenu = React.forwardRef<HTMLElement, UMegaMenuProps>(function UMegaMenu(
  { model = [], ariaLabel, onItemSelect, className },
  ref
) {
  const { cx } = useComponentBase({ componentName: "mega-menu", styleModule: megaMenuStyleModule });
  const [openItem, setOpenItem] = React.useState<UMegaMenuItem | null>(null);

  const hasColumns = (item: UMegaMenuItem) => !!item.items && item.items.length > 0;

  const onItemClick = (event: React.MouseEvent, item: UMegaMenuItem) => {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    if (hasColumns(item)) {
      event.preventDefault();
      setOpenItem((current) => (current === item ? null : item));
      return;
    }
    const leafItem = item as UMenuItem;
    leafItem.command?.({ originalEvent: event, item: leafItem });
    onItemSelect?.({ originalEvent: event, item: leafItem });
    if (!item.url) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const handleColumnItemSelect = (event: { originalEvent: React.SyntheticEvent; item: UMenuItem }) => {
    setOpenItem(null);
    onItemSelect?.(event);
  };

  return (
    <nav ref={ref} className={[cx("root"), className].filter(Boolean).join(" ")} aria-label={ariaLabel}>
      <ul className={cx("rootList")} role="menubar">
        {model.map((item, index) => {
          if (item.visible === false) return null;
          const open = openItem === item;
          const columns = hasColumns(item);
          return (
            <li
              key={item.label ?? index}
              className={cx("menuitem", { disabled: !!item.disabled, open })}
              role="none"
              data-u-disabled={String(!!item.disabled)}
              data-u-open={String(open)}
              onMouseEnter={() => columns && !item.disabled && setOpenItem(item)}
            >
              <div className={cx("content")}>
                <a
                  role="menuitem"
                  href={item.url ?? "#"}
                  className={cx("action")}
                  aria-haspopup={columns ? "menu" : undefined}
                  aria-expanded={columns ? open : undefined}
                  aria-disabled={item.disabled}
                  tabIndex={item.disabled ? -1 : 0}
                  onClick={(event) => onItemClick(event, item)}
                >
                  {item.icon && <span className={cx("icon")}>{item.icon}</span>}
                  {item.label && <span className={cx("label")}>{item.label}</span>}
                  {columns && (
                    <span className={cx("submenuIcon")} aria-hidden="true">
                      ▾
                    </span>
                  )}
                </a>
              </div>
              {columns && (
                <div className={cx("overlay")}>
                  <div className={cx("grid")}>
                    {(item.items ?? []).map((column, columnIndex) => (
                      <div className={cx("column")} key={columnIndex}>
                        {column.map((group, groupIndex) => (
                          <UMegaMenuColumnGroup
                            key={group.label ?? groupIndex}
                            group={group}
                            cx={cx}
                            onItemSelect={handleColumnItemSelect}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
});
