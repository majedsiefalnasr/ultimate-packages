/**
 * Ultimate Aura-derived dataview component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset dataview module
 * (`.vendor-extracted/themes/src/presets/aura/dataview/index.ts`). Top-level
 * sections `root`, `header`, `content`, `footer`, `paginatorTop`, `paginatorBottom` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's dataview module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `DataViewComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface DataViewComponentTokens {
  root?: Record<string, unknown>;
  header?: Record<string, unknown>;
  content?: Record<string, unknown>;
  footer?: Record<string, unknown>;
  paginatorTop?: Record<string, unknown>;
  paginatorBottom?: Record<string, unknown>;
}

export const dataView: DataViewComponentTokens = {
  root: {
    borderColor: "transparent",
    borderWidth: "0",
    borderRadius: "0",
    padding: "0",
  },
  header: {
    background: "{content.background}",
    color: "{content.color}",
    borderColor: "{content.border.color}",
    borderWidth: "0 0 1px 0",
    padding: "0.75rem 1rem",
    borderRadius: "0",
  },
  content: {
    background: "{content.background}",
    color: "{content.color}",
    borderColor: "transparent",
    borderWidth: "0",
    padding: "0",
    borderRadius: "0",
  },
  footer: {
    background: "{content.background}",
    color: "{content.color}",
    borderColor: "{content.border.color}",
    borderWidth: "1px 0 0 0",
    padding: "0.75rem 1rem",
    borderRadius: "0",
  },
  paginatorTop: {
    borderColor: "{content.border.color}",
    borderWidth: "0 0 1px 0",
  },
  paginatorBottom: {
    borderColor: "{content.border.color}",
    borderWidth: "1px 0 0 0",
  },
};
