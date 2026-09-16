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
 * component (e.g. `UCheckbox`): a `disabled` signal `input()`, `writeValue()`
 * left abstract for subclasses to implement, and the
 * `onModelChange`/`onModelTouched` no-op fields that
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
 * Omits real PrimeNG's `writeControlValue(value, setModelValue)` bridge —
 * real `BaseEditableHolder.writeValue` calls
 * `this.writeControlValue(value, this.writeModelValue.bind(this))`, letting
 * subclasses populate `modelValue` by implementing `writeControlValue`.
 * Here, `writeValue` stays a bare `abstract` method with no such bridge, so
 * `modelValue`/`$filled` are inherited-but-unpopulated on
 * `UBaseEditableHolder` subclasses (e.g. `UCheckbox`, which writes only to
 * its own `checked` signal) until each subclass opts in by calling
 * `writeModelValue` from its own `writeValue` implementation. This is a
 * real, known gap — not an oversight silently worked around — see
 * `docs/architecture/DECISIONS.md`'s ADR-046.
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

  abstract writeValue(value: unknown): void;

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
