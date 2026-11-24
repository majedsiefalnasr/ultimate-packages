import {
  DestroyRef,
  Directive,
  HostListener,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NgControl } from "@angular/forms";
import { UBind, UModelHolder } from "@ultimate/ng-core";
import { cn } from "@ultimate/uix-utils/classnames";
import { UFluid } from "@ultimate/ng/fluid";
import { textareaStyleModule } from "./textarea-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `Textarea` directive (extracted this
 * session from `packages/primeng/src/textarea/textarea.ts` via
 * `scripts/provenance/extract-primeng-source.mjs`). An attribute directive
 * applied to a native `<textarea>` — not a wrapping component — matching real
 * PrimeNG's actual architecture: `Textarea extends BaseModelHolder` directly
 * (skipping `BaseEditableHolder`/`BaseInput`), the exact same tier
 * `UInputText` already uses (`packages/ng/src/input-text/input-text.ts`),
 * confirmed by real source having no `disabled` input of its own and no
 * `NG_VALUE_ACCESSOR` provider — Angular's native `DefaultValueAccessor`
 * (provided automatically for any native `<textarea>` bound via
 * `ngModel`/`formControl`/`formControlName`) remains the sole accessor.
 * `UTextarea` never implements `ControlValueAccessor` — it only reads
 * `NgControl.value` (already kept current by `DefaultValueAccessor`) to
 * mirror it into `modelValue`, matching `UInputText`'s own read-only sync
 * pattern exactly (three independent triggers: native `input` DOM event,
 * `ngAfterViewInit`, and `NgControl.valueChanges`).
 *
 * `autoResize` ports real source's own `resize()` method exactly: reads
 * `scrollHeight` after resetting `height` to `auto`, and switches
 * `overflow`/`overflow-y` based on whether a CSS `max-height` is set —
 * verified against real `textarea.ts`'s `resize()`/`onAfterViewInit()`/
 * `updateState()` methods (real source calls `resize()` from
 * `ngAfterViewInit` when `autoResize` is set, and again on every `input`
 * event via `updateState()`).
 *
 * Two deliberate differences from real `resize()`. PrimeNG compares the new
 * height with `parseFloat(style.maxHeight)`, which is `NaN` when no
 * `max-height` is set, so the comparison is false and the textarea only
 * grows. The earlier port used `parseFloat(maxHeight || "0")`, which turned
 * that into `height >= 0` and reset the height; a missing `max-height` is
 * now an explicit "no cap" branch. And PrimeNG re-runs `resize()` from
 * `ngAfterViewChecked`, firing `onResize` on every change-detection pass;
 * here it runs on `ngAfterViewInit`, on every `input` event and on every
 * `NgControl.valueChanges` emission, so a programmatic `setValue()` also
 * resizes.
 *
 * Passthrough (`pt`, `ptOptions`), `unstyled` and `dt` come from
 * `UBaseComponent` (ADR-077); the root section is bound through the `UBind`
 * host directive. `uSize` ("small" | "large") replaces PrimeNG's `pSize`; it
 * is named `uSize` so it does not collide with native attributes.
 *
 * Deliberately excludes the `NgModule` re-export wrapper — new `NgModule`
 * authorship is forbidden platform-wide.
 *
 * `$variant`'s upstream `config.inputStyle()`/`config.inputVariant()`
 * fallback is omitted for the same reason as `UInputText`: the config
 * surface has neither field.
 */
@Directive({
  standalone: true,
  selector: "[uTextarea]",
  exportAs: "uTextarea",
  host: {
    "[class]": "cx('root', classesParams())",
    "[attr.data-p]": "dataP",
  },
  hostDirectives: [UBind],
})
export class UTextarea extends UModelHolder {
  protected override readonly componentName = "textarea";
  protected override readonly styleModule = textareaStyleModule;

  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly pcFluid: UFluid | null = inject(UFluid, {
    optional: true,
    host: true,
    skipSelf: true,
  });
  private readonly destroyRef = inject(DestroyRef);
  private readonly bindDirective = inject(UBind, { self: true });

  /** When present, textarea size changes as being typed. */
  autoResize = input<boolean | undefined>(undefined, { transform: booleanAttribute });
  /** Specifies the input variant of the component. */
  variant = input<"filled" | "outlined" | undefined>();
  /** Defines the size of the component. */
  uSize = input<"small" | "large" | undefined>();
  /** Spans 100% width of the container when enabled. */
  fluid = input<boolean | undefined>(undefined, { transform: booleanAttribute });
  /** When present, specifies the component should have invalid state style. */
  invalid = input<boolean | undefined>(undefined, { transform: booleanAttribute });

  /** Callback to invoke on textarea resize. */
  onResize = output<Event | Record<string, never>>();

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
      autoResize: this.autoResize(),
      size: this.uSize(),
    };
  }

  /**
   * A separate, smaller token string than `[class]`, like PrimeNG's
   * `Textarea.dataP`; `filled` is variant-derived here, while the `p-filled`
   * class follows the value.
   */
  protected get dataP(): string | undefined {
    return cn({
      invalid: this.invalid(),
      fluid: this.hasFluid,
      filled: this.$variant() === "filled",
      [this.uSize() ?? ""]: !!this.uSize(),
    });
  }

  ngAfterViewChecked(): void {
    this.bindDirective.setAttrs(this.ptms(["host", "root"]));
  }

  ngAfterViewInit(): void {
    if (this.autoResize()) {
      this.resize();
    }
    this.syncModelValue();
    this.ngControl?.valueChanges?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.syncModelValue();
      if (this.autoResize()) {
        this.resize();
      }
    });
  }

  ngDoCheck(): void {
    this.syncModelValue();
  }

  @HostListener("input")
  protected onInput(): void {
    this.syncModelValue();
    if (this.autoResize()) {
      this.resize();
    }
  }

  private resize(event?: Event): void {
    const el = this.el.nativeElement as HTMLTextAreaElement;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;

    const maxHeight = parseFloat(el.style.maxHeight);
    if (!Number.isNaN(maxHeight) && parseFloat(el.style.height) >= maxHeight) {
      el.style.overflowY = "scroll";
      el.style.height = el.style.maxHeight;
    } else {
      el.style.overflow = "hidden";
    }

    this.onResize.emit(event ?? {});
  }

  /** Read-only sync of `UModelHolder`'s state from the live DOM/NgControl value — never writes back to either. */
  private syncModelValue(): void {
    const nativeValue = (this.el.nativeElement as HTMLTextAreaElement).value;
    this.writeModelValue(this.ngControl?.value ?? nativeValue);
  }
}
