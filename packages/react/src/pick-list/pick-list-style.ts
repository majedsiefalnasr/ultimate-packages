import type { StyleModule } from "@ultimate/react-core";

export const pickListStyleModule: StyleModule = {
  css: `
    .u-pick-list { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: start; gap: .75rem; }
    .u-pick-list-source, .u-pick-list-target { min-width: 0; border: 1px solid currentColor; }
    .u-pick-list-controls { display: flex; flex-direction: column; gap: .25rem; }
    .u-pick-list-list { margin: 0; padding: 0; list-style: none; overflow: auto; }
    .u-pick-list-item { display: block; padding: .5rem .75rem; cursor: pointer; }
    .u-pick-list-item-selected { outline: 2px solid currentColor; outline-offset: -2px; }
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
