/**
 * Ultimate-owned adaptation of PrimeVue's `DrawerStyle` (see
 * `.vendor-extracted/vue/drawer/Drawer.vue` / `BaseDrawer.vue`), shaped to
 * match `createBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/drawer` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as other Overlay-family components).
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

/** Params `UDrawer` passes into `cx('root', params)` — see `createBaseComponent`'s `cx()`. */
export interface DrawerClassesParams {
  position?: string;
}

const classes = {
  mask: () => ["u-drawer-mask"],
  root: (params: DrawerClassesParams = {}) => ["u-drawer u-component", `u-drawer-position-${params.position ?? "left"}`],
  header: "u-drawer-header",
  title: "u-drawer-title",
  closeButton: "u-drawer-close-button",
  content: "u-drawer-content",
  footer: "u-drawer-footer",
};

/** `createBaseComponent`-shaped style module for `UDrawer`. */
export const drawerStyleModule = { css, classes };
