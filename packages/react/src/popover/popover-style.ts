import type { StyleModule } from "@ultimate/react-core";

const css = /*css*/ `
.u-popover { position: absolute; top: 0; left: 0; }
.u-popover-content { position: relative; }
`;

const classes = {
  root: () => "u-popover u-component",
  content: "u-popover-content",
};

export const popoverStyleModule: StyleModule = { css, classes };
