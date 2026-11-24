import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  OnDestroy,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  contentChild,
  effect,
  inject,
  input,
  output,
  untracked,
  viewChild,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import {
  UBaseComponent,
  UBaseInput,
  UBind,
  UTimesIcon,
  U_PARENT_INSTANCE,
} from "@ultimate/ng-core";
import { InputMaskEngine, type InputMaskEngineHost } from "./input-mask-engine";
import { inputMaskDirectiveStyleModule, inputMaskStyleModule } from "./input-mask-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `InputMask` component
 * (`primeng/src/inputmask/inputmask.ts`). It extends `UBaseInput` and renders
 * a native `<input>` styled as an InputText. The masking itself lives in the
 * shared {@link InputMaskEngine}, which `UInputMaskDirective` uses as well, so
 * the two cannot drift (ADR-095).
 *
 * Pass-through: `pt`, `ptOptions`, `unstyled` and `dt` come from
 * `UBaseComponent`. The root section is bound through the `UBind` host
 * directive, `pcInputText` goes to the inner input and `clearIcon` to the
 * clear icon. The component provides itself as `U_PARENT_INSTANCE`.
 *
 * Forms: the value accessor writes through the native input. A value written
 * before the view exists is applied in `ngAfterViewInit`, and a value written
 * while no mask is set is shown as it is.
 *
 * Not ported: the `NgModule` wrapper (ADR-019), `INPUTMASK_INSTANCE` (no
 * consumer), `styleClass`/`style` (the host takes `class`/`style` directly),
 * and the `autofocus` directive (`autofocus` is the native attribute).
 */
