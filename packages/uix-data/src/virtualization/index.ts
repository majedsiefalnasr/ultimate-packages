/**
 * Number of items that fit in a viewport of the given size. Verified as
 * shared tolerance-buffered windowing math across PrimeNG, PrimeReact,
 * and PrimeVue's real Scroller/VirtualScroller source, with one
 * correction: this adopts Angular's real zero-guard
 * (`itemSize || contentSize`), which PrimeReact's and PrimeVue's real
 * implementations lack — their unguarded form would divide 0/0 and
 * return NaN when both arguments are 0.
 */
export function calculateNumItemsInViewport(contentSize: number, itemSize: number): number {
  return itemSize || contentSize ? Math.ceil(contentSize / (itemSize || contentSize)) : 0;
}

/**
 * Tolerance-buffered last-index offset for virtualized scrolling. Verified
 * as pure math (no array access, no DOM) at real Prime Scroller call
 * sites; callers must separately clamp the result against their own live
 * collection length — that clamp requires live state and is intentionally
 * excluded from this function.
 */
export function calculateLast(
  first: number,
  numItemsInViewport: number,
  numToleratedItems: number,
  isColumns?: boolean
): number {
  void isColumns;
  return first + numItemsInViewport + (first < numToleratedItems ? 2 : 3) * numToleratedItems;
}
