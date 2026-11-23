import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  inject,
  input,
} from "@angular/core";
import { UBaseComponent, UBind, U_PARENT_INSTANCE } from "@ultimate/ng-core";
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
 *
 * `badgeStyle` and `badgeStyleClass` are forwarded to the composed badge, as
 * PrimeNG forwards its `style` and `styleClass`; the deprecated `size` and
 * `styleClass` inputs are not offered (ADR-088). `pt` reaches the host, the
 * root div, and the badge (`pcBadge`).
 */
@Component({
  standalone: true,
  selector: "u-overlay-badge",
  imports: [UBadge, UBind],
  template: `
    <div [uBind]="ptm('root')" [class]="cx('root')">
      <ng-content></ng-content>
      <u-badge
        [pt]="ptm('pcBadge')"
        [class]="badgeStyleClass()"
        [style]="badgeStyle()"
        [value]="value()"
        [severity]="severity()"
        [badgeSize]="badgeSize()"
        [badgeDisabled]="badgeDisabled()"
      ></u-badge>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: U_PARENT_INSTANCE, useExisting: UOverlayBadge }],
  hostDirectives: [UBind],
})
export class UOverlayBadge extends UBaseComponent {
  protected override readonly componentName = "overlaybadge";
  protected override readonly styleModule = overlayBadgeStyleModule;

  private readonly bindDirective = inject(UBind, { self: true });

  /** Value to display inside the badge. */
  value = input<string | number | null>();
  /** Severity type of the badge. */
  severity = input<"secondary" | "info" | "success" | "warn" | "danger" | "contrast" | null>();
  /** Size of the badge, valid options are "small", "large" and "xlarge". */
  badgeSize = input<"small" | "large" | "xlarge" | null>();
  /** When specified, disables the badge. */
  badgeDisabled = input(false, { transform: booleanAttribute });
  /** Inline style of the composed badge. */
  badgeStyle = input<Record<string, string | number> | null>();
  /** Class of the composed badge. */
  badgeStyleClass = input<string>();

  ngAfterViewChecked(): void {
    this.bindDirective.setAttrs(this.ptm("host"));
  }
}
