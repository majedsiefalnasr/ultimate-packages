import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  input,
  output,
} from "@angular/core";
import { UBaseComponent, USpinnerIcon } from "@ultimate/ng-core";
import { URipple } from "../ripple";
import { buttonStyleModule } from "./button-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `Button` component (see
 * `.vendor-extracted/ng/button/button.ts`, lines 576-917 — the `Button`
 * class specifically, not the file's `ButtonDirective`/`ButtonLabel`/
 * `ButtonIcon` directives, which are out of scope for this task's file
 * list). Renders a native `<button>` element (matching PrimeNG's own
 * template, not a `<div>` with an ARIA role).
 *
 * Deliberately excludes PrimeNG's passthrough (`pt`/`ptm`/`Bind`) system,
 * `buttonProps` bulk-props input, `badge`/`badgeSeverity`/`badgeClass`
 * inputs, `type`/`style`/`styleClass`/`tabindex`/`variant`/`link`/`plain`
 * inputs, `autofocus` input, and content-template
 * (`contentTemplate`/`iconTemplate`/`loadingIconTemplate`) support — none of
 * these appear in this task's Interfaces section, which defines a smaller,
 * spec-mandated signal-input surface. `ariaLabel` is likewise not a listed
 * input; per this task's test (`has aria-label reflecting the label input
 * when no explicit ariaLabel is set`), the native `<button>` falls back to
 * its text content for its accessible name (no explicit `aria-label`
 * attribute is rendered), which satisfies that assertion's `??` fallback.
 *
 * DISCREPANCY (brief vs. working code): Step 5 instructs importing all of
 * `URipple`/`UAutoFocus`/`UFluid`/`UBadge`/`USpinnerIcon` into `imports`.
 * Only `URipple`/`USpinnerIcon` are imported here — `UAutoFocus`, `UFluid`,
 * and `UBadge` are deliberately excluded because none can be applied in the
 * template without inputs this task's own Interfaces section omits (no
 * `autofocus` or `badge` input is listed for `UButton`):
 *   - An Angular standalone component with an `imports` entry that no
 *     element in its template references fails compilation with `NG8113`
 *     ("X is not used within the template") — confirmed by actually adding
 *     all 5 and rebuilding (verified in Task 12's test run), not assumed.
 *   - Applying `UAutoFocus`'s bare `uAutoFocus` selector (no `[..]="..."`
 *     binding) to silence that warning is NOT inert: its
 *     `autofocus = input(false, { alias: "uAutoFocus", transform:
 *     booleanAttribute })` reads the bare attribute as the truthy string
 *     `""`, which `booleanAttribute` coerces to `true` — calling `.focus()`
 *     on every `UButton` unconditionally on init, a real, unintended
 *     behavior change, not a documentation nit (confirmed against
 *     `UAutoFocus`'s own spec, which binds `[uAutoFocus]="true"` explicitly
 *     to trigger that same behavior).
 *   - PrimeNG's real `Button` never renders a `<p-fluid>` element itself —
 *     it DI-injects `Fluid` (`inject(Fluid, { optional, host, skipSelf })`,
 *     `.vendor-extracted/ng/button/button.ts` line 851) purely to detect an
 *     *ancestor* `<p-fluid>` wrapper, a host-DI-lookup mechanism
 *     `UBaseComponent`'s scoped-down Option B architecture has no
 *     equivalent for. `UButton`'s own `fluid` input already drives
 *     `.u-button-fluid` directly via `ButtonStyle`'s `classes.root`.
 *   - Real PrimeNG's `<p-badge>` is rendered only conditionally on a
 *     `badge` input this task's Interfaces section doesn't define.
 * A future task adding `autofocus`/`fluid`-wrapper/`badge` support to
 * `UButton` can add these imports back alongside the corresponding inputs.
 */
@Component({
  standalone: true,
  selector: "u-button",
  imports: [URipple, USpinnerIcon],
  template: `
    <button
      type="button"
      [class]="cx('root', classesParams())"
      [disabled]="disabled() || loading()"
      uRipple
      (click)="handleClick($event)"
      (focus)="onFocus.emit($event)"
      (blur)="onBlur.emit($event)"
    >
      @if (loading()) {
        <u-spinner-icon [class]="cx('loadingIcon')" spin aria-hidden="true" />
      } @else if (icon()) {
        <span [class]="icon() + ' ' + cx('icon', classesParams())"></span>
      }
      @if (label()) {
        <span [class]="cx('label')">{{ label() }}</span>
      }
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UButton extends UBaseComponent {
  protected override readonly componentName = "button";
  protected override readonly styleModule = buttonStyleModule;

  /** Text of the button. */
  label = input<string>();
  /** Name of the icon. */
  icon = input<string>();
  /** Position of the icon. */
  iconPos = input<"left" | "right" | "top" | "bottom">("left");
  /** Whether the button is in loading state. */
  loading = input(false, { transform: booleanAttribute });
  /** When present, it specifies that the component should be disabled. */
  disabled = input(false, { transform: booleanAttribute });
  /** Defines the style of the button. */
  severity = input<string>();
  /** Add a shadow to indicate elevation. */
  raised = input(false, { transform: booleanAttribute });
  /** Add a circular border radius to the button. */
  rounded = input(false, { transform: booleanAttribute });
  /** Add a textual class to the button without a background initially. */
  text = input(false, { transform: booleanAttribute });
  /** Add a border class without a background initially. */
  outlined = input(false, { transform: booleanAttribute });
  /** Defines the size of the button. */
  size = input<"small" | "large">();
  /** Spans 100% width of the container when enabled. */
  fluid = input(false, { transform: booleanAttribute });

  /** Callback to execute when button is clicked. */
  onClick = output<MouseEvent>();
  /** Callback to execute when button is focused. */
  onFocus = output<FocusEvent>();
  /** Callback to execute when button loses focus. */
  onBlur = output<FocusEvent>();

  protected get hasIcon(): boolean {
    return !!this.icon();
  }

  protected classesParams() {
    return {
      hasIcon: this.hasIcon,
      label: this.label(),
      loading: this.loading(),
      severity: this.severity(),
      raised: this.raised(),
      rounded: this.rounded(),
      text: this.text(),
      outlined: this.outlined(),
      size: this.size(),
      fluid: this.fluid(),
      iconPos: this.iconPos(),
    };
  }

  protected handleClick(event: MouseEvent): void {
    if (this.disabled() || this.loading()) {
      return;
    }
    this.onClick.emit(event);
  }
}
