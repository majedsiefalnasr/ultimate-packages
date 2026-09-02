import * as React from "react";
import type { StyleModule } from "@ultimate/react-core";
import { useComponentBase } from "@ultimate/react-core";
import { calculateLast, calculateNumItemsInViewport } from "@ultimate/uix-data";

export interface UScrollerProps {
  items: unknown[];
  itemSize: number;
  numToleratedItems?: number;
  disabled?: boolean;
  lazy?: boolean;
  loading?: boolean;
  onLazyLoad?: (event: { first: number; last: number }) => void;
}

/**
 * Placeholder `StyleModule` for `UScroller`. The brief's own "Files" section
 * for this task lists only `scroller.tsx`/`scroller.spec.tsx` — no
 * `scroller-style.ts` — so this scaffold pass satisfies `useComponentBase`'s
 * `{ css, classes }` contract with a minimal inline stub rather than
 * introducing a file outside this task's declared scope. Task 8 (this
 * component's next React task, mirroring Angular's Task 3) replaces this
 * with a real `scroller-style.ts` sourcing tokens from
 * `@ultimate/uix-styles/virtualscroller`, matching the pattern already
 * established by `packages/ng/src/scroller/scroller-style.ts`.
 */
const scrollerStyleModule: StyleModule = {
  css: "",
  classes: {
    root: () => "u-scroller u-component",
  },
};

function getLast(items: unknown[], last = 0, isCols = false): number {
  if (!items) return 0;
  const liveLength = isCols ? items.length : items.length; // isCols branch unreachable in vertical-only scope (Global Constraints)
  return Math.min(liveLength, last);
}

export const UScroller: React.FC<UScrollerProps> = ({
  items,
  itemSize,
  numToleratedItems: numToleratedItemsProp,
}) => {
  const { cx } = useComponentBase({ componentName: "scroller", styleModule: scrollerStyleModule });

  const [firstState] = React.useState(0);
  const [contentSizeState] = React.useState(0); // real measurement lands in Task 8

  const numItemsInViewport = calculateNumItemsInViewport(contentSizeState, itemSize);
  // numToleratedItems is honored from day one — an explicit override always
  // takes effect, it is never silently hardcoded to a half-viewport default
  // regardless of what the caller passed, even though this task's own
  // contentSizeState is always 0 (so numItemsInViewport is always 0 until
  // Task 8's real measurement lands).
  const numToleratedItems =
    numToleratedItemsProp !== undefined ? numToleratedItemsProp : Math.ceil(numItemsInViewport / 2);
  const rawLast = calculateLast(firstState, numItemsInViewport, numToleratedItems);
  const last = getLast(items, rawLast);

  return <div className={cx("root")} data-num-items-in-viewport={numItemsInViewport} data-last={last} />;
};
