import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  numberAttribute,
  computed,
  input,
  output,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { UBaseEditableHolder } from "@ultimate/ng-core";
import { knobStyleModule } from "./knob-style";

const RADIUS = 40;
const MID_X = 50;
const MID_Y = 50;
const MIN_RADIANS = (4 * Math.PI) / 3;
const MAX_RADIANS = -Math.PI / 3;

/**
 * Ultimate-owned adaptation of PrimeNG's `Knob` component (see
 * `.vendor-extracted/ng/knob/knob.ts`). Real source extends
 * `BaseEditableHolder<KnobPassThrough>` — confirmed against `export class
 * Knob extends BaseEditableHolder<...>` — same tier `URating`/`USlider`
 * already extend, not `UBaseInput`.
 *
 * NOT overlay-based — real source renders a single inline SVG `<svg>` with
 * two arc `<path>`s (range track + value arc) computed from trigonometry
 * (`Math.cos`/`Math.atan2`) mapping a click/drag position to an angle, then
 * an angle to a value — no panel/dropdown, no genuinely novel architectural
 * pattern relative to the existing `UBaseEditableHolder` + inline-template
 * shape every sibling in this batch already uses; only the amount of
 * trigonometric math inside the component body differs.
 *
 * Deliberately excludes real source's much larger surface: touch-event
 * handling (mouse/keyboard interaction only, matching every sibling
 * component's established "smaller surface than upstream" precedent) and
 * passthrough (`pt`).
 */
