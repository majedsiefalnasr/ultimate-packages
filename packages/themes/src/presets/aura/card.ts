/**
 * Ultimate Aura-derived card component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset card module
 * (`.vendor-extracted/themes/src/presets/aura/card/index.ts`). Top-level
 * sections `root`, `body`, `caption`, `title`, `subtitle` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's card module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `CardComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface CardComponentTokens {
  root?: Record<string, unknown>;
  body?: Record<string, unknown>;
  caption?: Record<string, unknown>;
  title?: Record<string, unknown>;
  subtitle?: Record<string, unknown>;
}

export const card: CardComponentTokens = {
  root: {
    background: "{content.background}",
    borderRadius: "{border.radius.xl}",
    color: "{content.color}",
    shadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
  },
  body: {
    padding: "1.25rem",
    gap: "0.5rem",
  },
  caption: {
    gap: "0.5rem",
  },
  title: {
    fontSize: "1.25rem",
    fontWeight: "500",
  },
  subtitle: {
    color: "{text.muted.color}",
  },
};
