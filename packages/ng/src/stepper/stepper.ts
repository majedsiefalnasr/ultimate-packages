import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, input, model } from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { stepperStyleModule } from "./stepper-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `Stepper` component (see
 * `.vendor-extracted/ng/stepper/stepper.ts`). Container/state-owner for
 * the Stepper family — descendant directives (`UStepList` → `UStepItem` →
 * `UStep`, `UStepPanels` → `UStepPanel`) resolve their nearest ancestor
 * `UStepper` via Angular DI (`inject(UStepper)`), matching real PrimeNG's
 * own `STEPPER_INSTANCE` injection-token pattern.
 *
 * Real PrimeNG's `stepper/` source directory is itself decomposed into 7
 * components — `Stepper`, `StepList`, `StepItem`, `Step`, `StepPanels`,
 * `StepPanel`, `StepperSeparator` (verified this task's Step 1,
 * `.vendor-extracted/ng/stepper/stepper.ts`) — not the single "Stepper +
 * StepperPanel" entry this task's binding description assumed (that shape
 * describes PrimeReact's real decomposition, not PrimeNG's). This
 * adaptation follows the real, verified Angular source shape, same
 * finding/resolution as this same task's `UTabs` family.
 *
 * `linear` gating (a disabled non-active step cannot be activated by
 * click) is `UStep`'s own responsibility, matching real PrimeNG's
 * `isStepDisabled` on `Step`, not `Stepper` itself.
 */
@Component({
  standalone: true,
  selector: "u-stepper",
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('stepperRoot')",
    role: "tablist",
  },
})
export class UStepper extends UBaseComponent {
  protected override readonly componentName = "stepper";
  protected override readonly styleModule = stepperStyleModule;

  /** Active step's value. */
  value = model<number | undefined>(undefined);
  /** When enabled, prevents activating a step ahead of the active one without going through the ones in between. */
  linear = input(false, { transform: booleanAttribute });

  /** Programmatically activates a step by value — mirrors real PrimeNG's `updateValue`. */
  updateValue(value: number): void {
    this.value.set(value);
  }

  /** Whether the given step value is the active one. */
  isStepActive(value: number): boolean {
    return this.value() === value;
  }
}
