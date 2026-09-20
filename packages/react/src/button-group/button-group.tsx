import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { buttonGroupStyleModule } from "./button-group-style";

export interface UButtonGroupProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `ButtonGroup` component (real
 * source: `components/lib/buttongroup/ButtonGroup.js`). A trivial
 * content-wrapping `<span role="group">` composing `UButton` by CSS only
 * (adjoining borders/squared-off inner corners) — real source's own
 * `p-button-group-single` single-child class is excluded here (a purely
 * cosmetic edge case, same "smaller surface than upstream" precedent as
 * every sibling component).
 */
export const UButtonGroup = React.forwardRef<HTMLSpanElement, UButtonGroupProps>(
  function UButtonGroup({ children, className }, ref) {
    const { cx } = useComponentBase({
      componentName: "button-group",
      styleModule: buttonGroupStyleModule,
    });

    return (
      <span ref={ref} role="group" className={[cx("root"), className].filter(Boolean).join(" ")}>
        {children}
      </span>
    );
  }
);
