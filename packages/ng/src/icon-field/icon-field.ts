import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  inject,
  input,
} from "@angular/core";
import { UBaseComponent, UBind, U_PARENT_INSTANCE } from "@ultimate/ng-core";
import { iconFieldStyleModule, inputIconStyleModule } from "./icon-field-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `IconField` (see
 * `iconfield/iconfield.ts`). IconField wraps an input and an icon
 * (`UInputIcon`, below) — an input decoration wrapper, not a form control
 * itself.
 *
 * Real source extends bare `BaseComponent<IconFieldPassThrough>` — no
 * `ControlValueAccessor`/model-holder tier, only an `iconPosition` input
 * (default `'left'`) and `<ng-content>` projection. Icon positioning
 * (leading/trailing) is resolved entirely by CSS `:first-child`/
 * `:last-child` selectors against DOM order (see
 * `@ultimate/uix-styles/iconfield`); `iconPosition` only adds the
 * `u-icon-field-left` or `u-icon-field-right` root class as a styling hook,
 * as in PrimeNG.
 *
 * `pt`, `unstyled` and `dt` come from `UBaseComponent`; the root section is
 * bound through the `UBind` host directive, and the component provides
 * itself as `U_PARENT_INSTANCE`, as PrimeNG's `PARENT_INSTANCE` does. The
 * nested `ICONFIELD_INSTANCE` token has no consumer and is not provided
 * (ADR-091).
 */
@Component({
  standalone: true,
  selector: "u-icon-field",
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: U_PARENT_INSTANCE, useExisting: UIconField }],
  host: {
    "[class]": "cx('root', { iconPosition: iconPosition() })",
  },
  hostDirectives: [UBind],
})
export class UIconField extends UBaseComponent {
  protected override readonly componentName = "iconfield";
  protected override readonly styleModule = iconFieldStyleModule;

  private readonly bindDirective = inject(UBind, { self: true });

  /** Position of the icon relative to the input. */
  iconPosition = input<"left" | "right">("left");

  ngAfterViewChecked(): void {
    this.bindDirective.setAttrs(this.ptms(["host", "root"]));
  }
}

/**
 * Ultimate-owned adaptation of PrimeNG's `InputIcon` (see
 * `inputicon/inputicon.ts`). InputIcon displays an icon, typically
 * projected inside a `UIconField` as its first or last child — the CSS
 * driving its leading/trailing position via DOM order (see
 * `@ultimate/uix-styles/iconfield`).
 *
 * Real source extends bare `BaseComponent<InputIconPassThrough>` — no
 * CVA/controlled-value concept, only `<ng-content>` projection. The host is
 * `aria-hidden="true"` by default because the icon is decorative (ADR-091);
 * an `aria-hidden` attribute written on the element in the template or set
 * through `pt` replaces it.
 */
@Component({
  standalone: true,
  selector: "u-input-icon",
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: U_PARENT_INSTANCE, useExisting: UInputIcon }],
  host: {
    "aria-hidden": "true",
    "[class]": "cx('root')",
  },
  hostDirectives: [UBind],
})
export class UInputIcon extends UBaseComponent {
  protected override readonly componentName = "inputicon";
  protected override readonly styleModule = inputIconStyleModule;

  private readonly bindDirective = inject(UBind, { self: true });

  ngAfterViewChecked(): void {
    this.bindDirective.setAttrs(this.ptms(["host", "root"]));
  }
}
