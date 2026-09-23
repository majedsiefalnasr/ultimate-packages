import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input, output, signal } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { UBaseEditableHolder } from "@ultimate/ng-core";
import { listboxStyleModule } from "./listbox-style";

export interface UListboxChangeEvent {
  originalEvent: Event;
  value: unknown;
}

/**
 * Ultimate-owned adaptation of PrimeNG's `Listbox` component (see
 * `.vendor-extracted/ng/listbox/listbox.ts`). Real source extends
 * `BaseEditableHolder<ListBoxPassThrough>` — confirmed against `export
 * class Listbox extends BaseEditableHolder<...>` — same tier
 * `UMultiSelect`/`USelectButton`/`UToggleButton` already extend.
 *
 * NOT overlay-based — real source renders an always-visible `role="listbox"`
 * list directly in the host (optional header with a filter input, an
 * options list, no panel/dropdown/trigger) — confirmed against real
 * source's own template, which has no `p-overlay`/`Overlay` import at all,
 * unlike `Select`/`MultiSelect`/`CascadeSelect` (this batch's overlay-based
 * siblings). This port follows `USelectButton`'s established "no overlay
 * composition" precedent for the same reason.
 *
 * Supports both single-select (`multiple` false, default — `modelValue` is
 * the selected option's value, or `null`) and multi-select (`multiple`
 * true — `modelValue` is an array of selected option values), matching real
 * source's own `isSelected`/`onOptionSelect` `multiple` branch exactly
 * (`listbox.ts` lines ~507-520, ~876-895).
 *
 * Deliberately excludes real source's much larger surface: grouped options,
 * virtual scrolling, drag-and-drop reordering (`DragDropModule`), range
 * selection (Shift-click)/`metaKeySelection`, header/footer/item template
 * projection, passthrough (`pt`), and `NgModule` — matching every sibling
 * component's established "smaller surface than upstream" precedent.
 */
@Component({
  standalone: true,
  selector: "u-listbox",
  template: `
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
          (input)="onFilterInputChange($event)"
        />
      </div>
    }
    <div [class]="cx('listContainer')">
      <ul
        [class]="cx('list')"
        role="listbox"
        [attr.aria-multiselectable]="multiple()"
        [attr.aria-label]="ariaLabel()"
        [attr.tabindex]="$disabled() ? -1 : 0"
        (keydown)="onKeyDown($event)"
        (focus)="onFocus.emit($event)"
        (blur)="onBlur()"
      >
        @for (option of visibleOptions(); track trackOption($index, option)) {
          <li
            role="option"
            [class]="cx('option', optionClassesParams(option, $index))"
            [attr.aria-selected]="isSelected(option)"
            [attr.aria-disabled]="isOptionDisabled(option)"
            (click)="onOptionSelect($event, option)"
            (mouseenter)="!isOptionDisabled(option) && focusedOptionIndex.set($index)"
          >
            @if (multiple()) {
              <input type="checkbox" [checked]="isSelected(option)" [disabled]="isOptionDisabled(option)" tabindex="-1" />
            }
            <span>{{ getOptionLabel(option) }}</span>
          </li>
        } @empty {
          <li [class]="cx('emptyMessage')" role="option">{{ emptyMessage() }}</li>
        }
      </ul>
    </div>
  `,
  host: {
    "[class]": "cx('root', classesParams())",
  },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: UListbox, multi: true }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UListbox extends UBaseEditableHolder {
  protected override readonly componentName = "listbox";
  protected override readonly styleModule = listboxStyleModule;

  /** Available options to choose from. */
  options = input<unknown[]>([]);
  /** Property name or getter function to use as the label of an option. */
  optionLabel = input<string | ((item: unknown) => string)>();
  /** Property name or getter function to use as the value of an option, defaults to the option itself. */
  optionValue = input<string | ((item: unknown) => unknown)>();
  /** Optional key for reusing option DOM nodes when options change. */
  trackBy = input<(index: number, option: unknown) => unknown>();
  /** Property name or getter function to determine if an option is disabled. */
  optionDisabled = input<string | ((item: unknown) => boolean)>();
  /** Whether multiple selection is allowed. */
  multiple = input(false, { transform: booleanAttribute });
  /** Whether a filter input is displayed above the list. */
  filter = input(false, { transform: booleanAttribute });
  /** Placeholder text for the filter input. */
  filterPlaceholder = input<string>();
  /** Label of the list for accessibility. */
  ariaLabel = input<string>();
  /** Text to display when there are no options (or no options match the filter). */
  emptyMessage = input("No results found");

  /** Callback to invoke when the selection changes. */
  onChange = output<UListboxChangeEvent>();
  /** Callback to invoke when the component receives focus. */
  onFocus = output<Event>();
  /** Callback to invoke when the component loses focus. */
  onBlurEmit = output<Event>();

  protected readonly focusedOptionIndex = signal(-1);
  protected readonly filterValue = signal("");

  protected readonly visibleOptions = computed(() => {
    const query = this.filterValue().trim().toLowerCase();
    if (!query) {
      return this.options();
    }
    return this.options().filter((option) => this.getOptionLabel(option).toLowerCase().includes(query));
  });

  protected classesParams() {
    return { disabled: this.$disabled(), invalid: false };
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

  protected trackOption(index: number, option: unknown): unknown {
    const callback = this.trackBy();
    return callback ? callback(index, option) : index;
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
    const optionValue = this.getOptionValue(option);
    const value = this.modelValue();
    if (this.multiple()) {
      return Array.isArray(value) && value.includes(optionValue);
    }
    return value === optionValue;
  }

  protected onBlur(): void {
    this.onModelTouched();
    this.onBlurEmit.emit(new Event("blur"));
  }

  protected onFilterInputChange(event: Event): void {
    this.filterValue.set((event.target as HTMLInputElement).value);
    this.focusedOptionIndex.set(-1);
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (this.$disabled()) {
      return;
    }
    switch (event.code) {
      case "ArrowDown":
        this.moveFocus(1);
        event.preventDefault();
        break;
      case "ArrowUp":
        this.moveFocus(-1);
        event.preventDefault();
        break;
      case "Home":
        this.focusedOptionIndex.set(0);
        event.preventDefault();
        break;
      case "End":
        this.focusedOptionIndex.set(this.visibleOptions().length - 1);
        event.preventDefault();
        break;
      case "Enter":
      case "NumpadEnter":
      case "Space":
        this.selectFocused(event);
        event.preventDefault();
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

  /** Selects (single mode) or toggles (multiple mode) an option. */
  protected onOptionSelect(event: Event, option: unknown): void {
    if (this.isOptionDisabled(option)) {
      return;
    }
    const optionValue = this.getOptionValue(option);
    let newValue: unknown;

    if (this.multiple()) {
      const current = Array.isArray(this.modelValue()) ? (this.modelValue() as unknown[]) : [];
      newValue = current.includes(optionValue)
        ? current.filter((v) => v !== optionValue)
        : [...current, optionValue];
    } else {
      newValue = optionValue;
    }

    this.writeModelValue(newValue);
    this.onModelChange(newValue);
    this.onModelTouched();
    this.onChange.emit({ originalEvent: event, value: newValue });
  }

  override writeControlValue(value: unknown, setModelValue: (value: unknown) => void): void {
    setModelValue(value);
  }
}
