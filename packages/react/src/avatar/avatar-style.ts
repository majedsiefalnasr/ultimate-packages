import type { StyleModule } from "@ultimate/react-core";
import { style as avatarStyle } from "@ultimate/uix-styles/avatar";

/**
 * `useComponentBase`-shaped style module for `UAvatar`. The structural CSS is
 * the shared `@ultimate/uix-styles/avatar` module (ADR-082, ADR-087), so it
 * reads the Aura `avatar` tokens and matches Angular and Vue.
 */
const css = /*css*/ `
    ${avatarStyle}
`;

export interface AvatarClassesParams {
  hasImage?: boolean;
  clickable?: boolean;
  shape?: string | null;
  size?: string | null;
}

const classes = {
  root: (params: AvatarClassesParams = {}) => {
    const { hasImage, clickable, shape, size } = params;
    return [
      "u-avatar u-component",
      {
        "u-avatar-image": !!hasImage,
        "u-avatar-clickable": !!clickable,
        "u-avatar-circle": shape === "circle",
        "u-avatar-lg": size === "large",
        "u-avatar-xl": size === "xlarge",
      },
    ];
  },
  label: "u-avatar-text",
  icon: "u-avatar-icon",
};

export const avatarStyleModule: StyleModule = { css, classes };
