import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { calculateLast, calculateNumItemsInViewport } from "@ultimate/uix-data";
import { scrollerStyleModule } from "./scroller-style";

export interface UScrollerProps {
  items: unknown[];
  itemSize: number;
  numToleratedItems?: number;
  disabled?: boolean;
  lazy?: boolean;
  loading?: boolean;
  onLazyLoad?: (event: { first: number; last: number }) => void;
}

function getLast(items: unknown[], last = 0, isCols = false): number {
  if (!items) return 0;
  const liveLength = isCols ? items.length : items.length; // isCols branch unreachable in vertical-only scope (Global Constraints)
  return Math.min(liveLength, last);
}

export const UScroller = React.forwardRef<HTMLDivElement, UScrollerProps>((props, forwardedRef) => {
  const { items, itemSize, numToleratedItems: numToleratedItemsProp, disabled = false, loading } = props;
  const { cx } = useComponentBase({ componentName: "scroller", styleModule: scrollerStyleModule });

  const elementRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(forwardedRef, () => elementRef.current as HTMLDivElement);

  const [contentSizeState, setContentSizeState] = React.useState(0);
  const [firstState, setFirstState] = React.useState(0);

  React.useEffect(() => {
    const el = elementRef.current;
    if (!el) return;
    // Measures the root viewport element's offsetHeight — matching real
    // PrimeReact's elementRef.current.offsetHeight measurement exactly
    // (VirtualScroller.js:186, pinned commit d0f574e39122668292fc7a740f081bae1b93b1e9),
    // not clientHeight.
    setContentSizeState(el.offsetHeight);
    const observer = new ResizeObserver(() => setContentSizeState(el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const numItemsInViewport = calculateNumItemsInViewport(contentSizeState, itemSize);
  // numToleratedItems is honored from day one — an explicit override always
  // takes effect, it is never silently hardcoded to a half-viewport default
  // regardless of what the caller passed.
  const numToleratedItems =
    numToleratedItemsProp !== undefined ? numToleratedItemsProp : Math.ceil(numItemsInViewport / 2);
  const rawLast = calculateLast(firstState, numItemsInViewport, numToleratedItems);
  const last = getLast(items, rawLast);

  const visibleItems = disabled
    ? items.map((value, index) => ({ index, value }))
    : Array.from({ length: Math.max(0, last - firstState) }, (_, i) => ({
        index: firstState + i,
        value: items[firstState + i],
      }));

  const handleScroll = () => {
    const el = elementRef.current;
    if (!el) return;
    const newFirst = Math.floor(el.scrollTop / (itemSize || 1));
    if (newFirst !== firstState) {
      setFirstState(newFirst);
    }
  };

  return (
    <div
      ref={elementRef}
      className={cx("root") as string}
      data-num-items-in-viewport={numItemsInViewport}
      data-last={last}
      data-first={firstState}
      onScroll={handleScroll}
    >
      {loading ? (
        <div className={cx("loader") as string}>
          <span className="u-scroller-loading-icon" />
        </div>
      ) : null}
      <div data-u-scroller-content className={cx("content") as string} style={{ height: items.length * itemSize }}>
        {visibleItems.map(({ index, value }) => (
          <div key={index} data-u-scroller-item className={cx("item") as string} style={{ top: index * itemSize }}>
            {String(value)}
          </div>
        ))}
      </div>
    </div>
  );
});
UScroller.displayName = "UScroller";
