/**
 * Ultimate Aura-derived panel component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset panel module
 * (`.vendor-extracted/themes/src/presets/aura/panel/index.ts`). Top-level
 * sections `root`, `header`, `toggleableHeader`, `title`, `content`, `footer` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's panel module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `PanelComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface PanelComponentTokens {
  root?: Record<string, unknown>;
  header?: Record<string, unknown>;
  toggleableHeader?: Record<string, unknown>;
  title?: Record<string, unknown>;
  content?: Record<string, unknown>;
  footer?: Record<string, unknown>;
}

export const panel: PanelComponentTokens = {
  root: {
    background: "{content.background}",
    borderColor: "{content.border.color}",
    color: "{content.color}",
    borderRadius: "{content.border.radius}",
  },
  header: {
    background: "transparent",
    color: "{text.color}",
    padding: "1.125rem",
    borderColor: "{content.border.color}",
    borderWidth: "0",
    borderRadius: "0",
  },
  toggleableHeader: {
    padding: "0.375rem 1.125rem",
  },
  title: {
    fontWeight: "600",
  },
  content: {
    padding: "0 1.125rem 1.125rem 1.125rem",
  },
  footer: {
    padding: "0 1.125rem 1.125rem 1.125rem",
  },
};
