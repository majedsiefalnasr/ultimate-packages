import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { breadcrumbStyleModule } from "./breadcrumb-style";
import type { UMenuItem } from "../menu";

export interface UBreadcrumbProps {
  /** An array of menuitems. */
  model?: UMenuItem[];
  /** MenuItem configuration for the home icon. */
  home?: UMenuItem;
  /** Defines a string that labels the home icon for accessibility. */
  homeAriaLabel?: string;
  /** Fired when an item is selected. */
  onItemClick?: (event: { originalEvent: React.SyntheticEvent; item: UMenuItem }) => void;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `BreadCrumb` component (see
 * `.vendor-extracted/react/breadcrumb/BreadCrumb.js`). Renders a trail-of-
 * links `<nav><ol>` — an optional `home` item followed by `model` entries,
 * separated by a chevron `<li role="separator">` between each rendered
 * item.
 *
 * Real PrimeReact's `BreadCrumb` composes no `Menu`/`TieredMenu` — it's a
 * standalone, independent component (verified this task's Step 1 — no
 * import of `../menu`/`../tieredmenu` in `BreadCrumb.js`). This adaptation
 * follows the same independent shape: a plain component using
 * `useComponentBase`, not composing `UMenu`.
 *
 * `aria-current="page"` is applied per real PrimeReact's own `isCurrent()`
 * helper — matches the last item (and the home item) whenever its `url`
 * equals `window.location.pathname`.
 */
export const UBreadcrumb = React.forwardRef<HTMLElement, UBreadcrumbProps>(function UBreadcrumb(
  { model = [], home, homeAriaLabel, onItemClick, className },
  ref
) {
  const { cx } = useComponentBase({ componentName: "breadcrumb", styleModule: breadcrumbStyleModule });

  const isCurrent = (url?: string): "page" | undefined => {
    if (!url) return undefined;
    const path = typeof window !== "undefined" ? window.location.pathname : "";
    return url === path ? "page" : undefined;
  };

  const handleClick = (event: React.MouseEvent, item: UMenuItem) => {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    item.command?.({ originalEvent: event, item });
    onItemClick?.({ originalEvent: event, item });
    if (!item.url) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const renderLink = (item: UMenuItem, key: string) => (
    <li className={cx("menuitem", { item: true })} key={key} data-u-disabled={String(!!item.disabled)}>
      <a
        href={item.url ?? "#"}
        className={cx("action")}
        aria-disabled={item.disabled}
        aria-current={isCurrent(item.url)}
        tabIndex={item.disabled ? -1 : undefined}
        onClick={(event) => handleClick(event, item)}
      >
        {item.icon && <span className={cx("icon")}>{item.icon}</span>}
        {item.label && <span className={cx("label")}>{item.label}</span>}
      </a>
    </li>
  );

  const renderSeparator = (key: string) => (
    <li className={cx("separator")} role="separator" key={key}>
      ›
    </li>
  );

  const visibleModel = model.filter((item) => item.visible !== false);

  return (
    <nav ref={ref} className={[cx("root"), className].filter(Boolean).join(" ")}>
      <ol className={cx("menu")}>
        {home && home.visible !== false && (
          <li className={cx("home")} data-u-disabled={String(!!home.disabled)}>
            <a
              href={home.url ?? "#"}
              className={cx("action")}
              aria-label={homeAriaLabel}
              aria-disabled={home.disabled}
              tabIndex={home.disabled ? -1 : undefined}
              onClick={(event) => handleClick(event, home)}
            >
              {home.icon && <span className={cx("icon")}>{home.icon}</span>}
              {home.label && <span className={cx("label")}>{home.label}</span>}
            </a>
          </li>
        )}
        {home && home.visible !== false && visibleModel.length > 0 && renderSeparator("sep_home")}
        {visibleModel.map((item, index) => (
          <React.Fragment key={item.label ?? index}>
            {renderLink(item, `item_${index}`)}
            {index < visibleModel.length - 1 && renderSeparator(`sep_${index}`)}
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
});
