/**
 * Ultimate Aura-derived breadcrumb component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset breadcrumb module
 * (`.vendor-extracted/themes/src/presets/aura/breadcrumb/index.ts`). Top-level
 * sections `root`, `item`, `separator` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's breadcrumb module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `BreadcrumbComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface BreadcrumbComponentTokens {
  root?: Record<string, unknown>;
  item?: Record<string, unknown>;
  separator?: Record<string, unknown>;
}

export const breadcrumb: BreadcrumbComponentTokens = {
  root: {
    padding: "1rem",
    background: "{content.background}",
    gap: "0.5rem",
    transitionDuration: "{transition.duration}",
  },
  item: {
    color: "{text.muted.color}",
    hoverColor: "{text.color}",
    borderRadius: "{content.border.radius}",
    gap: "{navigation.item.gap}",
    icon: {
      color: "{navigation.item.icon.color}",
      hoverColor: "{navigation.item.icon.focus.color}",
    },
    focusRing: {
      width: "{focus.ring.width}",
      style: "{focus.ring.style}",
      color: "{focus.ring.color}",
      offset: "{focus.ring.offset}",
      shadow: "{focus.ring.shadow}",
    },
  },
  separator: {
    color: "{navigation.item.icon.color}",
  },
};
