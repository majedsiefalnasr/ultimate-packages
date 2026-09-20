import type { UMenuItem } from "@ultimate/ng-core";

/**
 * A single group within one MegaMenu overlay column — an optional
 * `label` header followed by a flat list of leaf items. Adapted from real
 * PrimeNG's per-column `submenu` entries (`.vendor-extracted/ng/megamenu/
 * megamenu.ts`, `MegaMenuSub`'s `submenu`/`items` inputs).
 */
export interface UMegaMenuGroup extends Omit<UMenuItem, "items"> {
  /** Flat leaf items rendered under this group's own label. */
  items?: UMenuItem[];
}

/**
 * MegaMenu's own root-item shape, adapted from real PrimeNG's
 * `MegaMenuItem` (`.vendor-extracted/ng/megamenu/megamenu.ts`,
 * `processedItem.items` — verified real source: a root item's own `items`
 * is a 2D array — array of columns, each column an array of submenu
 * groups (`UMegaMenuGroup`) — rendered as a CSS grid of `<ul>` columns.
 * MegaMenu's genuinely distinguishing structural trait vs. the flat 1D
 * nesting `UMenuItem.items` gives Menubar/TieredMenu/PanelMenu. Kept as
 * its own interface (extending, not mutating, `UMenuItem`) rather than
 * widening the shared `ng-core` `UMenuItem.items` field to a union — that
 * would leak MegaMenu-only shape ambiguity into every other capability
 * that already consumes `UMenuItem` (`UMenu`, `UBreadcrumb`, `UMenubar`,
 * `UTieredMenu`, `UPanelMenu`, `USplitButton`), each of which only ever
 * expects a flat `UMenuItem[]`.
 */
export interface UMegaMenuItem extends Omit<UMenuItem, "items"> {
  /**
   * A 2D array of columns, each column an array of submenu groups
   * (`UMegaMenuGroup`, each with its own flat leaf `items`). `undefined`/
   * absent for a leaf root item with no overlay.
   */
  items?: UMegaMenuGroup[][];
}
