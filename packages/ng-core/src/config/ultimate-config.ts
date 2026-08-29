import { Injectable, signal } from '@angular/core';

/**
 * Angular service providing global configuration for the Ultimate UI framework.
 * Manages theme and rendering settings across the component tree.
 *
 * Provided at root injection level for singleton behavior across the app.
 */
@Injectable({ providedIn: 'root' })
export class UltimateConfig {
  /** Whether to render components in unstyled (CSS-free) mode. */
  unstyled = signal(false);

  /** Whether to enable ripple effect on interactive components. */
  ripple = signal(true);
}
