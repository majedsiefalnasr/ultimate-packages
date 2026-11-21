import Theme from "../config/index";
import { css as renderCss } from "../helpers/css";
import ThemeService from "../service/index";
import type StyleSheet from "./index";

/**
 * Registration key under which the shared primitive/semantic/global variable
 * block is recorded in a `StyleSheet`. Mirrors PrimeVue's own `'common'`
 * loaded-style-name sentinel (`BaseComponent._loadThemeStyles`).
 */
const COMMON_KEY = "u-common-variables";

/**
 * Registration key for the preset's top-level `css` (Aura's `css`). Mirrors
 * the `global-style` entry PrimeNG and PrimeVue load next to the common
 * variables.
 */
const GLOBAL_STYLE_KEY = "u-global-style";

/** Registration key for one component's own variable block. */
function componentKey(componentName: string): string {
  return `${componentName}-variables`;
}

/**
 * The preset key a registration name looks up. Aura keys are flat
 * (`inputtext`, `datepicker`), while a React component registers under its
 * kebab-case name (`input-text`). Stripping the hyphens here, once, is the
 * only place the lookup changes: the block stays registered under the name
 * it was given, and a name that is already flat resolves exactly as before.
 */
function presetKey(componentName: string): string {
  return componentName.replaceAll("-", "");
}

function commonVariablesCss(): string {
  const { primitive, semantic, global } = Theme.getCommon("", {}) ?? {};
  return `${primitive?.css ?? ""}${semantic?.css ?? ""}${global?.css ?? ""}`;
}

function globalStyleCss(): string {
  const { style } = Theme.getCommon("", {}) ?? {};
  return style ? Theme.transformCSS("global-style", style) : "";
}

function componentVariablesCss(componentName: string): string {
  const { css } = Theme.getComponent(presetKey(componentName), {}) ?? {};
  return css ?? "";
}

interface FollowedSheet {
  variableNames: Set<string>;
  structuralCss: Map<string, string>;
}

const followedSheets = new WeakMap<StyleSheet<any>, FollowedSheet>();

/**
 * Rewrites the variable blocks and the structural CSS `sheet` holds from the
 * current theme, so components that are already mounted pick up the new
 * tokens. Matches PrimeNG's and PrimeVue's `theme:change` listener, which
 * reruns the same variable loading and reloads the component CSS. The
 * structural CSS is rendered again because `dt()` bakes the current variable
 * prefix into it.
 */
function refreshSheet(sheet: StyleSheet<any>, followed: FollowedSheet): void {
  if (Theme.getTheme()) {
    sheet.update(COMMON_KEY, commonVariablesCss());
    const globalStyle = globalStyleCss();
    if (globalStyle || sheet.has(GLOBAL_STYLE_KEY)) {
      sheet.update(GLOBAL_STYLE_KEY, globalStyle);
    }
    for (const componentName of followed.variableNames) {
      sheet.update(componentKey(componentName), componentVariablesCss(componentName));
    }
  }

  for (const [componentName, rawCss] of followed.structuralCss) {
    sheet.update(componentName, renderCss`${rawCss}`);
  }
}

/**
 * Subscribes `sheet` to `theme:change` once and returns what it keeps
 * current. The subscription holds the sheet weakly, so a per-request sheet
 * (Angular SSR) is not kept alive by the global theme service; the listener
 * removes itself after the sheet is gone.
 */
function followThemeChanges(sheet: StyleSheet<any>): FollowedSheet {
  const known = followedSheets.get(sheet);
  if (known) return known;

  const followed: FollowedSheet = { variableNames: new Set(), structuralCss: new Map() };
  const sheetRef = new WeakRef(sheet);
  const listener = () => {
    const target = sheetRef.deref();
    if (target) refreshSheet(target, followed);
    else queueMicrotask(() => ThemeService.off("theme:change", listener));
  };

  followedSheets.set(sheet, followed);
  ThemeService.on("theme:change", listener);
  return followed;
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
 * - **common** — primitive + semantic + global variables, then the preset's
 *   top-level `css` as global style. Global to the app, registered once by
 *   whichever component mounts first.
 * - **component** — that one component's own variables, registered once per
 *   component name. The preset is read under the name with its hyphens
 *   removed (`input-text` reads `inputtext`), so kebab-case registrations
 *   (React) find the flat Aura key.
 *
 * Both tiers are idempotent via `StyleSheet.has()`, so repeated mounts of the
 * same or different components never inject duplicate `<style>` elements.
 * After a theme change (`Theme.setTheme`, `setPreset`, `setOptions`) both
 * tiers are rewritten in place for every component registered on `sheet`.
 * SSR-safety is inherited from the `sheet` passed in: the React and Vue
 * cores guard `createStyleElement` on `typeof document`, and Angular passes
 * the registry of its injected document (inert when there is no document).
 *
 * Called from each framework's existing structural-CSS registration site, so
 * variables land in `document.head` before (or alongside) the structural CSS
 * that consumes them.
 */
export function registerThemeVariables(sheet: StyleSheet<any>, componentName: string): void {
  followThemeChanges(sheet).variableNames.add(componentName);

  if (!Theme.getTheme()) return; // no theme applied — nothing to define

  if (!sheet.has(COMMON_KEY)) {
    sheet.add(COMMON_KEY, commonVariablesCss());
    const globalStyle = globalStyleCss();
    if (globalStyle) sheet.add(GLOBAL_STYLE_KEY, globalStyle);
  }

  const key = componentKey(componentName);
  if (!sheet.has(key)) {
    sheet.add(key, componentVariablesCss(componentName));
  }
}

/**
 * Registers a component's structural CSS into `sheet` under its own name,
 * resolving `dt()` references, and keeps it current after theme changes (see
 * `refreshSheet`). Idempotent per component name via `StyleSheet.has()`.
 */
export function registerComponentCss(
  sheet: StyleSheet<any>,
  componentName: string,
  rawCss: string
): void {
  followThemeChanges(sheet).structuralCss.set(componentName, rawCss);

  if (!sheet.has(componentName)) {
    sheet.add(componentName, renderCss`${rawCss}`);
  }
}
