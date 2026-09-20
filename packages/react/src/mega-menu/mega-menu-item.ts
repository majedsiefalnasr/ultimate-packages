import type { UMenuItem } from "../menu";

/**
 * A single group within one MegaMenu overlay column — an optional `label`
 * header followed by a flat list of leaf items. Adapted from real
 * PrimeReact's per-column `submenu` entries
 * (`.vendor-extracted/react/megamenu/MegaMenu.js`, `createColumns`).
 */
export interface UMegaMenuGroup extends Omit<UMenuItem, "items"> {
  /** Flat leaf items rendered under this group's own label. */
  items?: UMenuItem[];
}

/**
 * MegaMenu's own root-item shape, adapted from real PrimeReact's
 * `MegaMenuItem` (`.vendor-extracted/react/megamenu/MegaMenu.js`,
 * `createColumns`/`createSubmenu` — verified real source: a root item's
 * own `items` is a 2D array, array of columns, each column an array of
 * submenu groups (`UMegaMenuGroup`), rendered as a CSS grid of columns.
 * MegaMenu's genuinely distinguishing structural trait vs. the flat 1D
 * nesting `UMenuItem.items` gives Menubar/TieredMenu/PanelMenu. Kept as
 * its own interface (extending, not mutating, `UMenuItem`) — same rationale
 * as the Angular sibling's `mega-menu-item.ts`.
 */
export interface UMegaMenuItem extends Omit<UMenuItem, "items"> {
  /** A 2D array of columns, each column an array of submenu groups. */
  items?: UMegaMenuGroup[][];
}
