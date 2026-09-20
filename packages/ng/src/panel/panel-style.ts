/**
 * Ultimate-owned adaptation of PrimeNG's `PanelStyle` (see
 * `.vendor-extracted/ng/panel/style/panelstyle.ts`), shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/panel` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `fieldsetStyleModule`).
 */
const css = /*css*/ `
.u-panel { border: 1px solid var(--u-panel-border-color, #dee2e6); border-radius: 6px; }
.u-panel-header { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1.25rem; }
.u-panel-header-toggleable { cursor: pointer; }
.u-panel-title { font-weight: 700; line-height: 1; }
.u-panel-header-actions { display: flex; align-items: center; }
.u-panel-content-container { overflow: hidden; }
.u-panel-content { padding: 0 1.25rem 1.25rem 1.25rem; }
.u-panel-footer { padding: 0.75rem 1.25rem; border-top: 1px solid var(--u-panel-border-color, #dee2e6); }
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

/** `UBaseComponent`-shaped style module for `UPanel`. */
export const panelStyleModule = { css, classes };
