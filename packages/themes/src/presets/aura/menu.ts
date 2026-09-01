/**
 * Ultimate Aura-derived menu component tokens.
 *
 * Ported (Option B — reference, not verbatim copy) from
 * `@primeuix/themes@2.0.3`'s Aura preset menu module
 * (`.vendor-extracted/themes/src/presets/aura/menu/index.ts`, recovered in
 * Task 9). `root`, `list`, `item`, `submenuLabel`, `separator` are
 * transcribed as-is from the extracted upstream source.
 *
 * Like checkbox and dialog, upstream's menu module has NO `colorScheme`
 * split — every color value references `{content.*}` / `{navigation.*}`
 * / `{overlay.navigation.*}` semantic tokens instead, and mode-awareness
 * flows transitively through those references, which ARE mode-split in
 * `base.ts`. This type is intentionally a flat `Record<string, unknown>`
 * shape rather than `ComponentTokens<T>` (Task 8's contract type) — forcing
 * a fake `colorScheme` wrapper here would misrepresent upstream's real
 * structure.
 */
export interface MenuComponentTokens {
  root?: Record<string, unknown>;
  list?: Record<string, unknown>;
  item?: Record<string, unknown>;
  submenuLabel?: Record<string, unknown>;
  separator?: Record<string, unknown>;
}

export const menu: MenuComponentTokens = {
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
    color: "{navigation.item.color}",
    focusColor: "{navigation.item.focus.color}",
    padding: "{navigation.item.padding}",
    borderRadius: "{navigation.item.border.radius}",
    gap: "{navigation.item.gap}",
    icon: {
      color: "{navigation.item.icon.color}",
      focusColor: "{navigation.item.icon.focus.color}",
    },
  },
  submenuLabel: {
    padding: "{navigation.submenu.label.padding}",
    fontWeight: "{navigation.submenu.label.font.weight}",
    background: "{navigation.submenu.label.background}",
    color: "{navigation.submenu.label.color}",
  },
  separator: {
    borderColor: "{content.border.color}",
  },
};
