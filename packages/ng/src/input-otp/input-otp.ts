import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  output,
  signal,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { UBaseEditableHolder } from "@ultimate/ng-core";
import { inputOtpStyleModule } from "./input-otp-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `InputOtp` component (extracted
 * this session from `packages/primeng/src/inputotp/inputotp.ts` via
 * `scripts/provenance/extract-primeng-source.mjs`). Real source extends
 * `BaseEditableHolder` directly (skipping `BaseInput`'s `min`/`max`/
 * `pattern`/etc surface, which InputOtp has no use for) — `UInputOtp`
 * mirrors this exactly by extending `UBaseEditableHolder`
 * (`packages/ng-core/src/base-editable-holder/base-editable-holder.ts`), a
 * lighter tier than `UInputNumber`'s `UBaseInput`, matching real source's
 * own tier choice, not an assumption.
 *
 * Real source's actual DOM shape (verified in full): `length` (default 4)
 * separate native `<input pInputText>` elements rendered in a loop, each
 * holding exactly one character token (`getModelValue(i)` reads
 * `tokens[i-1]`), with real keyboard navigation between them
 * (`moveToPrev`/`moveToNext` via `previousElementSibling`/
 * `nextElementSibling`, driven by ArrowLeft/ArrowRight/Backspace), paste
 * handling that splits pasted text across the segment inputs
 * (`onPaste`/`handleOnPaste`), and `integerOnly` filtering non-digit
 * keystrokes at `keydown` time. This port replicates all of that real
 * segment/navigation/paste/filter behavior — it is genuinely novel,
 * multi-input-element logic for this platform (no prior Ultimate component
 * renders N sibling native inputs backed by one CVA model value), but fits
 * `UBaseEditableHolder`'s existing `writeControlValue`/`modelValue` contract
 * without requiring any new base tier or architectural pattern: the single
 * string model value is derived by joining the `tokens` array, exactly
 * matching real source's own `updateModel()`/`writeControlValue()`.
 *
 * `mask` (renders each segment as `type="password"`, matching real source's
 * own `get inputType()`) is ported. Deliberately excludes real source's
 * custom `inputTemplate` content-projection slot and passthrough (`pt`)
 * system — neither appears in this task's scope, matching every sibling
 * component's established exclusions.
 */
