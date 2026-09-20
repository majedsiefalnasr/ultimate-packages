/**
 * Ultimate-owned adaptation of PrimeNG's `SplitButtonStyle` (see
 * `.vendor-extracted/ng/splitbutton/style/splitbuttonstyle.ts`), shaped to
 * match `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/split-button` entry exists yet, so `css`/`classes`
 * are authored locally (same precedent as `breadcrumbStyleModule`).
 */
const css = /*css*/ `
.u-splitbutton { display: inline-flex; position: relative; border-radius: 6px; }
.u-splitbutton .u-splitbutton-button { border-top-right-radius: 0; border-bottom-right-radius: 0; }
.u-splitbutton .u-splitbutton-dropdown { border-top-left-radius: 0; border-bottom-left-radius: 0; border-left: 0; }
.u-splitbutton-menu-container { position: absolute; top: 100%; left: 0; z-index: 1; }
`;

const classes = {
  root: "u-splitbutton u-component",
  pcButton: "u-splitbutton-button",
  pcDropdown: "u-splitbutton-dropdown",
  menuContainer: "u-splitbutton-menu-container",
};

export const splitButtonStyleModule = { css, classes };
