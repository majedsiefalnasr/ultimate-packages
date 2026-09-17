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
import { UBaseEditableHolder, UOverlay } from "@ultimate/ng-core";
import { multiSelectStyleModule } from "./multi-select-style";

export interface UMultiSelectChangeEvent {
  originalEvent: Event;
  value: unknown[];
}

/**
 * Ultimate-owned adaptation of PrimeNG's `MultiSelect` component (see
 * `.vendor-extracted/ng/multiselect/multiselect.ts`). Real source extends
 * `BaseEditableHolder<MultiSelectPassThrough>` — confirmed against `export
 * class MultiSelect extends BaseEditableHolder<...>` — NOT `BaseInput`,
 * unlike `Select`/this batch's sibling single-select capability. Same tier
 * `USelectButton`/`UToggleButton`/`UCheckbox` already extend.
 *
 * Overlay-based: real source's own template composes a trigger (label +
 * dropdown icon) plus a filterable, checkbox-per-option panel with a
 * "select all" header checkbox — this port composes `UOverlay` the same way
 * `USelect`/`UAutoComplete` do, matching real source's own shape. Unlike
 * `USelect`, selecting an option does NOT close the overlay (real source's
 * own `onOptionSelect` never calls `hide()` — matching `multiselect.ts`
 * lines ~1403-1420, only `Enter`/outside-click/`Escape` close it).
 *
 * `modelValue` is an array (or `null`/empty array when nothing is
 * selected), matching real source's own array-valued model exactly.
 *
 * Deliberately excludes real source's much larger surface: grouped options,
 * virtual scrolling, chip-display mode, range selection (Shift-click),
 * `selectionLimit`, header/footer/item template projection, passthrough
 * (`pt`), and `NgModule` — matching every sibling component's established
 * "smaller surface than upstream" precedent.
 */
