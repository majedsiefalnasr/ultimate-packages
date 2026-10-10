/** GAP-064 G3-E: generated from g3e-port.mjs (record E-3). */
export const pickListStyleModule = {
  css: /*css*/ `
.u-pick-list{display: flex;gap: dt('picklist.gap');}
.u-pick-list-controls{display: flex;flex-direction: column;justify-content: center;gap: dt('picklist.controls.gap');}
.u-pick-list-source, .u-pick-list-target{flex: 1 1 50%;}
.u-pick-list .u-listbox{height: 100%;}
.u-pick-list-item{display: block;padding: .5rem .75rem;cursor: pointer;}
.u-pick-list-item-selected{outline: 2px solid currentColor;outline-offset: -2px;}
.u-pick-list > .u-pick-list-source{order: 0;}
.u-pick-list > .u-pick-list-controls{order: 1;}
.u-pick-list > .u-pick-list-target{order: 2;}
`,
  classes: {
    root: () => "u-pick-list",
    sourceList: () => "u-pick-list-source",
    targetList: () => "u-pick-list-target",
    controls: () => "u-pick-list-controls",
    list: () => "u-pick-list-list",
    listItem: () => "u-pick-list-item",
    itemSelected: () => "u-pick-list-item u-pick-list-item-selected",
  },
};
