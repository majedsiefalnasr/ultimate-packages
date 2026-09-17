import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { UBaseInput, UOverlay } from "@ultimate/ng-core";
import { passwordStyleModule } from "./password-style";

type PasswordStrength = "weak" | "medium" | "strong" | null;

/**
 * Ultimate-owned adaptation of PrimeNG's `Password` component (see
 * `.vendor-extracted/ng/password/password.ts`). Real source extends
 * `BaseInput` directly (`export class Password extends
 * BaseInput<PasswordPassThrough>`) — same tier `UInputNumber` already
 * proves — not `BaseEditableHolder` like `UToggleSwitch`/`UInputOtp`. This
 * component follows that same tier exactly: `UBaseInput`.
 *
 * Renders a native `<input type="password">` (toggled to `type="text"` when
 * unmasked) plus a strength-meter overlay, composed via `UOverlay`
 * (`packages/ng-core/src/overlay/overlay.ts`) — the same foundation-tier
 * overlay primitive `UDialog` composes (`packages/ng/src/dialog/dialog.ts`),
 * matching this task's brief to reuse the established overlay-composition
 * pattern rather than inventing one. Unlike `UDialog`, the overlay here is
 * non-modal and has no focus trap, matching real source (`Overlay` used
 * without a `pFocusTrap`/`FocusTrap` directive anywhere in the extracted
 * `password.ts`).
 *
 * Strength scoring (`testStrength`) is ported verbatim from real source's
 * own `mediumRegex`/`strongRegex` two-tier classification (medium: any two
 * of lower/upper/digit; strong: lower+upper+digit, 8+ chars) — not the
 * directive form's separate `testStrength()` weighted-grade algorithm
 * (`PasswordDirective`, same file, a different, un-ported artifact — this
 * task builds only the `Password` *component*, not the `[pPassword]`
 * directive, matching the spec's Interfaces scope).
 *
 * Deliberately excludes real source's much larger surface: the
 * `PasswordDirective` (`[pPassword]`) attribute-directive form entirely,
 * `ContentChild` header/content/footer template projection, passthrough
 * (`pt`), `NgModule`, `overlayOptions`/`motionOptions` overlay
 * configuration, `dropdownMode`/i18n `TranslationKeys` lookup (labels are
 * plain string inputs with literal defaults instead), and animation timing
 * options — matching every sibling component's established "smaller surface
 * than upstream" precedent (`UToggleSwitch`, `UInputOtp`, `UInputNumber`).
 */
