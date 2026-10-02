/**
 * Ultimate Aura-derived toolbar component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset toolbar module
 * (`.vendor-extracted/themes/src/presets/aura/toolbar/index.ts`). Top-level
 * sections `root` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's toolbar module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `ToolbarComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface ToolbarComponentTokens {
  root?: Record<string, unknown>;
}

export const toolbar: ToolbarComponentTokens = {
  root: {
    background: "{content.background}",
    borderColor: "{content.border.color}",
    borderRadius: "{content.border.radius}",
    color: "{content.color}",
    gap: "0.5rem",
    padding: "0.75rem",
  },
};
