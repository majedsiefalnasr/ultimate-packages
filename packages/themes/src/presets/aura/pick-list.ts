/**
 * Ultimate Aura-derived picklist component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset picklist module
 * (`.vendor-extracted/themes/src/presets/aura/picklist/index.ts`). Top-level
 * sections `root`, `controls` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's picklist module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `PickListComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface PickListComponentTokens {
  root?: Record<string, unknown>;
  controls?: Record<string, unknown>;
}

export const pickList: PickListComponentTokens = {
  root: {
    gap: "1.125rem",
  },
  controls: {
    gap: "0.5rem",
  },
};
