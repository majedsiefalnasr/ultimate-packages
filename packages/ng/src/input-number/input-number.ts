import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  input,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { UBaseInput } from "@ultimate/ng-core";
import { inputNumberStyleModule } from "./input-number-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `InputNumber` component (extracted
 * this session from `packages/primeng/src/inputnumber/inputnumber.ts` via
 * `scripts/provenance/extract-primeng-source.mjs`). Renders a single
 * native `<input>` styled as `.u-inputnumber-input`, extends `UBaseInput`
 * directly (the richer input-config tier — `min`/`max`/`step`/`pattern`/etc
 * — that `UInputText` skips, matching real `InputNumber extends BaseInput`).
 *
 * Unlike `UInputText` (an attribute directive implementing no CVA of its
 * own), `UInputNumber` IS a `@Component` and DOES implement its own
 * `ControlValueAccessor` surface via `providers: [NG_VALUE_ACCESSOR]` —
 * confirmed against real source's own `INPUTNUMBER_VALUE_ACCESSOR` constant
 * and `writeControlValue` override. This is a genuine, confirmed
 * architectural difference between the two real components, not an
 * inconsistency introduced here.
 *
 * `value: number | null` is this component's own local, template-bound
 * state — matching real `InputNumber`'s own `value: Nullable<number>` field
 * and `UCheckbox`'s established own-local-state-plus-bridge pattern (Task
 * 2): `writeControlValue` populates BOTH `value` (real state) AND
 * `modelValue`/`$filled` (via `setModelValue`) from the same CVA write.
 *
 * `writeControlValue` matches real source's exact coercion pattern
 * (`inputnumber.ts` line ~1464): `this.value = value ? Number(value) :
 * value; setModelValue(value);` — a plain `Number()` parse, no
 * locale/currency formatting (out of scope per this spec's Non-Goals).
 *
 * `clampToRange` is a deliberately scoped-down port of real source's own
 * `validateValue` (`inputnumber.ts` line ~1294): only the `min`/`max`
 * branches are ported (real `validateValue` also handles the `'-'` sentinel
 * and currency/percent-mode digit-group parsing, both irrelevant here since
 * this component never formats/parses grouped strings). Applied whenever
 * `value` changes — both from CVA writes and from `min`/`max` themselves
 * changing while a value is already set.
 *
 * Deliberately excludes real source's much larger surface: locale-aware
 * `Intl.NumberFormat` formatting (`formatValue`/`parseValue`), clipboard
 * paste handling (`onPaste`), cursor/caret-position insertion logic
 * (`insertText`/`deleteRange`/`updateInput`/`initCursor`), configurable
 * spinner button layouts (`showButtons`/`buttonLayout` and their
 * increment/decrement button templates), `prefix`/`suffix`/`currency`/
 * `locale` inputs — all out of this task's scope per the spec's own
 * Non-Goals. Also excludes, per the platform-wide exclusions every prior
 * component follows: passthrough (`pt`), `NgModule`, `pSize`,
 * `PARENT_INSTANCE`/`INPUTNUMBER_INSTANCE` parent-lookup tokens.
 *
 * `classesParams()`/`cx()` mirrors `UInputText`'s own pattern, scoped to
 * `invalid`/`fluid` only, applied to `pcInputText` (the inner native
 * `<input>`) rather than `root` — matching real source's own template shape
 * where these two classes land on the nested `pInputText`-directive element,
 * not `InputNumber`'s own host (see `input-number-style.ts`'s own doc
 * comment for the full reasoning).
 */
@Component({
  standalone: true,
  selector: "u-input-number",
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: UInputNumber, multi: true }],
  template: `
    <input
      type="text"
      inputmode="decimal"
      role="spinbutton"
      [class]="cx('pcInputText', classesParams())"
      [value]="value ?? ''"
      [attr.aria-valuemin]="min()"
      [attr.aria-valuemax]="max()"
      [attr.aria-valuenow]="value"
      [attr.min]="min()"
      [attr.max]="max()"
      [attr.step]="step() ?? 1"
      [attr.maxlength]="maxlength()"
      [attr.minlength]="minlength()"
      [attr.pattern]="pattern()"
      [attr.size]="inputSize()"
      [attr.disabled]="$disabled() ? '' : undefined"
      (input)="onInput($event)"
    />
  `,
  host: {
    "[class]": "cx('root')",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UInputNumber extends UBaseInput {
  protected override readonly componentName = "input-number";
  protected override readonly styleModule = inputNumberStyleModule;

  /** Current numeric value, reflected by the native input and CVA. Own local state, matching real `InputNumber`'s own `value` field. */
  value: number | null = null;

  /**
   * When present, specifies the component should have invalid state style.
   * `UBaseInput` (and every class above it) declares no `invalid` input of
   * its own — matching `UInputText`'s own precedent of declaring `invalid`
   * locally on the leaf component.
   */
  invalid = input<boolean | undefined>(undefined, { transform: booleanAttribute });

  protected classesParams() {
    return {
      invalid: this.invalid(),
      fluid: this.hasFluid,
    };
  }

  /**
   * Writes a CVA-driven value into `value` and, via `setModelValue`, into
   * `modelValue` — matching real source's exact `Number()`-coercion
   * pattern. Clamped to `min`/`max` afterward, same as a user-driven change.
   */
  override writeControlValue(value: unknown, setModelValue: (value: unknown) => void): void {
    this.value = value ? Number(value) : (value as number | null);
    this.clampToRange();
    setModelValue(value);
  }

  protected onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const next = raw === "" ? null : Number(raw);
    this.value = next;
    this.clampToRange();
    this.writeModelValue(this.value);
    this.onModelChange(this.value);
    this.onModelTouched();
  }

  /**
   * Scoped-down port of real `InputNumber.validateValue`'s `min`/`max`
   * branches only (see class doc comment) — clamps `value` in place.
   */
  private clampToRange(): void {
    if (this.value == null) {
      return;
    }
    const min = this.min();
    const max = this.max();
    if (min != null && this.value < min) {
      this.value = min;
    } else if (max != null && this.value > max) {
      this.value = max;
    }
  }
}
