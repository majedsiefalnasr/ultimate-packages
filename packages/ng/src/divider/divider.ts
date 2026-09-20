import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { dividerStyleModule } from "./divider-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `Divider` component (see
 * `.vendor-extracted/ng/divider/divider.ts`). Separates content with a
 * horizontal or vertical rule, with an optional projected label centered
 * on the rule — matching real source's own `layout`/`type`/`align`
 * structural shape.
 *
 * Deliberately excludes real source's `type` (`solid`/`dashed`/`dotted`)
 * and `align` inputs — this port renders a solid rule only, centered
 * content only, same "smaller surface than upstream" precedent as every
 * sibling component.
 */
@Component({
  standalone: true,
  selector: "u-divider",
  template: `
    <div [class]="cx('content')">
      <ng-content></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('root', { layout: layout() })",
    "[attr.aria-orientation]": "layout()",
    role: "separator",
  },
})
export class UDivider extends UBaseComponent {
  protected override readonly componentName = "divider";
  protected override readonly styleModule = dividerStyleModule;

  /** Specifies the orientation. */
  layout = input<"horizontal" | "vertical">("horizontal");
}
