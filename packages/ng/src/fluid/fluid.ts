import { ChangeDetectionStrategy, Component, ViewEncapsulation } from "@angular/core";
import { U_FLUID_ANCESTOR } from "@ultimate/ng-core";

/**
 * Ultimate-owned adaptation of PrimeNG's `Fluid` component. A layout
 * component that makes descendant components span the full width of their
 * container.
 *
 * PrimeNG's real `Fluid` (`.vendor-extracted/ng/fluid/fluid.ts`) is a
 * component with selector `p-fluid` and an `<ng-content>` template, applying
 * `cx('root')` (`.p-fluid`) to its host — NOT an attribute directive with a
 * `[pFluid]` selector as this task's brief illustratively described. No
 * `[pFluid]` selector exists anywhere in upstream source; adapted here to
 * match the real mechanism, per the brief's own instruction to verify
 * against the extracted source.
 *
 * Deliberately excludes PrimeNG's `Bind`/passthrough `hostDirectives` wiring
 * and `FLUID_INSTANCE`/`PARENT_INSTANCE` injection-token parent lookup — see
 * `UBaseComponent`'s doc comment for the same architectural exclusion
 * pattern (Option B).
 *
 * Provides {@link U_FLUID_ANCESTOR} on itself so `ng-core`-tier classes
 * (e.g. `UBaseInput`) can detect an ancestor `<u-fluid>` wrapper via DI
 * without `ng-core` depending on `ng`.
 */
@Component({
  standalone: true,
  selector: "u-fluid",
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "u-fluid",
  },
  providers: [{ provide: U_FLUID_ANCESTOR, useValue: true }],
})
export class UFluid {}
