import { ChangeDetectionStrategy, Component, ViewEncapsulation } from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { buttonGroupStyleModule } from "./button-group-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `ButtonGroup` component (see
 * `.vendor-extracted/ng/buttongroup/buttongroup.ts`). A trivial
 * content-projecting `<span role="group">` wrapper composing `UButton` by
 * CSS only (adjoining borders/squared-off inner corners) — real source
 * carries no props of its own beyond `UBaseComponent`'s base surface, and
 * this port matches that exactly.
 */
@Component({
  standalone: true,
  selector: "u-button-group",
  template: `<span [class]="cx('root')" role="group"><ng-content></ng-content></span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UButtonGroup extends UBaseComponent {
  protected override readonly componentName = "button-group";
  protected override readonly styleModule = buttonGroupStyleModule;
}
