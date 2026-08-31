import { StyleSheet, type StyleMeta } from "@ultimate/uix-styled";
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
    return createStyleElement(meta.css ?? "", { "data-u-style": meta.name }, document.head);
  }
}

// A single module-level instance, matching ngCoreStyleSheet's and
// reactCoreStyleSheet's singleton pattern.
export const vueCoreStyleSheet = new VueStyleSheet();

// Registers styleModule with vueCoreStyleSheet exactly once per componentName
// (has()/add() guard) — called from createBaseComponent's mounted()
// lifecycle point. StyleSheet.add(key, css) takes the CSS string directly
// (verified against packages/uix-styled/src/stylesheet/index.ts — not a meta
// object) and builds the StyleMeta + calls createStyleElement internally,
// matching react-core's/ng-core's identical has()/add(componentName,
// styleModule.css) call shape.
export function registerComponentStyle(componentName: string, styleModule: StyleModule): void {
  if (vueCoreStyleSheet.has(componentName)) return;
  vueCoreStyleSheet.add(componentName, styleModule.css);
}
