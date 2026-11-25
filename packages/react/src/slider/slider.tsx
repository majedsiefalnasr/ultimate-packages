import * as React from "react";
import {
  createPassThrough,
  useComponentBase,
  useMergeProps,
  type PassThrough,
  type PassThroughOptions,
} from "@ultimate/react-core";
import { sliderStyleModule } from "./slider-style";

export interface USliderChangeEvent {
  originalEvent: Event | React.SyntheticEvent;
  value: number | number[];
}

export interface USliderProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> {
  value: number | number[];
  onChange: (event: USliderChangeEvent) => void;
  min?: number;
  max?: number;
  step?: number;
  range?: boolean;
  orientation?: "horizontal" | "vertical";
  disabled?: boolean;
  /** Adds the `p-invalid` class to the root. */
  invalid?: boolean;
  /** Tab index of each handle. Defaults to `0`; a disabled slider has no tab stop. */
  tabIndex?: number;
  className?: string;
  onSlideEnd?: (event: USliderChangeEvent) => void;
  /** Renders the component with no Ultimate classes or styles. */
  unstyled?: boolean;
  /** Attributes for the `root`, `range`, `handle`, `startHandler` and `endHandler` sections. */
  pt?: PassThrough;
  ptOptions?: PassThroughOptions;
}

interface BarRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

type Point = { x: number; y: number };

function toPercent(value: number, min: number, max: number): number {
  if (max <= min || value < min) return 0;
  if (value > max) return 100;
  return ((value - min) * 100) / (max - min);
}

function toRangeValue(source: number | number[], min: number, max: number): number[] {
  return Array.isArray(source) ? source : [min, max];
}

function toSingleValue(source: number | number[], min: number): number {
  return typeof source === "number" ? source : min;
}

function snapToStep(raw: number, oldValue: number, step: number | undefined): number {
  if (!step) return Math.floor(raw);
  const diff = raw - oldValue;
  if (diff < 0) return oldValue + Math.ceil(raw / step - oldValue / step) * step;
  if (diff > 0) return oldValue + Math.floor(raw / step - oldValue / step) * step;
  return raw;
}

function pointFromEvent(event: MouseEvent | TouchEvent, touchId: number | undefined): Point | null {
  if ("changedTouches" in event) {
    const touches = Array.from(event.changedTouches);
    const touch =
      touchId === undefined ? touches[0] : touches.find((item) => item.identifier === touchId);
    return touch ? { x: touch.clientX, y: touch.clientY } : null;
  }
  return { x: event.clientX, y: event.clientY };
}

/**
 * Ultimate-owned adaptation of PrimeReact's `Slider` (real source:
 * `components/lib/slider/Slider.js`/`SliderBase.js`). Fully controlled
 * (`value`/`onChange`), per React's established no-shared-form-state-base-
 * class convention. NOT overlay-based: a track with one drag handle, or two
 * in `range` mode (`value` is then a `[start, end]` tuple).
 *
 * Pointer input is mouse and touch. Both bind document listeners that are
 * removed when the drag ends or the component unmounts, and read the latest
 * props through a ref so a long drag never works from a stale value. The
 * pointer is converted to a value with PrimeReact's step rule (relative to the
 * current value) and, for a horizontal slider, mirrored when the element is
 * right-to-left. The handle and range are placed with `inset-inline-start`.
 *
 * `pt`, `ptOptions` and `unstyled` follow the shared pass-through contract.
 * Range handles take the `startHandler` and `endHandler` sections used by
 * PrimeNG and PrimeVue, plus PrimeReact's `handle`. `aria-label` and
 * `aria-labelledby` go to the handles; every other attribute goes to the root
 * and `ref` is the root element. The CSS is the shared
 * `@ultimate/uix-styles/slider` module (ADR-082).
 *
 * Excluded: PrimeReact's global `context` lookup, and the `pt`-less
 * `getElement`/`props` ref handle (the ref is the element itself).
 */
