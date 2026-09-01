import { StyleSheet, type StyleMeta } from "@ultimate/uix-styled";
import { createStyleElement } from "@ultimate/uix-utils";

/**
 * `ng-core`-only subclass of `@ultimate/uix-styled`'s `StyleSheet<HTMLStyleElement>`,
 * overriding `createStyleElement` to append a real `<style>` element to
 * `document.head` — matching `react-core`'s `ReactStyleSheet` and
 * `vue-core`'s `VueStyleSheet`, which both already do this (see
 * `packages/react-core/src/styling/react-style-sheet.ts`,
 * `packages/vue-core/src/styling/vue-style-sheet.ts`). The base `StyleSheet`
 * class's own `createStyleElement` is a no-op stub, so without this
 * override `ngCoreStyleSheet.add()` only ever recorded CSS into its
 * in-memory `_styles` Map and never wrote anything to the DOM. SSR-guarded
 * via the same `typeof document` check both sibling implementations use.
 */
class NgCoreStyleSheet extends StyleSheet<HTMLStyleElement> {
  override createStyleElement(meta: StyleMeta): HTMLStyleElement | undefined {
    if (typeof document === "undefined") return undefined;
    return createStyleElement(meta.css ?? "", meta.attrs, document.head);
  }
}

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
export const ngCoreStyleSheet = new NgCoreStyleSheet();
