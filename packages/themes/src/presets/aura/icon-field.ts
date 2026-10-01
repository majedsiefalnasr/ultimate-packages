/**
 * Ultimate Aura-derived iconfield component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset iconfield module
 * (`.vendor-extracted/themes/src/presets/aura/iconfield/index.ts`). Top-level
 * sections `icon` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's iconfield module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `IconFieldComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface IconFieldComponentTokens {
  icon?: Record<string, unknown>;
}

export const iconField: IconFieldComponentTokens = {
  icon: {
    color: "{form.field.icon.color}",
  },
};
