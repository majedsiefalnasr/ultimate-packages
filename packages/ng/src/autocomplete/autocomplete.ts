import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  numberAttribute,
  output,
  signal,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { UBaseInput, UOverlay } from "@ultimate/ng-core";
import { autoCompleteStyleModule } from "./autocomplete-style";

export interface UAutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}

export interface UAutoCompleteSelectEvent {
  originalEvent: Event;
  value: unknown;
}

/**
 * Ultimate-owned adaptation of PrimeNG's `AutoComplete` component (see
 * `.vendor-extracted/ng/autocomplete/autocomplete.ts`). Real source extends
 * `BaseInput` directly (`export class AutoComplete extends
 * BaseInput<AutoCompletePassThrough>`) — same tier `UPassword`/
 * `UInputNumber` already prove.
 *
 * Renders a single native `<input>` plus an overlay-based suggestion list,
 * composed via `UOverlay` (same foundation primitive `UDialog`/`UPassword`
 * compose). Real source's `completeMethod` `@Output` (`EventEmitter<{
 * originalEvent, query }>`) drives an externally-supplied `suggestions`
 * `@Input` array — this port keeps that exact "consumer owns the async
 * search, component owns the overlay/list/keyboard-nav" contract, matching
 * real source's own `search()`/`completeMethod.emit()`/`suggestions`
 * relationship verbatim (`autocomplete.ts` lines ~1632-1641).
 *
 * Keyboard navigation (`onArrowDownKey`/`onArrowUpKey`/`onEnterKey`/
 * `onEscapeKey`) ports real source's `focusedOptionIndex`
 * signal-driven index walk exactly (`autocomplete.ts` lines ~1426-1545),
 * scoped to the non-multiple, non-grouped, non-virtual-scroll path.
 *
 * Deliberately excludes real source's much larger surface: `multiple`
 * selection (chip list, `p-chip` composition, separator-key handling),
 * `group`ed options, `virtualScroll`/`p-scroller` composition, `dropdown`
 * button, header/footer/item/group/loader `ContentChild` template
 * projection, passthrough (`pt`), `NgModule`, `forceSelection`,
 * `autoOptionFocus`/`selectOnFocus`/`focusOnHover`, and i18n
 * `TranslationKeys` lookup — matching every sibling component's established
 * "smaller surface than upstream" precedent. A future task can extend this
 * component's surface toward the full multi-select/grouped/virtualized
 * shape.
 */
