import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { dataScrollerStyleModule } from "./data-scroller-style";

export interface UDataScrollerLazyLoadEvent {
  first: number;
  rows: number;
}

export interface UDataScrollerRef {
  load: () => void;
  reset: () => void;
}

export interface UDataScrollerProps<T = unknown> {
  value?: T[] | null;
  rows?: number;
  inline?: boolean;
  lazy?: boolean;
  loader?: boolean;
  buffer?: number;
  scrollHeight?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  itemTemplate: (item: T, index: number) => React.ReactNode;
  emptyMessage?: React.ReactNode;
  onLazyLoad?: (event: UDataScrollerLazyLoadEvent) => void;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `DataScroller` component (real
 * source: `components/lib/datascroller/DataScroller.js`/
 * `DataScrollerBase.js`). Confirmed against real source: extends the bare
 * `ComponentBase` tier (no CVA) — a data-display component, never a form
 * control. Real source's own mechanism is plain incremental array-slicing
 * plus a scroll-position listener — **deliberately independent of
 * `UScroller`**, whose real windowed-virtualization approach
 * (`itemSize`/`numToleratedItems`-based) is architecturally unrelated (Spec
 * §3.1's explicit finding). Loaded items accumulate and remain rendered —
 * no virtualization, no item recycling — matching real upstream
 * DataScroller's actual behavior, not a scope cut.
 *
 * `loader: true` disables the internal scroll listener; real source has no
 * built-in "Load More" button UI for this mode, only the hook — this port
 * matches that exactly, exposing `load()`/`reset()` via a ref for the host
 * application to wire to its own control.
 *
 * Deliberately excludes real source's `pt`/`ptOptions` passthrough system —
 * same "smaller surface than upstream" precedent as every sibling
 * component.
 */
export const UDataScroller = React.forwardRef<UDataScrollerRef, UDataScrollerProps>(function UDataScroller(
  { value, rows = 0, inline = false, lazy = false, loader = false, buffer = 0.9, scrollHeight, header, footer, itemTemplate, emptyMessage, onLazyLoad, className },
  ref
) {
  const { cx } = useComponentBase({ componentName: "data-scroller", styleModule: dataScrollerStyleModule });
  const [windowEnd, setWindowEnd] = React.useState(0);
  const hasLoadedInitial = React.useRef(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const isLazy = lazy;
  const total = value?.length ?? 0;
  const dataToRender = isLazy ? (value ?? []) : (value ?? []).slice(0, windowEnd);

  // `load()` advances the render window by `rows` each call. The first call
  // (from the mount effect below, matching real source's own
  // `useMountEffect(() => load())`) fills the initial window (0..rows)
  // rather than skipping past it — subsequent calls (from scroll or the
  // exposed imperative `load()`) advance further, matching real source's
  // own single-`load()`-does-both-jobs shape.
  const load = React.useCallback(() => {
    const first = hasLoadedInitial.current ? windowEnd : 0;
    const nextWindowEnd = first + rows;
    hasLoadedInitial.current = true;
    if (isLazy) {
      onLazyLoad?.({ first, rows });
      setWindowEnd(nextWindowEnd);
    } else {
      if (first < total) setWindowEnd(Math.min(nextWindowEnd, total));
    }
  }, [windowEnd, rows, isLazy, onLazyLoad, total]);

  const reset = React.useCallback(() => {
    setWindowEnd(0);
    hasLoadedInitial.current = false;
    load();
  }, [load]);

  React.useImperativeHandle(ref, () => ({ load, reset }), [load, reset]);

  // Mount-time load, matching real source's own `useMountEffect(() => load())`
  // — reuses the same `load()` used everywhere else, rather than duplicating
  // the lazy-mode branch separately.
  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (loader) return;
    const target: HTMLElement | Window = inline ? (containerRef.current ?? window) : window;
    const handleScroll = () => {
      // Matches real source's own threshold formula
      // (`scrollTop >= scrollHeight * buffer - viewportHeight`), not a
      // rescaled fraction-of-total formula — kept algebraically identical
      // to real `DataScroller.js` so `buffer`'s meaning matches upstream
      // exactly.
      if (inline && containerRef.current) {
        const el = containerRef.current;
        if (el.scrollTop >= el.scrollHeight * buffer - el.clientHeight) load();
      } else {
        const doc = document.documentElement;
        if (window.scrollY >= doc.scrollHeight * buffer - window.innerHeight) load();
      }
    };
    target.addEventListener("scroll", handleScroll);
    return () => target.removeEventListener("scroll", handleScroll);
  }, [loader, inline, buffer, load]);

  const isEmpty = total === 0;

  return (
    <div
      ref={containerRef}
      className={[cx("root", { inline }), className].filter(Boolean).join(" ")}
      style={inline && scrollHeight ? { maxHeight: scrollHeight, overflowY: "auto" } : undefined}
    >
      {header}
      {isEmpty ? (
        <div className={cx("emptyMessage")}>{emptyMessage ?? "No records found"}</div>
      ) : (
        <div className={cx("content")}>{dataToRender.map((item, index) => itemTemplate(item, index))}</div>
      )}
      {footer}
    </div>
  );
});
