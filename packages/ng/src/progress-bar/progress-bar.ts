import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  input,
  numberAttribute,
} from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { progressBarStyleModule } from "./progress-bar-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `ProgressBar` component (see
 * `.vendor-extracted/ng/progressbar/progressbar.ts`). Confirmed against
 * real source (all 3 frameworks): extends the bare `BaseComponent` tier
 * (no CVA) — a process-status indicator with `determinate` (numeric
 * `value` + optional label) and `indeterminate` (animated, no value) modes.
 *
 * Deliberately excludes real source's `content` `<ng-template>` override
 * and `color`/`valueStyleClass` styling escape hatches — same "smaller
 * surface than upstream" precedent as every sibling component.
 */
@Component({
  standalone: true,
  selector: "u-progress-bar",
  template: `
    @if (mode() === "determinate") {
      <div [class]="cx('value')" [style.width.%]="value()">
        @if (showValue()) {
          <div [class]="cx('label')">{{ value() }}{{ unit() }}</div>
        }
      </div>
    } @else {
      <div [class]="cx('value')"></div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    role: "progressbar",
    "[attr.aria-valuemin]": "0",
    "[attr.aria-valuemax]": "100",
    "[attr.aria-valuenow]": "mode() === 'determinate' ? value() : null",
    "[class]": "cx('root', { mode: mode() })",
  },
})
export class UProgressBar extends UBaseComponent {
  protected override readonly componentName = "progress-bar";
  protected override readonly styleModule = progressBarStyleModule;

  /** Current value of the progress. */
  value = input(0, { transform: numberAttribute });
  /** Whether to display the progress bar value. */
  showValue = input(true, { transform: booleanAttribute });
  /** Unit sign appended to the value. */
  unit = input("%");
  /** Defines the mode of the progress. */
  mode = input<"determinate" | "indeterminate">("determinate");
}
