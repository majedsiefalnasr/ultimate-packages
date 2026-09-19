import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { UMenubarSub } from "./menubar-sub";
import { menubarStyleModule } from "./menubar-style";
import type { UMenuItem } from "../menu";

export interface UMenubarProps {
  /** An array of menuitems. */
  model?: UMenuItem[];
  /** Defines a string value that labels an interactive element. */
  ariaLabel?: string;
  /** Fired when an item is selected. */
  onItemSelect?: (event: { originalEvent: React.SyntheticEvent; item: UMenuItem }) => void;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `Menubar` component (see
 * `.vendor-extracted/react/menubar/Menubar.js`; `MenubarSub` split into
 * `UMenubarSub`). Renders a horizontal bar of top-level items, each of
 * which may open a nested popup submenu (recursive `UMenubarSub`).
 *
 * Real PrimeReact's `Menubar` (no import of `../menu`/`../tieredmenu`) is a
 * standalone, independent component — it does NOT compose `Menu`. This
 * adaptation follows the same independent shape, composing only its own
 * recursive `UMenubarSub`.
 */
export const UMenubar = React.forwardRef<HTMLElement, UMenubarProps>(function UMenubar(
  { model = [], ariaLabel, onItemSelect, className },
  ref
) {
  const { cx } = useComponentBase({ componentName: "menubar", styleModule: menubarStyleModule });

  return (
    <nav ref={ref} className={[cx("root"), className].filter(Boolean).join(" ")} aria-label={ariaLabel}>
      <UMenubarSub items={model} root cx={cx} onItemSelect={(event) => onItemSelect?.(event)} />
    </nav>
  );
});
