import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  ViewEncapsulation,
  booleanAttribute,
  ElementRef,
  input,
  output,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { UBaseInput } from "@ultimate/ng-core";
import { inputMaskStyleModule } from "./input-mask-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `InputMask` component (extracted
 * this session from `packages/primeng/src/inputmask/inputmask.ts` via
 * `scripts/provenance/extract-primeng-source.mjs`). Real source declares
 * TWO classes in the same file: `InputMaskDirective extends BaseComponent`
 * (an internal `[pInputMask]` helper directive with no CVA of its own) and
 * the actual end-user-facing `InputMask extends BaseInput` component
 * (selector `p-inputmask`, `providers: [INPUTMASK_VALUE_ACCESSOR]`) — only
 * the latter is a Batch 1 canonical capability; only it is ported here.
 * `UInputMask` extends `UBaseInput` directly, matching real `InputMask
 * extends BaseInput` and mirroring `UInputNumber`'s own tier
 * (`packages/ng/src/input-number/input-number.ts`, this component's primary
 * pattern reference for a `UBaseInput`-tier CVA component with its own
 * local signal state).
 *
 * The masking algorithm below is a scoped, faithful port of real source's
 * own jQuery-MaskedInput-derived buffer/tests/caret machinery
 * (`initMask`/`checkVal`/`caret`/`shiftL`/`shiftR`/`clearBuffer`/
 * `writeBuffer`/`isCompleted`/`getUnmaskedValue`) — the CORE fixed-pattern
 * masking (digit `9`/alpha `a`/alphanumeric `*` slots, `?` optional-suffix
 * marker, static separator characters, `slotChar` placeholder, `autoClear`
 * on blur, backspace/delete re-inserting the placeholder and left-shifting
 * the buffer, `unmask`) is ported real and tested, not stubbed. Deliberately
 * EXCLUDED as documented platform-quirk scope cuts, matching
 * `UInputNumber`'s own doc-comment precedent for cutting real source's
 * platform-specific branches:
 * - Android Chrome's separate `handleAndroidInput` input-event branch
 *   (real source's own `androidChrome` UA-sniffing fork) — this port always
 *   takes real source's `handleInputChange` branch.
 * - iPhone's `keyCode === 127` backspace alias and the legacy
 *   `createTextRange`/`document.selection` IE input-selection fallback —
 *   `setSelectionRange` (supported by every browser this platform targets)
 *   is the only caret mechanism ported.
 * - The 10ms `caretTimeoutId` focus-caret-positioning choreography and the
 *   Escape-key revert-to-`focusText` behavior — UX affordances layered on
 *   top of the core masking algorithm, not masking behavior itself.
 *
 * These cuts are algorithmically independent of the ported core: every
 * excluded branch is a wrapper/UA-detection/caret-timing concern around the
 * same `buffer`/`tests`/`checkVal` state this port already implements in
 * full, not a different masking strategy — porting them adds platform-quirk
 * surface area without changing mask-formatting behavior for the target
 * environment.
 */
@Component({
  standalone: true,
  selector: "u-input-mask",
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: UInputMask, multi: true }],
  template: `
    <input
      #inputEl
      type="text"
      [class]="cx('pcInputText')"
      [value]="displayValue()"
      [attr.disabled]="$disabled() ? '' : undefined"
      [attr.readonly]="readonly() ? '' : undefined"
      [attr.placeholder]="placeholder()"
      [attr.maxlength]="maxlength()"
      [attr.minlength]="minlength()"
      [attr.size]="inputSize()"
      (keypress)="onKeyPress($event)"
      (keydown)="onKeyDown($event)"
      (input)="onInputChange($event)"
      (paste)="onPaste($event)"
      (focus)="onFocus()"
      (blur)="onBlur()"
    />
  `,
  host: {
    "[class]": "cx('root', classesParams())",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UInputMask extends UBaseInput {
  protected override readonly componentName = "input-mask";
  protected override readonly styleModule = inputMaskStyleModule;

  @ViewChild("inputEl") private readonly inputEl!: ElementRef<HTMLInputElement>;

  /** Mask pattern — e.g. `"99-999999"`, `"(999) 999-9999"`, `"a*-999"`. */
  mask = input<string | undefined>(undefined);
  /** Placeholder character in mask, default is underscore. */
  slotChar = input<string>("_");
  /** Clears the incomplete value on blur. */
  autoClear = input<boolean, boolean>(true, { transform: booleanAttribute });
  /** Regex pattern for alpha (`a`) mask characters. */
  characterPattern = input<string>("[A-Za-z]");
  /** Defines if the bound value is the raw unmasked value or the formatted mask value. */
  unmask = input<boolean | undefined>(undefined, { transform: booleanAttribute });
  /** When present, it specifies that an input field is read-only. */
  readonly = input<boolean | undefined>(undefined, { transform: booleanAttribute });
  /** Advisory information to display on input. */
  placeholder = input<string | undefined>(undefined);
  /** When present, specifies the component should have invalid state style. */
  invalid = input<boolean | undefined>(undefined, { transform: booleanAttribute });

  /** Callback to invoke when the mask is completed. */
  onCompleteEvent = output<void>();
  /** Callback to invoke when value changes, emits unmasked value. */
  onUnmaskedChange = output<string>();

  private defs: Record<string, string> | null = null;
  private tests: (RegExp | null)[] = [];
  private partialPosition = 0;
  private firstNonMaskPos: number | null = null;
  private lastRequiredNonMaskPos = -1;
  private len = 0;
  private buffer: string[] = [];
  private defaultBuffer = "";

  /** Real, formatted-with-mask buffer value shown in the native input. */
  protected readonly displayValue = () => (this.buffer.length ? this.buffer.join("") : "");

  protected classesParams() {
    return {
      invalid: this.invalid(),
      fluid: this.hasFluid,
    };
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.initMask();
  }

  protected onFocus(): void {
    if (this.readonly() || !this.mask()) return;
    this.checkVal();
    this.writeBuffer();
  }

  protected onBlur(): void {
    if (!this.mask()) return;
    if (!this.autoClear() || this.buffer.join("") !== this.defaultBuffer) {
      this.checkVal();
      this.writeBuffer();
    }
    this.emitModel();
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (this.readonly() || !this.mask()) return;
    const input = this.inputEl.nativeElement;

    if (event.key === "Backspace" || event.key === "Delete") {
      const { begin: rawBegin, end: rawEnd } = this.getCaret(input);
      let begin = rawBegin;
      let end = rawEnd;
      if (end - begin === 0) {
        if (event.key === "Delete") {
          end = this.seekNext(begin - 1);
        } else {
          begin = this.seekPrev(begin);
        }
      }
      this.clearBuffer(begin, end);
      this.shiftL(begin, end - 1);
      this.writeBuffer();
      this.setCaret(input, Math.max(this.firstNonMaskPos ?? 0, begin));
      this.emitModel();
      event.preventDefault();
    }
  }

  protected onKeyPress(event: KeyboardEvent): void {
    if (this.readonly() || !this.mask()) return;
    if (event.ctrlKey || event.altKey || event.metaKey) return;

    const input = this.inputEl.nativeElement;
    const { begin, end } = this.getCaret(input);
    if (end - begin !== 0) {
      this.clearBuffer(begin, end);
      this.shiftL(begin, end - 1);
    }

    const p = this.seekNext(begin - 1);
    if (p < this.len) {
      const c = event.key;
      const test = this.tests[p];
      if (c.length === 1 && test?.test(c)) {
        this.shiftR(p);
        this.buffer[p] = c;
        this.writeBuffer();
        const next = this.seekNext(p);
        this.setCaret(input, next);
        this.emitModel();
        if (begin <= this.lastRequiredNonMaskPos && this.isCompleted()) {
          this.onCompleteEvent.emit();
        }
      }
    }
    event.preventDefault();
  }

  protected onInputChange(event: Event): void {
    // Native `input` fires after keypress-driven writeBuffer() already ran;
    // real source guards this same re-entrancy via `event.isTrusted` +
    // synthetic-dispatch skipping. Here, onKeyPress/onKeyDown already own
    // buffer mutation, so plain typed input is a no-op; only IME/composition
    // or programmatic value assignment (not exercised by this port's scope)
    // would reach here without a buffer already matching.
    event.preventDefault();
  }

  protected onPaste(event: ClipboardEvent): void {
    if (this.readonly() || !this.mask()) return;
    const pasted = event.clipboardData?.getData("text") ?? "";
    if (!pasted.length) return;
    event.preventDefault();

    const input = this.inputEl.nativeElement;
    input.value = pasted;
    this.checkVal(true);
    this.writeBuffer();
    this.emitModel();
    if (this.isCompleted()) {
      this.onCompleteEvent.emit();
    }
  }

  override writeControlValue(value: unknown, setModelValue: (value: unknown) => void): void {
    if (!this.mask()) {
      setModelValue(value);
      return;
    }
    const input = this.inputEl?.nativeElement;
    if (input) {
      input.value = typeof value === "string" ? value : "";
    }
    this.checkVal(!!input?.value);
    this.writeBuffer();
    setModelValue(this.currentModelValue());
  }

  private emitModel(): void {
    const value = this.currentModelValue();
    this.writeModelValue(value);
    this.onModelChange(value);
    this.onUnmaskedChange.emit(this.getUnmaskedValue());
  }

  private currentModelValue(): string {
    return this.unmask() ? this.getUnmaskedValue() : this.buffer.join("");
  }

  /** Real, faithful port of `InputMask.initMask()`. */
  private initMask(): void {
    const maskValue = this.mask();
    if (!maskValue) return;

    this.tests = [];
    this.partialPosition = maskValue.length;
    this.len = maskValue.length;
    this.firstNonMaskPos = null;
    this.defs = {
      "9": "[0-9]",
      a: this.characterPattern(),
      "*": `${this.characterPattern()}|[0-9]`,
    };

    const maskTokens = maskValue.split("");
    for (let i = 0; i < maskTokens.length; i++) {
      const c = maskTokens[i];
      if (c === "?") {
        this.len--;
        this.partialPosition = i;
      } else if (this.defs[c]) {
        this.tests.push(new RegExp(this.defs[c]));
        if (this.firstNonMaskPos === null) {
          this.firstNonMaskPos = this.tests.length - 1;
        }
        if (i < this.partialPosition) {
          this.lastRequiredNonMaskPos = this.tests.length - 1;
        }
      } else {
        this.tests.push(null);
      }
    }

    this.buffer = [];
    for (let i = 0; i < maskTokens.length; i++) {
      const c = maskTokens[i];
      if (c !== "?") {
        this.buffer.push(this.defs[c] ? this.getPlaceholder(i) : c);
      }
    }
    this.defaultBuffer = this.buffer.join("");
  }

  private getPlaceholder(i: number): string {
    const slotCharValue = this.slotChar();
    return i < slotCharValue.length ? slotCharValue.charAt(i) : slotCharValue.charAt(0);
  }

  private seekNext(pos: number): number {
    let next = pos;
    while (++next < this.len && !this.tests[next]);
    return next;
  }

  private seekPrev(pos: number): number {
    let prev = pos;
    while (--prev >= 0 && !this.tests[prev]);
    return prev;
  }

  private shiftL(begin: number, end: number): void {
    if (begin < 0) return;
    let j = this.seekNext(end);
    for (let i = begin; i < this.len; i++) {
      const test = this.tests[i];
      if (test) {
        if (j < this.len && test.test(this.buffer[j])) {
          this.buffer[i] = this.buffer[j];
          this.buffer[j] = this.getPlaceholder(j);
        } else {
          break;
        }
        j = this.seekNext(j);
      }
    }
  }

  private shiftR(pos: number): void {
    let c = this.getPlaceholder(pos);
    for (let i = pos; i < this.len; i++) {
      const test = this.tests[i];
      if (test) {
        const j = this.seekNext(i);
        const t = this.buffer[i];
        this.buffer[i] = c;
        if (j < this.len && this.tests[j]?.test(t)) {
          c = t;
        } else {
          break;
        }
      }
    }
  }

  private clearBuffer(start: number, end: number): void {
    for (let i = start; i < end && i < this.len; i++) {
      if (this.tests[i]) {
        this.buffer[i] = this.getPlaceholder(i);
      }
    }
  }

  private writeBuffer(): void {
    const input = this.inputEl?.nativeElement;
    if (input && this.buffer.length) {
      input.value = this.buffer.join("");
    }
  }

  private isCompleted(): boolean {
    for (let i = this.firstNonMaskPos ?? 0; i <= this.lastRequiredNonMaskPos; i++) {
      if (this.tests[i] && this.buffer[i] === this.getPlaceholder(i)) {
        return false;
      }
    }
    return true;
  }

  private getUnmaskedValue(): string {
    const unmasked: string[] = [];
    for (let i = 0; i < this.buffer.length; i++) {
      const c = this.buffer[i];
      if (this.tests[i] && c !== this.getPlaceholder(i)) {
        unmasked.push(c);
      }
    }
    return unmasked.join("");
  }

  /** Faithful port of real `InputMask.checkVal()` — reconciles the raw input value against the mask. */
  private checkVal(allow = false): number {
    const input = this.inputEl?.nativeElement;
    const test = input?.value ?? "";
    let lastMatch = -1;
    let i = 0;
    let pos = 0;

    for (i = 0, pos = 0; i < this.len; i++) {
      if (this.tests[i]) {
        this.buffer[i] = this.getPlaceholder(i);
        while (pos++ < test.length) {
          const c = test.charAt(pos - 1);
          if (this.tests[i]?.test(c)) {
            this.buffer[i] = c;
            lastMatch = i;
            break;
          }
        }
        if (pos > test.length) {
          this.clearBuffer(i + 1, this.len);
          break;
        }
      } else {
        if (this.buffer[i] === test.charAt(pos)) {
          pos++;
        }
        if (i < this.partialPosition) {
          lastMatch = i;
        }
      }
    }

    if (!allow) {
      if (lastMatch + 1 < this.partialPosition) {
        if (this.autoClear() || this.buffer.join("") === this.defaultBuffer) {
          if (input) input.value = "";
          this.clearBuffer(0, this.len);
        }
      } else if (input) {
        input.value = input.value.substring(0, lastMatch + 1);
      }
    }
    return this.partialPosition ? i : (this.firstNonMaskPos ?? 0);
  }

  private getCaret(input: HTMLInputElement): { begin: number; end: number } {
    return { begin: input.selectionStart ?? 0, end: input.selectionEnd ?? 0 };
  }

  private setCaret(input: HTMLInputElement, pos: number): void {
    input.setSelectionRange(pos, pos);
  }
}
