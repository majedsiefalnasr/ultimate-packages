import { Directive, computed, signal } from "@angular/core";
import { isNotEmpty } from "@ultimate/uix-utils/object";
import { UBaseComponent } from "../basecomponent/base-component";

/**
 * Ultimate-owned reimplementation of PrimeNG's `BaseModelHolder`.
 *
 * Owns model-value *state* only — `modelValue`, `$filled`,
 * `writeModelValue`. No `ControlValueAccessor` methods and no Angular
 * Forms integration of any kind: real `BaseModelHolder` doesn't implement
 * `ControlValueAccessor` either (only `BaseEditableHolder`, one tier up,
 * does).
 */
@Directive({ standalone: true })
export abstract class UModelHolder extends UBaseComponent {
  readonly modelValue = signal<unknown>(undefined);

  readonly $filled = computed(() => isNotEmpty(this.modelValue()));

  writeModelValue(value: unknown): void {
    this.modelValue.set(value);
  }
}
