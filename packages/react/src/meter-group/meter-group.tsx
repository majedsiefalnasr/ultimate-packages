import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { meterGroupStyleModule } from "./meter-group-style";

/** A single segment of a `UMeterGroup`. */
export interface UMeterItem {
  label?: string;
  color?: string;
  value: number;
  icon?: string;
}

export interface UMeterGroupProps {
  value?: UMeterItem[];
  min?: number;
  max?: number;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `MeterGroup` component (real
 * source: `components/lib/metergroup/MeterGroup.js`). Confirmed against
 * real source: extends the bare `ComponentBase` tier (no CVA) — a display
 * component rendering a segmented bar of weighted `value` items within a
 * `min`/`max` range, plus an optional legend list. Real source's `value`
 * shape (`{ label, color, value, icon }[]`) is reused verbatim as
 * `UMeterItem`.
 *
 * Deliberately excludes real source's separate `MeterGroupLabel` component
 * (folded into this single file, matching the "reduce a decomposed family
 * to one component" precedent already established by `UAccordion`), its
 * per-slot render-prop overrides (label/meter/start/end/icon templates),
 * and `labelPosition: 'start'` (only `'end'`, the default, is implemented)
 * — same "smaller surface than upstream" precedent as every sibling
 * component.
 */
export const UMeterGroup = React.forwardRef<HTMLDivElement, UMeterGroupProps>(function UMeterGroup(
  { value = [], min = 0, max = 100, orientation = "horizontal", className },
  ref
) {
  const { cx } = useComponentBase({ componentName: "meter-group", styleModule: meterGroupStyleModule });

  const percent = (meter = 0): number => {
    if (max === min) return 100;
    const percentOfItem = ((meter - min) / (max - min)) * 100;
    return Math.round(Math.max(0, Math.min(100, percentOfItem)));
  };
  const percentValue = (meter: number): string => `${percent(meter)}%`;
  const totalPercent = percent(value.reduce((total, item) => total + (item.value || 0), 0));

  return (
    <div
      ref={ref}
      className={[cx("root", { orientation }), className].filter(Boolean).join(" ")}
      role="meter"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={totalPercent}
    >
      <div className={cx("meters")}>
        {value.map(
          (item, index) =>
            item.value > 0 && (
              <span
                key={index}
                className={cx("meter")}
                style={{
                  width: orientation === "horizontal" ? percentValue(item.value) : undefined,
                  height: orientation === "vertical" ? percentValue(item.value) : undefined,
                  background: item.color,
                }}
              />
            )
        )}
      </div>
      <ol className={cx("labelList", { orientation })}>
        {value.map((item, index) => (
          <li key={index} className={cx("label")}>
            {item.icon ? (
              <i className={[cx("labelIcon"), item.icon].join(" ")} style={{ color: item.color }} />
            ) : (
              <span className={cx("labelMarker")} style={{ backgroundColor: item.color }} />
            )}
            <span className={cx("labelText")}>
              {item.label} ({percentValue(item.value)})
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
});
