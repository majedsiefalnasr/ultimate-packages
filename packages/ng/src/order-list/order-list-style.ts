/** GAP-064 G3-E: generated from g3e-port.mjs (record E-3). */
export const orderListStyleModule = {
  css: /*css*/ `
.u-order-list{display: flex;gap: dt('orderlist.gap');}
.u-order-list > [data-pc-section="listcontainer"]{flex: 1 1 auto;}
.u-order-list-controls{display: flex;flex-direction: column;justify-content: center;gap: dt('orderlist.controls.gap');}
.u-order-list-item{display: block;padding: .5rem .75rem;cursor: pointer;}
.u-order-list-item-selected{outline: 2px solid currentColor;outline-offset: -2px;}
.u-order-list.u-striped .u-order-list-item:nth-child(even), .u-order-list.u-striped .u-order-list-list [role="option"]:nth-child(even){background: rgba(0, 0, 0, .06);}
`,
  classes: {
    root: () => "u-order-list",
    controls: () => "u-order-list-controls",
    list: () => "u-order-list-list",
    listItem: () => "u-order-list-item",
    itemSelected: () => "u-order-list-item u-order-list-item-selected",
  },
};
