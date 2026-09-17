import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { UBaseInput, UOverlay } from "@ultimate/ng-core";
import { selectStyleModule } from "./select-style";

export interface USelectChangeEvent {
  originalEvent: Event;
  value: unknown;
}

/**
 * Ultimate-owned adaptation of PrimeNG's `Select` component (see
 * `.vendor-extracted/ng/select/select.ts`). Real source extends
 * `BaseInput<SelectPassThrough>` — confirmed against `export class Select
 * extends BaseInput<...> implements AfterViewInit, AfterViewChecked` — same
 * tier `UAutoComplete`/`UPassword`/`UInputNumber` already extend.
 *
 * Overlay-based: real source's own template composes `p-overlay` (a labeled
 * trigger span plus a hidden dropdown-trigger icon, opening a filterable
 * option-list panel) — this port composes `UOverlay` the same way
 * `UAutoComplete` does (`packages/ng/src/autocomplete/autocomplete.ts`),
 * matching real source's own "trigger + overlay panel with optional filter
 * input + option list" shape.
 *
 * Deliberately excludes real source's much larger surface: grouped options
 * (`group`/`optionGroupLabel`/`optionGroupChildren`), virtual scrolling
 * (`virtualScroll`/`p-scroller`), `editable` free-text mode, checkmark
 * variant, header/footer/item/group/loader `ContentChild` template
 * projection, passthrough (`pt`), `NgModule`, and i18n `TranslationKeys`
 * lookup — matching every sibling component's established "smaller surface
 * than upstream" precedent (same boundary `UAutoComplete` already drew for
 * this same capability family).
 */
