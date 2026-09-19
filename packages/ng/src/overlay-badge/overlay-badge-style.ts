/**
 * Ultimate-owned adaptation of PrimeNG's `OverlayBadgeStyle` (see
 * `.vendor-extracted/ng/overlaybadge/overlaybadge.ts` / `style/`), shaped
 * to match `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/overlay-badge` entry exists yet, so `css`/`classes`
 * are authored locally (same precedent as `tieredMenuStyleModule`).
 */
const css = /*css*/ `
.u-overlaybadge { position: relative; display: inline-flex; }
.u-overlaybadge .u-badge { position: absolute; top: 0; right: 0; transform: translate(50%, -50%); transform-origin: 100% 0; margin: 0; }
`;

const classes = {
  root: () => ["u-overlaybadge"],
};

/** `UBaseComponent`-shaped style module for `UOverlayBadge`. */
export const overlayBadgeStyleModule = { css, classes };
