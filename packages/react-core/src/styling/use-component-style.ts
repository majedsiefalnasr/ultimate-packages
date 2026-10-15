import {
  css,
  registerBoxModel,
  registerHiddenAccessible,
  registerThemeVariables,
  scopeRootsOf,
} from "@ultimate/uix-styled";
import { useMountEffect } from "../hooks";
import { reactCoreStyleSheet } from "./react-style-sheet";
import type { StyleModule } from "../base/component-base";

export function useComponentStyle(componentName: string, styleModule: StyleModule): void {
  useMountEffect(() => {
    registerHiddenAccessible(reactCoreStyleSheet);

    // Theme variable DEFINITIONS first — the structural CSS below refers to
    // them via dt()-resolved var(--u-*) references, which resolve to nothing
    // unless something also defines the properties. Idempotent per its own
    // has() guards; see registerThemeVariables' doc comment.
    registerThemeVariables(reactCoreStyleSheet, componentName);

    // GAP-098 (ADR-063): the component's scoped border-box rule, under its own
    // key, before the component CSS. A no-op for an empty name or no roots.
    registerBoxModel(reactCoreStyleSheet, componentName, scopeRootsOf(styleModule.classes));

    if (!reactCoreStyleSheet.has(componentName)) {
      // Keep the style module's CSS bytes intact; the registered value is used as-is.
      const renderCss = css;
      reactCoreStyleSheet.add(componentName, renderCss`${styleModule.css}`);
    }
  });
}
