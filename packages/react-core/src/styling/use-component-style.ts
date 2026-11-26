import { useEffect } from "react";
import {
  registerComponentCss,
  registerBoxModel,
  registerHiddenAccessible,
  registerSharedBase,
  registerThemeVariables,
  scopeRootsOf,
} from "@ultimate/uix-styled";
import { reactCoreStyleSheet } from "./react-style-sheet";
import type { StyleModule } from "../base/component-base";

/**
 * Registers the component's styles on mount, and again when `unstyled`
 * turns off. An unstyled instance registers only the shared hidden-accessible
 * rule, like PrimeReact's `useHandleStyle`, which always loads its base and
 * global styles and skips the common and component styles when unstyled.
 *
 * `additionalPresetKeys` (ADR-051, ADR-067 (b)) names further Aura preset
 * keys whose theme VARIABLES the component's structural CSS reads. Only their
 * variables are registered, never structural CSS under those keys, which
 * belong to their own components.
 */
export function useComponentStyle(
  componentName: string,
  styleModule: StyleModule,
  unstyled = false,
  additionalPresetKeys: readonly string[] = []
): void {
  useEffect(() => {
    registerHiddenAccessible(reactCoreStyleSheet);

    if (unstyled) return;

    // Theme variable DEFINITIONS first — the structural CSS below refers to
    // them via dt()-resolved var(--u-*) references, which resolve to nothing
    // unless something also defines the properties. Idempotent per its own
    // has() guards; see registerThemeVariables' doc comment.
    registerThemeVariables(reactCoreStyleSheet, componentName);
    for (const presetKey of additionalPresetKeys) {
      registerThemeVariables(reactCoreStyleSheet, presetKey);
    }

    // A6 (ADR-081): the shared `u-*` base rules, once per sheet.
    registerSharedBase(reactCoreStyleSheet);

    // GAP-098 (ADR-063): the component's scoped border-box rule, under its own
    // key, before the component CSS. A no-op for an empty name or no roots.
    registerBoxModel(reactCoreStyleSheet, componentName, scopeRootsOf(styleModule.classes));

    registerComponentCss(reactCoreStyleSheet, componentName, styleModule.css);
    // The component name, style module and additional keys are fixed for a
    // component's life, as they were under a mount-only effect; only
    // `unstyled` can change.
  }, [unstyled]);
}
