/**
 * Ultimate-owned adaptation of PrimeVue's `AvatarGroupStyle` (see
 * `.vendor-extracted/vue/avatargroup/style/AvatarGroupStyle.js`), shaped to
 * match `createBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/avatar-group` entry exists yet, so `css`/`classes`
 * are authored locally (same precedent as `avatarStyleModule`).
 */
const css = /*css*/ `
.u-avatar-group { display: flex; align-items: center; }
.u-avatar-group .u-avatar + .u-avatar { margin-left: -1rem; }
.u-avatar-group .u-avatar { border: 2px solid var(--u-avatar-group-border-color, #fff); }
`;

const classes = {
  root: () => ["u-avatar-group u-component"],
};

/** `createBaseComponent`-shaped style module for `UAvatarGroup`. */
export const avatarGroupStyleModule = { css, classes };
