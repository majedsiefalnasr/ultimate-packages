import { style as menuStyle } from "@ultimate/uix-styles/menu";

/**
 * Ultimate-owned adaptation of PrimeNG's `MenuStyle` (see
 * `.vendor-extracted/ng/menu/style/menustyle.ts`), shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract — same pattern
 * as `ButtonStyle` (Task 12) and every other component's style adapter in
 * this package.
 *
 * Per Task 3's corrected finding that `@primeuix/styles` never exports a
 * `classes` object, `@ultimate/uix-styles/menu` exports only `style`
 * (verified: `packages/uix-styles/src/menu/index.ts`) — the `classes`
 * class-name-slot resolver is ported here instead, locally, from the
 * extracted reference file's own `const classes = {...}`, with `.p-menu*`
 * selectors renamed to `.u-menu*`.
 *
 * The extracted resolvers take `({ instance, item, id })` and read
 * PrimeNG's `instance.focusedOptionId()`/`instance.disabled(item.disabled)`
 * signal/passthrough machinery. Dropped here since `cx()`
 * (`packages/ng-core/src/basecomponent/base-component.ts`) invokes
 * `styleModule.classes[key](params)` with a plain flat params object, no
 * `{ instance }` wrapper — matching `ButtonStyle`'s already-established,
 * real working contract rather than the brief's illustrative shape.
 *
 * `p-focus`/`p-disabled` kept unrenamed (same precedent as `CheckboxStyle`,
 * `packages/ng/src/checkbox/checkbox-style.ts`) to match the literal
 * `.p-focus`/`.p-disabled` selectors in `@ultimate/uix-styles/menu`'s CSS —
 * these are PrimeNG-wide shared modifier classes, not `u-menu`-scoped ones.
 */
const css = /*css*/ `
    ${menuStyle}
`;

/** Params `UMenu` passes into `cx('root'|'item', params)` — see `UBaseComponent.cx()`. */
export interface MenuClassesParams {
  popup?: boolean;
  focused?: boolean;
  disabled?: boolean;
}

/**
 * Class-name-slot resolver for `UMenu`, ported from the extracted
 * `MenuStyle`'s own `classes` object (`.p-menu*` renamed to `.u-menu*`,
 * `instance`/passthrough fallbacks dropped in favor of flat params).
 */
const classes = {
  root: (params: MenuClassesParams = {}) => {
    const { popup } = params;
    return [
      "u-menu u-component",
      {
        "u-menu-overlay": popup,
      },
    ];
  },
  start: "u-menu-start",
  list: "u-menu-list",
  submenuLabel: "u-menu-submenu-label",
  separator: "u-menu-separator",
  end: "u-menu-end",
  item: (params: MenuClassesParams = {}) => {
    const { focused, disabled } = params;
    return [
      "u-menu-item",
      {
        "p-focus": focused,
        "p-disabled": disabled,
      },
    ];
  },
  itemContent: "u-menu-item-content",
  itemLink: "u-menu-item-link",
  itemIcon: "u-menu-item-icon",
  itemLabel: "u-menu-item-label",
};

/** `UBaseComponent`-shaped style module for `UMenu`. */
export const menuStyleModule = { css, classes };
