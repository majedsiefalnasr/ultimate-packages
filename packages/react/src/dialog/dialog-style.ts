import type { StyleModule } from "@ultimate/react-core";

const css = /*css*/ `
.u-dialog-mask { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; }
.u-dialog { display: flex; flex-direction: column; pointer-events: auto; max-height: 90%; }
.u-dialog-header { display: flex; align-items: center; justify-content: space-between; }
.u-dialog-content { overflow-y: auto; flex-grow: 1; }
.u-dialog-footer { display: flex; justify-content: flex-end; }
`;

const classes = {
  mask: "u-dialog-mask",
  root: () => "u-dialog u-component",
  header: "u-dialog-header",
  headerTitle: "u-dialog-header-title",
  headerIcons: "u-dialog-header-icons",
  closeButton: "u-dialog-close-button",
  closeButtonIcon: "u-dialog-close-icon",
  content: "u-dialog-content",
  footer: "u-dialog-footer",
};

export const dialogStyleModule: StyleModule = { css, classes };
