import * as React from "react";
import {
  createPassThrough,
  useComponentBase,
  useMergeProps,
  type PassThrough,
  type PassThroughOptions,
} from "@ultimate/react-core";
import { badgeStyleModule, type BadgeSeverity } from "./badge-style";

export interface UBadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Value to display inside the badge. An empty value renders a dot. */
  value?: string | number | null;
  /** Severity of the badge. `warning` is accepted as an alias of `warn`. */
  severity?: BadgeSeverity | null;
  /** Size of the badge. */
  size?: "small" | "large" | "xlarge" | null;
  /** Renders the component with no Ultimate classes or styles. */
  unstyled?: boolean;
  /** Attributes for the badge's root element. */
  pt?: PassThrough;
  ptOptions?: PassThroughOptions;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `Badge` (real source:
 * `components/lib/badge/Badge.js`/`BadgeBase.js`). A single `<span>` that
 * shows `value`; the ref is that element (ADR-088), where PrimeReact exposes
 * `getElement()`. Styling comes from the shared `@ultimate/uix-styles/badge`
 * module, so it matches Angular and Vue.
 */
export const UBadge = React.forwardRef<HTMLSpanElement, UBadgeProps>(function UBadge(props, ref) {
  const { value, severity, size, className, unstyled, pt, ptOptions, ...rest } = props;
  const { cx } = useComponentBase({
    componentName: "badge",
    styleModule: badgeStyleModule,
    unstyled,
  });
  const { ptm } = createPassThrough("badge", { props: { pt, ptOptions } });
  const mergeProps = useMergeProps();

  return (
    <span
      ref={ref}
      {...mergeProps(
        rest,
        { className: [cx("root", { value, size, severity }), className].filter(Boolean).join(" ") },
        ptm("root")
      )}
    >
      {value}
    </span>
  );
});
