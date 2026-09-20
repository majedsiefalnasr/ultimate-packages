import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { knobStyleModule } from "./knob-style";

const RADIUS = 40;
const MID_X = 50;
const MID_Y = 50;
const MIN_RADIANS = (4 * Math.PI) / 3;
const MAX_RADIANS = -Math.PI / 3;

export interface UKnobProps {
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
  valueTemplate?: string;
  valueColor?: string;
  rangeColor?: string;
  textColor?: string;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `Knob` (real source:
 * `components/lib/knob/Knob.js`/`KnobBase.js`, extracted this session via
 * `scripts/provenance/extract-primereact-source.mjs`). Fully controlled
 * (`value`/`onChange`), per React's established no-shared-form-state-base-
 * class convention — same shape every sibling React component in this batch
 * follows.
 *
 * NOT overlay-based — real source renders a single inline SVG with two arc
 * `<path>`s (range track + value arc) computed from trigonometry
 * (`Math.cos`/`Math.atan2`) mapping a click/drag offset to an angle, then an
 * angle to a value — no panel/dropdown, no genuinely novel architectural
 * pattern relative to the rest of this batch; only the amount of
 * trigonometric math inside the component body differs.
 *
 * Deliberately excludes real source's much larger surface: touch-event
 * handling (mouse/keyboard interaction only, matching every sibling
 * component's established "smaller surface than upstream" precedent) and
 * PrimeReact's global `context` config lookup.
 */
export function UKnob({
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
  valueTemplate = "{value}",
  valueColor = "#3B82F6",
  rangeColor = "#D1D5DB",
  textColor = "#374151",
  className,
}: UKnobProps): React.ReactElement {
  const { cx } = useComponentBase({ componentName: "knob", styleModule: knobStyleModule });
  const svgRef = React.useRef<SVGSVGElement>(null);

  const enabled = !disabled && !readOnly;

  const mapRange = (x: number, inMin: number, inMax: number, outMin: number, outMax: number): number =>
    ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;

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
  const valueToDisplay = valueTemplate.replace("{value}", value.toString());

  const updateModelValue = (newValue: number) => {
    onChange(Math.min(Math.max(newValue, min), max));
  };

  const updateFromAngle = (angle: number, start: number) => {
    let mappedValue: number;
    if (angle > MAX_RADIANS) {
      mappedValue = mapRange(angle, MIN_RADIANS, MAX_RADIANS, min, max);
    } else if (angle < start) {
      mappedValue = mapRange(angle + 2 * Math.PI, MIN_RADIANS, MAX_RADIANS, min, max);
    } else {
      return;
    }
    const stepped = Math.round((mappedValue - min) / step) * step + min;
    updateModelValue(stepped);
  };

  const updateFromOffset = (offsetX: number, offsetY: number) => {
    const dx = offsetX - size / 2;
    const dy = size / 2 - offsetY;
    const angle = Math.atan2(dy, dx);
    const start = -Math.PI / 2 - Math.PI / 6;
    updateFromAngle(angle, start);
  };

  const onClick = (event: React.MouseEvent) => {
    if (!enabled) return;
    updateFromOffset(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
  };

  const onMouseDown = (event: React.MouseEvent) => {
    if (!enabled) return;
    const move = (moveEvent: MouseEvent) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      updateFromOffset(moveEvent.clientX - rect.left, moveEvent.clientY - rect.top);
    };
    const up = () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
    event.preventDefault();
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
    <div className={[cx("root"), className].filter(Boolean).join(" ")}>
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        role="slider"
        width={size}
        height={size}
        tabIndex={enabled ? 0 : -1}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        onClick={onClick}
        onMouseDown={onMouseDown}
        onKeyDown={onKeyDown}
      >
        <path d={rangePath} strokeWidth={strokeWidth} stroke={rangeColor} className={cx("range")} />
        <path d={valuePath} strokeWidth={strokeWidth} stroke={valueColor} className={cx("value")} />
        {showValue && (
          <text x={50} y={57} textAnchor="middle" fill={textColor} className={cx("text")}>
            {valueToDisplay}
          </text>
        )}
      </svg>
    </div>
  );
}
