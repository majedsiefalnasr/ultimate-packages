/**
 * Ultimate Aura-derived inplace component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset inplace module
 * (`.vendor-extracted/themes/src/presets/aura/inplace/index.ts`). Top-level
 * sections `root`, `display` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's inplace module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `InplaceComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface InplaceComponentTokens {
  root?: Record<string, unknown>;
  display?: Record<string, unknown>;
}

export const inplace: InplaceComponentTokens = {
  root: {
    padding: "{form.field.padding.y} {form.field.padding.x}",
    borderRadius: "{content.border.radius}",
    focusRing: {
      width: "{focus.ring.width}",
      style: "{focus.ring.style}",
      color: "{focus.ring.color}",
      offset: "{focus.ring.offset}",
      shadow: "{focus.ring.shadow}",
    },
    transitionDuration: "{transition.duration}",
  },
  display: {
    hoverBackground: "{content.hover.background}",
    hoverColor: "{content.hover.color}",
  },
};
