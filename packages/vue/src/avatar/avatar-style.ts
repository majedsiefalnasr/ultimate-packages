import { style as avatarStyle } from "@ultimate/uix-styles/avatar";

/**
 * Ultimate-owned adaptation of PrimeVue's `AvatarStyle` (see
 * `.vendor-extracted/vue/avatar/style/AvatarStyle.js`), shaped to match
 * `createBaseComponent`'s `styleModule: {css, classes}` contract. The
 * structural CSS is the shared `@ultimate/uix-styles/avatar` module (ADR-082),
 * the same rules Angular and React use; the `classes` resolvers are local.
 */
const css = /*css*/ `
    ${avatarStyle}
`;

/** Params `Avatar.vue` passes into `cx('root', params)`. */
export interface AvatarClassesParams {
  hasImage?: boolean;
  shape?: string | null;
  size?: string | null;
}

const classes = {
  root: (params: AvatarClassesParams = {}) => {
    const { hasImage, shape, size } = params;
    return [
      "u-avatar",
      {
        "u-avatar-image": !!hasImage,
        "u-avatar-circle": shape === "circle",
        "u-avatar-lg": size === "large",
        "u-avatar-xl": size === "xlarge",
      },
    ];
  },
  label: "u-avatar-text",
  icon: "u-avatar-icon",
};

/** `createBaseComponent`-shaped style module for `UAvatar`. */
export const avatarStyleModule = { css, classes };
