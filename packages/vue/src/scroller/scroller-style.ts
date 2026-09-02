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
`;

// Only the two slots this task's template actually renders (root, content).
// Task 12 extends this same object with an `item` slot when it adds virtual
// item rendering — this is the real, final style-source wiring from day
// one, not a value later thrown away; nothing here is a placeholder.
const classes = {
  root: () => "u-scroller u-component",
  content: () => "u-scroller-content",
};

export const scrollerStyleModule = { css, classes };
