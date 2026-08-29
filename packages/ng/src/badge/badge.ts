import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  input,
} from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { badgeStyleModule } from "./badge-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `Badge` component (see
 * `.vendor-extracted/ng/badge/badge.ts`). A small status indicator for
 * another element.
 *
 * Deliberately excludes PrimeNG's `BadgeDirective` (the `[pBadge]`
 * attribute form for attaching a badge to another element — this Phase 2
 * proof set only needs the `u-badge` component form, per this task's file
 * list), `Bind`/passthrough `hostDirectives` wiring, and
 * `BADGE_INSTANCE`/`PARENT_INSTANCE` injection-token parent lookup — see
 * `UBaseComponent`'s doc comment for the same architectural exclusion
 * pattern (Option B).
 */
@Component({
  standalone: true,
  selector: "u-badge",
  template: `{{ value() }}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]":
      "cx('root', { value: value(), size: size(), badgeSize: badgeSize(), severity: severity() })",
    "[style.display]": "badgeDisabled() ? 'none' : null",
  },
})
export class UBadge extends UBaseComponent {
  protected override readonly componentName = "badge";
  protected override readonly styleModule = badgeStyleModule;

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
}
