import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { progressBarStyleModule } from "./progress-bar-style";

export interface UProgressBarProps {
  value?: number;
  showValue?: boolean;
  unit?: string;
  mode?: "determinate" | "indeterminate";
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `ProgressBar` component (real
 * source: `components/lib/progressbar/ProgressBar.js`). Confirmed against
 * real source (all 3 frameworks): extends the bare `ComponentBase` tier
 * (no CVA) — a process-status indicator with `determinate` (numeric
 * `value` + optional label) and `indeterminate` (animated, no value)
 * modes. Deliberately excludes real source's `displayValueTemplate`
 * render-prop override and `color`/`style`/`className` styling escape
 * hatches beyond the top-level `className` — same "smaller surface than
 * upstream" precedent as every sibling component.
 */
export const UProgressBar = React.forwardRef<HTMLDivElement, UProgressBarProps>(function UProgressBar(
  { value = 0, showValue = true, unit = "%", mode = "determinate", className },
  ref
) {
  const { cx } = useComponentBase({ componentName: "progress-bar", styleModule: progressBarStyleModule });

  return (
    <div
      ref={ref}
      className={[cx("root", { mode }), className].filter(Boolean).join(" ")}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={mode === "determinate" ? value : undefined}
    >
      {mode === "determinate" ? (
        <div className={cx("value")} style={{ width: `${value}%` }}>
          {showValue && (
            <div className={cx("label")}>
              {value}
              {unit}
            </div>
          )}
        </div>
      ) : (
        <div className={cx("value")} />
      )}
    </div>
  );
});
