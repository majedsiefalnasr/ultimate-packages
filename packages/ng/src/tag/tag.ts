import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, input } from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { tagStyleModule } from "./tag-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `Tag` component (see
 * `.vendor-extracted/ng/tag/tag.ts`). Confirmed against real source:
 * extends the bare `BaseComponent` tier (no CVA) — a status/categorization
 * display component (severity-colored label with an optional icon), never
 * a form control.
 *
 * This port keeps real source's `severity`/`value`/`icon`/`rounded` surface
 * (via a projected-content `value` label, matching this port's own content
 * projection convention — real source both accepts a `value` @Input and
 * `<ng-content>`; this port uses `<ng-content>` as the primary content path,
 * same precedent as `UMessage`). Deliberately excludes real source's custom
 * icon `TemplateRef` override — same "smaller surface than upstream"
 * precedent as every sibling component.
 */
@Component({
  standalone: true,
  selector: "u-tag",
  template: `
    @if (icon()) {
      <span [class]="cx('icon') + ' ' + icon()"></span>
    }
    <span [class]="cx('label')"><ng-content>{{ value() }}</ng-content></span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('root', { severity: severity(), rounded: rounded() })",
  },
})
export class UTag extends UBaseComponent {
  protected override readonly componentName = "tag";
  protected override readonly styleModule = tagStyleModule;

  /** Severity type of the tag. */
  severity = input<"success" | "secondary" | "info" | "warn" | "danger" | "contrast">();
  /** Value to display inside the tag (used when no content is projected). */
  value = input<string>();
  /** Icon to display next to the value. */
  icon = input<string>();
  /** Whether the corners of the tag are rounded. */
  rounded = input(false, { transform: booleanAttribute });
}
