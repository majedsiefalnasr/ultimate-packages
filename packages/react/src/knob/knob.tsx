import * as React from "react";
import {
  createPassThrough,
  useComponentBase,
  useMergeProps,
  type PassThrough,
  type PassThroughOptions,
} from "@ultimate/react-core";
import { $dt } from "@ultimate/uix-styled";
import { knobStyleModule } from "./knob-style";

const RADIUS = 40;
const MID_X = 50;
const MID_Y = 50;
const MIN_RADIANS = (4 * Math.PI) / 3;
const MAX_RADIANS = -Math.PI / 3;

/** A `{value}` placeholder string, or a function that formats the value. */
export type UKnobValueTemplate = string | ((value: number) => string);

export interface UKnobProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> {
  value: number;
  onChange: (value: number) => void;
  size?: number;
  min?: number;
  max?: number;
  step?: number;
  strokeWidth?: number;
  showValue?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  /** Adds the `p-invalid` class to the root. */
  invalid?: boolean;
  /** Tab index of the dial. Defaults to `0`; a disabled or read-only knob uses `-1`. */
  tabIndex?: number;
  /** Every `{value}` in a string is replaced with the value; a function formats it. */
  valueTemplate?: UKnobValueTemplate;
  /** Defaults to the `knob.value.background` token variable. */
  valueColor?: string;
  /** Defaults to the `knob.range.background` token variable. */
  rangeColor?: string;
  /** Defaults to the `knob.text.color` token variable. */
  textColor?: string;
  className?: string;
  /** Renders the component with no Ultimate classes or styles. */
  unstyled?: boolean;
  /** Attributes for the `root`, `svg`, `range`, `value` and `text` (or `label`) sections. */
  pt?: PassThrough;
  ptOptions?: PassThroughOptions;
}

