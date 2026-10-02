import type { ComponentTokens } from "../../contract";

/**
 * Ultimate Aura-derived scrollpanel component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset scrollpanel module
 * (`.vendor-extracted/themes/src/presets/aura/scrollpanel/index.ts`). Top-level
 * sections `root`, `bar` and `colorScheme` are transcribed as-is from the extracted
 * upstream source.
 *
 * Upstream's scrollpanel module HAS a `colorScheme` split, so it is typed against Task 8's `ComponentTokens` contract (as button/tooltip are), extended by a local `ScrollPanelComponentTokens` because the contract only models `root` + `colorScheme` and upstream also has `bar` section(s) outside the split. `colorScheme.light` and `colorScheme.dark` are transcribed as-is.
 */
export interface ScrollPanelComponentTokens extends ComponentTokens {
  bar?: Record<string, unknown>;
}

export const scrollPanel: ScrollPanelComponentTokens = {
  root: {
    transitionDuration: "{transition.duration}",
  },
  bar: {
    size: "9px",
    borderRadius: "{border.radius.sm}",
    focusRing: {
      width: "{focus.ring.width}",
      style: "{focus.ring.style}",
      color: "{focus.ring.color}",
      offset: "{focus.ring.offset}",
      shadow: "{focus.ring.shadow}",
    },
  },
  colorScheme: {
    light: {
      bar: {
        background: "{surface.100}",
      },
    },
    dark: {
      bar: {
        background: "{surface.800}",
      },
    },
  },
};
