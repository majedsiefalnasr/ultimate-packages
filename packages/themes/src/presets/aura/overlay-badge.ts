/**
 * Ultimate Aura-derived overlaybadge component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset overlaybadge module
 * (`.vendor-extracted/themes/src/presets/aura/overlaybadge/index.ts`). Top-level
 * sections `root` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's overlaybadge module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `OverlayBadgeComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface OverlayBadgeComponentTokens {
  root?: Record<string, unknown>;
}

export const overlayBadge: OverlayBadgeComponentTokens = {
  root: {
    outline: {
      width: "2px",
      color: "{content.background}",
    },
  },
};
