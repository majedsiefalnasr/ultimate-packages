import Theme from "../config/index";
import ThemeService from "../service/index";
import type StyleSheet from "./index";
import { presetKey } from "./theme-variables";

/**
 * The per-instance design tokens (`dt`) of ONE component instance, written
 * into a style sheet as CSS variables scoped to that instance's attribute
 * selector.
 */
export interface ScopedTheme {
  /** The registry key the scoped variables live under: `<attrSelector>-<componentName>`. */
  readonly key: string;
  /**
   * Writes `dt` as variables scoped to `[attrSelector]`, replacing the
   * previous ones. A nullish or empty `dt` removes the scoped style instead.
   * Also follows later `theme:change` events until `dispose()`.
   */
  update(dt: Record<string, unknown> | null | undefined): void;
  /** Removes the scoped style and stops following theme changes. */
  dispose(): void;
}

/**
 * Per-instance `dt` (F15). PrimeNG's and PrimeVue's `BaseComponent`
 * (`_loadScopedThemeStyles`) read `Theme.getCustomPreset()` with the
 * instance's `[pc…]` attribute selector, load the result under
 * `<attrSelector>-<style name>` and rerun it on `theme:change`. This does the
 * same against an Ultimate `StyleSheet`. Unlike `StyleSheet.delete()`, which
 * only forgets the entry, removing the scoped style also removes its element
 * from the document, because instances come and go.
 *
 * The preset is read under the component name with its hyphens removed, like
 * the shared component variables (`registerThemeVariables`).
 */
export function createScopedTheme(
  sheet: StyleSheet<any>,
  componentName: string,
  attrSelector: string
): ScopedTheme {
  const key = `${attrSelector}-${componentName}`;
  let current: Record<string, unknown> | undefined;

  const write = () => {
    if (!current) return;
    const { css } =
      Theme.getCustomPreset(presetKey(componentName), current, `[${attrSelector}]`, {}) ?? {};
    sheet.update(key, css ?? "");
  };

  const remove = () => {
    const element = sheet.get(key)?.element as { remove?: () => void } | undefined;
    element?.remove?.();
    sheet.delete(key);
  };

  const stop = () => ThemeService.off("theme:change", write);

  return {
    key,
    update(dt) {
      stop();
      if (!dt || Object.keys(dt).length === 0) {
        current = undefined;
        remove();
        return;
      }
      current = dt;
      write();
      ThemeService.on("theme:change", write);
    },
    dispose() {
      stop();
      current = undefined;
      remove();
    },
  };
}
