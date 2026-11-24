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
import { sliderStyleModule } from "./slider-style";

export interface USliderChangeEvent {
  originalEvent: Event;
  value: number | number[];
}

interface Point {
  x: number;
  y: number;
}

function toPercent(value: number, min: number, max: number): number {
  if (max <= min || value < min) return 0;
  if (value > max) return 100;
  return ((value - min) * 100) / (max - min);
}

/** PrimeNG's step rule: move from the current value toward the pointer in whole steps. */
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
 * Ultimate-owned adaptation of PrimeNG's `Slider` component (see
 * `.vendor-extracted/ng/slider/slider.ts`). Real source extends
 * `BaseEditableHolder<SliderPassThrough>` — same tier `URating`/
 * `USelectButton` already extend, not `UBaseInput`.
 *
 * NOT overlay-based — a track with one drag handle (or two in `range` mode),
 * no panel/dropdown. Supports single-value (`range` false, default) and
 * two-handle range mode (`modelValue` is a `[start, end]` tuple). Horizontal
 * and vertical `orientation` are both supported.
 *
 * Pointer input is mouse and touch. Both bind document listeners that are
 * removed when the drag ends or the component is destroyed. The pointer is
 * converted to a value with PrimeNG's step rule (relative to the current
 * value) and, for a horizontal slider, mirrored when the element is
 * right-to-left. The handle and range are placed with `inset-inline-start`.
 *
 * `pt`, `unstyled` and `dt` come from `UBaseComponent`. The root section is
 * bound through the `UBind` host directive, the component provides itself as
 * `U_PARENT_INSTANCE`, and `range`, `handle`, `startHandler` and `endHandler`
 * bind their own sections. The CSS is the shared `@ultimate/uix-styles/slider`
 * module (ADR-082).
 *
 * Deliberately excludes PrimeNG's `animate` input (the pinned stylesheet has
 * no rule for the class it toggles), `styleClass` (deprecated), `autofocus`,
 * and the `$pcSlider` instance token (no consumer); each is recorded in the
 * Slider ADR.
 */
