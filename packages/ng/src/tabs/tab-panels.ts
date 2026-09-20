import { ChangeDetectionStrategy, Component, ViewEncapsulation } from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { tabsStyleModule } from "./tabs-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `TabPanels` component (see
 * `.vendor-extracted/ng/tabs/tabpanels.ts`). Pure content-projection
 * wrapper for a set of `UTabPanel` children — no state of its own.
 */
@Component({
  standalone: true,
  selector: "u-tab-panels",
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('tabPanelsRoot')",
    role: "presentation",
  },
})
export class UTabPanels extends UBaseComponent {
  protected override readonly componentName = "tabs";
  protected override readonly styleModule = tabsStyleModule;
}
