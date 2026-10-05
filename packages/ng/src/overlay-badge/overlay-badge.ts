import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, input } from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { UBadge } from "@ultimate/ng/badge";
import { overlayBadgeStyleModule } from "./overlay-badge-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `OverlayBadge` component (see
 * `.vendor-extracted/ng/overlaybadge/overlaybadge.ts`). Confirmed against
 * real source: `OverlayBadge` is a small wrapper — a single `<div>` that
 * projects the host content (`<ng-content>`) and composes a `p-badge`
 * positioned absolutely at the content's top-right corner via CSS (real
 * source's own `overlaybadgestyle`), not a standalone visible component of
 * its own.
 *
 * This port composes the already-Built `UBadge` (`packages/ng/src/badge/`)
 * the same way real upstream composes `p-badge`, forwarding the same
 * severity/value/size/disabled surface `UBadge` already exposes.
 */
@Component({
  standalone: true,
  selector: "u-overlay-badge",
  imports: [UBadge],
  template: `
    <div [class]="cx('root')">
      <ng-content></ng-content>
      <u-badge
        [value]="value()"
        [severity]="severity()"
        [badgeSize]="badgeSize()"
        [badgeDisabled]="badgeDisabled()"
      ></u-badge>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UOverlayBadge extends UBaseComponent {
  protected override readonly componentName = "overlaybadge";
  protected override readonly styleModule = overlayBadgeStyleModule;

  /** Value to display inside the badge. */
  value = input<string | number | null>();
  /** Severity type of the badge. */
  severity = input<"secondary" | "info" | "success" | "warn" | "danger" | "contrast" | null>();
  /** Size of the badge, valid options are "small", "large" and "xlarge". */
  badgeSize = input<"small" | "large" | "xlarge" | null>();
  /** When specified, disables the badge. */
  badgeDisabled = input(false, { transform: booleanAttribute });
}
