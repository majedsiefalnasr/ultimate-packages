/**
 * Ultimate-owned adaptation of PrimeVue's `AvatarStyle` (see
 * `.vendor-extracted/vue/avatar/style/AvatarStyle.js`), shaped to match
 * `createBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/avatar` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `overlayBadgeStyleModule`).
 */
const css = /*css*/ `
.u-avatar { display: inline-flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; font-size: 1rem; }
.u-avatar.u-avatar-image { background-color: transparent; }
.u-avatar.u-avatar-circle { border-radius: 50%; }
.u-avatar.u-avatar-circle img { border-radius: 50%; }
.u-avatar .u-avatar-icon { font-size: 1rem; }
.u-avatar img { width: 100%; height: 100%; }
`;

/** Params `Avatar.vue` passes into `cx('root', params)`. */
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

/** `createBaseComponent`-shaped style module for `UAvatar`. */
export const avatarStyleModule = { css, classes };
