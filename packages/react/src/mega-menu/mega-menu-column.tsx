import * as React from "react";
import type { UMenuItem } from "../menu";
import type { UMegaMenuGroup } from "./mega-menu-item";

export interface UMegaMenuColumnGroupProps {
  group: UMegaMenuGroup;
  cx: (key: string, params?: Record<string, unknown>) => string | undefined;
  onItemSelect: (event: { originalEvent: React.SyntheticEvent; item: UMenuItem }) => void;
}

/** Selector for this group's own direct-child leaf item links. */
const ITEM_LINK_SELECTOR = ":scope > li > .u-megamenu-content > a";

/**
 * Renders one submenu group within a MegaMenu overlay column — an optional
 * label header followed by a flat list of leaf items. Adapted from real
 * PrimeReact's `MegaMenu.js`'s `createSubmenu` applied to a single group.
 *
 * ArrowDown/ArrowUp roving focus (GAP-054, Spec §5.3) is scoped to this
 * group's own flat leaf-item list, delegated on this component's own
 * `<ul role="menu">` (via `listRef`) — matching `UTieredMenuSub`'s and the
 * already-approved Angular sibling `UMegaMenuColumnGroup`'s own
 * delegate-on-the-ancestor-`<ul>` pattern. Disabled leaf items are skipped
 * (`tabIndex={item.disabled ? -1 : 0}`, already present below). Escape is
 * deliberately NOT handled here: this component never calls
 * `stopPropagation()` on it, letting it bubble untouched up through the
 * overlay to `UMegaMenu`'s own root `<ul>`, which owns the single `openItem`
 * this hard-2-level structure ever needs to close.
 */
export const UMegaMenuColumnGroup: React.FC<UMegaMenuColumnGroupProps> = ({ group, cx, onItemSelect }) => {
  const listRef = React.useRef<HTMLUListElement>(null);
  const items = group.items ?? [];

  const getItemLinks = React.useCallback((): HTMLAnchorElement[] => {
    const ul = listRef.current;
    return ul ? Array.from(ul.querySelectorAll<HTMLAnchorElement>(ITEM_LINK_SELECTOR)) : [];
  }, []);

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

  /** Items that actually render their own direct-child `<a>` (excludes hidden items), in the same order `getItemLinks()` returns their DOM nodes. */
  const renderedItems = () => items.filter((candidate) => candidate.visible !== false);

  const moveFocus = (current: UMenuItem, direction: 1 | -1) => {
    const enabled = items.filter((candidate) => candidate.visible !== false && !candidate.disabled);
    if (enabled.length === 0) return;
    const currentIndex = enabled.indexOf(current);
    const startIndex = currentIndex === -1 ? 0 : currentIndex;
    const nextIndex = (startIndex + direction + enabled.length) % enabled.length;
    const nextItem = enabled[nextIndex];
    const links = getItemLinks();
    const targetIndex = renderedItems().indexOf(nextItem);
    links[targetIndex]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    // Escape is intentionally not handled here — it bubbles up to
    // UMegaMenu's own root <ul>, which owns the single openItem this
    // hard-2-level structure ever needs to close.
    const links = getItemLinks();
    const index = links.indexOf(event.target as HTMLAnchorElement);
    if (index === -1) return; // Not one of this group's own item links.

    const current = renderedItems()[index];
    if (!current) return;

    switch (event.code) {
      case "ArrowDown":
        event.preventDefault();
        moveFocus(current, 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveFocus(current, -1);
        break;
    }
  };

  return (
    <ul ref={listRef} className={cx("submenu")} role="menu" onKeyDown={onKeyDown}>
      {group.label && (
        <li className={cx("submenuLabel")} role="presentation">
          {group.label}
        </li>
      )}
      {items.map((item, index) => {
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
