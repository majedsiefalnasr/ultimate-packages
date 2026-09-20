import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  numberAttribute,
  computed,
  input,
  output,
  signal,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { UBaseEditableHolder } from "@ultimate/ng-core";
import { sliderStyleModule } from "./slider-style";

export interface USliderChangeEvent {
  originalEvent: Event;
  value: number | number[];
}

/**
 * Ultimate-owned adaptation of PrimeNG's `Slider` component (see
 * `.vendor-extracted/ng/slider/slider.ts`). Real source extends
 * `BaseEditableHolder<SliderPassThrough>` — confirmed against `export class
 * Slider extends BaseEditableHolder<...>` — same tier `URating`/
 * `USelectButton` already extend, not `UBaseInput`.
 *
 * NOT overlay-based — real source renders a track with one drag handle (or
 * two in `range` mode), no panel/dropdown.
 *
 * Supports both single-value (`range` false, default) and two-handle range
 * mode (`range` true — `modelValue` is a `[start, end]` tuple), matching
 * real source's own `range` branch throughout `updateValue`/
 * `updateHandleValue`. Horizontal and vertical `orientation` both supported.
 *
 * Deliberately excludes real source's much larger surface: `animate`
 * click-animation, touch-event handling (mouse/keyboard interaction only —
 * matching every sibling component's established "smaller surface than
 * upstream" precedent), and passthrough (`pt`).
 */
