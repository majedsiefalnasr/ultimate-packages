/**
 * Ultimate Aura-derived splitbutton component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset splitbutton module
 * (`.vendor-extracted/themes/src/presets/aura/splitbutton/index.ts`). Top-level
 * sections `root` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's splitbutton module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `SplitButtonComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface SplitButtonComponentTokens {
  root?: Record<string, unknown>;
}

export const splitButton: SplitButtonComponentTokens = {
  root: {
    borderRadius: "{form.field.border.radius}",
    roundedBorderRadius: "2rem",
    raisedShadow:
      "0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12)",
  },
};
