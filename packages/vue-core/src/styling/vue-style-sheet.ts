import {
  StyleSheet,
  registerComponentCss,
  registerBoxModel,
  registerHiddenAccessible,
  registerIconSpin,
  registerSharedBase,
  registerThemeVariables,
  scopeRootsOf,
  type StyleMeta,
} from "@ultimate/uix-styled";
import { createStyleElement } from "@ultimate/uix-utils/dom";
import type { StyleModule } from "../base/base-component";

// Vue-only subclass of @ultimate/uix-styled's StyleSheet<HTMLStyleElement>,
// overriding createStyleElement to delegate to the already-built
// @ultimate/uix-utils/dom's createStyleElement — no PrimeVue styling code
// ported (spec §8). SSR-guarded via typeof document check, mirroring
// react-core's ReactStyleSheet's identical guard.
class VueStyleSheet extends StyleSheet<HTMLStyleElement> {
  override createStyleElement(meta: StyleMeta): HTMLStyleElement | undefined {
    if (typeof document === "undefined") return undefined;
    const element = createStyleElement(
      meta.css ?? "",
      { "data-u-style": meta.name },
      document.head
    );
    if (meta.first) document.head.prepend(element);
    return element;
  }
  override updateStyleElement(element: HTMLStyleElement, meta: StyleMeta<HTMLStyleElement>): void {
    element.textContent = meta.css ?? "";
  }
}

// A single module-level instance, like reactCoreStyleSheet. (Angular keeps
// one registry per document; ngCoreStyleSheet is the browser document's
// registry.)
export const vueCoreStyleSheet = new VueStyleSheet();

// The rules every instance needs whether or not it is styled: the shared
// hidden-accessible and icon-spin rules. PrimeVue's `_load()` loads its base
// style the same way, before the `isUnstyled` check in `_loadThemeStyles()`.
export function registerBaseStyle(): void {
  registerHiddenAccessible(vueCoreStyleSheet);
  // GAP-124: the opt-in `.u-icon-spin` rule (class-scoped; see uix-styled icon-spin.ts).
  registerIconSpin(vueCoreStyleSheet);
}

// Registers styleModule with vueCoreStyleSheet exactly once per componentName
// (has()/add() guard) — called from createBaseComponent's mounted()
// lifecycle point. StyleSheet.add(key, css) takes the CSS string directly
// (verified against packages/uix-styled/src/stylesheet/index.ts — not a meta
// object) and builds the StyleMeta + calls createStyleElement internally,
// matching react-core's/ng-core's identical has()/add(componentName,
// styleModule.css) call shape.
//
// additionalPresetKeys (ADR-051): further Aura preset keys whose theme
// VARIABLES this component's structural CSS consumes. Only their variables
// are registered — never structural CSS under those keys, which belong to
// their own components.
export function registerComponentStyle(
  componentName: string,
  styleModule: StyleModule,
  additionalPresetKeys: readonly string[] = []
): void {
  registerBaseStyle();

  // Theme variable DEFINITIONS first — the structural CSS below refers to
  // them via dt()-resolved var(--u-*) references, which resolve to nothing
  // unless something also defines the properties. Idempotent per its own
  // has() guards; see registerThemeVariables' doc comment.
  registerThemeVariables(vueCoreStyleSheet, componentName);
  for (const presetKey of additionalPresetKeys) {
    registerThemeVariables(vueCoreStyleSheet, presetKey);
  }

  // A6 (ADR-081): the shared `u-*` base rules, once per sheet.
  registerSharedBase(vueCoreStyleSheet);

  // GAP-098 (ADR-063): the component's scoped border-box rule, guarded by its
  // own key and placed before the early return below so it registers even when
  // the component key already exists. A no-op for an empty name or no roots.
  registerBoxModel(vueCoreStyleSheet, componentName, scopeRootsOf(styleModule.classes));

  registerComponentCss(vueCoreStyleSheet, componentName, styleModule.css);
}
