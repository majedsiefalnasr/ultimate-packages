import { Injectable, signal } from "@angular/core";

/**
 * Minimal global configuration for UltimateNG components: unstyled mode and
 * ripple toggle. PrimeNG's full config surface is deferred (spec: Needs
 * Architecture Decision) — this covers only what the Phase 2 proof set uses.
 *
 * Provided at root injection level for singleton behavior across the app.
 */
@Injectable({ providedIn: "root" })
export class UltimateConfig {
  /** Whether to render components in unstyled (CSS-free) mode. */
  unstyled = signal(false);

  /** Whether to enable ripple effect on interactive components. */
  ripple = signal(true);
}