@Component({
  standalone: true,
  selector: "u-multi-select",
  imports: [UOverlay],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: UMultiSelect, multi: true }],
  template: `
    <span
      #labelEl
      [class]="cx('label', labelClassesParams())"
      role="combobox"
      [attr.id]="inputId()"
      [attr.aria-disabled]="$disabled()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-haspopup]="'listbox'"
      [attr.aria-expanded]="overlayVisible()"
      [attr.tabindex]="$disabled() ? -1 : 0"
      (click)="onContainerClick($event)"
      (keydown)="onKeyDown($event)"
      (focus)="onFocus.emit($event)"
      (blur)="onBlur()"
    >
      {{ label() }}
    </span>
    @if (isVisibleClearIcon()) {
      <span [class]="cx('clearIcon')" aria-hidden="true" (click)="clear($event)">&times;</span>
    }
    <div [class]="cx('dropdown')" role="button" aria-hidden="true" (click)="onContainerClick($event)">
      <span aria-hidden="true">&#9662;</span>
    </div>
    @if (renderOverlay()) {
      <div uOverlay [visible]="overlayVisible()" appendTo="body" [class]="cx('overlay')">
        <div [class]="cx('header')" (click)="$event.stopPropagation()">
          @if (showToggleAll()) {
            <input
              type="checkbox"
              aria-label="Select All"
              [checked]="allSelected()"
              (change)="toggleAll()"
            />
          }
          @if (filter()) {
            <input
              #filterInput
              type="text"
              role="searchbox"
              autocomplete="off"
              [class]="cx('pcFilter')"
              [value]="filterValue()"
              [attr.placeholder]="filterPlaceholder()"
              (input)="onFilterInputChange($event)"
              (keydown)="onFilterKeyDown($event)"
              (click)="$event.stopPropagation()"
            />
          }
        </div>
        <div [class]="cx('listContainer')">
          <ul [class]="cx('list')" role="listbox" [attr.aria-multiselectable]="true">
            @for (option of visibleOptions(); track $index) {
              <li
                role="option"
                [class]="cx('option', optionClassesParams(option, $index))"
                [attr.aria-selected]="isSelected(option)"
                [attr.aria-disabled]="isOptionDisabled(option)"
                (click)="onOptionSelect($event, option)"
                (mouseenter)="!isOptionDisabled(option) && focusedOptionIndex.set($index)"
              >
                <input type="checkbox" [checked]="isSelected(option)" [disabled]="isOptionDisabled(option)" tabindex="-1" />
                <span>{{ getOptionLabel(option) }}</span>
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
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UMultiSelect extends UBaseEditableHolder {
  protected override readonly componentName = "multi-select";
  protected override readonly styleModule = multiSelectStyleModule;

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
  /** Whether a clear icon is displayed to reset the selection. */
  showClear = input(false, { transform: booleanAttribute });
  /** Whether the "select all" header checkbox is displayed. */
  showToggleAll = input(true, { transform: booleanAttribute });
  /** Label of the input for accessibility. */
  ariaLabel = input<string>();
  /** Identifier of the accessible input element. */
  inputId = input<string>();
  /** Text to display when there are no options (or no options match the filter). */
  emptyMessage = input("No results found");
  /** Maximum number of selected labels to display before summarizing (e.g. "3 items selected"). */
  maxSelectedLabels = input<number>(3);
  /** Text template for the summarized-selection label; `{0}` is replaced by the selected count. */
  selectedItemsLabel = input("{0} items selected");

  /** Callback to invoke when the selection changes. */
  onChange = output<UMultiSelectChangeEvent>();
  /** Callback to invoke when the component receives focus. */
  onFocus = output<Event>();
  /** Callback to invoke when the component loses focus. */
  onBlurEmit = output<Event>();
  /** Callback to invoke when the selection is cleared via the clear icon. */
  onClear = output<void>();

  protected readonly overlayVisible = signal(false);
  protected readonly focusedOptionIndex = signal(-1);
  protected readonly filterValue = signal("");

  protected readonly renderOverlay = computed(() => this.overlayVisible());

  private readonly selectedValues = computed(() => {
    const value = this.modelValue();
    return Array.isArray(value) ? value : [];
  });

  protected readonly visibleOptions = computed(() => {
    const query = this.filterValue().trim().toLowerCase();
    if (!query) {
      return this.options();
    }
    return this.options().filter((option) => this.getOptionLabel(option).toLowerCase().includes(query));
  });

  protected readonly allSelected = computed(() => {
    const options = this.visibleOptions().filter((option) => !this.isOptionDisabled(option));
    return options.length > 0 && options.every((option) => this.isSelected(option));
  });

  protected readonly label = computed(() => {
    const selected = this.selectedValues();
    if (selected.length === 0) {
      return this.placeholder() ?? "";
    }
    const max = this.maxSelectedLabels();
    if (selected.length > max) {
      return this.selectedItemsLabel().replace("{0}", String(selected.length));
    }
    return selected
      .map((value) => {
        const option = this.options().find((o) => this.getOptionValue(o) === value);
        return option !== undefined ? this.getOptionLabel(option) : String(value);
      })
      .join(", ");
  });

  protected readonly isVisibleClearIcon = computed(
    () => this.showClear() && this.$filled() && !this.$disabled()
  );

  protected classesParams() {
    return {
      disabled: this.$disabled(),
      filled: this.$filled(),
      fluid: false,
      overlayVisible: this.overlayVisible(),
    };
  }

  protected labelClassesParams() {
    return { placeholder: this.selectedValues().length === 0 };
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
    return this.selectedValues().includes(this.getOptionValue(option));
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
    if (event.code === "Escape") {
      this.hide();
      event.preventDefault();
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

  /** Toggles an option's membership in the selection — never closes the overlay, matching real source. */
  protected onOptionSelect(event: Event, option: unknown): void {
    if (this.isOptionDisabled(option)) {
      return;
    }
    const optionValue = this.getOptionValue(option);
    const current = this.selectedValues();
    const newValue = current.includes(optionValue)
      ? current.filter((v) => v !== optionValue)
      : [...current, optionValue];

    this.writeModelValue(newValue);
    this.onModelChange(newValue);
    this.onModelTouched();
    this.onChange.emit({ originalEvent: event, value: newValue });
  }

  protected toggleAll(): void {
    const selectable = this.visibleOptions().filter((option) => !this.isOptionDisabled(option));
    const newValue = this.allSelected()
      ? this.selectedValues().filter((v) => !selectable.some((option) => this.getOptionValue(option) === v))
      : [
          ...this.selectedValues(),
          ...selectable
            .map((option) => this.getOptionValue(option))
            .filter((v) => !this.selectedValues().includes(v)),
        ];

    this.writeModelValue(newValue);
    this.onModelChange(newValue);
    this.onModelTouched();
    this.onChange.emit({ originalEvent: new Event("change"), value: newValue });
  }

  protected clear(event: Event): void {
    event.stopPropagation();
    this.writeModelValue([]);
    this.onModelChange([]);
    this.onClear.emit();
  }

  override writeControlValue(value: unknown, setModelValue: (value: unknown) => void): void {
    setModelValue(Array.isArray(value) ? value : []);
  }
}