@Component({
  standalone: true,
  selector: "u-input-otp",
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UInputOtp), multi: true },
  ],
  template: `
    @for (i of range(); track i) {
      <input
        type="text"
        [class]="cx('pcInputText')"
        [value]="getToken(i)"
        [attr.maxlength]="1"
        [attr.type]="inputType()"
        [attr.inputmode]="inputMode()"
        [attr.disabled]="$disabled() ? '' : undefined"
        [attr.readonly]="readonly() ? '' : undefined"
        (input)="onInput($event, i)"
        (keydown)="onKeyDown($event, i)"
        (paste)="onPaste($event, i)"
        (focus)="onSegmentFocus($event)"
      />
    }
  `,
  host: {
    "[class]": "cx('root')",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UInputOtp extends UBaseEditableHolder {
  protected override readonly componentName = "input-otp";
  protected override readonly styleModule = inputOtpStyleModule;

  /** Number of characters to initiate. */
  length = input<number>(4);
  /** Mask pattern — when true, each segment renders as `type="password"`. */
  mask = input<boolean, boolean>(false, { transform: booleanAttribute });
  /** When present, it specifies that an input field is integer-only. */
  integerOnly = input<boolean, boolean>(false, { transform: booleanAttribute });
  /** When present, it specifies that an input field is read-only. */
  readonly = input<boolean | undefined>(undefined, { transform: booleanAttribute });

  /** Callback to invoke on value change. */
  onChange = output<{ value: string }>();
  /** Callback to invoke when the component receives focus. */
  onFocus = output<Event>();
  /** Callback to invoke when the component loses focus. */
  onBlur = output<Event>();

  /** Own local state — one character token per segment, matching real source's own `tokens` array. */
  private readonly tokens = signal<string[]>([]);

  readonly inputMode = computed(() => (this.integerOnly() ? "numeric" : "text"));
  readonly inputType = computed(() => (this.mask() ? "password" : "text"));

  protected range(): number[] {
    return Array.from({ length: this.length() }, (_, index) => index);
  }

  protected getToken(i: number): string {
    return this.tokens()[i] ?? "";
  }

  protected onSegmentFocus(event: Event): void {
    (event.target as HTMLInputElement).select();
    this.onFocus.emit(event);
  }

  protected onInput(event: Event, index: number): void {
    const value = (event.target as HTMLInputElement).value;
    if (index === 0 && value.length > 1) {
      this.handlePaste(value, event);
      event.stopPropagation();
      return;
    }
    const next = [...this.tokens()];
    next[index] = value;
    this.tokens.set(next);
    this.updateModel(event);

    const inputEvent = event as InputEvent;
    if (inputEvent.inputType === "deleteContentBackward") {
      this.moveToPrev(index);
    } else if (
      inputEvent.inputType === "insertText" ||
      inputEvent.inputType === "deleteContentForward"
    ) {
      this.moveToNext(index);
    }
  }

  protected onKeyDown(event: KeyboardEvent, index: number): void {
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    switch (event.key) {
      case "ArrowLeft":
        this.moveToPrev(index);
        event.preventDefault();
        break;
      case "ArrowUp":
      case "ArrowDown":
        event.preventDefault();
        break;
      case "Backspace": {
        const target = event.target as HTMLInputElement;
        if (target.value.length === 0) {
          this.moveToPrev(index);
          event.preventDefault();
        }
        break;
      }
      case "ArrowRight":
        this.moveToNext(index);
        event.preventDefault();
        break;
      default: {
        const target = event.target as HTMLInputElement;
        const hasSelection = target.selectionStart !== target.selectionEnd;
        const isAtMaxLength = this.tokens().join("").length >= this.length();
        const isValidKey = this.integerOnly() ? /^[0-9]$/.test(event.key) : true;
        if (event.key.length === 1 && (!isValidKey || (isAtMaxLength && !hasSelection))) {
          event.preventDefault();
        }
        break;
      }
    }
  }

  protected onPaste(event: ClipboardEvent, index: number): void {
    if (this.$disabled() || this.readonly()) return;
    const pasted = event.clipboardData?.getData("text") ?? "";
    if (pasted.length) {
      this.handlePaste(pasted, event);
    }
    event.preventDefault();
  }

  private handlePaste(paste: string, event: Event): void {
    const pastedCode = paste.substring(0, this.length());
    const isValid = !this.integerOnly() || /^\d*$/.test(pastedCode);
    if (isValid) {
      this.tokens.set(pastedCode.split(""));
      this.updateModel(event);
    }
  }

  private updateModel(event: Event): void {
    const newValue = this.tokens().join("");
    this.writeModelValue(newValue);
    this.onModelChange(newValue);
    this.onChange.emit({ value: newValue });
    void event;
  }

  private moveToPrev(index: number): void {
    if (index > 0) {
      this.focusSegment(index - 1);
    }
  }

  private moveToNext(index: number): void {
    if (index < this.length() - 1) {
      this.focusSegment(index + 1);
    }
  }

  private focusSegment(index: number): void {
    const inputs = this.el.nativeElement.querySelectorAll("input");
    const target = inputs[index] as HTMLInputElement | undefined;
    target?.focus();
    target?.select();
  }

  override writeControlValue(value: unknown, setModelValue: (value: unknown) => void): void {
    let tokens: string[];
    if (value) {
      if (Array.isArray(value)) {
        tokens = value.slice(0, this.length());
      } else {
        tokens = String(value).split("").slice(0, this.length());
      }
    } else {
      tokens = [];
    }
    this.tokens.set(tokens);
    setModelValue(tokens.join(""));
  }
}
