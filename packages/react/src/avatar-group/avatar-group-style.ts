import type { StyleModule } from "@ultimate/react-core";
import { style as avatarStyle } from "@ultimate/uix-styles/avatar";

/**
 * `useComponentBase`-shaped style module for `UAvatarGroup`. Like PrimeReact,
 * the group uses the whole avatar style: the overlapping layout is the
 * `.u-avatar-group` rules of the shared `@ultimate/uix-styles/avatar` module
 * (ADR-082, ADR-087), with a logical `margin-inline-start` and a size-specific
 * offset taken from the `avatar.group.*` tokens.
 */
const css = /*css*/ `
    ${avatarStyle}
`;

const classes = {
  root: () => ["u-avatar-group u-component"],
};

export const avatarGroupStyleModule: StyleModule = { css, classes };
