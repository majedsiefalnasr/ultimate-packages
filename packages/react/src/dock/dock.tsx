import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { dockStyleModule } from "./dock-style";
import type { UMenuItem } from "../menu";

export interface UDockProps {
  /** MenuModel instance to define the action items. */
  model?: UMenuItem[];
  /** Position of element. */
  position?: "bottom" | "top" | "left" | "right";
  /** Defines a string that labels the input for accessibility. */
  ariaLabel?: string;
  /** Fired when an item is clicked. */
  onItemSelect?: (event: { originalEvent: React.SyntheticEvent; item: UMenuItem }) => void;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `Dock` component (see
 * `.vendor-extracted/react/dock/Dock.js`). Renders a macOS-dock-style bar
 * of menuitems; the per-icon magnification-on-hover effect is CSS-driven
 * (`dock-style.ts`'s doc comment), matching real PrimeReact 10.9.9's own
 * `Dock`, which tracks a hover index (`currentIndexState`) purely for
 * bookkeeping and never reads it for scale/transform styling.
 *
 * Real PrimeReact's `Dock` (no import of `../menu`) is a standalone,
 * independent component driven by a flat `MenuItem[]` model.
 */
/** This dock's own direct-child item links, in DOM order. */
const ITEM_LINK_SELECTOR = ":scope > li > a";

export const UDock = React.forwardRef<HTMLDivElement, UDockProps>(function UDock(
  { model = [], position = "bottom", ariaLabel, onItemSelect, className },
  ref
) {
  const { cx } = useComponentBase({ componentName: "dock", styleModule: dockStyleModule });
  const [hoveredIndex, setHoveredIndex] = React.useState(-3);
  const listRef = React.useRef<HTMLUListElement>(null);

  const onItemClick = (event: React.MouseEvent, item: UMenuItem) => {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    onItemSelect?.({ originalEvent: event, item });
    item.command?.({ originalEvent: event, item });
    if (!item.url) {
      event.preventDefault();
    }
  };

  const getItemLinks = React.useCallback((): HTMLAnchorElement[] => {
    const ul = listRef.current;
    return ul ? Array.from(ul.querySelectorAll<HTMLAnchorElement>(ITEM_LINK_SELECTOR)) : [];
  }, []);

  /** Items that actually render their own `<a>` (excludes hidden items), in the same order `getItemLinks()` returns their DOM nodes. */
  const renderedItems = React.useCallback((): UMenuItem[] => model.filter((candidate) => candidate.visible !== false), [model]);

  const resolveOwnItem = (target: EventTarget | null): UMenuItem | null => {
    const links = getItemLinks();
    const index = links.indexOf(target as HTMLAnchorElement);
    return index === -1 ? null : (renderedItems()[index] ?? null);
  };

  const moveFocus = (current: UMenuItem, direction: 1 | -1) => {
    const enabled = renderedItems().filter((candidate) => !candidate.disabled);
    if (enabled.length === 0) return;
    const currentIndex = enabled.indexOf(current);
    const startIndex = currentIndex === -1 ? 0 : currentIndex;
    const nextIndex = (startIndex + direction + enabled.length) % enabled.length;
    const nextItem = enabled[nextIndex];
    const links = getItemLinks();
    const targetIndex = renderedItems().indexOf(nextItem);
    links[targetIndex]?.focus();
  };

  const focusEdge = (edge: "first" | "last") => {
    const enabled = renderedItems().filter((candidate) => !candidate.disabled);
    if (enabled.length === 0) return;
    const targetItem = edge === "first" ? enabled[0] : enabled[enabled.length - 1];
    const links = getItemLinks();
    const targetIndex = renderedItems().indexOf(targetItem);
    links[targetIndex]?.focus();
  };

  /**
   * Roving focus among rendered dock items (Spec §5.4, GAP-055), bound on
   * the `<ul role="menu">` itself — never on an individual item `<a>` — for
   * the same ancestor-binding reason already established while fixing
   * GAP-054. Axis follows `position`: ArrowRight/ArrowLeft move focus for a
   * top/bottom-positioned dock, ArrowUp/ArrowDown for a left/right-
   * positioned one (real Prime's own axis-follows-orientation convention).
   * Home/End jump to the first/last item regardless of orientation.
   * Disabled items are skipped.
   */
  const onKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    const item = resolveOwnItem(event.target);
    if (!item) return;

    const horizontal = position === "top" || position === "bottom";
    const nextCode = horizontal ? "ArrowRight" : "ArrowDown";
    const prevCode = horizontal ? "ArrowLeft" : "ArrowUp";

    switch (event.code) {
      case nextCode:
        event.preventDefault();
        moveFocus(item, 1);
        break;
      case prevCode:
        event.preventDefault();
        moveFocus(item, -1);
        break;
      case "Home":
        event.preventDefault();
        focusEdge("first");
        break;
      case "End":
        event.preventDefault();
        focusEdge("last");
        break;
    }
  };

  return (
    <div ref={ref} className={[cx("root", { position }), className].filter(Boolean).join(" ")}>
      <div className={cx("listContainer")}>
        <ul ref={listRef} className={cx("list")} role="menu" aria-label={ariaLabel} onKeyDown={onKeyDown}>
          {model.map((item, index) => {
            if (item.visible === false) return null;
            return (
              <li key={item.label ?? index} className={cx("item", { active: hoveredIndex === index, disabled: !!item.disabled })} role="none">
                <a
                  href={item.url ?? "#"}
                  className={cx("itemLink")}
                  role="menuitem"
                  aria-label={item.label}
                  aria-disabled={!!item.disabled}
                  data-u-active={hoveredIndex === index}
                  onClick={(event) => onItemClick(event, item)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(-3)}
                >
                  {item.icon && <span className={[cx("itemIcon"), item.icon].filter(Boolean).join(" ")} />}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
});