function mapRange(x: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  return ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

function pointFromEvent(
  event: MouseEvent | TouchEvent,
  touchId: number | undefined
): { x: number; y: number } | null {
  if ("changedTouches" in event) {
    const touches = Array.from(event.changedTouches);
    const touch =
      touchId === undefined ? touches[0] : touches.find((item) => item.identifier === touchId);
    return touch ? { x: touch.clientX, y: touch.clientY } : null;
  }
  return { x: event.clientX, y: event.clientY };
}

/**
 * Ultimate-owned adaptation of PrimeReact's `Knob` (real source:
 * `components/lib/knob/Knob.js`/`KnobBase.js`). Fully controlled
 * (`value`/`onChange`), per React's established no-shared-form-state-base-
 * class convention. NOT overlay-based: a single inline SVG with two arc
 * `<path>`s computed with trigonometry, mapping a pointer position to an angle
 * and the angle to a value.
 *
 * Pointer input is mouse and touch. Both bind document listeners that are
 * removed when the drag ends or the component unmounts, and read the latest
 * props through a ref so a long drag never works from a stale value. The
 * arrow keys move by `step`, PageUp and PageDown by 10. `readOnly` blocks the
 * keyboard too (PrimeReact checks a lowercase `readonly` prop there).
 *
 * The colour defaults are the theme variables of the `knob` tokens, read with
 * `$dt()`, so they follow the installed preset and prefix (ADR-067).
 *
 * `pt`, `ptOptions` and `unstyled` follow the shared pass-through contract.
 * The text takes the `text` section used by PrimeNG and PrimeVue, plus
 * PrimeReact's `label`. `aria-label` and `aria-labelledby` go to the dial;
 * every other attribute goes to the root and `ref` is the root element. The
 * CSS is the shared `@ultimate/uix-styles/knob` module (ADR-082).
 *
 * Excluded: PrimeReact's global `context` lookup, the `getElement`/`props`
 * ref handle (the ref is the element itself), and the `name` attribute
 * PrimeReact writes onto the `<text>` element (no form reads it there).
 */
export const UKnob = React.forwardRef<HTMLDivElement, UKnobProps>(function UKnob(
  {
    value,
    onChange,
    size = 100,
    min = 0,
    max = 100,
    step = 1,
    strokeWidth = 14,
    showValue = true,
    readOnly = false,
    disabled = false,
    invalid = false,
    tabIndex = 0,
    valueTemplate = "{value}",
    valueColor,
    rangeColor,
    textColor,
    className,
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
    componentName: "knob",
    styleModule: knobStyleModule,
    unstyled,
  });
  const { ptm } = createPassThrough("knob", { props: { pt, ptOptions } });
  const mergeProps = useMergeProps();

  const enabled = !disabled && !readOnly;
  const stopDragRef = React.useRef<(() => void) | null>(null);
  const propsRef = React.useRef({ value, min, max, step, size, enabled, onChange });

  React.useEffect(() => {
    propsRef.current = { value, min, max, step, size, enabled, onChange };
  });

  React.useEffect(
    () => () => {
      stopDragRef.current?.();
    },
    []
  );

  const zeroRadians = mapRange(min > 0 && max > 0 ? min : 0, min, max, MIN_RADIANS, MAX_RADIANS);
  const valueRadians = mapRange(value, min, max, MIN_RADIANS, MAX_RADIANS);

  const minX = MID_X + Math.cos(MIN_RADIANS) * RADIUS;
  const minY = MID_Y - Math.sin(MIN_RADIANS) * RADIUS;
  const maxX = MID_X + Math.cos(MAX_RADIANS) * RADIUS;
  const maxY = MID_Y - Math.sin(MAX_RADIANS) * RADIUS;
  const zeroX = MID_X + Math.cos(zeroRadians) * RADIUS;
  const zeroY = MID_Y - Math.sin(zeroRadians) * RADIUS;
  const valueX = MID_X + Math.cos(valueRadians) * RADIUS;
  const valueY = MID_Y - Math.sin(valueRadians) * RADIUS;
  const largeArc = Math.abs(zeroRadians - valueRadians) < Math.PI ? 0 : 1;
  const sweep = valueRadians > zeroRadians ? 0 : 1;

  const rangePath = `M ${minX} ${minY} A ${RADIUS} ${RADIUS} 0 1 1 ${maxX} ${maxY}`;
  const valuePath = `M ${zeroX} ${zeroY} A ${RADIUS} ${RADIUS} 0 ${largeArc} ${sweep} ${valueX} ${valueY}`;
  const valueToDisplay =
    typeof valueTemplate === "function"
      ? valueTemplate(value)
      : valueTemplate.replace(/{value}/g, value.toString());

  const updateModelValue = (newValue: number) => {
    const current = propsRef.current;
    current.onChange(Math.min(Math.max(newValue, current.min), current.max));
  };

  const updateFromOffset = (offsetX: number, offsetY: number) => {
    const current = propsRef.current;
    const dx = offsetX - current.size / 2;
    const dy = current.size / 2 - offsetY;
    const angle = Math.atan2(dy, dx);
    const start = -Math.PI / 2 - Math.PI / 6;
    let mappedValue: number;
    if (angle > MAX_RADIANS) {
      mappedValue = mapRange(angle, MIN_RADIANS, MAX_RADIANS, current.min, current.max);
    } else if (angle < start) {
      mappedValue = mapRange(
        angle + 2 * Math.PI,
        MIN_RADIANS,
        MAX_RADIANS,
        current.min,
        current.max
      );
    } else {
      return;
    }
    updateModelValue(
      Math.round((mappedValue - current.min) / current.step) * current.step + current.min
    );
  };

  const onClick = (event: React.MouseEvent) => {
    if (!enabled) return;
    updateFromOffset(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
  };

  const beginDrag = (event: React.MouseEvent | React.TouchEvent, touch: boolean) => {
    if (!enabled) return;
    stopDragRef.current?.();
    const svg = event.currentTarget as SVGSVGElement;
    const touchId = touch
      ? (event.nativeEvent as TouchEvent).changedTouches[0]?.identifier
      : undefined;
    if (!touch) event.preventDefault();

    const move = (moveEvent: MouseEvent | TouchEvent) => {
      if (!propsRef.current.enabled) return;
      const point = pointFromEvent(moveEvent, touchId);
      if (!point) return;
      if (moveEvent.cancelable) moveEvent.preventDefault();
      const rect = svg.getBoundingClientRect();
      updateFromOffset(point.x - rect.left, point.y - rect.top);
    };
    const stop = () => {
      stopDragRef.current = null;
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", end);
      document.removeEventListener("touchmove", move);
      document.removeEventListener("touchend", end);
      document.removeEventListener("touchcancel", end);
    };
    const end = (endEvent: MouseEvent | TouchEvent) => {
      stop();
      if (touch && endEvent.cancelable) endEvent.preventDefault();
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

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!enabled) return;
    switch (event.code) {
      case "ArrowRight":
      case "ArrowUp":
        event.preventDefault();
        updateModelValue(value + step);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        event.preventDefault();
        updateModelValue(value - step);
        break;
      case "Home":
        event.preventDefault();
        updateModelValue(min);
        break;
      case "End":
        event.preventDefault();
        updateModelValue(max);
        break;
      case "PageUp":
        event.preventDefault();
        updateModelValue(value + 10);
        break;
      case "PageDown":
        event.preventDefault();
        updateModelValue(value - 10);
        break;
      default:
        break;
    }
  };

  return (
    <div
      ref={ref}
      {...mergeProps(
        rest,
        {
          className: [cx("root", { disabled, invalid }), className].filter(Boolean).join(" "),
        },
        ptm("root")
      )}
    >
      <svg
        {...mergeProps(
          {
            viewBox: "0 0 100 100",
            role: "slider",
            width: size,
            height: size,
            tabIndex: enabled ? tabIndex : -1,
            "aria-valuemin": min,
            "aria-valuemax": max,
            "aria-valuenow": value,
            "aria-label": ariaLabel,
            "aria-labelledby": ariaLabelledby,
            onClick,
            onMouseDown: (event: React.MouseEvent) => beginDrag(event, false),
            onTouchStart: (event: React.TouchEvent) => beginDrag(event, true),
            onKeyDown,
          },
          ptm("svg")
        )}
      >
        <path
          {...mergeProps(
            {
              d: rangePath,
              strokeWidth,
              stroke: rangeColor ?? $dt("knob.range.background").variable,
              className: cx("range"),
            },
            ptm("range")
          )}
        />
        <path
          {...mergeProps(
            {
              d: valuePath,
              strokeWidth,
              stroke: valueColor ?? $dt("knob.value.background").variable,
              className: cx("value"),
            },
            ptm("value")
          )}
        />
        {showValue && (
          <text
            {...mergeProps(
              {
                x: 50,
                y: 57,
                textAnchor: "middle",
                fill: textColor ?? $dt("knob.text.color").variable,
                className: cx("text"),
              },
              ptm("label"),
              ptm("text")
            )}
          >
            {valueToDisplay}
          </text>
        )}
      </svg>
    </div>
  );
});
