import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { progressSpinnerStyleModule } from "./progress-spinner-style";

export interface UProgressSpinnerProps {
  strokeWidth?: string;
  fill?: string;
  animationDuration?: string;
  ariaLabel?: string;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `ProgressSpinner` component
 * (real source: `components/lib/progressspinner/ProgressSpinner.js`).
 * Confirmed against real source (all 3 frameworks): extends the bare
 * `ComponentBase` tier (no CVA) — a purely visual, indeterminate SVG-circle
 * spinner with a configurable stroke width, fill, and animation duration.
 * No determinate/indeterminate mode distinction exists in real source
 * (unlike `ProgressBar`) — it is always an indeterminate busy indicator.
 */
export const UProgressSpinner = React.forwardRef<HTMLDivElement, UProgressSpinnerProps>(
  function UProgressSpinner(
    { strokeWidth = "2", fill = "none", animationDuration = "2s", ariaLabel, className },
    ref
  ) {
    const { cx } = useComponentBase({
      componentName: "progress-spinner",
      styleModule: progressSpinnerStyleModule,
    });

    return (
      <div
        ref={ref}
        className={[cx("root"), className].filter(Boolean).join(" ")}
        role="progressbar"
        aria-busy="true"
        aria-label={ariaLabel}
      >
        <svg
          className={cx("spin")}
          viewBox="25 25 50 50"
          style={{ animationDuration }}
        >
          <circle
            className={cx("circle")}
            cx="50"
            cy="50"
            r="20"
            fill={fill}
            strokeWidth={strokeWidth}
            strokeMiterlimit="10"
          />
        </svg>
      </div>
    );
  }
);