@Component({
  standalone: true,
  selector: "u-input-mask",
  imports: [UBind, UTimesIcon, NgTemplateOutlet],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: UInputMask, multi: true },
    { provide: U_PARENT_INSTANCE, useExisting: UInputMask },
  ],
  template: `
    <input
      #inputEl
      [uBind]="ptm('pcInputText')"
      [class]="cx('pcInputText', inputClassesParams())"
      [attr.type]="type()"
      [attr.id]="inputId()"
      [attr.name]="name()"
      [attr.placeholder]="placeholder()"
      [attr.title]="title()"
      [attr.size]="inputSize()"
      [attr.autocomplete]="autocomplete()"
      [attr.maxlength]="maxlength()"
      [attr.minlength]="minlength()"
      [attr.tabindex]="tabindex()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-labelledby]="ariaLabelledBy()"
      [attr.aria-required]="ariaRequired()"
      [attr.aria-invalid]="invalid() ? 'true' : undefined"
      [attr.required]="required() ? '' : undefined"
      [attr.autofocus]="autofocus() ? '' : undefined"
      [attr.readonly]="readonly() ? '' : undefined"
      [attr.disabled]="$disabled() ? '' : undefined"
      (focus)="onFocus.emit($event)"
      (keydown)="onKeydown.emit($event)"
      (input)="onInput.emit($event)"
    />
    @if (showClear() && $filled() && !$disabled()) {
      @if (clearIconTemplate(); as clearTemplate) {
        <span [uBind]="ptm('clearIcon')" [class]="cx('clearIcon')" (click)="clear()">
          <ng-container *ngTemplateOutlet="clearTemplate" />
        </span>
      } @else {
        <u-times-icon [uBind]="ptm('clearIcon')" [class]="cx('clearIcon')" (click)="clear()" />
      }
    }
  `,
  host: {
    "[class]": "cx('root', classesParams())",
  },
  hostDirectives: [UBind],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UInputMask extends UBaseInput implements AfterViewInit, OnDestroy {
  protected override readonly componentName = "inputmask";
  protected override readonly styleModule = inputMaskStyleModule;

  private readonly inputEl = viewChild<ElementRef<HTMLInputElement>>("inputEl");
  private readonly bindDirective = inject(UBind, { self: true });

  /** Custom clear icon, projected as `<ng-template #clearicon>`. */
  readonly clearIconTemplate = contentChild<TemplateRef<unknown>>("clearicon");

  /** Mask pattern, e.g. `"99-999999"`, `"(999) 999-9999"`, `"a*-999"`. */
  mask = input<string | undefined>(undefined);
  /** Placeholder character in mask, default is underscore. */
  slotChar = input<string>("_");
  /** Clears the incomplete value on blur. */
  autoClear = input<boolean, boolean>(true, { transform: booleanAttribute });
  /** Regex pattern for alpha (`a`) mask characters. */
  characterPattern = input<string>("[A-Za-z]");
  /** When present, the value is not reformatted or cleared on focus and blur. */
  keepBuffer = input<boolean, boolean>(false, { transform: booleanAttribute });
  /** Defines if the bound value is the raw unmasked value or the formatted mask value. */
  unmask = input<boolean | undefined>(undefined, { transform: booleanAttribute });
  /** When present, it specifies that an input field is read-only. */
  readonly = input<boolean | undefined>(undefined, { transform: booleanAttribute });
  /** Advisory information to display on input. */
  placeholder = input<string | undefined>(undefined);
  /** When present, specifies the component should have invalid state style. */
  invalid = input<boolean | undefined>(undefined, { transform: booleanAttribute });
  /** Displays a clear icon while the input has a value. */
  showClear = input<boolean, boolean>(false, { transform: booleanAttribute });
  /** Type of the native input. */
  type = input<string>("text");
  /** Identifier of the native input. */
  inputId = input<string | undefined>(undefined);
  /** Name of the native input. */
  name = input<string | undefined>(undefined);
  /** Title of the native input. */
  title = input<string | undefined>(undefined);
  /** Autocomplete hint of the native input. */
  autocomplete = input<string | undefined>(undefined);
  /** Tab index of the native input. */
  tabindex = input<number | undefined>(undefined);
  /** Accessible name of the native input. */
  ariaLabel = input<string | undefined>(undefined);
  /** Id of the element that labels the native input. */
  ariaLabelledBy = input<string | undefined>(undefined);
  /** Marks the native input as required for assistive technology. */
  ariaRequired = input<boolean | undefined>(undefined);
  /** Marks the native input as required. */
  required = input<boolean, boolean>(false, { transform: booleanAttribute });
  /** Focuses the native input when it is first rendered. */
  autofocus = input<boolean, boolean>(false, { transform: booleanAttribute });

  /** Callback to invoke when the mask is completed. */
  onCompleteEvent = output<void>();
  /** Callback to invoke when value changes, emits unmasked value. */
  onUnmaskedChange = output<string>();
  /** Callback to invoke when the input receives focus. */
  onFocus = output<Event>();
  /** Callback to invoke when the input loses focus. */
  onBlur = output<Event>();
  /** Callback to invoke on a key down. */
  onKeydown = output<KeyboardEvent>();
  /** Callback to invoke on an input event. */
  onInput = output<Event>();
  /** Callback to invoke when the clear icon is used. */
  onClear = output<void>();

  private pendingValue: { value: unknown } | null = null;

  private readonly host: InputMaskEngineHost = {
    input: () => this.inputEl()?.nativeElement ?? null,
    mask: () => this.mask(),
    slotChar: () => this.slotChar(),
    autoClear: () => this.autoClear(),
    characterPattern: () => this.characterPattern(),
    keepBuffer: () => this.keepBuffer(),
    changed: () => this.syncModel(),
    completed: () => this.onCompleteEvent.emit(),
    unmasked: (value) => this.onUnmaskedChange.emit(value),
    blurred: (event) => {
      this.syncModelIfChanged();
      this.onModelTouched();
      this.onBlur.emit(event);
    },
  };
  private readonly engine = new InputMaskEngine(this.host);

  constructor() {
    super();
    effect(() => {
      this.mask();
      this.slotChar();
      this.characterPattern();
      untracked(() => {
        this.engine.init();
        this.engine.reformat();
      });
    });
  }

  protected classesParams() {
    return {
      invalid: this.invalid(),
      fluid: this.hasFluid,
      variantFilled: this.$variant() === "filled",
    };
  }

  protected inputClassesParams() {
    return {
      filled: this.$filled(),
      invalid: this.invalid(),
      fluid: this.hasFluid,
      variantFilled: this.$variant() === "filled",
      size: this.size() === "small" || this.size() === "large" ? this.size() : undefined,
    };
  }

  ngAfterViewChecked(): void {
    this.bindDirective.setAttrs(this.ptms(["host", "root"]));
  }

  ngAfterViewInit(): void {
    const input = this.inputEl()?.nativeElement;
    if (!input) return;
    this.engine.attach(input);
    this.engine.init();
    if (this.pendingValue) {
      const { value } = this.pendingValue;
      this.pendingValue = null;
      this.applyValue(value);
    }
  }

  ngOnDestroy(): void {
    this.engine.detach();
  }

  /** Moves keyboard focus to the native input. */
  focus(): void {
    this.engine.focus();
  }

  /** Clears the value, the bound model and the native input. */
  clear(): void {
    const input = this.inputEl()?.nativeElement;
    if (input) input.value = "";
    this.writeModelValue(null);
    this.onModelChange(null);
    this.onClear.emit();
  }

  override writeControlValue(value: unknown, setModelValue: (value: unknown) => void): void {
    setModelValue(value);
    if (!this.inputEl()) {
      this.pendingValue = { value };
      return;
    }
    this.applyValue(value);
  }

  private applyValue(value: unknown): void {
    const input = this.inputEl()?.nativeElement;
    if (!input) return;
    input.value = value === undefined || value === null ? "" : String(value);
    if (this.mask()) {
      this.engine.reformat();
      this.writeModelValue(this.currentModelValue());
    }
  }

  private currentModelValue(): string {
    const input = this.inputEl()?.nativeElement;
    return this.unmask() ? this.engine.getUnmaskedValue() : (input?.value ?? "");
  }

  private syncModel(): void {
    const value = this.currentModelValue();
    this.writeModelValue(value);
    this.onModelChange(value);
  }

  private syncModelIfChanged(): void {
    if (this.modelValue() !== this.currentModelValue()) this.syncModel();
  }
}

