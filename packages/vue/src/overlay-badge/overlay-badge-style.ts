/**
 * Ultimate-owned adaptation of PrimeVue's `OverlayBadgeStyle` (see
 * `.vendor-extracted/vue/overlaybadge/OverlayBadge.vue`), shaped to match
 * `createBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/overlay-badge` entry exists yet, so `css`/`classes`
 * are authored locally (same precedent as other Overlay-family components).
 */
const css = /*css*/ `
.u-overlaybadge { position: relative; display: inline-flex; }
.u-overlaybadge .u-badge { position: absolute; top: 0; right: 0; transform: translate(50%, -50%); transform-origin: 100% 0; margin: 0; }
`;

const classes = {
  root: () => ["u-overlaybadge"],
};

/** `createBaseComponent`-shaped style module for `UOverlayBadge`. */
export const overlayBadgeStyleModule = { css, classes };
