import {
  Directive,
  DestroyRef,
  HostListener,
  booleanAttribute,
  computed,
  inject,
  input,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NgControl } from "@angular/forms";
import { UModelHolder } from "@ultimate/ng-core";
import { cn } from "@ultimate/uix-utils/classnames";
import { UFluid } from "../fluid/fluid";
import { inputTextStyleModule } from "./input-text-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `InputText` directive. An attribute
 * directive applied to a native `<input>` — not a wrapping component —
 * matching real PrimeNG's actual architecture: `InputText` styles a plain
 * `<input>` in place rather than rendering its own element. Extends
 * `UModelHolder` directly (skipping `UBaseEditableHolder`), matching real
 * `InputText extends BaseModelHolder`: real `InputText` has no `disabled`
 * input of its own either — a genuine real-source asymmetry with other
 * editable controls (e.g. `UCheckbox`), not an oversight here.
 *
 * Reads `NgControl` (optional, self) READ-ONLY, purely to synchronize
 * `UModelHolder`'s `modelValue`/`$filled` state for styling (the `p-filled`
 * class). Does NOT implement `ControlValueAccessor` and provides no
 * `NG_VALUE_ACCESSOR` — Angular's native `DefaultValueAccessor` (provided
 * automatically by `@angular/forms` for any native `<input>` bound via
 * `ngModel`/`formControl`/`formControlName`) remains the sole accessor for
 * this element. `UInputText` never calls `registerOnChange`/
 * `registerOnTouched`/`writeValue`/`setDisabledState` and declares none of
 * them — it only reads `NgControl.value` (already kept current by
 * `DefaultValueAccessor`) to mirror it into `modelValue`.
 *
 * Sync happens on three independent triggers: the native `input` DOM event
 * (user typing), `ngAfterViewInit` (initial value), and `NgControl`'s own
 * `valueChanges` observable (programmatic `FormControl.setValue()`/
 * `patchValue()`/`ngModel` updates). `ngDoCheck` is also implemented per
 * spec as a defensive catch-all, but is NOT relied on as the mechanism for
 * catching programmatic control writes: this codebase runs zoneless,
 * signal-based change detection (confirmed via
 * `packages/ng/src/scroller/scroller.ts`'s own doc comment on the same
 * constraint), under which `ngDoCheck` only fires when Angular already has a
 * reason to re-check the host view — a bare `FormControl.setValue()` call
 * does NOT mark this directive's view dirty (verified directly: spying on
 * the sync method showed zero calls across a `detectChanges()` following
 * `setValue()`, with `ngDoCheck` never firing). The `valueChanges`
 * subscription (`takeUntilDestroyed`) is therefore the actually-reliable
 * mechanism for that case, not `ngDoCheck`.
 *
 * `hasFluid` DI-injects an ancestor `UFluid` via
 * `inject(UFluid, { optional: true, host: true, skipSelf: true })` — the
 * first Ultimate component to implement this ancestor-lookup mechanism, per
 * real PrimeNG's own `Button`, which DI-injects `Fluid` the same way purely
 * to detect an ancestor `<p-fluid>` wrapper. `UButton`
 * (`packages/ng/src/button/button.ts`) deliberately excludes this pattern
 * (see its own doc comment) because its template never references `UFluid`
 * without a matching input — nothing was copied from `UButton` here; this is
 * a new pattern for the platform.
 *
 * Deliberately excludes PrimeNG's passthrough (`pt`/`ptInputText`) system,
 * `hostName`/parent-instance DI-token lookup, `pSize`/`inputSize`, and the
 * `NgModule` re-export wrapper — none of these appear in this task's
 * Interfaces section, and new `NgModule` authorship is forbidden platform-wide.
 *
 * `$variant`'s upstream `config.inputStyle()`/`config.inputVariant()`
 * fallback is omitted: `UltimateConfig`'s current Option-B surface has
 * neither field, and expanding it is gated on config's own still-open
 * architecture decision (see `COMPONENT_INVENTORY.md`'s cross-cutting
 * table). `$variant` is retained as the forward-compatible seam for that
 * fallback once config's surface grows.
 */
@Directive({
  standalone: true,
  selector: "[uInputText]",
  exportAs: "uInputText",
  host: {
    "[class]": "cx('root', classesParams())",
    "[attr.data-p]": "dataP",
  },
})
export class UInputText extends UModelHolder {
  protected override readonly componentName = "input-text";
  protected override readonly styleModule = inputTextStyleModule;

  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly pcFluid: UFluid | null = inject(UFluid, {
    optional: true,
    host: true,
    skipSelf: true,
  });
  private readonly destroyRef = inject(DestroyRef);

  /** Specifies the input variant of the component. */
  variant = input<"filled" | "outlined" | undefined>();
  /** Spans 100% width of the container when enabled. */
  fluid = input<boolean | undefined>(undefined, { transform: booleanAttribute });
  /** When present, specifies the component should have invalid state style. */
  invalid = input<boolean | undefined>(undefined, { transform: booleanAttribute });

  readonly $variant = computed(() => this.variant());

  /** True when `fluid()` is explicitly set, or an ancestor `<u-fluid>` wrapper is detected via DI. */
  get hasFluid(): boolean {
    return this.fluid() ?? !!this.pcFluid;
  }

  protected classesParams() {
    return {
      filled: this.$filled(),
      invalid: this.invalid(),
      fluid: this.hasFluid,
      variantFilled: this.$variant() === "filled",
    };
  }

  /**
   * A separate, smaller token string than `[class]` — matching real
   * PrimeNG's `InputText.dataP` getter (`this.cn({ invalid, fluid,
   * filled: $variant()==='filled' })`), not the `cx('root', ...)` root
   * class name. `UInputText` has no `pSize`-equivalent, so unlike upstream
   * there is no size token to include here.
   */
  protected get dataP(): string | undefined {
    return cn({
      invalid: this.invalid(),
      fluid: this.hasFluid,
      filled: this.$variant() === "filled",
    });
  }

  ngAfterViewInit(): void {
    this.syncModelValue();
    this.ngControl?.valueChanges?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.syncModelValue();
    });
  }

  ngDoCheck(): void {
    this.syncModelValue();
  }

  @HostListener("input")
  protected onInput(): void {
    this.syncModelValue();
  }

  /** Read-only sync of `UModelHolder`'s state from the live DOM/NgControl value — never writes back to either. */
  private syncModelValue(): void {
    const nativeValue = (this.el.nativeElement as HTMLInputElement).value;
    this.writeModelValue(this.ngControl?.value ?? nativeValue);
  }
}
