export const dataViewStyleModule = {
  css: `
    .u-data-view { display: grid; grid-template-columns: minmax(0, 1fr); gap: .75rem; }
    .u-data-view-list { display: grid; grid-template-columns: minmax(0, 1fr); gap: .5rem; margin: 0; padding: 0; list-style: none; }
    .u-data-view-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: .75rem; }
    .u-data-view-item { min-width: 0; padding: .75rem; border: 1px solid currentColor; }
  `,
  classes: {
    root: () => "u-data-view",
    list: (params?: Record<string, unknown>) =>
      params?.["layout"] === "grid" ? "u-data-view-grid" : "u-data-view-list",
    listItem: () => "u-data-view-item",
  },
};
