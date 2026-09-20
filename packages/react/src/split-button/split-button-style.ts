import type { StyleModule } from "@ultimate/react-core";

const css = /*css*/ `
.u-splitbutton { display: inline-flex; position: relative; border-radius: 6px; }
.u-splitbutton-button { border-top-right-radius: 0; border-bottom-right-radius: 0; }
.u-splitbutton-dropdown { border-top-left-radius: 0; border-bottom-left-radius: 0; border-left: 0; }
`;

const classes = {
  root: "u-splitbutton u-component",
  button: "u-splitbutton-button",
  dropdown: "u-splitbutton-dropdown",
};

export const splitButtonStyleModule: StyleModule = { css, classes };
