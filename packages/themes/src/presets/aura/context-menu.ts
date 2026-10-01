/**
 * Ultimate Aura-derived contextmenu component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset contextmenu module
 * (`.vendor-extracted/themes/src/presets/aura/contextmenu/index.ts`). Top-level
 * sections `root`, `list`, `item`, `submenu`, `submenuIcon`, `separator` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's contextmenu module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `ContextMenuComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface ContextMenuComponentTokens {
  root?: Record<string, unknown>;
  list?: Record<string, unknown>;
  item?: Record<string, unknown>;
  submenu?: Record<string, unknown>;
  submenuIcon?: Record<string, unknown>;
  separator?: Record<string, unknown>;
}

export const contextMenu: ContextMenuComponentTokens = {
  root: {
    background: "{content.background}",
    borderColor: "{content.border.color}",
    color: "{content.color}",
    borderRadius: "{content.border.radius}",
    shadow: "{overlay.navigation.shadow}",
    transitionDuration: "{transition.duration}",
  },
  list: {
    padding: "{navigation.list.padding}",
    gap: "{navigation.list.gap}",
  },
  item: {
    focusBackground: "{navigation.item.focus.background}",
    activeBackground: "{navigation.item.active.background}",
    color: "{navigation.item.color}",
    focusColor: "{navigation.item.focus.color}",
    activeColor: "{navigation.item.active.color}",
    padding: "{navigation.item.padding}",
    borderRadius: "{navigation.item.border.radius}",
    gap: "{navigation.item.gap}",
    icon: {
      color: "{navigation.item.icon.color}",
      focusColor: "{navigation.item.icon.focus.color}",
      activeColor: "{navigation.item.icon.active.color}",
    },
  },
  submenu: {
    mobileIndent: "1rem",
  },
  submenuIcon: {
    size: "{navigation.submenu.icon.size}",
    color: "{navigation.submenu.icon.color}",
    focusColor: "{navigation.submenu.icon.focus.color}",
    activeColor: "{navigation.submenu.icon.active.color}",
  },
  separator: {
    borderColor: "{content.border.color}",
  },
};
