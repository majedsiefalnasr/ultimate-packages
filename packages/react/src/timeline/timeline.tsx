import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { timelineStyleModule } from "./timeline-style";

export interface UTimelineProps<T = unknown> {
  value: T[];
  align?: "left" | "right" | "top" | "bottom";
  layout?: "vertical" | "horizontal";
  content?: (item: T) => React.ReactNode;
  opposite?: (item: T) => React.ReactNode;
  marker?: (item: T) => React.ReactNode;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `Timeline` component (real
 * source: `components/lib/timeline/Timeline.js`/`TimelineBase.js`).
 * Confirmed against real source: extends the bare `ComponentBase` tier (no
 * CVA) — a display component visualizing a series of chained events, never
 * a form control.
 *
 * This port keeps real source's `value`/`align`/`layout` surface and its
 * three content slots (opposite/marker/content), realized here as render-
 * prop functions (`content`/`opposite`/`marker`) — React's established,
 * fully-controlled idiom for slot content, matching this package's own
 * `UPanel` header/footer render-prop precedent, rather than real source's
 * `content`/`opposite`/`marker` JSX-element-or-function props.
 */
export function UTimeline<T = unknown>({
  value,
  align = "left",
  layout = "vertical",
  content,
  opposite,
  marker,
  className,
}: UTimelineProps<T>): React.ReactNode {
  const { cx } = useComponentBase({ componentName: "timeline", styleModule: timelineStyleModule });

  return (
    <div className={[cx("root", { layout, align }), className].filter(Boolean).join(" ")}>
      {value.map((event, index) => (
        // eslint-disable-next-line react/no-array-index-key -- events have no stable identity in real source either
        <div key={index} className={cx("event")}>
          <div className={cx("eventOpposite")}>{opposite?.(event)}</div>
          <div className={cx("eventSeparator")}>
            {marker ? marker(event) : <div className={cx("eventMarker")} />}
            {index !== value.length - 1 && <div className={cx("eventConnector")} />}
          </div>
          <div className={cx("eventContent")}>{content?.(event)}</div>
        </div>
      ))}
    </div>
  );
}
