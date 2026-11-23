import { style as avatarStyle } from "@ultimate/uix-styles/avatar";

/**
 * Ultimate-owned adaptation of PrimeVue's `AvatarGroupStyle` (see
 * `.vendor-extracted/vue/avatargroup/style/AvatarGroupStyle.js`), shaped to
 * match `createBaseComponent`'s `styleModule: {css, classes}` contract. Like
 * PrimeVue, the group uses the whole avatar style: the overlapping layout is
 * the `.u-avatar-group` rules of the shared `@ultimate/uix-styles/avatar`
 * module (ADR-082), with a logical `margin-inline-start` and a size-specific
 * offset taken from the `avatar.group.*` tokens (ADR-087).
 */
const css = /*css*/ `
    ${avatarStyle}
`;

const classes = {
  root: () => ["u-avatar-group u-component"],
};

/** `createBaseComponent`-shaped style module for `UAvatarGroup`. */
export const avatarGroupStyleModule = { css, classes };