@Component({
  standalone: true,
  selector: "u-slider",
  imports: [UBind],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: USlider, multi: true },
    { provide: U_PARENT_INSTANCE, useExisting: USlider },
  ],
  template: `
    @if (!range()) {
      <span
        [uBind]="ptm('range')"
        [class]="cx('range')"
        [style.width.%]="orientation() === 'horizontal' ? handleValue() : null"
        [style.height.%]="orientation() === 'vertical' ? handleValue() : null"
      ></span>
      <span
        [uBind]="ptm('handle')"
        [class]="cx('handle')"
        [style.inset-inline-start.%]="orientation() === 'horizontal' ? handleValue() : null"
        [style.bottom.%]="orientation() === 'vertical' ? handleValue() : null"
        role="slider"
        [attr.tabindex]="$disabled() ? null : tabindex()"
        [attr.aria-valuemin]="min()"
        [attr.aria-valuenow]="singleValue()"
        [attr.aria-valuemax]="max()"
        [attr.aria-orientation]="orientation()"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-labelledby]="ariaLabelledBy()"
        (mousedown)="onMouseDown($event)"
        (touchstart)="onTouchStart($event)"
        (keydown)="onKeyDown($event)"
      ></span>
    } @else {
      <span
        [uBind]="ptm('range')"
        [class]="cx('range')"
        [style.inset-inline-start.%]="orientation() === 'horizontal' ? rangeStart() : null"
        [style.width.%]="orientation() === 'horizontal' ? rangeWidth() : null"
        [style.bottom.%]="orientation() === 'vertical' ? rangeStart() : null"
        [style.height.%]="orientation() === 'vertical' ? rangeWidth() : null"
      ></span>
      <span
        [uBind]="ptm('startHandler')"
        [class]="cx('handle')"
        [style.inset-inline-start.%]="orientation() === 'horizontal' ? handleValues()[0] : null"
        [style.bottom.%]="orientation() === 'vertical' ? handleValues()[0] : null"
        role="slider"
        [attr.tabindex]="$disabled() ? null : tabindex()"
        [attr.aria-valuemin]="min()"
        [attr.aria-valuenow]="rangeModelValue()[0]"
        [attr.aria-valuemax]="max()"
        [attr.aria-orientation]="orientation()"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-labelledby]="ariaLabelledBy()"
        (mousedown)="onMouseDown($event, 0)"
        (touchstart)="onTouchStart($event, 0)"
        (keydown)="onKeyDown($event, 0)"
      ></span>
      <span
        [uBind]="ptm('endHandler')"
        [class]="cx('handle')"
        [style.inset-inline-start.%]="orientation() === 'horizontal' ? handleValues()[1] : null"
        [style.bottom.%]="orientation() === 'vertical' ? handleValues()[1] : null"
        role="slider"
        [attr.tabindex]="$disabled() ? null : tabindex()"
        [attr.aria-valuemin]="min()"
        [attr.aria-valuenow]="rangeModelValue()[1]"
        [attr.aria-valuemax]="max()"
        [attr.aria-orientation]="orientation()"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-labelledby]="ariaLabelledBy()"
        (mousedown)="onMouseDown($event, 1)"
        (touchstart)="onTouchStart($event, 1)"
        (keydown)="onKeyDown($event, 1)"
      ></span>
    }
  `,
  host: {
    "[class]": "cx('root', classesParams())",
    "(click)": "onBarClick($event)",
  },
  hostDirectives: [UBind],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class USlider extends UBaseEditableHolder {
  protected override readonly componentName = "slider";
  protected override readonly styleModule = sliderStyleModule;

  private readonly bindDirective = inject(UBind, { self: true });

  /** Minimum boundary value. */
  min = input(0, { transform: numberAttribute });
  /** Maximum boundary value. */
  max = input(100, { transform: numberAttribute });
  /** Orientation of the slider. */
  orientation = input<"horizontal" | "vertical">("horizontal");
  /** Step factor to increment/decrement the value. */
  step = input<number>();
  /** When specified, allows two boundary values to be picked. */
  range = input(false, { transform: booleanAttribute });
  /** Adds the `p-invalid` class to the root. */
  invalid = input(false, { transform: booleanAttribute });
  /** Tab index of each handle. A disabled slider has no tab stop. */
  tabindex = input(0, { transform: numberAttribute });
  /** Accessible name of each handle. */
  ariaLabel = input<string>();
  /** IDs of the elements that name each handle. */
  ariaLabelledBy = input<string>();

  /** Callback to invoke on value change. */
  onChange = output<USliderChangeEvent>();
  /** Callback to invoke when a drag interaction ends. */
  onSlideEnd = output<USliderChangeEvent>();

  private handleIndex = 0;
  private barRect = { left: 0, top: 0, width: 0, height: 0 };
  private rtl = false;
  private suppressClick = false;
  private stopDrag: (() => void) | null = null;

  private readonly destroyRegistration = inject(DestroyRef).onDestroy(() => this.stopDrag?.());

  protected readonly rangeModelValue = computed(() => {
    const value = this.modelValue() as number[] | null | undefined;
    return Array.isArray(value) ? value : [this.min(), this.max()];
  });

  protected readonly singleValue = computed(() => {
    const value = this.modelValue();
    return typeof value === "number" ? value : this.min();
  });

  protected readonly handleValue = computed(() =>
    toPercent(this.singleValue(), this.min(), this.max())
  );

  protected readonly handleValues = computed(() => {
    const [start, end] = this.rangeModelValue();
    return [toPercent(start, this.min(), this.max()), toPercent(end, this.min(), this.max())];
  });

  protected readonly rangeStart = computed(() => Math.min(...this.handleValues()));
  protected readonly rangeWidth = computed(() =>
    Math.abs(this.handleValues()[1] - this.handleValues()[0])
  );

  ngAfterViewChecked(): void {
    this.bindDirective.setAttrs(this.ptms(["host", "root"]));
  }

  protected classesParams() {
    return {
      orientation: this.orientation(),
      disabled: this.$disabled(),
      invalid: this.invalid(),
    };
  }

  private updateBarRect(): void {
    const element = this.el.nativeElement as HTMLElement;
    const rect = element.getBoundingClientRect();
    this.barRect = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
    this.rtl = getComputedStyle(element).direction === "rtl";
  }

  private percentFromPoint(point: Point): number | null {
    const rect = this.barRect;
    if (this.orientation() === "horizontal") {
      if (rect.width <= 0) return null;
      return this.rtl
        ? ((rect.left + rect.width - point.x) * 100) / rect.width
        : ((point.x - rect.left) * 100) / rect.width;
    }
    if (rect.height <= 0) return null;
    return ((rect.top + rect.height - point.y) * 100) / rect.height;
  }

  private setValueFromPoint(point: Point, event: Event): void {
    const percent = this.percentFromPoint(point);
    if (percent === null) return;
    const oldValue = this.range() ? this.rangeModelValue()[this.handleIndex] : this.singleValue();
    const raw = (this.max() - this.min()) * (percent / 100) + this.min();
    this.updateValue(snapToStep(raw, oldValue, this.step()), event);
  }

  protected onMouseDown(event: MouseEvent, index?: number): void {
    this.beginDrag(event, index, false);
  }

  protected onTouchStart(event: TouchEvent, index?: number): void {
    this.beginDrag(event, index, true);
  }

  private beginDrag(event: MouseEvent | TouchEvent, index: number | undefined, touch: boolean) {
    if (this.$disabled()) {
      return;
    }
    this.stopDrag?.();
    this.updateBarRect();
    this.handleIndex = this.range() && this.rangeModelValue()[0] === this.max() ? 0 : (index ?? 0);
    this.suppressClick = true;
    (event.currentTarget as HTMLElement).focus();

    const touchId = touch ? (event as TouchEvent).changedTouches[0]?.identifier : undefined;
    if (!touch) {
      event.preventDefault();
    }

    const move = (moveEvent: MouseEvent | TouchEvent) => {
      const point = pointFromEvent(moveEvent, touchId);
      if (!point) return;
      if (moveEvent.cancelable) moveEvent.preventDefault();
      this.setValueFromPoint(point, moveEvent);
    };
    const stop = () => {
      this.stopDrag = null;
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", end);
      document.removeEventListener("touchmove", move);
      document.removeEventListener("touchend", end);
      document.removeEventListener("touchcancel", end);
      window.setTimeout(() => {
        this.suppressClick = false;
      }, 0);
    };
    const end = (endEvent: MouseEvent | TouchEvent) => {
      stop();
      if (touch && endEvent.cancelable) endEvent.preventDefault();
      this.emitSlideEnd(endEvent);
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

  protected onBarClick(event: MouseEvent): void {
    if (this.$disabled()) {
      return;
    }
    if (this.suppressClick) {
      this.suppressClick = false;
      return;
    }
    if ((event.target as HTMLElement).getAttribute("role") === "slider") {
      return;
    }
    this.updateBarRect();
    const point = { x: event.clientX, y: event.clientY };
    if (this.range()) {
      const percent = this.percentFromPoint(point);
      if (percent === null) return;
      const [start, end] = this.handleValues();
      this.handleIndex = Math.abs(percent - start) <= Math.abs(percent - end) ? 0 : 1;
    } else {
      this.handleIndex = 0;
    }
    this.setValueFromPoint(point, event);
    this.emitSlideEnd(event);
  }

  private updateValue(value: number, event: Event): void {
    const clamped = Math.min(Math.max(parseFloat(value.toFixed(10)), this.min()), this.max());

    if (this.range()) {
      const values = [...this.rangeModelValue()];
      values[this.handleIndex] = clamped;
      this.writeModelValue(values);
      this.onModelChange(values);
      this.onModelTouched();
      this.onChange.emit({ originalEvent: event, value: values });
    } else {
      this.writeModelValue(clamped);
      this.onModelChange(clamped);
      this.onModelTouched();
      this.onChange.emit({ originalEvent: event, value: clamped });
    }
  }

  private emitSlideEnd(event: Event): void {
    const value = this.range() ? this.rangeModelValue() : this.singleValue();
    this.onSlideEnd.emit({ originalEvent: event, value });
  }

  protected onKeyDown(event: KeyboardEvent, index?: number): void {
    if (this.$disabled()) {
      return;
    }
    this.handleIndex = index ?? 0;
    const step = this.step() || 1;
    const current = this.range() ? this.rangeModelValue()[this.handleIndex] : this.singleValue();

    switch (event.key) {
      case "ArrowDown":
      case "ArrowLeft":
        this.updateValue(current - step, event);
        break;
      case "ArrowUp":
      case "ArrowRight":
        this.updateValue(current + step, event);
        break;
      case "PageDown":
        this.updateValue(current - step * 10, event);
        break;
      case "PageUp":
        this.updateValue(current + step * 10, event);
        break;
      case "Home":
        this.updateValue(this.min(), event);
        break;
      case "End":
        this.updateValue(this.max(), event);
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  override writeControlValue(value: unknown, setModelValue: (value: unknown) => void): void {
    setModelValue(value ?? (this.range() ? [this.min(), this.min()] : this.min()));
  }
}
