import { style as virtualscrollerStyle } from "@ultimate/uix-styles/virtualscroller";

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

const classes = {
  root: () => "u-scroller u-component",
  content: () => "u-scroller-content",
  item: () => "u-scroller-item",
  loader: () => "u-scroller-loader",
};

export const scrollerStyleModule = { css, classes };
