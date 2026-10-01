/**
 * Ultimate Aura-derived accordion component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset accordion module
 * (`.vendor-extracted/themes/src/presets/aura/accordion/index.ts`). Top-level
 * sections `root`, `panel`, `header`, `content` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's accordion module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `AccordionComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface AccordionComponentTokens {
  root?: Record<string, unknown>;
  panel?: Record<string, unknown>;
  header?: Record<string, unknown>;
  content?: Record<string, unknown>;
}

export const accordion: AccordionComponentTokens = {
  root: {
    transitionDuration: "{transition.duration}",
  },
  panel: {
    borderWidth: "0 0 1px 0",
    borderColor: "{content.border.color}",
  },
  header: {
    color: "{text.muted.color}",
    hoverColor: "{text.color}",
    activeColor: "{text.color}",
    activeHoverColor: "{text.color}",
    padding: "1.125rem",
    fontWeight: "600",
    borderRadius: "0",
    borderWidth: "0",
    borderColor: "{content.border.color}",
    background: "{content.background}",
    hoverBackground: "{content.background}",
    activeBackground: "{content.background}",
    activeHoverBackground: "{content.background}",
    focusRing: {
      width: "{focus.ring.width}",
      style: "{focus.ring.style}",
      color: "{focus.ring.color}",
      offset: "-1px",
      shadow: "{focus.ring.shadow}",
    },
    toggleIcon: {
      color: "{text.muted.color}",
      hoverColor: "{text.color}",
      activeColor: "{text.color}",
      activeHoverColor: "{text.color}",
    },
    first: {
      topBorderRadius: "{content.border.radius}",
      borderWidth: "0",
    },
    last: {
      bottomBorderRadius: "{content.border.radius}",
      activeBottomBorderRadius: "0",
    },
  },
  content: {
    borderWidth: "0",
    borderColor: "{content.border.color}",
    background: "{content.background}",
    color: "{text.color}",
    padding: "0 1.125rem 1.125rem 1.125rem",
  },
};
