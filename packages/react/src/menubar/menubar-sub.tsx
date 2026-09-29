import * as React from "react";
import type { UMenuItem } from "../menu";

export interface UMenubarSubProps {
  items: UMenuItem[];
  root: boolean;
  cx: (key: string, params?: Record<string, unknown>) => string | undefined;
  onItemSelect: (event: { originalEvent: React.SyntheticEvent; item: UMenuItem }) => void;
}

/** Selector for a level's own direct-child item trigger links (excludes nested submenu items). */
const ITEM_LINK_SELECTOR = ":scope > li > .u-menubar-content > a";

/**
 * Recursive submenu renderer for `UMenubar`, adapted from real PrimeReact's
 * `MenubarSub` (`.vendor-extracted/react/menubar/MenubarSub.js`) — same
 * recursive-self-reference shape (a `MenubarSub` renders a nested
 * `MenubarSub` for each item with `items`), scoped down to this task's
 * smaller surface (no search-by-typing machinery, matching `UMenu`'s own
 * established reduction pattern).
 *
 * Carries real ARIA roles (`menubar`/`menu`/`menuitem`), matching the shape
 * already established by this component's Angular sibling `UMenubarSub`
 * (GAP-054, Spec §5.3) — required for the roving-focus keyboard navigation
 * below to be meaningfully testable/correct at all. ArrowRight/ArrowLeft move
 * focus horizontally among the root level's own items; ArrowDown/ArrowUp move
 * focus vertically within a submenu level (matching real PrimeNG/PrimeReact's
 * own axis-per-level convention). Enter/Space on an item with children opens
 * its submenu and moves focus to its first item. Escape closes only the
 * innermost open submenu and returns focus to that submenu's own trigger.
 * Disabled items are always skipped in roving focus and excluded from the DOM
 * tab order (`tabIndex={item.disabled ? -1 : 0}`).
 *
 * Ancestor-binding note (ported from Angular's post-fix `UMenubarSub`, see
 * `packages/ng/src/menubar/menubar-sub.ts`): `onKeyDown` is bound on this
 * level's own `<ul>` (via `listRef`), never on an individual item's `<a>`. A
 * nested `UMenubarSub` rendering a deeper level is a DOM *sibling* of its
 * parent item's own `<a>` (both live inside the same `<li>`), so binding on
 * the `<a>` would leave a deeper level's keydown unreachable by an ancestor
 * level once focus moves into a nested submenu — React's synthetic event
 * system still follows real DOM bubbling for `onKeyDown` listeners attached
 * to different DOM nodes, so a handler on the parent level's `<ul>` (a real
 * DOM ancestor of every level nested within it) does receive the bubbled
 * event; a handler on the parent's `<a>` (a DOM sibling of the nested `<ul>`,
 * not an ancestor) would not. No `createPortal` is used anywhere in this
 * component (confirmed: nested submenus render as plain in-tree DOM, unlike
 * `UMenu`'s popup mode), so this ancestor relationship holds all the way
 * down with no portal escape hatch to account for.
 */
export const UMenubarSub: React.FC<UMenubarSubProps> = ({ items, root, cx, onItemSelect }) => {
  const [openItem, setOpenItem] = React.useState<UMenuItem | null>(null);
  const [focusFirstOnOpen, setFocusFirstOnOpen] = React.useState(false);
  const listRef = React.useRef<HTMLUListElement>(null);

  const hasItems = (item: UMenuItem) => !!item.items && item.items.length > 0;

  const getItemLinks = React.useCallback((): HTMLAnchorElement[] => {
    const ul = listRef.current;
    return ul ? Array.from(ul.querySelectorAll<HTMLAnchorElement>(ITEM_LINK_SELECTOR)) : [];
  }, []);

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

  /**
   * Resolves the `UMenuItem` this event's target `<a>` belongs to, but only
   * if that `<a>` is a direct-child item link of *this* level's own `<ul>`
   * (not a descendant belonging to a deeper-nested level). Returns `null`
   * for any event this level does not own, so the caller can leave it
   * bubbling toward the ancestor level that does.
   */
  const resolveOwnItem = (target: EventTarget | null): UMenuItem | null => {
    const links = getItemLinks();
    const index = links.indexOf(target as HTMLAnchorElement);
    return index === -1 ? null : (items[index] ?? null);
  };

  const enabledItems = () => items.filter((candidate) => !candidate.separator && candidate.visible !== false && !candidate.disabled);

  const moveFocus = (current: UMenuItem, direction: 1 | -1) => {
    const enabled = enabledItems();
    if (enabled.length === 0) return;
    const currentIndex = enabled.indexOf(current);
    const startIndex = currentIndex === -1 ? 0 : currentIndex;
    const nextIndex = (startIndex + direction + enabled.length) % enabled.length;
    const nextItem = enabled[nextIndex];
    const links = getItemLinks();
    const targetIndex = items.indexOf(nextItem);
    links[targetIndex]?.focus();
  };

  const closeAndRefocus = (item: UMenuItem) => {
    // The trigger <a> itself is a stable DOM node across this update (only
    // its nested UMenubarSub sibling is removed), so refocusing it can
    // happen synchronously, unlike focusFirstOnOpen below which must wait
    // for a not-yet-existing nested <ul> to actually commit.
    const links = getItemLinks();
    const targetIndex = items.indexOf(item);
    links[targetIndex]?.focus();
    setOpenItem(null);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    if (event.code === "Escape") {
      if (openItem) {
        event.preventDefault();
        event.stopPropagation();
        closeAndRefocus(openItem);
      }
      return;
    }

    const item = resolveOwnItem(event.target);
    if (!item) return; // Not this level's own item — let it keep bubbling.

    const forwardKey = root ? "ArrowRight" : "ArrowDown";
    const backwardKey = root ? "ArrowLeft" : "ArrowUp";

    switch (event.code) {
      case forwardKey:
        event.preventDefault();
        moveFocus(item, 1);
        break;
      case backwardKey:
        event.preventDefault();
        moveFocus(item, -1);
        break;
      case "Enter":
      case "Space":
        if (hasItems(item) && !item.disabled) {
          event.preventDefault();
          setOpenItem(item);
          setFocusFirstOnOpen(true);
        }
        break;
    }
  };

  // Focuses the newly-opened submenu's first item once its DOM has actually
  // committed (Enter/Space opening a submenu updates `openItem` state, which
  // only renders the nested UMenubarSub on the NEXT commit — focusing
  // synchronously inside the keydown handler would target a <ul> that
  // doesn't exist yet).
  React.useEffect(() => {
    if (!focusFirstOnOpen || !openItem) return;
    setFocusFirstOnOpen(false);
    const ul = listRef.current;
    const openLi = ul?.querySelector(':scope > li[data-u-open="true"]');
    const firstLink = openLi?.querySelector<HTMLAnchorElement>(
      ":scope > .u-menubar-submenu > li:first-child > .u-menubar-content > a"
    );
    firstLink?.focus();
  }, [focusFirstOnOpen, openItem]);

  return (
    <ul
      ref={listRef}
      className={root ? cx("rootList") : cx("submenu")}
      role={root ? "menubar" : "menu"}
      onKeyDown={onKeyDown}
    >
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
                role="menuitem"
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
