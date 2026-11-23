import * as React from "react";
import {
  createPassThrough,
  useComponentBase,
  useMergeProps,
  type PassThrough,
  type PassThroughOptions,
} from "@ultimate/react-core";
import { floatLabelStyleModule } from "./float-label-style";

export interface UFloatLabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Position of the label relative to the input. PrimeReact has no variant. */
  variant?: "in" | "over" | "on";
  /** Renders the component with no Ultimate classes or styles. */
  unstyled?: boolean;
  /** Attributes for the root element. */
  pt?: PassThrough;
  ptOptions?: PassThroughOptions;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `FloatLabel` (real source:
 * `components/lib/floatlabel/FloatLabel.js`/`FloatLabelBase.js`).
 * FloatLabel visually integrates a label with its form element, floating
 * the label above the input once it has content or focus — a label-position
 * wrapper, not a form control itself.
 *
 * Real source renders a single `<span>{children}</span>` with no internal
 * state of its own. This realization follows suit: the root span merges
 * its own class, the remaining props and `ptm('root')`, and the ref is that
 * span. The CSS is the shared `@ultimate/uix-styles/floatlabel` module
 * (ADR-082), so it reads the Aura `floatlabel` tokens and matches Angular
 * and Vue.
 *
 * The label-float trigger itself is pure CSS (`:has()` pseudo-class
 * selectors against `p-filled`, `:focus` and `[placeholder]` on the
 * projected input), matching real source: no JS-side focus or content
 * tracking exists in real `FloatLabel`.
 */
export const UFloatLabel = React.forwardRef<HTMLSpanElement, UFloatLabelProps>(function UFloatLabel(
  { variant = "over", className, children, unstyled, pt, ptOptions, ...rest },
  ref
) {
  const { cx } = useComponentBase({
    componentName: "floatlabel",
    styleModule: floatLabelStyleModule,
    unstyled,
  });
  const { ptm } = createPassThrough("floatlabel", { props: { pt, ptOptions } });
  const mergeProps = useMergeProps();

  return (
    <span
      ref={ref}
      {...mergeProps(
        rest,
        { className: [cx("root", { variant }), className].filter(Boolean).join(" ") },
        ptm("root")
      )}
    >
      {children}
    </span>
  );
});
