import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  numberAttribute,
  input,
  output,
  signal,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { UBaseEditableHolder } from "@ultimate/ng-core";
import { ratingStyleModule } from "./rating-style";

export interface URatingRateEvent {
  originalEvent: Event;
  value: number | null;
}

/**
 * Ultimate-owned adaptation of PrimeNG's `Rating` component (see
 * `.vendor-extracted/ng/rating/rating.ts`). Real source extends
 * `BaseEditableHolder<RatingPassThrough>` — confirmed against `export class
 * Rating extends BaseEditableHolder<...>` — same tier `USelectButton`/
 * `UToggleButton`/`UCheckbox` already extend, not `UBaseInput`.
 *
 * NOT overlay-based — real source renders a flat row of star options, each a
 * hidden radio input plus an on/off SVG icon, no panel/dropdown.
 *
 * Deliberately excludes real source's much larger surface: `cancel`
 * icon/clear affordance, icon/style-class overrides, custom icon template
 * projection, passthrough (`pt`), and `NgModule` — matching every sibling
 * component's established "smaller surface than upstream" precedent.
 */
@Component({
  standalone: true,
  selector: "u-rating",
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: URating, multi: true }],
  template: `
    @for (star of starsArray(); track star) {
      <div
        [class]="cx('option', optionClassesParams(star))"
        (click)="onOptionClick($event, star + 1)"
      >
        <span class="p-hidden-accessible">
          <input
            type="radio"
            [value]="star + 1"
            [attr.name]="name()"
            [attr.disabled]="$disabled() ? '' : undefined"
            [attr.readonly]="readonly() ? '' : undefined"
            [checked]="modelValue() === star + 1"
            [attr.aria-label]="starAriaLabel(star + 1)"
            (focus)="onInputFocus(star + 1)"
            (blur)="onInputBlur()"
            (change)="onOptionSelect($event, star + 1)"
            (keydown)="onStarKeyDown($event, star + 1)"
          />
        </span>
        @if (star + 1 <= currentValue()) {
          <svg data-p-icon="star-fill" [class]="cx('onIcon')" viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M13.7275 5.60186L10.1567 5.08035L8.55575 1.84987C8.46698 1.66934 8.31998 1.52234 8.13945 1.43357C7.68706 1.21151 7.13781 1.39957 6.91242 1.85615L5.31146 5.08035L1.74069 5.60186C1.53986 5.63108 1.35608 5.72729 1.21674 5.87225C1.05091 6.04559 0.959336 6.27689 0.962197 6.51684C0.965058 6.75679 1.06212 6.98585 1.23202 7.15516L3.81714 9.71473L3.20437 13.2856C3.17608 13.4489 3.19442 13.6168 3.25725 13.7702C3.32008 13.9236 3.42482 14.0564 3.55949 14.1533C3.69416 14.2503 3.85335 14.3075 4.01898 14.3184C4.18461 14.3293 4.34995 14.2934 4.49629 14.2148L7.68706 12.5323L10.8778 14.2148C11.0596 14.3117 11.2696 14.3442 11.4722 14.307C11.6748 14.2698 11.859 14.164 11.9994 14.0064C12.1398 13.8489 12.2284 13.6484 12.2532 13.4353C12.278 13.2222 12.2382 13.0071 12.1382 12.8177L11.5254 9.24688L14.1106 6.68731C14.2537 6.51739 14.3379 6.30696 14.3546 6.08768C14.3714 5.86841 14.3196 5.64738 14.2032 5.4602C14.0868 5.27302 13.9118 5.12924 13.7057 5.05146C13.5657 4.99966 13.4183 4.98039 13.2727 4.99539C13.4236 4.99539 13.5735 5.01816 13.7275 5.05146V5.60186Z"
            />
          </svg>
        } @else {
          <svg data-p-icon="star" [class]="cx('offIcon')" viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M14.4818 5.60186L10.9614 5.08035L9.38285 1.85615C9.29457 1.67535 9.14762 1.52798 8.96725 1.43892C8.51559 1.2153 7.96562 1.40318 7.73925 1.85615L6.16068 5.08035L2.6403 5.60186C2.44025 5.63095 2.25716 5.72711 2.1181 5.87184C1.95254 6.0448 1.86121 6.27568 1.86407 6.51518C1.86693 6.75467 1.96377 6.98332 2.13345 7.15224L4.68351 9.69927L4.07766 13.2469C4.04944 13.4102 4.06767 13.5781 4.13032 13.7315C4.19298 13.8848 4.29744 14.0175 4.43179 14.1144C4.56614 14.2113 4.72495 14.2685 4.89017 14.2794C5.0554 14.2903 5.22035 14.2545 5.36628 14.1759L8.55575 12.5033L11.7452 14.1759C11.9265 14.2726 12.136 14.3049 12.3382 14.2677C12.5405 14.2305 12.7242 14.1249 12.8644 13.9676C13.0046 13.8102 13.0932 13.6099 13.118 13.397C13.1427 13.184 13.1031 12.9691 13.0033 12.7797L12.3975 9.23202L14.9457 6.68499C15.0894 6.51492 15.1783 6.30454 15.1951 6.08517C15.2118 5.86579 15.1598 5.64672 15.0436 5.4595C14.9271 5.27228 14.7519 5.12856 14.5455 5.05094C14.4051 4.99902 14.2572 4.97975 14.111 4.99479C14.2354 4.99479 14.3597 5.00436 14.4818 5.02351V5.60186Z"
            />
          </svg>
        }
      </div>
    }
  `,
  host: {
    "[class]": "cx('root', classesParams())",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class URating extends UBaseEditableHolder {
  protected override readonly componentName = "rating";
  protected override readonly styleModule = ratingStyleModule;

  /** When present, changing the value is not possible. */
  readonly = input(false, { transform: booleanAttribute });
  /** Number of stars. */
  stars = input(5, { transform: numberAttribute });
  /** Name of the underlying radio group (defaults to a generated id). */
  name = input<string>();

  /** Emitted on value change. */
  onRate = output<URatingRateEvent>();
  /** Emitted when the rating receives focus. */
  onFocus = output<FocusEvent>();
  /** Emitted when the rating loses focus. */
  onBlur = output<FocusEvent>();

  protected readonly focusedOptionIndex = signal(-1);

  protected readonly starsArray = () => Array.from({ length: this.stars() }, (_, i) => i);

  protected readonly currentValue = () => {
    const value = this.modelValue();
    return typeof value === "number" ? value : 0;
  };

  protected classesParams() {
    return { disabled: this.$disabled() };
  }

  protected optionClassesParams(star: number) {
    return { focused: this.focusedOptionIndex() === star + 1 };
  }

  protected onOptionClick(event: Event, value: number): void {
    if (this.readonly() || this.$disabled()) {
      return;
    }
    this.onOptionSelect(event, value);
  }

  protected onOptionSelect(event: Event, value: number): void {
    if (this.readonly() || this.$disabled()) {
      return;
    }
    const newValue = this.modelValue() === value ? null : value;
    this.focusedOptionIndex.set(newValue === null ? -1 : value);
    this.writeModelValue(newValue);
    this.onModelChange(newValue);
    this.onModelTouched();
    this.onRate.emit({ originalEvent: event, value: newValue });
  }

  protected onInputFocus(value: number): void {
    if (this.readonly() || this.$disabled()) {
      return;
    }
    this.focusedOptionIndex.set(value);
    this.onFocus.emit(new FocusEvent("focus"));
  }

  protected onInputBlur(): void {
    this.focusedOptionIndex.set(-1);
    this.onBlur.emit(new FocusEvent("blur"));
  }

  /**
   * Left/Up moves to the previous star, Right/Down to the next (wrapping),
   * matching real PrimeReact's own `onStarKeyDown` arrow-key stepping — real
   * PrimeNG source has no equivalent handler (relies on native radio-group
   * arrow behavior), but this batch's task requires explicit keyboard
   * arrow-key stepping for Rating, so this port adds the same stepping
   * PrimeReact's sibling realization already establishes for this same
   * capability.
   */
  protected onStarKeyDown(event: KeyboardEvent, value: number): void {
    if (this.readonly() || this.$disabled()) {
      return;
    }
    switch (event.key) {
      case "Enter":
      case " ":
        this.onOptionSelect(event, value);
        event.preventDefault();
        break;
      case "ArrowLeft":
      case "ArrowUp": {
        event.preventDefault();
        const stars = this.stars();
        const prev = this.modelValue() ? (this.modelValue() as number) - 1 : stars;
        this.onOptionSelect(event, prev < 1 ? stars : prev);
        break;
      }
      case "ArrowRight":
      case "ArrowDown": {
        event.preventDefault();
        const stars = this.stars();
        const next = this.modelValue() ? (this.modelValue() as number) + 1 : 1;
        this.onOptionSelect(event, next > stars ? 1 : next);
        break;
      }
      default:
        break;
    }
  }

  protected starAriaLabel(value: number): string {
    return value === 1 ? "1 star" : `${value} stars`;
  }

  override writeControlValue(value: unknown, setModelValue: (value: unknown) => void): void {
    setModelValue(value);
  }
}
