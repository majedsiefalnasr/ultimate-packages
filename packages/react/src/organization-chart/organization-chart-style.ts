import type { StyleModule } from "@ultimate/react-core";

export const organizationChartStyleModule: StyleModule = {
  css: `
    .u-organization-chart { display: flex; justify-content: center; overflow: auto; }
    .u-organization-chart-node { position: relative; display: flex; flex-direction: column; align-items: center; min-width: max-content; }
    .u-organization-chart-node-content { position: relative; z-index: 1; padding: .5rem .75rem; border: 1px solid currentColor; background: Canvas; }
    .u-organization-chart-children { position: relative; display: flex; justify-content: center; gap: 1.5rem; margin-top: 1.5rem; padding-top: 1.5rem; }
    .u-organization-chart-children::before { content: ""; position: absolute; top: 0; left: 12.5%; right: 12.5%; border-top: 1px solid currentColor; }
    .u-organization-chart-children > .u-organization-chart-node::before { content: ""; position: absolute; top: -1.5rem; height: 1.5rem; border-left: 1px solid currentColor; }
  `,
  classes: {
    root: () => "u-organization-chart",
    node: () => "u-organization-chart-node",
    nodeContent: () => "u-organization-chart-node-content",
    children: () => "u-organization-chart-children",
  },
};
