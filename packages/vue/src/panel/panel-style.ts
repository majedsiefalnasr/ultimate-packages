/**
 * Ultimate-owned adaptation of PrimeVue's `PanelStyle` (see
 * `.vendor-extracted/vue/panel/style/PanelStyle.js`), shaped to match
 * `vue-core`'s `createBaseComponent`'s `styleModule: {css, classes}`
 * contract. No `@ultimate/uix-styles/panel` entry exists yet, so
 * `css`/`classes` are authored locally (same precedent as
 * `fieldsetStyleModule`).
 * GAP-064 G3-B: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3b-port.mjs).
 */
const css = /*css*/ `
.u-panel{display: block;border: 1px solid dt('panel.border.color');border-radius: dt('panel.border.radius');background: dt('panel.background');color: dt('panel.color');}
.u-panel-header{display: flex;justify-content: space-between;align-items: center;padding: dt('panel.header.padding');background: dt('panel.header.background');color: dt('panel.header.color');border-style: solid;border-width: dt('panel.header.border.width');border-color: dt('panel.header.border.color');border-radius: dt('panel.header.border.radius');}
.u-panel-header.u-panel-header-toggleable{padding: dt('panel.toggleable.header.padding');}
.u-panel-title{line-height: 1;font-weight: dt('panel.title.font.weight');}
.u-panel-content-container{display: grid;grid-template-rows: 1fr;}
.u-panel-content{padding: dt('panel.content.padding');}
.u-panel-footer{padding: dt('panel.footer.padding');}
`;

const classes = {
  root: "u-panel u-component",
  header: (params?: Record<string, unknown>) => [
    "u-panel-header",
    { "u-panel-header-toggleable": !!params?.["toggleable"] },
  ],
  title: "u-panel-title",
  headerActions: "u-panel-header-actions",
  contentContainer: "u-panel-content-container",
  content: "u-panel-content",
  footer: "u-panel-footer",
};

/** `createBaseComponent`-shaped style module for `UPanel`. */
export const panelStyleModule = { css, classes };
