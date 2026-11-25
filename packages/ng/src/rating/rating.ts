import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  numberAttribute,
  output,
  signal,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { UBaseEditableHolder, UBind, U_PARENT_INSTANCE } from "@ultimate/ng-core";
import { UAutoFocus } from "@ultimate/ng/autofocus";
import { uuid } from "@ultimate/uix-utils/uuid";
import { RATING_STAR_FILL_PATH, RATING_STAR_PATH } from "./rating-icons";
import { ratingStyleModule } from "./rating-style";

export interface URatingRateEvent {
  originalEvent: Event;
  value: number | null;
}

/** Context passed to the `#onicon` and `#officon` templates. */
export interface URatingIconTemplateContext {
  /** Value of the star the icon belongs to. */
  $implicit: number;
  /** Classes the default icon would carry. */
  class: string | undefined;
}

/**
 * Ultimate-owned adaptation of PrimeNG's `Rating` component (see
 * `.vendor-extracted/ng/rating/rating.ts`). Extends `UBaseEditableHolder`, the
 * tier PrimeNG's `Rating` extends, and renders a flat row of star options, each
 * a visually hidden native radio plus an on or off icon.
 *
 * Keyboard use is the native radio group, as in PrimeNG: Tab reaches the
 * group, the arrow keys move to the next or previous star and select it, and
 * Space selects the focused star. Every radio shares one group name, `name`
 * or a generated one. A native change only ever selects; clicking the
 * selected star with a pointer clears the value. A click moves focus to the
 * star's radio, and the focus ring shows only for keyboard focus.
 *
 * The radios carry `required`, `aria-invalid` and `autofocus` (on the
 * selected star, or the first one). `readonly` blocks user edits. `onFocus`
 * and `onBlur` emit the native events, and `onRate` emits the event with the
 * new value. `#onicon` and `#officon` templates, or `iconOnClass`/`iconOnStyle`
 * and `iconOffClass`/`iconOffStyle`, replace the default star icons.
 *
 * `pt`, `unstyled` and `dt` come from `UBaseComponent`. The root section is
 * bound through the `UBind` host directive, the component provides itself as
 * `U_PARENT_INSTANCE`, and `option`, `hiddenOptionInputContainer`,
 * `hiddenOptionInput`, `onIcon` and `offIcon` bind their own sections. The
 * CSS is the shared `@ultimate/uix-styles/rating` module.
 *
 * Deliberately excludes PrimeNG's clearing on a keyboard change (it would
 * clear while arrowing), its `PrimeTemplate` lookup, its locale-driven star
 * labels (no core locale surface; the labels stay English), and the
 * `$pcRating` instance token, which has no consumer; each is recorded in the
 * Rating ADR.
 */
