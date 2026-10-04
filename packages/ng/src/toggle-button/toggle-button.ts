import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  ViewEncapsulation,
  booleanAttribute,
  input,
  signal,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { UBaseEditableHolder } from "@ultimate/ng-core";
import { toggleButtonStyleModule } from "./toggle-button-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `ToggleButton` component (see
 * `.vendor-extracted/ng/togglebutton/togglebutton.ts`). Renders a single
 * `<span class="u-toggle-button-content">` host wrapper (host element itself
 * is the interactive `role="button"` element, matching upstream's own
 * `host: {'[attr.role]': '"button"'}` shape) with a label span — extends
 * `UBaseEditableHolder`, confirmed against real source:
 * `ToggleButton extends BaseEditableHolder<ToggleButtonPassThrough>`, same
 * tier `UCheckbox`/`URadioButton` extend, not `UBaseInput`.
 *
 * Deliberately excludes upstream's icon/content `<ng-template>`/
 * `ContentChild` template-override system, `onIcon`/`offIcon`/`iconPos`,
 * `ariaLabelledBy`/`styleClass`/`inputId`/`tabindex`/`autofocus`/`size`/
 * `allowEmpty`/`fluid` inputs, and the `onChange` custom `output()` —
 * outside this task's minimal Checkbox-pattern surface (matching the same
 * "deliberately excludes a much larger prop surface" precedent `UCheckbox`
 * and `URadioButton` already establish). Retains `onLabel`/`offLabel`
 * (upstream's own defaults `'Yes'`/`'No'`) since the label is the only
 * visible content this minimal surface renders.
 *
 * Host acts as the interactive element directly (`role="button"`,
 * `tabindex`, click/keydown handlers) rather than wrapping a native
 * `<button>` — matches upstream's own host-driven interaction model
 * (`@HostListener('click')`/`@HostListener('keydown')` on the component
 * itself, not a child element).
 */
@Component({
  standalone: true,
  selector: "u-toggle-button",
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: UToggleButton, multi: true }],
  template: `
    <span [class]="cx('content')">
      <span [class]="cx('label')">{{ checked() ? onLabel() : offLabel() }}</span>
    </span>
  `,
  host: {
    "[class]": "cx('root', classesParams())",
    "[attr.role]": "'button'",
    "[attr.aria-pressed]": "checked() ? 'true' : 'false'",
    "[attr.tabindex]": "$disabled() ? -1 : 0",
    "(click)": "handleToggle()",
    "(keydown.enter)": "handleKeydown($event)",
    "(keydown.space)": "handleKeydown($event)",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UToggleButton extends UBaseEditableHolder {
  protected override readonly componentName = "togglebutton";
  protected override readonly styleModule = toggleButtonStyleModule;

  /** Label for the on state. */
  onLabel = input<string>("Yes");
  /** Label for the off state. */
  offLabel = input<string>("No");
  /** Spans 100% width of the container when enabled. */
  fluid = input(false, { transform: booleanAttribute });

  /** Current checked state, reflected by the host and CVA. */
  readonly checked = signal(false);

  protected classesParams() {
    return { checked: this.checked(), disabled: this.$disabled(), fluid: this.fluid() };
  }

  /** Writes a CVA-driven value into `checked` and, via `setModelValue`, into `modelValue`. */
  override writeControlValue(value: unknown, setModelValue: (value: unknown) => void): void {
    this.checked.set(!!value);
    setModelValue(value);
  }

  @HostListener("blur")
  protected handleBlur(): void {
    this.onModelTouched();
  }

  protected handleKeydown(event: Event): void {
    event.preventDefault();
    this.handleToggle();
  }

  protected handleToggle(): void {
    if (this.$disabled()) {
      return;
    }
    const next = !this.checked();
    this.checked.set(next);
    this.writeModelValue(next);
    this.onModelChange(next);
    this.onModelTouched();
  }
}
