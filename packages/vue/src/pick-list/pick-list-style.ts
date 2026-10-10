import type { StyleModule } from "@ultimate/vue-core";

/** GAP-064 G3-E: generated from g3e-port.mjs (record E-3). */
export const pickListStyleModule: StyleModule = {
  css: /*css*/ `
.u-pick-list{display: flex;gap: dt('picklist.gap');}
.u-pick-list-controls{display: flex;flex-direction: column;justify-content: center;gap: dt('picklist.controls.gap');}
.u-pick-list-source, .u-pick-list-target{flex: 1 1 50%;}
.u-pick-list .u-listbox{height: 100%;}
.u-pick-list.u-striped .u-pick-list-list [role="option"]:nth-child(even){background: rgba(0, 0, 0, .06);}
`,
  classes: {
    root: () => "u-pick-list",
    sourceList: () => "u-pick-list-source",
    targetList: () => "u-pick-list-target",
    controls: () => "u-pick-list-controls",
    list: () => "u-pick-list-list",
  },
};
