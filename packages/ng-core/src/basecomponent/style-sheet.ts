import { StyleSheet } from "@ultimate/uix-styled";

/**
 * Shared `@ultimate/uix-styled` `StyleSheet` instance used to register
 * `ng-core`/`ng` component style modules.
 *
 * `StyleSheet` (see `packages/uix-styled/src/stylesheet/index.ts`) is a
 * plain class, not an Angular-injectable, `providedIn: 'root'` service —
 * so `ng-core` owns a single module-level instance here and every
 * `UBaseComponent` subclass registers against it, keeping registration
 * idempotent per `componentName` across all component instances.
 */
export const ngCoreStyleSheet = new StyleSheet();
