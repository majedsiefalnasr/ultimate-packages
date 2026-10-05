/**
 * Ultimate Aura-derived inputgroup component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset inputgroup module
 * (`.vendor-extracted/themes/src/presets/aura/inputgroup/index.ts`). The
 * top-level section `addon` is transcribed as-is from the extracted upstream
 * source (GAP-064 Tranche 1).
 *
 * Upstream's inputgroup module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `InputGroupComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface InputGroupComponentTokens {
  addon?: Record<string, unknown>;
}

export const inputGroup: InputGroupComponentTokens = {
  addon: {
    background: "{form.field.background}",
    borderColor: "{form.field.border.color}",
    color: "{form.field.icon.color}",
    borderRadius: "{form.field.border.radius}",
    padding: "0.5rem",
    minWidth: "2.5rem",
  },
};
