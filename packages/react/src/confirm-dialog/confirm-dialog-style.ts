import type { StyleModule } from "@ultimate/react-core";

const css = /*css*/ `
.u-confirmdialog .u-dialog-content { display: flex; align-items: flex-start; gap: 1rem; }
.u-confirmdialog-icon { flex-shrink: 0; }
.u-confirmdialog-message { flex-grow: 1; }
.u-confirmdialog-footer { display: flex; justify-content: flex-end; gap: 0.5rem; }
`;

const classes = {
  root: () => "u-confirmdialog",
  icon: "u-confirmdialog-icon",
  message: "u-confirmdialog-message",
  footer: "u-confirmdialog-footer",
};

export const confirmDialogStyleModule: StyleModule = { css, classes };
