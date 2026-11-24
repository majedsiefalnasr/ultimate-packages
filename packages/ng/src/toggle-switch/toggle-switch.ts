import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  numberAttribute,
  output,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { UBaseEditableHolder, UBind, U_PARENT_INSTANCE } from "@ultimate/ng-core";
import { UAutoFocus } from "@ultimate/ng/autofocus";
import { toggleSwitchStyleModule } from "./toggle-switch-style";

/** Payload of `onChange`: the native event and the value the switch now holds. */
export interface UToggleSwitchChangeEvent {
  originalEvent: Event;
  checked: unknown;
}

/** Context passed to the `#handle` template. */
export interface UToggleSwitchHandleContext {
  checked: boolean;
}

/**
 * Ultimate-owned adaptation of PrimeNG's `ToggleSwitch` component (see
 * `.vendor-extracted/ng/toggleswitch/toggleswitch.ts`). Renders a native
 * `<input type="checkbox" role="switch">` plus a `.u-toggle-switch-slider` /
 * `.u-toggle-switch-handle` pair — extends `UBaseEditableHolder`, the same
 * tier PrimeNG's `ToggleSwitch` extends.
 *
 * `checked()` derives from `modelValue() === trueValue()`, as PrimeNG's own
 * `checked()` does. The native input carries `id` (`inputId`), `name`,
 * `required`, `tabindex`, the accessible name (`ariaLabel`,
 * `ariaLabelledBy`) and `autofocus`; `readonly` blocks user edits and
 * `invalid` adds `p-invalid` and `aria-invalid`. The control is marked
 * touched on blur, not on change. `onChange` emits the native event with the
 * new value, and a `#handle` template replaces the handle content.
 *
 * `pt`, `unstyled` and `dt` come from `UBaseComponent`. The root section is
 * bound through the `UBind` host directive, the component provides itself as
 * `U_PARENT_INSTANCE`, and `input`, `slider` and `handle` bind their own
 * sections. The CSS is the shared `@ultimate/uix-styles/toggleswitch` module.
 *
 * Deliberately excludes PrimeNG's `styleClass` (deprecated), the ineffective
 * `size` input, and the `$pcToggleSwitch` instance token, which has no
 * consumer; each is recorded in the ToggleSwitch ADR.
 */
@Component({
  standalone: true,
  selector: "u-toggle-switch",
  imports: [NgTemplateOutlet, UBind, UAutoFocus],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: UToggleSwitch, multi: true },
    { provide: U_PARENT_INSTANCE, useExisting: UToggleSwitch },
  ],
  template: `
    <input
      type="checkbox"
      role="switch"
      [uBind]="ptm('input')"
      [class]="cx('input')"
      [attr.id]="inputId()"
      [checked]="checked()"
      [disabled]="$disabled()"
      [attr.required]="required() ? '' : null"
      [attr.name]="name()"
      [attr.tabindex]="tabindex()"
      [attr.aria-checked]="checked()"
      [attr.aria-labelledby]="ariaLabelledBy()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-invalid]="invalid() ? 'true' : null"
      [uAutoFocus]="autofocus()"
      (change)="handleChange($event)"
      (blur)="handleBlur()"
    />
    <div [uBind]="ptm('slider')" [class]="cx('slider')" [attr.data-p]="dataP()">
      <div [uBind]="ptm('handle')" [class]="cx('handle')" [attr.data-p]="dataP()">
        @if (handleTemplate(); as template) {
          <ng-container
            [ngTemplateOutlet]="template"
            [ngTemplateOutletContext]="{ checked: checked() }"
          ></ng-container>
        }
      </div>
    </div>
  `,
  host: {
    "[class]": "cx('root', classesParams())",
    "[attr.data-p-checked]": "checked()",
    "[attr.data-p-disabled]": "$disabled()",
    "[attr.data-p]": "dataP()",
  },
  hostDirectives: [UBind],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UToggleSwitch extends UBaseEditableHolder {
  protected override readonly componentName = "toggleswitch";
  protected override readonly styleModule = toggleSwitchStyleModule;

  private readonly bindDirective = inject(UBind, { self: true });

  /** Value in checked state. */
  trueValue = input<unknown>(true);
  /** Value in unchecked state. */
  falseValue = input<unknown>(false);
  /** Index of the native input in the tabbing order. */
  tabindex = input<number | undefined, unknown>(undefined, { transform: numberAttribute });
  /** Identifier of the native input, for an external `<label for>`. */
  inputId = input<string>();
  /** Name of the native input. */
  name = input<string>();
  /** Marks the native input as required. */
  required = input(false, { transform: booleanAttribute });
  /** Blocks user edits while keeping the control focusable. */
  readonly = input(false, { transform: booleanAttribute });
  /** Shows the invalid state. */
  invalid = input(false, { transform: booleanAttribute });
  /** Accessible name of the switch. */
  ariaLabel = input<string>();
  /** IDs of the elements that name the switch. */
  ariaLabelledBy = input<string>();
  /** Focuses the switch on load. */
  autofocus = input(false, { transform: booleanAttribute });

  /** Emitted when the user changes the value. */
  onChange = output<UToggleSwitchChangeEvent>();

  /** Template that replaces the handle content, written as `<ng-template #handle let-checked="checked">`. */
  protected readonly handleTemplate =
    contentChild<TemplateRef<UToggleSwitchHandleContext>>("handle");

  /** Derived directly from `modelValue`, matching real upstream's own `checked()` getter. */
  readonly checked = () => this.modelValue() === this.trueValue();

  protected readonly dataP = computed(() => {
    const flags = [
      this.checked() ? "checked" : "",
      this.$disabled() ? "disabled" : "",
      this.invalid() ? "invalid" : "",
    ].filter(Boolean);
    return flags.length ? flags.join(" ") : null;
  });

  ngAfterViewChecked(): void {
    this.bindDirective.setAttrs(this.ptms(["host", "root"]));
  }

  protected classesParams() {
    return { checked: this.checked(), disabled: this.$disabled(), invalid: this.invalid() };
  }

  /** Writes a CVA-driven value straight through to `modelValue` — `checked()` derives from it. */
  override writeControlValue(value: unknown, setModelValue: (value: unknown) => void): void {
    setModelValue(value);
  }

  protected handleChange(event: Event): void {
    if (this.$disabled() || this.readonly()) {
      (event.target as HTMLInputElement).checked = this.checked();
      return;
    }
    const next = this.checked() ? this.falseValue() : this.trueValue();
    this.writeModelValue(next);
    this.onModelChange(next);
    this.onChange.emit({ originalEvent: event, checked: next });
  }

  protected handleBlur(): void {
    this.onModelTouched();
  }
}
