import Theme from "../config/index";
import type StyleSheet from "./index";

/**
 * Registration key under which the shared primitive/semantic/global variable
 * block is recorded in a `StyleSheet`. Mirrors PrimeVue's own `'common'`
 * loaded-style-name sentinel (`BaseComponent._loadThemeStyles`).
 */
const COMMON_KEY = "u-common-variables";

/** Registration key for one component's own variable block. */
function componentKey(componentName: string): string {
  return `${componentName}-variables`;
}

/**
 * Registers the CSS custom-property DEFINITIONS a component's structural CSS
 * depends on, into `sheet`.
 *
 * Ultimate's structural CSS refers to tokens by `dt()`-resolved REFERENCES
 * (`var(--u-button-primary-background)`). Something must also define those
 * properties, or every reference resolves to nothing and the component
 * renders unstyled. `Theme.getCommon()` and `Theme.getComponent()` produce
 * exactly that definition CSS (`:root,:host{--u-button-border-radius:…}`),
 * already fully resolved — they are the values half of the same pipeline
 * `dt()` reads the names half of.
 *
 * Two tiers, matching PrimeVue's `BaseComponent._loadThemeStyles()`
 * (`packages/core/src/basecomponent/BaseComponent.vue`):
 *
 * - **common** — primitive + semantic + global variables. Global to the app,
 *   registered once under a single shared key by whichever component mounts
 *   first.
 * - **component** — that one component's own variables, registered once per
 *   component name.
 *
 * Both tiers are idempotent via `StyleSheet.has()`, so repeated mounts of the
 * same or different components never inject duplicate `<style>` elements.
 * SSR-safety is inherited: each `*-core` package's `StyleSheet` subclass
 * already guards `createStyleElement` on `typeof document`.
 *
 * Called from each framework's existing structural-CSS registration site, so
 * variables land in `document.head` before (or alongside) the structural CSS
 * that consumes them.
 */
export function registerThemeVariables(sheet: StyleSheet<any>, componentName: string): void {
  if (!Theme.getTheme()) return; // no theme applied — nothing to define

  if (!sheet.has(COMMON_KEY)) {
    const { primitive, semantic, global } = Theme.getCommon("", {}) ?? {};
    sheet.add(COMMON_KEY, `${primitive?.css ?? ""}${semantic?.css ?? ""}${global?.css ?? ""}`);
  }

  const key = componentKey(componentName);
  if (!sheet.has(key)) {
    const { css } = Theme.getComponent(componentName, {}) ?? {};
    sheet.add(key, css ?? "");
  }
}
