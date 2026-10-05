/**
 * Ultimate-owned adaptation of PrimeVue's `AvatarStyle` (see
 * `.vendor-extracted/vue/avatar/style/AvatarStyle.js`), shaped to match
 * `createBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/avatar` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `overlayBadgeStyleModule`).
 * GAP-064 G3-A: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3a-port.mjs).
 */
const css = /*css*/ `
.u-avatar{display: inline-flex;align-items: center;justify-content: center;width: dt('avatar.width');height: dt('avatar.height');font-size: dt('avatar.font.size');background: dt('avatar.background');color: dt('avatar.color');border-radius: dt('avatar.border.radius');}
.u-avatar-image{background: transparent;}
.u-avatar-circle{border-radius: 50%;}
.u-avatar-circle img{border-radius: 50%;}
.u-avatar-icon{font-size: dt('avatar.icon.size');width: dt('avatar.icon.size');height: dt('avatar.icon.size');}
.u-avatar img{width: 100%;height: 100%;}
.u-avatar-lg{width: dt('avatar.lg.width');height: dt('avatar.lg.width');font-size: dt('avatar.lg.font.size');}
.u-avatar-lg .u-avatar-icon{font-size: dt('avatar.lg.icon.size');width: dt('avatar.lg.icon.size');height: dt('avatar.lg.icon.size');}
.u-avatar-xl{width: dt('avatar.xl.width');height: dt('avatar.xl.width');font-size: dt('avatar.xl.font.size');}
.u-avatar-xl .u-avatar-icon{font-size: dt('avatar.xl.icon.size');width: dt('avatar.xl.icon.size');height: dt('avatar.xl.icon.size');}
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