@Component({
  standalone: true,
  selector: "u-autocomplete",
  imports: [UOverlay],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: UAutoComplete, multi: true }],
  template: `
    <input
      #input
      type="text"
      role="combobox"
      aria-autocomplete="list"
      [class]="cx('pcInputText')"
      [value]="inputValue()"
      [attr.placeholder]="placeholder()"
      [attr.id]="inputId()"
      [attr.disabled]="$disabled() ? '' : undefined"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-expanded]="overlayVisible()"
      [attr.aria-activedescendant]="
        focusedOptionIndex() !== -1 ? id + '_option_' + focusedOptionIndex() : null
      "
      (input)="onInput($event)"
      (keydown)="onKeyDown($event)"
      (focus)="onInputFocus()"
      (blur)="onInputBlur()"
    />
    @if (loading()) {
      <span [class]="cx('loader')" aria-hidden="true">&hellip;</span>
    }
    @if (renderOverlay()) {
      <div uOverlay [visible]="overlayVisible()" appendTo="body" [class]="cx('overlay')">
        <ul [class]="cx('list')" role="listbox" [attr.id]="id + '_list'">
          @for (option of suggestions(); track $index) {
            <li
              [id]="id + '_option_' + $index"
              role="option"
              [class]="cx('option', optionClassesParams($index))"
              [attr.aria-selected]="isSelected(option)"
              (click)="onOptionSelect($event, option)"
              (mouseenter)="focusedOptionIndex.set($index)"
            >
              {{ getOptionLabel(option) }}
            </li>
          } @empty {
            @if (showEmptyMessage()) {
              <li [class]="cx('emptyMessage')" role="option">{{ emptyMessage() }}</li>
            }
          }
        </ul>
      </div>
    }
  `,
  host: {
    "[class]": "cx('root', classesParams())",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UAutoComplete extends UBaseInput {
  protected override readonly componentName = "autocomplete";
  protected override readonly styleModule = autoCompleteStyleModule;

  /** Suggestions list to display in the overlay — populated by the consumer's `completeMethod` handler. */
  suggestions = input<unknown[]>([]);
  /** Property name or getter function to use as the label of an option. */
  optionLabel = input<string | ((item: unknown) => string)>();
  /** Minimum number of characters to type before triggering `completeMethod`. */
  minLength = input(1, { transform: numberAttribute });
  /** Delay, in milliseconds, before triggering `completeMethod` after typing stops. */
  delay = input(300, { transform: numberAttribute });
  /** Label of the input for accessibility. */
  ariaLabel = input<string>();
  /** Identifier of the accessible input element. */
  inputId = input<string>();
  /** Advisory information to display on input. */
  placeholder = input<string>();
  /** Loading state — shows a loader indicator. */
  loading = input(false, { transform: booleanAttribute });
  /** Text to display when there are no suggestions and the panel is open. */
  emptyMessage = input("No results found");
  /** Whether to show the empty message when there are no suggestions. */
  showEmptyMessage = input(true, { transform: booleanAttribute });

  /** Callback to invoke to search for suggestions — the consumer populates `suggestions` in response. */
  completeMethod = output<UAutoCompleteCompleteEvent>();
  /** Callback to invoke when a suggestion is selected. */
  onSelect = output<UAutoCompleteSelectEvent>();
  /** Callback to invoke when the component receives focus. */
  onFocus = output<Event>();
  /** Callback to invoke when the component loses focus. */
  onBlur = output<Event>();
  /** Callback to invoke when the input is cleared. */
  onClear = output<void>();

  @ViewChild("input") private inputRef?: ElementRef<HTMLInputElement>;

  private static instanceCount = 0;
  protected readonly id = `u_autocomplete_${++UAutoComplete.instanceCount}`;

  protected readonly overlayVisible = signal(false);
  protected readonly focusedOptionIndex = signal(-1);
  private searchTimeout: ReturnType<typeof setTimeout> | undefined;

  protected readonly renderOverlay = computed(() => this.overlayVisible());

  protected readonly inputValue = computed(() => this.getOptionLabel(this.modelValue()));

  protected classesParams() {
    return {
      filled: this.$filled(),
      fluid: this.hasFluid,
      disabled: this.$disabled(),
    };
  }

  protected optionClassesParams(index: number) {
    return { focused: this.focusedOptionIndex() === index };
  }

  protected getOptionLabel(option: unknown): string {
    if (option == null) {
      return "";
    }
    const label = this.optionLabel();
    if (typeof label === "function") {
      return label(option);
    }
    if (typeof label === "string" && typeof option === "object") {
      return String((option as Record<string, unknown>)[label] ?? "");
    }
    return typeof option === "string" ? option : String(option);
  }

  protected isSelected(option: unknown): boolean {
    return this.modelValue() === option;
  }

  protected onInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value;

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    if (query.length === 0) {
      this.writeModelValue(null);
      this.onModelChange(null);
      this.onClear.emit();
      this.hide();
      return;
    }

    if (query.length >= this.minLength()) {
      this.focusedOptionIndex.set(-1);
      this.searchTimeout = setTimeout(() => {
        this.completeMethod.emit({ originalEvent: event, query });
        this.overlayVisible.set(true);
      }, this.delay());
    } else {
      this.hide();
    }
  }

  protected onInputFocus(): void {
    this.onFocus.emit(new Event("focus"));
  }

  protected onInputBlur(): void {
    this.onModelTouched();
    this.hide();
    this.onBlur.emit(new Event("blur"));
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (this.$disabled()) {
      event.preventDefault();
      return;
    }
    switch (event.code) {
      case "ArrowDown":
        this.onArrowDownKey(event);
        break;
      case "ArrowUp":
        this.onArrowUpKey(event);
        break;
      case "Enter":
      case "NumpadEnter":
        this.onEnterKey(event);
        break;
      case "Escape":
        this.onEscapeKey(event);
        break;
      default:
        break;
    }
  }

  private onArrowDownKey(event: KeyboardEvent): void {
    if (!this.overlayVisible()) {
      return;
    }
    const count = this.suggestions().length;
    const next = this.focusedOptionIndex() + 1 >= count ? 0 : this.focusedOptionIndex() + 1;
    this.focusedOptionIndex.set(next);
    event.preventDefault();
  }

  private onArrowUpKey(event: KeyboardEvent): void {
    if (!this.overlayVisible()) {
      return;
    }
    const count = this.suggestions().length;
    const prev = this.focusedOptionIndex() <= 0 ? count - 1 : this.focusedOptionIndex() - 1;
    this.focusedOptionIndex.set(prev);
    event.preventDefault();
  }

  private onEnterKey(event: KeyboardEvent): void {
    if (!this.overlayVisible()) {
      return;
    }
    const index = this.focusedOptionIndex();
    if (index !== -1) {
      this.onOptionSelect(event, this.suggestions()[index]);
    }
    event.preventDefault();
  }

  private onEscapeKey(event: KeyboardEvent): void {
    if (this.overlayVisible()) {
      this.hide();
      event.preventDefault();
    }
  }

  protected onOptionSelect(event: Event, option: unknown): void {
    this.writeModelValue(option);
    this.onModelChange(option);
    if (this.inputRef) {
      this.inputRef.nativeElement.value = this.getOptionLabel(option);
    }
    this.onSelect.emit({ originalEvent: event, value: option });
    this.hide();
  }

  private hide(): void {
    this.overlayVisible.set(false);
    this.focusedOptionIndex.set(-1);
  }

  override writeControlValue(value: unknown, setModelValue: (value: unknown) => void): void {
    setModelValue(value);
    if (this.inputRef) {
      this.inputRef.nativeElement.value = this.getOptionLabel(value);
    }
  }
}
