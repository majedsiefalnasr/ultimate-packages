import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { splitterStyleModule } from "./splitter-style";

export interface USplitterPanelConfig {
  content: React.ReactNode;
  /** Minimum size of this panel, as a percentage of the splitter's total size. */
  minSize?: number;
}

export interface USplitterResizeEvent {
  originalEvent: Event;
  sizes: number[];
}

export interface USplitterProps {
  panels: USplitterPanelConfig[];
  layout?: "horizontal" | "vertical";
  gutterSize?: number;
  step?: number;
  onResizeStart?: (event: USplitterResizeEvent) => void;
  onResizeEnd?: (event: USplitterResizeEvent) => void;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `Splitter`/`SplitterPanel`
 * components (real source: `components/lib/splitter/Splitter.js`/
 * `SplitterBase.js`). Confirmed against real source: extends the bare
 * `ComponentBase` tier (no CVA) — real source's drag-resize mechanism is a
 * `mousedown`/`mousemove`/`mouseup` (and `touchstart`/`touchmove`/
 * `touchend`) chain computing each panel's new `flex-basis` from the
 * pointer's delta relative to the gutter's start position, clamped
 * against each panel's own `minSize`, plus an `ArrowLeft`/`ArrowRight`/
 * `ArrowUp`/`ArrowDown` keyboard-repeat path stepping by `step` on a 40ms
 * interval while held. This port keeps that same real mechanism.
 *
 * Real source scans `children` (`SplitterPanel` elements) to build its
 * panel list. This port instead takes an explicit `panels: {content,
 * minSize}[]` prop array — a config-driven panel list rather than a
 * children-scanning tree — same "reduce a multi-component family to one
 * component with a config surface" precedent as this session's
 * `UAccordion`/`UPanelMenu` reductions, disclosed here rather than
 * silently presented as matching upstream's own children-based shape.
 *
 * Deliberately excludes real source's `stateStorage`/`stateKey`
 * session/localStorage persistence and RTL-aware drag-direction flip —
 * same "smaller surface than upstream" precedent as every sibling
 * component; touch-drag listeners are wired for parity but genuine
 * touch-event testing is out of this task's scope, also disclosed.
 */
export function USplitter({
  panels,
  layout = "horizontal",
  gutterSize = 4,
  step = 5,
  onResizeStart,
  onResizeEnd,
  className,
}: USplitterProps): React.ReactNode {
  const { cx } = useComponentBase({ componentName: "splitter", styleModule: splitterStyleModule });
  const [panelSizes, setPanelSizes] = React.useState<number[]>(() =>
    panels.map(() => 100 / panels.length)
  );
  const rootRef = React.useRef<HTMLDivElement>(null);

  const stateRef = React.useRef({
    size: 0,
    startPos: 0,
    prevPanelIndex: 0,
    prevPanelSize: 0,
    nextPanelSize: 0,
  });
  const repeatTimerRef = React.useRef<ReturnType<typeof setInterval>>();

  const horizontal = layout === "horizontal";

  const pointFrom = (event: MouseEvent | TouchEvent): { pageX: number; pageY: number } => {
    if ("changedTouches" in event) {
      const touch = event.changedTouches[0];
      return { pageX: touch.pageX, pageY: touch.pageY };
    }
    return { pageX: event.pageX, pageY: event.pageY };
  };

  const resizeStart = (event: MouseEvent | TouchEvent, index: number, isKeyDown = false) => {
    const rootEl = rootRef.current;
    if (!rootEl) return;
    const state = stateRef.current;
    state.size = horizontal ? rootEl.offsetWidth : rootEl.offsetHeight;

    if (!isKeyDown) {
      const point = pointFrom(event);
      state.startPos = horizontal ? point.pageX : point.pageY;
    }

    state.prevPanelIndex = index;
    state.prevPanelSize = panelSizesRef.current[index] ?? 0;
    state.nextPanelSize = panelSizesRef.current[index + 1] ?? 0;

    onResizeStart?.({ originalEvent: event, sizes: [...panelSizesRef.current] });
  };

  const panelSizesRef = React.useRef(panelSizes);
  panelSizesRef.current = panelSizes;

  const minSizeOf = (index: number): number => panels[index]?.minSize ?? 0;

  const resize = (event: MouseEvent | TouchEvent, step?: number, isKeyDown = false) => {
    const state = stateRef.current;
    let newPrevPanelSize: number;
    let newNextPanelSize: number;

    if (isKeyDown) {
      newPrevPanelSize = state.prevPanelSize + (step ?? 0);
      newNextPanelSize = state.nextPanelSize - (step ?? 0);
    } else {
      const point = pointFrom(event);
      const pos = horizontal ? point.pageX : point.pageY;
      const delta = ((pos - state.startPos) * 100) / state.size;
      newPrevPanelSize = state.prevPanelSize + delta;
      newNextPanelSize = state.nextPanelSize - delta;
    }

    const prevMin = minSizeOf(state.prevPanelIndex);
    const nextMin = minSizeOf(state.prevPanelIndex + 1);

    if (
      newPrevPanelSize < prevMin ||
      newNextPanelSize < nextMin ||
      newPrevPanelSize > 100 - nextMin ||
      newNextPanelSize > 100 - prevMin
    ) {
      newPrevPanelSize = Math.min(Math.max(prevMin, newPrevPanelSize), 100 - nextMin);
      newNextPanelSize = Math.min(Math.max(nextMin, newNextPanelSize), 100 - prevMin);
    }

    setPanelSizes((prev) => {
      const next = [...prev];
      next[state.prevPanelIndex] = newPrevPanelSize;
      next[state.prevPanelIndex + 1] = newNextPanelSize;
      return next;
    });
  };

  const resizeEnd = (event: Event) => {
    onResizeEnd?.({ originalEvent: event, sizes: [...panelSizesRef.current] });
  };

  const onGutterMouseDown = (event: React.MouseEvent, index: number) => {
    resizeStart(event.nativeEvent, index);
    const onMove = (e: MouseEvent) => resize(e);
    const onUp = (e: MouseEvent) => {
      resizeEnd(e);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const onGutterTouchStart = (event: React.TouchEvent, index: number) => {
    resizeStart(event.nativeEvent, index);
    const onMove = (e: TouchEvent) => resize(e);
    const onEnd = (e: TouchEvent) => {
      resizeEnd(e);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
    };
    document.addEventListener("touchmove", onMove);
    document.addEventListener("touchend", onEnd);
  };

  const clearRepeatTimer = () => {
    if (repeatTimerRef.current) {
      clearInterval(repeatTimerRef.current);
      repeatTimerRef.current = undefined;
    }
  };

  const onGutterKeyDown = (event: React.KeyboardEvent, index: number) => {
    const setRepeatTimer = (stepValue: number) => {
      clearRepeatTimer();
      const repeat = () => {
        resizeStart(event.nativeEvent as unknown as MouseEvent, index, true);
        resize(event.nativeEvent as unknown as MouseEvent, stepValue, true);
      };
      repeat();
      repeatTimerRef.current = setInterval(repeat, 40);
    };

    switch (event.code) {
      case "ArrowLeft":
        if (horizontal) setRepeatTimer(step * -1);
        event.preventDefault();
        break;
      case "ArrowRight":
        if (horizontal) setRepeatTimer(step);
        event.preventDefault();
        break;
      case "ArrowDown":
        if (!horizontal) setRepeatTimer(step * -1);
        event.preventDefault();
        break;
      case "ArrowUp":
        if (!horizontal) setRepeatTimer(step);
        event.preventDefault();
        break;
      default:
        break;
    }
  };

  const onGutterKeyUp = (event: React.KeyboardEvent) => {
    clearRepeatTimer();
    resizeEnd(event.nativeEvent);
  };

  const gutterStyle: React.CSSProperties = horizontal
    ? { width: `${gutterSize}px` }
    : { height: `${gutterSize}px` };

  const gutterCount = Math.max(panels.length - 1, 0);

  return (
    <div ref={rootRef} className={[cx("root", { layout }), className].filter(Boolean).join(" ")}>
      {panels.map((panel, index) => (
        // eslint-disable-next-line react/no-array-index-key -- panels have no stable identity in this config-driven shape
        <React.Fragment key={index}>
          <div
            className={cx("panel")}
            style={{ flexBasis: `calc(${panelSizes[index] ?? 0}% - ${gutterCount * gutterSize}px)` }}
            tabIndex={-1}
          >
            {panel.content}
          </div>
          {index !== panels.length - 1 && (
            <div
              className={cx("gutter")}
              onMouseDown={(e) => onGutterMouseDown(e, index)}
              onTouchStart={(e) => onGutterTouchStart(e, index)}
            >
              <div
                className={cx("gutterHandle")}
                role="separator"
                tabIndex={0}
                style={gutterStyle}
                aria-orientation={layout}
                aria-valuenow={panelSizes[index]}
                onKeyDown={(e) => onGutterKeyDown(e, index)}
                onKeyUp={onGutterKeyUp}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
