/**
 * `UBaseComponent`-shaped style module for `UScroller`.
 * Provides minimal styling for the scroller component root.
 */
const css = /*css*/ `
    .u-scroller {
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
`;

/**
 * Class-name-slot resolver for `UScroller`.
 */
const classes = {
  root: "u-scroller u-component",
};

/** `UBaseComponent`-shaped style module for `UScroller`. */
export const scrollerStyleModule = { css, classes };