@Component({
  standalone: true,
  selector: "u-rating",
  imports: [NgTemplateOutlet, UBind, UAutoFocus],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: URating, multi: true },
    { provide: U_PARENT_INSTANCE, useExisting: URating },
  ],
  template: `
    @for (star of starsArray(); track star) {
      <div
        [uBind]="ptm('option', optionPtParams(star + 1))"
        [class]="cx('option', optionClassesParams(star + 1))"
        [attr.data-p-active]="star + 1 <= currentValue()"
        [attr.data-p-focused]="star + 1 === focusedOptionIndex()"
        (click)="onOptionClick($event, star + 1)"
      >
        <span
          class="u-hidden-accessible"
          [attr.data-p-hidden-accessible]="true"
          [uBind]="ptm('hiddenOptionInputContainer')"
        >
          <input
            type="radio"
            [uBind]="ptm('hiddenOptionInput')"
            [value]="star + 1"
            [attr.name]="groupName()"
            [disabled]="$disabled()"
            [attr.readonly]="readonly() ? '' : null"
            [attr.required]="required() ? '' : null"
            [checked]="currentValue() === star + 1"
            [attr.aria-label]="starAriaLabel(star + 1)"
            [attr.aria-invalid]="invalid() ? 'true' : null"
            [uAutoFocus]="autofocus() && star + 1 === autofocusStar()"
            (focus)="onInputFocus($event, star + 1)"
            (blur)="onInputBlur($event)"
            (change)="onChange($event, star + 1)"
          />
        </span>
        @if (star + 1 <= currentValue()) {
          @if (onIconTemplate(); as template) {
            <ng-container
              [ngTemplateOutlet]="template"
              [ngTemplateOutletContext]="{
                $implicit: star + 1,
                class: cx('onIcon', iconClassesParams()),
              }"
            ></ng-container>
          } @else if (iconOnClass()) {
            <span
              [uBind]="ptm('onIcon')"
              [class]="classList(cx('onIcon', iconClassesParams()), iconOnClass())"
              [style]="iconOnStyle()"
            ></span>
          } @else {
            <svg
              data-p-icon="star-fill"
              [uBind]="ptm('onIcon')"
              [class]="cx('onIcon', iconClassesParams())"
              [style]="iconOnStyle()"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path [attr.d]="starFillPath" fill="currentColor" />
            </svg>
          }
        } @else {
          @if (offIconTemplate(); as template) {
            <ng-container
              [ngTemplateOutlet]="template"
              [ngTemplateOutletContext]="{
                $implicit: star + 1,
                class: cx('offIcon', iconClassesParams()),
              }"
            ></ng-container>
          } @else if (iconOffClass()) {
            <span
              [uBind]="ptm('offIcon')"
              [class]="classList(cx('offIcon', iconClassesParams()), iconOffClass())"
              [style]="iconOffStyle()"
            ></span>
          } @else {
            <svg
              data-p-icon="star"
              [uBind]="ptm('offIcon')"
              [class]="cx('offIcon', iconClassesParams())"
              [style]="iconOffStyle()"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path [attr.d]="starPath" fill="currentColor" />
            </svg>
          }
        }
      </div>
    }
  `,
  host: {
    "[class]": "cx('root', classesParams())",
    "[attr.data-p]": "dataP()",
  },
  hostDirectives: [UBind],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class URating extends UBaseEditableHolder {
  protected override readonly componentName = "rating";
  protected override readonly styleModule = ratingStyleModule;

  private readonly bindDirective = inject(UBind, { self: true });
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** When present, changing the value is not possible. */
  readonly = input(false, { transform: booleanAttribute });
  /** Number of stars. */
  stars = input(5, { transform: numberAttribute });
  /** Name of the radio group; a generated name is used when omitted. */
  name = input<string>();
  /** Marks the radios as required. */
  required = input(false, { transform: booleanAttribute });
  /** Shows the invalid state. */
  invalid = input(false, { transform: booleanAttribute });
  /** Focuses the selected star, or the first one, on load. */
  autofocus = input(false, { transform: booleanAttribute });
  /** Class of the on icon; renders a `span` instead of the default star. */
  iconOnClass = input<string>();
  /** Inline style of the on icon. */
  iconOnStyle = input<Record<string, string> | null>();
  /** Class of the off icon; renders a `span` instead of the default star. */
  iconOffClass = input<string>();
  /** Inline style of the off icon. */
  iconOffStyle = input<Record<string, string> | null>();

  /** Emitted on value change. */
  onRate = output<URatingRateEvent>();
  /** Emitted when a star receives focus, with the native event. */
  onFocus = output<FocusEvent>();
  /** Emitted when a star loses focus, with the native event. */
  onBlur = output<FocusEvent>();

  /** Template that replaces the on icon, written as `<ng-template #onicon let-value let-class="class">`. */
  protected readonly onIconTemplate =
    contentChild<TemplateRef<URatingIconTemplateContext>>("onicon");
  /** Template that replaces the off icon, written as `<ng-template #officon let-value let-class="class">`. */
  protected readonly offIconTemplate =
    contentChild<TemplateRef<URatingIconTemplateContext>>("officon");

  protected readonly starPath = RATING_STAR_PATH;
  protected readonly starFillPath = RATING_STAR_FILL_PATH;

  protected readonly focusedOptionIndex = signal(-1);
  protected readonly isFocusVisibleItem = signal(true);
  private focusFromPointer = false;
  private readonly generatedName = `${uuid("u_id_")}_name`;

  protected readonly starsArray = computed(() =>
    Array.from({ length: this.stars() }, (_, index) => index)
  );

  protected readonly currentValue = computed(() => {
    const value = this.modelValue();
    return typeof value === "number" ? value : 0;
  });

  protected readonly groupName = computed(() => this.name() || this.generatedName);

  protected readonly autofocusStar = computed(() => this.currentValue() || 1);

  protected readonly dataP = computed(() => {
    const flags = [this.readonly() ? "readonly" : "", this.$disabled() ? "disabled" : ""].filter(
      Boolean
    );
    return flags.length ? flags.join(" ") : null;
  });

  ngAfterViewChecked(): void {
    this.bindDirective.setAttrs(this.ptms(["host", "root"]));
  }

  protected classesParams() {
    return { readonly: this.readonly(), disabled: this.$disabled() };
  }

  protected optionClassesParams(value: number) {
    return {
      active: value <= this.currentValue(),
      focusVisible: value === this.focusedOptionIndex() && this.isFocusVisibleItem(),
    };
  }

  protected optionPtParams(value: number) {
    return {
      context: {
        active: value <= this.currentValue(),
        focused: value === this.focusedOptionIndex(),
      },
    };
  }

  protected iconClassesParams() {
    return { invalid: this.invalid() };
  }

  protected classList(...parts: (string | undefined)[]): string {
    return parts.filter(Boolean).join(" ");
  }

  private get editable(): boolean {
    return !this.readonly() && !this.$disabled();
  }

  /** Pointer selection on the star; clicking the selected star clears the value. */
  protected onOptionClick(event: MouseEvent, value: number): void {
    if (!this.editable || (event.target as Element | null)?.tagName === "INPUT") {
      return;
    }
    this.select(event, value === this.currentValue() ? null : value);
    const radio = (event.currentTarget as HTMLElement).querySelector<HTMLInputElement>(
      "input:not([disabled])"
    );
    this.focusFromPointer = true;
    radio?.focus();
    this.focusFromPointer = false;
    this.isFocusVisibleItem.set(false);
  }

  /** Native radio change (arrow keys, Space, assistive technology); it only selects. */
  protected onChange(event: Event, value: number): void {
    if (!this.editable) {
      this.syncRadios();
      return;
    }
    this.select(event, value);
    this.isFocusVisibleItem.set(true);
  }

  protected onInputFocus(event: FocusEvent, value: number): void {
    if (!this.editable) {
      return;
    }
    this.focusedOptionIndex.set(value);
    this.isFocusVisibleItem.set(!this.focusFromPointer);
    this.onFocus.emit(event);
  }

  protected onInputBlur(event: FocusEvent): void {
    this.focusedOptionIndex.set(-1);
    this.onBlur.emit(event);
  }

  protected starAriaLabel(value: number): string {
    return value === 1 ? "1 star" : `${value} stars`;
  }

  override writeControlValue(value: unknown, setModelValue: (value: unknown) => void): void {
    setModelValue(value);
  }

  private select(event: Event, value: number | null): void {
    this.focusedOptionIndex.set(value === null ? -1 : value);
    this.writeModelValue(value);
    this.onModelChange(value);
    this.onModelTouched();
    this.onRate.emit({ originalEvent: event, value });
  }

  /** Puts the native checked state back on the model after a blocked change. */
  private syncRadios(): void {
    const radios = this.host.nativeElement.querySelectorAll<HTMLInputElement>("input[type=radio]");
    radios.forEach((radio, index) => (radio.checked = index + 1 === this.currentValue()));
  }
}