export const USlider = React.forwardRef<HTMLDivElement, USliderProps>(function USlider(
  {
    value,
    onChange,
    min = 0,
    max = 100,
    step,
    range = false,
    orientation = "horizontal",
    disabled = false,
    invalid = false,
    tabIndex = 0,
    className,
    onSlideEnd,
    unstyled,
    pt,
    ptOptions,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    ...rest
  },
  ref
) {
  const { cx } = useComponentBase({
    componentName: "slider",
    styleModule: sliderStyleModule,
    unstyled,
  });
  const { ptm } = createPassThrough("slider", { props: { pt, ptOptions } });
  const mergeProps = useMergeProps();

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const handleIndexRef = React.useRef(0);
  const barRectRef = React.useRef<BarRect>({ left: 0, top: 0, width: 0, height: 0 });
  const rtlRef = React.useRef(false);
  const draggingRef = React.useRef(false);
  const suppressClickRef = React.useRef(false);
  const stopDragRef = React.useRef<(() => void) | null>(null);
  const valueRef = React.useRef<number | number[]>(value);
  const propsRef = React.useRef({
    min,
    max,
    step,
    range,
    orientation,
    disabled,
    onChange,
    onSlideEnd,
  });

  React.useEffect(() => {
    valueRef.current = value;
    propsRef.current = { min, max, step, range, orientation, disabled, onChange, onSlideEnd };
  });

  React.useEffect(
    () => () => {
      stopDragRef.current?.();
    },
    []
  );

  const setRoot = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  const rangeValue = toRangeValue(value, min, max);
  const singleValue = toSingleValue(value, min);
  const handlePercent = toPercent(singleValue, min, max);
  const startPercent = toPercent(rangeValue[0], min, max);
  const endPercent = toPercent(rangeValue[1], min, max);
  const rangeStart = Math.min(startPercent, endPercent);
  const rangeWidth = Math.abs(endPercent - startPercent);
  const horizontal = orientation === "horizontal";

  const updateBarRect = () => {
    const element = rootRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    barRectRef.current = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
    rtlRef.current = getComputedStyle(element).direction === "rtl";
  };

  const percentFromPoint = (point: Point): number | null => {
    const rect = barRectRef.current;
    if (propsRef.current.orientation === "horizontal") {
      if (rect.width <= 0) return null;
      return rtlRef.current
        ? ((rect.left + rect.width - point.x) * 100) / rect.width
        : ((point.x - rect.left) * 100) / rect.width;
    }
    if (rect.height <= 0) return null;
    return ((rect.top + rect.height - point.y) * 100) / rect.height;
  };

  const updateValue = (raw: number, event: Event | React.SyntheticEvent) => {
    const current = propsRef.current;
    const clamped = Math.min(Math.max(parseFloat(raw.toFixed(10)), current.min), current.max);
    if (current.range) {
      const next = [...toRangeValue(valueRef.current, current.min, current.max)];
      next[handleIndexRef.current] = clamped;
      valueRef.current = next;
      current.onChange({ originalEvent: event, value: next });
    } else {
      valueRef.current = clamped;
      current.onChange({ originalEvent: event, value: clamped });
    }
  };

  const setValueFromPoint = (point: Point, event: Event | React.SyntheticEvent) => {
    const percent = percentFromPoint(point);
    if (percent === null) return;
    const current = propsRef.current;
    const oldValue = current.range
      ? toRangeValue(valueRef.current, current.min, current.max)[handleIndexRef.current]
      : toSingleValue(valueRef.current, current.min);
    const raw = (current.max - current.min) * (percent / 100) + current.min;
    updateValue(snapToStep(raw, oldValue, current.step), event);
  };

  const emitSlideEnd = (event: Event | React.SyntheticEvent) => {
    const current = propsRef.current;
    current.onSlideEnd?.({
      originalEvent: event,
      value: current.range
        ? toRangeValue(valueRef.current, current.min, current.max)
        : toSingleValue(valueRef.current, current.min),
    });
  };

  const beginDrag = (
    event: React.MouseEvent | React.TouchEvent,
    index: number | undefined,
    touch: boolean
  ) => {
    if (propsRef.current.disabled) return;
    stopDragRef.current?.();
    updateBarRect();
    const current = propsRef.current;
    const startValue = toRangeValue(valueRef.current, current.min, current.max);
    handleIndexRef.current = current.range && startValue[0] === current.max ? 0 : (index ?? 0);
    draggingRef.current = true;
    suppressClickRef.current = true;
    (event.currentTarget as HTMLElement).focus();

    const touchId = touch
      ? (event.nativeEvent as TouchEvent).changedTouches[0]?.identifier
      : undefined;
    if (!touch) event.preventDefault();

    const move = (moveEvent: MouseEvent | TouchEvent) => {
      const point = pointFromEvent(moveEvent, touchId);
      if (!point) return;
      if (moveEvent.cancelable) moveEvent.preventDefault();
      setValueFromPoint(point, moveEvent);
    };
    const stop = () => {
      draggingRef.current = false;
      stopDragRef.current = null;
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", end);
      document.removeEventListener("touchmove", move);
      document.removeEventListener("touchend", end);
      document.removeEventListener("touchcancel", end);
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    };
    const end = (endEvent: MouseEvent | TouchEvent) => {
      stop();
      if (touch && endEvent.cancelable) endEvent.preventDefault();
      emitSlideEnd(endEvent);
    };

    if (touch) {
      document.addEventListener("touchmove", move, { passive: false });
      document.addEventListener("touchend", end);
      document.addEventListener("touchcancel", end);
    } else {
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", end);
    }
    stopDragRef.current = stop;
  };

  const onBarClick = (event: React.MouseEvent) => {
    if (disabled) return;
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    if ((event.target as HTMLElement).getAttribute("role") === "slider") return;
    updateBarRect();
    const point = { x: event.clientX, y: event.clientY };
    if (range) {
      const percent = percentFromPoint(point);
      if (percent === null) return;
      handleIndexRef.current =
        Math.abs(percent - startPercent) <= Math.abs(percent - endPercent) ? 0 : 1;
    } else {
      handleIndexRef.current = 0;
    }
    setValueFromPoint(point, event);
    emitSlideEnd(event.nativeEvent);
  };

  const onKeyDown = (event: React.KeyboardEvent, index?: number) => {
    if (disabled) return;
    handleIndexRef.current = index ?? 0;
    const current = range ? rangeValue[handleIndexRef.current] : singleValue;
    const stepAmount = step || 1;

    switch (event.key) {
      case "ArrowDown":
      case "ArrowLeft":
        updateValue(current - stepAmount, event);
        break;
      case "ArrowUp":
      case "ArrowRight":
        updateValue(current + stepAmount, event);
        break;
      case "PageDown":
        updateValue(current - stepAmount * 10, event);
        break;
      case "PageUp":
        updateValue(current + stepAmount * 10, event);
        break;
      case "Home":
        updateValue(min, event);
        break;
      case "End":
        updateValue(max, event);
        break;
      default:
        return;
    }
    event.preventDefault();
  };

  const handleProps = (
    section: "handle" | "startHandler" | "endHandler",
    percent: number,
    now: number,
    index?: number
  ) => {
    const base = {
      className: cx("handle"),
      style: horizontal ? { insetInlineStart: `${percent}%` } : { bottom: `${percent}%` },
      role: "slider",
      tabIndex: disabled ? undefined : tabIndex,
      "aria-valuemin": min,
      "aria-valuenow": now,
      "aria-valuemax": max,
      "aria-orientation": orientation,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledby,
      onMouseDown: (event: React.MouseEvent) => beginDrag(event, index, false),
      onTouchStart: (event: React.TouchEvent) => beginDrag(event, index, true),
      onKeyDown: (event: React.KeyboardEvent) => onKeyDown(event, index),
    };
    return section === "handle"
      ? mergeProps(base, ptm("handle"))
      : mergeProps(base, ptm("handle"), ptm(section));
  };

  return (
    <div
      ref={setRoot}
      {...mergeProps(
        rest,
        {
          className: [cx("root", { orientation, disabled, invalid }), className]
            .filter(Boolean)
            .join(" "),
          onClick: onBarClick,
        },
        ptm("root")
      )}
    >
      {!range ? (
        <>
          <span
            {...mergeProps(
              {
                className: cx("range"),
                style: horizontal
                  ? { width: `${handlePercent}%` }
                  : { height: `${handlePercent}%` },
              },
              ptm("range")
            )}
          />
          <span {...handleProps("handle", handlePercent, singleValue)} />
        </>
      ) : (
        <>
          <span
            {...mergeProps(
              {
                className: cx("range"),
                style: horizontal
                  ? { insetInlineStart: `${rangeStart}%`, width: `${rangeWidth}%` }
                  : { bottom: `${rangeStart}%`, height: `${rangeWidth}%` },
              },
              ptm("range")
            )}
          />
          <span {...handleProps("startHandler", startPercent, rangeValue[0], 0)} />
          <span {...handleProps("endHandler", endPercent, rangeValue[1], 1)} />
        </>
      )}
    </div>
  );
});
