/**
 * Ultimate Aura-derived rating component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset rating module
 * (`.vendor-extracted/themes/src/presets/aura/rating/index.ts`). Top-level
 * sections `root`, `icon` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's rating module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `RatingComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface RatingComponentTokens {
  root?: Record<string, unknown>;
  icon?: Record<string, unknown>;
}

export const rating: RatingComponentTokens = {
  root: {
    gap: "0.25rem",
    transitionDuration: "{transition.duration}",
    focusRing: {
      width: "{focus.ring.width}",
      style: "{focus.ring.style}",
      color: "{focus.ring.color}",
      offset: "{focus.ring.offset}",
      shadow: "{focus.ring.shadow}",
    },
  },
  icon: {
    size: "1rem",
    color: "{text.muted.color}",
    hoverColor: "{primary.color}",
    activeColor: "{primary.color}",
  },
};