@Component({
  standalone: true,
  selector: "u-slider",
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: USlider, multi: true }],
  template: `
    @if (!range()) {
      <span [class]="cx('range')" [style.width.%]="orientation() === 'horizontal' ? handleValue() : null" [style.height.%]="orientation() === 'vertical' ? handleValue() : null"></span>
      <span
        #handle
        [class]="cx('handle')"
        [style.left.%]="orientation() === 'horizontal' ? handleValue() : null"
        [style.bottom.%]="orientation() === 'vertical' ? handleValue() : null"
        role="slider"
        tabindex="0"
        [attr.aria-valuemin]="min()"
        [attr.aria-valuenow]="modelValue()"
        [attr.aria-valuemax]="max()"
        [attr.aria-orientation]="orientation()"
        (mousedown)="onMouseDown($event)"
        (keydown)="onKeyDown($event)"
      ></span>
    } @else {
      <span
        [class]="cx('range')"
        [style.left.%]="orientation() === 'horizontal' ? rangeStart() : null"
        [style.width.%]="orientation() === 'horizontal' ? rangeWidth() : null"
        [style.bottom.%]="orientation() === 'vertical' ? rangeStart() : null"
        [style.height.%]="orientation() === 'vertical' ? rangeWidth() : null"
      ></span>
      <span
        #handleStart
        [class]="cx('handle')"
        [style.left.%]="orientation() === 'horizontal' ? handleValues()[0] : null"
        [style.bottom.%]="orientation() === 'vertical' ? handleValues()[0] : null"
        role="slider"
        tabindex="0"
        [attr.aria-valuemin]="min()"
        [attr.aria-valuenow]="rangeModelValue()[0]"
        [attr.aria-valuemax]="max()"
        [attr.aria-orientation]="orientation()"
        (mousedown)="onMouseDown($event, 0)"
        (keydown)="onKeyDown($event, 0)"
      ></span>
      <span
        #handleEnd
        [class]="cx('handle')"
        [style.left.%]="orientation() === 'horizontal' ? handleValues()[1] : null"
        [style.bottom.%]="orientation() === 'vertical' ? handleValues()[1] : null"
        role="slider"
        tabindex="0"
        [attr.aria-valuemin]="min()"
        [attr.aria-valuenow]="rangeModelValue()[1]"
        [attr.aria-valuemax]="max()"
        [attr.aria-orientation]="orientation()"
        (mousedown)="onMouseDown($event, 1)"
        (keydown)="onKeyDown($event, 1)"
      ></span>
    }
  `,
  host: {
    "[class]": "cx('root', classesParams())",
    "(click)": "onBarClick($event)",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class USlider extends UBaseEditableHolder {
  protected override readonly componentName = "slider";
  protected override readonly styleModule = sliderStyleModule;

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

  /** Callback to invoke on value change. */
  onChange = output<USliderChangeEvent>();
  /** Callback to invoke when a drag interaction ends. */
  onSlideEnd = output<USliderChangeEvent>();

  private readonly dragging = signal(false);
  private handleIndex = 0;
  private barRect = { left: 0, top: 0, width: 0, height: 0 };

  protected readonly rangeModelValue = computed(() => {
    const value = this.modelValue() as number[] | null | undefined;
    return Array.isArray(value) ? value : [this.min(), this.max()];
  });

  protected readonly handleValue = computed(() => this.toPercent(this.singleValue()));

  protected readonly handleValues = computed(() => {
    const [start, end] = this.rangeModelValue();
    return [this.toPercent(start), this.toPercent(end)];
  });

  protected readonly rangeStart = computed(() => Math.min(...this.handleValues()));
  protected readonly rangeWidth = computed(() => Math.abs(this.handleValues()[1] - this.handleValues()[0]));

  private readonly singleValue = computed(() => {
    const value = this.modelValue();
    return typeof value === "number" ? value : this.min();
  });

  protected classesParams() {
    return { orientation: this.orientation(), disabled: this.$disabled() };
  }

  private toPercent(value: number): number {
    const min = this.min();
    const max = this.max();
    if (value < min) return 0;
    if (value > max) return 100;
    return ((value - min) * 100) / (max - min);
  }

  protected onMouseDown(event: MouseEvent, index?: number): void {
    if (this.$disabled()) {
      return;
    }
    this.handleIndex = index ?? 0;
    this.dragging.set(true);
    this.updateBarRect();
    (event.target as HTMLElement).focus();
    event.preventDefault();
    this.bindDragListeners();
  }

  private updateBarRect(): void {
    const rect = (this.el.nativeElement as HTMLElement).getBoundingClientRect();
    this.barRect = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
  }

  private bindDragListeners(): void {
    const move = (event: MouseEvent) => {
      if (!this.dragging()) return;
      this.setValueFromEvent(event);
    };
    const up = (event: MouseEvent) => {
      if (!this.dragging()) return;
      this.dragging.set(false);
      this.emitSlideEnd(event);
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  }

  private calculateHandlePercent(event: MouseEvent): number {
    if (this.orientation() === "horizontal") {
      return ((event.clientX - this.barRect.left) * 100) / this.barRect.width;
    }
    return ((this.barRect.top + this.barRect.height - event.clientY) * 100) / this.barRect.height;
  }

  private setValueFromEvent(event: MouseEvent): void {
    const percent = this.calculateHandlePercent(event);
    const raw = (this.max() - this.min()) * (percent / 100) + this.min();
    this.updateValue(this.applyStep(raw), event);
  }

  protected onBarClick(event: MouseEvent): void {
    if (this.$disabled() || this.dragging()) {
      return;
    }
    const target = event.target as HTMLElement;
    if (target.getAttribute("role") === "slider") {
      return;
    }
    this.updateBarRect();
    this.handleIndex = this.range() ? this.nearestHandleIndex(event) : 0;
    this.setValueFromEvent(event);
    this.emitSlideEnd(event);
  }

  private nearestHandleIndex(event: MouseEvent): number {
    const percent = this.calculateHandlePercent(event);
    const [start, end] = this.handleValues();
    return Math.abs(percent - start) <= Math.abs(percent - end) ? 0 : 1;
  }

  private applyStep(value: number): number {
    const step = this.step();
    if (!step) {
      return Math.floor(value);
    }
    const decimals = this.getDecimalsCount(step);
    const stepped = Math.round(value / step) * step;
    return decimals > 0 ? +stepped.toFixed(decimals) : stepped;
  }

  private getDecimalsCount(value: number): number {
    if (value && Math.floor(value) !== value) {
      return value.toString().split(".")[1]?.length ?? 0;
    }
    return 0;
  }

  private updateValue(value: number, event: Event): void {
    const min = this.min();
    const max = this.max();
    const clamped = Math.min(Math.max(value, min), max);

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
    const step = this.step() ?? 1;
    const current = this.range() ? this.rangeModelValue()[this.handleIndex] : this.singleValue();

    switch (event.key) {
      case "ArrowDown":
      case "ArrowLeft":
        this.updateValue(current - step, event);
        event.preventDefault();
        break;
      case "ArrowUp":
      case "ArrowRight":
        this.updateValue(current + step, event);
        event.preventDefault();
        break;
      case "PageDown":
        this.updateValue(current - (step || 1) * 10, event);
        event.preventDefault();
        break;
      case "PageUp":
        this.updateValue(current + (step || 1) * 10, event);
        event.preventDefault();
        break;
      case "Home":
        this.updateValue(this.min(), event);
        event.preventDefault();
        break;
      case "End":
        this.updateValue(this.max(), event);
        event.preventDefault();
        break;
      default:
        break;
    }
  }

  override writeControlValue(value: unknown, setModelValue: (value: unknown) => void): void {
    setModelValue(value ?? (this.range() ? [this.min(), this.min()] : this.min()));
  }
}
