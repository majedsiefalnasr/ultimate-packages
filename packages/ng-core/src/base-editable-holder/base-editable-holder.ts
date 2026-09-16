import { Directive, booleanAttribute, computed, input, signal } from "@angular/core";
import { ControlValueAccessor } from "@angular/forms";
import { UModelHolder } from "../model-holder/model-holder";

/**
 * Ultimate-owned reimplementation of PrimeNG's `BaseEditableHolder`.
 *
 * Extends {@link UModelHolder} (which supplies `modelValue`/`$filled`/
 * `writeModelValue`, matching real PrimeNG's `BaseComponent →
 * BaseModelHolder → BaseEditableHolder` ordering exactly) with the
 * `ControlValueAccessor` contract shared by every editable/form-bindable
 * component: a `disabled` signal `input()`, the `writeControlValue` bridge
 * (below), and the `onModelChange`/`onModelTouched` no-op fields that
 * `registerOnChange`/`registerOnTouched` replace per the Angular Forms API
 * contract.
 *
 * `disabled` is a read-only `input()` — Angular's `input()` has no `.set()`
 * — that only reflects a template `[disabled]` binding. CVA's
 * `setDisabledState` instead writes to the separate `_disabled` signal;
 * `$disabled` is the computed value every consumer should read. This
 * matches PrimeNG's own confirmed `baseeditableholder.ts` split-signal
 * pattern exactly.
 *
 * Provides no `NG_VALUE_ACCESSOR` here — confirmed against PrimeNG's real
 * source, DI providers on a base `@Directive` do not propagate to a
 * derived `@Component`, so every leaf component (e.g. `UCheckbox`) must
 * declare its own `NG_VALUE_ACCESSOR` provider with `useExisting` pointing
 * at the concrete leaf class.
 *
 * `writeControlValue(value, setModelValue)` is the `writeControlValue`
 * bridge real PrimeNG's `BaseEditableHolder.writeValue` uses
 * (`this.writeControlValue(value, this.writeModelValue.bind(this))`),
 * matching real source exactly (GAP-038). `writeValue` is now fixed — no
 * longer `abstract` — and always constructs and passes
 * `this.writeModelValue.bind(this)` as `setModelValue`. Subclasses override
 * `writeControlValue`, never `writeValue`, to populate `modelValue`/
 * `$filled` and any local state (e.g. `UCheckbox`'s own `checked` signal)
 * from the same CVA write. The default `writeControlValue` here is a NOOP
 * (matching real PrimeNG's own documented "should be overridden in derived
 * classes") — a subclass that never overrides it inherits a working CVA
 * contract with `modelValue` simply staying unpopulated, not a broken one.
 */
@Directive({ standalone: true })
export abstract class UBaseEditableHolder extends UModelHolder implements ControlValueAccessor {
  /** Whether the control is disabled (`disabled` attribute/binding). Read-only. */
  disabled = input<boolean | undefined>(undefined, { transform: booleanAttribute });

  /** Writable half of the disabled state, set via `setDisabledState`. */
  protected readonly _disabled = signal(false);

  /** The disabled value every consumer should read. */
  readonly $disabled = computed(() => this.disabled() || this._disabled());

  protected onModelChange: (value: unknown) => void = () => {};
  protected onModelTouched: () => void = () => {};

  /**
   * Override to populate `modelValue` (via the `setModelValue` callback) and
   * any local state from a CVA write. Default is a NOOP, matching real
   * PrimeNG's own `BaseEditableHolder.writeControlValue`.
   */
  writeControlValue(value: unknown, setModelValue: (value: unknown) => void): void {
    // NOOP — override in derived classes.
  }

  /** Fixed CVA entry point — always bridges into `writeControlValue`. Do not override. */
  writeValue(value: unknown): void {
    this.writeControlValue(value, this.writeModelValue.bind(this));
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onModelTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled.set(isDisabled);
  }
}
