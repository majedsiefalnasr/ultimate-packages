/**
 * Ultimate Aura-derived speeddial component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset speeddial module
 * (`.vendor-extracted/themes/src/presets/aura/speeddial/index.ts`). Top-level
 * sections `root` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's speeddial module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `SpeedDialComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface SpeedDialComponentTokens {
  root?: Record<string, unknown>;
}

export const speedDial: SpeedDialComponentTokens = {
  root: {
    gap: "0.5rem",
    transitionDuration: "{transition.duration}",
  },
};
