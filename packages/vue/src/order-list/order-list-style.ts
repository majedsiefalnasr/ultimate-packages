import type { StyleModule } from "@ultimate/vue-core";

export const orderListStyleModule: StyleModule = {
  css: `
    .u-order-list { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: start; gap: .75rem; }
    .u-order-list-controls { display: flex; flex-direction: column; gap: .25rem; }
    .u-order-list-list { min-width: 0; margin: 0; padding: 0; list-style: none; border: 1px solid currentColor; overflow: auto; }
    .u-order-list-list [role="listbox"] { margin: 0; padding: 0; list-style: none; }
    .u-order-list-item, .u-order-list-list [role="option"] { display: block; padding: .5rem .75rem; cursor: pointer; }
    .u-order-list-item-selected, .u-order-list-list [role="option"][aria-selected="true"] { outline: 2px solid currentColor; outline-offset: -2px; }
    .u-order-list.u-striped .u-order-list-item:nth-child(even), .u-order-list.u-striped .u-order-list-list [role="option"]:nth-child(even) { background: rgba(0, 0, 0, .06); }
  `,
  classes: {
    root: () => "u-order-list",
    controls: () => "u-order-list-controls",
    list: () => "u-order-list-list",
  },
};
