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

/** Selector for the root list's own direct-child item trigger links. */
const ROOT_ITEM_LINK_SELECTOR = ":scope > li > .u-megamenu-content > a";

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
 *
 * Carries real ARIA roles (`menubar`/`menu`/`menuitem`, already present
 * below) and roving-focus keyboard navigation (GAP-054, Spec §5.3), matching
 * the shape already established by this component's own React siblings
 * `UMenubar`/`UTieredMenu`. Unlike those two, MegaMenu is a genuine hard
 * 2-level structure (confirmed by `UMegaMenuColumnGroup`'s own doc comment:
 * a column group's leaf items are flat, "not further nested") — so its
 * Escape handling needs only a single `openItem` check at this root level,
 * not a recursive per-level chain, mirroring the already-approved Angular
 * sibling `UMegaMenu`. ArrowRight/ArrowLeft move focus horizontally among
 * root items; Enter/Space on a column-having item opens its overlay and
 * moves focus to the overlay's first leaf item; Escape closes the open
 * overlay (wherever focus currently is inside it) and returns focus to its
 * own root trigger. Disabled items are always skipped in roving focus
 * (`tabIndex={item.disabled ? -1 : 0}`, already present below).
 *
 * The `onKeyDown` handler is bound on this root `<ul>` (via `listRef`) —
 * never on an individual root item's own `<a>` — for the same reason
 * established for Menubar/TieredMenu: a root item's own overlay content is a
 * DOM *sibling* of that item's own `<a>` (both live inside the same `<li>`),
 * so a keydown fired from inside the overlay could never bubble through the
 * `<a>` to reach a root-level listener bound there. Binding on the root
 * `<ul>` — a genuine DOM ancestor of the entire overlay — lets Escape (and
 * any other key) reach this handler via bubbling regardless of how deep
 * inside the overlay focus is. No `createPortal` is used anywhere in this
 * component (confirmed: the overlay renders as plain in-tree DOM), so this
 * ancestor relationship holds with no portal escape hatch to account for.
 *
 * Close/refocus timing: opening the overlay must defer focusing its first
 * leaf item via an effect until the not-yet-existing nested `<ul>` actually
 * commits; closing can refocus the root trigger synchronously, since that
 * `<a>` is a stable DOM node across the update (only the overlay `<div>`
 * sibling is removed) — the same asymmetry already proven correct in
 * `UTieredMenuSub`/`UMenubarSub`.
 */
export const UMegaMenu = React.forwardRef<HTMLElement, UMegaMenuProps>(function UMegaMenu(
  { model = [], ariaLabel, onItemSelect, className },
  ref
) {
  const { cx } = useComponentBase({ componentName: "mega-menu", styleModule: megaMenuStyleModule });
  const [openItem, setOpenItem] = React.useState<UMegaMenuItem | null>(null);
  const [focusFirstOnOpen, setFocusFirstOnOpen] = React.useState(false);
  const listRef = React.useRef<HTMLUListElement>(null);

  const hasColumns = (item: UMegaMenuItem) => !!item.items && item.items.length > 0;

  const getRootLinks = React.useCallback((): HTMLAnchorElement[] => {
    const ul = listRef.current;
    return ul ? Array.from(ul.querySelectorAll<HTMLAnchorElement>(ROOT_ITEM_LINK_SELECTOR)) : [];
  }, []);

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

  /** Resolves the root `UMegaMenuItem` this event's target `<a>` belongs to, or `null` if it isn't one of this root list's own direct-child item links. */
  /** Root items that actually render their own direct-child `<a>` (excludes hidden items), in the same order `getRootLinks()` returns their DOM nodes. */
  const renderedRootItems = () => model.filter((candidate) => candidate.visible !== false);

  const resolveOwnItem = (target: EventTarget | null): UMegaMenuItem | null => {
    const links = getRootLinks();
    const index = links.indexOf(target as HTMLAnchorElement);
    return index === -1 ? null : (renderedRootItems()[index] ?? null);
  };

  const enabledRootItems = () => model.filter((candidate) => candidate.visible !== false && !candidate.disabled);

  const moveFocus = (current: UMegaMenuItem, direction: 1 | -1) => {
    const enabled = enabledRootItems();
    if (enabled.length === 0) return;
    const currentIndex = enabled.indexOf(current);
    const startIndex = currentIndex === -1 ? 0 : currentIndex;
    const nextIndex = (startIndex + direction + enabled.length) % enabled.length;
    const nextItem = enabled[nextIndex];
    const links = getRootLinks();
    const targetIndex = renderedRootItems().indexOf(nextItem);
    links[targetIndex]?.focus();
  };

  const closeAndRefocus = (item: UMegaMenuItem) => {
    // The trigger <a> itself is a stable DOM node across this update (only
    // the overlay <div> sibling is removed), so refocusing it can happen
    // synchronously, unlike focusFirstOnOpen below which must wait for a
    // not-yet-existing nested <ul> to actually commit.
    const links = getRootLinks();
    const targetIndex = renderedRootItems().indexOf(item);
    links[targetIndex]?.focus();
    setOpenItem(null);
  };

  /**
   * Root-level keydown handling. Escape is handled unconditionally here —
   * regardless of whether the event target is a root item's own `<a>` or a
   * leaf item deep inside the open overlay — since MegaMenu's hard 2-level
   * structure means this root level's own `openItem` is always the single,
   * innermost thing to close; there is no further-up level beyond it.
   * ArrowRight/ArrowLeft and Enter/Space only act when the event target
   * resolves to one of this root list's own item `<a>`s (not a leaf item
   * inside an overlay, which is handled by `UMegaMenuColumnGroup` itself).
   */
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
    if (!item) return; // Not a root item's own trigger — nothing else to do at this level.

    switch (event.code) {
      case "ArrowRight":
        event.preventDefault();
        moveFocus(item, 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        moveFocus(item, -1);
        break;
      case "Enter":
      case "Space":
        if (hasColumns(item) && !item.disabled) {
          event.preventDefault();
          setOpenItem(item);
          setFocusFirstOnOpen(true);
        }
        break;
    }
  };

  // Focuses the newly-opened overlay's first leaf item once its DOM has
  // actually committed (Enter/Space opening the overlay updates `openItem`
  // state, which only renders the overlay's nested column groups on the NEXT
  // commit — focusing synchronously inside the keydown handler would target
  // a <ul> that doesn't exist yet).
  React.useEffect(() => {
    if (!focusFirstOnOpen || !openItem) return;
    setFocusFirstOnOpen(false);
    const ul = listRef.current;
    const openLi = ul?.querySelector(':scope > li[data-u-open="true"]');
    const firstLeafLink = openLi?.querySelector<HTMLAnchorElement>(".u-megamenu-submenu a");
    firstLeafLink?.focus();
  }, [focusFirstOnOpen, openItem]);

  return (
    <nav ref={ref} className={[cx("root"), className].filter(Boolean).join(" ")} aria-label={ariaLabel}>
      <ul ref={listRef} className={cx("rootList")} role="menubar" onKeyDown={onKeyDown}>
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
