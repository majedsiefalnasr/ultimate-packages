import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ViewEncapsulation,
  booleanAttribute,
  numberAttribute,
  computed,
  inject,
  input,
  output,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { UBaseEditableHolder, UBind, U_PARENT_INSTANCE } from "@ultimate/ng-core";
import { $dt } from "@ultimate/uix-styled";
import { knobStyleModule } from "./knob-style";

const RADIUS = 40;
const MID_X = 50;
const MID_Y = 50;
const MIN_RADIANS = (4 * Math.PI) / 3;
const MAX_RADIANS = -Math.PI / 3;

/** A `{value}` placeholder string, or a function that formats the value. */
export type UKnobValueTemplate = string | ((value: number) => string);

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
 * Ultimate-owned adaptation of PrimeNG's `Knob` component (see
 * `.vendor-extracted/ng/knob/knob.ts`). Real source extends
 * `BaseEditableHolder<KnobPassThrough>` — same tier `URating`/`USlider`
 * already extend, not `UBaseInput`.
 *
 * NOT overlay-based — a single inline SVG with two arc `<path>`s (range track
 * and value arc) computed with trigonometry, mapping a pointer position to an
 * angle and the angle to a value.
 *
 * Pointer input is mouse and touch. Both bind document listeners that are
 * removed when the drag ends or the component is destroyed. The arrow keys
 * move by `step`; PageUp and PageDown move by 10, as in PrimeNG.
 *
 * The colour defaults are the theme variables of the `knob` tokens, read with
 * `$dt()` as PrimeNG does, so they follow the installed preset and prefix.
 *
 * `pt`, `unstyled` and `dt` come from `UBaseComponent`. The root section is
 * bound through the `UBind` host directive, the component provides itself as
 * `U_PARENT_INSTANCE`, and `svg`, `range`, `value` and `text` bind their own
 * sections. The CSS is the shared `@ultimate/uix-styles/knob` module
 * (ADR-082).
 *
 * Deliberately excludes PrimeNG's `styleClass` (deprecated), the `name` and
 * `required` attributes PrimeNG writes onto the `<text>` and `<svg>` elements
 * (no form reads them there), and the `$pcKnob` instance token (no consumer);
 * each is recorded in the Knob ADR.
 */
@Component({
  standalone: true,
  selector: "u-knob",
  imports: [UBind],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: UKnob, multi: true },
    { provide: U_PARENT_INSTANCE, useExisting: UKnob },
  ],
  template: `
    <svg
      [uBind]="ptm('svg')"
      viewBox="0 0 100 100"
      role="slider"
      [style.width.px]="size()"
      [style.height.px]="size()"
      [attr.aria-valuemin]="min()"
      [attr.aria-valuemax]="max()"
      [attr.aria-valuenow]="_value()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-labelledby]="ariaLabelledBy()"
      [attr.tabindex]="readonly() || $disabled() ? -1 : tabindex()"
      (click)="onClick($event)"
      (keydown)="onKeyDown($event)"
      (mousedown)="onMouseDown($event)"
      (touchstart)="onTouchStart($event)"
    >
      <path
        [uBind]="ptm('range')"
        [attr.d]="rangePath()"
        [attr.stroke-width]="strokeWidth()"
        [attr.stroke]="rangeColor()"
        [class]="cx('range')"
      ></path>
      <path
        [uBind]="ptm('value')"
        [attr.d]="valuePath()"
        [attr.stroke-width]="strokeWidth()"
        [attr.stroke]="valueColor()"
        [class]="cx('value')"
      ></path>
      @if (showValue()) {
        <!-- prettier-ignore -->
        <text [uBind]="ptm('text')" x="50" y="57" text-anchor="middle" [attr.fill]="textColor()" [class]="cx('text')">{{ valueToDisplay() }}</text>
      }
    </svg>
  `,
  host: {
    "[class]": "cx('root', classesParams())",
  },
  hostDirectives: [UBind],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UKnob extends UBaseEditableHolder {
  protected override readonly componentName = "knob";
  protected override readonly styleModule = knobStyleModule;

  private readonly bindDirective = inject(UBind, { self: true });

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
  /** Adds the `p-invalid` class to the root. */
  invalid = input(false, { transform: booleanAttribute });
  /** Tab index of the dial. A disabled or readonly knob uses `-1`. */
  tabindex = input(0, { transform: numberAttribute });
  /** Accessible name of the dial. */
  ariaLabel = input<string>();
  /** IDs of the elements that name the dial. */
  ariaLabelledBy = input<string>();
  /** Every `{value}` in a string is replaced with the value; a function formats it. */
  valueTemplate = input<UKnobValueTemplate>("{value}");
  /** Background color of the value arc. Defaults to the `knob.value.background` token. */
  valueColor = input<string>($dt("knob.value.background").variable);
  /** Background color of the range arc. Defaults to the `knob.range.background` token. */
  rangeColor = input<string>($dt("knob.range.background").variable);
  /** Color of the value text. Defaults to the `knob.text.color` token. */
  textColor = input<string>($dt("knob.text.color").variable);

  /** Callback to invoke on value change. */
  onChange = output<number>();

  private stopDrag: (() => void) | null = null;

  private readonly destroyRegistration = inject(DestroyRef).onDestroy(() => this.stopDrag?.());

  protected readonly _value = computed(() => {
    const value = this.modelValue();
    return typeof value === "number" ? value : this.min();
  });

  ngAfterViewChecked(): void {
    this.bindDirective.setAttrs(this.ptms(["host", "root"]));
  }

  protected classesParams() {
    return { disabled: this.$disabled(), invalid: this.invalid() };
  }

  private get interactive(): boolean {
    return !this.$disabled() && !this.readonly();
  }

  private mapRange(
    x: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
  ): number {
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
    const template = this.valueTemplate();
    const value = this._value();
    return typeof template === "function"
      ? template(value)
      : template.replace(/{value}/g, value.toString());
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
      mappedValue = this.mapRange(
        angle + 2 * Math.PI,
        MIN_RADIANS,
        MAX_RADIANS,
        this.min(),
        this.max()
      );
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
    if (!this.interactive) {
      return;
    }
    this.updateFromOffset(event.offsetX, event.offsetY);
  }

  protected onMouseDown(event: MouseEvent): void {
    this.beginDrag(event, false);
  }

  protected onTouchStart(event: TouchEvent): void {
    this.beginDrag(event, true);
  }

  private beginDrag(event: MouseEvent | TouchEvent, touch: boolean): void {
    if (!this.interactive) {
      return;
    }
    this.stopDrag?.();
    const svg = event.currentTarget as SVGSVGElement;
    const touchId = touch ? (event as TouchEvent).changedTouches[0]?.identifier : undefined;
    if (!touch) {
      event.preventDefault();
    }

    const move = (moveEvent: MouseEvent | TouchEvent) => {
      if (!this.interactive) return;
      const point = pointFromEvent(moveEvent, touchId);
      if (!point) return;
      if (moveEvent.cancelable) moveEvent.preventDefault();
      const rect = svg.getBoundingClientRect();
      this.updateFromOffset(point.x - rect.left, point.y - rect.top);
    };
    const stop = () => {
      this.stopDrag = null;
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
    this.stopDrag = stop;
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (!this.interactive) {
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