/**
 * Ultimate-owned adaptation of PrimeNG's `InputMaskDirective`
 * (`[pInputMask]`). Applies a mask to any native `<input>`, so the host
 * keeps its own value accessor (`ngModel`, `formControl`, `uInputText`). The
 * engine dispatches an `input` event after each edit, which is how the host
 * accessor learns the formatted value.
 *
 * Pass-through (`pt`, `ptOptions`), `unstyled` and `dt` are inherited from
 * `UBaseComponent` unprefixed, as on `UInputText`. PrimeNG renames them
 * (`pInputMaskPT`, `pInputMaskUnstyled`) to avoid a clash with another
 * directive on the same element, but Angular binds an input name to every
 * directive that declares it, so on `<input uInputText uInputMask>` one
 * `pt` reaches both (ADR-095).
 */
@Directive({
  standalone: true,
  selector: "[uInputMask]",
  exportAs: "uInputMask",
  providers: [{ provide: U_PARENT_INSTANCE, useExisting: UInputMaskDirective }],
  host: {
    "[class]": "cx('root')",
  },
  hostDirectives: [UBind],
})
export class UInputMaskDirective extends UBaseComponent implements AfterViewInit, OnDestroy {
  protected override readonly componentName = "inputmaskdirective";
  protected override readonly styleModule = inputMaskDirectiveStyleModule;

  private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly bindDirective = inject(UBind, { self: true });

  /** Mask pattern. */
  uInputMask = input<string | undefined>(undefined);
  /** Placeholder character in mask, default is underscore. */
  slotChar = input<string>("_");
  /** Clears the incomplete value on blur. */
  autoClear = input<boolean, boolean>(true, { transform: booleanAttribute });
  /** Regex pattern for alpha (`a`) mask characters. */
  characterPattern = input<string>("[A-Za-z]");
  /** When present, the value is not reformatted or cleared on focus and blur. */
  keepBuffer = input<boolean, boolean>(false, { transform: booleanAttribute });

  /** Callback to invoke when the mask is completed. */
  onComplete = output<void>();
  /** Callback to invoke when value changes, emits unmasked value. */
  onUnmaskedChange = output<string>();

  private readonly engine = new InputMaskEngine({
    input: () => this.element.nativeElement,
    mask: () => this.uInputMask(),
    slotChar: () => this.slotChar(),
    autoClear: () => this.autoClear(),
    characterPattern: () => this.characterPattern(),
    keepBuffer: () => this.keepBuffer(),
    changed: () => {},
    completed: () => this.onComplete.emit(),
    unmasked: (value) => this.onUnmaskedChange.emit(value),
  });

  constructor() {
    super();
    effect(() => {
      this.uInputMask();
      this.slotChar();
      this.characterPattern();
      untracked(() => {
        this.engine.init();
        this.engine.reformat();
      });
    });
  }

  ngAfterViewChecked(): void {
    this.bindDirective.setAttrs(this.ptms(["host", "root"]));
  }

  ngAfterViewInit(): void {
    this.engine.attach(this.element.nativeElement);
    this.engine.init();
  }

  ngOnDestroy(): void {
    this.engine.detach();
  }

  /** Moves keyboard focus to the masked input. */
  focus(): void {
    this.engine.focus();
  }
}
