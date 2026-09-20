import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { toolbarStyleModule } from "./toolbar-style";

export interface UToolbarProps {
  ariaLabelledBy?: string;
  start?: React.ReactNode;
  center?: React.ReactNode;
  end?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `Toolbar` component (real
 * source: `components/lib/toolbar/Toolbar.js`/`ToolbarBase.js`). Confirmed
 * against real source: extends the bare `ComponentBase` tier (no CVA) — a
 * grouping layout component for buttons/content with `role="toolbar"`,
 * never a form control.
 *
 * This port keeps real source's `start`/`center`/`end` three-slot layout as
 * `React.ReactNode` props (React's established fully-controlled idiom,
 * matching real source's own `left`/`right`-deprecated-alias-carrying
 * `start`/`end`/`center` render props) plus `children` for any un-slotted
 * default content.
 */
export const UToolbar = React.forwardRef<HTMLDivElement, UToolbarProps>(function UToolbar(
  { ariaLabelledBy, start, center, end, children, className },
  ref
) {
  const { cx } = useComponentBase({ componentName: "toolbar", styleModule: toolbarStyleModule });

  return (
    <div
      ref={ref}
      className={[cx("root"), className].filter(Boolean).join(" ")}
      role="toolbar"
      aria-labelledby={ariaLabelledBy}
    >
      {children}
      {start !== undefined && <div className={cx("start")}>{start}</div>}
      {center !== undefined && <div className={cx("center")}>{center}</div>}
      {end !== undefined && <div className={cx("end")}>{end}</div>}
    </div>
  );
});
