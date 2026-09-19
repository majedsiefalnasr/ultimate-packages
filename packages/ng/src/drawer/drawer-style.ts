/**
 * Ultimate-owned adaptation of PrimeNG's `DrawerStyle` (see
 * `.vendor-extracted/ng/drawer/drawer.ts` / `style/drawerstyle.ts`), shaped
 * to match `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/drawer` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `tieredMenuStyleModule`).
 */
const css = /*css*/ `
.u-drawer-mask { position: fixed; inset: 0; display: flex; }
.u-drawer { display: flex; flex-direction: column; pointer-events: auto; }
.u-drawer-position-left { top: 0; left: 0; height: 100%; }
.u-drawer-position-right { top: 0; right: 0; height: 100%; margin-left: auto; }
.u-drawer-position-top { top: 0; left: 0; width: 100%; }
.u-drawer-position-bottom { bottom: 0; left: 0; width: 100%; margin-top: auto; }
.u-drawer-position-full { top: 0; left: 0; width: 100%; height: 100%; }
.u-drawer-header { display: flex; align-items: center; justify-content: space-between; }
.u-drawer-content { overflow-y: auto; flex-grow: 1; }
.u-drawer-footer { }
`;

/** Params `UDrawer` passes into `cx('root'|'mask', params)`. */
export interface DrawerClassesParams {
  position?: "left" | "right" | "top" | "bottom" | "full";
}

const classes = {
  mask: () => ["u-drawer-mask"],
  root: (params: DrawerClassesParams = {}) => {
    const { position = "left" } = params;
    return ["u-drawer u-component", `u-drawer-position-${position}`];
  },
  header: "u-drawer-header",
  title: "u-drawer-title",
  pcCloseButton: "u-drawer-close-button",
  content: "u-drawer-content",
  footer: "u-drawer-footer",
};

/** `UBaseComponent`-shaped style module for `UDrawer`. */
export const drawerStyleModule = { css, classes };
