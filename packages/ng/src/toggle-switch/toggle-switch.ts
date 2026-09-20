import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { UBaseEditableHolder } from "@ultimate/ng-core";
import { toggleSwitchStyleModule } from "./toggle-switch-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `ToggleSwitch` component (see
 * `.vendor-extracted/ng/toggleswitch/toggleswitch.ts`). Renders a native
 * `<input type="checkbox" role="switch">` plus a `.u-toggle-switch-slider` /
 * `.u-toggle-switch-handle` pair (matching upstream's own three-element
 * template shape) — extends `UBaseEditableHolder`, confirmed against real
 * source: `ToggleSwitch extends BaseEditableHolder<ToggleSwitchPassThrough>`,
 * same tier `UCheckbox`/`URadioButton`/`UToggleButton` extend, not
 * `UBaseInput`.
 *
 * `checked()` derives from `modelValue() === trueValue()` — matching real
 * upstream's own `checked() { return this.modelValue() === this.trueValue; }`
 * getter exactly (`UToggleSwitch` is the only one of these 3 components
 * whose checked state is a pure derivation of `modelValue`, not a
 * separately-tracked signal — this is a genuine, source-verified difference
 * from `UCheckbox`/`URadioButton`'s own `checked` signal, not an
 * inconsistency).
 *
 * Deliberately excludes upstream's `ariaLabelledBy`/`ariaLabel`/`tabindex`/
 * `inputId`/`styleClass`/`autofocus`/`size`/`readonly`/`onChange` custom
 * `output()`, and the handle `<ng-template>`/`ContentChild` override —
 * outside this task's minimal Checkbox-pattern surface, matching the same
 * "deliberately excludes a much larger prop surface" precedent already
 * established by `UCheckbox`/`URadioButton`/`UToggleButton`.
 */
@Component({
  standalone: true,
  selector: "u-toggle-switch",
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: UToggleSwitch, multi: true }],
  template: `
    <input
      type="checkbox"
      role="switch"
      [class]="cx('input')"
      [checked]="checked()"
      [disabled]="$disabled()"
      [attr.aria-checked]="checked()"
      (change)="handleChange()"
    />
    <div [class]="cx('slider')">
      <div [class]="cx('handle')"></div>
    </div>
  `,
  host: {
    "[class]": "cx('root', classesParams())",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UToggleSwitch extends UBaseEditableHolder {
  protected override readonly componentName = "toggle-switch";
  protected override readonly styleModule = toggleSwitchStyleModule;

  /** Value in checked state. */
  trueValue = input<unknown>(true);
  /** Value in unchecked state. */
  falseValue = input<unknown>(false);

  /** Derived directly from `modelValue`, matching real upstream's own `checked()` getter. */
  readonly checked = () => this.modelValue() === this.trueValue();

  protected classesParams() {
    return { checked: this.checked(), disabled: this.$disabled() };
  }

  /** Writes a CVA-driven value straight through to `modelValue` — `checked()` derives from it. */
  override writeControlValue(value: unknown, setModelValue: (value: unknown) => void): void {
    setModelValue(value);
  }

  protected handleChange(): void {
    if (this.$disabled()) {
      return;
    }
    const next = this.checked() ? this.falseValue() : this.trueValue();
    this.writeModelValue(next);
    this.onModelChange(next);
    this.onModelTouched();
  }
}
