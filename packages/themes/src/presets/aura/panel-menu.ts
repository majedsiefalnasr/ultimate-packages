/**
 * Ultimate Aura-derived panelmenu component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset panelmenu module
 * (`.vendor-extracted/themes/src/presets/aura/panelmenu/index.ts`). Top-level
 * sections `root`, `panel`, `item`, `submenu`, `submenuIcon` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's panelmenu module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `PanelMenuComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface PanelMenuComponentTokens {
  root?: Record<string, unknown>;
  panel?: Record<string, unknown>;
  item?: Record<string, unknown>;
  submenu?: Record<string, unknown>;
  submenuIcon?: Record<string, unknown>;
}

export const panelMenu: PanelMenuComponentTokens = {
  root: {
    gap: "0.5rem",
    transitionDuration: "{transition.duration}",
  },
  panel: {
    background: "{content.background}",
    borderColor: "{content.border.color}",
    borderWidth: "1px",
    color: "{content.color}",
    padding: "0.25rem 0.25rem",
    borderRadius: "{content.border.radius}",
    first: {
      borderWidth: "1px",
      topBorderRadius: "{content.border.radius}",
    },
    last: {
      borderWidth: "1px",
      bottomBorderRadius: "{content.border.radius}",
    },
  },
  item: {
    focusBackground: "{navigation.item.focus.background}",
    color: "{navigation.item.color}",
    focusColor: "{navigation.item.focus.color}",
    gap: "0.5rem",
    padding: "{navigation.item.padding}",
    borderRadius: "{content.border.radius}",
    icon: {
      color: "{navigation.item.icon.color}",
      focusColor: "{navigation.item.icon.focus.color}",
    },
  },
  submenu: {
    indent: "1rem",
  },
  submenuIcon: {
    color: "{navigation.submenu.icon.color}",
    focusColor: "{navigation.submenu.icon.focus.color}",
  },
};
