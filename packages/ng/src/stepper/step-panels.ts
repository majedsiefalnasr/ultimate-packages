import { ChangeDetectionStrategy, Component, ViewEncapsulation } from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { stepperStyleModule } from "./stepper-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `StepPanels` component (see
 * `.vendor-extracted/ng/stepper/stepper.ts`). Pure content-projection
 * wrapper for a set of `UStepPanel` children — no state of its own.
 */
@Component({
  standalone: true,
  selector: "u-step-panels",
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('stepPanelsRoot')",
  },
})
export class UStepPanels extends UBaseComponent {
  protected override readonly componentName = "stepper";
  protected override readonly styleModule = stepperStyleModule;
}