@Component({
  standalone: true,
  selector: "u-select",
  imports: [UOverlay],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: USelect, multi: true }],
  template: `
    <span
      #labelEl
      [class]="cx('label', labelClassesParams())"
      role="combobox"
      [attr.id]="inputId()"
      [attr.aria-disabled]="$disabled()"
      [attr.aria-label]="ariaLabel() || (label() === undefined ? undefined : label())"
      [attr.aria-haspopup]="'listbox'"
      [attr.aria-expanded]="overlayVisible()"
      [attr.aria-controls]="overlayVisible() ? id + '_list' : null"
      [attr.tabindex]="$disabled() ? -1 : 0"
      [attr.aria-activedescendant]="
        focusedOptionIndex() !== -1 ? id + '_option_' + focusedOptionIndex() : undefined
      "
      (click)="onContainerClick($event)"
      (keydown)="onKeyDown($event)"
      (focus)="onFocus.emit($event)"
      (blur)="onBlur()"
    >
      {{ label() === undefined ? "&nbsp;" : label() }}
    </span>
    @if (isVisibleClearIcon()) {
      <span [class]="cx('clearIcon')" aria-hidden="true" (click)="clear($event)">&times;</span>
    }
    <div [class]="cx('dropdown')" role="button" aria-hidden="true" (click)="onContainerClick($event)">
      <span aria-hidden="true">&#9662;</span>
    </div>
    @if (renderOverlay()) {
      <div uOverlay [visible]="overlayVisible()" appendTo="body" [class]="cx('overlay')">
        @if (filter()) {
          <div [class]="cx('header')" (click)="$event.stopPropagation()">
            <input
              #filterInput
              type="text"
              role="searchbox"
              autocomplete="off"
              [class]="cx('pcFilter')"
              [value]="filterValue()"
              [attr.placeholder]="filterPlaceholder()"
              [attr.aria-label]="ariaFilterLabel()"
              (input)="onFilterInputChange($event)"
              (keydown)="onFilterKeyDown($event)"
              (click)="$event.stopPropagation()"
            />
          </div>
        }
        <div [class]="cx('listContainer')">
          <ul [class]="cx('list')" role="listbox" [attr.id]="id + '_list'">
            @for (option of visibleOptions(); track $index) {
              <li
                [id]="id + '_option_' + $index"
                role="option"
                [class]="cx('option', optionClassesParams(option, $index))"
                [attr.aria-selected]="isSelected(option)"
                [attr.aria-disabled]="isOptionDisabled(option)"
                (click)="onOptionSelect($event, option)"
                (mouseenter)="!isOptionDisabled(option) && focusedOptionIndex.set($index)"
              >
                {{ getOptionLabel(option) }}
              </li>
            } @empty {
              <li [class]="cx('emptyMessage')" role="option">{{ emptyMessage() }}</li>
            }
          </ul>
        </div>
      </div>
    }
  `,
  host: {
    "[class]": "cx('root', classesParams())",
    "[attr.id]": "id",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class USelect extends UBaseInput {
  protected override readonly componentName = "select";
  protected override readonly styleModule = selectStyleModule;

  /** Available options to choose from. */
  options = input<unknown[]>([]);
  /** Property name or getter function to use as the label of an option. */
  optionLabel = input<string | ((item: unknown) => string)>();
  /** Property name or getter function to use as the value of an option, defaults to the option itself. */
  optionValue = input<string | ((item: unknown) => unknown)>();
  /** Property name or getter function to determine if an option is disabled. */
  optionDisabled = input<string | ((item: unknown) => boolean)>();
  /** Advisory information to display when no option is selected. */
  placeholder = input<string>();
  /** Whether a filter input is displayed in the overlay panel. */
  filter = input(false, { transform: booleanAttribute });
  /** Placeholder text for the filter input. */
  filterPlaceholder = input<string>();
  /** Label for the filter input for accessibility. */
  ariaFilterLabel = input<string>();
  /** Whether a clear icon is displayed to reset the selection. */
  showClear = input(false, { transform: booleanAttribute });
  /** Label of the input for accessibility. */
  ariaLabel = input<string>();
  /** Identifier of the accessible input element. */
  inputId = input<string>();
  /** Text to display when there are no options (or no options match the filter). */
  emptyMessage = input("No results found");

  /** Callback to invoke when the selected value changes. */
  onChange = output<USelectChangeEvent>();
  /** Callback to invoke when the component receives focus. */
  onFocus = output<Event>();
  /** Callback to invoke when the component loses focus. */
  onBlurEmit = output<Event>();
  /** Callback to invoke when the selection is cleared via the clear icon. */
  onClear = output<void>();

  protected readonly id = `u_select_${++USelect.instanceCount}`;
  private static instanceCount = 0;

  protected readonly overlayVisible = signal(false);
  protected readonly focusedOptionIndex = signal(-1);
  protected readonly filterValue = signal("");

  protected readonly renderOverlay = computed(() => this.overlayVisible());

  protected readonly selectedOption = computed(() =>
    this.options().find((option) => this.getOptionValue(option) === this.modelValue())
  );

  protected readonly label = computed(() => {
    const selected = this.selectedOption();
    if (selected !== undefined) {
      return this.getOptionLabel(selected);
    }
    return this.placeholder();
  });

  protected readonly visibleOptions = computed(() => {
    const query = this.filterValue().trim().toLowerCase();
    if (!query) {
      return this.options();
    }
    return this.options().filter((option) => this.getOptionLabel(option).toLowerCase().includes(query));
  });

  protected readonly isVisibleClearIcon = computed(
    () => this.showClear() && this.$filled() && !this.$disabled()
  );

  protected classesParams() {
    return {
      disabled: this.$disabled(),
      filled: this.$filled(),
      fluid: this.hasFluid,
      overlayVisible: this.overlayVisible(),
    };
  }

  protected labelClassesParams() {
    return { placeholder: this.selectedOption() === undefined };
  }

  protected optionClassesParams(option: unknown, index: number) {
    return {
      selected: this.isSelected(option),
      disabled: this.isOptionDisabled(option),
      focused: this.focusedOptionIndex() === index,
    };
  }

  protected getOptionLabel(option: unknown): string {
    const label = this.optionLabel();
    if (typeof label === "function") {
      return label(option);
    }
    if (typeof label === "string" && typeof option === "object" && option !== null) {
      return String((option as Record<string, unknown>)[label] ?? "");
    }
    return String(option);
  }

  protected getOptionValue(option: unknown): unknown {
    const value = this.optionValue();
    if (typeof value === "function") {
      return value(option);
    }
    if (typeof value === "string" && typeof option === "object" && option !== null) {
      return (option as Record<string, unknown>)[value];
    }
    return option;
  }

  protected isOptionDisabled(option: unknown): boolean {
    const disabled = this.optionDisabled();
    if (typeof disabled === "function") {
      return disabled(option);
    }
    if (typeof disabled === "string" && typeof option === "object" && option !== null) {
      return !!(option as Record<string, unknown>)[disabled];
    }
    return false;
  }

  protected isSelected(option: unknown): boolean {
    return this.modelValue() === this.getOptionValue(option);
  }

  protected onContainerClick(event: Event): void {
    if (this.$disabled()) {
      return;
    }
    if (this.overlayVisible()) {
      this.hide();
    } else {
      this.show();
    }
    event.stopPropagation();
  }

  protected onBlur(): void {
    this.onModelTouched();
    this.onBlurEmit.emit(new Event("blur"));
  }

  protected show(): void {
    if (this.$disabled()) {
      return;
    }
    this.overlayVisible.set(true);
    const selectedIndex = this.visibleOptions().findIndex((option) => this.isSelected(option));
    this.focusedOptionIndex.set(selectedIndex);
  }

  protected hide(): void {
    this.overlayVisible.set(false);
    this.focusedOptionIndex.set(-1);
    this.filterValue.set("");
  }

  protected onFilterInputChange(event: Event): void {
    this.filterValue.set((event.target as HTMLInputElement).value);
    this.focusedOptionIndex.set(-1);
  }

  protected onFilterKeyDown(event: KeyboardEvent): void {
    switch (event.code) {
      case "ArrowDown":
        this.moveFocus(1);
        event.preventDefault();
        break;
      case "ArrowUp":
        this.moveFocus(-1);
        event.preventDefault();
        break;
      case "Enter":
      case "NumpadEnter":
        this.selectFocused(event);
        event.preventDefault();
        break;
      case "Escape":
        this.hide();
        event.preventDefault();
        break;
      default:
        break;
    }
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (this.$disabled()) {
      return;
    }
    switch (event.code) {
      case "ArrowDown":
        if (!this.overlayVisible()) {
          this.show();
        } else {
          this.moveFocus(1);
        }
        event.preventDefault();
        break;
      case "ArrowUp":
        if (!this.overlayVisible()) {
          this.show();
        } else {
          this.moveFocus(-1);
        }
        event.preventDefault();
        break;
      case "Home":
        if (this.overlayVisible()) {
          this.focusedOptionIndex.set(0);
          event.preventDefault();
        }
        break;
      case "End":
        if (this.overlayVisible()) {
          this.focusedOptionIndex.set(this.visibleOptions().length - 1);
          event.preventDefault();
        }
        break;
      case "Enter":
      case "NumpadEnter":
      case "Space":
        if (this.overlayVisible()) {
          this.selectFocused(event);
        } else {
          this.show();
        }
        event.preventDefault();
        break;
      case "Escape":
        if (this.overlayVisible()) {
          this.hide();
          event.preventDefault();
        }
        break;
      case "Tab":
        this.hide();
        break;
      default:
        break;
    }
  }

  private moveFocus(delta: 1 | -1): void {
    const options = this.visibleOptions();
    if (options.length === 0) {
      return;
    }
    let next = this.focusedOptionIndex();
    do {
      next = (next + delta + options.length) % options.length;
    } while (this.isOptionDisabled(options[next]) && next !== this.focusedOptionIndex());
    this.focusedOptionIndex.set(next);
  }

  private selectFocused(event: Event): void {
    const index = this.focusedOptionIndex();
    if (index !== -1) {
      const option = this.visibleOptions()[index];
      if (option !== undefined) {
        this.onOptionSelect(event, option);
      }
    }
  }

  protected onOptionSelect(event: Event, option: unknown): void {
    if (this.isOptionDisabled(option)) {
      return;
    }
    const value = this.getOptionValue(option);
    this.writeModelValue(value);
    this.onModelChange(value);
    this.onModelTouched();
    this.onChange.emit({ originalEvent: event, value });
    this.hide();
  }

  protected clear(event: Event): void {
    event.stopPropagation();
    this.writeModelValue(null);
    this.onModelChange(null);
    this.onClear.emit();
  }

  override writeControlValue(value: unknown, setModelValue: (value: unknown) => void): void {
    setModelValue(value);
  }
}
