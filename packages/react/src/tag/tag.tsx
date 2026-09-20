import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { tagStyleModule } from "./tag-style";

export interface UTagProps {
  severity?: "success" | "secondary" | "info" | "warn" | "danger" | "contrast";
  value?: string;
  icon?: React.ReactNode;
  rounded?: boolean;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `Tag` component (real source:
 * `components/lib/tag/Tag.js`/`TagBase.js`). Confirmed against real
 * source: extends the bare `ComponentBase` tier (no CVA) — a status/
 * categorization display component (severity-colored label with an
 * optional icon), never a form control.
 *
 * Deliberately excludes real source's `pt`/passthrough system — same
 * "smaller surface than upstream" precedent as every sibling component.
 */
export const UTag = React.forwardRef<HTMLSpanElement, UTagProps>(function UTag(
  { severity, value, icon, rounded = false, children, className },
  ref
) {
  const { cx } = useComponentBase({ componentName: "tag", styleModule: tagStyleModule });

  return (
    <span ref={ref} className={[cx("root", { severity, rounded }), className].filter(Boolean).join(" ")}>
      {icon && <span className={cx("icon")}>{icon}</span>}
      <span className={cx("label")}>{children ?? value}</span>
    </span>
  );
});
