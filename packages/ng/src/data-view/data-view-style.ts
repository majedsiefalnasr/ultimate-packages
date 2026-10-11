/** GAP-064 G3-E: generated from g3e-port.mjs (record E-4). */
export const dataViewStyleModule = {
  css: /*css*/ `
.u-data-view > [role="status"]{background: dt('mask.background');color: dt('mask.color');position: fixed;top: 0;left: 0;width: 100%;height: 100%;}
.u-data-view{position: relative;display: block;border-color: dt('dataview.border.color');border-width: dt('dataview.border.width');border-style: solid;border-radius: dt('dataview.border.radius');padding: dt('dataview.padding');}
.u-data-view-list, .u-data-view-grid{background: dt('dataview.content.background');border-color: dt('dataview.content.border.color');border-width: dt('dataview.content.border.width');border-style: solid;color: dt('dataview.content.color');padding: dt('dataview.content.padding');border-radius: dt('dataview.content.border.radius');}
.u-data-view > .u-paginator:not(.u-data-view-list ~ .u-paginator):not(.u-data-view-grid ~ .u-paginator){border-width: dt('dataview.paginator.top.border.width');border-color: dt('dataview.paginator.top.border.color');border-style: solid;}
.u-data-view-list ~ .u-paginator, .u-data-view-grid ~ .u-paginator{border-width: dt('dataview.paginator.bottom.border.width');border-color: dt('dataview.paginator.bottom.border.color');border-style: solid;}
.u-data-view > [role="status"]{position: absolute;display: flex;align-items: center;justify-content: center;z-index: 2;}
.u-data-view-list{margin: 0;padding: 0;list-style: none;}
.u-data-view-grid{display: grid;grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));gap: .75rem;}
.u-data-view > [role="status"] svg{color: dt('text.hover.color');}
`,
  classes: {
    root: () => "u-data-view",
    list: (params?: Record<string, unknown>) =>
      params?.["layout"] === "grid" ? "u-data-view-grid" : "u-data-view-list",
    listItem: () => "u-data-view-item",
  },
};
