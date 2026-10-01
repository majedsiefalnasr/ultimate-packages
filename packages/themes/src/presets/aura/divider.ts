/**
 * Ultimate Aura-derived divider component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset divider module
 * (`.vendor-extracted/themes/src/presets/aura/divider/index.ts`). Top-level
 * sections `root`, `content`, `horizontal`, `vertical` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's divider module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `DividerComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface DividerComponentTokens {
  root?: Record<string, unknown>;
  content?: Record<string, unknown>;
  horizontal?: Record<string, unknown>;
  vertical?: Record<string, unknown>;
}

export const divider: DividerComponentTokens = {
  root: {
    borderColor: "{content.border.color}",
  },
  content: {
    background: "{content.background}",
    color: "{text.color}",
  },
  horizontal: {
    margin: "1rem 0",
    padding: "0 1rem",
    content: {
      padding: "0 0.5rem",
    },
  },
  vertical: {
    margin: "0 1rem",
    padding: "0.5rem 0",
    content: {
      padding: "0.5rem 0",
    },
  },
};
