import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { dividerStyleModule } from "./divider-style";

export interface UDividerProps {
  layout?: "horizontal" | "vertical";
  children?: React.ReactNode;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `Divider` component (real
 * source: `components/lib/divider/Divider.js`). Separates content with a
 * horizontal or vertical rule, with an optional projected label centered
 * on the rule — matching real source's own `layout` structural shape.
 *
 * Deliberately excludes real source's `type` (`solid`/`dashed`/`dotted`)
 * and `align` props — this port renders a solid rule only, centered
 * content only, same "smaller surface than upstream" precedent as every
 * sibling component.
 */
export const UDivider = React.forwardRef<HTMLDivElement, UDividerProps>(function UDivider(
  { layout = "horizontal", children, className },
  ref
) {
  const { cx } = useComponentBase({ componentName: "divider", styleModule: dividerStyleModule });

  return (
    <div
      ref={ref}
      className={[cx("root", { layout }), className].filter(Boolean).join(" ")}
      aria-orientation={layout}
      role="separator"
    >
      {children != null && <div className={cx("content")}>{children}</div>}
    </div>
  );
});
