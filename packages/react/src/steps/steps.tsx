import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { stepsStyleModule } from "./steps-style";
import type { UMenuItem } from "../menu";

export interface UStepsProps {
  /** An array of menu items. */
  model?: UMenuItem[];
  /** Index of the active item. */
  activeIndex?: number;
  /** Whether the items are clickable or not. */
  readonly?: boolean;
  /** Callback to invoke when the new step is selected. */
  onSelect?: (event: { originalEvent: React.SyntheticEvent; item: UMenuItem; index: number }) => void;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `Steps` component (see
 * `.vendor-extracted/react/steps/Steps.js`). Renders a linear, read-only-
 * by-default step *indicator* for a wizard workflow — distinct from
 * `UStepper`, which is an interactive, content-switching component.
 *
 * Real PrimeReact's `Steps` (no import of `../menu`) is a standalone,
 * independent component driven by a flat `MenuItem[]` model and an
 * `activeIndex`, not a composition of `Menu`.
 */
export const USteps = React.forwardRef<HTMLElement, UStepsProps>(function USteps(
  { model = [], activeIndex = 0, readonly = true, onSelect, className },
  ref
) {
  const { cx } = useComponentBase({ componentName: "steps", styleModule: stepsStyleModule });
  const listRef = React.useRef<HTMLOListElement>(null);

  const isItemDisabled = (item: UMenuItem, index: number) => !!item.disabled || (readonly && index !== activeIndex);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const links = Array.from(listRef.current?.querySelectorAll("a") ?? []);
    if (links.length === 0) return;
    const isEnabled = (index: number) => !isItemDisabled(model[index], index);
    const currentIndex = links.indexOf(document.activeElement as HTMLAnchorElement);

    let targetIndex: number | undefined;
    switch (event.code) {
      case "ArrowRight":
        for (let i = currentIndex + 1; i < links.length; i++) {
          if (isEnabled(i)) {
            targetIndex = i;
            break;
          }
        }
        break;
      case "ArrowLeft":
        for (let i = currentIndex - 1; i >= 0; i--) {
          if (isEnabled(i)) {
            targetIndex = i;
            break;
          }
        }
        break;
      case "Home":
        targetIndex = links.findIndex((_, i) => isEnabled(i));
        break;
      case "End":
        for (let i = links.length - 1; i >= 0; i--) {
          if (isEnabled(i)) {
            targetIndex = i;
            break;
          }
        }
        break;
      default:
        return;
    }

    event.preventDefault();
    if (targetIndex !== undefined && targetIndex >= 0) {
      links[targetIndex].focus();
    }
  };

  const onItemClick = (event: React.MouseEvent, item: UMenuItem, index: number) => {
    if (readonly || item.disabled) {
      event.preventDefault();
      return;
    }
    onSelect?.({ originalEvent: event, item, index });
    item.command?.({ originalEvent: event, item });
    if (!item.url) {
      event.preventDefault();
    }
  };

  return (
    <nav ref={ref} className={[cx("root"), className].filter(Boolean).join(" ")}>
      <ol ref={listRef} className={cx("list")} onKeyDown={onKeyDown}>
        {model.map((item, index) => {
          if (item.visible === false) return null;
          const active = index === activeIndex;
          return (
            <li
              key={item.label ?? index}
              className={cx("item", { active, disabled: isItemDisabled(item, index) })}
              aria-current={active ? "step" : undefined}
            >
              <a
                href={item.url ?? "#"}
                className={cx("itemLink")}
                tabIndex={isItemDisabled(item, index) ? -1 : 0}
                aria-disabled={isItemDisabled(item, index)}
                onClick={(event) => onItemClick(event, item, index)}
              >
                <span className={cx("itemNumber")}>{index + 1}</span>
                {item.label && <span className={cx("itemLabel")}>{item.label}</span>}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
});
