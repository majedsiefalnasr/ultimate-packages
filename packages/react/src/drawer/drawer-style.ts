import type { StyleModule } from "@ultimate/react-core";

const css = /*css*/ `
.u-drawer-mask { position: fixed; inset: 0; display: flex; }
.u-drawer { display: flex; flex-direction: column; pointer-events: auto; }
.u-drawer-position-left { top: 0; left: 0; height: 100%; }
.u-drawer-position-right { top: 0; right: 0; height: 100%; margin-left: auto; }
.u-drawer-position-top { top: 0; left: 0; width: 100%; }
.u-drawer-position-bottom { bottom: 0; left: 0; width: 100%; margin-top: auto; }
.u-drawer-position-full { top: 0; left: 0; width: 100%; height: 100%; }
.u-drawer-header { display: flex; align-items: center; justify-content: space-between; }
.u-drawer-content { overflow-y: auto; flex-grow: 1; }
.u-drawer-footer { }
`;

const classes = {
  mask: () => "u-drawer-mask",
  root: (params: { position?: string } = {}) =>
    `u-drawer u-component u-drawer-position-${params.position ?? "left"}`,
  header: "u-drawer-header",
  title: "u-drawer-title",
  closeButton: "u-drawer-close-button",
  content: "u-drawer-content",
  footer: "u-drawer-footer",
};

export const drawerStyleModule: StyleModule = { css, classes };
