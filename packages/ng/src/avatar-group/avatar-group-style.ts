import { style as avatarStyle } from "@ultimate/uix-styles/avatar";

/**
 * Ultimate-owned adaptation of PrimeNG's `AvatarGroupStyle` (see
 * `.vendor-extracted/ng/avatargroup/style/avatargroupstyle.ts`), shaped to
 * match `UBaseComponent`'s `styleModule: {css, classes}` contract. Like
 * PrimeNG, the group uses the whole avatar style: the overlapping layout is
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

/** `UBaseComponent`-shaped style module for `UAvatarGroup`. */
export const avatarGroupStyleModule = { css, classes };
