import { css, registerThemeVariables } from "@ultimate/uix-styled";
import { useMountEffect } from "../hooks";
import { reactCoreStyleSheet } from "./react-style-sheet";
import type { StyleModule } from "../base/component-base";

export function useComponentStyle(componentName: string, styleModule: StyleModule): void {
  useMountEffect(() => {
    // Theme variable DEFINITIONS first — the structural CSS below refers to
    // them via dt()-resolved var(--u-*) references, which resolve to nothing
    // unless something also defines the properties. Idempotent per its own
    // has() guards; see registerThemeVariables' doc comment.
    registerThemeVariables(reactCoreStyleSheet, componentName);

    if (!reactCoreStyleSheet.has(componentName)) {
      reactCoreStyleSheet.add(componentName, css`${styleModule.css}`);
    }
  });
}
