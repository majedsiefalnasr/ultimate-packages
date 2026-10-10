import type { StyleModule } from "@ultimate/vue-core";

/** GAP-064 G3-E: generated from g3e-port.mjs (record E-3). */
export const orderListStyleModule: StyleModule = {
  css: /*css*/ `
.u-order-list > section{display: flex;gap: dt('orderlist.gap');}
.u-order-list-list{flex: 1 1 auto;}
.u-order-list-controls{display: flex;flex-direction: column;justify-content: center;gap: dt('orderlist.controls.gap');}
.u-order-list.u-order-list-narrow .u-order-list-controls{flex-direction: row;flex-wrap: wrap;}
.u-order-list.u-striped .u-order-list-list [role="option"]:nth-child(even){background: rgba(0, 0, 0, .06);}
`,
  classes: {
    root: () => "u-order-list",
    controls: () => "u-order-list-controls",
    list: () => "u-order-list-list",
  },
};
