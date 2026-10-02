/**
 * Ultimate Aura-derived fieldset component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset fieldset module
 * (`.vendor-extracted/themes/src/presets/aura/fieldset/index.ts`). Top-level
 * sections `root`, `legend`, `toggleIcon`, `content` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's fieldset module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `FieldsetComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface FieldsetComponentTokens {
  root?: Record<string, unknown>;
  legend?: Record<string, unknown>;
  toggleIcon?: Record<string, unknown>;
  content?: Record<string, unknown>;
}

export const fieldset: FieldsetComponentTokens = {
  root: {
    background: "{content.background}",
    borderColor: "{content.border.color}",
    borderRadius: "{content.border.radius}",
    color: "{content.color}",
    padding: "0 1.125rem 1.125rem 1.125rem",
    transitionDuration: "{transition.duration}",
  },
  legend: {
    background: "{content.background}",
    hoverBackground: "{content.hover.background}",
    color: "{content.color}",
    hoverColor: "{content.hover.color}",
    borderRadius: "{content.border.radius}",
    borderWidth: "1px",
    borderColor: "transparent",
    padding: "0.5rem 0.75rem",
    gap: "0.5rem",
    fontWeight: "600",
    focusRing: {
      width: "{focus.ring.width}",
      style: "{focus.ring.style}",
      color: "{focus.ring.color}",
      offset: "{focus.ring.offset}",
      shadow: "{focus.ring.shadow}",
    },
  },
  toggleIcon: {
    color: "{text.muted.color}",
    hoverColor: "{text.hover.muted.color}",
  },
  content: {
    padding: "0",
  },
};
