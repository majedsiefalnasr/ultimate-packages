/**
 * Ultimate-owned adaptation of PrimeNG's `AvatarGroupStyle` (see
 * `.vendor-extracted/ng/avatargroup/style/avatargroupstyle.ts`), shaped to
 * match `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/avatar-group` entry exists yet, so `css`/`classes`
 * are authored locally (same precedent as `avatarStyleModule`).
 *
 * The overlapping-avatar layout (negative left margin + a border to
 * separate stacked avatars) is real PrimeNG's own documented `AvatarGroup`
 * visual behavior (see PrimeNG's live demo), ported here as plain CSS —
 * no JS overlap-calculation logic exists in any of the 3 real sources.
 */
const css = /*css*/ `
.u-avatar-group { display: flex; align-items: center; }
.u-avatar-group .u-avatar + .u-avatar { margin-left: -1rem; }
.u-avatar-group .u-avatar { border: 2px solid var(--u-avatar-group-border-color, #fff); }
`;

const classes = {
  root: () => ["u-avatar-group u-component"],
};

/** `UBaseComponent`-shaped style module for `UAvatarGroup`. */
export const avatarGroupStyleModule = { css, classes };
