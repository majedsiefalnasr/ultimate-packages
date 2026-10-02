/**
 * Ultimate Aura-derived confirmdialog component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset confirmdialog module
 * (`.vendor-extracted/themes/src/presets/aura/confirmdialog/index.ts`). Top-level
 * sections `icon`, `content` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's confirmdialog module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `ConfirmDialogComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface ConfirmDialogComponentTokens {
  icon?: Record<string, unknown>;
  content?: Record<string, unknown>;
}

export const confirmDialog: ConfirmDialogComponentTokens = {
  icon: {
    size: "2rem",
    color: "{overlay.modal.color}",
  },
  content: {
    gap: "1rem",
  },
};
