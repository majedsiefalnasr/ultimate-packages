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

/** Selector for this level's own direct-child header links (excludes nested levels' own headers). */
const ITEM_LINK_SELECTOR = ":scope > li > .u-panelmenu-header-content > a";

/**
 * Recursive, expand-in-place submenu renderer for `UPanelMenu`, adapted
 * from real PrimeReact's `PanelMenuSub`/`PanelMenuList`
 * (`.vendor-extracted/react/panelmenu/PanelMenuSub.js`,
 * `PanelMenuList.js`) — same recursive-self-reference shape, scoped down
 * to this task's smaller surface (matching `UMenu`'s own established
 * reduction pattern).
 *
 * PanelMenu's genuinely distinguishing structural trait vs.
 * `UMenubarSub`/`UTieredMenuSub` (popup overlay submenus): an accordion —
 * children expand in-place (indented, always in normal document flow)
 * rather than opening a positioned popup. `expandedItems` is lifted to the
 * root `UPanelMenu` and threaded down by reference — since React always
 * replaces it via `setState` (never mutates it in place), every depth's
 * `Set` read here is naturally consistent with `UPanelMenu`'s own re-render.
 *
 * Keyboard navigation (GAP-054, Spec §5.3) is scoped to this level's own
 * visible siblings only, matching Menubar/TieredMenu/MegaMenu's own
 * established per-level restriction: ArrowDown/ArrowUp move focus between
 * this level's own non-disabled items (wrapping at the ends); Enter/Space
 * on a group item toggles its expand/collapse in place via the same
 * `onToggle` the existing click handler already uses, without moving focus
 * off the header (there is no popup/overlay to move focus into — expansion
 * just reveals this item's own nested `UPanelMenuList`, which is this
 * item's own DOM sibling, not this level's own list).
 *
 * No Escape handling is added: PanelMenu is an accordion with no overlay to
 * escape from (confirmed: no `createPortal`/overlay usage anywhere in
 * `panel-menu.tsx`/`panel-menu-list.tsx`), so "close the innermost open
 * thing" has no meaning here the way it does for Menubar/TieredMenu/
 * MegaMenu's popups — matching this component's already-approved Angular
 * sibling `UPanelMenuList` (`packages/ng/src/panel-menu/panel-menu-list.ts`)
 * and the Plan's own Review Focus text, which pointedly omits PanelMenu from
 * its Escape-requirement enumeration.
 *
 * `onKeyDown` is bound on this level's own `<ul>` (via `listRef`), never on
 * an individual header `<a>` — for the same reason already established for
 * Menubar/TieredMenu/MegaMenu: a nested `UPanelMenuList` rendered for an
 * expanded group item is a DOM *sibling* of that item's own `<a>` (both live
 * inside the same `<li>`), so a keydown fired from inside an expanded nested
 * list would never bubble through its parent's own `<a>` — only through this
 * level's own `<ul>`, which genuinely is a DOM ancestor of every level
 * nested within it. Because this listener also receives bubbled events from
 * deeper-nested levels, movement/toggle keys first resolve which item (if
 * any) at *this* level the event's real target belongs to, and no-op
 * (letting the event keep bubbling) for anything that isn't a direct-child
 * header `<a>` of this level's own `<ul>` — so a deeper level's own listener
 * (the nearer ancestor in the bubble path) always handles its own items
 * first, never this one.
 */
export const UPanelMenuList: React.FC<UPanelMenuListProps> = ({
  items,
  expandedItems,
  multiple,
  cx,
  onToggle,
  onItemSelect,
}) => {
  const listRef = React.useRef<HTMLUListElement>(null);

  const hasItems = (item: UMenuItem) => !!item.items && item.items.length > 0;
  const isExpanded = (item: UMenuItem) => expandedItems.has(item);

  const getItemLinks = React.useCallback((): HTMLAnchorElement[] => {
    const ul = listRef.current;
    return ul ? Array.from(ul.querySelectorAll<HTMLAnchorElement>(ITEM_LINK_SELECTOR)) : [];
  }, []);

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

  /**
   * Resolves the `UMenuItem` this event's target `<a>` belongs to, but only
   * if that `<a>` is a direct-child header link of *this* level's own `<ul>`
   * (not a descendant belonging to a deeper-nested level). Returns `null`
   * for any event this level does not own, so the caller can leave it
   * bubbling toward the ancestor level that does — though in practice a
   * deeper-nested level's own listener always claims a bubbled event first.
   */
  const resolveOwnItem = (target: EventTarget | null): UMenuItem | null => {
    const links = getItemLinks();
    const index = links.indexOf(target as HTMLAnchorElement);
    return index === -1 ? null : (items[index] ?? null);
  };

  const moveFocus = (current: UMenuItem, direction: 1 | -1) => {
    const enabled = items.filter((candidate) => candidate.visible !== false && !candidate.disabled);
    if (enabled.length === 0) return;
    const currentIndex = enabled.indexOf(current);
    const startIndex = currentIndex === -1 ? 0 : currentIndex;
    const nextIndex = (startIndex + direction + enabled.length) % enabled.length;
    const nextItem = enabled[nextIndex];
    const links = getItemLinks();
    const targetIndex = items.indexOf(nextItem);
    links[targetIndex]?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    const item = resolveOwnItem(event.target);
    if (!item) return; // Not this level's own header link — let it keep bubbling.

    switch (event.code) {
      case "ArrowDown":
        event.preventDefault();
        moveFocus(item, 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveFocus(item, -1);
        break;
      case "Enter":
      case "Space":
        if (hasItems(item) && !item.disabled) {
          event.preventDefault();
          onToggle(item, items);
        }
        break;
    }
  };

  return (
    <ul ref={listRef} className={cx("submenu")} role="tree" onKeyDown={onKeyDown}>
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
