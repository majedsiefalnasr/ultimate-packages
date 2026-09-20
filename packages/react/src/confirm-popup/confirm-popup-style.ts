import type { StyleModule } from "@ultimate/react-core";

const css = /*css*/ `
.u-confirmpopup { position: absolute; top: 0; left: 0; }
.u-confirmpopup-content { display: flex; align-items: flex-start; gap: 0.5rem; }
.u-confirmpopup-footer { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem; }
`;

const classes = {
  root: () => "u-confirmpopup u-component",
  content: "u-confirmpopup-content",
  icon: "u-confirmpopup-icon",
  message: "u-confirmpopup-message",
  footer: "u-confirmpopup-footer",
};

export const confirmPopupStyleModule: StyleModule = { css, classes };
