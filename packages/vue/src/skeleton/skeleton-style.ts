/**
 * Ultimate-owned adaptation of PrimeVue's `Skeleton` style (see
 * `.vendor-extracted/vue/skeleton/style/SkeletonStyle.js`), shaped to match
 * `createBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/skeleton` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `messageStyleModule`).
 * GAP-064 G3-A: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3a-port.mjs).
 */
const css = /*css*/ `
.u-skeleton{display: block;overflow: hidden;background: dt('skeleton.background');border-radius: dt('skeleton.border.radius');}
.u-skeleton-wave::after{content: '';animation: u-skeleton-animation 1.2s infinite;height: 100%;left: 0;position: absolute;right: 0;top: 0;transform: translateX(-100%);z-index: 1;background: linear-gradient(90deg, rgba(255, 255, 255, 0), dt('skeleton.animation.background'), rgba(255, 255, 255, 0));}
[dir='rtl'] .u-skeleton-wave::after{animation-name: u-skeleton-animation-rtl;}
.u-skeleton-circle{border-radius: 50%;}
@keyframes u-skeleton-animation{from{transform: translateX(-100%);}to{transform: translateX(100%);}}
@keyframes u-skeleton-animation-rtl{from{transform: translateX(100%);}to{transform: translateX(-100%);}}
.u-skeleton{position: relative;}
`;

const classes = {
  root: (params?: Record<string, unknown>) => [
    "u-skeleton u-component",
    params?.["shape"] === "circle" ? "u-skeleton-circle" : "",
    params?.["animation"] === "wave" ? "u-skeleton-wave" : "",
  ]
    .filter(Boolean)
    .join(" "),
};

/** `createBaseComponent`-shaped style module for `USkeleton`. */
export const skeletonStyleModule = { css, classes };
