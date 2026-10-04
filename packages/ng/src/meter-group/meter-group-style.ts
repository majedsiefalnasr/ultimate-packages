/**
 * Ultimate-owned adaptation of PrimeNG's `MeterGroupStyle` (see
 * `.vendor-extracted/ng/metergroup/style/metergroupstyle.ts`), shaped to
 * match `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/metergroup` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `fieldsetStyleModule`).
 * GAP-064 G3-A: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3a-port.mjs).
 */
const css = /*css*/ `
.u-meter-group{display: flex;gap: dt('metergroup.gap');}
.u-meter-group-meters{display: flex;background: dt('metergroup.meters.background');border-radius: dt('metergroup.border.radius');}
.u-meter-group-label-list{display: flex;flex-wrap: wrap;margin: 0;padding: 0;list-style-type: none;}
.u-meter-group-label{display: inline-flex;align-items: center;gap: dt('metergroup.label.gap');}
.u-meter-group-label-marker{display: inline-flex;width: dt('metergroup.label.marker.size');height: dt('metergroup.label.marker.size');border-radius: 100%;}
.u-meter-group-label-icon{font-size: dt('metergroup.label.icon.size');width: dt('metergroup.label.icon.size');height: dt('metergroup.label.icon.size');}
.u-meter-group:not(.u-meter-group-vertical){flex-direction: column;}
.u-meter-group-label-list:not(.u-meter-group-label-list-vertical){gap: dt('metergroup.label.list.horizontal.gap');}
.u-meter-group:not(.u-meter-group-vertical) .u-meter-group-meters{height: dt('metergroup.meters.size');}
.u-meter-group:not(.u-meter-group-vertical) .u-meter-group-meter:first-of-type{border-start-start-radius: dt('metergroup.border.radius');border-end-start-radius: dt('metergroup.border.radius');}
.u-meter-group:not(.u-meter-group-vertical) .u-meter-group-meter:last-of-type{border-start-end-radius: dt('metergroup.border.radius');border-end-end-radius: dt('metergroup.border.radius');}
.u-meter-group-vertical{flex-direction: row;}
.u-meter-group-label-list-vertical{flex-direction: column;gap: dt('metergroup.label.list.vertical.gap');}
.u-meter-group-vertical .u-meter-group-meters{flex-direction: column;width: dt('metergroup.meters.size');height: 100%;}
.u-meter-group-vertical .u-meter-group-label-list{align-items: flex-start;}
.u-meter-group-vertical .u-meter-group-meter:first-of-type{border-start-start-radius: dt('metergroup.border.radius');border-start-end-radius: dt('metergroup.border.radius');}
.u-meter-group-vertical .u-meter-group-meter:last-of-type{border-end-start-radius: dt('metergroup.border.radius');border-end-end-radius: dt('metergroup.border.radius');}
`;

const classes = {
  root: (params?: Record<string, unknown>) => [
    "u-meter-group u-component",
    { "u-meter-group-vertical": params?.["orientation"] === "vertical" },
  ],
  meters: "u-meter-group-meters",
  meter: "u-meter-group-meter",
  labelList: (params?: Record<string, unknown>) => [
    "u-meter-group-label-list",
    { "u-meter-group-label-list-vertical": params?.["orientation"] === "vertical" },
  ],
  label: "u-meter-group-label",
  labelMarker: "u-meter-group-label-marker",
  labelIcon: "u-meter-group-label-icon",
  labelText: "u-meter-group-label-text",
};

/** `UBaseComponent`-shaped style module for `UMeterGroup`. */
export const meterGroupStyleModule = { css, classes };
