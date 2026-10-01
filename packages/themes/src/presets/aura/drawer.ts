/**
 * Ultimate Aura-derived drawer component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset drawer module
 * (`.vendor-extracted/themes/src/presets/aura/drawer/index.ts`). Top-level
 * sections `root`, `header`, `title`, `content`, `footer` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's drawer module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `DrawerComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface DrawerComponentTokens {
  root?: Record<string, unknown>;
  header?: Record<string, unknown>;
  title?: Record<string, unknown>;
  content?: Record<string, unknown>;
  footer?: Record<string, unknown>;
}

export const drawer: DrawerComponentTokens = {
  root: {
    background: "{overlay.modal.background}",
    borderColor: "{overlay.modal.border.color}",
    color: "{overlay.modal.color}",
    shadow: "{overlay.modal.shadow}",
  },
  header: {
    padding: "{overlay.modal.padding}",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "600",
  },
  content: {
    padding: "0 {overlay.modal.padding} {overlay.modal.padding} {overlay.modal.padding}",
  },
  footer: {
    padding: "{overlay.modal.padding}",
  },
};
