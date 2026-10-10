import type { StyleModule } from "@ultimate/vue-core";

/** GAP-064 G3-E: generated from g3e-port.mjs (record E-4). */
export const organizationChartStyleModule: StyleModule = {
  css: /*css*/ `
.u-organization-chart-node-content{display: inline-block;position: relative;border: 1px solid dt('organizationchart.node.border.color');background: dt('organizationchart.node.background');color: dt('organizationchart.node.color');padding: dt('organizationchart.node.padding');border-radius: dt('organizationchart.node.border.radius');transition: background dt('organizationchart.transition.duration'), border-color dt('organizationchart.transition.duration'), color dt('organizationchart.transition.duration'), box-shadow dt('organizationchart.transition.duration');}
.u-organization-chart-node-content:has(> button){padding: dt('organizationchart.node.toggleable.padding');}
.u-organization-chart-node[aria-selected="false"] > .u-organization-chart-node-content:hover{background: dt('organizationchart.node.hover.background');color: dt('organizationchart.node.hover.color');}
.u-organization-chart-node[aria-selected="true"] > .u-organization-chart-node-content{background: dt('organizationchart.node.selected.background');color: dt('organizationchart.node.selected.color');}
.u-organization-chart-node-content > button{position: absolute;inset-block-end: calc(-1 * calc(dt('organizationchart.node.toggle.button.size') / 2));margin-inline-start: calc(-1 * calc(dt('organizationchart.node.toggle.button.size') / 2));z-index: 2;inset-inline-start: 50%;user-select: none;cursor: pointer;width: dt('organizationchart.node.toggle.button.size');height: dt('organizationchart.node.toggle.button.size');text-decoration: none;background: dt('organizationchart.node.toggle.button.background');color: dt('organizationchart.node.toggle.button.color');border-radius: dt('organizationchart.node.toggle.button.border.radius');border: 1px solid dt('organizationchart.node.toggle.button.border.color');display: inline-flex;justify-content: center;align-items: center;outline-color: transparent;transition: background dt('organizationchart.transition.duration'), color dt('organizationchart.transition.duration'), border-color dt('organizationchart.transition.duration'), outline-color dt('organizationchart.transition.duration'), box-shadow dt('organizationchart.transition.duration');}
.u-organization-chart-node-content > button:hover{background: dt('organizationchart.node.toggle.button.hover.background');color: dt('organizationchart.node.toggle.button.hover.color');}
.u-organization-chart-node-content > button:focus-visible{box-shadow: dt('organizationchart.node.toggle.button.focus.ring.shadow');outline: dt('organizationchart.node.toggle.button.focus.ring.width') dt('organizationchart.node.toggle.button.focus.ring.style') dt('organizationchart.node.toggle.button.focus.ring.color');outline-offset: dt('organizationchart.node.toggle.button.focus.ring.offset');}
.u-organization-chart-node-content > button > span{position: relative;inset-block-start: 1px;}
.u-organization-chart-node[aria-selected] > .u-organization-chart-node-content{cursor: pointer;}
.u-organization-chart{display: flex;justify-content: center;overflow: auto;}
.u-organization-chart-node{position: relative;display: flex;flex-direction: column;align-items: center;min-width: max-content;}
.u-organization-chart-children{position: relative;display: flex;justify-content: center;gap: 1.5rem;margin-top: 1.5rem;padding-top: 1.5rem;}
.u-organization-chart-children::before{content: "";position: absolute;top: 0;left: 12.5%;right: 12.5%;border-top: 1px solid currentColor;}
.u-organization-chart-children > .u-organization-chart-node::before{content: "";position: absolute;top: -1.5rem;height: 1.5rem;border-left: 1px solid currentColor;}
`,
  classes: {
    root: () => "u-organization-chart",
    node: () => "u-organization-chart-node",
    nodeContent: () => "u-organization-chart-node-content",
    children: () => "u-organization-chart-children",
  },
};
