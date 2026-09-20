import * as React from "react";
import type { UMenuItem } from "../menu";

export interface UPanelMenuListProps {
  items: UMenuItem[];
  expandedItems: Set<UMenuItem>;
  multiple: boolean;
  cx: (key: string, params?: Record<string, unknown>) => string | undefined;
  onToggle: (item: UMenuItem, siblings: UMenuItem[]) => void;
  onItemSelect: (event: { originalEvent: React.SyntheticEvent; item: UMenuItem }) => void;
}

/**
 * Recursive, expand-in-place submenu renderer for `UPanelMenu`, adapted
 * from real PrimeReact's `PanelMenuSub`/`PanelMenuList`
 * (`.vendor-extracted/react/panelmenu/PanelMenuSub.js`,
 * `PanelMenuList.js`) — same recursive-self-reference shape, scoped down
 * to this task's smaller surface (click-driven expand/collapse only, no
 * keyboard roving-focus/search-by-typing machinery, matching `UMenu`'s own
 * established reduction pattern).
 *
 * PanelMenu's genuinely distinguishing structural trait vs.
 * `UMenubarSub`/`UTieredMenuSub` (popup overlay submenus): an accordion —
 * children expand in-place (indented, always in normal document flow)
 * rather than opening a positioned popup. `expandedItems` is lifted to the
 * root `UPanelMenu` and threaded down by reference — since React always
 * replaces it via `setState` (never mutates it in place), every depth's
 * `Set` read here is naturally consistent with `UPanelMenu`'s own re-render.
 */
export const UPanelMenuList: React.FC<UPanelMenuListProps> = ({
  items,
  expandedItems,
  multiple,
  cx,
  onToggle,
  onItemSelect,
}) => {
  const hasItems = (item: UMenuItem) => !!item.items && item.items.length > 0;
  const isExpanded = (item: UMenuItem) => expandedItems.has(item);

  const onHeaderClick = (event: React.MouseEvent, item: UMenuItem) => {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    if (hasItems(item)) {
      event.preventDefault();
      onToggle(item, items);
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
    <ul className={cx("submenu")} role="tree">
      {items.map((item, index) => {
        if (item.visible === false) return null;
        const expanded = isExpanded(item);
        return (
          <li
            key={item.label ?? index}
            role="treeitem"
            className={cx("menuitem", { disabled: !!item.disabled, expanded })}
            data-u-disabled={String(!!item.disabled)}
            data-u-expanded={String(expanded)}
            aria-expanded={hasItems(item) ? expanded : undefined}
          >
            <div className={cx("headerContent")}>
              <a
                href={item.url ?? "#"}
                className={cx("headerAction")}
                aria-disabled={item.disabled}
                tabIndex={item.disabled ? -1 : 0}
                onClick={(event) => onHeaderClick(event, item)}
              >
                {hasItems(item) && (
                  <span className={cx("submenuIcon")} aria-hidden="true">
                    ▸
                  </span>
                )}
                {item.icon && <span className={cx("headerIcon")}>{item.icon}</span>}
                {item.label && <span className={cx("headerLabel")}>{item.label}</span>}
              </a>
            </div>
            {hasItems(item) && expanded && (
              <UPanelMenuList
                items={item.items ?? []}
                expandedItems={expandedItems}
                multiple={multiple}
                cx={cx}
                onToggle={onToggle}
                onItemSelect={onItemSelect}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
};
