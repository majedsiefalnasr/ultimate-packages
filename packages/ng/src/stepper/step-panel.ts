import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, input } from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { UStepper } from "./stepper";
import { stepperStyleModule } from "./stepper-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `StepPanel` component (see
 * `.vendor-extracted/ng/stepper/stepper.ts`). Content pane linked to a
 * `UStep` by matching `value`; hidden (via `[hidden]`) when its `value`
 * does not match the ancestor `UStepper`'s active `value`.
 *
 * Exposes `activate(value)` so host templates can wire their own
 * "Next"/"Previous"-style navigation buttons inside the panel's projected
 * content (real PrimeNG passes an equivalent `activateCallback` into its
 * own content-template context) — validation-gating (e.g. a "Next" button
 * disabled until the current step's form is valid) is the host template's
 * own responsibility, matching upstream's own template-driven approach; a
 * disabled/invalid step's "Next" button simply doesn't call `activate()`.
 */
@Component({
  standalone: true,
  selector: "u-step-panel",
  exportAs: "uStepPanel",
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('stepPanelRoot')",
    role: "tabpanel",
    "[attr.data-u-active]": "active()",
    "[hidden]": "!active()",
  },
})
export class UStepPanel extends UBaseComponent {
  protected override readonly componentName = "stepper";
  protected override readonly styleModule = stepperStyleModule;

  private readonly pcStepper = inject(UStepper);

  /** Value of this panel — must match a `UStep`'s own `value` to link them. */
  value = input.required<number>();

  protected readonly active = computed(() => this.pcStepper.value() === this.value());

  /** Programmatically activates a given step value from this panel's own projected content (e.g. a "Next" button). */
  activate(value: number): void {
    this.pcStepper.updateValue(value);
  }
}
