import * as React from "react";
import type { UMenuItem } from "../menu";

export interface UTieredMenuSubProps {
  items: UMenuItem[];
  root: boolean;
  cx: (key: string, params?: Record<string, unknown>) => string | undefined;
  onItemSelect: (event: { originalEvent: React.SyntheticEvent; item: UMenuItem }) => void;
}

/** Selector for a level's own direct-child item trigger links (excludes nested submenu items). */
const ITEM_LINK_SELECTOR = ":scope > li > .u-tieredmenu-content > a";

/**
 * Recursive submenu renderer for `UTieredMenu`, adapted from real
 * PrimeReact's `TieredMenuSub`
 * (`.vendor-extracted/react/tieredmenu/TieredMenuSub.js`) — same
 * recursive-self-reference shape, scoped down to this task's smaller
 * surface (matching `UMenu`'s own established reduction pattern).
 *
 * Keyboard navigation (GAP-054, Spec §5.3) uses a single ArrowDown/ArrowUp
 * axis to move between siblings at *every* level — root and submenu alike
 * — matching real PrimeNG/PrimeReact's own `TieredMenuSub` convention
 * (`onArrowDownKey`/`onArrowUpKey` used unconditionally regardless of
 * level) and this component's already-approved Angular sibling
 * `UTieredMenuSub` (`packages/ng/src/tiered-menu/tiered-menu-sub.ts`).
 * This differs deliberately from `UMenubarSub`'s own root-horizontal
 * (ArrowRight/ArrowLeft) / submenu-vertical (ArrowDown/ArrowUp) split:
 * TieredMenu's root list is itself a vertical menu (`role="menu"`, not
 * `menubar`), so real Prime never switches axis by level for it.
 * Enter/Space (or ArrowRight — matched for parity with real Prime's own
 * key set) on a group item opens its submenu and moves focus to its first
 * item. Escape closes only the innermost open submenu and returns focus to
 * that submenu's own trigger. Disabled items are always skipped in roving
 * focus and excluded from the DOM tab order (`tabIndex={item.disabled ? -1 : 0}`).
 *
 * Ancestor-binding note (ported from Angular's post-fix `UTieredMenuSub`,
 * and this component's own React sibling `UMenubarSub`): `onKeyDown` is
 * bound on this level's own `<ul>` (via `listRef`), never on an individual
 * item's `<a>`. A nested `UTieredMenuSub` rendering a deeper level is a DOM
 * *sibling* of its parent item's own `<a>` (both live inside the same
 * `<li>`), so binding on the `<a>` would leave a deeper level's keydown
 * unreachable by an ancestor level once focus moves into a nested submenu —
 * a handler on the parent level's `<ul>` (a real DOM ancestor of every
 * level nested within it) does receive the bubbled event; a handler on the
 * parent's `<a>` (a DOM sibling of the nested `<ul>`, not an ancestor)
 * would not. No `createPortal` is used anywhere in this component
 * (confirmed: nested submenus render as plain in-tree DOM), so this
 * ancestor relationship holds all the way down with no portal escape hatch
 * to account for.
 *
 * Close/refocus timing note: unlike opening a submenu (which must defer via
 * an effect until the not-yet-existing nested `<ul>` actually commits),
 * closing one can refocus synchronously — the trigger `<a>` is a stable DOM
 * node across the update (only its nested `UTieredMenuSub` sibling is
 * removed), matching the same reasoning already proven correct in
 * `UMenubarSub`.
 */
export const UTieredMenuSub: React.FC<UTieredMenuSubProps> = ({ items, root, cx, onItemSelect }) => {
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
  /** Items that actually render their own direct-child `<a>` (excludes separators and hidden items), in the same order `getItemLinks()` returns their DOM nodes. */
  const renderedItems = () => items.filter((candidate) => !candidate.separator && candidate.visible !== false);

  const resolveOwnItem = (target: EventTarget | null): UMenuItem | null => {
    const links = getItemLinks();
    const index = links.indexOf(target as HTMLAnchorElement);
    return index === -1 ? null : (renderedItems()[index] ?? null);
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
    const targetIndex = renderedItems().indexOf(nextItem);
    links[targetIndex]?.focus();
  };

  const closeAndRefocus = (item: UMenuItem) => {
    // The trigger <a> itself is a stable DOM node across this update (only
    // its nested UTieredMenuSub sibling is removed), so refocusing it can
    // happen synchronously, unlike focusFirstOnOpen below which must wait
    // for a not-yet-existing nested <ul> to actually commit.
    const links = getItemLinks();
    const targetIndex = renderedItems().indexOf(item);
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

    switch (event.code) {
      case "ArrowDown":
        event.preventDefault();
        moveFocus(item, 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveFocus(item, -1);
        break;
      case "ArrowRight":
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
  // only renders the nested UTieredMenuSub on the NEXT commit — focusing
  // synchronously inside the keydown handler would target a <ul> that
  // doesn't exist yet).
  React.useEffect(() => {
    if (!focusFirstOnOpen || !openItem) return;
    setFocusFirstOnOpen(false);
    const ul = listRef.current;
    const openLi = ul?.querySelector(':scope > li[data-u-open="true"]');
    const firstLink = openLi?.querySelector<HTMLAnchorElement>(
      ":scope > .u-tieredmenu-submenu > li:first-child > .u-tieredmenu-content > a"
    );
    firstLink?.focus();
  }, [focusFirstOnOpen, openItem]);

  return (
    <ul ref={listRef} className={root ? cx("rootList") : cx("submenu")} role="menu" onKeyDown={onKeyDown}>
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
                tabIndex={item.disabled ? -1 : 0}
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
