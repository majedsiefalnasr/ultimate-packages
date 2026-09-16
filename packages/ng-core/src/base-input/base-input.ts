import { Directive, booleanAttribute, computed, inject, input } from "@angular/core";
import { UBaseEditableHolder } from "../base-editable-holder/base-editable-holder";
import { U_FLUID_ANCESTOR } from "./fluid-ancestor.token";

/**
 * Ultimate-owned reimplementation of PrimeNG's `BaseInput`.
 *
 * Extends {@link UBaseEditableHolder} with the richer input-config surface
 * real PrimeNG's `InputMask`/`Password`/`AutoComplete`/`DatePicker`/
 * `InputNumber`/`Select` all extend (unlike `InputText`, which extends
 * `BaseModelHolder` directly and skips this tier entirely — GAP-018).
 *
 * Introduces zero `ControlValueAccessor` surface of its own — pure
 * input/config tier on top of the existing editable-holder contract,
 * matching real PrimeNG's own `BaseInput` exactly (confirmed: zero
 * `writeValue`/`writeControlValue`/`ControlValueAccessor` references
 * anywhere in the extracted real source).
 *
 * `$variant`'s upstream `config.inputStyle()`/`config.inputVariant()`
 * fallback is omitted — same documented, deliberate omission `UInputText`
 * already established (GAP-018): `UltimateConfig`'s Option-B surface has
 * neither field, and expanding it is gated on config's own still-open
 * architecture decision.
 *
 * `hasFluid` cannot DI-inject `UFluid`'s class directly the way `UInputText`
 * does: `UBaseInput` lives in `ng-core`, which has no dependency on `ng`
 * (`ng` depends on `ng-core`, not the reverse — importing the class here
 * would create a circular workspace dependency). Instead it injects the
 * {@link U_FLUID_ANCESTOR} marker token that `UFluid` provides on itself,
 * preserving the same ancestor-detection mechanism without the import.
 *
 * The real `<u-fluid>` ancestor-detection end-to-end proof is deferred to
 * `UInputNumber`'s own test suite (Task 5, in `packages/ng`), where
 * `UBaseInput`/`U_FLUID_ANCESTOR`/`UFluid` all resolve within `ng`'s single
 * build graph — not a design gap, just a test-placement constraint forced
 * by `ng-core`'s own spec suite compiling from source while `UFluid` would
 * only be reachable through `ng`'s built dist.
 */
@Directive({ standalone: true })
export abstract class UBaseInput extends UBaseEditableHolder {
  private readonly fluidAncestor = inject(U_FLUID_ANCESTOR, {
    optional: true,
    host: true,
    skipSelf: true,
  });

  /** Spans 100% width of the container when enabled. */
  fluid = input<boolean | undefined>(undefined, { transform: booleanAttribute });
  /** Specifies the input variant of the component. */
  variant = input<"filled" | "outlined" | undefined>();
  /** Specifies the size of the component. */
  size = input<"large" | "small" | undefined>();
  /** Specifies the visible width of the input element in characters. */
  inputSize = input<number | null | undefined>();
  /** Specifies the value must match the pattern. */
  pattern = input<string | null | undefined>();
  /** The value must be greater than or equal to this value. */
  min = input<number | null | undefined>();
  /** The value must be less than or equal to this value. */
  max = input<number | null | undefined>();
  /** Unless step is "any", the value must be min + an integral multiple of step. */
  step = input<number | null | undefined>();
  /** The number of characters must not be less than this value, if non-empty. */
  minlength = input<number | null | undefined>();
  /** The number of characters must not exceed this value. */
  maxlength = input<number | null | undefined>();

  readonly $variant = computed(() => this.variant());

  /** True when `fluid()` is explicitly set, or an ancestor `<u-fluid>` wrapper is detected via DI. */
  get hasFluid(): boolean {
    return this.fluid() ?? !!this.fluidAncestor;
  }
}
