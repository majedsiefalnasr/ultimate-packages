import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { sliderStyleModule } from "./slider-style";

export interface USliderChangeEvent {
  originalEvent: Event | React.SyntheticEvent;
  value: number | number[];
}

export interface USliderProps {
  value: number | number[];
  onChange: (event: USliderChangeEvent) => void;
  min?: number;
  max?: number;
  step?: number;
  range?: boolean;
  orientation?: "horizontal" | "vertical";
  disabled?: boolean;
  className?: string;
  onSlideEnd?: (event: USliderChangeEvent) => void;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `Slider` (real source:
 * `components/lib/slider/Slider.js`/`SliderBase.js`, extracted this session
 * via `scripts/provenance/extract-primereact-source.mjs`). Fully controlled
 * (`value`/`onChange`), per React's established no-shared-form-state-base-
 * class convention — same shape every sibling React component in this batch
 * follows.
 *
 * NOT overlay-based — real source renders a track with one drag handle (or
 * two in `range` mode), no panel/dropdown.
 *
 * Supports both single-value (`range` false, default) and two-handle range
 * mode (`range` true — `value` is a `[start, end]` tuple), matching real
 * source's own `range` branch throughout `setValue`/`updateValue`.
 *
 * Deliberately excludes real source's much larger surface: touch-event
 * handling (mouse/keyboard interaction only, matching every sibling
 * component's established "smaller surface than upstream" precedent) and
 * PrimeReact's global `context` config lookup.
 */
export function USlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step,
  range = false,
  orientation = "horizontal",
  disabled = false,
  className,
  onSlideEnd,
}: USliderProps): React.ReactElement {
  const { cx } = useComponentBase({ componentName: "slider", styleModule: sliderStyleModule });
  const rootRef = React.useRef<HTMLDivElement>(null);
  const handleIndexRef = React.useRef(0);
  const barRectRef = React.useRef({ left: 0, top: 0, width: 0, height: 0 });
  const draggingRef = React.useRef(false);

  const rangeValue = Array.isArray(value) ? value : [min, max];
  const singleValue = typeof value === "number" ? value : min;

  const toPercent = React.useCallback(
    (v: number) => {
      if (v < min) return 0;
      if (v > max) return 100;
      return ((v - min) * 100) / (max - min);
    },
    [min, max]
  );

  const handlePercent = toPercent(singleValue);
  const [startPercent, endPercent] = [toPercent(rangeValue[0]), toPercent(rangeValue[1])];
  const rangeStart = Math.min(startPercent, endPercent);
  const rangeWidth = Math.abs(endPercent - startPercent);

  const applyStep = React.useCallback(
    (raw: number): number => {
      if (!step) {
        return Math.floor(raw);
      }
      const decimals = step && Math.floor(step) !== step ? (step.toString().split(".")[1]?.length ?? 0) : 0;
      const stepped = Math.round(raw / step) * step;
      return decimals > 0 ? +stepped.toFixed(decimals) : stepped;
    },
    [step]
  );

  const updateValue = React.useCallback(
    (raw: number, event: Event | React.SyntheticEvent) => {
      const clamped = Math.min(Math.max(raw, min), max);
      if (range) {
        const next = [...rangeValue];
        next[handleIndexRef.current] = clamped;
        onChange({ originalEvent: event, value: next });
      } else {
        onChange({ originalEvent: event, value: clamped });
      }
    },
    [min, max, range, rangeValue, onChange]
  );

  const calculatePercent = React.useCallback(
    (clientX: number, clientY: number): number => {
      const rect = barRectRef.current;
      if (orientation === "horizontal") {
        return ((clientX - rect.left) * 100) / rect.width;
      }
      return ((rect.top + rect.height - clientY) * 100) / rect.height;
    },
    [orientation]
  );

  const setValueFromPointer = React.useCallback(
    (clientX: number, clientY: number, event: Event | React.SyntheticEvent) => {
      const percent = calculatePercent(clientX, clientY);
      const raw = (max - min) * (percent / 100) + min;
      updateValue(applyStep(raw), event);
    },
    [calculatePercent, max, min, updateValue, applyStep]
  );

  const emitSlideEnd = React.useCallback(
    (event: Event) => {
      onSlideEnd?.({ originalEvent: event, value: range ? rangeValue : singleValue });
    },
    [onSlideEnd, range, rangeValue, singleValue]
  );

  const onMouseDown = (event: React.MouseEvent, index?: number) => {
    if (disabled) return;
    handleIndexRef.current = index ?? 0;
    draggingRef.current = true;
    const rect = rootRef.current?.getBoundingClientRect();
    if (rect) {
      barRectRef.current = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
    }
    (event.target as HTMLElement).focus();
    event.preventDefault();

    const move = (moveEvent: MouseEvent) => {
      if (!draggingRef.current) return;
      setValueFromPointer(moveEvent.clientX, moveEvent.clientY, moveEvent);
    };
    const up = (upEvent: MouseEvent) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      emitSlideEnd(upEvent);
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  const nearestHandleIndex = (clientX: number, clientY: number): number => {
    const percent = calculatePercent(clientX, clientY);
    return Math.abs(percent - startPercent) <= Math.abs(percent - endPercent) ? 0 : 1;
  };

  const onBarClick = (event: React.MouseEvent) => {
    if (disabled || draggingRef.current) return;
    const target = event.target as HTMLElement;
    if (target.getAttribute("role") === "slider") return;
    const rect = rootRef.current?.getBoundingClientRect();
    if (rect) {
      barRectRef.current = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
    }
    handleIndexRef.current = range ? nearestHandleIndex(event.clientX, event.clientY) : 0;
    setValueFromPointer(event.clientX, event.clientY, event);
    emitSlideEnd(event.nativeEvent);
  };

  const onKeyDown = (event: React.KeyboardEvent, index?: number) => {
    if (disabled) return;
    handleIndexRef.current = index ?? 0;
    const current = range ? rangeValue[handleIndexRef.current] : singleValue;
    const stepAmount = step ?? 1;

    switch (event.key) {
      case "ArrowDown":
      case "ArrowLeft":
        updateValue(current - stepAmount, event);
        event.preventDefault();
        break;
      case "ArrowUp":
      case "ArrowRight":
        updateValue(current + stepAmount, event);
        event.preventDefault();
        break;
      case "PageDown":
        updateValue(current - stepAmount * 10, event);
        event.preventDefault();
        break;
      case "PageUp":
        updateValue(current + stepAmount * 10, event);
        event.preventDefault();
        break;
      case "Home":
        updateValue(min, event);
        event.preventDefault();
        break;
      case "End":
        updateValue(max, event);
        event.preventDefault();
        break;
      default:
        break;
    }
  };

  return (
    <div
      ref={rootRef}
      className={[cx("root", { orientation, disabled }), className].filter(Boolean).join(" ")}
      onClick={onBarClick}
    >
      {!range ? (
        <>
          <span
            className={cx("range")}
            style={
              orientation === "horizontal" ? { width: `${handlePercent}%` } : { height: `${handlePercent}%` }
            }
          />
          <span
            className={cx("handle")}
            style={
              orientation === "horizontal" ? { left: `${handlePercent}%` } : { bottom: `${handlePercent}%` }
            }
            role="slider"
            tabIndex={0}
            aria-valuemin={min}
            aria-valuenow={singleValue}
            aria-valuemax={max}
            aria-orientation={orientation}
            onMouseDown={onMouseDown}
            onKeyDown={onKeyDown}
          />
        </>
      ) : (
        <>
          <span
            className={cx("range")}
            style={
              orientation === "horizontal"
                ? { left: `${rangeStart}%`, width: `${rangeWidth}%` }
                : { bottom: `${rangeStart}%`, height: `${rangeWidth}%` }
            }
          />
          <span
            className={cx("handle")}
            style={
              orientation === "horizontal" ? { left: `${startPercent}%` } : { bottom: `${startPercent}%` }
            }
            role="slider"
            tabIndex={0}
            aria-valuemin={min}
            aria-valuenow={rangeValue[0]}
            aria-valuemax={max}
            aria-orientation={orientation}
            onMouseDown={(event) => onMouseDown(event, 0)}
            onKeyDown={(event) => onKeyDown(event, 0)}
          />
          <span
            className={cx("handle")}
            style={orientation === "horizontal" ? { left: `${endPercent}%` } : { bottom: `${endPercent}%` }}
            role="slider"
            tabIndex={0}
            aria-valuemin={min}
            aria-valuenow={rangeValue[1]}
            aria-valuemax={max}
            aria-orientation={orientation}
            onMouseDown={(event) => onMouseDown(event, 1)}
            onKeyDown={(event) => onKeyDown(event, 1)}
          />
        </>
      )}
    </div>
  );
}
