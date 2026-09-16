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
 * for the `ControlValueAccessor` contract via the `writeControlValue`
 * bridge (GAP-038).
 *
 * Deliberately excludes upstream's much larger prop surface: `value`/
 * `trueValue`/`falseValue` (multi-value/group-checkbox mode — this
 * component only implements upstream's boolean/binary mode),
 * `ariaLabelledBy`/`ariaLabel`/`tabindex`/`inputId`/`inputStyle`/
 * `styleClass`/`inputClass`/`readonly`/`autofocus`/`variant`/`size`/
 * `checkboxIcon`/`formControl` inputs, `indeterminate` state, the icon
 * `<ng-template>`/`ContentChild` template-override system, and the
 * `onChange`/`onFocus`/`onBlur` `output()`s.
 *
 * Renders no check/minus icon: upstream's checked-state icon has no
 * equivalent yet in `@ultimate/ng-core`'s icon set; the checked state is
 * instead conveyed via `.u-checkbox-checked` on the root and the native
 * input's own `checked` state/appearance.
 *
 * `providers: [NG_VALUE_ACCESSOR]` is required here (not inherited):
 * `UBaseEditableHolder` provides no `NG_VALUE_ACCESSOR` of its own — DI
 * providers on a base `@Directive` do not propagate to a derived
 * `@Component` — so every leaf component must declare its own, matching
 * upstream's own `CHECKBOX_VALUE_ACCESSOR` constant redeclared on `Checkbox`
 * rather than inherited from `BaseEditableHolder`.
 *
 * The template binds the native input's `[disabled]` to `$disabled()` (the
 * combined computed value from `UBaseEditableHolder`), never to the base
 * `disabled()` input alone — `disabled()` alone doesn't reflect
 * `setDisabledState`'s CVA-driven value.
 *
 * `writeControlValue(value, setModelValue)` replaces the previous direct
 * `writeValue` override (GAP-038's bridge migration): it populates this
 * component's own `checked` signal — the real, template-bound state source,
 * matching this component's existing architecture, NOT derived from
 * `modelValue()` the way real PrimeNG's own `Checkbox` derives `checked`
 * from `modelValue()` directly — while ALSO calling `setModelValue(value)`
 * to populate the inherited `modelValue`/`$filled` in parallel. `toggle()`
 * (the user-interaction path — click/Space) also calls `writeModelValue`
 * directly, so `modelValue`/`$filled` stay in sync on user-driven writes
 * too, not just CVA-driven ones — without this, `modelValue` would go stale
 * the instant a user clicks the checkbox.
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

  /** Writes a CVA-driven value into `checked` and, via `setModelValue`, into `modelValue`. */
  override writeControlValue(value: unknown, setModelValue: (value: unknown) => void): void {
    this.checked.set(!!value);
    setModelValue(value);
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
    this.writeModelValue(next);
    this.onModelChange(next);
    this.onModelTouched();
  }
}
