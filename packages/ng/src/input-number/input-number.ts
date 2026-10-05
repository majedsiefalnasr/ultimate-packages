import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  input,
  signal,
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
 * `value = signal<number | null>(null)` is this component's own local,
 * template-bound state — matching real `InputNumber`'s own `value:
 * Nullable<number>` field (a signal here, rather than a plain field, so
 * `OnPush` re-renders on `.set()` without a manual `markForCheck()` call —
 * see the field's own doc comment) and `UCheckbox`'s established
 * own-local-state-plus-bridge pattern (Task 2): `writeControlValue`
 * populates BOTH `value` (real state) AND `modelValue`/`$filled` (via
 * `setModelValue`) from the same CVA write.
 *
 * `writeControlValue` matches real source's coercion pattern
 * (`inputnumber.ts` line ~1464): `this.value = value ? Number(value) :
 * value;` — a plain `Number()` parse, no locale/currency formatting (out of
 * scope per this spec's Non-Goals). Diverges from real source on what gets
 * passed to `setModelValue`/`onModelChange` after clamping — see
 * `writeControlValue`'s own doc comment.
 *
 * `clampToRange` is a deliberately scoped-down port of real source's own
 * `validateValue` (`inputnumber.ts` line ~1294): only the `min`/`max`
 * branches are ported (real `validateValue` also handles the `'-'` sentinel
 * and currency/percent-mode digit-group parsing, both irrelevant here since
 * this component never formats/parses grouped strings). Applied whenever
 * `value` changes from a CVA write (`writeControlValue`) or a user-driven
 * edit (`onInput`) — NOT re-applied merely because `min`/`max` themselves
 * change while a value is already set (no `effect`/`ngOnChanges` watches
 * them; matches real source, which also only calls `validateValue` from
 * those same two call sites).
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
 * `classesParams()`/`cx()` mirrors `UCheckbox`'s own root-level pattern
 * (`cx('root', classesParams())` on the host), scoped to `invalid`/`fluid`
 * — matching real source's own `classes.root` resolver, which puts both
 * `p-inputnumber-fluid` and `p-invalid` on `InputNumber`'s own host, not the
 * nested `pInputText`-directive element (see `input-number-style.ts`'s own
 * doc comment for the full reasoning).
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
      [class]="cx('pcInputText')"
      [value]="value() ?? ''"
      [attr.aria-valuemin]="min()"
      [attr.aria-valuemax]="max()"
      [attr.aria-valuenow]="value()"
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
    "[class]": "cx('root', classesParams())",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UInputNumber extends UBaseInput {
  protected override readonly componentName = "inputnumber";
  protected override readonly styleModule = inputNumberStyleModule;

  /**
   * Current numeric value, reflected by the native input and CVA. Own local
   * state, matching real `InputNumber`'s own `value` field — a signal
   * (rather than a plain field) so writes trigger change detection under
   * `OnPush` on their own, matching `UCheckbox`'s own `readonly checked =
   * signal(false)` precedent. Real source instead calls `this.cd
   * .markForCheck()` explicitly at the end of `writeControlValue`; the
   * signal achieves the same effect without a manual `markForCheck()` call.
   */
  readonly value = signal<number | null>(null);

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
   *
   * Unlike real source (which passes the raw, unclamped `value` parameter
   * straight into `setModelValue`), `modelValue` and the `FormControl`
   * itself are both corrected to the CLAMPED result here: passing the raw
   * value into `setModelValue`/`onModelChange` would leave `value` (clamped)
   * and `modelValue`/the `FormControl` (unclamped) permanently disagreeing,
   * since this CVA write path never otherwise calls `onModelChange` to
   * correct the control. `onInput` doesn't need the same explicit
   * `onModelChange` call — it already calls it itself after clamping.
   */
  override writeControlValue(value: unknown, setModelValue: (value: unknown) => void): void {
    this.value.set(value ? Number(value) : (value as number | null));
    this.clampToRange();
    setModelValue(this.value());
    this.onModelChange(this.value());
  }

  protected onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const next = raw === "" ? null : Number(raw);
    this.value.set(next);
    this.clampToRange();
    this.writeModelValue(this.value());
    this.onModelChange(this.value());
    this.onModelTouched();
  }

  /**
   * Scoped-down port of real `InputNumber.validateValue`'s `min`/`max`
   * branches only (see class doc comment) — clamps `value` in place.
   */
  private clampToRange(): void {
    const current = this.value();
    if (current == null) {
      return;
    }
    const min = this.min();
    const max = this.max();
    if (min != null && current < min) {
      this.value.set(min);
    } else if (max != null && current > max) {
      this.value.set(max);
    }
  }
}
