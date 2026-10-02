/**
 * Ultimate Aura-derived dock component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset dock module
 * (`.vendor-extracted/themes/src/presets/aura/dock/index.ts`). Top-level
 * sections `root`, `item` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's dock module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `DockComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface DockComponentTokens {
  root?: Record<string, unknown>;
  item?: Record<string, unknown>;
}

export const dock: DockComponentTokens = {
  root: {
    background: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    padding: "0.5rem",
    borderRadius: "{border.radius.xl}",
  },
  item: {
    borderRadius: "{content.border.radius}",
    padding: "0.5rem",
    size: "3rem",
    focusRing: {
      width: "{focus.ring.width}",
      style: "{focus.ring.style}",
      color: "{focus.ring.color}",
      offset: "{focus.ring.offset}",
      shadow: "{focus.ring.shadow}",
    },
  },
};
