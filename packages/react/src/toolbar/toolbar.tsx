import * as React from "react";
import {
  createPassThrough,
  useComponentBase,
  useMergeProps,
  type PassThrough,
  type PassThroughOptions,
} from "@ultimate/react-core";
import { toolbarStyleModule } from "./toolbar-style";

/** Region content: a node, or a function that receives the toolbar props and returns one. */
export type UToolbarRegion = React.ReactNode | ((props: UToolbarProps) => React.ReactNode);

export interface UToolbarProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "className" | "style"
> {
  ariaLabelledBy?: string;
  start?: UToolbarRegion;
  center?: UToolbarRegion;
  end?: UToolbarRegion;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Renders the component with no Ultimate classes or styles. */
  unstyled?: boolean;
  /** Attributes for the toolbar's elements by section: root, start, center, end. */
  pt?: PassThrough;
  ptOptions?: PassThroughOptions;
}

function resolveRegion(region: UToolbarRegion, props: UToolbarProps): React.ReactNode {
  return typeof region === "function" ? region(props) : region;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `Toolbar` component (real
 * source: `components/lib/toolbar/Toolbar.js`/`ToolbarBase.js`). Confirmed
 * against real source: extends the bare `ComponentBase` tier (no CVA) — a
 * grouping layout component for buttons/content with `role="toolbar"`,
 * never a form control.
 *
 * This port keeps real source's `start`/`center`/`end` three-slot layout as
 * props that take a node or a function of the toolbar props (as
 * `getJSXElement` does in real source), plus `children` for any un-slotted
 * default content. A region renders only when its prop is defined. The
 * deprecated `left`/`right` aliases are not offered (ADR-089); the ref is the
 * root element itself.
 */
export const UToolbar = React.forwardRef<HTMLDivElement, UToolbarProps>(
  function UToolbar(props, ref) {
    const {
      ariaLabelledBy,
      start,
      center,
      end,
      children,
      className,
      style,
      unstyled,
      pt,
      ptOptions,
      ...rest
    } = props;
    const { cx } = useComponentBase({
      componentName: "toolbar",
      styleModule: toolbarStyleModule,
      unstyled,
    });
    const { ptm } = createPassThrough("toolbar", { props: { pt, ptOptions } });
    const mergeProps = useMergeProps();

    return (
      <div
        ref={ref}
        {...mergeProps(
          { role: "toolbar", "aria-labelledby": ariaLabelledBy, style },
          rest,
          { className: [cx("root"), className].filter(Boolean).join(" ") },
          ptm("root")
        )}
      >
        {children}
        {start !== undefined && (
          <div {...mergeProps({ className: cx("start") }, ptm("start"))}>
            {resolveRegion(start, props)}
          </div>
        )}
        {center !== undefined && (
          <div {...mergeProps({ className: cx("center") }, ptm("center"))}>
            {resolveRegion(center, props)}
          </div>
        )}
        {end !== undefined && (
          <div {...mergeProps({ className: cx("end") }, ptm("end"))}>
            {resolveRegion(end, props)}
          </div>
        )}
      </div>
    );
  }
);
