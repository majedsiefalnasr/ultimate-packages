import { css } from "@ultimate/uix-styled";
import { useMountEffect } from "../hooks";
import { reactCoreStyleSheet } from "./react-style-sheet";
import type { StyleModule } from "../base/component-base";

export function useComponentStyle(componentName: string, styleModule: StyleModule): void {
  useMountEffect(() => {
    if (!reactCoreStyleSheet.has(componentName)) {
      reactCoreStyleSheet.add(componentName, css`${styleModule.css}`);
    }
  });
}
