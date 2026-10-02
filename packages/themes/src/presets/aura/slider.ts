import type { ComponentTokens } from "../../contract";

/**
 * Ultimate Aura-derived slider component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset slider module
 * (`.vendor-extracted/themes/src/presets/aura/slider/index.ts`). Top-level
 * sections `root`, `track`, `range`, `handle` and `colorScheme` are transcribed as-is from the extracted
 * upstream source.
 *
 * Upstream's slider module HAS a `colorScheme` split, so it is typed against Task 8's `ComponentTokens` contract (as button/tooltip are), extended by a local `SliderComponentTokens` because the contract only models `root` + `colorScheme` and upstream also has `track`, `range`, `handle` section(s) outside the split. `colorScheme.light` and `colorScheme.dark` are transcribed as-is.
 */
export interface SliderComponentTokens extends ComponentTokens {
  track?: Record<string, unknown>;
  range?: Record<string, unknown>;
  handle?: Record<string, unknown>;
}

export const slider: SliderComponentTokens = {
  root: {
    transitionDuration: "{transition.duration}",
  },
  track: {
    background: "{content.border.color}",
    borderRadius: "{content.border.radius}",
    size: "3px",
  },
  range: {
    background: "{primary.color}",
  },
  handle: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    background: "{content.border.color}",
    hoverBackground: "{content.border.color}",
    content: {
      borderRadius: "50%",
      hoverBackground: "{content.background}",
      width: "16px",
      height: "16px",
      shadow: "0px 0.5px 0px 0px rgba(0, 0, 0, 0.08), 0px 1px 1px 0px rgba(0, 0, 0, 0.14)",
    },
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
      handle: {
        content: {
          background: "{surface.0}",
        },
      },
    },
    dark: {
      handle: {
        content: {
          background: "{surface.950}",
        },
      },
    },
  },
};
