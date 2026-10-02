/**
 * Ultimate Aura-derived progressbar component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset progressbar module
 * (`.vendor-extracted/themes/src/presets/aura/progressbar/index.ts`). Top-level
 * sections `root`, `value`, `label` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's progressbar module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `ProgressBarComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface ProgressBarComponentTokens {
  root?: Record<string, unknown>;
  value?: Record<string, unknown>;
  label?: Record<string, unknown>;
}

export const progressBar: ProgressBarComponentTokens = {
  root: {
    background: "{content.border.color}",
    borderRadius: "{content.border.radius}",
    height: "1.25rem",
  },
  value: {
    background: "{primary.color}",
  },
  label: {
    color: "{primary.contrast.color}",
    fontSize: "0.75rem",
    fontWeight: "600",
  },
};
