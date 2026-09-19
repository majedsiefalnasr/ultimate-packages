/**
 * Ultimate-owned adaptation of PrimeReact's `AvatarGroupBase` style (real
 * source has no dedicated `AvatarGroupBase.js` styles — `AvatarGroup.js`
 * composes only `p-avatar-group p-component` from its own `cx('root')`, no
 * `styles` block of its own beyond real PrimeReact's Avatar/AvatarGroup CSS
 * layer), shaped to match `useComponentBase`'s `styleModule: {css,
 * classes}` contract. No `@ultimate/uix-styles/avatar-group` entry exists
 * yet, so `css`/`classes` are authored locally (same precedent as
 * `avatarStyleModule`).
 */
const css = /*css*/ `
.u-avatar-group { display: flex; align-items: center; }
.u-avatar-group .u-avatar + .u-avatar { margin-left: -1rem; }
.u-avatar-group .u-avatar { border: 2px solid var(--u-avatar-group-border-color, #fff); }
`;

const classes = {
  root: () => ["u-avatar-group u-component"],
};

/** `useComponentBase`-shaped style module for `UAvatarGroup`. */
export const avatarGroupStyleModule = { css, classes };
