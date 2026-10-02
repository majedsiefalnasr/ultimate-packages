/**
 * Ultimate Aura-derived splitter component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset splitter module
 * (`.vendor-extracted/themes/src/presets/aura/splitter/index.ts`). Top-level
 * sections `root`, `gutter`, `handle` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's splitter module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `SplitterComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface SplitterComponentTokens {
  root?: Record<string, unknown>;
  gutter?: Record<string, unknown>;
  handle?: Record<string, unknown>;
}

export const splitter: SplitterComponentTokens = {
  root: {
    background: "{content.background}",
    borderColor: "{content.border.color}",
    color: "{content.color}",
    transitionDuration: "{transition.duration}",
  },
  gutter: {
    background: "{content.border.color}",
  },
  handle: {
    size: "24px",
    background: "transparent",
    borderRadius: "{content.border.radius}",
    focusRing: {
      width: "{focus.ring.width}",
      style: "{focus.ring.style}",
      color: "{focus.ring.color}",
      offset: "{focus.ring.offset}",
      shadow: "{focus.ring.shadow}",
    },
  },
};
