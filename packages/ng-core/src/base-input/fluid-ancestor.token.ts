import { InjectionToken } from "@angular/core";

/**
 * Marker token an ancestor `UFluid` (`packages/ng/src/fluid/fluid.ts`)
 * provides on itself, so `ng-core`-tier classes (like `UBaseInput`) can
 * detect an ancestor `<u-fluid>` wrapper via DI without `ng-core` importing
 * `@ultimate/ng` (which would create a circular workspace dependency —
 * `ng` already depends on `ng-core`, not the reverse).
 */
export const U_FLUID_ANCESTOR = new InjectionToken<true>("U_FLUID_ANCESTOR");
