import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { UPanelMenuList } from "./panel-menu-list";
import { panelMenuStyleModule } from "./panel-menu-style";
import type { UMenuItem } from "../menu";

export interface UPanelMenuProps {
  /** An array of menuitems. */
  model?: UMenuItem[];
  /** Whether multiple tabs can be activated at the same time or not. */
  multiple?: boolean;
  /** Fired when an item is selected. */
  onItemSelect?: (event: { originalEvent: React.SyntheticEvent; item: UMenuItem }) => void;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `PanelMenu` component (see
 * `.vendor-extracted/react/panelmenu/PanelMenu.js`; `PanelMenuSub`/
 * `PanelMenuList` merged into a single recursive `UPanelMenuList`).
 * Renders an accordion-style nested menu: expandable panels, each toggled
 * in-place (indented nested list), not a popup overlay — PanelMenu's
 * genuinely different structural trait vs. Menubar/TieredMenu.
 *
 * Real PrimeReact's `PanelMenu` (no import of `../menu`) is a standalone,
 * independent component — it does NOT compose `Menu`.
 */
export const UPanelMenu = React.forwardRef<HTMLDivElement, UPanelMenuProps>(function UPanelMenu(
  { model = [], multiple = false, onItemSelect, className },
  ref
) {
  const { cx } = useComponentBase({ componentName: "panel-menu", styleModule: panelMenuStyleModule });
  const [expandedItems, setExpandedItems] = React.useState<Set<UMenuItem>>(new Set());

  const onToggle = React.useCallback(
    (item: UMenuItem, siblings: UMenuItem[]) => {
      setExpandedItems((current) => {
        const next = new Set(current);
        if (next.has(item)) {
          next.delete(item);
        } else {
          if (!multiple) {
            for (const sibling of siblings) next.delete(sibling);
          }
          next.add(item);
        }
        return next;
      });
    },
    [multiple]
  );

  return (
    <div ref={ref} className={[cx("root"), className].filter(Boolean).join(" ")}>
      <UPanelMenuList
        items={model}
        expandedItems={expandedItems}
        multiple={multiple}
        cx={cx}
        onToggle={onToggle}
        onItemSelect={(event) => onItemSelect?.(event)}
      />
    </div>
  );
});
