import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { floatLabelStyleModule } from "./float-label-style";

export interface UFloatLabelProps {
  variant?: "in" | "over" | "on";
  className?: string;
  children?: React.ReactNode;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `FloatLabel` (real source:
 * `components/lib/floatlabel/FloatLabel.js`/`FloatLabelBase.js`, extracted
 * this session via `scripts/provenance/extract-primereact-source.mjs`).
 * FloatLabel visually integrates a label with its form element, floating
 * the label above the input once it has content or focus — a label-position
 * wrapper, not a form control itself.
 *
 * Real source renders a single `<span>{children}</span>` with no internal
 * state of its own — no `useState`, no CVA/controlled-value concept, only a
 * `cx('root')` class resolution and `children` passthrough. This
 * realization follows suit exactly: a plain functional component using
 * `useComponentBase` only, matching `button.tsx`'s own "no controlled-value
 * hook needed" precedent for a display/layout primitive.
 *
 * The label-float trigger itself is pure CSS (`:has()` pseudo-class
 * selectors against `.u-filled`/`:focus`/`[placeholder]` on the projected
 * input — see `float-label-style.ts`), matching real source exactly: no
 * JS-side focus/content tracking exists in real `FloatLabel` at all.
 */
export const UFloatLabel = React.forwardRef<HTMLSpanElement, UFloatLabelProps>(
  function UFloatLabel({ variant = "over", className, children }, ref) {
    const { cx } = useComponentBase({
      componentName: "float-label",
      styleModule: floatLabelStyleModule,
    });

    return (
      <span ref={ref} className={[cx("root", { variant }), className].filter(Boolean).join(" ")}>
        {children}
      </span>
    );
  }
);
