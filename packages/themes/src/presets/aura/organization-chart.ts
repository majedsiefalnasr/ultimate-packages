/**
 * Ultimate Aura-derived organizationchart component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset organizationchart module
 * (`.vendor-extracted/themes/src/presets/aura/organizationchart/index.ts`). Top-level
 * sections `root`, `node`, `nodeToggleButton`, `connector` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's organizationchart module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `OrganizationChartComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 *
 * Note: the OrganizationChart component exists only in the React and Vue packages (DECISION-D excludes Angular); this preset module is framework-neutral, so that has no code implication here.
 */
export interface OrganizationChartComponentTokens {
  root?: Record<string, unknown>;
  node?: Record<string, unknown>;
  nodeToggleButton?: Record<string, unknown>;
  connector?: Record<string, unknown>;
}

export const organizationChart: OrganizationChartComponentTokens = {
  root: {
    gutter: "0.75rem",
    transitionDuration: "{transition.duration}",
  },
  node: {
    background: "{content.background}",
    hoverBackground: "{content.hover.background}",
    selectedBackground: "{highlight.background}",
    borderColor: "{content.border.color}",
    color: "{content.color}",
    selectedColor: "{highlight.color}",
    hoverColor: "{content.hover.color}",
    padding: "0.75rem 1rem",
    toggleablePadding: "0.75rem 1rem 1.25rem 1rem",
    borderRadius: "{content.border.radius}",
  },
  nodeToggleButton: {
    background: "{content.background}",
    hoverBackground: "{content.hover.background}",
    borderColor: "{content.border.color}",
    color: "{text.muted.color}",
    hoverColor: "{text.color}",
    size: "1.5rem",
    borderRadius: "50%",
    focusRing: {
      width: "{focus.ring.width}",
      style: "{focus.ring.style}",
      color: "{focus.ring.color}",
      offset: "{focus.ring.offset}",
      shadow: "{focus.ring.shadow}",
    },
  },
  connector: {
    color: "{content.border.color}",
    borderRadius: "{content.border.radius}",
    height: "24px",
  },
};
