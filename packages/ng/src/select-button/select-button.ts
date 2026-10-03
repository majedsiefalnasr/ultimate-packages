import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  input,
  output,
} from "@angular/core";
import { FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from "@angular/forms";
import { UBaseEditableHolder } from "@ultimate/ng-core";
import { UToggleButton } from "@ultimate/ng/toggle-button";
import { selectButtonStyleModule } from "./select-button-style";

export interface USelectButtonChangeEvent {
  originalEvent: Event;
  value: unknown;
}

/**
 * Ultimate-owned adaptation of PrimeNG's `SelectButton` component (see
 * `.vendor-extracted/ng/selectbutton/selectbutton.ts`). Real source extends
 * `BaseEditableHolder<SelectButtonPassThrough>` — confirmed against
 * `export class SelectButton extends BaseEditableHolder<...>` — same tier
 * `UToggleButton`/`UCheckbox`/`URadioButton` already extend, not
 * `UBaseInput`.
 *
 * NOT overlay-based — real source renders a flat `role="group"` of
 * `p-togglebutton` per option (`@for (option of options; ...) { <p-togglebutton
 * ... /> }`), no panel/dropdown. This port composes `UToggleButton` the same
 * way, matching real source's own "delegate individual button rendering and
 * toggled state to ToggleButton" composition exactly.
 *
 * Each option's toggled state is driven through a dedicated `FormControl`
 * (one per option, rebuilt whenever `options()` changes and kept in sync via
 * an `effect()`), rather than real source's own bare `[ngModel]="isSelected(option)"`
 * one-way binding. A bare `[ngModel]` per repeated item was tried first and
 * found to suffer a genuine Angular Forms `NgModel` quirk: once a given
 * `NgModel` directive instance's own `viewToModelUpdate` fires (from a user
 * click), that same instance stops accepting further `[ngModel]` input
 * writes that don't originate from its own view interaction — so a sibling
 * option's click correctly updates `modelValue`, but the previously-clicked
 * button's own `aria-pressed` never flips back off. `FormControl.setValue()`
 * (reactive forms) does not carry this same-instance echo-suppression
 * quirk, verified directly against `UToggleButton`'s own CVA contract before
 * choosing this path — this is a binding-mechanism substitution, not an
 * architectural change: still the same "delegate rendering and toggled
 * state to `UToggleButton`'s CVA contract" composition real source itself
 * establishes.
 *
 * Supports both single-select (`multiple` false, default — value is the
 * selected option's value, or `null`) and multi-select (`multiple` true —
 * value is an array of selected option values) per real source's own
 * `isSelected`/`onOptionSelect` `multiple` branch. `allowEmpty` (default
 * `true`) mirrors real source's own default — when `false`, the last
 * remaining selection cannot be toggled off.
 *
 * Deliberately excludes real source's much larger surface: `dataKey`-based
 * equality, `size`/`fluid` passthrough to `ToggleButton`, item template
 * projection (`itemTemplate`), passthrough (`pt`), and `NgModule` — matching
 * every sibling component's established "smaller surface than upstream"
 * precedent.
 */
@Component({
  standalone: true,
  selector: "u-select-button",
  imports: [UToggleButton, ReactiveFormsModule],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: USelectButton, multi: true }],
  template: `
    @for (option of options(); track $index; let i = $index) {
      <u-toggle-button
        [onLabel]="getOptionLabel(option)"
        [offLabel]="getOptionLabel(option)"
        [formControl]="optionControls()[i]"
      />
    }
  `,
  host: {
    "[class]": "cx('root', classesParams())",
    "[attr.role]": "'group'",
    "[attr.aria-labelledby]": "ariaLabelledBy()",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class USelectButton extends UBaseEditableHolder {
  protected override readonly componentName = "select-button";
  protected override readonly styleModule = selectButtonStyleModule;

  /** Available options to choose from. */
  options = input<unknown[]>([]);
  /** Property name or getter function to use as the label of an option. */
  optionLabel = input<string | ((item: unknown) => string)>();
  /** Property name or getter function to use as the value of an option, defaults to the option itself. */
  optionValue = input<string | ((item: unknown) => unknown)>();
  /** Property name or getter function to determine if an option is disabled. */
  optionDisabled = input<string | ((item: unknown) => boolean)>();
  /** Whether multiple selection is allowed. */
  multiple = input(false, { transform: booleanAttribute });
  /** Whether a selection can be cleared, leaving no option selected. */
  allowEmpty = input(true, { transform: booleanAttribute });
  /** Identifier of the label element that labels this group. */
  ariaLabelledBy = input<string>();

  /** Callback to invoke when the selection changes. */
  onChange = output<USelectButtonChangeEvent>();

  /**
   * One `FormControl` per option, rebuilt when `options()` changes. Each
   * control's own `valueChanges` (fired only by a real `UToggleButton` user
   * interaction — the sync `effect()` below always passes `{emitEvent:
   * false}`) drives `onOptionSelect`.
   */
  protected readonly optionControls = computed(() =>
    this.options().map((option) => {
      const control = new FormControl<boolean>(false);
      control.valueChanges.subscribe(() => this.onOptionSelect(option));
      return control;
    })
  );

  constructor() {
    super();
    // Keeps every option's FormControl in sync with modelValue/disabled —
    // both on first render and after any external modelValue write (CVA
    // writeControlValue, reactive-forms setValue, or this component's own
    // onOptionSelect). Re-runs whenever optionControls() is rebuilt (a new
    // options() array) or modelValue()/$disabled()/multiple() changes.
    effect(() => {
      const controls = this.optionControls();
      const opts = this.options();
      controls.forEach((control, i) => {
        const option = opts[i];
        const selected = this.isSelected(option);
        if (control.value !== selected) {
          control.setValue(selected, { emitEvent: false });
        }
        const disabled = this.$disabled() || this.isOptionDisabled(option);
        if (disabled !== control.disabled) {
          disabled ? control.disable({ emitEvent: false }) : control.enable({ emitEvent: false });
        }
      });
    });
  }

  protected classesParams() {
    return { invalid: false, fluid: false };
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
    const optionValue = this.getOptionValue(option);
    const value = this.modelValue();
    if (this.multiple()) {
      return Array.isArray(value) && value.some((v) => v === optionValue);
    }
    return value === optionValue;
  }

  protected onOptionSelect(option: unknown): void {
    if (this.$disabled() || this.isOptionDisabled(option)) {
      return;
    }
    const optionValue = this.getOptionValue(option);
    const selected = this.isSelected(option);

    let newValue: unknown;
    if (this.multiple()) {
      const current = Array.isArray(this.modelValue()) ? [...(this.modelValue() as unknown[])] : [];
      if (selected) {
        if (!this.allowEmpty() && current.length === 1) {
          return;
        }
        newValue = current.filter((v) => v !== optionValue);
      } else {
        newValue = [...current, optionValue];
      }
    } else {
      if (selected) {
        if (!this.allowEmpty()) {
          return;
        }
        newValue = null;
      } else {
        newValue = optionValue;
      }
    }

    this.writeModelValue(newValue);
    this.onModelChange(newValue);
    this.onModelTouched();
    this.onChange.emit({ originalEvent: new Event("change"), value: newValue });
  }

  override writeControlValue(value: unknown, setModelValue: (value: unknown) => void): void {
    setModelValue(value);
  }
}
