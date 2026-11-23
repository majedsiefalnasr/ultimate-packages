import { style as avatarStyle } from "@ultimate/uix-styles/avatar";

/**
 * Ultimate-owned adaptation of PrimeNG's `AvatarStyle` (see
 * `.vendor-extracted/ng/avatar/style/avatarstyle.ts`), shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract. The structural
 * CSS is the shared `@ultimate/uix-styles/avatar` module (ADR-082), the same
 * rules React and Vue use; the `classes` resolvers are local.
 */
const css = /*css*/ `
    ${avatarStyle}
`;

/** Params `UAvatar` passes into `cx('root', params)`. */
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

/** `UBaseComponent`-shaped style module for `UAvatar`. */
export const avatarStyleModule = { css, classes };
