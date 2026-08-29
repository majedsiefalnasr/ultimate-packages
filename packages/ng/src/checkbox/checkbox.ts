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
import { checkboxStyleModule } from "./checkbox-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `Checkbox` component (see
 * `.vendor-extracted/ng/checkbox/checkbox.ts`). Renders a native
 * `<input type="checkbox">` inside a `.u-checkbox-box` wrapper (matching
 * upstream's own two-element template shape), extends `UBaseEditableHolder`
 * (Task 5) for the `ControlValueAccessor` contract.
 *
 * Deliberately excludes upstream's much larger prop surface: `value`/
 * `trueValue`/`falseValue` (multi-value/group-checkbox mode — this task's
 * Interfaces section defines only `binary`, and this component only
 * implements upstream's boolean/binary mode; `writeValue` always coerces to
 * a plain boolean, never upstream's array-membership `contains()` check for
 * multi-value mode), `ariaLabelledBy`/`ariaLabel`/`tabindex`/`inputId`/
 * `inputStyle`/`styleClass`/`inputClass`/`readonly`/`autofocus`/`variant`/
 * `size`/`checkboxIcon`/`formControl` inputs, `indeterminate` state, the
 * icon `<ng-template>`/`ContentChild` template-override system, and the
 * `onChange`/`onFocus`/`onBlur` `output()`s — none of these appear in this
 * task's Interfaces section, which defines a smaller, spec-mandated
 * signal-input surface (`binary`, `label`, inherited `disabled`) with "no
 * `UCheckbox`-specific outputs beyond the CVA contract."
 *
 * Renders no check/minus icon: upstream's checked-state icon
 * (`CheckIcon`/`MinusIcon`) has no equivalent yet in `@ultimate/ng-core`'s
 * icon set (Task 9's icon architecture finding covers only spinner/times/
 * window-maximize/window-minimize so far) and no icon-related input is
 * listed in this task's Interfaces section; the checked state is instead
 * conveyed via `.u-checkbox-checked` on the root and the native input's own
 * `checked` state/appearance.
 *
 * `providers: [NG_VALUE_ACCESSOR]` is required here (not inherited):
 * confirmed during Task 5 against PrimeNG's real source that
 * `UBaseEditableHolder` provides no `NG_VALUE_ACCESSOR` of its own — DI
 * providers on a base `@Directive` do not propagate to a derived
 * `@Component` — so every leaf component must declare its own, matching
 * upstream's own `CHECKBOX_VALUE_ACCESSOR` constant redeclared on `Checkbox`
 * rather than inherited from `BaseEditableHolder`.
 *
 * The template binds the native input's `[disabled]` to `$disabled()` (the
 * combined computed value from `UBaseEditableHolder`), never to the base
 * `disabled()` input alone — `disabled()` alone doesn't reflect
 * `setDisabledState`'s CVA-driven value (see
 * `packages/ng-core/src/base-editable-holder/base-editable-holder.ts`).
 */
@Component({
  standalone: true,
  selector: "u-checkbox",
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: UCheckbox, multi: true }],
  template: `
    <input
      type="checkbox"
      [class]="cx('input')"
      [checked]="checked()"
      [disabled]="$disabled()"
      [attr.aria-label]="label()"
      (change)="handleChange()"
      (keydown.space)="handleSpace($event)"
    />
    <div [class]="cx('box')"></div>
    @if (label()) {
      <span [class]="cx('label')">{{ label() }}</span>
    }
  `,
  host: {
    "[class]": "cx('root', classesParams())",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UCheckbox extends UBaseEditableHolder {
  protected override readonly componentName = "checkbox";
  protected override readonly styleModule = checkboxStyleModule;

  /** Allows to select a boolean value instead of multiple values. */
  binary = input(false, { transform: booleanAttribute });
  /** Text label rendered next to the checkbox. */
  label = input<string>();

  /** Current checked state, reflected by the native input and CVA. */
  readonly checked = signal(false);

  protected classesParams() {
    return { checked: this.checked(), disabled: this.$disabled() };
  }

  /** Writes a CVA-driven value into the local `checked` signal. */
  writeValue(value: unknown): void {
    this.checked.set(!!value);
  }

  protected handleChange(): void {
    if (this.$disabled()) {
      return;
    }
    this.toggle();
  }

  protected handleSpace(event: Event): void {
    event.preventDefault();
    if (this.$disabled()) {
      return;
    }
    this.toggle();
  }

  private toggle(): void {
    const next = !this.checked();
    this.checked.set(next);
    this.onModelChange(next);
    this.onModelTouched();
  }
}
