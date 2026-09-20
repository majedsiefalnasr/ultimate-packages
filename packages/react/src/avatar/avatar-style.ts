/**
 * Ultimate-owned adaptation of PrimeReact's `AvatarBase` style (see
 * `.vendor-extracted/react/avatar/AvatarBase.js`), shaped to match
 * `useComponentBase`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/avatar` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `contextMenuStyleModule`).
 */
const css = /*css*/ `
.u-avatar { display: inline-flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; font-size: 1rem; }
.u-avatar.u-avatar-image { background-color: transparent; }
.u-avatar.u-avatar-circle { border-radius: 50%; }
.u-avatar.u-avatar-circle img { border-radius: 50%; }
.u-avatar .u-avatar-icon { font-size: 1rem; }
.u-avatar img { width: 100%; height: 100%; }
`;

export interface AvatarClassesParams {
  hasImage?: boolean;
  imageFailed?: boolean;
  shape?: string | null;
  size?: string | null;
}

const classes = {
  root: (params: AvatarClassesParams = {}) => {
    const { hasImage, imageFailed, shape, size } = params;
    return [
      "u-avatar",
      {
        "u-avatar-image": !!hasImage && !imageFailed,
        "u-avatar-circle": shape === "circle",
        "u-avatar-lg": size === "large",
        "u-avatar-xl": size === "xlarge",
      },
    ];
  },
  label: "u-avatar-text",
  icon: "u-avatar-icon",
};

/** `useComponentBase`-shaped style module for `UAvatar`. */
export const avatarStyleModule = { css, classes };