@Component({
  standalone: true,
  selector: "u-knob",
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: UKnob, multi: true }],
  template: `
    <svg
      viewBox="0 0 100 100"
      role="slider"
      [style.width.px]="size()"
      [style.height.px]="size()"
      [attr.aria-valuemin]="min()"
      [attr.aria-valuemax]="max()"
      [attr.aria-valuenow]="_value()"
      [attr.tabindex]="readonly() || $disabled() ? -1 : 0"
      (click)="onClick($event)"
      (keydown)="onKeyDown($event)"
      (mousedown)="onMouseDown($event)"
    >
      <path [attr.d]="rangePath()" [attr.stroke-width]="strokeWidth()" [attr.stroke]="rangeColor()" [class]="cx('range')"></path>
      <path [attr.d]="valuePath()" [attr.stroke-width]="strokeWidth()" [attr.stroke]="valueColor()" [class]="cx('value')"></path>
      @if (showValue()) {
        <text x="50" y="57" text-anchor="middle" [attr.fill]="textColor()" [class]="cx('text')">{{ valueToDisplay() }}</text>
      }
    </svg>
  `,
  host: {
    "[class]": "cx('root')",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UKnob extends UBaseEditableHolder {
  protected override readonly componentName = "knob";
  protected override readonly styleModule = knobStyleModule;

  /** Size of the component in pixels. */
  size = input(100, { transform: numberAttribute });
  /** Minimum boundary value. */
  min = input(0, { transform: numberAttribute });
  /** Maximum boundary value. */
  max = input(100, { transform: numberAttribute });
  /** Step factor to increment/decrement the value. */
  step = input(1, { transform: numberAttribute });
  /** Width of the knob stroke. */
  strokeWidth = input(14, { transform: numberAttribute });
  /** Whether to show the value inside the knob. */
  showValue = input(true, { transform: booleanAttribute });
  /** When present, the component value cannot be edited. */
  readonly = input(false, { transform: booleanAttribute });
  /** Template string of the value — `{value}` is replaced with the current value. */
  valueTemplate = input("{value}");
  /** Background color of the value arc. */
  valueColor = input("var(--p-knob-value-background, #3B82F6)");
  /** Background color of the range arc. */
  rangeColor = input("var(--p-knob-range-background, #D1D5DB)");
  /** Color of the value text. */
  textColor = input("var(--p-knob-text-color, #374151)");

  /** Callback to invoke on value change. */
  onChange = output<number>();

  protected readonly _value = computed(() => {
    const value = this.modelValue();
    return typeof value === "number" ? value : this.min();
  });

  private mapRange(x: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
    return ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }

  private zeroRadians(): number {
    const min = this.min();
    const max = this.max();
    return this.mapRange(min > 0 && max > 0 ? min : 0, min, max, MIN_RADIANS, MAX_RADIANS);
  }

  private valueRadians(): number {
    return this.mapRange(this._value(), this.min(), this.max(), MIN_RADIANS, MAX_RADIANS);
  }

  protected rangePath(): string {
    const minX = MID_X + Math.cos(MIN_RADIANS) * RADIUS;
    const minY = MID_Y - Math.sin(MIN_RADIANS) * RADIUS;
    const maxX = MID_X + Math.cos(MAX_RADIANS) * RADIUS;
    const maxY = MID_Y - Math.sin(MAX_RADIANS) * RADIUS;
    return `M ${minX} ${minY} A ${RADIUS} ${RADIUS} 0 1 1 ${maxX} ${maxY}`;
  }

  protected valuePath(): string {
    const zeroRadians = this.zeroRadians();
    const valueRadians = this.valueRadians();
    const zeroX = MID_X + Math.cos(zeroRadians) * RADIUS;
    const zeroY = MID_Y - Math.sin(zeroRadians) * RADIUS;
    const valueX = MID_X + Math.cos(valueRadians) * RADIUS;
    const valueY = MID_Y - Math.sin(valueRadians) * RADIUS;
    const largeArc = Math.abs(zeroRadians - valueRadians) < Math.PI ? 0 : 1;
    const sweep = valueRadians > zeroRadians ? 0 : 1;
    return `M ${zeroX} ${zeroY} A ${RADIUS} ${RADIUS} 0 ${largeArc} ${sweep} ${valueX} ${valueY}`;
  }

  protected valueToDisplay(): string {
    return this.valueTemplate().replace("{value}", this._value().toString());
  }

  private updateModelValue(newValue: number): void {
    const clamped = Math.min(Math.max(newValue, this.min()), this.max());
    this.writeModelValue(clamped);
    this.onModelChange(clamped);
    this.onModelTouched();
    this.onChange.emit(clamped);
  }

  private updateFromAngle(angle: number, start: number): void {
    let mappedValue: number;
    if (angle > MAX_RADIANS) {
      mappedValue = this.mapRange(angle, MIN_RADIANS, MAX_RADIANS, this.min(), this.max());
    } else if (angle < start) {
      mappedValue = this.mapRange(angle + 2 * Math.PI, MIN_RADIANS, MAX_RADIANS, this.min(), this.max());
    } else {
      return;
    }
    const step = this.step();
    const stepped = Math.round((mappedValue - this.min()) / step) * step + this.min();
    this.updateModelValue(stepped);
  }

  private updateFromOffset(offsetX: number, offsetY: number): void {
    const size = this.size();
    const dx = offsetX - size / 2;
    const dy = size / 2 - offsetY;
    const angle = Math.atan2(dy, dx);
    const start = -Math.PI / 2 - Math.PI / 6;
    this.updateFromAngle(angle, start);
  }

  protected onClick(event: MouseEvent): void {
    if (this.$disabled() || this.readonly()) {
      return;
    }
    this.updateFromOffset(event.offsetX, event.offsetY);
  }

  protected onMouseDown(event: MouseEvent): void {
    if (this.$disabled() || this.readonly()) {
      return;
    }
    const svg = (this.el.nativeElement as HTMLElement).querySelector("svg") as SVGSVGElement;
    const move = (moveEvent: MouseEvent) => {
      const rect = svg.getBoundingClientRect();
      this.updateFromOffset(moveEvent.clientX - rect.left, moveEvent.clientY - rect.top);
    };
    const up = () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
    event.preventDefault();
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (this.$disabled() || this.readonly()) {
      return;
    }
    switch (event.code) {
      case "ArrowRight":
      case "ArrowUp":
        event.preventDefault();
        this.updateModelValue(this._value() + this.step());
        break;
      case "ArrowLeft":
      case "ArrowDown":
        event.preventDefault();
        this.updateModelValue(this._value() - this.step());
        break;
      case "Home":
        event.preventDefault();
        this.updateModelValue(this.min());
        break;
      case "End":
        event.preventDefault();
        this.updateModelValue(this.max());
        break;
      case "PageUp":
        event.preventDefault();
        this.updateModelValue(this._value() + 10);
        break;
      case "PageDown":
        event.preventDefault();
        this.updateModelValue(this._value() - 10);
        break;
      default:
        break;
    }
  }

  override writeControlValue(value: unknown, setModelValue: (value: unknown) => void): void {
    setModelValue(typeof value === "number" ? value : this.min());
  }
}
