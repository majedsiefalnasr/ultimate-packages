import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  input,
  signal,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { UBaseEditableHolder } from "@ultimate/ng-core";
import { radioButtonStyleModule } from "./radio-button-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `RadioButton` component (see
 * `.vendor-extracted/ng/radiobutton/radiobutton.ts`). Renders a native
 * `<input type="radio">` inside a `.u-radio-button-box` wrapper (matching
 * upstream's own two-element template shape), extends `UBaseEditableHolder`
 * for the `ControlValueAccessor` contract via the `writeControlValue`
 * bridge — same tier `UCheckbox` extends, confirmed against real source:
 * `RadioButton extends BaseEditableHolder<RadioButtonPassThrough>`, not
 * `BaseInput`.
 *
 * Deliberately excludes upstream's `RadioControlRegistry`-driven
 * radio-group cross-instance synchronization (upstream's `RadioButton`
 * looks up a sibling-selection registry via `NgControl`/DI to uncheck other
 * radios sharing the same `name`/form-group when one is selected).
 * `URadioButton` relies on the native `<input type="radio">`'s own
 * browser-native grouping behavior instead (radios sharing the same `name`
 * attribute are mutually exclusive natively) — no registry, no DI lookup,
 * matching the same "deliberately excludes a much larger prop surface"
 * precedent already established by `UCheckbox`'s own doc comment. Also
 * excludes `ariaLabelledBy`/`ariaLabel`/`tabindex`/`styleClass`/`autofocus`/
 * `variant`/`size`/`onFocus`/`onBlur` outputs, and the checked-state icon
 * (upstream's icon has no equivalent yet in `@ultimate/ng-core`'s icon set —
 * same reasoning `UCheckbox` already documents), for the same reason:
 * outside this task's minimal Checkbox-pattern surface.
 *
 * `name` is declared as this component's own local `input()` (not inherited
 * from `UBaseEditableHolder`, which has no `name`/`required` surface) —
 * matching how `UCheckbox` declares its own local `binary`/`label` inputs
 * that aren't backed by the base tier either.
 *
 * `providers: [NG_VALUE_ACCESSOR]` is required here (not inherited), for the
 * same DI reason `UCheckbox` documents: base `@Directive` providers do not
 * propagate to a derived `@Component`.
 *
 * `writeControlValue(value, setModelValue)` mirrors `UCheckbox`'s own
 * bridge: for `binary` mode, the control value directly reflects the
 * checked boolean; for value-matching mode (the default), `checked`
 * reflects whether the written value equals this radio's own `value()`.
 */
@Component({
  standalone: true,
  selector: "u-radio-button",
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: URadioButton, multi: true }],
  template: `
    <input
      type="radio"
      [class]="cx('input')"
      [attr.name]="name()"
      [checked]="checked()"
      [disabled]="$disabled()"
      [attr.value]="value()"
      [attr.aria-label]="ariaLabel()"
      (change)="handleChange()"
    />
    <div [class]="cx('box')">
      <div [class]="cx('icon')"></div>
    </div>
  `,
  host: {
    "[class]": "cx('root', classesParams())",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class URadioButton extends UBaseEditableHolder {
  protected override readonly componentName = "radio-button";
  protected override readonly styleModule = radioButtonStyleModule;

  /** Value of the radio button — compared against the written control value to derive `checked` (non-binary mode). */
  value = input<unknown>();
  /** Allows to select a boolean value instead of matching against `value()`. */
  binary = input(false, { transform: booleanAttribute });
  /** Native `name` grouping attribute — radios sharing a `name` are mutually exclusive natively. */
  name = input<string>();
  /** Accessible label for the native input. */
  ariaLabel = input<string>();

  /** Current checked state, reflected by the native input and CVA. */
  readonly checked = signal(false);

  protected classesParams() {
    return { checked: this.checked(), disabled: this.$disabled() };
  }

  /** Writes a CVA-driven value into `checked` and, via `setModelValue`, into `modelValue`. */
  override writeControlValue(value: unknown, setModelValue: (value: unknown) => void): void {
    const isChecked = this.binary() ? !!value : value === this.value();
    this.checked.set(isChecked);
    setModelValue(value);
  }

  protected handleChange(): void {
    if (this.$disabled()) {
      return;
    }
    this.select();
  }

  private select(): void {
    this.checked.set(true);
    const next = this.binary() ? true : this.value();
    this.writeModelValue(next);
    this.onModelChange(next);
    this.onModelTouched();
  }
}
