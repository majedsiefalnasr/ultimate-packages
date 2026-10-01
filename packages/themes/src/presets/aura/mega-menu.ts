/**
 * Ultimate Aura-derived megamenu component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset megamenu module
 * (`.vendor-extracted/themes/src/presets/aura/megamenu/index.ts`). Top-level
 * sections `root`, `baseItem`, `item`, `overlay`, `submenu`, `submenuLabel`, `submenuIcon`, `separator`, `mobileButton` are transcribed as-is from the extracted
 * upstream source.
 *
 * Unlike button/tooltip, upstream's megamenu module has NO `colorScheme` split — mode-awareness flows transitively through the semantic references, which ARE mode-split in `base.ts`. It is therefore typed with a flat local `MegaMenuComponentTokens` rather than `ComponentTokens`, which would force a fake `colorScheme` wrapper.
 */
export interface MegaMenuComponentTokens {
  root?: Record<string, unknown>;
  baseItem?: Record<string, unknown>;
  item?: Record<string, unknown>;
  overlay?: Record<string, unknown>;
  submenu?: Record<string, unknown>;
  submenuLabel?: Record<string, unknown>;
  submenuIcon?: Record<string, unknown>;
  separator?: Record<string, unknown>;
  mobileButton?: Record<string, unknown>;
}

export const megaMenu: MegaMenuComponentTokens = {
  root: {
    background: "{content.background}",
    borderColor: "{content.border.color}",
    borderRadius: "{content.border.radius}",
    color: "{content.color}",
    gap: "0.5rem",
    verticalOrientation: {
      padding: "{navigation.list.padding}",
      gap: "{navigation.list.gap}",
    },
    horizontalOrientation: {
      padding: "0.5rem 0.75rem",
      gap: "0.5rem",
    },
    transitionDuration: "{transition.duration}",
  },
  baseItem: {
    borderRadius: "{content.border.radius}",
    padding: "{navigation.item.padding}",
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
  overlay: {
    padding: "0",
    background: "{content.background}",
    borderColor: "{content.border.color}",
    borderRadius: "{content.border.radius}",
    color: "{content.color}",
    shadow: "{overlay.navigation.shadow}",
    gap: "0.5rem",
  },
  submenu: {
    padding: "{navigation.list.padding}",
    gap: "{navigation.list.gap}",
  },
  submenuLabel: {
    padding: "{navigation.submenu.label.padding}",
    fontWeight: "{navigation.submenu.label.font.weight}",
    background: "{navigation.submenu.label.background}",
    color: "{navigation.submenu.label.color}",
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
  mobileButton: {
    borderRadius: "50%",
    size: "1.75rem",
    color: "{text.muted.color}",
    hoverColor: "{text.hover.muted.color}",
    hoverBackground: "{content.hover.background}",
    focusRing: {
      width: "{focus.ring.width}",
      style: "{focus.ring.style}",
      color: "{focus.ring.color}",
      offset: "{focus.ring.offset}",
      shadow: "{focus.ring.shadow}",
    },
  },
};
