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
export const UDock = React.forwardRef<HTMLDivElement, UDockProps>(function UDock(
  { model = [], position = "bottom", ariaLabel, onItemSelect, className },
  ref
) {
  const { cx } = useComponentBase({ componentName: "dock", styleModule: dockStyleModule });
  const [hoveredIndex, setHoveredIndex] = React.useState(-3);

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

  return (
    <div ref={ref} className={[cx("root", { position }), className].filter(Boolean).join(" ")}>
      <div className={cx("listContainer")}>
        <ul className={cx("list")} role="menu" aria-label={ariaLabel}>
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
