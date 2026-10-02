import type { ComponentTokens } from "../../contract";

/**
 * Ultimate Aura-derived carousel component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset carousel module
 * (`.vendor-extracted/themes/src/presets/aura/carousel/index.ts`). Top-level
 * sections `root`, `content`, `indicatorList`, `indicator` and `colorScheme` are transcribed as-is from the extracted
 * upstream source.
 *
 * Upstream's carousel module HAS a `colorScheme` split, so it is typed against Task 8's `ComponentTokens` contract (as button/tooltip are), extended by a local `CarouselComponentTokens` because the contract only models `root` + `colorScheme` and upstream also has `content`, `indicatorList`, `indicator` section(s) outside the split. `colorScheme.light` and `colorScheme.dark` are transcribed as-is.
 */
export interface CarouselComponentTokens extends ComponentTokens {
  content?: Record<string, unknown>;
  indicatorList?: Record<string, unknown>;
  indicator?: Record<string, unknown>;
}

export const carousel: CarouselComponentTokens = {
  root: {
    transitionDuration: "{transition.duration}",
  },
  content: {
    gap: "0.25rem",
  },
  indicatorList: {
    padding: "1rem",
    gap: "0.5rem",
  },
  indicator: {
    width: "2rem",
    height: "0.5rem",
    borderRadius: "{content.border.radius}",
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
      indicator: {
        background: "{surface.200}",
        hoverBackground: "{surface.300}",
        activeBackground: "{primary.color}",
      },
    },
    dark: {
      indicator: {
        background: "{surface.700}",
        hoverBackground: "{surface.600}",
        activeBackground: "{primary.color}",
      },
    },
  },
};
