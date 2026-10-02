/**
 * Ultimate Aura-derived blockui component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset blockui module
 * (`.vendor-extracted/themes/src/presets/aura/blockui/index.ts`). Top-level
 * sections `root` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's blockui module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `BlockUIComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface BlockUIComponentTokens {
  root?: Record<string, unknown>;
}

export const blockUI: BlockUIComponentTokens = {
  root: {
    borderRadius: "{content.border.radius}",
  },
};
