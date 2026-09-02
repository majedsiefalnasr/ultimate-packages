import { style as virtualscrollerStyle } from "@ultimate/uix-styles/virtualscroller";

/**
 * `UBaseComponent`-shaped style module for `UScroller`. Composes Task 1's
 * ported `@ultimate/uix-styles/virtualscroller` tokens (loader mask/icon
 * styling) with this component's own structural layout CSS, following
 * `button-style.ts`'s established `${importedStyle}` interpolation pattern.
 */
const css = /*css*/ `
    ${virtualscrollerStyle}

    .u-scroller {
        overflow: auto;
        position: relative;
    }
    .u-scroller-content {
        position: absolute;
        width: 100%;
    }
    .u-scroller-item {
        position: absolute;
        width: 100%;
    }
    .u-scroller-loader {
        position: sticky;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
`;

/**
 * Class-name-slot resolver for `UScroller`. Real PrimeNG loader class names
 * (`.p-virtualscroller-loader`/`.p-virtualscroller-loading-icon`) renamed
 * `.p-*`→`.u-*`.
 */
const classes = {
  root: () => "u-scroller u-component",
  content: () => "u-scroller-content",
  item: () => "u-scroller-item",
  loader: () => "u-scroller-loader",
};

/** `UBaseComponent`-shaped style module for `UScroller`. */
export const scrollerStyleModule = { css, classes };
