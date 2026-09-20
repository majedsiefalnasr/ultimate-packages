/**
 * Ultimate-owned adaptation of PrimeNG's `ButtonGroupStyle` (see
 * `.vendor-extracted/ng/buttongroup/style/buttongroupstyle.ts`), shaped to
 * match `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/button-group` entry exists yet, so `css`/`classes`
 * are authored locally (same precedent as `avatarGroupStyleModule`).
 *
 * The merged/no-gap button-group visual (adjoining borders, squared-off
 * inner corners) is real PrimeNG's own documented `ButtonGroup` CSS —
 * no JS layout logic exists in any of the 3 real sources.
 */
const css = /*css*/ `
.u-button-group { display: inline-flex; }
.u-button-group .u-button { border-radius: 0; }
.u-button-group .u-button:not(:last-child) { border-right: 0 none; }
.u-button-group .u-button:first-child { border-top-left-radius: 6px; border-bottom-left-radius: 6px; }
.u-button-group .u-button:last-child { border-top-right-radius: 6px; border-bottom-right-radius: 6px; }
.u-button-group .u-button:focus { position: relative; z-index: 1; }
`;

const classes = {
  root: () => ["u-button-group u-component"],
};

/** `UBaseComponent`-shaped style module for `UButtonGroup`. */
export const buttonGroupStyleModule = { css, classes };
