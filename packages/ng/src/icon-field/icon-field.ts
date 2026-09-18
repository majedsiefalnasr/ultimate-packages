import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { iconFieldStyleModule, inputIconStyleModule } from "./icon-field-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `IconField` (see
 * `.vendor-extracted/ng/iconfield/iconfield.ts`, extracted this session via
 * `scripts/provenance/extract-primeng-source.mjs`). IconField wraps an input
 * and an icon (`UInputIcon`, below) — an input decoration wrapper, not a
 * form control itself.
 *
 * Real source extends bare `BaseComponent<IconFieldPassThrough>` — no
 * `ControlValueAccessor`/model-holder tier, only an `iconPosition` input
 * (default `'left'`) and `<ng-content>` projection. Icon positioning
 * (leading/trailing) is resolved entirely by CSS `:first-child`/`:last-
 * child` selectors against DOM order (see `icon-field-style.ts`) — real
 * source's own `iconPosition` input exists only to add a `u-icon-field-
 * left`/`u-icon-field-right` root class for consumer styling hooks; it is
 * not consulted by the shared `.p-inputicon:first-child`/`:last-child` CSS
 * itself, which real source's own `IconFieldStyle` confirms operates purely
 * on sibling DOM order.
 */
@Component({
  standalone: true,
  selector: "u-icon-field",
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('root')",
  },
})
export class UIconField extends UBaseComponent {
  protected override readonly componentName = "icon-field";
  protected override readonly styleModule = iconFieldStyleModule;

  /** Position of the icon relative to the input. */
  iconPosition = input<"left" | "right">("left");
}

/**
 * Ultimate-owned adaptation of PrimeNG's `InputIcon` (see
 * `.vendor-extracted/ng/inputicon/inputicon.ts`). InputIcon displays an
 * icon, typically projected inside a `UIconField` as its first or last
 * child — the CSS driving its leading/trailing position via DOM order (see
 * `icon-field-style.ts`).
 *
 * Real source extends bare `BaseComponent<InputIconPassThrough>` — no
 * CVA/controlled-value concept, only `<ng-content>` projection.
 */
@Component({
  standalone: true,
  selector: "u-input-icon",
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('root')",
  },
})
export class UInputIcon extends UBaseComponent {
  protected override readonly componentName = "input-icon";
  protected override readonly styleModule = inputIconStyleModule;
}