@Component({
  standalone: true,
  selector: "u-password",
  imports: [UOverlay],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: UPassword, multi: true }],
  template: `
    <input
      #input
      type="text"
      [attr.type]="unmasked() ? 'text' : 'password'"
      [class]="cx('pcInputText')"
      [value]="modelValue() ?? ''"
      [attr.placeholder]="placeholder()"
      [attr.id]="inputId()"
      [attr.disabled]="$disabled() ? '' : undefined"
      [attr.aria-label]="ariaLabel()"
      (input)="onInput($event)"
      (focus)="onInputFocus()"
      (blur)="onInputBlur()"
      (keyup)="onKeyUp($event)"
    />
    @if (toggleMask()) {
      @if (unmasked()) {
        <svg
          [class]="cx('maskIcon')"
          (click)="onMaskToggle()"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          role="button"
          aria-label="Hide Password"
        >
          <g clip-path="url(#u-password-eyeslash-clip)">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M13.9414 6.74792C13.9437 6.75295 13.9455 6.757 13.9469 6.76003C13.982 6.8394 14.0001 6.9252 14.0001 7.01195C14.0001 7.0987 13.982 7.1845 13.9469 7.26386C13.6004 8.00059 13.1711 8.69549 12.6674 9.33515C12.6115 9.4071 12.54 9.46538 12.4582 9.50556C12.3765 9.54574 12.2866 9.56678 12.1955 9.56707C12.0834 9.56671 11.9737 9.53496 11.8788 9.47541C11.7838 9.41586 11.7074 9.3309 11.6583 9.23015C11.6092 9.12941 11.5893 9.01691 11.6008 8.90543C11.6124 8.79394 11.6549 8.68793 11.7237 8.5994C12.1065 8.09726 12.4437 7.56199 12.7313 6.99995C12.2595 6.08027 10.3402 2.8014 6.99732 2.8014C6.63723 2.80218 6.27816 2.83969 5.92569 2.91336C5.77666 2.93304 5.62568 2.89606 5.50263 2.80972C5.37958 2.72337 5.29344 2.59398 5.26125 2.44714C5.22907 2.30031 5.2532 2.14674 5.32885 2.01685C5.40451 1.88696 5.52618 1.79021 5.66978 1.74576C6.10574 1.64961 6.55089 1.60134 6.99732 1.60181C11.5916 1.60181 13.7864 6.40856 13.9414 6.74792ZM2.20333 1.61685C2.35871 1.61411 2.5091 1.67179 2.6228 1.77774L12.2195 11.3744C12.3318 11.4869 12.3949 11.6393 12.3949 11.7983C12.3949 11.9572 12.3318 12.1097 12.2195 12.2221C12.107 12.3345 11.9546 12.3976 11.7956 12.3976C11.6367 12.3976 11.4842 12.3345 11.3718 12.2221L10.5081 11.3584C9.46549 12.0426 8.24432 12.4042 6.99729 12.3981C2.403 12.3981 0.208197 7.59135 0.0532336 7.25198C0.0509364 7.24694 0.0490875 7.2429 0.0476856 7.23986C0.0162332 7.16518 3.05176e-05 7.08497 3.05176e-05 7.00394C3.05176e-05 6.92291 0.0162332 6.8427 0.0476856 6.76802C0.631261 5.47831 1.46902 4.31959 2.51084 3.36119L1.77509 2.62545C1.66914 2.51175 1.61146 2.36136 1.61421 2.20597C1.61695 2.05059 1.6799 1.90233 1.78979 1.79244C1.89968 1.68254 2.04794 1.6196 2.20333 1.61685ZM7.45314 8.35147L5.68574 6.57609V6.5361C5.5872 6.78938 5.56498 7.06597 5.62183 7.33173C5.67868 7.59749 5.8121 7.84078 6.00563 8.03158C6.19567 8.21043 6.43052 8.33458 6.68533 8.39089C6.94014 8.44721 7.20543 8.43359 7.45314 8.35147ZM1.26327 6.99994C1.7351 7.91163 3.64645 11.1985 6.99729 11.1985C7.9267 11.2048 8.8408 10.9618 9.64438 10.4947L8.35682 9.20718C7.86027 9.51441 7.27449 9.64491 6.69448 9.57752C6.11446 9.51014 5.57421 9.24881 5.16131 8.83592C4.74842 8.42303 4.4871 7.88277 4.41971 7.30276C4.35232 6.72274 4.48282 6.13697 4.79005 5.64041L3.35855 4.2089C2.4954 5.00336 1.78523 5.94935 1.26327 6.99994Z"
              fill="currentColor"
            />
          </g>
        </svg>
      } @else {
        <svg
          [class]="cx('unmaskIcon')"
          (click)="onMaskToggle()"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          role="button"
          aria-label="Show Password"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M0.0535499 7.25213C0.208567 7.59162 2.40413 12.4 7 12.4C11.5959 12.4 13.7914 7.59162 13.9465 7.25213C13.9487 7.2471 13.9506 7.24304 13.952 7.24001C13.9837 7.16396 14 7.08239 14 7.00001C14 6.91762 13.9837 6.83605 13.952 6.76001C13.9506 6.75697 13.9487 6.75292 13.9465 6.74788C13.7914 6.4084 11.5959 1.60001 7 1.60001C2.40413 1.60001 0.208567 6.40839 0.0535499 6.74788C0.0512519 6.75292 0.0494023 6.75697 0.048 6.76001C0.0163137 6.83605 0 6.91762 0 7.00001C0 7.08239 0.0163137 7.16396 0.048 7.24001C0.0494023 7.24304 0.0512519 7.2471 0.0535499 7.25213ZM7 11.2C3.664 11.2 1.736 7.92001 1.264 7.00001C1.736 6.08001 3.664 2.80001 7 2.80001C10.336 2.80001 12.264 6.08001 12.736 7.00001C12.264 7.92001 10.336 11.2 7 11.2ZM5.55551 9.16182C5.98308 9.44751 6.48576 9.6 7 9.6C7.68891 9.59789 8.349 9.32328 8.83614 8.83614C9.32328 8.349 9.59789 7.68891 9.59999 7C9.59999 6.48576 9.44751 5.98308 9.16182 5.55551C8.87612 5.12794 8.47006 4.7947 7.99497 4.59791C7.51988 4.40112 6.99711 4.34963 6.49276 4.44995C5.98841 4.55027 5.52513 4.7979 5.16152 5.16152C4.7979 5.52513 4.55027 5.98841 4.44995 6.49276C4.34963 6.99711 4.40112 7.51988 4.59791 7.99497C4.7947 8.47006 5.12794 8.87612 5.55551 9.16182ZM6.2222 5.83594C6.45243 5.6821 6.7231 5.6 7 5.6C7.37065 5.6021 7.72553 5.75027 7.98762 6.01237C8.24972 6.27446 8.39789 6.62934 8.4 7C8.4 7.27689 8.31789 7.54756 8.16405 7.77779C8.01022 8.00802 7.79157 8.18746 7.53575 8.29343C7.27994 8.39939 6.99844 8.42711 6.72687 8.37309C6.4553 8.31908 6.20584 8.18574 6.01005 7.98994C5.81425 7.79415 5.68091 7.54469 5.6269 7.27312C5.57288 7.00155 5.6006 6.72006 5.70656 6.46424C5.81253 6.20842 5.99197 5.98977 6.2222 5.83594Z"
            fill="currentColor"
          />
        </svg>
      }
    }
    @if (renderOverlay()) {
      <div uOverlay [visible]="overlayVisible()" appendTo="body" [class]="cx('overlay')">
        <div [class]="cx('meter')">
          <div [class]="cx('meterLabel', meterClassesParams())" [style.width]="meterWidth()"></div>
        </div>
        <div [class]="cx('meterText')">{{ infoText() }}</div>
      </div>
    }
    <svg
      style="display:none"
      width="0"
      height="0"
      aria-hidden="true"
    >
      <clipPath id="u-password-eyeslash-clip">
        <rect width="14" height="14" fill="white" />
      </clipPath>
    </svg>
  `,
  host: {
    "[class]": "cx('root', classesParams())",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UPassword extends UBaseInput {
  protected override readonly componentName = "password";
  protected override readonly styleModule = passwordStyleModule;

  /** Label of the input for accessibility. */
  ariaLabel = input<string>();
  /** Identifier of the accessible input element. */
  inputId = input<string>();
  /** Advisory information to display on input. */
  placeholder = input<string>();
  /** Whether to show the strength indicator or not. */
  feedback = input(true, { transform: booleanAttribute });
  /** Whether to show an icon to display the password as plain text. */
  toggleMask = input(false, { transform: booleanAttribute });
  /** Text to prompt password entry. */
  promptLabel = input("Enter a password");
  /** Text for a weak password. */
  weakLabel = input("Weak");
  /** Text for a medium password. */
  mediumLabel = input("Medium");
  /** Text for a strong password. */
  strongLabel = input("Strong");
  /** Regex value for medium strength, matching real source's own default. */
  mediumRegex = input(
    "^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})"
  );
  /** Regex value for strong strength, matching real source's own default. */
  strongRegex = input("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})");

  /** Callback to invoke when the component receives focus. */
  onFocus = output<Event>();
  /** Callback to invoke when the component loses focus. */
  onBlur = output<Event>();

  @ViewChild("input") private inputRef?: ElementRef<HTMLInputElement>;

  protected readonly unmasked = signal(false);
  protected readonly overlayVisible = signal(false);
  protected readonly meter = signal<{ strength: PasswordStrength; width: string } | null>(null);
  protected readonly infoText = signal(this.promptLabel());

  /** Gates the overlay DOM's presence — only meaningful once `feedback()` is enabled. */
  protected readonly renderOverlay = computed(() => this.feedback());

  protected readonly meterWidth = computed(() => this.meter()?.width ?? "");

  protected classesParams() {
    return {
      filled: this.$filled(),
      invalid: false,
      fluid: this.hasFluid,
      disabled: this.$disabled(),
    };
  }

  protected meterClassesParams() {
    return { strength: this.meter()?.strength ?? null };
  }

  protected onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.writeModelValue(value);
    this.onModelChange(value);
    if (this.feedback()) {
      this.updateUI(value);
    }
  }

  protected onInputFocus(): void {
    if (this.feedback()) {
      this.overlayVisible.set(true);
    }
  }

  protected onInputBlur(): void {
    if (this.feedback()) {
      this.overlayVisible.set(false);
    }
    this.onModelTouched();
  }

  protected onKeyUp(event: KeyboardEvent): void {
    if (!this.feedback()) {
      return;
    }
    const value = (event.target as HTMLInputElement).value;
    this.updateUI(value);

    if (event.code === "Escape") {
      this.overlayVisible.set(false);
      return;
    }
    if (!this.overlayVisible()) {
      this.overlayVisible.set(true);
    }
  }

  protected onMaskToggle(): void {
    this.unmasked.set(!this.unmasked());
  }

  /** Matches real source's own two-tier `testStrength` (medium/strong regex, else weak-if-nonempty). */
  private testStrength(value: string): 0 | 1 | 2 | 3 {
    if (!value || value.length === 0) {
      return 0;
    }
    if (new RegExp(this.strongRegex()).test(value)) {
      return 3;
    }
    if (new RegExp(this.mediumRegex()).test(value)) {
      return 2;
    }
    return 1;
  }

  private updateUI(value: string): void {
    switch (this.testStrength(value)) {
      case 1:
        this.meter.set({ strength: "weak", width: "33.33%" });
        this.infoText.set(this.weakLabel());
        break;
      case 2:
        this.meter.set({ strength: "medium", width: "66.66%" });
        this.infoText.set(this.mediumLabel());
        break;
      case 3:
        this.meter.set({ strength: "strong", width: "100%" });
        this.infoText.set(this.strongLabel());
        break;
      default:
        this.meter.set(null);
        this.infoText.set(this.promptLabel());
        break;
    }
  }

  override writeControlValue(value: unknown, setModelValue: (value: unknown) => void): void {
    const stringValue = value == null ? "" : String(value);
    setModelValue(stringValue);
    if (this.inputRef) {
      this.inputRef.nativeElement.value = stringValue;
    }
    if (this.feedback()) {
      this.updateUI(stringValue);
    }
  }
}
