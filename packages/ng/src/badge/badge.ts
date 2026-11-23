import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  inject,
  input,
} from "@angular/core";
import { UBaseComponent, UBind, U_PARENT_INSTANCE } from "@ultimate/ng-core";
import { badgeStyleModule } from "./badge-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `Badge` component and `BadgeDirective`
 * (see `.vendor-extracted/ng/badge/badge.ts`). A small status indicator for
 * another element.
 *
 * `pt`, `unstyled` and `dt` come from `UBaseComponent`; the root section is
 * bound through the `UBind` host directive. The attribute form lives with the
 * overlay wrapper as `UBadgeDirective` (`[uBadge]`, ADR-088). `styleClass` is
 * not offered; the host takes a normal `class`.
 */
@Component({
  standalone: true,
  selector: "u-badge",
  template: `{{ value() }}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: U_PARENT_INSTANCE, useExisting: UBadge }],
  host: {
    "[class]":
      "cx('root', { value: value(), size: size(), badgeSize: badgeSize(), severity: severity() })",
    "[style.display]": "badgeDisabled() ? 'none' : null",
  },
  hostDirectives: [UBind],
})
export class UBadge extends UBaseComponent {
  protected override readonly componentName = "badge";
  protected override readonly styleModule = badgeStyleModule;

  private readonly bindDirective = inject(UBind, { self: true });

  /** Size of the badge, valid options are "small", "large" and "xlarge". */
  badgeSize = input<"small" | "large" | "xlarge" | null>();
  /**
   * Size of the badge, valid options are "small", "large" and "xlarge".
   * @deprecated use `badgeSize` instead.
   */
  size = input<"small" | "large" | "xlarge" | null>();
  /** Severity type of the badge. */
  severity = input<"secondary" | "info" | "success" | "warn" | "danger" | "contrast" | null>();
  /** Value to display inside the badge. */
  value = input<string | number | null>();
  /** When specified, disables the component. */
  badgeDisabled = input<boolean, boolean>(false, { transform: booleanAttribute });

  ngAfterViewChecked(): void {
    this.bindDirective.setAttrs(this.ptms(["host", "root"]));
  }
}
