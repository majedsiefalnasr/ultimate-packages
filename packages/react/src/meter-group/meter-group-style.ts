/**
 * Ultimate-owned adaptation of PrimeReact's `MeterGroupBase` css (see
 * `.vendor-extracted/react/metergroup/MeterGroupBase.js`), shaped to match
 * `react-core`'s `useComponentBase`'s `styleModule: {css, classes}`
 * contract. No `@ultimate/uix-styles/metergroup` entry exists yet, so
 * `css`/`classes` are authored locally (same precedent as
 * `fieldsetStyleModule`).
 */
const css = /*css*/ `
.u-meter-group { display: flex; flex-direction: column; gap: 0.5rem; }
.u-meter-group-vertical { flex-direction: row; }
.u-meter-group-meters { display: flex; background: var(--u-meter-group-track-bg, #e5e7eb); border-radius: 6px; overflow: hidden; height: 0.5rem; width: 100%; }
.u-meter-group-vertical .u-meter-group-meters { flex-direction: column-reverse; height: 12rem; width: 0.5rem; }
.u-meter-group-meter { height: 100%; }
.u-meter-group-vertical .u-meter-group-meter { width: 100%; }
.u-meter-group-label-list { display: flex; flex-wrap: wrap; gap: 0.75rem; list-style: none; margin: 0; padding: 0; }
.u-meter-group-label-list-vertical { flex-direction: column; }
.u-meter-group-label { display: flex; align-items: center; gap: 0.375rem; font-size: 0.875rem; }
.u-meter-group-label-marker { width: 0.5rem; height: 0.5rem; border-radius: 50%; display: inline-block; }
.u-meter-group-label-icon { font-size: 0.875rem; }
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

/** `useComponentBase`-shaped style module for `UMeterGroup`. */
export const meterGroupStyleModule = { css, classes };
