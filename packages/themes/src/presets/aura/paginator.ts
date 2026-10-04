/**
 * Ultimate Aura-derived paginator component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset paginator module
 * (`.vendor-extracted/themes/src/presets/aura/paginator/index.ts`). Top-level
 * sections `root`, `navButton`, `currentPageReport` and `jumpToPageInput` are
 * transcribed as-is from the extracted upstream source (GAP-064 Tranche 1).
 *
 * Upstream's paginator module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `PaginatorComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface PaginatorComponentTokens {
  root?: Record<string, unknown>;
  navButton?: Record<string, unknown>;
  currentPageReport?: Record<string, unknown>;
  jumpToPageInput?: Record<string, unknown>;
}

export const paginator: PaginatorComponentTokens = {
  root: {
    padding: "0.5rem 1rem",
    gap: "0.25rem",
    borderRadius: "{content.border.radius}",
    background: "{content.background}",
    color: "{content.color}",
    transitionDuration: "{transition.duration}",
  },
  navButton: {
    background: "transparent",
    hoverBackground: "{content.hover.background}",
    selectedBackground: "{highlight.background}",
    color: "{text.muted.color}",
    hoverColor: "{text.hover.muted.color}",
    selectedColor: "{highlight.color}",
    width: "2.5rem",
    height: "2.5rem",
    borderRadius: "50%",
    focusRing: {
      width: "{focus.ring.width}",
      style: "{focus.ring.style}",
      color: "{focus.ring.color}",
      offset: "{focus.ring.offset}",
      shadow: "{focus.ring.shadow}",
    },
  },
  currentPageReport: {
    color: "{text.muted.color}",
  },
  jumpToPageInput: {
    maxWidth: "2.5rem",
  },
};
