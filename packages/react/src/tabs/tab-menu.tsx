import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { tabsStyleModule } from "./tabs-style";
import type { UMenuItem } from "../menu";

export interface UTabMenuProps {
  /** An array of menuitems. */
  model?: UMenuItem[];
  /** Index of the active item. */
  activeIndex?: number;
  /** Callback invoked when the active tab changes (controlled mode). */
  onTabChange?: (event: { originalEvent: React.SyntheticEvent; value: UMenuItem; index: number }) => void;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `TabMenu` component (see
 * `.vendor-extracted/react/tabmenu/TabMenu.js`). Navigation-only,
 * model-array-driven tab strip (no content panels) — real PrimeReact's
 * second real sub-shape for this capability, alongside `UTabView`. No
 * import of `../menu` in real source — standalone, independent component.
 */
export const UTabMenu = React.forwardRef<HTMLDivElement, UTabMenuProps>(function UTabMenu(
  { model = [], activeIndex: activeIndexProp, onTabChange, className },
  ref
) {
  const { cx } = useComponentBase({ componentName: "tabs", styleModule: tabsStyleModule });
  const [activeIndexState, setActiveIndexState] = React.useState(activeIndexProp ?? 0);
  const activeIndex = onTabChange ? (activeIndexProp ?? 0) : activeIndexState;

  const itemClick = (event: React.MouseEvent, item: UMenuItem, index: number) => {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    item.command?.({ originalEvent: event, item });
    if (onTabChange) {
      onTabChange({ originalEvent: event, value: item, index });
    } else {
      setActiveIndexState(index);
    }
    if (!item.url) {
      event.preventDefault();
    }
  };

  return (
    <div ref={ref} className={[cx("tabMenuRoot"), className].filter(Boolean).join(" ")}>
      <ul className={cx("tabMenuNav")} role="tablist">
        {model.map((item, index) => {
          const active = index === activeIndex;
          return (
            <li key={item.label ?? index} className={cx("tabMenuItem", { active, disabled: !!item.disabled })} role="tab" aria-selected={active} data-u-disabled={!!item.disabled}>
              <a
                href={item.url ?? "#"}
                className={cx("tabMenuAction")}
                tabIndex={item.disabled ? -1 : 0}
                onClick={(event) => itemClick(event, item, index)}
              >
                {item.icon && <span className={[cx("tabMenuIcon"), item.icon].filter(Boolean).join(" ")} />}
                {item.label && <span className={cx("tabMenuLabel")}>{item.label}</span>}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
});
